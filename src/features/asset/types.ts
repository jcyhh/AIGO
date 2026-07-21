import type { PaginationParams } from '../../types/api.ts'

export type AssetCurrency = 'balance_xo' | string

export interface AssetLogListParams extends PaginationParams {
    ccy?: AssetCurrency
}

export interface AssetLog {
    id: number
    is_inc: 0 | 1
    amount: string
    ccy: string
    content: string
    created_at: string
}

export interface AssetLogListResponse {
    asset_logs: AssetLog[]
}

