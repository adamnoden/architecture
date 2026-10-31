import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { assertCanonicalArtefactGenerationAllowed } from './artifact-generation.js'
import { compileReferenceHouse } from './compile.js'
import { createExternalMaintenancePublicationScene } from './publication-external-maintenance.js'
import { createReferenceHouseSource } from './fixture.js'

export const PUBLICATION_EXTERNAL_MAINTENANCE_PATH =
  'docs/reference-house/publication-external-maintenance-setting-overlay.svg'

export const renderCanonicalPublicationExternalMaintenanceOverlay = (): string => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  assertCanonicalArtefactGenerationAllowed('DRW-10D', result.status)
  return renderDrawingSceneSvg(createExternalMaintenancePublicationScene())
}

export const generatePublicationExternalMaintenanceOverlay = (): void => {
  const svg = renderCanonicalPublicationExternalMaintenanceOverlay()
  mkdirSync(dirname(PUBLICATION_EXTERNAL_MAINTENANCE_PATH), { recursive: true })
  writeFileSync(PUBLICATION_EXTERNAL_MAINTENANCE_PATH, svg, 'utf8')
}

if (process.argv[1]?.endsWith('generate-publication-external-maintenance-overlay.ts')) {
  generatePublicationExternalMaintenanceOverlay()
}
