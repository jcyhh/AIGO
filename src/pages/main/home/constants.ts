import { PROJECT_TOKEN } from '@/config'
import type { OrderListParams } from '@/features/order/types.ts'

import type { HomeOrderStatus } from './types.ts'

export const HOME_ORDER_STATUS_LIST: readonly HomeOrderStatus[] = ['active', 'completed']

export const HOME_ORDER_PAGE_SIZE = 20
export const HOME_SCREEN_REFRESH_INTERVAL_MS = 10_000

export const HOME_ORDER_API_STATUS: Record<HomeOrderStatus, OrderListParams['status']> = {
    active: 1,
    completed: 0,
}

export const HOME_TOKEN_SYMBOL = PROJECT_TOKEN.usdt.symbol
export const TOKEN_BALANCE_EMPTY_TEXT = '--'
