import {
    parseAbi,
    type Address,
    type Hex,
    type TransactionReceipt,
} from 'viem'

import {
    readDappContract,
    writeDappContractWithGas,
} from '../dapp/contract.ts'
import type { DappContractWriteOptions } from '../dapp/types.ts'
import {
    getAigoProjectAddress,
    type ProjectContractReadOptions,
    type ProjectContractWriteOptions,
} from './config.ts'

export const AIGO_PROJECT_ABI = parseAbi([
    'function UPGRADE_INTERFACE_VERSION() view returns (string)',
    'function activeOrderCount(address user) view returns (uint256)',
    'function aigoCompoundFactorRay() view returns (uint256)',
    'function aigoLockDays() view returns (uint256)',
    'function aigoUnlockAt(address user) view returns (uint256)',
    'function baseDailyBps() view returns (uint256)',
    'function batchImportOrders((address user, uint128 amount, uint128 maxPayout)[] orders)',
    'function batchImportReferrals((address user, address referral)[] referrals)',
    'function claimDynamicReward()',
    'function claimStaticRewards(uint256[] indexes)',
    'function deposit(uint256 amount)',
    'function depositAIGO(uint256 amount)',
    'function depositWithInvite(uint256 amount, address referral)',
    'function dynamicRewardUsdt(address user) view returns (uint256)',
    'function emergencyExitAIGO()',
    'function emergencyWithdrawERC20(address token, address recipient, uint256 amount)',
    'function feeAddress1() view returns (address)',
    'function feeAddress2() view returns (address)',
    'function feeAddress3() view returns (address)',
    'function feeAddress4() view returns (address)',
    'function getAIGOStake(address user) view returns (uint256 principal, uint256 startedAt)',
    'function getOrder(address user, uint256 index) view returns ((uint128 amount, uint128 maxPayout, uint128 claimedUsdt, uint40 depositedAt, uint40 lastClaimAt, bool status))',
    'function initialize(address initialOwner, address aigo, address usdt, address router, address treasury, address rootReferral_, address[4] feeAddresses, address robot_)',
    'function isReferralBound(address user) view returns (bool)',
    'function maxAIGOStake() view returns (uint256)',
    'function maxDepositUsdt() view returns (uint256)',
    'function maxRewardPriceRatioBps() view returns (uint256)',
    'function minDepositUsdt() pure returns (uint256)',
    'function orderCount(address user) view returns (uint256)',
    'function ordersImported(address user) view returns (bool)',
    'function owner() view returns (address)',
    'function pause()',
    'function paused() view returns (bool)',
    'function currentAIGOStakeBalance(address user) view returns (uint256)',
    'function pendingDynamicReward(address user) view returns (uint256 usdtAmount, uint256 aigoAmount)',
    'function pendingStaticRewards(uint256[] indexes) view returns (uint256 usdtAmount, uint256 aigoAmount)',
    'function personalActivePerformanceUsdt(address user) view returns (uint256)',
    'function proxiableUUID() view returns (bytes32)',
    'function referenceAigoPerUsdt() view returns (uint256)',
    'function referralOf(address user) view returns (address)',
    'function releaseCursor(address user) view returns (uint256)',
    'function renounceOwnership()',
    'function robot() view returns (address)',
    'function rootReferral() view returns (address)',
    'function sellAIGO(uint256 aigoAmount, uint256 minUsdtOut)',
    'function setAIGOCompoundFactorRay(uint256 newFactorRay)',
    'function setAIGOLockDays(uint256 newLockSeconds)',
    'function setBaseDailyBps(uint256 newBaseDailyBps)',
    'function setFeeAddresses(address[4] newFeeAddresses)',
    'function setMaxAIGOStake(uint128 newMaximum)',
    'function setMaxDepositUsdt(uint256 newMaximum)',
    'function setMaxRewardPriceRatioBps(uint256 newRatioBps)',
    'function setReferenceAigoPerUsdt(uint256 newPrice)',
    'function setRobot(address newRobot)',
    'function setTeamVirtualPerformanceUsdt(address user, uint256 value)',
    'function teamCumulativePerformanceUsdt(address user) view returns (uint256)',
    'function teamLevelAndRate(address user) view returns (uint8 level, uint256 rateBps)',
    'function teamVirtualPerformanceUsdt(address user) view returns (uint256)',
    'function totalAIGOPrincipal() view returns (uint256)',
    'function totalTeamPerformanceUsdt(address user) view returns (uint256)',
    'function transferOwnership(address newOwner)',
    'function unpause()',
    'function upgradeToAndCall(address newImplementation, bytes data) payable',
    'function withdrawAIGO(uint256 amount)',
])

