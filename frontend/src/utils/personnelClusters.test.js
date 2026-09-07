import Supercluster from 'supercluster'
import { describe, expect, it, vi } from 'vitest'
import { createPersonnelClusterCache, isValidMapPosition } from './personnelClusters'

const point = (id, lng = 121.7653, flags = {}) => ({
  type: 'Feature',
  properties: { memberId: id, backup: 0, boundary: 0, operation: 0, motionDuration: 250, ...flags },
  geometry: { type: 'Point', coordinates: [lng, 17.4269] },
})
const bounds = [121, 17, 122, 18]
const setup = () => {
  const createIndex = vi.fn(() => new Supercluster({
    radius: 56, maxZoom: 17,
    map: (p) => ({ backup: p.backup }),
    reduce: (acc, p) => { acc.backup += p.backup },
  }))
  return { createIndex, cache: createPersonnelClusterCache(createIndex) }
}

describe('personnel cluster cache', () => {
  it('reuses the spatial index across reordered or identical socket payloads', () => {
    const { cache, createIndex } = setup()
    const a = cache.load([point('a'), point('b')])
    const b = cache.load([point('b'), point('a')])
    expect(a).toBe(b)
    expect(createIndex).toHaveBeenCalledTimes(1)
    const feature = a.getClusters(bounds, 14)[0]
    const index = createIndex.mock.results[0].value
    const leaves = vi.spyOn(index, 'getLeaves')
    const details = a.getClusterDetails(feature.properties.cluster_id)
    expect(a.getClusterDetails(feature.properties.cluster_id)).toBe(details)
    expect(leaves).toHaveBeenCalledTimes(1)
    expect(details.key).toBe('["a","b"]')
    expect(a.getClusters(bounds, details.expansionZoom)).toHaveLength(2)
  })

  it('rebuilds after movement, membership, status or motion timing changes', () => {
    const { cache, createIndex } = setup()
    const initial = cache.load([point('a'), point('b')])
    const moved = cache.load([point('a'), point('b', 121.99)])
    expect(moved).not.toBe(initial)
    expect(moved.getClusters(bounds, 14)).toHaveLength(2)
    const alert = cache.load([point('a'), point('b', 121.7653, { backup: 1 })])
    expect(alert.getClusters(bounds, 14)[0].properties.backup).toBe(1)
    cache.load([point('a'), point('b', 121.7653, { backup: 1, motionDuration: 500 })])
    const removed = cache.load([point('a')])
    expect(removed.getClusters(bounds, 14)).toHaveLength(1)
    expect(removed.getClusters(bounds, 14)[0].properties.memberId).toBe('a')
    expect(createIndex).toHaveBeenCalledTimes(5)
  })

  it('does not collide when officer IDs contain separators', () => {
    const { cache } = setup()
    const first = cache.load([point('a|b'), point('c')])
    const firstKey = first.getClusterDetails(first.getClusters(bounds, 14)[0].properties.cluster_id).key
    const second = cache.load([point('a'), point('b|c')])
    expect(second.getClusterDetails(second.getClusters(bounds, 14)[0].properties.cluster_id).key)
      .not.toBe(firstKey)
  })

  it('rejects null, nonnumeric, and out-of-range coordinates without rejecting zero', () => {
    for (const latitude of [null, undefined, '', NaN, Infinity, 91, -91]) {
      expect(isValidMapPosition({ latitude, longitude: 121 })).toBe(false)
    }
    expect(isValidMapPosition({ latitude: 17, longitude: 181 })).toBe(false)
    expect(isValidMapPosition({ latitude: 0, longitude: 0 })).toBe(true)
  })
})
