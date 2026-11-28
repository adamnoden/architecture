import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { compileEngineeringDocument, readSteelPrecastDocument } from './current-design/engineering-document.js'
import { analyseSimpleBeam } from './current-design/steel-precast-kernel.js'
import { resolveCurrentDesign } from './current-design/resolve.js'
import { runSteelPrecastCase } from './current-design/structural-steel-precast.js'

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-8 * Math.max(1, Math.abs(b)), `${a} != ${b}`)
const design = readGeorgianDesignSnapshot()

test('simple beam equilibrium, moment and deflection match independent closed-form UDL and eccentric point solutions', () => {
  const section = { id: 'test', depthMm: 300, widthMm: 200, massKgM: 1, ixxCm4: 10000 }
  const l = 6000, e = 210000, i = 1e8, w = 10
  const full = analyseSimpleBeam(l, section, e, [{ fromMm: 0, toMm: l, knM: w }], [])
  close(full.reactionsKn[0], 30); close(full.reactionsKn[1], 30)
  close(full.maximumMomentKnm, w * l ** 2 / 8 / 1e6)
  close(full.maximumDeflectionMm, 5 * w * l ** 4 / (384 * e * i))
  close(full.maxDeflectionAtMm, l / 2)
  const a = 2000, p = 30
  const point = analyseSimpleBeam(l, section, e, [], [{ atMm: a, kn: p }])
  close(point.reactionsKn[0], 20); close(point.reactionsKn[1], 10)
  close(point.maximumMomentKnm, 40)
  const x = l - Math.sqrt((l * l - a * a) / 3)
  close(point.maxDeflectionAtMm, x)
  close(point.maximumDeflectionMm, p * 1000 * a * (l - x) / (6 * l * e * i) * (l * l - a * a - (l - x) ** 2))
  const partial = analyseSimpleBeam(l, section, e, [{ fromMm: 1000, toMm: 3000, knM: 10 }], [])
  close(partial.reactionsKn[0], 40 / 3); close(partial.reactionsKn[1], 20 / 3)
  close(partial.equilibriumResidualKn, 0); close(partial.momentResidualKnm, 0)
  assert.throws(() => analyseSimpleBeam(l, section, e, [{ fromMm: 0, toMm: l + 1, knM: w }], []), /within/)
  assert.throws(() => analyseSimpleBeam(l, { ...section, ixxCm4: NaN }, e, [], []), /positive/)
})

