import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { assertCanonicalArtefactGenerationAllowed } from './artifact-generation.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createRoofDrainagePublicationScene } from './publication-roof-drainage.js'
import { createRoofDrainagePublicationSource } from './publication-roof-drainage-source.js'

export const PUBLICATION_ROOF_DRAINAGE_PATH =
  'docs/reference-house/publication-roof-drainage.svg'

export const renderCanonicalPublicationRoofDrainage = (): string => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  assertCanonicalArtefactGenerationAllowed('DRW-07D', result.status)

  return renderDrawingSceneSvg(
    createRoofDrainagePublicationScene(createRoofDrainagePublicationSource())
  )
}

export const generatePublicationRoofDrainage = (): void => {
  const svg = renderCanonicalPublicationRoofDrainage()
  mkdirSync(dirname(PUBLICATION_ROOF_DRAINAGE_PATH), { recursive: true })
  writeFileSync(PUBLICATION_ROOF_DRAINAGE_PATH, svg, 'utf8')
}

if (process.argv[1]?.endsWith('generate-publication-roof-drainage.ts')) {
  generatePublicationRoofDrainage()
}
