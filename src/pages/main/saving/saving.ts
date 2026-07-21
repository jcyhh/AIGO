import type {
    Address,
    TransactionReceipt,
} from 'viem'

import {
    ensureErc20Allowance,
    parseDappAmountUnits,
} from '@/services/dapp'
import {
    getAigoProjectAddress,
    getAigoTokenAddress,
    writeAigoProjectDepositAIGO,
    writeAigoProjectWithdrawAIGO,
} from '@/services/contracts'

export interface SubmitSavingDepositParams {
    amount: bigint
    walletAddress?: Address
}

export function parseSavingAmount(amountText: string): bigint {
    return parseDappAmountUnits(amountText)
}

export async function submitSavingDeposit({
    amount,
    walletAddress,
}: SubmitSavingDepositParams): Promise<TransactionReceipt> {
    await ensureErc20Allowance(
        getAigoProjectAddress(),
        amount,
        getAigoTokenAddress(),
        walletAddress,
    )

    return writeAigoProjectDepositAIGO(amount)
}

export function submitSavingWithdraw(
    amount: bigint,
): Promise<TransactionReceipt> {
    return writeAigoProjectWithdrawAIGO(amount)
}
