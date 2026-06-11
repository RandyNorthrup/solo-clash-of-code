/** OpenAI-backed puzzle generation for optional quick play. */
import {
  AI_PUZZLE_MAX_FIELD_CHARS,
  AI_PUZZLE_MAX_FAILURE_DETAILS,
  AI_PUZZLE_MAX_CASE_LINES,
  AI_PUZZLE_MAX_REFERENCE_SOLUTION_CHARS,
  AI_PUZZLE_MAX_SAFE_INTEGER_ABS,
  AI_PUZZLE_MAX_TESTCASES,
  AI_PUZZLE_MAX_TESTCASE_IO_CHARS,
  AI_PUZZLE_MAX_TESTCASE_TITLE_CHARS,
  AI_PUZZLE_MAX_TITLE_CHARS,
  AI_PUZZLE_GENERATION_ATTEMPTS,
  AI_PUZZLE_MIN_REFERENCE_SOLUTION_CHARS,
  AI_PUZZLE_MIN_TESTCASE_IO_CHARS,
  AI_PUZZLE_MIN_HIDDEN_TESTCASES,
  AI_PUZZLE_MIN_TEXT_LENGTH,
  AI_PUZZLE_MIN_TITLE_LENGTH,
  AI_PUZZLE_MIN_TOTAL_TESTCASES,
  AI_PUZZLE_MIN_VISIBLE_TESTCASES,
  ASCII_PRINTABLE_MAX_CODE,
  ASCII_PRINTABLE_MIN_CODE,
  OPENAI_API_TEST_MAX_OUTPUT_TOKENS,
  OPENAI_API_TEST_PROMPT,
  OPENAI_DEFAULT_BASE_URL,
  OPENAI_HTTP_OK_MAX_EXCLUSIVE,
  OPENAI_HTTP_OK_MIN,
  OPENAI_PROXY_PATH,
  OPENAI_PUZZLE_MAX_OUTPUT_TOKENS,
  OPENAI_PUZZLE_MODEL,
  OPENAI_REASONING_EFFORT,
  OPENAI_REQUEST_TIMEOUT_MS,
  OPENAI_RESPONSES_ENDPOINT,
  OPENAI_TEXT_VERBOSITY,
  SESSION_KEY_AI_REFERENCE_SOLUTIONS,
} from '../config/constants'
import { createUserPuzzleId } from '../puzzles/ids'
import {
  DEFAULT_MATCH_MODE,
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  type Difficulty,
  type MatchMode,
  type Puzzle,
  type TestCase,
} from '../puzzles/types'
import { resolveAvailableLanguages } from '../judge/availability'
import { fetchJudge0Languages } from '../judge/judge0'
import { allPassed, gradeAll, type CaseResult } from '../judge/grade'

type GeneratedTestCase = Omit<TestCase, 'id'> & {
  readonly match: MatchMode
}

interface GeneratedReferenceSolution {
  readonly languageKey: string
  readonly sourceCode: string
}

interface GeneratedPuzzlePayload {
  readonly title: string
  readonly difficulty: Difficulty
  readonly statement: string
  readonly constraints: string
  readonly inputSpec: string
  readonly outputSpec: string
  readonly testcases: readonly GeneratedTestCase[]
  readonly referenceSolutionPython: string
}

interface ResponseOutputText {
  readonly type: string
  readonly text?: string
}

interface ResponseOutputItem {
  readonly type: string
  readonly content?: readonly ResponseOutputText[]
}

interface OpenAiResponseBody {
  readonly output_text?: string
  readonly output?: readonly ResponseOutputItem[]
  readonly error?: { readonly message?: string }
}

const MATCH_MODES: readonly MatchMode[] = [
  'exact',
  'trimmed',
  'tokens',
  'float',
]

