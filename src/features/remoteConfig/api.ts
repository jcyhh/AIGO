import { request } from '../../services/http/request.ts'

import type { RemoteConfigResponse } from './types.ts'

export function getRemoteConfig(): Promise<RemoteConfigResponse> {
    return request<RemoteConfigResponse>({
        url: '/api/config/config',
        method: 'GET',
    })
}

