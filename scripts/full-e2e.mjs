// Full deterministic certification: drives the browser through standard and AI
// puzzle modes and solves 2 puzzles per difficulty in each mode. AI transport is
// intercepted with schema-valid fixtures by default; --live-ai uses OpenAI.
import { mkdirSync, writeFileSync } from 'node:fs'
import process from 'node:process'
import { setTimeout as sleep } from 'node:timers/promises'
import { chromium } from 'playwright'
import { spawnVite } from './runtime.mjs'

const PORT = 5173
const BASE_URL = `http://localhost:${String(PORT)}`
const SERVER_READY_TIMEOUT_MS = 30_000
const SERVER_POLL_INTERVAL_MS = 300
const SUBMIT_TIMEOUT_MS = 180_000
const AI_BUILD_TIMEOUT_MS = 360_000
const STANDARD_ONLY_FLAG = '--standard-only'
const LIVE_AI_FLAG = '--live-ai'
const OPENAI_API_KEY_ENV = 'OPENAI_API_KEY'
const MOCK_OPENAI_API_KEY = 'sk-e2e-deterministic-fixture-key'
const OPENAI_RESPONSES_ROUTE = `${BASE_URL}/openai/v1/responses`
const SCREENSHOT_DIR = 'screenshots'
const REPORT_PATH = 'screenshots/full-e2e-report.json'
const SESSION_KEY_AI_REFERENCE_SOLUTIONS =
  'coding-game:ai-reference-solutions:v1'
const REQUIRED_AI_PER_DIFFICULTY = 2
const MOCK_MODULUS = 7
const HTTP_OK_STATUS = 200
const HTTP_INTERNAL_SERVER_ERROR_STATUS = 500

const DIFFICULTIES = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert']

const STANDARD_PUZZLES = {
  Beginner: [
    {
      title: 'Echo',
      code: "import sys\nprint(sys.stdin.read().rstrip('\\n'))\n",
    },
    {
      title: 'Sum of Two',
      code: 'a, b = map(int, input().split())\nprint(a + b)\n',
    },
  ],
  Easy: [
    {
      title: 'Reverse String',
      code: 's = input()\nprint(s[::-1])\n',
    },
    {
      title: 'Count Vowels',
      code: "s = input().lower()\nprint(sum(1 for c in s if c in 'aeiou'))\n",
    },
  ],
  Medium: [
    {
      title: 'FizzBuzz',
      code: "n = int(input())\nfor i in range(1, n + 1):\n    if i % 15 == 0:\n        print('FizzBuzz')\n    elif i % 3 == 0:\n        print('Fizz')\n    elif i % 5 == 0:\n        print('Buzz')\n    else:\n        print(i)\n",
    },
    {
      title: 'Greatest Common Divisor',
      code: 'import math\na, b = map(int, input().split())\nprint(math.gcd(a, b))\n',
    },
  ],
  Hard: [
    {
      title: 'To Binary',
      code: 'n = int(input())\nprint(bin(n)[2:])\n',
    },
    {
      title: 'Prime Check',
      code: "n = int(input())\nif n < 2:\n    print('NO')\nelse:\n    ok = True\n    d = 2\n    while d * d <= n:\n        if n % d == 0:\n            ok = False\n            break\n        d += 1\n    print('YES' if ok else 'NO')\n",
    },
  ],
  Expert: [
    {
      title: 'Nth Prime',
      code: 'n = int(input())\nprimes = []\nx = 2\nwhile len(primes) < n:\n    ok = True\n    for p in primes:\n        if p * p > x:\n            break\n        if x % p == 0:\n            ok = False\n            break\n    if ok:\n        primes.append(x)\n    x += 1\nprint(primes[-1])\n',
    },
    {
      title: 'Balanced Brackets',
      code: "s = input().strip()\nstack = []\npairs = {')': '(', ']': '[', '}': '{'}\nfor c in s:\n    if c in '([{':\n        stack.append(c)\n    elif c in pairs:\n        if not stack or stack.pop() != pairs[c]:\n            print('NO')\n            break\nelse:\n    print('YES' if not stack else 'NO')\n",
    },
  ],
}

function loadOpenAiKey() {
  const apiKey = process.env[OPENAI_API_KEY_ENV]?.trim()
  if (apiKey === undefined || apiKey.length === 0) {
    throw new Error(`Set ${OPENAI_API_KEY_ENV} for live AI certification.`)
  }
  return apiKey
}

function parseRequestedDifficulty(requestBody) {
  const serializedInput = JSON.stringify(requestBody.input ?? [])
  const difficulty = DIFFICULTIES.find(
    (candidate) =>
      serializedInput.includes(`Create one ${candidate}`) ||
      serializedInput.includes(`different ${candidate}`),
  )
  if (difficulty === undefined) {
    throw new Error('Mock OpenAI request did not identify a difficulty.')
  }
  return difficulty
}

