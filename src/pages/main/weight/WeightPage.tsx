import {
    useCallback,
    useEffect,
    useState,
    type ChangeEvent,
} from 'react'
import { useTranslation } from 'react-i18next'

import { ContractLoading } from '@/components/ContractLoading'
import { Empty } from '@/components/Empty'
import { InfiniteScroll } from '@/components/InfiniteScroll'
import { message } from '@/components/Message'
import { usePageRefresh } from '@/components/PagePullRefresh'
import { Popup } from '@/components/Popup'
import { getAssetLogs } from '@/features/asset/api.ts'
import type { AssetLog } from '@/features/asset/types.ts'
import { getCurrentUser } from '@/features/user/api.ts'
import {
    parseDappAmountUnits,
    waitForDappContractDataSync,
} from '@/services/dapp'
import { formatAmount } from '@/shared/formatters/formatAmount.ts'
import { useLatestRequest } from '@/shared/hooks/useLatestRequest.ts'
import bg from '@/assets/weight/bg.png'
import tabActive from '@/assets/weight/tab-act.png'
import tabInactive from '@/assets/weight/tab.png'

import {
    formatWeightClaimAllAmount,
    normalizeWeightClaimAmountInput,
    submitWeightClaim,
    type WeightClaimCurrency,
} from './claim.ts'
import './WeightPage.scss'

type WeightAssetType = 'xo' | 'weight'
type WeightBalanceField = 'balance_xo' | 'dividend_token'
type WeightAssetCurrency = WeightClaimCurrency | 'dividend_token'

interface WeightAssetConfigBase {
    titleKey: string
    symbolKey: string
    ccy: WeightAssetCurrency
    balanceField: WeightBalanceField
    insufficientMessageKey: string
    supportsAssetLogs: boolean
    showClaimBalanceUnit: boolean
}

interface WeightClaimableAssetConfig extends WeightAssetConfigBase {
    ccy: WeightClaimCurrency
    supportsClaim: true
}

interface WeightReadonlyAssetConfig extends WeightAssetConfigBase {
    ccy: Exclude<WeightAssetCurrency, WeightClaimCurrency>
    supportsClaim: false
}

type WeightAssetConfig = WeightClaimableAssetConfig | WeightReadonlyAssetConfig

interface WeightAssetBalance {
    value: string
    amount: bigint
    text: string
}

const WEIGHT_BALANCE_EMPTY_TEXT = '--'
const WEIGHT_ASSET_LOG_PAGE_SIZE = 20
const WEIGHT_ASSET_TYPE_LIST: readonly WeightAssetType[] = ['xo', 'weight']
const WEIGHT_ASSET_CONFIG: Record<WeightAssetType, WeightAssetConfig> = {
    xo: {
        titleKey: 'weight.asset.xo',
        symbolKey: 'weight.asset.xo',
        ccy: 'balance_xo',
        balanceField: 'balance_xo',
        insufficientMessageKey: 'weight.claim.insufficientXo',
        supportsClaim: true,
        supportsAssetLogs: true,
        showClaimBalanceUnit: true,
    },
    weight: {
        titleKey: 'weight.asset.weight',
        symbolKey: 'weight.asset.weight',
        ccy: 'dividend_token',
        balanceField: 'dividend_token',
        insufficientMessageKey: 'weight.claim.insufficientWeight',
        supportsClaim: false,
        supportsAssetLogs: false,
        showClaimBalanceUnit: false,
    },
}

function createEmptyWeightAssetBalance(): WeightAssetBalance {
    return {
        value: '',
        amount: 0n,
        text: WEIGHT_BALANCE_EMPTY_TEXT,
    }
}

function createEmptyWeightAssetBalances(): Record<WeightAssetType, WeightAssetBalance> {
    return {
        xo: createEmptyWeightAssetBalance(),
        weight: createEmptyWeightAssetBalance(),
    }
}

function createWeightAssetBalance(value: string): WeightAssetBalance {
    return {
        value,
        amount: parseDappAmountUnits(value),
        text: formatAmount(value),
    }
}

function formatWeightAssetLogAmount(
    record: AssetLog,
    symbolText: string,
): string {
    const amountSign = record.is_inc === 1 ? '+' : '-'

    return `${amountSign}${formatAmount(record.amount)} ${symbolText}`
}

