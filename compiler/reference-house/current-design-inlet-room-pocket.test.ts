import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { inletRoomPocket } from './current-design/inlet-room-pocket.js'
import { readCurrentDesignResolution } from './current-design/resolve.js'
import { readGroundSectionCase, runGroundSectionCase } from './current-design/structural-ground.js'
import { readInletSourceEnvelopeCase, runInletSourceEnvelopeCase } from './current-design/inlet-source-envelope.js'
import { readEngineeringDocument, compileEngineeringDocument } from './current-design/engineering-document.js'

const grid = JSON.parse(readFileSync(new URL('../../project/str/studies/current-house-grid.json', import.meta.url), 'utf8'))
const basis = { levels: { mineralCourse: [0, 150], dryRC: [150, 350], glass: [350, 450],
  accessibleDistribution: [450, 515], finish: [515, 530], ffl: 530, coldGridTop: -180 },
  roomPlanMm: [9397, 429.5, 2173.5, 2023.5], depthMm: 245, isolationGapMm: 50, grid,
  rcDensityKNm3: 25, mineralDensityKNm3: 20 } as const

test('ground identity binds actual inputs and its wrapper, while downstream receipt metadata cannot create self-dependency', () => {
  const current = readCurrentDesignResolution(), before = readGroundSectionCase(current),
    changedProjection = { ...current, disciplineBindings: current.disciplineBindings.map(b =>
      b.id === 'had-fixed-inlet-arrangement' ? { ...b, digest: 'new-downstream-receipt-digest' } : b) }
  assert.deepEqual(readGroundSectionCase(changedProjection), before)
  const forgedInput = { ...current, disciplineBindings: current.disciplineBindings.map(b => ({ ...b,
    identities: { ...b.identities, 'compiler/reference-house/current-design/structural-ground.ts': 'stale-wrapper' } })) }
  assert.throws(() => readGroundSectionCase(forgedInput), /differs from its current source binding/)
})

test('local Utility geometry reaches the real cold-grid top without lowering global wall DPC or FFL', () => {
  const r = inletRoomPocket(basis)
  assert.equal(r.state, 'local-room-pocket-reservation')
  assert.ok(r.local)
  assert.deepEqual(r.levels.mineralCourse, [-180, -30])
  assert.deepEqual(r.levels.dryRC, [-30, 170])
  assert.deepEqual(r.levels.glass, [170, 270])
  assert.deepEqual(r.levels.accessibleDistribution, [270, 515])
  assert.deepEqual(r.local.wallAndExteriorDpcMm, [0, 150])
  assert.deepEqual(r.local.retainedGlobal.accessibleDistribution, [450, 515])
  assert.equal(r.levels.ffl, 530)
  assert.equal(r.local.lowerPlinthRequiredMm, 0)
  assert.equal(r.local.necessaryGeometryScreen, true)
  assert.deepEqual(r.local.supportPresentAtSides, { west: true, east: true, south: true, north: true })
  assert.ok(Math.abs(r.local.contactUnionM2 - 1.688071) < 1e-9)
  assert.ok(r.local.coldGridContact.some(s => s.id === 'utility-north'))
  const summedWeight = -r.local.loadOrigins.reduce((sum, s) => sum + s.wrenchKN_KNm.Fz, 0)
  assert.ok(Math.abs(summedWeight - 25.00609925) < 1e-8)
  assert.ok(Math.abs(summedWeight - r.local.quantityBounds.slabAndMineralWeightKN) < 1e-8)
  assert.equal(r.local.quantityBounds.glassLinerCoversFramesFixturesAndUnknownPlinthWeightKN, null)
  assert.equal(r.local.structuralJoin.reactionsAtColdGridAnd52Heads, null)
  assert.equal(r.local.constructionAdmitted, false)
})

test('full250 locally intrudes5mm into the fixed cold grid; missing supports and ineffective depths stay adverse', () => {
  const deep = inletRoomPocket({ ...basis, depthMm: 250 })
  assert.ok(deep.local)
  assert.equal(deep.local.lowerPlinthRequiredMm, -5)
  assert.equal(deep.local.necessaryGeometryScreen, false)
  assert.ok(deep.local.diagnostics.includes('LOCAL_POCKET_INTRUDES_COLD_GRID'))
  const absent = inletRoomPocket({ ...basis, grid: { girders: {}, crossBeams: {}, heads: [] } })
  assert.ok(absent.local)
  assert.equal(absent.local.contactUnionM2, 0)
  assert.equal(absent.local.necessaryGeometryScreen, false)
  assert.ok(absent.local.diagnostics.includes('LOCAL_POCKET_MISSING_PERIMETER_COLD_SUPPORT'))
  assert.throws(() => inletRoomPocket({ ...basis, depthMm: 65 }), /must be deeper/)
  assert.throws(() => inletRoomPocket({ ...basis, isolationGapMm: 0 }), /Unsupported/)
  assert.equal(inletRoomPocket({ ...basis, depthMm: 0 }).state, 'uniform-ground-stack')
})

