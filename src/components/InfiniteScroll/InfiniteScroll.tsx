import type {
    ComponentPropsWithoutRef,
    ReactNode,
} from 'react'
import {
    useEffect,
    useRef,
} from 'react'

import './InfiniteScroll.scss'

export interface InfiniteScrollProps extends Omit<
    ComponentPropsWithoutRef<'div'>,
    'children' | 'style'
> {
    children: ReactNode
    loading: boolean
    hasMore: boolean
    onLoadMore: () => void | Promise<void>
    disabled?: boolean
    rootMargin?: string
    sentinelClassName?: string
}

function getScrollParent(element: HTMLElement | null): HTMLElement | null {
    let node = element?.parentElement ?? null

    while (node && node !== document.body) {
        const { overflowY } = window.getComputedStyle(node)

        if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
            return node
        }

        node = node.parentElement
    }

    return null
}

export function InfiniteScroll({
    children,
    loading,
    hasMore,
    onLoadMore,
    disabled = false,
    rootMargin = '0px 0px 120px',
    sentinelClassName = '',
    className = '',
    ...scrollProps
}: InfiniteScrollProps) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const sentinelRef = useRef<HTMLDivElement | null>(null)
    const onLoadMoreRef = useRef(onLoadMore)
    const loadMoreLockRef = useRef(false)
    const scrollClassName = [
        'infinite-scroll',
        className,
    ].filter(Boolean).join(' ')
    const sentinelClasses = [
        'infinite-scroll__sentinel',
        sentinelClassName,
    ].filter(Boolean).join(' ')

    useEffect(() => {
        onLoadMoreRef.current = onLoadMore
    }, [onLoadMore])

    useEffect(() => {
        if (!loading) {
            loadMoreLockRef.current = false
        }
    }, [loading])

    useEffect(() => {
        const sentinel = sentinelRef.current
        const container = containerRef.current

        if (!sentinel || !container || typeof IntersectionObserver === 'undefined') {
            return undefined
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0]

                if (!entry?.isIntersecting || loading || !hasMore || disabled) {
                    return
                }

                if (loadMoreLockRef.current) {
                    return
                }

                loadMoreLockRef.current = true
                const result = onLoadMoreRef.current()

                if (result) {
                    void result.finally(() => {
                        loadMoreLockRef.current = false
                    })
                    return
                }

                queueMicrotask(() => {
                    loadMoreLockRef.current = false
                })
            },
            {
                root: getScrollParent(container),
                rootMargin,
                threshold: 0,
            },
        )

        observer.observe(sentinel)

        return () => {
            observer.disconnect()
        }
    }, [
        disabled,
        hasMore,
        loading,
        rootMargin,
    ])

    return (
        <div
            {...scrollProps}
            ref={containerRef}
            className={scrollClassName}
        >
            {children}
            <div
                ref={sentinelRef}
                className={sentinelClasses}
                aria-hidden="true"
            />
        </div>
    )
}
