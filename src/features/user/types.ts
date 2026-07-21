import type { PaginationParams } from '../../types/api.ts'

export interface UserLevel {
    id: number
    icon: string
    withdraw_fee: string
    withdraw_avt_fee: string
    name: string
}

export interface UserProfile {
    id: number
    address: string
    created_at: string
    balance_xo: string
    dividend_token: string
    level: UserLevel
    [key: string]: unknown
}

export interface UserStatistics {
    referral_count: number
    team_count: number
    kpi: string
    total_kpi: string
    team_kpi: string
    total_team_kpi: string
}

export interface UserReferral {
    id: number
    maddress: string
    kpi: string
    total_kpi: string
    team_kpi: string
    total_team_kpi: string
    referral_count: number
    team_count: number
    created_at: string
    level: UserLevel
}

export type UserReferralListParams = PaginationParams

export interface UserReferralListResponse {
    referrals: UserReferral[]
}
