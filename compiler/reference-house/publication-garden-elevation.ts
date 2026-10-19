import type {
  DrawingLine,
  DrawingPrimitive,
  DrawingRect,
  DrawingScene,
  DrawingText,
  PaperPoint
} from '../publication-drawing/model.js'
import { createElevationPaperProjection } from '../publication-drawing/projection.js'
import type { DimensionAuthority } from './model.js'
import type {
  GardenElevationOpeningSource,
  GardenElevationPublicationSource
} from './publication-garden-elevation-source.js'

const SCENE_WIDTH_MM = 166
const SCENE_HEIGHT_MM = 96
const ELEVATION_ORIGIN: PaperPoint = { x: 14, y: 8 }
const ELEVATION_TOP_MM = 6500

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
  metadata: DrawingRect['metadata'] = {}
): DrawingRect => ({ kind: 'rect', id, ...value, stroke: 'secondary', dash: 'provisional', fill: 'none', metadata })

const text = (
  id: string,
  point: PaperPoint,
  value: string,
  role: DrawingText['role'],
  anchor: DrawingText['anchor'] = 'start',
  metadata: DrawingText['metadata'] = {}
): DrawingText => ({ kind: 'text', id, x: point.x, y: point.y, value, role, anchor, metadata })

interface Bounds { min: number; max: number; kind: 'approximate' | 'range' }
const bounds = (dimension: DimensionAuthority): Bounds | undefined => {
  if (dimension.kind === 'unknown') return undefined
  if (dimension.kind === 'approximate') return { min: dimension.value, max: dimension.value, kind: 'approximate' }
  if (dimension.min > dimension.max) throw new Error('Garden elevation source range requires min <= max.')
  return { min: dimension.min, max: dimension.max, kind: 'range' }
}

const baseElevation = (source: GardenElevationPublicationSource, opening: GardenElevationOpeningSource): number =>
  opening.level === 'GROUND' ? source.levels.groundFfl.value : source.levels.firstFfl.value

const boundedOpening = (
  source: GardenElevationPublicationSource,
  project: ReturnType<typeof createElevationPaperProjection>,
  opening: GardenElevationOpeningSource
): DrawingPrimitive[] => {
  if (opening.width === 'ABSENT' || opening.sill === 'ABSENT' || opening.head === 'ABSENT') return []
  const width = bounds(opening.width.value)
  const sill = bounds(opening.sill.value)
  const head = bounds(opening.head.value)
  if (!width || !sill || !head) return []
  const centre = source.axes.value[opening.axisIndex - 1]
  const base = baseElevation(source, opening)
  const outer = project.rect({
    x: centre - width.max / 2,
    y: base + sill.min,
    width: width.max,
    height: head.max - sill.min
  })
  const metadata = {
    authority: 'PROVISIONAL',
    occurrenceAuthority: opening.occurrence.authority,
    role: opening.role,
    axisIndex: opening.axisIndex,
    precisionWidth: opening.width.precision,
    precisionSill: opening.sill.precision,
    precisionHead: opening.head.precision
  }
  const primitives: DrawingPrimitive[] = [rect(`opening-${opening.id}-envelope`, outer, metadata)]
  if (width.kind === 'range' && width.min !== width.max) {
    for (const [side, x] of [['left', centre - width.min / 2], ['right', centre + width.min / 2]] as const) {
      primitives.push(line(
        `opening-${opening.id}-width-min-${side}`,
        project.point(x, base + sill.min),
        project.point(x, base + head.max),
        'secondary', metadata, 'provisional'
      ))
    }
  }
  if (sill.kind === 'range' && sill.min !== sill.max) {
    primitives.push(line(
      `opening-${opening.id}-sill-max`,
      project.point(centre - width.max / 2, base + sill.max),
      project.point(centre + width.max / 2, base + sill.max),
      'secondary', metadata, 'provisional'
    ))
  }
  if (head.kind === 'range' && head.min !== head.max) {
    primitives.push(line(
      `opening-${opening.id}-head-min`,
      project.point(centre - width.max / 2, base + head.min),
      project.point(centre + width.max / 2, base + head.min),
      'secondary', metadata, 'provisional'
    ))
  }
  return primitives
}

