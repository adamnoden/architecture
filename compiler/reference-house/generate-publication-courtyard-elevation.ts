import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { assertCanonicalArtefactGenerationAllowed } from './artifact-generation.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createCourtyardElevationPublicationScene } from './publication-courtyard-elevation.js'
import { createCourtyardElevationPublicationSource } from './publication-courtyard-elevation-source.js'

export const PUBLICATION_COURTYARD_ELEVATION_PATH = 'docs/reference-house/publication-courtyard-elevation.svg'

export const renderCanonicalPublicationCourtyardElevation = (): string => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  assertCanonicalArtefactGenerationAllowed('DRW-08D', result.status)
  return renderDrawingSceneSvg(createCourtyardElevationPublicationScene(createCourtyardElevationPublicationSource()))
}

export const generatePublicationCourtyardElevation = (): void => {
  const svg = renderCanonicalPublicationCourtyardElevation()
  mkdirSync(dirname(PUBLICATION_COURTYARD_ELEVATION_PATH), { recursive: true })
  writeFileSync(PUBLICATION_COURTYARD_ELEVATION_PATH, svg, 'utf8')
}

if (process.argv[1]?.endsWith('generate-publication-courtyard-elevation.ts')) generatePublicationCourtyardElevation()
