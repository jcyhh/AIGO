import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('home page delegates data orchestration and card rendering to focused modules', async () => {
    const [
        page,
        hook,
        cooperationCard,
        incomeCard,
        orderCard,
        styles,
        utils,
        constants,
    ] = await Promise.all([
        readFile('src/pages/main/home/HomePage.tsx', 'utf8'),
        readFile('src/pages/main/home/useHomeScreenData.ts', 'utf8'),
        readFile('src/pages/main/home/components/HomeCooperationCard.tsx', 'utf8'),
        readFile('src/pages/main/home/components/HomeIncomeCard.tsx', 'utf8'),
        readFile('src/pages/main/home/components/HomeOrderCard.tsx', 'utf8'),
        readFile('src/pages/main/home/HomePage.scss', 'utf8'),
        readFile('src/pages/main/home/utils.ts', 'utf8'),
        readFile('src/pages/main/home/constants.ts', 'utf8'),
    ])

    assert.match(page, /import \{ useHomeScreenData \} from '\.\/useHomeScreenData\.ts'/)
    assert.match(page, /import \{ HomeCooperationCard \} from '\.\/components\/HomeCooperationCard\.tsx'/)
    assert.match(page, /import \{ HomeIncomeCard \} from '\.\/components\/HomeIncomeCard\.tsx'/)
    assert.match(page, /import \{ HomeOrderCard \} from '\.\/components\/HomeOrderCard\.tsx'/)
    assert.match(page, /import \{ HOME_ORDER_STATUS_LIST \} from '\.\/constants\.ts'/)
    assert.match(page, /import type \{[\s\S]*HomeOrder,[\s\S]*HomeOrderStatus,[\s\S]*\} from '\.\/types\.ts'/)
    assert.match(page, /getHomeActionErrorMessage/)
    assert.match(page, /sortHomeOrderIndexes/)
    assert.doesNotMatch(page, /getOrders/)
    assert.doesNotMatch(page, /getCurrentUser/)
    assert.doesNotMatch(page, /readErc20Balance/)
    assert.doesNotMatch(page, /readAigoProjectOrder/)
    assert.doesNotMatch(page, /readAigoProjectPendingStaticRewards/)
    assert.doesNotMatch(page, /readAigoProjectPendingDynamicReward/)
    assert.doesNotMatch(page, /usePageRefresh/)
    assert.doesNotMatch(page, /homeScreenRefreshTimerRef/)
    assert.doesNotMatch(page, /RequestRef/)
    assert.doesNotMatch(page, /requestRef/)

    assert.match(page, /const \[activeOrderStatus, setActiveOrderStatus\] = useState<HomeOrderStatus>\('active'\)/)
    assert.match(page, /useHomeScreenData\(\{[\s\S]*activeOrderStatus,[\s\S]*walletAddress,[\s\S]*refreshEnabled: !homeDepositSubmitting && !homeOrderClaimSubmitting && !homeDynamicRewardClaimSubmitting,[\s\S]*\}\)/)
    assert.match(page, /const homeOrderStatusTabs = HOME_ORDER_STATUS_LIST\.map\(\(status\) =>/)
    assert.match(page, /<ContractLoading show=\{homeDepositSubmitting \|\| homeOrderClaimSubmitting \|\| homeDynamicRewardClaimSubmitting\} \/>/)
    assert.match(page, /<div className="home-page__bg vw-100" aria-hidden="true">[\s\S]*<div className="home-page__bg-track">[\s\S]*<img src=\{bg\} className="home-page__bg-image" alt="" \/>[\s\S]*<img src=\{bg\} className="home-page__bg-image" alt="" \/>[\s\S]*<\/div>[\s\S]*<\/div>/)
    assert.doesNotMatch(page, /home-page__bg[\s\S]*animate__fadeInDown/)
    assert.match(page, /<HomeCooperationCard[\s\S]*quotaProgress=\{homeQuotaProgress\}[\s\S]*depositMinimum=\{homeDepositMinimum\}[\s\S]*depositMaximum=\{homeDepositMaximum\}[\s\S]*depositAmountText=\{homeDepositAmountText\}[\s\S]*usdtBalanceText=\{usdtBalanceText\}[\s\S]*onSubmitDeposit=\{handleSubmitHomeDeposit\}/)
    assert.match(page, /<HomeIncomeCard[\s\S]*staticRewardTokenAmount=\{staticRewardTokenAmount\}[\s\S]*staticRewardTokenLoading=\{staticRewardTokenLoading\}[\s\S]*dynamicRewardTokenText=\{dynamicRewardTokenText\}/)
    assert.match(page, /homeOrders\.length > 0 \? homeOrders\.map\(\(order\) => \([\s\S]*<HomeOrderCard[\s\S]*key=\{order\.id\}[\s\S]*order=\{order\}[\s\S]*onClaim=\{handleOpenHomeOrderClaim\}/)
    assert.match(page, /<Empty showGap=\{false\} className="home-page__order-empty" \/>/)
    assert.match(page, /<SegmentedTabs[\s\S]*options=\{homeOrderStatusTabs\}[\s\S]*value=\{activeOrderStatus\}[\s\S]*onChange=\{handleChangeOrderStatus\}/)
    assert.match(page, /<InfiniteScroll[\s\S]*loading=\{homeOrderLoading\}[\s\S]*hasMore=\{homeOrderHasNextPage\}[\s\S]*onLoadMore=\{handleLoadMoreHomeOrders\}/)

    assert.match(page, /await runWithPausedHomeScreenRefresh\(async \(\) => \{[\s\S]*await submitHomeDepositOrder\(\{[\s\S]*amount,[\s\S]*walletAddress: walletAddress as Address,[\s\S]*referralAddress,[\s\S]*\}\)[\s\S]*await waitForDappContractDataSync\(\)[\s\S]*await refreshHomeScreenData\(\)/)
    assert.match(page, /await runWithPausedHomeScreenRefresh\(async \(\) => \{[\s\S]*await writeAigoProjectClaimDynamicReward\(\)[\s\S]*await waitForDappContractDataSync\(\)[\s\S]*await refreshHomeScreenData\(\)/)
    assert.match(page, /await writeAigoProjectClaimStaticRewards\(\[BigInt\(homeOrderClaiming\.contractIndex\)\]\)/)
    assert.match(page, /await writeAigoProjectClaimStaticRewards\(sortHomeOrderIndexes\(staticRewardOrderIndexes\)\)/)
    assert.match(page, /message\.warning\(getHomeActionErrorMessage\(error\)\)/)
    assert.match(page, /function handleChangeOrderStatus\(status: HomeOrderStatus\) \{[\s\S]*setActiveOrderStatus\(status\)[\s\S]*resetHomeOrders\(\)/)
    assert.match(page, /function handleLoadMoreHomeOrders\(\) \{[\s\S]*loadMoreHomeOrders\(\)/)
    assert.match(page, /function handleOpenRewardDetail\(\) \{[\s\S]*pushRoute\(ROUTE_PATH\.homeRewardDetail\)/)
    assert.doesNotMatch(page, /style=/)

    assert.match(hook, /import \{ usePageRefresh \} from '@\/components\/PagePullRefresh'/)
    assert.match(hook, /import \{ getOrders \} from '@\/features\/order\/api\.ts'/)
    assert.match(hook, /import \{ getCurrentUser \} from '@\/features\/user\/api\.ts'/)
    assert.match(hook, /import \{ useLatestRequest \} from '@\/shared\/hooks\/useLatestRequest\.ts'/)
    assert.match(hook, /const homeScreenRefreshTimerRef = useRef<number \| undefined>\(undefined\)/)
    assert.match(hook, /const homeScreenRefreshLifecycleRef = useRef\(0\)/)
    assert.match(hook, /createLatestRequestGuard: createUsdtBalanceRequestGuard/)
    assert.match(hook, /createLatestRequestGuard: createHomeDepositLimitsRequestGuard/)
    assert.match(hook, /createLatestRequestGuard: createDynamicRewardRequestGuard/)
    assert.match(hook, /createLatestRequestGuard: createInactiveQuotaRequestGuard/)
    assert.match(hook, /createLatestRequestGuard: createHomeOrdersRequestGuard/)
    assert.doesNotMatch(hook, /usdtBalanceRequestRef/)
    assert.doesNotMatch(hook, /homeOrdersRequestRef/)
    assert.match(hook, /const refreshTasks = \[[\s\S]*refreshCurrentUserProfile\(\),[\s\S]*loadUsdtBalance\(\),[\s\S]*loadHomeDepositLimits\(\),[\s\S]*loadDynamicReward\(\),[\s\S]*loadHomeOrders\(activeOrderStatus, 1\),[\s\S]*\]/)
    assert.match(hook, /await Promise\.all\(refreshTasks\)/)
    assert.match(hook, /usePageRefresh\(handleHomePullRefresh, refreshEnabled\)/)
    assert.match(hook, /const runWithPausedHomeScreenRefresh = useCallback\(async <TResult,>/)
    assert.match(hook, /homeScreenRefreshLifecycleRef\.current \+= 1[\s\S]*stopHomeScreenRefreshTimer\(\)[\s\S]*invalidateHomeScreenRequests\(\)/)
    assert.match(hook, /Promise\.all\(\s*orders\.map\(async \(order\): Promise<ActiveOrderProgressResult> =>/)
    assert.match(hook, /Promise\.all\(\s*orders\.map\(async \(order\): Promise<ActiveOrderStaticRewardResult> =>/)
    assert.match(hook, /readAigoProjectPendingStaticRewards\(\[index\],\s*\{\s*account: walletAddress as Address,?\s*\}\)/)
    assert.match(hook, /readAigoProjectOrder\(/)

    assert.match(constants, /export const HOME_ORDER_STATUS_LIST: readonly HomeOrderStatus\[\] = \['active', 'completed'\]/)
    assert.match(constants, /export const HOME_ORDER_PAGE_SIZE = 20/)
    assert.match(constants, /export const HOME_SCREEN_REFRESH_INTERVAL_MS = 10_000/)
    assert.match(constants, /active:\s*1/)
    assert.match(constants, /completed:\s*0/)

    assert.match(utils, /export function mapApiOrderToHomeOrder/)
    assert.match(utils, /const status = order\.status === HOME_ORDER_API_STATUS\.active \? 'active' : 'completed'/)
    assert.match(utils, /const progressCurrentValue = status === 'completed' \? order\.total_amount : '0'/)
    assert.match(utils, /progressCurrentText:\s*formatAmount\(progressCurrentValue\)/)
    assert.match(utils, /progressLoading:\s*status !== 'completed'/)
    assert.match(utils, /progressMultipleText:\s*divideDecimalNumbers\(order\.total_amount, order\.amount, 2\)/)
    assert.match(utils, /export function createHomeOrderListParams/)
    assert.match(utils, /page_size:\s*HOME_ORDER_PAGE_SIZE/)
    assert.match(utils, /export function sortHomeOrderIndexes/)
    assert.doesNotMatch(utils, /progressCurrentValue:\s*order\.release_amount/)

    assert.match(cooperationCard, /export function HomeCooperationCard/)
    assert.match(cooperationCard, /<ProgressBar[\s\S]*currentValue=\{quotaProgress\.amount\}[\s\S]*totalValue=\{quotaProgress\.totalAmount\}/)
    assert.match(cooperationCard, /placeholder=\{homeDepositPlaceholder\}/)
    assert.match(cooperationCard, /onChange=\{\(event\) => onDepositAmountChange\(event\.target\.value\)\}/)
    assert.match(cooperationCard, /onClick=\{onUseAllDepositAmount\}/)
    assert.match(cooperationCard, /onClick=\{onSubmitDeposit\}/)
    assert.doesNotMatch(cooperationCard, /style=/)

    assert.match(incomeCard, /export function HomeIncomeCard/)
    assert.match(incomeCard, /formatAmount\(formatDappAmountUnits\(staticRewardTokenAmount\)\)/)
    assert.match(incomeCard, /dynamicRewardTokenText/)
    assert.match(incomeCard, /onClick=\{onOpenStaticRewardClaimPopup\}/)
    assert.match(incomeCard, /onClick=\{onOpenDynamicRewardClaimPopup\}/)
    assert.match(incomeCard, /onClick=\{onOpenRewardDetail\}/)
    assert.doesNotMatch(incomeCard, /style=/)

    assert.match(orderCard, /export function HomeOrderCard/)
    assert.match(orderCard, /<ProgressBar[\s\S]*currentValue=\{order\.progressCurrentValue\}[\s\S]*totalValue=\{order\.progressTotalValue\}/)
    assert.match(orderCard, /\{order\.status === 'active' \? \([\s\S]*home-page__order-line[\s\S]*t\('可领取'\)[\s\S]*\) : null\}/)
    assert.match(orderCard, /order\.claimableLoading \? \(/)
    assert.match(orderCard, /order\.canClaim \? \(/)
    assert.match(orderCard, /onClick=\{\(\) => onClaim\(order\)\}/)
    assert.doesNotMatch(orderCard, /style=/)

    assert.match(styles, /\.home-page\s*\{/)
    assert.match(styles, /min-height:\s*3000px/)
    assert.match(styles, /--home-bg-loop-height:\s*1380px/)
    assert.match(styles, /--home-bg-seam-overlap:\s*360px/)
    assert.match(styles, /&__bg[\s\S]*height:\s*var\(--home-bg-loop-height\)[\s\S]*overflow:\s*hidden/)
    assert.match(styles, /&__bg-track[\s\S]*transform:\s*translate3d\(0, calc\(-1 \* \(var\(--home-bg-loop-height\) - var\(--home-bg-seam-overlap\)\)\), 0\)[\s\S]*animation:\s*home-page-bg-scroll 18s linear infinite/)
    assert.match(styles, /&__bg-image[\s\S]*display:\s*block[\s\S]*width:\s*100%[\s\S]*height:\s*var\(--home-bg-loop-height\)[\s\S]*object-fit:\s*cover[\s\S]*-webkit-mask-image:\s*linear-gradient/)
    assert.match(styles, /&__bg-image \+ &__bg-image[\s\S]*margin-top:\s*calc\(-1 \* var\(--home-bg-seam-overlap\)\)/)
    assert.match(styles, /@keyframes home-page-bg-scroll[\s\S]*calc\(-1 \* \(var\(--home-bg-loop-height\) - var\(--home-bg-seam-overlap\)\)\)[\s\S]*transform:\s*translate3d\(0, 0, 0\)/)
    assert.match(styles, /&__hero[\s\S]*animation:\s*home-page-hero-float 4\.8s ease-in-out infinite/)
    assert.match(styles, /will-change:\s*transform, filter/)
    assert.match(styles, /@keyframes home-page-hero-float/)
    assert.match(styles, /transform:\s*translate3d\(0, -18px, 0\) scale\(1\.018\)/)
    assert.match(styles, /drop-shadow\(0 0 54px rgba\(0, 118, 255, 0\.58\)\)/)
    assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.home-page__bg-track[\s\S]*calc\(-1 \* \(var\(--home-bg-loop-height\) - var\(--home-bg-seam-overlap\)\)\)[\s\S]*animation:\s*none[\s\S]*\.home-page__hero[\s\S]*animation:\s*none/)
    assert.match(styles, /&__cooperation-card/)
    assert.match(styles, /background-image:\s*url\("@\/assets\/home\/card-bg\.png"\)/)
    assert.match(styles, /&__progress-bar[\s\S]*height:\s*24px/)
    assert.match(styles, /&__deposit-submit[\s\S]*@include full-button\(/)
    assert.match(styles, /&__income-card/)
    assert.match(styles, /background-image:\s*url\("@\/assets\/home\/income-card\.png"\)/)
    assert.match(styles, /&__claim-button[\s\S]*@include auto-button\(/)
    assert.match(styles, /&__order-claim[\s\S]*@include auto-button\(/)
    assert.match(styles, /&__order-card/)
    assert.match(styles, /&__order-progress/)
    assert.doesNotMatch(styles, /&__order-pagination/)
})

test('home page displays token-facing amounts as Token without touching platform coin copy', async () => {
    const sources = await Promise.all([
        readFile('src/pages/main/home/HomePage.tsx', 'utf8'),
        readFile('src/pages/main/home/useHomeScreenData.ts', 'utf8'),
        readFile('src/pages/main/home/components/HomeCooperationCard.tsx', 'utf8'),
        readFile('src/pages/main/home/components/HomeIncomeCard.tsx', 'utf8'),
        readFile('src/pages/main/home/components/HomeOrderCard.tsx', 'utf8'),
        readFile('src/pages/main/home/utils.ts', 'utf8'),
        readFile('src/pages/main/home/constants.ts', 'utf8'),
    ])
    const combinedHomeSource = sources.join('\n')

    assert.match(combinedHomeSource, /const HOME_TOKEN_SYMBOL = PROJECT_TOKEN\.usdt\.symbol/)
    assert.match(combinedHomeSource, /formatHomeOrderTokenText\(value: string\): string \{[\s\S]*HOME_TOKEN_SYMBOL/)
    assert.match(combinedHomeSource, /incomeText:\s*`\$\{TOKEN_BALANCE_EMPTY_TEXT\} \$\{HOME_TOKEN_SYMBOL\}`/)
    assert.match(combinedHomeSource, /claimableText:\s*`\$\{TOKEN_BALANCE_EMPTY_TEXT\} \$\{HOME_TOKEN_SYMBOL\}`/)
    assert.match(combinedHomeSource, /HOME_TOKEN_SYMBOL/)
    assert.doesNotMatch(combinedHomeSource, /PROJECT_TOKEN\.platform\.symbol/)
})
