import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { assertCanonicalArtefactGenerationAllowed } from './artifact-generation.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createRoofWaterFailureOverlayScene } from './publication-roof-water-failure.js'

export const PUBLICATION_ROOF_WATER_FAILURE_PATH =
  'docs/reference-house/publication-roof-water-failure-overlay.svg'

export const renderCanonicalPublicationRoofWaterFailureOverlay = (): string => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  assertCanonicalArtefactGenerationAllowed('DRW-10C', result.status)
  return renderDrawingSceneSvg(createRoofWaterFailureOverlayScene())
}

export const generatePublicationRoofWaterFailureOverlay = (): void => {
  const svg = renderCanonicalPublicationRoofWaterFailureOverlay()
  mkdirSync(dirname(PUBLICATION_ROOF_WATER_FAILURE_PATH), { recursive: true })
  writeFileSync(PUBLICATION_ROOF_WATER_FAILURE_PATH, svg, 'utf8')
}

if (process.argv[1]?.endsWith('generate-publication-roof-water-failure-overlay.ts')) {
  generatePublicationRoofWaterFailureOverlay()
}
