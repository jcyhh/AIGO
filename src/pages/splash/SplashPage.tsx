import {
    useEffect,
    useRef,
    useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
    useNavigate,
    useParams,
} from 'react-router'

import { Icon } from '@/components/Icon'
import {
    APP_CONFIG,
    APP_LOGIN_MODE,
} from '@/config/index.ts'
import {
    AUTH_STARTUP_RESULT,
    startAuthFlow,
} from '@/features/auth/startup.ts'
import { ROUTE_PATH } from '@/router/routes.ts'

import { saveSplashReferralCode } from './referral.ts'
import './SplashPage.scss'

type SplashRouteParams = {
    ref?: string
}

const SPLASH_ANIMATION_DURATION = 1000
const appLogoUrl = `${APP_CONFIG.routeBase}brand/app-logo.png`

function waitForSplashAnimation(): Promise<void> {
    return new Promise((resolve) => {
        window.setTimeout(resolve, SPLASH_ANIMATION_DURATION)
    })
}

export function SplashPage() {
    const { t } = useTranslation()
    const { ref } = useParams<SplashRouteParams>()
    const navigate = useNavigate()
    const hasStartedRef = useRef(false)
    const [walletRequired, setWalletRequired] = useState(false)
    const loading = APP_CONFIG.loginMode !== APP_LOGIN_MODE.account && !walletRequired

    useEffect(() => {
        if (saveSplashReferralCode(ref)) {
            void navigate(ROUTE_PATH.root, { replace: true })
            return
        }

    }, [navigate, ref])

    useEffect(() => {
        if (ref || hasStartedRef.current) return

        hasStartedRef.current = true

        async function startSplashAuthFlow(): Promise<void> {
            if (APP_CONFIG.loginMode === APP_LOGIN_MODE.account) {
                await waitForSplashAnimation()
            }

            const result = await startAuthFlow()

            if (result === AUTH_STARTUP_RESULT.walletRequired) {
                setWalletRequired(true)
            }
        }

        void startSplashAuthFlow()
    }, [ref])

    return (
        <section className="splash-page" data-page="splash">
            <div className="splash-page__brand vw-100 flex flex-column items-center ani-delay-3 animate__animated animate__zoomIn">
                <img
                    src={appLogoUrl}
                    className="splash-page__logo"
                    alt={APP_CONFIG.name}
                />
                <div className="mt-24 size-36 bold-6">
                    {APP_CONFIG.name}
                </div>
            </div>

            <div className="splash-page__tips vw-100 flex-center gap-10 size-20 tc opc-6 ani-delay-3 animate__animated animate__slideInUp">
                <span>
                    {walletRequired
                        ? t('请使用钱包环境打开！')
                        : t('欢迎来到{{name}}', { name: APP_CONFIG.name })}
                </span>

                {loading ? (
                    <Icon
                        name="loading"
                        className="size-15"
                        ariaLabel="Loading"
                    />
                ) : null}
            </div>
        </section>
    )
}
