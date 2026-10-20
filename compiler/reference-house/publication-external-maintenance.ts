import type {
  DrawingLine,
  DrawingPrimitive,
  DrawingRect,
  DrawingScene,
  DrawingText
} from '../publication-drawing/model.js'
import {
  createExternalMaintenancePublicationSource,
  type ExternalMaintenancePublicationSource
} from './publication-external-maintenance-source.js'
import { createSyntheticSettingPublicationScene } from './publication-synthetic-setting.js'

const rect = (
  id: string,
  value: Pick<DrawingRect, 'x' | 'y' | 'width' | 'height'>,
  metadata: DrawingRect['metadata']
): DrawingRect => ({
  kind: 'rect',
  id,
  ...value,
  stroke: 'secondary',
  fill: 'none',
  dash: 'provisional',
  metadata
})

const text = (
  id: string,
  x: number,
  y: number,
  value: string,
  role: DrawingText['role'],
  metadata: DrawingText['metadata'],
  anchor: DrawingText['anchor'] = 'start',
  rotateDeg?: number
): DrawingText => ({
  kind: 'text',
  id,
  x,
  y,
  value,
  role,
  metadata,
  anchor,
  ...(rotateDeg === undefined ? {} : { rotateDeg })
})

const requireRect = (scene: DrawingScene, id: string): DrawingRect => {
  const primitive = scene.primitives.find((candidate) => candidate.id === id)
  if (!primitive || primitive.kind !== 'rect') throw new Error(`${id}: expected rectangle in DRW-08E substrate.`)
  return primitive
}

const requireVerticalLine = (scene: DrawingScene, id: string): DrawingLine => {
  const primitive = scene.primitives.find((candidate) => candidate.id === id)
  if (!primitive || primitive.kind !== 'line') throw new Error(`${id}: expected line in DRW-08E substrate.`)
  if (primitive.a.x !== primitive.b.x) throw new Error(`${id}: expected vertical stress-test line.`)
  return primitive
}

/**
 * DRW-10D reuses the complete DRW-08E synthetic setting scene unchanged.
 * Added rectangles describe gross maintenance capacity only. They are not
 * scaffold/tower footprints, equipment clearances, legal boundaries or routes.
 */
