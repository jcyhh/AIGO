import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('project rules require ContractLoading throughout each contract write workflow', async () => {
    const [agentRules, dappReadme, feedback] = await Promise.all([
        readFile('AGENTS.md', 'utf8'),
        readFile('src/services/dapp/README.md', 'utf8'),
        readFile('docs/template-react-feedback.md', 'utf8'),
    ])

    assert.match(agentRules, /## Contract write feedback/)
    assert.match(agentRules, /`ContractLoading`/)
    assert.match(agentRules, /complete pending lifetime/)
    assert.match(agentRules, /Sequential contract writes must share one pending state/)
    assert.match(agentRules, /may not replace `ContractLoading`/)
    assert.match(agentRules, /await `waitForDappContractDataSync\(\)` before refreshing/)
    assert.match(agentRules, /`DAPP_CONFIG\.contractWriteRefreshDelayMs`/)

    assert.match(dappReadme, /ContractLoading/)
    assert.match(dappReadme, /full contract write workflow/)
    assert.match(dappReadme, /approval and order/)

    assert.match(feedback, /TRF-035：合约写入等待必须覆盖完整交易流程/)
    assert.match(feedback, /ContractLoading/)
})