const GENERATED_PUZZLE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'title',
    'difficulty',
    'statement',
    'constraints',
    'inputSpec',
    'outputSpec',
    'testcases',
    'referenceSolutionPython',
  ],
  properties: {
    title: {
      type: 'string',
      minLength: AI_PUZZLE_MIN_TITLE_LENGTH,
      maxLength: AI_PUZZLE_MAX_TITLE_CHARS,
    },
    difficulty: { type: 'string', enum: DIFFICULTIES },
    statement: {
      type: 'string',
      minLength: AI_PUZZLE_MIN_TEXT_LENGTH,
      maxLength: AI_PUZZLE_MAX_FIELD_CHARS,
    },
    constraints: {
      type: 'string',
      minLength: AI_PUZZLE_MIN_TEXT_LENGTH,
      maxLength: AI_PUZZLE_MAX_FIELD_CHARS,
    },
    inputSpec: {
      type: 'string',
      minLength: AI_PUZZLE_MIN_TEXT_LENGTH,
      maxLength: AI_PUZZLE_MAX_FIELD_CHARS,
    },
    outputSpec: {
      type: 'string',
      minLength: AI_PUZZLE_MIN_TEXT_LENGTH,
      maxLength: AI_PUZZLE_MAX_FIELD_CHARS,
    },
    testcases: {
      type: 'array',
      minItems: AI_PUZZLE_MIN_TOTAL_TESTCASES,
      maxItems: AI_PUZZLE_MAX_TESTCASES,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'input', 'expectedOutput', 'hidden', 'match'],
        properties: {
          title: {
            type: 'string',
            minLength: AI_PUZZLE_MIN_TEXT_LENGTH,
            maxLength: AI_PUZZLE_MAX_TESTCASE_TITLE_CHARS,
          },
          input: {
            type: 'string',
            minLength: AI_PUZZLE_MIN_TESTCASE_IO_CHARS,
            maxLength: AI_PUZZLE_MAX_TESTCASE_IO_CHARS,
          },
          expectedOutput: {
            type: 'string',
            minLength: AI_PUZZLE_MIN_TESTCASE_IO_CHARS,
            maxLength: AI_PUZZLE_MAX_TESTCASE_IO_CHARS,
          },
          hidden: { type: 'boolean' },
          match: { type: 'string', enum: MATCH_MODES },
        },
      },
    },
    referenceSolutionPython: {
      type: 'string',
      minLength: AI_PUZZLE_MIN_REFERENCE_SOLUTION_CHARS,
      maxLength: AI_PUZZLE_MAX_REFERENCE_SOLUTION_CHARS,
    },
  },
} as const

const DIFFICULTY_STANDARDS: Record<Difficulty, string> = {
  beginner:
    'one direct stdin/stdout transformation, arithmetic, comparison, or simple string length. No loops required beyond reading input.',
  easy: 'simple loops, list processing, counting, sorting, or string checks. No nested algorithmic trick.',
  medium:
    'classic small algorithm with parsing and edge cases, such as gcd/lcm, frequency maps, date-free sequence logic, or grid-free simulation.',
  hard: 'multi-step but compact algorithm that still fits a 15 minute Clash: primes, encoding, validation, checksum, stack, base conversion, or careful case analysis.',
  expert:
    'advanced but compact algorithmic task with one or two input lines: efficient bounded search, number theory, stack/state machine, matrix, checksum, modular arithmetic, or validation with non-trivial edge cases.',
}

const LANGUAGE_SAFETY_PATTERNS: readonly RegExp[] = [
  /\brandom\b/iu,
  /\bdate\b/iu,
  /\btime\s*zone\b/iu,
  /\btimezone\b/iu,
  /\blocale\b/iu,
  /\bfile\b/iu,
  /\bnetwork\b/iu,
  /\bhttp\b/iu,
  /\bweb\b/iu,
  /\bunicode\b/iu,
  /\bemoji\b/iu,
  /\barbitrary\s+precision\b/iu,
  /\bbigint\b/iu,
]

const AMBIGUITY_PATTERNS: readonly RegExp[] = [
  /\bany\s+reasonable\b/iu,
  /\byour\s+choice\b/iu,
  /\bapproximately\b/iu,
  /\bmay\s+vary\b/iu,
  /\bimplementation[- ]defined\b/iu,
  /\bprint\s+anything\b/iu,
]

