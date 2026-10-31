import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { assertCanonicalArtefactGenerationAllowed } from './artifact-generation.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createFutureAdaptationOverlayScene } from './publication-future-adaptation.js'

export const PUBLICATION_FUTURE_ADAPTATION_OVERLAY_PATH = 'docs/reference-house/publication-future-adaptation-overlay.svg'

export const renderCanonicalPublicationFutureAdaptationOverlay = (): string => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  assertCanonicalArtefactGenerationAllowed('DRW-10E.1', result.status)
  return renderDrawingSceneSvg(createFutureAdaptationOverlayScene())
}

export const generatePublicationFutureAdaptationOverlay = (): void => {
  const svg = renderCanonicalPublicationFutureAdaptationOverlay()
  mkdirSync(dirname(PUBLICATION_FUTURE_ADAPTATION_OVERLAY_PATH), { recursive: true })
  writeFileSync(PUBLICATION_FUTURE_ADAPTATION_OVERLAY_PATH, svg, 'utf8')
}

if (process.argv[1]?.endsWith('generate-publication-future-adaptation-overlay.ts')) {
  generatePublicationFutureAdaptationOverlay()
}
