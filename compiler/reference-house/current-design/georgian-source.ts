import { stableJsonStringify } from '../../core/identity.js'
import { layoutRevision, revisionOpenings } from '../georgian/layout-revision.js'
import { admitDesignSnapshot, type DesignSnapshot, type StoreyId, type StoreyObjectId } from './snapshot.js'

function objectId(level: StoreyId, sourceId: string): StoreyObjectId {
  return `${level}/${sourceId}`
}

function storey(level: StoreyId): DesignSnapshot['storeys'][StoreyId] {
  return {
    elevationMm: level === 'GROUND' ? layoutRevision.levels.ground : layoutRevision.levels.first,
    rooms: layoutRevision.rooms[level].map(room => ({
      id: objectId(level, room.id),
      label: room.label,
      boxes: room.boxes,
    })),
    partitions: layoutRevision.partitions[level].map(wall => ({
      id: objectId(level, wall.id),
      from: wall.a,
      to: wall.b,
    })),
    openings: revisionOpenings(level).map(opening => {
      const position = {
        id: objectId(level, opening.id),
        hostWallId: objectId(level, opening.wall),
        centreMm: opening.centre,
        widthMm: opening.width,
      }
      if (opening.kind === 'window') return { ...position, kind: 'window' }
      const swing = opening.swing ?? 'left'
      return {
        ...position,
        kind: 'door',
        operation: opening.leaves === 2
          ? { leaves: 2, swing, hinge: null }
          : { leaves: 1, swing, hinge: opening.hinge ?? 'low' },
      }
    }),
  }
}

/** The accepted Georgian basis at nominal ground/first plan scope. */
export function readGeorgianDesignSnapshot(): DesignSnapshot {
  const design = layoutRevision
  const candidate = {
    schema: 'current-design/1',
    units: 'mm',
    datum: 'south-west-at-ground-floor',
    source: { kind: 'georgian-layout-revision', id: design.id, state: 'accepted-basis' },
    envelope: { widthMm: design.shell, depthMm: design.shell, court: design.court },
    assemblyRefs: {
      envelope: 'assembly/RH-ADE-ENVELOPE',
      partition: 'assembly/RH-PART-DRY-01',
      'intermediate-floor': 'assembly/RH-SECTION-FIRST-FLOOR-RESERVATION',
    },
    assemblies: [
      { id: 'assembly/RH-ADE-ENVELOPE', role: 'envelope', state: 'nominal-reservation', depthMm: design.envelope },
      { id: 'assembly/RH-PART-DRY-01', role: 'partition', state: 'nominal-reservation', depthMm: design.partition },
      { id: 'assembly/RH-SECTION-FIRST-FLOOR-RESERVATION', role: 'intermediate-floor', state: 'nominal-reservation',
        depthMm: design.levels.first - design.levels.ceilingGround },
    ],
    storeys: { GROUND: storey('GROUND'), FIRST: storey('FIRST') },
    coverage: {
      roof: { state: 'outside-snapshot', reason: 'Roof form, attic, roof-water duty and support remain with the ROF/RWT sources.' },
      structure: { state: 'outside-snapshot', reason: 'STR spans, support grids, openings and construction checks require their owning inputs.' },
      services: { state: 'outside-snapshot', reason: 'HAD and MAT own the occupied service layout, fittings, faults and open adoption decisions.' },
      'installed-assemblies': { state: 'outside-snapshot', reason: 'IAS/OAS control selected interfaces, buildup, products and renewal. These depths are reservations.' },
    },
  }
  return admitDesignSnapshot(candidate)
}

/** Match a supplied snapshot to the exact nominal Georgian plan inputs. */
export function requireGeorgianDesignBasis(input: unknown): DesignSnapshot {
  const supplied = admitDesignSnapshot(input)
  if (supplied.source.kind !== 'georgian-layout-revision') {
    throw new TypeError('Expected the Georgian layout basis; candidate snapshots require a separate applicability decision')
  }
  const current = readGeorgianDesignSnapshot()
  if (stableJsonStringify(supplied) !== stableJsonStringify(current)) {
    throw new TypeError('Snapshot differs from the current Georgian layout inputs')
  }
  return supplied
}
