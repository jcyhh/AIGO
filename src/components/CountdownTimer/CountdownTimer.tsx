import { useEffect, useState, type ComponentPropsWithoutRef } from 'react'

import { APP_CONFIG } from '../../config/index.ts'
import {
    calculateCountdownParts,
    type CountdownTimeValue,
} from '../../shared/time/calculateCountdownParts.ts'
import { getVisibleCountdownUnits } from './config.ts'

import './CountdownTimer.scss'

export interface CountdownTimerProps extends Omit<
    ComponentPropsWithoutRef<'div'>,
    'children' | 'style'
> {
    targetTime: CountdownTimeValue
    now?: CountdownTimeValue
    timeZone?: string
}

export function CountdownTimer({
    targetTime,
    now,
    timeZone = APP_CONFIG.timeZone,
    className = '',
    ...countdownProps
}: CountdownTimerProps) {
    const [currentTime, setCurrentTime] = useState<CountdownTimeValue>(
        () => now ?? new Date(),
    )
    const countdownParts = calculateCountdownParts({
        targetTime,
        now: currentTime,
        timeZone,
    })
    const visibleUnits = getVisibleCountdownUnits(countdownParts)
    const countdownClassName = [
        'app-countdown-timer',
        'flex-center',
        className,
    ].filter(Boolean).join(' ')

    useEffect(() => {
        if (now !== undefined) {
            setCurrentTime(now)
            return undefined
        }

        const timer = window.setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => {
            window.clearInterval(timer)
        }
    }, [now])

    return (
        <div {...countdownProps} className={countdownClassName}>
            {visibleUnits.map((unit, index) => (
                <div className="app-countdown-timer__item flex-center" key={unit}>
                    <span className="app-countdown-timer__unit flex-center size-48 bold-7">
                        {countdownParts[unit]}
                    </span>
                    {index < visibleUnits.length - 1 ? (
                        <span className="app-countdown-timer__separator size-48 bold-7">
                            :
                        </span>
                    ) : null}
                </div>
            ))}
        </div>
    )
}
