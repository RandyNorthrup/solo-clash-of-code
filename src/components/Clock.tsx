/** Labelled monospace time readouts (stopwatch, plain countdown, clash clock). */
import {
  CLASH_CLOCK_MINUTE_UNIT,
  CLASH_CLOCK_SECOND_UNIT,
} from '../config/constants'
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

/** Small clock glyph drawn inline so the timer reads like the CoC clash clock. */
function ClockIcon(): React.JSX.Element {
  return (
    <svg
      className={ui.clockIcon}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

interface ClashClockProps {
  readonly label: string
  readonly minutes: string
  readonly seconds: string
  readonly tone: ClockTone
}

/** Clash-of-Code countdown, e.g. a clock icon followed by "12MN 27SC". */
export function ClashClock({
  label,
  minutes,
  seconds,
  tone,
}: ClashClockProps): React.JSX.Element {
  return (
    <div>
      <div className={ui.clockLabel}>{label}</div>
      <div className={ui.clockRow}>
        <ClockIcon />
        <span className={`${ui.clock} ${TONE_CLASS[tone]}`}>
          {minutes}
          <span className={ui.clockUnit}>{CLASH_CLOCK_MINUTE_UNIT}</span>{' '}
          {seconds}
          <span className={ui.clockUnit}>{CLASH_CLOCK_SECOND_UNIT}</span>
        </span>
      </div>
    </div>
  )
}
