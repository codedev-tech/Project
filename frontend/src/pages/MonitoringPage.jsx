/**
 * MonitoringPage.jsx — Live Map View
 *
 * The primary operational screen for supervisors. Assembled from three
 * child components:
 *   ─ SidePanel    (left) — metrics, status, and clickable officer list
 *   ─ PersonnelMap (center) — full-width Leaflet map with live GPS markers
 *   ─ ProfileModal (overlay) — officer details
 *
 * State:
 *   selectedPersonnel — the officer currently shown in the modal, or null
 *
 * Data flow:
 *   PersonnelContext → hook → this page → props down to child components
 *   User clicks marker/name → setSelectedPersonnel → modal opens
 */
import { useState } from 'react'
import ProfileModal from '../components/ProfileModal'
import PersonnelMap from '../components/PersonnelMap'
import SidePanel from '../components/SidePanel'
import { usePersonnelContext } from '../context/usePersonnelContext'

function MonitoringPage() {
  // Pull live officer data and status from the shared context
  const { personnel, personnelCount, statusMessage, outOfBoundaryPersonnel } = usePersonnelContext()

  // Track which officer's profile modal is open (null = modal hidden)
  const [selectedPersonnel, setSelectedPersonnel] = useState(null)
  const [focusTarget, setFocusTarget] = useState(null)

  const handleLocatePersonnel = (member) => {
    if (!member) {
      return
    }

    if (typeof member.latitude !== 'number' || typeof member.longitude !== 'number') {
      return
    }

    setFocusTarget({
        latitude: member.latitude,
        longitude: member.longitude,
        timestamp: Date.now(),
      })

    // Close the modal so the supervisor can immediately see the map focus result.
    setSelectedPersonnel(null)
  }

  return (
    <div className="monitoring-shell">
      <main className="dashboard-grid">
        <SidePanel
          personnel={personnel}
          personnelCount={personnelCount}
          statusMessage={statusMessage}
          outOfBoundaryPersonnelCount={outOfBoundaryPersonnel.length}
          onSelectPersonnel={setSelectedPersonnel}
        />
        <PersonnelMap
          personnel={personnel}
          onSelectPersonnel={setSelectedPersonnel}
          focusTarget={focusTarget}
        />
      </main>

      <ProfileModal
        selectedPersonnel={selectedPersonnel}
        onClose={() => setSelectedPersonnel(null)}
        onLocate={() => handleLocatePersonnel(selectedPersonnel)}
      />
    </div>
  )
}

export default MonitoringPage
