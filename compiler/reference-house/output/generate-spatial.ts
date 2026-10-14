import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

import { REFERENCE_HOUSE_OUTPUTS } from './contract.js'
import { createReferenceHouseOutputContext } from './context.js'
import { renderReferenceHouseSpatialInspectionSet } from './spatial.js'
import { renderReferenceHouseStructuralInspection } from './structure.js'

const context = createReferenceHouseOutputContext()
const drawings = renderReferenceHouseSpatialInspectionSet(context)
const structure = renderReferenceHouseStructuralInspection(context)

const outputs = [
  [REFERENCE_HOUSE_OUTPUTS.groundFloorPlan.path, drawings.groundFloor],
  [REFERENCE_HOUSE_OUTPUTS.firstFloorPlan.path, drawings.firstFloor],
  [REFERENCE_HOUSE_OUTPUTS.principalSection.path, drawings.principalSection],
  [REFERENCE_HOUSE_OUTPUTS.firstFloorStructure.path, structure]
] as const

for (const [path, content] of outputs) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, content, 'utf8')
}
