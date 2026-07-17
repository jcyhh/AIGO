import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

test('contract loading wraps popup and blocks interaction during contract writes', async () => {
    assert.equal(existsSync('src/components/CusLoading/CusLoading.tsx'), false)
    assert.equal(existsSync('src/components/CusLoading/index.ts'), false)

    const [component, styles, entry, readme, showcasePage, showcaseStyle] = await Promise.all([
        readFile('src/components/ContractLoading/ContractLoading.tsx', 'utf8'),
        readFile('src/components/ContractLoading/ContractLoading.scss', 'utf8'),
        readFile('src/components/ContractLoading/index.ts', 'utf8'),
        readFile('src/components/ContractLoading/README.md', 'utf8'),
        readFile('src/showcase/components/contract-loading/ContractLoadingShowcasePage.tsx', 'utf8'),
        readFile('src/showcase/components/contract-loading/ContractLoadingShowcasePage.scss', 'utf8'),
    ])

    assert.match(component, /import \{ Popup \} from '@\/components\/Popup'/)
    assert.match(component, /export interface ContractLoadingProps/)
    assert.match(component, /show:\s*boolean/)
    assert.match(component, /const LOADING_DOT_COUNT = 7/)
    assert.match(component, /const LOADING_DOTS = Array\.from\(\{ length: LOADING_DOT_COUNT \}/)
    assert.match(component, /index \+ 1/)
    assert.match(component, /<Popup\s+show=\{show\}/)
    assert.match(component, /position="center"/)
    assert.match(component, /contentPreset=\{false\}/)
    assert.match(component, /closeOnOverlayClick=\{false\}/)
    assert.match(component, /enterAnimation="fadeIn"/)
    assert.match(component, /leaveAnimation="fadeOut"/)
    assert.match(component, /contract-loading__inner/)
    assert.match(component, /<span/)
    assert.match(component, /contract-loading__filter/)
    assert.match(component, /filter id="gooey"/)
    assert.match(component, /feGaussianBlur/)
    assert.match(component, /feColorMatrix/)
    assert.match(component, /LOADING_DOTS\.map/)
    assert.match(component, /contract-loading__dot/)
    assert.match(component, /contract-loading__dot--\$\{dotIndex\}/)
    assert.doesNotMatch(component, /style=/)
    assert.doesNotMatch(component, /<circle/)
    assert.match(component, /aria-label="Contract loading"/)

    assert.match(styles, /\.contract-loading-popup/)
    assert.match(styles, /z-index:\s*1000000/)
    assert.match(styles, /\.contract-loading\s*\{/)
    assert.match(styles, /width:\s*300px/)
    assert.match(styles, /height:\s*300px/)
    assert.match(styles, /&__filter\s*\{[\s\S]*width:\s*0;/)
    assert.match(styles, /&__filter\s*\{[\s\S]*height:\s*0;/)
    assert.match(styles, /&__inner\s*\{[\s\S]*filter:\s*url\("#gooey"\);/)
    assert.match(styles, /&__dot\s*\{[\s\S]*position:\s*absolute;/)
    assert.match(styles, /animation:\s*contract-loading-rotate 3s ease-in-out infinite/)
    assert.match(styles, /@for \$i from 1 through 7/)
    assert.match(styles, /animation-delay:\s*calc\(0\.2s \* \$i\)/)
    assert.match(styles, /&::before\s*\{[\s\S]*background-image:\s*linear-gradient\(to right, #50D6FC, #1989F5\);/)
    assert.match(styles, /border-radius:\s*50%/)
    assert.match(styles, /box-shadow:\s*0 0 30px #152535/)
    assert.match(styles, /@keyframes contract-loading-rotate/)
    assert.match(styles, /50%,\s*100%\s*\{[\s\S]*transform:\s*rotate\(360deg\);/)

    assert.match(entry, /export \{ ContractLoading \} from '\.\/ContractLoading\.tsx'/)
    assert.match(entry, /export type \{ ContractLoadingProps \} from '\.\/ContractLoading\.tsx'/)
    assert.match(readme, /contract write waiting states/)
    assert.match(readme, /写合约等待/)
    assert.match(readme, /Popup/)
    assert.match(readme, /SVG/)
    assert.match(showcasePage, /export function ContractLoadingShowcasePage/)
    assert.match(showcasePage, /useRef<number \| undefined>\(undefined\)/)
    assert.match(showcasePage, /window\.setTimeout/)
    assert.match(showcasePage, /<SecondaryHeader title="合约 Loading" \/>/)
    assert.match(showcasePage, /<ContractLoading show=\{showLoading\} \/>/)
    assert.match(showcaseStyle, /\.contract-loading-showcase\s*\{/)
})
