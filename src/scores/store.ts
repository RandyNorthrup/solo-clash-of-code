/** Best-score tracking per puzzle, persisted to localStorage. */
import {
  STORAGE_KEY_BEST_SIZES,
  STORAGE_KEY_BEST_TIMES,
} from '../config/constants'
import { readJson, writeJson } from '../storage/local'

type BestScores = Record<string, number>

export interface BestTimeUpdate {
  readonly bestMs: number
  readonly improved: boolean
}

export interface BestSizeUpdate {
  readonly bestChars: number
  readonly improved: boolean
}

function readScores(key: string): BestScores {
  return readJson<BestScores>(key, {})
}

/**
 * Record a value, keeping only the smaller of the two (both completion time in
 * ms and code size in characters are "lower is better" scores).
 */
function recordLowest(
  key: string,
  puzzleId: string,
  value: number,
): { readonly best: number; readonly improved: boolean } {
  const all = readScores(key)
  const previous = all[puzzleId]
  const improved = previous === undefined || value < previous
  const best = improved ? value : previous
  if (improved) {
    writeJson(key, { ...all, [puzzleId]: value })
  }
  return { best, improved }
}

export function getBestTimeMs(puzzleId: string): number | null {
  return readScores(STORAGE_KEY_BEST_TIMES)[puzzleId] ?? null
}

/** Record a completion time, keeping only the fastest (Fastest mode score). */
export function recordTimeMs(
  puzzleId: string,
  elapsedMs: number,
): BestTimeUpdate {
  const { best, improved } = recordLowest(
    STORAGE_KEY_BEST_TIMES,
    puzzleId,
    elapsedMs,
  )
  return { bestMs: best, improved }
}

export function getBestSizeChars(puzzleId: string): number | null {
  return readScores(STORAGE_KEY_BEST_SIZES)[puzzleId] ?? null
}

/** Record a solution's code size, keeping only the smallest (Shortest mode score). */
export function recordSizeChars(
  puzzleId: string,
  chars: number,
): BestSizeUpdate {
  const { best, improved } = recordLowest(
    STORAGE_KEY_BEST_SIZES,
    puzzleId,
    chars,
  )
  return { bestChars: best, improved }
}
