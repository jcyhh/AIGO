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

function getCountdownUnitCount(html) {
    return (html.match(/app-countdown-timer__unit/g) ?? []).length
}

test('countdown timer renders day as the maximum unit when remaining time is at least one day', async () => {
    const hooks = registerTsxHooks()

    try {
        const { CountdownTimer } = await import(
            '../src/components/CountdownTimer/index.ts'
        )
        const html = renderToStaticMarkup(
            createElement(CountdownTimer, {
                targetTime: '2026-07-23T20:48:56+08:00',
                now: '2026-07-17T08:00:00+08:00',
                className: 'demo-countdown',
            }),
        )

        assert.match(html, /class="app-countdown-timer flex-center demo-countdown"/)
        assert.equal(getCountdownUnitCount(html), 4)
        assert.match(html, />06</)
        assert.match(html, />12</)
        assert.match(html, />48</)
        assert.match(html, />56</)
        assert.equal((html.match(/app-countdown-timer__separator/g) ?? []).length, 3)
        assert.doesNotMatch(html, /style=/)
    } finally {
        hooks.deregister()
    }
})

test('countdown timer hides day when under one day and hides hour when under one hour', async () => {
    const hooks = registerTsxHooks()

    try {
        const { CountdownTimer } = await import(
            '../src/components/CountdownTimer/index.ts'
        )
        const underOneDayHtml = renderToStaticMarkup(
            createElement(CountdownTimer, {
                targetTime: '2026-07-17T20:08:09+08:00',
                now: '2026-07-17T08:00:00+08:00',
            }),
        )
        const underOneHourHtml = renderToStaticMarkup(
            createElement(CountdownTimer, {
                targetTime: '2026-07-17T08:08:09+08:00',
                now: '2026-07-17T08:00:00+08:00',
            }),
        )

        assert.equal(getCountdownUnitCount(underOneDayHtml), 3)
        assert.doesNotMatch(underOneDayHtml, />00</)
        assert.match(underOneDayHtml, />12</)
        assert.match(underOneDayHtml, />08</)
        assert.match(underOneDayHtml, />09</)
        assert.equal((underOneDayHtml.match(/app-countdown-timer__separator/g) ?? []).length, 2)

        assert.equal(getCountdownUnitCount(underOneHourHtml), 2)
        assert.match(underOneHourHtml, />08</)
        assert.match(underOneHourHtml, />09</)
        assert.equal((underOneHourHtml.match(/app-countdown-timer__separator/g) ?? []).length, 1)
    } finally {
        hooks.deregister()
    }
})

test('countdown timer keeps the reusable component contract', async () => {
    const [component, styles, config, entry] = await Promise.all([
        readFile('src/components/CountdownTimer/CountdownTimer.tsx', 'utf8'),
        readFile('src/components/CountdownTimer/CountdownTimer.scss', 'utf8'),
        readFile('src/components/CountdownTimer/config.ts', 'utf8'),
        readFile('src/components/CountdownTimer/index.ts', 'utf8'),
    ])

    assert.match(component, /calculateCountdownParts\(/)
    assert.match(component, /timeZone = APP_CONFIG\.timeZone/)
    assert.match(component, /setInterval/)
    assert.match(component, /getVisibleCountdownUnits\(countdownParts\)/)
    assert.doesNotMatch(component, /units\?:/)
    assert.doesNotMatch(component, /units =/)
    assert.doesNotMatch(component, /style=/)

    assert.match(config, /getVisibleCountdownUnits/)
    assert.match(config, /COUNTDOWN_DISPLAY_UNITS/)
    assert.match(config, /Number\(countdownParts\.days\) > 0/)
    assert.match(config, /Number\(countdownParts\.hours\) > 0/)

    assert.match(styles, /\.app-countdown-timer\s*\{/)
    assert.match(styles, /&__unit/)
    assert.match(styles, /&__separator/)

    assert.match(entry, /export \{ CountdownTimer \} from '\.\/CountdownTimer\.tsx'/)
    assert.match(entry, /COUNTDOWN_UNIT/)
})
