import { describe, expect, it } from 'vitest'
import { getBestTimeMs, recordTimeMs } from './store'

const PUZZLE = 'puzzle-a'
const FIRST_MS = 5_000
const SLOWER_MS = 8_000
const FASTER_MS = 3_000

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