test('the real occupied stair, void, transfer walls and independent load cases drive the comparison', async () => {
  const compile = prepareCurrentDesignCompile(design), request = await compile.readSteelPrecastCase()
  const r = await compile.steelPrecastCase(request.comparison)
  assert.deepEqual(r.geometry.stair.footprintXYWHMm, [417.5, 4432.5, 2400, 4335])
  close(r.section.requiredOrdinaryFloorZoneMm, 664.6); close(r.section.ordinaryMarginMm, 35.4)
  close(r.section.archClearanceMm, 120.4); close(r.stair.riseMm, 190)
  close(r.entrance.widthLossMm, 27.3); close(r.stair.finishedTrimmerClearanceMm, 26.35)
  close(r.floorCoverage.areaResidualM2, 0)
  assert.equal(r.floorCoverage.precastPanelizationComplete, false)
  assert.equal(r.evidence.structuralAcceptance, false)
  assert.ok(r.beams.every(b => b.screen === 'within-elastic-screen'))
  const wet = r.beams.find(b => b.id === 'rear-wet')!
  close(wet.spanMm, 2815); assert.ok(wet.loads.some(q => q.source.startsWith('gross upper masonry')))
  close(r.rearCommonBearing.combinedUltimateReactionKn, wet.ultimate.reactionsKn[0] + r.beams.find(b => b.id === 'stair-east-north')!.ultimate.reactionsKn[1])
  assert.ok(r.rearCommonBearing.planFootprintScreen)
  assert.equal(r.rearCommonBearing.receivingCapacityAndStairLandingAccepted, false)
  for (const b of r.beams) { close(b.ultimate.equilibriumResidualKn, 0); close(b.ultimate.momentResidualKnm, 0) }
  close(r.stair.flight.bearingSpanMm, 2925); close(r.stair.flight.widthMm, 1094)
  close(r.stair.flight.permanentKnM2, 25 * (0.17 / Math.cos(Math.atan(190 / 300)) + 0.190 / 2) + 0.9)
  close(r.stair.flight.upperEndDepthMm, 300)
  close(r.stair.landing.firstFflMm, 1900); close(r.stair.landing.steelTopMm, 1665)
  close(r.stair.window.sillMm, 1925); close(r.stair.window.guardUpstandAboveSteelMm, 235)
  assert.ok(r.stair.post.sourceTerritoryScreen); assert.ok(r.stair.window.sourceCoreScreen)
  close(r.stair.network.permanentBalanceResidualKn, 0); close(r.stair.network.variableBalanceResidualKn, 0)
  const header = r.beams.find(b => b.id === 'stair-upper-header')!, trimmer = r.beams.find(b => b.id === 'stair-east-south')!
  for (const id of ['stair-upper-header', 'stair-midlanding']) {
    assert.ok(r.beams.find(b => b.id === id)!.section.widthMm >= r.bearing.requiredOpposedSeatMm, 'Flights and adjacent units need opposed seats')
  }
  close(trimmer.points[0].permanentKn, header.permanent.reactionsKn[1])
  close(trimmer.points[0].atMm, 1682.5)
  assert.equal(r.stair.post.stabilityConnectionsAndBaseAccepted, false)
  const lintel = r.beams.find(b => b.id === 'east-arch-lintel')!, bath = r.beams.find(b => b.id === 'bath-north')!
  assert.deepEqual(r.eastArchReceiver.openingYMm, [6273, 7527])
  assert.deepEqual(r.eastArchReceiver.supportingAxesYMm, [6000, 7800])
  assert.equal(r.eastArchReceiver.directPierAvailable, false)
  close(lintel.spanMm, 1800); close(lintel.points[0].atMm, 500)
  close(lintel.points[0].permanentKn, bath.permanent.reactionsKn[1])
  close(lintel.points[0].variableKn, bath.variable.reactionsKn[1])
  close(r.eastArchReceiver.roomwardShiftMm, 5.9)
  assert.ok(r.eastArchReceiver.padsClearOpeningsScreen && r.eastArchReceiver.envelopeFitsScreen)
  assert.equal(r.eastArchReceiver.connectionsArchPierAndGroundAccepted, false)
  assert.deepEqual(r.westStairReceiver.openingYMm, [4100, 5100])
  assert.deepEqual(r.westStairReceiver.supportingAxesYMm, [3900, 5300])
  assert.ok(r.westStairReceiver.padsClearOpeningsScreen && r.westStairReceiver.envelopeFitsScreen)
  const westLintel = r.beams.find(b => b.id === 'stair-west-upper-lintel')!
  close(westLintel.points[0].permanentKn, header.permanent.reactionsKn[0])
  close(westLintel.points[0].atMm, 432.5)
  close(r.stairSouthBearing.loadEccentricityMm, -25)
  assert.deepEqual(r.stairSouthBearing.padXMm, [2817.5, 3117.5])
  assert.ok(r.stairSouthBearing.footprintScreen && r.stairSouthBearing.linearFullCompressionScreen)
})

