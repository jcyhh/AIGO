import { request } from '../../services/http/request.ts'

import type {
    ClaimSignatureResponse,
    CreateClaimParams,
} from './types.ts'

export function createClaim(
    params: CreateClaimParams,
): Promise<ClaimSignatureResponse> {
    return request<ClaimSignatureResponse, CreateClaimParams>({
        url: '/api/claims',
        method: 'POST',
        data: params,
    })
}

