import stylelint from 'stylelint'

import { isThirdPartySource } from '../lint/sourceScope.mjs'

const ruleName = 'aigo/require-dynamic-viewport-pair'

const messages = stylelint.utils.ruleMessages(ruleName, {
    rejected: (property, value) => (
        `Add "${property}: ${value}" immediately after the vh/vw fallback`
    ),
})

function hasLegacyViewportUnit(value) {
    return /(?<![a-z])v[hw]\b/i.test(value)
}

function toDynamicViewportValue(value) {
    return value
        .replace(/(?<![a-z])vh\b/gi, 'dvh')
        .replace(/(?<![a-z])vw\b/gi, 'dvw')
}

const ruleFunction = (primaryOption) => (root, result) => {
    if (!primaryOption || isThirdPartySource(root.source?.input.file)) return

    root.walkDecls((declaration) => {
        if (!hasLegacyViewportUnit(declaration.value)) return

        const expectedValue = toDynamicViewportValue(declaration.value)
        const nextNode = declaration.next()
        const hasPair = nextNode?.type === 'decl'
            && nextNode.prop.toLowerCase() === declaration.prop.toLowerCase()
            && nextNode.value === expectedValue

        if (hasPair) return

        stylelint.utils.report({
            result,
            ruleName,
            node: declaration,
            message: messages.rejected(declaration.prop, expectedValue),
        })
    })
}

ruleFunction.ruleName = ruleName
ruleFunction.messages = messages

export default stylelint.createPlugin(ruleName, ruleFunction)
