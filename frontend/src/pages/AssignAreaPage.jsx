import { useEffect, useMemo, useRef, useState } from 'react'
import { usePersonnelContext } from '../context/usePersonnelContext'

const patrolAreas = [
  'Barangay Aggub',
  'Barangay Anao',
  'Barangay Calao East',
  'Barangay Calao West',
  'Barangay Catabayungan',
  'Barangay Centro',
  'Barangay Cubag',
  'Barangay Garita',
  'Barangay Luquilu',
  'Barangay Magassi',
  'Barangay Masipi East',
  'Barangay Masipi West',
  'Barangay Ngarag',
  'Barangay Pilig Abajo',
  'Barangay Pilig Alto',
  'Barangay San Antonio',
  'Barangay San Bernardo',
  'Barangay San Juan',
  'Barangay San Pablo',
  'Barangay Santa Maria',
  'Cabagan Public Market Zone',
  'Municipal Hall Perimeter',
  'Barangay Centro Route',
  'Cabagan-Santa Maria Road',
  'Cabagan-Tumauini Road',
  'Maharlika Highway Northbound',
  'Maharlika Highway Southbound',
  'National Highway Checkpoint North',
  'National Highway Checkpoint South',
  'Highway Checkpoint North',
  'Highway Checkpoint South',
  'School Safety Patrol Route',
  'Bridge Approach Patrol Zone',
]

const fallbackPersonnel = [
  { id: 'pcpl-001', name: 'Mon Maguas', rank: 'Police Corporal' },
  { id: 'psms-002', name: 'GerryBoy Aggabao', rank: 'Police Staff Sergeant' },
  { id: 'pltc-003', name: 'Romel Manzano', rank: 'Police Lieutenant' },
]

const formatDateTime = (isoValue) => {
  if (!isoValue) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoValue))
}

