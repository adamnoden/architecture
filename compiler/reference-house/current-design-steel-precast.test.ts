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
})

test('the real occupied stair, void, transfer walls and independent load cases drive the comparison', async () => {
  const compile = prepareCurrentDesignCompile(design), request = await compile.readSteelPrecastCase()
  const r = await compile.steelPrecastCase(request.comparison)
  assert.deepEqual(r.geometry.stair.footprintXYWHMm, [417.5, 4432.5, 2400, 4335])
  close(r.section.requiredOrdinaryFloorZoneMm, 715.4); close(r.section.ordinaryMarginMm, 34.6)
  close(r.section.archClearanceMm, 170.4); close(r.stair.riseMm, 192.5)
  close(r.entrance.widthLossMm, 46.9); close(r.stair.finishedTrimmerClearanceMm, 16.55)
  close(r.floorCoverage.areaResidualM2, 0)
  assert.equal(r.floorCoverage.precastPanelizationComplete, false)
  assert.equal(r.evidence.structuralAcceptance, false)
  assert.ok(r.beams.every(b => b.screen === 'within-elastic-screen'))
  const wet = r.beams.find(b => b.id === 'rear-wet')!
  close(wet.spanMm, 2815); assert.ok(wet.loads.some(q => q.source.startsWith('gross upper masonry')))
  close(r.rearCommonBearing.combinedUltimateReactionKn, wet.ultimate.reactionsKn[0] + r.beams.find(b => b.id === 'stair-east')!.ultimate.reactionsKn[1])
  assert.ok(r.rearCommonBearing.planFootprintScreen)
  assert.equal(r.rearCommonBearing.receivingCapacityAndStairLandingAccepted, false)
  for (const b of r.beams) { close(b.ultimate.equilibriumResidualKn, 0); close(b.ultimate.momentResidualKnm, 0) }
})

test('datum, portal position and adverse actions recompute their own consequences and preserve independent controls', async () => {
  const c = prepareCurrentDesignCompile(design), { comparison } = await c.readSteelPrecastCase()
  const run = (settings: object) => c.steelPrecastCase({ ...comparison, settings: { ...comparison.settings, ...settings } })
  const base = await run({}), shallow = await run({ firstFflMm: 3450 }), stacked = await run({ portalPlacement: 'below-planks' })
  assert.ok(shallow.diagnostics.some(d => d.code === 'FLOOR_ZONE_TOO_SHALLOW'))
  assert.deepEqual(shallow.beams, base.beams)
  close(base.vertical.ridgeMm - shallow.vertical.ridgeMm, 400)
  assert.ok(stacked.diagnostics.some(d => d.code === 'PORTAL_THERMAL_ARCH_CLASH'))
  assert.deepEqual(stacked.floorCoverage, base.floorCoverage)
  const heavy = await run({ imposedLoadKnM2: 50 })
  assert.ok(heavy.diagnostics.some(d => d.code === 'BEAM_ELASTIC_SCREEN_FAIL'))
  assert.deepEqual(heavy.beams.filter(b => b.role === 'portal'), base.beams.filter(b => b.role === 'portal'))
  const shifted = await run({ stairBeamOffsetFromVoidMm: 100 })
  assert.ok(shifted.diagnostics.some(d => d.code === 'STAIR_TRIMMER_CLASH'))
  assert.notEqual(shifted.beams.find(b => b.id === 'stair-east')!.service.totalKn, base.beams.find(b => b.id === 'stair-east')!.service.totalKn)
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
