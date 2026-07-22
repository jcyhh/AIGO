import { useTranslation } from 'react-i18next'

import { Icon } from '@/components/Icon'
import { ProgressBar } from '@/components/ProgressBar'

import usdtIcon from '@/assets/common/usdt.png'

import { HOME_TOKEN_SYMBOL } from '../constants.ts'
import type { HomeOrder } from '../types.ts'

interface HomeOrderCardProps {
    order: HomeOrder
    onClaim: (order: HomeOrder) => void
}

export function HomeOrderCard(props: HomeOrderCardProps) {
    const {
        order,
        onClaim,
    } = props
    const { t } = useTranslation()

    return (
        <article className="home-page__order-card mb-20">
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
                                                onClick={() => onClaim(order)}
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
    )
}
