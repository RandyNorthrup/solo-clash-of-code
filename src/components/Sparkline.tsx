/** SVG mini-chart showing a sequence of solve times for one puzzle. */
import {
  HALF_DIVISOR,
  SPARKLINE_MIN_POINTS,
  SPARKLINE_SVG_HEIGHT,
  SPARKLINE_SVG_WIDTH,
} from '../config/constants'
import { ui } from '../theme/ui'
import { formatStopwatch } from '../utils/time'

interface SparklineProps {
  readonly times: readonly number[]
}

/** Requires at least 2 data points; renders nothing for fewer. */
export function Sparkline({ times }: SparklineProps): React.JSX.Element | null {
  if (times.length < SPARKLINE_MIN_POINTS) {
    return null
  }

  const minT = Math.min(...times)
  const maxT = Math.max(...times)
  const range = maxT - minT

  const points = times
    .map((t, i) => {
      const x = (i / (times.length - 1)) * SPARKLINE_SVG_WIDTH
      const y =
        range > 0
          ? SPARKLINE_SVG_HEIGHT - ((t - minT) / range) * SPARKLINE_SVG_HEIGHT
          : SPARKLINE_SVG_HEIGHT / HALF_DIVISOR
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  const latest = times[times.length - 1] ?? 0
  const first = times[0] ?? 0
  const improved = latest < first

  return (
    <div className={ui.sparklineWrap}>
      <span className={ui.sparklineLabel}>Recent times</span>
      <svg
        viewBox={`0 0 ${String(SPARKLINE_SVG_WIDTH)} ${String(SPARKLINE_SVG_HEIGHT)}`}
        width={SPARKLINE_SVG_WIDTH}
        height={SPARKLINE_SVG_HEIGHT}
        aria-label="Recent solve times sparkline"
      >
        <polyline
          points={points}
          fill="none"
          stroke={improved ? '#3fb950' : '#58a6ff'}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <span className={ui.sparklineLabel}>
        {formatStopwatch(first)} → {formatStopwatch(latest)}
      </span>
    </div>
  )
}
