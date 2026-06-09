/** A labelled monospace time readout (stopwatch or countdown). */
import { ui } from '../theme/ui'

export type ClockTone = 'normal' | 'warning' | 'danger'

const TONE_CLASS: Record<ClockTone, string> = {
  normal: ui.clockNormal,
  warning: ui.clockWarning,
  danger: ui.clockDanger,
}

interface ClockProps {
  readonly label: string
  readonly display: string
  readonly tone: ClockTone
}

export function Clock({ label, display, tone }: ClockProps): React.JSX.Element {
  return (
    <div>
      <div className={ui.clockLabel}>{label}</div>
      <div className={`${ui.clock} ${TONE_CLASS[tone]}`}>{display}</div>
    </div>
  )
}
