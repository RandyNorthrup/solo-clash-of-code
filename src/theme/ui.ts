/**
 * Styled constants. Components never inline raw class strings — every visual
 * style is named here and referenced as `ui.<name>`. This keeps styling DRY,
 * reviewable in one place, and consistent across the app.
 *
 * Palette: Clash-of-Code neutral dark. Near-black panels (`#1a1c1f` shell,
 * `#23262b` panels), muted-gray section labels, jester gold (`#e9a648`) and
 * purple (`#8f79e7`) brand accents, orange/blue variable chips, green submit.
 */
import type { Difficulty } from '../puzzles/types'

export const ui = {
  // App shell & layout
  appShell: 'flex min-h-screen flex-col bg-[#1a1c1f] text-[#e6e8eb]',
  header:
    'flex items-center justify-between border-b border-[#2a2d33] bg-[#16181b] px-4 py-3 sm:px-6',
  brand:
    'flex shrink-0 items-center gap-2 whitespace-nowrap text-lg font-bold tracking-tight text-[#e6e8eb]',
  brandMark: 'flex size-7 items-center justify-center text-[#e9a648]',
  brandWord: 'text-[#e9a648]',
  nav: 'flex items-center gap-1 overflow-x-auto',
  navLink:
    'whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-[#9aa0a8] transition-colors hover:bg-[#23262b] hover:text-[#e6e8eb]',
  navLinkActive:
    'whitespace-nowrap rounded-md bg-[#23262b] px-3 py-1.5 text-sm font-semibold text-[#e9a648]',
  main: 'mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 sm:py-6',
  page: 'flex flex-col gap-6',
  pageTitle: 'text-2xl font-semibold tracking-tight text-[#e6e8eb]',
  pageSubtitle: 'text-sm text-[#9aa0a8]',
  sectionTitle: 'text-sm font-semibold uppercase tracking-wide text-[#7f8893]',
  subtleText: 'text-sm text-[#9aa0a8]',

  // Panels & cards
  panel: 'rounded-lg border border-[#2f333a] bg-[#23262b]',
  panelPadded: 'rounded-lg border border-[#2f333a] bg-[#23262b] p-4',
  panelHeader:
    'flex items-center justify-between gap-3 border-b border-[#2f333a] bg-[#1f2226] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#9aa0a8]',
  panelBody: 'p-4',

  // Buttons
  btnPrimary:
    'inline-flex items-center justify-center gap-2 rounded-md bg-[#2f9e44] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#37b24d] disabled:cursor-not-allowed disabled:opacity-50',
  btnSecondary:
    'inline-flex items-center justify-center gap-2 rounded-md border border-[#3a3f47] bg-[#2b2f36] px-4 py-2 text-sm font-medium text-[#e6e8eb] transition-colors hover:bg-[#343941] disabled:cursor-not-allowed disabled:opacity-50',
  btnGhost:
    'inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-[#9aa0a8] transition-colors hover:bg-[#23262b] hover:text-[#e6e8eb]',
  btnDanger:
    'inline-flex items-center justify-center gap-2 rounded-md border border-[#f0544f33] bg-[#2b2f36] px-3 py-1.5 text-sm font-medium text-[#f0544f] transition-colors hover:bg-[#f0544f22]',
  btnHero:
    'inline-flex items-center justify-center gap-2 rounded-md bg-[#e9a648] px-5 py-3 text-base font-bold text-[#1a1c1f] transition-colors hover:bg-[#f0b65f] disabled:cursor-not-allowed disabled:opacity-50',

  // Forms
  field: 'flex flex-col gap-1.5',
  label: 'text-sm font-medium text-[#e6e8eb]',
  hint: 'text-xs text-[#9aa0a8]',
  input:
    'rounded-md border border-[#2f333a] bg-[#15171a] px-3 py-2 text-sm text-[#e6e8eb] outline-none focus:border-[#e9a648]',
  textarea:
    'min-h-24 rounded-md border border-[#2f333a] bg-[#15171a] px-3 py-2 font-mono text-sm text-[#e6e8eb] outline-none focus:border-[#e9a648]',
  select:
    'rounded-md border border-[#2f333a] bg-[#15171a] px-3 py-2 text-sm text-[#e6e8eb] outline-none focus:border-[#e9a648]',
  fileInput: 'hidden',

  // Home / lobby setup
  startGrid:
    'grid grid-cols-1 gap-4 border-b border-[#2f333a] pb-4 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(22rem,1.2fr)]',
  startPanel: 'flex flex-col gap-4',
  segmented: 'grid grid-cols-2 gap-2 sm:grid-cols-5',
  segment:
    'rounded-md border border-[#2f333a] bg-[#15171a] px-3 py-2 text-sm font-medium text-[#9aa0a8] transition-colors hover:border-[#e9a648] hover:text-[#e6e8eb]',
  segmentActive:
    'rounded-md border border-[#e9a648] bg-[#e9a64818] px-3 py-2 text-sm font-semibold text-[#e9a648]',
  quickActions: 'grid grid-cols-1 gap-2 sm:grid-cols-2',
  lobbyPanel:
    'rounded-lg border border-[#2f333a] bg-[#23262b] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)]',
  lobbyHeader:
    'flex flex-col gap-4 border-b border-[#2f333a] pb-4 lg:flex-row lg:items-center lg:justify-between',
  lobbyTitleBlock: 'flex flex-col gap-1',
  lobbyEyebrow: 'text-xs font-semibold uppercase tracking-wide text-[#e9a648]',
  lobbyStats: 'grid grid-cols-3 gap-2 sm:min-w-96',
  lobbyStat:
    'rounded-md border border-[#2f333a] bg-[#15171a] px-3 py-2 text-center',
  lobbyStatValue: 'font-mono text-lg font-semibold tabular-nums text-[#e6e8eb]',
  lobbyStatLabel: 'text-xs uppercase tracking-wide text-[#9aa0a8]',
  modeGrid: 'grid grid-cols-1 gap-3 pt-4 md:grid-cols-3',
  modeCard:
    'flex min-h-28 flex-col items-start gap-2 rounded-md border border-[#2f333a] bg-[#15171a] p-4 text-left transition-colors hover:border-[#e9a648]',
  modeCardActive:
    'flex min-h-28 flex-col items-start gap-2 rounded-md border border-[#e9a648] bg-[#e9a64814] p-4 text-left transition-colors hover:border-[#f0b65f]',
  modeTitle: 'text-base font-semibold text-[#e6e8eb]',
  modeMeta: 'text-sm leading-relaxed text-[#9aa0a8]',
  minuteRail: 'flex flex-wrap gap-2 pt-3',
  accountSummary:
    'rounded-md border border-[#2f333a] bg-[#15171a] px-3 py-2 text-sm text-[#9aa0a8]',

  // Puzzle list
  puzzleGrid: 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3',
  puzzleCard:
    'flex min-h-32 flex-col gap-3 rounded-lg border border-[#2f333a] bg-[#23262b] p-4 text-left transition-colors hover:border-[#e9a648]',
  puzzleCardTitle:
    'self-start text-left text-base font-semibold transition-colors hover:text-[#e9a648]',
  puzzleCardMeta: 'flex items-center justify-between',
  puzzleCardBest: 'font-mono text-xs text-[#3fb950]',
  puzzleCardBestEmpty: 'font-mono text-xs text-[#9aa0a8]',

  // Badges
  badgeBase:
    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
  tag: 'inline-flex items-center rounded-md bg-[#2b2f36] px-2 py-0.5 text-xs font-medium text-[#9aa0a8]',

  // Variable chips (CoC-style inline variable highlights in specs/statements)
  chipOrange:
    'mx-0.5 inline-flex items-center rounded bg-[#f0a24b22] px-1.5 font-mono text-xs font-semibold text-[#f0a24b]',
  chipBlue:
    'mx-0.5 inline-flex items-center rounded bg-[#5aa6e822] px-1.5 font-mono text-xs font-semibold text-[#5aa6e8]',

  // Solve view
  solveHeader:
    'flex flex-col gap-3 rounded-lg border border-[#2f333a] bg-[#16181b] px-4 py-3 lg:flex-row lg:items-center lg:justify-between',
  solveTitleCluster: 'flex flex-wrap items-center gap-3',
  solveModeLabel: 'text-sm font-semibold text-[#e6e8eb]',
  solveMetaRail: 'flex flex-wrap items-center gap-4',
  solveWorkbench:
    'grid grid-cols-1 gap-3 xl:grid-cols-[minmax(22rem,0.9fr)_minmax(36rem,1.1fr)]',
  solveGrid:
    'grid grid-cols-1 gap-3 xl:grid-cols-[minmax(22rem,0.9fr)_minmax(36rem,1.1fr)]',
  editorStack: 'flex flex-col gap-3',
  solveBottomRail: 'grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1.15fr_18rem]',
  statement: 'flex flex-col gap-4 text-sm leading-relaxed text-[#c5cad1]',
  statementText: 'whitespace-pre-line text-sm leading-relaxed text-[#c5cad1]',
  statementHeading:
    'text-xs font-semibold uppercase tracking-wide text-[#7f8893]',
  statementBlock: 'flex flex-col gap-1',
  codeInline:
    'rounded bg-[#2b2f36] px-1.5 py-0.5 font-mono text-xs text-[#e6e8eb]',
  editorWrap: 'overflow-hidden rounded-lg border border-[#2f333a]',
  toolbar: 'flex flex-wrap items-center gap-2',
  spacer: 'flex-1',

  // Contributor hero header (statement panel top band)
  heroHeader:
    'flex items-center gap-3 rounded-md border border-[#2f333a] bg-gradient-to-r from-[#1b2a1f] to-[#15171a] px-4 py-3',
  heroAvatar:
    'flex size-10 shrink-0 items-center justify-center rounded-md bg-[#e9a64822] text-[#e9a648]',
  heroTitleBlock: 'flex min-w-0 flex-col',
  heroTitle: 'truncate text-sm font-semibold text-[#e6e8eb]',
  heroMeta: 'truncate text-xs text-[#9aa0a8]',

  // Example block (visible samples as Input/Output columns)
  exampleGrid: 'grid grid-cols-1 gap-2 sm:grid-cols-2',
  exampleCol: 'flex flex-col gap-1',
  exampleLabel: 'text-xs font-semibold uppercase tracking-wide text-[#7f8893]',
  examplePre:
    'overflow-auto whitespace-pre-wrap rounded-md border border-[#2f333a] bg-[#15171a] p-2 font-mono text-xs text-[#c5cad1]',

  // Reverse mode
  reverseHint:
    'rounded-md border border-[#8f79e7] bg-[#8f79e718] px-4 py-3 text-sm text-[#b6a7f0]',

  // Action panel
  actionStack: 'flex flex-col gap-3',
  actionButtons: 'grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1',
  metricGrid: 'grid grid-cols-3 gap-2',
  metricBox: 'rounded-md border border-[#2f333a] bg-[#15171a] px-3 py-2',
  metricValue: 'font-mono text-base font-semibold tabular-nums text-[#e6e8eb]',
  metricLabel: 'text-xs uppercase tracking-wide text-[#9aa0a8]',
  codeSizeBox:
    'flex items-center justify-between rounded-md border border-[#e9a64855] bg-[#e9a64814] px-3 py-2',
  codeSizeLabel: 'text-xs font-semibold uppercase tracking-wide text-[#e9a648]',
  codeSizeValue:
    'font-mono text-base font-semibold tabular-nums text-[#e9a648]',
  playerRow:
    'flex items-center justify-between gap-3 rounded-md border border-[#2f333a] bg-[#15171a] px-3 py-2',
  playerIdentity: 'flex min-w-0 items-center gap-2',
  playerAvatar:
    'flex size-8 shrink-0 items-center justify-center rounded-md bg-[#e9a64822] font-mono text-xs font-semibold text-[#e9a648]',
  playerName: 'truncate text-sm font-semibold text-[#e6e8eb]',
  playerStatus: 'text-right text-xs uppercase tracking-wide text-[#9aa0a8]',

  // Test cases (CoC-style numbered rows with a per-case play button)
  testListCompact: 'flex flex-col gap-2',
  testPlayRow:
    'flex items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors',
  testNum: 'font-mono text-xs font-semibold text-[#7f8893]',
  testTitle: 'min-w-0 flex-1 truncate text-[#e6e8eb]',
  testPlayBtn:
    'inline-flex shrink-0 items-center gap-1 rounded border border-[#3a3f47] bg-[#2b2f36] px-2 py-1 text-xs font-medium text-[#c5cad1] transition-colors hover:bg-[#343941] disabled:cursor-not-allowed disabled:opacity-50',

  // Console / output
  consoleBox:
    'max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-[#15171a] p-3 font-mono text-xs text-[#c5cad1]',
  consoleMuted: 'font-mono text-xs text-[#9aa0a8]',

  // Test case row tones (shared border/bg for status rows)
  testRow:
    'flex items-center justify-between rounded-md border px-3 py-2 text-sm',
  testRowIdle: 'border-[#2f333a] bg-[#15171a]',
  testRowPass: 'border-[#2f9e44] bg-[#2f9e4422]',
  testRowFail: 'border-[#f0544f] bg-[#f0544f22]',
  testRowRunning: 'border-[#5aa6e8] bg-[#5aa6e822]',
  testStatusPass: 'font-mono text-xs font-semibold text-[#3fb950]',
  testStatusFail: 'font-mono text-xs font-semibold text-[#f0544f]',
  testStatusTimeout: 'font-mono text-xs font-semibold text-[#d6a531]',
  testStatusRunning: 'font-mono text-xs font-semibold text-[#5aa6e8]',

  // Clock / timer (CoC-style "12MN 27SC")
  clock: 'font-mono text-lg font-semibold tabular-nums',
  clockNormal: 'text-[#e6e8eb]',
  clockWarning: 'text-[#d6a531]',
  clockDanger: 'text-[#f0544f]',
  clockLabel: 'text-xs uppercase tracking-wide text-[#9aa0a8]',
  clockUnit: 'text-[0.6em] font-semibold align-top',
  clockRow: 'flex items-center gap-1.5',
  clockIcon: 'text-[#e9a648]',

  // Banners
  bannerSuccess:
    'rounded-md border border-[#2f9e44] bg-[#2f9e4422] px-4 py-3 text-sm text-[#3fb950]',
  bannerError:
    'rounded-md border border-[#f0544f] bg-[#f0544f22] px-4 py-3 text-sm text-[#f0544f]',
  bannerInfo:
    'rounded-md border border-[#2f333a] bg-[#15171a] px-4 py-3 text-sm text-[#9aa0a8]',

  // Modal / overlays
  modalBackdrop:
    'fixed inset-0 z-50 flex items-center justify-center bg-[#0d0e10cc] p-4 backdrop-blur-sm',
  modalPanel:
    'w-full max-w-md rounded-lg border border-[#2f333a] bg-[#23262b] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.55)]',
  buildGraphic: 'flex items-end justify-center gap-2 py-5',
  buildBar: 'h-12 w-5 animate-pulse rounded-t-md bg-[#5aa6e8] opacity-80',
  buildBarAlt: 'h-16 w-5 animate-pulse rounded-t-md bg-[#3fb950] opacity-80',
  buildBarTall: 'h-20 w-5 animate-pulse rounded-t-md bg-[#e9a648] opacity-80',

  // Stats page
  statsSection: 'flex flex-col gap-3',
  statsGrid: 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5',
  statsCard:
    'flex flex-col gap-1 rounded-lg border border-[#2f333a] bg-[#23262b] p-4',
  statNumber: 'text-2xl font-mono font-semibold tabular-nums text-[#e6e8eb]',
  statLabel: 'text-xs uppercase tracking-wide text-[#9aa0a8]',
  statBest: 'font-mono text-xs tabular-nums text-[#3fb950]',
  statMedian: 'font-mono text-xs tabular-nums text-[#9aa0a8]',
  statsBars: 'flex flex-col gap-2',
  statBarRow: 'flex items-center gap-2 text-sm',
  statBarLabel: 'w-28 truncate text-[#e6e8eb]',
  statBarBg: 'h-2 flex-1 overflow-hidden rounded-full bg-[#2b2f36]',
  statBarFill: 'h-full rounded-full bg-[#e9a648]',
  statBarCount: 'w-8 text-right font-mono text-xs tabular-nums text-[#9aa0a8]',

  // Sparkline
  sparklineWrap: 'flex flex-col gap-1',
  sparklineLabel: 'text-xs uppercase tracking-wide text-[#9aa0a8]',

  // Misc
  centeredState:
    'flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center',
  link: 'text-[#e9a648] hover:underline',
} as const

/** Difficulty-specific badge colors, keyed by difficulty. */
export const difficultyBadge: Record<Difficulty, string> = {
  beginner: 'bg-[#2f9e4422] text-[#3fb950]',
  easy: 'bg-[#5aa6e822] text-[#5aa6e8]',
  medium: 'bg-[#d6a53122] text-[#d6a531]',
  hard: 'bg-[#e9764822] text-[#e97648]',
  expert: 'bg-[#f0544f22] text-[#f0544f]',
}
