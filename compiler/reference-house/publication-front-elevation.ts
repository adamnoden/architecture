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
  FrontElevationOpeningSource,
  FrontElevationPublicationSource
} from './publication-front-elevation-source.js'

const SCENE_WIDTH_MM = 166
const SCENE_HEIGHT_MM = 92
const ELEVATION_ORIGIN: PaperPoint = { x: 14, y: 8 }
const ELEVATION_TOP_MM = 6500

const linePrimitive = (
  id: string,
  a: PaperPoint,
  b: PaperPoint,
  role: DrawingLine['role'],
  metadata: DrawingLine['metadata'] = {},
  dash?: DrawingLine['dash']
): DrawingLine => ({ kind: 'line', id, a, b, role, ...(dash ? { dash } : {}), metadata })

const rectPrimitive = (
  id: string,
  rect: { x: number; y: number; width: number; height: number },
  stroke: DrawingRect['stroke'],
  dash: DrawingRect['dash'],
  metadata: DrawingRect['metadata'] = {}
): DrawingRect => ({ kind: 'rect', id, ...rect, stroke, dash, fill: 'none', metadata })

const textPrimitive = (
  id: string,
  point: PaperPoint,
  value: string,
  role: DrawingText['role'],
  anchor: DrawingText['anchor'] = 'start',
  metadata: DrawingText['metadata'] = {}
): DrawingText => ({ kind: 'text', id, x: point.x, y: point.y, value, role, anchor, metadata })

interface DimensionBounds {
  min: number
  max: number
  kind: 'approximate' | 'range'
}

const dimensionBounds = (dimension: DimensionAuthority): DimensionBounds | undefined => {
  if (dimension.kind === 'unknown') return undefined
  if (dimension.kind === 'approximate') {
    return { min: dimension.value, max: dimension.value, kind: 'approximate' }
  }
  if (dimension.min > dimension.max) throw new Error('Elevation source range requires min <= max.')
  return { min: dimension.min, max: dimension.max, kind: 'range' }
}

const openingBaseElevation = (
  source: FrontElevationPublicationSource,
  opening: FrontElevationOpeningSource
): number => opening.level === 'GROUND' ? source.levels.groundFfl.value : source.levels.firstFfl.value

const openingPrimitives = (
  source: FrontElevationPublicationSource,
  project: ReturnType<typeof createElevationPaperProjection>,
  opening: FrontElevationOpeningSource
): DrawingPrimitive[] => {
  const width = dimensionBounds(opening.width.value)
  const sill = dimensionBounds(opening.sill.value)
  const head = dimensionBounds(opening.head.value)
  if (!width || !head) throw new Error(`Front elevation opening ${opening.id} requires bounded width and head geometry.`)

  const centre = source.bayAxes.value[opening.bayIndex - 1]
  const base = openingBaseElevation(source, opening)
  const maxHead = base + head.max
  const minHead = base + head.min
  const outerLeft = centre - width.max / 2
  const outerRight = centre + width.max / 2
  const outerHeadA = project.point(outerLeft, maxHead)
  const outerHeadB = project.point(outerRight, maxHead)
  const metadata = {
    authority: 'PROVISIONAL',
    precisionWidth: opening.width.precision,
    precisionSill: opening.sill.precision,
    precisionHead: opening.head.precision,
    role: opening.role,
    level: opening.level,
    bayIndex: opening.bayIndex
  }

  if (!sill) {
    if (opening.role !== 'entrance') {
      throw new Error(`Front elevation opening ${opening.id} has unresolved sill geometry.`)
    }
    const primitives: DrawingPrimitive[] = [
      linePrimitive(`opening-${opening.id}-head-max`, outerHeadA, outerHeadB, 'secondary', {
        ...metadata,
        unresolvedLowerTermination: true
      }, 'provisional')
    ]

    if (head.kind === 'range' && minHead !== maxHead) {
      primitives.push(
        linePrimitive(
          `opening-${opening.id}-head-min`,
          project.point(outerLeft, minHead),
          project.point(outerRight, minHead),
          'secondary',
          metadata,
          'provisional'
        )
      )
    }

    if (width.kind === 'range' && width.min !== width.max) {
      const y = outerHeadA.y
      const innerLeft = project.point(centre - width.min / 2, maxHead).x
      const innerRight = project.point(centre + width.min / 2, maxHead).x
      primitives.push(
        linePrimitive(`opening-${opening.id}-width-min-left`, { x: innerLeft, y: y - 1 }, { x: innerLeft, y: y + 1 }, 'secondary', metadata, 'provisional'),
        linePrimitive(`opening-${opening.id}-width-min-right`, { x: innerRight, y: y - 1 }, { x: innerRight, y: y + 1 }, 'secondary', metadata, 'provisional')
      )
    }

    return primitives
  }

  const minSill = base + sill.min
  const maxSill = base + sill.max
  const envelope = project.rect({
    x: outerLeft,
    y: minSill,
    width: width.max,
    height: maxHead - minSill
  })
  const primitives: DrawingPrimitive[] = [
    rectPrimitive(`opening-${opening.id}-envelope`, envelope, 'secondary', 'provisional', metadata)
  ]

  if (width.kind === 'range' && width.min !== width.max) {
    const innerLeft = centre - width.min / 2
    const innerRight = centre + width.min / 2
    primitives.push(
      linePrimitive(
        `opening-${opening.id}-width-min-left`,
        project.point(innerLeft, minSill),
        project.point(innerLeft, maxHead),
        'secondary',
        metadata,
        'provisional'
      ),
      linePrimitive(
        `opening-${opening.id}-width-min-right`,
        project.point(innerRight, minSill),
        project.point(innerRight, maxHead),
        'secondary',
        metadata,
        'provisional'
      )
    )
  }

  if (sill.kind === 'range' && minSill !== maxSill) {
    primitives.push(
      linePrimitive(
        `opening-${opening.id}-sill-max`,
        project.point(outerLeft, maxSill),
        project.point(outerRight, maxSill),
        'secondary',
        metadata,
        'provisional'
      )
    )
  }

  if (head.kind === 'range' && minHead !== maxHead) {
    primitives.push(
      linePrimitive(
        `opening-${opening.id}-head-min`,
        project.point(outerLeft, minHead),
        project.point(outerRight, minHead),
        'secondary',
        metadata,
        'provisional'
      )
    )
  }

  return primitives
}

