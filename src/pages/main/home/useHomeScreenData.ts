import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'
import type { Address } from 'viem'

import { usePageRefresh } from '@/components/PagePullRefresh'
import { getOrders } from '@/features/order/api.ts'
import type { Order as ApiOrder } from '@/features/order/types.ts'
import { getCurrentUser } from '@/features/user/api.ts'
import {
    formatDappAmountUnits,
    readErc20Balance,
} from '@/services/dapp'
import {
    getUsdtAddress,
    readAigoProjectMaxDepositUsdt,
    readAigoProjectMinDepositUsdt,
    readAigoProjectOrder,
    readAigoProjectPendingDynamicReward,
    readAigoProjectPendingStaticRewards,
} from '@/services/contracts'
import { addDecimalNumbers } from '@/shared/calculations/decimalNumbers.ts'
import { formatAmount } from '@/shared/formatters/formatAmount.ts'
import { useLatestRequest } from '@/shared/hooks/useLatestRequest.ts'

import {
    HOME_ORDER_PAGE_SIZE,
    HOME_SCREEN_REFRESH_INTERVAL_MS,
    TOKEN_BALANCE_EMPTY_TEXT,
} from './constants.ts'
import type {
    HomeOrder,
    HomeOrderStatus,
    HomeQuotaProgress,
} from './types.ts'
import {
    createHomeOrderListParams,
    formatHomeOrderTokenText,
    mapApiOrderToHomeOrder,
    sortHomeOrderIndexes,
} from './utils.ts'

interface UseHomeScreenDataParams {
    activeOrderStatus: HomeOrderStatus
    walletAddress: string
    refreshEnabled: boolean
}

interface ActiveOrderProgressResult {
    order: ApiOrder
    releaseAmount: bigint
    releaseAmountText: string
    ok: boolean
}

interface ActiveOrderStaticRewardResult {
    order: ApiOrder
    claimableAmount: bigint
    ok: boolean
}

const EMPTY_HOME_QUOTA_PROGRESS: HomeQuotaProgress = {
    amount: '0',
    totalAmount: '0',
    loading: true,
}

function createInactiveQuotaProgress(totalAmount: string, totalClaimedAmount: bigint): HomeQuotaProgress {
    return {
        amount: formatDappAmountUnits(totalClaimedAmount),
        totalAmount,
        loading: false,
    }
}

function createEmptyLoadedQuotaProgress(): HomeQuotaProgress {
    return {
        amount: '0',
        totalAmount: '0',
        loading: false,
    }
}

