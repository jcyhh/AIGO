import { useLocation } from 'react-router'

import { Icon } from '@/components/Icon'
import { ROUTE_PATH, useAppNavigate } from '@/router'

import './SecondaryHeader.scss'

export interface SecondaryHeaderProps {
    title: string
    showGap?: boolean
}

export function SecondaryHeader({
    title,
    showGap = true,
}: SecondaryHeaderProps) {
    const location = useLocation()
    const { backRoute, replaceRoute } = useAppNavigate()

    function handleBackClick() {
        if (location.key === 'default') {
            replaceRoute(ROUTE_PATH.home)
            return
        }

        backRoute()
    }

    return (
        <div>
            <div className="secondary-header vw-100">
                <div className="safe-top" />
                <div className="secondary-header-bar flex items-center">
                    <div className="flex items-center flex-1">
                        <Icon
                            name="arrow-left"
                            className="size-40"
                            onClick={handleBackClick}
                        />
                    </div>
                    <div className="flex-center flex-2 size-30 bold-6">{title}</div>
                    <div className="flex justify-end items-center flex-1" />
                </div>
            </div>
            {showGap ? (
                <>
                    <div className="safe-top" />
                    <div className="gap-100" />
                </>
            ) : null}
        </div>
    )
}
