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
  saveTempPuzzle,
} from '../puzzles/store'
import { DIFFICULTIES, DIFFICULTY_LABELS, type Puzzle } from '../puzzles/types'
import { hasOpenAiApiKeyStored, loadOpenAiApiKey } from '../openai/keyStorage'
import { generateAiPuzzle } from '../openai/puzzleGenerator'
import { getBestTimeMs } from '../scores/store'
import { PUZZLE_SHARE_PARAM, ROUTES, solvePath, type PlayMode } from '../routes'
import { ui } from '../theme/ui'
import { formatStopwatch } from '../utils/time'

interface ModeCardProps {
  readonly active: boolean
  readonly title: string
  readonly meta: string
  readonly onClick: () => void
}

function ModeCard({
  active,
  title,
  meta,
  onClick,
}: ModeCardProps): React.JSX.Element {
  return (
    <button
      type="button"
      className={active ? ui.modeCardActive : ui.modeCard}
      onClick={onClick}
    >
      <span className={ui.modeTitle}>{title}</span>
      <span className={ui.modeMeta}>{meta}</span>
    </button>
  )
}

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

function pickRandomPuzzle(puzzles: readonly Puzzle[]): Puzzle | null {
  if (puzzles.length === 0) {
    return null
  }
  const index = Math.floor(Math.random() * puzzles.length)
  return puzzles[index] ?? null
}

function BuildingPuzzleModal(): React.JSX.Element {
  return (
    <div className={ui.modalBackdrop} role="status" aria-live="polite">
      <div className={ui.modalPanel}>
        <h2 className={ui.pageTitle}>Building your puzzle</h2>
        <div className={ui.buildGraphic} aria-hidden="true">
          <span className={ui.buildBar} />
          <span className={ui.buildBarAlt} />
          <span className={ui.buildBarTall} />
          <span className={ui.buildBarAlt} />
          <span className={ui.buildBar} />
        </div>
        <p className={ui.pageSubtitle}>
          Creating prompt, samples, hidden validators, and stdin/stdout rules.
        </p>
      </div>
    </div>
  )
}

