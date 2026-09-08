import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import SystemStatusBanner from './SystemStatusBanner'
const state = vi.hoisted(() => ({ health: {}, auth: {}, personnel: {} }))
vi.mock('../hooks/useSystemHealth', () => ({ useSystemHealth: () => state.health }))
vi.mock('../context/useAuth', () => ({ useAuth: () => state.auth }))
vi.mock('../context/usePersonnelContext', () => ({ usePersonnelContext: () => state.personnel }))
beforeEach(() => {
  state.health = { online: true, health: 'ready', checking: false, checkHealth: vi.fn(async () => 'ready') }
  state.auth = { sessionError: '', refreshSession: vi.fn() }
  state.personnel = { isConnected: true, initialDataError: '', retryInitialData: vi.fn() }
})
afterEach(cleanup)
it('keeps clear outage messages visible and removes them only after recovery', () => {
  const view = render(<SystemStatusBanner />)
  expect(screen.queryByRole('status')).toBeNull()
  state.health.online = false
  view.rerender(<SystemStatusBanner />)
  expect(screen.getByRole('status')).toHaveTextContent('No internet connection')
  expect(screen.getByRole('button')).toBeDisabled()
  state.health.online = true
  state.health.health = 'unavailable'
  view.rerender(<SystemStatusBanner />)
  expect(screen.getByRole('status')).toHaveTextContent('service is temporarily unavailable')
  state.health.health = 'ready'
  state.personnel.isConnected = false
  view.rerender(<SystemStatusBanner />)
  expect(screen.getByRole('status')).toHaveTextContent('Live updates are interrupted')
  expect(state.personnel.retryInitialData).toHaveBeenCalledTimes(1)
  expect(state.auth.refreshSession).toHaveBeenCalledTimes(1)
  state.personnel.isConnected = true
  view.rerender(<SystemStatusBanner />)
  expect(screen.queryByRole('status')).toBeNull()
})
it('shows partial-load and background session failures even with a connected socket', () => {
  state.personnel.initialDataError = 'Reports unavailable'
  const view = render(<SystemStatusBanner />)
  expect(screen.getByRole('status')).toHaveTextContent('Some data could not be refreshed')
  state.auth.sessionError = 'Timeout'
  view.rerender(<SystemStatusBanner />)
  expect(screen.getByRole('status')).toHaveTextContent('session could not be rechecked')
})
