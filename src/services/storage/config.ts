import { APP_CONFIG } from '../../config/index.ts'

export const STORAGE_KEY = {
    walletAddress: 'WALLET_ADDRESS',
    referralCode: 'REF',
    token: 'TOKEN',
    language: 'LANG',
    loginAccount: 'ACCOUNT',
} as const

export const STORAGE_DEFAULT = {
    language: APP_CONFIG.defaultLanguageCode,
} as const
