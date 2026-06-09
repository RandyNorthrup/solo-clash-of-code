/** Bordered panel with an optional titled header and an action slot. */
import type { ReactNode } from 'react'
import { ui } from '../theme/ui'

interface PanelProps {
  readonly title?: ReactNode
  readonly actions?: ReactNode
  readonly children: ReactNode
}

export function Panel({
  title,
  actions,
  children,
}: PanelProps): React.JSX.Element {
  return (
    <section className={ui.panel}>
      {title !== undefined && (
        <header className={ui.panelHeader}>
          <span>{title}</span>
          {actions}
        </header>
      )}
      <div className={ui.panelBody}>{children}</div>
    </section>
  )
}
