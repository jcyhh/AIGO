import { useTranslation } from 'react-i18next'

import { Icon } from '@/components/Icon'
import { formatDappAmountUnits } from '@/services/dapp'
import { formatAmount } from '@/shared/formatters/formatAmount.ts'

import incomeIcon from '@/assets/home/income.png'

import { HOME_TOKEN_SYMBOL } from '../constants.ts'

interface HomeIncomeCardProps {
    staticRewardTokenAmount: bigint
    staticRewardTokenLoading: boolean
    dynamicRewardTokenText: string
    onOpenStaticRewardClaimPopup: () => void
    onOpenDynamicRewardClaimPopup: () => void
    onOpenRewardDetail: () => void
}

export function HomeIncomeCard(props: HomeIncomeCardProps) {
    const {
        staticRewardTokenAmount,
        staticRewardTokenLoading,
        dynamicRewardTokenText,
        onOpenStaticRewardClaimPopup,
        onOpenDynamicRewardClaimPopup,
        onOpenRewardDetail,
    } = props
    const { t } = useTranslation()

    return (
        <section className="home-page__income-card mt-30 animate__animated animate__slideInLeft">
            <div className="home-page__income-static flex-between">
                <div className="flex items-center">
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
                    onClick={onOpenStaticRewardClaimPopup}
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
                        onClick={onOpenDynamicRewardClaimPopup}
                    >
                        {t('领取')}
                    </button>
                </div>
                <button
                    type="button"
                    className="home-page__income-detail blue size-24 mt-16"
                    onClick={onOpenRewardDetail}
                >
                    {t('查看领取明细')} &gt;
                </button>
            </div>
        </section>
    )
}
