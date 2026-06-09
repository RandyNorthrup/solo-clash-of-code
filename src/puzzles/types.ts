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
}
