import { request } from '../../services/http/request.ts'
import { useUserStore } from '../../stores/user/store.ts'

import type {
    UserProfile,
    UserReferralListParams,
    UserReferralListResponse,
    UserStatistics,
} from './types.ts'

let currentUserRequest: Promise<UserProfile> | undefined

export function getCurrentUser(): Promise<UserProfile> {
    if (!currentUserRequest) {
        currentUserRequest = request<UserProfile>({
            url: '/api/users/my',
            method: 'GET',
        }).then((userProfile) => {
            useUserStore.getState().setUserProfile(userProfile)

            return userProfile
        }).finally(() => {
            currentUserRequest = undefined
        })
    }

    return currentUserRequest
}

export function getCurrentUserStatistics(): Promise<UserStatistics> {
    return request<UserStatistics>({
        url: '/api/users/my/statistics',
        method: 'GET',
    })
}

export function getUserReferrals(
    params: UserReferralListParams,
): Promise<UserReferralListResponse> {
    return request<UserReferralListResponse>({
        url: '/api/users/my/referrals',
        method: 'GET',
        params,
    })
}
