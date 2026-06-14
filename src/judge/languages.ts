/**
 * The languages this app supports. Each definition knows how to identify its
 * matching Judge0 language (by the human-readable `name` Judge0 returns) and
 * which Monaco grammar to use for syntax highlighting, plus a starter template.
 */

export interface LanguageDef {
  /** Stable internal key (also used as the default selection / storage key). */
  readonly key: string
  readonly label: string
  /** Monaco editor language id for syntax highlighting. */
  readonly monacoId: string
  /** Matches the `name` field of a Judge0 language entry. */
  readonly judge0NamePattern: RegExp
  /** Starter code that reads stdin and prints, in the spirit of Clash of Code. */
  readonly template: string
}

const MONACO_PLAINTEXT = 'plaintext'

export const LANGUAGES: readonly LanguageDef[] = [
  {
    key: 'python3',
    label: 'Python 3',
    monacoId: 'python',
    judge0NamePattern: /^python.*\(3/i,
    template: 'import sys\n\nfor line in sys.stdin:\n    print(line.strip())\n',
  },
  {
    key: 'javascript',
    label: 'JavaScript',
    monacoId: 'javascript',
    judge0NamePattern: /javascript|node\.js/i,
    template:
      "const lines = require('fs').readFileSync(0, 'utf8').split('\\n')\nconsole.log(lines[0])\n",
  },
  {
    key: 'typescript',
    label: 'TypeScript',
    monacoId: 'typescript',
    judge0NamePattern: /typescript/i,
    template:
      "declare function require(id: string): { readFileSync(fd: number, enc: string): string }\nconst lines: string[] = require('fs').readFileSync(0, 'utf8').split('\\n')\nconsole.log(lines[0])\n",
  },
  {
    key: 'cpp',
    label: 'C++',
    monacoId: 'cpp',
    judge0NamePattern: /^c\+\+|gcc|g\+\+/i,
    template:
      '#include <iostream>\nusing namespace std;\n\nint main() {\n    string line;\n    getline(cin, line);\n    cout << line << endl;\n    return 0;\n}\n',
  },
  {
    key: 'csharp',
    label: 'C#',
    monacoId: 'csharp',
    judge0NamePattern: /c#|mono/i,
    template:
      'using System;\n\nclass Solution {\n    static void Main() {\n        string line = Console.ReadLine();\n        Console.WriteLine(line);\n    }\n}\n',
  },
  {
    key: 'java',
    label: 'Java',
    monacoId: 'java',
    // "Java (OpenJDK 13.0.1)" — guard against matching "JavaScript (...)".
    judge0NamePattern: /^java\s*\(/i,
    template:
      'import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        System.out.println(line);\n    }\n}\n',
  },
  {
    key: 'kotlin',
    label: 'Kotlin',
    monacoId: 'kotlin',
    judge0NamePattern: /^kotlin/i,
    template: 'fun main() {\n    val line = readLine()\n    println(line)\n}\n',
  },
  {
    key: 'go',
    label: 'Go',
    monacoId: 'go',
    judge0NamePattern: /^go\b/i,
    template:
      'package main\n\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\n\nfunc main() {\n\tsc := bufio.NewScanner(os.Stdin)\n\tsc.Scan()\n\tfmt.Println(sc.Text())\n}\n',
  },
  {
    key: 'rust',
    label: 'Rust',
    monacoId: 'rust',
    judge0NamePattern: /^rust/i,
    template:
      'use std::io::{self, Read};\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_to_string(&mut input).unwrap();\n    let first = input.lines().next().unwrap_or("");\n    println!("{}", first);\n}\n',
  },
  {
    key: 'ruby',
    label: 'Ruby',
    monacoId: 'ruby',
    judge0NamePattern: /^ruby/i,
    template: 'line = STDIN.gets\nputs line\n',
  },
  {
    key: 'swift',
    label: 'Swift',
    monacoId: 'swift',
    judge0NamePattern: /^swift/i,
    template: 'if let line = readLine() {\n    print(line)\n}\n',
  },
  {
    key: 'scala',
    label: 'Scala',
    monacoId: 'scala',
    judge0NamePattern: /^scala/i,
    template:
      'object Main extends App {\n  val line = scala.io.StdIn.readLine()\n  println(line)\n}\n',
  },
  {
    key: 'php',
    label: 'PHP',
    monacoId: 'php',
    judge0NamePattern: /^php/i,
    template: '<?php\n$line = trim(fgets(STDIN));\necho $line . "\\n";\n',
  },
  {
    key: 'perl',
    label: 'Perl',
    monacoId: 'perl',
    judge0NamePattern: /^perl/i,
    template: 'my $line = <STDIN>;\nprint $line;\n',
  },
  {
    key: 'lua',
    label: 'Lua',
    monacoId: 'lua',
    judge0NamePattern: /^lua/i,
    template: 'local line = io.read("*l")\nprint(line)\n',
  },
  {
    key: 'bash',
    label: 'Bash',
    monacoId: 'shell',
    judge0NamePattern: /^bash/i,
    template: 'read line\necho "$line"\n',
  },
  {
    key: 'ocaml',
    label: 'OCaml',
    monacoId: MONACO_PLAINTEXT,
    judge0NamePattern: /^ocaml/i,
    template: 'let () =\n  let line = read_line () in\n  print_endline line\n',
  },
] as const

export function findLanguageByKey(key: string): LanguageDef | undefined {
  return LANGUAGES.find((language) => language.key === key)
}
