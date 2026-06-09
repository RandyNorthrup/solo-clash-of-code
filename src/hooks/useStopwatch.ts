/** A start/stop/reset stopwatch driven by performance.now() for accuracy. */
import { useCallback, useEffect, useRef, useState } from 'react'
import { CLOCK_TICK_INTERVAL_MS } from '../config/constants'

export interface Stopwatch {
  readonly elapsedMs: number
  readonly running: boolean
  readonly start: () => void
  readonly stop: () => void
  readonly reset: () => void
  /** Current elapsed time read synchronously from the underlying refs. */
  readonly getElapsedMs: () => number
}

export function useStopwatch(): Stopwatch {
  const [elapsedMs, setElapsedMs] = useState(0)
  const [running, setRunning] = useState(false)
  const segmentStartRef = useRef<number | null>(null)
  const accumulatedRef = useRef(0)
  const runningRef = useRef(false)

  const getElapsedMs = useCallback(() => {
    if (runningRef.current && segmentStartRef.current !== null) {
      return (
        accumulatedRef.current + (performance.now() - segmentStartRef.current)
      )
    }
    return accumulatedRef.current
  }, [])

  useEffect(() => {
    if (!running) {
      return
    }
    const id = setInterval(() => {
      setElapsedMs(getElapsedMs())
    }, CLOCK_TICK_INTERVAL_MS)
    return () => {
      clearInterval(id)
    }
  }, [running, getElapsedMs])

  const start = useCallback(() => {
    if (runningRef.current) {
      return
    }
    runningRef.current = true
    segmentStartRef.current = performance.now()
    setRunning(true)
  }, [])

  const stop = useCallback(() => {
    if (!runningRef.current) {
      return
    }
    accumulatedRef.current = getElapsedMs()
    runningRef.current = false
    segmentStartRef.current = null
    setElapsedMs(accumulatedRef.current)
    setRunning(false)
  }, [getElapsedMs])

  const reset = useCallback(() => {
    accumulatedRef.current = 0
    segmentStartRef.current = null
    runningRef.current = false
    setElapsedMs(0)
    setRunning(false)
  }, [])

  return { elapsedMs, running, start, stop, reset, getElapsedMs }
}
