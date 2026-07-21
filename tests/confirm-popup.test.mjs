import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('confirm popup composes the shared popup into a single-action prompt', async () => {
    const [component, styles, entry] = await Promise.all([
        readFile('src/components/ConfirmPopup/ConfirmPopup.tsx', 'utf8'),
        readFile('src/components/ConfirmPopup/ConfirmPopup.scss', 'utf8'),
        readFile('src/components/ConfirmPopup/index.ts', 'utf8'),
    ])

    assert.match(component, /show:\s*boolean/)
    assert.match(component, /message:\s*ReactNode/)
    assert.match(component, /useTranslation/)
    assert.match(component, /const resolvedTitle = title \?\? t\('提示'\)/)
    assert.match(component, /const resolvedConfirmText = confirmText \?\? t\('确认'\)/)
    assert.match(component, /onConfirm:\s*\(\) => void/)
    assert.match(component, /<Popup[\s\S]*show=\{show\}[\s\S]*closeOnOverlayClick=\{false\}[\s\S]*contentTheme="gradient-card"/)
    assert.match(component, /className="confirm-popup__message size-28 lh-40 tl"/)
    assert.match(component, /className="confirm-popup__confirm size-28 bold-6 mt-40"/)
    assert.match(component, /\{resolvedTitle\}/)
    assert.match(component, /\{resolvedConfirmText\}/)
    assert.match(component, /disabled=\{submitting\}/)
    assert.doesNotMatch(component, />\s*取消\s*</)
    assert.match(styles, /\.confirm-popup\s*\{[\s\S]*min-height:\s*294px/)
    assert.match(styles, /&__title[\s\S]*@include gradient-word\(var\(--app-btn-bg\)\)/)
    assert.match(styles, /&__confirm[\s\S]*@include full-button\(80px,\s*999px\)/)
    assert.match(entry, /export \{ ConfirmPopup \} from '\.\/ConfirmPopup\.tsx'/)
})
