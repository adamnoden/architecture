import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const workRoot = resolve(import.meta.dirname, '.work')
const manifest = JSON.parse(await readFile(resolve(workRoot, 'manifest.json'), 'utf8')) as {
  pageMm: { width: number; height: number }
  scales: number[]
  fitScaling: boolean
  rasterContent: boolean
  blackOnly: boolean
  capabilities: { id: string; label: string }[]
  resolvedPartitionProof: { sourceRangeMm: [number, number]; representedMm: number; nominalThicknessSelected: boolean }
  scaleProof: {
    modelSpan4000Mm: { at100Mm: number; at50Mm: number }
    partitionDatumPaperWidthMm: { at100: number; at50: number }
    dimensionTickPaperMm: { at100: number; at50: number }
    lineTokensMm: Record<string, number>
    textTokensMm: Record<string, number>
  }
}

assert.deepEqual(manifest.pageMm, { width: 841, height: 594 })
assert.deepEqual(manifest.scales, [100, 50])
assert.equal(manifest.fitScaling, false)
assert.equal(manifest.rasterContent, false)
assert.equal(manifest.blackOnly, true)
assert.equal(manifest.capabilities.length, 18)
assert.equal(new Set(manifest.capabilities.map((item) => item.id)).size, 18)
assert.deepEqual(manifest.capabilities.map((item) => item.id), Array.from({ length: 18 }, (_, index) => `C${String(index + 1).padStart(2, '0')}`))

assert.equal(manifest.scaleProof.modelSpan4000Mm.at50Mm / manifest.scaleProof.modelSpan4000Mm.at100Mm, 2)
assert.equal(manifest.scaleProof.partitionDatumPaperWidthMm.at100, manifest.scaleProof.partitionDatumPaperWidthMm.at50)
assert.equal(manifest.scaleProof.dimensionTickPaperMm.at100, manifest.scaleProof.dimensionTickPaperMm.at50)
assert.ok(Object.values(manifest.scaleProof.lineTokensMm).every((value) => value > 0))
assert.ok(Object.values(manifest.scaleProof.textTokensMm).every((value) => value > 0))
assert.deepEqual(manifest.resolvedPartitionProof.sourceRangeMm, [100, 150])
assert.equal(manifest.resolvedPartitionProof.representedMm, 125)
assert.equal(manifest.resolvedPartitionProof.nominalThicknessSelected, false)

const styleFor = (svg: string): string => svg.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? ''
const svgs = new Map<number, string>()
for (const scale of [100, 50] as const) {
  const svg = await readFile(resolve(workRoot, `ade06-capability-atlas-1-${scale}.svg`), 'utf8')
  svgs.set(scale, svg)
  assert.match(svg, /width="841mm" height="594mm"/)
  assert.match(svg, new RegExp(`data-scale-denominator="${scale}"`))
  assert.doesNotMatch(svg, /<image\b/)

  for (const capability of manifest.capabilities) {
    assert.ok(svg.includes(`${capability.id} — ${capability.label}`), `${capability.id} label missing at 1:${scale}`)
    assert.ok(svg.includes(`data-capability="${capability.id}"`), `${capability.id} compiled metadata missing at 1:${scale}`)
  }

  // Opening uncertainty must never fall back to dashed construction-like jambs.
  const primitiveClasses = [...svg.matchAll(/class="([^"]+)"[^>]*data-epistemic="opening-uncertainty"/g)].map((match) => match[1])
  assert.ok(primitiveClasses.every((value) => !value.includes('dash-')))
  assert.ok(svg.includes('data-doorSelected="false"'))
  assert.ok(svg.includes('data-nominalThicknessSelected="false"'))
  assert.ok(svg.includes('data-serviceFree="true"'))
}

const svg100 = svgs.get(100)!
const svg50 = svgs.get(50)!
assert.equal(styleFor(svg100), styleFor(svg50), 'paper-space style/token CSS must be byte-identical across scale')

// Black-only permits only neutral grayscale proof inks plus paper.
const allowed = new Set(['#000000', '#dfdfdf', '#ededed', '#ffffff'])
for (const [scale, svg] of svgs) {
  const colours = new Set([...svg.matchAll(/#[0-9a-fA-F]{6}/g)].map((match) => match[0].toLowerCase()))
  assert.ok([...colours].every((colour) => allowed.has(colour)), `non-neutral colour in 1:${scale}: ${[...colours].join(', ')}`)
}

console.log('ADE-06 atlas validation passed: exact A1 size, paired scale contract, 18 capabilities, provenance metadata, no raster/fit scaling or dashed pseudo-jambs.')

// Accepted post-migration handedness correction; changes require renewed visual review.
const acceptedLocks = JSON.parse(await readFile(resolve(import.meta.dirname, 'regression-locks.json'), 'utf8')) as Record<string, string>
for (const [name, digest] of Object.entries(acceptedLocks)) {
  const svg = await readFile(resolve(workRoot, name), 'utf8')
  if (createHash('sha256').update(svg).digest('hex') !== digest) throw new Error(`ADE capability fingerprint changed: ${name}. Re-review the affected exact-size proof before updating locks.`)
}
