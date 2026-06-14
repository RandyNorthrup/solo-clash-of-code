/**
 * Transposer — deterministic per-language starter-stub generator.
 *
 * Given a puzzle's structured {@link IoFormat}, emit idiomatic stdin-parsing
 * starter code for the chosen language, ending at a "write your answer" spot.
 * This is the single-player analogue of Clash of Code's "Auto-generated code
 * below aims at helping you parse the standard input." It is pure and
 * deterministic: the same puzzle + language always yields the same stub.
 *
 * Every language the app offers has a dialect below. An unknown key (or a
 * puzzle without a descriptor) returns `null`, and the caller falls back to the
 * language's generic template in `languages.ts` — a documented default.
 */
import type {
  IoFormat,
  IoInstruction,
  IoScalarType,
  IoVarType,
} from '../puzzles/types'

const WRITE_ANSWER =
  'TODO: input is parsed above — write your answer to stdout.'

interface WrapCtx {
  readonly varNames: string[]
  usesNumber: boolean
}

interface Dialect {
  /** Expression that yields the next input line (advancing the cursor). */
  readonly next: string
  /** Declare a string-token array `arr` from a line expression. */
  readonly tokens: (arr: string, line: string) => readonly string[]
  /** Index a token array (`arr`, position `k`) → expression. */
  readonly index: (arr: string, k: number) => string
  readonly int: (expr: string) => string
  readonly float: (expr: string) => string
  /** Declare a scalar variable of `type` from a string expression. */
  readonly scalar: (name: string, type: IoVarType, expr: string) => string
  /** Declare a list variable of scalar `type` from a line expression. */
  readonly list: (
    name: string,
    type: IoScalarType,
    line: string,
  ) => readonly string[]
  readonly comment: (text: string) => string
  /** Assemble the full program from generated statements. */
  readonly wrap: (statements: readonly string[], ctx: WrapCtx) => string
}

function accessExpr(
  d: Dialect,
  arr: string,
  k: number,
  type: IoVarType,
): string {
  const raw = d.index(arr, k)
  if (type === 'int') {
    return d.int(raw)
  }
  if (type === 'float') {
    return d.float(raw)
  }
  return raw
}

function emitInstruction(
  d: Dialect,
  instruction: IoInstruction,
  out: string[],
  ctx: WrapCtx,
  readIndex: { value: number },
): void {
  if (instruction.kind === 'list') {
    ctx.varNames.push(instruction.name)
    if (instruction.type !== 'word') {
      ctx.usesNumber = true
    }
    out.push(...d.list(instruction.name, instruction.type, d.next))
    return
  }
  const { vars } = instruction
  const onlyVar = vars.length === 1 ? vars[0] : undefined
  if (onlyVar?.type === 'string') {
    ctx.varNames.push(onlyVar.name)
    out.push(d.scalar(onlyVar.name, 'string', d.next))
    return
  }
  const arr = `_t${String(readIndex.value)}`
  readIndex.value += 1
  out.push(...d.tokens(arr, d.next))
  vars.forEach((variable, position) => {
    ctx.varNames.push(variable.name)
    if (variable.type === 'int' || variable.type === 'float') {
      ctx.usesNumber = true
    }
    out.push(
      d.scalar(
        variable.name,
        variable.type,
        accessExpr(d, arr, position, variable.type),
      ),
    )
  })
}

function emit(d: Dialect, format: IoFormat): string {
  const ctx: WrapCtx = { varNames: [], usesNumber: false }
  const statements: string[] = []
  const readIndex = { value: 0 }
  for (const instruction of format) {
    emitInstruction(d, instruction, statements, ctx, readIndex)
  }
  statements.push(d.comment(WRITE_ANSWER))
  return d.wrap(statements, ctx)
}

function listType(
  type: IoScalarType,
  ofInt: string,
  ofFloat: string,
  ofWord: string,
): string {
  if (type === 'int') {
    return ofInt
  }
  if (type === 'float') {
    return ofFloat
  }
  return ofWord
}

