import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const templatePath = resolve(root, 'specimen.html')
const outputDir = resolve(root, '.work/source')
const outputPath = resolve(outputDir, 'specimen.html')

const drawings = [
  ['<!-- SETTING -->', 'docs/reference-house/publication-synthetic-setting.svg', 'proof-setting'],
  ['<!-- EXTERNAL_MAINTENANCE -->', 'docs/reference-house/publication-external-maintenance-setting-overlay.svg', 'proof-maintenance'],
  ['<!-- SERVICE_GROUND -->', 'docs/reference-house/publication-ground-service-maintenance-overlay.svg', 'proof-service-ground'],
  ['<!-- SERVICE_FIRST -->', 'docs/reference-house/publication-first-service-maintenance-overlay.svg', 'proof-service-first'],
  ['<!-- ROOF -->', 'docs/reference-house/publication-roof-drainage.svg', 'proof-roof'],
  ['<!-- ROOF_FAILURE -->', 'docs/reference-house/publication-roof-water-failure-overlay.svg', 'proof-roof-failure'],
  ['<!-- STRUCTURAL -->', 'docs/reference-house/publication-structural-span-overlay.svg', 'proof-structural'],
  ['<!-- ADAPTATION -->', 'docs/reference-house/publication-future-adaptation-overlay.svg', 'proof-adaptation']
] as const

let prepared = await readFile(templatePath, 'utf8')
for (const [marker, relativePath, className] of drawings) {
  if (!prepared.includes(marker)) throw new Error(`DRW-10F specimen is missing marker ${marker}`)
  const svg = await readFile(resolve(repositoryRoot, relativePath), 'utf8')
  if (!svg.startsWith('<svg ')) throw new Error(`${relativePath} is not a canonical SVG root document`)
  prepared = prepared.replace(marker, svg.replace('<svg ', `<svg class="${className}" `))
}

await mkdir(outputDir, { recursive: true })
await writeFile(outputPath, prepared, 'utf8')
console.log(`Prepared ${outputPath} from eight controlled analytical-family SVGs`)
