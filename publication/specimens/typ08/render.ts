import { execFileSync } from 'node:child_process'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '../../..')
const proofRoot = resolve(repoRoot, 'publication/.proof/typ08a')
const reviewRoot = resolve(proofRoot, 'b5-review')
const pdf = resolve(proofRoot, 'b5/typ08a-full-book-b5.pdf')

const verification = JSON.parse(await readFile(resolve(proofRoot, 'verification.json'), 'utf8')) as {
  formats?: { b5?: { pages?: number; pdfSha256?: string } }
}
const expectedPages = verification.formats?.b5?.pages
if (!expectedPages || !Number.isFinite(expectedPages)) throw new Error('TYP-08A render requires verified B5 page count.')

await rm(reviewRoot, { recursive: true, force: true })
await mkdir(reviewRoot, { recursive: true })

execFileSync('pdftoppm', [
  '-jpeg',
  '-jpegopt', 'quality=82,optimize=y',
  '-r', '110',
  pdf,
  resolve(reviewRoot, 'page')
], { cwd: repoRoot, stdio: 'inherit' })

const files = (await readdir(reviewRoot))
  .filter((name) => /^page-\d+\.jpg$/.test(name))
  .sort((a, b) => {
    const an = Number(a.match(/(\d+)/)?.[1] ?? 0)
    const bn = Number(b.match(/(\d+)/)?.[1] ?? 0)
    return an - bn
  })
if (files.length !== expectedPages) {
  throw new Error(`TYP-08A rendered ${files.length} B5 page images for ${expectedPages} verified PDF pages.`)
}

const index = {
  schemaVersion: 1,
  packet: 'TYP-08A',
  format: 'B5 176 × 250 mm',
  renderDpi: 110,
  sourcePdfSha256: verification.formats?.b5?.pdfSha256,
  pages: files.map((file, index) => ({
    page: index + 1,
    file: `b5-review/${file}`
  }))
}
await writeFile(resolve(proofRoot, 'review-index.json'), `${JSON.stringify(index, null, 2)}\n`, 'utf8')
console.log(`Rendered ${files.length} deterministic B5 review pages for TYP-08B.`)