export interface AigoProjectImportedOrder {
    user: Address
    amount: bigint
    maxPayout: bigint
}

export interface AigoProjectImportedReferral {
    user: Address
    referral: Address
}

export interface AigoProjectInitializeParams {
    initialOwner: Address
    aigo: Address
    usdt: Address
    router: Address
    treasury: Address
    rootReferral: Address
    feeAddresses: readonly [Address, Address, Address, Address]
    robot: Address
}

export interface AigoProjectOrder {
    amount: bigint
    maxPayout: bigint
    claimedUsdt: bigint
    depositedAt: bigint
    lastClaimAt: bigint
    status: boolean
}

export type AigoProjectStake = readonly [
    principal: bigint,
    startedAt: bigint,
]

export type AigoProjectPendingStaticRewards = readonly [
    usdtAmount: bigint,
    aigoAmount: bigint,
]

export type AigoProjectPendingDynamicReward = readonly [
    usdtAmount: bigint,
    aigoAmount: bigint,
]

export type AigoProjectTeamLevelAndRate = readonly [
    level: number,
    rateBps: bigint,
]

function getAigoProjectContractAddress(options: ProjectContractReadOptions = {}): Address {
    return getAigoProjectAddress(options.contractAddress)
}

function readAigoProject<TResult>(
    functionName: string,
    args: readonly unknown[] = [],
    options: ProjectContractReadOptions = {},
): Promise<TResult> {
    return readDappContract<TResult>({
        address: getAigoProjectContractAddress(options),
        account: options.account,
        abi: AIGO_PROJECT_ABI,
        functionName,
        args,
        debugContractName: 'AIGOProjectV1',
    })
}

function writeAigoProject(
    functionName: string,
    args: readonly unknown[] = [],
    options: ProjectContractWriteOptions = {},
): Promise<TransactionReceipt> {
    const {
        contractAddress,
        ...writeOptions
    } = options

    return writeDappContractWithGas({
        address: getAigoProjectAddress(contractAddress),
        abi: AIGO_PROJECT_ABI,
        functionName,
        args,
        debugContractName: 'AIGOProjectV1',
        ...writeOptions,
    })
}

export function readAigoProjectUpgradeInterfaceVersion(
    options?: ProjectContractReadOptions,
): Promise<string> {
    return readAigoProject('UPGRADE_INTERFACE_VERSION', [], options)
}

export function readAigoProjectActiveOrderCount(
    user: Address,
    options?: ProjectContractReadOptions,
): Promise<bigint> {
    return readAigoProject('activeOrderCount', [user], options)
}

export function readAigoProjectAigoCompoundFactorRay(
    options?: ProjectContractReadOptions,
): Promise<bigint> {
    return readAigoProject('aigoCompoundFactorRay', [], options)
}

export function readAigoProjectAigoLockDays(
    options?: ProjectContractReadOptions,
): Promise<bigint> {
    return readAigoProject('aigoLockDays', [], options)
}

export function readAigoProjectAigoUnlockAt(
    user: Address,
    options?: ProjectContractReadOptions,
): Promise<bigint> {
    return readAigoProject('aigoUnlockAt', [user], options)
}

export function readAigoProjectBaseDailyBps(
    options?: ProjectContractReadOptions,
): Promise<bigint> {
    return readAigoProject('baseDailyBps', [], options)
}

export function readAigoProjectDynamicRewardUsdt(
    user: Address,
    options?: ProjectContractReadOptions,
): Promise<bigint> {
    return readAigoProject('dynamicRewardUsdt', [user], options)
}

export function readAigoProjectFeeAddress1(
    options?: ProjectContractReadOptions,
): Promise<Address> {
    return readAigoProject('feeAddress1', [], options)
}

