import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useSystemHealth } from './useSystemHealth'
import { apiRequest } from '../services/apiClient'
vi.mock('../services/apiClient', () => ({ apiRequest: vi.fn() }))
let online
beforeEach(() => {
  online = true
  vi.useFakeTimers()
  vi.resetAllMocks()
  vi.spyOn(navigator, 'onLine', 'get').mockImplementation(() => online)
})
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks() })
it('distinguishes readiness failure from an unreachable server and recovers automatically', async () => {
  apiRequest.mockRejectedValueOnce({ status: 503 }).mockRejectedValueOnce({ code: 'NETWORK_ERROR' }).mockResolvedValueOnce({ status: 'ready' })
  const { result, unmount } = renderHook(useSystemHealth)
  await act(async () => {})
  expect(result.current.health).toBe('unavailable')
  await act(async () => { await vi.advanceTimersByTimeAsync(30_000) })
  expect(result.current.health).toBe('unreachable')
  await act(async () => { await vi.advanceTimersByTimeAsync(30_000) })
  expect(result.current.health).toBe('ready')
  expect(apiRequest).toHaveBeenCalledWith('/api/ready', expect.objectContaining({ timeoutMs: 6000, cache: 'no-store' }))
  unmount()
  expect(vi.getTimerCount()).toBe(0)
})
it('does not poll while offline and checks again on reconnection', async () => {
  online = false
  apiRequest.mockResolvedValue({ status: 'ready' })
  const { result } = renderHook(useSystemHealth)
  await act(async () => { await vi.advanceTimersByTimeAsync(60_000) })
  expect(result.current.online).toBe(false)
  expect(apiRequest).not.toHaveBeenCalled()
  await act(async () => { online = true; window.dispatchEvent(new Event('online')) })
  expect(result.current.health).toBe('ready')
  expect(apiRequest).toHaveBeenCalledTimes(1)
})
it('deduplicates pending checks and ignores responses after unmount', async () => {
  let resolve
  apiRequest.mockReturnValue(new Promise((done) => { resolve = done }))
  const { result, unmount } = renderHook(useSystemHealth)
  let request
  act(() => { request = result.current.checkHealth() })
  expect(apiRequest).toHaveBeenCalledTimes(1)
  const signal = apiRequest.mock.calls[0][1].signal
  unmount()
  expect(signal.aborted).toBe(true)
  resolve({ status: 'ready' })
  expect(await request).toBe('cancelled')
})