const python: Dialect = {
  next: '_next()',
  tokens: (arr, line) => [`${arr} = ${line}.split()`],
  index: (arr, k) => `${arr}[${String(k)}]`,
  int: (expr) => `int(${expr})`,
  float: (expr) => `float(${expr})`,
  scalar: (name, _type, expr) => `${name} = ${expr}`,
  list: (name, type, line) => {
    const conv = listType(type, 'int(_x)', 'float(_x)', '_x')
    return [`${name} = [${conv} for _x in ${line}.split()]`]
  },
  comment: (text) => `# ${text}`,
  wrap: (statements) =>
    [
      'import sys',
      '',
      "_data = sys.stdin.read().split('\\n')",
      '_pos = 0',
      '',
      '',
      'def _next():',
      '    global _pos',
      '    _line = _data[_pos]',
      '    _pos += 1',
      '    return _line',
      '',
      '',
      ...statements,
      '',
    ].join('\n'),
}

const javascript: Dialect = {
  next: '_next()',
  tokens: (arr, line) => [`const ${arr} = ${line}.trim().split(/\\s+/)`],
  index: (arr, k) => `${arr}[${String(k)}]`,
  int: (expr) => `Number(${expr})`,
  float: (expr) => `Number(${expr})`,
  scalar: (name, _type, expr) => `const ${name} = ${expr}`,
  list: (name, type, line) => {
    const map = type === 'word' ? '' : '.map(Number)'
    return [`const ${name} = ${line}.trim().split(/\\s+/)${map}`]
  },
  comment: (text) => `// ${text}`,
  wrap: (statements) =>
    [
      "const _data = require('fs').readFileSync(0, 'utf8').split('\\n')",
      'let _pos = 0',
      'const _next = () => _data[_pos++]',
      '',
      ...statements,
      '',
    ].join('\n'),
}

const typescript: Dialect = {
  next: '_next()',
  tokens: (arr, line) => [
    `const ${arr}: string[] = ${line}.trim().split(/\\s+/)`,
  ],
  index: (arr, k) => `${arr}[${String(k)}]`,
  int: (expr) => `Number(${expr})`,
  float: (expr) => `Number(${expr})`,
  scalar: (name, type, expr) => {
    const ty = type === 'int' || type === 'float' ? 'number' : 'string'
    return `const ${name}: ${ty} = ${expr}`
  },
  list: (name, type, line) => {
    const ty = type === 'word' ? 'string[]' : 'number[]'
    const map = type === 'word' ? '' : '.map(Number)'
    return [`const ${name}: ${ty} = ${line}.trim().split(/\\s+/)${map}`]
  },
  comment: (text) => `// ${text}`,
  wrap: (statements) =>
    [
      // Judge0's tsc has no @types/node, so declare the bits of `require` used.
      'declare function require(id: string): { readFileSync(fd: number, enc: string): string }',
      "const _data: string[] = require('fs').readFileSync(0, 'utf8').split('\\n')",
      'let _pos = 0',
      'const _next = (): string => _data[_pos++]',
      '',
      ...statements,
      '',
    ].join('\n'),
}

const ruby: Dialect = {
  next: '_next.call',
  tokens: (arr, line) => [`${arr} = ${line}.split`],
  index: (arr, k) => `${arr}[${String(k)}]`,
  int: (expr) => `${expr}.to_i`,
  float: (expr) => `${expr}.to_f`,
  scalar: (name, _type, expr) => `${name} = ${expr}`,
  list: (name, type, line) => {
    const map = listType(type, '.map(&:to_i)', '.map(&:to_f)', '')
    return [`${name} = ${line}.split${map}`]
  },
  comment: (text) => `# ${text}`,
  wrap: (statements) =>
    [
      '_data = STDIN.read.split("\\n")',
      '_pos = 0',
      '_next = lambda do',
      '  _line = _data[_pos]',
      '  _pos += 1',
      '  _line',
      'end',
      '',
      ...statements,
      '',
    ].join('\n'),
}

