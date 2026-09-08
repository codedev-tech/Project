import { ChevronDown, List } from 'lucide-react'
import { useState } from 'react'
import { MAP_STATUS_LEGEND } from '../utils/mapStatusLegend'

function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section className={`map-legend${isExpanded ? ' is-expanded' : ''}`} aria-label="Map status legend">
      <button
        type="button"
        className="map-legend__toggle"
        aria-expanded={isExpanded}
        aria-controls="live-map-legend-items"
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        <List aria-hidden="true" />
        <span>Legend</span>
        <ChevronDown className="map-legend__chevron" aria-hidden="true" />
      </button>
      <div
        id="live-map-legend-items"
        className="map-legend__content"
        aria-hidden={!isExpanded}
      >
        {MAP_STATUS_LEGEND.map((item) => (
          <div key={item.tone} className="map-legend__item">
            <span className={`map-legend__marker map-legend__marker--${item.tone}`} aria-hidden="true">
              <span>{item.cue}</span>
            </span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default MapLegend
