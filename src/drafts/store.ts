/** Per-puzzle, per-language code drafts so work isn't lost on reload. */
import { STORAGE_KEY_DRAFTS } from '../config/constants'
import { readJson, writeJson } from '../storage/local'

type Drafts = Record<string, string>

const KEY_SEPARATOR = '::'

function draftKey(puzzleId: string, languageKey: string): string {
  return `${puzzleId}${KEY_SEPARATOR}${languageKey}`
}

export function getDraft(puzzleId: string, languageKey: string): string | null {
  const drafts = readJson<Drafts>(STORAGE_KEY_DRAFTS, {})
  return drafts[draftKey(puzzleId, languageKey)] ?? null
}

export function saveDraft(
  puzzleId: string,
  languageKey: string,
  code: string,
): void {
  const drafts = readJson<Drafts>(STORAGE_KEY_DRAFTS, {})
  writeJson(STORAGE_KEY_DRAFTS, {
    ...drafts,
    [draftKey(puzzleId, languageKey)]: code,
  })
}
