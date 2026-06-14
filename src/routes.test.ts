import { describe, expect, it } from 'vitest'
import { QUERY_CLASH, QUERY_MINUTES, QUERY_MODE, solvePath } from './routes'

describe('solvePath', () => {
  it('omits query params for the default fastest/practice clash', () => {
    expect(solvePath('echo')).toBe('/solve/echo')
    expect(solvePath('echo', { clash: 'fastest', mode: 'practice' })).toBe(
      '/solve/echo',
    )
  })

  it('serializes a non-default clash mode', () => {
    expect(solvePath('echo', { clash: 'shortest' })).toBe(
      `/solve/echo?${QUERY_CLASH}=shortest`,
    )
    expect(solvePath('echo', { clash: 'reverse' })).toBe(
      `/solve/echo?${QUERY_CLASH}=reverse`,
    )
  })

  it('serializes the timed mode with its minutes', () => {
    const path = solvePath('echo', { mode: 'timed', minutes: 15 })
    const params = new URLSearchParams(path.split('?')[1])
    expect(params.get(QUERY_MODE)).toBe('timed')
    expect(params.get(QUERY_MINUTES)).toBe('15')
  })

  it('carries both clash mode and timer together', () => {
    const path = solvePath('echo', {
      clash: 'shortest',
      mode: 'timed',
      minutes: 5,
    })
    const params = new URLSearchParams(path.split('?')[1])
    expect(params.get(QUERY_CLASH)).toBe('shortest')
    expect(params.get(QUERY_MODE)).toBe('timed')
    expect(params.get(QUERY_MINUTES)).toBe('5')
  })

  it('encodes the puzzle id', () => {
    expect(solvePath('a/b?c')).toBe(`/solve/${encodeURIComponent('a/b?c')}`)
  })
})
