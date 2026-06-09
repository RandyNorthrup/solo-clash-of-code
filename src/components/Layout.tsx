/** App shell: top navigation bar and routed page content. */
import { NavLink, Outlet } from 'react-router-dom'
import { ROUTES } from '../routes'
import { ui } from '../theme/ui'

function navClass({ isActive }: { isActive: boolean }): string {
  return isActive ? ui.navLinkActive : ui.navLink
}

export function Layout(): React.JSX.Element {
  return (
    <div className={ui.appShell}>
      <header className={ui.header}>
        <NavLink to={ROUTES.home} className={ui.brand}>
          <span className={ui.brandMark}>{'</>'}</span>
          <span>Solo Clash</span>
        </NavLink>
        <nav className={ui.nav}>
          <NavLink to={ROUTES.home} className={navClass} end>
            Puzzles
          </NavLink>
          <NavLink to={ROUTES.newPuzzle} className={navClass}>
            New Puzzle
          </NavLink>
          <NavLink to={ROUTES.stats} className={navClass}>
            Stats
          </NavLink>
        </nav>
      </header>
      <main className={ui.main}>
        <Outlet />
      </main>
    </div>
  )
}
