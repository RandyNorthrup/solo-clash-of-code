import { describe, expect, it } from 'vitest'
import {
  getBestSizeChars,
  getBestTimeMs,
  recordSizeChars,
  recordTimeMs,
} from './store'

const PUZZLE = 'puzzle-a'
const FIRST_MS = 5_000
const SLOWER_MS = 8_000
const FASTER_MS = 3_000
const FIRST_CHARS = 240
const LARGER_CHARS = 300
const SMALLER_CHARS = 180

describe('best-time store', () => {
  it('returns null when no time is recorded', () => {
    expect(getBestTimeMs(PUZZLE)).toBeNull()
  })

  it('records the first time as the best', () => {
    const update = recordTimeMs(PUZZLE, FIRST_MS)
    expect(update.improved).toBe(true)
    expect(update.bestMs).toBe(FIRST_MS)
    expect(getBestTimeMs(PUZZLE)).toBe(FIRST_MS)
  })

  it('keeps the fastest and ignores slower times', () => {
    recordTimeMs(PUZZLE, FIRST_MS)

    const slower = recordTimeMs(PUZZLE, SLOWER_MS)
    expect(slower.improved).toBe(false)
    expect(slower.bestMs).toBe(FIRST_MS)

    const faster = recordTimeMs(PUZZLE, FASTER_MS)
    expect(faster.improved).toBe(true)
    expect(getBestTimeMs(PUZZLE)).toBe(FASTER_MS)
  })
})

describe('best-size store (Shortest mode)', () => {
  it('returns null when no size is recorded', () => {
    expect(getBestSizeChars(PUZZLE)).toBeNull()
  })

  it('records the first size and keeps only the smallest', () => {
    const first = recordSizeChars(PUZZLE, FIRST_CHARS)
    expect(first.improved).toBe(true)
    expect(first.bestChars).toBe(FIRST_CHARS)

    const larger = recordSizeChars(PUZZLE, LARGER_CHARS)
    expect(larger.improved).toBe(false)
    expect(larger.bestChars).toBe(FIRST_CHARS)

    const smaller = recordSizeChars(PUZZLE, SMALLER_CHARS)
    expect(smaller.improved).toBe(true)
    expect(getBestSizeChars(PUZZLE)).toBe(SMALLER_CHARS)
  })

  it('keeps size and time scores independent', () => {
    recordTimeMs(PUZZLE, FIRST_MS)
    recordSizeChars(PUZZLE, FIRST_CHARS)
    expect(getBestTimeMs(PUZZLE)).toBe(FIRST_MS)
    expect(getBestSizeChars(PUZZLE)).toBe(FIRST_CHARS)
  })
})
