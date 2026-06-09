/** Best-time tracking per puzzle, persisted to localStorage. */
import { STORAGE_KEY_BEST_TIMES } from '../config/constants'
import { readJson, writeJson } from '../storage/local'

type BestTimes = Record<string, number>

export interface BestTimeUpdate {
  readonly bestMs: number
  readonly improved: boolean
}

function readAll(): BestTimes {
  return readJson<BestTimes>(STORAGE_KEY_BEST_TIMES, {})
}

export function getBestTimeMs(puzzleId: string): number | null {
  const value = readAll()[puzzleId]
  return value ?? null
}

/** Record a completion time, keeping only the fastest. */
export function recordTimeMs(
  puzzleId: string,
  elapsedMs: number,
): BestTimeUpdate {
  const all = readAll()
  const previous = all[puzzleId]
  const improved = previous === undefined || elapsedMs < previous
  const bestMs = improved ? elapsedMs : previous
  if (improved) {
    writeJson(STORAGE_KEY_BEST_TIMES, { ...all, [puzzleId]: elapsedMs })
  }
  return { bestMs, improved }
}
