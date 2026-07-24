import { APP_CONFIG } from '@/config/index.ts'
import { ROUTE_PATH } from '@/router/routes.ts'

export const SPLASH_ANIMATION_DURATION = 1000

function getCurrentPathname(): string {
    if (typeof window === 'undefined') return ROUTE_PATH.root
    return window.location.pathname
}

function stripRouterBasename(pathname: string): string {
    const basename = String(APP_CONFIG.routerBasename)

    if (!basename || basename === '/') return pathname || ROUTE_PATH.root
    if (pathname === basename) return ROUTE_PATH.root
    if (pathname.startsWith(`${basename}/`)) {
        return pathname.slice(basename.length) || ROUTE_PATH.root
    }

    return pathname || ROUTE_PATH.root
}

export function isSplashRoutePath(pathname = getCurrentPathname()): boolean {
    const routePath = stripRouterBasename(pathname)

    return routePath === ROUTE_PATH.root || routePath.startsWith('/ref/')
}

export function waitForSplashAnimation(): Promise<void> {
    if (typeof window === 'undefined') return Promise.resolve()

    return new Promise((resolve) => {
        window.setTimeout(resolve, SPLASH_ANIMATION_DURATION)
    })
}
