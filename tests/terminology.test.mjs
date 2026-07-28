import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

const firstPartySourceExtensions = new Set(['.ts', '.tsx', '.scss', '.json', '.md'])
const excludedSourceDirectories = new Set(['vendor', 'third-party'])

async function listFirstPartySourceFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true })
    const nestedFiles = await Promise.all(entries.map(async (entry) => {
        const entryPath = join(directory, entry.name)

        if (entry.isDirectory()) {
            if (directory === 'src' && excludedSourceDirectories.has(entry.name)) return []

            return listFirstPartySourceFiles(entryPath)
        }

        return firstPartySourceExtensions.has(extname(entry.name)) ? [entryPath] : []
    }))

    return nestedFiles.flat()
}

test('first-party UI source uses the unified extraction term', async () => {
    const files = await listFirstPartySourceFiles('src')

    const matches = await Promise.all(files.map(async (file) => {
        const source = await readFile(file, 'utf8')
        return source.includes('提现') ? file : ''
    }))

    assert.deepEqual(matches.filter(Boolean), [])
})

test('project terminology keeps reward claims distinct from Token withdrawals', async () => {
    const agentRules = await readFile('AGENTS.md', 'utf8')

    assert.match(agentRules, /withdrawal\/redeem actions, use `提取`/)
    assert.match(agentRules, /订单、静态与动态收益领取使用 `领取`/)
    assert.doesNotMatch(agentRules, /Token 取回\/领取类动作统一使用 `提取`/)
})
