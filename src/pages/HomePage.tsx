/** Landing page: pick a play mode and choose a puzzle to solve. */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DifficultyBadge } from '../components/DifficultyBadge'
import {
  COPY_FEEDBACK_DURATION_MS,
  DEFAULT_TIMED_MODE_MINUTES,
  TIMED_MODE_MINUTE_OPTIONS,
} from '../config/constants'
import {
  encodePuzzleForUrl,
  exportPuzzlesJson,
  importPuzzlesJson,
} from '../puzzles/io'
import {
  deleteUserPuzzle,
  getAllPuzzles,
  getUserPuzzles,
  saveUserPuzzle,
} from '../puzzles/store'
import { DIFFICULTIES, DIFFICULTY_LABELS, type Puzzle } from '../puzzles/types'
import { getBestTimeMs } from '../scores/store'
import { PUZZLE_SHARE_PARAM, ROUTES, solvePath, type PlayMode } from '../routes'
import { ui } from '../theme/ui'
import { formatStopwatch } from '../utils/time'

function PuzzleCard({
  puzzle,
  onOpen,
  onDelete,
  onShare,
  isCopied,
}: {
  readonly puzzle: Puzzle
  readonly onOpen: (puzzle: Puzzle) => void
  readonly onDelete: (puzzle: Puzzle) => void
  readonly onShare: (puzzle: Puzzle) => void
  readonly isCopied: boolean
}): React.JSX.Element {
  const bestMs = getBestTimeMs(puzzle.id)
  return (
    <div className={ui.puzzleCard}>
      <div className={ui.puzzleCardMeta}>
        <DifficultyBadge difficulty={puzzle.difficulty} />
        {puzzle.source === 'user' && <span className={ui.tag}>custom</span>}
      </div>
      <button
        type="button"
        className={ui.puzzleCardTitle}
        onClick={() => {
          onOpen(puzzle)
        }}
      >
        {puzzle.title}
      </button>
      <div className={ui.puzzleCardMeta}>
        <span
          className={
            bestMs === null ? ui.puzzleCardBestEmpty : ui.puzzleCardBest
          }
        >
          {bestMs === null ? 'No best yet' : `Best ${formatStopwatch(bestMs)}`}
        </span>
        {puzzle.source === 'user' && (
          <div className={ui.toolbar}>
            <button
              type="button"
              className={ui.btnGhost}
              onClick={() => {
                onShare(puzzle)
              }}
            >
              {isCopied ? 'Copied!' : 'Share'}
            </button>
            <button
              type="button"
              className={ui.btnDanger}
              onClick={() => {
                onDelete(puzzle)
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

type ImportResult =
  | { readonly kind: 'success'; readonly count: number }
  | { readonly kind: 'error'; readonly message: string }

export function HomePage(): React.JSX.Element {
  const navigate = useNavigate()
  const [mode, setMode] = useState<PlayMode>('practice')
  const [minutes, setMinutes] = useState<number>(DEFAULT_TIMED_MODE_MINUTES)
  const [puzzles, setPuzzles] = useState<readonly Puzzle[]>(getAllPuzzles)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (copiedId === null) return
    const id = window.setTimeout(() => {
      setCopiedId(null)
    }, COPY_FEEDBACK_DURATION_MS)
    return () => {
      window.clearTimeout(id)
    }
  }, [copiedId])

  const openPuzzle = useCallback(
    (puzzle: Puzzle) => {
      const path =
        mode === 'timed'
          ? solvePath(puzzle.id, { mode, minutes })
          : solvePath(puzzle.id)
      void navigate(path)
    },
    [mode, minutes, navigate],
  )

  const removePuzzle = useCallback((puzzle: Puzzle) => {
    if (window.confirm(`Delete "${puzzle.title}"? This cannot be undone.`)) {
      deleteUserPuzzle(puzzle.id)
      setPuzzles(getAllPuzzles())
    }
  }, [])

  const sharePuzzle = useCallback(async (puzzle: Puzzle) => {
    const encoded = encodePuzzleForUrl(puzzle)
    const url = `${window.location.origin}${ROUTES.share}?${PUZZLE_SHARE_PARAM}=${encoded}`
    await navigator.clipboard.writeText(url)
    setCopiedId(puzzle.id)
  }, [])

  const handleExport = useCallback(() => {
    const json = exportPuzzlesJson(getUserPuzzles())
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'my-puzzles.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }, [])

  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file === undefined) return
      const reader = new FileReader()
      reader.onload = (evt) => {
        const text = evt.target?.result
        if (typeof text !== 'string') return
        try {
          const imported = importPuzzlesJson(text)
          imported.forEach(saveUserPuzzle)
          setPuzzles(getAllPuzzles())
          setImportResult({ kind: 'success', count: imported.length })
        } catch (err) {
          setImportResult({
            kind: 'error',
            message: err instanceof Error ? err.message : 'Import failed.',
          })
        }
      }
      reader.readAsText(file)
      e.target.value = ''
    },
    [],
  )

  return (
    <div className={ui.page}>
      <div>
        <h1 className={ui.pageTitle}>Solo Clash of Code</h1>
        <p className={ui.pageSubtitle}>
          Race the clock or just beat your own best time. Pick a mode, then
          choose a puzzle.
        </p>
      </div>

      <div className={ui.toolbar}>
        <button
          type="button"
          className={mode === 'practice' ? ui.btnPrimary : ui.btnSecondary}
          onClick={() => {
            setMode('practice')
          }}
        >
          Practice
        </button>
        <button
          type="button"
          className={mode === 'timed' ? ui.btnPrimary : ui.btnSecondary}
          onClick={() => {
            setMode('timed')
          }}
        >
          Beat the Clock
        </button>
        {mode === 'timed' &&
          TIMED_MODE_MINUTE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={minutes === option ? ui.btnPrimary : ui.btnSecondary}
              onClick={() => {
                setMinutes(option)
              }}
            >
              {`${String(option)} min`}
            </button>
          ))}
        <div className={ui.spacer} />
        <button
          type="button"
          className={ui.btnSecondary}
          onClick={handleExport}
        >
          Export JSON
        </button>
        <button
          type="button"
          className={ui.btnSecondary}
          onClick={() => {
            importInputRef.current?.click()
          }}
        >
          Import JSON
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImportFile}
        />
      </div>

      {importResult !== null && (
        <p
          className={
            importResult.kind === 'success' ? ui.bannerSuccess : ui.bannerError
          }
        >
          {importResult.kind === 'success'
            ? `Imported ${String(importResult.count)} puzzle${importResult.count === 1 ? '' : 's'}.`
            : importResult.message}
        </p>
      )}

      {DIFFICULTIES.map((difficulty) => {
        const group = puzzles.filter(
          (puzzle) => puzzle.difficulty === difficulty,
        )
        if (group.length === 0) {
          return null
        }
        return (
          <section key={difficulty} className={ui.page}>
            <h2 className={ui.sectionTitle}>{DIFFICULTY_LABELS[difficulty]}</h2>
            <div className={ui.puzzleGrid}>
              {group.map((puzzle) => (
                <PuzzleCard
                  key={puzzle.id}
                  puzzle={puzzle}
                  onOpen={openPuzzle}
                  onDelete={removePuzzle}
                  onShare={(p) => {
                    void sharePuzzle(p)
                  }}
                  isCopied={copiedId === puzzle.id}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
