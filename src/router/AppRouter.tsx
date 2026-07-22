import {
    useEffect,
} from 'react'
import {
    BrowserRouter,
    Navigate,
    Outlet,
    Route,
    Routes,
    useNavigate,
} from 'react-router'

import { PagePullRefresh } from '@/components/PagePullRefresh'
import { HomePage, HomeRewardDetailPage, MainLayout, SavingPage, SwapPage, WeightPage } from '@/pages/main'
import { SplashPage } from '@/pages/splash/SplashPage.tsx'
import { SHOWCASE_ROUTE_ELEMENTS } from '@/showcase/router/index.ts'
import { LoginPage } from '@/pages/auth/index.ts'
import { useUserStore } from '@/stores/user/store.ts'

import { registerAppRouteReplacer } from './bridge.ts'
import { APP_ROUTER_BASENAME } from './config.ts'
import { ROUTE_PATH } from './routes.ts'

function RouterNavigationBridge() {
    const navigate = useNavigate()

    useEffect(() => registerAppRouteReplacer((path) => {
        void navigate(path, { replace: true })
    }), [navigate])

    return null
}

function RequireAuthentication() {
    const isAuthenticated = useUserStore((state) => state.isAuthenticated)

    if (!isAuthenticated) {
        return <Navigate to={ROUTE_PATH.root} replace />
    }

    return <Outlet />
}

function PullRefreshRouteOutlet() {
    return (
        <PagePullRefresh>
            <Outlet />
        </PagePullRefresh>
    )
}

export function AppRouter() {
    return (
        <BrowserRouter basename={APP_ROUTER_BASENAME}>
            <RouterNavigationBridge />
            <Routes>
                <Route path={ROUTE_PATH.root} element={<SplashPage />} />
                <Route path={ROUTE_PATH.referral} element={<SplashPage />} />
                <Route path={ROUTE_PATH.login} element={<LoginPage />} />

                <Route element={<RequireAuthentication />}>
                    <Route element={<PullRefreshRouteOutlet />}>
                        <Route element={<MainLayout />}>
                            <Route path={ROUTE_PATH.home.slice(1)} element={<HomePage />} />
                            <Route path={ROUTE_PATH.swap.slice(1)} element={<SwapPage />} />
                            <Route path={ROUTE_PATH.weight.slice(1)} element={<WeightPage />} />
                            <Route path={ROUTE_PATH.saving.slice(1)} element={<SavingPage />} />
                        </Route>
                        <Route path={ROUTE_PATH.homeRewardDetail.slice(1)} element={<HomeRewardDetailPage />} />
                    </Route>
                </Route>

                {SHOWCASE_ROUTE_ELEMENTS}

                <Route path="*" element={<Navigate to={ROUTE_PATH.root} replace />} />
            </Routes>
        </BrowserRouter>
    )
}
