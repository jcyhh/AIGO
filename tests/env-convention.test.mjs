import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const realEnvFiles = ['.env.development', '.env.production']

function getRuntimeLines(content) {
    return content
        .split(/\r?\n/)
        .map((line) => line.trimEnd())
        .filter((line) => line && !line.startsWith('#'))
}

function assertEnvAssignmentStyle(content) {
    for (const line of getRuntimeLines(content)) {
        assert.match(line, /^[A-Z][A-Z0-9_]* =(?: .*)?$/)
        assert.doesNotMatch(line, /^[A-Z][A-Z0-9_]*=/)
    }
}

test('example env keeps shared formatting and documentation', async () => {
    const content = await readFile(new URL('../.env.example', import.meta.url), 'utf8')

    assert.match(content, /# Runtime endpoints and shared project values\./)
    assert.match(content, /# 运行时接口地址和项目通用值。/)
    assert.match(content, /# Whether to inject social sharing meta tags into index\.html\./)
    assert.match(content, /# 是否向 index\.html 注入社交分享 meta 标签。/)
    assertEnvAssignmentStyle(content)
})

test('real env files keep only runtime values without comments', async () => {
    const contents = await Promise.all(
        realEnvFiles.map((file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8')),
    )

    for (const content of contents) {
        assert.doesNotMatch(content, /^#/m)
        assertEnvAssignmentStyle(content)
    }
})

test('only real environment files are ignored', async () => {
    const gitignore = await readFile(new URL('../.gitignore', import.meta.url), 'utf8')
    const rules = new Set(
        gitignore
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('#')),
    )

    assert.equal(rules.has('.env.development'), true)
    assert.equal(rules.has('.env.production'), true)
    assert.equal(rules.has('.env.example'), false)
})
