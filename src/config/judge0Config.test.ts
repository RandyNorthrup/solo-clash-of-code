import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const config = readFileSync(resolve(process.cwd(), 'judge0.conf'), 'utf8')
const compose = readFileSync(
  resolve(process.cwd(), 'docker-compose.yml'),
  'utf8',
)
const dockerfile = readFileSync(
  resolve(process.cwd(), 'docker/judge0/Dockerfile'),
  'utf8',
)
const runtimeCheck = readFileSync(
  resolve(process.cwd(), 'docker/judge0/ensure-isolate-runtime'),
  'utf8',
)

describe('Judge0 container configuration', () => {
  it('uses LF endings so container environment values have no carriage returns', () => {
    expect(config).not.toContain('\r')
  })

  it('keeps the local service hostnames intact', () => {
    expect(config).toContain('\nPOSTGRES_HOST=db\n')
    expect(config).toContain('\nREDIS_HOST=redis\n')
    expect(config).toContain('\nMAX_QUEUE_SIZE=100\n')
  })

  it('builds the sandbox from pinned upstream Judge0 and isolate sources', () => {
    expect(compose).toContain('dockerfile: docker/judge0/Dockerfile')
    expect(compose).toContain('condition: service_healthy')
    expect(compose).toContain('curl --fail --silent')
    expect(compose).toContain('postgres:16.2@sha256:')
    expect(compose).toContain('redis:7.2.4@sha256:')
    expect(dockerfile).toContain(
      'judge0/judge0:1.13.1@sha256:6b5d6a66aa19a8e878a52ea3c6a560afc1086734d96e2885b561fd5c6018f082',
    )
    expect(dockerfile).toContain(
      'ISOLATE_COMMIT=9c84554464d2aa9161a424e70af67f4210a12c45',
    )
    expect(dockerfile).toContain('AS isolate-builder')
    expect(runtimeCheck).toContain(
      "REQUIRED_CONTROLLERS=('cpu' 'memory' 'io' 'pids')",
    )
    expect(runtimeCheck).toContain('controllers_delegated && return')
    expect(
      readFileSync(
        resolve(process.cwd(), 'docker/judge0/judge0-cgroup-v2.patch'),
        'utf8',
      ),
    ).toContain('COMPILATION_CPU_TIME_LIMIT_SECONDS = 30')
    expect(
      readFileSync(
        resolve(process.cwd(), 'docker/judge0/judge0-cgroup-v2.patch'),
        'utf8',
      ),
    ).toContain('ISOLATE_BOX_COUNT = 1000')
    const runtimeStage = dockerfile.slice(dockerfile.lastIndexOf('\nFROM '))
    expect(runtimeStage).not.toContain('apt-get')
    expect(runtimeStage).not.toContain('build-essential')
  })
})
