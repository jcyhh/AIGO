export const HTTP_CONFIG = {
    timeout: 10_000,
} as const

export const HTTP_HEADER = {
    authorization: 'Authorization',
    contentType: 'Content-Type',
    language: 'lang',
    walletAddress: 'Address',
} as const

export const HTTP_CONTENT_TYPE = {
    json: 'application/json; charset=UTF-8',
} as const

export const HTTP_AUTH = {
    scheme: 'Bearer',
} as const

export const HTTP_STATUS = {
    unauthorized: 401,
} as const

export const HTTP_ERROR_MESSAGE = {
    requestFailed: '请求失败',
    unknown: '未知请求错误',
} as const

export const HTTP_UPLOAD_CONFIG = {
    url: '/api/uploads',
    fieldName: 'upload',
    timeout: 60_000,
} as const
