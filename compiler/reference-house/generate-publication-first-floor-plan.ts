import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { assertCanonicalArtefactGenerationAllowed } from './artifact-generation.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createFirstFloorPublicationPlanScene } from './publication-first-floor-plan.js'
import { createFirstFloorPublicationPlanSource } from './publication-first-floor-plan-source.js'
import { createGroundFloorPublicationPlanSource } from './publication-plan-source.js'

export const PUBLICATION_FIRST_FLOOR_PLAN_PATH =
  'docs/reference-house/publication-first-floor-plan.svg'

export const renderCanonicalPublicationFirstFloorPlan = (): string => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  assertCanonicalArtefactGenerationAllowed('DRW-04C', result.status)

  return renderDrawingSceneSvg(
    createFirstFloorPublicationPlanScene(
      result,
      createFirstFloorPublicationPlanSource(),
      createGroundFloorPublicationPlanSource()
    )
  )
}

export const generatePublicationFirstFloorPlan = (): void => {
  const svg = renderCanonicalPublicationFirstFloorPlan()
  mkdirSync(dirname(PUBLICATION_FIRST_FLOOR_PLAN_PATH), { recursive: true })
  writeFileSync(PUBLICATION_FIRST_FLOOR_PLAN_PATH, svg, 'utf8')
}

if (process.argv[1]?.endsWith('generate-publication-first-floor-plan.ts')) {
  generatePublicationFirstFloorPlan()
}
