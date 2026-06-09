import { beforeEach, describe, expect, it } from 'vitest'
import {
  appendSolve,
  computeLanguageUsage,
  computeStreakDays,
  computeTierStats,
  getRecentTimesForPuzzle,
  getSolveHistory,
  type HistoryEntry,
} from './history'
import type { Difficulty } from '../puzzles/types'

function entry(
  overrides: Partial<HistoryEntry> & { at: number },
): HistoryEntry {
  return {
    puzzleId: 'p1',
    ms: 5000,
    lang: 'python3',
    ...overrides,
  }
}

const T0 = Date.UTC(2026, 5, 8, 12, 0, 0) // noon UTC, 2026-06-08
const T1 = Date.UTC(2026, 5, 7, 12, 0, 0) // 2026-06-07
const T2 = Date.UTC(2026, 5, 6, 12, 0, 0) // 2026-06-06

beforeEach(() => {
  localStorage.clear()
})

describe('appendSolve / getSolveHistory', () => {
  it('starts empty', () => {
    expect(getSolveHistory()).toHaveLength(0)
  })

  it('persists entries in order', () => {
    appendSolve(entry({ at: T0, ms: 1000 }))
    appendSolve(entry({ at: T1, ms: 2000 }))
    const history = getSolveHistory()
    expect(history).toHaveLength(2)
    expect(history[0]!.ms).toBe(1000)
    expect(history[1]!.ms).toBe(2000)
  })
})

describe('getRecentTimesForPuzzle', () => {
  it('returns an empty array when there is no history', () => {
    expect(getRecentTimesForPuzzle('p1')).toHaveLength(0)
  })

  it('filters to the requested puzzleId', () => {
    appendSolve(entry({ at: T0, puzzleId: 'p1', ms: 1000 }))
    appendSolve(entry({ at: T1, puzzleId: 'p2', ms: 2000 }))
    expect(getRecentTimesForPuzzle('p1')).toEqual([1000])
    expect(getRecentTimesForPuzzle('p2')).toEqual([2000])
  })

  it('returns at most SPARKLINE_MAX_POINTS entries (last N)', () => {
    for (let i = 0; i < 15; i++) {
      appendSolve(entry({ at: T0 + i, ms: i * 100 }))
    }
    const times = getRecentTimesForPuzzle('p1')
    expect(times).toHaveLength(10)
    expect(times[0]).toBe(500) // i=5 (element at offset 5 in 15-element array)
  })
})

describe('computeTierStats', () => {
  it('returns zero solves for all tiers when history is empty', () => {
    const stats = computeTierStats([], () => undefined)
    for (const diff of [
      'beginner',
      'easy',
      'medium',
      'hard',
      'expert',
    ] as Difficulty[]) {
      expect(stats[diff].solves).toBe(0)
      expect(stats[diff].bestMs).toBeNull()
      expect(stats[diff].medianMs).toBeNull()
    }
  })

  it('aggregates solve times per tier', () => {
    const history = [
      entry({ at: T0, ms: 3000, puzzleId: 'a' }),
      entry({ at: T1, ms: 1000, puzzleId: 'a' }),
      entry({ at: T2, ms: 2000, puzzleId: 'b' }),
    ]
    const getDiff = (id: string): Difficulty | undefined =>
      id === 'b' ? 'easy' : 'beginner'
    const stats = computeTierStats(history, getDiff)
    expect(stats.beginner.solves).toBe(2)
    expect(stats.beginner.bestMs).toBe(1000)
    expect(stats.beginner.medianMs).toBe(2000)
    expect(stats.easy.solves).toBe(1)
    expect(stats.easy.bestMs).toBe(2000)
    expect(stats.medium.solves).toBe(0)
  })

  it('skips entries for unknown puzzles', () => {
    const history = [entry({ at: T0, ms: 1000 })]
    const stats = computeTierStats(history, () => undefined)
    expect(stats.beginner.solves).toBe(0)
  })
})

describe('computeLanguageUsage', () => {
  it('returns empty object for empty history', () => {
    expect(computeLanguageUsage([])).toEqual({})
  })

  it('counts each language separately', () => {
    const history = [
      entry({ at: T0, lang: 'python3' }),
      entry({ at: T1, lang: 'python3' }),
      entry({ at: T2, lang: 'javascript' }),
    ]
    const usage = computeLanguageUsage(history)
    expect(usage['python3']).toBe(2)
    expect(usage['javascript']).toBe(1)
  })
})

describe('computeStreakDays', () => {
  it('returns 0 for empty history', () => {
    expect(computeStreakDays([], T0)).toBe(0)
  })

  it('returns 0 when the most recent solve is not today', () => {
    const history = [entry({ at: T1 })] // yesterday only
    expect(computeStreakDays(history, T0)).toBe(0)
  })

  it('returns 1 for a single solve today', () => {
    const history = [entry({ at: T0 })]
    expect(computeStreakDays(history, T0)).toBe(1)
  })

  it('returns 2 for solves today and yesterday', () => {
    const history = [entry({ at: T0 }), entry({ at: T1 })]
    expect(computeStreakDays(history, T0)).toBe(2)
  })

  it('breaks the streak on a gap', () => {
    const history = [entry({ at: T0 }), entry({ at: T2 })] // today + 2 days ago (gap)
    expect(computeStreakDays(history, T0)).toBe(1)
  })

  it('counts 3 consecutive days', () => {
    const history = [entry({ at: T0 }), entry({ at: T1 }), entry({ at: T2 })]
    expect(computeStreakDays(history, T0)).toBe(3)
  })
})