const BEGINNER_TOO_HARD_PATTERNS: readonly RegExp[] = [
  /\bsort\b/iu,
  /\bprime\b/iu,
  /\bmatrix\b/iu,
  /\bgraph\b/iu,
  /\bstack\b/iu,
  /\bfrequency\b/iu,
  /\bpermutation\b/iu,
  /\bdynamic\s+programming\b/iu,
]

const EASY_TOO_HARD_PATTERNS: readonly RegExp[] = [
  /\bdynamic\s+programming\b/iu,
  /\bdijkstra\b/iu,
  /\bgraph\b/iu,
  /\bmatrix\b/iu,
  /\bprime\s+factor/iu,
  /\bsegment\s+tree\b/iu,
]

const HARD_OR_EXPERT_DEPTH_PATTERNS: readonly RegExp[] = [
  /\bprime\b/iu,
  /\bfactor\b/iu,
  /\bmatrix\b/iu,
  /\bstack\b/iu,
  /\bbase\b/iu,
  /\bchecksum\b/iu,
  /\bsearch\b/iu,
  /\bencode\b/iu,
  /\bdecode\b/iu,
  /\bfrequency\b/iu,
  /\bmodulo\b/iu,
  /\bgcd\b/iu,
  /\blcm\b/iu,
  /\bvalidate\b/iu,
  /\brotate\b/iu,
]

