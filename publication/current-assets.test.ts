import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import test from 'node:test'
import { layoutFamilySource, createLayoutFamilyScene } from '../compiler/reference-house/georgian/layout-family.js'
import { renderDrawingSceneV2SvgWithTokens } from '../compiler/publication-drawing-v2/svg.js'
import { PLT_CANDIDATE_TOKENS } from '../compiler/publication-drawing-v2/plt-candidate-tokens.js'
import { readGeorgianDesignSnapshot } from '../compiler/reference-house/current-design/georgian-source.js'
import { applyDesignEdit, beginDesignEdit, editBase, loadDesignDraft, saveDesignDraft } from '../compiler/reference-house/current-design/edit.js'
import { createReferenceHouseSource } from '../compiler/reference-house/fixture.js'
import { applyPublicationPlates, publicationPlatePlacements } from './plates-current.js'
import { publicationPlatePlacements as historicalPlacements } from './plates.js'
import { blackOnlyPublicationSvg, buildCurrentPublicationAssets, compilePublicationPlanAssets, compilePublicationArchitectureAssets,
  currentPublicationAssetPaths, frameFurnishedStudy } from './current-assets.js'

const root = resolve(import.meta.dirname, '..')

test('current book placements retire predecessor artwork and keep genuine proposal boundaries', () => {
  const historical = new Set(historicalPlacements().flatMap(placement => placement.views.map(view => view.image)))
  const current = publicationPlatePlacements().flatMap(placement => placement.views)
  assert.equal(current.length, 7)
  assert.ok(current.every(view => !historical.has(view.image)))
  assert.deepEqual(current.map(view => view.image.replace('../../', '')), [...currentPublicationAssetPaths])
  assert.ok(current.slice(0, 4).every(view => view.scale === '1:100'))
  assert.ok(current.slice(4).every(view => view.scale === 'NTS'))
  assert.ok(current.some(view => /Owner aesthetic approval/.test(view.caption)))
  assert.ok(current.some(view => /roof or section datums/.test(view.caption)))
  assert.ok(current.find(view => view.image.endsWith('principal-section.svg'))?.caption.includes('provisional'))
  const source = readFileSync(resolve(root, 'docs/manuscript/part-iv.md'), 'utf8')
  const composed = applyPublicationPlates('part-iv', source)
  for (const path of historical) assert.ok(!composed.includes(path))
  for (const view of current) assert.ok(composed.includes(view.image))
})

test('the publication consumer replays an authored opening edit and keeps the other storey unchanged', () => {
  const accepted = readGeorgianDesignSnapshot()
  const baseline = compilePublicationPlanAssets(accepted)
  assert.equal(baseline.source.id, accepted.source.id)
  assert.equal(baseline.state, 'NOMINAL_PLAN_ONLY')
  assert.match(baseline.assets[0].svg, /data-scale-denominator="100"/)
  const draft = beginDesignEdit(accepted, 'book-authoring', 'SPECIMEN-BOOK-OPENING')
  const before = compilePublicationPlanAssets(draft.design, 'authored-candidate')
  const opening = draft.design.storeys.GROUND.openings.find(opening => opening.kind === 'window')!
  const changed = applyDesignEdit(draft, { schema: 'current-design-edit/1', units: 'mm', base: editBase(draft),
    operations: [{ kind: 'resize-opening', level: 'GROUND', openingId: opening.id,
      hostWallId: opening.hostWallId, widthMm: opening.widthMm + 100 }] }, [])
  assert.equal(changed.status, 'applied')
  if (changed.status !== 'applied') throw new Error('Opening edit rejected')
  const after = compilePublicationPlanAssets(changed.state.design, 'authored-candidate')
  assert.notEqual(before.source.planDigest, after.source.planDigest)
  assert.notEqual(before.assets[0].svg, after.assets[0].svg)
  assert.equal(before.assets[1].svg, after.assets[1].svg)
  const localId = opening.id.replace('GROUND/', '')
  const glazing = (svg: string) => {
    const line = [...svg.matchAll(/<line\b[^>]+>/g)].map(match => match[0])
      .find(line => line.includes(`data-entity="${localId}-glazing-a"`))!
    assert.ok(line)
    const number = (key: string) => Number(line.match(new RegExp(`\\b${key}="([^"]+)"`))![1])
    return Math.hypot(number('x2') - number('x1'), number('y2') - number('y1')) * 100
  }
  assert.ok(Math.abs(glazing(after.assets[0].svg) - glazing(before.assets[0].svg) - 100) < .11)
  const reloaded = loadDesignDraft(saveDesignDraft(changed.state), 'reloaded-book-authoring')
  assert.deepEqual(compilePublicationPlanAssets(reloaded.design, 'authored-candidate'), after)
  assert.throws(() => compilePublicationPlanAssets(changed.state.design), /admitted current design/)
  const stale = { ...accepted, storeys: { ...accepted.storeys, GROUND: { ...accepted.storeys.GROUND,
    openings: accepted.storeys.GROUND.openings.map((opening, index) => index === 0
      ? { ...opening, widthMm: opening.widthMm - 10 } : opening) } } }
  assert.throws(() => compilePublicationPlanAssets(stale), /differs from the current Georgian layout/)
  assert.throws(() => compilePublicationPlanAssets(createReferenceHouseSource()), /expected exactly/)
})

