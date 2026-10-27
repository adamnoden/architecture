import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { getDocumentProxy } from 'unpdf'

const root = import.meta.dirname
const work = resolve(root, '.work')
const ade = resolve(root, '../ade07/.work')
const hash = (s: string | Buffer) => createHash('sha256').update(s).digest('hex')
const manifest = JSON.parse(await readFile(resolve(work, 'manifest.json'), 'utf8'))
const accepted = JSON.parse(await readFile(resolve(root, '../ade07/accepted-proof.json'), 'utf8'))
assert.equal(manifest.sourceManifestSha256, hash(await readFile(resolve(ade, 'manifest.json'))))
assert.equal(manifest.ownerPhysicalVerdict, 'UNREVIEWED')
assert.equal(manifest.printTokensFrozen, false)
assert.equal(manifest.fitScaling, false)
assert.deepEqual(accepted.X, [])
const expectedFonts = ['4644c81b86ec9caaa76b634889968ed3c4f4f52f054855933acc7c2b21e53b0f', '9214b9d95e4231c609802815c2646c98174e2102d0d37f88978a7f8e71006e6a']
assert.deepEqual(accepted.fonts.map((f: { sha256: string }) => f.sha256), expectedFonts)
const evidence: Record<string, unknown> = {}
const near = (actual: number, expected: number, label: string, tolerance = 0.3) => assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} != ${expected}`)
const pt = 72 / 25.4
for (const format of ['b5', 'a4', 'a2'] as const) {
  const isWall = format === 'a2'
  const sourceName = isWall ? 'ground-50.svg' : 'ground-100.svg'
  const svg = await readFile(resolve(ade, sourceName), 'utf8')
  assert.equal(manifest.sources[isWall ? 'wall' : 'book'], hash(svg))
  assert.equal(hash(svg), accepted.files[sourceName].sha256)
  const path = resolve(root, 'dist', `plt03b2-${format}.pdf`)
  const bytes = await readFile(path)
  const pdf = await getDocumentProxy(new Uint8Array(bytes))
  const [width, height, pages, scale] = manifest.profiles[format]
  assert.equal(pdf.numPages, pages, `${format} page count`)
  for (let n = 1; n <= pages; n++) {
    const viewport = (await pdf.getPage(n)).getViewport({ scale: 1 })
    near(viewport.width, width * pt, `${format} width`, 1)
    near(viewport.height, height * pt, `${format} height`, 1)
  }
  const page = await pdf.getPage(pages)
  const items = (await page.getTextContent()).items.filter((i): i is typeof i & { str: string; width: number; height: number; transform: number[] } => 'str' in i)
  const item = (text: string) => {
    const found = items.filter((i) => i.str === text)
    assert.equal(found.length, 1, `${format}: unique PDF text ${text}`)
    return found[0]
  }
  const sourceText = (text: string) => {
    const tag = [...svg.matchAll(/<text\b[^>]*>[^<]*<\/text>/g)].find((m) => m[0].endsWith(`>${text}</text>`))?.[0]
    assert.ok(tag, `Missing SVG text ${text}`)
    return { x: Number(tag.match(/\bx="([^"]+)"/)?.[1]), y: Number(tag.match(/\by="([^"]+)"/)?.[1]) }
  }
  // Both are centred: PDF text centre preserves the SVG anchor. This measures
  // actual PDF geometry, catching a correctly sized page with a scaled drawing.
  const b1 = item('B1'), b3 = item('B3')
  const spanPt = b3.transform[4] + b3.width / 2 - b1.transform[4] - b1.width / 2
  near(spanPt, (sourceText('B3').x - sourceText('B1').x) * pt, `${format} horizontal drawing scale`)
  const label = item('3 m')
  near(b1.transform[5] - label.transform[5], (sourceText('3 m').y - sourceText('B1').y) * pt, `${format} vertical drawing scale`)
  near(b1.height, 6, `${format} note type remains 6 pt`, 0.15)
  const fonts = execFileSync('pdffonts', ['-f', String(pages), '-l', String(pages), path], { encoding: 'utf8' })
  const rows = fonts.split('\n').slice(2).filter((r) => r.trim())
  assert.equal(rows.length, 2, `${format} must embed exactly two admitted faces`)
  for (const row of rows) {
    assert.match(row, /SourceSans3-(Regular|Bold)/)
    assert.match(row, /yes\s+yes\s+yes\s+\d+\s+\d+\s*$/, `${format}: embedded, subset and Unicode mapping required`)
  }
  assert.ok(!/Arial|Helvetica|Liberation|DejaVu/i.test(fonts))
  // Page text must remain within the media box, including rotated labels.
  for (const i of items) {
    assert.ok(i.transform[4] >= 0 && i.transform[4] <= width * pt && i.transform[5] >= 0 && i.transform[5] <= height * pt, `${format}: text escapes page: ${i.str}`)
  }
  evidence[format] = { sha256: hash(bytes), pages, widthMm: width, heightMm: height, scale, measuredBaySpanPt: spanPt, noteSizePt: b1.height, fonts }
}
assert.equal(manifest.sources.baseline, accepted.comparisons.protectedV1.sha256)
await writeFile(resolve(work, 'validation-evidence.json'), JSON.stringify({ profiles: evidence, ownerPhysicalVerdict: 'UNREVIEWED', printTokensFrozen: false }, null, 2) + '\n')
console.log('PLT-03B.2 PASS: exact PDF pages, finished-PDF x/y scale, constant note size, embedded Source Sans/Unicode, source fingerprints and protected baseline. Owner physical review remains open.')
