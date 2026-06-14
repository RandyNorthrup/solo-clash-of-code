/**
 * Clash-of-Code style test-case list: numbered rows with a status and a
 * per-case PLAY button. Visible cases can be played individually; hidden cases
 * are listed (and run on submit) but not playable up front.
 */
import { CASE_NUMBER_PAD_LENGTH, TIME_PAD_CHAR } from '../config/constants'
import {
  ERROR_KIND_LABELS,
  type CaseResult,
  type ErrorKind,
} from '../judge/grade'
import type { TestCase } from '../puzzles/types'
import { ui } from '../theme/ui'

interface RowStyle {
  readonly row: string
  readonly status: string
  readonly label: string
}

const STATUS_IDLE = '—'
const STATUS_RUNNING = 'Running…'
const STATUS_PASSED = 'Passed'
const STATUS_FAILED = 'Failed'
const PLAY_GLYPH = '▶'

const ERROR_STATUS_CLASS: Record<ErrorKind, string> = {
  compile: ui.testStatusFail,
  runtime: ui.testStatusFail,
  timeout: ui.testStatusTimeout,
  internal: ui.testStatusFail,
}

function rowStyle(
  result: CaseResult | undefined,
  isPending: boolean,
): RowStyle {
  if (isPending) {
    return {
      row: ui.testRowRunning,
      status: ui.testStatusRunning,
      label: STATUS_RUNNING,
    }
  }
  if (result === undefined) {
    return { row: ui.testRowIdle, status: ui.consoleMuted, label: STATUS_IDLE }
  }
  if (result.outcome === 'pass') {
    return {
      row: ui.testRowPass,
      status: ui.testStatusPass,
      label: STATUS_PASSED,
    }
  }
  if (result.outcome === 'error' && result.errorKind !== null) {
    return {
      row: ui.testRowFail,
      status: ERROR_STATUS_CLASS[result.errorKind],
      label: ERROR_KIND_LABELS[result.errorKind],
    }
  }
  return {
    row: ui.testRowFail,
    status: ui.testStatusFail,
    label: STATUS_FAILED,
  }
}

interface TestCaseListProps {
  readonly testcases: readonly TestCase[]
  readonly results: Record<string, CaseResult>
  readonly pending: ReadonlySet<string>
  readonly onPlay: (testCaseId: string) => void
  readonly busy: boolean
}

export function TestCaseList({
  testcases,
  results,
  pending,
  onPlay,
  busy,
}: TestCaseListProps): React.JSX.Element {
  return (
    <div className={ui.testListCompact}>
      {testcases.map((testCase, index) => {
        const style = rowStyle(results[testCase.id], pending.has(testCase.id))
        const number = String(index + 1).padStart(
          CASE_NUMBER_PAD_LENGTH,
          TIME_PAD_CHAR,
        )
        return (
          <div key={testCase.id} className={`${ui.testPlayRow} ${style.row}`}>
            <span className={ui.testNum}>{number}</span>
            <span className={ui.testTitle}>
              {testCase.title}
              {testCase.hidden && <span className={ui.tag}> hidden</span>}
            </span>
            <span className={style.status}>{style.label}</span>
            {!testCase.hidden && (
              <button
                type="button"
                className={ui.testPlayBtn}
                disabled={busy}
                onClick={() => {
                  onPlay(testCase.id)
                }}
              >
                {PLAY_GLYPH} Play
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