const REFERENCE_SOLUTION_BLOCKED_PATTERNS: readonly RegExp[] = [
  /\bopen\s*\(/iu,
  /\bexec\s*\(/iu,
  /\beval\s*\(/iu,
  /\bsubprocess\b/iu,
  /\bsocket\b/iu,
  /\brequests\b/iu,
  /\burllib\b/iu,
  /\bos\./iu,
  /\bpathlib\b/iu,
]

function getOpenAiBaseUrl(): string {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_OPENAI_BASE_URL ?? OPENAI_DEFAULT_BASE_URL
  }
  return OPENAI_PROXY_PATH
}

function getOpenAiResponsesUrl(): string {
  const base = getOpenAiBaseUrl().replace(/\/$/u, '')
  return `${base}${OPENAI_RESPONSES_ENDPOINT}`
}

function getOpenAiModel(): string {
  return import.meta.env.VITE_OPENAI_MODEL ?? OPENAI_PUZZLE_MODEL
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === 'string' && DIFFICULTIES.includes(value as Difficulty)
}

function isMatchMode(value: unknown): value is MatchMode {
  return typeof value === 'string' && MATCH_MODES.includes(value as MatchMode)
}

function isGeneratedTestCase(value: unknown): value is GeneratedTestCase {
  return (
    isRecord(value) &&
    typeof value['title'] === 'string' &&
    typeof value['input'] === 'string' &&
    typeof value['expectedOutput'] === 'string' &&
    typeof value['hidden'] === 'boolean' &&
    isMatchMode(value['match'])
  )
}

function extractResponseText(body: OpenAiResponseBody): string {
  if (typeof body.output_text === 'string') {
    return body.output_text
  }
  const chunks =
    body.output?.flatMap((item) =>
      item.content
        ?.filter((content) => content.type === 'output_text')
        .map((content) => content.text ?? ''),
    ) ?? []
  const text = chunks.join('')
  if (text.length === 0) {
    throw new Error('OpenAI response did not include text output.')
  }
  return text
}

function parseGeneratedPuzzle(text: string): GeneratedPuzzlePayload {
  const parsed = JSON.parse(text) as unknown
  if (!isRecord(parsed)) {
    throw new Error('OpenAI returned a non-object puzzle payload.')
  }
  const testcases = parsed['testcases']
  if (!Array.isArray(testcases) || !testcases.every(isGeneratedTestCase)) {
    throw new Error('OpenAI returned invalid test cases.')
  }
  if (
    typeof parsed['title'] !== 'string' ||
    !isDifficulty(parsed['difficulty']) ||
    typeof parsed['statement'] !== 'string' ||
    typeof parsed['constraints'] !== 'string' ||
    typeof parsed['inputSpec'] !== 'string' ||
    typeof parsed['outputSpec'] !== 'string' ||
    typeof parsed['referenceSolutionPython'] !== 'string'
  ) {
    throw new Error('OpenAI returned invalid puzzle fields.')
  }
  return {
    title: parsed['title'],
    difficulty: parsed['difficulty'],
    statement: parsed['statement'],
    constraints: parsed['constraints'],
    inputSpec: parsed['inputSpec'],
    outputSpec: parsed['outputSpec'],
    testcases,
    referenceSolutionPython: parsed['referenceSolutionPython'],
  }
}

function validateTextField(
  name: string,
  value: string,
  errors: string[],
): void {
  const trimmed = value.trim()
  if (trimmed.length < AI_PUZZLE_MIN_TEXT_LENGTH) {
    errors.push(`${name} is too short.`)
  }
  if (trimmed.length > AI_PUZZLE_MAX_FIELD_CHARS) {
    errors.push(`${name} is too long.`)
  }
  if (!isPrintableAsciiBlock(trimmed)) {
    errors.push(`${name} must use printable ASCII only.`)
  }
  if (AMBIGUITY_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    errors.push(`${name} contains ambiguous output wording.`)
  }
  if (LANGUAGE_SAFETY_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    errors.push(`${name} contains language-unsafe requirements.`)
  }
}

function isPrintableAsciiBlock(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const char = value.charAt(index)
    const code = char.charCodeAt(0)
    const printable =
      char === '\n' ||
      char === '\r' ||
      (code >= ASCII_PRINTABLE_MIN_CODE && code <= ASCII_PRINTABLE_MAX_CODE)
    if (!printable) {
      return false
    }
  }
  return true
}

function lineCount(value: string): number {
  return value.split(/\r?\n/u).length
}

function validateIntegerBounds(text: string, errors: string[]): void {
  const matches = text.match(/-?\d+/gu) ?? []
  for (const match of matches) {
    const value = Number(match)
    if (
      Number.isSafeInteger(value) &&
      Math.abs(value) > AI_PUZZLE_MAX_SAFE_INTEGER_ABS
    ) {
      errors.push(
        `Numeric bound ${match} exceeds the cross-language safety limit.`,
      )
    }
  }
}

function validateSpecShape(
  payload: GeneratedPuzzlePayload,
  errors: string[],
): void {
  if (!/\bLine\s+1\b/iu.test(payload.inputSpec)) {
    errors.push('Input specification must define Line 1.')
  }
  if (!/\bLine\s+1\b/iu.test(payload.outputSpec)) {
    errors.push('Output specification must define Line 1.')
  }
  if (!/[0-9]/u.test(payload.constraints)) {
    errors.push('Constraints must include concrete numeric bounds.')
  }
  validateIntegerBounds(payload.constraints, errors)
}

function validateDifficultyFit(
  payload: GeneratedPuzzlePayload,
  requestedDifficulty: Difficulty,
  errors: string[],
): void {
  const text = [
    payload.title,
    payload.statement,
    payload.constraints,
    payload.inputSpec,
    payload.outputSpec,
  ].join(' ')
  if (
    requestedDifficulty === 'beginner' &&
    BEGINNER_TOO_HARD_PATTERNS.some((pattern) => pattern.test(text))
  ) {
    errors.push('Beginner puzzle uses concepts above beginner tier.')
  }
  if (
    requestedDifficulty === 'easy' &&
    EASY_TOO_HARD_PATTERNS.some((pattern) => pattern.test(text))
  ) {
    errors.push('Easy puzzle uses concepts above easy tier.')
  }
  if (
    (requestedDifficulty === 'hard' || requestedDifficulty === 'expert') &&
    !HARD_OR_EXPERT_DEPTH_PATTERNS.some((pattern) => pattern.test(text))
  ) {
    errors.push('Hard/expert puzzle lacks enough algorithmic depth.')
  }
}

function validateFloatMode(
  payload: GeneratedPuzzlePayload,
  errors: string[],
): void {
  const hasFloat = payload.testcases.some(
    (testCase) => testCase.match === 'float',
  )
  const text = `${payload.statement} ${payload.outputSpec} ${payload.constraints}`
  if (
    hasFloat &&
    !/\b(tolerance|within|absolute\s+error|relative\s+error)\b/iu.test(text)
  ) {
    errors.push('Float match requires explicit tolerance wording.')
  }
  if (!hasFloat && /\bapproximately\b/iu.test(text)) {
    errors.push('Approximate output wording requires float match mode.')
  }
}

function validateReferenceSolution(
  sourceCodeRaw: string,
  errors: string[],
): void {
  const sourceCode = sourceCodeRaw.trim()
  if (sourceCode.length < AI_PUZZLE_MIN_REFERENCE_SOLUTION_CHARS) {
    errors.push('Reference solution is too short.')
  }
  if (sourceCode.length > AI_PUZZLE_MAX_REFERENCE_SOLUTION_CHARS) {
    errors.push('Reference solution is too long.')
  }
  if (!isPrintableAsciiBlock(sourceCode)) {
    errors.push('Reference solution must use printable ASCII only.')
  }
  if (
    REFERENCE_SOLUTION_BLOCKED_PATTERNS.some((pattern) =>
      pattern.test(sourceCode),
    )
  ) {
    errors.push('Reference solution uses blocked APIs.')
  }
  if (!/\b(input|stdin|read)\b/iu.test(sourceCode)) {
    errors.push('Reference solution must read stdin.')
  }
  if (!/\b(print|stdout|write)\b/iu.test(sourceCode)) {
    errors.push('Reference solution must write stdout.')
  }
}

export function validateGeneratedPuzzle(
  payload: GeneratedPuzzlePayload,
  requestedDifficulty: Difficulty,
): string[] {
  const errors: string[] = []
  if (payload.difficulty !== requestedDifficulty) {
    errors.push('Generated difficulty does not match the selected tier.')
  }
  if (payload.title.trim().length < AI_PUZZLE_MIN_TITLE_LENGTH) {
    errors.push('Title is too short.')
  }
  validateTextField('Statement', payload.statement, errors)
  validateTextField('Constraints', payload.constraints, errors)
  validateTextField('Input specification', payload.inputSpec, errors)
  validateTextField('Output specification', payload.outputSpec, errors)
  validateSpecShape(payload, errors)
  validateDifficultyFit(payload, requestedDifficulty, errors)
  validateFloatMode(payload, errors)
  validateReferenceSolution(payload.referenceSolutionPython, errors)

  const visible = payload.testcases.filter((testCase) => !testCase.hidden)
  const hidden = payload.testcases.filter((testCase) => testCase.hidden)
  if (payload.testcases.length < AI_PUZZLE_MIN_TOTAL_TESTCASES) {
    errors.push('Puzzle needs more total test cases.')
  }
  if (payload.testcases.length > AI_PUZZLE_MAX_TESTCASES) {
    errors.push('Puzzle has too many test cases.')
  }
  if (visible.length < AI_PUZZLE_MIN_VISIBLE_TESTCASES) {
    errors.push('Puzzle needs at least two visible samples.')
  }
  if (hidden.length < AI_PUZZLE_MIN_HIDDEN_TESTCASES) {
    errors.push('Puzzle needs a hidden validator.')
  }

  const inputs = new Set<string>()
  const titles = new Set<string>()
  for (const testCase of payload.testcases) {
    const title = testCase.title.trim()
    if (title.length === 0) {
      errors.push('Test case title is empty.')
    }
    if (title.length > AI_PUZZLE_MAX_TESTCASE_TITLE_CHARS) {
      errors.push(`Test case "${title}" title is too long.`)
    }
    if (titles.has(title)) {
      errors.push(`Duplicate test title: ${title}.`)
    }
    titles.add(title)
    if (testCase.input.trim().length === 0) {
      errors.push(`Test case "${testCase.title}" has empty input.`)
    }
    if (testCase.expectedOutput.trim().length === 0) {
      errors.push(`Test case "${testCase.title}" has empty output.`)
    }
    if (!isPrintableAsciiBlock(testCase.input)) {
      errors.push(
        `Test case "${testCase.title}" input must be printable ASCII.`,
      )
    }
    if (!isPrintableAsciiBlock(testCase.expectedOutput)) {
      errors.push(
        `Test case "${testCase.title}" output must be printable ASCII.`,
      )
    }
    if (testCase.input.length > AI_PUZZLE_MAX_TESTCASE_IO_CHARS) {
      errors.push(`Test case "${testCase.title}" input is too long.`)
    }
    if (testCase.expectedOutput.length > AI_PUZZLE_MAX_TESTCASE_IO_CHARS) {
      errors.push(`Test case "${testCase.title}" output is too long.`)
    }
    if (lineCount(testCase.input) > AI_PUZZLE_MAX_CASE_LINES) {
      errors.push(`Test case "${testCase.title}" input has too many lines.`)
    }
    if (lineCount(testCase.expectedOutput) > AI_PUZZLE_MAX_CASE_LINES) {
      errors.push(`Test case "${testCase.title}" output has too many lines.`)
    }
    if (inputs.has(testCase.input)) {
      errors.push(`Duplicate test input: ${testCase.title}.`)
    }
    inputs.add(testCase.input)
  }
  return errors
}

function buildPuzzlePrompt(
  difficulty: Difficulty,
  previousFailure: string | null,
): readonly object[] {
  return [
    {
      role: 'developer',
      content: [
        'You create original Solo Clash of Code puzzles for production use.',
        'Return one language-agnostic stdin/stdout puzzle only, in the requested JSON schema.',
        'Do not copy known CodinGame or public challenge-bank puzzles.',
        'Every expected output must be exactly correct for its input.',
        'Visible samples must teach the rule; hidden validators must cover edge cases not shown by samples.',
        'Use printable ASCII only in all fields, stdin, and stdout.',
        'Input and output specs must explicitly describe Line 1 and any later lines.',
        'Constraints must include concrete numeric bounds and length bounds.',
        'Avoid dates, time zones, randomness, files, networking, web APIs, locale rules, Unicode-only behavior, regex requirements, and language-specific libraries.',
        'Keep all integers inside [-1000000000, 1000000000] so C, C++, Java, JavaScript, Python, Ruby, Go, Rust, Swift, PHP, C#, Kotlin, Scala, Haskell, and Bash can solve safely.',
        'Use match "float" only for numeric tolerance tasks and state the tolerance clearly; otherwise use "trimmed" or "tokens".',
        'Do not use ambiguous phrases like "any reasonable answer", "your choice", "approximately", or "may vary" unless float tolerance is explicit.',
        'Provide at least two visible samples and at least one hidden edge validator.',
        'Also return referenceSolutionPython: a complete Python 3 program that reads stdin, prints stdout, and passes every generated test case.',
        'The referenceSolutionPython output is the canonical answer source; every expectedOutput must match what that program prints for the matching input.',
        'The Python reference solution may use only safe standard library modules such as math, sys, collections, itertools, functools, or re.',
        'Do not use file I/O, eval, exec, subprocess, sockets, network packages, OS APIs, or shell commands in the reference solution.',
        'Keep input compact, preferably one or two lines; keep referenceSolutionPython under 80 logical lines and under one second for all generated cases.',
        'For hard and expert tiers, prefer compact deterministic tasks such as checksum validation, base conversion, stack validation, rotation, matrix trace, prime/factor logic, modular arithmetic, or bounded search.',
        'Keep the solution possible in a short timed battle without external knowledge.',
        `Difficulty standard: ${DIFFICULTY_STANDARDS[difficulty]}`,
      ].join(' '),
    },
    {
      role: 'user',
      content:
        previousFailure === null
          ? `Create one ${DIFFICULTY_LABELS[difficulty]} puzzle for a timed solo coding battle.`
          : `Previous candidate failed QA: ${previousFailure}. Create a different ${DIFFICULTY_LABELS[difficulty]} puzzle that passes all validators.`,
    },
  ]
}

async function getPythonForAiQa() {
  const languages = resolveAvailableLanguages(await fetchJudge0Languages())
  const python = languages.find((language) => language.def.key === 'python3')
  if (python === undefined) {
    throw new Error('Python 3 is required to QA AI-generated puzzles.')
  }
  return python
}

function summarizeCaseResults(results: readonly CaseResult[]): string {
  return results
    .filter((result) => result.outcome !== 'pass')
    .slice(0, AI_PUZZLE_MAX_FAILURE_DETAILS)
    .map((result) =>
      result.errorKind === null
        ? `${result.testCaseId}: ${result.outcome}`
        : `${result.testCaseId}: ${result.errorKind}`,
    )
    .join('; ')
}

function validateReferenceOutput(result: CaseResult, errors: string[]): void {
  if (result.outcome === 'error') {
    errors.push(
      `${result.testCaseId} ended with ${result.errorKind ?? 'error'}.`,
    )
    return
  }
  const output = result.actualOutput
  if (output.trim().length < AI_PUZZLE_MIN_TESTCASE_IO_CHARS) {
    errors.push(`${result.testCaseId} produced empty output.`)
  }
  if (output.length > AI_PUZZLE_MAX_TESTCASE_IO_CHARS) {
    errors.push(`${result.testCaseId} output is too long.`)
  }
  if (lineCount(output) > AI_PUZZLE_MAX_CASE_LINES) {
    errors.push(`${result.testCaseId} output has too many lines.`)
  }
  if (!isPrintableAsciiBlock(output)) {
    errors.push(`${result.testCaseId} output must be printable ASCII.`)
  }
}

async function verifyReferenceSolution(
  puzzle: Puzzle,
  sourceCode: string,
): Promise<readonly TestCase[]> {
  const python = await getPythonForAiQa()
  const results = await gradeAll(
    python.judge0Id,
    sourceCode,
    puzzle.testcases,
    () => undefined,
  )
  const outputErrors: string[] = []
  for (const result of results) {
    validateReferenceOutput(result, outputErrors)
  }
  if (outputErrors.length > 0) {
    throw new Error(
      `AI puzzle reference solution failed execution QA: ${outputErrors
        .slice(0, AI_PUZZLE_MAX_FAILURE_DETAILS)
        .join(' ')}`,
    )
  }
  const canonicalTestcases = puzzle.testcases.map((testCase) => {
    const result = results.find((item) => item.testCaseId === testCase.id)
    if (result === undefined) {
      throw new Error(`AI puzzle QA missed test case ${testCase.id}.`)
    }
    return {
      ...testCase,
      expectedOutput: result.actualOutput,
    }
  })
  const canonicalResults = await gradeAll(
    python.judge0Id,
    sourceCode,
    canonicalTestcases,
    () => undefined,
  )
  if (!allPassed(canonicalResults)) {
    throw new Error(
      `AI puzzle reference solution failed canonical test cases: ${summarizeCaseResults(
        canonicalResults,
      )}`,
    )
  }
  return canonicalTestcases
}

async function postOpenAiResponse(
  apiKey: string,
  body: Record<string, unknown>,
): Promise<OpenAiResponseBody> {
  const controller = new AbortController()
  const timeoutId = globalThis.setTimeout(() => {
    controller.abort()
  }, OPENAI_REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(getOpenAiResponsesUrl(), {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })
    const responseBody = (await response.json()) as OpenAiResponseBody
    if (
      response.status < OPENAI_HTTP_OK_MIN ||
      response.status >= OPENAI_HTTP_OK_MAX_EXCLUSIVE
    ) {
      throw new Error(
        responseBody.error?.message ??
          `OpenAI request failed: ${String(response.status)}`,
      )
    }
    return responseBody
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('OpenAI request timed out.', { cause: err })
    }
    throw err
  } finally {
    globalThis.clearTimeout(timeoutId)
  }
}

