import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('page pull refresh exposes a no-copy dynamic refresh icon interaction', async () => {
    const [component, context, styles, entry, iconConfig] = await Promise.all([
        readFile('src/components/PagePullRefresh/PagePullRefresh.tsx', 'utf8'),
        readFile('src/components/PagePullRefresh/context.ts', 'utf8'),
        readFile('src/components/PagePullRefresh/PagePullRefresh.scss', 'utf8'),
        readFile('src/components/PagePullRefresh/index.ts', 'utf8'),
        readFile('src/components/Icon/config.ts', 'utf8'),
    ])
    const source = `${component}\n${context}`
    const iconWrapBlock = styles.match(/&__icon-wrap\s*\{([\s\S]*?)\n    \}/)?.[1] ?? ''

    assert.match(component, /export function PagePullRefresh/)
    assert.match(context, /export function usePageRefresh/)
    assert.match(context, /createContext/)
    assert.match(context, /useLayoutEffect/)
    assert.match(component, /registerPageRefresh/)
    assert.match(component, /onTouchStart=\{handleTouchStart\}/)
    assert.match(component, /onTouchMove=\{handleTouchMove\}/)
    assert.match(component, /onTouchEnd=\{handleTouchEnd\}/)
    assert.match(component, /onTouchCancel=\{handleTouchCancel\}/)
    assert.match(component, /refreshHandlerRef\.current === undefined/)
    assert.doesNotMatch(component, /canStartPull/)
    assert.match(source, /window\.scrollY/)
    assert.match(source, /document\.activeElement/)
    assert.match(source, /isFocusedFormControlTarget/)
    assert.match(source, /activeElement\.contains\(target\)/)
    assert.match(source, /element\.isContentEditable/)
    assert.match(source, /event\.preventDefault\(\)/)
    assert.match(source, /setProperty\('--page-pull-refresh-distance'/)
    assert.match(source, /setProperty\('--page-pull-refresh-opacity'/)
    assert.match(source, /setProperty\('--page-pull-refresh-rotation'/)
    assert.match(source, /PULL_REFRESH_TRIGGER_DISTANCE = 72/)
    assert.match(source, /PULL_REFRESH_OPACITY_DISTANCE = PULL_REFRESH_TRIGGER_DISTANCE \/ 2/)
    assert.match(source, /PULL_REFRESH_DAMPING = 0\.75/)
    assert.match(source, /const opacityProgress = Math\.min\(pullDistance \/ PULL_REFRESH_OPACITY_DISTANCE, 1\)/)
    assert.match(source, /const rotationProgress = Math\.min\(pullDistance \/ PULL_REFRESH_TRIGGER_DISTANCE, 1\)/)
    assert.match(source, /PULL_REFRESH_MIN_LOADING_MS/)
    assert.match(component, /className="page-pull-refresh__rotation flex-center size-72"/)
    assert.match(component, /className="page-pull-refresh__spin flex-center size-72"/)
    assert.match(component, /<Icon name="refresh" className="page-pull-refresh__icon size-72" \/>/)
    assert.doesNotMatch(source, /style=/)
    assert.doesNotMatch(source, /下拉刷新|松开刷新|刷新中|刷新完成|刷新失败/)

    assert.match(styles, /\.page-pull-refresh\s*\{/)
    assert.match(styles, /&__indicator/)
    assert.match(styles, /position:\s*fixed;/)
    assert.match(styles, /width:\s*144px;/)
    assert.match(styles, /height:\s*144px;/)
    assert.match(styles, /transform:\s*translate3d\(-50%,\s*var\(--page-pull-refresh-distance,\s*0px\),\s*0\)/)
    assert.match(styles, /opacity:\s*var\(--page-pull-refresh-opacity,\s*0\)/)
    assert.match(styles, /&__icon-wrap[\s\S]*width:\s*112px;/)
    assert.match(styles, /&__icon-wrap[\s\S]*height:\s*112px;/)
    assert.match(styles, /&__icon-wrap[\s\S]*color:\s*var\(--app-btn-color\);/)
    assert.match(styles, /&__icon-wrap[\s\S]*background:\s*var\(--app-btn-bg\);/)
    assert.doesNotMatch(iconWrapBlock, /transform:/)
    assert.match(styles, /&__rotation[\s\S]*transform:\s*rotate\(var\(--page-pull-refresh-rotation,\s*0deg\)\)/)
    assert.doesNotMatch(styles, /&__spin[\s\S]*width:\s*72px;/)
    assert.doesNotMatch(styles, /&__spin[\s\S]*height:\s*72px;/)
    assert.match(styles, /&--refreshing &__spin[\s\S]*animation:\s*page-pull-refresh-spin 0\.8s linear infinite;/)
    assert.doesNotMatch(styles, /&--refreshing &__icon[\s\S]*animation:\s*page-pull-refresh-spin/)
    assert.match(styles, /@keyframes page-pull-refresh-spin/)
    assert.match(styles, /from\s*\{\s*transform:\s*rotate\(0deg\);\s*\}/)
    assert.match(styles, /to\s*\{\s*transform:\s*rotate\(360deg\);\s*\}/)

    assert.match(entry, /export \{ PagePullRefresh \} from '\.\/PagePullRefresh\.tsx'/)
    assert.match(entry, /export \{ usePageRefresh \} from '\.\/context\.ts'/)
    assert.match(iconConfig, /'refresh':\s*\{/)
})

test('page pull refresh resets interrupted gestures and stale settling timers', async () => {
    const component = await readFile('src/components/PagePullRefresh/PagePullRefresh.tsx', 'utf8')

    assert.match(component, /const clearSettleTimer = useCallback/)
    assert.match(component, /const resetPullTracking = useCallback/)
    assert.match(component, /clearSettleTimer\(\)[\s\S]*touchStartYRef\.current = firstTouch\.clientY/)
    assert.match(component, /if \(!isPageAtTop\(\)\) \{[\s\S]*settleIndicator\(\)[\s\S]*return[\s\S]*\}/)
    assert.match(component, /if \(pullDelta <= 0\) \{[\s\S]*settleIndicator\(\)[\s\S]*return[\s\S]*\}/)
    assert.match(component, /window\.addEventListener\('blur', handleWindowBlur\)/)
    assert.match(component, /document\.addEventListener\('visibilitychange', handleVisibilityChange\)/)
    assert.match(component, /window\.removeEventListener\('blur', handleWindowBlur\)/)
    assert.match(component, /document\.removeEventListener\('visibilitychange', handleVisibilityChange\)/)
})

test('authenticated routes are pull-refresh enabled while splash and login stay outside it', async () => {
    const router = await readFile('src/router/AppRouter.tsx', 'utf8')

    assert.match(router, /import \{ PagePullRefresh \} from '@\/components\/PagePullRefresh'/)
    assert.match(router, /function PullRefreshRouteOutlet\(\) \{[\s\S]*<PagePullRefresh>[\s\S]*<Outlet \/>[\s\S]*<\/PagePullRefresh>/)
    assert.match(router, /<Route element=\{<RequireAuthentication \/>\}>[\s\S]*<Route element=\{<PullRefreshRouteOutlet \/>\}>[\s\S]*<Route element=\{<MainLayout \/>\}>/)
    assert.match(router, /<Route path=\{ROUTE_PATH\.homeRewardDetail\.slice\(1\)\} element=\{<HomeRewardDetailPage \/>\} \/>/)
    assert.match(router, /<Route path=\{ROUTE_PATH\.root\} element=\{<SplashPage \/>\} \/>/)
    assert.match(router, /<Route path=\{ROUTE_PATH\.login\} element=\{<LoginPage \/>\} \/>/)
    assert.doesNotMatch(router, /<Route path=\{ROUTE_PATH\.root\} element=\{<PagePullRefresh>/)
    assert.doesNotMatch(router, /<Route path=\{ROUTE_PATH\.login\} element=\{<PagePullRefresh>/)
})

test('template feedback records page-level pull refresh data ownership', async () => {
    const feedback = await readFile('docs/template-react-feedback.md', 'utf8')

    assert.match(feedback, /TRF-040：页面级下拉刷新应等待真实页面数据完成/)
    assert.match(feedback, /usePageRefresh\(\)/)
    assert.match(feedback, /返回 `Promise<void>` 的刷新函数/)
    assert.match(feedback, /请求序号或 AbortController/)
    assert.match(feedback, /页面生命周期 token 或 mounted guard/)
    assert.match(feedback, /切换到不展示列表的 tab/)
    assert.match(feedback, /首页的 `refreshHomeScreenData\(\)`/)
    assert.match(feedback, /刷新生命周期 token 防止离页后恢复 10 秒定时器/)
    assert.match(feedback, /完整 `pnpm lint`、`pnpm test` 和 `pnpm build` 均已通过/)
})

test('template feedback records post-integration page orchestration refactors', async () => {
    const feedback = await readFile('docs/template-react-feedback.md', 'utf8')

    assert.match(feedback, /TRF-041：接口联调后应回收页面内的数据编排/)
    assert.match(feedback, /use<Page>Data\(\)/)
    assert.match(feedback, /use<Page>Actions\(\)/)
    assert.match(feedback, /`useLatestRequest\(\)` 或 `useAsyncGuard\(\)`/)
    assert.match(feedback, /useHomeScreenData\(\)/)
    assert.match(feedback, /HomeOrderCard/)
})
