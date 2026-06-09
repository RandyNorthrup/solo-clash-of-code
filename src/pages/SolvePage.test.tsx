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
import { getBestTimeMs } from '../scores/store'
import { ROUTES } from '../routes'

function renderSolve() {
  return render(
    <MemoryRouter initialEntries={['/solve/echo']}>
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
})