export function useHomeScreenData(params: UseHomeScreenDataParams) {
    const {
        activeOrderStatus,
        walletAddress,
        refreshEnabled,
    } = params
    const [homeOrderPageNo, setHomeOrderPageNo] = useState(1)
    const [homeOrders, setHomeOrders] = useState<HomeOrder[]>([])
    const [homeOrderLoading, setHomeOrderLoading] = useState(false)
    const [homeOrderHasNextPage, setHomeOrderHasNextPage] = useState(false)
    const [homeQuotaProgress, setHomeQuotaProgress] = useState<HomeQuotaProgress>(EMPTY_HOME_QUOTA_PROGRESS)
    const [homeDepositMinimum, setHomeDepositMinimum] = useState(0n)
    const [homeDepositMaximum, setHomeDepositMaximum] = useState(0n)
    const [homeDepositLimitsLoaded, setHomeDepositLimitsLoaded] = useState(false)
    const [homeDepositAmountText, setHomeDepositAmountText] = useState('')
    const [usdtBalanceAmount, setUsdtBalanceAmount] = useState(0n)
    const [usdtBalanceText, setUsdtBalanceText] = useState(TOKEN_BALANCE_EMPTY_TEXT)
    const [dynamicRewardTokenAmount, setDynamicRewardTokenAmount] = useState(0n)
    const [dynamicRewardTokenText, setDynamicRewardTokenText] = useState(TOKEN_BALANCE_EMPTY_TEXT)
    const [staticRewardTokenAmount, setStaticRewardTokenAmount] = useState(0n)
    const [staticRewardTokenLoading, setStaticRewardTokenLoading] = useState(true)
    const [staticRewardOrderIndexes, setStaticRewardOrderIndexes] = useState<bigint[]>([])
    const homeScreenRefreshTimerRef = useRef<number | undefined>(undefined)
    const homeScreenRefreshLifecycleRef = useRef(0)
    const {
        createLatestRequestGuard: createUsdtBalanceRequestGuard,
        invalidateLatestRequest: invalidateUsdtBalanceRequest,
    } = useLatestRequest()
    const {
        createLatestRequestGuard: createHomeDepositLimitsRequestGuard,
        invalidateLatestRequest: invalidateHomeDepositLimitsRequest,
    } = useLatestRequest()
    const {
        createLatestRequestGuard: createDynamicRewardRequestGuard,
        invalidateLatestRequest: invalidateDynamicRewardRequest,
    } = useLatestRequest()
    const {
        createLatestRequestGuard: createInactiveQuotaRequestGuard,
        invalidateLatestRequest: invalidateInactiveQuotaRequest,
    } = useLatestRequest()
    const {
        createLatestRequestGuard: createHomeOrdersRequestGuard,
        invalidateLatestRequest: invalidateHomeOrdersRequest,
    } = useLatestRequest()

    const refreshCurrentUserProfile = useCallback(async () => {
        try {
            await getCurrentUser()
        } catch (error) {
            console.error('[home:user-profile] failed', error)
        }
    }, [])

    const loadUsdtBalance = useCallback(async () => {
        const isCurrent = createUsdtBalanceRequestGuard()

        if (!walletAddress) {
            setUsdtBalanceAmount(0n)
            setUsdtBalanceText(TOKEN_BALANCE_EMPTY_TEXT)
            return
        }

        try {
            const balance = await readErc20Balance(
                getUsdtAddress(),
                walletAddress as Address,
            )

            if (isCurrent()) {
                setUsdtBalanceAmount(balance)
                setUsdtBalanceText(formatAmount(formatDappAmountUnits(balance)))
            }
        } catch {
            if (isCurrent()) {
                setUsdtBalanceAmount(0n)
                setUsdtBalanceText(TOKEN_BALANCE_EMPTY_TEXT)
            }
        }
    }, [createUsdtBalanceRequestGuard, walletAddress])

    const loadHomeDepositLimits = useCallback(async () => {
        const isCurrent = createHomeDepositLimitsRequestGuard()

        try {
            const [minimum, maximum] = await Promise.all([
                readAigoProjectMinDepositUsdt(),
                readAigoProjectMaxDepositUsdt(),
            ])

            if (isCurrent()) {
                setHomeDepositMinimum(minimum)
                setHomeDepositMaximum(maximum)
                setHomeDepositLimitsLoaded(true)
            }
        } catch {
            if (isCurrent()) {
                setHomeDepositLimitsLoaded(false)
            }
        }
    }, [createHomeDepositLimitsRequestGuard])

    const loadDynamicReward = useCallback(async () => {
        const isCurrent = createDynamicRewardRequestGuard()

        if (!walletAddress) {
            setDynamicRewardTokenAmount(0n)
            setDynamicRewardTokenText(TOKEN_BALANCE_EMPTY_TEXT)
            return
        }

        try {
            const [, dynamicRewardTokenAmount] = await readAigoProjectPendingDynamicReward(
                walletAddress as Address,
            )

            if (isCurrent()) {
                setDynamicRewardTokenAmount(dynamicRewardTokenAmount)
                setDynamicRewardTokenText(formatAmount(formatDappAmountUnits(dynamicRewardTokenAmount)))
            }
        } catch {
            if (isCurrent()) {
                setDynamicRewardTokenAmount(0n)
                setDynamicRewardTokenText(TOKEN_BALANCE_EMPTY_TEXT)
            }
        }
    }, [createDynamicRewardRequestGuard, walletAddress])

    const loadInactiveHomeQuotaProgress = useCallback(async () => {
        const isCurrent = createInactiveQuotaRequestGuard()

        setHomeQuotaProgress(EMPTY_HOME_QUOTA_PROGRESS)

        try {
            const response = await getOrders(createHomeOrderListParams('active', 1))
            let totalAmount = '0'

            for (const order of response.orders) {
                totalAmount = addDecimalNumbers(totalAmount, order.total_amount)
            }

            if (!walletAddress) {
                if (isCurrent()) {
                    setHomeQuotaProgress(createInactiveQuotaProgress(totalAmount, 0n))
                }

                return
            }

            const claimedAmounts = await Promise.all(
                response.orders.map(async (order) => {
                    try {
                        const { claimedUsdt } = await readAigoProjectOrder(
                            walletAddress as Address,
                            BigInt(order.index),
                        )

                        return claimedUsdt
                    } catch (error) {
                        console.error('[home:quota-progress] failed', error)
                        return 0n
                    }
                }),
            )
            const totalClaimedAmount = claimedAmounts.reduce(
                (total, claimedAmount) => total + claimedAmount,
                0n,
            )

            if (isCurrent()) {
                setHomeQuotaProgress(createInactiveQuotaProgress(totalAmount, totalClaimedAmount))
            }
        } catch {
            if (isCurrent()) {
                setHomeQuotaProgress(createEmptyLoadedQuotaProgress())
            }
        }
    }, [createInactiveQuotaRequestGuard, walletAddress])

    const readActiveOrderProgress = useCallback(async (orders: ApiOrder[]) => {
        let totalAmount = '0'

        for (const order of orders) {
            totalAmount = addDecimalNumbers(totalAmount, order.total_amount)
        }

        if (!walletAddress) {
            return {
                totalAmount,
                totalClaimedAmount: 0n,
                progressResults: orders.map((order) => ({
                    order,
                    releaseAmount: 0n,
                    releaseAmountText: '0',
                    ok: true,
                })),
            }
        }

        const progressResults = await Promise.all(
            orders.map(async (order): Promise<ActiveOrderProgressResult> => {
                const index = BigInt(order.index)

                try {
                    const { claimedUsdt: releaseAmount } = await readAigoProjectOrder(
                        walletAddress as Address,
                        index,
                    )

                    return {
                        order,
                        releaseAmount,
                        releaseAmountText: formatDappAmountUnits(releaseAmount),
                        ok: true,
                    }
                } catch (error) {
                    console.error('[home:order-progress] failed', error)

                    return {
                        order,
                        releaseAmount: 0n,
                        releaseAmountText: '0',
                        ok: false,
                    }
                }
            }),
        )
        const totalClaimedAmount = progressResults.reduce(
            (total, result) => total + result.releaseAmount,
            0n,
        )

        return {
            totalAmount,
            totalClaimedAmount,
            progressResults,
        }
    }, [walletAddress])

    const loadActiveOrderProgress = useCallback(async (
        orders: ApiOrder[],
        isCurrent: () => boolean,
    ) => {
        const {
            totalAmount,
            totalClaimedAmount,
            progressResults,
        } = await readActiveOrderProgress(orders)
        const progressByOrderId = new Map(progressResults.map((result) => [result.order.id, result]))

        if (isCurrent()) {
            setHomeOrders((current) => current.map((homeOrder) => {
                const progress = progressByOrderId.get(homeOrder.id)

                if (!progress) return homeOrder

                return {
                    ...homeOrder,
                    progressCurrentValue: progress.ok ? progress.releaseAmountText : homeOrder.progressCurrentValue,
                    progressCurrentText: progress.ok ? formatAmount(progress.releaseAmountText) : homeOrder.progressCurrentText,
                    progressLoading: false,
                }
            }))
            setHomeQuotaProgress({
                amount: formatDappAmountUnits(totalClaimedAmount),
                totalAmount,
                loading: false,
            })
        }
    }, [readActiveOrderProgress])

    const readActiveOrderPendingStaticRewards = useCallback(async (orders: ApiOrder[]) => {
        const orderRewards = await Promise.all(
            orders.map(async (order): Promise<ActiveOrderStaticRewardResult> => {
                const index = BigInt(order.index)

                try {
                    const [, claimableAmount] = await readAigoProjectPendingStaticRewards([index], {
                        account: walletAddress as Address,
                    })

                    return {
                        order,
                        claimableAmount,
                        ok: true,
                    }
                } catch (error) {
                    console.error('[home:pending-static-rewards] failed', error)

                    return {
                        order,
                        claimableAmount: 0n,
                        ok: false,
                    }
                }
            }),
        )

        return orderRewards
    }, [walletAddress])

    const loadActiveOrderPendingStaticRewards = useCallback(async (
        orders: ApiOrder[],
        isCurrent: () => boolean,
    ) => {
        const indexes = sortHomeOrderIndexes(
            orders.map((order) => BigInt(order.index)),
        )
        const staticRewardPromise = readAigoProjectPendingStaticRewards(indexes, {
            account: walletAddress as Address,
        })
        const orderRewardsPromise = readActiveOrderPendingStaticRewards(orders)
        const [staticRewardResult, orderRewards] = await Promise.allSettled([
            staticRewardPromise,
            orderRewardsPromise,
        ])

        if (isCurrent()) {
            if (staticRewardResult.status === 'fulfilled') {
                const [, staticRewardAmount] = staticRewardResult.value
                setStaticRewardTokenAmount(staticRewardAmount)
            } else {
                console.error('[home:pending-static-rewards] failed', staticRewardResult.reason)
                setStaticRewardTokenAmount(0n)
            }

            setStaticRewardTokenLoading(false)
        }

        if (orderRewards.status !== 'fulfilled') {
            if (isCurrent()) {
                setHomeOrders((current) => current.map((homeOrder) => ({
                    ...homeOrder,
                    claimableLoading: false,
                    canClaim: false,
                })))
            }

            return
        }

        const rewardByOrderId = new Map(orderRewards.value.map((result) => [result.order.id, result]))

        if (isCurrent()) {
            setHomeOrders((current) => current.map((homeOrder) => {
                const reward = rewardByOrderId.get(homeOrder.id)

                if (!reward) return homeOrder

                return {
                    ...homeOrder,
                    claimableText: reward.ok
                        ? formatHomeOrderTokenText(formatDappAmountUnits(reward.claimableAmount))
                        : homeOrder.claimableText,
                    claimableLoading: false,
                    canClaim: reward.ok && reward.claimableAmount > 0n,
                }
            }))
        }
    }, [readActiveOrderPendingStaticRewards, walletAddress])

    const loadHomeOrders = useCallback(async (
        status: HomeOrderStatus,
        pageNo: number,
    ) => {
        const isCurrent = createHomeOrdersRequestGuard()

        setHomeOrderLoading(true)

        if (status === 'active') {
            invalidateInactiveQuotaRequest()
            setHomeQuotaProgress(EMPTY_HOME_QUOTA_PROGRESS)
            setStaticRewardTokenAmount(0n)
            setStaticRewardTokenLoading(true)
            setStaticRewardOrderIndexes([])
        }

        try {
            const response = await getOrders(createHomeOrderListParams(status, pageNo))
            const nextHomeOrders = response.orders.map((order) => mapApiOrderToHomeOrder(
                order,
                status === 'active',
            ))

            if (isCurrent()) {
                setHomeOrders((current) => pageNo === 1 ? nextHomeOrders : current.concat(nextHomeOrders))
                setHomeOrderHasNextPage(status === 'completed' && response.orders.length >= HOME_ORDER_PAGE_SIZE)

                if (status === 'active') {
                    setStaticRewardOrderIndexes(sortHomeOrderIndexes(
                        response.orders.map((order) => BigInt(order.index)),
                    ))
                }
            }

            if (status === 'active') {
                if (response.orders.length > 0) {
                    await Promise.all([
                        loadActiveOrderPendingStaticRewards(response.orders, isCurrent),
                        loadActiveOrderProgress(response.orders, isCurrent),
                    ])
                } else if (isCurrent()) {
                    setHomeQuotaProgress(createEmptyLoadedQuotaProgress())
                    setStaticRewardTokenAmount(0n)
                    setStaticRewardTokenLoading(false)
                }
            }
        } catch {
            if (isCurrent()) {
                setHomeOrders([])
                setHomeOrderHasNextPage(false)

                if (status === 'active') {
                    setHomeQuotaProgress(createEmptyLoadedQuotaProgress())
                    setStaticRewardTokenAmount(0n)
                    setStaticRewardTokenLoading(false)
                    setStaticRewardOrderIndexes([])
                }
            }
        } finally {
            if (isCurrent()) {
                setHomeOrderLoading(false)
            }
        }
    }, [
        createHomeOrdersRequestGuard,
        invalidateInactiveQuotaRequest,
        loadActiveOrderPendingStaticRewards,
        loadActiveOrderProgress,
    ])

    const refreshHomeScreenData = useCallback(async () => {
        setHomeOrderPageNo(1)

        const refreshTasks = [
            refreshCurrentUserProfile(),
            loadUsdtBalance(),
            loadHomeDepositLimits(),
            loadDynamicReward(),
            loadHomeOrders(activeOrderStatus, 1),
        ]

        if (activeOrderStatus !== 'active') {
            refreshTasks.push(loadInactiveHomeQuotaProgress())
        }

        await Promise.all(refreshTasks)
    }, [
        activeOrderStatus,
        loadDynamicReward,
        loadHomeDepositLimits,
        loadHomeOrders,
        loadInactiveHomeQuotaProgress,
        loadUsdtBalance,
        refreshCurrentUserProfile,
    ])

    const stopHomeScreenRefreshTimer = useCallback(() => {
        if (homeScreenRefreshTimerRef.current === undefined) return

        window.clearInterval(homeScreenRefreshTimerRef.current)
        homeScreenRefreshTimerRef.current = undefined
    }, [])

    const startHomeScreenRefreshTimer = useCallback((lifecycleId: number) => {
        if (lifecycleId !== homeScreenRefreshLifecycleRef.current) return

        stopHomeScreenRefreshTimer()
        homeScreenRefreshTimerRef.current = window.setInterval(() => {
            void refreshHomeScreenData()
        }, HOME_SCREEN_REFRESH_INTERVAL_MS)
    }, [refreshHomeScreenData, stopHomeScreenRefreshTimer])

    const runWithPausedHomeScreenRefresh = useCallback(async <TResult,>(
        task: () => Promise<TResult>,
    ): Promise<TResult> => {
        const lifecycleId = homeScreenRefreshLifecycleRef.current

        stopHomeScreenRefreshTimer()

        try {
            return await task()
        } finally {
            startHomeScreenRefreshTimer(lifecycleId)
        }
    }, [startHomeScreenRefreshTimer, stopHomeScreenRefreshTimer])

    const handleHomePullRefresh = useCallback(async () => {
        await runWithPausedHomeScreenRefresh(refreshHomeScreenData)
    }, [refreshHomeScreenData, runWithPausedHomeScreenRefresh])

    usePageRefresh(handleHomePullRefresh, refreshEnabled)

    const invalidateHomeScreenRequests = useCallback(() => {
        invalidateUsdtBalanceRequest()
        invalidateHomeDepositLimitsRequest()
        invalidateDynamicRewardRequest()
        invalidateInactiveQuotaRequest()
        invalidateHomeOrdersRequest()
    }, [
        invalidateDynamicRewardRequest,
        invalidateHomeDepositLimitsRequest,
        invalidateHomeOrdersRequest,
        invalidateInactiveQuotaRequest,
        invalidateUsdtBalanceRequest,
    ])

    useEffect(() => {
        const lifecycleId = homeScreenRefreshLifecycleRef.current + 1
        homeScreenRefreshLifecycleRef.current = lifecycleId

        void refreshHomeScreenData()
        startHomeScreenRefreshTimer(lifecycleId)

        return () => {
            homeScreenRefreshLifecycleRef.current += 1
            stopHomeScreenRefreshTimer()
            invalidateHomeScreenRequests()
        }
    }, [
        invalidateHomeScreenRequests,
        refreshHomeScreenData,
        startHomeScreenRefreshTimer,
        stopHomeScreenRefreshTimer,
    ])

    useEffect(() => {
        if (homeOrderPageNo === 1) return undefined

        void loadHomeOrders(activeOrderStatus, homeOrderPageNo)

        return undefined
    }, [activeOrderStatus, homeOrderPageNo, loadHomeOrders])

    const resetHomeOrders = useCallback(() => {
        setHomeOrderPageNo(1)
        setHomeOrders([])
        setHomeOrderHasNextPage(false)
    }, [])

    const loadMoreHomeOrders = useCallback(() => {
        if (activeOrderStatus !== 'completed' || homeOrderLoading || !homeOrderHasNextPage) return

        setHomeOrderPageNo((current) => current + 1)
    }, [activeOrderStatus, homeOrderHasNextPage, homeOrderLoading])

    return {
        dynamicRewardTokenAmount,
        dynamicRewardTokenText,
        homeDepositLimitsLoaded,
        homeDepositMaximum,
        homeDepositMinimum,
        homeDepositAmountText,
        homeOrderHasNextPage,
        homeOrderLoading,
        homeOrders,
        homeQuotaProgress,
        loadMoreHomeOrders,
        refreshHomeScreenData,
        resetHomeOrders,
        runWithPausedHomeScreenRefresh,
        setHomeDepositAmountText,
        staticRewardOrderIndexes,
        staticRewardTokenAmount,
        staticRewardTokenLoading,
        usdtBalanceAmount,
        usdtBalanceText,
    }
}
