import { describe, expect, it } from 'vitest'
import { BUILTIN_PUZZLES } from './builtin'
import {
  deleteTempPuzzle,
  deleteUserPuzzle,
  getAllPuzzles,
  getPuzzleById,
  getTempPuzzles,
  getUserPuzzles,
  isTempPuzzle,
  saveUserPuzzle,
  saveTempPuzzle,
} from './store'
import type { Puzzle } from './types'

function userPuzzle(overrides: Partial<Puzzle>): Puzzle {
  return {
    id: 'custom-1',
    title: 'Custom',
    difficulty: 'easy',
    statement: 's',
    constraints: 'c',
    inputSpec: 'i',
    outputSpec: 'o',
    source: 'user',
    testcases: [
      {
        id: 'custom-1-0',
        title: 'c',
        input: '1',
        expectedOutput: '1',
        hidden: false,
      },
    ],
    ...overrides,
  }
}

describe('puzzle store', () => {
  it('merges built-in and user puzzles', () => {
    saveUserPuzzle(userPuzzle({}))
    const all = getAllPuzzles()
    expect(all).toHaveLength(BUILTIN_PUZZLES.length + 1)
  })

  it('finds built-in and user puzzles by id', () => {
    saveUserPuzzle(userPuzzle({ id: 'custom-x' }))
    expect(getPuzzleById('echo')?.source).toBe('builtin')
    expect(getPuzzleById('custom-x')?.source).toBe('user')
    expect(getPuzzleById('missing')).toBeUndefined()
  })

  it('replaces a user puzzle with the same id instead of duplicating', () => {
    saveUserPuzzle(userPuzzle({ id: 'dup', title: 'First' }))
    saveUserPuzzle(userPuzzle({ id: 'dup', title: 'Second' }))
    const matches = getUserPuzzles().filter((p) => p.id === 'dup')
    expect(matches).toHaveLength(1)
    expect(matches[0]!.title).toBe('Second')
  })

  it('deletes a user puzzle', () => {
    saveUserPuzzle(userPuzzle({ id: 'gone' }))
    deleteUserPuzzle('gone')
    expect(getPuzzleById('gone')).toBeUndefined()
  })

  it('keeps temporary generated puzzles out of the permanent puzzle list', () => {
    saveTempPuzzle(userPuzzle({ id: 'ai-temp', title: 'Generated' }))

    expect(getPuzzleById('ai-temp')?.title).toBe('Generated')
    expect(getTempPuzzles()).toHaveLength(1)
    expect(isTempPuzzle('ai-temp')).toBe(true)
    expect(getAllPuzzles().some((puzzle) => puzzle.id === 'ai-temp')).toBe(
      false,
    )
  })

  it('stops treating a generated puzzle as temporary after it is saved', () => {
    saveTempPuzzle(userPuzzle({ id: 'ai-save', title: 'Generated' }))
    saveUserPuzzle(userPuzzle({ id: 'ai-save', title: 'Saved Name' }))
    deleteTempPuzzle('ai-save')

    expect(isTempPuzzle('ai-save')).toBe(false)
    expect(getPuzzleById('ai-save')?.title).toBe('Saved Name')
  })
})
