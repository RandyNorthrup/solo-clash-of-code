import { describe, expect, it } from 'vitest'
import type { Puzzle } from './types'
import {
  decodePuzzleFromUrl,
  encodePuzzleForUrl,
  exportPuzzlesJson,
  importPuzzlesJson,
} from './io'

const mockPuzzle: Puzzle = {
  id: 'test-puzzle',
  title: 'Test',
  difficulty: 'beginner',
  statement: 'A test puzzle.',
  constraints: 'n >= 0',
  inputSpec: 'Line 1: n',
  outputSpec: 'Line 1: n',
  testcases: [
    {
      id: 'tc-0',
      title: 'basic',
      input: '1',
      expectedOutput: '1',
      hidden: false,
    },
  ],
  source: 'user',
}

describe('exportPuzzlesJson / importPuzzlesJson', () => {
  it('round-trips a puzzle array', () => {
    const json = exportPuzzlesJson([mockPuzzle])
    const imported = importPuzzlesJson(json)
    expect(imported).toHaveLength(1)
    expect(imported[0]!.id).toBe('test-puzzle')
    expect(imported[0]!.title).toBe('Test')
  })

  it('forces source to "user" on import regardless of original source', () => {
    const builtin: Puzzle = { ...mockPuzzle, source: 'builtin' }
    const json = exportPuzzlesJson([builtin])
    const imported = importPuzzlesJson(json)
    expect(imported[0]!.source).toBe('user')
  })

  it('round-trips multiple puzzles preserving order', () => {
    const second: Puzzle = { ...mockPuzzle, id: 'second', title: 'Second' }
    const json = exportPuzzlesJson([mockPuzzle, second])
    const imported = importPuzzlesJson(json)
    expect(imported).toHaveLength(2)
    expect(imported[0]!.id).toBe('test-puzzle')
    expect(imported[1]!.id).toBe('second')
  })

  it('throws on invalid JSON', () => {
    expect(() => importPuzzlesJson('not json {')).toThrow()
  })

  it('throws when the top-level shape is wrong', () => {
    const json = JSON.stringify([mockPuzzle])
    expect(() => importPuzzlesJson(json)).toThrow(/Expected/)
  })

  it('throws when the version does not match', () => {
    const json = JSON.stringify({ version: 99, puzzles: [] })
    expect(() => importPuzzlesJson(json)).toThrow(/Unsupported/)
  })

  it('throws when a puzzle entry is missing required fields', () => {
    const json = JSON.stringify({ version: 1, puzzles: [{ id: 'x' }] })
    expect(() => importPuzzlesJson(json)).toThrow(/puzzles\[0\]/)
  })
})

describe('encodePuzzleForUrl / decodePuzzleFromUrl', () => {
  it('round-trips a puzzle', () => {
    const encoded = encodePuzzleForUrl(mockPuzzle)
    const decoded = decodePuzzleFromUrl(encoded)
    expect(decoded.id).toBe(mockPuzzle.id)
    expect(decoded.title).toBe(mockPuzzle.title)
    expect(decoded.testcases).toHaveLength(1)
  })

  it('produces a URL-safe string (no +, /, or = chars)', () => {
    const encoded = encodePuzzleForUrl(mockPuzzle)
    expect(encoded).not.toMatch(/[+/=]/)
  })

  it('throws on completely invalid encoded data', () => {
    expect(() => decodePuzzleFromUrl('!!not-base64!!')).toThrow()
  })

  it('throws when decoded JSON is not a valid puzzle shape', () => {
    const garbage = encodePuzzleForUrl({ id: 'x' } as unknown as Puzzle)
    expect(() => decodePuzzleFromUrl(garbage)).toThrow(/valid puzzle/)
  })
})
