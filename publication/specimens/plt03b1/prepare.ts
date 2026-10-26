import { createHash } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import type { DrawingLine, DrawingPrimitive, DrawingRect, DrawingScene, DrawingText, PaperPoint } from '../../../compiler/publication-drawing/model.js'
import { createPlanPaperProjection } from '../../../compiler/publication-drawing/projection.js'
import { compileReferenceHouse } from '../../../compiler/reference-house/compile.js'
import { createReferenceHouseSource } from '../../../compiler/reference-house/fixture.js'
import { createPlt03CurrentGroundPlanScene } from '../../../compiler/reference-house/plt03-ground-plan.js'
import { renderSpecimenDrawingSceneSvgWithTokens } from '../plt03/render.js'
import { PLT03_HIERARCHY_TOKENS } from '../plt03/tokens.js'

const root = import.meta.dirname
const repoRoot = resolve(root, '../../..')
const plt03Work = resolve(repoRoot, 'publication/specimens/plt03/.work')
const workRoot = resolve(root, '.work')
const sourceRoot = resolve(workRoot, 'source')

const sha256 = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex')

const OLD_PLAN_ORIGIN: PaperPoint = { x: 14, y: 18 }
const WALL_PLAN_ORIGIN: PaperPoint = { x: 16, y: 28 }
const SCALE_FACTOR = 2
const WALL_SCALE = 50
const WALL_SCENE_WIDTH_MM = 272
const WALL_SCENE_HEIGHT_MM = 282

const transformPoint = (point: PaperPoint): PaperPoint => ({
  x: WALL_PLAN_ORIGIN.x + (point.x - OLD_PLAN_ORIGIN.x) * SCALE_FACTOR,
  y: WALL_PLAN_ORIGIN.y + (point.y - OLD_PLAN_ORIGIN.y) * SCALE_FACTOR
})

const transformPrimitive = (primitive: DrawingPrimitive): DrawingPrimitive => {
  if (primitive.kind === 'line') {
    return { ...primitive, a: transformPoint(primitive.a), b: transformPoint(primitive.b) }
  }
  if (primitive.kind === 'rect') {
    const origin = transformPoint({ x: primitive.x, y: primitive.y })
    return {
      ...primitive,
      x: origin.x,
      y: origin.y,
      width: primitive.width * SCALE_FACTOR,
      height: primitive.height * SCALE_FACTOR
    }
  }
  if (primitive.kind === 'path') {
    return {
      ...primitive,
      rings: primitive.rings.map((ring) => ring.map(transformPoint))
    }
  }
  const point = transformPoint({ x: primitive.x, y: primitive.y })
  return { ...primitive, x: point.x, y: point.y }
}

const linePrimitive = (
  id: string,
  a: PaperPoint,
  b: PaperPoint,
  role: DrawingLine['role'],
  metadata: DrawingLine['metadata'] = {},
  dash?: DrawingLine['dash']
): DrawingLine => ({ kind: 'line', id, a, b, role, metadata, dash })

const textPrimitive = (
  id: string,
  point: PaperPoint,
  value: string,
  role: DrawingText['role'],
  anchor: DrawingText['anchor'] = 'middle',
  metadata: DrawingText['metadata'] = {},
  rotateDeg?: number
): DrawingText => ({ kind: 'text', id, x: point.x, y: point.y, value, role, anchor, metadata, rotateDeg })

const dimensionTick = (id: string, point: PaperPoint): DrawingLine =>
  linePrimitive(
    id,
    { x: point.x - 0.8, y: point.y + 0.8 },
    { x: point.x + 0.8, y: point.y - 0.8 },
    'secondary',
    { authorityClass: 'B', representation: 'dimension-tick' }
  )

const clonePrimitiveForLightPoche = (primitive: DrawingPrimitive): DrawingPrimitive => {
  if (primitive.kind === 'rect' && primitive.fill === 'ink' && primitive.id.startsWith('plt03-wall-')) {
    return {
      ...primitive,
      fill: 'faint',
      metadata: { ...primitive.metadata, representation: 'light-poche' }
    } as DrawingRect
  }
  return primitive
}

const extendLine = (primitive: DrawingLine, extensionMm: number): DrawingLine => {
  const dx = primitive.b.x - primitive.a.x
  const dy = primitive.b.y - primitive.a.y
  const length = Math.hypot(dx, dy)
  if (length === 0) return primitive
  const ux = dx / length
  const uy = dy / length
  return {
    ...primitive,
    a: { x: primitive.a.x - ux * extensionMm, y: primitive.a.y - uy * extensionMm },
    b: { x: primitive.b.x + ux * extensionMm, y: primitive.b.y + uy * extensionMm }
  }
}

