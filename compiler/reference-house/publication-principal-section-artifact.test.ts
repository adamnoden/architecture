import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'

import type { DrawingRect } from '../publication-drawing/model.js'
import { createPlanPaperProjection } from '../publication-drawing/projection.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import {
  PUBLICATION_PRINCIPAL_SECTION_PATH,
  renderCanonicalPublicationPrincipalSection
} from './generate-publication-principal-section.js'
import { createFirstFloorPublicationPlanScene } from './publication-first-floor-plan.js'
import { createFirstFloorPublicationPlanSource } from './publication-first-floor-plan-source.js'
import { createGroundFloorPublicationPlanScene } from './publication-ground-plan.js'
import { createGroundFloorPublicationPlanSource } from './publication-plan-source.js'
import { createPrincipalSectionPublicationSource } from './publication-principal-section-source.js'

const compiled = () => compileReferenceHouse(createReferenceHouseSource())
const groundSource = () => createGroundFloorPublicationPlanSource()

const rect = (scene: ReturnType<typeof createGroundFloorPublicationPlanScene>, id: string): DrawingRect => {
  const primitive = scene.primitives.find((candidate) => candidate.id === id)
  assert.ok(primitive && primitive.kind === 'rect', id)
  return primitive
}

const centreX = (box: DrawingRect): number => box.x + box.width / 2

describe('DRW-05D controlled principal-section publication SVG', () => {
  test('committed SVG is the exact deterministic projection of canonical sources', () => {
    const first = renderCanonicalPublicationPrincipalSection()
    const second = renderCanonicalPublicationPrincipalSection()

    assert.equal(first, second)
    assert.equal(readFileSync(PUBLICATION_PRINCIPAL_SECTION_PATH, 'utf8'), first)
  })

  test('retains explicit source, view and physical-scale lineage in the controlled output', () => {
    const svg = renderCanonicalPublicationPrincipalSection()

    assert.match(svg, /data-view-id="REFERENCE-HOUSE-PRINCIPAL-LONGITUDINAL-SECTION"/)
    assert.match(svg, /data-source-id="RH-C1-REFERENCE-HOUSE"/)
    assert.match(svg, /data-scale-denominator="100"/)
    assert.match(svg, /width="166mm" height="92mm"/)
    assert.doesNotMatch(svg, /DRW-05|05D|packet|branch/i)
  })

  test('cross-registers the frozen X=6000 section cut against both controlled plans', () => {
    const result = compiled()
    const section = createPrincipalSectionPublicationSource()
    const shared = groundSource()
    const ground = createGroundFloorPublicationPlanScene(result, shared)
    const first = createFirstFloorPublicationPlanScene(
      result,
      createFirstFloorPublicationPlanSource(),
      shared
    )

    assert.equal(section.view.value.cutCoordinate, result.derived.shell.centreX)
    assert.equal(section.view.value.cutCoordinate, 6000)
    assert.equal(ground.scaleDenominator, section.view.value.scale)
    assert.equal(first.scaleDenominator, section.view.value.scale)

    const planProject = createPlanPaperProjection({
      scaleDenominator: section.view.value.scale,
      modelBounds: {
        x: 0,
        y: 0,
        width: result.derived.shell.width,
        height: result.derived.shell.depth
      },
      paperOrigin: { x: 8, y: 12 }
    })
    const cutPaperX = planProject.point(section.view.value.cutCoordinate, 0).x
    assert.equal(cutPaperX, 68)

    for (const openingId of [
      'opening-G-COURT-SOUTH-PUB-01',
      'opening-G-COURT-NORTH-PUB-01',
      'opening-G-GARDEN-CENTRE-PUB-01'
    ]) {
      assert.equal(centreX(rect(ground, openingId)), cutPaperX, openingId)
    }

    for (const openingId of [
      'opening-U-COURT-SOUTH-PUB-01',
      'opening-U-COURT-NORTH-PUB-01',
      'opening-U-GARDEN-CENTRE-PUB-01'
    ]) {
      assert.equal(centreX(rect(first, openingId)), cutPaperX, openingId)
    }
  })

  test('does not invent a public A-A/S01-style section identity merely to decorate the plans', () => {
    const ground = createGroundFloorPublicationPlanScene(compiled(), groundSource())
    const values = ground.primitives
      .filter((primitive) => primitive.kind === 'text')
      .map((primitive) => primitive.value)

    assert.equal(values.some((value) => /^(?:A[-–]A|S\d+)$/i.test(value)), false)
  })
})
