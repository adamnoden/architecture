import { readFileSync } from 'node:fs'

import { REFERENCE_HOUSE_OUTPUTS } from './contract.js'
import {
  buildReferenceHouseOutputBundle,
  renderReferenceHouseOutputManifest
} from './build.js'

const bundle = buildReferenceHouseOutputBundle()
const mismatches: string[] = []

for (const { descriptor, content } of bundle.outputs) {
  const committed = readFileSync(descriptor.path, 'utf8')
  if (committed !== content) mismatches.push(descriptor.path)
}

const manifest = renderReferenceHouseOutputManifest(bundle.manifest)
if (readFileSync(REFERENCE_HOUSE_OUTPUTS.outputManifest.path, 'utf8') !== manifest) {
  mismatches.push(REFERENCE_HOUSE_OUTPUTS.outputManifest.path)
}

if (mismatches.length) {
  throw new Error(`Generated successor outputs are stale: ${mismatches.join(', ')}`)
}
