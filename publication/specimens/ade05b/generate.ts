import { createHash } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import type { DrawingLine, DrawingPrimitiveV2, DrawingRect, DrawingSceneV2, DrawingText } from '../../../compiler/publication-drawing-v2/model.js'
import { renderDrawingSceneV2SvgWithTokens } from '../../../compiler/publication-drawing-v2/svg.js'
import { createPlanPaperProjection } from '../../../compiler/publication-drawing/projection.js'
import { ADE05B_PROOF_TOKENS } from './tokens.js'

const workRoot = resolve(import.meta.dirname, '.work')
const PAGE_WIDTH = 594
const PAGE_HEIGHT = 420
const COL_X = [26, 215, 404]
const COL_WIDTH = 164

const line = (id: string, x1: number, y1: number, x2: number, y2: number, role: DrawingLine['role'] = 'secondary', metadata: Record<string, string | number | boolean | undefined> = {}): DrawingLine => ({
  kind: 'line', id, a: { x: x1, y: y1 }, b: { x: x2, y: y2 }, role, metadata
})
const rect = (id: string, x: number, y: number, width: number, height: number, fill: DrawingRect['fill'], metadata: Record<string, string | number | boolean | undefined> = {}): DrawingRect => ({
  kind: 'rect', id, x, y, width, height, fill, metadata
})
const text = (id: string, x: number, y: number, value: string, role: DrawingText['role'] = 'note', anchor: DrawingText['anchor'] = 'middle'): DrawingText => ({
  kind: 'text', id, x, y, value, role, anchor, metadata: { specimen: true }
})

const datumBand = (id: string, x: number, y0: number, y1: number): DrawingPrimitiveV2[] => [
  rect(`${id}-band`, x - 0.45, y0, 0.9, y1 - y0, 'faint', { epistemic: 'partition-datum', candidate: 'band', physicalThickness: false })
]
const datumSpine = (id: string, x: number, y0: number, y1: number): DrawingPrimitiveV2[] => [
  line(`${id}-spine`, x, y0, x, y1, 'secondary', { epistemic: 'partition-datum', candidate: 'spine', physicalThickness: false }),
  line(`${id}-cap-a`, x - 1.4, y0, x + 1.4, y0, 'secondary', { epistemic: 'partition-datum', candidate: 'spine', physicalThickness: false }),
  line(`${id}-cap-b`, x - 1.4, y1, x + 1.4, y1, 'secondary', { epistemic: 'partition-datum', candidate: 'spine', physicalThickness: false })
]
const datumRails = (id: string, x: number, y0: number, y1: number): DrawingPrimitiveV2[] => [
  line(`${id}-rail-a`, x - 0.45, y0, x - 0.45, y1, 'secondary', { epistemic: 'partition-datum', candidate: 'rails', physicalThickness: false }),
  line(`${id}-rail-b`, x + 0.45, y0, x + 0.45, y1, 'secondary', { epistemic: 'partition-datum', candidate: 'rails', physicalThickness: false })
]

const bracket = (id: string, x0: number, x1: number, y: number, towardBoundary: 1 | -1, metadata: Record<string, string | number | boolean | undefined>): DrawingPrimitiveV2[] => {
  const tick = 2.0 * towardBoundary
  return [
    line(`${id}-span`, x0, y, x1, y, 'secondary', metadata),
    line(`${id}-a`, x0, y, x0, y + tick, 'secondary', metadata),
    line(`${id}-b`, x1, y, x1, y + tick, 'secondary', metadata)
  ]
}
const adjacencySingle = (id: string, x0: number, x1: number, boundaryY: number): DrawingPrimitiveV2[] =>
  bracket(id, x0, x1, boundaryY + 3.2, -1, { epistemic: 'adjacency-obligation', candidate: 'single-bracket', doorSelected: false })
const adjacencyOpposed = (id: string, x0: number, x1: number, boundaryY: number): DrawingPrimitiveV2[] => [
  ...bracket(`${id}-north`, x0, x1, boundaryY - 2.7, 1, { epistemic: 'adjacency-obligation', candidate: 'opposed-brackets', doorSelected: false }),
  ...bracket(`${id}-south`, x0, x1, boundaryY + 2.7, -1, { epistemic: 'adjacency-obligation', candidate: 'opposed-brackets', doorSelected: false })
]
const adjacencyLimits = (id: string, x0: number, x1: number, boundaryY: number): DrawingPrimitiveV2[] => [
  line(`${id}-a-n`, x0, boundaryY - 2.0, x0, boundaryY - 0.5, 'secondary', { epistemic: 'adjacency-obligation', candidate: 'limits-only', doorSelected: false }),
  line(`${id}-a-s`, x0, boundaryY + 0.5, x0, boundaryY + 2.0, 'secondary', { epistemic: 'adjacency-obligation', candidate: 'limits-only', doorSelected: false }),
  line(`${id}-b-n`, x1, boundaryY - 2.0, x1, boundaryY - 0.5, 'secondary', { epistemic: 'adjacency-obligation', candidate: 'limits-only', doorSelected: false }),
  line(`${id}-b-s`, x1, boundaryY + 0.5, x1, boundaryY + 2.0, 'secondary', { epistemic: 'adjacency-obligation', candidate: 'limits-only', doorSelected: false })
]