test('furnished publication framing preserves the existing Study paths and uses only neutral ink', () => {
  const sources = {
    comparison: readFileSync(resolve(root, 'project/ias/studies/crafted-study-comparison.svg'), 'utf8'),
    tile: readFileSync(resolve(root, 'project/ias/studies/crafted-study-tile.svg'), 'utf8'),
  }
  for (const [view, index] of [['fixed', 0], ['timber', 1], ['tile', 0]] as const) {
    const original = view === 'tile' ? sources.tile : sources.comparison
    const sourceGroup = [...original.matchAll(/<g\b[^>]*>[\s\S]*?<\/g>/g)][index][0]
    const rendered = frameFurnishedStudy(original, view)
    const sourceGeometry = [...sourceGroup.matchAll(/\b(?:d|points)="([^"]+)"/g)].map(match => match[0])
    const outputGeometry = [...rendered.matchAll(/\b(?:d|points)="([^"]+)"/g)].map(match => match[0])
    assert.ok(sourceGeometry.length > 100)
    assert.deepEqual(outputGeometry, sourceGeometry)
    for (const [colour] of rendered.matchAll(/#[\da-f]{6}\b/gi)) {
      assert.equal(colour.slice(1, 3), colour.slice(3, 5))
      assert.equal(colour.slice(3, 5), colour.slice(5, 7))
    }
    assert.match(rendered, /data-publication-source-sha256="[\da-f]{64}"/)
    assert.match(rendered, /data-scale="NTS"/)
  }
  assert.throws(() => frameFurnishedStudy(sources.comparison.replace('</svg>', '<g></g></svg>'), 'fixed'), /producer changed/)
  assert.equal(blackOnlyPublicationSvg('<path d="M1,2L3,4" fill="#aabbcc"/>').match(/d="[^"]+"/)![0], 'd="M1,2L3,4"')
})

test('clean-source asset generation checks the native room producer and never substitutes missing artwork', () => {
  const generated = buildCurrentPublicationAssets(root)
  assert.deepEqual(generated.assets.map(asset => asset.path), [...currentPublicationAssetPaths])
  assert.ok(generated.assets.every(asset => /^[\da-f]{64}$/.test(asset.sha256)))
  assert.match(generated.architecturalDrawingMethod.sha256, /^[\da-f]{64}$/)
  assert.equal(generated.architecturalDrawingMethod.sourceId, layoutFamilySource.id)
  assert.ok(generated.producerChecks[0].inputArtwork['project/ias/studies/crafted-study-comparison.svg'])
  const temporary = mkdtempSync(resolve(tmpdir(), 'current-book-missing-producer-'))
  try {
    symlinkSync(resolve(root, 'node_modules'), resolve(temporary, 'node_modules'))
    const path = resolve(temporary, 'project/ias/studies/crafted-study-views.mjs')
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, '')
    assert.throws(() => buildCurrentPublicationAssets(temporary), /ENOENT/)
    writeFileSync(path, 'throw new Error("NATIVE_ROOM_PRODUCER_FAILED")')
    assert.throws(() => buildCurrentPublicationAssets(temporary), /NATIVE_ROOM_PRODUCER_FAILED/)
  } finally { rmSync(temporary, { recursive: true, force: true }) }
})

test('book elevations and section regenerate the exact current gallery geometry at physical scale', () => {
  const accepted = readGeorgianDesignSnapshot()
  const baseline = compilePublicationArchitectureAssets(accepted)
  assert.equal(baseline.method.sourceId, layoutFamilySource.id)
  assert.deepEqual(baseline.method.viewIds, ['LAYOUT-FAMILY-FRONT-100', 'LAYOUT-FAMILY-PRINCIPAL-100'])
  for (const [index, view] of (['FRONT', 'PRINCIPAL'] as const).entries()) {
    const native = createLayoutFamilyScene(view, 100)
    assert.equal(baseline.assets[index].svg, renderDrawingSceneV2SvgWithTokens(native,
      { ...PLT_CANDIDATE_TOKENS, fontFamily: 'Arial, Helvetica, sans-serif' }) + '\n')
    assert.match(baseline.assets[index].svg, /width="145mm" height="190mm"/)
    assert.match(baseline.assets[index].svg, /data-scale-denominator="100"/)
    const scale = native.primitives.find(primitive => primitive.id === 'scale')!
    assert.equal(scale.kind, 'line')
    if (scale.kind !== 'line') throw new Error('Source scale bar is not a line')
    assert.equal(Math.hypot(scale.b.x - scale.a.x, scale.b.y - scale.a.y), 30)
  }
  assert.match(baseline.assets[1].svg, /foundation type \/ depth unresolved/)
  assert.match(baseline.assets[1].svg, /engineering unresolved/)
  const face = layoutFamilySource.design.facade.frameFace
  try {
    layoutFamilySource.design.facade.frameFace = face + 10
    const edited = compilePublicationArchitectureAssets(readGeorgianDesignSnapshot())
    assert.notEqual(edited.assets[0].svg, baseline.assets[0].svg)
    assert.equal(edited.assets[1].svg, baseline.assets[1].svg)
    assert.notEqual(edited.method.sourceFingerprint, baseline.method.sourceFingerprint)
  } finally { layoutFamilySource.design.facade.frameFace = face }
  assert.deepEqual(compilePublicationArchitectureAssets(accepted), baseline)
  const candidate = beginDesignEdit(accepted, 'book-architecture', 'SPECIMEN-BOOK-ARCHITECTURE')
  assert.throws(() => compilePublicationArchitectureAssets(candidate.design), /candidate snapshots/)
  assert.throws(() => compilePublicationArchitectureAssets(createReferenceHouseSource()), /expected exactly/)
  const stale = { ...accepted, storeys: { ...accepted.storeys, GROUND: { ...accepted.storeys.GROUND,
    openings: accepted.storeys.GROUND.openings.map((opening, index) => index === 0
      ? { ...opening, widthMm: opening.widthMm - 10 } : opening) } } }
  assert.throws(() => compilePublicationArchitectureAssets(stale), /differs from the current Georgian layout/)
})