function AssignAreaPage() {
  const { personnel = [] } = usePersonnelContext()

  const personnelOptions = useMemo(() => {
    if (Array.isArray(personnel) && personnel.length > 0) {
      return personnel.map((member) => ({
        id: member.id,
        name: member.name,
        rank: member.rank,
      }))
    }

    return fallbackPersonnel
  }, [personnel])

  const [assignmentForm, setAssignmentForm] = useState({
    personnelIds: [],
    patrolArea: patrolAreas[0],
    shiftStart: '',
    notes: '',
  })
  const [personnelSearch, setPersonnelSearch] = useState('')
  const [patrolAreaSearch, setPatrolAreaSearch] = useState('')
  const [isPatrolAreaOpen, setIsPatrolAreaOpen] = useState(false)
  const [assignments, setAssignments] = useState([])
  const [assignMessage, setAssignMessage] = useState('')
  const nextAssignmentIdRef = useRef(1)
  const patrolAreaPickerRef = useRef(null)
  const patrolAreaSearchInputRef = useRef(null)

  const activePersonnelIds = assignmentForm.personnelIds.filter((id) =>
    personnelOptions.some((item) => item.id === id)
  )

  const selectedPersonnelMembers = personnelOptions.filter((item) =>
    activePersonnelIds.includes(item.id)
  )

  const filteredPersonnelOptions = useMemo(() => {
    const searchQuery = personnelSearch.trim().toLowerCase()
    if (!searchQuery) {
      return personnelOptions
    }

    return personnelOptions.filter((item) =>
      `${item.name} ${item.rank}`.toLowerCase().includes(searchQuery)
    )
  }, [personnelOptions, personnelSearch])

  const filteredPatrolAreas = useMemo(() => {
    const searchQuery = patrolAreaSearch.trim().toLowerCase()
    if (!searchQuery) {
      return patrolAreas
    }

    return patrolAreas.filter((area) => area.toLowerCase().includes(searchQuery))
  }, [patrolAreaSearch])

  useEffect(() => {
    if (!isPatrolAreaOpen) {
      return undefined
    }

    const handlePointerDownOutside = (event) => {
      if (patrolAreaPickerRef.current && !patrolAreaPickerRef.current.contains(event.target)) {
        setIsPatrolAreaOpen(false)
        setPatrolAreaSearch('')
      }
    }

    document.addEventListener('pointerdown', handlePointerDownOutside)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside)
    }
  }, [isPatrolAreaOpen])

  useEffect(() => {
    if (isPatrolAreaOpen && patrolAreaSearchInputRef.current) {
      patrolAreaSearchInputRef.current.focus()
    }
  }, [isPatrolAreaOpen])

  const handleFormChange = (field) => (event) => {
    setAssignmentForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
  }

  const handlePersonnelToggle = (personnelId) => {
    setAssignmentForm((prev) => ({
      ...prev,
      personnelIds: prev.personnelIds.includes(personnelId)
        ? prev.personnelIds.filter((id) => id !== personnelId)
        : [...prev.personnelIds, personnelId],
    }))
  }

  const handleToggleAllFilteredPersonnel = () => {
    const filteredIds = filteredPersonnelOptions.map((item) => item.id)
    if (filteredIds.length === 0) {
      return
    }

    setAssignmentForm((prev) => {
      const allFilteredSelected = filteredIds.every((id) => prev.personnelIds.includes(id))

      if (allFilteredSelected) {
        return {
          ...prev,
          personnelIds: prev.personnelIds.filter((id) => !filteredIds.includes(id)),
        }
      }

      return {
        ...prev,
        personnelIds: Array.from(new Set([...prev.personnelIds, ...filteredIds])),
      }
    })
  }

  const areAllFilteredSelected = filteredPersonnelOptions.length > 0
    && filteredPersonnelOptions.every((item) => activePersonnelIds.includes(item.id))

  const handleAssignPersonnel = (event) => {
    event.preventDefault()

    if (selectedPersonnelMembers.length === 0 || !assignmentForm.patrolArea.trim()) {
      return
    }

    const assignedAt = new Date().toISOString()
    const assignmentBatchSeed = nextAssignmentIdRef.current
    const newAssignments = selectedPersonnelMembers.map((member, index) => ({
      id: `ASG-${assignmentBatchSeed + index}`,
      personnelId: member.id,
      personnelName: member.name,
      rank: member.rank,
      patrolArea: assignmentForm.patrolArea.trim(),
      shiftStart: assignmentForm.shiftStart,
      notes: assignmentForm.notes.trim(),
      assignedAt,
    }))

    nextAssignmentIdRef.current += newAssignments.length

    setAssignments((prev) => [...newAssignments, ...prev])

    const feedback = newAssignments.length === 1
      ? `${newAssignments[0].personnelName} assigned to ${newAssignments[0].patrolArea}.`
      : `${newAssignments.length} personnel assigned to ${newAssignments[0].patrolArea}.`

    setAssignMessage(feedback)
    setAssignmentForm((prev) => ({
      ...prev,
      shiftStart: '',
      notes: '',
    }))
  }

  const handleSelectPatrolArea = (area) => {
    setAssignmentForm((prev) => ({
      ...prev,
      patrolArea: area,
    }))
    setPatrolAreaSearch('')
    setIsPatrolAreaOpen(false)
  }

  const handleRemoveAssignment = (assignmentId) => {
    setAssignments((prev) => prev.filter((item) => item.id !== assignmentId))
  }

  return (
    <div className="page-container fade-in p-3 p-md-4">
      <div className="page-header mb-4">
        <div>
          <h2 className="page-title mb-0 fw-bold">Assign Area</h2>
          <p className="page-subtitle text-body-secondary mb-0">Assign patrol areas and manage deployment assignments</p>
        </div>
      </div>

      <div className="widget-card slide-up p-3 mb-3">
        <h3 className="widget-title mb-3">Supervisor Deployment Assignment</h3>

        <form className="assignment-form" onSubmit={handleAssignPersonnel}>
          <div className="assignment-grid mb-3">
            <div className="assignment-field assignment-field--personnel">
              <span>Personnel (Checkbox)</span>
              <input
                type="search"
                className="settings-input w-100 assignment-search-input"
                value={personnelSearch}
                onChange={(event) => setPersonnelSearch(event.target.value)}
                placeholder="Search personnel name or rank"
              />

              <div className="assignment-checklist no-scrollbar">
                {filteredPersonnelOptions.length === 0 ? (
                  <p className="assignment-checklist__empty mb-0">No personnel matches your search.</p>
                ) : (
                  filteredPersonnelOptions.map((option) => (
                    <label key={option.id} className="assignment-check-item">
                      <input
                        type="checkbox"
                        checked={activePersonnelIds.includes(option.id)}
                        onChange={() => handlePersonnelToggle(option.id)}
                      />
                      <span>{option.name} - {option.rank}</span>
                    </label>
                  ))
                )}
              </div>

              <div className="assignment-field__hint-row">
                <small className="assignment-field__hint">{activePersonnelIds.length} personnel selected.</small>
                <button
                  type="button"
                  className="assignment-inline-btn"
                  onClick={handleToggleAllFilteredPersonnel}
                  disabled={filteredPersonnelOptions.length === 0}
                >
                  {areAllFilteredSelected ? 'Clear Filtered' : 'Select All Filtered'}
                </button>
              </div>
            </div>

            <label className="assignment-field">
              <span>Patrol Area</span>
              <div className="assignment-area-picker" ref={patrolAreaPickerRef}>
                <button
                  type="button"
                  className="settings-input w-100 assignment-area-trigger"
                  onClick={() => setIsPatrolAreaOpen((prev) => !prev)}
                  aria-expanded={isPatrolAreaOpen}
                  aria-haspopup="listbox"
                >
                  <span className="assignment-area-trigger__value">{assignmentForm.patrolArea}</span>
                  <span className="assignment-area-trigger__icon">v</span>
                </button>

                {isPatrolAreaOpen && (
                  <div className="assignment-area-dropdown">
                    <input
                      ref={patrolAreaSearchInputRef}
                      type="search"
                      className="settings-input w-100 assignment-search-input"
                      value={patrolAreaSearch}
                      onChange={(event) => setPatrolAreaSearch(event.target.value)}
                      placeholder="Search barangay, street, or highway"
                      onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                          setIsPatrolAreaOpen(false)
                          setPatrolAreaSearch('')
                        }
                      }}
                    />

                    <div className="assignment-area-options no-scrollbar" role="listbox">
                      {filteredPatrolAreas.length === 0 ? (
                        <small className="assignment-field__hint">No matching patrol area.</small>
                      ) : (
                        filteredPatrolAreas.map((area) => (
                          <button
                            key={area}
                            type="button"
                            className={`assignment-area-option${assignmentForm.patrolArea === area ? ' is-active' : ''}`}
                            onClick={() => handleSelectPatrolArea(area)}
                          >
                            {area}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </label>

            <label className="assignment-field">
              <span>Shift Start</span>
              <input
                type="datetime-local"
                className="settings-input w-100"
                value={assignmentForm.shiftStart}
                onChange={handleFormChange('shiftStart')}
              />
            </label>

            <label className="assignment-field assignment-field--notes">
              <span>Notes</span>
              <textarea
                className="settings-input w-100"
                value={assignmentForm.notes}
                onChange={handleFormChange('notes')}
                placeholder="Deployment instructions, route reminders, or priority checkpoints"
                rows={2}
              />
            </label>
          </div>

          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
            <button type="submit" className="report-generate-btn report-generate-btn--assign">
              Assign Personnel
            </button>
            {assignMessage && <small className="report-feedback">{assignMessage}</small>}
          </div>
        </form>
      </div>

      <div className="widget-card slide-up p-3 overflow-auto no-scrollbar">
        <h3 className="widget-title mb-3">Assigned Deployment List</h3>

        {assignments.length === 0 ? (
          <p className="text-body-secondary mb-0 small">No deployment assignments yet.</p>
        ) : (
          <table className="personnel-table table align-middle mb-0">
            <thead>
              <tr>
                <th>Assignment ID</th>
                <th>Personnel</th>
                <th>Patrol Area</th>
                <th>Shift Start</th>
                <th>Assigned At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="personnel-row">
                  <td className="personnel-badge">{assignment.id}</td>
                  <td>
                    <strong className="d-block assignment-personnel-name">{assignment.personnelName}</strong>
                    <small className="assignment-personnel-rank">{assignment.rank}</small>
                  </td>
                  <td>{assignment.patrolArea}</td>
                  <td>{assignment.shiftStart ? formatDateTime(assignment.shiftStart) : '-'}</td>
                  <td>{formatDateTime(assignment.assignedAt)}</td>
                  <td className="assignment-table-actions">
                    <button
                      type="button"
                      className="assignment-remove-btn"
                      onClick={() => handleRemoveAssignment(assignment.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AssignAreaPage