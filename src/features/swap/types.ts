import type { PaginationParams } from '../../types/api.ts'

export type SwapLogListParams = PaginationParams

export interface SwapLog {
    id: number
    aigo_amount: string
    usdt_amount: string
    fee_amount: string
    tx_id: string
    created_at: string
}

export interface SwapLogListResponse {
    swap_logs: SwapLog[]
}

