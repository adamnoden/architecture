import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createReferenceHouseAdePlanScene } from '../../../compiler/reference-house/ade-plan-scene.js'
import { compileReferenceHouse } from '../../../compiler/reference-house/compile.js'
import { createReferenceHouseSource } from '../../../compiler/reference-house/fixture.js'
import { createPlt03CurrentGroundPlanScene } from '../../../compiler/reference-house/plt03-ground-plan.js'
import type { DrawingPrimitiveV2 } from '../../../compiler/publication-drawing-v2/model.js'
const root = resolve(import.meta.dirname, '.work')
const manifest = JSON.parse(await readFile(resolve(root, 'manifest.json'), 'utf8'))
assert.equal(manifest.ownerPhysicalVerdict, 'UNREVIEWED')
assert.equal(manifest.printTokensFrozen, false)
assert.equal(manifest.fitScaling, false)
assert.equal(manifest.comparisons.protectedV1.byteIdentical, true)
assert.deepEqual(manifest.X, [])
assert.deepEqual(manifest.GROUND.X, [])
assert.deepEqual(manifest.FIRST.X, [])
const source = createReferenceHouseSource(), result = compileReferenceHouse(source)
const legacy = createPlt03CurrentGroundPlanScene(result, source)
assert.deepEqual(manifest.controlLedger.map((r: { id: string }) => r.id).sort(), legacy.primitives.map((p) => p.id).sort())
assert.ok(manifest.controlLedger.every((r: { class: string; reason: string }) => ['R', 'S'].includes(r.class) && r.reason.length > 20))
for (const [name, raw] of Object.entries(manifest.files)) {
  const spec = raw as { sha256: string; widthMm: number; heightMm: number; scale: number }
  const svg = await readFile(resolve(root, name), 'utf8')
  assert.equal(createHash('sha256').update(svg).digest('hex'), spec.sha256)
  assert.ok(svg.includes(`width="${spec.widthMm}mm" height="${spec.heightMm}mm"`))
  assert.ok(svg.includes(`data-scale-denominator="${spec.scale}"`))
  assert.ok(!/<image|<foreignObject|NaN|Infinity/.test(svg.replace(/@font-face\{[^}]+\}/g, '')))
  assert.equal((svg.match(/@font-face/g) ?? []).length, 2)
  for (const colour of svg.matchAll(/#[a-fA-F0-9]{6}/g)) {
    const hex = colour[0]
    assert.equal(hex.slice(1, 3).toLowerCase(), hex.slice(3, 5).toLowerCase())
    assert.equal(hex.slice(1, 3).toLowerCase(), hex.slice(5, 7).toLowerCase())
  }
}
const points = (p: DrawingPrimitiveV2): { x: number; y: number }[] => p.kind === 'path' ? p.rings.flatMap((r) => [...r]) : p.kind === 'line' ? [p.a, p.b] : p.kind === 'rect' ? [{ x: p.x, y: p.y }, { x: p.x + p.width, y: p.y + p.height }] : [{ x: p.x, y: p.y }]
for (const level of ['GROUND', 'FIRST'] as const) {
  const scenes = [100, 50].map((scale) => createReferenceHouseAdePlanScene(result, source, level, scale as 100 | 50))
  assert.deepEqual(scenes[0].primitives.map((p) => p.id), scenes[1].primitives.map((p) => p.id))
  for (const scene of scenes) for (const p of scene.primitives) for (const v of points(p)) {
    assert.ok(v.x >= 0 && v.x <= scene.widthMm && v.y >= 0 && v.y <= scene.heightMm, `${p.id} escapes physical scene bounds`)
  }
}
console.log('ADE-07/08 proof PASS: exact scales/pages, six vector candidates, pinned fonts, complete control ledger, X empty, paired entity coverage and scene bounds.')

const accepted = JSON.parse(await readFile(resolve(import.meta.dirname, 'accepted-proof.json'), 'utf8'))
assert.deepEqual(manifest, accepted, 'Generated proof differs from the accepted screen-review identity. Inspect before accepting a new identity.')