export const createExternalMaintenancePublicationScene = (
  source: ExternalMaintenancePublicationSource = createExternalMaintenancePublicationSource()
): DrawingScene => {
  if (source.view.scale !== 200) throw new Error('DRW-10D is frozen at true 1:200.')

  const base = createSyntheticSettingPublicationScene(source.setting)
  const house = requireRect(base, 'setting-house-shell')
  const court = requireRect(base, 'setting-court')
  const westStress = requireVerticalLine(base, 'surrogate-west-stress-line')
  const eastStress = requireVerticalLine(base, 'surrogate-east-stress-line')

  const westX0 = Math.min(westStress.a.x, house.x)
  const westX1 = Math.max(westStress.a.x, house.x)
  const eastHouseEdge = house.x + house.width
  const eastX0 = Math.min(eastHouseEdge, eastStress.a.x)
  const eastX1 = Math.max(eastHouseEdge, eastStress.a.x)

  const common = {
    overlay: 'external-maintenance-setting',
    exactGeometry: false,
    exactSupportZoneDimensions: source.absences.exactSupportZoneDimensions,
    exactScaffoldFootprint: source.absences.exactScaffoldFootprint,
    exactTowerFootprint: source.absences.exactTowerFootprint
  }

  const legendX = 139
  const overlay: DrawingPrimitive[] = [
    rect(
      'maintenance-west-capacity',
      { x: westX0, y: house.y, width: westX1 - westX0, height: house.height },
      {
        ...common,
        authority: source.tasks.westCapacity.authority,
        role: 'west-ground-supported-access-capacity-not-support-footprint',
        task: source.tasks.westCapacity.value
      }
    ),
    rect(
      'maintenance-east-capacity',
      { x: eastX0, y: house.y, width: eastX1 - eastX0, height: house.height },
      {
        ...common,
        authority: source.tasks.eastCapacity.authority,
        role: 'east-service-access-capacity-not-equipment-clearance',
        task: source.tasks.eastCapacity.value,
        exactAshpPosition: source.absences.exactAshpPosition,
        manufacturerWorkingClearance: source.absences.manufacturerWorkingClearance
      }
    ),
    rect(
      'maintenance-court-working-area',
      { x: court.x, y: court.y, width: court.width, height: court.height },
      {
        ...common,
        authority: source.tasks.courtyardWorkingArea.authority,
        role: 'courtyard-working-area-not-tower-footprint',
        task: source.tasks.courtyardWorkingArea.value
      }
    ),
    text(
      'maintenance-west-label',
      (westX0 + westX1) / 2,
      house.y + house.height / 2,
      'WEST ACCESS CAPACITY',
      'note',
      { overlay: 'external-maintenance-setting', role: 'capacity-label' },
      'middle',
      -90
    ),
    text(
      'maintenance-east-label',
      (eastX0 + eastX1) / 2,
      house.y + house.height / 2,
      'EAST SERVICE / ACCESS',
      'note',
      { overlay: 'external-maintenance-setting', role: 'capacity-label' },
      'middle',
      90
    ),
    text(
      'maintenance-court-label',
      court.x + court.width / 2,
      court.y + court.height / 2 - 1,
      'COURT WORKING AREA',
      'note',
      { overlay: 'external-maintenance-setting', role: 'capacity-label' },
      'middle'
    ),
    text(
      'maintenance-court-note',
      court.x + court.width / 2,
      court.y + court.height / 2 + 3,
      'tower setup not located',
      'note',
      {
        overlay: 'external-maintenance-setting',
        role: 'absence-note',
        exactTowerFootprint: source.absences.exactTowerFootprint
      },
      'middle'
    ),
    text(
      'maintenance-reading-title',
      legendX,
      28,
      'MAINTENANCE',
      'label',
      { overlay: 'external-maintenance-setting', role: 'legend-title' }
    ),
    text(
      'maintenance-reading-mode',
      legendX,
      33,
      'capacity, not method',
      'note',
      { overlay: 'external-maintenance-setting', role: 'legend-note' }
    ),
    text(
      'maintenance-rear-title',
      legendX,
      41,
      'REAR LOGISTICS',
      'note',
      {
        overlay: 'external-maintenance-setting',
        authority: source.tasks.rearLogistics.authority,
        task: source.tasks.rearLogistics.value
      }
    ),
    text(
      'maintenance-rear-note',
      legendX,
      45,
      'continuation only',
      'note',
      {
        overlay: 'external-maintenance-setting',
        routeCentreline: source.absences.routeCentreline,
        plotDepth: source.absences.plotDepth
      }
    ),
    text(
      'maintenance-landscape-title',
      legendX,
      53,
      'LANDSCAPE',
      'note',
      {
        overlay: 'external-maintenance-setting',
        authority: source.tasks.landscapeControl.authority,
        task: source.tasks.landscapeControl.value
      }
    ),
    text(
      'maintenance-landscape-note',
      legendX,
      57,
      'keep capacity open',
      'note',
      {
        overlay: 'external-maintenance-setting',
        plantingAndMatureCanopies: source.absences.plantingAndMatureCanopies
      }
    ),
    text(
      'maintenance-absence-title',
      legendX,
      65,
      'SITE FACTS ABSENT',
      'note',
      { overlay: 'external-maintenance-setting', role: 'absence-title' }
    ),
    text(
      'maintenance-absence-boundary',
      legendX,
      69,
      'boundary / road',
      'note',
      {
        overlay: 'external-maintenance-setting',
        legalBoundary: source.absences.legalBoundary,
        roadOrHighwayLine: source.absences.roadOrHighwayLine
      }
    ),
    text(
      'maintenance-absence-equipment',
      legendX,
      73,
      'ASHP / support footprints',
      'note',
      {
        overlay: 'external-maintenance-setting',
        exactAshpPosition: source.absences.exactAshpPosition,
        exactScaffoldFootprint: source.absences.exactScaffoldFootprint,
        exactTowerFootprint: source.absences.exactTowerFootprint
      }
    )
  ]

  return {
    ...base,
    viewId: source.view.id,
    title: 'Reference House external maintenance setting overlay',
    description:
      'Analytical 1:200 maintenance-capacity reading over the controlled synthetic setting. Side strips and courtyard show useful access/working territory without asserting temporary-works footprints, equipment clearances or real-site geometry.',
    sourceId: source.view.id,
    primitives: [...base.primitives, ...overlay]
  }
}
