import {
    useEffect,
    useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { Address } from 'viem'

import {
    ContractLoading,
} from '@/components/ContractLoading'
import {
    Empty,
} from '@/components/Empty'
import {
    InfiniteScroll,
} from '@/components/InfiniteScroll'
import {
    message,
} from '@/components/Message'
import {
    APP_CONFIG,
    PROJECT_TOKEN,
} from '@/config'
import {
    formatDappAmountUnits,
    parseDappAmountUnits,
    readErc20Balance,
    waitForDappContractDataSync,
} from '@/services/dapp'
import {
    getAigoTokenAddress,
    getUsdtAddress,
    readAigoRouterAmountsOut,
} from '@/services/contracts'
import { getSwapLogs } from '@/features/swap/api.ts'
import type { SwapLog } from '@/features/swap/types.ts'
import { useDappStore } from '@/stores/dapp'
import { formatQuantity } from '@/shared/formatters/formatQuantity.ts'
import usdtIcon from '@/assets/common/usdt.png'
import walletIcon from '@/assets/home/wallet.png'
import bg from '@/assets/swap/bg.png'
import swapIcon from '@/assets/swap/swap.png'

import { submitSwapOrder } from './contract.ts'
import './SwapPage.scss'

type SwapTokenSymbol = (typeof PROJECT_TOKEN)[keyof typeof PROJECT_TOKEN]['symbol']

type SwapToken = {
    symbol: SwapTokenSymbol
    icon: string
}

type SwapRecord = {
    id: number
    fromToken: SwapTokenSymbol
    toToken: SwapTokenSymbol
    fromAmount: string
    toAmount: string
    date: string
}

const appLogoUrl = `${APP_CONFIG.routeBase}brand/app-logo.png`
const TOKEN_BALANCE_EMPTY_TEXT = '0'
const SWAP_QUOTE_DEBOUNCE_MS = 500
const SWAP_RECORD_PAGE_SIZE = 20
const SWAP_BPS_DENOMINATOR = 10000n
const SWAP_SLIPPAGE_BPS = 500n
const EMPTY_SWAP_RECORD_LIST: SwapRecord[] = []

const SWAP_TOKEN_MAP: Record<SwapTokenSymbol, SwapToken> = {
    [PROJECT_TOKEN.platform.symbol]: {
        symbol: PROJECT_TOKEN.platform.symbol,
        icon: appLogoUrl,
    },
    [PROJECT_TOKEN.usdt.symbol]: {
        symbol: PROJECT_TOKEN.usdt.symbol,
        icon: usdtIcon,
    },
}

function calculateSwapMinUsdtOut(quotedUsdt: bigint): bigint {
    return quotedUsdt * (SWAP_BPS_DENOMINATOR - SWAP_SLIPPAGE_BPS) / SWAP_BPS_DENOMINATOR
}

function normalizeSwapQuoteInput(value: string): string {
    const normalizedValue = value.replace(/,/g, '').trim()

    if (normalizedValue.startsWith('.')) return `0${normalizedValue}`
    if (normalizedValue.endsWith('.')) return normalizedValue.slice(0, -1)

    return normalizedValue
}

function mapSwapLogToRecord(log: SwapLog): SwapRecord {
    return {
        id: log.id,
        fromToken: PROJECT_TOKEN.platform.symbol,
        toToken: PROJECT_TOKEN.usdt.symbol,
        fromAmount: `${formatQuantity(log.aigo_amount)} ${PROJECT_TOKEN.platform.symbol}`,
        toAmount: `${formatQuantity(log.usdt_amount)} ${PROJECT_TOKEN.usdt.symbol}`,
        date: log.created_at,
    }
}

function getSwapErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
}

