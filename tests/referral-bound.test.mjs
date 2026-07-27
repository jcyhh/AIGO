import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import {
    REFERRAL_INVITE_PLACEHOLDER,
    buildReferralInviteLink,
    syncReferralBoundState,
} from '../src/features/referral/status.ts'
import { useUserStore } from '../src/stores/user/store.ts'

function resetUserState() {
    useUserStore.setState({
        isAuthenticated: false,
        isReferralBound: false,
    })
}

test('referral status sync stores whether the current wallet can invite', async () => {
    resetUserState()
    const walletAddress = '0x0000000000000000000000000000000000000001'

    const bound = await syncReferralBoundState({
        walletAddress,
        readIsReferralBound: async (address) => address === walletAddress,
    })

    assert.equal(bound, true)
    assert.equal(useUserStore.getState().isReferralBound, true)

    const unbound = await syncReferralBoundState({
        walletAddress,
        readIsReferralBound: async () => false,
    })

    assert.equal(unbound, false)
    assert.equal(useUserStore.getState().isReferralBound, false)
})

test('referral status sync falls back to unbound when wallet or contract read is unavailable', async () => {
    resetUserState()

    const emptyWalletResult = await syncReferralBoundState({
        walletAddress: '',
        readIsReferralBound: async () => true,
    })

    assert.equal(emptyWalletResult, false)
    assert.equal(useUserStore.getState().isReferralBound, false)

    const originalWarn = console.warn
    console.warn = () => {}

    let failedReadResult = true

    try {
        failedReadResult = await syncReferralBoundState({
            walletAddress: '0x0000000000000000000000000000000000000001',
            readIsReferralBound: async () => {
                throw new Error('contract unavailable')
            },
        })
    } finally {
        console.warn = originalWarn
    }

    assert.equal(failedReadResult, false)
    assert.equal(useUserStore.getState().isReferralBound, false)
})

test('referral status sync prints diagnostics when isReferralBound cannot be read', async () => {
    resetUserState()
    const warnCalls = []
    const originalWarn = console.warn

    console.warn = (...args) => {
        warnCalls.push(args)
    }

    try {
        await syncReferralBoundState({
            walletAddress: '0x0000000000000000000000000000000000000001',
            readIsReferralBound: async () => {
                throw new Error('contract unavailable')
            },
        })
    } finally {
        console.warn = originalWarn
    }

    assert.equal(warnCalls[0][0], '[contract:read:failed]')
    assert.deepEqual(warnCalls[0][1], {
        contract: 'AIGOProjectV1',
        functionName: 'isReferralBound',
        args: ['0x0000000000000000000000000000000000000001'],
        error: 'contract unavailable',
    })
})

test('referral invite link uses the current origin and the short root referral route', () => {
    const walletAddress = '0x0000000000000000000000000000000000000001'

    assert.equal(
        buildReferralInviteLink(walletAddress, 'https://aigo.test'),
        `https://aigo.test/ref/${walletAddress}`,
    )
    assert.equal(
        buildReferralInviteLink('', 'https://aigo.test'),
        REFERRAL_INVITE_PLACEHOLDER,
    )
})

test('auth and sidebar consume the global referral bound state', async () => {
    const [appSource, dappSource, startupSource, sidebarSource, userStoreTypesSource] = await Promise.all([
        readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/features/auth/dapp.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/features/auth/startup.ts', import.meta.url), 'utf8'),
        readFile(new URL('../src/pages/main/layout/SidebarMenu.tsx', import.meta.url), 'utf8'),
        readFile(new URL('../src/stores/user/types.ts', import.meta.url), 'utf8'),
    ])

    assert.match(userStoreTypesSource, /isReferralBound:\s*boolean/)
    assert.match(userStoreTypesSource, /setReferralBound/)
    assert.match(dappSource, /syncReferralBoundState/)
    assert.match(dappSource, /await syncReferralBoundState\(\{\s*walletAddress:\s*address/)
    assert.match(appSource, /initializeAuthenticatedDappSession/)
    assert.match(startupSource, /initializeAuthenticatedDappSession/)
    assert.match(startupSource, /resumeStoredDappSession/)
    assert.match(sidebarSource, /useUserStore/)
    assert.doesNotMatch(sidebarSource, /syncReferralBoundState/)
    assert.doesNotMatch(sidebarSource, /DAPP_PROVIDER_STATUS/)
    assert.doesNotMatch(sidebarSource, /providerStatus/)
    assert.match(sidebarSource, /isReferralBound/)
    assert.match(sidebarSource, /buildReferralInviteLink/)
    assert.match(sidebarSource, /REFERRAL_INVITE_PLACEHOLDER/)
    assert.doesNotMatch(sidebarSource, /0xalifuiewhgouerg564vbfd8sv69aa45/)
})
