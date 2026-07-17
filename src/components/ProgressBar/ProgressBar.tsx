import type { ComponentPropsWithoutRef } from 'react'

import { calculatePercentage } from '../../shared/calculations/calculatePercentage.ts'
import type { DecimalCalculationValue } from '../../shared/calculations/decimalNumbers.ts'
import {
    PROGRESS_BAR_VARIANT,
    type ProgressBarVariant,
} from './config.ts'

import './ProgressBar.scss'

export interface ProgressBarProps extends Omit<
    ComponentPropsWithoutRef<'progress'>,
    'children' | 'max' | 'style' | 'value'
> {
    currentValue: DecimalCalculationValue
    totalValue: DecimalCalculationValue
    variant?: ProgressBarVariant
}

export function ProgressBar({
    currentValue,
    totalValue,
    variant = PROGRESS_BAR_VARIANT.solid,
    className = '',
    ...progressProps
}: ProgressBarProps) {
    const percentage = calculatePercentage(currentValue, totalValue)
    const progressClassName = [
        'app-progress-bar',
        `app-progress-bar--${variant}`,
        className,
    ].filter(Boolean).join(' ')

    return (
        <progress
            {...progressProps}
            className={progressClassName}
            value={percentage}
            max={100}
        />
    )
}
