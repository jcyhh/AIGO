import { request } from '../../services/http/request.ts'

import type {
    AssetLogListParams,
    AssetLogListResponse,
} from './types.ts'

const assetLogRequests = new Map<string, Promise<AssetLogListResponse>>()

function createAssetLogRequestKey(params: AssetLogListParams): string {
    return JSON.stringify({
        page_no: params.page_no,
        page_size: params.page_size,
        ccy: params.ccy ?? '',
    })
}

export function getAssetLogs(
    params: AssetLogListParams,
): Promise<AssetLogListResponse> {
    const requestKey = createAssetLogRequestKey(params)
    const existingRequest = assetLogRequests.get(requestKey)

    if (existingRequest) return existingRequest

    const assetLogRequest = request<AssetLogListResponse>({
        url: '/api/asset_logs',
        method: 'GET',
        params,
    }).finally(() => {
        assetLogRequests.delete(requestKey)
    })

    assetLogRequests.set(requestKey, assetLogRequest)
    return assetLogRequest
}
