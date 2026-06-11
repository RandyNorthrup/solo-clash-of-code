// Lighthouse gate (certification C7): serves the production preview, runs
// Lighthouse for Performance / Accessibility / Best Practices, and asserts the
// same thresholds previously enforced by LHCI.
//
// Usage: npm run lighthouse
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'
import process from 'node:process'
import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'

const PORT = 4173
const BASE_URL = `http://localhost:${String(PORT)}`
const OUTPUT_DIR = '.lighthouseci'
const REPORT_PATH = `${OUTPUT_DIR}/lhr.json`
const SERVER_READY_TIMEOUT_MS = 30_000
const SERVER_POLL_INTERVAL_MS = 300
const THRESHOLDS = {
  performance: 0.85,
  accessibility: 0.9,
  'best-practices': 0.9,
}

async function waitForServer() {
  const deadline = Date.now() + SERVER_READY_TIMEOUT_MS
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE_URL)
      if (response.ok) {
        return
      }
    } catch {
      // server not up yet
    }
    await sleep(SERVER_POLL_INTERVAL_MS)
  }
  throw new Error(`Preview server did not become ready at ${BASE_URL}`)
}

function assertScores(report) {
  const failures = []
  for (const [category, minScore] of Object.entries(THRESHOLDS)) {
    const score = report.categories?.[category]?.score
    if (typeof score !== 'number') {
      failures.push(`${category}: missing score`)
      continue
    }
    const display = Math.round(score * 100)
    const minDisplay = Math.round(minScore * 100)
    console.log(`${category}: ${String(display)}`)
    if (score < minScore) {
      failures.push(`${category}: ${String(display)} < ${String(minDisplay)}`)
    }
  }
  if (failures.length > 0) {
    throw new Error(`Lighthouse threshold failed: ${failures.join(', ')}`)
  }
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true })
  const server = spawn(
    'npm',
    ['run', 'preview', '--', '--port', String(PORT), '--strictPort'],
    { stdio: 'ignore' },
  )

  let chrome
  try {
    await waitForServer()
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless=new', '--no-sandbox'],
    })
    const result = await lighthouse(BASE_URL, {
      logLevel: 'silent',
      onlyCategories: Object.keys(THRESHOLDS),
      output: 'json',
      port: chrome.port,
    })
    if (result === undefined) {
      throw new Error('Lighthouse returned no result.')
    }
    writeFileSync(REPORT_PATH, JSON.stringify(result.lhr, null, 2))
    assertScores(result.lhr)
    console.log(`Lighthouse report written to ${REPORT_PATH}`)
  } finally {
    if (chrome !== undefined) {
      await chrome.kill()
    }
    server.kill('SIGTERM')
  }
}

main().catch((error) => {
  console.error(String(error))
  process.exit(1)
})
