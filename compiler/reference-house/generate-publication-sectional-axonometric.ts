import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { assertCanonicalArtefactGenerationAllowed } from './artifact-generation.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createSectionalAxonometricPublicationScene } from './publication-sectional-axonometric.js'

export const PUBLICATION_SECTIONAL_AXONOMETRIC_PATH = 'docs/reference-house/publication-sectional-axonometric.svg'

export const renderCanonicalPublicationSectionalAxonometric = (): string => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  assertCanonicalArtefactGenerationAllowed('DRW-09D', result.status)
  return renderDrawingSceneSvg(createSectionalAxonometricPublicationScene())
}

export const generatePublicationSectionalAxonometric = (): void => {
  const svg = renderCanonicalPublicationSectionalAxonometric()
  mkdirSync(dirname(PUBLICATION_SECTIONAL_AXONOMETRIC_PATH), { recursive: true })
  writeFileSync(PUBLICATION_SECTIONAL_AXONOMETRIC_PATH, svg, 'utf8')
}

if (process.argv[1]?.endsWith('generate-publication-sectional-axonometric.ts')) {
  generatePublicationSectionalAxonometric()
}
