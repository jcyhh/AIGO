import test from 'node:test'
import assert from 'node:assert/strict'

import { uploadImageWithFlutter } from '../src/services/upload/flutter.ts'

function createFlutterWindow(postMessage) {
    const storage = new Map([['TOKEN', 'token-value']])
    return {
        __FROM_FLUTTER__: true,
        Flutter: { postMessage },
        localStorage: {
            getItem: (key) => storage.get(key) ?? null,
        },
        setTimeout,
        clearTimeout,
    }
}

test('uses the established JSON-string Flutter upload protocol and restores callback', async () => {
    let sentMessage = ''
    let previousCalls = 0
    const previousHandler = () => previousCalls++
    globalThis.window = createFlutterWindow((message) => {
        sentMessage = message
    })
    window.receiveMessageFromFlutter = previousHandler

    const upload = uploadImageWithFlutter()
    assert.deepEqual(JSON.parse(sentMessage), {
        type: 'uploadImage',
        token: 'token-value',
    })
    await assert.rejects(uploadImageWithFlutter(), /正在进行中/)

    window.receiveMessageFromFlutter('uploadImageUrl: https://img.test/a.png')
    assert.deepEqual(await upload, { url: 'https://img.test/a.png' })
    assert.equal(previousCalls, 1)
    assert.equal(window.receiveMessageFromFlutter, previousHandler)
})

test('rejects an empty Flutter upload URL and restores callback', async () => {
    const previousHandler = () => undefined
    globalThis.window = createFlutterWindow(() => undefined)
    window.receiveMessageFromFlutter = previousHandler

    const upload = uploadImageWithFlutter()
    window.receiveMessageFromFlutter('uploadImageUrl:   ')

    await assert.rejects(upload, /上传地址为空/)
    assert.equal(window.receiveMessageFromFlutter, previousHandler)
})

test('cleans up when Flutter postMessage throws', async () => {
    const previousHandler = () => undefined
    globalThis.window = createFlutterWindow(() => {
        throw new Error('bridge failed')
    })
    window.receiveMessageFromFlutter = previousHandler

    await assert.rejects(uploadImageWithFlutter(), /bridge failed/)
    assert.equal(window.receiveMessageFromFlutter, previousHandler)
})
