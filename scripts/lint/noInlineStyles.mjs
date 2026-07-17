import { glob, readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

import ts from 'typescript'

import { isThirdPartySource } from './sourceScope.mjs'

export function findInlineStyleAttributes(source, fileName = 'Component.tsx') {
    if (isThirdPartySource(fileName)) return []

    const sourceFile = ts.createSourceFile(
        fileName,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
    )
    const violations = []

    function visit(node) {
        if (
            ts.isJsxAttribute(node)
            && node.name.getText(sourceFile) === 'style'
        ) {
            const position = sourceFile.getLineAndCharacterOfPosition(
                node.name.getStart(sourceFile),
            )

            violations.push({
                fileName,
                line: position.line + 1,
                column: position.character + 1,
            })
        }

        ts.forEachChild(node, visit)
    }

    visit(sourceFile)
    return violations
}

function getStringNodeValue(node, sourceFile) {
    if (ts.isStringLiteralLike(node)) return node.text
    if (ts.isTemplateExpression(node)) {
        return node.getText(sourceFile).slice(1, -1)
    }
    return undefined
}

function hasLegacyViewportUnit(value) {
    return /(?<=[0-9.)}])v[hw]\b/i.test(value)
}

function toDynamicViewportValue(value) {
    return value
        .replace(/(?<=[0-9.)}])vh\b/gi, 'dvh')
        .replace(/(?<=[0-9.)}])vw\b/gi, 'dvw')
}

export function findUnpairedViewportUnits(source, fileName = 'Component.tsx') {
    if (isThirdPartySource(fileName)) return []

    const sourceFile = ts.createSourceFile(
        fileName,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
    )
    const stringNodes = []

    function visit(node) {
        const value = getStringNodeValue(node, sourceFile)
        if (value !== undefined) {
            stringNodes.push({ node, value })
        }
        ts.forEachChild(node, visit)
    }

    visit(sourceFile)
    const allValues = new Set(stringNodes.map(({ value }) => value))

    return stringNodes.flatMap(({ node, value }) => {
        if (!hasLegacyViewportUnit(value)) return []

        const expectedValue = toDynamicViewportValue(value)
        if (allValues.has(expectedValue)) return []

        const position = sourceFile.getLineAndCharacterOfPosition(
            node.getStart(sourceFile),
        )

        return [{
            fileName,
            line: position.line + 1,
            column: position.character + 1,
            value,
            expectedValue,
        }]
    })
}

async function collectProjectViolations() {
    const violations = []

    for await (const fileName of glob('src/**/*.{tsx,jsx}')) {
        const source = await readFile(fileName, 'utf8')
        violations.push(...findInlineStyleAttributes(source, fileName))
        violations.push(...findUnpairedViewportUnits(source, fileName))
    }

    return violations
}

async function run() {
    const violations = await collectProjectViolations()

    for (const violation of violations) {
        const message = violation.expectedValue
            ? `Viewport value "${violation.value}" requires matching dynamic value "${violation.expectedValue}".`
            : 'JSX style attributes are forbidden; define state classes in the private SCSS file and switch them with className.'
        console.error(`${violation.fileName}:${violation.line}:${violation.column} ${message}`)
    }

    if (violations.length > 0) {
        console.error(`Found ${violations.length} forbidden JSX style attribute(s).`)
        process.exitCode = 1
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await run()
}
