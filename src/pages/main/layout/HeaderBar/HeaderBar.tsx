import { useEffect, useRef } from 'react'

import headerMenuUrl from '@/assets/layout/headbar/menu.png'

import { LanguageSwitch } from '@/components/LanguageSwitch'
import { APP_CONFIG, APP_LOGIN_MODE } from '@/config/index.ts'
import { maskWalletAddress } from '@/shared/formatters/maskWalletAddress.ts'
import { useDappStore } from '@/stores/dapp/index.ts'
import { useUserStore } from '@/stores/user/index.ts'

import { AppBrand } from '../AppBrand/AppBrand.tsx'
import {
    DEFAULT_HEADER_BACKGROUND_SCROLL_DISTANCE,
    HEADER_BAR_BACKGROUND_TYPE,
    type HeaderBarBackgroundType,
} from './config.ts'

import './HeaderBar.scss'

type HeaderBarProps = {
    showGap?: boolean
    showSidebarMenu?: boolean
    onSidebarMenuClick?: () => void
    backgroundType?: HeaderBarBackgroundType
    backgroundScrollDistance?: number
}

export function HeaderBar({
    showGap = true,
    showSidebarMenu = false,
    onSidebarMenuClick,
    backgroundType = HEADER_BAR_BACKGROUND_TYPE.solid,
    backgroundScrollDistance = DEFAULT_HEADER_BACKGROUND_SCROLL_DISTANCE,
}: HeaderBarProps) {
    const backgroundRef = useRef<HTMLDivElement>(null)
    const walletAddress = useDappStore((state) => state.walletAddress)
    const isAuthenticated = useUserStore((state) => state.isAuthenticated)
    const userLevelIcon = useUserStore((state) => state.userProfile?.level?.icon?.trim() ?? '')
    const showWalletAddress =
        APP_CONFIG.loginMode !== APP_LOGIN_MODE.account &&
        isAuthenticated &&
        walletAddress
    const headerBarClassName = backgroundType === HEADER_BAR_BACKGROUND_TYPE.scrollOpacity
        ? 'app-header-bar app-header-bar--scroll-opacity vw-100'
        : 'app-header-bar vw-100'

    useEffect(() => {
        const background = backgroundRef.current

        if (!background) return undefined

        const backgroundElement = background

        if (backgroundType !== HEADER_BAR_BACKGROUND_TYPE.scrollOpacity) {
            backgroundElement.style.opacity = '1'
            return undefined
        }

        let animationFrame = 0

        function updateOpacity() {
            animationFrame = 0
            const distance = Math.max(backgroundScrollDistance, 1)
            const opacity = Math.min(Math.max(window.scrollY / distance, 0), 1)

            backgroundElement.style.opacity = String(opacity)
        }

        function handleScroll() {
            if (animationFrame) return

            animationFrame = window.requestAnimationFrame(updateOpacity)
        }

        updateOpacity()
        window.addEventListener('scroll', handleScroll, { passive: true })

        return () => {
            window.removeEventListener('scroll', handleScroll)

            if (animationFrame) {
                window.cancelAnimationFrame(animationFrame)
            }
        }
    }, [backgroundScrollDistance, backgroundType])

    return (
        <header>
            <div className={headerBarClassName}>
                <div ref={backgroundRef} className="app-header-bar-bg backdrop" />
                <div className="safe-top" />
                <div className="flex justify-between items-center header rel">
                    <AppBrand />
                    <div className="flex items-center">
                        {userLevelIcon ? (
                            <img
                                src={userLevelIcon}
                                className="app-header-bar__level-icon img-52 mr-20"
                                alt=""
                            />
                        ) : null}
                        <LanguageSwitch />
                        {showWalletAddress ? (
                            <div className="auto-btn size-24 bold-6 ml-20">
                                {maskWalletAddress(walletAddress)}
                            </div>
                        ) : null}
                        {showSidebarMenu ? (
                            <img
                                src={headerMenuUrl}
                                className="img-52 ml-20"
                                alt="Menu"
                                onClick={onSidebarMenuClick}
                            />
                        ) : null}
                    </div>
                </div>
            </div>
            {showGap ? <div className="gap-100" /> : null}
        </header>
    )
}
