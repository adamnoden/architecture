import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import {
  createFirstServiceMaintenanceOverlayScene,
  createGroundServiceMaintenanceOverlayScene
} from './publication-service-maintenance.js'

const HERE = dirname(fileURLToPath(import.meta.url))

export const PUBLICATION_GROUND_SERVICE_MAINTENANCE_PATH = resolve(
  HERE,
  '../../docs/reference-house/publication-ground-service-maintenance-overlay.svg'
)
export const PUBLICATION_FIRST_SERVICE_MAINTENANCE_PATH = resolve(
  HERE,
  '../../docs/reference-house/publication-first-service-maintenance-overlay.svg'
)

export const renderCanonicalGroundServiceMaintenanceOverlay = (): string =>
  renderDrawingSceneSvg(createGroundServiceMaintenanceOverlayScene())

export const renderCanonicalFirstServiceMaintenanceOverlay = (): string =>
  renderDrawingSceneSvg(createFirstServiceMaintenanceOverlayScene())

export const generatePublicationServiceMaintenanceOverlays = (): void => {
  const outputs = [
    [PUBLICATION_GROUND_SERVICE_MAINTENANCE_PATH, renderCanonicalGroundServiceMaintenanceOverlay()],
    [PUBLICATION_FIRST_SERVICE_MAINTENANCE_PATH, renderCanonicalFirstServiceMaintenanceOverlay()]
  ] as const

  for (const [path, svg] of outputs) {
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, svg, 'utf8')
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generatePublicationServiceMaintenanceOverlays()
}
