export interface AuthTokenResponse {
    token: string
}

export interface PasswordLoginParams {
    email: string
    password: string
}

export interface DappLoginParams {
    address: string
    signature: string
    timestamp: number
}
