import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { MAIN_CONTENT_ID } from '../config/constants'
import { ROUTES } from '../routes'
import { Layout } from './Layout'

function renderLayout(): void {
  render(
    <MemoryRouter initialEntries={[ROUTES.stats]}>
      <Routes>
        <Route element={<Layout />}>
          <Route path={ROUTES.stats} element={<div>Stats content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('Layout', () => {
  it('exposes every primary route and marks the current page', () => {
    renderLayout()

    const navigation = screen.getByRole('navigation', {
      name: 'Primary navigation',
    })
    expect(navigation).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Play' })).toHaveAttribute(
      'href',
      ROUTES.home,
    )
    expect(screen.getByRole('link', { name: 'Account' })).toHaveAttribute(
      'href',
      ROUTES.account,
    )
    expect(screen.getByRole('link', { name: 'New Puzzle' })).toHaveAttribute(
      'href',
      ROUTES.newPuzzle,
    )
    expect(screen.getByRole('link', { name: 'Stats' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('puts a keyboard-accessible skip link before navigation', async () => {
    const user = userEvent.setup()
    renderLayout()

    const skipLink = screen.getByRole('link', {
      name: 'Skip to main content',
    })
    expect(skipLink).toHaveAttribute('href', `#${MAIN_CONTENT_ID}`)
    expect(screen.getByRole('main')).toHaveAttribute('id', MAIN_CONTENT_ID)

    await user.tab()
    expect(skipLink).toHaveFocus()
  })
})