function buildMockPuzzle(difficulty, sequence) {
  const normalizedDifficulty = difficulty.toLowerCase()
  return {
    title: `${difficulty} Modulo ${String(sequence)}`,
    difficulty: normalizedDifficulty,
    statement: `Given one integer, print its remainder after division by ${String(MOCK_MODULUS)} using modulo arithmetic.`,
    constraints: '-1000 <= value <= 1000',
    inputSpec: 'Line 1: One integer named value.',
    outputSpec: `Line 1: The modulo ${String(MOCK_MODULUS)} remainder of value.`,
    ioFormat: [
      {
        kind: 'read',
        vars: [{ name: 'value', type: 'int' }],
      },
    ],
    referenceSolutionPython: `import sys\nvalue = int(sys.stdin.read().strip())\nprint(value % ${String(MOCK_MODULUS)})`,
    testcases: [
      {
        title: 'positive value',
        input: '8',
        expectedOutput: '1',
        hidden: false,
        match: 'trimmed',
      },
      {
        title: 'negative value',
        input: '-1',
        expectedOutput: '6',
        hidden: false,
        match: 'trimmed',
      },
      {
        title: 'multiple of seven',
        input: '14',
        expectedOutput: '0',
        hidden: true,
        match: 'trimmed',
      },
    ],
  }
}

async function installMockOpenAi(page) {
  let sequence = 0
  await page.route(OPENAI_RESPONSES_ROUTE, async (route) => {
    try {
      const rawBody = route.request().postData()
      if (rawBody === null) {
        throw new Error('Mock OpenAI request body is missing.')
      }
      const requestBody = JSON.parse(rawBody)
      const isPuzzleRequest =
        requestBody.text?.format?.name === 'solo_clash_puzzle'
      const outputText = isPuzzleRequest
        ? JSON.stringify(
            buildMockPuzzle(parseRequestedDifficulty(requestBody), ++sequence),
          )
        : 'ok'
      await route.fulfill({
        status: HTTP_OK_STATUS,
        contentType: 'application/json',
        body: JSON.stringify({ output_text: outputText }),
      })
    } catch (error) {
      await route.fulfill({
        status: HTTP_INTERNAL_SERVER_ERROR_STATUS,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            message:
              error instanceof Error
                ? error.message
                : 'Mock OpenAI transport failed.',
          },
        }),
      })
    }
  })
}

async function waitForServer(server) {
  const deadline = Date.now() + SERVER_READY_TIMEOUT_MS
  while (Date.now() < deadline) {
    if (server.exitCode !== null || server.signalCode !== null) {
      throw new Error('Dev server exited before becoming ready.')
    }
    try {
      if ((await fetch(BASE_URL)).ok) {
        return
      }
    } catch {
      // server not up yet
    }
    await sleep(SERVER_POLL_INTERVAL_MS)
  }
  throw new Error(`Dev server did not become ready at ${BASE_URL}`)
}

async function installOpenAiKey(page, apiKey) {
  await page.goto(`${BASE_URL}/account`, { waitUntil: 'load' })
  await page.getByLabel('API key').fill(apiKey)
  await page.getByRole('button', { name: 'Test and save' }).click()
  await page
    .getByText(/tested and saved/i)
    .waitFor({ timeout: SUBMIT_TIMEOUT_MS })
}

async function selectDifficulty(page, difficulty) {
  await page.goto(BASE_URL, { waitUntil: 'load' })
  await page.getByRole('button', { name: difficulty, exact: true }).click()
}

