/** Time formatting helpers used by the stopwatch and countdown clock. */
import {
  DECIMAL_BASE,
  MILLISECONDS_PER_SECOND,
  SECONDS_PER_MINUTE,
  TIME_PAD_CHAR,
  TIME_PAD_LENGTH,
} from '../config/constants'

/** Milliseconds in one tenth of a second, used for stopwatch fractions. */
const MS_PER_TENTH = MILLISECONDS_PER_SECOND / DECIMAL_BASE

function pad(value: number): string {
  return value.toString().padStart(TIME_PAD_LENGTH, TIME_PAD_CHAR)
}

export function minutesToMs(minutes: number): number {
  return minutes * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND
}

/** Stopwatch display, e.g. "1:07.4". */
export function formatStopwatch(elapsedMs: number): string {
  const clamped = Math.max(0, elapsedMs)
  const totalSeconds = Math.floor(clamped / MILLISECONDS_PER_SECOND)
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE)
  const seconds = totalSeconds % SECONDS_PER_MINUTE
  const tenths = Math.floor((clamped % MILLISECONDS_PER_SECOND) / MS_PER_TENTH)
  return `${minutes.toString()}:${pad(seconds)}.${tenths.toString()}`
}

/** Countdown display, e.g. "09:58". */
export function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(
    0,
    Math.ceil(remainingMs / MILLISECONDS_PER_SECOND),
  )
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE)
  const seconds = totalSeconds % SECONDS_PER_MINUTE
  return `${pad(minutes)}:${pad(seconds)}`
}

/**
 * Countdown split into padded minute/second parts for the Clash-of-Code style
 * readout, e.g. `{ minutes: '12', seconds: '27' }` rendered as "12MN 27SC".
 */
export function formatClashClock(remainingMs: number): {
  readonly minutes: string
  readonly seconds: string
} {
  const totalSeconds = Math.max(
    0,
    Math.ceil(remainingMs / MILLISECONDS_PER_SECOND),
  )
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE)
  const seconds = totalSeconds % SECONDS_PER_MINUTE
  return { minutes: pad(minutes), seconds: pad(seconds) }
}
