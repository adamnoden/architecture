import { createHash } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { compileAdeDimension } from '../../../compiler/architectural-drawing/dimension.js'
import type { AdeDimension, AdeProvenance } from '../../../compiler/architectural-drawing/model.js'
import type { DrawingPrimitiveV2, DrawingSceneV2, DrawingText } from '../../../compiler/publication-drawing-v2/model.js'
import { renderDrawingSceneV2Svg } from '../../../compiler/publication-drawing-v2/svg.js'
import { createPlanPaperProjection } from '../../../compiler/publication-drawing/projection.js'
import { mm } from '../../../compiler/units.js'

const workRoot = resolve(import.meta.dirname, '.work')
const PAGE_WIDTH = 297
const PAGE_HEIGHT = 210
const MODEL_WIDTH = 6000
const MODEL_HEIGHT = 3000

const provenance = (precision: AdeProvenance['precision']): AdeProvenance => ({
  sourceIds: ['ADE-06A-DIMENSION-FIXTURE'],
  authority: precision === 'exact' ? 'controlled' : 'provisional',
  precision
})

const dimension = (
  id: string,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  precision: AdeProvenance['precision']
): AdeDimension => ({
  kind: 'dimension',
  id,
  a: { x: mm(ax), y: mm(ay) },
  b: { x: mm(bx), y: mm(by) },
  provenance: provenance(precision)
})

const label = (id: string, x: number, y: number, value: string, role: DrawingText['role'] = 'note'): DrawingText => ({
  kind: 'text', id, x, y, value, role, anchor: 'start', metadata: { specimen: true }
})

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex')

const sceneForScale = (scaleDenominator: 100 | 50): DrawingSceneV2 => {
  const paperWidth = MODEL_WIDTH / scaleDenominator
  const paperHeight = MODEL_HEIGHT / scaleDenominator
  const origin = {
    x: (PAGE_WIDTH - paperWidth) / 2,
    y: (PAGE_HEIGHT - paperHeight) / 2
  }
  const projection = createPlanPaperProjection({
    scaleDenominator,
    modelBounds: { x: 0, y: 0, width: MODEL_WIDTH, height: MODEL_HEIGHT },
    paperOrigin: origin
  })
  const objectRect = projection.rect({ x: 0, y: 0, width: MODEL_WIDTH, height: MODEL_HEIGHT })

  const horizontal = compileAdeDimension(
    dimension('ADE06A-DIM-H', 0, 0, MODEL_WIDTH, 0, 'exact'),
    { projection, side: 'below' }
  )
  const vertical = compileAdeDimension(
    dimension('ADE06A-DIM-V', 0, 0, 0, MODEL_HEIGHT, 'approximate'),
    { projection, side: 'left' }
  )

  const primitives: DrawingPrimitiveV2[] = [
    label('sheet-title', 18, 14, `ADE-06A — composed dimensions — 1:${scaleDenominator}`, 'label'),
    label('sheet-note', 18, 20, 'Measured span scales. Witness gaps, overshoots, ticks and text offset remain paper-space quantities.'),
    {
      kind: 'rect',
      id: 'measured-object',
      x: objectRect.x,
      y: objectRect.y,
      width: objectRect.width,
      height: objectRect.height,
      stroke: 'primary',
      fill: 'none',
      metadata: { fixture: true, modelWidthMm: MODEL_WIDTH, modelHeightMm: MODEL_HEIGHT }
    },
    ...horizontal.primitives,
    ...vertical.primitives,
    label('exact-note', 18, PAGE_HEIGHT - 18, 'Horizontal: exact 6000 mm. Vertical: provisional/approximate 3000 mm.'),
    label('authority-note', 18, PAGE_HEIGHT - 12, 'No label copy drives the value; unsupported range/unknown display authority is rejected.')
  ]

  return {
    widthMm: PAGE_WIDTH,
    heightMm: PAGE_HEIGHT,
    viewId: `ADE06A-DIMENSIONS-${scaleDenominator}`,
    title: `ADE-06A composed dimension capability at 1:${scaleDenominator}`,
    description: 'Exact-size proof of horizontal and vertical semantic dimensions compiled as one line/witness/tick/text composition.',
    scaleDenominator,
    sourceId: 'ADE-06A-DIMENSION-FIXTURE',
    primitives
  }
}

await rm(workRoot, { recursive: true, force: true })
await mkdir(workRoot, { recursive: true })

const files: Record<string, { sha256: string; bytes: number }> = {}
for (const scale of [100, 50] as const) {
  const svg = renderDrawingSceneV2Svg(sceneForScale(scale))
  const name = `ade06a-dimensions-1-${scale}.svg`
  await writeFile(resolve(workRoot, name), svg, 'utf8')
  files[name] = { sha256: sha256(svg), bytes: Buffer.byteLength(svg) }
}

const manifest = {
  schemaVersion: 1,
  packet: 'ADE-06A',
  issue: 878,
  pageMm: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
  scales: [100, 50],
  modelFixtureMm: { width: MODEL_WIDTH, height: MODEL_HEIGHT },
  expectedPaperSpansMm: {
    '1:100': { horizontal: 60, vertical: 30 },
    '1:50': { horizontal: 120, vertical: 60 }
  },
  constantPaperFurnitureMm: {
    offset: 9,
    witnessGap: 1.5,
    witnessOvershoot: 1.5,
    tickLength: 2.4,
    textOffset: 1.8
  },
  fitScaling: false,
  files
}
await writeFile(resolve(workRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

console.log('Prepared ADE-06A exact-size composed-dimension proof at 1:100 and 1:50.')
