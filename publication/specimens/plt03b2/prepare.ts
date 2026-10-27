import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// Regenerate and verify the owning ADE evidence; never import a stale artifact.
await import('../ade07/generate.js')
await import('../ade07/validate.js')
const root = import.meta.dirname
const source = resolve(root, '../ade07/.work')
const work = resolve(root, '.work')
await mkdir(work, { recursive: true })
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')
const ownerManifest = await readFile(resolve(source, 'manifest.json'), 'utf8')
const baseline = await readFile(resolve(source, 'protected-v1.svg'), 'utf8')
const book = await readFile(resolve(source, 'ground-100.svg'), 'utf8')
const wall = await readFile(resolve(source, 'ground-50.svg'), 'utf8')
const fonts = book.match(/@font-face\{[^}]+\}/g) ?? []
assert.equal(fonts.length, 2)
const page = (svg: string, name: string) => `<section data-candidate="${name}">${svg}</section>`
const html = (body: string) => `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Ground-floor physical proof</title><style>${fonts.join('')}</style></head><body>${body}</body></html>`
// Historical baseline is a source rewind, not a typography/hierarchy-only control.
await writeFile(resolve(work, 'book.html'), html(page(baseline, 'protected-v1') + page(book, 'ADE replacement')))
await writeFile(resolve(work, 'wall.html'), html(page(wall, 'ADE replacement')))
await writeFile(resolve(work, 'manifest.json'), JSON.stringify({
  packet: 'PLT-03B.2', sourceManifestSha256: sha256(ownerManifest),
  sources: { baseline: sha256(baseline), book: sha256(book), wall: sha256(wall) },
  profiles: { b5: [176, 250, 2, 100], a4: [210, 297, 2, 100], a2: [420, 594, 1, 50] },
  ownerPhysicalVerdict: 'UNREVIEWED', printTokensFrozen: false, fitScaling: false
}, null, 2) + '\n')
console.log('PLT-03B.2 sources prepared from verified ADE evidence. BOOK pages: protected v1, then replacement; WALL: replacement only.')
