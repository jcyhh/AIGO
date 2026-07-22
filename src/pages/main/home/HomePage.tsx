import {
    useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
    isAddress,
    type Address,
} from 'viem'

import { ConfirmPopup } from '@/components/ConfirmPopup'
import { ContractLoading } from '@/components/ContractLoading'
import { Empty } from '@/components/Empty'
import { InfiniteScroll } from '@/components/InfiniteScroll'
import { message } from '@/components/Message'
import { Popup } from '@/components/Popup'
import { SegmentedTabs } from '@/components/SegmentedTabs'
import { ROUTE_PATH, useAppNavigate } from '@/router'
import {
    formatDappAmountUnits,
    waitForDappContractDataSync,
} from '@/services/dapp'
import {
    writeAigoProjectClaimDynamicReward,
    writeAigoProjectClaimStaticRewards,
} from '@/services/contracts'
import { getReferralCode } from '@/services/storage'
import { useDappStore } from '@/stores/dapp'
import { useUserStore } from '@/stores/user'

import bg from '@/assets/home/bg.png'
import aiPic from '@/assets/home/ai-pic.png'

import { HomeCooperationCard } from './components/HomeCooperationCard.tsx'
import { HomeIncomeCard } from './components/HomeIncomeCard.tsx'
import { HomeOrderCard } from './components/HomeOrderCard.tsx'
import { HOME_ORDER_STATUS_LIST } from './constants.ts'
import {
    parseHomeDepositAmount,
    submitHomeDepositOrder,
} from './deposit.ts'
import type {
    HomeOrder,
    HomeOrderStatus,
} from './types.ts'
import { useHomeScreenData } from './useHomeScreenData.ts'
import {
    getHomeActionErrorMessage,
    sortHomeOrderIndexes,
} from './utils.ts'
import './HomePage.scss'

