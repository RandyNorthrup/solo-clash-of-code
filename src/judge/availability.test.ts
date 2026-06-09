import { describe, expect, it } from 'vitest'
import { resolveAvailableLanguages } from './availability'
import { LANGUAGES } from './languages'
import type { Judge0Language } from './judge0'

// Representative Judge0 `name` strings for each supported language.
const JUDGE0_NAMES: Record<string, string> = {
  python3: 'Python (3.8.1)',
  javascript: 'JavaScript (Node.js 12.14.0)',
  typescript: 'TypeScript (3.7.4)',
  cpp: 'C++ (GCC 9.2.0)',
  csharp: 'C# (Mono 6.6.0.161)',
  go: 'Go (1.13.5)',
  rust: 'Rust (1.40.0)',
  ruby: 'Ruby (2.7.0)',
  swift: 'Swift (5.2.3)',
  scala: 'Scala (2.13.2)',
  php: 'PHP (7.4.1)',
  perl: 'Perl (5.28.1)',
  lua: 'Lua (5.3.5)',
  ocaml: 'OCaml (4.09.0)',
  zig: 'Zig (0.10.1)',
}

function buildJudge0List(): Judge0Language[] {
  return LANGUAGES.map((def, index) => ({
    id: index + 1,
    name: JUDGE0_NAMES[def.key]!,
  }))
}

describe('resolveAvailableLanguages', () => {
  it('matches every supported language to a Judge0 id', () => {
    const resolved = resolveAvailableLanguages(buildJudge0List())
    expect(resolved.map((entry) => entry.def.key)).toEqual(
      LANGUAGES.map((def) => def.key),
    )
  })

  it('preserves our preferred order regardless of Judge0 order', () => {
    const shuffled = [...buildJudge0List()].reverse()
    const resolved = resolveAvailableLanguages(shuffled)
    expect(resolved.map((entry) => entry.def.key)).toEqual(
      LANGUAGES.map((def) => def.key),
    )
  })

  it('excludes languages the instance does not provide', () => {
    const withoutZig = buildJudge0List().filter(
      (lang) => !/zig/i.test(lang.name),
    )
    const resolved = resolveAvailableLanguages(withoutZig)
    expect(resolved.some((entry) => entry.def.key === 'zig')).toBe(false)
  })

  it('matches Python 3 but not Python 2', () => {
    const resolved = resolveAvailableLanguages([
      { id: 100, name: 'Python (2.7.17)' },
      { id: 101, name: 'Python (3.8.1)' },
    ])
    const python = resolved.find((entry) => entry.def.key === 'python3')
    expect(python?.judge0Id).toBe(101)
  })

  it('does not confuse C# with C++', () => {
    const resolved = resolveAvailableLanguages([
      { id: 1, name: 'C++ (GCC 9.2.0)' },
      { id: 2, name: 'C# (Mono 6.6.0.161)' },
    ])
    expect(resolved.find((entry) => entry.def.key === 'cpp')?.judge0Id).toBe(1)
    expect(resolved.find((entry) => entry.def.key === 'csharp')?.judge0Id).toBe(
      2,
    )
  })
})
