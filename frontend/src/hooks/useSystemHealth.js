import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { apiRequest } from '../services/apiClient'

const subscribeOnline = (notify) => {
  window.addEventListener('online', notify)
  window.addEventListener('offline', notify)
  return () => {
    window.removeEventListener('online', notify)
    window.removeEventListener('offline', notify)
  }
}
export const useBrowserOnline = () => useSyncExternalStore(subscribeOnline, () => navigator.onLine !== false, () => true)

export function useSystemHealth() {
  const online = useBrowserOnline()
  const [health, setHealth] = useState('checking')
  const [checking, setChecking] = useState(false)
  const pending = useRef(null)
  const controller = useRef(null)
  const generation = useRef(0)
  const checkHealth = useCallback(() => {
    if (navigator.onLine === false) return Promise.resolve('offline')
    if (pending.current) return pending.current
    const current = generation.current
    const abort = new AbortController()
    controller.current = abort
    setChecking(true)
    const request = (async () => {
      let next
      try {
        const response = await apiRequest('/api/ready', { signal: abort.signal, timeoutMs: 6000, cache: 'no-store' })
        next = response.status === 'ready' ? 'ready' : 'unavailable'
      } catch (error) {
        if (error?.name === 'AbortError') return 'cancelled'
        next = error?.status === 503 ? 'unavailable' : 'unreachable'
      } finally {
        if (current === generation.current) { pending.current = null; setChecking(false) }
      }
      if (current !== generation.current) return 'cancelled'
      setHealth(next)
      return next
    })()
    pending.current = request
    return request
  }, [])

  useEffect(() => {
    if (online) void checkHealth()
    const interval = online ? setInterval(() => { void checkHealth() }, 30_000) : null
    return () => {
      clearInterval(interval)
      generation.current += 1
      controller.current?.abort()
      pending.current = null
    }
  }, [checkHealth, online])
  return { online, health, checking, checkHealth }
}
