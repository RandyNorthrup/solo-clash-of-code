import { describe, expect, it } from 'vitest'
import { generateStub } from './stubgen'
import { LANGUAGES } from './languages'
import type { IoFormat } from '../puzzles/types'

const TWO_INTS: IoFormat = [
  {
    kind: 'read',
    vars: [
      { name: 'a', type: 'int' },
      { name: 'b', type: 'int' },
    ],
  },
]
const STRING_LINE: IoFormat = [
  { kind: 'read', vars: [{ name: 's', type: 'string' }] },
]
const INT_THEN_LIST: IoFormat = [
  { kind: 'read', vars: [{ name: 'n', type: 'int' }] },
  { kind: 'list', name: 'xs', type: 'int' },
]

describe('generateStub', () => {
  it('returns null without a descriptor or for unknown languages', () => {
    expect(generateStub(undefined, 'python3')).toBeNull()
    expect(generateStub([], 'python3')).toBeNull()
    expect(generateStub(TWO_INTS, 'no-such-language')).toBeNull()
  })

  it('produces a stub for every supported language', () => {
    for (const def of LANGUAGES) {
      expect(generateStub(TWO_INTS, def.key)).not.toBeNull()
    }
  })

  it('parses scalars in Python', () => {
    const stub = generateStub(TWO_INTS, 'python3') ?? ''
    expect(stub).toContain('import sys')
    expect(stub).toContain('a = int(')
    expect(stub).toContain('b = int(')
  })

  it('reads a whole line for a string variable', () => {
    expect(generateStub(STRING_LINE, 'python3')).toContain('s = _next()')
    expect(generateStub(STRING_LINE, 'ruby')).toContain('s = _next.call')
  })

  it('reads a list line in Python', () => {
    expect(generateStub(INT_THEN_LIST, 'python3')).toContain(
      'xs = [int(_x) for _x in',
    )
  })

  it('emits idiomatic scaffolding per language', () => {
    expect(generateStub(TWO_INTS, 'java')).toContain('public class Main')
    expect(generateStub(TWO_INTS, 'go')).toContain('package main')
    expect(generateStub(TWO_INTS, 'bash')).toContain('mapfile -t _data')
  })

  it('discards unused variables in Go so the stub compiles', () => {
    const stub = generateStub(TWO_INTS, 'go') ?? ''
    expect(stub).toContain('_ = a')
    expect(stub).toContain('_ = b')
  })
})
