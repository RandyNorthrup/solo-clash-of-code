/** App shell: top navigation bar and routed page content. */
import { NavLink, Outlet } from 'react-router-dom'
import { JesterMark } from './JesterMark'
import { MAIN_CONTENT_ID } from '../config/constants'
import { ROUTES } from '../routes'
import { ui } from '../theme/ui'

function navClass({ isActive }: { isActive: boolean }): string {
  return isActive ? ui.navLinkActive : ui.navLink
}

export function Layout(): React.JSX.Element {
  return (
    <div className={ui.appShell}>
      <a className={ui.skipLink} href={`#${MAIN_CONTENT_ID}`}>
        Skip to main content
      </a>
      <header className={ui.header}>
        <NavLink to={ROUTES.home} className={ui.brand}>
          <JesterMark />
          <span className={ui.brandWord}>Clash of Code</span>
        </NavLink>
        <nav className={ui.nav} aria-label="Primary navigation">
          <NavLink to={ROUTES.home} className={navClass} end>
            Play
          </NavLink>
          <NavLink to={ROUTES.account} className={navClass}>
            Account
          </NavLink>
          <NavLink to={ROUTES.newPuzzle} className={navClass}>
            New Puzzle
          </NavLink>
          <NavLink to={ROUTES.stats} className={navClass}>
            Stats
          </NavLink>
        </nav>
      </header>
      <main id={MAIN_CONTENT_ID} className={ui.main}>
        <Outlet />
      </main>
    </div>
  )
}
