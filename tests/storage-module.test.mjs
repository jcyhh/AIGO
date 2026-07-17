import test from 'node:test'
import assert from 'node:assert/strict'

import { STORAGE_KEY } from '../src/services/storage/config.ts'
import {
    getLanguage,
    getLoginAccount,
    getReferralCode,
    getWalletAddress,
    removeLanguage,
    removeLoginAccount,
    removeReferralCode,
    removeWalletAddress,
    setLanguage,
    setLoginAccount,
    setReferralCode,
    setWalletAddress,
} from '../src/services/storage/index.ts'

function createStorage() {
    const cache = new Map()
    return {
        cache,
        getItem: (key) => cache.get(key) ?? null,
        setItem: (key, value) => cache.set(key, value),
        removeItem: (key) => cache.delete(key),
    }
}

test('uses the established storage keys without account-list or report keys', () => {
    assert.deepEqual(STORAGE_KEY, {
        walletAddress: 'WALLET_ADDRESS',
        referralCode: 'REF',
        token: 'TOKEN',
        language: 'LANG',
        loginAccount: 'ACCOUNT',
    })
})

test('stores, reads, and removes common string values', () => {
    const localStorage = createStorage()
    globalThis.window = { localStorage }

    setWalletAddress('0x123')
    setReferralCode('invite-code')
    setLanguage('en')
    setLoginAccount('user@example.com')

    assert.equal(getWalletAddress(), '0x123')
    assert.equal(getReferralCode(), 'invite-code')
    assert.equal(getLanguage(), 'en')
    assert.equal(getLoginAccount(), 'user@example.com')

    removeWalletAddress()
    removeReferralCode()
    removeLanguage()
    removeLoginAccount()

    assert.equal(getWalletAddress(), '')
    assert.equal(getReferralCode(), '')
    assert.equal(getLanguage(), 'zh-Hans')
    assert.equal(getLoginAccount(), '')
})

test('does not throw when localStorage is unavailable', () => {
    globalThis.window = {
        get localStorage() { throw new Error('blocked') },
    }

    assert.doesNotThrow(() => setWalletAddress('0x123'))
    assert.equal(getWalletAddress(), '')
    assert.doesNotThrow(() => removeWalletAddress())
})
