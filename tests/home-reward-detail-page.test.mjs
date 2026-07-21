import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

test('home reward detail page fetches paged reward logs with reusable list components', async () => {
    const [page, styles, homeIndex, mainIndex] = await Promise.all([
        readFile('src/pages/main/home/reward-detail/HomeRewardDetailPage.tsx', 'utf8'),
        readFile('src/pages/main/home/reward-detail/HomeRewardDetailPage.scss', 'utf8'),
        readFile('src/pages/main/home/index.ts', 'utf8'),
        readFile('src/pages/main/index.ts', 'utf8'),
    ])

    assert.equal(existsSync('src/pages/main/home/reward-detail/index.ts'), true)
    assert.match(homeIndex, /export \{ HomeRewardDetailPage \} from '\.\/reward-detail\/index\.ts'/)
    assert.match(mainIndex, /export \{ HomeRewardDetailPage \} from '\.\/home\/index\.ts'/)

    assert.match(page, /import \{[\s\S]*useEffect,[\s\S]*useState,[\s\S]*\} from 'react'/)
    assert.match(page, /import \{ Empty \} from '@\/components\/Empty'/)
    assert.match(page, /import \{ InfiniteScroll \} from '@\/components\/InfiniteScroll'/)
    assert.match(page, /import \{ SecondaryHeader \} from '@\/components\/SecondaryHeader'/)
    assert.match(page, /import \{ SegmentedTabs \} from '@\/components\/SegmentedTabs'/)
    assert.match(page, /import \{ PROJECT_TOKEN \} from '@\/config'/)
    assert.match(page, /import \{ getOrderRewardLogs \} from '@\/features\/order\/api\.ts'/)
    assert.match(page, /import type \{[\s\S]*OrderRewardLog,[\s\S]*OrderRewardLogType,[\s\S]*\} from '@\/features\/order\/types\.ts'/)
    assert.match(page, /import \{ formatAmount \} from '@\/shared\/formatters\/formatAmount\.ts'/)
    assert.match(page, /type HomeRewardDetailFilter = 'static' \| 'dynamic'/)
    assert.match(page, /HOME_REWARD_DETAIL_PAGE_SIZE = 20/)
    assert.match(page, /HOME_REWARD_DETAIL_FILTER_LIST/)
    assert.doesNotMatch(page, /全部/)
    assert.match(page, /静态收益/)
    assert.match(page, /动态收益/)
    assert.match(page, /const HOME_REWARD_DETAIL_FILTER_TYPE: Record<HomeRewardDetailFilter, OrderRewardLogType>/)
    assert.match(page, /static:\s*1/)
    assert.match(page, /dynamic:\s*2/)
    assert.match(page, /function createHomeRewardDetailListParams/)
    assert.match(page, /page_no:\s*pageNo/)
    assert.match(page, /page_size:\s*HOME_REWARD_DETAIL_PAGE_SIZE/)
    assert.match(page, /type:\s*HOME_REWARD_DETAIL_FILTER_TYPE\[filter\]/)
    assert.doesNotMatch(page, /filter !== 'all'/)
    assert.match(page, /const \[activeFilter, setActiveFilter\] = useState<HomeRewardDetailFilter>\('static'\)/)
    assert.match(page, /const \[rewardLogs, setRewardLogs\] = useState<OrderRewardLog\[\]>\(\[\]\)/)
    assert.match(page, /const \[pageNo, setPageNo\] = useState\(1\)/)
    assert.match(page, /const \[loading, setLoading\] = useState\(false\)/)
    assert.match(page, /const \[hasNextPage, setHasNextPage\] = useState\(false\)/)
    assert.match(page, /getOrderRewardLogs\(createHomeRewardDetailListParams\(activeFilter, pageNo\)\)/)
    assert.match(page, /setRewardLogs\(\(current\) => pageNo === 1 \? response\.reward_logs : current\.concat\(response\.reward_logs\)\)/)
    assert.match(page, /setHasNextPage\(response\.reward_logs\.length >= HOME_REWARD_DETAIL_PAGE_SIZE\)/)
    assert.match(page, /\}, \[[\s\S]*activeFilter,[\s\S]*pageNo,[\s\S]*\]\)/)
    assert.match(page, /function handleChangeFilter\(filter: HomeRewardDetailFilter\)/)
    assert.match(page, /setPageNo\(1\)/)
    assert.match(page, /setRewardLogs\(\[\]\)/)
    assert.match(page, /function handleLoadMoreRewardLogs\(\)/)
    assert.match(page, /setPageNo\(\(current\) => current \+ 1\)/)
    assert.match(page, /<SecondaryHeader title=\{t\('领取明细'\)\} \/>/)
    assert.match(page, /<SegmentedTabs[\s\S]*options=\{filterTabs\}[\s\S]*value=\{activeFilter\}[\s\S]*onChange=\{handleChangeFilter\}/)
    assert.match(page, /ariaLabel=\{t\('领取明细类型'\)\}/)
    assert.match(page, /<InfiniteScroll[\s\S]*loading=\{loading\}[\s\S]*hasMore=\{hasNextPage\}[\s\S]*onLoadMore=\{handleLoadMoreRewardLogs\}/)
    assert.match(page, /rewardLogs\.map\(\(rewardLog\) =>/)
    assert.match(page, /getHomeRewardLogTypeText\(rewardLog\.type, t\)/)
    assert.match(page, /formatAmount\(rewardLog\.aigo_amount\)/)
    assert.match(page, /formatAmount\(rewardLog\.usdt_amount\)/)
    assert.match(page, /PROJECT_TOKEN\.platform\.symbol/)
    assert.match(page, /PROJECT_TOKEN\.usdt\.symbol/)
    assert.match(page, /<Empty showGap=\{false\} className="home-reward-detail-page__empty" \/>/)
    assert.doesNotMatch(page, /<Empty text=/)
    assert.doesNotMatch(page, /style=/)

    assert.match(styles, /\.home-reward-detail-page\s*\{/)
    assert.match(styles, /min-height:\s*100vh;\s*min-height:\s*100dvh;/)
    assert.match(styles, /&__tabs/)
    assert.match(styles, /&__list/)
    assert.match(styles, /&__card/)
    assert.match(styles, /&__amount-row/)
    assert.match(styles, /&__empty/)
})

test('home reward detail page keeps reward log type copy in one mapper', async () => {
    const page = await readFile('src/pages/main/home/reward-detail/HomeRewardDetailPage.tsx', 'utf8')

    assert.match(page, /function getHomeRewardLogTypeText\([\s\S]*type: OrderRewardLogType,[\s\S]*t: \(key: string\) => string,[\s\S]*\): string \{[\s\S]*case 1:[\s\S]*return t\('静态收益'\)[\s\S]*case 2:[\s\S]*return t\('动态收益'\)/)
})
