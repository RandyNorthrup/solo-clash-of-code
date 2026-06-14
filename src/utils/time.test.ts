import { describe, expect, it } from 'vitest'
import {
  formatClashClock,
  formatCountdown,
  formatStopwatch,
  minutesToMs,
} from './time'

describe('minutesToMs', () => {
  it('converts minutes to milliseconds', () => {
    expect(minutesToMs(1)).toBe(60_000)
    expect(minutesToMs(10)).toBe(600_000)
  })
})

describe('formatStopwatch', () => {
  it('formats as m:ss.t', () => {
    expect(formatStopwatch(0)).toBe('0:00.0')
    expect(formatStopwatch(5_900)).toBe('0:05.9')
    expect(formatStopwatch(67_400)).toBe('1:07.4')
  })

  it('clamps negative input to zero', () => {
    expect(formatStopwatch(-50)).toBe('0:00.0')
  })
})

describe('formatCountdown', () => {
  it('formats as mm:ss, rounding up partial seconds', () => {
    expect(formatCountdown(600_000)).toBe('10:00')
    expect(formatCountdown(59_000)).toBe('00:59')
    expect(formatCountdown(1)).toBe('00:01')
  })

  it('never goes below zero', () => {
    expect(formatCountdown(0)).toBe('00:00')
    expect(formatCountdown(-1_000)).toBe('00:00')
  })
})

describe('formatClashClock', () => {
  it('splits into padded minute/second parts (the "12MN 27SC" readout)', () => {
    expect(formatClashClock(747_000)).toEqual({ minutes: '12', seconds: '27' })
    expect(formatClashClock(600_000)).toEqual({ minutes: '10', seconds: '00' })
    expect(formatClashClock(59_000)).toEqual({ minutes: '00', seconds: '59' })
  })

  it('rounds up partial seconds and clamps at zero', () => {
    expect(formatClashClock(1)).toEqual({ minutes: '00', seconds: '01' })
    expect(formatClashClock(-5_000)).toEqual({ minutes: '00', seconds: '00' })
  })
})
