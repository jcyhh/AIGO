import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { Icon } from '../../Icon'
import type { PopupContentTheme } from './config.ts'

import './PopupContent.scss'

export interface PopupContentCenterProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onClose' | 'title'> {
    title?: ReactNode
    onClose?: () => void
    theme?: PopupContentTheme
}

export function PopupContentCenter({
    className = '',
    children,
    title = '标题',
    theme = 'default',
    onClose,
    ...props
}: PopupContentCenterProps) {
    const classes = [
        'popup-content',
        'popup-content--center',
        `popup-content--${theme}`,
        className,
    ].filter(Boolean).join(' ')

    return (
        <div className={classes} {...props}>
            <div className="popup-content__header">
                <div className="popup-content__title size-32 bold-6">{title}</div>
                <Icon name="cross" className="size-48 opc-6" onClick={onClose} />
            </div>

            {children}
        </div>
    )
}
