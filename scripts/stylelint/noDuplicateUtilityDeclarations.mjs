import stylelint from 'stylelint'

import { isThirdPartySource } from '../lint/sourceScope.mjs'

const ruleName = 'aigo/no-duplicate-utility-declarations'

const messages = stylelint.utils.ruleMessages(ruleName, {
    rejected: (property, value, utilityClass) => (
        `Use global utility class "${utilityClass}" instead of "${property}: ${value}"`
    ),
})

function isGlobalStyleFile(filePath = '') {
    const normalizedPath = filePath.replaceAll('\\', '/')
    return normalizedPath.includes('/src/styles/')
        || normalizedPath.startsWith('src/styles/')
}

function parseIntegerPixel(value) {
    const match = value.trim().match(/^(0|-?\d+)px$/)
    if (!match) return undefined

    return Number(match[1])
}

function hasGeneratedSizeUtility(value) {
    return Number.isInteger(value)
        && value >= 0
        && value <= 200
        && (value % 2 === 0 || value % 5 === 0)
}

function getSpacingUtility(property, value) {
    const pixels = parseIntegerPixel(value)
    if (pixels === undefined || !hasGeneratedSizeUtility(pixels)) return undefined

    const spacingPrefixes = {
        'margin-left': 'ml',
        'margin-top': 'mt',
        'margin-right': 'mr',
        'margin-bottom': 'mb',
        'padding-left': 'pl',
        'padding-top': 'pt',
        'padding-right': 'pr',
        'padding-bottom': 'pb',
    }

    const prefix = spacingPrefixes[property]
    return prefix ? `${prefix}-${pixels}` : undefined
}

function getPixelUtility(property, value) {
    const pixels = parseIntegerPixel(value)
    if (pixels === undefined || !hasGeneratedSizeUtility(pixels)) return undefined

    if (property === 'font-size') return `size-${pixels}`
    if (property === 'line-height') return `lh-${pixels}`
    return undefined
}

function getNumberedUtility(property, value) {
    const numericValue = Number(value)
    if (!Number.isFinite(numericValue)) return undefined

    if (property === 'font-weight') {
        const step = numericValue / 100
        return Number.isInteger(step) && step >= 1 && step <= 10
            ? `bold-${step}`
            : undefined
    }

    if (property === 'opacity') {
        const step = numericValue * 10
        return Number.isInteger(step) && step >= 1 && step <= 10
            ? `opc-${step}`
            : undefined
    }

    return undefined
}

function getAnimationUtility(property, value) {
    const match = value.trim().match(/^(\d+(?:\.\d+)?)(ms|s)$/)
    if (!match) return undefined

    const seconds = match[2] === 'ms'
        ? Number(match[1]) / 1000
        : Number(match[1])
    const step = seconds * 10

    if (!Number.isInteger(step) || step < 1 || step > 10) return undefined
    if (property === 'animation-delay') return `ani-delay-${step}`
    if (property === 'animation-duration') return `ani-${step}`
    return undefined
}

function getUtilityClass(property, value) {
    return getSpacingUtility(property, value)
        ?? getPixelUtility(property, value)
        ?? getNumberedUtility(property, value)
        ?? getAnimationUtility(property, value)
}

const ruleFunction = (primaryOption) => (root, result) => {
    if (
        !primaryOption
        || isGlobalStyleFile(root.source?.input.file)
        || isThirdPartySource(root.source?.input.file)
    ) return

    root.walkDecls((declaration) => {
        const utilityClass = getUtilityClass(
            declaration.prop.toLowerCase(),
            declaration.value,
        )

        if (!utilityClass) return

        stylelint.utils.report({
            result,
            ruleName,
            node: declaration,
            message: messages.rejected(
                declaration.prop,
                declaration.value,
                utilityClass,
            ),
        })
    })
}

ruleFunction.ruleName = ruleName
ruleFunction.messages = messages

export default stylelint.createPlugin(ruleName, ruleFunction)
