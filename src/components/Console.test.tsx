import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Console } from './Console'
import type { CaseResult } from '../judge/grade'

function result(overrides: Partial<CaseResult>): CaseResult {
  return {
    testCaseId: 'c',
    outcome: 'fail',
    actualOutput: '',
    expectedOutput: '',
    detail: '',
    errorKind: null,
    ...overrides,
  }
}

describe('Console', () => {
  it('prompts when there is nothing to show', () => {
    render(<Console result={null} caseTitle={null} />)
    expect(screen.getByText(/Run or Submit/i)).toBeInTheDocument()
  })

  it('shows expected vs got for a mismatch', () => {
    render(
      <Console
        result={result({ expectedOutput: '42', actualOutput: '7' })}
        caseTitle="word"
      />,
    )
    expect(screen.getByText(/Mismatch in/i)).toBeInTheDocument()
    expect(screen.getByText(/Expected:\s*42/)).toBeInTheDocument()
    expect(screen.getByText(/Got:\s*7/)).toBeInTheDocument()
  })

  it('shows the error kind and detail for an error', () => {
    render(
      <Console
        result={result({
          outcome: 'error',
          errorKind: 'compile',
          detail: 'missing semicolon',
        })}
        caseTitle="word"
      />,
    )
    expect(screen.getByText(/Compile error in/i)).toBeInTheDocument()
    expect(screen.getByText(/missing semicolon/i)).toBeInTheDocument()
  })
})
