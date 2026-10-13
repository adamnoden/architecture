import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderBoundaryTopologySvg } from '../boundary-slice/drawing.js'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { compileReferenceHouseBoundaryView } from './compile.js'

const here = dirname(fileURLToPath(import.meta.url))
const target = resolve(here, '../../docs/reference-house/rhc4-boundary-topology.svg')
const result = compileReferenceHouseBoundaryView(createReferenceHouseSource())

if (result.status === 'FAIL') {
  throw new Error('Refusing to generate RH-C4 boundary topology from a failed compile.')
}

mkdirSync(dirname(target), { recursive: true })
writeFileSync(
  target,
  renderBoundaryTopologySvg(result.boundaries, 'Reference House — RH-C4 envelope / boundary topology'),
  'utf8'
)
