import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

test('template uses pnpm as the package manager', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    const readme = readFileSync('README.md', 'utf8')
    const agentRules = readFileSync('AGENTS.md', 'utf8')

    assert.match(packageJson.packageManager, /^pnpm@\d+\.\d+\.\d+$/)
    assert.equal(packageJson.scripts.preinstall, 'node scripts/ensure-pnpm.mjs')
    assert.equal(packageJson.scripts.predev, 'node scripts/ensure-pnpm.mjs')
    assert.equal(
        packageJson.scripts.prebuild,
        'node scripts/ensure-pnpm.mjs && pnpm verify',
    )
    assert.equal(packageJson.scripts.verify, 'pnpm lint && pnpm test')
    assert.equal(packageJson.scripts.prelint, 'node scripts/ensure-pnpm.mjs')
    assert.equal(packageJson.scripts.pretest, 'node scripts/ensure-pnpm.mjs')
    assert.equal(packageJson.scripts.prepreview, 'node scripts/ensure-pnpm.mjs')

    assert.equal(existsSync('pnpm-lock.yaml'), true)
    assert.equal(existsSync('package-lock.json'), false)
    assert.equal(existsSync('yarn.lock'), false)

    assert.match(readme, /pnpm install/)
    assert.match(readme, /pnpm dev/)
    assert.match(readme, /pnpm build/)
    assert.match(readme, /pnpm test/)
    assert.match(readme, /pnpm lint/)

    assert.match(agentRules, /pnpm test/)
    assert.match(agentRules, /pnpm build/)
    assert.match(agentRules, /pnpm lint/)
})

test('package manager guard allows pnpm and rejects npm or yarn', () => {
    const runGuard = (userAgent) => spawnSync(
        process.execPath,
        ['scripts/ensure-pnpm.mjs'],
        {
            encoding: 'utf8',
            env: {
                ...process.env,
                npm_config_user_agent: userAgent,
            },
        },
    )

    assert.equal(runGuard('pnpm/10.28.2 npm/? node/v24.0.0 darwin arm64').status, 0)
    assert.notEqual(runGuard('npm/11.0.0 node/v24.0.0 darwin arm64').status, 0)
    assert.notEqual(runGuard('yarn/1.22.22 npm/? node/v24.0.0 darwin arm64').status, 0)
})
