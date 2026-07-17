import { useLocation } from 'react-router'

import { APP_CONFIG } from '@/config'
import { ROUTE_PATH, useAppNavigate } from '@/router'

import { LAYOUT_HEADER_TITLE } from '../config.ts'

import './AppBrand.scss'

const appLogoUrl = `${APP_CONFIG.routeBase}brand/app-logo.png`

type AppBrandProps = {
    className?: string
    onClick?: () => void
}

export function AppBrand({
    className = '',
    onClick,
}: AppBrandProps) {
    const location = useLocation()
    const { pushRoute } = useAppNavigate()
    const brandClassName = [
        'app-brand',
        'flex',
        'items-center',
        className,
    ].filter(Boolean).join(' ')

    function handleBrandClick() {
        if (location.pathname !== ROUTE_PATH.home) {
            pushRoute(ROUTE_PATH.home)
        }

        onClick?.()
    }

    return (
        <div className={brandClassName} onClick={handleBrandClick}>
            <img src={appLogoUrl} className="app-brand__logo" alt="Logo" />
            <div className="ml-10 size-32 bold">
                {LAYOUT_HEADER_TITLE}
            </div>
        </div>
    )
}
