import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('swap contract flow approves AIGO before selling through AIGOProjectV1', async () => {
    const source = await readFile('src/pages/main/swap/contract.ts', 'utf8')

    assert.match(source, /import type \{[\s\S]*Address,[\s\S]*TransactionReceipt,[\s\S]*\} from 'viem'/)
    assert.match(source, /import \{[\s\S]*ensureErc20Allowance[\s\S]*\} from '@\/services\/dapp'/)
    assert.match(source, /import \{[\s\S]*getAigoProjectAddress,[\s\S]*getAigoTokenAddress,[\s\S]*writeAigoProjectSellAIGO,[\s\S]*\} from '@\/services\/contracts'/)
    assert.match(source, /export interface SubmitSwapOrderParams/)
    assert.match(source, /amount:\s*bigint/)
    assert.match(source, /minUsdtOut:\s*bigint/)
    assert.match(source, /walletAddress\?:\s*Address/)
    assert.match(source, /export async function submitSwapOrder\([\s\S]*\): Promise<TransactionReceipt> \{[\s\S]*await ensureErc20Allowance\(\s*getAigoProjectAddress\(\),\s*amount,\s*getAigoTokenAddress\(\),\s*walletAddress,\s*\)/)
    assert.match(source, /return writeAigoProjectSellAIGO\(amount, minUsdtOut\)/)
})
