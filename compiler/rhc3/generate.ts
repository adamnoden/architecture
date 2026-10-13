import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { renderServiceTopologySvg } from '../service-slice/drawing.js'
import { compileReferenceHouseServiceView } from './compile.js'

const result = compileReferenceHouseServiceView(createReferenceHouseSource())
if (result.services.status === 'FAIL') {
  throw new Error(`Refusing to generate RH-C3 topology: ${result.services.diagnostics.map((item) => item.code).join(', ')}`)
}

writeFileSync(
  resolve('docs/reference-house/rhc3-service-topology.svg'),
  renderServiceTopologySvg(result.services, 'RH-C3 service topology')
)
