// Generates src/puzzles/generated.ts from puzzle specs whose expected outputs
// are produced by running a reference solution. This keeps the whole bank
// provably consistent — edit the specs here, never the generated file.
//
// Run with:  node scripts/generate-puzzles.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const firstLine = (input) => input.split('\n')[0] ?? ''
const ints = (line) =>
  line
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0)
    .map(Number)

const gcd = (a, b) => {
  let [x, y] = [Math.abs(a), Math.abs(b)]
  while (y !== 0) {
    ;[x, y] = [y, x % y]
  }
  return x
}

const isPrime = (n) => {
  if (n < 2) return false
  for (let d = 2; d * d <= n; d += 1) {
    if (n % d === 0) return false
  }
  return true
}

const factorial = (n) => {
  let acc = 1n
  for (let i = 2n; i <= BigInt(n); i += 1n) acc *= i
  return acc.toString()
}

const fib = (n) => {
  let [a, b] = [0, 1]
  for (let i = 1; i < n; i += 1) [a, b] = [b, a + b]
  return n === 0 ? 0 : b
}

const caesar = (text, shift) => {
  const A = 65
  const Z = 90
  const a = 97
  const z = 122
  const ALPHABET = 26
  const norm = ((shift % ALPHABET) + ALPHABET) % ALPHABET
  return [...text]
    .map((ch) => {
      const code = ch.charCodeAt(0)
      if (code >= A && code <= Z)
        return String.fromCharCode(((code - A + norm) % ALPHABET) + A)
      if (code >= a && code <= z)
        return String.fromCharCode(((code - a + norm) % ALPHABET) + a)
      return ch
    })
    .join('')
}

const digitalRoot = (n) => (n === 0 ? 0 : 1 + ((n - 1) % 9))

const runLengthEncode = (s) => {
  let out = ''
  let i = 0
  while (i < s.length) {
    let count = 1
    while (i + count < s.length && s[i + count] === s[i]) count += 1
    out += s[i] + String(count)
    i += count
  }
  return out
}

const nthPrime = (n) => {
  let found = 0
  let candidate = 1
  while (found < n) {
    candidate += 1
    if (isPrime(candidate)) found += 1
  }
  return candidate
}

const collatzSteps = (n) => {
  let steps = 0
  let value = n
  while (value !== 1) {
    value = value % 2 === 0 ? value / 2 : value * 3 + 1
    steps += 1
  }
  return steps
}

const balanced = (s) => {
  const pairs = { ')': '(', ']': '[', '}': '{' }
  const stack = []
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') stack.push(ch)
    else if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return 'NO'
    }
  }
  return stack.length === 0 ? 'YES' : 'NO'
}

const runLengthDecode = (s) => {
  let out = ''
  let i = 0
  while (i < s.length) {
    const ch = s[i]
    let numStr = ''
    i += 1
    while (i < s.length && s[i] >= '0' && s[i] <= '9') {
      numStr += s[i]
      i += 1
    }
    if (numStr.length > 0) out += ch.repeat(Number(numStr))
  }
  return out
}

const numWords = [
  '',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
]

const tensWords = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
]

const numberToWords = (n) => {
  if (n < 20) return numWords[n] ?? ''
  if (n < 100) {
    const tens = Math.floor(n / 10)
    const ones = n % 10
    return ones === 0
      ? (tensWords[tens] ?? '')
      : `${tensWords[tens] ?? ''} ${numWords[ones] ?? ''}`
  }
  const hundreds = Math.floor(n / 100)
  const rem = n % 100
  return rem === 0
    ? `${numWords[hundreds] ?? ''} hundred`
    : `${numWords[hundreds] ?? ''} hundred ${numberToWords(rem)}`
}

const primeFactors = (n) => {
  const factors = []
  let d = 2
  let rem = n
  while (d * d <= rem) {
    while (rem % d === 0) {
      factors.push(d)
      rem = Math.floor(rem / d)
    }
    d += 1
  }
  if (rem > 1) factors.push(rem)
  return factors
}

const luhnCheck = (numStr) => {
  const digits = [...numStr].map(Number)
  let sum = 0
  for (let i = 0; i < digits.length; i += 1) {
    let d = digits[digits.length - 1 - i]
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  }
  return sum % 10 === 0 ? 'YES' : 'NO'
}

