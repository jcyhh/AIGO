import type {
    Hex,
    TransactionReceipt,
} from 'viem'

import { createClaim } from '@/features/claim/api.ts'
import { writeLaxProjectClaimQuota } from '@/services/contracts'

export type WeightClaimCurrency = 'balance_xo'

export interface SubmitWeightClaimParams {
    amountText: string
    ccy: WeightClaimCurrency
}

export function normalizeWeightClaimAmountInput(value: string): string {
    const normalizedValue = value.replace(/,/g, '').trim()

    if (normalizedValue.startsWith('.')) return `0${normalizedValue}`
    if (normalizedValue.endsWith('.')) return normalizedValue.slice(0, -1)

    return normalizedValue
}

export function formatWeightClaimAllAmount(value: string): string {
    const normalizedValue = normalizeWeightClaimAmountInput(value)
    const [integer, fraction] = normalizedValue.split('.')

    if (fraction === undefined) return normalizedValue

    const normalizedFraction = fraction.replace(/0+$/, '')

    return normalizedFraction ? `${integer}.${normalizedFraction}` : integer
}

export async function submitWeightClaim(
    params: SubmitWeightClaimParams,
): Promise<TransactionReceipt> {
    const claim = await createClaim({
        ccy: params.ccy,
        amount: params.amountText,
    })

    return writeLaxProjectClaimQuota({
        id: BigInt(claim.id),
        amount: BigInt(claim.amount),
        expiredTime: BigInt(claim.expire_time),
        signature: claim.signature as Hex,
    })
}
