import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const templatePath = resolve(root, 'specimen.html')
const roofPath = resolve(repositoryRoot, 'docs/reference-house/publication-roof-drainage.svg')
const outputDir = resolve(root, '.work/source')
const outputPath = resolve(outputDir, 'specimen.html')
const marker = '<!-- CONTROLLED_ROOF_DRAINAGE_PLAN -->'

const [template, roofSvg] = await Promise.all([
  readFile(templatePath, 'utf8'),
  readFile(roofPath, 'utf8')
])

if (!template.includes(marker)) throw new Error('DRW-07D specimen template is missing its controlled roof/drainage marker.')
if (!roofSvg.startsWith('<svg ')) throw new Error('DRW-07D requires the controlled roof/drainage plan as an SVG root document.')

const roofInline = roofSvg.replace('<svg ', '<svg class="roof-drainage-plan" ')
const prepared = template.replace(marker, roofInline)

await mkdir(outputDir, { recursive: true })
await writeFile(outputPath, prepared, 'utf8')
console.log(`Prepared ${outputPath} from the controlled roof/drainage SVG`)
