// Visual harness (certification C8): renders the key screens in a real browser
// and saves screenshots to screenshots/ for review and regression diffing.
//
// Usage:  npm run screenshots   (builds, serves the preview, captures, exits)
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'
import process from 'node:process'
import { chromium } from 'playwright'

const PORT = 4173
const BASE_URL = `http://localhost:${String(PORT)}`
const OUTPUT_DIR = 'screenshots'
const SERVER_READY_TIMEOUT_MS = 30_000
const SERVER_POLL_INTERVAL_MS = 300
const RENDER_SETTLE_MS = 2_500

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]

const SCREENS = [
  { name: 'home', path: '/' },
  { name: 'account', path: '/account' },
  { name: 'new-puzzle', path: '/new' },
  { name: 'solve', path: '/solve/echo' },
]

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

async function capture(browser) {
  mkdirSync(OUTPUT_DIR, { recursive: true })
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 2,
    })
    const page = await context.newPage()
    for (const screen of SCREENS) {
      await page.goto(`${BASE_URL}${screen.path}`, { waitUntil: 'load' })
      await sleep(RENDER_SETTLE_MS)
      const file = `${OUTPUT_DIR}/${screen.name}-${viewport.name}.png`
      await page.screenshot({ path: file, fullPage: true })
      console.log(`captured ${file}`)
    }
    await context.close()
  }
}

async function main() {
  const server = spawn(
    'npm',
    ['run', 'preview', '--', '--port', String(PORT), '--strictPort'],
    { stdio: 'ignore' },
  )

  let browser
  try {
    await waitForServer()
    browser = await chromium.launch({ channel: 'chrome', headless: true })
    await capture(browser)
    console.log('\nScreenshots written to ./screenshots')
  } finally {
    if (browser !== undefined) {
      await browser.close()
    }
    server.kill('SIGTERM')
  }
}

main().catch((error) => {
  console.error(`Screenshot run failed: ${String(error)}`)
  process.exit(1)
})
