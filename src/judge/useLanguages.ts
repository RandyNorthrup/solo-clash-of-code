/** React hook that loads and caches the available Judge0 languages once. */
import { useEffect, useState } from 'react'
import { fetchJudge0Languages } from './judge0'
import {
  resolveAvailableLanguages,
  type AvailableLanguage,
} from './availability'

export interface LanguagesState {
  readonly languages: readonly AvailableLanguage[]
  readonly loading: boolean
  readonly error: string | null
}

let cache: readonly AvailableLanguage[] | null = null

export function useLanguages(): LanguagesState {
  const [languages, setLanguages] = useState<readonly AvailableLanguage[]>(
    cache ?? [],
  )
  const [loading, setLoading] = useState(cache === null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cache !== null) {
      return
    }
    let active = true
    fetchJudge0Languages()
      .then((raw) => {
        if (!active) {
          return
        }
        const resolved = resolveAvailableLanguages(raw)
        cache = resolved
        setLanguages(resolved)
        setError(null)
      })
      .catch((cause: unknown) => {
        if (!active) {
          return
        }
        setError(
          cause instanceof Error ? cause.message : 'Failed to load languages.',
        )
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [])

  return { languages, loading, error }
}
