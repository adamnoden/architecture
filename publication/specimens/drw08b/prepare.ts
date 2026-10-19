import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const templatePath = resolve(root, 'specimen.html')
const sectionPath = resolve(repositoryRoot, 'docs/reference-house/publication-service-transverse-section.svg')
const outputDir = resolve(root, '.work/source')
const outputPath = resolve(outputDir, 'specimen.html')
const marker = '<!-- CONTROLLED_SERVICE_SECTION -->'

const [template, sectionSvg] = await Promise.all([
  readFile(templatePath, 'utf8'),
  readFile(sectionPath, 'utf8')
])
if (!template.includes(marker)) throw new Error('DRW-08B specimen template is missing its controlled service-section marker.')
if (!sectionSvg.startsWith('<svg ')) throw new Error('DRW-08B requires the service/transverse section as an SVG root document.')
const sectionInline = sectionSvg.replace('<svg ', '<svg class="service-section" ')
await mkdir(outputDir, { recursive: true })
await writeFile(outputPath, template.replace(marker, sectionInline), 'utf8')
console.log(`Prepared ${outputPath} from the service/transverse section SVG`)
