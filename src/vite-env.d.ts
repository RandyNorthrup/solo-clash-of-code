/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_JUDGE0_URL?: string
  readonly VITE_OPENAI_BASE_URL?: string
  readonly VITE_OPENAI_MODEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
