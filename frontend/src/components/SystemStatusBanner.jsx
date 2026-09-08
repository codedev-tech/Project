import { useEffect, useRef } from 'react'
import { useAuth } from '../context/useAuth'
import { usePersonnelContext } from '../context/usePersonnelContext'
import { useSystemHealth } from '../hooks/useSystemHealth'
import '../styles/systemStatus.css'

export default function SystemStatusBanner() {
  const { sessionError, checkingSession, refreshSession } = useAuth()
  const { isConnected, initialDataError, retryInitialData, isInitialDataLoading } = usePersonnelContext()
  const { online, health, checking, checkHealth } = useSystemHealth()
  const previous = useRef('checking')
  useEffect(() => {
    if (!online) { previous.current = 'offline'; return }
    if (checking) return
    const wasUnavailable = ['offline', 'unavailable', 'unreachable'].includes(previous.current)
    previous.current = health
    if (health === 'ready' && wasUnavailable) {
      retryInitialData()
      void refreshSession()
    }
  }, [health, online, checking, retryInitialData, refreshSession])

  const message = !online
    ? 'No internet connection. Displayed data may be outdated. Reconnect to resume updates.'
    : health === 'unavailable'
      ? 'The service is temporarily unavailable. Displayed data may be outdated. We are checking for recovery automatically.'
      : health === 'unreachable'
        ? 'Cannot reach the service. Check your connection. Displayed data may be outdated; reconnection checks are automatic.'
        : sessionError
          ? 'Your session could not be rechecked. Your current page remains open while we retry. Some actions may be unavailable.'
          : !isConnected
            ? health === 'checking' ? 'Checking the connection. Live updates are not yet confirmed.' : 'Live updates are interrupted. Displayed data may be outdated. Reconnecting automatically.'
            : initialDataError ? 'Some data could not be refreshed. Displayed records may be outdated. Try again to refresh them.' : ''
  if (!message) return null
  const retry = async () => {
    const status = await checkHealth()
    if (status === 'ready') {
      retryInitialData()
      if (sessionError) void refreshSession()
    }
  }
  return <aside className="system-status-banner" role="status" aria-live="polite">
    <span>{message}</span>
    <button type="button" disabled={!online || checking || checkingSession || isInitialDataLoading} onClick={() => { void retry() }}>
      {checking || checkingSession || isInitialDataLoading ? 'Checking...' : 'Try again'}
    </button>
  </aside>
}
