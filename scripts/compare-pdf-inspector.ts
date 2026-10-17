import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { inspectPdf } from '../publication/pdf-inspector.js'
import { nomenclatureFamilies, nomenclaturePattern } from '../project/nomenclature.js'

const repoRoot = process.cwd()
const pdfs = [
  'publication/dist/ovids-house.pdf',
  'publication/dist/ovids-house-primer.pdf'
]

interface LegacyInfo {
  readonly pages: number
  readonly widthMm: number
  readonly heightMm: number
}

function requiredMatch(text: string, pattern: RegExp, label: string): RegExpMatchArray {
  const match = text.match(pattern)
  if (!match) throw new Error(`Could not read ${label} from pdfinfo output.`)
  return match
}

function round(value: number, places: number): number {
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}

function legacyInfo(path: string): LegacyInfo {
  const info = execFileSync('pdfinfo', [path], { encoding: 'utf8' })
  const pages = Number(requiredMatch(info, /^Pages:\s+(\d+)$/m, 'page count')[1])
  const size = requiredMatch(info, /^Page size:\s+([\d.]+) x ([\d.]+) pts/m, 'page size')
  return {
    pages,
    widthMm: round(Number(size[1]) * 25.4 / 72, 2),
    heightMm: round(Number(size[2]) * 25.4 / 72, 2)
  }
}

function legacyText(path: string): string {
  return execFileSync('pdftotext', [path, '-'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024
  })
}

function matches(pattern: RegExp, text: string): string[] {
  const regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`)
  return [...text.matchAll(regex)].map((match) => match[0]).sort()
}

function assertClose(label: string, actual: number, expected: number, tolerance: number): void {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${label} diverged: PDF.js=${actual}, Poppler=${expected}.`)
  }
}

for (const relativePath of pdfs) {
  const path = resolve(repoRoot, relativePath)
  const legacy = legacyInfo(path)
  const legacyExtractedText = legacyText(path)
  const modern = await inspectPdf(path, { text: true })
  if (modern.text === undefined) throw new Error(`PDF.js produced no text for ${relativePath}.`)

  if (modern.pages !== legacy.pages) {
    throw new Error(
      `${relativePath} page count diverged: PDF.js=${modern.pages}, Poppler=${legacy.pages}.`
    )
  }
  assertClose(`${relativePath} width`, modern.pageSize.widthMm, legacy.widthMm, 0.05)
  assertClose(`${relativePath} height`, modern.pageSize.heightMm, legacy.heightMm, 0.05)

  for (const family of nomenclatureFamilies) {
    const legacyMatches = matches(nomenclaturePattern(family), legacyExtractedText)
    const modernMatches = matches(nomenclaturePattern(family), modern.text)
    if (JSON.stringify(modernMatches) !== JSON.stringify(legacyMatches)) {
      throw new Error(
        `${relativePath} nomenclature extraction diverged for ${family.id}: ` +
        `PDF.js=${JSON.stringify(modernMatches)}, Poppler=${JSON.stringify(legacyMatches)}.`
      )
    }
  }

  console.log(
    `PDF inspector parity passed for ${relativePath}: ` +
    `${modern.pages} pages, ${modern.pageSize.widthMm} × ${modern.pageSize.heightMm} mm.`
  )
}

console.log('PDF.js inspector parity with Poppler passed.')
