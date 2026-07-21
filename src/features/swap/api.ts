import { request } from '../../services/http/request.ts'

import type {
    SwapLogListParams,
    SwapLogListResponse,
} from './types.ts'

export function getSwapLogs(
    params: SwapLogListParams,
): Promise<SwapLogListResponse> {
    return request<SwapLogListResponse>({
        url: '/api/swap_logs',
        method: 'GET',
        params,
    })
}

