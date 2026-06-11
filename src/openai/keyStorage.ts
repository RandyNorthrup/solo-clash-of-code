/** Browser-local storage for the optional OpenAI API key. */
import {
  OPENAI_API_KEY_MIN_LENGTH,
  OPENAI_KEY_ALGORITHM,
  OPENAI_KEY_CIPHER_VERSION,
  OPENAI_KEY_DB_NAME,
  OPENAI_KEY_DB_VERSION,
  OPENAI_KEY_IV_BYTES,
  OPENAI_KEY_LENGTH_BITS,
  OPENAI_KEY_RECORD_ID,
  OPENAI_KEY_STORE_NAME,
  STORAGE_KEY_OPENAI_API_KEY_CIPHER,
} from '../config/constants'

interface StoredOpenAiKeyCipher {
  readonly version: number
  readonly iv: readonly number[]
  readonly data: readonly number[]
}

interface StoredCryptoKeyRecord {
  readonly id: string
  readonly key: CryptoKey
}

interface RuntimeCryptoStorage {
  readonly crypto?: Crypto
  readonly indexedDB?: IDBFactory
  readonly isSecureContext?: boolean
}

interface AvailableCryptoStorage {
  readonly crypto: Crypto
  readonly indexedDB: IDBFactory
}

function getSecureStorage(): AvailableCryptoStorage {
  const runtime = globalThis as unknown as RuntimeCryptoStorage
  if (runtime.isSecureContext !== true) {
    throw new Error('Secure browser context required to save an API key.')
  }
  if (runtime.crypto?.subtle === undefined) {
    throw new Error('Web Crypto is unavailable in this browser.')
  }
  if (runtime.indexedDB === undefined) {
    throw new Error('IndexedDB is unavailable in this browser.')
  }
  return {
    crypto: runtime.crypto,
    indexedDB: runtime.indexedDB,
  }
}

function openKeyDb(): Promise<IDBDatabase> {
  const storage = getSecureStorage()
  return new Promise((resolve, reject) => {
    const request = storage.indexedDB.open(
      OPENAI_KEY_DB_NAME,
      OPENAI_KEY_DB_VERSION,
    )
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(OPENAI_KEY_STORE_NAME)) {
        db.createObjectStore(OPENAI_KEY_STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onerror = () => {
      reject(new Error('OpenAI key storage could not be opened.'))
    }
    request.onsuccess = () => {
      resolve(request.result)
    }
  })
}

function readKeyRecord(db: IDBDatabase): Promise<StoredCryptoKeyRecord | null> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OPENAI_KEY_STORE_NAME, 'readonly')
    const store = tx.objectStore(OPENAI_KEY_STORE_NAME)
    const request = store.get(OPENAI_KEY_RECORD_ID)
    request.onerror = () => {
      reject(new Error('OpenAI key record could not be read.'))
    }
    request.onsuccess = () => {
      const result = request.result as StoredCryptoKeyRecord | undefined
      resolve(result ?? null)
    }
  })
}

function writeKeyRecord(db: IDBDatabase, key: CryptoKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OPENAI_KEY_STORE_NAME, 'readwrite')
    const store = tx.objectStore(OPENAI_KEY_STORE_NAME)
    const request = store.put({ id: OPENAI_KEY_RECORD_ID, key })
    request.onerror = () => {
      reject(new Error('OpenAI key record could not be saved.'))
    }
    tx.oncomplete = () => {
      resolve()
    }
    tx.onerror = () => {
      reject(new Error('OpenAI key transaction failed.'))
    }
  })
}

function deleteKeyRecord(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OPENAI_KEY_STORE_NAME, 'readwrite')
    const store = tx.objectStore(OPENAI_KEY_STORE_NAME)
    const request = store.delete(OPENAI_KEY_RECORD_ID)
    request.onerror = () => {
      reject(new Error('OpenAI key record could not be cleared.'))
    }
    tx.oncomplete = () => {
      resolve()
    }
    tx.onerror = () => {
      reject(new Error('OpenAI key clear transaction failed.'))
    }
  })
}

