/** The Clash-of-Code jester mascot, rendered from the public favicon asset. */
import { ui } from '../theme/ui'

/** Public path to the jester SVG (lives in `public/favicon.svg`). */
const JESTER_SRC = '/favicon.svg'

export function JesterMark(): React.JSX.Element {
  return (
    <span className={ui.brandMark}>
      <img src={JESTER_SRC} alt="" aria-hidden="true" width={28} height={28} />
    </span>
  )
}
