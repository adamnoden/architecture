import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { assertCanonicalArtefactGenerationAllowed } from './artifact-generation.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createStructuralSpanOverlayPublicationScene } from './publication-structural-span.js'

export const PUBLICATION_STRUCTURAL_SPAN_OVERLAY_PATH = 'docs/reference-house/publication-structural-span-overlay.svg'

export const renderCanonicalPublicationStructuralSpanOverlay = (): string => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  assertCanonicalArtefactGenerationAllowed('DRW-10A', result.status)
  return renderDrawingSceneSvg(createStructuralSpanOverlayPublicationScene())
}

export const generatePublicationStructuralSpanOverlay = (): void => {
  const svg = renderCanonicalPublicationStructuralSpanOverlay()
  mkdirSync(dirname(PUBLICATION_STRUCTURAL_SPAN_OVERLAY_PATH), { recursive: true })
  writeFileSync(PUBLICATION_STRUCTURAL_SPAN_OVERLAY_PATH, svg, 'utf8')
}

if (process.argv[1]?.endsWith('generate-publication-structural-span-overlay.ts')) {
  generatePublicationStructuralSpanOverlay()
}
