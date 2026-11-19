import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { test } from 'node:test'
import { inspectPdf } from './pdf-inspector.js'

/** A minimal real PDF with one URI annotation, independent of the renderer. */
function linkedPdf(uri: string): Buffer {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << >> /Contents 4 0 R /Annots [5 0 R] >>',
    '<< /Length 0 >>\nstream\n\nendstream',
    `<< /Type /Annot /Subtype /Link /Rect [10 10 100 30] /A << /S /URI /URI (${uri}) >> >>`
  ]
  let source = '%PDF-1.7\n'
  const offsets = [0]
  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(source))
    source += `${index + 1} 0 obj\n${object}\nendobj\n`
  }
  const startXref = Buffer.byteLength(source)
  source += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`
  source += offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
  source += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`
  return Buffer.from(source)
}

test('actual PDF URI annotations remain inspectable after metadata-only and warm cache reads', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'publication-pdf-links-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const path = join(root, 'links.pdf')
  const uri = `https://adamnoden.github.io/architecture/docs/patterns/controlled-utility-entry?probe=${basename(root)}`
  await writeFile(path, linkedPdf(uri))
  assert.equal((await inspectPdf(path)).pages, 1)
  assert.deepEqual((await inspectPdf(path, { links: true })).links, [uri])
  assert.deepEqual((await inspectPdf(path, { links: true })).links, [uri])
})
