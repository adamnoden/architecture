import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { test } from 'node:test'
import './court-egress-source.test.js'
import './court-near-level-window.test.js'
import './east-egress-pier-scan.test.js'
import { buildDrawingGallery, frameGalleryScene } from './drawing-gallery.js'
import { prepareCurrentDesignCompile } from '../compiler/reference-house/current-design/compile.js'
import { readGeorgianDesignSnapshot } from '../compiler/reference-house/current-design/georgian-source.js'
import { layoutFamilyViews, createLayoutFamilyScene } from '../compiler/reference-house/georgian/layout-family.js'
import { layoutAnalysisViews, createLayoutAnalysisScene } from '../compiler/reference-house/georgian/layout-analysis.js'
import { exteriorViews } from '../compiler/reference-house/georgian/exterior-isometrics.js'
import { nomenclatureFamilies, nomenclaturePattern } from '../project/nomenclature.js'
import { translateDrawingPrimitive } from '../compiler/publication-drawing-v2/composition.js'
import { renderDrawingSceneV2SvgWithTokens } from '../compiler/publication-drawing-v2/svg.js'
import { PLT_CANDIDATE_TOKENS } from '../compiler/publication-drawing-v2/plt-candidate-tokens.js'

const svg = (title: string, body = '') => `<svg xmlns="http://www.w3.org/2000/svg"><title>${title}</title><desc>A drawing with known limitations.</desc>${body}</svg>`

async function fixture(run: (root: string, write: (path: string, text: string) => void) => Promise<void>) {
  const root = mkdtempSync(resolve(tmpdir(), 'drawing-gallery-'))
  const write = (path: string, text: string) => {
    mkdirSync(dirname(resolve(root, path)), { recursive: true })
    writeFileSync(resolve(root, path), text)
  }
  try { await run(root, write) } finally { rmSync(root, { recursive: true, force: true }) }
}

test('adding, changing and removing source SVGs automatically changes the catalogue and immutable assets', () => fixture(async (root, write) => {
  write('docs/research/new-detail.svg', svg('New &amp; useful detail'))
  write('docs/research/new-detail.md', '# A new detail\n\n![The detail](new-detail.svg)')
  write('docs/research/.work/ignored.svg', svg('Ignored proof'))
  let result = await buildDrawingGallery(root, { includeCurrent: false })
  assert.equal(result.catalogue.entries.length, 1)
  const original = result.catalogue.entries[0]
  assert.equal(original.title, 'New & useful detail')
  assert.equal(original.context.href, '/research/new-detail')
  assert.equal(result.assets[0].content, readFileSync(resolve(root, original.sourcePath), 'utf8'))
  write('project/new/studies/added-section.svg', svg('Additional section'))
  result = await buildDrawingGallery(root, { includeCurrent: false })
  assert.equal(result.catalogue.entries.length, 2)
  assert.ok(result.catalogue.entries.some((entry) => entry.title === 'Additional section' && entry.basis === 'study'))
  write('docs/research/new-detail.svg', svg('Updated detail', '<path d="M0 0L1 1"/>'))
  result = await buildDrawingGallery(root, { includeCurrent: false })
  assert.notEqual(result.catalogue.entries.find((entry) => entry.id === original.id)!.href, original.href)
  rmSync(resolve(root, 'docs/research/new-detail.svg'))
  result = await buildDrawingGallery(root, { includeCurrent: false })
  assert.equal(result.catalogue.entries.length, 1)
  assert.equal(result.assets.length, 1)
  assert.ok(!JSON.stringify(result).includes(original.href))
}))

test('public Mermaid fences are discovered, with surrounding headings and no private or nested-code leakage', () => fixture(async (root, write) => {
  write('docs/research/sequence.md', '# Water routes\n\n## Overflow\n```mermaid\nflowchart TD\n A --> B\n```\n\n````markdown\n```mermaid\nnot a real diagram\n```\n````\n')
  write('project/private.md', '# Internal\n```mermaid\nflowchart TD\n SECRET --> INTERNAL\n```\n')
  const result = await buildDrawingGallery(root, { includeCurrent: false })
  assert.equal(result.catalogue.entries.length, 1)
  assert.equal(result.catalogue.entries[0].title, 'Overflow')
  assert.equal(result.catalogue.entries[0].mermaid, 'flowchart TD\n A --> B')
  assert.equal(result.catalogue.entries[0].context.href, '/research/sequence')
  assert.equal(result.assets.length, 0)
}))

