import assert from 'node:assert/strict'
import test from 'node:test'

import { createCf01ContrastSource } from '../cf01/fixture.js'
import { compilePlanSlice } from '../plan-slice/compile.js'
import type { DrawingPrimitive, DrawingScene } from './model.js'
import { createPlanPaperProjection } from './projection.js'
import { renderDrawingSceneSvg } from './svg.js'

const createContrastPublicationScene = (): DrawingScene => {
  const result = compilePlanSlice(createCf01ContrastSource())
  assert.equal(result.status, 'PASS')
  assert.deepEqual(result.diagnostics, [])

  const scaleDenominator = 100
  const margin = 7
  const project = createPlanPaperProjection({
    scaleDenominator,
    modelBounds: {
      x: 0,
      y: 0,
      width: result.derived.shell.width,
      height: result.derived.shell.depth
    },
    paperOrigin: { x: margin, y: margin }
  })

  const primitives: DrawingPrimitive[] = []

  for (const space of result.derived.spaces) {
    for (const [index, box] of space.boxes.entries()) {
      primitives.push({
        kind: 'rect',
        id: `space-${space.id}-${index + 1}`,
        ...project.rect(box),
        stroke: 'secondary',
        fill: 'faint',
        metadata: { source: space.id, provisional: space.provisional }
      })
    }

    const centre = project.point(
      space.bounds.x + space.bounds.width / 2,
      space.bounds.y + space.bounds.height / 2
    )
    primitives.push({
      kind: 'text',
      id: `label-${space.id}`,
      x: centre.x,
      y: centre.y,
      value: space.label,
      role: 'label',
      anchor: 'middle',
      metadata: { source: space.id }
    })
  }

  for (const boundary of result.derived.boundaries) {
    primitives.push({
      kind: 'line',
      id: `boundary-${boundary.id}`,
      a: project.point(boundary.x1, boundary.y1),
      b: project.point(boundary.x2, boundary.y2),
      role: boundary.kind === 'outer' ? 'cut' : 'primary',
      dash: boundary.provisional ? 'provisional' : undefined,
      metadata: { source: boundary.id, kind: boundary.kind }
    })
  }

  for (const opening of result.derived.openings) {
    if (opening.centre === undefined) continue
    const host = result.derived.boundaries.find((boundary) => boundary.id === opening.hostBoundaryId)
    assert.ok(host, `opening ${opening.id} lost host ${opening.hostBoundaryId}`)

    const centre = host.orientation === 'horizontal'
      ? project.point(opening.centre, host.y1)
      : project.point(host.x1, opening.centre)
    const halfMarker = 0.9
    primitives.push({
      kind: 'line',
      id: `opening-${opening.id}`,
      a: host.orientation === 'horizontal'
        ? { x: centre.x, y: centre.y - halfMarker }
        : { x: centre.x - halfMarker, y: centre.y },
      b: host.orientation === 'horizontal'
        ? { x: centre.x, y: centre.y + halfMarker }
        : { x: centre.x + halfMarker, y: centre.y },
      role: 'primary',
      metadata: { host: opening.hostBoundaryId, source: opening.id }
    })
  }

  return {
    widthMm: project.length(result.derived.shell.width) + margin * 2,
    heightMm: project.length(result.derived.shell.depth) + margin * 2,
    viewId: 'DRW-12C-CF01-PLAN',
    title: 'CF-01 contrast house — publication renderer proof',
    description: 'Non-Reference-House synthetic plan compiled through the neutral plan compiler and shared publication drawing renderer.',
    scaleDenominator,
    sourceId: result.fixtureId,
    primitives
  }
}

const assertFinitePoint = (x: number, y: number, id: string): void => {
  assert.ok(Number.isFinite(x) && Number.isFinite(y), `${id} has non-finite coordinates`)
}

