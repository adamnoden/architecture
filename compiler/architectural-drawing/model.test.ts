import assert from 'node:assert/strict'
import test from 'node:test'

import { mm } from '../units.js'
import type { AdeArchitecturalPlan, AdeProvenance } from './model.js'
import { modelMmToPaperMm, physicalPaperMm, type AdeRepresentationProfile } from './profile.js'
import { validateArchitecturalPlan } from './validate.js'

const controlledExact: AdeProvenance = {
  sourceIds: ['FIXTURE-SOURCE'],
  authority: 'controlled',
  precision: 'exact'
}

const provisionalRange: AdeProvenance = {
  sourceIds: ['FIXTURE-RANGE'],
  authority: 'provisional',
  precision: 'range'
}

const fixture = (): AdeArchitecturalPlan => ({
  id: 'ADE-01-FIXTURE',
  sourceId: 'ADE-01-SYNTHETIC',
  nodes: [
    { kind: 'node', id: 'N1', point: { x: mm(0), y: mm(0) }, provenance: controlledExact },
    { kind: 'node', id: 'N2', point: { x: mm(6000), y: mm(0) }, provenance: controlledExact },
    { kind: 'node', id: 'N3', point: { x: mm(3000), y: mm(0) }, provenance: controlledExact },
    { kind: 'node', id: 'N4', point: { x: mm(3000), y: mm(4000) }, provenance: controlledExact }
  ],
  wallAssemblies: [
    {
      kind: 'wall-assembly',
      id: 'WA-EXT',
      thickness: { kind: 'range', min: mm(400), max: mm(425) },
      provenance: provisionalRange
    }
  ],
  walls: [
    {
      kind: 'wall',
      id: 'W-SOUTH',
      fromNodeId: 'N1',
      toNodeId: 'N2',
      reference: 'left-face',
      assemblyId: 'WA-EXT',
      provenance: controlledExact
    }
  ],
  openings: [
    {
      kind: 'opening',
      id: 'O-01',
      hostWallId: 'W-SOUTH',
      role: 'window',
      centreOffset: { kind: 'exact', value: mm(3000) },
      width: { kind: 'range', min: mm(900), max: mm(1100) },
      provenance: provisionalRange
    }
  ],
  partitionDatums: [
    {
      kind: 'partition-datum',
      id: 'P-DATUM-01',
      fromNodeId: 'N3',
      toNodeId: 'N4',
      provenance: { sourceIds: ['FIXTURE-PARTITION'], authority: 'provisional', precision: 'qualitative' }
    }
  ],
  spaces: [
    { kind: 'space', id: 'S-A', label: 'Room A', provenance: controlledExact },
    { kind: 'space', id: 'S-B', label: 'Room B', provenance: controlledExact }
  ],
  adjacencies: [
    {
      kind: 'adjacency',
      id: 'ADJ-01',
      between: ['S-A', 'S-B'],
      candidateSegments: [{ a: { x: mm(3000), y: mm(0) }, b: { x: mm(3000), y: mm(4000) } }],
      provenance: { sourceIds: ['FIXTURE-ADJ'], authority: 'controlled', precision: 'qualitative' }
    }
  ],
  dimensions: [
    {
      kind: 'dimension',
      id: 'DIM-OVERALL',
      a: { x: mm(0), y: mm(0) },
      b: { x: mm(6000), y: mm(0) },
      label: '6000',
      provenance: controlledExact
    }
  ],
  labels: [
    {
      kind: 'label',
      id: 'LABEL-A',
      text: 'Room A',
      anchor: { x: mm(1500), y: mm(2000) },
      role: 'space',
      targetId: 'S-A',
      provenance: controlledExact
    }
  ]
})

test('ADE-01 semantic fixture is valid without turning a partition datum into a wall', () => {
  const plan = fixture()
  assert.deepEqual(validateArchitecturalPlan(plan), [])

  const datum = plan.partitionDatums[0]
  assert.equal(datum.kind, 'partition-datum')
  assert.equal('assemblyId' in datum, false)
  assert.equal('thickness' in datum, false)
  assert.equal(plan.adjacencies[0].kind, 'adjacency')
  assert.equal(plan.openings[0].hostWallId, 'W-SOUTH')
})

test('ADE-01 separates architectural scale from physical-paper notation', () => {
  const book100: AdeRepresentationProfile = { id: 'BOOK-100', scaleDenominator: 100, output: 'BOOK' }
  const wall50: AdeRepresentationProfile = { id: 'WALL-50', scaleDenominator: 50, output: 'WALL' }

  assert.equal(modelMmToPaperMm(mm(1000), book100), 10)
  assert.equal(modelMmToPaperMm(mm(1000), wall50), 20)

  const markerMm = 2
  assert.equal(physicalPaperMm(markerMm), 2)
  assert.equal(physicalPaperMm(markerMm), 2)
})

test('ADE-01 rejects a physical wall without a known assembly', () => {
  const plan = fixture()
  const invalid: AdeArchitecturalPlan = {
    ...plan,
    walls: [{ ...plan.walls[0], assemblyId: 'MISSING' }]
  }

  assert.ok(validateArchitecturalPlan(invalid).some((item) => item.code === 'ADE-WALL-ASSEMBLY'))
})

test('ADE-01 rejects an opening hosted by something other than a physical wall', () => {
  const plan = fixture()
  const invalid: AdeArchitecturalPlan = {
    ...plan,
    openings: [{ ...plan.openings[0], hostWallId: 'P-DATUM-01' }]
  }

  assert.ok(validateArchitecturalPlan(invalid).some((item) => item.code === 'ADE-OPENING-HOST'))
})

test('ADE-01 runtime guard rejects physical fields smuggled onto an unresolved partition datum', () => {
  const plan = fixture()
  const pollutedDatum = {
    ...plan.partitionDatums[0],
    assemblyId: 'WA-EXT',
    thickness: 125
  } as unknown as AdeArchitecturalPlan['partitionDatums'][number]
  const invalid: AdeArchitecturalPlan = { ...plan, partitionDatums: [pollutedDatum] }

  const codes = validateArchitecturalPlan(invalid).map((item) => item.code)
  assert.ok(codes.includes('ADE-PARTITION-PHYSICAL-FIELD'))
})

test('ADE-01 rejects duplicate semantic IDs and malformed numeric authority', () => {
  const plan = fixture()
  const invalid: AdeArchitecturalPlan = {
    ...plan,
    wallAssemblies: [
      { ...plan.wallAssemblies[0], id: 'N1', thickness: { kind: 'range', min: mm(425), max: mm(400) } }
    ]
  }

  const codes = validateArchitecturalPlan(invalid).map((item) => item.code)
  assert.ok(codes.includes('ADE-DUPLICATE-ID'))
  assert.ok(codes.includes('ADE-DISTANCE-RANGE'))
})
