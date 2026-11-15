import { admitDesignSnapshot, type DesignSnapshot } from './snapshot.js'

/** Independent orthogonal study. The current house's connected partitions stay fixed. */
export function createFreeStandingPartitionSpecimen(source: DesignSnapshot) {
  const host = 'GROUND/movable-wall'
  return admitDesignSnapshot({
    ...source,
    source: { kind: 'contrast-specimen', id: 'SPECIMEN-FREE-PARTITION', state: 'candidate' },
    envelope: { widthMm: 8600, depthMm: 10200, court: { x: 2200, y: 4400, width: 2800, depth: 2350 } },
    storeys: {
      GROUND: { elevationMm: 0, rooms: [],
        partitions: [{ id: host, from: [2600, 900], to: [2600, 3000] }, { id: 'GROUND/limit', from: [3400, 900], to: [3400, 3000] }],
        openings: [{ id: 'GROUND/workroom-door', hostWallId: host, kind: 'door', centreMm: 1800, widthMm: 825,
          operation: { leaves: 1, hinge: 'low', swing: 'left' } }] },
      FIRST: { elevationMm: 2980, rooms: [], partitions: [], openings: [] },
    },
  })
}
