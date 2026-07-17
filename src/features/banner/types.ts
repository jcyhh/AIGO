/**
 * A single operation banner item.
 * 单张运营 Banner。
 */
export interface Banner {
    id?: string | number
    img_url: string
    // TODO(banner): Complete stable fields such as target URL, title and sort order after the backend contract is ready.
    // TODO(banner): 根据后端接口文档补全跳转地址、标题、排序等稳定字段。
    [key: string]: unknown
}

export interface BannerListResponse {
    banners: Banner[]
    [key: string]: unknown
}
