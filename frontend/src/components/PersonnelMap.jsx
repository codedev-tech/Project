/**
 * PersonnelMap.jsx — Leaflet Map with Live GPS Markers
 *
 * Renders an interactive Leaflet map centred on Cabagan, Isabela and places
 * an animated circular blue marker for every officer being tracked.
 * Clicking any marker calls onSelectPersonnel so MonitoringPage can open
 * the ProfileModal with that officer's details.
 *
 * Props:
 *   personnel         {Array}    — live officer list from PersonnelContext
 *   onSelectPersonnel {Function} — callback invoked with the clicked officer object
 *
 * Map details:
 *   Center tile: 17.4227°N, 121.7701°E (Cabagan, Isabela, Philippines)
 *   Tile source: OpenStreetMap — free, no API key required
 *   Marker:      Custom L.divIcon so the pulsing CSS animation applies correctly
 */
import { MapContainer, Marker, Polygon, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import L from 'leaflet'
import { CABAGAN_BOUNDARY_COORDS, CABAGAN_CENTER } from '../utils/cabaganGeofence'

const OUTER_MASK_BOUNDS = [
  [18.2, 120.8],
  [18.2, 122.8],
  [16.2, 122.8],
  [16.2, 120.8],
]

const OUTSIDE_MASK_STYLE = {
  fillColor: '#dc2626',
  fillOpacity: 0.12,
  stroke: false,
  fillRule: 'evenodd',
}

const GEOFENCE_BORDER_STYLE = {
  color: '#dc2626',
  weight: 2,
  fillOpacity: 0,
  dashArray: '8 7',
}

function FocusCabaganOnLoad() {
  const map = useMap()

  useEffect(() => {
    map.fitBounds(CABAGAN_BOUNDARY_COORDS, {
      padding: [28, 28],
      maxZoom: 14,
      animate: false,
    })
  }, [map])

  return null
}
/**
 * Converts the current personnel status to a visual marker class.
 * Requested mapping:
 *   On Duty / On Patrol  -> green border
 *   Ongoing Case         -> red border
 * Extra mappings are included so the current sample statuses still render
 * meaningfully without changing the backend vocabulary.
 */
const getMarkerStatusClass = (status = '') => {
  const normalized = status.toLowerCase()

  if (normalized.includes('on duty') || normalized.includes('on patrol')) {
    return 'police-marker--on-duty'
  }

  if (normalized.includes('ongoing case') || normalized.includes('responding') || normalized.includes('alert')) {
    return 'police-marker--ongoing-case'
  }

  if (normalized.includes('monitor')) {
    return 'police-marker--monitoring'
  }

  return 'police-marker--default'
}

const getMarkerClass = (member) => {
  if (member.isInsideCabagan === false) {
    return 'police-marker--out-of-boundary'
  }

  return getMarkerStatusClass(member.status)
}

/**
 * Builds a custom Leaflet divIcon containing the officer photo itself.
 * This produces a marker closer to the screenshot: circular portrait,
 * colored status ring, and a small pointer at the bottom.
 */
const createPoliceMarkerIcon = (member) => {
  const statusClass = getMarkerClass(member)
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1d4ed8&color=fff&size=96`

  return L.divIcon({
    className: 'police-marker-shell',
    html: `
      <div class="police-marker ${statusClass}">
        <div class="police-marker__photo-frame">
          <img
            class="police-marker__photo"
            src="${member.photoUrl || fallbackUrl}"
            alt="${member.name}"
            onerror="this.onerror=null;this.src='${fallbackUrl}'"
          />
        </div>
      </div>
    `,
    iconSize: [54, 66],
    iconAnchor: [27, 60],
    popupAnchor: [0, -54],
  })
}

function PersonnelMap({ personnel, onSelectPersonnel }) {
  return (
    <section className="map-panel h-100 p-2">
      {/*
        MapContainer is mounted once and never re-mounts — Leaflet manages
        its own internal state. Markers are updated by React re-rendering
        the <Marker> components with new position props.
      */}
      <MapContainer center={CABAGAN_CENTER} zoom={14} scrollWheelZoom className="map-view h-100 w-100 rounded-3">
        <FocusCabaganOnLoad />

        {/* OpenStreetMap tile layer — loads the map imagery */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polygon positions={[OUTER_MASK_BOUNDS, CABAGAN_BOUNDARY_COORDS]} pathOptions={OUTSIDE_MASK_STYLE} />
        <Polygon
          positions={CABAGAN_BOUNDARY_COORDS}
          pathOptions={GEOFENCE_BORDER_STYLE}
        >
          <Tooltip sticky direction="top">
            Cabagan Geofence Boundary
          </Tooltip>
        </Polygon>

        {/* Render one marker per officer; position updates every 4 seconds */}
        {personnel.map((member) => (
          <Marker
            key={member.id}
            icon={createPoliceMarkerIcon(member)}
            position={[member.latitude, member.longitude]}
            eventHandlers={{
              // Clicking a marker opens the ProfileModal for that officer
              click: () => onSelectPersonnel(member),
            }}
          />
        ))}
      </MapContainer>
    </section>
  )
}

export default PersonnelMap