function getWeightAssetLogAmountClassName(record: AssetLog): string {
    return record.is_inc === 1 ? 'size-28 bold-5 blue' : 'size-28 bold-5'
}

export function WeightPage() {
    const { t } = useTranslation()
    const [activeWeightAssetType, setActiveWeightAssetType] = useState<WeightAssetType>('xo')
    const [weightBalances, setWeightBalances] = useState(createEmptyWeightAssetBalances)
    const [weightAssetLogPageNo, setWeightAssetLogPageNo] = useState(1)
    const [weightAssetLogs, setWeightAssetLogs] = useState<AssetLog[]>([])
    const [weightAssetLogLoading, setWeightAssetLogLoading] = useState(false)
    const [weightAssetLogHasNextPage, setWeightAssetLogHasNextPage] = useState(false)
    const [showWeightClaimPopup, setShowWeightClaimPopup] = useState(false)
    const [weightClaimAmountText, setWeightClaimAmountText] = useState('')
    const [weightClaimSubmitting, setWeightClaimSubmitting] = useState(false)
    const {
        createLatestRequestGuard: createWeightBalanceRequestGuard,
        invalidateLatestRequest: invalidateWeightBalanceRequest,
    } = useLatestRequest()
    const {
        createLatestRequestGuard: createWeightAssetLogRequestGuard,
        invalidateLatestRequest: invalidateWeightAssetLogRequest,
    } = useLatestRequest()
    const activeWeightAssetConfig = WEIGHT_ASSET_CONFIG[activeWeightAssetType]
    const activeWeightAssetBalance = weightBalances[activeWeightAssetType]
    const activeWeightAssetSymbolText = t(activeWeightAssetConfig.symbolKey)

    const loadWeightBalances = useCallback(async () => {
        const isCurrent = createWeightBalanceRequestGuard()

        try {
            const user = await getCurrentUser()

            if (isCurrent()) {
                setWeightBalances({
                    xo: createWeightAssetBalance(user.balance_xo),
                    weight: createWeightAssetBalance(user.dividend_token),
                })
            }
        } catch {
            if (isCurrent()) {
                setWeightBalances(createEmptyWeightAssetBalances())
            }
        }
    }, [createWeightBalanceRequestGuard])

    const loadWeightAssetLogs = useCallback(async (
        assetType: WeightAssetType,
        pageNo: number,
    ) => {
        if (!WEIGHT_ASSET_CONFIG[assetType].supportsAssetLogs) {
            invalidateWeightAssetLogRequest()
            setWeightAssetLogs([])
            setWeightAssetLogHasNextPage(false)
            setWeightAssetLogLoading(false)
            return
        }

        const isCurrent = createWeightAssetLogRequestGuard()

        setWeightAssetLogLoading(true)

        try {
            const response = await getAssetLogs({
                page_no: pageNo,
                page_size: WEIGHT_ASSET_LOG_PAGE_SIZE,
                ccy: WEIGHT_ASSET_CONFIG[assetType].ccy,
            })

            if (isCurrent()) {
                setWeightAssetLogs((current) => pageNo === 1 ? response.asset_logs : current.concat(response.asset_logs))
                setWeightAssetLogHasNextPage(response.asset_logs.length >= WEIGHT_ASSET_LOG_PAGE_SIZE)
            }
        } catch {
            if (isCurrent()) {
                if (pageNo === 1) {
                    setWeightAssetLogs([])
                }

                setWeightAssetLogHasNextPage(false)
            }
        } finally {
            if (isCurrent()) {
                setWeightAssetLogLoading(false)
            }
        }
    }, [createWeightAssetLogRequestGuard, invalidateWeightAssetLogRequest])

    const refreshWeightPageData = useCallback(async () => {
        setWeightAssetLogPageNo(1)

        const refreshTasks = [loadWeightBalances()]

        if (activeWeightAssetConfig.supportsAssetLogs) {
            refreshTasks.push(loadWeightAssetLogs(activeWeightAssetType, 1))
        } else {
            invalidateWeightAssetLogRequest()
            setWeightAssetLogs([])
            setWeightAssetLogHasNextPage(false)
            setWeightAssetLogLoading(false)
        }

        await Promise.all(refreshTasks)
    }, [
        activeWeightAssetConfig.supportsAssetLogs,
        activeWeightAssetType,
        invalidateWeightAssetLogRequest,
        loadWeightAssetLogs,
        loadWeightBalances,
    ])

    const handleWeightPullRefresh = useCallback(() => refreshWeightPageData(), [refreshWeightPageData])

    usePageRefresh(handleWeightPullRefresh, !weightClaimSubmitting)

    useEffect(() => {
        void refreshWeightPageData()

        return () => {
            invalidateWeightBalanceRequest()
            invalidateWeightAssetLogRequest()
        }
    }, [invalidateWeightAssetLogRequest, invalidateWeightBalanceRequest, refreshWeightPageData])

    useEffect(() => {
        if (weightAssetLogPageNo === 1) return undefined

        void loadWeightAssetLogs(activeWeightAssetType, weightAssetLogPageNo)

        return undefined
    }, [activeWeightAssetType, loadWeightAssetLogs, weightAssetLogPageNo])

    function handleChangeWeightAssetType(assetType: WeightAssetType) {
        if (assetType === activeWeightAssetType) return

        setActiveWeightAssetType(assetType)
        setWeightAssetLogPageNo(1)

        if (!WEIGHT_ASSET_CONFIG[assetType].supportsAssetLogs) {
            invalidateWeightAssetLogRequest()
        }

        setWeightAssetLogs([])
        setWeightAssetLogHasNextPage(false)
        setShowWeightClaimPopup(false)
        setWeightClaimAmountText('')
    }

    function handleLoadMoreWeightAssetLogs() {
        if (weightAssetLogLoading || !weightAssetLogHasNextPage) return

        setWeightAssetLogPageNo((current) => current + 1)
    }

    function handleOpenWeightClaimPopup() {
        if (!activeWeightAssetConfig.supportsClaim) return

        if (activeWeightAssetBalance.amount <= 0n) {
            message.warning(t(activeWeightAssetConfig.insufficientMessageKey))
            return
        }

        setShowWeightClaimPopup(true)
    }

    function handleCloseWeightClaimPopup() {
        if (weightClaimSubmitting) return

        setShowWeightClaimPopup(false)
        setWeightClaimAmountText('')
    }

    function handleWeightClaimAmountChange(event: ChangeEvent<HTMLInputElement>) {
        setWeightClaimAmountText(event.target.value)
    }

    function handleUseAllWeightClaimAmount() {
        setWeightClaimAmountText(formatWeightClaimAllAmount(activeWeightAssetBalance.value))
    }

    function validateWeightClaimAmount(): string | undefined {
        const normalizedAmountText = normalizeWeightClaimAmountInput(weightClaimAmountText)

        if (!normalizedAmountText) {
            message.warning(t('请输入数量'))
            return undefined
        }

        let amount = 0n

        try {
            amount = parseDappAmountUnits(normalizedAmountText)
        } catch {
            message.warning(t('数量格式错误'))
            return undefined
        }

        if (amount <= 0n) {
            message.warning(t('请输入数量'))
            return undefined
        }

        if (amount > activeWeightAssetBalance.amount) {
            message.warning(t('余额不足'))
            return undefined
        }

        return normalizedAmountText
    }

    function getWeightClaimErrorMessage(error: unknown): string {
        if (error instanceof Error) return error.message
        return String(error)
    }

    async function handleConfirmWeightClaim() {
        if (weightClaimSubmitting) return
        if (!activeWeightAssetConfig.supportsClaim) return

        const amountText = validateWeightClaimAmount()

        if (!amountText) return

        setWeightClaimSubmitting(true)

        try {
            await submitWeightClaim({
                amountText,
                ccy: activeWeightAssetConfig.ccy,
            })
            await waitForDappContractDataSync()

            setShowWeightClaimPopup(false)
            setWeightClaimAmountText('')
            await refreshWeightPageData()
            message.success(t('操作成功'))
        } catch (error) {
            message.warning(getWeightClaimErrorMessage(error))
        } finally {
            setWeightClaimSubmitting(false)
        }
    }

    return (
        <section className="weight-page" data-page="weight">
            <ContractLoading show={weightClaimSubmitting} />
            <img src={bg} className="weight-page__bg" alt="" />

            <div className="weight-page__content rel pt-60 pr-30 pb-60 pl-30">
                <div className="weight-page__tabs flex-center gap-30">
                    {WEIGHT_ASSET_TYPE_LIST.map((assetType) => {
                        const config = WEIGHT_ASSET_CONFIG[assetType]
                        const isActive = assetType === activeWeightAssetType
                        const tabClassName = isActive
                            ? 'weight-page__tab weight-page__tab--active flex-center'
                            : 'weight-page__tab flex-center'

                        return (
                            <button
                                type="button"
                                className={tabClassName}
                                aria-pressed={isActive}
                                onClick={() => handleChangeWeightAssetType(assetType)}
                                key={assetType}
                            >
                                <img src={isActive ? tabActive : tabInactive} className="weight-page__tab-bg" alt="" />
                                <span className="weight-page__tab-label size-28 bold-6">{t(config.titleKey)}</span>
                            </button>
                        )
                    })}
                </div>

                <section className="weight-page__summary tc mt-100">
                    <div className="size-56 bold-7">{activeWeightAssetBalance.text}</div>
                    <div className="size-24 opc-5 mt-20">{t('余额')}</div>
                    {activeWeightAssetConfig.supportsClaim ? (
                        <button
                            type="button"
                            className="weight-page__extract-button size-24 bold-7 mt-30"
                            onClick={handleOpenWeightClaimPopup}
                        >
                            {t('提取')}
                        </button>
                    ) : null}
                </section>

                {activeWeightAssetConfig.supportsAssetLogs ? (
                    <>
                        <div className="weight-page__section-title flex-center mt-56">
                            <div className="weight-page__section-title-line weight-page__section-title-line--left" />
                            <div className="size-32 ml-30 mr-30 tc">{t('流水明细')}</div>
                            <div className="weight-page__section-title-line weight-page__section-title-line--right" />
                        </div>

                        <InfiniteScroll
                            loading={weightAssetLogLoading}
                            hasMore={weightAssetLogHasNextPage}
                            onLoadMore={handleLoadMoreWeightAssetLogs}
                            className="weight-page__record-scroll mt-40"
                        >
                            <div className="weight-page__record-list">
                                {weightAssetLogs.length > 0 ? weightAssetLogs.map((record) => (
                                    <article
                                        className="weight-page__record-card flex-between items-center mb-20"
                                        key={record.id}
                                    >
                                        <div>
                                            <div className="size-28 bold-5">{record.content}</div>
                                            <div className="size-24 opc-5 mt-18">{record.created_at}</div>
                                        </div>
                                        <div className="tr">
                                            <div className={getWeightAssetLogAmountClassName(record)}>
                                                {formatWeightAssetLogAmount(record, activeWeightAssetSymbolText)}
                                            </div>
                                            <div className="size-24 opc-5 mt-18">{t('金额')}</div>
                                        </div>
                                    </article>
                                )) : (
                                    <Empty showGap={false} className="pt-60 pb-60" />
                                )}
                            </div>
                        </InfiniteScroll>
                    </>
                ) : null}
            </div>

            <Popup
                show={showWeightClaimPopup}
                title={<span className="weight-page__claim-popup-title size-40 bold-6">{t('提取')}</span>}
                onClose={handleCloseWeightClaimPopup}
                closeOnOverlayClick={false}
                contentTheme="gradient-card"
                contentClassName="weight-page__claim-popup"
            >
                <div className="weight-page__claim-popup-body mt-40">
                    <div className="flex-between">
                        <label className="size-28">{t('提取数量')}</label>
                        <div className="size-24 opc-5">
                            {t('余额：')}
                            <span className="white">{activeWeightAssetBalance.text}</span>
                            {activeWeightAssetConfig.showClaimBalanceUnit ? activeWeightAssetSymbolText : null}
                        </div>
                    </div>

                    <div className="weight-page__claim-input-wrap flex items-center mt-20">
                        <input
                            className="weight-page__claim-input flex-1 size-28"
                            type="text"
                            inputMode="decimal"
                            placeholder={t('请输入提取数量')}
                            value={weightClaimAmountText}
                            onChange={handleWeightClaimAmountChange}
                        />
                        <button
                            type="button"
                            className="weight-page__claim-all-button size-24 blue"
                            onClick={handleUseAllWeightClaimAmount}
                        >
                            {t('全部')}
                        </button>
                    </div>

                    <button
                        type="button"
                        className="weight-page__claim-confirm size-28 bold-6 mt-30"
                        onClick={() => void handleConfirmWeightClaim()}
                        disabled={weightClaimSubmitting}
                    >
                        {t('确认')}
                    </button>
                </div>
            </Popup>
        </section>
    )
}
