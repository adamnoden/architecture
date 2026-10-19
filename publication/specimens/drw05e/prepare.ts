import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const templatePath = resolve(root, 'specimen.html')
const sectionPath = resolve(repositoryRoot, 'docs/reference-house/publication-principal-section.svg')
const outputDir = resolve(root, '.work/source')
const outputPath = resolve(outputDir, 'specimen.html')
const marker = '<!-- CONTROLLED_PRINCIPAL_SECTION -->'

const [template, sectionSvg] = await Promise.all([
  readFile(templatePath, 'utf8'),
  readFile(sectionPath, 'utf8')
])

if (!template.includes(marker)) throw new Error('DRW-05E specimen template is missing its controlled section marker.')
if (!sectionSvg.startsWith('<svg ')) throw new Error('DRW-05E requires the controlled principal section as an SVG root document.')

const sectionInline = sectionSvg.replace('<svg ', '<svg class="principal-section" ')
const prepared = template.replace(marker, sectionInline)

await mkdir(outputDir, { recursive: true })
await writeFile(outputPath, prepared, 'utf8')
console.log(`Prepared ${outputPath} from the controlled principal-section SVG`)
