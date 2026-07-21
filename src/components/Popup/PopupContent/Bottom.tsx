import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '../../Icon'
import type { PopupContentTheme } from './config.ts'

import './PopupContent.scss'

export interface PopupContentBottomProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onClose' | 'title'> {
    title?: ReactNode
    onClose?: () => void
    theme?: PopupContentTheme
}

export function PopupContentBottom({
    className = '',
    children,
    title,
    theme = 'default',
    onClose,
    ...props
}: PopupContentBottomProps) {
    const { t } = useTranslation()
    const resolvedTitle = title ?? t('标题')
    const classes = [
        'popup-content',
        'popup-content--bottom',
        `popup-content--${theme}`,
        className,
    ].filter(Boolean).join(' ')

    return (
        <div className={classes} {...props}>
            <div className="popup-content__header">
                <div className="popup-content__title size-32 bold-6">{resolvedTitle}</div>
                <Icon name="cross" className="size-48 opc-6" onClick={onClose} />
            </div>

            {children}
        </div>
    )
}
