import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { assertCanonicalArtefactGenerationAllowed } from './artifact-generation.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createServiceTransverseSectionScene } from './publication-service-section.js'
import { createServiceTransverseSectionSource } from './publication-service-section-source.js'

export const PUBLICATION_SERVICE_SECTION_PATH =
  'docs/reference-house/publication-service-transverse-section.svg'

export const renderCanonicalPublicationServiceSection = (): string => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  assertCanonicalArtefactGenerationAllowed('DRW-08B', result.status)
  return renderDrawingSceneSvg(
    createServiceTransverseSectionScene(createServiceTransverseSectionSource())
  )
}

export const generatePublicationServiceSection = (): void => {
  const svg = renderCanonicalPublicationServiceSection()
  mkdirSync(dirname(PUBLICATION_SERVICE_SECTION_PATH), { recursive: true })
  writeFileSync(PUBLICATION_SERVICE_SECTION_PATH, svg, 'utf8')
}

if (process.argv[1]?.endsWith('generate-publication-service-section.ts')) {
  generatePublicationServiceSection()
}
