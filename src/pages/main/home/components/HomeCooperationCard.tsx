import { useTranslation } from 'react-i18next'

import { Icon } from '@/components/Icon'
import { ProgressBar } from '@/components/ProgressBar'
import { formatDappAmountUnits } from '@/services/dapp'
import { formatAmount } from '@/shared/formatters/formatAmount.ts'

import lightLeft from '@/assets/home/light-left.png'
import lightRight from '@/assets/home/light-right.png'
import walletIcon from '@/assets/home/wallet.png'

import { HOME_TOKEN_SYMBOL } from '../constants.ts'
import type { HomeQuotaProgress } from '../types.ts'

interface HomeCooperationCardProps {
    quotaProgress: HomeQuotaProgress
    depositMinimum: bigint
    depositMaximum: bigint
    depositAmountText: string
    usdtBalanceText: string
    onUseAllDepositAmount: () => void
    onDepositAmountChange: (value: string) => void
    onSubmitDeposit: () => void
}

export function HomeCooperationCard(props: HomeCooperationCardProps) {
    const {
        quotaProgress,
        depositMinimum,
        depositMaximum,
        depositAmountText,
        usdtBalanceText,
        onUseAllDepositAmount,
        onDepositAmountChange,
        onSubmitDeposit,
    } = props
    const { t } = useTranslation()
    const homeDepositPlaceholder = t('单次入金 {{min}}～{{max}}', {
        min: formatDappAmountUnits(depositMinimum),
        max: formatDappAmountUnits(depositMaximum),
    })

    return (
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
                    {quotaProgress.loading ? (
                        <div className="flex items-center">
                            <Icon name="loading" className="size-24 blue" ariaLabel={t('已入金额度加载中')} />
                            <span className="opc-5 ml-8 mr-8">/</span>
                            <Icon name="loading" className="size-24 blue" ariaLabel={t('总额度加载中')} />
                            <span className="opc-5">{HOME_TOKEN_SYMBOL}</span>
                        </div>
                    ) : (
                        <div>
                            <span>{formatAmount(quotaProgress.amount)}</span>
                            <span className="opc-5">/{formatAmount(quotaProgress.totalAmount)}{HOME_TOKEN_SYMBOL}</span>
                        </div>
                    )}
                </div>
                <ProgressBar
                    currentValue={quotaProgress.amount}
                    totalValue={quotaProgress.totalAmount}
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
                            onClick={onUseAllDepositAmount}
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
                    value={depositAmountText}
                    onChange={(event) => onDepositAmountChange(event.target.value)}
                />
                <button
                    type="button"
                    className="home-page__deposit-submit size-28 bold-5 mt-30"
                    onClick={onSubmitDeposit}
                >
                    {t('确认')}
                </button>
            </div>
        </div>
    )
}
