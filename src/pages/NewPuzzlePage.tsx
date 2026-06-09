/** Authoring form for creating a custom puzzle saved to localStorage. */
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Panel } from '../components/Panel'
import { MIN_TESTCASES_PER_PUZZLE, MIN_TITLE_LENGTH } from '../config/constants'
import { saveUserPuzzle } from '../puzzles/store'
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  type Difficulty,
  type Puzzle,
  type TestCase,
} from '../puzzles/types'
import { ROUTES, solvePath } from '../routes'
import { ui } from '../theme/ui'

interface DraftCase {
  readonly title: string
  readonly input: string
  readonly expectedOutput: string
  readonly hidden: boolean
}

const EMPTY_CASE: DraftCase = {
  title: '',
  input: '',
  expectedOutput: '',
  hidden: false,
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
}

function validate(title: string, cases: readonly DraftCase[]): string[] {
  const errors: string[] = []
  if (title.trim().length < MIN_TITLE_LENGTH) {
    errors.push(
      `Title must be at least ${String(MIN_TITLE_LENGTH)} characters.`,
    )
  }
  const usable = cases.filter((testCase) => testCase.input.trim().length > 0)
  if (usable.length < MIN_TESTCASES_PER_PUZZLE) {
    errors.push(
      `Add at least ${String(MIN_TESTCASES_PER_PUZZLE)} test case with input.`,
    )
  }
  return errors
}

export function NewPuzzlePage(): React.JSX.Element {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner')
  const [statement, setStatement] = useState('')
  const [constraints, setConstraints] = useState('')
  const [inputSpec, setInputSpec] = useState('')
  const [outputSpec, setOutputSpec] = useState('')
  const [cases, setCases] = useState<readonly DraftCase[]>([EMPTY_CASE])
  const [errors, setErrors] = useState<readonly string[]>([])

  const updateCase = useCallback((index: number, patch: Partial<DraftCase>) => {
    setCases((prev) =>
      prev.map((testCase, i) =>
        i === index ? { ...testCase, ...patch } : testCase,
      ),
    )
  }, [])

  const addCase = useCallback(() => {
    setCases((prev) => [...prev, EMPTY_CASE])
  }, [])

  const removeCase = useCallback((index: number) => {
    setCases((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const save = useCallback(() => {
    const found = validate(title, cases)
    if (found.length > 0) {
      setErrors(found)
      return
    }
    const id = `${slugify(title)}-${crypto.randomUUID()}`
    const testcases: readonly TestCase[] = cases
      .filter((testCase) => testCase.input.trim().length > 0)
      .map((testCase, index) => ({
        id: `${id}-${String(index)}`,
        title:
          testCase.title.trim().length > 0
            ? testCase.title
            : `case ${String(index + 1)}`,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        hidden: testCase.hidden,
      }))
    const puzzle: Puzzle = {
      id,
      title: title.trim(),
      difficulty,
      statement,
      constraints,
      inputSpec,
      outputSpec,
      testcases,
      source: 'user',
    }
    saveUserPuzzle(puzzle)
    void navigate(solvePath(id))
  }, [
    title,
    difficulty,
    statement,
    constraints,
    inputSpec,
    outputSpec,
    cases,
    navigate,
  ])

  return (
    <div className={ui.page}>
      <div>
        <h1 className={ui.pageTitle}>New Puzzle</h1>
        <p className={ui.pageSubtitle}>
          Author a puzzle with its own test cases. It is saved in your browser
          and appears alongside the built-in bank.
        </p>
      </div>

      {errors.length > 0 && (
        <div className={ui.bannerError}>{errors.join(' ')}</div>
      )}

      <Panel title="Details">
        <div className={ui.page}>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="puzzle-title">
              Title
            </label>
            <input
              id="puzzle-title"
              className={ui.input}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
              }}
            />
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="puzzle-difficulty">
              Difficulty
            </label>
            <select
              id="puzzle-difficulty"
              className={ui.select}
              value={difficulty}
              onChange={(event) => {
                setDifficulty(event.target.value as Difficulty)
              }}
            >
              {DIFFICULTIES.map((level) => (
                <option key={level} value={level}>
                  {DIFFICULTY_LABELS[level]}
                </option>
              ))}
            </select>
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="puzzle-statement">
              Statement
            </label>
            <textarea
              id="puzzle-statement"
              className={ui.textarea}
              value={statement}
              onChange={(event) => {
                setStatement(event.target.value)
              }}
            />
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="puzzle-input-spec">
              Input specification
            </label>
            <textarea
              id="puzzle-input-spec"
              className={ui.textarea}
              value={inputSpec}
              onChange={(event) => {
                setInputSpec(event.target.value)
              }}
            />
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="puzzle-output-spec">
              Output specification
            </label>
            <textarea
              id="puzzle-output-spec"
              className={ui.textarea}
              value={outputSpec}
              onChange={(event) => {
                setOutputSpec(event.target.value)
              }}
            />
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="puzzle-constraints">
              Constraints
            </label>
            <textarea
              id="puzzle-constraints"
              className={ui.textarea}
              value={constraints}
              onChange={(event) => {
                setConstraints(event.target.value)
              }}
            />
          </div>
        </div>
      </Panel>

      <Panel
        title="Test cases"
        actions={
          <button type="button" className={ui.btnSecondary} onClick={addCase}>
            Add case
          </button>
        }
      >
        <div className={ui.page}>
          {cases.map((testCase, index) => (
            <div key={index} className={ui.panelPadded}>
              <div className={ui.toolbar}>
                <input
                  className={ui.input}
                  placeholder="Case title"
                  value={testCase.title}
                  onChange={(event) => {
                    updateCase(index, { title: event.target.value })
                  }}
                />
                <label className={ui.hint}>
                  <input
                    type="checkbox"
                    checked={testCase.hidden}
                    onChange={(event) => {
                      updateCase(index, { hidden: event.target.checked })
                    }}
                  />{' '}
                  hidden
                </label>
                <div className={ui.spacer} />
                <button
                  type="button"
                  className={ui.btnDanger}
                  onClick={() => {
                    removeCase(index)
                  }}
                >
                  Remove
                </button>
              </div>
              <div className={ui.field}>
                <label className={ui.label}>Input (stdin)</label>
                <textarea
                  aria-label={`Input for case ${String(index + 1)}`}
                  className={ui.textarea}
                  value={testCase.input}
                  onChange={(event) => {
                    updateCase(index, { input: event.target.value })
                  }}
                />
              </div>
              <div className={ui.field}>
                <label className={ui.label}>Expected output (stdout)</label>
                <textarea
                  aria-label={`Expected output for case ${String(index + 1)}`}
                  className={ui.textarea}
                  value={testCase.expectedOutput}
                  onChange={(event) => {
                    updateCase(index, { expectedOutput: event.target.value })
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className={ui.toolbar}>
        <button type="button" className={ui.btnPrimary} onClick={save}>
          Save puzzle
        </button>
        <button
          type="button"
          className={ui.btnGhost}
          onClick={() => {
            void navigate(ROUTES.home)
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