function saveReferenceSolutionsForDev(
  puzzleId: string,
  referenceSolutions: readonly GeneratedReferenceSolution[],
): void {
  if (!import.meta.env.DEV) {
    return
  }
  try {
    const raw = sessionStorage.getItem(SESSION_KEY_AI_REFERENCE_SOLUTIONS)
    const current =
      raw === null ? {} : (JSON.parse(raw) as Record<string, unknown>)
    sessionStorage.setItem(
      SESSION_KEY_AI_REFERENCE_SOLUTIONS,
      JSON.stringify({ ...current, [puzzleId]: referenceSolutions }),
    )
  } catch (err) {
    throw new Error('Could not save AI reference solutions for dev QA.', {
      cause: err,
    })
  }
}

export async function testOpenAiConnection(apiKey: string): Promise<void> {
  await postOpenAiResponse(apiKey, {
    model: getOpenAiModel(),
    reasoning: { effort: OPENAI_REASONING_EFFORT },
    store: false,
    input: OPENAI_API_TEST_PROMPT,
    max_output_tokens: OPENAI_API_TEST_MAX_OUTPUT_TOKENS,
    text: { verbosity: OPENAI_TEXT_VERBOSITY },
  })
}

export async function generateAiPuzzle(
  apiKey: string,
  difficulty: Difficulty,
): Promise<Puzzle> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt < AI_PUZZLE_GENERATION_ATTEMPTS; attempt += 1) {
    try {
      return await generateVerifiedAiPuzzle(
        apiKey,
        difficulty,
        lastError?.message ?? null,
      )
    } catch (err) {
      lastError =
        err instanceof Error ? err : new Error('AI puzzle generation failed.')
    }
  }
  throw lastError ?? new Error('AI puzzle generation failed.')
}

