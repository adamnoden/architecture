import type { DrawingLine, DrawingPrimitive, DrawingScene, DrawingText, PaperPoint } from '../publication-drawing/model.js'
import { createElevationPaperProjection } from '../publication-drawing/projection.js'
import type { ServiceSideElevationPublicationSource } from './publication-service-side-elevation-source.js'

const SCENE_WIDTH_MM = 166
const SCENE_HEIGHT_MM = 96
const ORIGIN: PaperPoint = { x: 14, y: 8 }
const TOP_MM = 6500

const line = (
  id: string,
  a: PaperPoint,
  b: PaperPoint,
  role: DrawingLine['role'],
  metadata: DrawingLine['metadata'] = {},
  dash?: DrawingLine['dash']
): DrawingLine => ({ kind: 'line', id, a, b, role, ...(dash ? { dash } : {}), metadata })

const text = (
  id: string,
  point: PaperPoint,
  value: string,
  role: DrawingText['role'],
  anchor: DrawingText['anchor'] = 'start',
  metadata: DrawingText['metadata'] = {}
): DrawingText => ({ kind: 'text', id, x: point.x, y: point.y, value, role, anchor, metadata })

const facade = (
  source: ServiceSideElevationPublicationSource,
  project: ReturnType<typeof createElevationPaperProjection>
): DrawingPrimitive[] => {
  const z0 = source.levels.groundFfl.value
  const z1 = source.levels.corniceControl.value
  const depth = source.facadeDepth.value
  const profileMeta = {
    authority: 'PROVISIONAL',
    lowerTermination: 'GFFL-drawing-termination-not-exterior-grade',
    facadePanels: 'ABSENT'
  }
  return [
    line('service-profile-south', project.point(0, z0), project.point(0, z1), 'profile', profileMeta, 'provisional'),
    line('service-profile-north', project.point(depth, z0), project.point(depth, z1), 'profile', profileMeta, 'provisional'),
    line('service-cornice-control', project.point(0, z1), project.point(depth, z1), 'secondary', {
      authority: source.levels.corniceControl.authority,
      treatment: 'control-only-not-resolved-roof-silhouette'
    }, 'provisional')
  ]
}

const fieldNotation = (
  source: ServiceSideElevationPublicationSource,
  project: ReturnType<typeof createElevationPaperProjection>
): DrawingPrimitive[] => source.fields.flatMap((field, index) => {
  const centre = (field.extent.value.y0 + field.extent.value.y1) / 2
  const x = project.point(centre, 0).x
  const labels = [
    'study / east-front bedroom',
    'service suite / family bathroom',
    'kitchen / east-rear bedroom'
  ] as const
  const primitives: DrawingPrimitive[] = [
    text(`service-field-${field.id}-label`, { x, y: 78 }, labels[index], 'note', 'middle', {
      authority: field.ownership.authority,
      treatment: 'field-ownership-label-not-facade-seam'
    })
  ]
  if (index > 0) {
    const boundary = project.point(field.extent.value.y0, 0).x
    primitives.push(line(
      `service-field-${field.id}-tick`,
      { x: boundary, y: 72 },
      { x: boundary, y: 75 },
      'secondary',
      { authority: field.extent.authority, treatment: 'plan-owned-field-break-not-facade-seam' },
      'datum'
    ))
  }
  return primitives
})

