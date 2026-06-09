import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { NewPuzzlePage } from './NewPuzzlePage'
import { getUserPuzzles } from '../puzzles/store'
import { ROUTES } from '../routes'

function renderNew() {
  return render(
    <MemoryRouter initialEntries={[ROUTES.newPuzzle]}>
      <Routes>
        <Route path={ROUTES.newPuzzle} element={<NewPuzzlePage />} />
        <Route path={ROUTES.solve} element={<div>solve page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('NewPuzzlePage', () => {
  it('rejects an empty puzzle with a validation error', async () => {
    const user = userEvent.setup()
    renderNew()

    await user.click(screen.getByRole('button', { name: 'Save puzzle' }))

    expect(screen.getByText(/Title must be at least/i)).toBeInTheDocument()
    expect(getUserPuzzles()).toHaveLength(0)
  })

  it('saves a valid puzzle and navigates to it', async () => {
    const user = userEvent.setup()
    renderNew()

    await user.type(screen.getByLabelText('Title'), 'My Puzzle')
    await user.type(screen.getByLabelText('Input for case 1'), '2 3')
    await user.click(screen.getByRole('button', { name: 'Save puzzle' }))

    await screen.findByText('solve page')

    const saved = getUserPuzzles()
    expect(saved).toHaveLength(1)
    expect(saved[0]!.title).toBe('My Puzzle')
    expect(saved[0]!.testcases[0]!.input).toBe('2 3')
  })
})
