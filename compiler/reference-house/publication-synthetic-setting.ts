import type {
  DrawingLine,
  DrawingPrimitive,
  DrawingRect,
  DrawingScene,
  DrawingText,
  PaperPoint
} from '../publication-drawing/model.js'
import { createPlanPaperProjection } from '../publication-drawing/projection.js'
import type { SyntheticSettingPublicationSource } from './publication-synthetic-setting-source.js'

const SCENE_WIDTH_MM = 166
const SCENE_HEIGHT_MM = 108
const HOUSE_ORIGIN: PaperPoint = { x: 53, y: 22 }

const line = (
  id: string,
  a: PaperPoint,
  b: PaperPoint,
  role: DrawingLine['role'],
  metadata: DrawingLine['metadata'] = {},
  dash?: DrawingLine['dash']
): DrawingLine => ({ kind: 'line', id, a, b, role, ...(dash ? { dash } : {}), metadata })

const rect = (
  id: string,
  value: { x: number; y: number; width: number; height: number },
  stroke: DrawingRect['stroke'],
  metadata: DrawingRect['metadata'] = {},
  dash?: DrawingRect['dash']
): DrawingRect => ({ kind: 'rect', id, ...value, stroke, fill: 'none', ...(dash ? { dash } : {}), metadata })

const text = (
  id: string,
  point: PaperPoint,
  value: string,
  role: DrawingText['role'],
  anchor: DrawingText['anchor'] = 'start',
  metadata: DrawingText['metadata'] = {}
): DrawingText => ({ kind: 'text', id, x: point.x, y: point.y, value, role, anchor, metadata })

const scaleBar = (): DrawingPrimitive[] => {
  const x0 = 10
  const y = 101
  return [
    line('scale-bar', { x: x0, y }, { x: x0 + 25, y }, 'primary'),
    line('scale-tick-0', { x: x0, y: y - 1.5 }, { x: x0, y: y + 1.5 }, 'secondary'),
    line('scale-tick-1', { x: x0 + 25, y: y - 1.5 }, { x: x0 + 25, y: y + 1.5 }, 'secondary'),
    text('scale-zero', { x: x0, y: 106 }, '0', 'note'),
    text('scale-five', { x: x0 + 25, y: 106 }, '5 m', 'note', 'end')
  ]
}

export const createSyntheticSettingPublicationScene = (
  source: SyntheticSettingPublicationSource
): DrawingScene => {
  if (source.view.value.scale !== 200) throw new Error('Synthetic setting publication scene is frozen at true 1:200.')
  if (source.absences.plotDepth !== 'ABSENT' || source.absences.legalBoundary !== 'ABSENT') {
    throw new Error('Synthetic setting may not acquire a plot depth or legal boundary.')
  }

  const width = source.house.shell.value.width
  const depth = source.house.shell.value.depth
  const project = createPlanPaperProjection({
    scaleDenominator: source.view.value.scale,
    modelBounds: { x: 0, y: 0, width, height: depth },
    paperOrigin: HOUSE_ORIGIN
  })
  const house = project.rect({ x: 0, y: 0, width, height: depth })
  const court = project.rect({
    x: source.house.court.value.x0,
    y: source.house.court.value.y0,
    width: source.house.court.value.width,
    height: source.house.court.value.depth
  })
  const sidePaper = project.length(source.surrogate.sideClearance.value)
  const westStressX = house.x - sidePaper
  const eastStressX = house.x + house.width + sidePaper
  const guideTop = house.y - 5
  const guideBottom = house.y + house.height + 5
  const midY = house.y + house.height / 2
  const dimensionY = 10

  const primitives: DrawingPrimitive[] = [
    rect('setting-house-shell', house, 'profile', {
      authority: source.house.shell.authority,
      role: 'controlled-house-substrate'
    }),
    rect('setting-court', court, 'secondary', {
      authority: source.house.court.authority,
      role: 'controlled-open-courtyard'
    }),
    line('surrogate-west-stress-line', { x: westStressX, y: guideTop }, { x: westStressX, y: guideBottom }, 'secondary', {
      authority: source.surrogate.width.authority,
      precision: source.surrogate.width.precision,
      role: 'lateral-width-stress-line-not-legal-boundary'
    }, 'provisional'),
    line('surrogate-east-stress-line', { x: eastStressX, y: guideTop }, { x: eastStressX, y: guideBottom }, 'secondary', {
      authority: source.surrogate.width.authority,
      precision: source.surrogate.width.precision,
      role: 'lateral-width-stress-line-not-legal-boundary'
    }, 'provisional'),
    line('surrogate-width-dimension', { x: westStressX, y: dimensionY }, { x: eastStressX, y: dimensionY }, 'secondary', {
      authority: source.surrogate.width.authority,
      role: 'surrogate-width-stress-test'
    }, 'provisional'),
    line('surrogate-width-west-tick', { x: westStressX, y: dimensionY - 2 }, { x: westStressX, y: dimensionY + 2 }, 'secondary', {}, 'provisional'),
    line('surrogate-width-east-tick', { x: eastStressX, y: dimensionY - 2 }, { x: eastStressX, y: dimensionY + 2 }, 'secondary', {}, 'provisional'),
    text('surrogate-width-label', { x: (westStressX + eastStressX) / 2, y: 7 }, '≈15.5 m surrogate width stress-test', 'label', 'middle', {
      authority: source.surrogate.width.authority
    }),
    text('west-strip-label', { x: westStressX - 2, y: midY - 3 }, '≈1.75 m', 'note', 'end'),
    text('west-strip-role', { x: westStressX - 2, y: midY + 1 }, 'west access', 'note', 'end', {
      authority: source.surrogate.westStrip.authority
    }),
    text('east-strip-label', { x: eastStressX + 2, y: midY - 3 }, '≈1.75 m', 'note'),
    text('east-strip-role', { x: eastStressX + 2, y: midY + 1 }, 'east service', 'note', 'start', {
      authority: source.surrogate.eastStrip.authority
    }),
    text('front-open-note', { x: house.x + house.width / 2, y: house.y + house.height + 10 }, 'model front / south · continuation unknown', 'note', 'middle', {
      boundary: 'ABSENT',
      geographicNorth: 'ABSENT'
    }),
    text('rear-open-note', { x: house.x + house.width / 2, y: house.y - 8 }, 'rear / garden continuation · no plot boundary', 'note', 'middle', {
      boundary: 'ABSENT',
      relationAuthority: source.surrogate.rearRelation.authority
    }),
    text('court-logistics-note', { x: house.x + house.width / 2, y: house.y + 19 }, 'garden → dining → court logistics relation retained; route centreline absent', 'note', 'middle', {
      authority: source.surrogate.courtyardLogistics.authority,
      geometry: 'ABSENT'
    }),
    text('site-absence-note', { x: 83, y: 91 }, 'Synthetic type setting only · no legal boundary, plot depth, road or neighbours asserted.', 'note', 'middle'),
    ...scaleBar()
  ]

  return {
    widthMm: SCENE_WIDTH_MM,
    heightMm: SCENE_HEIGHT_MM,
    viewId: source.view.value.id,
    title: 'Reference House synthetic setting and type plan',
    description: 'Synthetic 1:200 setting stress-test showing controlled house geometry inside the documented approximate 15.5 metre surrogate width. Lateral working capacity is explicit while plot depth, legal boundaries, highway, neighbours and real-site orientation remain absent.',
    scaleDenominator: source.view.value.scale,
    sourceId: source.view.value.id,
    primitives
  }
}