const entityIds = (svg: string): string[] =>
  [...svg.matchAll(/data-entity="([^"]+)"/g)].map((match) => match[1]).sort()

const textByEntity = (svg: string): Record<string, string> => {
  const entries = [...svg.matchAll(/<text[^>]*data-entity="([^"]+)"[^>]*>([^<]*)<\/text>/g)]
    .map((match) => [match[1], match[2]] as const)
    .sort(([a], [b]) => a.localeCompare(b))
  return Object.fromEntries(entries)
}

await rm(workRoot, { recursive: true, force: true })
await mkdir(sourceRoot, { recursive: true })

const source = createReferenceHouseSource()
const result = compileReferenceHouse(source)
if (result.status === 'FAIL') throw new Error('PLT-03B.1 cannot build from a failed Reference House compile.')

const rawScene = createPlt03CurrentGroundPlanScene(result, source)
const project50 = createPlanPaperProjection({
  scaleDenominator: WALL_SCALE,
  modelBounds: { x: 0, y: 0, width: result.derived.shell.width, height: result.derived.shell.depth },
  paperOrigin: WALL_PLAN_ORIGIN
})

const primitives: DrawingPrimitive[] = []
for (const raw of rawScene.primitives) {
  const isOverallDimension = raw.id.startsWith('plt03-dim-') && raw.id !== 'plt03-dim-courtyard'
  if (
    raw.id.startsWith('plt03-north-') ||
    isOverallDimension ||
    raw.id.startsWith('plt03-scale-') ||
    raw.id.startsWith('plt03-front-axis-')
  ) continue

  let primitive = transformPrimitive(raw)

  // Preserve the accepted paper-space annotation offsets while architectural
  // coordinates move from 1:100 to 1:50.
  if (primitive.kind === 'text' && primitive.id === 'plt03-label-G-HALL-02') {
    primitive = { ...primitive, y: primitive.y + 2.2 }
  } else if (primitive.kind === 'text' && primitive.id === 'plt03-stair-topology') {
    primitive = { ...primitive, y: primitive.y - 2.2 }
  } else if (primitive.kind === 'text' && primitive.id === 'plt03-label-courtyard') {
    primitive = { ...primitive, y: primitive.y + 1.5 }
  } else if (primitive.kind === 'text' && primitive.id === 'plt03-dim-courtyard') {
    primitive = { ...primitive, y: primitive.y - 2.6 }
  }

  if (primitive.kind === 'text' && primitive.id === 'plt03-label-G-GAL-01') {
    primitive = {
      ...primitive,
      rotateDeg: -90,
      metadata: { ...primitive.metadata, representation: 'rotated-for-narrow-gallery' }
    }
  }

  if (primitive.kind === 'line' && primitive.id.startsWith('plt03-opening-centre-')) {
    primitive = {
      ...extendLine(primitive, 2),
      metadata: { ...primitive.metadata, representation: 'extended-centre-occurrence-marker' }
    }
  }

  if (primitive.kind === 'line' && primitive.id.startsWith('plt03-qualitative-opening-')) {
    let offsetX = 0
    let offsetY = 0
    if (primitive.id.includes('COURT-E')) offsetX = -2
    else if (primitive.id.includes('COURT-W')) offsetX = 2
    else if (primitive.id.includes('GARDEN-CENTRE')) offsetY = -2
    primitive = {
      ...primitive,
      a: { x: primitive.a.x + offsetX, y: primitive.a.y + offsetY },
      b: { x: primitive.b.x + offsetX, y: primitive.b.y + offsetY },
      metadata: { ...primitive.metadata, representation: 'offset-host-relationship-trace' }
    }
  }

  primitives.push(clonePrimitiveForLightPoche(primitive))
}

// Recreate dimensions, bay markers and scale bar from the 1:50 projection so
// their offsets/ticks remain physical paper values rather than doubling.
const d = result.derived
const topLeft = project50.point(0, d.shell.depth)
const topRight = project50.point(d.shell.width, d.shell.depth)
const bottomLeft = project50.point(0, 0)
const widthY = 16
const depthX = 7
const widthA = { x: topLeft.x, y: widthY }
const widthB = { x: topRight.x, y: widthY }
const depthA = { x: depthX, y: topLeft.y }
const depthB = { x: depthX, y: bottomLeft.y }

