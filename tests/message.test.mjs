import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

test('message exposes a global method-level toast contract', async () => {
    const [service, component, styles, entry, readme, globalStyles] = await Promise.all([
        readFile('src/components/Message/message.ts', 'utf8'),
        readFile('src/components/Message/Message.tsx', 'utf8'),
        readFile('src/components/Message/Message.scss', 'utf8'),
        readFile('src/components/Message/index.ts', 'utf8'),
        readFile('src/components/Message/README.md', 'utf8'),
        readFile('src/styles/index.scss', 'utf8'),
    ])

    assert.match(service, /export type MessageType = 'success' \| 'info' \| 'fail' \| 'warning'/)
    assert.match(service, /export interface MessageOptions/)
    assert.match(service, /duration\?:\s*number/)
    assert.match(service, /const DEFAULT_MESSAGE_DURATION = 1500/)
    assert.match(service, /let messageRoot:/)
    assert.match(service, /let messageContainer:/)
    assert.match(service, /let closeTimer:/)
    assert.match(service, /document\.createElement\('div'\)/)
    assert.match(service, /document\.body\.appendChild\(messageContainer\)/)
    assert.match(service, /messageRoot\.render/)
    assert.match(service, /window\.setTimeout/)
    assert.match(service, /messageContainer\.remove\(\)/)
    assert.match(service, /function closeMessage/)
    assert.match(service, /message\.success =/)
    assert.match(service, /message\.fail =/)
    assert.match(service, /message\.warning =/)
    assert.match(service, /message\.info =/)
    assert.match(service, /message\.close = closeMessage/)
    assert.doesNotMatch(service, /insertAdjacentHTML|innerHTML/)

    assert.match(component, /export interface MessageToastProps/)
    assert.match(component, /type:\s*MessageType/)
    assert.match(component, /onClose:\s*\(\) => void/)
    assert.match(component, /role="status"/)
    assert.match(component, /aria-live="polite"/)
    assert.match(component, /message-toast--\$\{type\}/)
    assert.match(component, /import successIcon from '@\/assets\/message\/message-success\.png'/)
    assert.match(component, /import infoIcon from '@\/assets\/message\/message-info\.png'/)
    assert.match(component, /import failIcon from '@\/assets\/message\/message-fail\.png'/)
    assert.match(component, /import warningIcon from '@\/assets\/message\/message-warning\.png'/)
    assert.match(component, /import closeIcon from '@\/assets\/message\/message-close\.png'/)
    assert.match(component, /const MESSAGE_ICON_SRC: Record<MessageType, string>/)
    assert.match(component, /src=\{MESSAGE_ICON_SRC\[type\]\}/)
    assert.match(component, /src=\{closeIcon\}/)
    assert.match(component, /message-toast__close/)
    assert.doesNotMatch(component, /style=/)

    assert.match(styles, /\.message-toast-root/)
    assert.match(styles, /\.message-toast\s*\{/)
    assert.match(styles, /bottom:\s*calc\(env\(safe-area-inset-bottom\) \+ 30px\);/)
    assert.match(styles, /width:\s*690px;/)
    assert.match(styles, /max-width:\s*calc\(100vw - 60px\);/)
    assert.match(styles, /max-width:\s*calc\(100dvw - 60px\);/)
    assert.match(styles, /z-index:\s*10000000;/)
    assert.match(styles, /padding:\s*16px 4px 4px;/)
    assert.match(styles, /&__box\s*\{[\s\S]*width:\s*100%;/)
    assert.match(styles, /&__icon\s*\{[\s\S]*width:\s*46px;[\s\S]*height:\s*46px;/)
    assert.match(styles, /&__close-icon\s*\{[\s\S]*width:\s*24px;[\s\S]*height:\s*24px;/)
    assert.match(styles, /&--success/)
    assert.match(styles, /background-color:\s*#009C3E;/)
    assert.match(styles, /&--info/)
    assert.match(styles, /background-color:\s*#C7C7C7;/)
    assert.match(styles, /&--fail/)
    assert.match(styles, /background-color:\s*#D02052;/)
    assert.match(styles, /&--warning/)
    assert.match(styles, /background-color:\s*#FF8B2D;/)

    assert.match(entry, /export \{ message \} from '\.\/message\.ts'/)
    assert.match(entry, /export type \{ MessageOptions, MessageType \} from '\.\/message\.ts'/)
    assert.match(entry, /export \{ MessageToast \} from '\.\/Message\.tsx'/)
    assert.match(readme, /method-level global toast/)
    assert.match(readme, /message\.warning/)
    assert.match(readme, /single active toast/)
    assert.match(globalStyles, /@use '\.\.\/components\/Message\/Message';/)

    assert.equal(existsSync('src/assets/message/message-success.png'), true)
    assert.equal(existsSync('src/assets/message/message-info.png'), true)
    assert.equal(existsSync('src/assets/message/message-fail.png'), true)
    assert.equal(existsSync('src/assets/message/message-warning.png'), true)
    assert.equal(existsSync('src/assets/message/message-close.png'), true)
})

test('http client reports normalized non-200 response messages globally', async () => {
    const client = await readFile('src/services/http/client.ts', 'utf8')

    assert.match(client, /import \{ message \} from '\.\.\/\.\.\/components\/Message\/message\.ts'/)
    assert.match(client, /message\.warning\(httpError\.message\)/)
    assert.doesNotMatch(client, /TODO\(http\): Show request errors/)
})
