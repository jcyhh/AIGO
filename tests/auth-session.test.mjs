import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import {
    completeLogin,
    logout,
} from '../src/features/auth/session.ts'
import {
    registerAppRouteReplacer,
} from '../src/router/bridge.ts'
import { ROUTE_PATH } from '../src/router/routes.ts'
import { getToken, removeToken } from '../src/services/storage/token.ts'
import { useUserStore } from '../src/stores/user/store.ts'

function createStorage() {
    const cache = new Map()

    return {
        getItem: (key) => cache.get(key) ?? null,
        setItem: (key, value) => cache.set(key, String(value)),
        removeItem: (key) => cache.delete(key),
    }
}

function resetAuthState() {
    removeToken()
    useUserStore.getState().markSignedOut()
}

test('completeLogin stores the token, updates auth state, and replaces to home', () => {
    globalThis.window = { localStorage: createStorage() }
    resetAuthState()

    const destinations = []
    const unregister = registerAppRouteReplacer((path) => {
        destinations.push(path)
    })

    completeLogin('access-token')

    assert.equal(getToken(), 'access-token')
    assert.equal(useUserStore.getState().isAuthenticated, true)
    assert.deepEqual(destinations, [ROUTE_PATH.home])
    unregister()
})

test('logout clears the token, updates auth state, and replaces to splash', () => {
    globalThis.window = { localStorage: createStorage() }
    resetAuthState()

    const destinations = []
    const unregister = registerAppRouteReplacer((path) => {
        destinations.push(path)
    })

    completeLogin('access-token')
    destinations.length = 0

    logout()

    assert.equal(getToken(), '')
    assert.equal(useUserStore.getState().isAuthenticated, false)
    assert.deepEqual(destinations, [ROUTE_PATH.root])
    unregister()
})

test('logout in a DApp host also clears the cached wallet address', () => {
    const storage = createStorage()
    storage.setItem('WALLET_ADDRESS', '0x0000000000000000000000000000000000000001')
    globalThis.window = {
        ethereum: { request: async () => [] },
        localStorage: storage,
    }
    resetAuthState()

    logout()

    assert.equal(storage.getItem('WALLET_ADDRESS'), null)
})

test('logout in a Flutter host with an injected wallet clears the cached wallet address', () => {
    const storage = createStorage()
    storage.setItem('WALLET_ADDRESS', '0x0000000000000000000000000000000000000001')
    globalThis.window = {
        __FROM_FLUTTER__: true,
        ethereum: { request: async () => [] },
        localStorage: storage,
    }
    resetAuthState()

    logout()

    assert.equal(storage.getItem('WALLET_ADDRESS'), null)
})

test('auth API keeps the old password and DApp login contracts in one feature module', async () => {
    const [apiSource, configSource, typesSource] = await Promise.all([
        readFile(new URL('../src/features/auth/api.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/features/auth/config.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/features/auth/types.ts', import.meta.url), 'utf8'),
    ])

    assert.match(configSource, /passwordLogin:\s*'\/api\/auth\/login'/)
    assert.match(configSource, /dappLogin:\s*'\/api\/auth\/address_login'/)
    assert.match(apiSource, /AUTH_API_PATH\.passwordLogin/)
    assert.match(apiSource, /AUTH_API_PATH\.dappLogin/)
    assert.match(typesSource, /email/)
    assert.match(typesSource, /password/)
    assert.match(apiSource, /referralCode/)
    assert.match(apiSource, /address/)
    assert.match(apiSource, /signature/)
    assert.match(apiSource, /timestamp/)
    assert.match(
        apiSource,
        /data:\s*\{\s*ref:\s*params\.referralCode,\s*address:\s*params\.address,\s*signature:\s*params\.signature,\s*timestamp:\s*params\.timestamp,\s*\}/,
    )
    assert.match(typesSource, /interface AuthTokenResponse/)
})

test('splash delegates login branching to the auth startup module', async () => {
    const [splashSource, startupSource] = await Promise.all([
        readFile(new URL('../src/pages/splash/SplashPage.tsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/features/auth/startup.ts', import.meta.url), 'utf8'),
    ])

    assert.match(splashSource, /startAuthFlow/)
    assert.match(startupSource, /detectDappProvider/)
    assert.match(startupSource, /APP_CONFIG\.loginMode/)
    assert.match(startupSource, /APP_LOGIN_MODE\.dapp/)
    assert.match(startupSource, /waitForDelayedProvider:\s*true/)
    assert.match(startupSource, /AUTH_STARTUP_RESULT\.walletRequired/)
    assert.match(
        startupSource,
        /APP_LOGIN_MODE\.account[\s\S]*if \(token\) \{[\s\S]*ROUTE_PATH\.home[\s\S]*\} else \{[\s\S]*ROUTE_PATH\.login/,
    )
    assert.match(startupSource, /getToken\(\)/)
    assert.match(startupSource, /loginWithDapp/)
    assert.match(startupSource, /ROUTE_PATH\.login/)
    assert.match(startupSource, /ROUTE_PATH\.home/)
})

test('DApp login invalidates stale signature requests after an account or chain change', async () => {
    const source = await readFile(
        new URL('../src/features/auth/dapp.ts', import.meta.url),
        'utf8',
    )

    assert.match(source, /let dappLoginAttempt = 0/)
    assert.match(source, /handleDappAccountsChanged[\s\S]*dappLoginAttempt \+= 1/)
    assert.match(source, /handleDappChainChanged[\s\S]*dappLoginAttempt \+= 1/)
    assert.match(source, /attempt !== dappLoginAttempt/)
    assert.match(source, /verifyStoredAddress/)
})

test('DApp login only uses a temporary token when development has no API base URL', async () => {
    const [source, configSource] = await Promise.all([
        readFile(new URL('../src/features/auth/dapp.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/features/auth/config.ts', import.meta.url), 'utf8'),
    ])

    assert.match(source, /await signDappMessage\('Login'\)/)
    assert.match(source, /shouldUseTemporaryDappLogin\(\)/)
    assert.match(source, /requestDappLogin/)
    assert.match(source, /completeLogin\('token'\)[\s\S]*return/)
    assert.match(source, /completeLogin\(response\.token\)/)
    assert.match(configSource, /import\.meta\.env\?\.DEV/)
    assert.match(configSource, /import\.meta\.env\?\.VITE_BASE_URL/)
})