export function HomePage() {
    const { t } = useTranslation()
    const { pushRoute } = useAppNavigate()
    const walletAddress = useDappStore((state) => state.walletAddress)
    const isReferralBound = useUserStore((state) => state.isReferralBound)
    const setReferralBound = useUserStore((state) => state.setReferralBound)
    const [activeOrderStatus, setActiveOrderStatus] = useState<HomeOrderStatus>('active')
    const [homeDepositSubmitting, setHomeDepositSubmitting] = useState(false)
    const [homeOrderClaimSubmitting, setHomeOrderClaimSubmitting] = useState(false)
    const [homeDynamicRewardClaimSubmitting, setHomeDynamicRewardClaimSubmitting] = useState(false)
    const [homeOrderClaiming, setHomeOrderClaiming] = useState<HomeOrder | undefined>(undefined)
    const [inviteAddressText, setInviteAddressText] = useState('')
    const [showInviteAddressPopup, setShowInviteAddressPopup] = useState(false)
    const [showStaticRewardClaimPopup, setShowStaticRewardClaimPopup] = useState(false)
    const [showDynamicRewardClaimPopup, setShowDynamicRewardClaimPopup] = useState(false)
    const {
        dynamicRewardTokenAmount,
        dynamicRewardTokenText,
        homeDepositLimitsLoaded,
        homeDepositMaximum,
        homeDepositMinimum,
        homeDepositAmountText,
        homeOrderHasNextPage,
        homeOrderLoading,
        homeOrders,
        homeQuotaProgress,
        loadMoreHomeOrders,
        refreshHomeScreenData,
        resetHomeOrders,
        runWithPausedHomeScreenRefresh,
        setHomeDepositAmountText,
        staticRewardOrderIndexes,
        staticRewardTokenAmount,
        staticRewardTokenLoading,
        usdtBalanceAmount,
        usdtBalanceText,
    } = useHomeScreenData({
        activeOrderStatus,
        walletAddress,
        refreshEnabled: !homeDepositSubmitting && !homeOrderClaimSubmitting && !homeDynamicRewardClaimSubmitting,
    })
    const homeOrderStatusTabs = HOME_ORDER_STATUS_LIST.map((status) => ({
        label: status === 'active' ? t('进行中') : t('已完成'),
        value: status,
    }))

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

        setHomeDepositSubmitting(true)

        try {
            await runWithPausedHomeScreenRefresh(async () => {
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
                await refreshHomeScreenData()
            })

            message.success(t('操作成功'))
        } catch (error) {
            message.warning(getHomeActionErrorMessage(error))
        } finally {
            setHomeDepositSubmitting(false)
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
        if (homeDynamicRewardClaimSubmitting) return
        setShowDynamicRewardClaimPopup(false)
    }

    async function handleConfirmDynamicRewardClaim() {
        if (homeDynamicRewardClaimSubmitting) return

        setHomeDynamicRewardClaimSubmitting(true)

        try {
            await runWithPausedHomeScreenRefresh(async () => {
                await writeAigoProjectClaimDynamicReward()
                await waitForDappContractDataSync()

                setShowDynamicRewardClaimPopup(false)
                await refreshHomeScreenData()
            })

            message.success(t('操作成功'))
        } catch (error) {
            message.warning(getHomeActionErrorMessage(error))
        } finally {
            setHomeDynamicRewardClaimSubmitting(false)
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

        setHomeOrderClaimSubmitting(true)

        try {
            await runWithPausedHomeScreenRefresh(async () => {
                await writeAigoProjectClaimStaticRewards([BigInt(homeOrderClaiming.contractIndex)])
                await waitForDappContractDataSync()

                setHomeOrderClaiming(undefined)
                await refreshHomeScreenData()
            })

            message.success(t('操作成功'))
        } catch (error) {
            message.warning(getHomeActionErrorMessage(error))
        } finally {
            setHomeOrderClaimSubmitting(false)
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

        setHomeOrderClaimSubmitting(true)

        try {
            await runWithPausedHomeScreenRefresh(async () => {
                await writeAigoProjectClaimStaticRewards(sortHomeOrderIndexes(staticRewardOrderIndexes))
                await waitForDappContractDataSync()

                setShowStaticRewardClaimPopup(false)
                await refreshHomeScreenData()
            })

            message.success(t('操作成功'))
        } catch (error) {
            message.warning(getHomeActionErrorMessage(error))
        } finally {
            setHomeOrderClaimSubmitting(false)
        }
    }

    function handleChangeOrderStatus(status: HomeOrderStatus) {
        setActiveOrderStatus(status)
        resetHomeOrders()
    }

    function handleLoadMoreHomeOrders() {
        loadMoreHomeOrders()
    }

    function handleOpenRewardDetail() {
        pushRoute(ROUTE_PATH.homeRewardDetail)
    }

    return (
        <section className="home-page" data-page="home">
            <ContractLoading show={homeDepositSubmitting || homeOrderClaimSubmitting || homeDynamicRewardClaimSubmitting} />
            <img src={bg} className="home-page__bg vw-100" alt="" />
            <img src={aiPic} className="home-page__hero" alt="" />

            <div className="home-page__content container rel">
                <HomeCooperationCard
                    quotaProgress={homeQuotaProgress}
                    depositMinimum={homeDepositMinimum}
                    depositMaximum={homeDepositMaximum}
                    depositAmountText={homeDepositAmountText}
                    usdtBalanceText={usdtBalanceText}
                    onUseAllDepositAmount={handleUseAllHomeDepositAmount}
                    onDepositAmountChange={setHomeDepositAmountText}
                    onSubmitDeposit={handleSubmitHomeDeposit}
                />

                <HomeIncomeCard
                    staticRewardTokenAmount={staticRewardTokenAmount}
                    staticRewardTokenLoading={staticRewardTokenLoading}
                    dynamicRewardTokenText={dynamicRewardTokenText}
                    onOpenStaticRewardClaimPopup={handleOpenStaticRewardClaimPopup}
                    onOpenDynamicRewardClaimPopup={handleOpenDynamicRewardClaimPopup}
                    onOpenRewardDetail={handleOpenRewardDetail}
                />

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
                            <HomeOrderCard
                                key={order.id}
                                order={order}
                                onClaim={handleOpenHomeOrderClaim}
                            />
                        )) : (
                            <Empty showGap={false} className="home-page__order-empty" />
                        )}
                    </div>
                </InfiniteScroll>
            </div>

            <ConfirmPopup
                show={showDynamicRewardClaimPopup}
                message={t('确认要提取吗？')}
                submitting={homeDynamicRewardClaimSubmitting}
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
