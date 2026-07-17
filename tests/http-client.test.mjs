import test from 'node:test'
import assert from 'node:assert/strict'
import { AxiosError } from 'axios'

import { APP_CONFIG } from '../src/config/app.ts'
import { httpClient } from '../src/services/http/client.ts'
import { HttpError } from '../src/services/http/error.ts'

function createStorage(token = '') {
    const cache = new Map(token ? [['TOKEN', token]] : [])
    return {
        getItem: (key) => cache.get(key) ?? null,
        setItem: (key, value) => cache.set(key, value),
        removeItem: (key) => cache.delete(key),
    }
}

test('only sends Address in a DApp wallet host', async () => {
    const storage = createStorage('token-value')
    storage.setItem('LANG', 'zh-Hant')
    storage.setItem('WALLET_ADDRESS', '0x0000000000000000000000000000000000000001')
    globalThis.window = { localStorage: storage }
    let captured

    await httpClient.request({
        url: '/example',
        method: 'POST',
        data: { value: 1 },
        adapter: async (config) => {
            captured = config
            return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
        },
    })

    assert.equal(captured.headers.get('Authorization'), 'Bearer token-value')
    assert.equal(captured.headers.has('Address'), false)
    assert.equal(captured.headers.get('lang'), 'zh-Hant')
    assert.equal(
        captured.headers.getContentType(),
        'application/json; charset=UTF-8',
    )
})

test('keeps the token header even when local token storage is empty', async () => {
    globalThis.window = { localStorage: createStorage() }
    let captured

    await httpClient.request({
        url: '/example',
        adapter: async (config) => {
            captured = config
            return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
        },
    })

    assert.equal(captured.headers.has('Authorization'), true)
    assert.match(captured.headers.get('Authorization') ?? '', /^Bearer/)
})

test('does not send lang when i18n is disabled', async () => {
    const previousEnableI18n = APP_CONFIG.enableI18n
    APP_CONFIG.enableI18n = false

    try {
        globalThis.window = { localStorage: createStorage('token-value') }
        let captured

        await httpClient.request({
            url: '/example',
            adapter: async (config) => {
                captured = config
                return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
            },
        })

        assert.equal(captured.headers.has('lang'), false)
    } finally {
        APP_CONFIG.enableI18n = previousEnableI18n
    }
})

test('uses the cached wallet address in a DApp wallet host', async () => {
    const storage = createStorage('token-value')
    storage.setItem('WALLET_ADDRESS', '0x0000000000000000000000000000000000000001')
    globalThis.window = {
        ethereum: { request: async () => [] },
        localStorage: storage,
    }
    let captured

    await httpClient.request({
        url: '/example',
        adapter: async (config) => {
            captured = config
            return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
        },
    })

    assert.equal(captured.headers.get('Address'), '0x0000000000000000000000000000000000000001')
})

test('uses the cached wallet address in a Flutter host with an injected wallet', async () => {
    const storage = createStorage('token-value')
    storage.setItem('WALLET_ADDRESS', '0x0000000000000000000000000000000000000001')
    globalThis.window = {
        __FROM_FLUTTER__: true,
        ethereum: { request: async () => [] },
        localStorage: storage,
    }
    let captured

    await httpClient.request({
        url: '/example',
        adapter: async (config) => {
            captured = config
            return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
        },
    })

    assert.equal(captured.headers.get('Address'), '0x0000000000000000000000000000000000000001')
})

test('normalizes 401 and removes the cached token', async () => {
    const storage = createStorage('expired')
    globalThis.window = { localStorage: storage }

    const request = httpClient.request({
        url: '/private',
        adapter: async (config) => {
            const response = {
                data: { message: '登录已失效' },
                status: 401,
                statusText: 'Unauthorized',
                headers: {},
                config,
            }
            throw new AxiosError(
                'Request failed',
                'ERR_BAD_REQUEST',
                config,
                undefined,
                response,
            )
        },
    })

    await assert.rejects(request, (error) => {
        assert.ok(error instanceof HttpError)
        assert.equal(error.status, 401)
        return true
    })
    assert.equal(storage.getItem('TOKEN'), null)
})
