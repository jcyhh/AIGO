import {
    APP_CONFIG,
    APP_LOGIN_MODE,
} from '@/config/index.ts'
import { replaceAppRoute } from '@/router/bridge.ts'
import { ROUTE_PATH } from '@/router/routes.ts'
import {
    isDappProviderExpected,
    isFlutterHost,
} from '@/services/platform/index.ts'
import { getToken } from '@/services/storage/index.ts'

import { logout } from './session.ts'

export const AUTH_STARTUP_RESULT = {
    completed: 'completed',
    walletRequired: 'walletRequired',
} as const

export type AuthStartupResult =
    (typeof AUTH_STARTUP_RESULT)[keyof typeof AUTH_STARTUP_RESULT]

async function detectStartupDappProvider(): Promise<boolean> {
    const { detectDappProvider } = await import('@/services/dapp/provider.ts')

    return Boolean(await detectDappProvider({
        waitForDelayedProvider: true,
    }))
}

async function startDappAuthFlow(token: string): Promise<void> {
    if (token) {
        const { resumeDappAuthSession } = await import('./dapp.ts')
        await resumeDappAuthSession()
        replaceAppRoute(ROUTE_PATH.home)
        return
    }

    const { loginWithDapp } = await import('./dapp.ts')
    await loginWithDapp()
}

function shouldSkipDelayedDappDetection(): boolean {
    return isFlutterHost() && !isDappProviderExpected()
}

export async function startAuthFlow(): Promise<AuthStartupResult> {
    const token = getToken()

    if (APP_CONFIG.loginMode === APP_LOGIN_MODE.account) {
        replaceAppRoute(token ? ROUTE_PATH.home : ROUTE_PATH.login)
        return AUTH_STARTUP_RESULT.completed
    }

    let hasDappProvider = false

    if (!shouldSkipDelayedDappDetection()) {
        hasDappProvider = await detectStartupDappProvider()
    }

    if (!hasDappProvider && APP_CONFIG.loginMode === APP_LOGIN_MODE.dapp) {
        hasDappProvider = await detectStartupDappProvider()

        if (!hasDappProvider) {
            return AUTH_STARTUP_RESULT.walletRequired
        }
    }

    if (hasDappProvider) {
        try {
            await startDappAuthFlow(token)
        } catch {
            logout()
        }

        return AUTH_STARTUP_RESULT.completed
    }

    if (token) {
        replaceAppRoute(ROUTE_PATH.home)
    } else {
        replaceAppRoute(ROUTE_PATH.login)
    }

    return AUTH_STARTUP_RESULT.completed
}
