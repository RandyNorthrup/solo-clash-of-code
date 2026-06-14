// Live end-to-end certification (C1/C2 for M1+M3): drives a real solve through
// the dev server (which proxies to Judge0). Opens the Echo puzzle, types a
// Python solution over the generated starter stub, and asserts a success
// banner appears — proving real execution + grading + best-time recording.
//
// Requires Judge0 running (npm run judge0:up). Usage: npm run walkthrough
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'
import process from 'node:process'
import { chromium } from 'playwright'

const PORT = 5173
const BASE_URL = `http://localhost:${String(PORT)}`
const SERVER_READY_TIMEOUT_MS = 30_000
const POLL_MS = 300
const SUBMIT_TIMEOUT_MS = 180_000
const OUTPUT = 'screenshots/solve-solved.png'

async function waitForServer() {
  const deadline = Date.now() + SERVER_READY_TIMEOUT_MS
  while (Date.now() < deadline) {
    try {
      if ((await fetch(BASE_URL)).ok) {
        return
      }
    } catch {
      // not up yet
    }
    await sleep(POLL_MS)
  }
  throw new Error('Dev server did not become ready')
}

// Correct Python solution for Echo (the starter stub is intentionally a stub).
const ECHO_SOLUTION = 'import sys\nprint(sys.stdin.readline().rstrip())'

// Correct Python solution for the float-checked Circle Area puzzle.
const CIRCLE_AREA_SOLUTION =
  'import math\nr = int(input())\nprint(math.pi * r * r)'

async function solve(page, puzzleId, code) {
  await page.goto(`${BASE_URL}/solve/${puzzleId}`, { waitUntil: 'load' })

  // Wait until languages have loaded from Judge0 and Submit is enabled.
  await page
    .getByRole('button', { name: 'Submit' })
    .waitFor({ state: 'visible' })
  await page
    .locator('button:has-text("Submit"):not([disabled])')
    .waitFor({ timeout: SUBMIT_TIMEOUT_MS })

  if (code !== null) {
    // Replace the starter template with the given solution.
    await page.locator('.monaco-editor').first().click()
    await page.keyboard.press('ControlOrMeta+A')
    await page.keyboard.press('Backspace')
    await page.evaluate(async (source) => {
      await navigator.clipboard.writeText(source)
    }, code)
    await page.keyboard.press('ControlOrMeta+V')
  }

  await page.getByRole('button', { name: 'Submit' }).click()
  await page
    .getByText(/new best time|Solved in/i)
    .waitFor({ timeout: SUBMIT_TIMEOUT_MS })
  console.log(`PASS: solved "${puzzleId}" end-to-end via Judge0.`)
}

async function main() {
  const server = spawn('npm', ['run', 'dev'], { stdio: 'ignore' })
  let browser
  try {
    await waitForServer()
    browser = await chromium.launch({ channel: 'chrome', headless: true })
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
      origin: BASE_URL,
    })
    const page = await context.newPage()

    // Echo: type a solution over the generated starter stub (trimmed checker).
    await solve(page, 'echo', ECHO_SOLUTION)
    mkdirSync('screenshots', { recursive: true })
    await page.screenshot({ path: OUTPUT, fullPage: true })

    // Circle Area: typed solution, exercises the float checker live.
    await solve(page, 'circle-area', CIRCLE_AREA_SOLUTION)

    console.log(`Done. Screenshot: ${OUTPUT}`)
  } finally {
    if (browser !== undefined) {
      await browser.close()
    }
    server.kill('SIGTERM')
  }
}

main().catch((error) => {
  console.error(`Walkthrough FAILED: ${String(error)}`)
  process.exit(1)
})
