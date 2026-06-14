/** Domain types for puzzles and their test cases. */

export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'

export const DIFFICULTIES: readonly Difficulty[] = [
  'beginner',
  'easy',
  'medium',
  'hard',
  'expert',
]

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
}

type PuzzleSource = 'builtin' | 'user'

/**
 * How a test case's output is compared:
 * - `exact`   — byte-identical (after CRLF normalization)
 * - `trimmed` — ignore trailing whitespace per line and trailing blank lines
 * - `tokens`  — ignore all whitespace differences (compare token sequences)
 * - `float`   — compare numeric tokens within a tolerance
 */
export type MatchMode = 'exact' | 'trimmed' | 'tokens' | 'float'

export const DEFAULT_MATCH_MODE: MatchMode = 'trimmed'

export interface TestCase {
  readonly id: string
  readonly title: string
  /** Text fed to the program on stdin. */
  readonly input: string
  /** Expected stdout, compared according to `match`. */
  readonly expectedOutput: string
  /** Hidden cases run on submit but their I/O is not shown up front. */
  readonly hidden: boolean
  /** Output comparison mode. Defaults to {@link DEFAULT_MATCH_MODE}. */
  readonly match?: MatchMode
}

/**
 * Structured input descriptor that drives the per-language starter-stub
 * generator (the "transposer", see {@link ../judge/stubgen}). A small,
 * deterministic DSL — no free-text parsing — so the same puzzle always yields
 * the same stub in any language.
 */
export type IoScalarType = 'int' | 'float' | 'word'
export type IoVarType = IoScalarType | 'string'

interface IoVar {
  readonly name: string
  readonly type: IoVarType
}

/** Read one line. A single `string` var captures the whole line; otherwise the
 *  line is split on spaces into the listed scalar vars. */
interface IoReadInstruction {
  readonly kind: 'read'
  readonly vars: readonly IoVar[]
}

/** Read one line of space-separated scalars into a list named `name`. */
interface IoListInstruction {
  readonly kind: 'list'
  readonly name: string
  readonly type: IoScalarType
}

export type IoInstruction = IoReadInstruction | IoListInstruction

export type IoFormat = readonly IoInstruction[]

export interface Puzzle {
  readonly id: string
  readonly title: string
  readonly difficulty: Difficulty
  /** Markdown-ish statement body. */
  readonly statement: string
  readonly constraints: string
  readonly inputSpec: string
  readonly outputSpec: string
  readonly testcases: readonly TestCase[]
  readonly source: PuzzleSource
  /** Optional structured input format used to generate per-language stubs. */
  readonly ioFormat?: IoFormat
}