export function HomePage(): React.JSX.Element {
  const navigate = useNavigate()
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<(typeof DIFFICULTIES)[number]>('beginner')
  const [mode, setMode] = useState<PlayMode>('practice')
  const [minutes, setMinutes] = useState<number>(DEFAULT_TIMED_MODE_MINUTES)
  const [puzzles, setPuzzles] = useState<readonly Puzzle[]>(getAllPuzzles)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isBuildingAiPuzzle, setIsBuildingAiPuzzle] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)
  const selectedPuzzles = puzzles.filter(
    (puzzle) => puzzle.difficulty === selectedDifficulty,
  )

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

  const openQuickPuzzle = useCallback(() => {
    const puzzle = pickRandomPuzzle(selectedPuzzles)
    if (puzzle === null) {
      setImportResult({
        kind: 'error',
        message: 'No puzzles found for the selected difficulty.',
      })
      return
    }
    openPuzzle(puzzle)
  }, [openPuzzle, selectedPuzzles])

  const openAiQuickPuzzle = useCallback(async () => {
    if (!hasOpenAiApiKeyStored()) {
      void navigate(ROUTES.account)
      return
    }
    setIsBuildingAiPuzzle(true)
    setImportResult(null)
    try {
      const apiKey = await loadOpenAiApiKey()
      if (apiKey === null) {
        throw new Error('No saved OpenAI key found.')
      }
      const puzzle = await generateAiPuzzle(apiKey, selectedDifficulty)
      saveTempPuzzle(puzzle)
      openPuzzle(puzzle)
    } catch (err) {
      setImportResult({
        kind: 'error',
        message:
          err instanceof Error ? err.message : 'AI puzzle generation failed.',
      })
    } finally {
      setIsBuildingAiPuzzle(false)
    }
  }, [navigate, openPuzzle, selectedDifficulty])

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
      {isBuildingAiPuzzle && <BuildingPuzzleModal />}

      <div className={ui.lobbyPanel}>
        <div className={ui.lobbyHeader}>
          <div className={ui.lobbyTitleBlock}>
            <span className={ui.lobbyEyebrow}>Private solo lobby</span>
            <h1 className={ui.pageTitle}>Solo Clash of Code</h1>
            <p className={ui.pageSubtitle}>
              Short stdin/stdout battles, local scores, live Judge0 execution.
            </p>
          </div>
          <div className={ui.lobbyStats}>
            <div className={ui.lobbyStat}>
              <div className={ui.lobbyStatValue}>{puzzles.length}</div>
              <div className={ui.lobbyStatLabel}>puzzles</div>
            </div>
            <div className={ui.lobbyStat}>
              <div className={ui.lobbyStatValue}>{DIFFICULTIES.length}</div>
              <div className={ui.lobbyStatLabel}>tiers</div>
            </div>
            <div className={ui.lobbyStat}>
              <div className={ui.lobbyStatValue}>
                {TIMED_MODE_MINUTE_OPTIONS.length}
              </div>
              <div className={ui.lobbyStatLabel}>timers</div>
            </div>
          </div>
        </div>

        <div className={ui.startGrid}>
          <div className={ui.startPanel}>
            <div className={ui.field}>
              <label className={ui.label}>Difficulty</label>
              <div className={ui.segmented}>
                {DIFFICULTIES.map((difficulty) => (
                  <button
                    key={difficulty}
                    type="button"
                    className={
                      selectedDifficulty === difficulty
                        ? ui.segmentActive
                        : ui.segment
                    }
                    onClick={() => {
                      setSelectedDifficulty(difficulty)
                    }}
                  >
                    {DIFFICULTY_LABELS[difficulty]}
                  </button>
                ))}
              </div>
            </div>
            <div className={ui.quickActions}>
              <button
                type="button"
                className={ui.btnHero}
                onClick={openQuickPuzzle}
              >
                Quick play
              </button>
              <button
                type="button"
                className={ui.btnSecondary}
                disabled={isBuildingAiPuzzle}
                onClick={() => {
                  void openAiQuickPuzzle()
                }}
              >
                Quick play AI puzzle
              </button>
            </div>
          </div>

          <div className={ui.startPanel}>
            <div className={ui.modeGrid}>
              <ModeCard
                active={mode === 'practice'}
                title="Fastest practice"
                meta="Stopwatch run. Submit all tests to record a best time."
                onClick={() => {
                  setMode('practice')
                }}
              />
              <ModeCard
                active={mode === 'timed'}
                title="Beat the Clock"
                meta="Countdown run. Solves after expiry stay unrecorded."
                onClick={() => {
                  setMode('timed')
                }}
              />
            </div>

            {mode === 'timed' && (
              <div className={ui.minuteRail}>
                {TIMED_MODE_MINUTE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={
                      minutes === option ? ui.btnPrimary : ui.btnSecondary
                    }
                    onClick={() => {
                      setMinutes(option)
                    }}
                  >
                    {`${String(option)} min`}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={ui.toolbar}>
          <button
            type="button"
            className={ui.btnGhost}
            onClick={() => {
              void navigate(ROUTES.account)
            }}
          >
            AI account
          </button>
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
            className={ui.fileInput}
            onChange={handleImportFile}
          />
        </div>
      </div>

      {importResult !== null && (
        <p
          role="alert"
          className={
            importResult.kind === 'success' ? ui.bannerSuccess : ui.bannerError
          }
        >
          {importResult.kind === 'success'
            ? `Imported ${String(importResult.count)} puzzle${importResult.count === 1 ? '' : 's'}.`
            : importResult.message}
        </p>
      )}

      <section className={ui.page}>
        <h2 className={ui.sectionTitle}>
          {DIFFICULTY_LABELS[selectedDifficulty]}
        </h2>
        <div className={ui.puzzleGrid}>
          {selectedPuzzles.map((puzzle) => (
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
    </div>
  )
}
