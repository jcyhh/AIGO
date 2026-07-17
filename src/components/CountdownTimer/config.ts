import {
    COUNTDOWN_UNIT,
    type CountdownParts,
    type CountdownUnit,
} from '../../shared/time/calculateCountdownParts.ts'

export const COUNTDOWN_DISPLAY_UNITS = [
    COUNTDOWN_UNIT.days,
    COUNTDOWN_UNIT.hours,
    COUNTDOWN_UNIT.minutes,
    COUNTDOWN_UNIT.seconds,
] as const satisfies readonly CountdownUnit[]

export function getVisibleCountdownUnits(
    countdownParts: CountdownParts,
): readonly CountdownUnit[] {
    if (Number(countdownParts.days) > 0) return COUNTDOWN_DISPLAY_UNITS
    if (Number(countdownParts.hours) > 0) return COUNTDOWN_DISPLAY_UNITS.slice(1)

    return COUNTDOWN_DISPLAY_UNITS.slice(2)
}
