import { useAuth } from '../context/useAuth'
import { useBrowserOnline } from '../hooks/useSystemHealth'
import '../styles/systemStatus.css'

export default function SessionRecovery() {
  const { sessionError, checkingSession, refreshSession } = useAuth()
  const online = useBrowserOnline()
  return <main className="system-recovery">
    <section className="system-recovery__card" aria-labelledby="session-recovery-title">
      <h1 id="session-recovery-title">{online ? 'Unable to verify your session' : 'No internet connection'}</h1>
      <p role="status">{online ? sessionError : 'Reconnect to the internet to verify your session. You do not need to enter your login details again unless your session has expired.'}</p>
      <p>We will retry automatically when the connection is available.</p>
      <button type="button" disabled={checkingSession || !online} onClick={() => { void refreshSession() }}>
        {checkingSession ? 'Checking session...' : 'Try again'}
      </button>
    </section>
  </main>
}
