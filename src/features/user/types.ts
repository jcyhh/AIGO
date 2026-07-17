/**
 * User fields that are already confirmed for the template.
 * 当前项目已确认会用到的用户字段。
 */
export interface UserProfile {
    id?: string | number
    finance_level?: string | number | null
    // TODO(user): Complete stable fields from the backend contract and gradually reduce unknown usage.
    // TODO(user): 根据后端接口文档补全稳定字段，逐步减少 unknown 的使用。
    [key: string]: unknown
}
