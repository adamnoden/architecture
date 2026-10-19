import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'

import type { DrawingScene } from '../publication-drawing/model.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import {
  PUBLICATION_PRINCIPAL_FRONT_ELEVATION_PATH,
  renderCanonicalPublicationPrincipalFrontElevation
} from './generate-publication-front-elevation.js'
import { createFrontElevationPublicationScene } from './publication-front-elevation.js'
import { createFrontElevationPublicationSource } from './publication-front-elevation-source.js'
import { createPrincipalSectionPublicationScene } from './publication-principal-section.js'
import { createPrincipalSectionPublicationSource } from './publication-principal-section-source.js'

const compiled = () => compileReferenceHouse(createReferenceHouseSource())

const levelY = (scene: DrawingScene, elevation: number): number => {
  const primitive = scene.primitives.find(
    (candidate) =>
      candidate.kind === 'line' &&
      candidate.metadata?.elevation === elevation
  )
  assert.ok(primitive && primitive.kind === 'line', `Expected level ${elevation}`)
  return primitive.a.y
}

describe('DRW-06D controlled principal-front-elevation SVG', () => {
  test('committed SVG is the exact deterministic projection of canonical sources', () => {
    const first = renderCanonicalPublicationPrincipalFrontElevation()
    const second = renderCanonicalPublicationPrincipalFrontElevation()

    assert.equal(first, second)
    assert.equal(readFileSync(PUBLICATION_PRINCIPAL_FRONT_ELEVATION_PATH, 'utf8'), first)
  })

  test('retains semantic view identity and literal physical scale in the controlled output', () => {
    const svg = renderCanonicalPublicationPrincipalFrontElevation()

    assert.match(svg, /data-view-id="REFERENCE-HOUSE-PRINCIPAL-FRONT-ELEVATION"/)
    assert.match(svg, /data-source-id="REFERENCE-HOUSE-PRINCIPAL-FRONT-ELEVATION"/)
    assert.match(svg, /data-scale-denominator="100"/)
    assert.match(svg, /width="166mm" height="92mm"/)
    assert.doesNotMatch(svg, /DRW-06|06D|packet|branch/i)
  })

  test('cross-registers all eight front openings against the canonical compiled plan substrate', () => {
    const result = compiled()
    const elevation = createFrontElevationPublicationSource()

    assert.deepEqual(result.derived.frontAxes, elevation.bayAxes.value)
    assert.equal(elevation.entranceBay.value, 3)
    assert.equal(result.derived.entranceCentre, elevation.bayAxes.value[2])

    assert.equal(elevation.openings.length, 8)
    for (const opening of elevation.openings) {
      const derived = result.derived.openings.find((candidate) => candidate.id === opening.id)
      assert.ok(derived, opening.id)
      assert.equal(derived.centre, elevation.bayAxes.value[opening.bayIndex - 1], opening.id)
    }
  })

  test('cross-registers elevation datums with the controlled principal-section scene', () => {
    const result = compiled()
    const elevationSource = createFrontElevationPublicationSource()
    const elevationScene = createFrontElevationPublicationScene(elevationSource)
    const sectionScene = createPrincipalSectionPublicationScene(
      result,
      createPrincipalSectionPublicationSource()
    )

    assert.equal(elevationScene.scaleDenominator, sectionScene.scaleDenominator)
    for (const z of [
      elevationSource.levels.groundFfl.value,
      elevationSource.levels.groundCeiling.value,
      elevationSource.levels.firstFfl.value,
      elevationSource.levels.upperCeiling.value,
      elevationSource.levels.corniceControl.value
    ]) {
      assert.equal(levelY(elevationScene, z), levelY(sectionScene, z), `level ${z}`)
    }
  })

  test('keeps absent architectural geometry absent from the controlled artifact', () => {
    const svg = renderCanonicalPublicationPrincipalFrontElevation()

    assert.match(svg, /Entrance lower termination unresolved/)
    assert.match(svg, /Provisional opening geometry/)
    assert.doesNotMatch(svg, /data-entity="[^"]*(?:ridge|canopy|panel|pilaster|seam|slab|course|roof-profile|ground-line|grade)[^"]*"/i)
  })

  test('does not invent a public elevation-marker identity merely to decorate related drawings', () => {
    const svg = renderCanonicalPublicationPrincipalFrontElevation()
    assert.doesNotMatch(svg, />\s*(?:E\d+|EL\d+|A[-–]A)\s*</i)
  })
})