test('DRW-12C renders a non-RH01 asymmetric one-storey fixture through the shared publication renderer', () => {
  const scene = createContrastPublicationScene()
  const svg = renderDrawingSceneSvg(scene)

  assert.equal(scene.widthMm, 110)
  assert.equal(scene.heightMm, 86)
  assert.equal(scene.scaleDenominator, 100)
  assert.match(svg, /width="110mm" height="86mm" viewBox="0 0 110 86"/)
  assert.match(svg, /data-view-id="DRW-12C-CF01-PLAN"/)
  assert.match(svg, /data-source-id="CF-01-CONTRAST-HOUSE"/)
  assert.match(svg, /data-entity="boundary-CF-SOUTH"/)
  assert.match(svg, /data-entity="space-CF-KITCHEN-DINING-1"/)
  assert.match(svg, /data-entity="opening-CF-D01"/)
  assert.doesNotMatch(svg, /Reference House|RH-|courtyard|stair/i)
})

test('DRW-12C keeps the non-RH publication scene finite, inside paper space and ID-unique', () => {
  const scene = createContrastPublicationScene()
  const ids = new Set<string>()

  for (const primitive of scene.primitives) {
    assert.equal(ids.has(primitive.id), false, `duplicate primitive id ${primitive.id}`)
    ids.add(primitive.id)

    if (primitive.kind === 'line') {
      assertFinitePoint(primitive.a.x, primitive.a.y, primitive.id)
      assertFinitePoint(primitive.b.x, primitive.b.y, primitive.id)
      for (const point of [primitive.a, primitive.b]) {
        assert.ok(point.x >= 0 && point.x <= scene.widthMm, `${primitive.id} exceeds paper width`)
        assert.ok(point.y >= 0 && point.y <= scene.heightMm, `${primitive.id} exceeds paper height`)
      }
    } else if (primitive.kind === 'rect') {
      assertFinitePoint(primitive.x, primitive.y, primitive.id)
      assert.ok(primitive.width > 0 && primitive.height > 0, `${primitive.id} has non-positive extent`)
      assert.ok(primitive.x >= 0 && primitive.y >= 0, `${primitive.id} starts outside paper`)
      assert.ok(primitive.x + primitive.width <= scene.widthMm, `${primitive.id} exceeds paper width`)
      assert.ok(primitive.y + primitive.height <= scene.heightMm, `${primitive.id} exceeds paper height`)
    } else if (primitive.kind === 'path') {
      assert.ok(primitive.rings.length > 0, `${primitive.id} has no rings`)
      for (const [ringIndex, ring] of primitive.rings.entries()) {
        assert.ok(ring.length >= 3, `${primitive.id} ring ${ringIndex + 1} is degenerate`)
        for (const point of ring) {
          assertFinitePoint(point.x, point.y, primitive.id)
          assert.ok(point.x >= 0 && point.x <= scene.widthMm, `${primitive.id} path exceeds paper width`)
          assert.ok(point.y >= 0 && point.y <= scene.heightMm, `${primitive.id} path exceeds paper height`)
        }
      }
    } else {
      assertFinitePoint(primitive.x, primitive.y, primitive.id)
      assert.ok(primitive.x >= 0 && primitive.x <= scene.widthMm, `${primitive.id} text anchor exceeds paper width`)
      assert.ok(primitive.y >= 0 && primitive.y <= scene.heightMm, `${primitive.id} text anchor exceeds paper height`)
    }
  }
})

test('DRW-12C publication serialization is byte-deterministic, styled by shared roles and vector-only', () => {
  const a = renderDrawingSceneSvg(createContrastPublicationScene())
  const b = renderDrawingSceneSvg(createContrastPublicationScene())

  assert.equal(a, b)
  assert.match(a, /\.line-cut\{stroke:#000000;stroke-width:0\.5;/)
  assert.match(a, /\.line-primary\{stroke:#000000;stroke-width:0\.25;/)
  assert.match(a, /\.line-secondary\{stroke:#000000;stroke-width:0\.18;/)
  assert.match(a, /\.text-label\{[^}]*font-size:2\.646px;/)
  assert.match(a, /\.fill-faint\{fill:#a6a6a6;stroke:none\}/)
  assert.doesNotMatch(a, /<image\b|<foreignObject\b|data:image\//i)
})
