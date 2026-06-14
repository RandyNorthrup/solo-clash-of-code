// @vitest-environment node
/**
 * Live transposer check: generates the starter stub for representative puzzles
 * in every supported language and submits each to a running Judge0, asserting
 * the stub at least compiles and runs (it reads the input and writes nothing,
 * so "wrong answer" is the expected — and acceptable — outcome). Skips entirely
 * when Judge0 is not reachable, so it is safe in the default suite.
 */
import { describe, expect, it } from 'vitest'
import { resolveAvailableLanguages } from './availability'
import { generateStub } from './stubgen'
import { GENERATED_PUZZLES } from '../puzzles/generated'

const BASE_URL = process.env['JUDGE0_URL'] ?? 'http://localhost:2358'
const REACH_TIMEOUT_MS = 1500
const POLL_INTERVAL_MS = 500
const MAX_POLL_ATTEMPTS = 120
const TEST_TIMEOUT_MS = 300_000
const FIRST_TERMINAL_STATUS_ID = 3
const STATUS_ACCEPTED = 3
const STATUS_WRONG_ANSWER = 4
// Puzzles that exercise the descriptor shapes: scalars, a list, and a string.
const SAMPLE_PUZZLE_IDS = ['sum-two', 'sum-list', 'echo'] as const

const reachable = await fetch(`${BASE_URL}/languages`, {
  signal: AbortSignal.timeout(REACH_TIMEOUT_MS),
})
  .then((response) => response.ok)
  .catch(() => false)

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

interface SubmissionResult {
  readonly token: string
  readonly status: { readonly id: number; readonly description: string }
  readonly compile_output: string | null
  readonly stderr: string | null
}

async function submitBatch(
  jobs: readonly {
    readonly languageId: number
    readonly source: string
    readonly stdin: string
  }[],
): Promise<readonly SubmissionResult[]> {
  const createResponse = await fetch(
    `${BASE_URL}/submissions/batch?base64_encoded=false`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissions: jobs.map((job) => ({
          language_id: job.languageId,
          source_code: job.source,
          stdin: job.stdin,
        })),
      }),
    },
  )
  const created = (await createResponse.json()) as { readonly token: string }[]
  const tokens = created.map((entry) => entry.token).join(',')
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    const pollResponse = await fetch(
      `${BASE_URL}/submissions/batch?base64_encoded=false&tokens=${tokens}`,
    )
    const body = (await pollResponse.json()) as {
      readonly submissions: readonly SubmissionResult[]
    }
    if (
      body.submissions.every(
        (result) => result.status.id >= FIRST_TERMINAL_STATUS_ID,
      )
    ) {
      return body.submissions
    }
    await sleep(POLL_INTERVAL_MS)
  }
  throw new Error('Timed out waiting for Judge0 batch')
}

describe.skipIf(!reachable)('generateStub (live Judge0)', () => {
  it(
    'compiles and runs the generated stub in every language',
    async () => {
      const languagesResponse = await fetch(`${BASE_URL}/languages`)
      const languages = resolveAvailableLanguages(
        (await languagesResponse.json()) as { id: number; name: string }[],
      )
      const failures: string[] = []

      for (const puzzleId of SAMPLE_PUZZLE_IDS) {
        const puzzle = GENERATED_PUZZLES.find((entry) => entry.id === puzzleId)
        if (puzzle === undefined) {
          throw new Error(`Sample puzzle ${puzzleId} not found`)
        }
        const sample = puzzle.testcases.find((testCase) => !testCase.hidden)
        if (sample === undefined) {
          throw new Error(`Sample puzzle ${puzzleId} has no visible case`)
        }
        const jobs: {
          languageId: number
          source: string
          stdin: string
          key: string
        }[] = []
        for (const language of languages) {
          const source = generateStub(puzzle.ioFormat, language.def.key)
          if (source === null) {
            continue
          }
          jobs.push({
            languageId: language.judge0Id,
            source,
            stdin: sample.input,
            key: language.def.key,
          })
        }
        const results = await submitBatch(jobs)
        results.forEach((result, index) => {
          const job = jobs[index]
          if (job === undefined) {
            return
          }
          const ok =
            result.status.id === STATUS_ACCEPTED ||
            result.status.id === STATUS_WRONG_ANSWER
          if (!ok) {
            const detail = result.compile_output ?? result.stderr ?? ''
            failures.push(
              `${puzzleId}/${job.key}: ${result.status.description} ${detail.slice(0, 200)}`,
            )
          }
        })
      }

      expect(failures, failures.join('\n')).toEqual([])
    },
    TEST_TIMEOUT_MS,
  )
})