primitives.push(
  linePrimitive('plt03-dim-width', widthA, widthB, 'secondary', { authorityClass: 'B', source: 'shell.width' }),
  linePrimitive('plt03-dim-width-ext-left', { x: topLeft.x, y: 20 }, topLeft, 'secondary', { authorityClass: 'B' }),
  linePrimitive('plt03-dim-width-ext-right', { x: topRight.x, y: 20 }, topRight, 'secondary', { authorityClass: 'B' }),
  dimensionTick('plt03-dim-width-tick-left', widthA),
  dimensionTick('plt03-dim-width-tick-right', widthB),
  textPrimitive('plt03-dim-width-text', { x: (widthA.x + widthB.x) / 2, y: 12 }, String(d.shell.width), 'note', 'middle', { authorityClass: 'A', source: 'shell.width' }),
  linePrimitive('plt03-dim-depth', depthA, depthB, 'secondary', { authorityClass: 'B', source: 'shell.depth' }),
  linePrimitive('plt03-dim-depth-ext-top', { x: depthX, y: topLeft.y }, { x: topLeft.x - 1, y: topLeft.y }, 'secondary', { authorityClass: 'B' }),
  linePrimitive('plt03-dim-depth-ext-bottom', { x: depthX, y: bottomLeft.y }, { x: bottomLeft.x - 1, y: bottomLeft.y }, 'secondary', { authorityClass: 'B' }),
  dimensionTick('plt03-dim-depth-tick-top', depthA),
  dimensionTick('plt03-dim-depth-tick-bottom', depthB),
  textPrimitive('plt03-dim-depth-text', { x: 5.6, y: (depthA.y + depthB.y) / 2 }, String(d.shell.depth), 'note', 'middle', { authorityClass: 'A', source: 'shell.depth' }, -90)
)

for (const [index, axis] of d.frontAxes.entries()) {
  const onFront = project50.point(axis, 0)
  const belowFront = { x: onFront.x, y: onFront.y + 4.2 }
  primitives.push(
    linePrimitive(`plt03-front-axis-${index + 1}`, onFront, belowFront, 'secondary', { authorityClass: 'B', source: source.frontField.id }),
    textPrimitive(`plt03-front-axis-label-${index + 1}`, { x: belowFront.x, y: belowFront.y + 2.7 }, `B${index + 1}`, 'note', 'middle', { authorityClass: 'B', source: source.frontField.id })
  )
}

const scaleX = topRight.x - project50.length(3000)
const scaleY = 272
primitives.push(
  linePrimitive('plt03-scale-bar', { x: scaleX, y: scaleY }, { x: topRight.x, y: scaleY }, 'primary', { authorityClass: 'B', scale: '1:50' })
)
for (let index = 0; index <= 3; index += 1) {
  const x = scaleX + project50.length(index * 1000)
  primitives.push(linePrimitive(`plt03-scale-tick-${index}`, { x, y: scaleY - 1.6 }, { x, y: scaleY + 1.6 }, 'secondary', { authorityClass: 'B' }))
}
primitives.push(
  textPrimitive('plt03-scale-zero', { x: scaleX, y: scaleY + 4.4 }, '0', 'note', 'start', { authorityClass: 'B' }),
  textPrimitive('plt03-scale-three', { x: topRight.x, y: scaleY + 4.4 }, '3 m', 'note', 'end', { authorityClass: 'B' })
)

const wallScene: DrawingScene = {
  widthMm: WALL_SCENE_WIDTH_MM,
  heightMm: WALL_SCENE_HEIGHT_MM,
  viewId: 'PLT03-CURRENT-GROUND-PLAN-WALL-50',
  title: 'Reference House ground-floor plan — A2 WALL 1:50 candidate',
  description:
    'PLT-03B.1 current-authority ground-floor plan at true 1:50. Architectural geometry doubles from the 1:100 specimen while line weights, dash grammar, typography and annotation offsets remain physical paper-space values.',
  scaleDenominator: WALL_SCALE,
  sourceId: source.fixtureId,
  primitives
}

const combined100 = await readFile(resolve(plt03Work, 'combined.svg'), 'utf8')
const plt03ManifestText = await readFile(resolve(plt03Work, 'manifest.json'), 'utf8')
const plt03Manifest = JSON.parse(plt03ManifestText) as {
  candidates: Record<string, { sha256: string }>
  semanticDiff: Record<string, { unexplained: unknown[]; classes: string[] }>
  currentAuthorityChecks: Record<string, unknown>
  fontFingerprints: Record<string, { sha256: string }>
}
if (plt03Manifest.candidates.combined?.sha256 !== sha256(combined100)) {
  throw new Error('PLT-03B.1 rejected 1:100 comparison object does not match the current PLT-03A COMBINED fingerprint.')
}
if (plt03Manifest.semanticDiff.combined?.unexplained.length || plt03Manifest.semanticDiff.combined?.classes.includes('X')) {
  throw new Error('PLT-03B.1 source COMBINED candidate contains unexplained semantic X.')
}