async function openStandardPuzzle(page, difficulty, title) {
  await selectDifficulty(page, difficulty)
  await page.getByRole('button', { name: title }).click()
  await page.waitForURL(/\/solve\//u, { timeout: SUBMIT_TIMEOUT_MS })
}

async function setSolution(page, languageKey, code) {
  await page.locator('select').selectOption(languageKey)
  await page.locator('.monaco-editor').first().click()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.press('Backspace')
  await page.evaluate(async (source) => {
    await navigator.clipboard.writeText(source)
  }, code)
  await page.keyboard.press('ControlOrMeta+V')
}

async function submitAndAssertSolved(page, label) {
  await page.getByRole('button', { name: 'Submit' }).click()
  await page
    .getByText(/new best time|Solved in/i)
    .waitFor({ timeout: SUBMIT_TIMEOUT_MS })
  console.log(`PASS ${label}`)
}

async function favoriteGeneratedPuzzle(page, savedName) {
  await page.getByRole('button', { name: 'Favorite puzzle' }).click()
  await page.getByLabel('Saved puzzle name').fill(savedName)
  await page.getByRole('button', { name: 'Save favorite' }).click()
  await page
    .getByText(`Saved puzzle "${savedName}".`)
    .waitFor({ timeout: SUBMIT_TIMEOUT_MS })
}

async function solveStandardPuzzle(page, difficulty, puzzle) {
  await openStandardPuzzle(page, difficulty, puzzle.title)
  await setSolution(page, 'python3', puzzle.code)
  await submitAndAssertSolved(page, `standard ${difficulty} / ${puzzle.title}`)
}

async function openAiPuzzle(page, difficulty) {
  await selectDifficulty(page, difficulty)
  await page.getByRole('button', { name: 'Quick play AI puzzle' }).click()
  await page
    .getByText(/Building your puzzle/i)
    .waitFor({ timeout: SUBMIT_TIMEOUT_MS })
  await Promise.race([
    page.waitForURL(/\/solve\//u, { timeout: AI_BUILD_TIMEOUT_MS }),
    page
      .getByRole('alert')
      .waitFor({ timeout: AI_BUILD_TIMEOUT_MS })
      .then(async () => {
        const message = await page.getByRole('alert').textContent()
        throw new Error(
          `AI puzzle generation failed: ${message ?? 'unknown error'}`,
        )
      }),
  ])
  await page
    .getByRole('button', { name: 'Submit' })
    .waitFor({ timeout: SUBMIT_TIMEOUT_MS })
  const url = new URL(page.url())
  const puzzleId = decodeURIComponent(url.pathname.split('/').at(-1) ?? '')
  if (puzzleId.length === 0) {
    throw new Error('AI puzzle did not navigate to a solve route.')
  }
  return puzzleId
}

async function getDevReferenceSolution(page, puzzleId) {
  const stored = await page.evaluate((key) => {
    return sessionStorage.getItem(key)
  }, SESSION_KEY_AI_REFERENCE_SOLUTIONS)
  if (stored === null) {
    throw new Error('AI reference-solution diagnostics missing from session.')
  }
  const parsed = JSON.parse(stored)
  const solutions = parsed[puzzleId]
  if (!Array.isArray(solutions)) {
    throw new Error(`No AI reference solutions found for ${puzzleId}.`)
  }
  const python = solutions.find(
    (solution) => solution.languageKey === 'python3',
  )
  const selected = python ?? solutions[0]
  if (
    selected === undefined ||
    typeof selected.languageKey !== 'string' ||
    typeof selected.sourceCode !== 'string'
  ) {
    throw new Error(`Invalid AI reference solution for ${puzzleId}.`)
  }
  return selected
}

async function solveAiPuzzle(page, difficulty, index) {
  const puzzleId = await openAiPuzzle(page, difficulty)
  const solution = await getDevReferenceSolution(page, puzzleId)
  await setSolution(page, solution.languageKey, solution.sourceCode)
  await submitAndAssertSolved(
    page,
    `ai ${difficulty} #${String(index + 1)} / ${puzzleId}`,
  )
  const savedName = `${difficulty} AI ${String(index + 1)}`
  await favoriteGeneratedPuzzle(page, savedName)
  return { puzzleId, savedName }
}

async function runCertification(page, includeAi) {
  const solvedStandard = []
  const solvedAi = []

  for (const difficulty of DIFFICULTIES) {
    for (const puzzle of STANDARD_PUZZLES[difficulty]) {
      await solveStandardPuzzle(page, difficulty, puzzle)
      solvedStandard.push({ difficulty, title: puzzle.title })
    }
  }

  if (includeAi) {
    for (const difficulty of DIFFICULTIES) {
      for (let index = 0; index < REQUIRED_AI_PER_DIFFICULTY; index += 1) {
        const solved = await solveAiPuzzle(page, difficulty, index)
        solvedAi.push({ difficulty, ...solved })
      }
    }
  }

  return { solvedStandard, solvedAi }
}

async function main() {
  const standardOnly = process.argv.includes(STANDARD_ONLY_FLAG)
  const liveAi = process.argv.includes(LIVE_AI_FLAG)
  if (standardOnly && liveAi) {
    throw new Error(
      `${STANDARD_ONLY_FLAG} and ${LIVE_AI_FLAG} cannot be combined.`,
    )
  }
  const includeAi = !standardOnly
  const apiKey = liveAi ? loadOpenAiKey() : MOCK_OPENAI_API_KEY
  const server = spawnVite(['--port', String(PORT), '--strictPort'])
  let browser
  try {
    await waitForServer(server)
    browser = await chromium.launch({ channel: 'chrome', headless: true })
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
      origin: BASE_URL,
    })
    const page = await context.newPage()
    page.setDefaultTimeout(SUBMIT_TIMEOUT_MS)

    if (includeAi && !liveAi) {
      await installMockOpenAi(page)
    }
    if (includeAi) {
      await installOpenAiKey(page, apiKey)
    }
    const report = await runCertification(page, includeAi)

    mkdirSync(SCREENSHOT_DIR, { recursive: true })
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/full-e2e-final.png`,
      fullPage: true,
    })
    writeFileSync(
      REPORT_PATH,
      JSON.stringify(
        {
          ...report,
          standardCount: report.solvedStandard.length,
          aiCount: report.solvedAi.length,
        },
        null,
        2,
      ),
    )
    console.log(`Done. Report: ${REPORT_PATH}`)
  } finally {
    if (browser !== undefined) {
      await browser.close()
    }
    server.kill('SIGTERM')
  }
}

main().catch((error) => {
  console.error(`Full e2e FAILED: ${String(error)}`)
  process.exit(1)
})
