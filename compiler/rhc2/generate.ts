import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { assertCanonicalArtefactGenerationAllowed } from '../reference-house/artifact-generation.js'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { renderStructuralTopologySvg } from '../structure-slice/drawing.js'
import { compileReferenceHouseStructuralView } from './compile.js'

const here = dirname(fileURLToPath(import.meta.url))
const output = resolve(here, '../../docs/reference-house/rhc2-structural-topology.svg')
const result = compileReferenceHouseStructuralView(createReferenceHouseSource())

assertCanonicalArtefactGenerationAllowed('RH-C2', result.status)

await mkdir(dirname(output), { recursive: true })
await writeFile(
  output,
  renderStructuralTopologySvg(result.structure, result.plan, 'Reference House — RH-C2 structural topology'),
  'utf8'
)
