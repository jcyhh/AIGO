import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'

import {
    DEFAULT_LAYOUT_MENU_TYPE,
    LAYOUT_MENU_TYPE,
    type LayoutMenuType,
} from '@/router/config'
import { ROUTE_PATH } from '@/router/routes'

import { HeaderBar } from './HeaderBar/HeaderBar.tsx'
import { HEADER_BAR_BACKGROUND_TYPE } from './HeaderBar/config.ts'
import { SidebarMenu } from './SidebarMenu.tsx'
import { TabbarMenu } from './TabbarMenu.tsx'
import './MainLayout.scss'

type MainLayoutProps = {
    menuType?: LayoutMenuType
}

export function MainLayout({
    menuType = DEFAULT_LAYOUT_MENU_TYPE,
}: MainLayoutProps) {
    const location = useLocation()
    const [showSidebarMenu, setShowSidebarMenu] = useState(false)
    const isSidebarLayout = menuType === LAYOUT_MENU_TYPE.sidebar
    const isTabbarLayout = menuType === LAYOUT_MENU_TYPE.tabbar
    const headerBackgroundType = location.pathname === ROUTE_PATH.home
        ? HEADER_BAR_BACKGROUND_TYPE.scrollOpacity
        : HEADER_BAR_BACKGROUND_TYPE.solid
    const showHeaderGap = headerBackgroundType !== HEADER_BAR_BACKGROUND_TYPE.scrollOpacity
    const appLayoutClassName = isTabbarLayout
        ? 'app-layout app-layout--tabbar vw-100 min-vh-100'
        : 'app-layout vw-100 min-vh-100'

    function handleOpenSidebarMenu() {
        setShowSidebarMenu(true)
    }

    function handleCloseSidebarMenu() {
        setShowSidebarMenu(false)
    }

    return (
        <div className={appLayoutClassName}>
            <HeaderBar
                showSidebarMenu={isSidebarLayout}
                onSidebarMenuClick={handleOpenSidebarMenu}
                backgroundType={headerBackgroundType}
                showGap={showHeaderGap}
            />

            <div className="app-layout__body">
                <main className="app-layout__main">
                    <Outlet />
                </main>
            </div>

            {isSidebarLayout ? (
                <SidebarMenu
                    show={showSidebarMenu}
                    onClose={handleCloseSidebarMenu}
                />
            ) : null}
            {isTabbarLayout ? <TabbarMenu /> : null}
        </div>
    )
}
