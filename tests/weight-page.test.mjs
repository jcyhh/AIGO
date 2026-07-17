import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('weight page builds the static weight screen from local assets and semantic records', async () => {
    const [page, styles] = await Promise.all([
        readFile('src/pages/main/weight/WeightPage.tsx', 'utf8'),
        readFile('src/pages/main/weight/WeightPage.scss', 'utf8'),
    ])

    assert.match(page, /import tokenIcon from '@\/assets\/common\/usdt\.png'/)
    assert.match(page, /import bg from '@\/assets\/weight\/bg\.png'/)
    assert.match(page, /type WeightRecord/)
    assert.match(page, /WEIGHT_RECORD_LIST/)
    assert.match(page, /<section className="weight-page"/)
    assert.match(page, /<img src=\{bg\} className="weight-page__bg"/)
    assert.match(page, /<img src=\{tokenIcon\} className="img-48 flex-none"/)
    assert.match(page, /Token/)
    assert.match(page, /126,567\.086748/)
    assert.match(page, /权重金额/)
    assert.match(page, /提取/)
    assert.match(page, /流水明细/)
    assert.match(page, /WEIGHT_RECORD_LIST\.map/)
    assert.match(page, /record\.remark/)
    assert.match(page, /record\.date/)
    assert.match(page, /record\.amount/)
    assert.doesNotMatch(page, /style=/)

    assert.match(styles, /\.weight-page\s*\{/)
    assert.match(styles, /background-color:\s*#001020/)
    assert.match(styles, /min-height:\s*calc\(100vh - 100px\)/)
    assert.match(styles, /min-height:\s*calc\(100dvh - 100px\)/)
    assert.match(styles, /&__bg/)
    assert.match(styles, /&__token-pill/)
    assert.match(styles, /&__extract-button[\s\S]*@include auto-button\(/)
    assert.match(styles, /&__section-title-line/)
    assert.match(styles, /&__record-card/)
    assert.match(styles, /background:\s*linear-gradient\(135deg,\s*#1B2837 0%,\s*#0B1A29 100%\)/)
})
