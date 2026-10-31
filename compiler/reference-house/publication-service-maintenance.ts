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
import { createFirstFloorPublicationPlanSource } from './publication-first-floor-plan-source.js'
import { createFirstFloorPublicationPlanScene } from './publication-first-floor-plan.js'
import { createGroundFloorPublicationPlanScene } from './publication-ground-plan.js'
import { createGroundFloorPublicationPlanSource } from './publication-plan-source.js'
import {
  createServiceMaintenanceOverlaySource,
  type ServiceMaintenanceOverlaySource
} from './publication-service-maintenance-source.js'
import type { LevelId, ReferenceHouseCompileResult } from './model.js'

const PLAN_ORIGIN: PaperPoint = { x: 8, y: 12 }

const rect = (
  id: string,
  value: { x: number; y: number; width: number; height: number },
  options: {
    stroke?: DrawingRect['stroke']
    fill?: DrawingRect['fill']
    dash?: DrawingRect['dash']
    metadata?: DrawingRect['metadata']
  } = {}
): DrawingRect => ({
  kind: 'rect',
  id,
  ...value,
  ...(options.stroke ? { stroke: options.stroke } : {}),
  ...(options.fill ? { fill: options.fill } : {}),
  ...(options.dash ? { dash: options.dash } : {}),
  ...(options.metadata ? { metadata: options.metadata } : {})
})

const text = (
  id: string,
  point: PaperPoint,
  value: string,
  role: DrawingText['role'],
  anchor: DrawingText['anchor'] = 'middle',
  metadata: DrawingText['metadata'] = {}
): DrawingText => ({ kind: 'text', id, x: point.x, y: point.y, value, role, anchor, metadata })

const requireCompiled = (): ReferenceHouseCompileResult => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  if (result.status === 'FAIL') throw new Error('Cannot create DRW-10B overlays from failed Reference House compile.')
  return result
}

const spaceOverlay = (
  result: ReturnType<typeof requireCompiled>,
  levelId: LevelId,
  spaceId: string,
  project: ReturnType<typeof createPlanPaperProjection>,
  role: 'wet-host' | 'distribution-host',
  index: number
): DrawingRect[] => {
  const space = result.derived.spaces.find((candidate) => candidate.levelId === levelId && candidate.id === spaceId)
  if (!space) throw new Error(`DRW-10B source refers to unavailable ${levelId} space ${spaceId}.`)
  const metadata = {
    overlay: 'service-maintenance-geography',
    role,
    space: spaceId,
    geometry: 'host-space-field-not-service-route',
    provisional: space.provisional
  }
  return space.boxes.map((box, boxIndex) => rect(
    `service-${levelId.toLowerCase()}-${role}-${index}-${boxIndex}`,
    project.rect(box),
    role === 'wet-host'
      ? { stroke: 'primary', metadata }
      : { stroke: 'secondary', dash: 'provisional', metadata }
  ))
}

const riserOverlay = (
  source: ServiceMaintenanceOverlaySource,
  project: ReturnType<typeof createPlanPaperProjection>,
  level: 'ground' | 'first'
): DrawingPrimitive[] => {
  const r = source.ground.riserReservation.value
  const projected = project.rect({ x: r.x0, y: r.y0, width: r.clearWidth, height: r.clearDepth })
  const centre = project.point(r.x0 + r.clearWidth / 2, r.y0 + r.clearDepth / 2)
  return [
    rect(`service-${level}-sv01`, projected, {
      stroke: 'profile',
      dash: 'provisional',
      metadata: {
        overlay: 'service-maintenance-geography',
        source: 'SV-01',
        role: 'vertical-service-reservation-not-packed-services',
        authority: source.ground.riserReservation.authority,
        exactPacking: 'ABSENT_TECHNICAL'
      }
    }),
    text(`service-${level}-sv01-label`, { x: centre.x, y: centre.y - 1.2 }, 'SV-01', 'marker', 'middle', {
      overlay: 'service-maintenance-geography',
      source: 'SV-01'
    })
  ]
}

const baseProjection = (result: ReturnType<typeof requireCompiled>) => createPlanPaperProjection({
  scaleDenominator: 100,
  modelBounds: { x: 0, y: 0, width: result.derived.shell.width, height: result.derived.shell.depth },
  paperOrigin: PLAN_ORIGIN
})

