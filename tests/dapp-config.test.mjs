import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { DAPP_CONFIG } from '../src/services/dapp/config.ts'

test('dapp production chain and transaction policies are project settings', () => {
    const source = readFileSync('src/services/dapp/config.ts', 'utf8')
    const readme = readFileSync('src/services/dapp/README.md', 'utf8')

    assert.match(source, /import \{ bsc \} from 'viem\/chains'/)
    assert.match(source, /DAPP_PRODUCTION_CHAIN = bsc/)
    assert.match(source, /DAPP_LOCAL_CHAIN = defineChain/)
    assert.doesNotMatch(source, /VITE_CHAIN_/)
    assert.match(source, /VITE_RPC_URL/)
    assert.match(source, /DAPP_CONFIG/)
    assert.equal(typeof DAPP_CONFIG.minGasBalance, 'string')
    assert.equal(typeof DAPP_CONFIG.enableGasCheck, 'boolean')
    assert.equal(typeof DAPP_CONFIG.enableGasEstimate, 'boolean')
    assert.equal(typeof DAPP_CONFIG.enableErc20MaxApprove, 'boolean')
    assert.equal(typeof DAPP_CONFIG.amountDecimals, 'number')
    assert.doesNotMatch(source, /VITE_DAPP_AMOUNT_DECIMALS/)
    assert.doesNotMatch(source, /VITE_MIN_GAS_BALANCE/)
    assert.doesNotMatch(source, /VITE_ENABLE_DAPP_GAS_CHECK/)
    assert.doesNotMatch(source, /VITE_ENABLE_DAPP_GAS_ESTIMATE/)
    assert.doesNotMatch(source, /VITE_ENABLE_ERC20_MAX_APPROVE/)
    assert.match(readme, /DAPP_PRODUCTION_CHAIN/)
    assert.match(readme, /DAPP_CONFIG/)
    assert.doesNotMatch(readme, /env chain config/)
})

test('dapp reusable constants live in the module config file', () => {
    const configSource = readFileSync('src/services/dapp/config.ts', 'utf8')
    const unitsSource = readFileSync('src/services/dapp/units.ts', 'utf8')

    assert.match(configSource, /DAPP_MAX_AMOUNT_DECIMALS/)
    assert.match(configSource, /DAPP_DEFAULT_AMOUNT_DECIMALS/)
    assert.match(configSource, /DAPP_ERC20_MAX_APPROVE_AMOUNT/)
    assert.doesNotMatch(unitsSource, /const MAX_DAPP_AMOUNT_DECIMALS/)
})
