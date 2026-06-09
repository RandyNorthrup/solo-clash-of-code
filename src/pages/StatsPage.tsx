/** Dashboard showing aggregated solve history: tiers, language usage, streak. */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DifficultyBadge } from '../components/DifficultyBadge'
import { Panel } from '../components/Panel'
import { PERCENT_FACTOR } from '../config/constants'
import { getPuzzleById } from '../puzzles/store'
import { DIFFICULTIES, DIFFICULTY_LABELS } from '../puzzles/types'
import { ROUTES } from '../routes'
import {
  computeLanguageUsage,
  computeStreakDays,
  computeTierStats,
  getSolveHistory,
} from '../scores/history'
import { ui } from '../theme/ui'
import { formatStopwatch } from '../utils/time'

export function StatsPage(): React.JSX.Element {
  const history = useMemo(() => getSolveHistory(), [])
  const tierStats = useMemo(
    () => computeTierStats(history, (id) => getPuzzleById(id)?.difficulty),
    [history],
  )
  const langUsage = useMemo(() => computeLanguageUsage(history), [history])
  // Capture mount time once so the streak value is stable during the session.
  const [nowMs] = useState<number>(() => Date.now())
  const streak = useMemo(
    () => computeStreakDays(history, nowMs),
    [history, nowMs],
  )

  const topLangs = useMemo(
    () =>
      Object.entries(langUsage).sort(
        ([, countA], [, countB]) => countB - countA,
      ),
    [langUsage],
  )

  if (history.length === 0) {
    return (
      <div className={ui.centeredState}>
        <p className={ui.pageTitle}>No solves yet</p>
        <p className={ui.pageSubtitle}>
          Complete a puzzle to start tracking your stats.
        </p>
        <Link to={ROUTES.home} className={ui.link}>
          Browse puzzles
        </Link>
      </div>
    )
  }

  return (
    <div className={ui.page}>
      <div className={ui.toolbar}>
        <h1 className={ui.pageTitle}>Stats</h1>
        <div className={ui.spacer} />
        <span className={ui.tag}>{history.length} solves</span>
        <span className={ui.tag}>{streak} day streak</span>
      </div>

      <Panel title="By difficulty">
        <div className={ui.statsGrid}>
          {DIFFICULTIES.map((diff) => {
            const stats = tierStats[diff]
            return (
              <div key={diff} className={ui.statsCard}>
                <DifficultyBadge difficulty={diff} />
                <p className={ui.statNumber}>{stats.solves}</p>
                <p className={ui.statLabel}>{DIFFICULTY_LABELS[diff]} solves</p>
                {stats.bestMs !== null && (
                  <p className={ui.statBest}>
                    Best: {formatStopwatch(stats.bestMs)}
                  </p>
                )}
                {stats.medianMs !== null && (
                  <p className={ui.statMedian}>
                    Median: {formatStopwatch(stats.medianMs)}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </Panel>

      {topLangs.length > 0 && (
        <Panel title="Languages">
          <div className={ui.statsBars}>
            {topLangs.map(([lang, count]) => (
              <div key={lang} className={ui.statBarRow}>
                <span className={ui.statBarLabel}>{lang}</span>
                <div className={ui.statBarBg}>
                  <div
                    className={ui.statBarFill}
                    style={{
                      width: `${((count / history.length) * PERCENT_FACTOR).toFixed(1)}%`,
                    }}
                  />
                </div>
                <span className={ui.statBarCount}>{count}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}
