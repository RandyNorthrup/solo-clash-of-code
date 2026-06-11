/** Puzzle persistence: built-in bank merged with user-authored puzzles. */
import {
  SESSION_KEY_TEMP_PUZZLES,
  STORAGE_KEY_USER_PUZZLES,
} from '../config/constants'
import { readJson, writeJson } from '../storage/local'
import { BUILTIN_PUZZLES } from './builtin'
import type { Puzzle } from './types'

function readSessionJson<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key)
    if (raw === null) {
      return fallback
    }
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeSessionJson(key: string, value: unknown): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    throw new Error('Generated puzzle could not be stored for this session.', {
      cause: err,
    })
  }
}

export function getUserPuzzles(): readonly Puzzle[] {
  return readJson<readonly Puzzle[]>(STORAGE_KEY_USER_PUZZLES, [])
}

export function getTempPuzzles(): readonly Puzzle[] {
  return readSessionJson<readonly Puzzle[]>(SESSION_KEY_TEMP_PUZZLES, [])
}

export function getAllPuzzles(): readonly Puzzle[] {
  return [...BUILTIN_PUZZLES, ...getUserPuzzles()]
}

export function getPuzzleById(id: string): Puzzle | undefined {
  return [...getAllPuzzles(), ...getTempPuzzles()].find(
    (puzzle) => puzzle.id === id,
  )
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

export function saveTempPuzzle(puzzle: Puzzle): void {
  const others = getTempPuzzles().filter(
    (existing) => existing.id !== puzzle.id,
  )
  writeSessionJson(SESSION_KEY_TEMP_PUZZLES, [...others, puzzle])
}

export function deleteTempPuzzle(id: string): void {
  const remaining = getTempPuzzles().filter((puzzle) => puzzle.id !== id)
  writeSessionJson(SESSION_KEY_TEMP_PUZZLES, remaining)
}

export function isTempPuzzle(id: string): boolean {
  const saved = getUserPuzzles().some((puzzle) => puzzle.id === id)
  const temporary = getTempPuzzles().some((puzzle) => puzzle.id === id)
  return temporary && !saved
}
