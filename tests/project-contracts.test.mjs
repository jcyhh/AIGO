import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import {
    AIGO_PROJECT_ABI,
    AIGO_ROUTER_ABI,
    LAX_PROJECT_ABI,
    PROJECT_CONTRACT_ENV_KEY,
    getAigoProjectAddress,
    getAigoRouterAddress,
    getLaxProjectAddress,
} from '../src/services/contracts/index.ts'

function getFunctionNames(abi) {
    return new Set(
        abi
            .filter((item) => item.type === 'function')
            .map((item) => item.name),
    )
}

test('project contract modules expose AIGO and LAX ABI contracts through the project services boundary', async () => {
    const [entry, servicesReadme, contractsReadme] = await Promise.all([
        readFile('src/services/contracts/index.ts', 'utf8'),
        readFile('src/services/README.md', 'utf8'),
        readFile('src/services/contracts/README.md', 'utf8'),
    ])

    assert.match(entry, /from '\.\/aigoProject\.ts'/)
    assert.match(entry, /from '\.\/laxProject\.ts'/)
    assert.match(entry, /from '\.\/config\.ts'/)
    assert.match(servicesReadme, /Project-specific contract wrappers live in `contracts`/)
    assert.match(contractsReadme, /AIGOProjectV1/)
    assert.match(contractsReadme, /LAXProject/)
    assert.match(contractsReadme, /`src\/services\/dapp`/)
})

test('contract reads print source-labelled debug data', async () => {
    const [contractSource, typesSource, aigoSource, laxSource, dappEntry, contractsReadme] = await Promise.all([
        readFile('src/services/dapp/contract.ts', 'utf8'),
        readFile('src/services/dapp/types.ts', 'utf8'),
        readFile('src/services/contracts/aigoProject.ts', 'utf8'),
        readFile('src/services/contracts/laxProject.ts', 'utf8'),
        readFile('src/services/dapp/index.ts', 'utf8'),
        readFile('src/services/contracts/README.md', 'utf8'),
    ])

    assert.match(typesSource, /debugContractName\?: string/)
    assert.match(contractSource, /logDappContractReadResult/)
    assert.match(contractSource, /debugContractName \?\? address/)
    assert.match(dappEntry, /from '\.\/contractDebug\.ts'/)
    assert.match(aigoSource, /debugContractName:\s*'AIGOProjectV1'/)
    assert.match(laxSource, /debugContractName:\s*'LAXProject'/)
    assert.match(contractsReadme, /合约读取调试日志/)
})

test('contract writes print source-labelled parameters when they fail', async () => {
    const [contractSource, contractDebugSource, aigoSource, laxSource] = await Promise.all([
        readFile('src/services/dapp/contract.ts', 'utf8'),
        readFile('src/services/dapp/contractDebug.ts', 'utf8'),
        readFile('src/services/contracts/aigoProject.ts', 'utf8'),
        readFile('src/services/contracts/laxProject.ts', 'utf8'),
    ])

    assert.match(contractSource, /logDappContractWriteFailure/)
    assert.match(contractDebugSource, /DAPP_CONTRACT_WRITE_FAILED_LOG_LABEL/)
    assert.match(contractDebugSource, /\[contract:write:failed\]/)
    assert.match(contractDebugSource, /functionName/)
    assert.match(contractDebugSource, /args/)
    assert.match(contractDebugSource, /gas/)
    assert.match(aigoSource, /debugContractName:\s*'AIGOProjectV1'/)
    assert.match(laxSource, /debugContractName:\s*'LAXProject'/)
})

test('contract address config reads project env keys and rejects missing required addresses', () => {
    assert.equal(PROJECT_CONTRACT_ENV_KEY.aigoProjectProxy, 'VITE_AIGO_PROJECT_PROXY')
    assert.equal(PROJECT_CONTRACT_ENV_KEY.laxProject, 'VITE_LAX_PROJECT')
    assert.equal(PROJECT_CONTRACT_ENV_KEY.usdt, 'VITE_USDT')
    assert.equal(PROJECT_CONTRACT_ENV_KEY.aigoTreasury, undefined)
    assert.equal(PROJECT_CONTRACT_ENV_KEY.aigoProjectImplementation, undefined)
    assert.equal(PROJECT_CONTRACT_ENV_KEY.aigoPair, undefined)
    assert.equal(PROJECT_CONTRACT_ENV_KEY.aigoFactory, undefined)

    assert.equal(
        getAigoProjectAddress('0x0165878A594ca255338adfa4d48449f69242Eb8F'),
        '0x0165878A594ca255338adfa4d48449f69242Eb8F',
    )
    assert.throws(
        () => getAigoProjectAddress(),
        /contracts\.aigoProjectAddressUnavailable/,
    )
    assert.throws(
        () => getLaxProjectAddress(),
        /contracts\.laxProjectAddressUnavailable/,
    )
})

