/**
 * SidePanel.jsx — Live Map Left Column
 *
 * The left panel inside MonitoringPage (the Live Map view).
 * Stacks three information cards vertically:
 *
 *   1. Metric Card  — total count of officers currently being tracked
 *   2. Status Card  — latest Socket.IO / emergency event message
 *   3. List Card    — scrollable roster of active officers;
 *                     clicking a name opens the ProfileModal
 *
 * Props:
 *   personnel         {Array}    — live array of officer objects from the hook
 *   personnelCount    {number}   — pre-derived length (passed in to avoid re-computation)
 *   statusMessage     {string}   — human-readable status from the socket hook
 *   onSelectPersonnel {Function} — called with the officer object when a list item is clicked
 */
function SidePanel({ personnel, personnelCount, statusMessage, outOfBoundaryPersonnelCount, onSelectPersonnel }) {
  return (
    <section className="side-panel">

      {/* ── Metric Card: how many officers are currently on the map ── */}
      <article className="metric-card">
        <h2>Personnel on Field</h2>
        <strong>{personnelCount}</strong>
        <small>Units tracked in real-time</small>
      </article>

      {/* ── Status Card: last socket event or connection message ── */}
      <article className="status-card">
        <h2>System Status</h2>
        <p>{statusMessage}</p>
        {outOfBoundaryPersonnelCount > 0 && (
          <span className="geofence-alert-pill">
            {outOfBoundaryPersonnelCount} personnel outside Cabagan
          </span>
        )}
      </article>

      {/* ── List Card: clickable roster of active officers ── */}
      <article className="list-card">
        <h2>Active Personnel</h2>
        <ul>
          {personnel.map((member) => (
            <li key={member.id}>
              {/*
                Each button triggers the ProfileModal for that officer.
                The hover animation (translateX) is handled in CSS.
              */}
              <button
                type="button"
                className="list-item-btn"
                onClick={() => onSelectPersonnel(member)}
              >
                {/* Small circular photo on the left */}
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="officer-list-avatar"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1d4ed8&color=fff&size=64`
                  }}
                />
                <div className="list-item-info">
                  <span>{member.name}</span>
                  <small>{member.rank}</small>
                  {member.isInsideCabagan === false && (
                    <small className="out-of-boundary-label">Outside Cabagan boundary</small>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </article>
    </section>
  )
}

export default SidePanel