const unresolvedOccurrencePrimitives = (
  source: GardenElevationPublicationSource,
  project: ReturnType<typeof createElevationPaperProjection>
): DrawingPrimitive[] => {
  const centreGround = source.openings.find((candidate) => candidate.id === 'G-GARDEN-CENTRE')
  const eastGround = source.openings.find((candidate) => candidate.id === 'G-GARDEN-EAST')
  const centreUpper = source.openings.find((candidate) => candidate.id === 'U-GARDEN-CENTRE')
  if (!centreGround?.clearOpeningTarget || !eastGround || !centreUpper || centreUpper.sill === 'ABSENT' || centreUpper.head === 'ABSENT') {
    throw new Error('Garden elevation requires all three explicitly unresolved occurrence records.')
  }

  const centreX = source.axes.value[1]
  const target = centreGround.clearOpeningTarget.value
  const targetZ = 450
  const a = project.point(centreX - target / 2, targetZ)
  const b = project.point(centreX + target / 2, targetZ)
  const targetMeta = {
    authority: centreGround.clearOpeningTarget.authority,
    role: 'clear-opening-target-only',
    apertureGeometry: 'ABSENT'
  }

  const upperSill = bounds(centreUpper.sill.value)
  const upperHead = bounds(centreUpper.head.value)
  if (!upperSill || !upperHead) throw new Error('Garden elevation centre-upper occurrence requires bounded vertical family.')
  const upperBase = source.levels.firstFfl.value
  const upperAxisX = source.axes.value[1]
  const upperA = project.point(upperAxisX, upperBase + upperSill.min)
  const upperB = project.point(upperAxisX, upperBase + upperHead.max)

  return [
    line('garden-clear-target', a, b, 'secondary', targetMeta, 'provisional'),
    line('garden-clear-target-west-tick', { x: a.x, y: a.y - 1.5 }, { x: a.x, y: a.y + 1.5 }, 'secondary', targetMeta, 'provisional'),
    line('garden-clear-target-east-tick', { x: b.x, y: b.y - 1.5 }, { x: b.x, y: b.y + 1.5 }, 'secondary', targetMeta, 'provisional'),
    text('garden-clear-target-label', { x: (a.x + b.x) / 2, y: a.y - 2.2 }, '≈1.2 m clear target', 'note', 'middle', targetMeta),
    line('upper-centre-occurrence-axis', upperA, upperB, 'secondary', {
      authority: centreUpper.occurrence.authority,
      role: centreUpper.role,
      width: 'ABSENT',
      treatment: 'occurrence-axis-only'
    }, 'provisional'),
    text('upper-centre-occurrence-label', { x: upperA.x, y: upperB.y - 2 }, 'dry-store opening · width unresolved', 'note', 'middle'),
    line('ground-east-occurrence-tick', project.point(source.axes.value[2], 250), project.point(source.axes.value[2], 900), 'secondary', {
      authority: eastGround.occurrence.authority,
      role: eastGround.role,
      kind: 'ABSENT',
      dimensions: 'ABSENT',
      treatment: 'occurrence-axis-only'
    }, 'provisional'),
    text('ground-east-occurrence-label', project.point(source.axes.value[2], 1050), 'kitchen opening · unresolved', 'note', 'middle')
  ]
}

const facadePrimitives = (
  source: GardenElevationPublicationSource,
  project: ReturnType<typeof createElevationPaperProjection>
): DrawingPrimitive[] => {
  const z0 = source.levels.groundFfl.value
  const z1 = source.levels.corniceControl.value
  const width = source.facadeWidth.value
  const meta = {
    authority: 'PROVISIONAL',
    lowerTermination: 'GFFL-drawing-termination-not-exterior-grade',
    facadePanels: 'ABSENT'
  }
  return [
    line('garden-profile-west', project.point(0, z0), project.point(0, z1), 'profile', meta, 'provisional'),
    line('garden-profile-east', project.point(width, z0), project.point(width, z1), 'profile', meta, 'provisional'),
    line('garden-cornice-control', project.point(0, z1), project.point(width, z1), 'secondary', {
      authority: source.levels.corniceControl.authority,
      treatment: 'control-only-not-resolved-roof-silhouette'
    }, 'provisional')
  ]
}