const php: Dialect = {
  next: '_next()',
  tokens: (arr, line) => [`$${arr} = preg_split('/\\s+/', trim(${line}));`],
  index: (arr, k) => `$${arr}[${String(k)}]`,
  int: (expr) => `intval(${expr})`,
  float: (expr) => `floatval(${expr})`,
  scalar: (name, _type, expr) => `$${name} = ${expr};`,
  list: (name, type, line) => {
    const open = listType(
      type,
      "array_map('intval', ",
      "array_map('floatval', ",
      '(',
    )
    return [`$${name} = ${open}preg_split('/\\s+/', trim(${line})));`]
  },
  comment: (text) => `// ${text}`,
  wrap: (statements) =>
    [
      '<?php',
      '$_data = explode("\\n", stream_get_contents(STDIN));',
      '$_pos = 0;',
      'function _next() {',
      '    global $_data, $_pos;',
      '    return $_data[$_pos++];',
      '}',
      '',
      ...statements,
      '',
    ].join('\n'),
}

const lua: Dialect = {
  next: '_next()',
  tokens: (arr, line) => [
    `local ${arr} = {}`,
    `for _w in string.gmatch(${line}, "%S+") do ${arr}[#${arr} + 1] = _w end`,
  ],
  index: (arr, k) => `${arr}[${String(k + 1)}]`,
  int: (expr) => `math.floor(tonumber(${expr}))`,
  float: (expr) => `tonumber(${expr})`,
  scalar: (name, _type, expr) => `local ${name} = ${expr}`,
  list: (name, type, line) => {
    const conv = listType(
      type,
      'math.floor(tonumber(_w))',
      'tonumber(_w)',
      '_w',
    )
    return [
      `local ${name} = {}`,
      `for _w in string.gmatch(${line}, "%S+") do ${name}[#${name} + 1] = ${conv} end`,
    ]
  },
  comment: (text) => `-- ${text}`,
  wrap: (statements) =>
    [
      'local _data = {}',
      'for _l in io.lines() do _data[#_data + 1] = _l end',
      'local _pos = 0',
      'local function _next()',
      '  _pos = _pos + 1',
      '  return _data[_pos]',
      'end',
      '',
      ...statements,
      '',
    ].join('\n'),
}

const perl: Dialect = {
  next: '_next()',
  tokens: (arr, line) => [`my @${arr} = split ' ', ${line};`],
  index: (arr, k) => `$${arr}[${String(k)}]`,
  int: (expr) => `int(${expr})`,
  float: (expr) => `(${expr} + 0)`,
  scalar: (name, _type, expr) => `my $${name} = ${expr};`,
  list: (name, type, line) => {
    const map = listType(type, 'map { int($_) } ', 'map { $_ + 0 } ', '')
    return [`my @${name} = ${map}split ' ', ${line};`]
  },
  comment: (text) => `# ${text}`,
  wrap: (statements) =>
    [
      'my @_data = split /\\n/, do { local $/; <STDIN> };',
      'my $_pos = 0;',
      'sub _next { return $_data[$_pos++]; }',
      '',
      ...statements,
      '',
    ].join('\n'),
}

const cpp: Dialect = {
  next: '_next()',
  tokens: (arr, line) => [`vector<string> ${arr} = _split(${line});`],
  index: (arr, k) => `${arr}[${String(k)}]`,
  int: (expr) => `stoll(${expr})`,
  float: (expr) => `stod(${expr})`,
  scalar: (name, type, expr) => {
    const ty = listType(
      type === 'string' ? 'word' : type,
      'long long',
      'double',
      'string',
    )
    return `${ty} ${name} = ${expr};`
  },
  list: (name, type, line) => {
    const ty = listType(type, 'long long', 'double', 'string')
    const conv = listType(type, 'stoll(_w)', 'stod(_w)', '_w')
    return [
      `vector<${ty}> ${name};`,
      `for (auto& _w : _split(${line})) ${name}.push_back(${conv});`,
    ]
  },
  comment: (text) => `// ${text}`,
  wrap: (statements) =>
    [
      '#include <bits/stdc++.h>',
      'using namespace std;',
      '',
      'static vector<string> _split(const string& _s) {',
      '    vector<string> _r; stringstream _ss(_s); string _w;',
      '    while (_ss >> _w) _r.push_back(_w);',
      '    return _r;',
      '}',
      '',
      'int main() {',
      '    auto _next = []() { string _l; getline(cin, _l); return _l; };',
      ...statements.map((s) => `    ${s}`),
      '    return 0;',
      '}',
      '',
    ].join('\n'),
}

