/** The core solving experience: statement, editor, runner, timer, scoring. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Clock, type ClockTone } from '../components/Clock'
import { CodeEditor } from '../components/CodeEditor'
import { Console } from '../components/Console'
import { DifficultyBadge } from '../components/DifficultyBadge'
import { Panel } from '../components/Panel'
import { Sparkline } from '../components/Sparkline'
import { TestCaseList } from '../components/TestCaseList'
import {
  DEFAULT_TIMED_MODE_MINUTES,
  MILLISECONDS_PER_SECOND,
  MIN_TITLE_LENGTH,
  TIMED_DANGER_THRESHOLD_SEC,
  TIMED_WARNING_THRESHOLD_SEC,
} from '../config/constants'
import { getDraft, saveDraft } from '../drafts/store'
import { useStopwatch } from '../hooks/useStopwatch'
import type { AvailableLanguage } from '../judge/availability'
import { allPassed, gradeAll, type CaseResult } from '../judge/grade'
import { findLanguageByKey } from '../judge/languages'
import { useLanguages } from '../judge/useLanguages'
import {
  deleteTempPuzzle,
  getPuzzleById,
  isTempPuzzle,
  saveUserPuzzle,
} from '../puzzles/store'
import type { Puzzle } from '../puzzles/types'
import { appendSolve, getRecentTimesForPuzzle } from '../scores/history'
import { recordTimeMs } from '../scores/store'
import { PARAM_PUZZLE_ID, QUERY_MINUTES, QUERY_MODE, ROUTES } from '../routes'
import { ui } from '../theme/ui'
import { formatCountdown, formatStopwatch, minutesToMs } from '../utils/time'

// Intentional default grammar for languages Monaco has no highlighter for
// (e.g. OCaml, Zig). Not an error fallback — the language still executes.
const MONACO_DEFAULT_GRAMMAR = 'plaintext'
const TIMED_DANGER_MS = TIMED_DANGER_THRESHOLD_SEC * MILLISECONDS_PER_SECOND
const TIMED_WARNING_MS = TIMED_WARNING_THRESHOLD_SEC * MILLISECONDS_PER_SECOND
const NO_TIME_REMAINING = 0

type RunScope = 'visible' | 'all'
type BannerKind = 'success' | 'error' | 'info'
interface Banner {
  readonly kind: BannerKind
  readonly text: string
}

const BANNER_CLASS: Record<BannerKind, string> = {
  success: ui.bannerSuccess,
  error: ui.bannerError,
  info: ui.bannerInfo,
}

function readMinutes(value: string | null): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_TIMED_MODE_MINUTES
}

function countdownTone(remainingMs: number): ClockTone {
  if (remainingMs <= TIMED_DANGER_MS) {
    return 'danger'
  }
  if (remainingMs <= TIMED_WARNING_MS) {
    return 'warning'
  }
  return 'normal'
}

function initialCode(puzzleId: string, languageKey: string): string {
  const def = findLanguageByKey(languageKey)
  return getDraft(puzzleId, languageKey) ?? def?.template ?? ''
}

/**
 * Editing surface for one puzzle in one language. Remounting via `key` whenever
 * the puzzle or language changes resets the code/results cleanly without
 * synchronizing effects.
 */
