import test from 'node:test'
import assert from 'node:assert/strict'

import stylelint from 'stylelint'

async function loadUtilityRulePlugin() {
    try {
        const module = await import('../scripts/stylelint/noDuplicateUtilityDeclarations.mjs')
        return module.default
    } catch {
        return null
    }
}

async function lintScss(code, codeFilename) {
    const plugin = await loadUtilityRulePlugin()
    assert.ok(plugin, 'expected the local Stylelint utility rule plugin to exist')

    const result = await stylelint.lint({
        code,
        codeFilename,
        config: {
            customSyntax: 'postcss-scss',
            plugins: [plugin],
            rules: {
                'aigo/no-duplicate-utility-declarations': true,
            },
        },
    })

    return result.results[0].warnings
}

test('reports page declarations that already have global utility classes', async () => {
    const warnings = await lintScss(`
        .sample {
            margin-top: 24px;
            padding-left: 20px;
            font-size: 36px;
            font-weight: 600;
            line-height: 40px;
            opacity: 0.6;
            animation-delay: 0.3s;
            width: 327px;
        }
    `, '/project/src/pages/sample/Sample.scss')

    assert.deepEqual(
        warnings.map(({ text }) => text),
        [
            'Use global utility class "mt-24" instead of "margin-top: 24px" (aigo/no-duplicate-utility-declarations)',
            'Use global utility class "pl-20" instead of "padding-left: 20px" (aigo/no-duplicate-utility-declarations)',
            'Use global utility class "size-36" instead of "font-size: 36px" (aigo/no-duplicate-utility-declarations)',
            'Use global utility class "bold-6" instead of "font-weight: 600" (aigo/no-duplicate-utility-declarations)',
            'Use global utility class "lh-40" instead of "line-height: 40px" (aigo/no-duplicate-utility-declarations)',
            'Use global utility class "opc-6" instead of "opacity: 0.6" (aigo/no-duplicate-utility-declarations)',
            'Use global utility class "ani-delay-3" instead of "animation-delay: 0.3s" (aigo/no-duplicate-utility-declarations)',
        ],
    )
})

test('allows utility definitions inside the global styles directory', async () => {
    const warnings = await lintScss(`
        .size-36 {
            font-size: 36px;
        }
    `, '/project/src/styles/common/index.scss')

    assert.deepEqual(warnings, [])
})

test('allows page-specific values that have no matching utility class', async () => {
    const warnings = await lintScss(`
        .sample {
            margin-top: 3px;
            width: 327px;
            opacity: 0.65;
            background: linear-gradient(#000, #333);
        }
    `, '/project/src/pages/sample/Sample.scss')

    assert.deepEqual(warnings, [])
})

test('does not constrain vendored third-party SCSS', async () => {
    const warnings = await lintScss(`
        .vendor-widget {
            margin-top: 24px;
            font-size: 36px;
        }
    `, '/project/src/vendor/widget.scss')

    assert.deepEqual(warnings, [])
})
