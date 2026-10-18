import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { assertCanonicalArtefactGenerationAllowed } from './artifact-generation.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createPrincipalSectionPublicationScene } from './publication-principal-section.js'
import { createPrincipalSectionPublicationSource } from './publication-principal-section-source.js'

export const PUBLICATION_PRINCIPAL_SECTION_PATH =
  'docs/reference-house/publication-principal-section.svg'

export const renderCanonicalPublicationPrincipalSection = (): string => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  assertCanonicalArtefactGenerationAllowed('DRW-05D', result.status)

  return renderDrawingSceneSvg(
    createPrincipalSectionPublicationScene(
      result,
      createPrincipalSectionPublicationSource()
    )
  )
}

export const generatePublicationPrincipalSection = (): void => {
  const svg = renderCanonicalPublicationPrincipalSection()
  mkdirSync(dirname(PUBLICATION_PRINCIPAL_SECTION_PATH), { recursive: true })
  writeFileSync(PUBLICATION_PRINCIPAL_SECTION_PATH, svg, 'utf8')
}

if (process.argv[1]?.endsWith('generate-publication-principal-section.ts')) {
  generatePublicationPrincipalSection()
}
