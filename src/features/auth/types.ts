export interface AuthTokenResponse {
    token: string
}

export interface PasswordLoginParams {
    email: string
    password: string
}

export interface DappLoginParams {
    referralCode: string
    address: string
    signature: string
    timestamp: number
}
