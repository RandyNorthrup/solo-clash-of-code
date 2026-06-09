/**
 * Styled constants. Components never inline raw class strings — every visual
 * style is named here and referenced as `ui.<name>`. This keeps styling DRY,
 * reviewable in one place, and consistent across the app.
 */
import type { Difficulty } from '../puzzles/types'

export const ui = {
  // App shell & layout
  appShell: 'flex min-h-screen flex-col bg-[#0d1117] text-[#e6edf3]',
  header:
    'flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-6 py-3',
  brand: 'flex items-center gap-2 text-lg font-semibold tracking-tight',
  brandMark: 'text-xl',
  nav: 'flex items-center gap-1',
  navLink:
    'rounded-md px-3 py-1.5 text-sm font-medium text-[#9da7b3] transition-colors hover:bg-[#21262d] hover:text-[#e6edf3]',
  navLinkActive:
    'rounded-md px-3 py-1.5 text-sm font-medium bg-[#21262d] text-[#e6edf3]',
  main: 'mx-auto w-full max-w-6xl flex-1 px-6 py-6',
  page: 'flex flex-col gap-6',
  pageTitle: 'text-2xl font-semibold tracking-tight',
  pageSubtitle: 'text-sm text-[#9da7b3]',
  sectionTitle: 'text-sm font-semibold uppercase tracking-wide text-[#9da7b3]',

  // Panels & cards
  panel: 'rounded-lg border border-[#30363d] bg-[#161b22]',
  panelPadded: 'rounded-lg border border-[#30363d] bg-[#161b22] p-4',
  panelHeader:
    'flex items-center justify-between border-b border-[#30363d] px-4 py-2.5 text-sm font-semibold',
  panelBody: 'p-4',

  // Buttons
  btnPrimary:
    'inline-flex items-center justify-center gap-2 rounded-md bg-[#238636] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:opacity-50',
  btnSecondary:
    'inline-flex items-center justify-center gap-2 rounded-md border border-[#30363d] bg-[#21262d] px-4 py-2 text-sm font-medium text-[#e6edf3] transition-colors hover:bg-[#30363d] disabled:cursor-not-allowed disabled:opacity-50',
  btnGhost:
    'inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-[#9da7b3] transition-colors hover:bg-[#21262d] hover:text-[#e6edf3]',
  btnDanger:
    'inline-flex items-center justify-center gap-2 rounded-md border border-[#f8514933] bg-[#21262d] px-3 py-1.5 text-sm font-medium text-[#f85149] transition-colors hover:bg-[#f8514922]',

  // Forms
  field: 'flex flex-col gap-1.5',
  label: 'text-sm font-medium text-[#e6edf3]',
  hint: 'text-xs text-[#9da7b3]',
  input:
    'rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#58a6ff]',
  textarea:
    'min-h-24 rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 font-mono text-sm text-[#e6edf3] outline-none focus:border-[#58a6ff]',
  select:
    'rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#58a6ff]',

  // Puzzle list
  puzzleGrid: 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3',
  puzzleCard:
    'flex flex-col gap-3 rounded-lg border border-[#30363d] bg-[#161b22] p-4 text-left transition-colors hover:border-[#58a6ff]',
  puzzleCardTitle:
    'self-start text-left text-base font-semibold transition-colors hover:text-[#58a6ff]',
  puzzleCardMeta: 'flex items-center justify-between',
  puzzleCardBest: 'font-mono text-xs text-[#3fb950]',
  puzzleCardBestEmpty: 'font-mono text-xs text-[#9da7b3]',

  // Badges
  badgeBase:
    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
  tag: 'inline-flex items-center rounded-md bg-[#21262d] px-2 py-0.5 text-xs font-medium text-[#9da7b3]',

  // Solve view
  solveGrid: 'grid grid-cols-1 gap-4 lg:grid-cols-2',
  statement: 'flex flex-col gap-4 text-sm leading-relaxed text-[#c9d1d9]',
  statementText: 'whitespace-pre-line text-sm leading-relaxed text-[#c9d1d9]',
  statementHeading:
    'text-xs font-semibold uppercase tracking-wide text-[#9da7b3]',
  statementBlock: 'flex flex-col gap-1',
  codeInline:
    'rounded bg-[#21262d] px-1.5 py-0.5 font-mono text-xs text-[#e6edf3]',
  editorWrap: 'overflow-hidden rounded-lg border border-[#30363d]',
  toolbar: 'flex flex-wrap items-center gap-2',
  spacer: 'flex-1',

  // Console / output
  consoleBox:
    'max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-[#0d1117] p-3 font-mono text-xs text-[#c9d1d9]',
  consoleMuted: 'font-mono text-xs text-[#9da7b3]',

  // Test case rows
  testRow:
    'flex items-center justify-between rounded-md border px-3 py-2 text-sm',
  testRowIdle: 'border-[#30363d] bg-[#0d1117]',
  testRowPass: 'border-[#238636] bg-[#23863622]',
  testRowFail: 'border-[#f85149] bg-[#f8514922]',
  testRowRunning: 'border-[#58a6ff] bg-[#58a6ff22]',
  testStatusPass: 'font-mono text-xs font-semibold text-[#3fb950]',
  testStatusFail: 'font-mono text-xs font-semibold text-[#f85149]',
  testStatusTimeout: 'font-mono text-xs font-semibold text-[#d29922]',
  testStatusRunning: 'font-mono text-xs font-semibold text-[#58a6ff]',

  // Clock / timer
  clock: 'font-mono text-lg font-semibold tabular-nums',
  clockNormal: 'text-[#e6edf3]',
  clockWarning: 'text-[#d29922]',
  clockDanger: 'text-[#f85149]',
  clockLabel: 'text-xs uppercase tracking-wide text-[#9da7b3]',

  // Banners
  bannerSuccess:
    'rounded-md border border-[#238636] bg-[#23863622] px-4 py-3 text-sm text-[#3fb950]',
  bannerError:
    'rounded-md border border-[#f85149] bg-[#f8514922] px-4 py-3 text-sm text-[#f85149]',
  bannerInfo:
    'rounded-md border border-[#30363d] bg-[#0d1117] px-4 py-3 text-sm text-[#9da7b3]',

  // Stats page
  statsSection: 'flex flex-col gap-3',
  statsGrid: 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5',
  statsCard:
    'flex flex-col gap-1 rounded-lg border border-[#30363d] bg-[#161b22] p-4',
  statNumber: 'text-2xl font-mono font-semibold tabular-nums text-[#e6edf3]',
  statLabel: 'text-xs uppercase tracking-wide text-[#9da7b3]',
  statBest: 'font-mono text-xs tabular-nums text-[#3fb950]',
  statMedian: 'font-mono text-xs tabular-nums text-[#9da7b3]',
  statsBars: 'flex flex-col gap-2',
  statBarRow: 'flex items-center gap-2 text-sm',
  statBarLabel: 'w-28 truncate text-[#e6edf3]',
  statBarBg: 'h-2 flex-1 overflow-hidden rounded-full bg-[#21262d]',
  statBarFill: 'h-full rounded-full bg-[#1f6feb]',
  statBarCount: 'w-8 text-right font-mono text-xs tabular-nums text-[#9da7b3]',

  // Sparkline
  sparklineWrap: 'flex flex-col gap-1',
  sparklineLabel: 'text-xs uppercase tracking-wide text-[#9da7b3]',

  // Misc
  centeredState:
    'flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center',
  link: 'text-[#58a6ff] hover:underline',
} as const

/** Difficulty-specific badge colors, keyed by difficulty. */
export const difficultyBadge: Record<Difficulty, string> = {
  beginner: 'bg-[#23863622] text-[#3fb950]',
  easy: 'bg-[#1f6feb22] text-[#58a6ff]',
  medium: 'bg-[#9e6a0322] text-[#d29922]',
  hard: 'bg-[#db6d2822] text-[#db6d28]',
  expert: 'bg-[#f8514922] text-[#f85149]',
}
