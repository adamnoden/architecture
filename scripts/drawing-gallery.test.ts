import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { test } from 'node:test'
import './court-egress-source.test.js'
import { buildDrawingGallery, frameGalleryScene } from './drawing-gallery.js'
import { layoutFamilyViews, createLayoutFamilyScene } from '../compiler/reference-house/georgian/layout-family.js'
import { layoutAnalysisViews, createLayoutAnalysisScene } from '../compiler/reference-house/georgian/layout-analysis.js'
import { exteriorViews } from '../compiler/reference-house/georgian/exterior-isometrics.js'
import { nomenclatureFamilies, nomenclaturePattern } from '../project/nomenclature.js'
import { translateDrawingPrimitive } from '../compiler/publication-drawing-v2/composition.js'
import { PLT_CANDIDATE_TOKENS } from '../compiler/publication-drawing-v2/plt-candidate-tokens.js'

const svg = (title: string, body = '') => `<svg xmlns="http://www.w3.org/2000/svg"><title>${title}</title><desc>A drawing with known limitations.</desc>${body}</svg>`

function fixture(run: (root: string, write: (path: string, text: string) => void) => void) {
  const root = mkdtempSync(resolve(tmpdir(), 'drawing-gallery-'))
  const write = (path: string, text: string) => {
    mkdirSync(dirname(resolve(root, path)), { recursive: true })
    writeFileSync(resolve(root, path), text)
  }
  try { run(root, write) } finally { rmSync(root, { recursive: true, force: true }) }
}

test('adding, changing and removing source SVGs automatically changes the catalogue and immutable assets', () => fixture((root, write) => {
  write('docs/research/new-detail.svg', svg('New &amp; useful detail'))
  write('docs/research/new-detail.md', '# A new detail\n\n![The detail](new-detail.svg)')
  write('docs/research/.work/ignored.svg', svg('Ignored proof'))
  let result = buildDrawingGallery(root, { includeCurrent: false })
  assert.equal(result.catalogue.entries.length, 1)
  const original = result.catalogue.entries[0]
  assert.equal(original.title, 'New & useful detail')
  assert.equal(original.context.href, '/research/new-detail')
  assert.equal(result.assets[0].content, readFileSync(resolve(root, original.sourcePath), 'utf8'))
  write('project/new/studies/added-section.svg', svg('Additional section'))
  result = buildDrawingGallery(root, { includeCurrent: false })
  assert.equal(result.catalogue.entries.length, 2)
  assert.ok(result.catalogue.entries.some((entry) => entry.title === 'Additional section' && entry.basis === 'study'))
  write('docs/research/new-detail.svg', svg('Updated detail', '<path d="M0 0L1 1"/>'))
  result = buildDrawingGallery(root, { includeCurrent: false })
  assert.notEqual(result.catalogue.entries.find((entry) => entry.id === original.id)!.href, original.href)
  rmSync(resolve(root, 'docs/research/new-detail.svg'))
  result = buildDrawingGallery(root, { includeCurrent: false })
  assert.equal(result.catalogue.entries.length, 1)
  assert.equal(result.assets.length, 1)
  assert.ok(!JSON.stringify(result).includes(original.href))
}))

test('public Mermaid fences are discovered, with surrounding headings and no private or nested-code leakage', () => fixture((root, write) => {
  write('docs/research/sequence.md', '# Water routes\n\n## Overflow\n```mermaid\nflowchart TD\n A --> B\n```\n\n````markdown\n```mermaid\nnot a real diagram\n```\n````\n')
  write('project/private.md', '# Internal\n```mermaid\nflowchart TD\n SECRET --> INTERNAL\n```\n')
  const result = buildDrawingGallery(root, { includeCurrent: false })
  assert.equal(result.catalogue.entries.length, 1)
  assert.equal(result.catalogue.entries[0].title, 'Overflow')
  assert.equal(result.catalogue.entries[0].mermaid, 'flowchart TD\n A --> B')
  assert.equal(result.catalogue.entries[0].context.href, '/research/sequence')
  assert.equal(result.assets.length, 0)
}))

test('historical geometry and unadopted studies retain their basis, and card labels do not expose workflow identities', () => fixture((root, write) => {
  write('docs/reference-house/rhc1-ground-floor.svg', svg('RH-C1 — Ground-floor plan'))
  write('project/had/studies/selected-house-study.svg', svg('HAD selected house study'))
  write('docs/reference-house/future-design.svg', svg('Future design'))
  const entries = buildDrawingGallery(root, { includeCurrent: false }).catalogue.entries
  const historical = entries.find((entry) => entry.sourcePath.includes('rhc1-'))!
  assert.equal(historical.basis, 'historical')
  assert.equal(historical.title, 'Ground-floor plan')
  assert.equal(historical.category, 'architecture')
  assert.equal(entries.find((entry) => entry.sourcePath.startsWith('project/'))!.basis, 'study')
  assert.equal(entries.find((entry) => entry.sourcePath.endsWith('future-design.svg'))!.basis, 'study')
  assert.ok(entries.every((entry) => !/RH-C1|HAD/.test(entry.title)))
}))

