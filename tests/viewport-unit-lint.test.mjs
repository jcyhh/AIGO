import test from 'node:test'
import assert from 'node:assert/strict'

import stylelint from 'stylelint'

async function loadViewportRulePlugin() {
    try {
        const module = await import('../scripts/stylelint/requireDynamicViewportPair.mjs')
        return module.default
    } catch {
        return null
    }
}

async function lintScss(code, codeFilename = '/project/src/pages/sample/Sample.scss') {
    const plugin = await loadViewportRulePlugin()
    assert.ok(plugin, 'expected the dynamic viewport Stylelint plugin to exist')

    const result = await stylelint.lint({
        code,
        codeFilename,
        config: {
            customSyntax: 'postcss-scss',
            plugins: [plugin],
            rules: {
                'aigo/require-dynamic-viewport-pair': true,
            },
        },
    })

    return result.results[0].warnings
}

test('reports vh and vw declarations without a following dynamic viewport pair', async () => {
    const warnings = await lintScss(`
        .panel {
            height: calc(100vh - 20px);
            max-width: 82vw;
        }
    `)

    assert.deepEqual(
        warnings.map(({ text }) => text),
        [
            'Add "height: calc(100dvh - 20px)" immediately after the vh/vw fallback (aigo/require-dynamic-viewport-pair)',
            'Add "max-width: 82dvw" immediately after the vh/vw fallback (aigo/require-dynamic-viewport-pair)',
        ],
    )
})

test('accepts legacy viewport fallbacks followed by matching dynamic units', async () => {
    const warnings = await lintScss(`
        .panel {
            width: 100vw;
            width: 100dvw;
            height: calc(100vh - 20px);
            height: calc(100dvh - 20px);
        }
    `)

    assert.deepEqual(warnings, [])
})

test('reports a dynamic viewport declaration placed before its fallback', async () => {
    const warnings = await lintScss(`
        .panel {
            height: 100dvh;
            height: 100vh;
        }
    `)

    assert.equal(warnings.length, 1)
})

test('TSX viewport strings require matching dynamic unit strings', async () => {
    const checker = await import('../scripts/lint/noInlineStyles.mjs')

    assert.deepEqual(
        checker.findUnpairedViewportUnits(`
            const height = 'calc(100vh - 20px)'
            export function Demo() {
                return <Chart height={height} />
            }
        `, 'Demo.tsx').map(({ expectedValue }) => expectedValue),
        ['calc(100dvh - 20px)'],
    )

    assert.deepEqual(
        checker.findUnpairedViewportUnits(`
            const fallbackHeight = 'calc(100vh - 20px)'
            const dynamicHeight = 'calc(100dvh - 20px)'
            export function Demo() {
                return <Chart heights={[fallbackHeight, dynamicHeight]} />
            }
        `, 'Demo.tsx'),
        [],
    )
})

test('does not constrain vendored third-party viewport styles', async () => {
    const warnings = await lintScss(`
        .vendor-widget {
            height: 100vh;
        }
    `, '/project/src/third-party/widget.scss')

    assert.deepEqual(warnings, [])
})
