import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('latest request hook centralizes stale async guards', async () => {
    const hook = await readFile('src/shared/hooks/useLatestRequest.ts', 'utf8')

    assert.match(hook, /export function useLatestRequest/)
    assert.match(hook, /useRef\(0\)/)
    assert.match(hook, /createLatestRequestGuard/)
    assert.match(hook, /invalidateLatestRequest/)
    assert.match(hook, /requestId === latestRequestIdRef\.current/)
    assert.match(hook, /useEffect\(\(\) => invalidateLatestRequest, \[invalidateLatestRequest\]\)/)
})

test('page refresh screens reuse the shared latest request hook instead of local request refs', async () => {
    const pages = await Promise.all([
        readFile('src/pages/main/home/useHomeScreenData.ts', 'utf8'),
        readFile('src/pages/main/swap/SwapPage.tsx', 'utf8'),
        readFile('src/pages/main/saving/SavingPage.tsx', 'utf8'),
        readFile('src/pages/main/weight/WeightPage.tsx', 'utf8'),
        readFile('src/pages/main/home/reward-detail/HomeRewardDetailPage.tsx', 'utf8'),
    ])

    for (const page of pages) {
        assert.match(page, /useLatestRequest/)
        assert.doesNotMatch(page, /RequestRef = useRef\(0\)/)
        assert.doesNotMatch(page, /requestRef = useRef\(0\)/)
        assert.doesNotMatch(page, /const requestId = .*RequestRef\.current \+ 1/)
    }
})

test('home page delegates orchestration and repeated card markup to focused modules', async () => {
    const page = await readFile('src/pages/main/home/HomePage.tsx', 'utf8')

    assert.match(page, /import \{ useHomeScreenData \} from '\.\/useHomeScreenData\.ts'/)
    assert.match(page, /import \{ HomeCooperationCard \} from '\.\/components\/HomeCooperationCard\.tsx'/)
    assert.match(page, /import \{ HomeIncomeCard \} from '\.\/components\/HomeIncomeCard\.tsx'/)
    assert.match(page, /import \{ HomeOrderCard \} from '\.\/components\/HomeOrderCard\.tsx'/)
    assert.doesNotMatch(page, /getOrders/)
    assert.doesNotMatch(page, /readErc20Balance/)
    assert.doesNotMatch(page, /readAigoProjectOrder/)
    assert.doesNotMatch(page, /homeScreenRefreshTimerRef/)
})

test('home screen data hook parallelizes independent active order contract reads', async () => {
    const hook = await readFile('src/pages/main/home/useHomeScreenData.ts', 'utf8')

    assert.match(hook, /Promise\.all\(\s*orders\.map\(async \(order\): Promise<ActiveOrderProgressResult> =>/)
    assert.match(hook, /Promise\.all\(\s*orders\.map\(async \(order\): Promise<ActiveOrderStaticRewardResult> =>/)
    assert.match(hook, /readAigoProjectPendingStaticRewards\(\[index\],\s*\{\s*account: walletAddress as Address,?\s*\}\)/)
    assert.match(hook, /readAigoProjectOrder\(/)
    assert.doesNotMatch(hook, /for \(const order of orders\) \{\s*const index = BigInt\(order\.index\)[\s\S]*await readAigoProjectOrder/)
    assert.doesNotMatch(hook, /for \(const order of orders\) \{\s*const indexes = \[BigInt\(order\.index\)\][\s\S]*await readAigoProjectPendingStaticRewards/)
})