const occurrenceNotation = (
  source: ServiceSideElevationPublicationSource,
  project: ReturnType<typeof createElevationPaperProjection>
): DrawingPrimitive[] => {
  const fieldCentre = (id: 'south' | 'middle' | 'north') => {
    const field = source.fields.find((candidate) => candidate.id === id)
    if (!field) throw new Error(`Service-side elevation requires field ${id}.`)
    return project.point((field.extent.value.y0 + field.extent.value.y1) / 2, 0).x
  }
  const south = fieldCentre('south')
  const middle = fieldCentre('middle')
  const north = fieldCentre('north')
  const occurrenceMeta = { geometry: 'ABSENT', treatment: 'editorial-field-notation-not-aperture-coordinate' }
  const technicalMeta = { geometry: 'ABSENT_TECHNICAL', treatment: 'qualitative-zone-notation-not-terminal-coordinate' }

  return [
    text('service-study-window', { x: south, y: 51 }, 'study window · aperture unresolved', 'note', 'middle', {
      ...occurrenceMeta,
      authority: source.architecturalOccurrences.studyWindow.authority
    }),
    text('service-bathroom-window', { x: middle, y: 31 }, 'bathroom daylight · aperture unresolved', 'note', 'middle', {
      ...occurrenceMeta,
      authority: source.architecturalOccurrences.bathroomWindow.authority
    }),
    text('service-plant-opening', { x: middle, y: 50 }, 'plant opening ≈1.0 m clear target', 'note', 'middle', {
      ...occurrenceMeta,
      authority: source.architecturalOccurrences.plantReplacementOpening.authority,
      position: 'ABSENT',
      head: 'ABSENT'
    }),
    text('service-plant-opening-unresolved', { x: middle, y: 54 }, 'position / head unresolved', 'note', 'middle', occurrenceMeta),
    text('service-kitchen-window', { x: north, y: 51 }, 'kitchen window · aperture unresolved', 'note', 'middle', {
      ...occurrenceMeta,
      authority: source.architecturalOccurrences.kitchenWindow.authority
    }),
    text('service-mvhr-zone', { x: middle, y: 17 }, 'MVHR OA/EA · high service zone', 'note', 'middle', {
      ...technicalMeta,
      authority: source.technicalOccurrences.mvhrBoundary.authority
    }),
    text('service-utility-zone', { x: middle, y: 61 }, 'UE-01 · low service zone', 'note', 'middle', {
      ...technicalMeta,
      authority: source.technicalOccurrences.utilityEntry.authority
    }),
    text('service-ashp-zone', { x: middle, y: 65 }, 'ASHP beside plant · position absent', 'note', 'middle', {
      ...technicalMeta,
      authority: source.technicalOccurrences.heatPumpBoundary.authority
    }),
    text('service-cooker-zone', { x: north, y: 59 }, 'KX-01 · local terminal zone', 'note', 'middle', {
      ...technicalMeta,
      authority: source.technicalOccurrences.cookerExtract.authority
    }),
    text('service-rwp-zones', { x: 68, y: 84 }, 'RWP-SE / RWP-NE · return zones only; centrelines absent', 'note', 'middle', {
      ...technicalMeta,
      authority: source.technicalOccurrences.rainwaterReturns.authority
    }),
    text('service-soil-vent-zone', { x: 68, y: 88 }, 'Soil vent · east roof zone; exact termination absent', 'note', 'middle', {
      ...technicalMeta,
      authority: source.technicalOccurrences.soilVentRoofContinuation.authority
    })
  ]
}

const datumNotation = (
  source: ServiceSideElevationPublicationSource,
  project: ReturnType<typeof createElevationPaperProjection>
): DrawingPrimitive[] => {
  const x0 = project.point(source.facadeDepth.value, 0).x + 3
  const x1 = x0 + 7
  const tx = x1 + 1.5
  const levels = [
    ['GFFL ±0', source.levels.groundFfl.value, false],
    ['First +3.300', source.levels.firstFfl.value, false],
    ['U ceil +6.000', source.levels.upperCeiling.value, false],
    ['≈ Cornice +6.250', source.levels.corniceControl.value, true]
  ] as const
  return levels.flatMap(([label, z, provisional]) => {
    const y = project.point(0, z).y
    return [
      line(`service-datum-${z}`, { x: x0, y }, { x: x1, y }, 'secondary', {
        elevation: z,
        visibleFacadeGeometry: false,
        authority: provisional ? 'PROVISIONAL' : 'CONTROLLED'
      }, provisional ? 'provisional' : 'datum'),
      text(`service-datum-label-${z}`, { x: tx, y: y + 0.8 }, label, 'note')
    ]
  })
}

const scaleBar = (): DrawingPrimitive[] => {
  const x0 = 14
  const y = 92
  return [
    line('scale-bar', { x: x0, y }, { x: x0 + 30, y }, 'primary'),
    ...Array.from({ length: 4 }, (_, index) => line(`scale-tick-${index}`, { x: x0 + index * 10, y: y - 2 }, { x: x0 + index * 10, y: y + 2 }, 'secondary')),
    text('scale-zero', { x: x0, y: y + 3 }, '0', 'note'),
    text('scale-three', { x: x0 + 30, y: y + 3 }, '3 m', 'note', 'end')
  ]
}

export const createServiceSideElevationPublicationScene = (
  source: ServiceSideElevationPublicationSource
): DrawingScene => {
  if (source.view.scale !== 100) throw new Error('Service-side elevation is frozen at true 1:100.')
  if (source.fields.length !== 3) throw new Error('Service-side elevation requires the RH-10 three-field order.')
  const project = createElevationPaperProjection({
    scaleDenominator: source.view.scale,
    horizontalBounds: { min: 0, max: source.facadeDepth.value },
    verticalBounds: { min: 0, max: TOP_MM },
    paperOrigin: ORIGIN
  })
  const primitives: DrawingPrimitive[] = [
    ...facade(source, project),
    ...fieldNotation(source, project),
    ...occurrenceNotation(source, project),
    ...datumNotation(source, project),
    ...scaleBar(),
    text('service-authority-note', { x: 68, y: 81 }, 'Field ticks show ownership, not facade seams · service labels are zones, not MEP coordinates.', 'note', 'middle')
  ]
  return {
    widthMm: SCENE_WIDTH_MM,
    heightMm: SCENE_HEIGHT_MM,
    viewId: source.view.id,
    title: 'Reference House service-side elevation',
    description: 'East/service elevation at true 1:100. Room-owned field order and selected service occurrences are represented at their actual authority; absent aperture and terminal coordinates are not invented.',
    scaleDenominator: source.view.scale,
    sourceId: source.view.id,
    primitives
  }
}