const axisPrimitives = (
  source: GardenElevationPublicationSource,
  project: ReturnType<typeof createElevationPaperProjection>
): DrawingPrimitive[] => source.axes.value.flatMap((axis, index) => {
  const x = project.point(axis, 0).x
  return [
    line(`garden-axis-${index + 1}-tick`, { x, y: 71 }, { x, y: 74 }, 'secondary', {
      authority: source.axes.authority,
      precision: source.axes.precision,
      role: 'composition-axis-not-panel-edge'
    }, 'provisional'),
    text(`garden-axis-${index + 1}-label`, { x, y: 78 }, index === 1 ? 'centre' : index === 0 ? 'west' : 'east', 'note', 'middle')
  ]
})

const datumPrimitives = (
  source: GardenElevationPublicationSource,
  project: ReturnType<typeof createElevationPaperProjection>
): DrawingPrimitive[] => {
  const x0 = project.point(source.facadeWidth.value, 0).x + 3
  const x1 = x0 + 7
  const tx = x1 + 1.5
  const levels = [
    ['GFFL ±0', source.levels.groundFfl.value, false],
    ['First +3.300', source.levels.firstFfl.value, false],
    ['Upper ceil +6.000', source.levels.upperCeiling.value, false],
    ['≈ Cornice +6.250', source.levels.corniceControl.value, true]
  ] as const
  return levels.flatMap(([label, z, isProvisional]) => {
    const y = project.point(0, z).y
    return [
      line(`garden-datum-${z}`, { x: x0, y }, { x: x1, y }, 'secondary', {
        elevation: z,
        visibleFacadeGeometry: false,
        authority: isProvisional ? 'PROVISIONAL' : 'CONTROLLED'
      }, isProvisional ? 'provisional' : 'datum'),
      text(`garden-datum-label-${z}`, { x: tx, y: y + 0.8 }, label, 'note')
    ]
  })
}

const scaleBar = (): DrawingPrimitive[] => {
  const x0 = 14
  const y = 88
  return [
    line('scale-bar', { x: x0, y }, { x: x0 + 30, y }, 'primary'),
    ...Array.from({ length: 4 }, (_, index) => line(`scale-tick-${index}`, { x: x0 + index * 10, y: y - 2 }, { x: x0 + index * 10, y: y + 2 }, 'secondary')),
    text('scale-zero', { x: x0, y: y + 5 }, '0', 'note'),
    text('scale-three', { x: x0 + 30, y: y + 5 }, '3 m', 'note', 'end')
  ]
}

export const createGardenElevationPublicationScene = (
  source: GardenElevationPublicationSource
): DrawingScene => {
  if (source.view.value.scale !== 100) throw new Error('Garden elevation publication scene is frozen at true 1:100.')
  if (source.order.value.fieldCount !== 3 || source.order.value.continuousGlazedWall) {
    throw new Error('Garden elevation requires the frozen three-field masonry-separated order.')
  }
  const project = createElevationPaperProjection({
    scaleDenominator: source.view.value.scale,
    horizontalBounds: { min: 0, max: source.facadeWidth.value },
    verticalBounds: { min: 0, max: ELEVATION_TOP_MM },
    paperOrigin: ELEVATION_ORIGIN
  })
  const primitives: DrawingPrimitive[] = [...facadePrimitives(source, project)]
  for (const opening of source.openings) primitives.push(...boundedOpening(source, project, opening))
  primitives.push(...unresolvedOccurrencePrimitives(source, project))
  primitives.push(...axisPrimitives(source, project), ...datumPrimitives(source, project), ...scaleBar())
  primitives.push(
    text('garden-order-note', { x: 48, y: 84 }, 'Three room-owned fields · masonry retained between openings.', 'note'),
    text('garden-authority-note', { x: 48, y: 88 }, 'Dashed extents provisional; axis-only marks mean aperture geometry is absent.', 'note')
  )
  return {
    widthMm: SCENE_WIDTH_MM,
    heightMm: SCENE_HEIGHT_MM,
    viewId: source.view.value.id,
    title: 'Reference House garden elevation',
    description: 'North/garden elevation at true 1:100. RH-10 three-field order and selected opening occurrences are shown at their actual authority; unresolved threshold, kitchen-opening and dry-store aperture geometry are not invented.',
    scaleDenominator: source.view.value.scale,
    sourceId: source.view.value.id,
    primitives
  }
}
