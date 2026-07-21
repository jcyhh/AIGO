import homeIconUrl from '@/assets/layout/tabbar/home.png'
import homeActiveIconUrl from '@/assets/layout/tabbar/homeAct.png'
import swapIconUrl from '@/assets/layout/tabbar/swap.png'
import swapActiveIconUrl from '@/assets/layout/tabbar/swapAct.png'
import weightIconUrl from '@/assets/layout/tabbar/weight.png'
import weightActiveIconUrl from '@/assets/layout/tabbar/weightAct.png'
import savingIconUrl from '@/assets/layout/tabbar/saving.png'
import savingActiveIconUrl from '@/assets/layout/tabbar/savingAct.png'
import { ROUTE_PATH } from '@/router/routes'

export type MainPageItemPath =
    | typeof ROUTE_PATH.home
    | typeof ROUTE_PATH.swap
    | typeof ROUTE_PATH.weight
    | typeof ROUTE_PATH.saving

export type MainPageItem = {
    path: MainPageItemPath
    titleKey: string
    icon: string
    activeIcon: string
}

export const MAIN_PAGE_ITEMS: readonly MainPageItem[] = [
    {
        path: ROUTE_PATH.home,
        titleKey: 'nav.home',
        icon: homeIconUrl,
        activeIcon: homeActiveIconUrl,
    },
    {
        path: ROUTE_PATH.swap,
        titleKey: 'nav.swap',
        icon: swapIconUrl,
        activeIcon: swapActiveIconUrl,
    },
    {
        path: ROUTE_PATH.weight,
        titleKey: 'nav.weight',
        icon: weightIconUrl,
        activeIcon: weightActiveIconUrl,
    },
    {
        path: ROUTE_PATH.saving,
        titleKey: 'nav.saving',
        icon: savingIconUrl,
        activeIcon: savingActiveIconUrl,
    },
]
