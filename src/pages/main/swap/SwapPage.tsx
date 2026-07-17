import { useState } from 'react'

import { APP_CONFIG } from '@/config'
import usdtIcon from '@/assets/common/usdt.png'
import walletIcon from '@/assets/home/wallet.png'
import bg from '@/assets/swap/bg.png'
import swapIcon from '@/assets/swap/swap.png'

import './SwapPage.scss'

type SwapTokenSymbol = 'Token' | 'USDT'

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
const SWAP_AVAILABLE_BALANCE = '52,42'

const SWAP_TOKEN_MAP: Record<SwapTokenSymbol, SwapToken> = {
    Token: {
        symbol: 'Token',
        icon: appLogoUrl,
    },
    USDT: {
        symbol: 'USDT',
        icon: usdtIcon,
    },
}

const SWAP_RECORD_LIST: SwapRecord[] = [
    {
        id: 1,
        fromToken: 'Token',
        toToken: 'USDT',
        fromAmount: '10,000 Token',
        toAmount: '880,000 USDT',
        date: '2026.04.26 12:08:44',
    },
    {
        id: 2,
        fromToken: 'Token',
        toToken: 'USDT',
        fromAmount: '10,000 Token',
        toAmount: '880,000 USDT',
        date: '2026.04.26 12:08:44',
    },
    {
        id: 3,
        fromToken: 'Token',
        toToken: 'USDT',
        fromAmount: '10,000 Token',
        toAmount: '880,000 USDT',
        date: '2026.04.26 12:08:44',
    },
]

export function SwapPage() {
    const [swapAmount, setSwapAmount] = useState('')
    const fromToken = SWAP_TOKEN_MAP.Token
    const toToken = SWAP_TOKEN_MAP.USDT

    function handleUseAllBalance() {
        setSwapAmount(SWAP_AVAILABLE_BALANCE)
    }

    return (
        <section className="swap-page" data-page="swap">
            <img src={bg} className="swap-page__bg" />

            <div className="swap-page__content rel pt-68 pr-30 pb-60 pl-30">
                <h1 className="swap-page__title size-56 bold-5 tc">Swap assets</h1>

                <div className="swap-page__exchange rel mt-40">
                    <div className="swap-page__exchange-card swap-page__exchange-card--from">
                        <div className="flex-between items-center size-24">
                            <span className="opc-5">从</span>
                            <div className="flex items-center">
                                <img src={walletIcon} className="img-24 mr-8" />
                                <span className="bold-5">{SWAP_AVAILABLE_BALANCE} </span>
                                <span className="opc-5 ml-10">Token</span>
                                <button
                                    type="button"
                                    className="swap-page__max-button blue size-22 ml-8"
                                    onClick={handleUseAllBalance}
                                >
                                    全部
                                </button>
                            </div>
                        </div>

                        <div className="flex-between items-center mt-48">
                            <div className="swap-page__token-pill inline-flex items-center">
                                <img src={fromToken.icon} className="img-48 flex-none" />
                                <span className="size-32 ml-10">{fromToken.symbol}</span>
                            </div>
                            <input
                                className="swap-page__amount-input size-48 bold-5 tr"
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
                        <div className="size-24 opc-5">到</div>

                        <div className="flex-between items-center mt-48">
                            <div className="swap-page__token-pill inline-flex items-center">
                                <img src={toToken.icon} className="img-48 flex-none" />
                                <span className="size-32 ml-10">{toToken.symbol}</span>
                            </div>
                            <div className="size-48 bold-5 tr">0</div>
                        </div>
                    </div>
                </div>

                <button type="button" className="swap-page__submit size-32 bold-5 mt-30">
                    闪兑
                </button>

                <div className="swap-page__section-title flex-center mt-40">
                    <div className="swap-page__section-title-line swap-page__section-title-line--left" />
                    <div className="size-32 ml-30 mr-30">闪兑记录</div>
                    <div className="swap-page__section-title-line swap-page__section-title-line--right" />
                </div>

                <div className="swap-page__record-list mt-40">
                    {SWAP_RECORD_LIST.map((record) => (
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
                                    <span className="opc-5">转出金额</span>
                                    <span>{record.fromAmount}</span>
                                </div>
                                <div className="flex-between size-24">
                                    <span className="opc-5">转入金额</span>
                                    <span className="blue">{record.toAmount}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
