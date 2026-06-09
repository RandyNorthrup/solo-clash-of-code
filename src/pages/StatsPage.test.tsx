import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { HistoryEntry } from '../scores/history'
import type { Puzzle } from '../puzzles/types'

vi.mock('../scores/history', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../scores/history')>()
  return { ...actual, getSolveHistory: vi.fn() }
})

vi.mock('../puzzles/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../puzzles/store')>()
  return { ...actual, getPuzzleById: vi.fn() }
})

import { StatsPage } from './StatsPage'
import { getSolveHistory } from '../scores/history'
import { getPuzzleById } from '../puzzles/store'

function renderStats() {
  return render(
    <MemoryRouter>
      <StatsPage />
    </MemoryRouter>,
  )
}

describe('StatsPage', () => {
  it('shows an empty-state message when there are no solves', () => {
    vi.mocked(getSolveHistory).mockReturnValue([])
    renderStats()
    expect(screen.getByText(/no solves yet/i)).toBeInTheDocument()
  })

  it('renders the stats heading and solve count when history is present', () => {
    const mockPuzzle: Puzzle = {
      id: 'echo',
      title: 'Echo',
      difficulty: 'beginner',
      statement: '',
      constraints: '',
      inputSpec: '',
      outputSpec: '',
      testcases: [],
      source: 'builtin',
    }
    const entry: HistoryEntry = {
      puzzleId: 'echo',
      ms: 5000,
      lang: 'python3',
      at: Date.UTC(2026, 5, 8, 12, 0, 0),
    }
    vi.mocked(getSolveHistory).mockReturnValue([entry])
    vi.mocked(getPuzzleById).mockReturnValue(mockPuzzle)

    renderStats()

    expect(screen.getByText('Stats')).toBeInTheDocument()
    expect(screen.getByText('1 solves')).toBeInTheDocument()
    expect(screen.getByText('Beginner solves')).toBeInTheDocument()
    expect(screen.getByText('python3')).toBeInTheDocument()
  })
})
