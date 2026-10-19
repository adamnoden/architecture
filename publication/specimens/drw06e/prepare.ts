import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const templatePath = resolve(root, 'specimen.html')
const elevationPath = resolve(repositoryRoot, 'docs/reference-house/publication-principal-front-elevation.svg')
const outputDir = resolve(root, '.work/source')
const outputPath = resolve(outputDir, 'specimen.html')
const marker = '<!-- CONTROLLED_PRINCIPAL_FRONT_ELEVATION -->'

const [template, elevationSvg] = await Promise.all([
  readFile(templatePath, 'utf8'),
  readFile(elevationPath, 'utf8')
])

if (!template.includes(marker)) throw new Error('DRW-06E specimen template is missing its controlled elevation marker.')
if (!elevationSvg.startsWith('<svg ')) throw new Error('DRW-06E requires the controlled principal front elevation as an SVG root document.')

const elevationInline = elevationSvg.replace('<svg ', '<svg class="principal-front-elevation" ')
const prepared = template.replace(marker, elevationInline)

await mkdir(outputDir, { recursive: true })
await writeFile(outputPath, prepared, 'utf8')
console.log(`Prepared ${outputPath} from the controlled principal-front-elevation SVG`)