const candidateDatum = [datumBand, datumSpine, datumRails] as const
const candidateAdjacency = [adjacencySingle, adjacencyOpposed, adjacencyLimits] as const
const titles = [
  ['D1 — FAINT LOCUS', 'A1 — SINGLE BRACKET'],
  ['D2 — CAPPED SPINE', 'A2 — OPPOSED BRACKETS'],
  ['D3 — PAIRED RAILS', 'A3 — LIMITS ONLY']
] as const

const sceneFor = (scale: 100 | 50): DrawingSceneV2 => {
  const primitives: DrawingPrimitiveV2[] = [
    text('title', 18, 14, `ADE-05B — unresolved partition + adjacency candidate grammar — true 1:${scale}`, 'label', 'start'),
    text('subtitle', 18, 22, 'All datum widths/offsets are paper-space notation, not model thickness. No candidate selects a door.', 'note', 'start')
  ]

  const projection = createPlanPaperProjection({
    scaleDenominator: scale,
    modelBounds: { x: 0, y: 0, width: 3000, height: 3000 },
    paperOrigin: { x: 0, y: 0 }
  })
  const modelLength = projection.length(2600)
  const modelHalf = modelLength / 2

  COL_X.forEach((columnX, index) => {
    const centerX = columnX + COL_WIDTH / 2
    primitives.push(
      text(`datum-head-${index}`, centerX, 42, titles[index][0], 'marker'),
      text(`adj-head-${index}`, centerX, 205, titles[index][1], 'marker')
    )

    // Datum field: two labelled spaces separated only by the candidate notation.
    const datumY0 = 72
    const datumY1 = 166
    const datumX = centerX
    primitives.push(
      text(`datum-left-${index}`, centerX - 34, 118, 'SPACE A', 'note'),
      text(`datum-right-${index}`, centerX + 34, 118, 'SPACE B', 'note'),
      ...candidateDatum[index](`datum-${index}`, datumX, datumY0, datumY1),
      text(`datum-note-${index}`, centerX, 183, index === 0 ? 'constant 0.9 mm paper band' : index === 1 ? 'single locus + terminal caps' : 'constant 0.9 mm paper spacing', 'note')
    )

    // Adjacency field: a shared planning boundary exists, but the candidate
    // relation mark must not select an aperture midpoint or door leaf.
    const boundaryY = 284
    const x0 = centerX - modelHalf
    const x1 = centerX + modelHalf
    primitives.push(
      rect(`adj-field-top-${index}`, centerX - 60, 228, 120, 55.5, 'paper', { specimen: true }),
      rect(`adj-field-bottom-${index}`, centerX - 60, 284.5, 120, 55.5, 'paper', { specimen: true }),
      line(`shared-boundary-${index}`, centerX - 60, boundaryY, centerX + 60, boundaryY, 'secondary', { context: 'unresolved-shared-boundary' }),
      text(`space-n-${index}`, centerX, 257, 'SPACE A', 'note'),
      text(`space-s-${index}`, centerX, 316, 'SPACE B', 'note'),
      ...candidateAdjacency[index](`adj-${index}`, x0, x1, boundaryY),
      text(`adj-note-${index}`, centerX, 361, index === 0 ? 'one-sided relation annotation' : index === 1 ? 'relation expressed on both sides' : 'extent only; no connecting stroke', 'note')
    )
  })

  primitives.push(
    text('footer-a', 18, 392, 'Screen question: which datum is visibly non-physical without looking broken?', 'note', 'start'),
    text('footer-b', 18, 400, 'Screen question: which adjacency reads as an obligation across an extent rather than a chosen door?', 'note', 'start')
  )

  return {
    widthMm: PAGE_WIDTH,
    heightMm: PAGE_HEIGHT,
    viewId: `ADE05B-CANDIDATES-${scale}`,
    title: `ADE-05B candidate grammar at 1:${scale}`,
    description: 'Candidate comparison for unresolved partition datums and required adjacency obligations.',
    scaleDenominator: scale,
    sourceId: 'ADE-05B-CAPABILITY',
    primitives
  }
}

await rm(workRoot, { recursive: true, force: true })
await mkdir(workRoot, { recursive: true })
const files: Record<string, string> = {}
for (const scale of [100, 50] as const) {
  const svg = renderDrawingSceneV2SvgWithTokens(sceneFor(scale), ADE05B_PROOF_TOKENS)
  const name = `ade05b-partition-adjacency-candidates-1-${scale}.svg`
  files[name] = svg
  await writeFile(resolve(workRoot, name), svg, 'utf8')
}
await writeFile(resolve(workRoot, 'manifest.json'), `${JSON.stringify({
  schemaVersion: 1,
  packet: 'ADE-05B',
  issue: '#835',
  pageMm: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
  scales: [100, 50],
  physicalPartitionSelected: false,
  doorSelected: false,
  datumPaperWidthMm: 0.9,
  candidates: { datum: ['faint-locus', 'capped-spine', 'paired-rails'], adjacency: ['single-bracket', 'opposed-brackets', 'limits-only'] },
  files: Object.fromEntries(Object.entries(files).map(([name, svg]) => [name, { sha256: createHash('sha256').update(svg).digest('hex'), bytes: Buffer.byteLength(svg) }]))
}, null, 2)}\n`, 'utf8')
console.log('Prepared ADE-05B unresolved partition / adjacency candidate atlas.')
