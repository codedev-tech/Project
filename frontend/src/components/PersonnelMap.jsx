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
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import L from 'leaflet'

// Geographic center of Cabagan, Isabela — the map loads centred here
const CABAGAN_CENTER = [17.4227, 121.7701]

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

/**
 * Builds a custom Leaflet divIcon containing the officer photo itself.
 * This produces a marker closer to the screenshot: circular portrait,
 * colored status ring, and a small pointer at the bottom.
 */
const createPoliceMarkerIcon = (member) => {
  const statusClass = getMarkerStatusClass(member.status)
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
    <section className="map-panel">
      {/*
        MapContainer is mounted once and never re-mounts — Leaflet manages
        its own internal state. Markers are updated by React re-rendering
        the <Marker> components with new position props.
      */}
      <MapContainer center={CABAGAN_CENTER} zoom={14} scrollWheelZoom className="map-view">
        {/* OpenStreetMap tile layer — loads the map imagery */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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
