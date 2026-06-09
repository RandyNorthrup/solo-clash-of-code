/** Runs a solution against a puzzle's test cases and reports per-case results. */
import { FLOAT_MATCH_EPSILON, JUDGE0_BATCH_SIZE } from '../config/constants'
import {
  DEFAULT_MATCH_MODE,
  type MatchMode,
  type TestCase,
} from '../puzzles/types'
import { JUDGE0_STATUS, runBatch, type Judge0Result } from './judge0'

type CaseOutcome = 'pass' | 'fail' | 'error'

/** Category of a non-passing execution, used to explain failures to the user. */
export type ErrorKind = 'compile' | 'runtime' | 'timeout' | 'internal'

export const ERROR_KIND_LABELS: Record<ErrorKind, string> = {
  compile: 'Compile error',
  runtime: 'Runtime error',
  timeout: 'Timeout',
  internal: 'Error',
}

export interface CaseResult {
  readonly testCaseId: string
  readonly outcome: CaseOutcome
  readonly actualOutput: string
  readonly expectedOutput: string
  readonly detail: string
  readonly errorKind: ErrorKind | null
}

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n/gu, '\n')
}

/** Trim trailing whitespace per line and drop trailing blank lines. */
function normalizeTrimmed(value: string): string {
  return normalizeNewlines(value)
    .split('\n')
    .map((line) => line.replace(/\s+$/u, ''))
    .join('\n')
    .replace(/\n+$/u, '')
}

function tokens(value: string): string[] {
  return value
    .trim()
    .split(/\s+/u)
    .filter((token) => token.length > 0)
}

function floatTokensEqual(actual: string, expected: string): boolean {
  const a = tokens(actual)
  const e = tokens(expected)
  if (a.length !== e.length) {
    return false
  }
  return a.every((token, index) => {
    const other = e[index] ?? ''
    const x = Number(token)
    const y = Number(other)
    if (Number.isFinite(x) && Number.isFinite(y)) {
      return Math.abs(x - y) <= FLOAT_MATCH_EPSILON * (1 + Math.abs(y))
    }
    return token === other
  })
}

/** Compare program output against the expected output for a given mode. */
export function compareOutputs(
  actual: string,
  expected: string,
  mode: MatchMode,
): boolean {
  if (mode === 'exact') {
    return normalizeNewlines(actual) === normalizeNewlines(expected)
  }
  if (mode === 'tokens') {
    return tokens(actual).join(' ') === tokens(expected).join(' ')
  }
  if (mode === 'float') {
    return floatTokensEqual(actual, expected)
  }
  return normalizeTrimmed(actual) === normalizeTrimmed(expected)
}

function mapErrorKind(statusId: number): ErrorKind {
  if (statusId === JUDGE0_STATUS.COMPILATION_ERROR) {
    return 'compile'
  }
  if (statusId === JUDGE0_STATUS.TIME_LIMIT_EXCEEDED) {
    return 'timeout'
  }
  if (
    statusId === JUDGE0_STATUS.INTERNAL_ERROR ||
    statusId === JUDGE0_STATUS.EXEC_FORMAT_ERROR
  ) {
    return 'internal'
  }
  return 'runtime'
}

function errorDetail(result: Judge0Result): string {
  const parts = [result.compile_output, result.stderr, result.message]
  const detail = parts.find((part) => part !== null && part.trim().length > 0)
  return detail ?? result.status.description
}

interface Interpretation {
  readonly outcome: CaseOutcome
  readonly errorKind: ErrorKind | null
}

function interpret(result: Judge0Result, testCase: TestCase): Interpretation {
  if (result.status.id === JUDGE0_STATUS.ACCEPTED) {
    const passed = compareOutputs(
      result.stdout ?? '',
      testCase.expectedOutput,
      testCase.match ?? DEFAULT_MATCH_MODE,
    )
    return { outcome: passed ? 'pass' : 'fail', errorKind: null }
  }
  return { outcome: 'error', errorKind: mapErrorKind(result.status.id) }
}

function buildCaseResult(raw: Judge0Result, testCase: TestCase): CaseResult {
  const { outcome, errorKind } = interpret(raw, testCase)
  return {
    testCaseId: testCase.id,
    outcome,
    actualOutput: raw.stdout ?? '',
    expectedOutput: testCase.expectedOutput,
    detail: outcome === 'error' ? errorDetail(raw) : '',
    errorKind,
  }
}

/**
 * Grade all test cases using Judge0 batch submissions, invoking `onResult` for
 * each case as its chunk completes. Cases that return a transient INTERNAL_ERROR
 * are retried once before their result is reported. Pass an `AbortSignal` to
 * cancel in-flight runs on navigation — AbortError propagates to the caller.
 */
export async function gradeAll(
  languageId: number,
  sourceCode: string,
  testcases: readonly TestCase[],
  onResult: (result: CaseResult) => void,
  signal?: AbortSignal,
): Promise<readonly CaseResult[]> {
  const allResults: CaseResult[] = []

  for (let offset = 0; offset < testcases.length; offset += JUDGE0_BATCH_SIZE) {
    const chunk = testcases.slice(offset, offset + JUDGE0_BATCH_SIZE)
    const batchRequests = chunk.map((tc) => ({
      languageId,
      sourceCode,
      stdin: tc.input,
    }))

    let rawResults = await runBatch(batchRequests, signal)

    // Build retry list: transient INTERNAL_ERROR results get one more attempt.
    const retryItems: {
      chunkIdx: number
      request: { languageId: number; sourceCode: string; stdin: string }
    }[] = []
    for (const [i, raw] of rawResults.entries()) {
      if (raw.status.id === JUDGE0_STATUS.INTERNAL_ERROR) {
        const req = batchRequests[i]
        if (req !== undefined) {
          retryItems.push({ chunkIdx: i, request: req })
        }
      }
    }

    if (retryItems.length > 0) {
      const retried = await runBatch(
        retryItems.map((item) => item.request),
        signal,
      )
      const mutable = [...rawResults]
      for (const [ri, item] of retryItems.entries()) {
        const retriedResult = retried[ri]
        if (retriedResult !== undefined) {
          mutable[item.chunkIdx] = retriedResult
        }
      }
      rawResults = mutable
    }

    for (const [i, raw] of rawResults.entries()) {
      const tc = chunk[i]
      if (tc !== undefined) {
        const caseResult = buildCaseResult(raw, tc)
        allResults.push(caseResult)
        onResult(caseResult)
      }
    }
  }

  return allResults
}

export function allPassed(results: readonly CaseResult[]): boolean {
  return results.length > 0 && results.every((r) => r.outcome === 'pass')
}
