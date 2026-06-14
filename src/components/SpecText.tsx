/**
 * Renders puzzle statement/spec text, turning inline `` `tokens` `` into
 * Clash-of-Code style variable chips. Each distinct token gets a stable color
 * (orange or blue) derived from its characters, so the same variable always
 * reads the same way across Goal / Input / Output / Constraints.
 */
import { ui } from '../theme/ui'

/** Splits on backtick-delimited tokens; odd indices are the captured tokens. */
const TOKEN_PATTERN = /`([^`]+)`/u

const EVEN = 2
const CHIP_COLORS = [ui.chipOrange, ui.chipBlue] as const

function chipClass(token: string): string {
  let sum = 0
  for (let index = 0; index < token.length; index += 1) {
    sum += token.charCodeAt(index)
  }
  return CHIP_COLORS[sum % CHIP_COLORS.length] ?? ui.chipOrange
}

interface SpecTextProps {
  readonly text: string
  readonly className?: string
}

export function SpecText({
  text,
  className,
}: SpecTextProps): React.JSX.Element {
  const parts = text.split(TOKEN_PATTERN)
  return (
    <p className={className ?? ui.statementText}>
      {parts.map((part, index) =>
        index % EVEN === 1 ? (
          <span key={`${String(index)}:${part}`} className={chipClass(part)}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </p>
  )
}
