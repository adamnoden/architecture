import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { renderCanonicalPublicationGroundPlan } from '../../../compiler/reference-house/generate-publication-ground-plan.js'
import { renderCanonicalPublicationFirstFloorPlan } from '../../../compiler/reference-house/generate-publication-first-floor-plan.js'
import { renderCanonicalPublicationPrincipalSection } from '../../../compiler/reference-house/generate-publication-principal-section.js'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const templatePath = resolve(root, 'specimen.html')
const outputDir = resolve(root, '.work/source')
const outputPath = resolve(outputDir, 'specimen.html')

const drawings = [
  {
    marker: '<!-- CONTROLLED_GROUND_PLAN -->',
    path: resolve(repositoryRoot, 'docs/reference-house/publication-ground-floor-plan.svg'),
    render: renderCanonicalPublicationGroundPlan
  },
  {
    marker: '<!-- CONTROLLED_FIRST_FLOOR_PLAN -->',
    path: resolve(repositoryRoot, 'docs/reference-house/publication-first-floor-plan.svg'),
    render: renderCanonicalPublicationFirstFloorPlan
  },
  {
    marker: '<!-- CONTROLLED_PRINCIPAL_SECTION -->',
    path: resolve(repositoryRoot, 'docs/reference-house/publication-principal-section.svg'),
    render: renderCanonicalPublicationPrincipalSection
  }
] as const

let specimen = await readFile(templatePath, 'utf8')
for (const drawing of drawings) {
  if (!specimen.includes(drawing.marker)) throw new Error(`Missing specimen marker: ${drawing.marker}`)
  const [checkedIn, rendered] = await Promise.all([readFile(drawing.path, 'utf8'), Promise.resolve(drawing.render())])
  if (checkedIn !== rendered) throw new Error(`${drawing.path}: checked-in controlled drawing is stale; regenerate from the canonical renderer`)
  if (!rendered.startsWith('<svg ')) throw new Error(`${drawing.path}: renderer did not produce an SVG root document`)
  const inline = rendered.replace('<svg ', '<svg class="controlled-drawing" ')
  specimen = specimen.replace(drawing.marker, inline)
}

await mkdir(outputDir, { recursive: true })
await writeFile(outputPath, specimen, 'utf8')
console.log('Prepared DRW-03C.2 specimen from all three fresh controlled drawings.')
