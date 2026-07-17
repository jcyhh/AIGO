import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('workspace config lets HTML CSS Support scan project SCSS files', () => {
    const source = readFileSync('.vscode/settings.json', 'utf8')
    const settings = JSON.parse(source)

    assert.deepEqual(settings['css.styleSheets'], [
        'src/**/*.scss',
    ])
    assert.deepEqual(settings['editor.quickSuggestions'], {
        strings: 'on',
    })
    assert.equal(
        settings['html-css-class-completion.includeGlobPattern'],
        'src/**/*.{scss,tsx}',
    )
    assert.equal(
        settings['html-css-class-completion.excludeGlobPattern'],
        'node_modules/**',
    )
})

test('workspace recommends VS Code className completion extension', () => {
    const source = readFileSync('.vscode/extensions.json', 'utf8')
    const extensions = JSON.parse(source)

    assert.ok(
        extensions.recommendations.includes('Zignd.html-css-class-completion'),
    )
})
