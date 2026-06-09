/** Renders the per-test-case run status (pass / fail / error kind / running). */
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
}

export function TestCaseList({
  testcases,
  results,
  pending,
}: TestCaseListProps): React.JSX.Element {
  return (
    <div className={ui.page}>
      {testcases.map((testCase) => {
        const style = rowStyle(results[testCase.id], pending.has(testCase.id))
        return (
          <div key={testCase.id} className={`${ui.testRow} ${style.row}`}>
            <span>
              {testCase.title}
              {testCase.hidden && <span className={ui.tag}> hidden</span>}
            </span>
            <span className={style.status}>{style.label}</span>
          </div>
        )
      })}
    </div>
  )
}
