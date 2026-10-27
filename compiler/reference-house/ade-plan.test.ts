import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { test } from 'node:test'
import { createReferenceHouseAdePlan } from './ade-plan.js'
import { createReferenceHouseAdePlanScene } from './ade-plan-scene.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { renderDrawingSceneV2Svg } from '../publication-drawing-v2/svg.js'
import { validateArchitecturalPlan } from '../architectural-drawing/validate.js'

const source = createReferenceHouseSource(), result = compileReferenceHouse(source)
for (const level of ['GROUND', 'FIRST'] as const) test(`${level}: source coverage, truthful partition family and stable paired-scale compilation`, () => {
  const plan = createReferenceHouseAdePlan(result, source, level)
  assert.deepEqual(validateArchitecturalPlan(plan), [])
  assert.equal(plan.partitionDatums.length, 0)
  for (const boundary of result.derived.boundaries.filter((b) => b.levelId === level && b.provisional)) {
    assert.ok(plan.nodes.filter((n) => n.provenance.sourceIds.includes(boundary.id)).every((n) => n.provenance.authority === 'provisional'), 'shared nodes cannot promote provisional boundary coordinates')
  }
  const sources = plan.walls.flatMap((w) => w.provenance.sourceIds)
  assert.ok(result.derived.boundaries.filter((b) => b.levelId === level).every((b) => sources.includes(b.id)))
  assert.equal(plan.openings.length, source.openings.filter((o) => o.levelId === level).length + source.qualitativeOpeningRelationships.filter((o) => o.levelId === level).length)
  assert.equal(plan.adjacencies.length, source.requiredAdjacencies.filter((a) => a.levelId === level).length)
  assert.equal(plan.wallAssemblies.find((a) => a.id === 'RH-PART-DRY-01')?.thickness.kind, 'range')
  const scenes = [100, 50].map((scale) => createReferenceHouseAdePlanScene(result, source, level, scale as 100 | 50))
  assert.deepEqual(scenes[0].primitives.map((p) => p.id), scenes[1].primitives.map((p) => p.id))
  for (const scene of scenes) {
    assert.ok(plan.adjacencies.every((a) => scene.primitives.some((p) => p.metadata?.between === a.between.join('|'))), 'every source adjacency remains visibly represented')
    assert.ok(scene.primitives.filter((p) => p.metadata?.topology === 'joined-wall-region' && p.metadata?.assembly === 'RH-ADE-ENVELOPE').every((p) => p.kind === 'path' && p.fill === 'none'), 'outline must not cover the cavity bands')
    assert.ok(!scene.primitives.some((p) => p.kind === 'line' && p.dash === 'provisional'))
    assert.ok(!scene.primitives.some((p) => p.kind === 'rect' && p.fill === 'paper'), 'apertures are topology subtraction, never white masks')
    const svg = renderDrawingSceneV2Svg(scene)
    assert.ok(!svg.includes('NaN'))
    const actual = createHash('sha256').update(svg).digest('hex')
    assert.equal(actual, locks[`${level}-${scene.scaleDenominator}`])
  }
})
const locks: Record<string, string> = {
  "GROUND-100": "4c23f79225498fc0790ea04e802c999a6803904532e570d0424f9dd88eff0235",
  "GROUND-50": "66b84fee2c048c29f2c7202e5f12676380a6e292c0354a89c4219d42a7a719f4",
  "FIRST-100": "7dfbe3af88d8616b6557a07af63729f3689b308d7c7c921f4b00c25b3763939b",
  "FIRST-50": "c39ccf2ccc31ce5c452178c5a9c783a80431e0d0ed7cbb7ab1977df0928b2c09"
}
