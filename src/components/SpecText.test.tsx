import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SpecText } from './SpecText'

describe('SpecText', () => {
  it('renders backticked tokens as variable chips and leaves prose intact', () => {
    render(<SpecText text="Line 1: integers `a` and `b`." />)
    const a = screen.getByText('a')
    const b = screen.getByText('b')
    expect(a.tagName).toBe('SPAN')
    expect(b.tagName).toBe('SPAN')
    // The surrounding prose is still present (not consumed by the chips).
    expect(screen.getByText(/Line 1: integers/)).toBeInTheDocument()
  })

  it('assigns each distinct variable a stable color', () => {
    render(<SpecText text="`a` `a` `b`" />)
    const chips = screen.getAllByText(/^[ab]$/)
    const aChips = chips.filter((chip) => chip.textContent === 'a')
    // The same token always gets the same class (deterministic color).
    expect(aChips[0]?.className).toBe(aChips[1]?.className)
  })

  it('renders plain text unchanged when there are no tokens', () => {
    render(<SpecText text="No variables here." />)
    expect(screen.getByText('No variables here.')).toBeInTheDocument()
  })
})
