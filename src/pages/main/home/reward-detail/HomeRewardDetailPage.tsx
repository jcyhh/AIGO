import {
    useCallback,
    useEffect,
    useState,
} from 'react'
import { useTranslation } from 'react-i18next'

import { Empty } from '@/components/Empty'
import { InfiniteScroll } from '@/components/InfiniteScroll'
import { usePageRefresh } from '@/components/PagePullRefresh'
import { SecondaryHeader } from '@/components/SecondaryHeader'
import { SegmentedTabs } from '@/components/SegmentedTabs'
import { PROJECT_TOKEN } from '@/config'
import { getOrderRewardLogs } from '@/features/order/api.ts'
import type {
    OrderRewardLog,
    OrderRewardLogListParams,
    OrderRewardLogType,
} from '@/features/order/types.ts'
import { formatAmount } from '@/shared/formatters/formatAmount.ts'
import { useLatestRequest } from '@/shared/hooks/useLatestRequest.ts'

import './HomeRewardDetailPage.scss'

type HomeRewardDetailFilter = 'static' | 'dynamic'

const HOME_REWARD_DETAIL_PAGE_SIZE = 20

const HOME_REWARD_DETAIL_FILTER_LIST: readonly HomeRewardDetailFilter[] = ['static', 'dynamic']

const HOME_REWARD_DETAIL_FILTER_TYPE: Record<HomeRewardDetailFilter, OrderRewardLogType> = {
    static: 1,
    dynamic: 2,
}

function getHomeRewardLogTypeText(
    type: OrderRewardLogType,
    t: (key: string) => string,
): string {
    switch (type) {
        case 1:
            return t('静态收益')
        case 2:
            return t('动态收益')
        default:
            return t('收益')
    }
}

function createHomeRewardDetailListParams(
    filter: HomeRewardDetailFilter,
    pageNo: number,
): OrderRewardLogListParams {
    return {
        page_no: pageNo,
        page_size: HOME_REWARD_DETAIL_PAGE_SIZE,
        type: HOME_REWARD_DETAIL_FILTER_TYPE[filter],
    }
}

export function HomeRewardDetailPage() {
    const { t } = useTranslation()
    const [activeFilter, setActiveFilter] = useState<HomeRewardDetailFilter>('static')
    const [rewardLogs, setRewardLogs] = useState<OrderRewardLog[]>([])
    const [pageNo, setPageNo] = useState(1)
    const [loading, setLoading] = useState(false)
    const [hasNextPage, setHasNextPage] = useState(false)
    const {
        createLatestRequestGuard: createRewardLogRequestGuard,
        invalidateLatestRequest: invalidateRewardLogRequest,
    } = useLatestRequest()
    const filterTabs = HOME_REWARD_DETAIL_FILTER_LIST.map((filter) => ({
        label: filter === 'static' ? t('静态收益') : t('动态收益'),
        value: filter,
    }))

    const loadRewardLogs = useCallback(async (
        filter: HomeRewardDetailFilter,
        nextPageNo: number,
    ) => {
        const isCurrent = createRewardLogRequestGuard()

        setLoading(true)

        try {
            const response = await getOrderRewardLogs(createHomeRewardDetailListParams(filter, nextPageNo))

            if (isCurrent()) {
                setRewardLogs((current) => nextPageNo === 1 ? response.reward_logs : current.concat(response.reward_logs))
                setHasNextPage(response.reward_logs.length >= HOME_REWARD_DETAIL_PAGE_SIZE)
            }
        } catch {
            if (isCurrent()) {
                if (nextPageNo === 1) {
                    setRewardLogs([])
                }

                setHasNextPage(false)
            }
        } finally {
            if (isCurrent()) {
                setLoading(false)
            }
        }
    }, [createRewardLogRequestGuard])

    const refreshRewardLogs = useCallback(async () => {
        setPageNo(1)
        setRewardLogs([])
        setHasNextPage(false)
        await loadRewardLogs(activeFilter, 1)
    }, [activeFilter, loadRewardLogs])

    const handlePagePullRefresh = useCallback(() => refreshRewardLogs(), [refreshRewardLogs])

    usePageRefresh(handlePagePullRefresh, !loading)

    useEffect(() => {
        void refreshRewardLogs()

        return invalidateRewardLogRequest
    }, [invalidateRewardLogRequest, refreshRewardLogs])

    useEffect(() => {
        if (pageNo === 1) return undefined

        void loadRewardLogs(activeFilter, pageNo)

        return undefined
    }, [activeFilter, loadRewardLogs, pageNo])

    function handleChangeFilter(filter: HomeRewardDetailFilter) {
        setActiveFilter(filter)
        setPageNo(1)
        setRewardLogs([])
        setHasNextPage(false)
    }

    function handleLoadMoreRewardLogs() {
        if (loading || !hasNextPage) return

        setPageNo((current) => current + 1)
    }

    return (
        <section className="home-reward-detail-page">
            <SecondaryHeader title={t('领取明细')} />

            <div className="home-reward-detail-page__content container pt-30 pb-60">
                <SegmentedTabs
                    options={filterTabs}
                    value={activeFilter}
                    onChange={handleChangeFilter}
                    ariaLabel={t('领取明细类型')}
                    className="home-reward-detail-page__tabs"
                />

                <InfiniteScroll
                    loading={loading}
                    hasMore={hasNextPage}
                    onLoadMore={handleLoadMoreRewardLogs}
                    className="home-reward-detail-page__scroll mt-30"
                >
                    {rewardLogs.length > 0 ? (
                        <div className="home-reward-detail-page__list">
                            {rewardLogs.map((rewardLog) => (
                                <article
                                    className="home-reward-detail-page__card mb-20"
                                    key={rewardLog.id}
                                >
                                    <div className="flex-between items-start">
                                        <div className="size-30 bold-6">
                                            {getHomeRewardLogTypeText(rewardLog.type, t)}
                                        </div>
                                        <div className="size-24 opc-5">
                                            {rewardLog.created_at}
                                        </div>
                                    </div>

                                    <div className="home-reward-detail-page__amount-row flex-between items-center mt-28">
                                        <span className="size-24 opc-5">
                                            {t('{{symbol}}收益', { symbol: PROJECT_TOKEN.platform.symbol })}
                                        </span>
                                        <span className="size-30 bold-6">
                                            {formatAmount(rewardLog.aigo_amount)}
                                        </span>
                                    </div>

                                    <div className="home-reward-detail-page__amount-row flex-between items-center mt-18">
                                        <span className="size-24 opc-5">
                                            {t('{{symbol}}收益', { symbol: PROJECT_TOKEN.usdt.symbol })}
                                        </span>
                                        <span className="size-30 bold-6">
                                            {formatAmount(rewardLog.usdt_amount)}
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <Empty showGap={false} className="home-reward-detail-page__empty" />
                    )}
                </InfiniteScroll>
            </div>
        </section>
    )
}