const go: Dialect = {
  next: '_next()',
  tokens: (arr, line) => [`${arr} := _split(${line})`],
  index: (arr, k) => `${arr}[${String(k)}]`,
  int: (expr) => `_atoi(${expr})`,
  float: (expr) => `_atof(${expr})`,
  scalar: (name, _type, expr) => `${name} := ${expr}`,
  list: (name, type, line) => {
    const ty = listType(type, 'int64', 'float64', 'string')
    const conv = listType(type, '_atoi(_w)', '_atof(_w)', '_w')
    return [
      `${name} := []${ty}{}`,
      `for _, _w := range _split(${line}) { ${name} = append(${name}, ${conv}) }`,
    ]
  },
  comment: (text) => `// ${text}`,
  wrap: (statements, ctx) => {
    const imports = ['bufio', 'fmt', 'os', 'strings']
    if (ctx.usesNumber) {
      imports.push('strconv')
    }
    const helpers = ctx.usesNumber
      ? [
          'func _atoi(s string) int64 { v, _ := strconv.ParseInt(strings.TrimSpace(s), 10, 64); return v }',
          'func _atof(s string) float64 { v, _ := strconv.ParseFloat(strings.TrimSpace(s), 64); return v }',
          '',
        ]
      : []
    const discards = ctx.varNames.map((name) => `    _ = ${name}`)
    return [
      'package main',
      '',
      'import (',
      ...imports.map((name) => `    "${name}"`),
      ')',
      '',
      'var _r = bufio.NewReader(os.Stdin)',
      '',
      'func _next() string { _l, _ := _r.ReadString(\'\\n\'); return strings.TrimRight(_l, "\\r\\n") }',
      'func _split(s string) []string { return strings.Fields(s) }',
      ...helpers.map((line) => line),
      '',
      'func main() {',
      ...statements.map((s) => `    ${s}`),
      ...discards,
      '    fmt.Print("")',
      '}',
      '',
    ].join('\n')
  },
}

const rust: Dialect = {
  next: '_next()',
  tokens: (arr, line) => [
    `let ${arr}: Vec<String> = ${line}.split_whitespace().map(|s| s.to_string()).collect();`,
  ],
  index: (arr, k) => `${arr}[${String(k)}]`,
  int: (expr) => `${expr}.parse::<i64>().unwrap()`,
  float: (expr) => `${expr}.parse::<f64>().unwrap()`,
  scalar: (name, _type, expr) => `let ${name} = ${expr};`,
  list: (name, type, line) => {
    const ty = listType(type, 'i64', 'f64', 'String')
    const map =
      type === 'word' ? '|s| s.to_string()' : `|s| s.parse::<${ty}>().unwrap()`
    return [
      `let ${name}: Vec<${ty}> = ${line}.split_whitespace().map(${map}).collect();`,
    ]
  },
  comment: (text) => `// ${text}`,
  wrap: (statements) =>
    [
      'use std::io::{self, Read};',
      '',
      'fn main() {',
      '    let mut _input = String::new();',
      '    io::stdin().read_to_string(&mut _input).unwrap();',
      '    let mut _lines = _input.lines();',
      '    let mut _next = || _lines.next().unwrap_or("").to_string();',
      ...statements.map((s) => `    ${s}`),
      '}',
      '',
    ].join('\n'),
}

const INVARIANT = 'System.Globalization.CultureInfo.InvariantCulture'

