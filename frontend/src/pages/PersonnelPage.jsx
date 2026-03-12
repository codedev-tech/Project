/**
 * PersonnelPage.jsx — Officer Roster
 *
 * A tabular view of all registered police officers with their current
 * deployment status. Status badges are coloured using a CSS custom property
 * (--status-color) so each status value maps to a distinct colour.
 *
 * Data source:
 *   Uses live personnel from PersonnelContext (Socket.IO backend stream),
 *   so changing names in backend/src/server.js updates this page automatically.
 */

import { usePersonnelContext } from '../context/PersonnelContext'

/** Maps each deployment status string to its CSS badge colour. */
const statusColor = {
  'On Patrol': '#16a34a',
  'Monitoring': '#2563eb',
  'Responding': '#d97706',
  'Off Duty': '#94a3b8',
}

function PersonnelPage() {
  const { personnel } = usePersonnelContext()

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h2 className="page-title">Personnel</h2>
        <p className="page-subtitle">Registered officers and current deployment status</p>
      </div>

      <div className="widget-card slide-up">
        <table className="personnel-table">
          <thead>
            <tr>
              <th>Badge #</th>
              <th>Name</th>
              <th>Rank</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {personnel.map((officer) => (
              <tr key={officer.id} className="personnel-row">
                <td className="personnel-badge">{officer.badge ?? officer.id.toUpperCase()}</td>
                <td>{officer.name}</td>
                <td>{officer.rank}</td>
                <td>
                  <span
                    className="status-badge"
                    style={{ '--status-color': statusColor[officer.status] ?? '#94a3b8' }}
                  >
                    {officer.status}
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

export default PersonnelPage