export function SwapPage() {
    const { t } = useTranslation()
    const walletAddress = useDappStore((state) => state.walletAddress)
    const [swapAmount, setSwapAmount] = useState('')
    const [quotedUsdtText, setQuotedUsdtText] = useState(TOKEN_BALANCE_EMPTY_TEXT)
    const [quotedSwapAmountIn, setQuotedSwapAmountIn] = useState(0n)
    const [swapMinUsdtOutAmount, setSwapMinUsdtOutAmount] = useState(0n)
    const [swapSubmitting, setSwapSubmitting] = useState(false)
    const [platformTokenBalanceAmount, setPlatformTokenBalanceAmount] = useState(0n)
    const [platformTokenBalanceRefreshVersion, setPlatformTokenBalanceRefreshVersion] = useState(0)
    const [swapRecords, setSwapRecords] = useState<SwapRecord[]>([])
    const [swapRecordPageNo, setSwapRecordPageNo] = useState(1)
    const [swapRecordLoading, setSwapRecordLoading] = useState(false)
    const [swapRecordHasNextPage, setSwapRecordHasNextPage] = useState(false)
    const [swapRecordRefreshVersion, setSwapRecordRefreshVersion] = useState(0)
    const [platformTokenBalanceText, setPlatformTokenBalanceText] = useState(TOKEN_BALANCE_EMPTY_TEXT)
    const [platformTokenBalanceValue, setPlatformTokenBalanceValue] = useState(TOKEN_BALANCE_EMPTY_TEXT)
    const fromToken = SWAP_TOKEN_MAP[PROJECT_TOKEN.platform.symbol]
    const toToken = SWAP_TOKEN_MAP[PROJECT_TOKEN.usdt.symbol]

    useEffect(() => {
        if (!walletAddress) {
            setPlatformTokenBalanceAmount(0n)
            setPlatformTokenBalanceValue(TOKEN_BALANCE_EMPTY_TEXT)
            setPlatformTokenBalanceText(TOKEN_BALANCE_EMPTY_TEXT)
            return
        }

        let isCurrent = true

        async function loadPlatformTokenBalance() {
            try {
                const balance = await readErc20Balance(
                    getAigoTokenAddress(),
                    walletAddress as Address,
                )

                if (isCurrent) {
                    setPlatformTokenBalanceAmount(balance)
                    setPlatformTokenBalanceValue(formatDappAmountUnits(balance))
                    setPlatformTokenBalanceText(formatQuantity(formatDappAmountUnits(balance)))
                }
            } catch {
                if (isCurrent) {
                    setPlatformTokenBalanceAmount(0n)
                    setPlatformTokenBalanceValue(TOKEN_BALANCE_EMPTY_TEXT)
                    setPlatformTokenBalanceText(TOKEN_BALANCE_EMPTY_TEXT)
                }
            }
        }

        void loadPlatformTokenBalance()

        return () => {
            isCurrent = false
        }
    }, [walletAddress, platformTokenBalanceRefreshVersion])

    useEffect(() => {
        const normalizedSwapAmount = normalizeSwapQuoteInput(swapAmount)

        if (!normalizedSwapAmount) {
            setQuotedSwapAmountIn(0n)
            setSwapMinUsdtOutAmount(0n)
            setQuotedUsdtText(TOKEN_BALANCE_EMPTY_TEXT)
            return
        }

        let swapAmountIn = 0n

        try {
            swapAmountIn = parseDappAmountUnits(normalizedSwapAmount)
        } catch {
            setQuotedSwapAmountIn(0n)
            setSwapMinUsdtOutAmount(0n)
            setQuotedUsdtText(TOKEN_BALANCE_EMPTY_TEXT)
            return
        }

        if (swapAmountIn <= 0n) {
            setQuotedSwapAmountIn(0n)
            setSwapMinUsdtOutAmount(0n)
            setQuotedUsdtText(TOKEN_BALANCE_EMPTY_TEXT)
            return
        }

        setQuotedSwapAmountIn(0n)
        setSwapMinUsdtOutAmount(0n)
        setQuotedUsdtText(TOKEN_BALANCE_EMPTY_TEXT)

        let isCurrent = true

        const quoteTimer = window.setTimeout(() => {
            async function loadSwapQuote() {
                try {
                    const amountsOut = await readAigoRouterAmountsOut(
                        swapAmountIn,
                        [
                            getAigoTokenAddress(),
                            getUsdtAddress(),
                        ],
                    )
                    const quotedUsdt = amountsOut[1] ?? 0n
                    const minUsdtOut = calculateSwapMinUsdtOut(quotedUsdt)

                    if (isCurrent) {
                        setQuotedSwapAmountIn(swapAmountIn)
                        setSwapMinUsdtOutAmount(minUsdtOut)
                        setQuotedUsdtText(formatQuantity(formatDappAmountUnits(minUsdtOut)))
                    }
                } catch {
                    if (isCurrent) {
                        setQuotedSwapAmountIn(0n)
                        setSwapMinUsdtOutAmount(0n)
                        setQuotedUsdtText(TOKEN_BALANCE_EMPTY_TEXT)
                    }
                }
            }

            void loadSwapQuote()
        }, SWAP_QUOTE_DEBOUNCE_MS)

        return () => {
            isCurrent = false
            window.clearTimeout(quoteTimer)
        }
    }, [swapAmount])

    useEffect(() => {
        let isCurrent = true

        async function loadSwapRecords() {
            setSwapRecordLoading(true)

            try {
                const response = await getSwapLogs({
                    page_no: swapRecordPageNo,
                    page_size: SWAP_RECORD_PAGE_SIZE,
                })
                const nextSwapRecords = response.swap_logs.map(mapSwapLogToRecord)

                if (isCurrent) {
                    setSwapRecords((current) => swapRecordPageNo === 1 ? nextSwapRecords : current.concat(nextSwapRecords))
                    setSwapRecordHasNextPage(response.swap_logs.length >= SWAP_RECORD_PAGE_SIZE)
                }
            } catch {
                if (isCurrent) {
                    if (swapRecordPageNo === 1) {
                        setSwapRecords(EMPTY_SWAP_RECORD_LIST)
                    }

                    setSwapRecordHasNextPage(false)
                }
            } finally {
                if (isCurrent) {
                    setSwapRecordLoading(false)
                }
            }
        }

        void loadSwapRecords()

        return () => {
            isCurrent = false
        }
    }, [swapRecordPageNo, swapRecordRefreshVersion])

    function handleUseAllBalance() {
        setSwapAmount(platformTokenBalanceValue)
    }

    function handleLoadMoreSwapRecords() {
        if (swapRecordLoading || !swapRecordHasNextPage) return

        setSwapRecordPageNo((current) => current + 1)
    }

    function validateSwapAmount(): bigint | undefined {
        const normalizedSwapAmount = normalizeSwapQuoteInput(swapAmount)

        if (!normalizedSwapAmount) {
            message.warning(t('请输入金额'))
            return undefined
        }

        let amount = 0n

        try {
            amount = parseDappAmountUnits(normalizedSwapAmount)
        } catch {
            message.warning(t('金额格式错误'))
            return undefined
        }

        if (amount <= 0n) {
            message.warning(t('请输入金额'))
            return undefined
        }

        if (amount > platformTokenBalanceAmount) {
            message.warning(t('余额不足'))
            return undefined
        }

        if (quotedSwapAmountIn !== amount || swapMinUsdtOutAmount <= 0n) {
            message.warning(t('闪兑金额计算中'))
            return undefined
        }

        return amount
    }

    async function handleSubmitSwap() {
        if (!walletAddress) {
            message.warning(t('未获取到钱包地址'))
            return
        }

        if (swapSubmitting) return

        const amount = validateSwapAmount()

        if (!amount) return

        setSwapSubmitting(true)

        try {
            await submitSwapOrder({
                amount,
                minUsdtOut: swapMinUsdtOutAmount,
                walletAddress: walletAddress as Address,
            })
            await waitForDappContractDataSync()

            setSwapAmount('')
            setQuotedSwapAmountIn(0n)
            setSwapMinUsdtOutAmount(0n)
            setQuotedUsdtText(TOKEN_BALANCE_EMPTY_TEXT)
            setPlatformTokenBalanceRefreshVersion((current) => current + 1)
            setSwapRecordPageNo(1)
            setSwapRecordRefreshVersion((current) => current + 1)
            message.success(t('操作成功'))
        } catch (error) {
            message.warning(getSwapErrorMessage(error))
        } finally {
            setSwapSubmitting(false)
        }
    }

    return (
        <section className="swap-page" data-page="swap">
            <ContractLoading show={swapSubmitting} />
            <img src={bg} className="swap-page__bg" />

            <div className="swap-page__content rel pt-68 pr-30 pb-60 pl-30">
                <h1 className="swap-page__title size-56 bold-5 tc">{t('Swap assets')}</h1>

                <div className="swap-page__exchange rel mt-40">
                    <div className="swap-page__exchange-card swap-page__exchange-card--from">
                        <div className="flex-between items-center size-24">
                            <span className="opc-5">{t('从')}</span>
                            <div className="flex items-center">
                                <img src={walletIcon} className="img-24 mr-8" />
                                <span className="bold-5">{platformTokenBalanceText} </span>
                                <span className="opc-5 ml-10">{PROJECT_TOKEN.platform.symbol}</span>
                                <button
                                    type="button"
                                    className="swap-page__max-button blue size-22 ml-8"
                                    onClick={handleUseAllBalance}
                                >
                                    {t('全部')}
                                </button>
                            </div>
                        </div>

                        <div className="flex-between items-center mt-48">
                            <div className="swap-page__token-pill inline-flex items-center">
                                <img src={fromToken.icon} className="img-48 flex-none" />
                                <span className="size-32 ml-10">{fromToken.symbol}</span>
                            </div>
                            <input
                                className="swap-page__amount-input size-48 bold-5 tr flex-1"
                                type="text"
                                inputMode="decimal"
                                placeholder="0"
                                value={swapAmount}
                                onChange={(event) => setSwapAmount(event.target.value)}
                            />
                        </div>
                    </div>

                    <div className="swap-page__switch-icon flex-center">
                        <img src={swapIcon} className="img-108" />
                    </div>

                    <div className="swap-page__exchange-card swap-page__exchange-card--to mt-28">
                        <div className="size-24 opc-5">{t('到')}</div>

                        <div className="flex-between items-center mt-48">
                            <div className="swap-page__token-pill inline-flex items-center">
                                <img src={toToken.icon} className="img-48 flex-none" />
                                <span className="size-32 ml-10">{toToken.symbol}</span>
                            </div>
                            <div className="size-48 bold-5 tr">{quotedUsdtText}</div>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    className="swap-page__submit size-32 bold-5 mt-30"
                    onClick={handleSubmitSwap}
                    disabled={swapSubmitting}
                >
                    {t('闪兑')}
                </button>

                <div className="swap-page__section-title flex-center mt-40">
                    <div className="swap-page__section-title-line swap-page__section-title-line--left" />
                    <div className="size-32 ml-30 mr-30 tc">{t('闪兑记录')}</div>
                    <div className="swap-page__section-title-line swap-page__section-title-line--right" />
                </div>

                <InfiniteScroll
                    loading={swapRecordLoading}
                    hasMore={swapRecordHasNextPage}
                    onLoadMore={handleLoadMoreSwapRecords}
                    className="swap-page__record-scroll mt-40"
                >
                    <div className="swap-page__record-list">
                        {swapRecords.length > 0 ? swapRecords.map((record) => (
                            <article className="swap-page__record-card mb-20" key={record.id}>
                                <div className="flex-between items-center">
                                    <div className="flex items-center">
                                        <div className="swap-page__record-token-stack flex-none">
                                            <img
                                                src={SWAP_TOKEN_MAP[record.fromToken].icon}
                                                className="swap-page__record-token-icon swap-page__record-token-icon--from img-52"
                                            />
                                            <img
                                                src={SWAP_TOKEN_MAP[record.toToken].icon}
                                                className="swap-page__record-token-icon swap-page__record-token-icon--to img-52"
                                            />
                                        </div>
                                        <div className="size-28 bold-6 ml-10">
                                            {record.fromToken}
                                            <span className="ml-8 mr-8">→</span>
                                            {record.toToken}
                                        </div>
                                    </div>
                                    <div className="size-24 opc-5">{record.date}</div>
                                </div>

                                <div className="swap-page__record-line mt-30" />

                                <div className="mt-24">
                                    <div className="flex-between size-24 mb-20">
                                        <span className="opc-5">{t('转出金额')}</span>
                                        <span>{record.fromAmount}</span>
                                    </div>
                                    <div className="flex-between size-24">
                                        <span className="opc-5">{t('转入金额')}</span>
                                        <span className="blue">{record.toAmount}</span>
                                    </div>
                                </div>
                            </article>
                        )) : (
                            <Empty showGap={false} className="swap-page__record-empty" />
                        )}
                    </div>
                </InfiniteScroll>
            </div>
        </section>
    )
}
