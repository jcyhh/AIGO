import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('header bar only renders a masked wallet address after wallet login', async () => {
    const component = await readFile('src/pages/main/layout/HeaderBar/HeaderBar.tsx', 'utf8')

    assert.match(component, /APP_CONFIG/)
    assert.match(component, /APP_LOGIN_MODE/)
    assert.match(component, /import \{ LanguageSwitch \} from '@\/components\/LanguageSwitch'/)
    assert.doesNotMatch(component, /headerLangUrl/)
    assert.match(component, /<LanguageSwitch \/>/)
    assert.match(component, /useDappStore/)
    assert.match(component, /useUserStore/)
    assert.match(component, /maskWalletAddress/)
    assert.match(component, /className="auto-btn size-24 bold-6 ml-20"/)
    assert.match(
        component,
        /APP_CONFIG\.loginMode !== APP_LOGIN_MODE\.account/,
    )
    assert.match(component, /isAuthenticated\s*&&\s*walletAddress/)
    assert.match(component, /\{maskWalletAddress\(walletAddress\)\}/)
    assert.doesNotMatch(component, /t\('链接'\)/)
})

test('header bar renders the 100px gap by default and allows hiding it', async () => {
    const component = await readFile('src/pages/main/layout/HeaderBar/HeaderBar.tsx', 'utf8')

    assert.match(component, /type HeaderBarProps/)
    assert.match(component, /showGap\?: boolean/)
    assert.match(component, /showGap = true/)
    assert.match(component, /showGap \? <div className="gap-100" \/> : null/)
})

test('header menu icon only renders in sidebar layout mode', async () => {
    const component = await readFile('src/pages/main/layout/HeaderBar/HeaderBar.tsx', 'utf8')
    const layout = await readFile('src/pages/main/layout/MainLayout.tsx', 'utf8')

    assert.match(component, /showSidebarMenu\?: boolean/)
    assert.match(component, /onSidebarMenuClick\?: \(\) => void/)
    assert.match(component, /showSidebarMenu = false/)
    assert.match(component, /showSidebarMenu \? \(/)
    assert.match(component, /src=\{headerMenuUrl\}/)
    assert.match(component, /onClick=\{onSidebarMenuClick\}/)
    assert.match(component, /alt="Menu"/)
    assert.match(layout, /<HeaderBar/)
    assert.match(layout, /showSidebarMenu=\{isSidebarLayout\}/)
    assert.match(layout, /onSidebarMenuClick=\{handleOpenSidebarMenu\}/)
})

test('main layout uses the scroll-opacity header background only on the home route', async () => {
    const layout = await readFile('src/pages/main/layout/MainLayout.tsx', 'utf8')

    assert.match(layout, /import \{ Outlet, useLocation \} from 'react-router'/)
    assert.match(layout, /import \{ ROUTE_PATH \} from '@\/router\/routes'/)
    assert.match(layout, /HEADER_BAR_BACKGROUND_TYPE/)
    assert.match(layout, /const location = useLocation\(\)/)
    assert.match(layout, /location\.pathname === ROUTE_PATH\.home/)
    assert.match(layout, /headerBackgroundType/)
    assert.match(layout, /HEADER_BAR_BACKGROUND_TYPE\.scrollOpacity/)
    assert.match(layout, /HEADER_BAR_BACKGROUND_TYPE\.solid/)
    assert.match(layout, /backgroundType=\{headerBackgroundType\}/)
    assert.match(layout, /showHeaderGap/)
    assert.match(layout, /showGap=\{showHeaderGap\}/)
})

test('header bar supports scroll-driven background opacity only on the background layer', async () => {
    const component = await readFile('src/pages/main/layout/HeaderBar/HeaderBar.tsx', 'utf8')
    const styles = await readFile('src/pages/main/layout/HeaderBar/HeaderBar.scss', 'utf8')
    const colors = await readFile('src/styles/color.scss', 'utf8')

    assert.match(component, /import \{ useEffect, useRef \} from 'react'/)
    assert.match(component, /HEADER_BAR_BACKGROUND_TYPE/)
    assert.match(component, /backgroundType\?: HeaderBarBackgroundType/)
    assert.match(component, /backgroundType = HEADER_BAR_BACKGROUND_TYPE\.solid/)
    assert.match(component, /backgroundScrollDistance\?: number/)
    assert.match(
        component,
        /backgroundScrollDistance = DEFAULT_HEADER_BACKGROUND_SCROLL_DISTANCE/,
    )
    assert.match(component, /const backgroundRef = useRef<HTMLDivElement>\(null\)/)
    assert.match(component, /backgroundElement\.style\.opacity/)
    assert.match(
        component,
        /window\.addEventListener\('scroll', handleScroll, \{ passive: true \}\)/,
    )
    assert.match(component, /window\.removeEventListener\('scroll', handleScroll\)/)
    assert.match(component, /className=\{headerBarClassName\}/)
    assert.match(
        component,
        /<div ref=\{backgroundRef\} className="app-header-bar-bg backdrop" \/>/,
    )
    assert.doesNotMatch(component, /className="app-header-bar vw-100 backdrop"/)

    assert.match(styles, /\.app-header-bar-bg\s*\{/)
    assert.match(styles, /background-color: var\(--app-header-bg\);/)
    assert.match(
        styles,
        /&--scroll-opacity\s*\{[\s\S]*\.app-header-bar-bg\s*\{[\s\S]*opacity: 0;/,
    )
    assert.match(colors, /--app-header-bg: rgba\(0, 0, 0, 0\.3\);/)
})
