import { request } from '@/services/http/request.ts'

import { AUTH_API_PATH } from './config.ts'
import type {
    AuthTokenResponse,
    DappLoginParams,
    PasswordLoginParams,
} from './types.ts'

export function requestPasswordLogin(
    params: PasswordLoginParams,
): Promise<AuthTokenResponse> {
    return request<AuthTokenResponse, PasswordLoginParams>({
        url: AUTH_API_PATH.passwordLogin,
        method: 'POST',
        data: params,
    })
}

export function requestDappLogin(
    params: DappLoginParams,
): Promise<AuthTokenResponse> {
    return request<AuthTokenResponse, Omit<DappLoginParams, 'referralCode'> & {
        ref: string
    }>({
        url: AUTH_API_PATH.dappLogin,
        method: 'POST',
        data: {
            ref: params.referralCode,
            address: params.address,
            signature: params.signature,
            timestamp: params.timestamp,
        },
    })
}
