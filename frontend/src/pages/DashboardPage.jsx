/**
 * DashboardPage.jsx — Operations Overview
 *
 * The home screen supervisors see first. Displays a summary of current-day
 * field operations in three sections:
 *
 *   1. Stats Grid     — four KPI cards (patrols, response time, incidents, officers)
 *   2. Recent Activity — chronological feed of logged events from the field
 *   3. Patrol Coverage — horizontal bar chart showing per-barangay coverage %
 *
 * Note: All data here is static/sample. In production, connect these to
 * the REST API (e.g., GET /api/stats/today) and use useState + useEffect.
 */

/**
 * KPI cards shown in the stats grid at the top of the page.
 * 'up: true' colours the change green (positive), 'up: false' colours it red.
 */
const stats = [
  { label: 'Total Patrols Today', value: '24', change: '+4', up: true },
  { label: 'Avg Response Time', value: '3.2 min', change: '-0.5', up: true },
  { label: 'Incidents Logged', value: '7', change: '+2', up: false },
  { label: 'Officers On Duty', value: '18', change: '+1', up: true },
]

/** Timestamped log entries displayed in the Recent Activity widget. */
const activityFeed = [
  { id: 1, time: '08:42 AM', text: 'PO1 Santos started patrol in Barangay Centro.' },
  { id: 2, time: '09:15 AM', text: 'SPO1 Reyes responded to traffic incident on NM Highway.' },
  { id: 3, time: '10:03 AM', text: 'Backup requested near Cabagan Public Market.' },
  { id: 4, time: '11:27 AM', text: 'All units reported in. Status: normal.' },
  { id: 5, time: '12:50 PM', text: 'PO2 Mon Maguas completed shift B patrol route.' },
]

function DashboardPage() {
  return (
    <div className="page-container fade-in p-3 p-md-4">
      <div className="page-header mb-4">
        <h2 className="page-title mb-0 fw-bold">Dashboard</h2>
        <p className="page-subtitle text-body-secondary mb-0">Overview of today&apos;s field operations</p>
      </div>

      <div className="stats-grid row g-3 mb-3 mx-0">
        {stats.map((stat) => (
          <div key={stat.label} className="col-12 col-sm-6 col-xl-3">
            <div className="stat-card slide-up p-3 h-100">
            <p className="stat-card__label">{stat.label}</p>
            <strong className="stat-card__value">{stat.value}</strong>
            <span className={`stat-card__change ${stat.up ? 'up' : 'down'}`}>
              {stat.change} vs yesterday
            </span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-widgets row g-3 mx-0">
        <div className="col-12 col-xl-6">
          <div className="widget-card slide-up p-3 h-100">
          <h3 className="widget-title">Recent Activity</h3>
          <ul className="activity-feed list-unstyled mb-0">
            {activityFeed.map((item) => (
              <li key={item.id} className="activity-item">
                <span className="activity-dot" />
                <p className="activity-text">
                  <time className="activity-time">{item.time}</time>
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="widget-card slide-up p-3 h-100">
          <h3 className="widget-title">Patrol Coverage</h3>
          <div className="coverage-bars">
            {[
              { label: 'Barangay Centro', pct: 92 },
              { label: 'National Highway', pct: 74 },
              { label: 'West District', pct: 55 },
              { label: 'East District', pct: 68 },
              { label: 'Market Area', pct: 83 },
            ].map((row) => (
              <div key={row.label} className="coverage-row">
                <span className="coverage-label">{row.label}</span>
                <div className="coverage-bar-track">
                  <div className="coverage-bar-fill" style={{ '--pct': `${row.pct}%` }} />
                </div>
                <span className="coverage-pct">{row.pct}%</span>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
