import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createLayoutFamilyScene, layoutFamilySource } from '../../compiler/reference-house/georgian/layout-family.js'
import type { DrawingPrimitiveV2, PaperPoint } from '../../compiler/publication-drawing-v2/model.js'
import { PLT_CANDIDATE_TOKENS } from '../../compiler/publication-drawing-v2/plt-candidate-tokens.js'
import { createPrimerGroundPlanScene, renderPrimerGroundPlanSvg } from './figure.js'

function relativeTo(primitive: DrawingPrimitiveV2, origin: PaperPoint): DrawingPrimitiveV2 {
  // Normalising against a shared dimension anchor compares the architectural relationship,
  // independently of the particular page-space translation used by the composition.
  const point = ({ x, y }: PaperPoint) => ({
    x: Number((x - origin.x).toFixed(9)),
    y: Number((y - origin.y).toFixed(9))
  })
  if (primitive.kind === 'line') return { ...primitive, a: point(primitive.a), b: point(primitive.b) }
  if (primitive.kind === 'path') return { ...primitive, rings: primitive.rings.map((ring) => ring.map(point)) }
  return { ...primitive, ...point(primitive) }
}

function points(primitive: DrawingPrimitiveV2): readonly PaperPoint[] {
  if (primitive.kind === 'line') return [primitive.a, primitive.b]
  if (primitive.kind === 'path') return primitive.rings.flat()
  if (primitive.kind === 'rect') return [primitive, { x: primitive.x + primitive.width, y: primitive.y + primitive.height }]
  return [primitive]
}

test('Primer retains current architectural geometry, annotation and evidence metadata', () => {
  const source = createLayoutFamilyScene('GROUND', 100)
  const before = structuredClone(source)
  const primer = createPrimerGroundPlanScene()
  const sourceAnchor = source.primitives.find((primitive) => primitive.id === 'width-dimension-line')!
  const primerAnchor = primer.primitives.find((primitive) => primitive.id === 'width-dimension-line')!
  assert.ok(sourceAnchor.kind === 'line' && primerAnchor.kind === 'line')
  const retained = source.primitives.filter((primitive) => primitive.id !== 'scope' && primitive.id !== 'clearances')
  assert.deepEqual(primer.primitives.map((primitive) => primitive.id), retained.map((primitive) => primitive.id))
  assert.deepEqual(
    primer.primitives.map((primitive) => relativeTo(primitive, primerAnchor.a)),
    retained.map((primitive) => relativeTo(primitive, sourceAnchor.a))
  )
  assert.equal(primer.sourceId, layoutFamilySource.id)
  assert.equal(primer.description, source.description)
  assert.deepEqual(source, before)
})

test('the actual-size scene keeps the top dimension and complete replacement door inside the canvas', () => {
  const scene = createPrimerGroundPlanScene()
  assert.equal(scene.scaleDenominator, 100)
  assert.equal(scene.widthMm, 158)
  assert.equal(scene.heightMm, 180)
  for (const primitive of scene.primitives) {
    for (const point of points(primitive)) {
      assert.ok(point.x >= 0 && point.x <= scene.widthMm && point.y >= 0 && point.y <= scene.heightMm,
        `${primitive.id} escapes the physical canvas`)
    }
  }
  for (const id of ['width-dimension-line', 'depth-dimension-line']) {
    const dimension = scene.primitives.find((primitive) => primitive.id === id)!
    assert.ok(dimension.kind === 'line')
    assert.equal(Math.hypot(dimension.b.x - dimension.a.x, dimension.b.y - dimension.a.y),
      layoutFamilySource.design.shell / 100)
  }
  const court = scene.primitives.find((primitive) => primitive.id === 'court-size')!
  assert.ok(court.kind === 'text')
  assert.equal(court.value, `${layoutFamilySource.design.court.width} × ${layoutFamilySource.design.court.depth}`)
  const door = scene.primitives.find((primitive) => primitive.id === 'plant-replacement-leaf-1')!
  assert.ok(door.kind === 'line')
  assert.ok(door.b.x > 145 && door.b.x < scene.widthMm - 1, 'the previously clipped door must remain complete')
  const label = scene.primitives.find((primitive) => primitive.id === 'width-label')!
  assert.ok(label.kind === 'text')
  assert.ok(label.y > PLT_CANDIDATE_TOKENS.textMm.note, 'the dimension text needs space above its baseline')
  const bar = scene.primitives.find((primitive) => primitive.id === 'scale')!
  assert.ok(bar.kind === 'line')
  assert.equal(Math.hypot(bar.b.x - bar.a.x, bar.b.y - bar.a.y), 30)
})

test('the rendered Primer drawing retains physical units, source identity and the shared tokens', () => {
  const svg = renderPrimerGroundPlanSvg()
  assert.equal(svg, renderPrimerGroundPlanSvg())
  const root = svg.split('\n', 1)[0]
  assert.match(root, /width="158mm" height="180mm" viewBox="0 0 158 180"/)
  assert.ok(root.includes(`data-source-id="${layoutFamilySource.id}"`))
  assert.match(root, /data-scale-denominator="100"/)
  assert.ok(svg.includes(`stroke-width:${PLT_CANDIDATE_TOKENS.lineMm.cut}`))
  assert.ok(svg.includes('data-entity="plant-replacement-leaf-1"'))
  assert.ok(svg.includes('data-entity="width-label"'))
})
