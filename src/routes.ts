/** Centralized route paths and query-parameter keys. */

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

export type PlayMode = 'practice' | 'timed'

export function solvePath(
  puzzleId: string,
  options?: { readonly mode: PlayMode; readonly minutes: number },
): string {
  const base = `/solve/${encodeURIComponent(puzzleId)}`
  if (options === undefined || options.mode === 'practice') {
    return base
  }
  const params = new URLSearchParams({
    [QUERY_MODE]: options.mode,
    [QUERY_MINUTES]: String(options.minutes),
  })
  return `${base}?${params.toString()}`
}