const exactFontRules = combined100.match(/@font-face\{[^}]+\}/g) ?? []
if (exactFontRules.length !== 2) throw new Error(`PLT-03B.1 expected two exact Source Sans faces, found ${exactFontRules.length}.`)
const exactFontCss = exactFontRules.join('')
const lightPocheOutlineCss =
  'rect.fill-faint[data-entity^="plt03-wall-"]{stroke:#000000;stroke-width:0.28px;stroke-linecap:butt;stroke-linejoin:miter}'

let combined50 = renderSpecimenDrawingSceneSvgWithTokens(wallScene, PLT03_HIERARCHY_TOKENS)
combined50 = combined50.replace('</style>', `${exactFontCss}${lightPocheOutlineCss}</style>`)

const ids100 = entityIds(combined100)
const ids50 = entityIds(combined50)
if (JSON.stringify(ids100) !== JSON.stringify(ids50)) {
  const only100 = ids100.filter((id) => !ids50.includes(id))
  const only50 = ids50.filter((id) => !ids100.includes(id))
  throw new Error(`PLT-03B.1 1:50 semantic entity mismatch. only-100=${only100.join(',') || '(none)'} only-50=${only50.join(',') || '(none)'}`)
}
if (JSON.stringify(textByEntity(combined100)) !== JSON.stringify(textByEntity(combined50))) {
  throw new Error('PLT-03B.1 1:50 candidate changed drawing text content relative to COMBINED 1:100.')
}

await writeFile(resolve(workRoot, 'combined-100.svg'), combined100, 'utf8')
await writeFile(resolve(workRoot, 'combined-50.svg'), combined50, 'utf8')

const proofFontStyle = `<style>${exactFontCss}</style>`
const html = `<!doctype html>
<html lang="en-GB">
<head><meta charset="utf-8"><title>PLT-03B.1 A2 WALL scale comparison</title>${proofFontStyle}</head>
<body>
<section class="wall-page control-page" data-candidate="combined-100">
  <header class="wall-header"><span class="proof-name">COMBINED · REJECTED WALL CONTROL</span><span class="proof-scale">1:100</span></header>
  <div class="drawing drawing-100">${combined100}</div>
  <footer class="wall-footer">PLT-03B.1 · A2 WALL control · exact 1:100 · no fit scaling</footer>
</section>
<section class="wall-page candidate-page" data-candidate="combined-50">
  <header class="wall-header"><span class="proof-name">COMBINED · WALL CANDIDATE</span><span class="proof-scale">1:50</span></header>
  <div class="drawing drawing-50">${combined50}</div>
  <footer class="wall-footer">PLT-03B.1 · A2 WALL candidate · exact 1:50 · paper-space type and strokes unchanged</footer>
</section>
</body>
</html>`
await writeFile(resolve(sourceRoot, 'wall-comparison.html'), html, 'utf8')

const manifest = {
  schemaVersion: 1,
  packet: 'PLT-03B.1',
  parent: 'PLT-03 / #746',
  issue: '#772',
  canonicalMutation: false,
  control: {
    sha256: sha256(combined100),
    widthMm: 136,
    heightMm: 145,
    scaleDenominator: 100,
    disposition: 'REJECTED_AS_WALL_COMPOSITION'
  },
  candidate: {
    sha256: sha256(combined50),
    widthMm: WALL_SCENE_WIDTH_MM,
    heightMm: WALL_SCENE_HEIGHT_MM,
    scaleDenominator: WALL_SCALE,
    architectureScaleFactorFromControl: SCALE_FACTOR,
    entitySetIdenticalToControl: true,
    textContentIdenticalToControl: true,
    semanticClasses: plt03Manifest.semanticDiff.combined?.classes ?? []
  },
  physicalGrammar: {
    tokens: PLT03_HIERARCHY_TOKENS,
    lineWeightsUnchanged: true,
    dashSizesUnchanged: true,
    typographyUnchanged: true,
    annotationOffsetsReconstructedInPaperSpace: true,
    fitScaling: false
  },
  fontFingerprints: plt03Manifest.fontFingerprints,
  authorityBoundary: plt03Manifest.currentAuthorityChecks,
  pageProfile: { widthMm: 420, heightMm: 594, pages: 2 },
  physicalVerdict: 'SCREEN_REVIEW_PENDING',
  ownerPhysicalVerdict: 'UNREVIEWED'
}
await writeFile(resolve(workRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

console.log('Prepared PLT-03B.1 A2 comparison: rejected 1:100 control + true 1:50 COMBINED candidate.')