test('datum, portal position and adverse actions recompute their own consequences and preserve independent controls', async () => {
  const c = prepareCurrentDesignCompile(design), { comparison } = await c.readSteelPrecastCase()
  const run = (settings: object) => c.steelPrecastCase({ ...comparison, settings: { ...comparison.settings, ...settings } })
  const base = await run({}), shallow = await run({ firstFflMm: 3450 }), stacked = await run({ portalPlacement: 'below-planks' })
  assert.ok(shallow.diagnostics.some(d => d.code === 'FLOOR_ZONE_TOO_SHALLOW'))
  assert.deepEqual(shallow.beams.filter(b => !b.id.startsWith('stair-')), base.beams.filter(b => !b.id.startsWith('stair-')))
  assert.ok(base.stair.flight.permanentKnM2 > shallow.stair.flight.permanentKnM2)
  assert.ok(base.stair.post.permanentKn > shallow.stair.post.permanentKn)
  close(base.stair.window.sillMm - shallow.stair.window.sillMm, 175)
  close(base.vertical.ridgeMm - shallow.vertical.ridgeMm, 350)
  assert.ok(stacked.diagnostics.some(d => d.code === 'PORTAL_THERMAL_ARCH_CLASH'))
  assert.deepEqual(stacked.floorCoverage, base.floorCoverage)
  const heavy = await run({ imposedLoadKnM2: 50 })
  assert.ok(heavy.diagnostics.some(d => d.code === 'BEAM_ELASTIC_SCREEN_FAIL'))
  assert.deepEqual(heavy.beams.filter(b => b.role === 'portal'), base.beams.filter(b => b.role === 'portal'))
  const nearEdge = await run({ stairBeamOffsetFromVoidMm: 100 })
  close(nearEdge.stair.finishedTrimmerClearanceMm, 1.35)
  const shifted = await run({ stairBeamOffsetFromVoidMm: 90 })
  assert.ok(shifted.diagnostics.some(d => d.code === 'STAIR_TRIMMER_CLASH'))
  assert.notEqual(shifted.beams.find(b => b.id === 'stair-east-south')!.service.totalKn, base.beams.find(b => b.id === 'stair-east-south')!.service.totalKn)
  const heavyStair = await run({ stairConstruction: { ...comparison.settings.stairConstruction, concreteWeightKnM3: 250 } })
  assert.ok(heavyStair.diagnostics.some(d => d.code === 'BEAM_ELASTIC_SCREEN_FAIL'))
  assert.deepEqual(heavyStair.beams.filter(b => !b.id.startsWith('stair-')), base.beams.filter(b => !b.id.startsWith('stair-')))
  close(heavyStair.stair.network.permanentBalanceResidualKn, 0)
  const widePost = await run({ stairConstruction: { ...comparison.settings.stairConstruction, postWidthMm: 220 } })
  assert.ok(widePost.diagnostics.some(d => d.code === 'STAIR_POST_ENVELOPE_FAIL'))
  const directBath = await run({ bathReceiver: 'direct-wall' })
  assert.ok(directBath.diagnostics.some(d => d.code === 'BATH_DIRECT_PIER_UNAVAILABLE'))
  assert.deepEqual(directBath.stair, base.stair)
  const tooSmallPad = await run({ padstoneLengthMm: 200 })
  assert.ok(tooSmallPad.diagnostics.some(d => d.code === 'REAR_COMMON_BEARING_GEOMETRY_FAIL'))
  await assert.rejects(run({ steelEMpa: 0 }), /Unsupported/)
  await assert.rejects(run({ adopted: true }), /authored fields/)
  await assert.rejects(c.steelPrecastCase({ ...comparison, bindingDigest: 'stale' }), /Stale/)
  assert.throws(() => runSteelPrecastCase(resolveCurrentDesign(design), comparison, () => Buffer.from('{}')), /Stale/)
})

test('saved engineering document, public CLI and shared compiler agree and withhold source-house applicability', async () => {
  const doc = readSteelPrecastDocument(design)
  const bundle = await compileEngineeringDocument(JSON.parse(JSON.stringify(doc)))
  const cli = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'],
    { input: JSON.stringify(doc), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }))
  assert.deepEqual(cli, JSON.parse(JSON.stringify(bundle)))
  assert.ok(bundle.manifest.filter(v => v.stage !== 'steelPrecast').every(v => v.applicability?.controllingStage === 'steelPrecast'))
  assert.equal(bundle.engineering.steelPrecast!.source.caseDigest, cli.engineering.steelPrecast!.source.caseDigest)
  assert.ok(bundle.coordinationDiagnostics.some(v => v.code === 'STEEL_PRECAST_NOT_JOINED_TO_SOURCE_HOUSE'))
  const stale = { ...doc, bindings: { ...doc.bindings, authoredDefaults: { ...doc.bindings.authoredDefaults, 'project/str/studies/steel-precast-inputs.json': 'stale' } } }
  await assert.rejects(compileEngineeringDocument(stale), /Stale engineering/)
})
