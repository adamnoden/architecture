import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

import { REFERENCE_HOUSE_OUTPUTS } from './contract.js'
import {
  buildReferenceHouseOutputBundle,
  renderReferenceHouseOutputManifest
} from './build.js'

const bundle = buildReferenceHouseOutputBundle()
for (const { descriptor, content } of bundle.outputs) {
  await mkdir(dirname(descriptor.path), { recursive: true })
  await writeFile(descriptor.path, content, 'utf8')
}

await mkdir(dirname(REFERENCE_HOUSE_OUTPUTS.outputManifest.path), { recursive: true })
await writeFile(
  REFERENCE_HOUSE_OUTPUTS.outputManifest.path,
  renderReferenceHouseOutputManifest(bundle.manifest),
  'utf8'
)
