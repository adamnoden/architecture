import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '../../..')
const proofRoot = resolve(repoRoot, 'publication/.work/typ07b')

const requiredFonts = [
  'SourceSerif4-Regular',
  'SourceSerif4-It',
  'SourceSerif4-Bold',
  'SourceSans3-Regular',
  'SourceSans3-Bold'
] as const
const forbiddenFonts = /Arial|Helvetica|Liberation|Times|Georgia|Courier/i

const expected = {
  a4: { widthPt: (210 * 72) / 25.4, heightPt: (297 * 72) / 25.4 },
  b5: { widthPt: (176 * 72) / 25.4, heightPt: (250 * 72) / 25.4 }
} as const

function command(name: string, args: string[]): string {
  return execFileSync(name, args, { cwd: repoRoot, encoding: 'utf8' })
}

function parsePdfInfo(info: string): { pages: number; widthPt: number; heightPt: number } {
  const pages = Number(info.match(/^Pages:\s+(\d+)/m)?.[1] ?? '')
  const size = info.match(/^Page size:\s+([\d.]+)\s+x\s+([\d.]+)\s+pts/m)
  if (!Number.isFinite(pages) || !size) throw new Error('TYP-07B could not parse pdfinfo output.')
  return { pages, widthPt: Number(size[1]), heightPt: Number(size[2]) }
}

const verification: Record<string, unknown> = {
  packet: 'TYP-07B',
  result: 'PASS',
  formats: {}
}

for (const format of ['a4', 'b5'] as const) {
  const pdf = resolve(proofRoot, format, `typ07b-representative-${format}.pdf`)
  const fonts = command('pdffonts', [pdf])
  for (const required of requiredFonts) {
    if (!fonts.includes(required)) throw new Error(`TYP-07B ${format.toUpperCase()} missing required finished-PDF font: ${required}`)
  }
  if (forbiddenFonts.test(fonts)) throw new Error(`TYP-07B ${format.toUpperCase()} contains a forbidden system-font fallback.`)

  const info = parsePdfInfo(command('pdfinfo', [pdf]))
  const target = expected[format]
  const tolerancePt = 0.75
  if (Math.abs(info.widthPt - target.widthPt) > tolerancePt || Math.abs(info.heightPt - target.heightPt) > tolerancePt) {
    throw new Error(`TYP-07B ${format.toUpperCase()} page geometry changed: ${info.widthPt} × ${info.heightPt} pt.`)
  }
  if (info.pages < 10) throw new Error(`TYP-07B ${format.toUpperCase()} representative proof unexpectedly collapsed to ${info.pages} pages.`)

  const manifest = JSON.parse(await readFile(resolve(proofRoot, format, 'manifest.json'), 'utf8')) as {
    canonicalMutation?: boolean
    svgEvidence?: Record<string, unknown>
    proofUnits?: string[]
  }
  if (manifest.canonicalMutation !== false) throw new Error(`TYP-07B ${format.toUpperCase()} manifest does not preserve canonicalMutation=false.`)
  if ((manifest.proofUnits?.length ?? 0) !== 10) throw new Error(`TYP-07B ${format.toUpperCase()} manifest lost representative proof units.`)
  if (Object.keys(manifest.svgEvidence ?? {}).length !== 5) throw new Error(`TYP-07B ${format.toUpperCase()} expected five reversible real-asset typography proofs.`)

  ;(verification.formats as Record<string, unknown>)[format] = {
    pages: info.pages,
    widthPt: info.widthPt,
    heightPt: info.heightPt,
    requiredFonts: [...requiredFonts],
    forbiddenFallback: false
  }
}

await writeFile(resolve(proofRoot, 'verification.json'), `${JSON.stringify(verification, null, 2)}\n`, 'utf8')
console.log(JSON.stringify(verification, null, 2))
