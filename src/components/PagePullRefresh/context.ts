import {
    createContext,
    useContext,
    useLayoutEffect,
} from 'react'

export type PageRefreshHandler = () => Promise<void> | void

export interface PageRefreshContextValue {
    registerPageRefresh: (handler: PageRefreshHandler) => () => void
}

export const PageRefreshContext = createContext<PageRefreshContextValue | null>(null)

export function usePageRefresh(onRefresh: PageRefreshHandler, enabled = true) {
    const context = useContext(PageRefreshContext)

    useLayoutEffect(() => {
        if (!context || !enabled) return undefined

        return context.registerPageRefresh(onRefresh)
    }, [context, enabled, onRefresh])
}
