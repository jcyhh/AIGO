import { request } from '../../services/http/request.ts'

import type { BannerListResponse } from './types.ts'

/**
 * Get the operation banner list.
 * 获取运营 Banner 列表。
 */
export function getBanners(): Promise<BannerListResponse> {
    return request<BannerListResponse>({
        url: '/api/banners',
        method: 'GET',
    })
}
