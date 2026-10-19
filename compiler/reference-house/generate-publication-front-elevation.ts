import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { assertCanonicalArtefactGenerationAllowed } from './artifact-generation.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createFrontElevationPublicationScene } from './publication-front-elevation.js'
import { createFrontElevationPublicationSource } from './publication-front-elevation-source.js'

export const PUBLICATION_PRINCIPAL_FRONT_ELEVATION_PATH =
  'docs/reference-house/publication-principal-front-elevation.svg'

export const renderCanonicalPublicationPrincipalFrontElevation = (): string => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  assertCanonicalArtefactGenerationAllowed('DRW-06D', result.status)

  return renderDrawingSceneSvg(
    createFrontElevationPublicationScene(createFrontElevationPublicationSource())
  )
}

export const generatePublicationPrincipalFrontElevation = (): void => {
  const svg = renderCanonicalPublicationPrincipalFrontElevation()
  mkdirSync(dirname(PUBLICATION_PRINCIPAL_FRONT_ELEVATION_PATH), { recursive: true })
  writeFileSync(PUBLICATION_PRINCIPAL_FRONT_ELEVATION_PATH, svg, 'utf8')
}

if (process.argv[1]?.endsWith('generate-publication-front-elevation.ts')) {
  generatePublicationPrincipalFrontElevation()
}
