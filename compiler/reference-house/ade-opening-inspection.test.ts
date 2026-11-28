import assert from 'node:assert/strict'
import test from 'node:test'
import { inspectGeorgianFrontStudyBay, inspectHostedOpening } from './construction-bay/opening-inspection.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

const ground = { bayId: 'BAY-FRONT-STUDY-01', level: 'GROUND', openingId: 'GROUND/south-window-0', hostWallId: 'GROUND/outer-south' } as const
const first = { bayId: 'BAY-UPPER-CONTROL', level: 'FIRST', openingId: 'FIRST/south-window-0', hostWallId: 'FIRST/outer-south' } as const
const accepted = readGeorgianDesignSnapshot()
const candidate = { ...accepted, source: { kind: 'contrast-specimen', id: 'SPECIMEN-BAY-WIDTH', state: 'candidate' } } as const
const widened = { ...candidate, storeys: { ...candidate.storeys, GROUND: { ...candidate.storeys.GROUND,
  openings: candidate.storeys.GROUND.openings.map(opening => opening.id === ground.openingId
    ? { ...opening, widthMm: opening.widthMm + 100 }
    : opening),
} } }

test('the nominal front Study produces a cutout and schedule row from the exact scoped bay identity', () => {
  const inspection = inspectGeorgianFrontStudyBay()
  assert.equal(inspection.source.state, 'accepted-basis')
  assert.deepEqual(inspection.sourceBindings.map(binding => binding.id).sort(), [
    'had-selected-water', 'had-occupied-services', 'str-conditional-interface', 'rwt-conditional-receiving',
    'had-inlet-indoor-reference', 'had-inlet-south-development', 'had-inlet-south-sill-insert', 'had-inlet-south-fault-envelope',
    'had-inlet-south-removal', 'had-fixed-inlet-arrangement',
    'mat-roof-pitch-reference', 'had-closed-service-floor', 'had-house-vertical-profile', 'str-vertical-floor-comparison', 'str-masonry-frame-comparison', 'ias-study-lighting', 'str-finite-joint-development', 'str-steel-precast-comparison',
  ].sort())
  assert.equal(inspection.row.hostWallId, ground.hostWallId)
  assert.equal(inspection.row.openingId, ground.openingId)
  assert.equal(inspection.row.widthMm, 1000)
  assert.deepEqual(inspection.row.axisIntervalMm, [1300, 2300])
  assert.equal(inspection.row.cutoutId, inspection.model.cutout.id)
  assert.equal(inspection.row.hostAssembly.state, 'nominal-reservation')
  assert.equal(inspection.row.unresolved.installedComponents.state, 'unresolved')
  assert.match(inspection.references.installedComponents, /oas/)
  assert.equal(inspection.technicalBayApplicability.state, 'withheld')
  assert.equal(inspection.technicalBayApplicability.reference, 'project/bcr/bay-interface-study.md')
})

test('a source perturbation moves the ADE cut and schedule without changing stable identity or the other storey', () => {
  const before = inspectHostedOpening(candidate, ground)
  const after = inspectHostedOpening(widened, ground)
  assert.equal(after.source.state, 'candidate')
  assert.deepEqual(after.sourceBindings, [])
  assert.notEqual(after.source.planDigest, before.source.planDigest)
  assert.equal(after.model.cutout.id, before.model.cutout.id)
  assert.equal(after.row.id, before.row.id)
  assert.deepEqual(after.model.cutout.rect, { ...before.model.cutout.rect, x0: 1250, x1: 2350 })
  assert.deepEqual(after.row.axisIntervalMm, [1250, 2350])
  assert.equal(after.row.widthMm, 1100)
  assert.deepEqual(inspectHostedOpening(candidate, first).row, inspectHostedOpening(widened, first).row)
})

test('a host assembly edit changes the cut depth and nominal schedule depth', () => {
  const nominal = inspectHostedOpening(candidate, ground)
  const { id, depthMm } = nominal.row.hostAssembly
  const deeper = {
    ...candidate,
    assemblies: candidate.assemblies.map(assembly => assembly.id === id
      ? { ...assembly, depthMm: depthMm + 20 }
      : assembly),
  }
  const after = inspectHostedOpening(deeper, ground)
  assert.equal(after.row.id, nominal.row.id)
  assert.equal(after.row.hostAssembly.id, id)
  assert.equal(after.row.hostAssembly.depthMm, 437.5)
  assert.equal(after.model.cutout.rect.y1, 437.5)
  assert.equal(after.row.widthMm, nominal.row.widthMm)
  assert.deepEqual(after.row.unresolved, nominal.row.unresolved)

  const removed = { ...candidate, assemblies: candidate.assemblies.filter(assembly => assembly.id !== id) }
  assert.throws(() => inspectHostedOpening(removed, ground), /unknown or incompatible assembly/)
  const renamed = { ...candidate, assemblies: candidate.assemblies.map(assembly => assembly.id === id
    ? { ...assembly, id: 'assembly/renamed' }
    : assembly) }
  assert.throws(() => inspectHostedOpening(renamed, ground), /unknown or incompatible assembly/)
})

test('wrong authority, cross-storey IDs, missing windows and mismatched hosts fail before emitting a row', () => {
  assert.throws(() => inspectHostedOpening({ ...widened, source: accepted.source }, ground), /differs from/)
  assert.throws(() => inspectHostedOpening(candidate, { ...ground, openingId: first.openingId }), /Missing opening/)
  assert.throws(() => inspectHostedOpening(candidate, { ...ground, hostWallId: 'GROUND/outer-north' }), /expected GROUND\/outer-north/)

  const groundStorey = candidate.storeys.GROUND
  const removed = groundStorey.openings.filter(opening => opening.id !== ground.openingId)
  const renamed = groundStorey.openings.map(opening => opening.id === ground.openingId
    ? { ...opening, id: 'GROUND/renamed' }
    : opening)
  for (const openings of [removed, renamed]) {
    const changed = { ...candidate, storeys: { ...candidate.storeys, GROUND: { ...groundStorey, openings } } }
    assert.throws(() => inspectHostedOpening(changed, ground), /Missing opening/)
  }
})