test('AIGOProject wrapper covers the current page-facing contract methods', async () => {
    const [source, readme] = await Promise.all([
        readFile('src/services/contracts/aigoProject.ts', 'utf8'),
        readFile('src/services/contracts/README.md', 'utf8'),
    ])
    const functionNames = getFunctionNames(AIGO_PROJECT_ABI)

    for (const name of [
        'rootReferral',
        'isReferralBound',
        'totalTeamPerformanceUsdt',
        'maxDepositUsdt',
        'minDepositUsdt',
        'activeOrderCount',
        'orderCount',
        'getOrder',
        'deposit',
        'depositWithInvite',
        'pendingDynamicReward',
        'pendingStaticRewards',
        'claimStaticRewards',
        'claimDynamicReward',
        'sellAIGO',
        'maxAIGOStake',
        'currentAIGOStakeBalance',
        'aigoUnlockAt',
        'depositAIGO',
        'withdrawAIGO',
    ]) {
        assert.equal(functionNames.has(name), true, `${name} exists in AIGO_PROJECT_ABI`)
    }

    assert.equal(functionNames.has('MAX_ACTIVE_ORDERS'), false)
    assert.match(readme, /MAX_ACTIVE_ORDERS/)
    assert.match(readme, /未暴露 `MAX_ACTIVE_ORDERS`/)

    assert.match(source, /readAigoProjectRootReferral/)
    assert.match(source, /readAigoProjectIsReferralBound/)
    assert.match(source, /readAigoProjectTotalTeamPerformanceUsdt/)
    assert.match(source, /readAigoProjectMaxDepositUsdt/)
    assert.match(source, /readAigoProjectMinDepositUsdt/)
    assert.match(source, /readAigoProjectActiveOrderCount/)
    assert.match(source, /readAigoProjectOrderCount/)
    assert.match(source, /readAigoProjectOrder/)
    assert.match(source, /writeAigoProjectDeposit/)
    assert.match(source, /writeAigoProjectDepositWithInvite/)
    assert.match(source, /readAigoProjectPendingDynamicReward/)
    assert.match(source, /readAigoProjectPendingStaticRewards/)
    assert.match(source, /writeAigoProjectClaimStaticRewards/)
    assert.match(source, /writeAigoProjectClaimDynamicReward/)
    assert.match(source, /writeAigoProjectSellAIGO/)
    assert.match(source, /readAigoProjectMaxAigoStake/)
    assert.match(source, /readAigoProjectCurrentAigoStakeBalance/)
    assert.match(source, /readAigoProjectAigoUnlockAt/)
    assert.match(source, /writeAigoProjectDepositAIGO/)
    assert.match(source, /writeAigoProjectWithdrawAIGO/)
    assert.match(source, /createAigoProjectActions/)
    assert.doesNotMatch(source, /getRecord/)
    assert.doesNotMatch(source, /totalTeamPerformance'\s*,/)
})

test('project contract config exposes the USDT token address getter', async () => {
    const [configSource, entrySource] = await Promise.all([
        readFile('src/services/contracts/config.ts', 'utf8'),
        readFile('src/services/contracts/index.ts', 'utf8'),
    ])

    assert.match(configSource, /usdtAddressUnavailable/)
    assert.match(configSource, /export function getUsdtAddress/)
    assert.match(configSource, /PROJECT_CONTRACT_ENV_KEY\.usdt/)
    assert.match(entrySource, /getUsdtAddress/)
})

test('AIGO router wrapper exposes the Pancake getAmountsOut quote read', async () => {
    const [source, entrySource] = await Promise.all([
        readFile('src/services/contracts/swapRouter.ts', 'utf8'),
        readFile('src/services/contracts/index.ts', 'utf8'),
    ])
    const functionNames = getFunctionNames(AIGO_ROUTER_ABI)

    assert.equal(functionNames.has('getAmountsOut'), true)
    assert.match(source, /debugContractName:\s*'AIGO Router'/)
    assert.match(source, /getAigoRouterAddress/)
    assert.match(source, /uniswapV2Router\/abi\.json/)
    assert.doesNotMatch(source, /parseAbi/)
    assert.match(source, /readAigoRouterAmountsOut/)
    assert.match(source, /readAigoRouter\('getAmountsOut', \[amountIn, path\], options\)/)
    assert.match(entrySource, /AIGO_ROUTER_ABI/)
    assert.match(entrySource, /readAigoRouterAmountsOut/)
    assert.equal(
        getAigoRouterAddress('0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'),
        '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
    )
})

test('LAXProject wrapper covers signed claim methods and common admin reads', async () => {
    const source = await readFile('src/services/contracts/laxProject.ts', 'utf8')
    const functionNames = getFunctionNames(LAX_PROJECT_ABI)

    for (const name of [
        'claim',
        'claimQuota',
        'claimedQuota',
        'isClaim',
        'isQuotaClaim',
        'signer',
        'owner',
        'USDT',
        'LAXO',
    ]) {
        assert.equal(functionNames.has(name), true, `${name} exists in LAX_PROJECT_ABI`)
    }

    assert.match(source, /writeLaxProjectClaim/)
    assert.match(source, /writeLaxProjectClaimQuota/)
    assert.match(source, /readLaxProjectClaimedQuota/)
    assert.match(source, /readLaxProjectIsClaim/)
    assert.match(source, /readLaxProjectIsQuotaClaim/)
    assert.match(source, /readLaxProjectSigner/)
    assert.match(source, /readLaxProjectOwner/)
    assert.match(source, /createLaxProjectActions/)
})

test('project contract env files keep only frontend-used contract addresses', async () => {
    const [exampleEnv, developmentEnv, productionEnv, viteEnv, configSource, entrySource, contractsReadme] = await Promise.all([
        readFile('.env.example', 'utf8'),
        readFile('.env.development', 'utf8'),
        readFile('.env.production', 'utf8'),
        readFile('src/vite-env.d.ts', 'utf8'),
        readFile('src/services/contracts/config.ts', 'utf8'),
        readFile('src/services/contracts/index.ts', 'utf8'),
        readFile('src/services/contracts/README.md', 'utf8'),
    ])
    const removedKeys = [
        'VITE_AIGO_TREASURY',
        'VITE_AIGO_PROJECT_IMPLEMENTATION',
        'VITE_AIGO_PAIR',
        'VITE_AIGO_FACTORY',
    ]

    assert.match(exampleEnv, /VITE_AIGO_PROJECT_PROXY =/)
    assert.match(exampleEnv, /VITE_LAX_PROJECT =/)
    assert.match(exampleEnv, /VITE_AIGO_TOKEN =/)
    assert.match(exampleEnv, /VITE_AIGO_ROUTER =/)
    assert.match(developmentEnv, /VITE_AIGO_PROJECT_PROXY = 0x0165878A594ca255338adfa4d48449f69242Eb8F/)
    assert.match(developmentEnv, /VITE_AIGO_TOKEN = 0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9/)
    assert.match(developmentEnv, /VITE_USDT = 0x5fbdb2315678afecb367f032d93f642f64180aa3/)
    assert.match(productionEnv, /VITE_AIGO_PROJECT_PROXY =\s*(?:\n|$)/)
    assert.match(productionEnv, /VITE_LAX_PROJECT =\s*(?:\n|$)/)
    assert.match(viteEnv, /readonly VITE_AIGO_PROJECT_PROXY: string/)
    assert.match(viteEnv, /readonly VITE_LAX_PROJECT: string/)

    for (const removedKey of removedKeys) {
        assert.doesNotMatch(exampleEnv, new RegExp(removedKey))
        assert.doesNotMatch(developmentEnv, new RegExp(removedKey))
        assert.doesNotMatch(productionEnv, new RegExp(removedKey))
        assert.doesNotMatch(viteEnv, new RegExp(removedKey))
        assert.doesNotMatch(configSource, new RegExp(removedKey))
        assert.doesNotMatch(entrySource, new RegExp(removedKey))
        assert.doesNotMatch(contractsReadme, new RegExp(removedKey))
    }
})
