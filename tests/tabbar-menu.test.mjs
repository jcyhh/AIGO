import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const tabbarMenuSource = await readFile(
    new URL('../src/pages/main/layout/TabbarMenu.tsx', import.meta.url),
    'utf8',
)
const mainConfigSource = await readFile(
    new URL('../src/pages/main/config.ts', import.meta.url),
    'utf8',
)
const tabbarStyleSource = await readFile(
    new URL('../src/pages/main/layout/MainLayout.scss', import.meta.url),
    'utf8',
)

test('tabbar uses the configured first-level menu icon assets with active variants', () => {
    assert.match(mainConfigSource, /layout\/tabbar\/home\.png/)
    assert.match(mainConfigSource, /layout\/tabbar\/homeAct\.png/)
    assert.match(mainConfigSource, /layout\/tabbar\/swap\.png/)
    assert.match(mainConfigSource, /layout\/tabbar\/swapAct\.png/)
    assert.match(mainConfigSource, /layout\/tabbar\/weight\.png/)
    assert.match(mainConfigSource, /layout\/tabbar\/weightAct\.png/)
    assert.match(mainConfigSource, /layout\/tabbar\/saving\.png/)
    assert.match(mainConfigSource, /layout\/tabbar\/savingAct\.png/)
    assert.match(mainConfigSource, /export const MAIN_PAGE_ITEMS/)
    assert.match(tabbarMenuSource, /MAIN_PAGE_ITEMS\.map/)
    assert.match(tabbarMenuSource, /isActive \? item\.activeIcon : item\.icon/)
    assert.match(tabbarMenuSource, /flex-1/)
    assert.match(tabbarMenuSource, /flex-column/)
    assert.match(tabbarMenuSource, /size-24/)
    assert.match(tabbarMenuSource, /app-color/)
    assert.match(tabbarMenuSource, /className="img-44"/)
    assert.match(tabbarMenuSource, /isActive \? 'mt-4' : 'mt-4 opc-5'/)
    assert.doesNotMatch(tabbarMenuSource, /app-tabbar__icon/)
    assert.doesNotMatch(tabbarMenuSource, /app-tabbar__text/)
    assert.doesNotMatch(tabbarMenuSource, /showGap/)
})

test('tabbar keeps the old mobile bottom bar visual style', () => {
    assert.match(tabbarStyleSource, /\.app-tabbar\s*\{/)
    assert.match(tabbarStyleSource, /background:\s*#000000/)
    assert.match(tabbarStyleSource, /border-top:\s*1px solid rgba/)
    assert.match(tabbarStyleSource, /border-radius:\s*30px 30px 0 0/)
    assert.match(tabbarStyleSource, /&__bar\s*\{/)
    assert.match(tabbarStyleSource, /height:\s*100px/)
    assert.doesNotMatch(tabbarStyleSource, /#FFFFFF80/)
    assert.doesNotMatch(tabbarStyleSource, /&__link/)
    assert.doesNotMatch(tabbarStyleSource, /&__icon/)
    assert.doesNotMatch(tabbarStyleSource, /&__text/)
    assert.match(tabbarMenuSource, /gap-100/)
    assert.match(tabbarMenuSource, /safe-bottom/)
})