async function getOrCreateCryptoKey(): Promise<CryptoKey> {
  const storage = getSecureStorage()
  const db = await openKeyDb()
  try {
    const existing = await readKeyRecord(db)
    if (existing !== null) {
      return existing.key
    }
    const key = await storage.crypto.subtle.generateKey(
      { name: OPENAI_KEY_ALGORITHM, length: OPENAI_KEY_LENGTH_BITS },
      false,
      ['encrypt', 'decrypt'],
    )
    await writeKeyRecord(db, key)
    return key
  } finally {
    db.close()
  }
}

async function getCryptoKey(): Promise<CryptoKey | null> {
  const db = await openKeyDb()
  try {
    const existing = await readKeyRecord(db)
    return existing?.key ?? null
  } finally {
    db.close()
  }
}

function parseStoredCipher(raw: string): StoredOpenAiKeyCipher {
  const value = JSON.parse(raw) as Partial<StoredOpenAiKeyCipher>
  if (
    value.version !== OPENAI_KEY_CIPHER_VERSION ||
    !Array.isArray(value.iv) ||
    !Array.isArray(value.data)
  ) {
    throw new Error('Stored OpenAI key data is invalid.')
  }
  return {
    version: value.version,
    iv: value.iv,
    data: value.data,
  }
}

export function validateOpenAiApiKeyFormat(apiKey: string): string | null {
  const trimmed = apiKey.trim()
  if (trimmed.length < OPENAI_API_KEY_MIN_LENGTH) {
    return 'Enter a complete OpenAI API key.'
  }
  if (!trimmed.startsWith('sk-')) {
    return 'OpenAI API keys start with sk-.'
  }
  return null
}

export async function saveOpenAiApiKey(apiKey: string): Promise<void> {
  const formatError = validateOpenAiApiKeyFormat(apiKey)
  if (formatError !== null) {
    throw new Error(formatError)
  }
  const storage = getSecureStorage()
  const key = await getOrCreateCryptoKey()
  const iv = storage.crypto.getRandomValues(new Uint8Array(OPENAI_KEY_IV_BYTES))
  const encoded = new TextEncoder().encode(apiKey.trim())
  const encrypted = await storage.crypto.subtle.encrypt(
    { name: OPENAI_KEY_ALGORITHM, iv },
    key,
    encoded,
  )
  const cipher: StoredOpenAiKeyCipher = {
    version: OPENAI_KEY_CIPHER_VERSION,
    iv: [...iv],
    data: [...new Uint8Array(encrypted)],
  }
  localStorage.setItem(
    STORAGE_KEY_OPENAI_API_KEY_CIPHER,
    JSON.stringify(cipher),
  )
}

export async function loadOpenAiApiKey(): Promise<string | null> {
  const raw = localStorage.getItem(STORAGE_KEY_OPENAI_API_KEY_CIPHER)
  if (raw === null) {
    return null
  }
  const key = await getCryptoKey()
  if (key === null) {
    throw new Error('Stored OpenAI key encryption record is missing.')
  }
  const storage = getSecureStorage()
  const cipher = parseStoredCipher(raw)
  const decrypted = await storage.crypto.subtle.decrypt(
    { name: OPENAI_KEY_ALGORITHM, iv: new Uint8Array(cipher.iv) },
    key,
    new Uint8Array(cipher.data),
  )
  return new TextDecoder().decode(decrypted)
}

export async function clearOpenAiApiKey(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY_OPENAI_API_KEY_CIPHER)
  const runtime = globalThis as unknown as RuntimeCryptoStorage
  if (runtime.indexedDB === undefined || runtime.isSecureContext !== true) {
    return
  }
  const db = await openKeyDb()
  try {
    await deleteKeyRecord(db)
  } finally {
    db.close()
  }
}

export function hasOpenAiApiKeyStored(): boolean {
  return localStorage.getItem(STORAGE_KEY_OPENAI_API_KEY_CIPHER) !== null
}
