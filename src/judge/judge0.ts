/**
 * Thin client for the Judge0 REST API. Batch submissions are the primary
 * path: `runBatch` POSTs all cases at once and polls until every token is
 * terminal. An `AbortSignal` cancels in-flight fetches and inter-poll sleeps.
 */
import {
  JUDGE0_PROXY_PATH,
  JUDGE0_MAX_POLL_ATTEMPTS,
  JUDGE0_POLL_INTERVAL_MS,
  SUBMISSION_CPU_TIME_LIMIT_SEC,
  SUBMISSION_MEMORY_LIMIT_KB,
  SUBMISSION_WALL_TIME_LIMIT_SEC,
} from '../config/constants'

// In dev the Vite proxy routes /judge0 → Judge0, avoiding CORS.
// In production VITE_JUDGE0_URL must be set to a Judge0 instance that allows
// CORS from this app's origin (see README Deployment section).
const judgeBaseUrl: string = import.meta.env.PROD
  ? (import.meta.env.VITE_JUDGE0_URL?.replace(/\/+$/g, '') ?? JUDGE0_PROXY_PATH)
  : JUDGE0_PROXY_PATH

const JUDGE0_UNREACHABLE_MSG = import.meta.env.PROD
  ? 'Cannot reach Judge0. Verify VITE_JUDGE0_URL is set and the instance allows CORS from this origin.'
  : 'Cannot reach Judge0. Is it running? Start it with `npm run judge0:up`.'

/** Judge0 submission status ids (stable across versions). */
export const JUDGE0_STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR: 7,
  INTERNAL_ERROR: 13,
  EXEC_FORMAT_ERROR: 14,
} as const

/** Status ids below this are still pending; at/above it the run is terminal. */
const FIRST_TERMINAL_STATUS_ID = JUDGE0_STATUS.ACCEPTED

const HTTP_OK_MIN = 200
const HTTP_OK_MAX = 299

export interface Judge0Language {
  readonly id: number
  readonly name: string
}

interface Judge0Status {
  readonly id: number
  readonly description: string
}

export interface Judge0Result {
  readonly stdout: string | null
  readonly stderr: string | null
  readonly compile_output: string | null
  readonly message: string | null
  readonly status: Judge0Status
  readonly time: string | null
  readonly memory: number | null
}

export interface RunRequest {
  readonly languageId: number
  readonly sourceCode: string
  readonly stdin: string
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted === true) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const id = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(id)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

function isOkStatus(status: number): boolean {
  return status >= HTTP_OK_MIN && status <= HTTP_OK_MAX
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${judgeBaseUrl}${path}`, init)
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err
    }
    throw new Error(JUDGE0_UNREACHABLE_MSG, { cause: err })
  }
  if (!isOkStatus(response.status)) {
    throw new Error(`Judge0 responded with HTTP ${String(response.status)}.`)
  }
  return (await response.json()) as T
}

/** Fetch the list of languages the running Judge0 instance supports. */
export async function fetchJudge0Languages(): Promise<
  readonly Judge0Language[]
> {
  return request<readonly Judge0Language[]>('/languages')
}

interface BatchToken {
  readonly token: string
}

interface BatchedResult extends Judge0Result {
  readonly token: string
}

interface BatchPollResponse {
  readonly submissions: readonly BatchedResult[]
}

/**
 * Submit a batch of programs to Judge0 and poll until every token reaches a
 * terminal status. Results are returned in the same order as `requests`.
 * Throws `DOMException('Aborted')` if the signal fires before completion.
 */
export async function runBatch(
  requests: readonly RunRequest[],
  signal?: AbortSignal,
): Promise<readonly Judge0Result[]> {
  const created = await request<readonly BatchToken[]>(
    '/submissions/batch?base64_encoded=false&wait=false',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissions: requests.map((req) => ({
          language_id: req.languageId,
          source_code: req.sourceCode,
          stdin: req.stdin,
          cpu_time_limit: SUBMISSION_CPU_TIME_LIMIT_SEC,
          wall_time_limit: SUBMISSION_WALL_TIME_LIMIT_SEC,
          memory_limit: SUBMISSION_MEMORY_LIMIT_KB,
        })),
      }),
      signal: signal ?? null,
    },
  )

  const tokenQuery = created.map((t) => t.token).join(',')

  for (let attempt = 0; attempt < JUDGE0_MAX_POLL_ATTEMPTS; attempt += 1) {
    const poll = await request<BatchPollResponse>(
      `/submissions/batch?tokens=${tokenQuery}&base64_encoded=false`,
      { signal: signal ?? null },
    )
    const allTerminal = poll.submissions.every(
      (s) => s.status.id >= FIRST_TERMINAL_STATUS_ID,
    )
    if (allTerminal) {
      const byToken = new Map(poll.submissions.map((s) => [s.token, s]))
      return created.map((t) => {
        const result = byToken.get(t.token)
        if (result === undefined) {
          throw new Error(`Missing batch result for token ${t.token}`)
        }
        return result
      })
    }
    await sleep(JUDGE0_POLL_INTERVAL_MS, signal)
  }
  throw new Error('Judge0 timed out waiting for batch results.')
}
