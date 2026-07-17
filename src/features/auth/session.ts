import { replaceAppRoute } from '../../router/bridge.ts'
import { ROUTE_PATH } from '../../router/routes.ts'
import { isDappEnvironment } from '../../services/platform/runtime.ts'
import { removeWalletAddress } from '../../services/storage/common.ts'
import { removeToken, setToken } from '../../services/storage/token.ts'
import { useUserStore } from '../../stores/user/store.ts'

import { AUTH_ERROR_MESSAGE } from './config.ts'
import { runAuthLogoutCleanups } from './lifecycle.ts'

export function completeLogin(token: string): void {
    const value = token.trim()

    if (!value) {
        throw new Error(AUTH_ERROR_MESSAGE.tokenUnavailable)
    }

    setToken(value)
    useUserStore.getState().markSignedIn()
    replaceAppRoute(ROUTE_PATH.home)
}

export function logout(): void {
    runAuthLogoutCleanups()
    removeToken()

    if (isDappEnvironment()) {
        removeWalletAddress()
    }

    useUserStore.getState().markSignedOut()
    replaceAppRoute(ROUTE_PATH.root)
}