const facadeProfilePrimitives = (
  source: FrontElevationPublicationSource,
  project: ReturnType<typeof createElevationPaperProjection>
): DrawingPrimitive[] => {
  const z0 = source.levels.groundFfl.value
  const z1 = source.levels.corniceControl.value
  const width = source.facadeWidth.value
  const metadata = {
    authority: 'PROVISIONAL',
    treatment: 'facade-profile-to-provisional-cornice-control',
    lowerTermination: 'drawing-termination-at-gffl-not-exterior-grade'
  }
  return [
    linePrimitive('facade-profile-west', project.point(0, z0), project.point(0, z1), 'profile', metadata, 'provisional'),
    linePrimitive('facade-profile-east', project.point(width, z0), project.point(width, z1), 'profile', metadata, 'provisional'),
    linePrimitive('cornice-control', project.point(0, z1), project.point(width, z1), 'secondary', {
      authority: 'PROVISIONAL',
      precision: source.levels.corniceControl.precision,
      treatment: 'control-only-not-resolved-roof-silhouette'
    }, 'provisional')
  ]
}

const levelPrimitives = (
  source: FrontElevationPublicationSource,
  project: ReturnType<typeof createElevationPaperProjection>
): DrawingPrimitive[] => {
  const x0 = project.point(source.facadeWidth.value, 0).x + 3
  const x1 = x0 + 7
  const tx = x1 + 1.5
  const levels = [
    ['GFFL ±0.000', source.levels.groundFfl.value, false],
    ['Ground ceiling +2.950', source.levels.groundCeiling.value, false],
    ['First FFL +3.300', source.levels.firstFfl.value, false],
    ['Upper ceiling +6.000', source.levels.upperCeiling.value, false],
    ['≈ Cornice control +6.250', source.levels.corniceControl.value, true]
  ] as const

  return levels.flatMap(([label, z, provisional]) => {
    const py = project.point(0, z).y
    const slug = label.toLowerCase().replaceAll(' ', '-').replaceAll('.', '').replaceAll('≈', 'approx')
    return [
      linePrimitive(
        `level-${slug}`,
        { x: x0, y: py },
        { x: x1, y: py },
        'secondary',
        { elevation: z, visibleFacadeGeometry: false, ...(provisional ? { authority: 'PROVISIONAL' } : { authority: 'CONTROLLED' }) },
        provisional ? 'provisional' : 'datum'
      ),
      textPrimitive(`level-text-${slug}`, { x: tx, y: py + 0.8 }, label, 'note')
    ]
  })
}

const scaleBarPrimitives = (): DrawingPrimitive[] => {
  const x0 = 14
  const y = 84
  return [
    linePrimitive('scale-bar', { x: x0, y }, { x: x0 + 30, y }, 'primary'),
    ...Array.from({ length: 4 }, (_, index) =>
      linePrimitive(`scale-tick-${index}`, { x: x0 + index * 10, y: y - 2 }, { x: x0 + index * 10, y: y + 2 }, 'secondary')
    ),
    textPrimitive('scale-zero', { x: x0, y: y + 5 }, '0', 'note'),
    textPrimitive('scale-three', { x: x0 + 30, y: y + 5 }, '3 m', 'note', 'end')
  ]
}

export const createFrontElevationPublicationScene = (
  source: FrontElevationPublicationSource
): DrawingScene => {
  const scale = source.view.value.scale
  const project = createElevationPaperProjection({
    scaleDenominator: scale,
    horizontalBounds: { min: 0, max: source.facadeWidth.value },
    verticalBounds: { min: 0, max: ELEVATION_TOP_MM },
    paperOrigin: ELEVATION_ORIGIN
  })
  const primitives: DrawingPrimitive[] = []

  primitives.push(...facadeProfilePrimitives(source, project))
  for (const opening of source.openings) primitives.push(...openingPrimitives(source, project, opening))
  primitives.push(...levelPrimitives(source, project), ...scaleBarPrimitives())
  primitives.push(
    textPrimitive(
      'provisional-opening-note',
      { x: 14, y: 78 },
      'Provisional opening geometry; paired extents show source ranges.',
      'note'
    ),
    textPrimitive(
      'entrance-unresolved-note',
      { x: 14, y: 81 },
      'Entrance lower termination unresolved; no threshold or exterior grade asserted.',
      'note'
    )
  )

  return {
    widthMm: SCENE_WIDTH_MM,
    heightMm: SCENE_HEIGHT_MM,
    viewId: source.view.value.id,
    title: 'Reference House principal front elevation',
    description:
      'South/front orthographic elevation at 1:100. Controlled bay placement is combined with explicitly provisional opening and cornice geometry; unresolved grade, threshold, ridge and decorative articulation are not invented.',
    scaleDenominator: scale,
    sourceId: source.view.value.id,
    primitives
  }
}
