import type {
    Order as ApiOrder,
    OrderListParams,
} from '@/features/order/types.ts'
import { divideDecimalNumbers } from '@/shared/calculations/decimalNumbers.ts'
import { formatAmount } from '@/shared/formatters/formatAmount.ts'

import {
    HOME_ORDER_API_STATUS,
    HOME_ORDER_PAGE_SIZE,
    HOME_TOKEN_SYMBOL,
    TOKEN_BALANCE_EMPTY_TEXT,
} from './constants.ts'
import type {
    HomeOrder,
    HomeOrderStatus,
} from './types.ts'

export function formatHomeOrderTokenText(value: string): string {
    return `${formatAmount(value)} ${HOME_TOKEN_SYMBOL}`
}

export function getHomeActionErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
}

export function mapApiOrderToHomeOrder(
    order: ApiOrder,
    claimableLoading = false,
): HomeOrder {
    const status = order.status === HOME_ORDER_API_STATUS.active ? 'active' : 'completed'
    const progressCurrentValue = status === 'completed' ? order.total_amount : '0'

    return {
        id: order.id,
        contractIndex: order.index,
        status,
        amountText: formatAmount(order.amount),
        dateText: order.created_at,
        progressCurrentValue,
        progressTotalValue: order.total_amount,
        progressCurrentText: formatAmount(progressCurrentValue),
        progressTotalText: formatAmount(order.total_amount),
        progressMultipleText: divideDecimalNumbers(order.total_amount, order.amount, 2),
        releaseTotalText: formatHomeOrderTokenText(order.total_amount),
        incomeText: `${TOKEN_BALANCE_EMPTY_TEXT} ${HOME_TOKEN_SYMBOL}`,
        claimableText: `${TOKEN_BALANCE_EMPTY_TEXT} ${HOME_TOKEN_SYMBOL}`,
        claimableLoading,
        progressLoading: status !== 'completed',
        canClaim: false,
    }
}

export function createHomeOrderListParams(
    status: HomeOrderStatus,
    pageNo: number,
): OrderListParams {
    const params: OrderListParams = {
        status: HOME_ORDER_API_STATUS[status],
    }

    if (status === 'completed') {
        return {
            ...params,
            page_no: pageNo,
            page_size: HOME_ORDER_PAGE_SIZE,
        }
    }

    return params
}

export function sortHomeOrderIndexes(indexes: readonly bigint[]): bigint[] {
    return [...indexes].sort((left, right) => {
        if (left < right) return -1
        if (left > right) return 1
        return 0
    })
}
