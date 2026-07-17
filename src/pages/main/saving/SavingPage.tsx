import { useState, type ChangeEvent } from 'react'

import { CountdownTimer } from '@/components/CountdownTimer'
import { Popup } from '@/components/Popup'
import { APP_CONFIG } from '@/config'
import tokenIcon from '@/assets/common/usdt.png'
import bg from '@/assets/saving/bg.png'
import cardBg from '@/assets/saving/card.png'

import './SavingPage.scss'

const SAVING_TOTAL_AMOUNT = '126,567.086748'
const SAVING_WITHDRAW_END_TIME = '2026-07-23T20:48:56+08:00'
const SAVING_AVAILABLE_TOKEN = '3,343,967'

type SavingAction = 'deposit' | 'withdraw'

interface SavingPopupConfig {
    title: string
    label: string
    balanceLabel: string
    placeholder: string
}

const SAVING_POPUP_CONFIG: Record<SavingAction, SavingPopupConfig> = {
    deposit: {
        title: '存入',
        label: '存入金额',
        balanceLabel: '我的Token',
        placeholder: '请输入金额数量',
    },
    withdraw: {
        title: '提取',
        label: '提取金额',
        balanceLabel: '可提Token',
        placeholder: '请输入金额数量',
    },
}

export function SavingPage() {
    const [activeAction, setActiveAction] = useState<SavingAction | null>(null)
    const [amountValue, setAmountValue] = useState('')
    const popupConfig = activeAction
        ? SAVING_POPUP_CONFIG[activeAction]
        : null

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
        setAmountValue(SAVING_AVAILABLE_TOKEN)
    }

    return (
        <section className="saving-page" data-page="saving">
            <img src={bg} className="saving-page__bg" />

            <div className="saving-page__content rel">
                <section className="saving-page__card tc">
                    <img src={cardBg} className="saving-page__card-bg" />

                    <div className="saving-page__card-content rel pt-60">
                        <div className="saving-page__token-pill inline-flex items-center">
                            <img src={tokenIcon} className="img-48 flex-none" />
                            <span className="size-28 bold-6 ml-8">Token</span>
                        </div>

                        <div className="size-56 bold-7 mt-20">{SAVING_TOTAL_AMOUNT}</div>
                        <div className="size-24 opc-5 mt-20">总存入金额</div>
                        <button
                            type="button"
                            className="saving-page__deposit-button size-28 bold-5 mt-30"
                            onClick={() => handleOpenPopup('deposit')}
                        >
                            存入
                        </button>

                        <div className="size-24 opc-5 mt-40">提取结束倒计时</div>
                        <CountdownTimer
                            targetTime={SAVING_WITHDRAW_END_TIME}
                            timeZone={APP_CONFIG.timeZone}
                            className="saving-page__countdown mt-30"
                            aria-label="提取结束倒计时"
                        />
                    </div>
                </section>

                <button
                    type="button"
                    className="saving-page__withdraw-button size-32 bold-5 mt-60"
                    onClick={() => handleOpenPopup('withdraw')}
                >
                    提取
                </button>
            </div>

            {popupConfig ? (
                <Popup
                    show={Boolean(activeAction)}
                    title={<span className="saving-page__popup-title size-40 bold-6">{popupConfig.title}</span>}
                    onClose={handlePopupClose}
                    closeOnOverlayClick={false}
                    contentTheme="gradient-card"
                    contentClassName="saving-page__amount-popup"
                >
                    <div className="saving-page__popup-body mt-40">
                        <label className="size-28">{popupConfig.label}</label>

                        <div className="saving-page__amount-input-wrap flex items-center mt-20">
                            <input
                                className="saving-page__amount-input flex-1 size-28"
                                type="text"
                                inputMode="decimal"
                                placeholder={popupConfig.placeholder}
                                value={amountValue}
                                onChange={handleAmountChange}
                            />
                            <span className="size-24 word-nowrap">Token</span>
                        </div>

                        <div className="flex justify-between items-center mt-16">
                            <div className="size-24 opc-5">
                                {popupConfig.balanceLabel}：
                                <span className="white">{SAVING_AVAILABLE_TOKEN}</span>
                            </div>
                            <button
                                type="button"
                                className="saving-page__all-button size-24 blue"
                                onClick={handleFillAllAmount}
                            >
                                全部
                            </button>
                        </div>

                        <button
                            type="button"
                            className="saving-page__popup-confirm size-28 bold-6 mt-30"
                            onClick={handlePopupClose}
                        >
                            确认
                        </button>
                    </div>
                </Popup>
            ) : null}
        </section>
    )
}