// Each spec carries a reference `solve` used to compute expected outputs.
const specs = [
  // ---------------- BEGINNER ----------------
  {
    id: 'echo',
    title: 'Echo',
    difficulty: 'beginner',
    statement:
      'Read one line of input and print it back exactly. The simplest possible warm-up for reading from stdin and writing to stdout.',
    constraints: 'The line has 1 to 100 printable ASCII characters.',
    inputSpec: 'Line 1: A string s.',
    outputSpec: 'Line 1: The same string s.',
    solve: (input) => firstLine(input),
    cases: [
      { title: 'word', input: 'hello', hidden: false },
      { title: 'phrase', input: 'clash of code', hidden: false },
      { title: 'symbols', input: 'a1!b2?', hidden: true },
    ],
  },
  {
    id: 'sum-two',
    title: 'Sum of Two',
    difficulty: 'beginner',
    statement: 'Read two integers and print their sum.',
    constraints: '-1000000 <= a, b <= 1000000',
    inputSpec: 'Line 1: Two space-separated integers a and b.',
    outputSpec: 'Line 1: The integer a + b.',
    solve: (input) => {
      const [a, b] = ints(firstLine(input))
      return String(a + b)
    },
    cases: [
      { title: 'basic', input: '2 3', hidden: false },
      { title: 'negatives', input: '-10 4', hidden: false },
      { title: 'large', input: '1000000 1000000', hidden: true },
    ],
  },
  {
    id: 'rectangle-area',
    title: 'Rectangle Area',
    difficulty: 'beginner',
    statement: 'Given the width and height of a rectangle, print its area.',
    constraints: '1 <= w, h <= 10000',
    inputSpec: 'Line 1: Two space-separated integers w and h.',
    outputSpec: 'Line 1: The area w * h.',
    solve: (input) => {
      const [w, h] = ints(firstLine(input))
      return String(w * h)
    },
    cases: [
      { title: 'square', input: '5 5', hidden: false },
      { title: 'wide', input: '12 3', hidden: false },
      { title: 'large', input: '10000 10000', hidden: true },
    ],
  },
  {
    id: 'max-two',
    title: 'Bigger of Two',
    difficulty: 'beginner',
    statement: 'Read two integers and print the larger one.',
    constraints: '-1000000 <= a, b <= 1000000',
    inputSpec: 'Line 1: Two space-separated integers a and b.',
    outputSpec: 'Line 1: The larger of a and b.',
    solve: (input) => {
      const [a, b] = ints(firstLine(input))
      return String(Math.max(a, b))
    },
    cases: [
      { title: 'first', input: '9 4', hidden: false },
      { title: 'second', input: '3 7', hidden: false },
      { title: 'negatives', input: '-2 -8', hidden: true },
    ],
  },
  {
    id: 'double-it',
    title: 'Double It',
    difficulty: 'beginner',
    statement: 'Read an integer n and print twice its value.',
    constraints: '-1000000 <= n <= 1000000',
    inputSpec: 'Line 1: A single integer n.',
    outputSpec: 'Line 1: The value 2 * n.',
    solve: (input) => String(Number(firstLine(input)) * 2),
    cases: [
      { title: 'positive', input: '21', hidden: false },
      { title: 'zero', input: '0', hidden: false },
      { title: 'negative', input: '-7', hidden: true },
    ],
  },
  {
    id: 'is-even',
    title: 'Even or Odd',
    difficulty: 'beginner',
    statement:
      'Read an integer and print YES if it is even, or NO if it is odd.',
    constraints: '-1000000 <= n <= 1000000',
    inputSpec: 'Line 1: A single integer n.',
    outputSpec: 'Line 1: YES or NO.',
    solve: (input) => (Number(firstLine(input)) % 2 === 0 ? 'YES' : 'NO'),
    cases: [
      { title: 'even', input: '4', hidden: false },
      { title: 'odd', input: '7', hidden: false },
      { title: 'zero', input: '0', hidden: true },
    ],
  },
  {
    id: 'absolute-value',
    title: 'Absolute Value',
    difficulty: 'beginner',
    statement: 'Read an integer and print its absolute value.',
    constraints: '-1000000 <= n <= 1000000',
    inputSpec: 'Line 1: A single integer n.',
    outputSpec: 'Line 1: |n|.',
    solve: (input) => String(Math.abs(Number(firstLine(input)))),
    cases: [
      { title: 'positive', input: '5', hidden: false },
      { title: 'negative', input: '-3', hidden: false },
      { title: 'zero', input: '0', hidden: true },
    ],
  },
  {
    id: 'min-two',
    title: 'Smaller of Two',
    difficulty: 'beginner',
    statement: 'Read two integers and print the smaller one.',
    constraints: '-1000000 <= a, b <= 1000000',
    inputSpec: 'Line 1: Two space-separated integers a and b.',
    outputSpec: 'Line 1: The smaller of a and b.',
    solve: (input) => {
      const [a, b] = ints(firstLine(input))
      return String(Math.min(a, b))
    },
    cases: [
      { title: 'second smaller', input: '8 3', hidden: false },
      { title: 'negative', input: '-1 2', hidden: false },
      { title: 'equal', input: '5 5', hidden: true },
    ],
  },
  {
    id: 'count-chars',
    title: 'Character Count',
    difficulty: 'beginner',
    statement:
      'Read a line of text and print the number of characters it contains. Spaces count as characters.',
    constraints: 'The line has 1 to 200 printable ASCII characters.',
    inputSpec: 'Line 1: A string s.',
    outputSpec: 'Line 1: The number of characters in s.',
    solve: (input) => String(firstLine(input).length),
    cases: [
      { title: 'word', input: 'hello', hidden: false },
      { title: 'with space', input: 'hi there', hidden: false },
      { title: 'phrase', input: 'clash of code', hidden: true },
    ],
  },
  {
    id: 'celsius-to-fahrenheit',
    title: 'Celsius to Fahrenheit',
    difficulty: 'beginner',
    match: 'float',
    statement:
      'Convert a temperature from Celsius to Fahrenheit. Use real-number division with the formula F = C * 9 / 5 + 32.',
    constraints: '-273 <= C <= 10000',
    inputSpec: 'Line 1: A single integer C (degrees Celsius).',
    outputSpec:
      'Line 1: The equivalent temperature in Fahrenheit. Any numeric value within a small tolerance is accepted.',
    solve: (input) => String((Number(firstLine(input)) * 9) / 5 + 32),
    cases: [
      { title: 'freezing', input: '0', hidden: false },
      { title: 'boiling', input: '100', hidden: false },
      { title: 'body temp', input: '37', hidden: true },
    ],
  },

  // ---------------- EASY ----------------
  {
    id: 'reverse-string',
    title: 'Reverse String',
    difficulty: 'easy',
    statement:
      'Read a single line and print it reversed, character by character.',
    constraints: 'The line has 1 to 100 printable ASCII characters.',
    inputSpec: 'Line 1: A string s.',
    outputSpec: 'Line 1: The string s reversed.',
    solve: (input) => [...firstLine(input)].reverse().join(''),
    cases: [
      { title: 'word', input: 'hello', hidden: false },
      { title: 'palindrome', input: 'racecar', hidden: false },
      { title: 'phrase', input: 'clash of code', hidden: true },
    ],
  },
  {
    id: 'count-vowels',
    title: 'Count Vowels',
    difficulty: 'easy',
    statement:
      'Count how many vowels (a, e, i, o, u, case-insensitive) appear in a line of text.',
    constraints: 'The line has 1 to 200 printable ASCII characters.',
    inputSpec: 'Line 1: A string s.',
    outputSpec: 'Line 1: The number of vowels in s.',
    solve: (input) =>
      String((firstLine(input).match(/[aeiou]/gi) ?? []).length),
    cases: [
      { title: 'word', input: 'Education', hidden: false },
      { title: 'phrase', input: 'the quick brown fox', hidden: false },
      { title: 'none', input: 'rhythm', hidden: true },
    ],
  },
  {
    id: 'sum-list',
    title: 'Sum a List',
    difficulty: 'easy',
    statement:
      'You are given a count n followed by n integers. Print their sum.',
    constraints:
      '1 <= n <= 1000; each integer is between -1000000 and 1000000.',
    inputSpec: 'Line 1: The integer n. Line 2: n space-separated integers.',
    outputSpec: 'Line 1: The sum of the n integers.',
    solve: (input) => {
      const lines = input.split('\n')
      return String(ints(lines[1] ?? '').reduce((acc, v) => acc + v, 0))
    },
    cases: [
      { title: 'small', input: '5\n1 2 3 4 5', hidden: false },
      { title: 'negatives', input: '3\n-5 10 -2', hidden: false },
      { title: 'single', input: '1\n99', hidden: true },
    ],
  },
  {
    id: 'max-in-list',
    title: 'Largest in List',
    difficulty: 'easy',
    statement:
      'You are given a count n followed by n integers. Print the largest of them.',
    constraints:
      '1 <= n <= 1000; each integer is between -1000000 and 1000000.',
    inputSpec: 'Line 1: The integer n. Line 2: n space-separated integers.',
    outputSpec: 'Line 1: The maximum value.',
    solve: (input) => {
      const lines = input.split('\n')
      return String(Math.max(...ints(lines[1] ?? '')))
    },
    cases: [
      { title: 'mixed', input: '5\n3 7 2 9 4', hidden: false },
      { title: 'single', input: '1\n42', hidden: false },
      { title: 'negatives', input: '4\n-5 -1 -9 -3', hidden: true },
    ],
  },
  {
    id: 'factorial',
    title: 'Factorial',
    difficulty: 'easy',
    statement:
      'Read an integer n and print n! (the product 1 * 2 * ... * n). Use a numeric type that can represent 20!.',
    constraints: '0 <= n <= 20',
    inputSpec: 'Line 1: A single integer n.',
    outputSpec: 'Line 1: The value n!.',
    solve: (input) => factorial(Number(firstLine(input))),
    cases: [
      { title: 'five', input: '5', hidden: false },
      { title: 'zero', input: '0', hidden: false },
      { title: 'twenty', input: '20', hidden: true },
    ],
  },
  {
    id: 'palindrome-check',
    title: 'Palindrome Check',
    difficulty: 'easy',
    statement:
      'Print YES if the input string reads the same forwards and backwards, or NO otherwise. Compare the characters exactly as given; case matters.',
    constraints: 'The line has 1 to 200 printable ASCII characters.',
    inputSpec: 'Line 1: A string s.',
    outputSpec: 'Line 1: YES if s is a palindrome, otherwise NO.',
    solve: (input) => {
      const s = firstLine(input)
      return [...s].reverse().join('') === s ? 'YES' : 'NO'
    },
    cases: [
      { title: 'palindrome', input: 'racecar', hidden: false },
      { title: 'not palindrome', input: 'hello', hidden: false },
      { title: 'single char', input: 'a', hidden: true },
      { title: 'case-sensitive', input: 'Aa', hidden: true },
    ],
  },
  {
    id: 'repeat-string',
    title: 'Repeat String',
    difficulty: 'easy',
    statement: 'Print the string s repeated n times, with no separator.',
    constraints:
      '1 <= n <= 20; the string has 1 to 20 printable ASCII characters.',
    inputSpec: 'Line 1: An integer n. Line 2: A string s.',
    outputSpec: 'Line 1: The string s repeated n times.',
    solve: (input) => {
      const lines = input.split('\n')
      return (lines[1] ?? '').repeat(Number(lines[0]))
    },
    cases: [
      { title: 'repeat three', input: '3\nab', hidden: false },
      { title: 'repeat once', input: '1\nhello', hidden: false },
      { title: 'repeat four', input: '4\nX', hidden: true },
    ],
  },
  {
    id: 'min-in-list',
    title: 'Smallest in List',
    difficulty: 'easy',
    statement:
      'You are given a count n followed by n integers. Print the smallest of them.',
    constraints:
      '1 <= n <= 1000; each integer is between -1000000 and 1000000.',
    inputSpec: 'Line 1: The integer n. Line 2: n space-separated integers.',
    outputSpec: 'Line 1: The minimum value.',
    solve: (input) => {
      const lines = input.split('\n')
      return String(Math.min(...ints(lines[1] ?? '')))
    },
    cases: [
      { title: 'mixed', input: '5\n3 7 2 9 4', hidden: false },
      { title: 'single', input: '1\n42', hidden: false },
      { title: 'negatives', input: '4\n-5 -1 -9 -3', hidden: true },
    ],
  },
  {
    id: 'sum-squares',
    title: 'Sum of Squares',
    difficulty: 'easy',
    statement: 'Compute the sum 1² + 2² + ... + n².',
    constraints: '1 <= n <= 100',
    inputSpec: 'Line 1: A single integer n.',
    outputSpec: 'Line 1: The sum of the first n perfect squares.',
    solve: (input) => {
      const n = Number(firstLine(input))
      let s = 0
      for (let i = 1; i <= n; i += 1) s += i * i
      return String(s)
    },
    cases: [
      { title: 'three', input: '3', hidden: false },
      { title: 'one', input: '1', hidden: false },
      { title: 'ten', input: '10', hidden: true },
    ],
  },

  // ---------------- MEDIUM ----------------
  {
    id: 'fizzbuzz',
    title: 'FizzBuzz',
    difficulty: 'medium',
    statement:
      'Print the numbers from 1 to n, one per line. For multiples of 3 print "Fizz", for multiples of 5 print "Buzz", and for multiples of both print "FizzBuzz".',
    constraints: '1 <= n <= 100',
    inputSpec: 'Line 1: A single integer n.',
    outputSpec: 'n lines, each the value for that position.',
    solve: (input) => {
      const n = Number(firstLine(input))
      const out = []
      for (let i = 1; i <= n; i += 1) {
        if (i % 15 === 0) out.push('FizzBuzz')
        else if (i % 3 === 0) out.push('Fizz')
        else if (i % 5 === 0) out.push('Buzz')
        else out.push(String(i))
      }
      return out.join('\n')
    },
    cases: [
      { title: 'first five', input: '5', hidden: false },
      { title: 'through fifteen', input: '15', hidden: false },
      { title: 'twenty', input: '20', hidden: true },
    ],
  },
  {
    id: 'jigsaw-tabs',
    title: 'Jigsaw Tabs',
    difficulty: 'medium',
    statement:
      'For a regular jigsaw puzzle of size h x w pieces, how many tabs (the bits that stick out) are there? Every shared edge between two adjacent pieces has exactly one tab and one matching socket.',
    constraints: '1 <= h, w <= 100',
    inputSpec: 'Line 1: Two space-separated integers h and w.',
    outputSpec: 'Line 1: The number of tabs.',
    solve: (input) => {
      const [h, w] = ints(firstLine(input))
      return String(h * (w - 1) + (h - 1) * w)
    },
    cases: [
      { title: 'small square', input: '2 2', hidden: false },
      { title: 'small rectangle', input: '2 3', hidden: false },
      { title: 'huge puzzle', input: '100 100', hidden: true },
      { title: 'tiny puzzle', input: '1 1', hidden: true },
    ],
  },
  {
    id: 'nth-fibonacci',
    title: 'Nth Fibonacci',
    difficulty: 'medium',
    statement:
      'Print the nth Fibonacci number, where F(1) = 1, F(2) = 1, and F(k) = F(k-1) + F(k-2). Use a numeric type that can represent F(50).',
    constraints: '1 <= n <= 50',
    inputSpec: 'Line 1: A single integer n.',
    outputSpec: 'Line 1: The nth Fibonacci number.',
    solve: (input) => String(fib(Number(firstLine(input)))),
    cases: [
      { title: 'tenth', input: '10', hidden: false },
      { title: 'first', input: '1', hidden: false },
      { title: 'fiftieth', input: '50', hidden: true },
    ],
  },
  {
    id: 'gcd',
    title: 'Greatest Common Divisor',
    difficulty: 'medium',
    statement:
      'Read two positive integers and print their greatest common divisor.',
    constraints: '1 <= a, b <= 1000000000',
    inputSpec: 'Line 1: Two space-separated integers a and b.',
    outputSpec: 'Line 1: gcd(a, b).',
    solve: (input) => {
      const [a, b] = ints(firstLine(input))
      return String(gcd(a, b))
    },
    cases: [
      { title: 'basic', input: '12 18', hidden: false },
      { title: 'coprime', input: '17 5', hidden: false },
      { title: 'large', input: '1000000000 8', hidden: true },
    ],
  },
  {
    id: 'word-count',
    title: 'Word Count',
    difficulty: 'medium',
    statement:
      'Count the number of whitespace-separated words in a line of text.',
    constraints: 'The line has 1 to 500 printable ASCII characters.',
    inputSpec: 'Line 1: A line of text.',
    outputSpec: 'Line 1: The number of words.',
    solve: (input) => {
      const trimmed = firstLine(input).trim()
      return String(trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length)
    },
    cases: [
      { title: 'sentence', input: 'the quick brown fox jumps', hidden: false },
      { title: 'one word', input: 'hello', hidden: false },
      { title: 'spaced', input: '  lots   of   spaces  ', hidden: true },
    ],
  },
  {
    id: 'sum-digits',
    title: 'Sum of Digits',
    difficulty: 'medium',
    statement: 'Read a non-negative integer and print the sum of its digits.',
    constraints: '0 <= n <= 1000000000',
    inputSpec: 'Line 1: A single non-negative integer n.',
    outputSpec: 'Line 1: The sum of the digits of n.',
    solve: (input) =>
      String(
        [...String(Number(firstLine(input).trim()))].reduce(
          (s, c) => s + Number(c),
          0,
        ),
      ),
    cases: [
      { title: 'three digits', input: '123', hidden: false },
      { title: 'nines', input: '9999', hidden: false },
      { title: 'hundreds', input: '100', hidden: true },
    ],
  },
  {
    id: 'lcm',
    title: 'Least Common Multiple',
    difficulty: 'medium',
    statement:
      'Read two positive integers and print their least common multiple.',
    constraints: '1 <= a, b <= 100',
    inputSpec: 'Line 1: Two space-separated integers a and b.',
    outputSpec: 'Line 1: lcm(a, b).',
    solve: (input) => {
      const [a, b] = ints(firstLine(input))
      const g = gcd(a, b)
      return String((a / g) * b)
    },
    cases: [
      { title: 'basic', input: '4 6', hidden: false },
      { title: 'coprime', input: '3 7', hidden: false },
      { title: 'shared factor', input: '12 18', hidden: true },
    ],
  },
  {
    id: 'average',
    title: 'Average',
    difficulty: 'medium',
    match: 'float',
    statement: 'Compute the average (arithmetic mean) of n integers.',
    constraints:
      '1 <= n <= 1000; each integer is between -1000000 and 1000000.',
    inputSpec: 'Line 1: The integer n. Line 2: n space-separated integers.',
    outputSpec: 'Line 1: The average, within a small numeric tolerance.',
    solve: (input) => {
      const lines = input.split('\n')
      const nums = ints(lines[1] ?? '')
      return String(nums.reduce((s, v) => s + v, 0) / nums.length)
    },
    cases: [
      { title: 'integers', input: '3\n1 2 3', hidden: false },
      { title: 'larger', input: '4\n10 20 30 40', hidden: false },
      { title: 'non-integer result', input: '2\n1 2', hidden: true },
    ],
  },
  {
    id: 'count-occurrences',
    title: 'Count Occurrences',
    difficulty: 'medium',
    statement:
      'Count how many times a given character appears in a string. Matching is case-sensitive.',
    constraints:
      'The character and string contain printable ASCII characters; the string length is 1 to 200.',
    inputSpec: 'Line 1: A single character c. Line 2: A string s.',
    outputSpec: 'Line 1: The number of times c appears in s.',
    solve: (input) => {
      const lines = input.split('\n')
      const ch = (lines[0] ?? '')[0] ?? ''
      const str = lines[1] ?? ''
      return String([...str].filter((c) => c === ch).length)
    },
    cases: [
      { title: 'banana', input: 'a\nbanana', hidden: false },
      { title: 'hello world', input: 'l\nhello world', hidden: false },
      { title: 'single', input: 'x\nboxy', hidden: true },
      { title: 'none', input: 'z\nbanana', hidden: true },
    ],
  },
  {
    id: 'missing-number',
    title: 'Missing Number',
    difficulty: 'medium',
    statement:
      'You are given n followed by n-1 distinct integers from 1 to n (in any order, one number is missing). Print the missing number.',
    constraints: '2 <= n <= 1000',
    inputSpec:
      'Line 1: The integer n. Line 2: n-1 space-separated integers from 1 to n.',
    outputSpec: 'Line 1: The missing number.',
    solve: (input) => {
      const lines = input.split('\n')
      const n = Number(lines[0])
      const nums = ints(lines[1] ?? '')
      const expected = (n * (n + 1)) / 2
      const actual = nums.reduce((s, v) => s + v, 0)
      return String(expected - actual)
    },
    cases: [
      { title: 'middle missing', input: '5\n1 2 4 5', hidden: false },
      { title: 'small', input: '3\n1 3', hidden: false },
      { title: 'end missing', input: '6\n1 2 3 4 5', hidden: true },
    ],
  },

  // ---------------- HARD ----------------
  {
    id: 'count-primes',
    title: 'Count Primes',
    difficulty: 'hard',
    statement: 'Print how many prime numbers are less than or equal to n.',
    constraints: '1 <= n <= 100000',
    inputSpec: 'Line 1: A single integer n.',
    outputSpec: 'Line 1: The count of primes <= n.',
    solve: (input) => {
      const n = Number(firstLine(input))
      let count = 0
      for (let i = 2; i <= n; i += 1) if (isPrime(i)) count += 1
      return String(count)
    },
    cases: [
      { title: 'small', input: '10', hidden: false },
      { title: 'medium', input: '100', hidden: false },
      { title: 'large', input: '100000', hidden: true },
    ],
  },
  {
    id: 'to-binary',
    title: 'To Binary',
    difficulty: 'hard',
    statement:
      'Read a non-negative integer n and print its binary representation without leading zeros.',
    constraints: '0 <= n <= 1000000000',
    inputSpec: 'Line 1: A single integer n.',
    outputSpec: 'Line 1: n in base 2.',
    solve: (input) => Number(firstLine(input)).toString(2),
    cases: [
      { title: 'ten', input: '10', hidden: false },
      { title: 'zero', input: '0', hidden: false },
      { title: 'max', input: '1000000000', hidden: true },
    ],
  },
  {
    id: 'caesar-cipher',
    title: 'Caesar Cipher',
    difficulty: 'hard',
    statement:
      'Shift every letter of the text forward by k positions in the alphabet, wrapping around and preserving case. Non-letter characters are unchanged.',
    constraints:
      '-1000 <= k <= 1000; the text has 1 to 200 printable ASCII characters.',
    inputSpec: 'Line 1: The integer shift k. Line 2: The text to encode.',
    outputSpec: 'Line 1: The encoded text.',
    solve: (input) => {
      const lines = input.split('\n')
      return caesar(lines[1] ?? '', Number(lines[0]))
    },
    cases: [
      { title: 'shift one', input: '1\nabc xyz', hidden: false },
      { title: 'shift three', input: '3\nHello, World!', hidden: false },
      { title: 'wrap back', input: '-1\nbcd', hidden: true },
    ],
  },
  {
    id: 'digital-root',
    title: 'Digital Root',
    difficulty: 'hard',
    statement:
      'Repeatedly sum the digits of n until a single digit remains, then print it.',
    constraints: '0 <= n <= 1000000000',
    inputSpec: 'Line 1: A single integer n.',
    outputSpec: 'Line 1: The digital root of n.',
    solve: (input) => String(digitalRoot(Number(firstLine(input)))),
    cases: [
      { title: 'classic', input: '942', hidden: false },
      { title: 'single', input: '7', hidden: false },
      { title: 'large', input: '999999999', hidden: true },
    ],
  },
  {
    id: 'run-length-encode',
    title: 'Run-Length Encode',
    difficulty: 'hard',
    statement:
      'Compress a string by replacing each run of a repeated character with the character followed by the run length. For example, "aaabbc" becomes "a3b2c1".',
    constraints: 'The line has 1 to 200 printable ASCII characters.',
    inputSpec: 'Line 1: A string s.',
    outputSpec: 'Line 1: The run-length encoding of s.',
    solve: (input) => runLengthEncode(firstLine(input)),
    cases: [
      { title: 'runs', input: 'aaabbc', hidden: false },
      { title: 'no runs', input: 'abcde', hidden: false },
      { title: 'long run', input: 'wwwwwwwwww', hidden: true },
    ],
  },
  {
    id: 'is-prime',
    title: 'Prime Check',
    difficulty: 'hard',
    statement: 'Print YES if n is prime, or NO otherwise.',
    constraints: '1 <= n <= 1000000',
    inputSpec: 'Line 1: A single integer n.',
    outputSpec: 'Line 1: YES or NO.',
    solve: (input) => (isPrime(Number(firstLine(input))) ? 'YES' : 'NO'),
    cases: [
      { title: 'prime', input: '17', hidden: false },
      { title: 'composite', input: '4', hidden: false },
      { title: 'one', input: '1', hidden: true },
      { title: 'large prime', input: '999983', hidden: true },
    ],
  },
  {
    id: 'anagram-check',
    title: 'Anagram Check',
    difficulty: 'hard',
    statement:
      'Print YES if the two words are anagrams of each other (same letters in any order, case-insensitive), or NO otherwise.',
    constraints: 'Each word has 1 to 100 ASCII letters.',
    inputSpec: 'Line 1: Word a. Line 2: Word b.',
    outputSpec: 'Line 1: YES or NO.',
    solve: (input) => {
      const lines = input.split('\n')
      const a = (lines[0] ?? '').toLowerCase().split('').sort().join('')
      const b = (lines[1] ?? '').toLowerCase().split('').sort().join('')
      return a === b ? 'YES' : 'NO'
    },
    cases: [
      { title: 'anagram', input: 'Listen\nSilent', hidden: false },
      { title: 'not anagram', input: 'hello\nworld', hidden: false },
      { title: 'cinema', input: 'cinema\niceman', hidden: true },
    ],
  },
  {
    id: 'triangle-type',
    title: 'Triangle Type',
    difficulty: 'hard',
    statement:
      'Given three side lengths, classify the triangle as "equilateral", "isosceles", "scalene", or "invalid" (if no triangle can be formed).',
    constraints: '1 <= a, b, c <= 1000',
    inputSpec: 'Line 1: Three space-separated integers a, b, and c.',
    outputSpec: 'Line 1: The triangle type.',
    solve: (input) => {
      const [a, b, c] = ints(firstLine(input))
      if (a + b <= c || a + c <= b || b + c <= a) return 'invalid'
      if (a === b && b === c) return 'equilateral'
      if (a === b || b === c || a === c) return 'isosceles'
      return 'scalene'
    },
    cases: [
      { title: 'equilateral', input: '3 3 3', hidden: false },
      { title: 'scalene', input: '3 4 5', hidden: false },
      { title: 'isosceles', input: '5 5 3', hidden: true },
      { title: 'invalid', input: '1 2 10', hidden: true },
    ],
  },
  {
    id: 'number-to-words',
    title: 'Number to Words',
    difficulty: 'hard',
    statement:
      'Convert an integer from 1 to 999 into lowercase English words. Use spaces between words and no hyphens or "and" (for example, 342 -> "three hundred forty two").',
    constraints: '1 <= n <= 999',
    inputSpec: 'Line 1: A single integer n.',
    outputSpec: 'Line 1: The English word for n.',
    solve: (input) => numberToWords(Number(firstLine(input))),
    cases: [
      { title: 'one', input: '1', hidden: false },
      { title: 'hundreds', input: '342', hidden: false },
      { title: 'nineteen', input: '19', hidden: true },
      { title: 'max', input: '999', hidden: true },
    ],
  },
  {
    id: 'two-sum-exists',
    title: 'Two Sum Exists',
    difficulty: 'hard',
    statement:
      'Given a target value and a list of integers, print YES if any two distinct elements sum to the target, or NO otherwise.',
    constraints: '2 <= n <= 1000; all values fit in a 32-bit integer.',
    inputSpec:
      'Line 1: The target integer. Line 2: n space-separated integers, where n is the number of values on this line.',
    outputSpec: 'Line 1: YES or NO.',
    solve: (input) => {
      const lines = input.split('\n')
      const target = Number(lines[0])
      const nums = ints(lines[1] ?? '')
      const seen = new Set()
      for (const n of nums) {
        if (seen.has(target - n)) return 'YES'
        seen.add(n)
      }
      return 'NO'
    },
    cases: [
      { title: 'found', input: '9\n2 7 11 15', hidden: false },
      { title: 'not found', input: '100\n1 2 3', hidden: false },
      { title: 'pair in middle', input: '6\n1 2 3 4 5', hidden: true },
      { title: 'duplicate pair', input: '10\n5 5', hidden: true },
    ],
  },

  // ---------------- EXPERT ----------------
  {
    id: 'nth-prime',
    title: 'Nth Prime',
    difficulty: 'expert',
    statement: 'Print the nth prime number (1-indexed, so the 1st prime is 2).',
    constraints: '1 <= n <= 10000',
    inputSpec: 'Line 1: A single integer n.',
    outputSpec: 'Line 1: The nth prime.',
    solve: (input) => String(nthPrime(Number(firstLine(input)))),
    cases: [
      { title: 'first', input: '1', hidden: false },
      { title: 'sixth', input: '6', hidden: false },
      { title: 'limit', input: '10000', hidden: true },
    ],
  },
  {
    id: 'collatz-steps',
    title: 'Collatz Steps',
    difficulty: 'expert',
    statement:
      'Starting from n, repeatedly halve it if even or replace it with 3n+1 if odd. Print how many steps it takes to reach 1.',
    constraints: '1 <= n <= 1000000',
    inputSpec: 'Line 1: A single integer n.',
    outputSpec: 'Line 1: The number of steps to reach 1.',
    solve: (input) => String(collatzSteps(Number(firstLine(input)))),
    cases: [
      { title: 'six', input: '6', hidden: false },
      { title: 'one', input: '1', hidden: false },
      { title: '27', input: '27', hidden: true },
    ],
  },
  {
    id: 'balanced-brackets',
    title: 'Balanced Brackets',
    difficulty: 'expert',
    statement:
      'Determine whether a string of brackets (), [], {} is correctly balanced and nested. Print YES or NO.',
    constraints: 'The line has 1 to 1000 bracket characters.',
    inputSpec: 'Line 1: A string of brackets.',
    outputSpec: 'Line 1: YES if balanced, otherwise NO.',
    solve: (input) => balanced(firstLine(input)),
    cases: [
      { title: 'balanced', input: '([]{})', hidden: false },
      { title: 'unbalanced', input: '([)]', hidden: false },
      { title: 'nested', input: '{[()()]}', hidden: true },
      { title: 'open', input: '(((', hidden: true },
    ],
  },
  {
    id: 'base-convert',
    title: 'Base Conversion',
    difficulty: 'expert',
    statement:
      'Convert a number from one base to another. Digits above 9 use lowercase letters a-z. Output uses lowercase.',
    constraints:
      '2 <= fromBase, toBase <= 36; the value is non-negative and fits in a 32-bit integer when converted to decimal.',
    inputSpec:
      'Line 1: A value, its source base, and its target base, space-separated.',
    outputSpec: 'Line 1: The value expressed in the target base.',
    solve: (input) => {
      const [value, from, to] = firstLine(input).trim().split(/\s+/)
      return parseInt(value, Number(from)).toString(Number(to))
    },
    cases: [
      { title: 'bin to dec', input: '1010 2 10', hidden: false },
      { title: 'dec to hex', input: '255 10 16', hidden: false },
      { title: 'hex to dec', input: 'ff 16 10', hidden: true },
      { title: 'base36', input: 'zz 36 10', hidden: true },
    ],
  },
  {
    id: 'longest-word',
    title: 'Longest Word',
    difficulty: 'expert',
    statement:
      'Print the longest whitespace-separated word in a line. If several words tie for the longest, print the first of them.',
    constraints: 'The line has 1 to 500 characters.',
    inputSpec: 'Line 1: A line of text.',
    outputSpec: 'Line 1: The longest word.',
    solve: (input) => {
      const words = firstLine(input).trim().split(/\s+/)
      return words.reduce((best, w) => (w.length > best.length ? w : best), '')
    },
    cases: [
      { title: 'sentence', input: 'the quick brown fox', hidden: false },
      { title: 'tie', input: 'cat dog pig', hidden: false },
      { title: 'long', input: 'a programming marathon today', hidden: true },
    ],
  },
  {
    id: 'matrix-trace',
    title: 'Matrix Trace',
    difficulty: 'expert',
    statement:
      'Compute the trace of an N×N matrix — the sum of its main diagonal elements.',
    constraints:
      '1 <= N <= 20; each value fits in a 32-bit integer. Use an accumulator large enough for the sum.',
    inputSpec:
      'Line 1: The integer N. Lines 2 to N+1: N space-separated integers per row.',
    outputSpec: 'Line 1: The trace.',
    solve: (input) => {
      const lines = input.split('\n')
      const n = Number(lines[0])
      let trace = 0
      for (let i = 0; i < n; i += 1) {
        const row = ints(lines[i + 1] ?? '')
        trace += row[i] ?? 0
      }
      return String(trace)
    },
    cases: [
      { title: '2x2', input: '2\n1 2\n3 4', hidden: false },
      {
        title: '3x3 identity-like',
        input: '3\n1 0 0\n0 2 0\n0 0 3',
        hidden: false,
      },
      {
        title: '4x4',
        input: '4\n5 1 2 3\n1 7 2 1\n0 0 9 1\n1 2 3 4',
        hidden: true,
      },
    ],
  },
  {
    id: 'run-length-decode',
    title: 'Run-Length Decode',
    difficulty: 'expert',
    statement:
      'Decode a run-length encoded string. The format is non-digit character followed by its count, e.g. "a3b2c1" -> "aaabbc". Counts may be more than one digit.',
    constraints:
      'The encoded string has 2 to 100 characters; decoded length is at most 500.',
    inputSpec: 'Line 1: A run-length encoded string.',
    outputSpec: 'Line 1: The decoded string.',
    solve: (input) => runLengthDecode(firstLine(input)),
    cases: [
      { title: 'basic', input: 'a3b2c1', hidden: false },
      { title: 'all singles', input: 'x1y1z1', hidden: false },
      { title: 'long run', input: 'w10', hidden: true },
    ],
  },
  {
    id: 'prime-factors',
    title: 'Prime Factorization',
    difficulty: 'expert',
    statement:
      'Print the prime factorization of n as a space-separated list of primes in ascending order (with repetition).',
    constraints: '2 <= n <= 1000000',
    inputSpec: 'Line 1: A single integer n >= 2.',
    outputSpec:
      'Line 1: The prime factors of n in ascending order, space-separated.',
    solve: (input) => primeFactors(Number(firstLine(input))).join(' '),
    cases: [
      { title: 'twelve', input: '12', hidden: false },
      { title: 'prime', input: '7', hidden: false },
      { title: 'sixty', input: '60', hidden: true },
      { title: 'large composite', input: '999984', hidden: true },
    ],
  },
  {
    id: 'luhn-check',
    title: 'Luhn Check',
    difficulty: 'expert',
    statement:
      'Apply the Luhn algorithm to a string of digits. Print YES if the check digit is valid, or NO otherwise.',
    constraints: 'The input is a string of 8 to 19 digits.',
    inputSpec: 'Line 1: A string of digits (no spaces).',
    outputSpec: 'Line 1: YES if valid under the Luhn algorithm, otherwise NO.',
    solve: (input) => luhnCheck(firstLine(input)),
    cases: [
      { title: 'valid', input: '4532015112830366', hidden: false },
      { title: 'invalid', input: '1234567890123456', hidden: false },
      { title: 'classic test', input: '79927398713', hidden: true },
    ],
  },
  {
    id: 'rotate-array',
    title: 'Rotate Array',
    difficulty: 'expert',
    statement:
      'Rotate an array of n integers k positions to the right (elements shifted off the right end wrap to the front).',
    constraints:
      '1 <= n <= 1000; 0 <= k <= 10000; each array value is between -1000000 and 1000000.',
    inputSpec:
      'Line 1: Two integers n and k. Line 2: n space-separated integers.',
    outputSpec: 'Line 1: The rotated array, space-separated.',
    solve: (input) => {
      const lines = input.split('\n')
      const [n, k] = ints(lines[0] ?? '')
      const arr = ints(lines[1] ?? '')
      const shift = ((k % n) + n) % n
      return [...arr.slice(n - shift), ...arr.slice(0, n - shift)].join(' ')
    },
    cases: [
      { title: 'rotate two', input: '5 2\n1 2 3 4 5', hidden: false },
      { title: 'rotate one', input: '3 1\n7 8 9', hidden: false },
      { title: 'full rotation', input: '4 4\n1 2 3 4', hidden: true },
      { title: 'large rotation', input: '5 12\n-1 0 1 2 3', hidden: true },
    ],
  },

  // ---------------- ALTERNATE CHECKERS ----------------
  {
    id: 'sort-numbers',
    title: 'Sort Numbers',
    difficulty: 'easy',
    match: 'tokens',
    statement:
      'Read n integers and print them in ascending order. Output is compared by tokens, so spacing/newlines do not matter.',
    constraints:
      '1 <= n <= 1000; each integer is between -1000000 and 1000000.',
    inputSpec: 'Line 1: The integer n. Line 2: n space-separated integers.',
    outputSpec: 'The n integers in ascending order.',
    solve: (input) => {
      const lines = input.split('\n')
      return ints(lines[1] ?? '')
        .sort((a, b) => a - b)
        .join(' ')
    },
    cases: [
      { title: 'mixed', input: '5\n3 1 4 1 5', hidden: false },
      { title: 'descending', input: '3\n9 8 7', hidden: false },
      { title: 'negatives', input: '5\n0 -1 3 -1 2', hidden: true },
    ],
  },
  {
    id: 'circle-area',
    title: 'Circle Area',
    difficulty: 'medium',
    match: 'float',
    statement:
      'Given a circle of integer radius r, print its area (pi * r^2). Use a standard pi value if your language provides one; any numeric answer within tolerance is accepted.',
    constraints: '1 <= r <= 1000',
    inputSpec: 'Line 1: A single integer r.',
    outputSpec: 'Line 1: The area, within a small tolerance.',
    solve: (input) => String(Math.PI * Number(firstLine(input)) ** 2),
    cases: [
      { title: 'unit', input: '1', hidden: false },
      { title: 'radius two', input: '2', hidden: false },
      { title: 'radius ten', input: '10', hidden: true },
    ],
  },
]

const puzzles = specs.map((spec) => ({
  id: spec.id,
  title: spec.title,
  difficulty: spec.difficulty,
  statement: spec.statement,
  constraints: spec.constraints,
  inputSpec: spec.inputSpec,
  outputSpec: spec.outputSpec,
  source: 'builtin',
  testcases: spec.cases.map((c, index) => ({
    id: `${spec.id}-${String(index)}`,
    title: c.title,
    input: c.input,
    expectedOutput: spec.solve(c.input),
    hidden: c.hidden,
    // Only emit `match` when a non-default mode is specified.
    ...(spec.match ? { match: spec.match } : {}),
  })),
}))

const header = `// GENERATED FILE — do not edit by hand.
// Produced by scripts/generate-puzzles.mjs (npm run puzzles:generate).
import type { Puzzle } from './types'

export const GENERATED_PUZZLES: readonly Puzzle[] = ${JSON.stringify(
  puzzles,
  null,
  2,
)}
`

const here = dirname(fileURLToPath(import.meta.url))
const outPath = resolve(here, '../src/puzzles/generated.ts')
writeFileSync(outPath, header)
console.log(
  `Generated ${String(puzzles.length)} puzzles -> src/puzzles/generated.ts`,
)
