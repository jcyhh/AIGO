import { request } from '../../services/http/request.ts'

import type {
    OrderListParams,
    OrderListResponse,
    OrderRewardLogListParams,
    OrderRewardLogListResponse,
} from './types.ts'

const orderListRequests = new Map<string, Promise<OrderListResponse>>()

function createOrderListRequestKey(params: OrderListParams): string {
    return JSON.stringify({
        status: params.status,
        page_no: params.page_no ?? '',
        page_size: params.page_size ?? '',
    })
}

export function getOrders(
    params: OrderListParams,
): Promise<OrderListResponse> {
    const requestKey = createOrderListRequestKey(params)
    const existingRequest = orderListRequests.get(requestKey)

    if (existingRequest) return existingRequest

    const orderListRequest = request<OrderListResponse>({
        url: '/api/orders',
        method: 'GET',
        params,
    }).finally(() => {
        orderListRequests.delete(requestKey)
    })

    orderListRequests.set(requestKey, orderListRequest)

    return orderListRequest
}

export function getOrderRewardLogs(
    params: OrderRewardLogListParams,
): Promise<OrderRewardLogListResponse> {
    return request<OrderRewardLogListResponse>({
        url: '/api/orders/reward_logs',
        method: 'GET',
        params,
    })
}
