/**
 * Import/export for puzzle libraries and URL-encoded puzzle sharing.
 * All public functions are pure — no localStorage access here.
 */
import {
  JSON_INDENT_SPACES,
  PUZZLE_EXPORT_SCHEMA_VERSION,
} from '../config/constants'
import {
  DIFFICULTIES,
  type Difficulty,
  type Puzzle,
  type TestCase,
} from './types'

// ─── schema types ────────────────────────────────────────────────────────────

interface PuzzleExportFile {
  readonly version: number
  readonly puzzles: readonly unknown[]
}

// ─── type guards ─────────────────────────────────────────────────────────────

function isString(v: unknown): v is string {
  return typeof v === 'string'
}

function isBoolean(v: unknown): v is boolean {
  return typeof v === 'boolean'
}

function isTestCase(v: unknown): v is TestCase {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    isString(o['id']) &&
    isString(o['title']) &&
    isString(o['input']) &&
    isString(o['expectedOutput']) &&
    isBoolean(o['hidden'])
  )
}

function isDifficulty(v: unknown): v is Difficulty {
  return isString(v) && (DIFFICULTIES as readonly string[]).includes(v)
}

function isPuzzleShape(v: unknown): v is Puzzle {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    isString(o['id']) &&
    isString(o['title']) &&
    isDifficulty(o['difficulty']) &&
    isString(o['statement']) &&
    isString(o['constraints']) &&
    isString(o['inputSpec']) &&
    isString(o['outputSpec']) &&
    Array.isArray(o['testcases']) &&
    (o['testcases'] as unknown[]).every(isTestCase)
  )
}

function isPuzzleExportFile(v: unknown): v is PuzzleExportFile {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return typeof o['version'] === 'number' && Array.isArray(o['puzzles'])
}

// ─── export ──────────────────────────────────────────────────────────────────

/** Serialise an array of puzzles to a JSON string suitable for download. */
export function exportPuzzlesJson(puzzles: readonly Puzzle[]): string {
  return JSON.stringify(
    { version: PUZZLE_EXPORT_SCHEMA_VERSION, puzzles },
    null,
    JSON_INDENT_SPACES,
  )
}

// ─── import ──────────────────────────────────────────────────────────────────

/**
 * Parse and validate a JSON string produced by {@link exportPuzzlesJson}.
 * Returns puzzles with `source` forced to `'user'`.
 * Throws `Error` if the JSON is invalid or the schema does not match.
 */
export function importPuzzlesJson(json: string): readonly Puzzle[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(json) as unknown
  } catch (err) {
    throw new Error('Invalid JSON', { cause: err })
  }

  if (!isPuzzleExportFile(parsed)) {
    throw new Error('Expected { version, puzzles } at top level')
  }
  if (parsed.version !== PUZZLE_EXPORT_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported export version ${String(parsed.version)}; expected ${String(PUZZLE_EXPORT_SCHEMA_VERSION)}`,
    )
  }

  return parsed.puzzles.map((item, index) => {
    if (!isPuzzleShape(item)) {
      throw new Error(`puzzles[${String(index)}] is missing required fields`)
    }
    return { ...item, source: 'user' as const }
  })
}

// ─── URL sharing ─────────────────────────────────────────────────────────────

function toBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  for (const b of bytes) {
    binary += String.fromCharCode(b)
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromBase64Url(encoded: string): string {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

/** Encode a single puzzle as a URL-safe base64url string. */
export function encodePuzzleForUrl(puzzle: Puzzle): string {
  return toBase64Url(JSON.stringify(puzzle))
}

/**
 * Decode a puzzle from a URL-safe base64url string.
 * Throws `Error` if the data is malformed or fails validation.
 */
export function decodePuzzleFromUrl(encoded: string): Puzzle {
  let obj: unknown
  try {
    obj = JSON.parse(fromBase64Url(encoded)) as unknown
  } catch (err) {
    throw new Error('Invalid share link', { cause: err })
  }
  if (!isPuzzleShape(obj)) {
    throw new Error('Share link does not contain a valid puzzle')
  }
  return obj
}
