/** Helpers for stable user-created puzzle identifiers. */

function slugifyPuzzleTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
}

export function createUserPuzzleId(title: string): string {
  return `${slugifyPuzzleTitle(title)}-${crypto.randomUUID()}`
}
