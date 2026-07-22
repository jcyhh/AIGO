export type HomeOrderStatus = 'active' | 'completed'

export interface HomeOrder {
    id: number
    contractIndex: string | number
    status: HomeOrderStatus
    amountText: string
    dateText: string
    progressCurrentValue: string
    progressTotalValue: string
    progressCurrentText: string
    progressTotalText: string
    progressMultipleText: string
    releaseTotalText: string
    incomeText: string
    claimableText: string
    claimableLoading: boolean
    progressLoading: boolean
    canClaim: boolean
}

export interface HomeQuotaProgress {
    amount: string
    totalAmount: string
    loading: boolean
}
