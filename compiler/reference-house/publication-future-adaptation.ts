import type {
  DrawingPrimitive,
  DrawingRect,
  DrawingScene,
  DrawingText,
  PaperPoint
} from '../publication-drawing/model.js'
import { createPlanPaperProjection } from '../publication-drawing/projection.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createGroundFloorPublicationPlanScene } from './publication-ground-plan.js'
import { createGroundFloorPublicationPlanSource } from './publication-plan-source.js'
import {
  createFutureAdaptationPublicationSource,
  type FutureAdaptationPublicationSource
} from './publication-future-adaptation-source.js'
import type { ReferenceHouseCompileResult } from './model.js'

const PLAN_ORIGIN: PaperPoint = { x: 8, y: 12 }

const rect = (
  id: string,
  value: { x: number; y: number; width: number; height: number },
  options: {
    stroke: DrawingRect['stroke']
    dash?: DrawingRect['dash']
    metadata: DrawingRect['metadata']
  }
): DrawingRect => ({
  kind: 'rect',
  id,
  ...value,
  stroke: options.stroke,
  fill: 'none',
  ...(options.dash ? { dash: options.dash } : {}),
  metadata: options.metadata
})

const text = (
  id: string,
  point: PaperPoint,
  value: string,
  role: DrawingText['role'],
  anchor: DrawingText['anchor'] = 'middle',
  metadata: DrawingText['metadata'] = {},
  rotateDeg?: number
): DrawingText => ({
  kind: 'text',
  id,
  x: point.x,
  y: point.y,
  value,
  role,
  anchor,
  ...(rotateDeg === undefined ? {} : { rotateDeg }),
  metadata
})

const requireCompiled = (): ReferenceHouseCompileResult => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  if (result.status === 'FAIL') throw new Error('Cannot create DRW-10E.1 overlay from failed Reference House compile.')
  return result
}

const requireGroundSpace = (result: ReturnType<typeof requireCompiled>, spaceId: string) => {
  const space = result.derived.spaces.find((candidate) => candidate.levelId === 'GROUND' && candidate.id === spaceId)
  if (!space) throw new Error(`DRW-10E.1 source refers to unavailable ground-floor space ${spaceId}.`)
  return space
}

const centreOfBoxes = (boxes: ReadonlyArray<{ x: number; y: number; width: number; height: number }>): { x: number; y: number } => {
  if (boxes.length === 0) throw new Error('DRW-10E.1 cannot label a space with no geometric boxes.')
  const minX = Math.min(...boxes.map((box) => box.x))
  const minY = Math.min(...boxes.map((box) => box.y))
  const maxX = Math.max(...boxes.map((box) => box.x + box.width))
  const maxY = Math.max(...boxes.map((box) => box.y + box.height))
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
}

const fieldOverlay = (
  result: ReturnType<typeof requireCompiled>,
  project: ReturnType<typeof createPlanPaperProjection>,
  options: {
    id: string
    spaceId: string
    role: string
    authority: string
    reading: string
    sourceStatus?: string
    stroke: NonNullable<DrawingRect['stroke']>
    dash?: DrawingRect['dash']
    label: string
    labelOffsetMm?: PaperPoint
    labelRotateDeg?: number
    geometryBoundary: string
  }
): DrawingPrimitive[] => {
  const space = requireGroundSpace(result, options.spaceId)
  const metadata = {
    overlay: 'future-adaptation',
    role: options.role,
    space: options.spaceId,
    authority: options.authority,
    reading: options.reading,
    sourceStatus: options.sourceStatus,
    geometry: options.geometryBoundary,
    provisional: space.provisional
  }
  const fields = space.boxes.map((box, index) => rect(
    `${options.id}-field-${index}`,
    project.rect(box),
    { stroke: options.stroke, ...(options.dash ? { dash: options.dash } : {}), metadata }
  ))
  const centre = centreOfBoxes(space.boxes)
  const projectedCentre = project.point(centre.x, centre.y)
  const offset = options.labelOffsetMm ?? { x: 0, y: 0 }
  const labelPoint = { x: projectedCentre.x + offset.x, y: projectedCentre.y + offset.y }
  return [
    ...fields,
    text(`${options.id}-label`, labelPoint, options.label, 'marker', 'middle', metadata, options.labelRotateDeg)
  ]
}

