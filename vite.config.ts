import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The frontend talks to Judge0 through this dev proxy so we don't need a
// separate backend during local development. Override the target with
// VITE_JUDGE0_URL if your Judge0 instance runs elsewhere.
const DEFAULT_JUDGE0_URL = 'http://localhost:2358'
const DEFAULT_OPENAI_URL = 'https://api.openai.com'

function resolveJudge0Url(): string {
  const raw = process.env.VITE_JUDGE0_URL
  if (raw === undefined || raw === '') {
    return DEFAULT_JUDGE0_URL
  }
  try {
    return new URL(raw).origin
  } catch {
    throw new Error(
      `Invalid VITE_JUDGE0_URL: ${raw}. Expected a full URL like http://localhost:2358`,
    )
  }
}

const JUDGE0 = resolveJudge0Url()
const OPENAI = DEFAULT_OPENAI_URL

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/judge0': {
        target: JUDGE0,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/judge0/, ''),
      },
      '/openai': {
        target: OPENAI,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openai/, ''),
      },
    },
  },
})
