import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { assertCanonicalArtefactGenerationAllowed } from './artifact-generation.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createGardenElevationPublicationScene } from './publication-garden-elevation.js'
import { createGardenElevationPublicationSource } from './publication-garden-elevation-source.js'

export const PUBLICATION_GARDEN_ELEVATION_PATH = 'docs/reference-house/publication-garden-elevation.svg'

export const renderCanonicalPublicationGardenElevation = (): string => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  assertCanonicalArtefactGenerationAllowed('DRW-08C', result.status)
  return renderDrawingSceneSvg(createGardenElevationPublicationScene(createGardenElevationPublicationSource()))
}

export const generatePublicationGardenElevation = (): void => {
  const svg = renderCanonicalPublicationGardenElevation()
  mkdirSync(dirname(PUBLICATION_GARDEN_ELEVATION_PATH), { recursive: true })
  writeFileSync(PUBLICATION_GARDEN_ELEVATION_PATH, svg, 'utf8')
}

if (process.argv[1]?.endsWith('generate-publication-garden-elevation.ts')) generatePublicationGardenElevation()
