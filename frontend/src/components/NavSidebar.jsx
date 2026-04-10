/**
 * NavSidebar.jsx — Navigation Sidebar
 *
 * A fixed-position dark sidebar that provides navigation links to all pages.
 * Supports a collapsible mode (icon-only) controlled by the `collapsed` prop
 * that is toggled by the arrow button at the bottom of the sidebar.
 *
 * When collapsed:
 *   - Width shrinks from 260 px to 64 px (CSS transition)
 *   - Brand name and nav labels fade out (opacity: 0)
 *   - Only the icon remains visible for each item
 *
 * Active link highlighting is handled by react-router's NavLink —
 * it adds css class 'nav-sidebar__link--active' automatically.
 *
 * Props:
 *   collapsed {boolean}  — true when sidebar is in icon-only mode
 *   onToggle  {Function} — called when the collapse/expand button is clicked
 */
import { useMemo, useState, useSyncExternalStore } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

/**
 * navItems — ordered list of navigation entries.
 * Each item maps a URL path to an SVG icon and a display label.
 * The SVGs are inline so no icon library dependency is needed.
 */
const primaryNavItems = [

   {
    to: '/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    label: 'Live Map',
  },

  {
    to: '/monitoring',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    label: 'Dashboard',
  },
 
  {
    to: '/personnel',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    label: 'Personnel',
  },
  {
    to: '/assign-area',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19l-5 2 2-5L17 5l3 3-11 11z" />
        <path d="M14 8l3 3" />
      </svg>
    ),
    label: 'Deployment Management',
  },
  {
    to: '/settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    label: 'Account Management',
  },
]

const dataInsightsItems = [
  {
    to: '/analytics',
    label: 'Analytics',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
]

function NavSidebar({ collapsed, onToggle }) {
  const location = useLocation()
  const [dataInsightsOpen, setDataInsightsOpen] = useState(true)

  const isCompact = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') {
        return () => {}
      }

      const mediaQuery = window.matchMedia('(max-width: 860px)')
      const handleMediaChange = () => onStoreChange()

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handleMediaChange)
        return () => mediaQuery.removeEventListener('change', handleMediaChange)
      }

      mediaQuery.addListener(handleMediaChange)
      return () => mediaQuery.removeListener(handleMediaChange)
    },
    () => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 860px)').matches : false),
    () => false
  )

  const isDataInsightsActive = useMemo(
    () => dataInsightsItems.some((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)),
    [location.pathname]
  )

  const showCompactDataInsights = collapsed || isCompact
  const isDataInsightsExpanded = dataInsightsOpen

  const handleNavItemClick = (item) => {
    if (item.to === '/' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('focus-live-map'))
    }
  }

  return (
    <aside className={`nav-sidebar ${collapsed ? 'nav-sidebar--collapsed' : ''}`}>

      {/* Brand logo area — shows the 'BC' badge always; hides the name when collapsed */}
      <div className="nav-sidebar__brand">
        <span className="nav-sidebar__badge">BC</span>
        {!collapsed && <span className="nav-sidebar__brand-name">BantayCabagan</span>}
      </div>

      {/* Navigation links — NavLink auto-adds 'nav-sidebar__link--active' for the current route */}
      <nav className="nav-sidebar__nav">
        {primaryNavItems.slice(0, 2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}  // 'end' prevents '/' matching all sub-routes as active
            onClick={() => handleNavItemClick(item)}
            className={({ isActive }) =>
              `nav-sidebar__link ${isActive ? 'nav-sidebar__link--active' : ''}`
            }
          >
            <span className="nav-sidebar__icon">{item.icon}</span>
            {/* Label fades out via CSS when collapsed, not removed from DOM */}
            {!collapsed && <span className="nav-sidebar__label">{item.label}</span>}
          </NavLink>
        ))}

        {showCompactDataInsights ? (
          dataInsightsItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-sidebar__link ${isActive ? 'nav-sidebar__link--active' : ''}`
              }
            >
              <span className="nav-sidebar__icon">{item.icon}</span>
            </NavLink>
          ))
        ) : (
          <div className={`nav-sidebar__group ${isDataInsightsActive ? 'nav-sidebar__group--active' : ''}`}>
            <button
              type="button"
              className={`nav-sidebar__group-toggle ${isDataInsightsActive ? 'nav-sidebar__group-toggle--active' : ''}`}
              onClick={() => setDataInsightsOpen((prev) => !prev)}
              aria-expanded={isDataInsightsExpanded}
              aria-controls="data-insights-submenu"
            >
              <span className="nav-sidebar__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </span>
              <span className="nav-sidebar__label">Data Insights</span>
              <span className="nav-sidebar__expander" aria-hidden="true">
                +
              </span>
            </button>

            <div
              id="data-insights-submenu"
              className={`nav-sidebar__submenu ${isDataInsightsExpanded ? 'is-open' : ''}`}
              aria-hidden={!isDataInsightsExpanded}
            >
              {dataInsightsItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-sidebar__sublink ${isActive ? 'nav-sidebar__sublink--active' : ''}`
                  }
                >
                  <span className="nav-sidebar__subicon" aria-hidden="true">{item.icon}</span>
                  <span className="nav-sidebar__sublabel">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {primaryNavItems.slice(2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-sidebar__link ${isActive ? 'nav-sidebar__link--active' : ''}`
            }
          >
            <span className="nav-sidebar__icon">{item.icon}</span>
            {!collapsed && <span className="nav-sidebar__label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Toggle button — chevron points right (expand) or left (collapse) */}
      <button type="button" className="nav-sidebar__toggle" onClick={onToggle} aria-label="Toggle sidebar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {collapsed ? (
            <polyline points="9 18 15 12 9 6" />
          ) : (
            <polyline points="15 18 9 12 15 6" />
          )}
        </svg>
      </button>
    </aside>
  )
}

export default NavSidebar
