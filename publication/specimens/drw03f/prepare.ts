import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const templatePath = resolve(root, 'specimen.html')
const svgPath = resolve(repositoryRoot, 'docs/reference-house/publication-ground-floor-plan.svg')
const outputDir = resolve(root, '.work/source')
const outputPath = resolve(outputDir, 'specimen.html')
const marker = '<!-- CONTROLLED_GROUND_PLAN -->'

const [template, svg] = await Promise.all([
  readFile(templatePath, 'utf8'),
  readFile(svgPath, 'utf8')
])
if (!template.includes(marker)) throw new Error('DRW-03F specimen template is missing the controlled drawing marker.')
if (!svg.startsWith('<svg ')) throw new Error('Controlled ground-plan artifact is not an SVG root document.')

const inlineSvg = svg.replace('<svg ', '<svg class="ground-plan" ')
await mkdir(outputDir, { recursive: true })
await writeFile(outputPath, template.replace(marker, inlineSvg), 'utf8')
console.log(`Prepared ${outputPath} from canonical ${svgPath}`)