export function readAigoProjectFeeAddress2(
    options?: ProjectContractReadOptions,
): Promise<Address> {
    return readAigoProject('feeAddress2', [], options)
}

export function readAigoProjectFeeAddress3(
    options?: ProjectContractReadOptions,
): Promise<Address> {
    return readAigoProject('feeAddress3', [], options)
}

export function readAigoProjectFeeAddress4(
    options?: ProjectContractReadOptions,
): Promise<Address> {
    return readAigoProject('feeAddress4', [], options)
}

export function readAigoProjectStake(
    user: Address,
    options?: ProjectContractReadOptions,
): Promise<AigoProjectStake> {
    return readAigoProject('getAIGOStake', [user], options)
}

export function readAigoProjectOrder(
    user: Address,
    index: bigint,
    options?: ProjectContractReadOptions,
): Promise<AigoProjectOrder> {
    return readAigoProject('getOrder', [user, index], options)
}

export function readAigoProjectIsReferralBound(
    user: Address,
    options?: ProjectContractReadOptions,
): Promise<boolean> {
    return readAigoProject('isReferralBound', [user], options)
}

export function readAigoProjectMaxAigoStake(
    options?: ProjectContractReadOptions,
): Promise<bigint> {
    return readAigoProject('maxAIGOStake', [], options)
}

export function readAigoProjectMaxDepositUsdt(
    options?: ProjectContractReadOptions,
): Promise<bigint> {
    return readAigoProject('maxDepositUsdt', [], options)
}

export function readAigoProjectMaxRewardPriceRatioBps(
    options?: ProjectContractReadOptions,
): Promise<bigint> {
    return readAigoProject('maxRewardPriceRatioBps', [], options)
}

export function readAigoProjectMinDepositUsdt(
    options?: ProjectContractReadOptions,
): Promise<bigint> {
    return readAigoProject('minDepositUsdt', [], options)
}

export function readAigoProjectOrderCount(
    user: Address,
    options?: ProjectContractReadOptions,
): Promise<bigint> {
    return readAigoProject('orderCount', [user], options)
}

export function readAigoProjectOrdersImported(
    user: Address,
    options?: ProjectContractReadOptions,
): Promise<boolean> {
    return readAigoProject('ordersImported', [user], options)
}

export function readAigoProjectOwner(
    options?: ProjectContractReadOptions,
): Promise<Address> {
    return readAigoProject('owner', [], options)
}

export function readAigoProjectPaused(
    options?: ProjectContractReadOptions,
): Promise<boolean> {
    return readAigoProject('paused', [], options)
}

export function readAigoProjectCurrentAigoStakeBalance(
    user: Address,
    options?: ProjectContractReadOptions,
): Promise<bigint> {
    return readAigoProject('currentAIGOStakeBalance', [user], options)
}

export function readAigoProjectPendingDynamicReward(
    user: Address,
    options?: ProjectContractReadOptions,
): Promise<AigoProjectPendingDynamicReward> {
    return readAigoProject('pendingDynamicReward', [user], options)
}

export function readAigoProjectPendingStaticRewards(
    indexes: readonly bigint[],
    options?: ProjectContractReadOptions,
): Promise<AigoProjectPendingStaticRewards> {
    return readAigoProject('pendingStaticRewards', [indexes], options)
}

export function readAigoProjectPersonalActivePerformanceUsdt(
    user: Address,
    options?: ProjectContractReadOptions,
): Promise<bigint> {
    return readAigoProject('personalActivePerformanceUsdt', [user], options)
}

export function readAigoProjectProxiableUUID(
    options?: ProjectContractReadOptions,
): Promise<Hex> {
    return readAigoProject('proxiableUUID', [], options)
}

export function readAigoProjectReferenceAigoPerUsdt(
    options?: ProjectContractReadOptions,
): Promise<bigint> {
    return readAigoProject('referenceAigoPerUsdt', [], options)
}

export function readAigoProjectReferralOf(
    user: Address,
    options?: ProjectContractReadOptions,
): Promise<Address> {
    return readAigoProject('referralOf', [user], options)
}

export function readAigoProjectReleaseCursor(
    user: Address,
    options?: ProjectContractReadOptions,
): Promise<bigint> {
    return readAigoProject('releaseCursor', [user], options)
}

