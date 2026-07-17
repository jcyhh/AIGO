import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('main button theme centralizes the project gradient background', async () => {
    const [colors, mixins, home, swap, weight] = await Promise.all([
        readFile('src/styles/color.scss', 'utf8'),
        readFile('src/styles/mixins.scss', 'utf8'),
        readFile('src/pages/main/home/HomePage.scss', 'utf8'),
        readFile('src/pages/main/swap/SwapPage.scss', 'utf8'),
        readFile('src/pages/main/weight/WeightPage.scss', 'utf8'),
    ])

    assert.match(
        colors,
        /--app-btn-bg:\s*linear-gradient\(90deg,\s*#3760F9 0%,\s*#0090FF 100%\);/,
    )
    assert.match(mixins, /\$bg:\s*var\(--app-btn-bg\)/)
    assert.match(home, /&__deposit-submit[\s\S]*@include full-button\(80px,\s*40px\)/)
    assert.match(home, /&__claim-button[\s\S]*@include auto-button\(56px,\s*28px,\s*30px\)/)
    assert.match(home, /&__claim-button--primary[\s\S]*background:\s*var\(--app-btn-bg\)/)
    assert.match(home, /&__order-claim--active[\s\S]*background:\s*var\(--app-btn-bg\)/)
    assert.match(swap, /&__submit[\s\S]*@include full-button\(88px,\s*999px\)/)
    assert.match(weight, /&__extract-button[\s\S]*@include auto-button\(60px,\s*999px,\s*80px\)/)
})
