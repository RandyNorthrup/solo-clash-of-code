import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

vi.mock('../openai/keyStorage', () => ({
  hasOpenAiApiKeyStored: vi.fn(),
  loadOpenAiApiKey: vi.fn(),
}))

vi.mock('../openai/puzzleGenerator', () => ({
  generateAiPuzzle: vi.fn(),
}))

import { HomePage } from './HomePage'
import { hasOpenAiApiKeyStored, loadOpenAiApiKey } from '../openai/keyStorage'
import { generateAiPuzzle } from '../openai/puzzleGenerator'
import { getPuzzleById, getUserPuzzles } from '../puzzles/store'
import { ROUTES } from '../routes'
import type { Puzzle } from '../puzzles/types'

const GENERATED_PUZZLE: Puzzle = {
  id: 'generated-warmup',
  title: 'Generated Warmup',
  difficulty: 'beginner',
  statement: 'Print the input.',
  constraints: '1 <= length <= 10',
  inputSpec: 'Line 1: One string.',
  outputSpec: 'Line 1: The same string.',
  source: 'user',
  testcases: [
    {
      id: 'generated-warmup-0',
      title: 'sample',
      input: 'hi',
      expectedOutput: 'hi',
      hidden: false,
    },
  ],
}

function renderHome() {
  return render(
    <MemoryRouter initialEntries={[ROUTES.home]}>
      <Routes>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.solve} element={<div>solve page</div>} />
        <Route path={ROUTES.account} element={<div>account page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('HomePage start screen', () => {
  beforeEach(() => {
    vi.mocked(generateAiPuzzle).mockReset()
    vi.mocked(hasOpenAiApiKeyStored).mockReturnValue(false)
    vi.mocked(loadOpenAiApiKey).mockResolvedValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('filters puzzle cards by selected difficulty', async () => {
    const user = userEvent.setup()
    renderHome()

    expect(screen.getByText('Echo')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Expert' }))

    expect(screen.getByText('Nth Prime')).toBeInTheDocument()
    expect(screen.queryByText('Echo')).not.toBeInTheDocument()
  })

  it('quick play opens a selected-difficulty puzzle', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const user = userEvent.setup()
    renderHome()

    await user.click(screen.getByRole('button', { name: 'Quick play' }))

    expect(await screen.findByText('solve page')).toBeInTheDocument()
  })

  it('routes AI quick play to account setup when no key is saved', async () => {
    const user = userEvent.setup()
    renderHome()

    await user.click(
      screen.getByRole('button', { name: 'Quick play AI puzzle' }),
    )

    expect(await screen.findByText('account page')).toBeInTheDocument()
  })

  it('opens an AI puzzle as temporary until it is favorited', async () => {
    vi.mocked(hasOpenAiApiKeyStored).mockReturnValue(true)
    vi.mocked(loadOpenAiApiKey).mockResolvedValue('sk-unit-test-key')
    vi.mocked(generateAiPuzzle).mockResolvedValue(GENERATED_PUZZLE)
    const user = userEvent.setup()
    renderHome()

    await user.click(
      screen.getByRole('button', { name: 'Quick play AI puzzle' }),
    )

    expect(await screen.findByText('solve page')).toBeInTheDocument()
    expect(generateAiPuzzle).toHaveBeenCalledWith(
      'sk-unit-test-key',
      'beginner',
    )
    expect(getPuzzleById(GENERATED_PUZZLE.id)?.title).toBe(
      GENERATED_PUZZLE.title,
    )
    expect(getUserPuzzles()).toHaveLength(0)
  })
})
