import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

import { REFERENCE_HOUSE_OUTPUTS } from './contract.js'
import { createReferenceHouseOutputContext } from './context.js'
import { renderBoundaryRegisterMarkdown, renderServiceRegisterMarkdown } from './reports.js'

const context = createReferenceHouseOutputContext()

const outputs = [
  [REFERENCE_HOUSE_OUTPUTS.serviceRegister.path, renderServiceRegisterMarkdown(context)],
  [REFERENCE_HOUSE_OUTPUTS.boundaryRegister.path, renderBoundaryRegisterMarkdown(context)]
] as const

for (const [path, content] of outputs) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, content, 'utf8')
}