export function readAigoProjectRobot(
    options?: ProjectContractReadOptions,
): Promise<Address> {
    return readAigoProject('robot', [], options)
}

export function readAigoProjectRootReferral(
    options?: ProjectContractReadOptions,
): Promise<Address> {
    return readAigoProject('rootReferral', [], options)
}

export function readAigoProjectTeamCumulativePerformanceUsdt(
    user: Address,
    options?: ProjectContractReadOptions,
): Promise<bigint> {
    return readAigoProject('teamCumulativePerformanceUsdt', [user], options)
}

export function readAigoProjectTeamLevelAndRate(
    user: Address,
    options?: ProjectContractReadOptions,
): Promise<AigoProjectTeamLevelAndRate> {
    return readAigoProject('teamLevelAndRate', [user], options)
}

export function readAigoProjectTeamVirtualPerformanceUsdt(
    user: Address,
    options?: ProjectContractReadOptions,
): Promise<bigint> {
    return readAigoProject('teamVirtualPerformanceUsdt', [user], options)
}

export function readAigoProjectTotalAigoPrincipal(
    options?: ProjectContractReadOptions,
): Promise<bigint> {
    return readAigoProject('totalAIGOPrincipal', [], options)
}

export function readAigoProjectTotalTeamPerformanceUsdt(
    user: Address,
    options?: ProjectContractReadOptions,
): Promise<bigint> {
    return readAigoProject('totalTeamPerformanceUsdt', [user], options)
}

export function writeAigoProjectBatchImportOrders(
    orders: readonly AigoProjectImportedOrder[],
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('batchImportOrders', [orders], options)
}

export function writeAigoProjectBatchImportReferrals(
    referrals: readonly AigoProjectImportedReferral[],
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('batchImportReferrals', [referrals], options)
}

export function writeAigoProjectClaimDynamicReward(
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('claimDynamicReward', [], options)
}

export function writeAigoProjectClaimStaticRewards(
    indexes: readonly bigint[],
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('claimStaticRewards', [indexes], options)
}

export function writeAigoProjectDeposit(
    amount: bigint,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('deposit', [amount], options)
}

export function writeAigoProjectDepositAIGO(
    amount: bigint,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('depositAIGO', [amount], options)
}

export function writeAigoProjectDepositWithInvite(
    amount: bigint,
    referral: Address,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('depositWithInvite', [amount, referral], options)
}

export function writeAigoProjectEmergencyExitAIGO(
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('emergencyExitAIGO', [], options)
}

export function writeAigoProjectEmergencyWithdrawERC20(
    token: Address,
    recipient: Address,
    amount: bigint,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('emergencyWithdrawERC20', [token, recipient, amount], options)
}

export function writeAigoProjectInitialize(
    params: AigoProjectInitializeParams,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject(
        'initialize',
        [
            params.initialOwner,
            params.aigo,
            params.usdt,
            params.router,
            params.treasury,
            params.rootReferral,
            params.feeAddresses,
            params.robot,
        ],
        options,
    )
}

export function writeAigoProjectPause(
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('pause', [], options)
}

export function writeAigoProjectRenounceOwnership(
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('renounceOwnership', [], options)
}

export function writeAigoProjectSellAIGO(
    aigoAmount: bigint,
    minUsdtOut: bigint,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('sellAIGO', [aigoAmount, minUsdtOut], options)
}

export function writeAigoProjectSetAigoCompoundFactorRay(
    newFactorRay: bigint,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('setAIGOCompoundFactorRay', [newFactorRay], options)
}

export function writeAigoProjectSetAigoLockDays(
    newLockSeconds: bigint,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('setAIGOLockDays', [newLockSeconds], options)
}

export function writeAigoProjectSetBaseDailyBps(
    newBaseDailyBps: bigint,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('setBaseDailyBps', [newBaseDailyBps], options)
}

export function writeAigoProjectSetFeeAddresses(
    newFeeAddresses: readonly [Address, Address, Address, Address],
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('setFeeAddresses', [newFeeAddresses], options)
}

export function writeAigoProjectSetMaxAigoStake(
    newMaximum: bigint,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('setMaxAIGOStake', [newMaximum], options)
}

