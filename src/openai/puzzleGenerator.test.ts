import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../judge/judge0', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../judge/judge0')>()
  return {
    ...actual,
    fetchJudge0Languages: vi
      .fn()
      .mockResolvedValue([{ id: 71, name: 'Python (3.8.1)' }]),
  }
})

vi.mock('../judge/grade', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../judge/grade')>()
  return {
    ...actual,
    gradeAll: vi.fn(
      (
        _languageId: number,
        _sourceCode: string,
        cases: readonly {
          readonly id: string
          readonly expectedOutput: string
        }[],
      ) =>
        Promise.resolve(
          cases.map((testCase) => ({
            testCaseId: testCase.id,
            outcome: 'pass' as const,
            actualOutput: testCase.expectedOutput,
            expectedOutput: testCase.expectedOutput,
            detail: '',
            errorKind: null,
          })),
        ),
    ),
  }
})

import { generateAiPuzzle, validateGeneratedPuzzle } from './puzzleGenerator'
import { gradeAll } from '../judge/grade'
import type { Difficulty, MatchMode } from '../puzzles/types'

const VALID_PAYLOAD = {
  title: 'Pair Difference',
  difficulty: 'easy',
  statement: 'Given two integers, print their absolute difference.',
  constraints: '-1000 <= a, b <= 1000',
  inputSpec: 'Line 1: Two space-separated integers a and b.',
  outputSpec: 'Line 1: The absolute value of a - b.',
  ioFormat: [
    {
      kind: 'read',
      vars: [
        { name: 'a', type: 'int' },
        { name: 'b', type: 'int' },
      ],
    },
  ],
  referenceSolutionPython:
    'import sys\nparts = sys.stdin.read().split()\na, b = map(int, parts[:2])\nprint(abs(a - b))',
  testcases: [
    {
      title: 'ascending',
      input: '3 9',
      expectedOutput: '6',
      hidden: false,
      match: 'trimmed',
    },
    {
      title: 'descending',
      input: '10 -2',
      expectedOutput: '12',
      hidden: false,
      match: 'trimmed',
    },
    {
      title: 'same',
      input: '7 7',
      expectedOutput: '0',
      hidden: true,
      match: 'trimmed',
    },
  ],
} as const

function installFetchMock(payload: unknown): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue({
    status: 200,
    json: () =>
      Promise.resolve({
        output_text: JSON.stringify(payload),
      }),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('OpenAI puzzle generation', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.mocked(gradeAll).mockClear()
  })

  it('validates visible samples, hidden validators, and duplicate inputs', () => {
    expect(validateGeneratedPuzzle(VALID_PAYLOAD, 'easy')).toEqual([])

    const weak = {
      ...VALID_PAYLOAD,
      testcases: [
        { ...VALID_PAYLOAD.testcases[0], hidden: false },
        { ...VALID_PAYLOAD.testcases[1], input: '3 9', hidden: false },
      ],
    }

    const errors = validateGeneratedPuzzle(weak, 'easy')
    expect(errors.join(' ')).toMatch(/hidden validator/i)
    expect(errors.join(' ')).toMatch(/duplicate/i)
  })

  it('rejects ambiguous or incomplete generated instructions', () => {
    const weakInstructions = {
      ...VALID_PAYLOAD,
      statement: 'Print any reasonable answer.',
      inputSpec: 'Two integers.',
      outputSpec: 'The result.',
    }

    const errors = validateGeneratedPuzzle(weakInstructions, 'easy').join(' ')

    expect(errors).toMatch(/ambiguous/i)
    expect(errors).toMatch(/Input specification must define Line 1/i)
    expect(errors).toMatch(/Output specification must define Line 1/i)
  })

  it('rejects language-unsafe requirements and unsafe numeric bounds', () => {
    const unsafe = {
      ...VALID_PAYLOAD,
      statement: 'Use Unicode locale rules to compare two strings.',
      constraints: '-999999999999 <= a, b <= 999999999999',
    }

    const errors = validateGeneratedPuzzle(unsafe, 'easy').join(' ')

    expect(errors).toMatch(/language-unsafe/i)
    expect(errors).toMatch(/cross-language safety limit/i)
  })

  it('rejects puzzles that do not fit the selected difficulty', () => {
    const tooHardForBeginner = {
      ...VALID_PAYLOAD,
      difficulty: 'beginner' as Difficulty,
      statement: 'Sort a list and print the frequency of each value.',
    }

    const errors = validateGeneratedPuzzle(tooHardForBeginner, 'beginner').join(
      ' ',
    )

    expect(errors).toMatch(/above beginner/i)
  })

  it('requires tolerance wording when float matching is used', () => {
    const floatWithoutTolerance = {
      ...VALID_PAYLOAD,
      testcases: VALID_PAYLOAD.testcases.map((testCase) => ({
        ...testCase,
        match: 'float' as MatchMode,
      })),
    }

    const errors = validateGeneratedPuzzle(floatWithoutTolerance, 'easy').join(
      ' ',
    )

    expect(errors).toMatch(/Float match requires explicit tolerance/i)
  })

  it('builds a strict structured-output request and converts response to a user puzzle', async () => {
    const fetchMock = installFetchMock(VALID_PAYLOAD)

    const puzzle = await generateAiPuzzle('sk-test-key-for-unit-tests', 'easy')

    expect(puzzle.source).toBe('user')
    expect(puzzle.difficulty).toBe<Difficulty>('easy')
    expect(puzzle.testcases).toHaveLength(VALID_PAYLOAD.testcases.length)
    expect(gradeAll).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [, init] = fetchMock.mock.calls[0]!
    const rawBody = (init as RequestInit).body
    if (typeof rawBody !== 'string') {
      throw new Error('Expected JSON request body.')
    }
    const body = JSON.parse(rawBody) as {
      model: string
      input: readonly { readonly content: string }[]
      reasoning: { effort: string }
      text: { verbosity: string; format: { strict: boolean; type: string } }
      store: boolean
    }
    expect(body.store).toBe(false)
    expect(body.model).toBe('gpt-5.5')
    expect(body.reasoning.effort).toBe('low')
    expect(body.text.verbosity).toBe('low')
    expect(body.text.format.type).toBe('json_schema')
    expect(body.text.format.strict).toBe(true)
    expect(body.input[0]!.content).toContain('production use')
    expect(body.input[0]!.content).toContain('Do not copy')
    expect(body.input[0]!.content).toContain('printable ASCII')
    expect(body.input[0]!.content).toContain('Line 1')
    expect(body.input[0]!.content).toContain('referenceSolutionPython')
  })
})
