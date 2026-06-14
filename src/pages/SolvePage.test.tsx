import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { CaseResult } from '../judge/grade'

// Monaco can't run in jsdom; replace the editor with a no-op.
vi.mock('../components/CodeEditor', () => ({
  CodeEditor: () => null,
}))

// Pretend Judge0 offers Python 3.
vi.mock('../judge/useLanguages', async () => {
  const { LANGUAGES } = await import('../judge/languages')
  const def = LANGUAGES.find((language) => language.key === 'python3')!
  const JUDGE0_PYTHON_ID = 71
  return {
    useLanguages: () => ({
      languages: [{ def, judge0Id: JUDGE0_PYTHON_ID }],
      loading: false,
      error: null,
    }),
  }
})

vi.mock('../judge/grade', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../judge/grade')>()
  return { ...actual, gradeAll: vi.fn() }
})

import { SolvePage } from './SolvePage'
import { gradeAll } from '../judge/grade'
import { getPuzzleById, getUserPuzzles, saveTempPuzzle } from '../puzzles/store'
import type { Puzzle } from '../puzzles/types'
import { getBestSizeChars, getBestTimeMs } from '../scores/store'
import { ROUTES } from '../routes'

const TEMP_PUZZLE: Puzzle = {
  id: 'generated-save-test',
  title: 'Generated Save Test',
  difficulty: 'beginner',
  statement: 'Print the input.',
  constraints: '1 <= length <= 10',
  inputSpec: 'Line 1: One string.',
  outputSpec: 'Line 1: The same string.',
  source: 'user',
  testcases: [
    {
      id: 'generated-save-test-0',
      title: 'sample',
      input: 'hi',
      expectedOutput: 'hi',
      hidden: false,
    },
  ],
}

function renderSolve(initialEntry = '/solve/echo') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path={ROUTES.solve} element={<SolvePage />} />
      </Routes>
    </MemoryRouter>,
  )
}

function gradeWith(outcomeFor: (index: number) => CaseResult['outcome']): void {
  vi.mocked(gradeAll).mockImplementation((_id, _code, cases, onResult) => {
    const results: CaseResult[] = cases.map((testCase, index) => ({
      testCaseId: testCase.id,
      outcome: outcomeFor(index),
      actualOutput: testCase.expectedOutput,
      expectedOutput: testCase.expectedOutput,
      detail: '',
      errorKind: null,
    }))
    for (const result of results) {
      onResult(result)
    }
    return Promise.resolve(results)
  })
}

describe('SolvePage', () => {
  it('records a best time when all cases pass on submit', async () => {
    gradeWith(() => 'pass')
    const user = userEvent.setup()
    renderSolve()

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(screen.getByText(/new best time/i)).toBeInTheDocument()
    })
    expect(getBestTimeMs('echo')).not.toBeNull()
  })

  it('shows a failure banner when a case does not pass', async () => {
    gradeWith((index) => (index === 0 ? 'fail' : 'pass'))
    const user = userEvent.setup()
    renderSolve()

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(screen.getByText(/did not pass/i)).toBeInTheDocument()
    })
    expect(getBestTimeMs('echo')).toBeNull()
  })

  it('shows no error banner when the run is aborted', async () => {
    vi.mocked(gradeAll).mockRejectedValue(
      new DOMException('Aborted', 'AbortError'),
    )
    const user = userEvent.setup()
    renderSolve()

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    // Wait for the Submit button to re-enable (busy cleared via finally).
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit' })).not.toBeDisabled()
    })

    expect(
      screen.queryByText(/did not pass|Run failed/i),
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/new best time/i)).not.toBeInTheDocument()
  })

  it('records a code-size best in Shortest mode', async () => {
    gradeWith(() => 'pass')
    const user = userEvent.setup()
    renderSolve('/solve/echo?clash=shortest')

    expect(screen.getByText(/Code size/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(screen.getByText(/new shortest/i)).toBeInTheDocument()
    })
    expect(getBestSizeChars('echo')).not.toBeNull()
  })

  it('hides the statement in Reverse mode until solved', async () => {
    gradeWith(() => 'pass')
    const user = userEvent.setup()
    renderSolve('/solve/echo?clash=reverse')

    // Statement is hidden; the reverse hint and examples are shown instead.
    expect(screen.getByText(/Reverse mode/i)).toBeInTheDocument()
    expect(screen.queryByText('Goal')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    // After solving, the full statement (Goal section) is revealed.
    await waitFor(() => {
      expect(screen.getByText('Goal')).toBeInTheDocument()
    })
  })

  it('saves a temporary generated puzzle as a named favorite', async () => {
    saveTempPuzzle(TEMP_PUZZLE)
    const user = userEvent.setup()
    renderSolve(`/solve/${TEMP_PUZZLE.id}`)

    await user.click(screen.getByRole('button', { name: 'Favorite puzzle' }))
    await user.clear(screen.getByLabelText('Saved puzzle name'))
    await user.type(screen.getByLabelText('Saved puzzle name'), 'Saved AI Run')
    await user.click(screen.getByRole('button', { name: 'Save favorite' }))

    expect(screen.getByText('Saved puzzle "Saved AI Run".')).toBeInTheDocument()
    expect(getUserPuzzles()).toHaveLength(1)
    expect(getUserPuzzles()[0]?.title).toBe('Saved AI Run')
    expect(getPuzzleById(TEMP_PUZZLE.id)?.title).toBe('Saved AI Run')
    expect(
      screen.queryByRole('button', { name: 'Favorite puzzle' }),
    ).not.toBeInTheDocument()
  })
})
