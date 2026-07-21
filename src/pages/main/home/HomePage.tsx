import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
    isAddress,
    type Address,
} from 'viem'

import { Empty } from '@/components/Empty'
import { ConfirmPopup } from '@/components/ConfirmPopup'
import { ContractLoading } from '@/components/ContractLoading'
import { Icon } from '@/components/Icon'
import { InfiniteScroll } from '@/components/InfiniteScroll'
import { message } from '@/components/Message'
import { ProgressBar } from '@/components/ProgressBar'
import { Popup } from '@/components/Popup'
import { SegmentedTabs } from '@/components/SegmentedTabs'
import { PROJECT_TOKEN } from '@/config'
import { getOrders } from '@/features/order/api.ts'
import { ROUTE_PATH, useAppNavigate } from '@/router'
import type {
    Order as ApiOrder,
    OrderListParams,
} from '@/features/order/types.ts'
import {
    formatDappAmountUnits,
    readErc20Balance,
    waitForDappContractDataSync,
} from '@/services/dapp'
import {
    getUsdtAddress,
    readAigoProjectMaxDepositUsdt,
    readAigoProjectMinDepositUsdt,
    readAigoProjectOrder,
    readAigoProjectPendingDynamicReward,
    readAigoProjectPendingStaticRewards,
    writeAigoProjectClaimStaticRewards,
} from '@/services/contracts'
import { getReferralCode } from '@/services/storage'
import { useDappStore } from '@/stores/dapp'
import { useUserStore } from '@/stores/user'
import {
    addDecimalNumbers,
    divideDecimalNumbers,
} from '@/shared/calculations/decimalNumbers.ts'
import { formatAmount } from '@/shared/formatters/formatAmount.ts'

import bg from '@/assets/home/bg.png'
import aiPic from '@/assets/home/ai-pic.png'
import lightLeft from '@/assets/home/light-left.png'
import lightRight from '@/assets/home/light-right.png'
import walletIcon from '@/assets/home/wallet.png'
import incomeIcon from '@/assets/home/income.png'
import usdtIcon from '@/assets/common/usdt.png'

import {
    parseHomeDepositAmount,
    submitHomeDepositOrder,
} from './deposit.ts'
import './HomePage.scss'

type HomeOrderStatus = 'active' | 'completed'

type HomeOrder = {
    id: number
    contractIndex: string | number
    status: HomeOrderStatus
    amountText: string
    dateText: string
    progressCurrentValue: string
    progressTotalValue: string
    progressCurrentText: string
    progressTotalText: string
    progressMultipleText: string
    releaseTotalText: string
    incomeText: string
    claimableText: string
    claimableLoading: boolean
    progressLoading: boolean
    canClaim: boolean
}

const HOME_ORDER_STATUS_LIST: readonly HomeOrderStatus[] = ['active', 'completed']

const HOME_ORDER_PAGE_SIZE = 20
const HOME_SCREEN_REFRESH_INTERVAL_MS = 10_000

const HOME_ORDER_API_STATUS: Record<HomeOrderStatus, OrderListParams['status']> = {
    active: 1,
    completed: 0,
}

const HOME_TOKEN_SYMBOL = PROJECT_TOKEN.usdt.symbol
const TOKEN_BALANCE_EMPTY_TEXT = '--'

function claimDynamicReward(): Promise<void> {
    return Promise.resolve()
}

function formatHomeOrderTokenText(value: string): string {
    return `${formatAmount(value)} ${HOME_TOKEN_SYMBOL}`
}

function getHomeDepositErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
}

function mapApiOrderToHomeOrder(
    order: ApiOrder,
    claimableLoading = false,
): HomeOrder {
    const status = order.status === HOME_ORDER_API_STATUS.active ? 'active' : 'completed'
    const progressCurrentValue = status === 'completed' ? order.total_amount : '0'

    return {
        id: order.id,
        contractIndex: order.index,
        status,
        amountText: formatAmount(order.amount),
        dateText: order.created_at,
        progressCurrentValue,
        progressTotalValue: order.total_amount,
        progressCurrentText: formatAmount(progressCurrentValue),
        progressTotalText: formatAmount(order.total_amount),
        progressMultipleText: divideDecimalNumbers(order.total_amount, order.amount, 2),
        releaseTotalText: formatHomeOrderTokenText(order.total_amount),
        incomeText: `${TOKEN_BALANCE_EMPTY_TEXT} ${HOME_TOKEN_SYMBOL}`,
        claimableText: `${TOKEN_BALANCE_EMPTY_TEXT} ${HOME_TOKEN_SYMBOL}`,
        claimableLoading,
        progressLoading: status !== 'completed',
        canClaim: false,
    }
}

