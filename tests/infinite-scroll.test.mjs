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

test('infinite scroll renders a reusable touch-bottom sentinel without inline styles', async () => {
    const hooks = registerTsxHooks()

    try {
        const { InfiniteScroll } = await import(
            '../src/components/InfiniteScroll/InfiniteScroll.tsx'
        )
        const html = renderToStaticMarkup(
            createElement(
                InfiniteScroll,
                {
                    loading: false,
                    hasMore: true,
                    onLoadMore: () => {},
                    className: 'home-page__order-scroll',
                    'aria-label': '订单列表',
                },
                createElement('article', { className: 'demo-item' }, '订单'),
            ),
        )

        assert.match(html, /^<div /)
        assert.match(html, /class="infinite-scroll home-page__order-scroll"/)
        assert.match(html, /aria-label="订单列表"/)
        assert.match(html, /class="demo-item"/)
        assert.match(html, />订单</)
        assert.match(html, /class="infinite-scroll__sentinel"/)
        assert.match(html, /aria-hidden="true"/)
        assert.doesNotMatch(html, /style=/)
    } finally {
        hooks.deregister()
    }
})

test('infinite scroll keeps page fetching outside the component and only emits load more', async () => {
    const [component, styles, entry, readme] = await Promise.all([
        readFile('src/components/InfiniteScroll/InfiniteScroll.tsx', 'utf8'),
        readFile('src/components/InfiniteScroll/InfiniteScroll.scss', 'utf8'),
        readFile('src/components/InfiniteScroll/index.ts', 'utf8'),
        readFile('src/components/InfiniteScroll/README.md', 'utf8'),
    ])

    assert.match(component, /export interface InfiniteScrollProps/)
    assert.match(component, /loading:\s*boolean/)
    assert.match(component, /hasMore:\s*boolean/)
    assert.match(component, /onLoadMore:\s*\(\) => void \| Promise<void>/)
    assert.match(component, /disabled\?:\s*boolean/)
    assert.match(component, /useEffect/)
    assert.match(component, /useRef/)
    assert.match(component, /IntersectionObserver/)
    assert.match(component, /getScrollParent/)
    assert.match(component, /onLoadMoreRef/)
    assert.match(component, /loadMoreLockRef/)
    assert.match(component, /!entry\?\.isIntersecting \|\| loading \|\| !hasMore \|\| disabled/)
    assert.match(component, /onLoadMoreRef\.current\(\)/)
    assert.doesNotMatch(component, /request</)
    assert.doesNotMatch(component, /page_no/)
    assert.doesNotMatch(component, /style=/)

    assert.match(styles, /\.infinite-scroll\s*\{/)
    assert.match(styles, /&__sentinel/)

    assert.match(entry, /export \{ InfiniteScroll \} from '\.\/InfiniteScroll\.tsx'/)
    assert.match(entry, /export type \{ InfiniteScrollProps \} from '\.\/InfiniteScroll\.tsx'/)

    assert.match(readme, /触底/)
    assert.match(readme, /不负责请求接口/)
    assert.match(readme, /hasMore/)
})
