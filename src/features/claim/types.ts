import type { AmountInput } from '../../types/api.ts'

export type ClaimCurrency = 'balance_xo'

export interface CreateClaimParams {
    ccy: ClaimCurrency
    amount: AmountInput
}

export interface ClaimSignatureResponse {
    id: number
    token: string
    amount: string
    signature: string
    expire_time: number
}