test('one source-bound room stage retains unchanged pressure and current global levels while its local outlets and DPC recompute', () => {
  const current = readCurrentDesignResolution(), request = readInletSourceEnvelopeCase(current),
    ground = runGroundSectionCase(current, readGroundSectionCase(current).ground),
    base = runInletSourceEnvelopeCase(current, request.sourceEnvelope, ground),
    run = (edit = {}) => runInletSourceEnvelopeCase(current, { ...request.sourceEnvelope, settings: { ...request.sourceEnvelope.settings,
      plantApertureNominalMm: 10.4, catchmentPocketDepthMm: 245, catchmentInvertAboveDistributionMm: 55, ...edit } }, ground),
    local = run(), raisedSource = runInletSourceEnvelopeCase(current, { ...request.sourceEnvelope,
      settings: { ...request.sourceEnvelope.settings, plantApertureNominalMm: 10.4 } }, ground)
  assert.equal(base.roomCatchment.state, 'whole-room-development-comparison')
  assert.equal(local.roomCatchment.state, 'whole-room-development-comparison')
  if (base.roomCatchment.state !== 'whole-room-development-comparison' || local.roomCatchment.state !== 'whole-room-development-comparison') return
  assert.equal(base.roomCatchment.localPocket, null)
  assert.equal(base.roomCatchment.route.fitsActualDistributionZone, false)
  assert.ok(local.roomCatchment.localPocket)
  assert.deepEqual(local.branches, raisedSource.branches)
  assert.deepEqual(local.bound, raisedSource.bound)
  assert.deepEqual(local.joinedDirection, raisedSource.joinedDirection)
  assert.equal(local.roomCatchment.route.fitsActualDistributionZone, true)
  assert.ok(Math.abs(local.roomCatchment.route.bottomAfterSettingMm - 7.41) < 1e-8)
  assert.equal(local.roomCatchment.route.topAfterSettingMm, 8)
  assert.equal(local.roomCatchment.route.outlets[0].localFloorBodyWestOverhangMm, 29)
  assert.ok(Math.abs(local.roomCatchment.route.dpcVerticalReserveMm - 137.41) < 1e-8)
  assert.deepEqual(local.roomCatchment.route.exteriorWallDpcMm, [0, 150])
  assert.equal(local.roomCatchment.sourceOnlyEvent.necessarySourceOnlyScreen, true)
  assert.equal(local.preSiteArrangementComplete, false)
  const deep = run({ catchmentPocketDepthMm: 250 })
  assert.ok(deep.roomCatchment.state === 'whole-room-development-comparison')
  assert.equal(deep.roomCatchment.localPocket?.necessaryGeometryScreen, false)
  assert.throws(() => runInletSourceEnvelopeCase(current, { ...request.sourceEnvelope, schema: 'had-inlet-source-envelope-case/5' }, ground), /Stale/)
})

test('saved design and compiler use the same local topology, invalidate its revision and undo without changing nominal plans', async () => {
  const current = readCurrentDesignResolution(), saved = await readEngineeringDocument(current.design),
    ground = readGroundSectionCase(current).ground, source = readInletSourceEnvelopeCase(current).sourceEnvelope,
    make = (depth: number) => ({ ...saved, stages: { groundSection: { caseId: ground.caseId, settings: ground.settings },
      inletSourceEnvelope: { ...source.settings, plantApertureNominalMm: 10.4, catchmentInvertAboveDistributionMm: 55, catchmentPocketDepthMm: depth } } }),
    before = await compileEngineeringDocument(make(0)), after = await compileEngineeringDocument(JSON.parse(JSON.stringify(make(245))))
  const cli = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'], {
    input: JSON.stringify(make(245)), encoding: 'utf8', maxBuffer: 24 * 1024 * 1024 }))
  assert.deepEqual(cli, JSON.parse(JSON.stringify(after)))
  assert.deepEqual(after.plans, before.plans)
  assert.deepEqual(after.occupiedServices, before.occupiedServices)
  assert.deepEqual(after.engineering.groundSection, before.engineering.groundSection)
  assert.notEqual(after.engineering.inletSourceEnvelope!.settings.catchmentPocketDepthMm,
    before.engineering.inletSourceEnvelope!.settings.catchmentPocketDepthMm)
  assert.ok(after.manifest.find(s => s.stage === 'inletSourceEnvelope')!.dependsOn.includes('groundSection'))
  assert.deepEqual(await compileEngineeringDocument(make(0)), before)
})
