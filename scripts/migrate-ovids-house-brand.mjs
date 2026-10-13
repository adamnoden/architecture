import { readFileSync, writeFileSync } from 'node:fs'

const files = [
  'docs/README.md',
  'docs/reference-house/README.md',
  'docs/editorial/editorial-doctrine.md',
  'docs/manuscript/readers-guide.md',
  'docs/manuscript/principle-08-repose.md',
  'docs/manuscript/part-ii.md',
  'docs/patterns/language-model.md',
  'docs/patterns/accessible-room-service-route.md',
  'docs/patterns/high-service-room-service-wall.md',
  'docs/patterns/compartmented-service-void.md',
  'docs/patterns/failure-tolerant-wet-service-room.md',
  'docs/patterns/permanent-opening-replaceable-window.md',
  'docs/patterns/movement-slip-junction.md',
  'docs/patterns/controlled-attachment-plane.md',
  'docs/patterns/source-capture-kitchen-extract.md',
  'docs/patterns/roof-maintenance-route.md',
  'docs/patterns/physical-service-index.md',
  'docs/patterns/strategies/fail-safe-water-distribution.md',
  'docs/patterns/strategies/decompose-structural-interface-functions.md',
  'docs/patterns/candidates/README.md',
  'docs/patterns/candidates/replaceable-architectural-lining.md',
  'docs/patterns/candidates/individually-isolatable-manifold-distribution.md',
  'docs/reference-house/tectonic-architectural-language.md',
  'docs/reference-house/pattern-occurrence-register.md',
  'docs/manuscript/part-v.md',
  'docs/manuscript/sources-and-further-reading.md',
  'publication/primer/outlook.md'
]

for (const path of files) {
  const before = readFileSync(path, 'utf8')
  if (!before.includes('House Kernel')) {
    throw new Error(`${path} did not contain the expected former master identity`)
  }

  const after = before
    .replaceAll("House Kernel's", 'Ovid’s House’s')
    .replaceAll('House Kernel’s', 'Ovid’s House’s')
    .replaceAll('House Kernel', 'Ovid’s House')

  if (after.includes('House Kernel')) {
    throw new Error(`${path} still contains House Kernel after migration`)
  }

  writeFileSync(path, after)
}

console.log(`Migrated ${files.length} canonical master-brand files to Ovid’s House.`)
