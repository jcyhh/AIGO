import type {
    AmountInput,
    PaginationParams,
} from '../../types/api.ts'

export type OrderStatus = 0 | 1

export interface OrderListParams extends Partial<PaginationParams> {
    status: OrderStatus
}

export interface Order {
    id: number
    index: string | number
    amount: string
    total_amount: string
    release_amount: string
    status: OrderStatus
    created_at: string
}

export interface OrderListResponse {
    orders: Order[]
}

export type OrderRewardLogType = 1 | 2

export interface OrderRewardLogListParams extends PaginationParams {
    type?: OrderRewardLogType
}

export interface OrderRewardLog {
    id: number
    type: OrderRewardLogType
    usdt_amount: number
    aigo_amount: number
    created_at: string
}

export interface OrderRewardLogListResponse {
    reward_logs: OrderRewardLog[]
}

export interface CreateOrderParams {
    amount: AmountInput
}
