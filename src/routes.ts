/** Centralized route paths and query-parameter keys. */
import { DEFAULT_TIMED_MODE_MINUTES } from './config/constants'

export const PARAM_PUZZLE_ID = 'puzzleId'

export const ROUTES = {
  home: '/',
  account: '/account',
  newPuzzle: '/new',
  stats: '/stats',
  solve: `/solve/:${PARAM_PUZZLE_ID}`,
  share: '/share',
} as const

/** URL query parameter carrying the base64url-encoded puzzle payload. */
export const PUZZLE_SHARE_PARAM = 'p'

export const QUERY_MODE = 'mode'
export const QUERY_MINUTES = 'minutes'
export const QUERY_CLASH = 'clash'

/** Timer dimension: open-ended stopwatch vs. countdown ("Beat the Clock"). */
export type PlayMode = 'practice' | 'timed'

/** Clash scoring/statement dimension (the three Clash-of-Code modes). */
export type ClashMode = 'fastest' | 'shortest' | 'reverse'

export const CLASH_MODES: readonly ClashMode[] = [
  'fastest',
  'shortest',
  'reverse',
]

export const CLASH_MODE_LABELS: Record<ClashMode, string> = {
  fastest: 'Fastest',
  shortest: 'Shortest',
  reverse: 'Reverse',
}

/** One-line description of each clash mode, shown on the lobby mode cards. */
export const CLASH_MODE_BLURBS: Record<ClashMode, string> = {
  fastest: 'Be quick. Pass every test case and your time is the score.',
  shortest: 'Code golf. Pass every test, then your code size is the score.',
  reverse: 'No statement. Deduce the rule from the example cases, then solve.',
}

export const DEFAULT_CLASH_MODE: ClashMode = 'fastest'

export interface SolveOptions {
  /** Clash mode; omitted/`fastest` is the default and not serialized. */
  readonly clash?: ClashMode
  /** Timer mode; `practice` is the default and not serialized. */
  readonly mode?: PlayMode
  /** Countdown length in minutes, used only when `mode` is `timed`. */
  readonly minutes?: number
}

export function solvePath(puzzleId: string, options?: SolveOptions): string {
  const base = `/solve/${encodeURIComponent(puzzleId)}`
  const params = new URLSearchParams()
  if (options?.clash !== undefined && options.clash !== DEFAULT_CLASH_MODE) {
    params.set(QUERY_CLASH, options.clash)
  }
  if (options?.mode === 'timed') {
    params.set(QUERY_MODE, options.mode)
    params.set(
      QUERY_MINUTES,
      String(options.minutes ?? DEFAULT_TIMED_MODE_MINUTES),
    )
  }
  const query = params.toString()
  return query.length > 0 ? `${base}?${query}` : base
}
