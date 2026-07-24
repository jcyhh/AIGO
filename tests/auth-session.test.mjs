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
    const [apiSource, configSource, typesSource, dappSource] = await Promise.all([
        readFile(new URL('../src/features/auth/api.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/features/auth/config.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/features/auth/types.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/features/auth/dapp.ts', import.meta.url), 'utf8'),
    ])

    assert.match(configSource, /passwordLogin:\s*'\/api\/auth\/login'/)
    assert.match(configSource, /dappLogin:\s*'\/api\/auth\/login'/)
    assert.match(apiSource, /AUTH_API_PATH\.passwordLogin/)
    assert.match(apiSource, /AUTH_API_PATH\.dappLogin/)
    assert.match(typesSource, /email/)
    assert.match(typesSource, /password/)
    assert.match(apiSource, /address/)
    assert.match(apiSource, /signature/)
    assert.match(apiSource, /timestamp/)
    assert.doesNotMatch(apiSource, /ref:\s*params\.referralCode/)
    assert.doesNotMatch(typesSource, /referralCode/)
    assert.doesNotMatch(dappSource, /getReferralCode/)
    assert.match(
        apiSource,
        /data:\s*\{\s*address:\s*params\.address,\s*signature:\s*params\.signature,\s*timestamp:\s*params\.timestamp,\s*\}/,
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

test('splash opening animation gates every auth startup path', async () => {
    const [splashSource, appSource, animationSource] = await Promise.all([
        readFile(new URL('../src/pages/splash/SplashPage.tsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/pages/splash/animation.ts', import.meta.url), 'utf8').catch(() => ''),
    ])

    assert.match(animationSource, /export const SPLASH_ANIMATION_DURATION = 1000/)
    assert.match(animationSource, /export function waitForSplashAnimation\(\): Promise<void>/)
    assert.match(animationSource, /export function isSplashRoutePath/)
    assert.match(splashSource, /import \{[\s\S]*waitForSplashAnimation[\s\S]*\} from '\.\/animation\.ts'/)
    assert.match(
        splashSource,
        /async function startSplashAuthFlow\(\): Promise<void> \{[\s\S]*await waitForSplashAnimation\(\)[\s\S]*const result = await startAuthFlow\(\)/,
    )
    assert.doesNotMatch(
        splashSource,
        /APP_CONFIG\.loginMode === APP_LOGIN_MODE\.account[\s\S]*await waitForSplashAnimation\(\)/,
    )
    assert.match(appSource, /waitForSplashAnimation/)
    assert.match(appSource, /isSplashRoutePath/)
    assert.match(
        appSource,
        /if \(isSplashRoutePath\(\)\) \{[\s\S]*await waitForSplashAnimation\(\)[\s\S]*\}[\s\S]*await initializeAuthenticatedDappSession\(\)/,
    )
})

test('app startup resumes an authenticated DApp session before page modules consume global contract state', async () => {
    const [appSource, routerSource, startupSource] = await Promise.all([
        readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/router/AppRouter.tsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/features/auth/startup.ts', import.meta.url), 'utf8'),
    ])

    assert.match(appSource, /AuthenticatedDappSessionBootstrap/)
    assert.match(appSource, /initializeAuthenticatedDappSession/)
    assert.match(appSource, /void initializeAuthenticatedDappSessionAfterOpening\(\)/)
    assert.match(appSource, /<AppRouter \/>/)
    assert.doesNotMatch(routerSource, /initializeAuthenticatedDappSession/)
    assert.match(startupSource, /export async function initializeAuthenticatedDappSession/)
    assert.match(startupSource, /const token = getToken\(\)/)
    assert.match(startupSource, /if \(!token\) return AUTH_STARTUP_RESULT\.completed/)
    assert.match(startupSource, /async function loadAuthenticatedUserProfile\(\)/)
    assert.match(startupSource, /getCurrentUser/)
    assert.match(
        startupSource,
        /if \(APP_CONFIG\.loginMode === APP_LOGIN_MODE\.account\) \{[\s\S]*await loadAuthenticatedUserProfile\(\)[\s\S]*return AUTH_STARTUP_RESULT\.completed[\s\S]*\}/,
    )
    assert.match(startupSource, /if \(APP_CONFIG\.loginMode === APP_LOGIN_MODE\.account\)/)
    assert.match(startupSource, /detectStartupDappProvider\(\)/)
    assert.match(
        startupSource,
        /await resumeStoredDappSession\(\)[\s\S]*await loadAuthenticatedUserProfile\(\)/,
    )
    assert.match(startupSource, /async function resumeStoredDappSession/)
    assert.match(startupSource, /resumeStoredDappSessionPromise/)
    assert.match(startupSource, /await resumeDappAuthSession\(\)/)
})

test('DApp startup retries wallet login immediately when a stored token belongs to another wallet account', async () => {
    const [startupSource, dappSource] = await Promise.all([
        readFile(new URL('../src/features/auth/startup.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/features/auth/dapp.ts', import.meta.url), 'utf8'),
    ])

    assert.match(startupSource, /async function restartDappLoginAfterStoredSessionChange\(\): Promise<void>/)
    assert.match(
        startupSource,
        /restartDappLoginAfterStoredSessionChange[\s\S]*clearAuthSession\(\)[\s\S]*await loginWithDapp\(\)/,
    )
    assert.match(
        startupSource,
        /try \{[\s\S]*await startDappAuthFlow\(token\)[\s\S]*\} catch \{[\s\S]*if \(token\) \{[\s\S]*await restartDappLoginAfterStoredSessionChange\(\)[\s\S]*\}/,
    )
    assert.match(startupSource, /clearAuthSession/)
    assert.match(dappSource, /export function resetDappLoginAttempt\(\): void/)
    assert.match(
        startupSource,
        /\.finally\(\(\) => \{[\s\S]*resumeStoredDappSessionPromise = undefined[\s\S]*\}\)/,
    )
})

test('DApp login invalidates stale signature requests after an account or chain change', async () => {
    const source = await readFile(
        new URL('../src/features/auth/dapp.ts', import.meta.url),
        'utf8',
    )

    assert.match(source, /let dappLoginAttempt = 0/)
    assert.match(source, /resetDappLoginAttempt[\s\S]*dappLoginAttempt \+= 1/)
    assert.match(source, /handleDappAccountsChanged[\s\S]*resetDappLoginAttempt\(\)/)
    assert.match(source, /handleDappChainChanged[\s\S]*resetDappLoginAttempt\(\)/)
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
