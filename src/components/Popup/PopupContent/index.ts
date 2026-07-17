import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from 'react'

import type { PopupPosition } from '../Popup.tsx'
import { PopupContentBottom } from './Bottom.tsx'
import { PopupContentCenter } from './Center.tsx'
import type { PopupContentTheme } from './config.ts'

export type PopupContentProps = Omit<ComponentPropsWithoutRef<'div'>, 'onClose' | 'title'> & {
    title?: ReactNode
    onClose?: () => void
    theme?: PopupContentTheme
}

const POPUP_CONTENT_COMPONENTS: Partial<Record<PopupPosition, ComponentType<PopupContentProps>>> = {
    center: PopupContentCenter,
    bottom: PopupContentBottom,
}

export function getPopupContentComponent(position: PopupPosition) {
    return POPUP_CONTENT_COMPONENTS[position]
}

export { PopupContentCenter } from './Center.tsx'
export { PopupContentBottom } from './Bottom.tsx'
export type { PopupContentCenterProps } from './Center.tsx'
export type { PopupContentBottomProps } from './Bottom.tsx'
export type { PopupContentTheme } from './config.ts'
