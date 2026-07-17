import {
    APP_CONFIG,
    APP_LAYOUT_MENU_TYPE,
    APP_LAYOUT_MENU_TYPE_OPTIONS,
    type AppLayoutMenuType,
} from '../config/index.ts'

export const APP_ROUTE_BASE = APP_CONFIG.routeBase

// React Router basename should not end with a trailing slash.
// React Router 的 basename 不应该以斜杠结尾。
export const APP_ROUTER_BASENAME = APP_CONFIG.routerBasename

export const APP_HOME_ROUTE_NAME = APP_CONFIG.homeRouteName

export const LAYOUT_MENU_TYPE = APP_LAYOUT_MENU_TYPE

export const LAYOUT_MENU_TYPE_OPTIONS = APP_LAYOUT_MENU_TYPE_OPTIONS

export type LayoutMenuType = AppLayoutMenuType

export const DEFAULT_LAYOUT_MENU_TYPE = APP_CONFIG.defaultLayoutMenuType
