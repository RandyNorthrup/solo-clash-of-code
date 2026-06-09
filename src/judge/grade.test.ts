import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { TestCase } from '../puzzles/types'
import type { Judge0Result } from './judge0'

vi.mock('./judge0', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./judge0')>()
  return { ...actual, runBatch: vi.fn() }
})

import { allPassed, compareOutputs, gradeAll } from './grade'
import { JUDGE0_STATUS, runBatch } from './judge0'

const LANGUAGE_ID = 71

function result(overrides: Partial<Judge0Result>): Judge0Result {
  return {
    stdout: null,
    stderr: null,
    compile_output: null,
    message: null,
    status: { id: JUDGE0_STATUS.ACCEPTED, description: 'Accepted' },
    time: null,
    memory: null,
    ...overrides,
  }
}

function testCase(overrides: Partial<TestCase>): TestCase {
  return {
    id: 'case',
    title: 'case',
    input: '',
    expectedOutput: '42',
    hidden: false,
    ...overrides,
  }
}

beforeEach(() => {
  vi.mocked(runBatch).mockReset()
})

describe('gradeAll', () => {
  it('passes when stdout matches, ignoring a trailing newline', async () => {
    vi.mocked(runBatch).mockResolvedValue([result({ stdout: '42\n' })])
    const results = await gradeAll(LANGUAGE_ID, 'src', [testCase({})], () => {})
    expect(results[0]!.outcome).toBe('pass')
  })

  it('normalizes CRLF and trailing whitespace before comparing', async () => {
    vi.mocked(runBatch).mockResolvedValue([
      result({ stdout: 'a  \r\nb\r\n\n' }),
    ])
    const results = await gradeAll(
      LANGUAGE_ID,
      'src',
      [testCase({ expectedOutput: 'a\nb' })],
      () => {},
    )
    expect(results[0]!.outcome).toBe('pass')
  })

  it('fails when stdout differs', async () => {
    vi.mocked(runBatch).mockResolvedValue([result({ stdout: '7' })])
    const results = await gradeAll(LANGUAGE_ID, 'src', [testCase({})], () => {})
    expect(results[0]!.outcome).toBe('fail')
  })

  it('reports an error with detail on compilation failure', async () => {
    vi.mocked(runBatch).mockResolvedValue([
      result({
        status: {
          id: JUDGE0_STATUS.COMPILATION_ERROR,
          description: 'Compilation Error',
        },
        compile_output: 'syntax error near line 3',
      }),
    ])
    const results = await gradeAll(LANGUAGE_ID, 'src', [testCase({})], () => {})
    expect(results[0]!.outcome).toBe('error')
    expect(results[0]!.detail).toContain('syntax error')
  })

  it('invokes the progress callback once per case', async () => {
    vi.mocked(runBatch).mockResolvedValue([
      result({ stdout: '42' }),
      result({ stdout: '42' }),
    ])
    const onResult = vi.fn()
    await gradeAll(
      LANGUAGE_ID,
      'src',
      [testCase({ id: 'a' }), testCase({ id: 'b' })],
      onResult,
    )
    expect(onResult).toHaveBeenCalledTimes(2)
  })

  it('retries once on INTERNAL_ERROR and uses the retried result', async () => {
    const internalError = result({
      status: {
        id: JUDGE0_STATUS.INTERNAL_ERROR,
        description: 'Internal Error',
      },
    })
    const retrySuccess = result({ stdout: '42' })
    vi.mocked(runBatch)
      .mockResolvedValueOnce([internalError])
      .mockResolvedValueOnce([retrySuccess])

    const results = await gradeAll(LANGUAGE_ID, 'src', [testCase({})], () => {})
    expect(results[0]!.outcome).toBe('pass')
    expect(vi.mocked(runBatch)).toHaveBeenCalledTimes(2)
  })

  it('propagates AbortError when the signal fires', async () => {
    vi.mocked(runBatch).mockRejectedValue(
      new DOMException('Aborted', 'AbortError'),
    )
    const controller = new AbortController()
    await expect(
      gradeAll(LANGUAGE_ID, 'src', [testCase({})], () => {}, controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' })
  })
})

describe('allPassed', () => {
  it('is false for an empty result set', () => {
    expect(allPassed([])).toBe(false)
  })

  it('is true only when every case passes', () => {
    expect(
      allPassed([
        {
          testCaseId: 'a',
          outcome: 'pass',
          actualOutput: '',
          expectedOutput: '',
          detail: '',
          errorKind: null,
        },
        {
          testCaseId: 'b',
          outcome: 'fail',
          actualOutput: '',
          expectedOutput: '',
          detail: '',
          errorKind: null,
        },
      ]),
    ).toBe(false)
  })
})

describe('compareOutputs', () => {
  it('exact requires byte-identical output (after CRLF normalization)', () => {
    expect(compareOutputs('a\r\nb', 'a\nb', 'exact')).toBe(true)
    expect(compareOutputs('a ', 'a', 'exact')).toBe(false)
  })

  it('trimmed ignores trailing whitespace and blank lines', () => {
    expect(compareOutputs('a  \nb\n\n', 'a\nb', 'trimmed')).toBe(true)
  })

  it('tokens ignores all whitespace differences', () => {
    expect(compareOutputs('1  2\n3', '1 2 3', 'tokens')).toBe(true)
    expect(compareOutputs('1 2', '1 3', 'tokens')).toBe(false)
  })

  it('float compares numbers within tolerance', () => {
    expect(compareOutputs('3.1415926', '3.14159261', 'float')).toBe(true)
    expect(compareOutputs('1.0', '1.5', 'float')).toBe(false)
    expect(compareOutputs('a b', 'a b', 'float')).toBe(true)
    expect(compareOutputs('1 2', '1 2 3', 'float')).toBe(false)
  })
})

describe('errorKind mapping', () => {
  const cases = [
    { statusId: JUDGE0_STATUS.COMPILATION_ERROR, kind: 'compile' },
    { statusId: JUDGE0_STATUS.TIME_LIMIT_EXCEEDED, kind: 'timeout' },
    { statusId: JUDGE0_STATUS.INTERNAL_ERROR, kind: 'internal' },
    { statusId: JUDGE0_STATUS.RUNTIME_ERROR, kind: 'runtime' },
  ] as const

  it.each(cases)(
    'maps status $statusId to errorKind $kind',
    async ({ statusId, kind }) => {
      vi.mocked(runBatch).mockResolvedValue([
        result({ status: { id: statusId, description: 'x' } }),
      ])
      const [res] = await gradeAll(LANGUAGE_ID, 'src', [testCase({})], () => {})
      expect(res!.outcome).toBe('error')
      expect(res!.errorKind).toBe(kind)
    },
  )
})
