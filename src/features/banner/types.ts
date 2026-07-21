export interface Banner {
    id: number
    img_url: string
    [key: string]: unknown
}

export interface BannerListResponse {
    banners: Banner[]
    [key: string]: unknown
}
