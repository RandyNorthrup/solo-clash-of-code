import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Dedicated test config: no Tailwind/proxy, jsdom environment, explicit imports
// (no test globals) to stay friendly with the strict lint rules.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      // Scope the threshold to pure-logic modules only: no React components,
      // no HTTP clients, no data-only files. These are fully tested and have
      // no external dependencies that would make coverage unreliable.
      include: [
        'src/utils/time.ts',
        'src/judge/grade.ts',
        'src/judge/availability.ts',
        'src/scores/history.ts',
        'src/scores/store.ts',
        'src/drafts/store.ts',
        'src/puzzles/store.ts',
        'src/puzzles/io.ts',
        'src/storage/local.ts',
      ],
      thresholds: {
        statements: 90,
        branches: 80,
        functions: 90,
        lines: 90,
      },
    },
  },
})
