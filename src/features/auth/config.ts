import { translate } from '../../i18n/index.ts'

export const AUTH_API_PATH = {
    passwordLogin: '/api/auth/login',
    dappLogin: '/api/auth/login',
} as const

export const AUTH_ERROR_MESSAGE = {
    tokenUnavailable: 'auth.tokenUnavailable',
    dappUnavailable: 'auth.dappUnavailable',
    dappSessionChanged: 'auth.dappSessionChanged',
} as const

export type AuthErrorMessage =
    (typeof AUTH_ERROR_MESSAGE)[keyof typeof AUTH_ERROR_MESSAGE]

export function translateAuthErrorMessage(message: AuthErrorMessage): string {
    return translate(message)
}

export function shouldUseTemporaryDappLogin(): boolean {
    return Boolean(import.meta.env?.DEV)
        && !(import.meta.env?.VITE_BASE_URL ?? '').trim()
}
