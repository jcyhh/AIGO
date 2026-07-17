import type { ComponentPropsWithoutRef } from 'react'

import { DEFAULT_ICON_VIEW_BOX, getIconDefinition } from './config.ts'
import type { IconName } from './config.ts'

import './Icon.scss'

export type { IconName } from './config.ts'

export interface IconProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'color' | 'name' | 'style'> {
    name: IconName
    title?: string
    ariaLabel?: string
}

export function Icon(props: IconProps) {
    const {
        name,
        title,
        ariaLabel,
        className,
        ...svgProps
    } = props

    const icon = getIconDefinition(name)

    if (!icon) {
        return null
    }

    const iconClassName = [
        'app-icon',
        `app-icon--${name}`,
        className,
    ].filter(Boolean).join(' ')
    const accessibleName = ariaLabel ?? svgProps['aria-label'] ?? title

    return (
        <svg
            {...svgProps}
            className={iconClassName}
            viewBox={icon.viewBox ?? DEFAULT_ICON_VIEW_BOX}
            role={accessibleName ? 'img' : svgProps.role}
            aria-label={accessibleName}
            aria-hidden={accessibleName ? undefined : true}
        >
            {title ? <title>{title}</title> : null}

            {icon.paths.map((path, index) => (
                <path
                    key={`${path.d}-${index}`}
                    d={path.d}
                    fillRule={path.fillRule}
                    clipRule={path.clipRule}
                    fill="currentColor"
                />
            ))}
        </svg>
    )
}
