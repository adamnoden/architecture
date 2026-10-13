import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderBoundaryTopologySvg } from '../boundary-slice/drawing.js'
import { assertCanonicalArtefactGenerationAllowed } from '../reference-house/artifact-generation.js'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { compileReferenceHouseBoundaryView } from './compile.js'

const here = dirname(fileURLToPath(import.meta.url))
const target = resolve(here, '../../docs/reference-house/rhc4-boundary-topology.svg')
const result = compileReferenceHouseBoundaryView(createReferenceHouseSource())

assertCanonicalArtefactGenerationAllowed('RH-C4', result.status)

mkdirSync(dirname(target), { recursive: true })
writeFileSync(
  target,
  renderBoundaryTopologySvg(result.boundaries, 'Reference House — RH-C4 envelope / boundary topology'),
  'utf8'
)
