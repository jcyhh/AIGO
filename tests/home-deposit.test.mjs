import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('home deposit flow approves USDT before placing the matching project order', async () => {
    const source = await readFile('src/pages/main/home/deposit.ts', 'utf8')

    assert.match(source, /import type \{[\s\S]*Address,[\s\S]*TransactionReceipt,[\s\S]*\} from 'viem'/)
    assert.match(source, /import \{[\s\S]*ensureErc20Allowance,[\s\S]*parseDappAmountUnits,[\s\S]*\} from '@\/services\/dapp'/)
    assert.match(source, /import \{[\s\S]*getAigoProjectAddress,[\s\S]*getUsdtAddress,[\s\S]*writeAigoProjectDeposit,[\s\S]*writeAigoProjectDepositWithInvite,[\s\S]*\} from '@\/services\/contracts'/)
    assert.match(source, /export interface SubmitHomeDepositOrderParams/)
    assert.match(source, /amount:\s*bigint/)
    assert.match(source, /walletAddress\?:\s*Address/)
    assert.match(source, /referralAddress\?:\s*Address/)
    assert.match(source, /export function parseHomeDepositAmount\(amountText: string\): bigint \{[\s\S]*return parseDappAmountUnits\(amountText\)[\s\S]*\}/)
    assert.match(source, /export async function submitHomeDepositOrder\([\s\S]*\): Promise<TransactionReceipt> \{[\s\S]*await ensureErc20Allowance\(\s*getAigoProjectAddress\(\),\s*amount,\s*getUsdtAddress\(\),\s*walletAddress,\s*\)/)
    assert.match(source, /if \(referralAddress\) \{[\s\S]*return writeAigoProjectDepositWithInvite\(amount, referralAddress\)[\s\S]*\}/)
    assert.match(source, /return writeAigoProjectDeposit\(amount\)/)
})
