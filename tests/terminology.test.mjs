import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

test('first-party UI source uses the unified extraction term', async () => {
    const { stdout } = await execFileAsync('rg', [
        '--files',
        'src',
        '-g',
        '*.{ts,tsx,scss,json,md}',
        '-g',
        '!src/vendor/**',
        '-g',
        '!src/third-party/**',
    ])
    const files = stdout.trim().split('\n').filter(Boolean)

    const matches = await Promise.all(files.map(async (file) => {
        const source = await readFile(file, 'utf8')
        return source.includes('提现') ? file : ''
    }))

    assert.deepEqual(matches.filter(Boolean), [])
})
