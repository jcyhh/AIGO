import noDuplicateUtilityDeclarations from './scripts/stylelint/noDuplicateUtilityDeclarations.mjs'
import requireDynamicViewportPair from './scripts/stylelint/requireDynamicViewportPair.mjs'

export default {
    customSyntax: 'postcss-scss',
    ignoreFiles: [
        'node_modules/**',
        'src/vendor/**',
        'src/third-party/**',
    ],
    plugins: [
        noDuplicateUtilityDeclarations,
        requireDynamicViewportPair,
    ],
    rules: {
        'aigo/no-duplicate-utility-declarations': true,
        'aigo/require-dynamic-viewport-pair': true,
    },
}
