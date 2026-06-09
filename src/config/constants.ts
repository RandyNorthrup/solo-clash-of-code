/**
 * Central configuration. No magic numbers or stray literals live in feature
 * code — they are all named here and imported where needed.
 */

/** Time conversion factors. */
export const MILLISECONDS_PER_SECOND = 1000
export const SECONDS_PER_MINUTE = 60

/** Base used for tenths-of-a-second display in the stopwatch. */
export const DECIMAL_BASE = 10

/** Path prefix for the Vite dev proxy (see vite.config.ts). In production,
 *  judge0.ts derives the base URL from VITE_JUDGE0_URL instead. */
export const JUDGE0_PROXY_PATH = '/judge0'

/** Polling cadence while waiting for a Judge0 submission to finish. */
export const JUDGE0_POLL_INTERVAL_MS = 400
export const JUDGE0_MAX_POLL_ATTEMPTS = 50

/** Per-submission sandbox resource limits sent to Judge0. */
export const SUBMISSION_CPU_TIME_LIMIT_SEC = 5
export const SUBMISSION_WALL_TIME_LIMIT_SEC = 10
export const SUBMISSION_MEMORY_LIMIT_KB = 256_000

/** Countdown options (in minutes) offered by the timed "beat the clock" mode. */
export const TIMED_MODE_MINUTE_OPTIONS = [5, 10, 15, 30] as const
export const DEFAULT_TIMED_MODE_MINUTES = 10

/** Wall-clock tick interval for the on-screen stopwatch / countdown. */
export const CLOCK_TICK_INTERVAL_MS = 100

/** Countdown color thresholds (seconds remaining). */
export const TIMED_WARNING_THRESHOLD_SEC = 60
export const TIMED_DANGER_THRESHOLD_SEC = 15

/** localStorage namespacing. */
export const STORAGE_KEY_USER_PUZZLES = 'coding-game:user-puzzles:v1'
export const STORAGE_KEY_BEST_TIMES = 'coding-game:best-times:v1'
export const STORAGE_KEY_DRAFTS = 'coding-game:drafts:v1'

/** Editor defaults. */
export const EDITOR_FONT_SIZE_PX = 14
export const EDITOR_TAB_SIZE = 2
export const EDITOR_MIN_HEIGHT_PX = 320

/** Puzzle editor authoring limits. */
export const MIN_TESTCASES_PER_PUZZLE = 1
export const MIN_TITLE_LENGTH = 3

/** Number formatting. */
export const TIME_PAD_LENGTH = 2
export const TIME_PAD_CHAR = '0'

/** Tolerance for the 'float' output checker (absolute and relative). */
export const FLOAT_MATCH_EPSILON = 1e-6

/** Maximum submissions per Judge0 batch request (Judge0 CE default cap). */
export const JUDGE0_BATCH_SIZE = 20

/** Solve history: per-entry record of every puzzle completion. */
export const STORAGE_KEY_SOLVE_HISTORY = 'coding-game:solve-history:v1'

/** Maximum data-points shown in the per-puzzle sparkline. */
export const SPARKLINE_MAX_POINTS = 10

/** Minimum data-points required to render a sparkline (need 2 endpoints). */
export const SPARKLINE_MIN_POINTS = 2

/** SVG dimensions for the sparkline mini-chart (px, used as viewBox units). */
export const SPARKLINE_SVG_WIDTH = 120
export const SPARKLINE_SVG_HEIGHT = 36

/** Divisor for median and midpoint calculations. */
export const HALF_DIVISOR = 2

/** Multiplier to convert a [0, 1] ratio to a percentage value. */
export const PERCENT_FACTOR = 100

/** Schema version tag written into exported puzzle JSON files. */
export const PUZZLE_EXPORT_SCHEMA_VERSION = 1

/** Duration (ms) to show the "Copied!" feedback label after sharing a puzzle. */
export const COPY_FEEDBACK_DURATION_MS = 2000

/** Indentation width for pretty-printed JSON exports. */
export const JSON_INDENT_SPACES = 2