test('gallery framing retains complete doors and top dimensions without changing the source architecture or scale', () => {
  const rounded = (value: unknown) => JSON.parse(JSON.stringify(value, (_key, item) => typeof item === 'number' ? Math.round(item * 1e6) / 1e6 : item))
  const scenes = [
    ...(['GROUND', 'FIRST'] as const).map((view) => createLayoutFamilyScene(view, 100)),
    ...(['GROUND-SERVICES', 'FIRST-SERVICES', 'STRUCTURE', 'ADAPTATION'] as const).map((view) => createLayoutAnalysisScene(view, 100))
  ]
  for (const source of scenes) {
    const before = structuredClone(source)
    const framed = frameGalleryScene(source)
    const originalAnchor = source.primitives.find((primitive) => primitive.id === 'width-dimension-line')!
    const framedAnchor = framed.primitives.find((primitive) => primitive.id === 'width-dimension-line')!
    assert.ok(originalAnchor.kind === 'line' && framedAnchor.kind === 'line')
    const dx = framedAnchor.a.x - originalAnchor.a.x
    const dy = framedAnchor.a.y - originalAnchor.a.y
    assert.deepEqual(rounded(framed.primitives), rounded(source.primitives.map((primitive) => translateDrawingPrimitive(primitive, dx, dy))))
    assert.equal(framed.sourceId, source.sourceId)
    assert.equal(framed.scaleDenominator, source.scaleDenominator)
    assert.deepEqual(source, before)
    const label = framed.primitives.find((primitive) => primitive.id === 'width-label')!
    assert.ok(label.kind === 'text' && label.y > PLT_CANDIDATE_TOKENS.textMm.note, `${source.viewId}: top dimension clipped`)
    const door = framed.primitives.find((primitive) => primitive.id === 'plant-replacement-leaf-1')
    if (door) assert.ok(door.kind === 'line' && door.b.x < framed.widthMm - 1, `${source.viewId}: replacement door clipped`)
  }
})

test('the real catalogue includes every exported current view, all discoverable sources and valid content-addressed previews', () => {
  const root = resolve(import.meta.dirname, '..')
  const result = buildDrawingGallery(root)
  const current = result.catalogue.entries.filter((entry) => entry.basis === 'current')
  assert.equal(current[0].title, 'Ground-floor plan')
  assert.equal(current[1].title, 'First-floor plan')
  assert.equal(current.length, layoutFamilyViews.length + layoutAnalysisViews.length + exteriorViews.length + 1)
  assert.equal(current.filter((entry) => entry.sourcePath.endsWith('exterior-isometrics.ts')).length, exteriorViews.length)
  assert.ok(!result.catalogue.entries.some((entry) => entry.sourcePath.startsWith('public/drawings/exterior-isometrics/')))
  assert.ok(result.catalogue.entries.some((entry) => entry.sourcePath === 'docs/reference-house/publication-ground-floor-plan.svg' && entry.basis === 'historical'))
  assert.ok(result.catalogue.entries.some((entry) => entry.sourcePath === 'docs/manuscript/figures/selective-permanence-platform.svg'))
  assert.ok(result.catalogue.entries.some((entry) => entry.sourcePath === 'project/mat/studies/shower-waste-interface.svg' && entry.basis === 'study'))
  const assets = new Map(result.assets.map((asset) => [`/drawing-gallery/${asset.filename}`, asset.content]))
  assert.equal(assets.size, result.assets.length)
  for (const entry of result.catalogue.entries) {
    if (entry.preview) {
      assert.match(entry.preview, /^\/drawing-gallery\/[\da-f]{64}\.svg$/)
      assert.ok(assets.has(entry.preview), entry.id)
      assert.equal(entry.href, entry.preview)
    } else assert.ok(entry.mermaid)
    assert.ok(entry.title.trim())
    assert.ok(entry.context.href.startsWith('/') || entry.context.href.startsWith('https://github.com/adamnoden/architecture/blob/main/'))
    const visible = [entry.title, entry.description, entry.collection, entry.context.label].join(' ')
    for (const family of nomenclatureFamilies) {
      if (!(family.allowedSurfaces as readonly string[]).includes('SITE_PRIMARY')) {
        assert.equal(nomenclaturePattern(family).test(visible), false, `${entry.id} exposes ${family.id}`)
      }
    }
  }
})
