import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const templatePath = resolve(root, 'specimen.html')
const drawingPath = resolve(repositoryRoot, 'docs/reference-house/publication-sectional-axonometric.svg')
const outputDir = resolve(root, '.work/source')
const outputPath = resolve(outputDir, 'specimen.html')
const marker = '<!-- CONTROLLED_SECTIONAL_AXONOMETRIC -->'
const [template, svg] = await Promise.all([readFile(templatePath, 'utf8'), readFile(drawingPath, 'utf8')])
if (!template.includes(marker)) throw new Error('DRW-09E specimen template is missing its controlled axonometric marker.')
if (!svg.startsWith('<svg ')) throw new Error('DRW-09E requires the sectional axonometric as an SVG root document.')
await mkdir(outputDir, { recursive: true })
await writeFile(outputPath, template.replace(marker, svg.replace('<svg ', '<svg class="axonometric" ')), 'utf8')
console.log(`Prepared ${outputPath} from the controlled sectional axonometric SVG`)
