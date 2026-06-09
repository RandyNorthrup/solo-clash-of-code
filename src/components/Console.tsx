/** Shows output/diagnostics for the first failing visible test case. */
import { ERROR_KIND_LABELS, type CaseResult } from '../judge/grade'
import { ui } from '../theme/ui'

interface ConsoleProps {
  /** First failing visible case, or null when none has failed. */
  readonly result: CaseResult | null
  readonly caseTitle: string | null
}

export function Console({
  result,
  caseTitle,
}: ConsoleProps): React.JSX.Element {
  if (result === null) {
    return <p className={ui.consoleMuted}>Run or Submit to see output here.</p>
  }

  const label = caseTitle ?? 'case'

  if (result.outcome === 'error' && result.errorKind !== null) {
    return (
      <div className={ui.statementBlock}>
        <span className={ui.statementHeading}>
          {ERROR_KIND_LABELS[result.errorKind]} in “{label}”
        </span>
        <pre className={ui.consoleBox}>
          {result.detail.length > 0 ? result.detail : 'No output.'}
        </pre>
      </div>
    )
  }

  return (
    <div className={ui.statementBlock}>
      <span className={ui.statementHeading}>Mismatch in “{label}”</span>
      <pre className={ui.consoleBox}>
        {`Expected:\n${result.expectedOutput}\n\nGot:\n${result.actualOutput}`}
      </pre>
    </div>
  )
}
