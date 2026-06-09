/** Per-solve history: append-only log used to compute stats and sparklines. */
import {
  HALF_DIVISOR,
  SPARKLINE_MAX_POINTS,
  STORAGE_KEY_SOLVE_HISTORY,
} from '../config/constants'
import { DIFFICULTIES, type Difficulty } from '../puzzles/types'
import { readJson, writeJson } from '../storage/local'

export interface HistoryEntry {
  readonly puzzleId: string
  readonly ms: number
  readonly lang: string
  /** Unix timestamp (Date.now()) of the solve. */
  readonly at: number
}

export interface TierStats {
  readonly solves: number
  readonly bestMs: number | null
  readonly medianMs: number | null
}

export function appendSolve(entry: HistoryEntry): void {
  const history = readJson<HistoryEntry[]>(STORAGE_KEY_SOLVE_HISTORY, [])
  writeJson(STORAGE_KEY_SOLVE_HISTORY, [...history, entry])
}

export function getSolveHistory(): readonly HistoryEntry[] {
  return readJson<HistoryEntry[]>(STORAGE_KEY_SOLVE_HISTORY, [])
}

/** Last `SPARKLINE_MAX_POINTS` times for a given puzzle, oldest first. */
export function getRecentTimesForPuzzle(puzzleId: string): readonly number[] {
  const history = getSolveHistory()
  const times = history.filter((e) => e.puzzleId === puzzleId).map((e) => e.ms)
  return times.slice(-SPARKLINE_MAX_POINTS)
}

function median(sorted: readonly number[]): number | null {
  if (sorted.length === 0) {
    return null
  }
  const mid = Math.floor(sorted.length / HALF_DIVISOR)
  if (sorted.length % HALF_DIVISOR === 1) {
    return sorted[mid] ?? null
  }
  const a = sorted[mid - 1] ?? 0
  const b = sorted[mid] ?? 0
  return (a + b) / HALF_DIVISOR
}

/**
 * Aggregate solve times by difficulty tier. Pass a `getDifficulty` resolver
 * that maps a puzzleId to its tier; entries for unknown puzzles are ignored.
 */
export function computeTierStats(
  history: readonly HistoryEntry[],
  getDifficulty: (puzzleId: string) => Difficulty | undefined,
): Record<Difficulty, TierStats> {
  const grouped: Record<Difficulty, number[]> = {
    beginner: [],
    easy: [],
    medium: [],
    hard: [],
    expert: [],
  }
  for (const entry of history) {
    const diff = getDifficulty(entry.puzzleId)
    if (diff !== undefined) {
      grouped[diff].push(entry.ms)
    }
  }
  const result = {} as Record<Difficulty, TierStats>
  for (const diff of DIFFICULTIES) {
    const times = grouped[diff]
    const sorted = [...times].sort((a, b) => a - b)
    result[diff] = {
      solves: times.length,
      bestMs: sorted[0] ?? null,
      medianMs: median(sorted),
    }
  }
  return result
}

/** Count of solves per language key, in any order. */
export function computeLanguageUsage(
  history: readonly HistoryEntry[],
): Record<string, number> {
  const usage: Record<string, number> = {}
  for (const entry of history) {
    usage[entry.lang] = (usage[entry.lang] ?? 0) + 1
  }
  return usage
}

function toUtcDateKey(ms: number): string {
  const d = new Date(ms)
  return `${String(d.getUTCFullYear())}-${String(d.getUTCMonth() + 1)}-${String(d.getUTCDate())}`
}

/**
 * Consecutive calendar days (UTC) with ≥1 solve, counting back from today
 * (`nowMs`). Returns 0 if today has no solve.
 */
export function computeStreakDays(
  history: readonly HistoryEntry[],
  nowMs: number,
): number {
  if (history.length === 0) {
    return 0
  }
  const days = new Set(history.map((e) => toUtcDateKey(e.at)))
  let streak = 0
  const todayUtc = new Date(nowMs)
  for (let i = 0; i <= days.size; i++) {
    const d = new Date(
      Date.UTC(
        todayUtc.getUTCFullYear(),
        todayUtc.getUTCMonth(),
        todayUtc.getUTCDate() - i,
      ),
    )
    if (days.has(toUtcDateKey(d.getTime()))) {
      streak++
    } else {
      break
    }
  }
  return streak
}
