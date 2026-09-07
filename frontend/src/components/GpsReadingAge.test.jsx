import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import GpsReadingAge from './GpsReadingAge'
import { getGpsReadingStatus } from '../utils/gpsReading'

const fix = '2026-09-07T00:00:00.000Z'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-07T00:00:29.000Z'))
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

it('ages without socket updates, flags delay at 30s, and clears it on a fresh fix', () => {
  const view = render(<GpsReadingAge recordedAt={fix} />)
  expect(screen.getByText('GPS reading: 29s ago')).toBeTruthy()
  act(() => vi.advanceTimersByTime(1000))
  expect(screen.getByText('GPS reading: 30s ago · Delayed')).toBeTruthy()
  view.rerender(<GpsReadingAge recordedAt={fix} />)
  expect(screen.getByText('GPS reading: 30s ago · Delayed')).toBeTruthy()
  view.rerender(<GpsReadingAge recordedAt="2026-09-07T00:00:30.000Z" />)
  expect(screen.getByText('GPS reading: 0s ago')).toBeTruthy()
  view.unmount()
  expect(vi.getTimerCount()).toBe(0)
})

it('does not label missing or invalid GPS timestamps as fresh', () => {
  for (const value of [undefined, '', 'invalid', '2026-09-08T00:00:00.000Z']) {
    expect(getGpsReadingStatus(value).label).toBe('GPS reading: unavailable')
  }
  expect(getGpsReadingStatus(fix, new Date(fix).getTime() + 125_000).label)
    .toBe('GPS reading: 2m 5s ago · Delayed')
})
