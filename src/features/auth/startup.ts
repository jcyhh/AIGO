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

let resumeStoredDappSessionPromise: Promise<void> | undefined

async function detectStartupDappProvider(): Promise<boolean> {
    const { detectDappProvider } = await import('@/services/dapp/provider.ts')

    return Boolean(await detectDappProvider({
        waitForDelayedProvider: true,
    }))
}

async function resumeStoredDappSession(): Promise<void> {
    if (!resumeStoredDappSessionPromise) {
        resumeStoredDappSessionPromise = (async () => {
            const { resumeDappAuthSession } = await import('./dapp.ts')
            await resumeDappAuthSession()
        })()
    }

    return resumeStoredDappSessionPromise
}

async function loadAuthenticatedUserProfile(): Promise<void> {
    try {
        const { getCurrentUser } = await import('@/features/user/api.ts')
        await getCurrentUser()
    } catch {
        // The HTTP layer owns auth error handling; startup should not block page mount here.
    }
}

async function startDappAuthFlow(token: string): Promise<void> {
    if (token) {
        await resumeStoredDappSession()
        replaceAppRoute(ROUTE_PATH.home)
        return
    }

    const { loginWithDapp } = await import('./dapp.ts')
    await loginWithDapp()
}

function shouldSkipDelayedDappDetection(): boolean {
    return isFlutterHost() && !isDappProviderExpected()
}

export async function initializeAuthenticatedDappSession(): Promise<AuthStartupResult> {
    const token = getToken()

    if (!token) return AUTH_STARTUP_RESULT.completed

    await loadAuthenticatedUserProfile()

    if (APP_CONFIG.loginMode === APP_LOGIN_MODE.account) {
        return AUTH_STARTUP_RESULT.completed
    }

    if (shouldSkipDelayedDappDetection()) {
        return AUTH_STARTUP_RESULT.completed
    }

    const hasDappProvider = await detectStartupDappProvider()

    if (!hasDappProvider) {
        return AUTH_STARTUP_RESULT.completed
    }

    try {
        await resumeStoredDappSession()
    } catch {
        logout()
    }

    return AUTH_STARTUP_RESULT.completed
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
