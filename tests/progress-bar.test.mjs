import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { registerHooks } from 'node:module'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'

function registerTsxHooks() {
    return registerHooks({
        load(url, context, nextLoad) {
            if (url.endsWith('.scss')) {
                return { format: 'module', shortCircuit: true, source: '' }
            }

            if (!url.endsWith('.tsx')) return nextLoad(url, context)

            const source = readFileSync(new URL(url), 'utf8')
            const output = ts.transpileModule(source, {
                compilerOptions: {
                    jsx: ts.JsxEmit.ReactJSX,
                    module: ts.ModuleKind.ESNext,
                    target: ts.ScriptTarget.ES2022,
                },
            })

            return { format: 'module', shortCircuit: true, source: output.outputText }
        },
    })
}

test('progress bar renders the calculated percentage from current and total values', async () => {
    const hooks = registerTsxHooks()

    try {
        const { ProgressBar } = await import(
            '../src/components/ProgressBar/ProgressBar.tsx'
        )
        const html = renderToStaticMarkup(
            createElement(ProgressBar, {
                currentValue: '545',
                totalValue: '1000',
                className: 'demo-progress',
                'aria-label': '完成度',
            }),
        )

        assert.match(html, /^<progress /)
        assert.match(
            html,
            /class="app-progress-bar app-progress-bar--solid demo-progress"/,
        )
        assert.match(html, /value="54"/)
        assert.match(html, /max="100"/)
        assert.match(html, /aria-label="完成度"/)
        assert.doesNotMatch(html, /style=/)
    } finally {
        hooks.deregister()
    }
})

test('progress bar keeps calculation and solid theme styling inside the component contract', async () => {
    const [component, config, styles, entry, readme, colors] = await Promise.all([
        readFile('src/components/ProgressBar/ProgressBar.tsx', 'utf8'),
        readFile('src/components/ProgressBar/config.ts', 'utf8'),
        readFile('src/components/ProgressBar/ProgressBar.scss', 'utf8'),
        readFile('src/components/ProgressBar/index.ts', 'utf8'),
        readFile('src/components/ProgressBar/README.md', 'utf8'),
        readFile('src/styles/color.scss', 'utf8'),
    ])

    assert.match(component, /calculatePercentage\(currentValue,\s*totalValue\)/)
    assert.match(component, /currentValue:\s*DecimalCalculationValue/)
    assert.match(component, /totalValue:\s*DecimalCalculationValue/)
    assert.match(component, /variant = PROGRESS_BAR_VARIANT\.solid/)
    assert.doesNotMatch(component, /style=/)

    assert.match(config, /PROGRESS_BAR_VARIANT/)
    assert.match(config, /solid:\s*'solid'/)
    assert.match(config, /ProgressBarVariant/)

    assert.match(styles, /\.app-progress-bar\s*\{/)
    assert.match(styles, /background-color:\s*var\(--app-progress-bg\)/)
    assert.match(styles, /background:\s*var\(--app-progress-color\)/)
    assert.match(styles, /&::-webkit-progress-bar/)
    assert.match(styles, /&::-webkit-progress-value/)
    assert.match(styles, /&::-moz-progress-bar/)
    assert.doesNotMatch(styles, /currentColor/)

    assert.match(entry, /export \{ ProgressBar \} from '\.\/ProgressBar\.tsx'/)
    assert.match(entry, /export type \{ ProgressBarProps \} from '\.\/ProgressBar\.tsx'/)
    assert.match(readme, /currentValue/)
    assert.match(readme, /totalValue/)
    assert.match(readme, /calculatePercentage/)

    assert.match(colors, /--app-progress-color:\s*var\(--app-color\);/)
    assert.match(colors, /--app-progress-bg:\s*rgba\(255,\s*255,\s*255,\s*0\.1\);/)
})
