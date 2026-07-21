import {
    useEffect,
    useState,
    type ChangeEvent,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { Address } from 'viem'

import { ContractLoading } from '@/components/ContractLoading'
import { CountdownTimer } from '@/components/CountdownTimer'
import { message } from '@/components/Message'
import { Popup } from '@/components/Popup'
import {
    APP_CONFIG,
    PROJECT_TOKEN,
} from '@/config'
import {
    formatDappAmountUnits,
    readErc20Balance,
    waitForDappContractDataSync,
} from '@/services/dapp'
import {
    getAigoTokenAddress,
    readAigoProjectAigoUnlockAt,
    readAigoProjectCurrentAigoStakeBalance,
    readAigoProjectMaxAigoStake,
} from '@/services/contracts'
import { useDappStore } from '@/stores/dapp'
import { formatAmount } from '@/shared/formatters/formatAmount.ts'
import bg from '@/assets/saving/bg.png'
import cardBg from '@/assets/saving/card.png'

import {
    parseSavingAmount,
    submitSavingDeposit,
    submitSavingWithdraw,
} from './saving.ts'
import './SavingPage.scss'

type SavingAction = 'deposit' | 'withdraw'

interface SavingPopupConfig {
    title: string
    label: string
    balanceLabel: string
    placeholder: string
}

const TOKEN_BALANCE_EMPTY_TEXT = '--'
const aigoTokenIconUrl = `${APP_CONFIG.routeBase}brand/app-logo.png`

function normalizeSavingAmountInput(value: string): string {
    return value.replace(/,/g, '').trim()
}

function formatSavingAmountText(amount: bigint): string {
    return formatAmount(formatDappAmountUnits(amount))
}

function getSavingErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
}

function getSavingActionBalanceAmount(
    action: SavingAction,
    depositBalanceAmount: bigint,
    withdrawBalanceAmount: bigint,
): bigint {
    return action === 'deposit' ? depositBalanceAmount : withdrawBalanceAmount
}

