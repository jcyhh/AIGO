export const PROJECT_TOKEN = {
    usdt: {
        symbol: 'Token',
    },
    platform: {
        symbol: 'AIGO',
    },
} as const

export type ProjectTokenKey = keyof typeof PROJECT_TOKEN

export type ProjectTokenSymbol =
    (typeof PROJECT_TOKEN)[ProjectTokenKey]['symbol']
