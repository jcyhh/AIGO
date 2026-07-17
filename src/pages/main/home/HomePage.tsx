import { useState } from 'react'

import { ProgressBar } from '@/components/ProgressBar'
import { SegmentedTabs } from '@/components/SegmentedTabs'

import bg from '@/assets/home/bg.png'
import aiPic from '@/assets/home/ai-pic.png'
import lightLeft from '@/assets/home/light-left.png'
import lightRight from '@/assets/home/light-right.png'
import walletIcon from '@/assets/home/wallet.png'
import incomeIcon from '@/assets/home/income.png'
import usdtIcon from '@/assets/common/usdt.png'

import './HomePage.scss'

type HomeOrderStatus = 'active' | 'completed'

type HomeOrder = {
    id: number
    status: HomeOrderStatus
    amount: string
    date: string
    progressCurrent: string
    progressTotal: string
    releaseTotal: string
    income: string
    claimable: string
    canClaim: boolean
}

const HOME_ORDER_STATUS_TABS: { label: string; value: HomeOrderStatus }[] = [
    { label: '进行中', value: 'active' },
    { label: '已完成', value: 'completed' },
]

const HOME_ORDER_LIST: HomeOrder[] = [
    {
        id: 1,
        status: 'active',
        amount: '10,000',
        date: '2025.08.26 12:24',
        progressCurrent: '128.88',
        progressTotal: '200',
        releaseTotal: '1,280.8864 Token',
        income: '12,000 Token',
        claimable: '0.0 Token',
        canClaim: false,
    },
    {
        id: 2,
        status: 'active',
        amount: '10,000',
        date: '2025.08.26 12:24',
        progressCurrent: '128.88',
        progressTotal: '200',
        releaseTotal: '1,280.8864 Token',
        income: '12,000 Token',
        claimable: '12.0 Token',
        canClaim: true,
    },
    {
        id: 3,
        status: 'active',
        amount: '10,000',
        date: '2025.08.26 12:24',
        progressCurrent: '128.88',
        progressTotal: '200',
        releaseTotal: '1,280.8864 Token',
        income: '12,000 Token',
        claimable: '12.0 Token',
        canClaim: true,
    },
    {
        id: 4,
        status: 'completed',
        amount: '10,000',
        date: '2025.08.26 12:24',
        progressCurrent: '128.88',
        progressTotal: '200',
        releaseTotal: '1,280.8864 Token',
        income: '12,000 Token',
        claimable: '12.0 Token',
        canClaim: true,
    },
]