const csharp: Dialect = {
  next: '_Next()',
  tokens: (arr, line) => [
    `string[] ${arr} = ${line}.Split(new[]{' '}, StringSplitOptions.RemoveEmptyEntries);`,
  ],
  index: (arr, k) => `${arr}[${String(k)}]`,
  int: (expr) => `long.Parse(${expr})`,
  float: (expr) => `double.Parse(${expr}, ${INVARIANT})`,
  scalar: (name, type, expr) => {
    const ty = listType(
      type === 'string' ? 'word' : type,
      'long',
      'double',
      'string',
    )
    return `${ty} ${name} = ${expr};`
  },
  list: (name, type, line) => {
    const ty = listType(type, 'long', 'double', 'string')
    const sel = listType(
      type,
      '.Select(long.Parse).ToArray()',
      `.Select(_s => double.Parse(_s, ${INVARIANT})).ToArray()`,
      '.ToArray()',
    )
    return [
      `${ty}[] ${name} = ${line}.Split(new[]{' '}, StringSplitOptions.RemoveEmptyEntries)${sel};`,
    ]
  },
  comment: (text) => `// ${text}`,
  wrap: (statements) =>
    [
      'using System;',
      'using System.Linq;',
      '',
      'class Solution {',
      "    static string[] _data = Console.In.ReadToEnd().Split('\\n');",
      '    static int _pos = 0;',
      '    static string _Next() { return _data[_pos++]; }',
      '    static void Main() {',
      ...statements.map((s) => `        ${s}`),
      '    }',
      '}',
      '',
    ].join('\n'),
}

const swift: Dialect = {
  next: '_next()',
  tokens: (arr, line) => [
    `let ${arr} = ${line}.split(separator: " ").map(String.init)`,
  ],
  index: (arr, k) => `${arr}[${String(k)}]`,
  int: (expr) => `Int(${expr})!`,
  float: (expr) => `Double(${expr})!`,
  scalar: (name, _type, expr) => `let ${name} = ${expr}`,
  list: (name, type, line) => {
    const map = listType(
      type,
      '.map { Int($0)! }',
      '.map { Double($0)! }',
      '.map(String.init)',
    )
    return [`let ${name} = ${line}.split(separator: " ")${map}`]
  },
  comment: (text) => `// ${text}`,
  wrap: (statements) =>
    [
      'import Foundation',
      '',
      'func _next() -> String { return readLine() ?? "" }',
      '',
      ...statements,
      '',
    ].join('\n'),
}

const scala: Dialect = {
  next: '_next()',
  tokens: (arr, line) => [`val ${arr} = ${line}.trim.split("\\\\s+")`],
  index: (arr, k) => `${arr}(${String(k)})`,
  int: (expr) => `${expr}.toLong`,
  float: (expr) => `${expr}.toDouble`,
  scalar: (name, _type, expr) => `val ${name} = ${expr}`,
  list: (name, type, line) => {
    const map = listType(type, '.map(_.toLong)', '.map(_.toDouble)', '')
    return [`val ${name} = ${line}.trim.split("\\\\s+")${map}`]
  },
  comment: (text) => `// ${text}`,
  wrap: (statements) =>
    [
      'object Main extends App {',
      '  private val _it = scala.io.Source.stdin.getLines()',
      '  def _next(): String = if (_it.hasNext) _it.next() else ""',
      ...statements.map((s) => `  ${s}`),
      '}',
      '',
    ].join('\n'),
}

const ocaml: Dialect = {
  next: '(input_line stdin)',
  tokens: (arr, line) => [
    `let ${arr} = List.filter (fun _s -> String.length _s > 0) (String.split_on_char ' ' ${line}) in`,
  ],
  index: (arr, k) => `(List.nth ${arr} ${String(k)})`,
  int: (expr) => `(int_of_string ${expr})`,
  float: (expr) => `(float_of_string ${expr})`,
  scalar: (name, _type, expr) => `let ${name} = ${expr} in`,
  list: (name, type, line) => {
    const map = listType(
      type,
      'List.map int_of_string ',
      'List.map float_of_string ',
      '',
    )
    return [
      `let ${name} = ${map}(List.filter (fun _s -> String.length _s > 0) (String.split_on_char ' ' ${line})) in`,
    ]
  },
  comment: (text) => `(* ${text} *)`,
  wrap: (statements) =>
    [
      'let () =',
      ...statements.map((s) => `  ${s}`),
      '  print_newline ()',
      '',
    ].join('\n'),
}

