import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

test('contract write refresh waits for the configured indexer sync delay', async () => {
    assert.equal(existsSync('src/services/dapp/contractRefresh.ts'), true)

    const [config, helper, entry, homePage] = await Promise.all([
        readFile('src/services/dapp/config.ts', 'utf8'),
        readFile('src/services/dapp/contractRefresh.ts', 'utf8'),
        readFile('src/services/dapp/index.ts', 'utf8'),
        readFile('src/pages/main/home/HomePage.tsx', 'utf8'),
    ])

    assert.match(config, /contractWriteRefreshDelayMs:\s*3000/)
    assert.match(helper, /import \{ DAPP_CONFIG \} from '\.\/config\.ts'/)
    assert.match(helper, /export function waitForDappContractDataSync\(\): Promise<void> \{/)
    assert.match(helper, /globalThis\.setTimeout\(resolve, DAPP_CONFIG\.contractWriteRefreshDelayMs\)/)
    assert.match(entry, /waitForDappContractDataSync/)
    assert.match(homePage, /waitForDappContractDataSync/)
    assert.match(homePage, /await submitHomeDepositOrder\([\s\S]*await waitForDappContractDataSync\(\)[\s\S]*refreshHomeScreenData\(\)/)
})
