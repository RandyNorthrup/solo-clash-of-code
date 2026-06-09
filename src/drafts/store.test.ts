import { describe, expect, it } from 'vitest'
import { getDraft, saveDraft } from './store'

const PUZZLE = 'puzzle-a'
const LANGUAGE = 'python3'

describe('draft store', () => {
  it('returns null when no draft exists', () => {
    expect(getDraft(PUZZLE, LANGUAGE)).toBeNull()
  })

  it('round-trips a saved draft', () => {
    saveDraft(PUZZLE, LANGUAGE, 'print(42)')
    expect(getDraft(PUZZLE, LANGUAGE)).toBe('print(42)')
  })

  it('keeps drafts separate per language', () => {
    saveDraft(PUZZLE, 'python3', 'print(1)')
    saveDraft(PUZZLE, 'ruby', 'puts 1')
    expect(getDraft(PUZZLE, 'python3')).toBe('print(1)')
    expect(getDraft(PUZZLE, 'ruby')).toBe('puts 1')
  })
})