export function writeAigoProjectSetMaxDepositUsdt(
    newMaximum: bigint,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('setMaxDepositUsdt', [newMaximum], options)
}

export function writeAigoProjectSetMaxRewardPriceRatioBps(
    newRatioBps: bigint,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('setMaxRewardPriceRatioBps', [newRatioBps], options)
}

export function writeAigoProjectSetReferenceAigoPerUsdt(
    newPrice: bigint,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('setReferenceAigoPerUsdt', [newPrice], options)
}

export function writeAigoProjectSetRobot(
    newRobot: Address,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('setRobot', [newRobot], options)
}

export function writeAigoProjectSetTeamVirtualPerformanceUsdt(
    user: Address,
    value: bigint,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('setTeamVirtualPerformanceUsdt', [user, value], options)
}

export function writeAigoProjectTransferOwnership(
    newOwner: Address,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('transferOwnership', [newOwner], options)
}

export function writeAigoProjectUnpause(
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('unpause', [], options)
}

export function writeAigoProjectUpgradeToAndCall(
    newImplementation: Address,
    data: Hex,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('upgradeToAndCall', [newImplementation, data], options)
}

export function writeAigoProjectWithdrawAIGO(
    amount: bigint,
    options?: ProjectContractWriteOptions,
): Promise<TransactionReceipt> {
    return writeAigoProject('withdrawAIGO', [amount], options)
}

export function createAigoProjectActions(contractAddress?: Address) {
    const readOptions = { contractAddress }
    const withAddress = (options: DappContractWriteOptions = {}) => ({
        ...options,
        contractAddress,
    })

    return {
        readRootReferral: () => readAigoProjectRootReferral(readOptions),
        readIsReferralBound: (user: Address) => readAigoProjectIsReferralBound(user, readOptions),
        readTotalTeamPerformanceUsdt: (user: Address) => readAigoProjectTotalTeamPerformanceUsdt(user, readOptions),
        readMaxDepositUsdt: () => readAigoProjectMaxDepositUsdt(readOptions),
        readMinDepositUsdt: () => readAigoProjectMinDepositUsdt(readOptions),
        readActiveOrderCount: (user: Address) => readAigoProjectActiveOrderCount(user, readOptions),
        readOrderCount: (user: Address) => readAigoProjectOrderCount(user, readOptions),
        readOrder: (user: Address, index: bigint) => readAigoProjectOrder(user, index, readOptions),
        readPendingDynamicReward: (user: Address) => readAigoProjectPendingDynamicReward(user, readOptions),
        readPendingStaticRewards: (indexes: readonly bigint[]) => readAigoProjectPendingStaticRewards(indexes, readOptions),
        readMaxAigoStake: () => readAigoProjectMaxAigoStake(readOptions),
        readCurrentAigoStakeBalance: (user: Address) => readAigoProjectCurrentAigoStakeBalance(user, readOptions),
        readAigoUnlockAt: (user: Address) => readAigoProjectAigoUnlockAt(user, readOptions),
        writeDeposit: (amount: bigint, options?: DappContractWriteOptions) => writeAigoProjectDeposit(amount, withAddress(options)),
        writeDepositWithInvite: (amount: bigint, referral: Address, options?: DappContractWriteOptions) => writeAigoProjectDepositWithInvite(amount, referral, withAddress(options)),
        writeClaimStaticRewards: (indexes: readonly bigint[], options?: DappContractWriteOptions) => writeAigoProjectClaimStaticRewards(indexes, withAddress(options)),
        writeClaimDynamicReward: (options?: DappContractWriteOptions) => writeAigoProjectClaimDynamicReward(withAddress(options)),
        writeSellAIGO: (aigoAmount: bigint, minUsdtOut: bigint, options?: DappContractWriteOptions) => writeAigoProjectSellAIGO(aigoAmount, minUsdtOut, withAddress(options)),
        writeDepositAIGO: (amount: bigint, options?: DappContractWriteOptions) => writeAigoProjectDepositAIGO(amount, withAddress(options)),
        writeWithdrawAIGO: (amount: bigint, options?: DappContractWriteOptions) => writeAigoProjectWithdrawAIGO(amount, withAddress(options)),
    }
}
