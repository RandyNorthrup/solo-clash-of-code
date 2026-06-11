import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('../openai/keyStorage', () => ({
  clearOpenAiApiKey: vi.fn().mockResolvedValue(undefined),
  hasOpenAiApiKeyStored: vi.fn(),
  loadOpenAiApiKey: vi.fn().mockResolvedValue('sk-saved-test-key'),
  saveOpenAiApiKey: vi.fn().mockResolvedValue(undefined),
  validateOpenAiApiKeyFormat: vi.fn().mockReturnValue(null),
}))

vi.mock('../openai/puzzleGenerator', () => ({
  testOpenAiConnection: vi.fn().mockResolvedValue(undefined),
}))

import { AccountPage } from './AccountPage'
import {
  clearOpenAiApiKey,
  hasOpenAiApiKeyStored,
  saveOpenAiApiKey,
} from '../openai/keyStorage'
import { testOpenAiConnection } from '../openai/puzzleGenerator'

function renderAccount() {
  return render(<AccountPage />)
}

describe('AccountPage', () => {
  it('tests and saves a typed OpenAI key without displaying it', async () => {
    vi.mocked(hasOpenAiApiKeyStored).mockReturnValue(false)
    const user = userEvent.setup()
    renderAccount()

    await user.type(screen.getByLabelText('API key'), 'sk-unit-test-key')
    await user.click(screen.getByRole('button', { name: 'Test and save' }))

    await waitFor(() => {
      expect(testOpenAiConnection).toHaveBeenCalledWith('sk-unit-test-key')
    })
    expect(saveOpenAiApiKey).toHaveBeenCalledWith('sk-unit-test-key')
    expect(screen.queryByText('sk-unit-test-key')).not.toBeInTheDocument()
  })

  it('clears a saved key', async () => {
    vi.mocked(hasOpenAiApiKeyStored).mockReturnValue(true)
    const user = userEvent.setup()
    renderAccount()

    await user.click(screen.getByRole('button', { name: 'Clear saved' }))

    await waitFor(() => {
      expect(clearOpenAiApiKey).toHaveBeenCalled()
    })
    expect(screen.getByText(/cleared/i)).toBeInTheDocument()
  })
})