test('historical geometry and unadopted studies retain their basis, and card labels do not expose workflow identities', () => fixture(async (root, write) => {
  write('docs/reference-house/rhc1-ground-floor.svg', svg('RH-C1 — Ground-floor plan'))
  write('project/had/studies/selected-house-study.svg', svg('HAD selected house study'))
  write('docs/reference-house/future-design.svg', svg('Future design'))
  const { catalogue: { entries } } = await buildDrawingGallery(root, { includeCurrent: false })
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

test('the real catalogue includes every exported current view, all discoverable sources and valid content-addressed previews', async () => {
  const root = resolve(import.meta.dirname, '..')
  const design = readGeorgianDesignSnapshot()
  const result = await buildDrawingGallery(root, { currentDesign: design })
  const current = result.catalogue.entries.filter((entry) => entry.basis === 'current')
  assert.equal(current[0].title, 'Ground-floor plan')
  assert.equal(current[1].title, 'First-floor plan')
  assert.equal(current.length, layoutFamilyViews.length + layoutAnalysisViews.length + exteriorViews.length - 1)
  assert.equal(current.filter((entry) => entry.sourcePath.endsWith('exterior-isometrics.ts')).length, exteriorViews.length)
  assert.ok(!result.catalogue.entries.some((entry) => entry.sourcePath.startsWith('public/drawings/exterior-isometrics/')))
  assert.ok(result.catalogue.entries.some((entry) => entry.sourcePath === 'docs/reference-house/publication-ground-floor-plan.svg' && entry.basis === 'historical'))
  assert.ok(result.catalogue.entries.some((entry) => entry.sourcePath === 'docs/manuscript/figures/selective-permanence-platform.svg'))
  assert.ok(result.catalogue.entries.some((entry) => entry.sourcePath === 'project/mat/studies/shower-waste-interface.svg' && entry.basis === 'study'))
  const assets = new Map(result.assets.map((asset) => [`/drawing-gallery/${asset.filename}`, asset.content]))
  assert.equal(assets.size, result.assets.length)
  const compiler = prepareCurrentDesignCompile(design)
  const assetPath = (svg: string) => `/drawing-gallery/${createHash('sha256').update(svg).digest('hex')}.svg`
  for (const view of ['GROUND', 'FIRST'] as const) {
    const scene = compiler.plans().plans[view]
    const svg = renderDrawingSceneV2SvgWithTokens(frameGalleryScene(scene), PLT_CANDIDATE_TOKENS) + '\n'
    const direct = renderDrawingSceneV2SvgWithTokens(frameGalleryScene(createLayoutFamilyScene(view, 100)), PLT_CANDIDATE_TOKENS) + '\n'
    assert.equal(svg, direct)
    assert.equal(current.find(entry => entry.id === scene.viewId)?.href, assetPath(svg))
  }
  const compiled = await compiler.occupiedServiceDrawings()
  assert.equal(compiled.source.planDigest, compiler.source.planDigest)
  for (const [name, svg] of Object.entries(compiled.drawings)) {
    const path = `project/had/studies/${name}`
    const cards = result.catalogue.entries.filter(entry => entry.id === path)
    assert.equal(cards.length, 1)
    assert.equal(cards[0].basis, 'study')
    assert.equal(cards[0].collection, 'Conditional occupied services')
    assert.equal(cards[0].href, assetPath(svg))
    assert.equal(assets.get(cards[0].href), svg)
    assert.equal(svg, readFileSync(resolve(root, path), 'utf8'))
    assert.match(cards[0].context.href, /inhabited-services-selection\.md$/)
  }
  for (const level of ['GROUND', 'FIRST'] as const) {
    const reservation = result.catalogue.entries.find(entry => entry.id === `LAYOUT-ANALYSIS-${level}-SERVICES-100`)
    assert.equal(reservation?.basis, 'study')
    assert.equal(reservation?.collection, 'Nominal service reservations')
  }
  const predecessor = 'docs/reference-house/publication-ground-floor-plan.svg'
  assert.equal(result.catalogue.entries.find(entry => entry.id === predecessor)?.href, assetPath(readFileSync(resolve(root, predecessor), 'utf8')))
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

test('the public gallery rejects a stale accepted document or a candidate before publishing current cards', async () => {
  const root = resolve(import.meta.dirname, '..')
  const design = readGeorgianDesignSnapshot()
  await assert.rejects(buildDrawingGallery(root, {
    currentDesign: { ...design, envelope: { ...design.envelope, widthMm: design.envelope.widthMm + 10 } }
  }), /differs from the current Georgian layout inputs/)
  await assert.rejects(buildDrawingGallery(root, {
    currentDesign: { ...design, source: { kind: 'contrast-specimen', id: 'SPECIMEN-GALLERY-CANDIDATE', state: 'candidate' } }
  }), /requires the accepted current design/)
})

test('current service artwork is produced with missing or stale copies in the gallery tree', () => fixture(async (root, write) => {
  write('docs/reference-house/current-house-basis.md', '# Current house basis\n')
  write('project/had/inhabited-services-selection.md', '# Occupied service coordination\n')
  const stale = svg('Stale service figure')
  write('project/had/studies/current-house-services.svg', stale)
  const currentDesign = readGeorgianDesignSnapshot()
  const { catalogue, assets } = await buildDrawingGallery(root, { currentDesign })
  const loaded = catalogue.entries.filter(entry => entry.collection === 'Conditional occupied services')
  assert.equal(loaded.length, 3)
  assert.ok(loaded.some(entry => entry.id === 'project/had/studies/store-exchange.svg'))
  assert.ok(loaded.every(entry => !entry.title.includes('Stale service figure')))
  assert.ok(assets.every(asset => asset.content !== stale))
}))
