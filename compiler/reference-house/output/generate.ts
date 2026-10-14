import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

import { REFERENCE_HOUSE_OUTPUTS } from './contract.js'
import {
  buildReferenceHouseSuccessorOutputs,
  renderReferenceHouseOutputManifest
} from './build.js'

const outputs = buildReferenceHouseSuccessorOutputs()
for (const { descriptor, content } of outputs) {
  await mkdir(dirname(descriptor.path), { recursive: true })
  await writeFile(descriptor.path, content, 'utf8')
}

await mkdir(dirname(REFERENCE_HOUSE_OUTPUTS.outputManifest.path), { recursive: true })
await writeFile(
  REFERENCE_HOUSE_OUTPUTS.outputManifest.path,
  renderReferenceHouseOutputManifest(outputs),
  'utf8'
)
