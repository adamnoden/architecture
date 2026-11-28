import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { readGeorgianDesignSnapshot } from '../../../compiler/reference-house/current-design/georgian-source.js'
import { prepareCurrentDesignCompile } from '../../../compiler/reference-house/current-design/compile.js'
import { renderDrawingSceneV2Svg } from '../../../compiler/publication-drawing-v2/svg.js'

const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
const request = await compile.readSteelPrecastCase()
const baseline = await compile.steelPrecastCase(request.comparison)
const variant = (changes: Partial<typeof request.comparison.settings>) => compile.steelPrecastCase({ ...request.comparison,
  settings: { ...request.comparison.settings, ...changes } })
const shallow = await variant({ caseId: 'retained-350-floor-zone', firstFflMm: baseline.geometry.referenceFirstFflMm })
const stackedPortal = await variant({ caseId: 'portal-below-planks', portalPlacement: 'below-planks' })
const overload = await variant({ caseId: 'adverse-floor-action', imposedLoadKnM2: 50 })
assert.ok(shallow.diagnostics.some(d => d.code === 'FLOOR_ZONE_TOO_SHALLOW'))
assert.ok(stackedPortal.diagnostics.some(d => d.code === 'PORTAL_THERMAL_ARCH_CLASH'))
assert.ok(overload.diagnostics.some(d => d.code === 'BEAM_ELASTIC_SCREEN_FAIL'))
assert.deepEqual(shallow.beams, baseline.beams, 'A floor datum change must not silently alter this fixed-height wall and floor action challenge')
assert.deepEqual(stackedPortal.floorCoverage, baseline.floorCoverage)
assert.ok(Math.abs(baseline.floorCoverage.areaResidualM2) < 1e-9)
const outcome = (r: typeof baseline) => ({ caseId: r.caseId, section: r.section, vertical: r.vertical, stair: r.stair,
  beamScreens: r.beams.map(b => ({ id: b.id, screen: b.screen, elasticYieldRatio: b.elasticYieldRatio, deflectionRatio: b.deflectionRatio })),
  diagnostics: r.diagnostics, source: r.source })
const { drawings, ...record } = baseline
const outputs = new Map([
  ['steel-precast-comparison.json', JSON.stringify({ ...record, adverseCases: [outcome(shallow), outcome(stackedPortal), outcome(overload)],
    controls: { fixedLoadBeamResultsUnchangedByDatum: true, floorCoverageUnchangedByPortalPlacement: true } }, null, 2) + '\n'],
  ['steel-precast-plan.svg', renderDrawingSceneV2Svg(drawings.plan)],
  ['steel-precast-section.svg', renderDrawingSceneV2Svg(drawings.section)],
])
const check = process.argv.includes('--check')
for (const [name, bytes] of outputs) {
  const path = new URL(name, import.meta.url)
  if (check) assert.equal(readFileSync(path, 'utf8'), bytes, `Stale steel/precast output ${name}`)
  else writeFileSync(path, bytes)
}
process.stdout.write(JSON.stringify({ mode: check ? 'checked' : 'written', files: [...outputs.keys()],
  floorZoneMm: baseline.section.availableOrdinaryFloorZoneMm, ordinaryMarginMm: baseline.section.ordinaryMarginMm,
  archClearanceMm: baseline.section.archClearanceMm, beamScreens: baseline.beams.map(b => [b.id, b.screen]),
  completeFramingAccepted: false }) + '\n')
