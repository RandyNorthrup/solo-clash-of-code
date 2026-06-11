import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BUILTIN_PUZZLES } from './builtin'
import { DIFFICULTIES } from './types'

const GENERATED_PATH = 'src/puzzles/generated.ts'

describe('generated puzzle bank', () => {
  it('matches the generator output exactly (no drift)', () => {
    const before = readFileSync(GENERATED_PATH, 'utf8')
    execSync('node scripts/generate-puzzles.mjs', { stdio: 'pipe' })
    const after = readFileSync(GENERATED_PATH, 'utf8')
    expect(after).toBe(before)
  })

  it('contains puzzles', () => {
    expect(BUILTIN_PUZZLES.length).toBeGreaterThan(0)
  })

  it('has unique puzzle ids', () => {
    const ids = BUILTIN_PUZZLES.map((puzzle) => puzzle.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has well-formed puzzles', () => {
    for (const puzzle of BUILTIN_PUZZLES) {
      expect(puzzle.title.length).toBeGreaterThan(0)
      expect(puzzle.statement.length).toBeGreaterThan(0)
      expect(DIFFICULTIES).toContain(puzzle.difficulty)
      expect(puzzle.testcases.length).toBeGreaterThan(0)

      const caseIds = puzzle.testcases.map((testCase) => testCase.id)
      expect(new Set(caseIds).size).toBe(caseIds.length)
      for (const testCase of puzzle.testcases) {
        expect(testCase.input.length).toBeGreaterThan(0)
        expect(testCase.expectedOutput.length).toBeGreaterThan(0)
      }
    }
  })

  it('has enough visible samples and hidden validators per puzzle', () => {
    for (const puzzle of BUILTIN_PUZZLES) {
      const visible = puzzle.testcases.filter((testCase) => !testCase.hidden)
      const hidden = puzzle.testcases.filter((testCase) => testCase.hidden)

      expect(visible.length, `${puzzle.id} visible samples`).toBeGreaterThan(1)
      expect(hidden.length, `${puzzle.id} hidden validators`).toBeGreaterThan(0)
    }
  })

  it('does not repeat identical inputs within a puzzle', () => {
    for (const puzzle of BUILTIN_PUZZLES) {
      const inputs = puzzle.testcases.map((testCase) => testCase.input)
      expect(new Set(inputs).size, `${puzzle.id} input uniqueness`).toBe(
        inputs.length,
      )
    }
  })

  it('covers every difficulty tier', () => {
    for (const difficulty of DIFFICULTIES) {
      expect(
        BUILTIN_PUZZLES.some((puzzle) => puzzle.difficulty === difficulty),
      ).toBe(true)
    }
  })
})
