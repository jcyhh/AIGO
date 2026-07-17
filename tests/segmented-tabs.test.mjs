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

test('segmented tabs renders fixed non-scroll tabs with a class-driven active indicator', async () => {
    const hooks = registerTsxHooks()

    try {
        const { SegmentedTabs } = await import(
            '../src/components/SegmentedTabs/SegmentedTabs.tsx'
        )
        const html = renderToStaticMarkup(
            createElement(SegmentedTabs, {
                options: [
                    { label: '进行中', value: 'active' },
                    { label: '已完成', value: 'completed' },
                    { label: '全部', value: 'all' },
                ],
                value: 'completed',
                onChange: () => {},
                ariaLabel: '订单状态',
                className: 'home-page__order-tabs mt-28',
            }),
        )

        assert.match(html, /^<div /)
        assert.match(html, /role="tablist"/)
        assert.match(html, /aria-label="订单状态"/)
        assert.match(html, /class="segmented-tabs segmented-tabs--count-3 segmented-tabs--active-1 home-page__order-tabs mt-28"/)
        assert.match(html, /class="segmented-tabs__indicator"/)
        assert.match(html, /role="tab"/)
        assert.match(html, /aria-selected="true"/)
        assert.match(html, /segmented-tabs__tab--active/)
        assert.match(html, /segmented-tabs__tab--inactive/)
        assert.match(html, />进行中</)
        assert.match(html, />已完成</)
        assert.match(html, />全部</)
        assert.doesNotMatch(html, /style=/)
    } finally {
        hooks.deregister()
    }
})

test('segmented tabs rejects more than three tabs because this component is intentionally non-scroll', async () => {
    const hooks = registerTsxHooks()

    try {
        const { SegmentedTabs } = await import(
            '../src/components/SegmentedTabs/SegmentedTabs.tsx'
        )

        assert.throws(
            () => renderToStaticMarkup(
                createElement(SegmentedTabs, {
                    options: [
                        { label: 'A', value: 'a' },
                        { label: 'B', value: 'b' },
                        { label: 'C', value: 'c' },
                        { label: 'D', value: 'd' },
                    ],
                    value: 'a',
                    onChange: () => {},
                }),
            ),
            /SegmentedTabs only supports up to 3 options/,
        )
    } finally {
        hooks.deregister()
    }
})

test('segmented tabs keeps its public contract and visual tokens in shared files', async () => {
    const [component, styles, entry, readme, colors] = await Promise.all([
        readFile('src/components/SegmentedTabs/SegmentedTabs.tsx', 'utf8'),
        readFile('src/components/SegmentedTabs/SegmentedTabs.scss', 'utf8'),
        readFile('src/components/SegmentedTabs/index.ts', 'utf8'),
        readFile('src/components/SegmentedTabs/README.md', 'utf8'),
        readFile('src/styles/color.scss', 'utf8'),
    ])

    assert.match(component, /export interface SegmentedTabOption/)
    assert.match(component, /options:\s*readonly SegmentedTabOption/)
    assert.match(component, /value:\s*T/)
    assert.match(component, /onChange:\s*\(value:\s*T\) => void/)
    assert.match(component, /options\.length > 3/)
    assert.match(component, /throw new Error\('SegmentedTabs only supports up to 3 options'\)/)
    assert.match(component, /role="tablist"/)
    assert.match(component, /role="tab"/)
    assert.match(component, /aria-selected=\{isActive\}/)
    assert.match(component, /onClick=\{\(\) => handleTabClick\(option\)\}/)
    assert.match(component, /segmented-tabs--count-\$\{options\.length\}/)
    assert.match(component, /segmented-tabs--active-\$\{activeIndex\}/)
    assert.doesNotMatch(component, /style=/)

    assert.match(styles, /\.segmented-tabs\s*\{/)
    assert.match(styles, /overflow:\s*hidden/)
    assert.doesNotMatch(styles, /overflow-x:\s*auto/)
    assert.match(styles, /&__indicator[\s\S]*transition:\s*left 0\.3s/)
    assert.match(styles, /&__tab[\s\S]*transition:\s*color 0\.3s/)
    assert.match(styles, /@for \$count from 1 through 3/)
    assert.match(styles, /@for \$index from 0 through \(\$count - 1\)/)
    assert.match(styles, /var\(--app-segmented-tabs-bg\)/)
    assert.match(styles, /var\(--app-segmented-tabs-active-bg\)/)
    assert.match(styles, /var\(--app-segmented-tabs-active-color\)/)
    assert.match(styles, /var\(--app-segmented-tabs-inactive-color\)/)

    assert.match(entry, /export \{ SegmentedTabs \} from '\.\/SegmentedTabs\.tsx'/)
    assert.match(entry, /export type \{ SegmentedTabsProps,\s*SegmentedTabOption \} from '\.\/SegmentedTabs\.tsx'/)
    assert.match(readme, /最多 3 项/)
    assert.match(readme, /不滚动/)

    assert.match(colors, /--app-segmented-tabs-bg:/)
    assert.match(colors, /--app-segmented-tabs-active-bg:/)
    assert.match(colors, /--app-segmented-tabs-active-color:/)
    assert.match(colors, /--app-segmented-tabs-inactive-color:/)
})
