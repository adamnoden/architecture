import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const templatePath = resolve(root, 'specimen.html')
const drawingPath = resolve(repositoryRoot, 'docs/reference-house/publication-garden-elevation.svg')
const outputDir = resolve(root, '.work/source')
const outputPath = resolve(outputDir, 'specimen.html')
const marker = '<!-- CONTROLLED_GARDEN_ELEVATION -->'
const [template, svg] = await Promise.all([readFile(templatePath, 'utf8'), readFile(drawingPath, 'utf8')])
if (!template.includes(marker)) throw new Error('DRW-08C specimen template is missing its controlled garden-elevation marker.')
if (!svg.startsWith('<svg ')) throw new Error('DRW-08C requires the garden elevation as an SVG root document.')
await mkdir(outputDir, { recursive: true })
await writeFile(outputPath, template.replace(marker, svg.replace('<svg ', '<svg class="garden-elevation" ')), 'utf8')
console.log(`Prepared ${outputPath} from the garden elevation SVG`)