async function generateVerifiedAiPuzzle(
  apiKey: string,
  difficulty: Difficulty,
  previousFailure: string | null,
): Promise<Puzzle> {
  const body = await postOpenAiResponse(apiKey, {
    model: getOpenAiModel(),
    reasoning: { effort: OPENAI_REASONING_EFFORT },
    store: false,
    input: buildPuzzlePrompt(difficulty, previousFailure),
    max_output_tokens: OPENAI_PUZZLE_MAX_OUTPUT_TOKENS,
    text: {
      verbosity: OPENAI_TEXT_VERBOSITY,
      format: {
        type: 'json_schema',
        name: 'solo_clash_puzzle',
        description: 'One original stdin/stdout puzzle with test cases.',
        strict: true,
        schema: GENERATED_PUZZLE_SCHEMA,
      },
    },
  })
  const payload = parseGeneratedPuzzle(extractResponseText(body))
  const errors = validateGeneratedPuzzle(payload, difficulty)
  if (errors.length > 0) {
    throw new Error(errors.join(' '))
  }
  const id = createUserPuzzleId(payload.title)
  const testcases: readonly TestCase[] = payload.testcases.map(
    (testCase, index) => {
      const base = {
        id: `${id}-${String(index)}`,
        title: testCase.title.trim(),
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        hidden: testCase.hidden,
      }
      return testCase.match === DEFAULT_MATCH_MODE
        ? base
        : { ...base, match: testCase.match }
    },
  )
  const puzzle: Puzzle = {
    id,
    title: payload.title.trim(),
    difficulty,
    statement: payload.statement.trim(),
    constraints: payload.constraints.trim(),
    inputSpec: payload.inputSpec.trim(),
    outputSpec: payload.outputSpec.trim(),
    testcases,
    source: 'user',
  }
  const referenceSolution = payload.referenceSolutionPython.trim()
  const canonicalTestcases = await verifyReferenceSolution(
    puzzle,
    referenceSolution,
  )
  const verifiedPuzzle: Puzzle = {
    ...puzzle,
    testcases: canonicalTestcases,
  }
  saveReferenceSolutionsForDev(puzzle.id, [
    { languageKey: 'python3', sourceCode: referenceSolution },
  ])
  return verifiedPuzzle
}
