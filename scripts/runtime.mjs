// Cross-platform process helpers used by Node-owned verification scripts.
import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const VITE_CLI_PATH = resolve(REPOSITORY_ROOT, 'node_modules/vite/bin/vite.js')

export function spawnVite(args) {
  return spawn(process.execPath, [VITE_CLI_PATH, ...args], { stdio: 'ignore' })
}

export function runVite(args, environment = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [VITE_CLI_PATH, ...args], {
      stdio: 'inherit',
      env: { ...process.env, ...environment },
    })
    child.once('error', reject)
    child.once('exit', (exitCode, signal) => {
      if (exitCode === 0) {
        resolvePromise()
        return
      }
      reject(
        new Error(
          `Vite ${args.join(' ')} failed with ${
            signal === null
              ? `exit code ${String(exitCode)}`
              : `signal ${signal}`
          }.`,
        ),
      )
    })
  })
}
