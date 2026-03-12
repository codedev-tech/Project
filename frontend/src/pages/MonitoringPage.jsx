/**
 * MonitoringPage.jsx — Live Map View
 *
 * The primary operational screen for supervisors. Assembled from three
 * child components:
 *   ─ SidePanel    (left) — metrics, status, and clickable officer list
 *   ─ PersonnelMap (center) — full-width Leaflet map with live GPS markers
 *   ─ ProfileModal (overlay) — officer details + Request Backup button
 *
 * State:
 *   selectedPersonnel — the officer currently shown in the modal, or null
 *
 * Data flow:
 *   PersonnelContext → hook → this page → props down to child components
 *   User clicks marker/name → setSelectedPersonnel → modal opens
 *   User clicks Backup → requestBackup() → emitBackupRequest → socket event
 */
import { useState } from 'react'
import ProfileModal from '../components/ProfileModal'
import PersonnelMap from '../components/PersonnelMap'
import SidePanel from '../components/SidePanel'
import { usePersonnelContext } from '../context/PersonnelContext'
import { emitBackupRequest } from '../services/socket'

function MonitoringPage() {
  // Pull live officer data and status from the shared context
  const { personnel, personnelCount, statusMessage } = usePersonnelContext()

  // Track which officer's profile modal is open (null = modal hidden)
  const [selectedPersonnel, setSelectedPersonnel] = useState(null)

  /**
   * requestBackup
   * Fires an emergency socket event for the currently selected officer.
   * The server will broadcast it to ALL connected clients.
   */
  const requestBackup = () => {
    if (!selectedPersonnel) {
      return
    }

    emitBackupRequest(selectedPersonnel.id)
  }

  return (
    <div className="monitoring-shell">
      <main className="dashboard-grid">
        <SidePanel
          personnel={personnel}
          personnelCount={personnelCount}
          statusMessage={statusMessage}
          onSelectPersonnel={setSelectedPersonnel}
        />
        <PersonnelMap personnel={personnel} onSelectPersonnel={setSelectedPersonnel} />
      </main>

      <ProfileModal
        selectedPersonnel={selectedPersonnel}
        onClose={() => setSelectedPersonnel(null)}
        onRequestBackup={requestBackup}
      />
    </div>
  )
}

export default MonitoringPage
