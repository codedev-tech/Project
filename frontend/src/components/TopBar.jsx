/**
 * TopBar.jsx — Sticky Header Bar
 *
 * Displayed at the top of every page inside AppLayout.
 * Left side  — system branding (title + subtitle)
 * Right side — connection status pill, dark/light mode toggle,
 *              and the supervisor account button with dropdown menu.
 *
 * Props:
 *   isConnected  {boolean}  — true when Socket.IO is connected
 *   isDark       {boolean}  — true when dark mode is active
 *   onToggleDark {Function} — called to flip the dark mode flag
 */
import { useEffect, useRef, useState } from 'react'

/** Hardcoded supervisor — replace with an auth context in production */
const SUPERVISOR = {
  name: 'Sgt. Leo Gannad',
  rank: 'Police Sergeant',
  role: 'Supervisor',
  photoUrl: 'https://randomuser.me/api/portraits/men/56.jpg',
}

function TopBar({ isConnected, isDark, onToggleDark }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close the dropdown whenever the user clicks outside of it
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  return (
    <header className="top-bar d-flex align-items-center justify-content-between">
      {/* ── Left: system branding ── */}
      <div className="topbar-left">
        <h1 className="m-0 fs-4 fw-bold">BantayCabagan</h1>
        <p className="mb-0 mt-1 text-secondary small">IoT-Based Real-Time GPS Monitoring for Police Personnel</p>
      </div>

      {/* ── Right: status pill + dark mode toggle + supervisor profile ── */}
      <div className="topbar-right d-flex align-items-center gap-2 flex-shrink-0">
        {/* Live / Offline indicator */}
        <span className={`connection-pill ${isConnected ? 'online' : 'offline'}`}>
          {isConnected ? 'Live' : 'Offline'}
        </span>

        {/* Dark / Light mode toggle */}
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            /* Sun — click to go back to light mode */
            <svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            /* Moon — click to enable dark mode */
            <svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Supervisor account — photo + name + role, opens dropdown on click */}
        <div className="supervisor-profile" ref={dropdownRef}>
          <button
            type="button"
            className="supervisor-btn"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <img
              src={SUPERVISOR.photoUrl}
              alt={SUPERVISOR.name}
              className="supervisor-avatar"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(SUPERVISOR.name)}&background=1d4ed8&color=fff&size=64`
              }}
            />
            <div className="supervisor-info d-flex flex-column align-items-start">
              <span className="supervisor-name">{SUPERVISOR.name}</span>
              <span className="supervisor-role">{SUPERVISOR.role}</span>
            </div>
            <svg className="supervisor-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Dropdown menu — appears below the button */}
          {dropdownOpen && (
            <div className="supervisor-dropdown">
              {/* Header row with larger photo + name + rank */}
              <div className="dropdown-profile-header d-flex align-items-center">
                <img
                  src={SUPERVISOR.photoUrl}
                  alt={SUPERVISOR.name}
                  className="dropdown-avatar"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(SUPERVISOR.name)}&background=1d4ed8&color=fff&size=64`
                  }}
                />
                <div>
                  <strong className="dropdown-name">{SUPERVISOR.name}</strong>
                  <span className="dropdown-rank">{SUPERVISOR.rank}</span>
                </div>
              </div>

              <div className="dropdown-divider" />

              <button type="button" className="dropdown-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                My Profile
              </button>
              <button type="button" className="dropdown-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                </svg>
                Settings
              </button>

              <div className="dropdown-divider" />

              <button type="button" className="dropdown-item dropdown-item--logout">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default TopBar
