/**
 * ReportsPage.jsx — Patrol & Incident Reports
 *
 * Displays a searchable (static for now) list of filed, pending, and draft
 * reports submitted by officers. Status badges use CSS custom properties
 * for colour-coding without a separate utility class per status.
 *
 * Note: All data here is static/sample. In production, fetch reports from
 * GET /api/reports and add pagination or filter controls as needed.
 */

/** Sample report records. Each row appears as one table row. */
const reports = [
  { id: 'RPT-001', date: '2026-03-13', type: 'Patrol Summary', officer: 'Mon Maguas', status: 'Filed' },
  { id: 'RPT-002', date: '2026-03-13', type: 'Incident Report', officer: 'GerryBoy Aggabao', status: 'Pending' },
  { id: 'RPT-003', date: '2026-03-12', type: 'Backup Request', officer: 'Romel Manzano', status: 'Filed' },
  { id: 'RPT-004', date: '2026-03-12', type: 'Patrol Summary', officer: 'Ana Reyes', status: 'Draft' },
  { id: 'RPT-005', date: '2026-03-11', type: 'Incident Report', officer: 'Carlos Bautista', status: 'Filed' },
]

/** Colour map for report status badges. */
const statusColor = {
  Filed: '#16a34a',
  Pending: '#d97706',
  Draft: '#64748b',
}

function ReportsPage() {
  return (
    <div className="page-container fade-in p-3 p-md-4">
      <div className="page-header mb-4">
        <h2 className="page-title mb-0 fw-bold">Reports</h2>
        <p className="page-subtitle text-body-secondary mb-0">Patrol and incident documentation</p>
      </div>

      <div className="widget-card slide-up p-3 overflow-auto no-scrollbar">
        <table className="personnel-table table align-middle mb-0">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Date</th>
              <th>Type</th>
              <th>Officer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="personnel-row">
                <td className="personnel-badge">{report.id}</td>
                <td>{report.date}</td>
                <td>{report.type}</td>
                <td>{report.officer}</td>
                <td>
                  <span
                    className="status-badge"
                    style={{ '--status-color': statusColor[report.status] ?? '#64748b' }}
                  >
                    {report.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ReportsPage
