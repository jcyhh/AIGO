import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import { APP_CONFIG } from '../src/config/app.ts'
import {
    calculateCountdownParts,
    COUNTDOWN_UNIT,
} from '../src/shared/time/calculateCountdownParts.ts'

test('countdown calculation uses the configured project timezone and pads all units', () => {
    const result = calculateCountdownParts({
        targetTime: '2026-07-23T20:48:56+08:00',
        now: '2026-07-17T08:00:00+08:00',
    })

    assert.equal(APP_CONFIG.timeZone, 'Asia/Shanghai')
    assert.deepEqual(result, {
        [COUNTDOWN_UNIT.days]: '06',
        [COUNTDOWN_UNIT.hours]: '12',
        [COUNTDOWN_UNIT.minutes]: '48',
        [COUNTDOWN_UNIT.seconds]: '56',
    })
})

test('countdown calculation clamps expired or invalid values to zero', () => {
    assert.deepEqual(
        calculateCountdownParts({
            targetTime: '2026-07-17T07:59:59+08:00',
            now: '2026-07-17T08:00:00+08:00',
        }),
        {
            [COUNTDOWN_UNIT.days]: '00',
            [COUNTDOWN_UNIT.hours]: '00',
            [COUNTDOWN_UNIT.minutes]: '00',
            [COUNTDOWN_UNIT.seconds]: '00',
        },
    )
    assert.deepEqual(
        calculateCountdownParts({
            targetTime: 'invalid',
            now: '2026-07-17T08:00:00+08:00',
        }),
        {
            [COUNTDOWN_UNIT.days]: '00',
            [COUNTDOWN_UNIT.hours]: '00',
            [COUNTDOWN_UNIT.minutes]: '00',
            [COUNTDOWN_UNIT.seconds]: '00',
        },
    )
})

test('countdown time module reads APP_CONFIG timezone and shared two digit formatter', async () => {
    const source = await readFile('src/shared/time/calculateCountdownParts.ts', 'utf8')

    assert.match(source, /APP_CONFIG\.timeZone/)
    assert.match(source, /formatTwoDigitNumber/)
    assert.match(source, /COUNTDOWN_UNIT/)
})
