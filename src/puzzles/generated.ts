// GENERATED FILE — do not edit by hand.
// Produced by scripts/generate-puzzles.mjs (npm run puzzles:generate).
import type { Puzzle } from './types'

export const GENERATED_PUZZLES: readonly Puzzle[] = [
  {
    "id": "echo",
    "title": "Echo",
    "difficulty": "beginner",
    "statement": "Read one line of input and print it back exactly. The simplest possible warm-up for reading from stdin and writing to stdout.",
    "constraints": "The line has 1 to 100 printable ASCII characters.",
    "inputSpec": "Line 1: A string `s`.",
    "outputSpec": "Line 1: The same string `s`.",
    "source": "builtin",
    "testcases": [
      {
        "id": "echo-0",
        "title": "word",
        "input": "hello",
        "expectedOutput": "hello",
        "hidden": false
      },
      {
        "id": "echo-1",
        "title": "phrase",
        "input": "clash of code",
        "expectedOutput": "clash of code",
        "hidden": false
      },
      {
        "id": "echo-2",
        "title": "symbols",
        "input": "a1!b2?",
        "expectedOutput": "a1!b2?",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "s",
            "type": "string"
          }
        ]
      }
    ]
  },
  {
    "id": "sum-two",
    "title": "Sum of Two",
    "difficulty": "beginner",
    "statement": "Read two integers and print their sum.",
    "constraints": "-1000000 <= `a`, `b` <= 1000000",
    "inputSpec": "Line 1: Two space-separated integers `a` and `b`.",
    "outputSpec": "Line 1: The integer `a` + `b`.",
    "source": "builtin",
    "testcases": [
      {
        "id": "sum-two-0",
        "title": "basic",
        "input": "2 3",
        "expectedOutput": "5",
        "hidden": false
      },
      {
        "id": "sum-two-1",
        "title": "negatives",
        "input": "-10 4",
        "expectedOutput": "-6",
        "hidden": false
      },
      {
        "id": "sum-two-2",
        "title": "large",
        "input": "1000000 1000000",
        "expectedOutput": "2000000",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "a",
            "type": "int"
          },
          {
            "name": "b",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "rectangle-area",
    "title": "Rectangle Area",
    "difficulty": "beginner",
    "statement": "Given the width and height of a rectangle, print its area.",
    "constraints": "1 <= `w`, `h` <= 10000",
    "inputSpec": "Line 1: Two space-separated integers `w` and `h`.",
    "outputSpec": "Line 1: The area `w` * `h`.",
    "source": "builtin",
    "testcases": [
      {
        "id": "rectangle-area-0",
        "title": "square",
        "input": "5 5",
        "expectedOutput": "25",
        "hidden": false
      },
      {
        "id": "rectangle-area-1",
        "title": "wide",
        "input": "12 3",
        "expectedOutput": "36",
        "hidden": false
      },
      {
        "id": "rectangle-area-2",
        "title": "large",
        "input": "10000 10000",
        "expectedOutput": "100000000",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "w",
            "type": "int"
          },
          {
            "name": "h",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "max-two",
    "title": "Bigger of Two",
    "difficulty": "beginner",
    "statement": "Read two integers and print the larger one.",
    "constraints": "-1000000 <= `a`, `b` <= 1000000",
    "inputSpec": "Line 1: Two space-separated integers `a` and `b`.",
    "outputSpec": "Line 1: The larger of `a` and `b`.",
    "source": "builtin",
    "testcases": [
      {
        "id": "max-two-0",
        "title": "first",
        "input": "9 4",
        "expectedOutput": "9",
        "hidden": false
      },
      {
        "id": "max-two-1",
        "title": "second",
        "input": "3 7",
        "expectedOutput": "7",
        "hidden": false
      },
      {
        "id": "max-two-2",
        "title": "negatives",
        "input": "-2 -8",
        "expectedOutput": "-2",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "a",
            "type": "int"
          },
          {
            "name": "b",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "double-it",
    "title": "Double It",
    "difficulty": "beginner",
    "statement": "Read an integer n and print twice its value.",
    "constraints": "-1000000 <= `n` <= 1000000",
    "inputSpec": "Line 1: A single integer `n`.",
    "outputSpec": "Line 1: The value 2 * `n`.",
    "source": "builtin",
    "testcases": [
      {
        "id": "double-it-0",
        "title": "positive",
        "input": "21",
        "expectedOutput": "42",
        "hidden": false
      },
      {
        "id": "double-it-1",
        "title": "zero",
        "input": "0",
        "expectedOutput": "0",
        "hidden": false
      },
      {
        "id": "double-it-2",
        "title": "negative",
        "input": "-7",
        "expectedOutput": "-14",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "is-even",
    "title": "Even or Odd",
    "difficulty": "beginner",
    "statement": "Read an integer and print YES if it is even, or NO if it is odd.",
    "constraints": "-1000000 <= `n` <= 1000000",
    "inputSpec": "Line 1: A single integer `n`.",
    "outputSpec": "Line 1: YES or NO.",
    "source": "builtin",
    "testcases": [
      {
        "id": "is-even-0",
        "title": "even",
        "input": "4",
        "expectedOutput": "YES",
        "hidden": false
      },
      {
        "id": "is-even-1",
        "title": "odd",
        "input": "7",
        "expectedOutput": "NO",
        "hidden": false
      },
      {
        "id": "is-even-2",
        "title": "zero",
        "input": "0",
        "expectedOutput": "YES",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "absolute-value",
    "title": "Absolute Value",
    "difficulty": "beginner",
    "statement": "Read an integer and print its absolute value.",
    "constraints": "-1000000 <= `n` <= 1000000",
    "inputSpec": "Line 1: A single integer `n`.",
    "outputSpec": "Line 1: |`n`|.",
    "source": "builtin",
    "testcases": [
      {
        "id": "absolute-value-0",
        "title": "positive",
        "input": "5",
        "expectedOutput": "5",
        "hidden": false
      },
      {
        "id": "absolute-value-1",
        "title": "negative",
        "input": "-3",
        "expectedOutput": "3",
        "hidden": false
      },
      {
        "id": "absolute-value-2",
        "title": "zero",
        "input": "0",
        "expectedOutput": "0",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "min-two",
    "title": "Smaller of Two",
    "difficulty": "beginner",
    "statement": "Read two integers and print the smaller one.",
    "constraints": "-1000000 <= `a`, `b` <= 1000000",
    "inputSpec": "Line 1: Two space-separated integers `a` and `b`.",
    "outputSpec": "Line 1: The smaller of `a` and `b`.",
    "source": "builtin",
    "testcases": [
      {
        "id": "min-two-0",
        "title": "second smaller",
        "input": "8 3",
        "expectedOutput": "3",
        "hidden": false
      },
      {
        "id": "min-two-1",
        "title": "negative",
        "input": "-1 2",
        "expectedOutput": "-1",
        "hidden": false
      },
      {
        "id": "min-two-2",
        "title": "equal",
        "input": "5 5",
        "expectedOutput": "5",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "a",
            "type": "int"
          },
          {
            "name": "b",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "count-chars",
    "title": "Character Count",
    "difficulty": "beginner",
    "statement": "Read a line of text and print the number of characters it contains. Spaces count as characters.",
    "constraints": "The line has 1 to 200 printable ASCII characters.",
    "inputSpec": "Line 1: A string `s`.",
    "outputSpec": "Line 1: The number of characters in `s`.",
    "source": "builtin",
    "testcases": [
      {
        "id": "count-chars-0",
        "title": "word",
        "input": "hello",
        "expectedOutput": "5",
        "hidden": false
      },
      {
        "id": "count-chars-1",
        "title": "with space",
        "input": "hi there",
        "expectedOutput": "8",
        "hidden": false
      },
      {
        "id": "count-chars-2",
        "title": "phrase",
        "input": "clash of code",
        "expectedOutput": "13",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "s",
            "type": "string"
          }
        ]
      }
    ]
  },
  {
    "id": "celsius-to-fahrenheit",
    "title": "Celsius to Fahrenheit",
    "difficulty": "beginner",
    "statement": "Convert a temperature from Celsius to Fahrenheit. Use real-number division with the formula F = C * 9 / 5 + 32.",
    "constraints": "-273 <= C <= 10000",
    "inputSpec": "Line 1: A single integer C (degrees Celsius).",
    "outputSpec": "Line 1: The equivalent temperature in Fahrenheit. Any numeric value within a small tolerance is accepted.",
    "source": "builtin",
    "testcases": [
      {
        "id": "celsius-to-fahrenheit-0",
        "title": "freezing",
        "input": "0",
        "expectedOutput": "32",
        "hidden": false,
        "match": "float"
      },
      {
        "id": "celsius-to-fahrenheit-1",
        "title": "boiling",
        "input": "100",
        "expectedOutput": "212",
        "hidden": false,
        "match": "float"
      },
      {
        "id": "celsius-to-fahrenheit-2",
        "title": "body temp",
        "input": "37",
        "expectedOutput": "98.6",
        "hidden": true,
        "match": "float"
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "c",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "reverse-string",
    "title": "Reverse String",
    "difficulty": "easy",
    "statement": "Read a single line and print it reversed, character by character.",
    "constraints": "The line has 1 to 100 printable ASCII characters.",
    "inputSpec": "Line 1: A string `s`.",
    "outputSpec": "Line 1: The string `s` reversed.",
    "source": "builtin",
    "testcases": [
      {
        "id": "reverse-string-0",
        "title": "word",
        "input": "hello",
        "expectedOutput": "olleh",
        "hidden": false
      },
      {
        "id": "reverse-string-1",
        "title": "palindrome",
        "input": "racecar",
        "expectedOutput": "racecar",
        "hidden": false
      },
      {
        "id": "reverse-string-2",
        "title": "phrase",
        "input": "clash of code",
        "expectedOutput": "edoc fo hsalc",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "s",
            "type": "string"
          }
        ]
      }
    ]
  },
  {
    "id": "count-vowels",
    "title": "Count Vowels",
    "difficulty": "easy",
    "statement": "Count how many vowels (a, e, i, o, u, case-insensitive) appear in a line of text.",
    "constraints": "The line has 1 to 200 printable ASCII characters.",
    "inputSpec": "Line 1: A string `s`.",
    "outputSpec": "Line 1: The number of vowels in `s`.",
    "source": "builtin",
    "testcases": [
      {
        "id": "count-vowels-0",
        "title": "word",
        "input": "Education",
        "expectedOutput": "5",
        "hidden": false
      },
      {
        "id": "count-vowels-1",
        "title": "phrase",
        "input": "the quick brown fox",
        "expectedOutput": "5",
        "hidden": false
      },
      {
        "id": "count-vowels-2",
        "title": "none",
        "input": "rhythm",
        "expectedOutput": "0",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "s",
            "type": "string"
          }
        ]
      }
    ]
  },
  {
    "id": "sum-list",
    "title": "Sum a List",
    "difficulty": "easy",
    "statement": "You are given a count n followed by n integers. Print their sum.",
    "constraints": "1 <= `n` <= 1000; each integer is between -1000000 and 1000000.",
    "inputSpec": "Line 1: The integer `n`. Line 2: `n` space-separated integers.",
    "outputSpec": "Line 1: The sum of the `n` integers.",
    "source": "builtin",
    "testcases": [
      {
        "id": "sum-list-0",
        "title": "small",
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "15",
        "hidden": false
      },
      {
        "id": "sum-list-1",
        "title": "negatives",
        "input": "3\n-5 10 -2",
        "expectedOutput": "3",
        "hidden": false
      },
      {
        "id": "sum-list-2",
        "title": "single",
        "input": "1\n99",
        "expectedOutput": "99",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      },
      {
        "kind": "list",
        "name": "a",
        "type": "int"
      }
    ]
  },
  {
    "id": "max-in-list",
    "title": "Largest in List",
    "difficulty": "easy",
    "statement": "You are given a count n followed by n integers. Print the largest of them.",
    "constraints": "1 <= `n` <= 1000; each integer is between -1000000 and 1000000.",
    "inputSpec": "Line 1: The integer `n`. Line 2: `n` space-separated integers.",
    "outputSpec": "Line 1: The maximum value.",
    "source": "builtin",
    "testcases": [
      {
        "id": "max-in-list-0",
        "title": "mixed",
        "input": "5\n3 7 2 9 4",
        "expectedOutput": "9",
        "hidden": false
      },
      {
        "id": "max-in-list-1",
        "title": "single",
        "input": "1\n42",
        "expectedOutput": "42",
        "hidden": false
      },
      {
        "id": "max-in-list-2",
        "title": "negatives",
        "input": "4\n-5 -1 -9 -3",
        "expectedOutput": "-1",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      },
      {
        "kind": "list",
        "name": "a",
        "type": "int"
      }
    ]
  },
  {
    "id": "factorial",
    "title": "Factorial",
    "difficulty": "easy",
    "statement": "Read an integer n and print n! (the product 1 * 2 * ... * n). Use a numeric type that can represent 20!.",
    "constraints": "0 <= `n` <= 20",
    "inputSpec": "Line 1: A single integer `n`.",
    "outputSpec": "Line 1: The value `n`!.",
    "source": "builtin",
    "testcases": [
      {
        "id": "factorial-0",
        "title": "five",
        "input": "5",
        "expectedOutput": "120",
        "hidden": false
      },
      {
        "id": "factorial-1",
        "title": "zero",
        "input": "0",
        "expectedOutput": "1",
        "hidden": false
      },
      {
        "id": "factorial-2",
        "title": "twenty",
        "input": "20",
        "expectedOutput": "2432902008176640000",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "palindrome-check",
    "title": "Palindrome Check",
    "difficulty": "easy",
    "statement": "Print YES if the input string reads the same forwards and backwards, or NO otherwise. Compare the characters exactly as given; case matters.",
    "constraints": "The line has 1 to 200 printable ASCII characters.",
    "inputSpec": "Line 1: A string `s`.",
    "outputSpec": "Line 1: YES if `s` is a palindrome, otherwise NO.",
    "source": "builtin",
    "testcases": [
      {
        "id": "palindrome-check-0",
        "title": "palindrome",
        "input": "racecar",
        "expectedOutput": "YES",
        "hidden": false
      },
      {
        "id": "palindrome-check-1",
        "title": "not palindrome",
        "input": "hello",
        "expectedOutput": "NO",
        "hidden": false
      },
      {
        "id": "palindrome-check-2",
        "title": "single char",
        "input": "a",
        "expectedOutput": "YES",
        "hidden": true
      },
      {
        "id": "palindrome-check-3",
        "title": "case-sensitive",
        "input": "Aa",
        "expectedOutput": "NO",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "s",
            "type": "string"
          }
        ]
      }
    ]
  },
  {
    "id": "repeat-string",
    "title": "Repeat String",
    "difficulty": "easy",
    "statement": "Print the string s repeated n times, with no separator.",
    "constraints": "1 <= `n` <= 20; the string has 1 to 20 printable ASCII characters.",
    "inputSpec": "Line 1: An integer `n`. Line 2: A string `s`.",
    "outputSpec": "Line 1: The string `s` repeated `n` times.",
    "source": "builtin",
    "testcases": [
      {
        "id": "repeat-string-0",
        "title": "repeat three",
        "input": "3\nab",
        "expectedOutput": "ababab",
        "hidden": false
      },
      {
        "id": "repeat-string-1",
        "title": "repeat once",
        "input": "1\nhello",
        "expectedOutput": "hello",
        "hidden": false
      },
      {
        "id": "repeat-string-2",
        "title": "repeat four",
        "input": "4\nX",
        "expectedOutput": "XXXX",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      },
      {
        "kind": "read",
        "vars": [
          {
            "name": "s",
            "type": "string"
          }
        ]
      }
    ]
  },
  {
    "id": "min-in-list",
    "title": "Smallest in List",
    "difficulty": "easy",
    "statement": "You are given a count n followed by n integers. Print the smallest of them.",
    "constraints": "1 <= `n` <= 1000; each integer is between -1000000 and 1000000.",
    "inputSpec": "Line 1: The integer `n`. Line 2: `n` space-separated integers.",
    "outputSpec": "Line 1: The minimum value.",
    "source": "builtin",
    "testcases": [
      {
        "id": "min-in-list-0",
        "title": "mixed",
        "input": "5\n3 7 2 9 4",
        "expectedOutput": "2",
        "hidden": false
      },
      {
        "id": "min-in-list-1",
        "title": "single",
        "input": "1\n42",
        "expectedOutput": "42",
        "hidden": false
      },
      {
        "id": "min-in-list-2",
        "title": "negatives",
        "input": "4\n-5 -1 -9 -3",
        "expectedOutput": "-9",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      },
      {
        "kind": "list",
        "name": "a",
        "type": "int"
      }
    ]
  },
  {
    "id": "sum-squares",
    "title": "Sum of Squares",
    "difficulty": "easy",
    "statement": "Compute the sum 1² + 2² + ... + n².",
    "constraints": "1 <= `n` <= 100",
    "inputSpec": "Line 1: A single integer `n`.",
    "outputSpec": "Line 1: The sum of the first `n` perfect squares.",
    "source": "builtin",
    "testcases": [
      {
        "id": "sum-squares-0",
        "title": "three",
        "input": "3",
        "expectedOutput": "14",
        "hidden": false
      },
      {
        "id": "sum-squares-1",
        "title": "one",
        "input": "1",
        "expectedOutput": "1",
        "hidden": false
      },
      {
        "id": "sum-squares-2",
        "title": "ten",
        "input": "10",
        "expectedOutput": "385",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "fizzbuzz",
    "title": "FizzBuzz",
    "difficulty": "medium",
    "statement": "Print the numbers from 1 to n, one per line. For multiples of 3 print \"Fizz\", for multiples of 5 print \"Buzz\", and for multiples of both print \"FizzBuzz\".",
    "constraints": "1 <= `n` <= 100",
    "inputSpec": "Line 1: A single integer `n`.",
    "outputSpec": "`n` lines, each the value for that position.",
    "source": "builtin",
    "testcases": [
      {
        "id": "fizzbuzz-0",
        "title": "first five",
        "input": "5",
        "expectedOutput": "1\n2\nFizz\n4\nBuzz",
        "hidden": false
      },
      {
        "id": "fizzbuzz-1",
        "title": "through fifteen",
        "input": "15",
        "expectedOutput": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz",
        "hidden": false
      },
      {
        "id": "fizzbuzz-2",
        "title": "twenty",
        "input": "20",
        "expectedOutput": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "jigsaw-tabs",
    "title": "Jigsaw Tabs",
    "difficulty": "medium",
    "statement": "For a regular jigsaw puzzle of size h x w pieces, how many tabs (the bits that stick out) are there? Every shared edge between two adjacent pieces has exactly one tab and one matching socket.",
    "constraints": "1 <= `h`, `w` <= 100",
    "inputSpec": "Line 1: Two space-separated integers `h` and `w`.",
    "outputSpec": "Line 1: The number of tabs.",
    "source": "builtin",
    "testcases": [
      {
        "id": "jigsaw-tabs-0",
        "title": "small square",
        "input": "2 2",
        "expectedOutput": "4",
        "hidden": false
      },
      {
        "id": "jigsaw-tabs-1",
        "title": "small rectangle",
        "input": "2 3",
        "expectedOutput": "7",
        "hidden": false
      },
      {
        "id": "jigsaw-tabs-2",
        "title": "huge puzzle",
        "input": "100 100",
        "expectedOutput": "19800",
        "hidden": true
      },
      {
        "id": "jigsaw-tabs-3",
        "title": "tiny puzzle",
        "input": "1 1",
        "expectedOutput": "0",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "h",
            "type": "int"
          },
          {
            "name": "w",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "nth-fibonacci",
    "title": "Nth Fibonacci",
    "difficulty": "medium",
    "statement": "Print the nth Fibonacci number, where F(1) = 1, F(2) = 1, and F(k) = F(k-1) + F(k-2). Use a numeric type that can represent F(50).",
    "constraints": "1 <= `n` <= 50",
    "inputSpec": "Line 1: A single integer `n`.",
    "outputSpec": "Line 1: The nth Fibonacci number.",
    "source": "builtin",
    "testcases": [
      {
        "id": "nth-fibonacci-0",
        "title": "tenth",
        "input": "10",
        "expectedOutput": "55",
        "hidden": false
      },
      {
        "id": "nth-fibonacci-1",
        "title": "first",
        "input": "1",
        "expectedOutput": "1",
        "hidden": false
      },
      {
        "id": "nth-fibonacci-2",
        "title": "fiftieth",
        "input": "50",
        "expectedOutput": "12586269025",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "gcd",
    "title": "Greatest Common Divisor",
    "difficulty": "medium",
    "statement": "Read two positive integers and print their greatest common divisor.",
    "constraints": "1 <= `a`, `b` <= 1000000000",
    "inputSpec": "Line 1: Two space-separated integers `a` and `b`.",
    "outputSpec": "Line 1: gcd(`a`, `b`).",
    "source": "builtin",
    "testcases": [
      {
        "id": "gcd-0",
        "title": "basic",
        "input": "12 18",
        "expectedOutput": "6",
        "hidden": false
      },
      {
        "id": "gcd-1",
        "title": "coprime",
        "input": "17 5",
        "expectedOutput": "1",
        "hidden": false
      },
      {
        "id": "gcd-2",
        "title": "large",
        "input": "1000000000 8",
        "expectedOutput": "8",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "a",
            "type": "int"
          },
          {
            "name": "b",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "word-count",
    "title": "Word Count",
    "difficulty": "medium",
    "statement": "Count the number of whitespace-separated words in a line of text.",
    "constraints": "The line has 1 to 500 printable ASCII characters.",
    "inputSpec": "Line 1: A line of text.",
    "outputSpec": "Line 1: The number of words.",
    "source": "builtin",
    "testcases": [
      {
        "id": "word-count-0",
        "title": "sentence",
        "input": "the quick brown fox jumps",
        "expectedOutput": "5",
        "hidden": false
      },
      {
        "id": "word-count-1",
        "title": "one word",
        "input": "hello",
        "expectedOutput": "1",
        "hidden": false
      },
      {
        "id": "word-count-2",
        "title": "spaced",
        "input": "  lots   of   spaces  ",
        "expectedOutput": "3",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "s",
            "type": "string"
          }
        ]
      }
    ]
  },
  {
    "id": "sum-digits",
    "title": "Sum of Digits",
    "difficulty": "medium",
    "statement": "Read a non-negative integer and print the sum of its digits.",
    "constraints": "0 <= `n` <= 1000000000",
    "inputSpec": "Line 1: A single non-negative integer `n`.",
    "outputSpec": "Line 1: The sum of the digits of `n`.",
    "source": "builtin",
    "testcases": [
      {
        "id": "sum-digits-0",
        "title": "three digits",
        "input": "123",
        "expectedOutput": "6",
        "hidden": false
      },
      {
        "id": "sum-digits-1",
        "title": "nines",
        "input": "9999",
        "expectedOutput": "36",
        "hidden": false
      },
      {
        "id": "sum-digits-2",
        "title": "hundreds",
        "input": "100",
        "expectedOutput": "1",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "lcm",
    "title": "Least Common Multiple",
    "difficulty": "medium",
    "statement": "Read two positive integers and print their least common multiple.",
    "constraints": "1 <= `a`, `b` <= 100",
    "inputSpec": "Line 1: Two space-separated integers `a` and `b`.",
    "outputSpec": "Line 1: lcm(`a`, `b`).",
    "source": "builtin",
    "testcases": [
      {
        "id": "lcm-0",
        "title": "basic",
        "input": "4 6",
        "expectedOutput": "12",
        "hidden": false
      },
      {
        "id": "lcm-1",
        "title": "coprime",
        "input": "3 7",
        "expectedOutput": "21",
        "hidden": false
      },
      {
        "id": "lcm-2",
        "title": "shared factor",
        "input": "12 18",
        "expectedOutput": "36",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "a",
            "type": "int"
          },
          {
            "name": "b",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "average",
    "title": "Average",
    "difficulty": "medium",
    "statement": "Compute the average (arithmetic mean) of n integers.",
    "constraints": "1 <= `n` <= 1000; each integer is between -1000000 and 1000000.",
    "inputSpec": "Line 1: The integer `n`. Line 2: `n` space-separated integers.",
    "outputSpec": "Line 1: The average, within `a` small numeric tolerance.",
    "source": "builtin",
    "testcases": [
      {
        "id": "average-0",
        "title": "integers",
        "input": "3\n1 2 3",
        "expectedOutput": "2",
        "hidden": false,
        "match": "float"
      },
      {
        "id": "average-1",
        "title": "larger",
        "input": "4\n10 20 30 40",
        "expectedOutput": "25",
        "hidden": false,
        "match": "float"
      },
      {
        "id": "average-2",
        "title": "non-integer result",
        "input": "2\n1 2",
        "expectedOutput": "1.5",
        "hidden": true,
        "match": "float"
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      },
      {
        "kind": "list",
        "name": "a",
        "type": "int"
      }
    ]
  },
  {
    "id": "count-occurrences",
    "title": "Count Occurrences",
    "difficulty": "medium",
    "statement": "Count how many times a given character appears in a string. Matching is case-sensitive.",
    "constraints": "The character and string contain printable ASCII characters; the string length is 1 to 200.",
    "inputSpec": "Line 1: A single character `c`. Line 2: A string `s`.",
    "outputSpec": "Line 1: The number of times `c` appears in `s`.",
    "source": "builtin",
    "testcases": [
      {
        "id": "count-occurrences-0",
        "title": "banana",
        "input": "a\nbanana",
        "expectedOutput": "3",
        "hidden": false
      },
      {
        "id": "count-occurrences-1",
        "title": "hello world",
        "input": "l\nhello world",
        "expectedOutput": "3",
        "hidden": false
      },
      {
        "id": "count-occurrences-2",
        "title": "single",
        "input": "x\nboxy",
        "expectedOutput": "1",
        "hidden": true
      },
      {
        "id": "count-occurrences-3",
        "title": "none",
        "input": "z\nbanana",
        "expectedOutput": "0",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "c",
            "type": "word"
          }
        ]
      },
      {
        "kind": "read",
        "vars": [
          {
            "name": "s",
            "type": "string"
          }
        ]
      }
    ]
  },
  {
    "id": "missing-number",
    "title": "Missing Number",
    "difficulty": "medium",
    "statement": "You are given n followed by n-1 distinct integers from 1 to n (in any order, one number is missing). Print the missing number.",
    "constraints": "2 <= `n` <= 1000",
    "inputSpec": "Line 1: The integer `n`. Line 2: `n`-1 space-separated integers from 1 to `n`.",
    "outputSpec": "Line 1: The missing number.",
    "source": "builtin",
    "testcases": [
      {
        "id": "missing-number-0",
        "title": "middle missing",
        "input": "5\n1 2 4 5",
        "expectedOutput": "3",
        "hidden": false
      },
      {
        "id": "missing-number-1",
        "title": "small",
        "input": "3\n1 3",
        "expectedOutput": "2",
        "hidden": false
      },
      {
        "id": "missing-number-2",
        "title": "end missing",
        "input": "6\n1 2 3 4 5",
        "expectedOutput": "6",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      },
      {
        "kind": "list",
        "name": "a",
        "type": "int"
      }
    ]
  },
  {
    "id": "count-primes",
    "title": "Count Primes",
    "difficulty": "hard",
    "statement": "Print how many prime numbers are less than or equal to n.",
    "constraints": "1 <= `n` <= 100000",
    "inputSpec": "Line 1: A single integer `n`.",
    "outputSpec": "Line 1: The count of primes <= `n`.",
    "source": "builtin",
    "testcases": [
      {
        "id": "count-primes-0",
        "title": "small",
        "input": "10",
        "expectedOutput": "4",
        "hidden": false
      },
      {
        "id": "count-primes-1",
        "title": "medium",
        "input": "100",
        "expectedOutput": "25",
        "hidden": false
      },
      {
        "id": "count-primes-2",
        "title": "large",
        "input": "100000",
        "expectedOutput": "9592",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "to-binary",
    "title": "To Binary",
    "difficulty": "hard",
    "statement": "Read a non-negative integer n and print its binary representation without leading zeros.",
    "constraints": "0 <= `n` <= 1000000000",
    "inputSpec": "Line 1: A single integer `n`.",
    "outputSpec": "Line 1: `n` in base 2.",
    "source": "builtin",
    "testcases": [
      {
        "id": "to-binary-0",
        "title": "ten",
        "input": "10",
        "expectedOutput": "1010",
        "hidden": false
      },
      {
        "id": "to-binary-1",
        "title": "zero",
        "input": "0",
        "expectedOutput": "0",
        "hidden": false
      },
      {
        "id": "to-binary-2",
        "title": "max",
        "input": "1000000000",
        "expectedOutput": "111011100110101100101000000000",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "caesar-cipher",
    "title": "Caesar Cipher",
    "difficulty": "hard",
    "statement": "Shift every letter of the text forward by k positions in the alphabet, wrapping around and preserving case. Non-letter characters are unchanged.",
    "constraints": "-1000 <= `k` <= 1000; the `text` has 1 to 200 printable ASCII characters.",
    "inputSpec": "Line 1: The integer shift `k`. Line 2: The `text` to encode.",
    "outputSpec": "Line 1: The encoded `text`.",
    "source": "builtin",
    "testcases": [
      {
        "id": "caesar-cipher-0",
        "title": "shift one",
        "input": "1\nabc xyz",
        "expectedOutput": "bcd yza",
        "hidden": false
      },
      {
        "id": "caesar-cipher-1",
        "title": "shift three",
        "input": "3\nHello, World!",
        "expectedOutput": "Khoor, Zruog!",
        "hidden": false
      },
      {
        "id": "caesar-cipher-2",
        "title": "wrap back",
        "input": "-1\nbcd",
        "expectedOutput": "abc",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "k",
            "type": "int"
          }
        ]
      },
      {
        "kind": "read",
        "vars": [
          {
            "name": "text",
            "type": "string"
          }
        ]
      }
    ]
  },
  {
    "id": "digital-root",
    "title": "Digital Root",
    "difficulty": "hard",
    "statement": "Repeatedly sum the digits of n until a single digit remains, then print it.",
    "constraints": "0 <= `n` <= 1000000000",
    "inputSpec": "Line 1: A single integer `n`.",
    "outputSpec": "Line 1: The digital root of `n`.",
    "source": "builtin",
    "testcases": [
      {
        "id": "digital-root-0",
        "title": "classic",
        "input": "942",
        "expectedOutput": "6",
        "hidden": false
      },
      {
        "id": "digital-root-1",
        "title": "single",
        "input": "7",
        "expectedOutput": "7",
        "hidden": false
      },
      {
        "id": "digital-root-2",
        "title": "large",
        "input": "999999999",
        "expectedOutput": "9",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "run-length-encode",
    "title": "Run-Length Encode",
    "difficulty": "hard",
    "statement": "Compress a string by replacing each run of a repeated character with the character followed by the run length. For example, \"aaabbc\" becomes \"a3b2c1\".",
    "constraints": "The line has 1 to 200 printable ASCII characters.",
    "inputSpec": "Line 1: A string `s`.",
    "outputSpec": "Line 1: The run-length encoding of `s`.",
    "source": "builtin",
    "testcases": [
      {
        "id": "run-length-encode-0",
        "title": "runs",
        "input": "aaabbc",
        "expectedOutput": "a3b2c1",
        "hidden": false
      },
      {
        "id": "run-length-encode-1",
        "title": "no runs",
        "input": "abcde",
        "expectedOutput": "a1b1c1d1e1",
        "hidden": false
      },
      {
        "id": "run-length-encode-2",
        "title": "long run",
        "input": "wwwwwwwwww",
        "expectedOutput": "w10",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "s",
            "type": "string"
          }
        ]
      }
    ]
  },
  {
    "id": "is-prime",
    "title": "Prime Check",
    "difficulty": "hard",
    "statement": "Print YES if n is prime, or NO otherwise.",
    "constraints": "1 <= `n` <= 1000000",
    "inputSpec": "Line 1: A single integer `n`.",
    "outputSpec": "Line 1: YES or NO.",
    "source": "builtin",
    "testcases": [
      {
        "id": "is-prime-0",
        "title": "prime",
        "input": "17",
        "expectedOutput": "YES",
        "hidden": false
      },
      {
        "id": "is-prime-1",
        "title": "composite",
        "input": "4",
        "expectedOutput": "NO",
        "hidden": false
      },
      {
        "id": "is-prime-2",
        "title": "one",
        "input": "1",
        "expectedOutput": "NO",
        "hidden": true
      },
      {
        "id": "is-prime-3",
        "title": "large prime",
        "input": "999983",
        "expectedOutput": "YES",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "anagram-check",
    "title": "Anagram Check",
    "difficulty": "hard",
    "statement": "Print YES if the two words are anagrams of each other (same letters in any order, case-insensitive), or NO otherwise.",
    "constraints": "Each word has 1 to 100 ASCII letters.",
    "inputSpec": "Line 1: Word `a`. Line 2: Word `b`.",
    "outputSpec": "Line 1: YES or NO.",
    "source": "builtin",
    "testcases": [
      {
        "id": "anagram-check-0",
        "title": "anagram",
        "input": "Listen\nSilent",
        "expectedOutput": "YES",
        "hidden": false
      },
      {
        "id": "anagram-check-1",
        "title": "not anagram",
        "input": "hello\nworld",
        "expectedOutput": "NO",
        "hidden": false
      },
      {
        "id": "anagram-check-2",
        "title": "cinema",
        "input": "cinema\niceman",
        "expectedOutput": "YES",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "a",
            "type": "word"
          }
        ]
      },
      {
        "kind": "read",
        "vars": [
          {
            "name": "b",
            "type": "word"
          }
        ]
      }
    ]
  },
  {
    "id": "triangle-type",
    "title": "Triangle Type",
    "difficulty": "hard",
    "statement": "Given three side lengths, classify the triangle as \"equilateral\", \"isosceles\", \"scalene\", or \"invalid\" (if no triangle can be formed).",
    "constraints": "1 <= `a`, `b`, `c` <= 1000",
    "inputSpec": "Line 1: Three space-separated integers `a`, `b`, and `c`.",
    "outputSpec": "Line 1: The triangle type.",
    "source": "builtin",
    "testcases": [
      {
        "id": "triangle-type-0",
        "title": "equilateral",
        "input": "3 3 3",
        "expectedOutput": "equilateral",
        "hidden": false
      },
      {
        "id": "triangle-type-1",
        "title": "scalene",
        "input": "3 4 5",
        "expectedOutput": "scalene",
        "hidden": false
      },
      {
        "id": "triangle-type-2",
        "title": "isosceles",
        "input": "5 5 3",
        "expectedOutput": "isosceles",
        "hidden": true
      },
      {
        "id": "triangle-type-3",
        "title": "invalid",
        "input": "1 2 10",
        "expectedOutput": "invalid",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "a",
            "type": "int"
          },
          {
            "name": "b",
            "type": "int"
          },
          {
            "name": "c",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "number-to-words",
    "title": "Number to Words",
    "difficulty": "hard",
    "statement": "Convert an integer from 1 to 999 into lowercase English words. Use spaces between words and no hyphens or \"and\" (for example, 342 -> \"three hundred forty two\").",
    "constraints": "1 <= `n` <= 999",
    "inputSpec": "Line 1: A single integer `n`.",
    "outputSpec": "Line 1: The English word for `n`.",
    "source": "builtin",
    "testcases": [
      {
        "id": "number-to-words-0",
        "title": "one",
        "input": "1",
        "expectedOutput": "one",
        "hidden": false
      },
      {
        "id": "number-to-words-1",
        "title": "hundreds",
        "input": "342",
        "expectedOutput": "three hundred forty two",
        "hidden": false
      },
      {
        "id": "number-to-words-2",
        "title": "nineteen",
        "input": "19",
        "expectedOutput": "nineteen",
        "hidden": true
      },
      {
        "id": "number-to-words-3",
        "title": "max",
        "input": "999",
        "expectedOutput": "nine hundred ninety nine",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "two-sum-exists",
    "title": "Two Sum Exists",
    "difficulty": "hard",
    "statement": "Given a target value and a list of integers, print YES if any two distinct elements sum to the target, or NO otherwise.",
    "constraints": "2 <= n <= 1000; all values fit in `a` 32-bit integer.",
    "inputSpec": "Line 1: The `target` integer. Line 2: n space-separated integers, where n is the number of values on this line.",
    "outputSpec": "Line 1: YES or NO.",
    "source": "builtin",
    "testcases": [
      {
        "id": "two-sum-exists-0",
        "title": "found",
        "input": "9\n2 7 11 15",
        "expectedOutput": "YES",
        "hidden": false
      },
      {
        "id": "two-sum-exists-1",
        "title": "not found",
        "input": "100\n1 2 3",
        "expectedOutput": "NO",
        "hidden": false
      },
      {
        "id": "two-sum-exists-2",
        "title": "pair in middle",
        "input": "6\n1 2 3 4 5",
        "expectedOutput": "YES",
        "hidden": true
      },
      {
        "id": "two-sum-exists-3",
        "title": "duplicate pair",
        "input": "10\n5 5",
        "expectedOutput": "YES",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "target",
            "type": "int"
          }
        ]
      },
      {
        "kind": "list",
        "name": "a",
        "type": "int"
      }
    ]
  },
  {
    "id": "nth-prime",
    "title": "Nth Prime",
    "difficulty": "expert",
    "statement": "Print the nth prime number (1-indexed, so the 1st prime is 2).",
    "constraints": "1 <= `n` <= 10000",
    "inputSpec": "Line 1: A single integer `n`.",
    "outputSpec": "Line 1: The nth prime.",
    "source": "builtin",
    "testcases": [
      {
        "id": "nth-prime-0",
        "title": "first",
        "input": "1",
        "expectedOutput": "2",
        "hidden": false
      },
      {
        "id": "nth-prime-1",
        "title": "sixth",
        "input": "6",
        "expectedOutput": "13",
        "hidden": false
      },
      {
        "id": "nth-prime-2",
        "title": "limit",
        "input": "10000",
        "expectedOutput": "104729",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "collatz-steps",
    "title": "Collatz Steps",
    "difficulty": "expert",
    "statement": "Starting from n, repeatedly halve it if even or replace it with 3n+1 if odd. Print how many steps it takes to reach 1.",
    "constraints": "1 <= `n` <= 1000000",
    "inputSpec": "Line 1: A single integer `n`.",
    "outputSpec": "Line 1: The number of steps to reach 1.",
    "source": "builtin",
    "testcases": [
      {
        "id": "collatz-steps-0",
        "title": "six",
        "input": "6",
        "expectedOutput": "8",
        "hidden": false
      },
      {
        "id": "collatz-steps-1",
        "title": "one",
        "input": "1",
        "expectedOutput": "0",
        "hidden": false
      },
      {
        "id": "collatz-steps-2",
        "title": "27",
        "input": "27",
        "expectedOutput": "111",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "balanced-brackets",
    "title": "Balanced Brackets",
    "difficulty": "expert",
    "statement": "Determine whether a string of brackets (), [], {} is correctly balanced and nested. Print YES or NO.",
    "constraints": "The line has 1 to 1000 bracket characters.",
    "inputSpec": "Line 1: A string of brackets.",
    "outputSpec": "Line 1: YES if balanced, otherwise NO.",
    "source": "builtin",
    "testcases": [
      {
        "id": "balanced-brackets-0",
        "title": "balanced",
        "input": "([]{})",
        "expectedOutput": "YES",
        "hidden": false
      },
      {
        "id": "balanced-brackets-1",
        "title": "unbalanced",
        "input": "([)]",
        "expectedOutput": "NO",
        "hidden": false
      },
      {
        "id": "balanced-brackets-2",
        "title": "nested",
        "input": "{[()()]}",
        "expectedOutput": "YES",
        "hidden": true
      },
      {
        "id": "balanced-brackets-3",
        "title": "open",
        "input": "(((",
        "expectedOutput": "NO",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "s",
            "type": "string"
          }
        ]
      }
    ]
  },
  {
    "id": "base-convert",
    "title": "Base Conversion",
    "difficulty": "expert",
    "statement": "Convert a number from one base to another. Digits above 9 use lowercase letters a-z. Output uses lowercase.",
    "constraints": "2 <= fromBase, toBase <= 36; the `value` is non-negative and fits in a 32-bit integer when converted to decimal.",
    "inputSpec": "Line 1: A `value`, its source `base`, and its `target` `base`, space-separated.",
    "outputSpec": "Line 1: The `value` expressed in the `target` `base`.",
    "source": "builtin",
    "testcases": [
      {
        "id": "base-convert-0",
        "title": "bin to dec",
        "input": "1010 2 10",
        "expectedOutput": "10",
        "hidden": false
      },
      {
        "id": "base-convert-1",
        "title": "dec to hex",
        "input": "255 10 16",
        "expectedOutput": "ff",
        "hidden": false
      },
      {
        "id": "base-convert-2",
        "title": "hex to dec",
        "input": "ff 16 10",
        "expectedOutput": "255",
        "hidden": true
      },
      {
        "id": "base-convert-3",
        "title": "base36",
        "input": "zz 36 10",
        "expectedOutput": "1295",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "value",
            "type": "word"
          },
          {
            "name": "base",
            "type": "int"
          },
          {
            "name": "target",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "longest-word",
    "title": "Longest Word",
    "difficulty": "expert",
    "statement": "Print the longest whitespace-separated word in a line. If several words tie for the longest, print the first of them.",
    "constraints": "The line has 1 to 500 characters.",
    "inputSpec": "Line 1: A line of text.",
    "outputSpec": "Line 1: The longest word.",
    "source": "builtin",
    "testcases": [
      {
        "id": "longest-word-0",
        "title": "sentence",
        "input": "the quick brown fox",
        "expectedOutput": "quick",
        "hidden": false
      },
      {
        "id": "longest-word-1",
        "title": "tie",
        "input": "cat dog pig",
        "expectedOutput": "cat",
        "hidden": false
      },
      {
        "id": "longest-word-2",
        "title": "long",
        "input": "a programming marathon today",
        "expectedOutput": "programming",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "s",
            "type": "string"
          }
        ]
      }
    ]
  },
  {
    "id": "matrix-trace",
    "title": "Matrix Trace",
    "difficulty": "expert",
    "statement": "Compute the trace of an N×N matrix — the sum of its main diagonal elements.",
    "constraints": "1 <= N <= 20; each value fits in a 32-bit integer. Use an accumulator large enough for the sum.",
    "inputSpec": "Line 1: The integer N. Lines 2 to N+1: N space-separated integers per row.",
    "outputSpec": "Line 1: The trace.",
    "source": "builtin",
    "testcases": [
      {
        "id": "matrix-trace-0",
        "title": "2x2",
        "input": "2\n1 2\n3 4",
        "expectedOutput": "5",
        "hidden": false
      },
      {
        "id": "matrix-trace-1",
        "title": "3x3 identity-like",
        "input": "3\n1 0 0\n0 2 0\n0 0 3",
        "expectedOutput": "6",
        "hidden": false
      },
      {
        "id": "matrix-trace-2",
        "title": "4x4",
        "input": "4\n5 1 2 3\n1 7 2 1\n0 0 9 1\n1 2 3 4",
        "expectedOutput": "25",
        "hidden": true
      }
    ]
  },
  {
    "id": "run-length-decode",
    "title": "Run-Length Decode",
    "difficulty": "expert",
    "statement": "Decode a run-length encoded string. The format is non-digit character followed by its count, e.g. \"a3b2c1\" -> \"aaabbc\". Counts may be more than one digit.",
    "constraints": "The encoded string has 2 to 100 characters; decoded length is at most 500.",
    "inputSpec": "Line 1: A run-length encoded string.",
    "outputSpec": "Line 1: The decoded string.",
    "source": "builtin",
    "testcases": [
      {
        "id": "run-length-decode-0",
        "title": "basic",
        "input": "a3b2c1",
        "expectedOutput": "aaabbc",
        "hidden": false
      },
      {
        "id": "run-length-decode-1",
        "title": "all singles",
        "input": "x1y1z1",
        "expectedOutput": "xyz",
        "hidden": false
      },
      {
        "id": "run-length-decode-2",
        "title": "long run",
        "input": "w10",
        "expectedOutput": "wwwwwwwwww",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "s",
            "type": "string"
          }
        ]
      }
    ]
  },
  {
    "id": "prime-factors",
    "title": "Prime Factorization",
    "difficulty": "expert",
    "statement": "Print the prime factorization of n as a space-separated list of primes in ascending order (with repetition).",
    "constraints": "2 <= `n` <= 1000000",
    "inputSpec": "Line 1: A single integer `n` >= 2.",
    "outputSpec": "Line 1: The prime factors of `n` in ascending order, space-separated.",
    "source": "builtin",
    "testcases": [
      {
        "id": "prime-factors-0",
        "title": "twelve",
        "input": "12",
        "expectedOutput": "2 2 3",
        "hidden": false
      },
      {
        "id": "prime-factors-1",
        "title": "prime",
        "input": "7",
        "expectedOutput": "7",
        "hidden": false
      },
      {
        "id": "prime-factors-2",
        "title": "sixty",
        "input": "60",
        "expectedOutput": "2 2 3 5",
        "hidden": true
      },
      {
        "id": "prime-factors-3",
        "title": "large composite",
        "input": "999984",
        "expectedOutput": "2 2 2 2 3 83 251",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      }
    ]
  },
  {
    "id": "luhn-check",
    "title": "Luhn Check",
    "difficulty": "expert",
    "statement": "Apply the Luhn algorithm to a string of digits. Print YES if the check digit is valid, or NO otherwise.",
    "constraints": "The input is a string of 8 to 19 digits.",
    "inputSpec": "Line 1: A string of digits (no spaces).",
    "outputSpec": "Line 1: YES if valid under the Luhn algorithm, otherwise NO.",
    "source": "builtin",
    "testcases": [
      {
        "id": "luhn-check-0",
        "title": "valid",
        "input": "4532015112830366",
        "expectedOutput": "YES",
        "hidden": false
      },
      {
        "id": "luhn-check-1",
        "title": "invalid",
        "input": "1234567890123456",
        "expectedOutput": "NO",
        "hidden": false
      },
      {
        "id": "luhn-check-2",
        "title": "classic test",
        "input": "79927398713",
        "expectedOutput": "YES",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "s",
            "type": "string"
          }
        ]
      }
    ]
  },
  {
    "id": "rotate-array",
    "title": "Rotate Array",
    "difficulty": "expert",
    "statement": "Rotate an array of n integers k positions to the right (elements shifted off the right end wrap to the front).",
    "constraints": "1 <= `n` <= 1000; 0 <= `k` <= 10000; each array value is between -1000000 and 1000000.",
    "inputSpec": "Line 1: Two integers `n` and `k`. Line 2: `n` space-separated integers.",
    "outputSpec": "Line 1: The rotated array, space-separated.",
    "source": "builtin",
    "testcases": [
      {
        "id": "rotate-array-0",
        "title": "rotate two",
        "input": "5 2\n1 2 3 4 5",
        "expectedOutput": "4 5 1 2 3",
        "hidden": false
      },
      {
        "id": "rotate-array-1",
        "title": "rotate one",
        "input": "3 1\n7 8 9",
        "expectedOutput": "9 7 8",
        "hidden": false
      },
      {
        "id": "rotate-array-2",
        "title": "full rotation",
        "input": "4 4\n1 2 3 4",
        "expectedOutput": "1 2 3 4",
        "hidden": true
      },
      {
        "id": "rotate-array-3",
        "title": "large rotation",
        "input": "5 12\n-1 0 1 2 3",
        "expectedOutput": "2 3 -1 0 1",
        "hidden": true
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          },
          {
            "name": "k",
            "type": "int"
          }
        ]
      },
      {
        "kind": "list",
        "name": "a",
        "type": "int"
      }
    ]
  },
  {
    "id": "sort-numbers",
    "title": "Sort Numbers",
    "difficulty": "easy",
    "statement": "Read n integers and print them in ascending order. Output is compared by tokens, so spacing/newlines do not matter.",
    "constraints": "1 <= `n` <= 1000; each integer is between -1000000 and 1000000.",
    "inputSpec": "Line 1: The integer `n`. Line 2: `n` space-separated integers.",
    "outputSpec": "The `n` integers in ascending order.",
    "source": "builtin",
    "testcases": [
      {
        "id": "sort-numbers-0",
        "title": "mixed",
        "input": "5\n3 1 4 1 5",
        "expectedOutput": "1 1 3 4 5",
        "hidden": false,
        "match": "tokens"
      },
      {
        "id": "sort-numbers-1",
        "title": "descending",
        "input": "3\n9 8 7",
        "expectedOutput": "7 8 9",
        "hidden": false,
        "match": "tokens"
      },
      {
        "id": "sort-numbers-2",
        "title": "negatives",
        "input": "5\n0 -1 3 -1 2",
        "expectedOutput": "-1 -1 0 2 3",
        "hidden": true,
        "match": "tokens"
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "n",
            "type": "int"
          }
        ]
      },
      {
        "kind": "list",
        "name": "a",
        "type": "int"
      }
    ]
  },
  {
    "id": "circle-area",
    "title": "Circle Area",
    "difficulty": "medium",
    "statement": "Given a circle of integer radius r, print its area (pi * r^2). Use a standard pi value if your language provides one; any numeric answer within tolerance is accepted.",
    "constraints": "1 <= `r` <= 1000",
    "inputSpec": "Line 1: A single integer `r`.",
    "outputSpec": "Line 1: The area, within a small tolerance.",
    "source": "builtin",
    "testcases": [
      {
        "id": "circle-area-0",
        "title": "unit",
        "input": "1",
        "expectedOutput": "3.141592653589793",
        "hidden": false,
        "match": "float"
      },
      {
        "id": "circle-area-1",
        "title": "radius two",
        "input": "2",
        "expectedOutput": "12.566370614359172",
        "hidden": false,
        "match": "float"
      },
      {
        "id": "circle-area-2",
        "title": "radius ten",
        "input": "10",
        "expectedOutput": "314.1592653589793",
        "hidden": true,
        "match": "float"
      }
    ],
    "ioFormat": [
      {
        "kind": "read",
        "vars": [
          {
            "name": "r",
            "type": "int"
          }
        ]
      }
    ]
  }
]
