/** Resolves our supported languages against what a Judge0 instance offers. */
import { LANGUAGES, type LanguageDef } from './languages'
import type { Judge0Language } from './judge0'

export interface AvailableLanguage {
  readonly def: LanguageDef
  readonly judge0Id: number
}

/**
 * For each supported language, find the matching Judge0 entry by name. Returns
 * only the languages the running instance actually provides, preserving our
 * preferred display order.
 */
export function resolveAvailableLanguages(
  judge0Languages: readonly Judge0Language[],
): readonly AvailableLanguage[] {
  const available: AvailableLanguage[] = []
  for (const def of LANGUAGES) {
    const match = judge0Languages.find((language) =>
      def.judge0NamePattern.test(language.name),
    )
    if (match !== undefined) {
      available.push({ def, judge0Id: match.id })
    }
  }
  return available
}