export const createFutureAdaptationOverlayScene = (
  source: FutureAdaptationPublicationSource = createFutureAdaptationPublicationSource()
): DrawingScene => {
  const result = requireCompiled()
  const groundSource = createGroundFloorPublicationPlanSource()
  const base = createGroundFloorPublicationPlanScene(result, groundSource)
  if (base.viewId !== source.view.substrate || base.scaleDenominator !== source.view.scale) {
    throw new Error('DRW-10E.1 substrate no longer matches the frozen ground-floor publication plan.')
  }

  const project = createPlanPaperProjection({
    scaleDenominator: source.view.scale,
    modelBounds: { x: 0, y: 0, width: result.derived.shell.width, height: result.derived.shell.depth },
    paperOrigin: PLAN_ORIGIN
  })

  const overlay: DrawingPrimitive[] = [
    ...fieldOverlay(result, project, {
      id: 'future-sleeping',
      spaceId: source.sleeping.value.spaceId,
      role: 'fallback-sleeping-topological-capability',
      authority: source.sleeping.authority,
      reading: source.sleeping.value.reading,
      sourceStatus: source.sleeping.value.sourceStatus,
      stroke: 'primary',
      dash: 'provisional',
      label: 'FALLBACK SLEEPING',
      labelOffsetMm: { x: 0, y: -16 },
      geometryBoundary: 'whole-host-space-field-no-bed-or-clearance-geometry'
    }),
    ...source.route.value.spaceIds.flatMap((spaceId, index) => fieldOverlay(result, project, {
      id: `future-route-${index}`,
      spaceId,
      role: 'one-level-route-territory',
      authority: source.route.authority,
      reading: source.route.value.reading,
      stroke: 'secondary',
      dash: 'provisional',
      label: index === 0 ? 'ONE-LEVEL ROUTE' : 'ROUTE TERRITORY',
      labelOffsetMm: index === 0 ? { x: 12, y: -9 } : { x: 1.5, y: 0 },
      ...(index === 1 ? { labelRotateDeg: -90 } : {}),
      geometryBoundary: 'whole-host-space-field-not-route-centreline-or-clear-width'
    })),
    ...fieldOverlay(result, project, {
      id: 'future-sanitary',
      spaceId: source.sanitary.value.spaceId,
      role: 'sanitary-shower-adaptation-geography',
      authority: source.sanitary.authority,
      reading: source.sanitary.value.reading,
      sourceStatus: source.sanitary.value.sourceStatus,
      stroke: 'profile',
      dash: 'provisional',
      label: 'SANITARY / SHOWER',
      labelOffsetMm: { x: 0, y: 12 },
      geometryBoundary: 'gross-service-suite-only-no-subdivision-or-fixtures'
    }),
    text(
      'future-adaptation-boundary-1',
      { x: 8, y: 130 },
      'Future adaptation · M4(2)-informed comparator; no compliance claim.',
      'note',
      'start',
      {
        overlay: 'future-adaptation',
        comparator: source.comparator.value,
        accessibilityCompliance: source.absences.accessibilityCompliance
      }
    ),
    text(
      'future-adaptation-boundary-2',
      { x: 8, y: 133 },
      'Framework, not accessible-suite proof · no bed, route or fixture geometry.',
      'note',
      'start',
      {
        overlay: 'future-adaptation',
        bedGeometry: source.absences.bedGeometry,
        routeCentreline: source.absences.routeCentreline,
        finishedRouteClearWidth: source.absences.finishedRouteClearWidth,
        exactSanitarySubdivision: source.absences.exactSanitarySubdivision,
        wcFixtureGeometry: source.absences.wcFixtureGeometry,
        showerGeometry: source.absences.showerGeometry,
        completeFallbackModeProof: source.absences.completeFallbackModeProof
      }
    )
  ]

  return {
    ...base,
    viewId: source.view.id,
    title: 'Reference House entrance-storey future-adaptation framework',
    description: 'Analytical overlay on the canonical ground plan. It identifies a provisional fallback sleeping option, existing one-level route territory and gross sanitary/shower adaptation geography after loss of stair use. It is an M4(2)-informed comparator, not an accessibility-compliance or accessible-suite proof, and introduces no bed, route-centreline, fixture, manoeuvring or clearance geometry.',
    sourceId: source.view.id,
    primitives: [...base.primitives, ...overlay]
  }
}