export function SavingPage() {
    const { t } = useTranslation()
    const walletAddress = useDappStore((state) => state.walletAddress)
    const [activeAction, setActiveAction] = useState<SavingAction | null>(null)
    const [amountValue, setAmountValue] = useState('')
    const [savingTokenBalanceAmount, setSavingTokenBalanceAmount] = useState(0n)
    const [savingStakeBalanceAmount, setSavingStakeBalanceAmount] = useState(0n)
    const [savingMaxStakeAmount, setSavingMaxStakeAmount] = useState(0n)
    const [savingUnlockAt, setSavingUnlockAt] = useState(0n)
    const [savingDataLoaded, setSavingDataLoaded] = useState(false)
    const [savingDataRefreshVersion, setSavingDataRefreshVersion] = useState(0)
    const [savingSubmitting, setSavingSubmitting] = useState(false)
    const [savingCountdownNow, setSavingCountdownNow] = useState(() => Date.now())
    const popupConfig: SavingPopupConfig | null = activeAction === null
        ? null
        : {
            title: activeAction === 'deposit' ? t('存入') : t('提取'),
            label: activeAction === 'deposit' ? t('存入金额') : t('提取金额'),
            balanceLabel: activeAction === 'deposit' ? t('余额') : t('可提'),
            placeholder: t('请输入金额数量'),
        }
    const savingDepositBalanceAmount = (
        savingMaxStakeAmount > 0n && savingTokenBalanceAmount > savingMaxStakeAmount
            ? savingMaxStakeAmount
            : savingTokenBalanceAmount
    )
    const savingActionBalanceAmount = activeAction
        ? getSavingActionBalanceAmount(
            activeAction,
            savingDepositBalanceAmount,
            savingStakeBalanceAmount,
        )
        : 0n
    const savingTotalAmountText = savingDataLoaded
        ? formatSavingAmountText(savingStakeBalanceAmount)
        : TOKEN_BALANCE_EMPTY_TEXT
    const savingActionBalanceText = savingDataLoaded
        ? formatSavingAmountText(savingActionBalanceAmount)
        : TOKEN_BALANCE_EMPTY_TEXT
    const savingCountdownTargetTime = savingUnlockAt > 0n
        ? Number(savingUnlockAt) * 1000
        : undefined
    const showSavingCountdown = savingCountdownTargetTime !== undefined && savingCountdownTargetTime > savingCountdownNow
    const isSavingWithdrawDisabled = savingSubmitting || showSavingCountdown

    useEffect(() => {
        if (!walletAddress) {
            setSavingTokenBalanceAmount(0n)
            setSavingStakeBalanceAmount(0n)
            setSavingMaxStakeAmount(0n)
            setSavingUnlockAt(0n)
            setSavingDataLoaded(false)
            return
        }

        let isCurrent = true

        async function loadSavingContractData() {
            try {
                const [tokenBalanceAmount, maxStakeAmount, stakeBalanceAmount, unlockAt] = await Promise.all([
                    readErc20Balance(
                        getAigoTokenAddress(),
                        walletAddress as Address,
                    ),
                    readAigoProjectMaxAigoStake(),
                    readAigoProjectCurrentAigoStakeBalance(
                        walletAddress as Address,
                    ),
                    readAigoProjectAigoUnlockAt(
                        walletAddress as Address,
                    ),
                ])

                if (isCurrent) {
                    setSavingTokenBalanceAmount(tokenBalanceAmount)
                    setSavingMaxStakeAmount(maxStakeAmount)
                    setSavingStakeBalanceAmount(stakeBalanceAmount)
                    setSavingUnlockAt(unlockAt)
                    setSavingDataLoaded(true)
                }
            } catch (error) {
                console.error('[saving:contract-data] failed', error)

                if (isCurrent) {
                    setSavingTokenBalanceAmount(0n)
                    setSavingStakeBalanceAmount(0n)
                    setSavingMaxStakeAmount(0n)
                    setSavingUnlockAt(0n)
                    setSavingDataLoaded(false)
                }
            }
        }

        void loadSavingContractData()

        return () => {
            isCurrent = false
        }
    }, [walletAddress, savingDataRefreshVersion])

    useEffect(() => {
        if (savingCountdownTargetTime === undefined) return undefined

        const currentTime = Date.now()
        setSavingCountdownNow(currentTime)

        if (savingCountdownTargetTime <= currentTime) return undefined

        const timer = window.setInterval(() => {
            setSavingCountdownNow(Date.now())
        }, 1000)

        return () => {
            window.clearInterval(timer)
        }
    }, [savingCountdownTargetTime])

    function handleOpenPopup(action: SavingAction) {
        setActiveAction(action)
    }

    function handlePopupClose() {
        setActiveAction(null)
        setAmountValue('')
    }

    function handleAmountChange(event: ChangeEvent<HTMLInputElement>) {
        setAmountValue(event.target.value)
    }

    function handleFillAllAmount() {
        if (!activeAction) return

        if (savingActionBalanceAmount <= 0n) {
            message.warning(t('余额不足'))
            return
        }

        setAmountValue(formatDappAmountUnits(savingActionBalanceAmount))
    }

    function validateSavingAmount(): bigint | undefined {
        const amountText = amountValue.trim()

        if (!amountText) {
            message.warning(t('请输入金额'))
            return undefined
        }

        if (!savingDataLoaded) {
            message.warning(t('数据加载中'))
            return undefined
        }

        try {
            const amount = parseSavingAmount(normalizeSavingAmountInput(amountText))

            if (amount <= 0n) {
                message.warning(t('金额格式错误'))
                return undefined
            }

            if (activeAction === 'deposit' && savingMaxStakeAmount > 0n && amount > savingMaxStakeAmount) {
                message.warning(t('超过最大存入数量'))
                return undefined
            }

            if (amount > savingActionBalanceAmount) {
                message.warning(t('余额不足'))
                return undefined
            }

            return amount
        } catch {
            message.warning(t('金额格式错误'))
            return undefined
        }
    }

    async function handleConfirmSavingAction() {
        if (!activeAction || savingSubmitting) return

        if (!walletAddress) {
            message.warning(t('未获取到钱包地址'))
            return
        }

        const amount = validateSavingAmount()
        if (amount === undefined) return

        setSavingSubmitting(true)

        try {
            if (activeAction === 'deposit') {
                await submitSavingDeposit({
                    amount,
                    walletAddress: walletAddress as Address,
                })
            } else {
                await submitSavingWithdraw(amount)
            }

            await waitForDappContractDataSync()

            handlePopupClose()
            setSavingDataRefreshVersion((current) => current + 1)
            message.success(t('操作成功'))
        } catch (error) {
            message.warning(getSavingErrorMessage(error))
        } finally {
            setSavingSubmitting(false)
        }
    }

    return (
        <section className="saving-page" data-page="saving">
            <ContractLoading show={savingSubmitting} />
            <img src={bg} className="saving-page__bg" />

            <div className="saving-page__content rel">
                <section className="saving-page__card tc">
                    <img src={cardBg} className="saving-page__card-bg" />

                    <div className="saving-page__card-content rel flex flex-column items-center justify-center pt-60 pb-60">
                        <div className="saving-page__token-pill inline-flex items-center">
                            <img src={aigoTokenIconUrl} className="img-48 flex-none" />
                            <span className="size-28 bold-6 ml-8">{PROJECT_TOKEN.platform.symbol}</span>
                        </div>

                        <div className="size-56 bold-7 mt-20">{savingTotalAmountText}</div>
                        <div className="size-24 opc-5 mt-20">{t('总存入金额')}</div>
                        <button
                            type="button"
                            className="saving-page__deposit-button size-28 bold-5 mt-30"
                            disabled={savingSubmitting}
                            onClick={() => handleOpenPopup('deposit')}
                        >
                            {t('存入')}
                        </button>

                        {showSavingCountdown ? (
                            <div className="saving-page__countdown-block mt-40">
                                <div className="size-24 opc-5">{t('提取结束倒计时')}</div>
                                <CountdownTimer
                                    targetTime={savingCountdownTargetTime}
                                    timeZone={APP_CONFIG.timeZone}
                                    className="saving-page__countdown mt-30"
                                    aria-label={t('提取结束倒计时')}
                                />
                            </div>
                        ) : null}
                    </div>
                </section>

                <button
                    type="button"
                    className="saving-page__withdraw-button size-32 bold-5 mt-60"
                    disabled={isSavingWithdrawDisabled}
                    onClick={() => handleOpenPopup('withdraw')}
                >
                    {t('提取')}
                </button>
            </div>

            {popupConfig ? (
                <Popup
                    show={Boolean(activeAction)}
                    title={<span className="saving-page__popup-title size-40 bold-6">{popupConfig.title}</span>}
                    onClose={handlePopupClose}
                    closeOnOverlayClick={false}
                    contentTheme="gradient-card"
                >
                    <div className="saving-page__popup-body mt-40">
                        <div className='flex-between'>
                            <label className="size-28">{popupConfig.label}</label>
                            <div className="size-24 opc-5">
                                {popupConfig.balanceLabel}：
                                <span className="white">{savingActionBalanceText}</span>
                                <span className="size-24 word-nowrap">{PROJECT_TOKEN.platform.symbol}</span>
                            </div>
                        </div>

                        <div className="saving-page__amount-input-wrap flex items-center mt-20">
                            <input
                                className="saving-page__amount-input flex-1 size-28"
                                type="text"
                                inputMode="decimal"
                                placeholder={popupConfig.placeholder}
                                value={amountValue}
                                onChange={handleAmountChange}
                                disabled={savingSubmitting}
                            />
                            <button
                                type="button"
                                className="saving-page__all-button size-24 blue"
                                disabled={savingSubmitting}
                                onClick={handleFillAllAmount}
                            >
                                {t('全部')}
                            </button>
                        </div>

                        <button
                            type="button"
                            className="saving-page__popup-confirm size-28 bold-6 mt-30"
                            disabled={savingSubmitting}
                            onClick={handleConfirmSavingAction}
                        >
                            {t('确认')}
                        </button>
                    </div>
                </Popup>
            ) : null}
        </section>
    )
}
