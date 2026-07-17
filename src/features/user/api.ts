import { request } from '../../services/http/request.ts'

import type { UserProfile } from './types.ts'

/**
 * Get the current signed-in user.
 * 获取当前登录用户。
 */
export function getCurrentUser(): Promise<UserProfile> {
    return request<UserProfile>({
        url: '/api/users/my',
        method: 'GET',
    })
}
