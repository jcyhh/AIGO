import test from 'node:test'
import assert from 'node:assert/strict'

async function loadInlineStyleChecker() {
    try {
        return await import('../scripts/lint/noInlineStyles.mjs')
    } catch {
        return null
    }
}

test('reports every JSX style attribute regardless of value shape', async () => {
    const checker = await loadInlineStyleChecker()
    assert.ok(checker, 'expected the TSX inline-style checker to exist')

    const violations = checker.findInlineStyleAttributes(`
        export function Demo({ dynamicStyle }) {
            return (
                <>
                    <div style={{ width: 100 }} />
                    <div style={{ width: '100px' }} />
                    <div style={dynamicStyle} />
                    <div className="width-state" />
                </>
            )
        }
    `, 'Demo.tsx')

    assert.deepEqual(
        violations.map(({ line, column }) => ({ line, column })),
        [
            { line: 5, column: 26 },
            { line: 6, column: 26 },
            { line: 7, column: 26 },
        ],
    )
})

test('allows dynamic className expressions', async () => {
    const checker = await loadInlineStyleChecker()
    assert.ok(checker, 'expected the TSX inline-style checker to exist')

    const violations = checker.findInlineStyleAttributes(`
        export function Demo({ active }) {
            return <div className={active ? 'panel panel--active' : 'panel'} />
        }
    `, 'Demo.tsx')

    assert.deepEqual(violations, [])
})

test('does not constrain vendored third-party TSX source', async () => {
    const checker = await loadInlineStyleChecker()
    assert.ok(checker, 'expected the TSX inline-style checker to exist')

    const violations = checker.findInlineStyleAttributes(`
        export function VendorWidget() {
            return <div style={{ width: 100 }} />
        }
    `, 'src/vendor/widget/VendorWidget.tsx')

    assert.deepEqual(violations, [])
})
