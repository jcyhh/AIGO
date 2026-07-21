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
    getUsdtAddress,
    writeAigoProjectDeposit,
    writeAigoProjectDepositWithInvite,
} from '@/services/contracts'

export interface SubmitHomeDepositOrderParams {
    amount: bigint
    walletAddress?: Address
    referralAddress?: Address
}

export function parseHomeDepositAmount(amountText: string): bigint {
    return parseDappAmountUnits(amountText)
}

export async function submitHomeDepositOrder({
    amount,
    walletAddress,
    referralAddress,
}: SubmitHomeDepositOrderParams): Promise<TransactionReceipt> {
    await ensureErc20Allowance(
        getAigoProjectAddress(),
        amount,
        getUsdtAddress(),
        walletAddress,
    )

    if (referralAddress) {
        return writeAigoProjectDepositWithInvite(amount, referralAddress)
    }

    return writeAigoProjectDeposit(amount)
}
