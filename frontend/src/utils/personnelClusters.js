export const isValidMapPosition = (member) => (
  typeof member?.latitude === 'number' && Number.isFinite(member.latitude)
  && typeof member?.longitude === 'number' && Number.isFinite(member.longitude)
  && Math.abs(member.latitude) <= 90 && Math.abs(member.longitude) <= 180
)

// Supercluster indexes are immutable. Reuse one until its actual inputs change;
// socket timestamps, array order, and marker animation frames do not affect it.
export const createPersonnelClusterCache = (createIndex) => {
  let signature = null
  let snapshot = null
  return {
    load(points) {
      const sorted = [...points].sort((a, b) => (
        String(a.properties.memberId).localeCompare(String(b.properties.memberId))
      ))
      const nextSignature = JSON.stringify(sorted.map(({ geometry, properties: p }) => (
        [p.memberId, ...geometry.coordinates, p.backup, p.boundary, p.operation, p.motionDuration]
      )))
      if (nextSignature === signature) return snapshot
      const index = createIndex().load(sorted)
      const details = new Map()
      snapshot = {
        getClusters: (bounds, zoom) => index.getClusters(bounds, zoom),
        getClusterDetails(clusterId) {
          if (!details.has(clusterId)) {
            const ids = index.getLeaves(clusterId, Infinity)
              .map((leaf) => String(leaf.properties.memberId)).sort()
            details.set(clusterId, {
              // JSON preserves boundaries even when IDs contain separators.
              key: JSON.stringify(ids),
              expansionZoom: index.getClusterExpansionZoom(clusterId),
            })
          }
          return details.get(clusterId)
        },
      }
      signature = nextSignature
      return snapshot
    },
  }
}