function SolveWorkspace({
  puzzle,
  languageKey,
  monacoId,
  judge0Id,
  languages,
  loading,
  langError,
  isTimed,
  timeUp,
  getElapsedMs,
  stopTimer,
  onSelectLanguage,
}: {
  readonly puzzle: Puzzle
  readonly languageKey: string
  readonly monacoId: string
  readonly judge0Id: number | undefined
  readonly languages: readonly AvailableLanguage[]
  readonly loading: boolean
  readonly langError: string | null
  readonly isTimed: boolean
  readonly timeUp: boolean
  readonly getElapsedMs: () => number
  readonly stopTimer: () => void
  readonly onSelectLanguage: (key: string) => void
}): React.JSX.Element {
  const [code, setCode] = useState(() => initialCode(puzzle.id, languageKey))
  const [results, setResults] = useState<Record<string, CaseResult>>({})
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [banner, setBanner] = useState<Banner | null>(null)
  const [isFavoriteDialogOpen, setIsFavoriteDialogOpen] = useState(false)
  const [favoriteName, setFavoriteName] = useState(puzzle.title)
  const [favoriteSaved, setFavoriteSaved] = useState(
    () => !isTempPuzzle(puzzle.id),
  )
  const [recentTimes, setRecentTimes] = useState<readonly number[]>(() =>
    getRecentTimesForPuzzle(puzzle.id),
  )
  const visibleCaseCount = puzzle.testcases.filter(
    (testCase) => !testCase.hidden,
  ).length
  const hiddenCaseCount = puzzle.testcases.length - visibleCaseCount
  const selectedLanguageLabel =
    languages.find((lang) => lang.def.key === languageKey)?.def.label ??
    languageKey

  // Abort any in-flight batch when the workspace unmounts (e.g. user navigates away).
  const runControllerRef = useRef<AbortController | null>(null)
  useEffect(() => {
    return () => {
      runControllerRef.current?.abort()
    }
  }, [])

  const onChangeCode = useCallback(
    (next: string) => {
      setCode(next)
      saveDraft(puzzle.id, languageKey, next)
    },
    [puzzle.id, languageKey],
  )

  const resetCode = useCallback(() => {
    const template = findLanguageByKey(languageKey)?.template ?? ''
    setCode(template)
    saveDraft(puzzle.id, languageKey, template)
  }, [puzzle.id, languageKey])

  const run = useCallback(
    async (scope: RunScope) => {
      if (judge0Id === undefined || busy) {
        return
      }
      const controller = new AbortController()
      runControllerRef.current = controller
      const cases =
        scope === 'all'
          ? puzzle.testcases
          : puzzle.testcases.filter((testCase) => !testCase.hidden)
      setBusy(true)
      setBanner(null)
      setResults({})
      setPending(new Set(cases.map((testCase) => testCase.id)))
      try {
        const finished = await gradeAll(
          judge0Id,
          code,
          cases,
          (result) => {
            setResults((prev) => ({ ...prev, [result.testCaseId]: result }))
            setPending((prev) => {
              const next = new Set(prev)
              next.delete(result.testCaseId)
              return next
            })
          },
          controller.signal,
        )
        if (scope !== 'all') {
          return
        }
        if (!allPassed(finished)) {
          setBanner({
            kind: 'error',
            text: 'Some test cases did not pass yet.',
          })
          return
        }
        const finalMs = getElapsedMs()
        stopTimer()
        if (isTimed && timeUp) {
          setBanner({
            kind: 'info',
            text: 'Solved, but the clock ran out — not recorded as a best time.',
          })
          return
        }
        const { bestMs, improved } = recordTimeMs(puzzle.id, finalMs)
        appendSolve({
          puzzleId: puzzle.id,
          ms: finalMs,
          lang: languageKey,
          at: Date.now(),
        })
        setRecentTimes(getRecentTimesForPuzzle(puzzle.id))
        setBanner({
          kind: 'success',
          text: improved
            ? `Solved in ${formatStopwatch(finalMs)} — new best time!`
            : `Solved in ${formatStopwatch(finalMs)}. Best: ${formatStopwatch(bestMs)}`,
        })
      } catch (cause: unknown) {
        if (cause instanceof DOMException && cause.name === 'AbortError') {
          return
        }
        setPending(new Set())
        setBanner({
          kind: 'error',
          text: cause instanceof Error ? cause.message : 'Run failed.',
        })
      } finally {
        setBusy(false)
      }
    },
    [
      judge0Id,
      busy,
      puzzle.testcases,
      puzzle.id,
      code,
      languageKey,
      getElapsedMs,
      stopTimer,
      isTimed,
      timeUp,
    ],
  )

  // Ctrl/Cmd+Enter runs the visible sample cases.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        void run('visible')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [run])

  // First failing *visible* case, surfaced in the console panel.
  let failure: { readonly result: CaseResult; readonly title: string } | null =
    null
  for (const testCase of puzzle.testcases) {
    const result = results[testCase.id]
    if (!testCase.hidden && result !== undefined && result.outcome !== 'pass') {
      failure = { result, title: testCase.title }
      break
    }
  }

  const activeBanner: Banner | null =
    banner ??
    (timeUp
      ? { kind: 'info', text: "Time's up! You can keep practising." }
      : null)
  const playerStatus = busy
    ? 'Running'
    : banner?.kind === 'success'
      ? 'Solved'
      : timeUp
        ? 'Time up'
        : 'Solving'
  const canFavoritePuzzle = isTempPuzzle(puzzle.id) && !favoriteSaved
  const favoriteNameTrimmed = favoriteName.trim()
  const favoriteNameTooShort = favoriteNameTrimmed.length < MIN_TITLE_LENGTH

  const openFavoriteDialog = useCallback(() => {
    setFavoriteName(puzzle.title)
    setIsFavoriteDialogOpen(true)
  }, [puzzle.title])

  const closeFavoriteDialog = useCallback(() => {
    setIsFavoriteDialogOpen(false)
  }, [])

  const saveFavoritePuzzle = useCallback(() => {
    if (favoriteNameTooShort) {
      setBanner({
        kind: 'error',
        text: `Use at least ${String(MIN_TITLE_LENGTH)} characters for the saved name.`,
      })
      return
    }
    try {
      saveUserPuzzle({
        ...puzzle,
        title: favoriteNameTrimmed,
        source: 'user',
      })
      deleteTempPuzzle(puzzle.id)
      setFavoriteSaved(true)
      setIsFavoriteDialogOpen(false)
      setBanner({
        kind: 'success',
        text: `Saved puzzle "${favoriteNameTrimmed}".`,
      })
    } catch (err) {
      setBanner({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Puzzle save failed.',
      })
    }
  }, [favoriteNameTooShort, favoriteNameTrimmed, puzzle])

  return (
    <>
      {isFavoriteDialogOpen && (
        <div className={ui.modalBackdrop}>
          <div
            className={ui.modalPanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="favorite-puzzle-title"
          >
            <div className={ui.page}>
              <div>
                <h2 id="favorite-puzzle-title" className={ui.pageTitle}>
                  Save generated puzzle
                </h2>
                <p className={ui.pageSubtitle}>
                  Name it before adding it to your puzzle list.
                </p>
              </div>
              <div className={ui.field}>
                <label className={ui.label} htmlFor="saved-puzzle-name">
                  Saved puzzle name
                </label>
                <input
                  id="saved-puzzle-name"
                  className={ui.input}
                  value={favoriteName}
                  autoFocus
                  onChange={(event) => {
                    setFavoriteName(event.target.value)
                  }}
                />
                {favoriteNameTooShort && (
                  <p className={ui.hint}>
                    Use at least {String(MIN_TITLE_LENGTH)} characters.
                  </p>
                )}
              </div>
              <div className={ui.toolbar}>
                <button
                  type="button"
                  className={ui.btnGhost}
                  onClick={closeFavoriteDialog}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={ui.btnPrimary}
                  disabled={favoriteNameTooShort}
                  onClick={saveFavoritePuzzle}
                >
                  Save favorite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeBanner !== null && (
        <div className={BANNER_CLASS[activeBanner.kind]}>
          {activeBanner.text}
        </div>
      )}

      {!loading && languages.length === 0 && (
        <div className={ui.bannerError}>
          No languages available — start the execution sandbox with `npm run
          judge0:up`.
          {langError !== null && ` (${langError})`}
        </div>
      )}

      <div className={ui.solveWorkbench}>
        <Panel title="Goal">
          <div className={ui.statement}>
            <p className={ui.statementText}>{puzzle.statement}</p>
            <div className={ui.statementBlock}>
              <span className={ui.statementHeading}>Input</span>
              <p className={ui.statementText}>{puzzle.inputSpec}</p>
            </div>
            <div className={ui.statementBlock}>
              <span className={ui.statementHeading}>Output</span>
              <p className={ui.statementText}>{puzzle.outputSpec}</p>
            </div>
            <div className={ui.statementBlock}>
              <span className={ui.statementHeading}>Constraints</span>
              <p className={ui.statementText}>{puzzle.constraints}</p>
            </div>
            <Sparkline times={recentTimes} />
          </div>
        </Panel>

        <div className={ui.editorStack}>
          <Panel
            title="Code"
            actions={
              <select
                className={ui.select}
                value={languageKey}
                disabled={loading || languages.length === 0}
                onChange={(event) => {
                  onSelectLanguage(event.target.value)
                }}
              >
                {languages.map((lang) => (
                  <option key={lang.def.key} value={lang.def.key}>
                    {lang.def.label}
                  </option>
                ))}
              </select>
            }
          >
            <CodeEditor
              monacoId={monacoId}
              value={code}
              onChange={onChangeCode}
            />
          </Panel>
        </div>
      </div>

      <div className={ui.solveBottomRail}>
        <Panel title="Console output">
          <Console
            result={failure?.result ?? null}
            caseTitle={failure?.title ?? null}
          />
        </Panel>

        <Panel title="Test cases">
          <TestCaseList
            testcases={puzzle.testcases}
            results={results}
            pending={pending}
          />
        </Panel>

        <Panel title="Actions">
          <div className={ui.actionStack}>
            <div className={ui.playerRow}>
              <div className={ui.playerIdentity}>
                <span className={ui.playerAvatar}>YOU</span>
                <div>
                  <div className={ui.playerName}>Solo runner</div>
                  <div className={ui.subtleText}>{selectedLanguageLabel}</div>
                </div>
              </div>
              <div className={ui.playerStatus}>{playerStatus}</div>
            </div>

            <div className={ui.metricGrid}>
              <div className={ui.metricBox}>
                <div className={ui.metricValue}>{code.length}</div>
                <div className={ui.metricLabel}>chars</div>
              </div>
              <div className={ui.metricBox}>
                <div className={ui.metricValue}>{visibleCaseCount}</div>
                <div className={ui.metricLabel}>sample</div>
              </div>
              <div className={ui.metricBox}>
                <div className={ui.metricValue}>{hiddenCaseCount}</div>
                <div className={ui.metricLabel}>hidden</div>
              </div>
            </div>

            {canFavoritePuzzle && (
              <button
                type="button"
                className={ui.btnSecondary}
                onClick={openFavoriteDialog}
              >
                Favorite puzzle
              </button>
            )}

            <div className={ui.actionButtons}>
              <button
                type="button"
                className={ui.btnGhost}
                disabled={busy}
                onClick={resetCode}
              >
                Reset
              </button>
              <button
                type="button"
                className={ui.btnSecondary}
                disabled={busy || judge0Id === undefined}
                onClick={() => {
                  void run('visible')
                }}
                title="Run sample cases (Ctrl/Cmd+Enter)"
              >
                Run
              </button>
              <button
                type="button"
                className={ui.btnPrimary}
                disabled={busy || judge0Id === undefined}
                onClick={() => {
                  void run('all')
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </Panel>
      </div>
    </>
  )
}

export function SolvePage(): React.JSX.Element {
  const params = useParams()
  const puzzleId = params[PARAM_PUZZLE_ID] ?? ''
  const puzzle = useMemo(() => getPuzzleById(puzzleId), [puzzleId])
  const [searchParams] = useSearchParams()
  const isTimed = searchParams.get(QUERY_MODE) === 'timed'
  const limitMs = minutesToMs(readMinutes(searchParams.get(QUERY_MINUTES)))

  const { languages, loading, error } = useLanguages()
  const [selectedKey, setSelectedKey] = useState('python3')
  const { start, stop, reset, getElapsedMs, elapsedMs } = useStopwatch()

  // Start the clock when the puzzle opens; reset it if the puzzle changes.
  useEffect(() => {
    reset()
    start()
  }, [puzzleId, reset, start])

  // Effective language: the user's choice if available, else the first offered.
  const effectiveKey = languages.some((lang) => lang.def.key === selectedKey)
    ? selectedKey
    : (languages[0]?.def.key ?? selectedKey)
  const current = languages.find((lang) => lang.def.key === effectiveKey)
  const monacoId =
    findLanguageByKey(effectiveKey)?.monacoId ?? MONACO_DEFAULT_GRAMMAR

  if (puzzle === undefined) {
    return (
      <div className={ui.centeredState}>
        <p className={ui.pageTitle}>Puzzle not found</p>
        <Link to={ROUTES.home} className={ui.link}>
          Back to puzzles
        </Link>
      </div>
    )
  }

  const remainingMs = limitMs - elapsedMs
  const timeUp = isTimed && remainingMs <= NO_TIME_REMAINING

  return (
    <div className={ui.page}>
      <div className={ui.solveHeader}>
        <div className={ui.solveTitleCluster}>
          <Link to={ROUTES.home} className={ui.btnGhost}>
            ← Puzzles
          </Link>
          <DifficultyBadge difficulty={puzzle.difficulty} />
          <h1 className={ui.pageTitle}>{puzzle.title}</h1>
        </div>
        <div className={ui.solveMetaRail}>
          <span className={ui.tag}>
            {isTimed ? 'Beat the Clock' : 'Fastest practice'}
          </span>
          {isTimed ? (
            <Clock
              label="Time left"
              display={formatCountdown(remainingMs)}
              tone={countdownTone(remainingMs)}
            />
          ) : (
            <Clock
              label="Elapsed"
              display={formatStopwatch(elapsedMs)}
              tone="normal"
            />
          )}
        </div>
      </div>

      <SolveWorkspace
        key={`${puzzleId}:${effectiveKey}`}
        puzzle={puzzle}
        languageKey={effectiveKey}
        monacoId={monacoId}
        judge0Id={current?.judge0Id}
        languages={languages}
        loading={loading}
        langError={error}
        isTimed={isTimed}
        timeUp={timeUp}
        getElapsedMs={getElapsedMs}
        stopTimer={stop}
        onSelectLanguage={setSelectedKey}
      />
    </div>
  )
}
