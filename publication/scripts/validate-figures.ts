import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'
import { publicationFigurePlacements } from '../figures.js'
import { publicationEntries } from '../publication.js'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const tolerance = 1

interface Overflow {
  readonly figure: string
  readonly element: string
  readonly text: string
  readonly sides: string[]
}

function figurePath(entryId: string, image: string): string {
  const entry = publicationEntries.find((candidate) => candidate.id === entryId)
  if (!entry) throw new Error(`Unknown publication entry for figure validation: ${entryId}`)
  return resolve(repoRoot, dirname(entry.source), image)
}

function figureLabel(alt: string, image: string): string {
  return `${alt} (${image})`
}

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
})

const failures: Overflow[] = []

try {
  for (const placement of publicationFigurePlacements()) {
    const path = figurePath(placement.entryId, placement.image)
    const label = figureLabel(placement.alt, placement.image)
    const svg = readFileSync(path, 'utf8')
    const viewBoxMatch = svg.match(/viewBox=["']\s*([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s*["']/i)
    if (!viewBoxMatch) throw new Error(`${label}: SVG has no parseable viewBox: ${path}`)

    const [, , , widthText, heightText] = viewBoxMatch
    const width = Number(widthText)
    const height = Number(heightText)
    const page = await browser.newPage()
    await page.setViewport({ width: Math.ceil(width), height: Math.ceil(height), deviceScaleFactor: 1 })
    await page.setContent(
      `<!doctype html><html><head><style>html,body{margin:0;padding:0}svg{display:block;width:${width}px;height:${height}px}</style></head><body>${svg}</body></html>`,
      { waitUntil: 'load' }
    )

    const overflows = await page.evaluate((epsilon) => {
      const root = document.querySelector('svg')
      if (!(root instanceof SVGSVGElement)) throw new Error('Rendered document has no SVG root')
      const bounds = root.getBoundingClientRect()
      const result: Array<{ element: string; text: string; sides: string[] }> = []

      for (const node of root.querySelectorAll('*')) {
        if (!(node instanceof SVGGraphicsElement)) continue
        if (node.closest('defs')) continue
        const style = getComputedStyle(node)
        if (style.display === 'none' || style.visibility === 'hidden') continue
        const box = node.getBoundingClientRect()
        if (box.width === 0 && box.height === 0) continue

        const sides: string[] = []
        if (box.left < bounds.left - epsilon) sides.push('left')
        if (box.top < bounds.top - epsilon) sides.push('top')
        if (box.right > bounds.right + epsilon) sides.push('right')
        if (box.bottom > bounds.bottom + epsilon) sides.push('bottom')
        if (sides.length === 0) continue

        result.push({
          element: node.tagName.toLowerCase(),
          text: node.textContent?.trim().replace(/\s+/g, ' ') ?? '',
          sides
        })
      }
      return result
    }, tolerance)

    for (const overflow of overflows) {
      failures.push({ figure: label, ...overflow })
    }
    await page.close()
  }
} finally {
  await browser.close()
}

if (failures.length > 0) {
  const detail = failures
    .map(({ figure, element, text, sides }) =>
      `${figure}: <${element}>${text ? ` “${text}”` : ''} exceeds SVG ${sides.join(', ')}`
    )
    .join('\n')
  throw new Error(`Publication figure clipping detected:\n${detail}`)
}

console.log(`Publication figure bounds valid: ${publicationFigurePlacements().length} retained figures.`)