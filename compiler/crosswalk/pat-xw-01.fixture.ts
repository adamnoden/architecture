import { captureDependency } from '../p0/evidence.js'
import { createP0Fixture } from '../p0/fixture.js'
import type { EvidenceRecord, SourceModel } from '../p0/model.js'

export const createPatXw01Fixture = (): SourceModel => {
  const source = createP0Fixture()
  const primary = source.entities.find((entity) => entity.id === 'SR-01')
  if (!primary) throw new Error('P0 fixture is missing SR-01.')

  primary.attributes = {
    ...primary.attributes,
    routeRole: 'primary',
    serviceNetwork: 'NET-01'
  }

  source.entities.push({
    id: 'SR-02',
    type: 'ServiceRoute',
    levelId: 'STOREY-01',
    geometry: { kind: 'box2d', x: 2000, y: 6000, width: 1500, height: 100 },
    attributes: {
      serviceClass: 'electrical',
      routeRole: 'local-branch',
      serviceNetwork: 'NET-01'
    }
  })

  source.relationships.push(
    { id: 'CONTAINS-SR-02', type: 'contains', from: 'STOREY-01', to: 'SR-02' },
    { id: 'ADJ-SR-01-02', type: 'adjacent-to', from: 'SR-01', to: 'SR-02' },
    { id: 'ACCESS-SR-02', type: 'accessible-via', from: 'SR-02', to: 'ACCESS-01' }
  )

  source.requirements.push(
    {
      id: 'REQ-XW-P003-CONTINUITY',
      kind: 'relationship-present',
      dimension: 'architecture',
      relationshipType: 'adjacent-to',
      from: 'SR-01',
      to: 'SR-02',
      message: 'The selected primary route and local branch must remain directly continuous.',
      provenance: 'HSA-P-003'
    },
    {
      id: 'REQ-XW-P003-ACCESS-PRIMARY',
      kind: 'relationship-present',
      dimension: 'architecture',
      relationshipType: 'accessible-via',
      from: 'SR-01',
      to: 'ACCESS-01',
      message: 'The selected primary route must remain inside declared accessible service geography.',
      provenance: 'HSA-P-003'
    },
    {
      id: 'REQ-XW-P003-ACCESS-BRANCH',
      kind: 'relationship-present',
      dimension: 'architecture',
      relationshipType: 'accessible-via',
      from: 'SR-02',
      to: 'ACCESS-01',
      message: 'The selected local branch must remain inside declared accessible service geography.',
      provenance: 'HSA-P-003'
    },
    {
      id: 'REQ-XW-P005-CROSSING',
      kind: 'relationship-present',
      dimension: 'architecture',
      relationshipType: 'crosses',
      from: 'SR-01',
      to: 'WALL-EXT-01',
      message: 'The selected service crossing must be represented explicitly.',
      provenance: 'HSA-P-005'
    },
    {
      id: 'REQ-XW-P005-HOST',
      kind: 'relationship-present',
      dimension: 'architecture',
      relationshipType: 'hosts',
      from: 'WALL-EXT-01',
      to: 'PEN-01',
      message: 'The crossing must have an identified penetration owned by its host wall.',
      provenance: 'HSA-P-005'
    },
    {
      id: 'REQ-XW-P005-CARRIES',
      kind: 'relationship-present',
      dimension: 'architecture',
      relationshipType: 'carries',
      from: 'PEN-01',
      to: 'SR-01',
      message: 'The identified penetration must carry the routed service it resolves.',
      provenance: 'HSA-P-005'
    }
  )

  const thermalEvidence: EvidenceRecord = {
    id: 'E-PEN-THERMAL-XW-01',
    resolver: 'product',
    proposition: 'PEN-01 thermal transition is accepted for PAT-XW-01.',
    subjectIds: ['PEN-01', 'WALL-EXT-01'],
    source: { name: 'PAT-XW-01 thermal transition evidence', version: '1.0' },
    result: 'pass',
    obligationKeys: ['boundary:PEN-01:thermal'],
    dependencies: [
      captureDependency(source, { kind: 'entity', id: 'PEN-01', path: 'geometry' }),
      captureDependency(source, {
        kind: 'entity',
        id: 'WALL-EXT-01',
        path: 'attributes.boundaryRoles.thermal'
      })
    ]
  }
  source.evidence.push(thermalEvidence)

  return source
}
