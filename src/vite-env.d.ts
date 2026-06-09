/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_JUDGE0_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
