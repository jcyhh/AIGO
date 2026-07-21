import { request } from '../../services/http/request.ts'

import type {
    MarkNoticeReadResponse,
    Notice,
    NoticeListParams,
    NoticeListResponse,
    PopNoticeResponse,
} from './types.ts'

export function getNotices(
    params: NoticeListParams,
): Promise<NoticeListResponse> {
    return request<NoticeListResponse>({
        url: '/api/notices',
        method: 'GET',
        params,
    })
}

export function getNoticeById(id: number): Promise<Notice> {
    return request<Notice>({
        url: `/api/notices/${id}`,
        method: 'GET',
    })
}

export function getNoticeByType(type: string): Promise<Notice> {
    return request<Notice>({
        url: `/api/notices/${encodeURIComponent(type)}`,
        method: 'GET',
    })
}

export function getPopNotice(): Promise<PopNoticeResponse> {
    return request<PopNoticeResponse>({
        url: '/api/notices/pop',
        method: 'GET',
    })
}

export function markNoticeRead(
    id: number,
): Promise<MarkNoticeReadResponse> {
    return request<MarkNoticeReadResponse>({
        url: `/api/notices/${id}/read`,
        method: 'GET',
    })
}

