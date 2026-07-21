import type {
    Address,
    TransactionReceipt,
} from 'viem'

import {
    ensureErc20Allowance,
} from '@/services/dapp'
import {
    getAigoProjectAddress,
    getAigoTokenAddress,
    writeAigoProjectSellAIGO,
} from '@/services/contracts'

export interface SubmitSwapOrderParams {
    amount: bigint
    minUsdtOut: bigint
    walletAddress?: Address
}

export async function submitSwapOrder({
    amount,
    minUsdtOut,
    walletAddress,
}: SubmitSwapOrderParams): Promise<TransactionReceipt> {
    await ensureErc20Allowance(
        getAigoProjectAddress(),
        amount,
        getAigoTokenAddress(),
        walletAddress,
    )

    return writeAigoProjectSellAIGO(amount, minUsdtOut)
}
