// Live verification (the manual arm of certification C2 for execution): submits
// a tiny "echo stdin" program in each supported language to a running Judge0 and
// asserts the output. Exits non-zero on any failure.
//
// Usage:  node scripts/verify-judge0.mjs            (defaults to localhost:2358)
//         JUDGE0_URL=http://host:port node scripts/verify-judge0.mjs
import process from 'node:process'

const BASE_URL = process.env.JUDGE0_URL ?? 'http://localhost:2358'
const POLL_INTERVAL_MS = 400
const MAX_POLL_ATTEMPTS = 50
const ACCEPTED_STATUS_ID = 3
const FIRST_TERMINAL_STATUS_ID = 3
const STDIN = 'hello world'

// language key -> { judge0 name matcher, source that echoes the first stdin line }
const PROGRAMS = {
  'Python 3': {
    match: /^python.*\(3/i,
    source: 'import sys\nprint(sys.stdin.readline().rstrip())',
  },
  JavaScript: {
    match: /javascript|node\.js/i,
    source: "console.log(require('fs').readFileSync(0,'utf8').split('\\n')[0])",
  },
  Ruby: { match: /^ruby/i, source: 'puts STDIN.gets' },
  'C++': {
    match: /^c\+\+|gcc|g\+\+/i,
    source:
      '#include <iostream>\nint main(){std::string s;std::getline(std::cin,s);std::cout<<s<<std::endl;}',
  },
  Go: {
    match: /^go\b/i,
    source:
      'package main\nimport("bufio";"fmt";"os")\nfunc main(){r:=bufio.NewScanner(os.Stdin);r.Scan();fmt.Println(r.Text())}',
  },
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function getJson(path, init) {
  const response = await fetch(`${BASE_URL}${path}`, init)
  if (!response.ok) {
    throw new Error(`HTTP ${String(response.status)} for ${path}`)
  }
  return response.json()
}

async function runOne(languageId, source) {
  const { token } = await getJson(
    '/submissions?base64_encoded=false&wait=false',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language_id: languageId,
        source_code: source,
        stdin: STDIN,
      }),
    },
  )
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    const result = await getJson(`/submissions/${token}?base64_encoded=false`)
    if (result.status.id >= FIRST_TERMINAL_STATUS_ID) {
      return result
    }
    await sleep(POLL_INTERVAL_MS)
  }
  throw new Error('Timed out waiting for Judge0 result')
}

async function main() {
  const languages = await getJson('/languages')
  let failures = 0

  for (const [label, program] of Object.entries(PROGRAMS)) {
    const match = languages.find((lang) => program.match.test(lang.name))
    if (match === undefined) {
      console.log(`SKIP ${label}: not offered by this Judge0`)
      continue
    }
    try {
      const result = await runOne(match.id, program.source)
      const stdout = (result.stdout ?? '').trim()
      const ok = result.status.id === ACCEPTED_STATUS_ID && stdout === STDIN
      console.log(
        `${ok ? 'PASS' : 'FAIL'} ${label} (${match.name}): ` +
          `status=${result.status.description} stdout=${JSON.stringify(stdout)}`,
      )
      if (!ok) {
        failures += 1
      }
    } catch (error) {
      failures += 1
      console.log(`FAIL ${label}: ${String(error)}`)
    }
  }

  if (failures > 0) {
    console.error(`\n${String(failures)} language(s) failed verification.`)
    process.exit(1)
  }
  console.log('\nAll verified languages executed correctly.')
}

main().catch((error) => {
  console.error(`Could not reach Judge0 at ${BASE_URL}: ${String(error)}`)
  process.exit(1)
})
