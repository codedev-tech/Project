/**
 * AnalyticsPage.jsx — Weekly Trends
 *
 * Shows aggregated weekly statistics for patrols and incidents.
 * The bar chart is built in pure CSS using CSS custom properties
 * (--h) to set each bar's height — no external charting library required.
 *
 * Note: All data here is static/sample. In production, fetch this from
 * an API endpoint (e.g., GET /api/analytics/weekly) with useEffect.
 */

/** Day-by-day patrol and incident counts for the weekly bar chart. */
const chartBars = [
  { label: 'Mon', patrols: 18, incidents: 3 },
  { label: 'Tue', patrols: 22, incidents: 5 },
  { label: 'Wed', patrols: 19, incidents: 2 },
  { label: 'Thu', patrols: 25, incidents: 6 },
  { label: 'Fri', patrols: 21, incidents: 4 },
  { label: 'Sat', patrols: 14, incidents: 1 },
  { label: 'Sun', patrols: 10, incidents: 0 },
]

// Used to normalise bar heights: the tallest bar (MAX_PATROLS) = 100% height
const MAX_PATROLS = 30

function AnalyticsPage() {
  return (
    <div className="page-container fade-in p-3 p-md-4">
      <div className="page-header mb-4">
        <h2 className="page-title mb-0 fw-bold">Analytics</h2>
        <p className="page-subtitle text-body-secondary mb-0">Weekly patrol and incident trends</p>
      </div>

      <div className="stats-grid row g-3 mb-3 mx-0">
        {[
          { label: 'Patrols This Week', value: '129' },
          { label: 'Total Incidents', value: '21' },
          { label: 'Backup Requests', value: '8' },
          { label: 'Resolved Cases', value: '19' },
        ].map((stat) => (
          <div key={stat.label} className="col-12 col-sm-6 col-xl-3">
            <div className="stat-card slide-up p-3 h-100">
            <p className="stat-card__label">{stat.label}</p>
            <strong className="stat-card__value">{stat.value}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="widget-card slide-up p-3">
        <h3 className="widget-title">Patrol vs Incidents — This Week</h3>
        <div className="bar-chart">
          {chartBars.map((bar) => (
            <div key={bar.label} className="bar-chart__group">
              <div className="bar-chart__bars">
                <div
                  className="bar-chart__bar bar-chart__bar--patrol"
                  style={{ '--h': `${(bar.patrols / MAX_PATROLS) * 100}%` }}
                  title={`Patrols: ${bar.patrols}`}
                />
                <div
                  className="bar-chart__bar bar-chart__bar--incident"
                  style={{ '--h': `${(bar.incidents / MAX_PATROLS) * 100}%` }}
                  title={`Incidents: ${bar.incidents}`}
                />
              </div>
              <span className="bar-chart__label">{bar.label}</span>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <span className="legend-dot legend-dot--patrol" /> Patrols
          <span className="legend-dot legend-dot--incident" /> Incidents
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