export function HomePage() {
    const [activeOrderStatus, setActiveOrderStatus] = useState<HomeOrderStatus>('active')
    const visibleHomeOrders = HOME_ORDER_LIST.filter((order) => order.status === activeOrderStatus)

    return (
        <section className="home-page" data-page="home">
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
                        <div className="home-page__card-title-text size-32 bold-6 ml-20 mr-20">
                            加入生态协作
                        </div>
                        <img
                            src={lightRight}
                            className="home-page__card-title-light flex-none"
                            alt=""
                        />
                    </div>

                    <div className="home-page__quota mt-44 pl-60 pr-60">
                        <div className="flex-between items-center size-24">
                            <div className="opc-5">额度进度</div>
                            <div>
                                <span>128.88</span>
                                <span className="opc-5">/200Token</span>
                            </div>
                        </div>
                        <ProgressBar
                            currentValue="128.88"
                            totalValue="200"
                            className="home-page__progress-bar mt-16"
                            aria-label="额度进度"
                        />
                    </div>

                    <div className="home-page__deposit mt-32 pl-60 pr-60">
                        <div className="flex-between items-center">
                            <div className="size-28">入金金额</div>
                            <div className="flex items-center">
                                <img src={walletIcon} className="img-24 mr-10" />
                                <div className="size-24 ml-8">
                                    <span>52,42 </span>
                                    <span className="opc-5">Token</span>
                                </div>
                                <button
                                    type="button"
                                    className="home-page__deposit-all blue size-22 ml-8"
                                >
                                    全部
                                </button>
                            </div>
                        </div>
                        <input
                            className="home-page__deposit-input mt-24 pl-30 size-28"
                            type="text"
                            inputMode="decimal"
                            placeholder="请输入购买数量"
                            aria-label="入金金额"
                        />
                        <button
                            type="button"
                            className="home-page__deposit-submit size-28 bold-5 mt-30"
                        >
                            确认
                        </button>
                    </div>
                </div>

                <section className="home-page__income-card mt-30">
                    <div className="home-page__income-static flex-between">
                        <div className='flex items-center'>
                            <img src={incomeIcon} className="img-76 flex-none" />
                            <div className="ml-20">
                                <div>
                                    <span className="size-40 bold-7 black">226,567</span>
                                    <span className="size-24 bold-7 black">.086748</span>
                                </div>
                                <div className="size-24 black opc-5">一键领取静态收益</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="home-page__claim-button home-page__claim-button--primary size-24 bold-7 ml-auto"
                        >
                            领取
                        </button>
                    </div>

                    <div className="home-page__income-dynamic mt-12">
                        <div className="flex-between items-center">
                            <div>
                                <div>
                                    <span className="size-40 bold-7">226,567</span>
                                    <span className="size-24 bold-7">.086748</span>
                                </div>
                                <div className="size-24 opc-5 mt-10">一键领取动态收益</div>
                            </div>
                            <button
                                type="button"
                                className="home-page__claim-button home-page__claim-button--muted size-24 bold-7"
                            >
                                领取
                            </button>
                        </div>
                        <div className="home-page__income-detail blue size-24 mt-16">
                            查看领取明细 &gt;
                        </div>
                    </div>
                </section>

                <div className="home-page__section-title flex-center mt-40">
                    <div className="home-page__section-title-line home-page__section-title-line--left" />
                    <div className="size-32 ml-30 mr-30">协作订单</div>
                    <div className="home-page__section-title-line home-page__section-title-line--right" />
                </div>

                <SegmentedTabs
                    options={HOME_ORDER_STATUS_TABS}
                    value={activeOrderStatus}
                    onChange={setActiveOrderStatus}
                    ariaLabel="协作订单状态"
                    className="home-page__status-tabs mt-28"
                />

                <div className="home-page__order-list mt-30">
                    {visibleHomeOrders.map((order) => (
                        <article className="home-page__order-card mb-20" key={order.id}>
                            <div className="flex-between">
                                <div>
                                    <div className="size-24 opc-5">协作额度</div>
                                    <div className="flex items-center mt-20">
                                        <img src={usdtIcon} className="img-48 flex-none" />
                                        <div className="size-40 bold-6 ml-10">{order.amount}</div>
                                    </div>
                                    <div className="size-24 opc-5 mt-20">{order.date}</div>
                                </div>

                                <div className="home-page__order-progress">
                                    <ProgressBar
                                        currentValue={order.progressCurrent}
                                        totalValue={order.progressTotal}
                                        className="home-page__order-progress-bar"
                                        aria-label="订单进度"
                                    />
                                    <div className="size-24 tr mt-8">
                                        <span>{order.progressCurrent}</span>
                                        <span className="opc-5">/{order.progressTotal}Token</span>
                                    </div>
                                    <div className="size-24 opc-5 tr mt-8">进度(3倍)</div>
                                </div>
                            </div>

                            <div className="home-page__order-line mt-20" />

                            <div className="home-page__order-info mt-28">
                                <div className="flex-between size-24 mb-24">
                                    <span className="opc-5">总释放</span>
                                    <span>{order.releaseTotal}</span>
                                </div>
                                <div className="flex-between size-24 mb-24">
                                    <span className="opc-5">协作收益</span>
                                    <span className="red">{order.income}</span>
                                </div>
                                <div className="flex-between items-center size-24">
                                    <span className="opc-5">可领取</span>
                                    <div className="flex items-center">
                                        <span className="blue mr-20">{order.claimable}</span>
                                        <button
                                            type="button"
                                            className={[
                                                'home-page__order-claim',
                                                'size-24',
                                                'bold-7',
                                                order.canClaim
                                                    ? 'home-page__order-claim--active'
                                                    : 'home-page__order-claim--disabled',
                                            ].join(' ')}
                                        >
                                            领取
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
