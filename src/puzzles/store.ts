/** Puzzle persistence: built-in bank merged with user-authored puzzles. */
import { STORAGE_KEY_USER_PUZZLES } from '../config/constants'
import { readJson, writeJson } from '../storage/local'
import { BUILTIN_PUZZLES } from './builtin'
import type { Puzzle } from './types'

export function getUserPuzzles(): readonly Puzzle[] {
  return readJson<readonly Puzzle[]>(STORAGE_KEY_USER_PUZZLES, [])
}

export function getAllPuzzles(): readonly Puzzle[] {
  return [...BUILTIN_PUZZLES, ...getUserPuzzles()]
}

export function getPuzzleById(id: string): Puzzle | undefined {
  return getAllPuzzles().find((puzzle) => puzzle.id === id)
}

export function saveUserPuzzle(puzzle: Puzzle): void {
  const others = getUserPuzzles().filter(
    (existing) => existing.id !== puzzle.id,
  )
  writeJson(STORAGE_KEY_USER_PUZZLES, [...others, puzzle])
}

export function deleteUserPuzzle(id: string): void {
  const remaining = getUserPuzzles().filter((puzzle) => puzzle.id !== id)
  writeJson(STORAGE_KEY_USER_PUZZLES, remaining)
}