const java: Dialect = {
  next: '_next()',
  tokens: (arr, line) => [`String[] ${arr} = ${line}.trim().split("\\\\s+");`],
  index: (arr, k) => `${arr}[${String(k)}]`,
  int: (expr) => `Long.parseLong(${expr})`,
  float: (expr) => `Double.parseDouble(${expr})`,
  scalar: (name, type, expr) => {
    const ty = listType(
      type === 'string' ? 'word' : type,
      'long',
      'double',
      'String',
    )
    return `${ty} ${name} = ${expr};`
  },
  list: (name, type, line) => {
    if (type === 'word') {
      return [`String[] ${name} = ${line}.trim().split("\\\\s+");`]
    }
    const ty = type === 'int' ? 'long' : 'double'
    const map =
      type === 'int'
        ? 'mapToLong(Long::parseLong)'
        : 'mapToDouble(Double::parseDouble)'
    return [
      `${ty}[] ${name} = Arrays.stream(${line}.trim().split("\\\\s+")).${map}.toArray();`,
    ]
  },
  comment: (text) => `// ${text}`,
  wrap: (statements) =>
    [
      'import java.util.*;',
      'import java.io.*;',
      '',
      'public class Main {',
      '    static String[] _data;',
      '    static int _pos = 0;',
      '    static String _next() { return _data[_pos++]; }',
      '    public static void main(String[] args) throws IOException {',
      '        _data = new BufferedReader(new InputStreamReader(System.in)).lines().toArray(String[]::new);',
      ...statements.map((s) => `        ${s}`),
      '    }',
      '}',
      '',
    ].join('\n'),
}

const kotlin: Dialect = {
  next: '_next()',
  tokens: (arr, line) => [`val ${arr} = ${line}.trim().split(Regex("\\\\s+"))`],
  index: (arr, k) => `${arr}[${String(k)}]`,
  int: (expr) => `${expr}.toLong()`,
  float: (expr) => `${expr}.toDouble()`,
  scalar: (name, _type, expr) => `val ${name} = ${expr}`,
  list: (name, type, line) => {
    const map = listType(
      type,
      '.map { it.toLong() }',
      '.map { it.toDouble() }',
      '',
    )
    return [`val ${name} = ${line}.trim().split(Regex("\\\\s+"))${map}`]
  },
  comment: (text) => `// ${text}`,
  wrap: (statements) =>
    [
      'import java.io.BufferedReader',
      'import java.io.InputStreamReader',
      '',
      'val _data = BufferedReader(InputStreamReader(System.`in`)).readLines()',
      'var _pos = 0',
      'fun _next(): String { val _l = _data[_pos]; _pos++; return _l }',
      '',
      'fun main() {',
      ...statements.map((s) => `    ${s}`),
      '}',
      '',
    ].join('\n'),
}

const bash: Dialect = {
  next: '$(_next)',
  tokens: (arr, line) => [`read -ra ${arr} <<< "${line}"`],
  index: (arr, k) => '${' + arr + '[' + String(k) + ']}',
  int: (expr) => expr,
  float: (expr) => expr,
  scalar: (name, _type, expr) => `${name}="${expr}"`,
  list: (name, _type, line) => [`read -ra ${name} <<< "${line}"`],
  comment: (text) => `# ${text}`,
  wrap: (statements) =>
    [
      '#!/usr/bin/env bash',
      'mapfile -t _data',
      '_pos=0',
      '_next() { printf \'%s\' "${_data[$((_pos++))]}"; }',
      '',
      ...statements,
      '',
    ].join('\n'),
}

const DIALECTS: Readonly<Record<string, Dialect>> = {
  python3: python,
  javascript,
  typescript,
  ruby,
  php,
  lua,
  perl,
  cpp,
  java,
  kotlin,
  bash,
  go,
  rust,
  csharp,
  swift,
  scala,
  ocaml,
}

/**
 * Generate a starter stub for `languageKey` from `format`, or `null` when the
 * puzzle has no descriptor or the language has no dialect (caller falls back to
 * the language's generic template).
 */
export function generateStub(
  format: IoFormat | undefined,
  languageKey: string,
): string | null {
  if (format === undefined || format.length === 0) {
    return null
  }
  const dialect = DIALECTS[languageKey]
  if (dialect === undefined) {
    return null
  }
  return emit(dialect, format)
}