export const createGroundServiceMaintenanceOverlayScene = (
  source: ServiceMaintenanceOverlaySource = createServiceMaintenanceOverlaySource()
): DrawingScene => {
  const result = requireCompiled()
  const groundSource = createGroundFloorPublicationPlanSource()
  const base = createGroundFloorPublicationPlanScene(result, groundSource)
  if (base.viewId !== source.views.ground.substrate || base.scaleDenominator !== source.views.ground.scale) {
    throw new Error('DRW-10B ground substrate no longer matches the frozen ground publication plan.')
  }
  const project = baseProjection(result)
  const overlay: DrawingPrimitive[] = []

  source.ground.wetHostSpaceIds.value.forEach((id, index) => overlay.push(...spaceOverlay(result, 'GROUND', id, project, 'wet-host', index)))
  source.ground.distributionHostSpaceIds.value.forEach((id, index) => overlay.push(...spaceOverlay(result, 'GROUND', id, project, 'distribution-host', index)))

  const plant = source.ground.plant.value
  const plantBox = {
    x: plant.x0,
    y: plant.y0,
    width: plant.x1 - plant.x0,
    height: plant.y1 - plant.y0
  }
  const plantCentre = project.point(plant.x0 + plantBox.width / 2, plant.y0 + plantBox.height / 2)
  overlay.push(
    rect('service-ground-plant-zone', project.rect(plantBox), {
      stroke: 'profile',
      dash: 'provisional',
      metadata: {
        overlay: 'service-maintenance-geography',
        role: 'plant-host',
        space: plant.id,
        geometry: 'selected-plant-zone-not-product-packing',
        authority: source.ground.plant.authority,
        plantPacking: source.technicalAbsences.plantPacking
      }
    }),
    text('service-ground-plant-label', { x: plantCentre.x, y: plantCentre.y - 1.2 }, 'PLANT / ISOLATION', 'marker', 'middle', {
      overlay: 'service-maintenance-geography',
      role: 'plant-working-and-isolation-hub'
    }),
    ...riserOverlay(source, project, 'ground'),
    text(
      'service-ground-note',
      { x: 8, y: 133 },
      'Service geography · host fields, not routes · plant / wet concentration + accessible launch.',
      'note',
      'start',
      {
        overlay: 'service-maintenance-geography',
        protectedPrimarySpaces: source.ground.protectedPrimarySpaceIds.value.join(','),
        routeCentrelines: source.technicalAbsences.routeCentrelines
      }
    )
  )

  return {
    ...base,
    viewId: source.views.ground.id,
    title: 'Reference House ground service and maintenance geography',
    description: 'Analytical overlay over the canonical ground plan. Plant, wet-service concentration, the vertical service reservation and accessible distribution host-space geography are shown without inventing pipe, duct or cable centrelines.',
    sourceId: source.topology.value.fixtureId,
    primitives: [...base.primitives, ...overlay]
  }
}

export const createFirstServiceMaintenanceOverlayScene = (
  source: ServiceMaintenanceOverlaySource = createServiceMaintenanceOverlaySource()
): DrawingScene => {
  const result = requireCompiled()
  const groundSource = createGroundFloorPublicationPlanSource()
  const firstSource = createFirstFloorPublicationPlanSource()
  const base = createFirstFloorPublicationPlanScene(result, firstSource, groundSource)
  if (base.viewId !== source.views.first.substrate || base.scaleDenominator !== source.views.first.scale) {
    throw new Error('DRW-10B first-floor substrate no longer matches the frozen first-floor publication plan.')
  }
  const project = baseProjection(result)
  const overlay: DrawingPrimitive[] = []

  source.first.wetHostSpaceIds.value.forEach((id, index) => overlay.push(...spaceOverlay(result, 'FIRST', id, project, 'wet-host', index)))
  source.first.distributionHostSpaceIds.value.forEach((id, index) => overlay.push(...spaceOverlay(result, 'FIRST', id, project, 'distribution-host', index)))
  overlay.push(
    ...riserOverlay(source, project, 'first'),
    text(
      'service-first-note',
      { x: 8, y: 133 },
      'Service geography · bathroom / SV-01 + gallery/landing access · single stack/riser; no remote en-suite.',
      'note',
      'start',
      {
        overlay: 'service-maintenance-geography',
        protectedPrimarySpaces: source.first.protectedPrimarySpaceIds.value.join(','),
        remoteEnsuiteInfrastructure: source.first.remoteEnsuiteInfrastructure.value,
        routeCentrelines: source.technicalAbsences.routeCentrelines
      }
    )
  )

  return {
    ...base,
    viewId: source.views.first.id,
    title: 'Reference House first-floor service and maintenance geography',
    description: 'Analytical overlay over the canonical first-floor plan. Bathroom and riser concentration plus accessible gallery/landing distribution host-space geography are shown without inventing routes; the removed remote en-suite is recorded as an infrastructure decision, not ghost geometry.',
    sourceId: source.topology.value.fixtureId,
    primitives: [...base.primitives, ...overlay]
  }
}