function createHomeOrderListParams(
    status: HomeOrderStatus,
    pageNo: number,
): OrderListParams {
    const params: OrderListParams = {
        status: HOME_ORDER_API_STATUS[status],
    }

    if (status === 'completed') {
        return {
            ...params,
            page_no: pageNo,
            page_size: HOME_ORDER_PAGE_SIZE,
        }
    }

    return params
}

function sortHomeOrderIndexes(indexes: readonly bigint[]): bigint[] {
    return [...indexes].sort((left, right) => {
        if (left < right) return -1
        if (left > right) return 1
        return 0
    })
}

export function HomePage() {
    const { t } = useTranslation()
    const { pushRoute } = useAppNavigate()
    const walletAddress = useDappStore((state) => state.walletAddress)
    const isReferralBound = useUserStore((state) => state.isReferralBound)
    const setReferralBound = useUserStore((state) => state.setReferralBound)
    const [activeOrderStatus, setActiveOrderStatus] = useState<HomeOrderStatus>('active')
    const [homeOrderPageNo, setHomeOrderPageNo] = useState(1)
    const [homeOrders, setHomeOrders] = useState<HomeOrder[]>([])
    const [homeOrderLoading, setHomeOrderLoading] = useState(false)
    const [homeOrderHasNextPage, setHomeOrderHasNextPage] = useState(false)
    const [homeScreenRefreshVersion, setHomeScreenRefreshVersion] = useState(0)
    const [homeQuotaProgress, setHomeQuotaProgress] = useState({
        amount: '0',
        totalAmount: '0',
        loading: true,
    })
    const [homeDepositMinimum, setHomeDepositMinimum] = useState(0n)
    const [homeDepositMaximum, setHomeDepositMaximum] = useState(0n)
    const [homeDepositLimitsLoaded, setHomeDepositLimitsLoaded] = useState(false)
    const [homeDepositAmountText, setHomeDepositAmountText] = useState('')
    const [homeDepositSubmitting, setHomeDepositSubmitting] = useState(false)
    const [homeOrderClaimSubmitting, setHomeOrderClaimSubmitting] = useState(false)
    const [homeOrderClaiming, setHomeOrderClaiming] = useState<HomeOrder | undefined>(undefined)
    const [inviteAddressText, setInviteAddressText] = useState('')
    const [showInviteAddressPopup, setShowInviteAddressPopup] = useState(false)
    const [usdtBalanceAmount, setUsdtBalanceAmount] = useState(0n)
    const [usdtBalanceText, setUsdtBalanceText] = useState(TOKEN_BALANCE_EMPTY_TEXT)
    const [dynamicRewardTokenAmount, setDynamicRewardTokenAmount] = useState(0n)
    const [dynamicRewardTokenText, setDynamicRewardTokenText] = useState(TOKEN_BALANCE_EMPTY_TEXT)
    const [staticRewardTokenAmount, setStaticRewardTokenAmount] = useState(0n)
    const [staticRewardTokenLoading, setStaticRewardTokenLoading] = useState(true)
    const [staticRewardOrderIndexes, setStaticRewardOrderIndexes] = useState<bigint[]>([])
    const [showStaticRewardClaimPopup, setShowStaticRewardClaimPopup] = useState(false)
    const [showDynamicRewardClaimPopup, setShowDynamicRewardClaimPopup] = useState(false)
    const homeScreenRefreshTimerRef = useRef<number | undefined>(undefined)
    const homeOrderStatusTabs = HOME_ORDER_STATUS_LIST.map((status) => ({
        label: status === 'active' ? t('进行中') : t('已完成'),
        value: status,
    }))

    const refreshHomeScreenData = useCallback(() => {
        setHomeOrderPageNo(1)
        setHomeScreenRefreshVersion((current) => current + 1)
    }, [])

    const stopHomeScreenRefreshTimer = useCallback(() => {
        if (homeScreenRefreshTimerRef.current === undefined) return

        window.clearInterval(homeScreenRefreshTimerRef.current)
        homeScreenRefreshTimerRef.current = undefined
    }, [])

    const startHomeScreenRefreshTimer = useCallback(() => {
        stopHomeScreenRefreshTimer()
        homeScreenRefreshTimerRef.current = window.setInterval(
            refreshHomeScreenData,
            HOME_SCREEN_REFRESH_INTERVAL_MS,
        )
    }, [refreshHomeScreenData, stopHomeScreenRefreshTimer])

    useEffect(() => {
        startHomeScreenRefreshTimer()

        return stopHomeScreenRefreshTimer
    }, [startHomeScreenRefreshTimer, stopHomeScreenRefreshTimer])

    useEffect(() => {
        if (!walletAddress) {
            setUsdtBalanceAmount(0n)
            setUsdtBalanceText(TOKEN_BALANCE_EMPTY_TEXT)
            return
        }

        let isCurrent = true

        async function loadUsdtBalance() {
            try {
                const balance = await readErc20Balance(
                    getUsdtAddress(),
                    walletAddress as Address,
                )

                if (isCurrent) {
                    setUsdtBalanceAmount(balance)
                    setUsdtBalanceText(formatAmount(formatDappAmountUnits(balance)))
                }
            } catch {
                if (isCurrent) {
                    setUsdtBalanceAmount(0n)
                    setUsdtBalanceText(TOKEN_BALANCE_EMPTY_TEXT)
                }
            }
        }

        void loadUsdtBalance()

        return () => {
            isCurrent = false
        }
    }, [walletAddress, homeScreenRefreshVersion])

    useEffect(() => {
        let isCurrent = true

        async function loadHomeDepositLimits() {
            try {
                const [minimum, maximum] = await Promise.all([
                    readAigoProjectMinDepositUsdt(),
                    readAigoProjectMaxDepositUsdt(),
                ])

                if (isCurrent) {
                    setHomeDepositMinimum(minimum)
                    setHomeDepositMaximum(maximum)
                    setHomeDepositLimitsLoaded(true)
                }
            } catch {
                if (isCurrent) {
                    setHomeDepositLimitsLoaded(false)
                }
            }
        }

        void loadHomeDepositLimits()

        return () => {
            isCurrent = false
        }
    }, [homeScreenRefreshVersion])

    useEffect(() => {
        if (!walletAddress) {
            setDynamicRewardTokenAmount(0n)
            setDynamicRewardTokenText(TOKEN_BALANCE_EMPTY_TEXT)
            return
        }

        let isCurrent = true

        async function loadDynamicReward() {
            try {
                const [, dynamicRewardTokenAmount] = await readAigoProjectPendingDynamicReward(
                    walletAddress as Address,
                )

                if (isCurrent) {
                    setDynamicRewardTokenAmount(dynamicRewardTokenAmount)
                    setDynamicRewardTokenText(formatAmount(formatDappAmountUnits(dynamicRewardTokenAmount)))
                }
            } catch {
                if (isCurrent) {
                    setDynamicRewardTokenAmount(0n)
                    setDynamicRewardTokenText(TOKEN_BALANCE_EMPTY_TEXT)
                }
            }
        }

        void loadDynamicReward()

        return () => {
            isCurrent = false
        }
    }, [walletAddress, homeScreenRefreshVersion])

    useEffect(() => {
        if (activeOrderStatus === 'active') return

        let isCurrent = true

        async function loadInactiveHomeQuotaProgress() {
            setHomeQuotaProgress({
                amount: '0',
                totalAmount: '0',
                loading: true,
            })

            try {
                const response = await getOrders(createHomeOrderListParams('active', 1))
                let totalClaimedAmount = 0n
                let totalAmount = '0'

                for (const order of response.orders) {
                    try {
                        if (walletAddress) {
                            const { claimedUsdt } = await readAigoProjectOrder(
                                walletAddress as Address,
                                BigInt(order.index),
                            )
                            totalClaimedAmount += claimedUsdt
                        }
                    } catch (error) {
                        console.error('[home:quota-progress] failed', error)
                    }

                    totalAmount = addDecimalNumbers(totalAmount, order.total_amount)
                }

                if (isCurrent) {
                    setHomeQuotaProgress({
                        amount: formatDappAmountUnits(totalClaimedAmount),
                        totalAmount,
                        loading: false,
                    })
                }
            } catch {
                if (isCurrent) {
                    setHomeQuotaProgress({
                        amount: '0',
                        totalAmount: '0',
                        loading: false,
                    })
                }
            }
        }

        void loadInactiveHomeQuotaProgress()

        return () => {
            isCurrent = false
        }
    }, [activeOrderStatus, walletAddress, homeScreenRefreshVersion])

    useEffect(() => {
        let isCurrent = true

        async function loadHomeOrders() {
            setHomeOrderLoading(true)

            if (activeOrderStatus === 'active') {
                setHomeQuotaProgress({
                    amount: '0',
                    totalAmount: '0',
                    loading: true,
                })
                setStaticRewardTokenAmount(0n)
                setStaticRewardTokenLoading(true)
                setStaticRewardOrderIndexes([])
            }

            try {
                const response = await getOrders(
                    createHomeOrderListParams(activeOrderStatus, homeOrderPageNo),
                )
                const nextHomeOrders = response.orders.map((order) => mapApiOrderToHomeOrder(
                    order,
                    activeOrderStatus === 'active',
                ))

                if (isCurrent) {
                    setHomeOrders((current) => homeOrderPageNo === 1 ? nextHomeOrders : current.concat(nextHomeOrders))
                    setHomeOrderHasNextPage(activeOrderStatus === 'completed' && response.orders.length >= HOME_ORDER_PAGE_SIZE)

                    if (activeOrderStatus === 'active') {
                        setStaticRewardOrderIndexes(sortHomeOrderIndexes(
                            response.orders.map((order) => BigInt(order.index)),
                        ))
                    }
                }

                async function logHomeOrderContractProgress(orders: ApiOrder[]) {
                    let totalClaimedAmount = 0n
                    let totalAmount = '0'

                    if (!walletAddress) {
                        for (const order of orders) {
                            totalAmount = addDecimalNumbers(totalAmount, order.total_amount)
                        }

                        if (isCurrent) {
                            setHomeOrders((current) => current.map((homeOrder) => ({
                                ...homeOrder,
                                progressLoading: false,
                            })))
                            setHomeQuotaProgress({
                                amount: '0',
                                totalAmount,
                                loading: false,
                            })
                        }

                        return
                    }

                    for (const order of orders) {
                        totalAmount = addDecimalNumbers(totalAmount, order.total_amount)
                        const index = BigInt(order.index)

                        try {
                            const { claimedUsdt: releaseAmount } = await readAigoProjectOrder(
                                walletAddress as Address,
                                index,
                            )
                            totalClaimedAmount += releaseAmount
                            const releaseAmountText = formatDappAmountUnits(releaseAmount)

                            if (isCurrent) {
                                setHomeOrders((current) => current.map((homeOrder) => (
                                    homeOrder.id === order.id
                                        ? {
                                            ...homeOrder,
                                            progressCurrentValue: releaseAmountText,
                                            progressCurrentText: formatAmount(releaseAmountText),
                                            progressLoading: false,
                                        }
                                        : homeOrder
                                )))
                            }
                        } catch (error) {
                            console.error('[home:order-progress] failed', error)

                            if (isCurrent) {
                                setHomeOrders((current) => current.map((homeOrder) => (
                                    homeOrder.id === order.id
                                        ? {
                                            ...homeOrder,
                                            progressLoading: false,
                                        }
                                        : homeOrder
                                )))
                            }
                        }
                    }

                    if (isCurrent) {
                        setHomeQuotaProgress({
                            amount: formatDappAmountUnits(totalClaimedAmount),
                            totalAmount,
                            loading: false,
                        })
                    }
                }

                async function logActiveOrderPendingStaticRewards(orders: ApiOrder[]) {
                    const indexes = sortHomeOrderIndexes(
                        orders.map((order) => BigInt(order.index)),
                    )

                    try {
                        const [, staticRewardAmount] = await readAigoProjectPendingStaticRewards(indexes)

                        if (isCurrent) {
                            setStaticRewardTokenAmount(staticRewardAmount)
                            setStaticRewardTokenLoading(false)
                        }
                    } catch (error) {
                        console.error('[home:pending-static-rewards] failed', error)

                        if (isCurrent) {
                            setStaticRewardTokenAmount(0n)
                            setStaticRewardTokenLoading(false)
                        }
                    }

                    for (const order of orders) {
                        const indexes = [BigInt(order.index)]

                        try {
                            const [, claimableAmount] = await readAigoProjectPendingStaticRewards(indexes)

                            console.info('[home:pending-static-rewards]', {
                                indexes,
                                claimableAmount,
                            })

                            if (isCurrent) {
                                setHomeOrders((current) => current.map((homeOrder) => (
                                    homeOrder.id === order.id
                                        ? {
                                            ...homeOrder,
                                            claimableText: formatHomeOrderTokenText(
                                                formatDappAmountUnits(claimableAmount),
                                            ),
                                            claimableLoading: false,
                                            canClaim: claimableAmount > 0n,
                                        }
                                        : homeOrder
                                )))
                            }
                        } catch (error) {
                            console.error('[home:pending-static-rewards] failed', error)

                            if (isCurrent) {
                                setHomeOrders((current) => current.map((homeOrder) => (
                                    homeOrder.id === order.id
                                        ? {
                                            ...homeOrder,
                                            claimableLoading: false,
                                            canClaim: false,
                                        }
                                        : homeOrder
                                )))
                            }
                        }
                    }
                }

                if (activeOrderStatus === 'active') {
                    if (response.orders.length > 0) {
                        void logActiveOrderPendingStaticRewards(response.orders)
                    } else if (isCurrent) {
                        setStaticRewardTokenAmount(0n)
                        setStaticRewardTokenLoading(false)
                    }

                    void logHomeOrderContractProgress(response.orders)
                }
            } catch {
                if (isCurrent) {
                    setHomeOrders([])
                    setHomeOrderHasNextPage(false)

                    if (activeOrderStatus === 'active') {
                        setHomeQuotaProgress({
                            amount: '0',
                            totalAmount: '0',
                            loading: false,
                        })
                        setStaticRewardTokenAmount(0n)
                        setStaticRewardTokenLoading(false)
                        setStaticRewardOrderIndexes([])
                    }
                }
            } finally {
                if (isCurrent) {
                    setHomeOrderLoading(false)
                }
            }
        }

        void loadHomeOrders()

        return () => {
            isCurrent = false
        }
    }, [
        activeOrderStatus,
        homeOrderPageNo,
        homeScreenRefreshVersion,
        walletAddress,
    ])

    function handleUseAllHomeDepositAmount() {
        if (usdtBalanceAmount <= 0n) {
            message.warning(t('余额不足'))
            return
        }

        setHomeDepositAmountText(formatDappAmountUnits(usdtBalanceAmount))
    }

    function handleOpenInviteAddressPopup() {
        const referralCode = getReferralCode().trim()
        setInviteAddressText(referralCode)
        setShowInviteAddressPopup(true)
    }

    function handleCloseInviteAddressPopup() {
        setShowInviteAddressPopup(false)
    }

    function validateHomeDepositAmount(): bigint | undefined {
        const amountText = homeDepositAmountText.trim()

        if (!amountText) {
            message.warning(t('请输入金额'))
            return undefined
        }

        if (!homeDepositLimitsLoaded) {
            message.warning(t('入金额度加载中'))
            return undefined
        }

        try {
            const amount = parseHomeDepositAmount(amountText)

            if (amount < homeDepositMinimum) {
                message.warning(t('入金金额低于最小限额'))
                return undefined
            }

            if (amount > homeDepositMaximum) {
                message.warning(t('入金金额超过最大限额'))
                return undefined
            }

            if (amount <= 0n || amount > usdtBalanceAmount) {
                message.warning(t('余额不足'))
                return undefined
            }

            return amount
        } catch {
            message.warning(t('金额格式错误'))
            return undefined
        }
    }

    async function submitHomeDeposit(
        amount: bigint,
        referralAddress?: Address,
    ) {
        if (!walletAddress) {
            message.warning(t('未获取到钱包地址'))
            return
        }

        if (homeDepositSubmitting) return

        stopHomeScreenRefreshTimer()
        setHomeDepositSubmitting(true)

        try {
            await submitHomeDepositOrder({
                amount,
                walletAddress: walletAddress as Address,
                referralAddress,
            })

            if (referralAddress) {
                setReferralBound(true)
            }

            await waitForDappContractDataSync()

            setHomeDepositAmountText('')
            setShowInviteAddressPopup(false)
            refreshHomeScreenData()
            message.success(t('操作成功'))
        } catch (error) {
            message.warning(getHomeDepositErrorMessage(error))
        } finally {
            setHomeDepositSubmitting(false)
            startHomeScreenRefreshTimer()
        }
    }

    function handleSubmitHomeDeposit() {
        const amount = validateHomeDepositAmount()
        if (amount === undefined) return

        if (!isReferralBound) {
            handleOpenInviteAddressPopup()
            return
        }

        void submitHomeDeposit(amount)
    }

    async function handleConfirmHomeDepositWithInvite() {
        const amount = validateHomeDepositAmount()
        if (amount === undefined) return

        const referralAddress = inviteAddressText.trim()

        if (!referralAddress) {
            message.warning(t('请输入邀请地址'))
            return
        }

        if (!isAddress(referralAddress)) {
            message.warning(t('邀请地址格式错误'))
            return
        }

        await submitHomeDeposit(amount, referralAddress as Address)
    }

    function handleOpenDynamicRewardClaimPopup() {
        if (dynamicRewardTokenAmount <= 0n) {
            message.warning(t('可提取收益不足'))
            return
        }

        setShowDynamicRewardClaimPopup(true)
    }

    function handleCloseDynamicRewardClaimPopup() {
        setShowDynamicRewardClaimPopup(false)
    }

    async function handleConfirmDynamicRewardClaim() {
        stopHomeScreenRefreshTimer()

        try {
            await claimDynamicReward()
            handleCloseDynamicRewardClaimPopup()
            refreshHomeScreenData()
        } finally {
            startHomeScreenRefreshTimer()
        }
    }

    function handleOpenHomeOrderClaim(order: HomeOrder) {
        setHomeOrderClaiming(order)
    }

    function handleCloseHomeOrderClaim() {
        if (homeOrderClaimSubmitting) return
        setHomeOrderClaiming(undefined)
    }

    async function handleConfirmHomeOrderClaim() {
        if (!homeOrderClaiming || homeOrderClaimSubmitting) return

        stopHomeScreenRefreshTimer()
        setHomeOrderClaimSubmitting(true)

        try {
            await writeAigoProjectClaimStaticRewards([BigInt(homeOrderClaiming.contractIndex)])
            await waitForDappContractDataSync()

            setHomeOrderClaiming(undefined)
            refreshHomeScreenData()
            message.success(t('操作成功'))
        } catch (error) {
            message.warning(getHomeDepositErrorMessage(error))
        } finally {
            setHomeOrderClaimSubmitting(false)
            startHomeScreenRefreshTimer()
        }
    }

    function handleOpenStaticRewardClaimPopup() {
        if (staticRewardTokenAmount <= 0n || staticRewardOrderIndexes.length === 0) {
            message.warning(t('可提取收益不足'))
            return
        }

        setShowStaticRewardClaimPopup(true)
    }

    function handleCloseStaticRewardClaimPopup() {
        if (homeOrderClaimSubmitting) return
        setShowStaticRewardClaimPopup(false)
    }

    async function handleConfirmStaticRewardClaim() {
        if (homeOrderClaimSubmitting || staticRewardOrderIndexes.length === 0) return

        stopHomeScreenRefreshTimer()
        setHomeOrderClaimSubmitting(true)

        try {
            await writeAigoProjectClaimStaticRewards(sortHomeOrderIndexes(staticRewardOrderIndexes))
            await waitForDappContractDataSync()

            setShowStaticRewardClaimPopup(false)
            refreshHomeScreenData()
            message.success(t('操作成功'))
        } catch (error) {
            message.warning(getHomeDepositErrorMessage(error))
        } finally {
            setHomeOrderClaimSubmitting(false)
            startHomeScreenRefreshTimer()
        }
    }

    function handleChangeOrderStatus(status: HomeOrderStatus) {
        setActiveOrderStatus(status)
        setHomeOrderPageNo(1)
        setHomeOrders([])
        setHomeOrderHasNextPage(false)
    }

    function handleLoadMoreHomeOrders() {
        if (activeOrderStatus !== 'completed' || homeOrderLoading || !homeOrderHasNextPage) return

        setHomeOrderPageNo((current) => current + 1)
    }

    function handleOpenRewardDetail() {
        pushRoute(ROUTE_PATH.homeRewardDetail)
    }

    const homeDepositPlaceholder = t('单次入金 {{min}}～{{max}}', {
        min: formatDappAmountUnits(homeDepositMinimum),
        max: formatDappAmountUnits(homeDepositMaximum),
    })

    return (
        <section className="home-page" data-page="home">
            <ContractLoading show={homeDepositSubmitting || homeOrderClaimSubmitting} />
            <img src={bg} className="home-page__bg vw-100" alt="" />
            <img src={aiPic} className="home-page__hero" alt="" />

            <div className="home-page__content container rel">
                <div className="home-page__cooperation-card">
                    <div className="home-page__card-title flex-center pt-40">
                        <img
                            src={lightLeft}
                            className="home-page__card-title-light flex-none"
                            alt=""
                        />
                        <div className="home-page__card-title-text tc size-32 bold-6 ml-20 mr-20">
                            {t('加入生态协作')}
                        </div>
                        <img
                            src={lightRight}
                            className="home-page__card-title-light flex-none"
                            alt=""
                        />
                    </div>

                    <div className="home-page__quota mt-44 pl-60 pr-60">
                        <div className="flex-between items-center size-24">
                            <div className="opc-5">{t('额度进度')}</div>
                            {homeQuotaProgress.loading ? (
                                <div className="flex items-center">
                                    <Icon name="loading" className="size-24 blue" ariaLabel={t('已入金额度加载中')} />
                                    <span className="opc-5 ml-8 mr-8">/</span>
                                    <Icon name="loading" className="size-24 blue" ariaLabel={t('总额度加载中')} />
                                    <span className="opc-5">{HOME_TOKEN_SYMBOL}</span>
                                </div>
                            ) : (
                                <div>
                                    <span>{formatAmount(homeQuotaProgress.amount)}</span>
                                    <span className="opc-5">/{formatAmount(homeQuotaProgress.totalAmount)}{HOME_TOKEN_SYMBOL}</span>
                                </div>
                            )}
                        </div>
                        <ProgressBar
                            currentValue={homeQuotaProgress.amount}
                            totalValue={homeQuotaProgress.totalAmount}
                            className="home-page__progress-bar mt-16"
                            aria-label={t('额度进度')}
                        />
                    </div>

                    <div className="home-page__deposit mt-32 pl-60 pr-60">
                        <div className="flex-between items-center">
                            <div className="size-28">{t('入金金额')}</div>
                            <div className="flex items-center">
                                <img src={walletIcon} className="img-24 mr-10" />
                                <div className="size-24 ml-8">
                                    <span>{usdtBalanceText} </span>
                                    <span className="opc-5">{HOME_TOKEN_SYMBOL}</span>
                                </div>
                                <button
                                    type="button"
                                    className="home-page__deposit-all blue size-22 ml-8"
                                    onClick={handleUseAllHomeDepositAmount}
                                >
                                    {t('全部')}
                                </button>
                            </div>
                        </div>
                        <input
                            className="home-page__deposit-input mt-24 pl-30 size-28"
                            type="text"
                            inputMode="decimal"
                            placeholder={homeDepositPlaceholder}
                            aria-label={t('入金金额')}
                            value={homeDepositAmountText}
                            onChange={(event) => setHomeDepositAmountText(event.target.value)}
                        />
                        <button
                            type="button"
                            className="home-page__deposit-submit size-28 bold-5 mt-30"
                            onClick={handleSubmitHomeDeposit}
                        >
                            {t('确认')}
                        </button>
                    </div>
                </div>

                <section className="home-page__income-card mt-30">
                    <div className="home-page__income-static flex-between">
                        <div className='flex items-center'>
                            <img src={incomeIcon} className="img-76 flex-none" />
                            <div className="ml-20">
                                {staticRewardTokenLoading ? (
                                    <Icon name="loading" className="size-40 blue" ariaLabel={t('静态收益加载中')} />
                                ) : (
                                    <div className="size-40 bold-7 black">
                                        {formatAmount(formatDappAmountUnits(staticRewardTokenAmount))}
                                    </div>
                                )}
                                <div className="size-24 black opc-5">{t('一键领取静态收益')}</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="home-page__claim-button home-page__claim-button--primary size-24 bold-7 ml-auto"
                            onClick={handleOpenStaticRewardClaimPopup}
                        >
                            {t('领取')}
                        </button>
                    </div>

                    <div className="home-page__income-dynamic mt-12">
                        <div className="flex-between items-center">
                            <div>
                                <div>
                                    <span className="size-40 bold-7">{dynamicRewardTokenText}</span>
                                    <span className="size-24 bold-7"> {HOME_TOKEN_SYMBOL}</span>
                                </div>
                                <div className="size-24 opc-5 mt-10">{t('一键领取动态收益')}</div>
                            </div>
                            <button
                                type="button"
                                className="home-page__claim-button home-page__claim-button--muted size-24 bold-7"
                                onClick={handleOpenDynamicRewardClaimPopup}
                            >
                                {t('领取')}
                            </button>
                        </div>
                        <button
                            type="button"
                            className="home-page__income-detail blue size-24 mt-16"
                            onClick={handleOpenRewardDetail}
                        >
                            {t('查看领取明细')} &gt;
                        </button>
                    </div>
                </section>

                <div className="home-page__section-title flex-center mt-40">
                    <div className="home-page__section-title-line home-page__section-title-line--left" />
                    <div className="size-32 ml-30 mr-30 tc">{t('协作订单')}</div>
                    <div className="home-page__section-title-line home-page__section-title-line--right" />
                </div>

                <SegmentedTabs
                    options={homeOrderStatusTabs}
                    value={activeOrderStatus}
                    onChange={handleChangeOrderStatus}
                    ariaLabel={t('协作订单状态')}
                    className="home-page__status-tabs mt-28"
                />

                <InfiniteScroll
                    loading={homeOrderLoading}
                    hasMore={homeOrderHasNextPage}
                    onLoadMore={handleLoadMoreHomeOrders}
                    className="home-page__order-scroll mt-30"
                >
                    <div className="home-page__order-list">
                        {homeOrders.length > 0 ? homeOrders.map((order) => (
                            <article className="home-page__order-card mb-20" key={order.id}>
                                <div className="flex justify-between">
                                    <div className="home-page__order-summary">
                                        <div className="size-24 opc-5">{t('协作额度')}</div>
                                        <div className="flex items-center mt-20">
                                            <img src={usdtIcon} className="img-48 flex-none" />
                                            <div className="size-40 bold-6 ml-10">{order.amountText}</div>
                                        </div>
                                        <div className="size-24 opc-5 mt-20">{order.dateText}</div>
                                    </div>

                                    <div className="home-page__order-progress flex-none flex flex-column items-end">
                                        <ProgressBar
                                            currentValue={order.progressCurrentValue}
                                            totalValue={order.progressTotalValue}
                                            className="home-page__order-progress-bar"
                                            aria-label={t('订单进度')}
                                        />
                                        <div className="home-page__order-progress-text size-24 tr mt-10">
                                            {order.progressLoading ? (
                                                <Icon name="loading" className="size-24 blue" ariaLabel={t('订单进度加载中')} />
                                            ) : (
                                                <>
                                                    <span>{order.progressCurrentText}</span>
                                                    <span className="opc-5">
                                                        /{order.progressTotalText}{HOME_TOKEN_SYMBOL}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <div className="size-24 opc-5 tr mt-8">
                                            {t('进度({{multiple}}倍)', { multiple: order.progressMultipleText })}
                                        </div>
                                    </div>
                                </div>

                                {order.status === 'active' ? (
                                    <>
                                        <div className="home-page__order-line mt-20" />

                                        <div className="home-page__order-info mt-28">
                                            {/* 总释放、协作收益等待确认合约返回映射后再展示。 */}
                                            <div className="flex-between items-center size-24">
                                                <span className="opc-5">{t('可领取')}</span>
                                                <div className="flex items-center">
                                                    {order.claimableLoading ? (
                                                        <Icon name="loading" className="size-24 blue mr-20" ariaLabel={t('可领取收益加载中')} />
                                                    ) : (
                                                        <>
                                                            <span className="blue">{order.claimableText}</span>
                                                            {order.canClaim ? (
                                                                <button
                                                                    type="button"
                                                                    className="home-page__order-claim size-24 bold-7 ml-20 home-page__order-claim--active"
                                                                    onClick={() => handleOpenHomeOrderClaim(order)}
                                                                >
                                                                    {t('领取')}
                                                                </button>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : null}
                            </article>
                        )) : (
                            <Empty showGap={false} className="home-page__order-empty" />
                        )}
                    </div>
                </InfiniteScroll>
            </div>

            <ConfirmPopup
                show={showDynamicRewardClaimPopup}
                message={t('确认要提取吗？')}
                onClose={handleCloseDynamicRewardClaimPopup}
                onConfirm={() => void handleConfirmDynamicRewardClaim()}
            />

            <ConfirmPopup
                show={homeOrderClaiming !== undefined}
                message={t('确认要提取吗？')}
                submitting={homeOrderClaimSubmitting}
                onClose={handleCloseHomeOrderClaim}
                onConfirm={() => void handleConfirmHomeOrderClaim()}
            />

            <ConfirmPopup
                show={showStaticRewardClaimPopup}
                message={t('确认要提取吗？')}
                submitting={homeOrderClaimSubmitting}
                onClose={handleCloseStaticRewardClaimPopup}
                onConfirm={() => void handleConfirmStaticRewardClaim()}
            />

            <Popup
                show={showInviteAddressPopup}
                title={<span className="home-page__invite-popup-title size-40 bold-6">{t('确认邀请地址')}</span>}
                onClose={handleCloseInviteAddressPopup}
                closeOnOverlayClick={false}
                contentTheme="gradient-card"
                contentClassName="home-page__invite-popup"
            >
                <div className="home-page__invite-popup-body">
                    <input
                        className="home-page__invite-input size-28 mt-40"
                        type="text"
                        placeholder={t('请输入邀请地址')}
                        aria-label={t('邀请地址')}
                        value={inviteAddressText}
                        onChange={(event) => setInviteAddressText(event.target.value)}
                    />
                    <button
                        type="button"
                        className="home-page__invite-confirm size-28 bold-6 mt-40"
                        onClick={() => void handleConfirmHomeDepositWithInvite()}
                    >
                        {t('确认入金')}
                    </button>
                </div>
            </Popup>
        </section>
    )
}
