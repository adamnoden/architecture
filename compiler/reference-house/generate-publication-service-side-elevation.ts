import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { assertCanonicalArtefactGenerationAllowed } from './artifact-generation.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createServiceSideElevationPublicationScene } from './publication-service-side-elevation.js'
import { createServiceSideElevationPublicationSource } from './publication-service-side-elevation-source.js'

export const PUBLICATION_SERVICE_SIDE_ELEVATION_PATH = 'docs/reference-house/publication-service-side-elevation.svg'

export const renderCanonicalPublicationServiceSideElevation = (): string => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  assertCanonicalArtefactGenerationAllowed('DRW-08E.2', result.status)
  return renderDrawingSceneSvg(createServiceSideElevationPublicationScene(createServiceSideElevationPublicationSource()))
}

export const generatePublicationServiceSideElevation = (): void => {
  const svg = renderCanonicalPublicationServiceSideElevation()
  mkdirSync(dirname(PUBLICATION_SERVICE_SIDE_ELEVATION_PATH), { recursive: true })
  writeFileSync(PUBLICATION_SERVICE_SIDE_ELEVATION_PATH, svg, 'utf8')
}

if (process.argv[1]?.endsWith('generate-publication-service-side-elevation.ts')) generatePublicationServiceSideElevation()
