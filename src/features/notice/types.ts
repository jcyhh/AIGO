import type {
    EmptyResponse,
    PaginationParams,
} from '../../types/api.ts'

export type NoticeListParams = PaginationParams

export interface Notice {
    id: number
    title: string
    content: string
    updated_at: string
}

export interface NoticeListResponse {
    notices: Notice[]
}

export interface PopNoticeResponse {
    is_show: boolean
    notice: Notice | []
}

export type MarkNoticeReadResponse = EmptyResponse

