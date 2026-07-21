import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'

import { getReferralCode, removeReferralCode } from '../src/services/storage/index.ts'
import { saveSplashReferralCode } from '../src/pages/splash/referral.ts'

function createStorage() {
    const cache = new Map()
    return {
        cache,
        getItem: (key) => cache.get(key) ?? null,
        setItem: (key, value) => cache.set(key, value),
        removeItem: (key) => cache.delete(key),
    }
}

test('splash page stores referral code from the route param', () => {
    globalThis.window = { localStorage: createStorage() }
    removeReferralCode()

    assert.equal(saveSplashReferralCode(' abc123 '), true)
    assert.equal(getReferralCode(), 'abc123')
})

test('splash page ignores empty referral code values', () => {
    globalThis.window = { localStorage: createStorage() }
    removeReferralCode()

    assert.equal(saveSplashReferralCode('   '), false)
    assert.equal(saveSplashReferralCode(undefined), false)
    assert.equal(getReferralCode(), '')
})

test('splash route reuses the same page and clears referral URL after caching', async () => {
    const source = await readFile(
        new URL('../src/pages/splash/SplashPage.tsx', import.meta.url),
        'utf8',
    )

    assert.match(source, /useParams/)
    assert.match(source, /saveSplashReferralCode\(ref\)/)
    assert.match(source, /navigate\(ROUTE_PATH\.root,\s*\{\s*replace:\s*true\s*\}\)/)
})

test('splash page uses localized welcome text and reusable loading icon', async () => {
    const source = await readFile(
        new URL('../src/pages/splash/SplashPage.tsx', import.meta.url),
        'utf8',
    )

    assert.match(source, /APP_CONFIG\.routeBase/)
    assert.match(source, /brand\/app-logo\.png/)
    assert.match(source, /src=\{appLogoUrl\}/)
    assert.match(source, /splash-page__brand vw-100 flex flex-column items-center/)
    assert.doesNotMatch(source, /@\/assets\/.*splash-logo/)
    assert.match(source, /APP_CONFIG\.name/)
    assert.match(source, /className="mt-24 size-36 bold-6"[\s\S]*\{APP_CONFIG\.name\}/)
    assert.match(source, /splash-page__tips[^"\n]*opc-6/)
    assert.match(source, /ani-delay-3/)
    assert.match(source, /useTranslation/)
    assert.match(source, /t\('欢迎来到\{\{name\}\}', \{ name: APP_CONFIG\.name \}\)/)
    assert.match(source, /\? t\('请使用钱包环境打开！'\)/)
    assert.match(source, /<Icon[\s\S]*name="loading"/)
    assert.match(source, /name="loading"[\s\S]*className="size-15"/)
    assert.match(source, /loading \? \(/)
    assert.match(source, /AUTH_STARTUP_RESULT\.walletRequired/)
    assert.match(source, /animate__zoomIn/)
    assert.match(source, /animate__slideInUp/)
})

test('splash page reuses the public app logo without a duplicate splash logo', async () => {
    await assert.doesNotReject(() => access('public/brand/app-logo.png'))
    await assert.rejects(() => access('public/brand/splash-logo.png'))
    await assert.rejects(() => access('src/assets/start/splash-logo.png'))
    await assert.rejects(() => access('src/assets/start/logo.png'))
    await assert.rejects(() => access('src/assets/start/1.png'))
})

test('splash page keeps the reusable opening layout without locking logo proportions', async () => {
    const source = await readFile(
        new URL('../src/pages/splash/SplashPage.scss', import.meta.url),
        'utf8',
    )

    assert.match(source, /&__brand/)
    assert.match(source, /&__logo[\s\S]*height:\s*auto/)
    assert.match(source, /bottom:\s*30px/)
    assert.doesNotMatch(source, /&__name/)
    assert.doesNotMatch(source, /color:\s*#fff/i)
    assert.doesNotMatch(source, /color:\s*#8D9094/i)
    assert.doesNotMatch(source, /animation-delay/)
    assert.doesNotMatch(source, /background-image/)
})
