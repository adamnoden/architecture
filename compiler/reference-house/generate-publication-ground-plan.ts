import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { assertCanonicalArtefactGenerationAllowed } from './artifact-generation.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createGroundFloorPublicationPlanScene } from './publication-ground-plan.js'
import { createGroundFloorPublicationPlanSource } from './publication-plan-source.js'

export const PUBLICATION_GROUND_PLAN_PATH = 'docs/reference-house/publication-ground-floor-plan.svg'

export const renderCanonicalPublicationGroundPlan = (): string => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  assertCanonicalArtefactGenerationAllowed('DRW-03E', result.status)

  return renderDrawingSceneSvg(
    createGroundFloorPublicationPlanScene(
      result,
      createGroundFloorPublicationPlanSource()
    )
  )
}

export const generatePublicationGroundPlan = (): void => {
  const svg = renderCanonicalPublicationGroundPlan()
  mkdirSync(dirname(PUBLICATION_GROUND_PLAN_PATH), { recursive: true })
  writeFileSync(PUBLICATION_GROUND_PLAN_PATH, svg, 'utf8')
}

if (process.argv[1]?.endsWith('generate-publication-ground-plan.ts')) {
  generatePublicationGroundPlan()
}
