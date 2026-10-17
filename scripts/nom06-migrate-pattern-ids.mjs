import { readFileSync, unlinkSync, writeFileSync } from 'node:fs'

const patternTitles = new Map([
  ['PAT-001', 'Controlled Utility Entry'],
  ['PAT-002', 'Plant Room as Service Hub'],
  ['PAT-003', 'Coherent Horizontal Service Route'],
  ['PAT-004', 'High-Service-Room Service Wall'],
  ['PAT-005', 'Designed Structural Penetration'],
  ['PAT-006', 'Water-Damage-Safe Service Route'],
  ['PAT-007', 'Permanent Opening / Replaceable Window'],
  ['PAT-008', 'Movement / Slip Junction'],
  ['PAT-009', 'Accessible Rainwater Route'],
  ['PAT-010', 'Source-Capture Kitchen Extract'],
  ['PAT-011', 'Roof Maintenance Route'],
  ['PAT-012', 'Physical Service Index'],
  ['PAT-013', 'Ground-Supported Façade Access'],
  ['PAT-014', 'Accessible Vertical Service Zone'],
  ['PAT-015', 'Accessible Room Service Route'],
  ['PAT-016', 'Compartmented Service Void'],
  ['PAT-017', 'Visible Leakage Path'],
  ['PAT-018', 'Failure-Tolerant Wet Service Room'],
  ['PAT-019', 'Permanent Opening / Replaceable Door'],
  ['PAT-020', 'Designed Threshold'],
  ['PAT-021', 'Source-Capture Bathroom Extract'],
  ['PAT-022', 'Controlled Attachment Plane']
])

const patternReaderFiles = [
  'docs/delivery/riba-implementation-brief-template.md',
  'docs/patterns/candidates/local-deep-service-zone.md',
  'docs/patterns/candidates/replaceable-architectural-lining.md',
  'docs/patterns/coherent-horizontal-service-route.md',
  'docs/patterns/designed-structural-penetration.md',
  'docs/patterns/high-service-room-service-wall.md',
  'docs/patterns/language-model.md',
  'docs/patterns/physical-service-index.md',
  'docs/patterns/plant-room-service-hub.md',
  'docs/patterns/service-topology-sequence.md',
  'docs/patterns/strategies/fail-safe-water-distribution.md',
  'docs/reference-house/pattern-occurrence-register.md',
  'docs/research/replaceable-wall-system-options.md'
]

const grammarCaseFiles = [
  'docs/grammar/g01-cases/76-dean-street.md',
  'docs/grammar/g01-cases/bedford-square.md',
  'docs/grammar/g01-cases/danson-house.md',
  'docs/grammar/g01-cases/marble-hill-house.md'
]

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function update(path, transform) {
  const before = readFileSync(path, 'utf8')
  const after = transform(before)
  if (before !== after) writeFileSync(path, after)
}

function splitFrontmatter(markdown) {
  if (!markdown.startsWith('---\n')) return { frontmatter: '', body: markdown }
  const end = markdown.indexOf('\n---\n', 4)
  if (end < 0) return { frontmatter: '', body: markdown }
  return {
    frontmatter: markdown.slice(0, end + 5),
    body: markdown.slice(end + 5)
  }
}

function humanisePatternRefs(markdown) {
  const { frontmatter, body: originalBody } = splitFrontmatter(markdown)
  let body = originalBody

  for (const [id, title] of patternTitles) {
    const escapedId = escapeRegExp(id)
    const escapedTitle = escapeRegExp(title)

    body = body
      .replace(new RegExp(`\\\`${escapedId}\\\`\\s*[—-]\\s*${escapedTitle}`, 'g'), title)
      .replace(new RegExp(`${escapedId}\\s*[—-]\\s*${escapedTitle}`, 'g'), title)
      .replace(new RegExp(`${escapedTitle}\\s*[—-]\\s*\\\`${escapedId}\\\``, 'g'), title)
      .replace(new RegExp(`${escapedTitle}\\s*[—-]\\s*${escapedId}`, 'g'), title)
      .replace(new RegExp(`\\\`${escapedId}\\\``, 'g'), title)
      .replace(new RegExp(`\\b${escapedId}\\b`, 'g'), title)
      .replace(new RegExp(`${escapedTitle}\\s*[—-]\\s*${escapedTitle}`, 'g'), title)
      .replace(new RegExp(`${escapedTitle}\\s*\\(${escapedTitle}\\)`, 'g'), title)
  }

  return `${frontmatter}${body}`
}

