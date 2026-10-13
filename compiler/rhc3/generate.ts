import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { assertCanonicalArtefactGenerationAllowed } from '../reference-house/artifact-generation.js'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { renderServiceTopologySvg } from '../service-slice/drawing.js'
import { compileReferenceHouseServiceView } from './compile.js'

const result = compileReferenceHouseServiceView(createReferenceHouseSource())
assertCanonicalArtefactGenerationAllowed('RH-C3', result.status)

writeFileSync(
  resolve('docs/reference-house/rhc3-service-topology.svg'),
  renderServiceTopologySvg(result.services, 'RH-C3 service topology')
)
