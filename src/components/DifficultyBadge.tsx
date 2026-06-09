/** Colored pill showing a puzzle's difficulty tier. */
import { DIFFICULTY_LABELS, type Difficulty } from '../puzzles/types'
import { difficultyBadge, ui } from '../theme/ui'

interface DifficultyBadgeProps {
  readonly difficulty: Difficulty
}

export function DifficultyBadge({
  difficulty,
}: DifficultyBadgeProps): React.JSX.Element {
  return (
    <span className={`${ui.badgeBase} ${difficultyBadge[difficulty]}`}>
      {DIFFICULTY_LABELS[difficulty]}
    </span>
  )
}