function humaniseGrammarStages(markdown) {
  return markdown
    .replace(/\bD5\/D6\b/g, 'measurement/coupling analysis')
    .replace(/\bD5 metrics\b/g, 'dimensional metrics')
    .replace(/\bD5 dimensional seed\b/g, 'dimensional evidence')
    .replace(/\bD5 room dimensions\b/g, 'room dimensions')
    .replace(/\bD5 room-dimension\b/g, 'room-dimension')
    .replace(/\bD5 state\b/g, 'measurement state')
    .replace(/\bD5 should\b/g, 'Dimensional analysis should')
    .replace(/\bD5 work\b/g, 'dimensional analysis')
    .replace(/\bD6 work\b/g, 'plan/elevation coupling analysis')
    .replace(/\bD5\b/g, 'dimensional analysis')
    .replace(/\bD6\b/g, 'plan/elevation coupling analysis')
}

for (const path of patternReaderFiles) update(path, humanisePatternRefs)
for (const path of grammarCaseFiles) update(path, humaniseGrammarStages)

update('.vitepress/navigation.ts', (text) =>
  text.replace(/page\('PAT-\d{3}\s+—\s+([^']+)'/g, "page('$1'")
)

update('docs/README.md', (text) =>
  text.replace(
    '- Canonical pattern IDs retain the legacy **`PAT-*` namespace** for identifier stability. The prefix records the House Systems Architecture phase of the project; it is not the current project name and should not be expanded as current branding.',
    '- Canonical patterns use brand-neutral `PAT-*` machine identities for exact joins across source, evidence and computation. Pattern names remain the reader-facing identity, and the machine suffix does not encode publication order.'
  )
)

update('project/nomenclature.ts', (text) =>
  text.replace(
    "pattern: '\\\\bH1(?:-[A-Z0-9]+)*\\\\b',",
    "pattern: '\\\\bH1-[A-Z0-9]+(?:-[A-Z0-9]+)*\\\\b',"
  )
)

update('scripts/validate-public-nomenclature.ts', (text) => {
  const marker = `function sourceTextForFamily(path: string, family: NomenclatureFamily, text: string): string {\n`
  if (!text.includes(marker)) throw new Error('NOM-06 validator insertion marker changed.')

  const helper = `function isPublicMachinePath(path: string): boolean {\n  return (\n    path.startsWith('docs/reference-house/generated/') ||\n    path.includes('/docs/reference-house/generated/')\n  )\n}\n\nfunction familyAllowedOnPublicMachine(path: string, family: NomenclatureFamily): boolean {\n  return isPublicMachinePath(path) && family.allowedSurfaces.includes('PUBLIC_MACHINE')\n}\n\n`

  text = text.replace(marker, `${helper}${marker}`)
  text = text.replace(
    `  for (const family of readerProhibitedFamilies) {\n    const matches = matchesFor(family, sourceTextForFamily(path, family, text))`,
    `  for (const family of readerProhibitedFamilies) {\n    if (familyAllowedOnPublicMachine(path, family)) continue\n    const matches = matchesFor(family, sourceTextForFamily(path, family, text))`
  )
  text = text.replace(
    `  for (const family of readerProhibitedFamilies) {\n    const matches = matchesFor(family, text)`,
    `  for (const family of readerProhibitedFamilies) {\n    if (familyAllowedOnPublicMachine(path, family)) continue\n    const matches = matchesFor(family, text)`
  )
  return text
})

// Keep this as a one-shot mechanism only.
unlinkSync('scripts/nom06-migrate-pattern-ids.mjs')

console.log('NOM-06 reader-surface cleanup applied.')
