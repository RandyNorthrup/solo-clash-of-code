/** Optional OpenAI account setup for AI puzzle generation. */
import { useCallback, useState } from 'react'
import { Panel } from '../components/Panel'
import {
  clearOpenAiApiKey,
  hasOpenAiApiKeyStored,
  loadOpenAiApiKey,
  saveOpenAiApiKey,
  validateOpenAiApiKeyFormat,
} from '../openai/keyStorage'
import { testOpenAiConnection } from '../openai/puzzleGenerator'
import { ui } from '../theme/ui'

type AccountStatus =
  | { readonly kind: 'idle'; readonly message: string }
  | { readonly kind: 'success'; readonly message: string }
  | { readonly kind: 'error'; readonly message: string }

function statusClass(status: AccountStatus): string {
  if (status.kind === 'success') {
    return ui.bannerSuccess
  }
  if (status.kind === 'error') {
    return ui.bannerError
  }
  return ui.bannerInfo
}

export function AccountPage(): React.JSX.Element {
  const [apiKey, setApiKey] = useState('')
  const [hasStoredKey, setHasStoredKey] = useState(hasOpenAiApiKeyStored)
  const [isBusy, setIsBusy] = useState(false)
  const [status, setStatus] = useState<AccountStatus>({
    kind: 'idle',
    message: hasStoredKey
      ? 'OpenAI key saved on this device.'
      : 'No OpenAI key saved on this device.',
  })

  const testKey = useCallback(async (key: string) => {
    const formatError = validateOpenAiApiKeyFormat(key)
    if (formatError !== null) {
      throw new Error(formatError)
    }
    await testOpenAiConnection(key.trim())
  }, [])

  const testTypedKey = useCallback(async () => {
    setIsBusy(true)
    try {
      await testKey(apiKey)
      setStatus({ kind: 'success', message: 'OpenAI connection works.' })
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'OpenAI test failed.',
      })
    } finally {
      setIsBusy(false)
    }
  }, [apiKey, testKey])

  const saveTypedKey = useCallback(async () => {
    setIsBusy(true)
    try {
      await testKey(apiKey)
      await saveOpenAiApiKey(apiKey)
      setApiKey('')
      setHasStoredKey(true)
      setStatus({
        kind: 'success',
        message: 'OpenAI key tested and saved on this device.',
      })
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'OpenAI key save failed.',
      })
    } finally {
      setIsBusy(false)
    }
  }, [apiKey, testKey])

  const testSavedKey = useCallback(async () => {
    setIsBusy(true)
    try {
      const stored = await loadOpenAiApiKey()
      if (stored === null) {
        throw new Error('No saved OpenAI key found.')
      }
      await testKey(stored)
      setStatus({ kind: 'success', message: 'Saved OpenAI key works.' })
    } catch (err) {
      setStatus({
        kind: 'error',
        message:
          err instanceof Error ? err.message : 'Saved OpenAI key test failed.',
      })
    } finally {
      setIsBusy(false)
    }
  }, [testKey])

  const clearSavedKey = useCallback(async () => {
    setIsBusy(true)
    try {
      await clearOpenAiApiKey()
      setHasStoredKey(false)
      setStatus({
        kind: 'success',
        message: 'OpenAI key cleared from this device.',
      })
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'OpenAI clear failed.',
      })
    } finally {
      setIsBusy(false)
    }
  }, [])

  return (
    <div className={ui.page}>
      <div>
        <h1 className={ui.pageTitle}>Account Setup</h1>
        <p className={ui.pageSubtitle}>
          Add OpenAI for generated Solo Clash puzzles.
        </p>
      </div>

      <p className={statusClass(status)}>{status.message}</p>

      <Panel title="OpenAI API key">
        <div className={ui.page}>
          <div className={ui.accountSummary}>
            {hasStoredKey ? 'Saved key: ready' : 'Saved key: none'}
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="openai-api-key">
              API key
            </label>
            <input
              id="openai-api-key"
              className={ui.input}
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(event) => {
                setApiKey(event.target.value)
              }}
            />
          </div>
          <div className={ui.toolbar}>
            <button
              type="button"
              className={ui.btnSecondary}
              disabled={isBusy || apiKey.trim().length === 0}
              onClick={() => {
                void testTypedKey()
              }}
            >
              Test key
            </button>
            <button
              type="button"
              className={ui.btnPrimary}
              disabled={isBusy || apiKey.trim().length === 0}
              onClick={() => {
                void saveTypedKey()
              }}
            >
              Test and save
            </button>
            <button
              type="button"
              className={ui.btnGhost}
              disabled={isBusy || !hasStoredKey}
              onClick={() => {
                void testSavedKey()
              }}
            >
              Test saved
            </button>
            <button
              type="button"
              className={ui.btnDanger}
              disabled={isBusy || !hasStoredKey}
              onClick={() => {
                void clearSavedKey()
              }}
            >
              Clear saved
            </button>
          </div>
        </div>
      </Panel>
    </div>
  )
}
