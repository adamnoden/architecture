import { captureDependency } from './evidence.js'
import type { DependencyRef, EvidenceRecord, SourceModel } from './model.js'

const dependency = (kind: DependencyRef['kind'], id: string, path?: string): DependencyRef => ({
  kind,
  id,
  ...(path ? { path } : {})
})

const evidence = (
  source: SourceModel,
  record: Omit<EvidenceRecord, 'dependencies'> & { dependencyRefs: DependencyRef[] }
): EvidenceRecord => {
  const { dependencyRefs, ...rest } = record
  return {
    ...rest,
    dependencies: dependencyRefs.map((ref) => captureDependency(source, ref))
  }
}

export const createP0Fixture = (): SourceModel => {
  const source: SourceModel = {
    target: {
      id: 'P0-TARGET',
      version: '0.1.0',
      supportedGeometryKinds: ['box2d']
    },
    entities: [
      {
        id: 'STOREY-01',
        type: 'Storey',
        geometry: { kind: 'box2d', x: 0, y: 0, width: 10000, height: 8000 }
      },
      {
        id: 'ROOM-01',
        type: 'Space',
        levelId: 'STOREY-01',
        geometry: { kind: 'box2d', x: 200, y: 200, width: 4800, height: 5000 }
      },
      {
        id: 'ROOM-02',
        type: 'Space',
        levelId: 'STOREY-01',
        geometry: { kind: 'box2d', x: 5000, y: 200, width: 4800, height: 5000 }
      },
      {
        id: 'WALL-EXT-01',
        type: 'Wall',
        levelId: 'STOREY-01',
        geometry: { kind: 'box2d', x: 0, y: 0, width: 200, height: 8000 },
        attributes: {
          structural: true,
          boundaryRoles: {
            air: true,
            weather: true,
            thermal: true
          }
        }
      },
      {
        id: 'WALL-INT-01',
        type: 'Wall',
        levelId: 'STOREY-01',
        geometry: { kind: 'box2d', x: 4950, y: 0, width: 100, height: 5200 }
      },
      {
        id: 'WIN-01',
        type: 'Opening',
        levelId: 'STOREY-01',
        geometry: { kind: 'box2d', x: 0, y: 1500, width: 200, height: 1200 },
        attributes: { openingKind: 'window' }
      },
      {
        id: 'DOOR-01',
        type: 'Opening',
        levelId: 'STOREY-01',
        geometry: { kind: 'box2d', x: 4950, y: 2200, width: 100, height: 900 },
        attributes: { openingKind: 'door' }
      },
      {
        id: 'SR-01',
        type: 'ServiceRoute',
        levelId: 'STOREY-01',
        geometry: { kind: 'box2d', x: 0, y: 6000, width: 2000, height: 100 },
        attributes: { serviceClass: 'electrical' }
      },
      {
        id: 'PEN-01',
        type: 'Penetration',
        levelId: 'STOREY-01',
        geometry: { kind: 'box2d', x: 0, y: 6000, width: 200, height: 100 }
      },
      {
        id: 'ACCESS-01',
        type: 'AccessPath',
        levelId: 'STOREY-01',
        geometry: { kind: 'box2d', x: 200, y: 5700, width: 1800, height: 500 }
      }
    ],
    relationships: [
      { id: 'CONTAINS-ROOM-01', type: 'contains', from: 'STOREY-01', to: 'ROOM-01' },
      { id: 'CONTAINS-ROOM-02', type: 'contains', from: 'STOREY-01', to: 'ROOM-02' },
      { id: 'CONTAINS-WALL-EXT', type: 'contains', from: 'STOREY-01', to: 'WALL-EXT-01' },
      { id: 'CONTAINS-WALL-INT', type: 'contains', from: 'STOREY-01', to: 'WALL-INT-01' },
      { id: 'CONTAINS-WIN', type: 'contains', from: 'STOREY-01', to: 'WIN-01' },
      { id: 'CONTAINS-DOOR', type: 'contains', from: 'STOREY-01', to: 'DOOR-01' },
      { id: 'CONTAINS-SR', type: 'contains', from: 'STOREY-01', to: 'SR-01' },
      { id: 'CONTAINS-PEN', type: 'contains', from: 'STOREY-01', to: 'PEN-01' },
      { id: 'CONTAINS-ACCESS', type: 'contains', from: 'STOREY-01', to: 'ACCESS-01' },
      { id: 'ADJ-ROOMS', type: 'adjacent-to', from: 'ROOM-01', to: 'ROOM-02' },
      { id: 'HOST-WIN', type: 'hosts', from: 'WALL-EXT-01', to: 'WIN-01' },
      { id: 'HOST-DOOR', type: 'hosts', from: 'WALL-INT-01', to: 'DOOR-01' },
      { id: 'CROSS-SR-EXT', type: 'crosses', from: 'SR-01', to: 'WALL-EXT-01' },
      { id: 'HOST-PEN', type: 'hosts', from: 'WALL-EXT-01', to: 'PEN-01' },
      { id: 'CARRIES-PEN', type: 'carries', from: 'PEN-01', to: 'SR-01' },
      { id: 'ACCESS-SR', type: 'accessible-via', from: 'SR-01', to: 'ACCESS-01' }
    ],
    requirements: [
      {
        id: 'REQ-ADJ-01',
        kind: 'relationship-present',
        dimension: 'architecture',
        relationshipType: 'adjacent-to',
        from: 'ROOM-01',
        to: 'ROOM-02',
        message: 'ROOM-01 and ROOM-02 must remain directly adjacent in the P0 project configuration.'
      }
    ],
    evidence: []
  }

  source.evidence = [
    evidence(source, {
      id: 'E-WIN-AIR-01',
      resolver: 'product',
      proposition: 'WIN-01 interface can reinstate the air boundary at WALL-EXT-01.',
      subjectIds: ['WIN-01', 'WALL-EXT-01'],
      source: { name: 'P0 window interface evidence', version: '1.0' },
      result: 'pass',
      obligationKeys: ['boundary:WIN-01:air'],
      dependencyRefs: [
        dependency('entity', 'WIN-01', 'geometry'),
        dependency('entity', 'WALL-EXT-01', 'attributes.boundaryRoles.air')
      ]
    }),
    evidence(source, {
      id: 'E-WIN-WEATHER-01',
      resolver: 'product',
      proposition: 'WIN-01 interface can reinstate the weather boundary at WALL-EXT-01.',
      subjectIds: ['WIN-01', 'WALL-EXT-01'],
      source: { name: 'P0 window interface evidence', version: '1.0' },
      result: 'pass',
      obligationKeys: ['boundary:WIN-01:weather'],
      dependencyRefs: [
        dependency('entity', 'WIN-01', 'geometry'),
        dependency('entity', 'WALL-EXT-01', 'attributes.boundaryRoles.weather')
      ]
    }),
    evidence(source, {
      id: 'E-WIN-THERMAL-01',
      resolver: 'product',
      proposition: 'WIN-01 interface can reinstate the thermal boundary at WALL-EXT-01.',
      subjectIds: ['WIN-01', 'WALL-EXT-01'],
      source: { name: 'P0 window interface evidence', version: '1.0' },
      result: 'pass',
      obligationKeys: ['boundary:WIN-01:thermal'],
      dependencyRefs: [
        dependency('entity', 'WIN-01', 'geometry'),
        dependency('entity', 'WALL-EXT-01', 'attributes.boundaryRoles.thermal')
      ]
    }),
    evidence(source, {
      id: 'E-PEN-AIR-01',
      resolver: 'product',
      proposition: 'PEN-01 can reinstate the air boundary at WALL-EXT-01.',
      subjectIds: ['PEN-01', 'WALL-EXT-01'],
      source: { name: 'P0 penetration air-seal evidence', version: '1.0' },
      result: 'pass',
      obligationKeys: ['boundary:PEN-01:air'],
      dependencyRefs: [
        dependency('entity', 'PEN-01', 'geometry'),
        dependency('entity', 'WALL-EXT-01', 'attributes.boundaryRoles.air')
      ]
    }),
    evidence(source, {
      id: 'E-PEN-WEATHER-01',
      resolver: 'external-determination',
      proposition: 'A competent external determination accepts the weathering detail at PEN-01.',
      subjectIds: ['PEN-01', 'WALL-EXT-01'],
      source: { name: 'External envelope determination', version: '1.0' },
      result: 'pass',
      obligationKeys: ['boundary:PEN-01:weather'],
      dependencyRefs: [
        dependency('entity', 'PEN-01', 'geometry'),
        dependency('entity', 'WALL-EXT-01', 'attributes.boundaryRoles.weather')
      ]
    }),
    evidence(source, {
      id: 'E-PEN-STRUCT-01',
      resolver: 'external-determination',
      proposition: 'A competent structural determination accepts PEN-01 through WALL-EXT-01.',
      subjectIds: ['PEN-01', 'WALL-EXT-01'],
      source: { name: 'External structural determination', version: '1.0' },
      result: 'pass',
      obligationKeys: ['structural:PEN-01:WALL-EXT-01'],
      dependencyRefs: [
        dependency('entity', 'PEN-01', 'geometry'),
        dependency('entity', 'WALL-EXT-01', 'attributes.structural')
      ]
    })
  ]

  return source
}

export const cloneSource = (source: SourceModel): SourceModel =>
  JSON.parse(JSON.stringify(source)) as SourceModel
