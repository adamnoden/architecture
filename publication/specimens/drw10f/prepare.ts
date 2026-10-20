import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const templatePath = resolve(root, 'specimen.html')
const outputDir = resolve(root, '.work/source')
const outputPath = resolve(outputDir, 'specimen.html')

type ControlledSheet = {
  marker: string
  path: string
  className: 'sheet-136-145' | 'sheet-166-108' | 'sheet-166-145'
}

const sheets: ControlledSheet[] = [
  { marker: '<!-- STRUCTURAL_OVERLAY -->', path: 'docs/reference-house/publication-structural-span-overlay.svg', className: 'sheet-136-145' },
  { marker: '<!-- SETTING_BASE -->', path: 'docs/reference-house/publication-synthetic-setting.svg', className: 'sheet-166-108' },
  { marker: '<!-- EXTERNAL_MAINTENANCE -->', path: 'docs/reference-house/publication-external-maintenance-setting-overlay.svg', className: 'sheet-166-108' },
  { marker: '<!-- GROUND_SERVICE -->', path: 'docs/reference-house/publication-ground-service-maintenance-overlay.svg', className: 'sheet-136-145' },
  { marker: '<!-- FIRST_SERVICE -->', path: 'docs/reference-house/publication-first-service-maintenance-overlay.svg', className: 'sheet-136-145' },
  { marker: '<!-- ROOF_BASE -->', path: 'docs/reference-house/publication-roof-drainage.svg', className: 'sheet-166-145' },
  { marker: '<!-- ROOF_FAILURE -->', path: 'docs/reference-house/publication-roof-water-failure-overlay.svg', className: 'sheet-166-145' },
  { marker: '<!-- FUTURE_ADAPTATION -->', path: 'docs/reference-house/publication-future-adaptation-overlay.svg', className: 'sheet-136-145' }
]

let prepared = await readFile(templatePath, 'utf8')

for (const sheet of sheets) {
  if (!prepared.includes(sheet.marker)) throw new Error(`DRW-10F specimen is missing marker ${sheet.marker}`)
  const svg = await readFile(resolve(repositoryRoot, sheet.path), 'utf8')
  if (!svg.startsWith('<svg ')) throw new Error(`DRW-10F controlled artifact is not an SVG root document: ${sheet.path}`)
  const inline = svg.replace('<svg ', `<svg class="controlled-sheet ${sheet.className}" `)
  prepared = prepared.replace(sheet.marker, inline)
}

for (const sheet of sheets) {
  if (prepared.includes(sheet.marker)) throw new Error(`DRW-10F marker survived preparation: ${sheet.marker}`)
}

await mkdir(outputDir, { recursive: true })
await writeFile(outputPath, prepared, 'utf8')
console.log(`Prepared ${outputPath} from ${sheets.length} frozen controlled drawings`)
