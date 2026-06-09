/**
 * Handles incoming shared-puzzle links (/share?p=<base64url>).
 * Decodes the puzzle on mount, saves it to user storage, then redirects to the
 * solve view. Displays an explicit error rather than silently falling back if
 * the link is malformed.
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { decodePuzzleFromUrl } from '../puzzles/io'
import { saveUserPuzzle } from '../puzzles/store'
import type { Puzzle } from '../puzzles/types'
import { PUZZLE_SHARE_PARAM, ROUTES, solvePath } from '../routes'
import { ui } from '../theme/ui'

type DecodeResult = { readonly puzzle: Puzzle } | { readonly error: string }

export function SharePage(): React.JSX.Element {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Decode once on mount (lazy init — avoids setState inside an effect).
  const [result] = useState<DecodeResult>(() => {
    const encoded = searchParams.get(PUZZLE_SHARE_PARAM)
    if (encoded === null) return { error: 'No puzzle data found in this link.' }
    try {
      return { puzzle: decodePuzzleFromUrl(encoded) }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Invalid share link.',
      }
    }
  })

  // Navigate only — external side effect, not setState.
  useEffect(() => {
    if (!('puzzle' in result)) return
    saveUserPuzzle({ ...result.puzzle, source: 'user' })
    void navigate(solvePath(result.puzzle.id), { replace: true })
  }, [result, navigate])

  if ('error' in result) {
    return (
      <div className={ui.centeredState}>
        <p className={ui.pageTitle}>Invalid share link</p>
        <p className={ui.bannerError}>{result.error}</p>
        <Link to={ROUTES.home} className={ui.link}>
          Back to puzzles
        </Link>
      </div>
    )
  }

  return (
    <div className={ui.centeredState}>
      <p className={ui.pageSubtitle}>Loading shared puzzle…</p>
    </div>
  )
}
