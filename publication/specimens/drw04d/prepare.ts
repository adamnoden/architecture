import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const templatePath = resolve(root, 'specimen.html')
const groundPath = resolve(repositoryRoot, 'docs/reference-house/publication-ground-floor-plan.svg')
const firstPath = resolve(repositoryRoot, 'docs/reference-house/publication-first-floor-plan.svg')
const outputDir = resolve(root, '.work/source')
const outputPath = resolve(outputDir, 'specimen.html')
const groundMarker = '<!-- CONTROLLED_GROUND_PLAN -->'
const firstMarker = '<!-- CONTROLLED_FIRST_PLAN -->'

const [template, groundSvg, firstSvg] = await Promise.all([
  readFile(templatePath, 'utf8'),
  readFile(groundPath, 'utf8'),
  readFile(firstPath, 'utf8')
])

if (!template.includes(groundMarker) || !template.includes(firstMarker)) {
  throw new Error('DRW-04D specimen template is missing a controlled drawing marker.')
}
if (!groundSvg.startsWith('<svg ') || !firstSvg.startsWith('<svg ')) {
  throw new Error('DRW-04D requires both controlled plan artifacts to be SVG root documents.')
}

const groundInline = groundSvg.replace('<svg ', '<svg class="ground-plan" ')
const firstInline = firstSvg.replace('<svg ', '<svg class="first-plan" ')
const prepared = template
  .replace(groundMarker, groundInline)
  .replace(firstMarker, firstInline)

await mkdir(outputDir, { recursive: true })
await writeFile(outputPath, prepared, 'utf8')
console.log(`Prepared ${outputPath} from canonical ground + first-floor controlled SVGs`)
