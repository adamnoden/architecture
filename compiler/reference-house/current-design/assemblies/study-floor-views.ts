import type { DrawingSceneV2 } from '../../../publication-drawing-v2/model.js'
import { createPlanPaperProjection, createSectionPaperProjection } from '../../../publication-drawing/projection.js'
import type { compileStudyAssembly } from './study-floor.js'

type Assembly = ReturnType<typeof compileStudyAssembly>

export function drawStudyFloorPlan(assembly: Assembly): DrawingSceneV2 {
  const { bands, occupied, occurrences, pitchMm } = assembly.grid
  const x = Math.min(...bands.map(band => band[0]))
  const y = Math.min(...bands.map(band => band[1]))
  const width = Math.max(...bands.map(band => band[2])) - x
  const height = Math.max(...bands.map(band => band[3])) - y
  const scaleDenominator = 25
  const projection = createPlanPaperProjection({ scaleDenominator, modelBounds: { x, y, width, height }, paperOrigin: { x: 12, y: 15 } })
  return {
    viewId: 'ias-study-floor-grid', sourceId: assembly.source.occupiedHouse, scaleDenominator,
    title: 'Study tile field', description: 'Nominal panels and shown furniture for the pre-site trial.',
    widthMm: projection.length(width) + 24, heightMm: projection.length(height) + 34,
    primitives: [
      ...occurrences.flatMap(cell => cell.clipped.map(([x0, y0, x1, y1], i) => ({
        kind: 'rect' as const, id: `${cell.id}/part/${i}`,
        ...projection.rect({ x: x0, y: y0, width: x1 - x0, height: y1 - y0 }),
        stroke: 'secondary' as const, fill: cell.full ? 'none' as const : 'faint' as const,
        metadata: { occurrence: cell.id, whole: cell.full, pitchMm },
      }))),
      ...occupied.map(([id, [x0, y0, x1, y1]]) => ({
        kind: 'rect' as const, id: `occupied:${id}`,
        ...projection.rect({ x: x0, y: y0, width: x1 - x0, height: y1 - y0 }),
        stroke: 'profile' as const, fill: 'context' as const,
      })),
      { kind: 'text', id: 'module-key', x: 12, y: projection.length(height) + 24, role: 'note',
        value: `${pitchMm} mm pitch · ${assembly.schedule.wholeTiles} complete · ${assembly.schedule.clippedCells} clipped cells` },
    ],
  }
}

export function drawStudyFloorSection(assembly: Assembly): DrawingSceneV2 {
  const { section, schedule, release } = assembly
  const scaleDenominator = 5
  const tileEnd = section.tileSouthSetbackMm + schedule.clearTileSideMm
  const span = tileEnd + 50
  const projection = createSectionPaperProjection({ scaleDenominator,
    horizontalBounds: { min: -50, max: span }, verticalBounds: { min: section.rcTop - 30, max: section.skirting.heightMm + 35 },
    paperOrigin: { x: 8, y: 12 },
  })
  const box = (id: string, x: number, y: number, width: number, height: number, fill: 'context' | 'faint' | 'none') => ({
    kind: 'rect' as const, id, fill, stroke: 'profile' as const, ...projection.rect({ x, y, width, height }),
  })
  const line = (id: string, x0: number, z0: number, x1: number, z1: number) => ({
    kind: 'line' as const, id, role: 'profile' as const, a: projection.point(x0, z0), b: projection.point(x1, z1),
  })
  const text = (id: string, paperX: number, paperY: number, value: string) =>
    ({ kind: 'text' as const, id, x: paperX, y: paperY, role: 'note' as const, value })
  const { projectionMm, heightMm, serviceCoverMm } = section.skirting
  return {
    viewId: 'ias-study-south-edge-section', sourceId: assembly.source.occupiedHouse, scaleDenominator,
    title: 'Study south edge and liftable finish', description: 'Nominal section; perimeter piece and intermediate support awaiting detailing.',
    widthMm: Math.max(164, projection.length(span + 50) + 20), heightMm: 124,
    primitives: [
      line('retained-finished-wall-face', 0, section.ffl, 0, heightMm + 25),
      line('source-ground-rc-top', 0, section.rcTop, span, section.rcTop),
      box(section.skirting.id, 0, section.ffl, projectionMm, heightMm, 'faint'),
      ...(serviceCoverMm ? [box('service-cover', projectionMm - serviceCoverMm, section.ffl, serviceCoverMm, heightMm, 'context')] : []),
      box('one-complete-wearing-face', section.tileSouthSetbackMm, -section.wearFaceMm, schedule.clearTileSideMm, section.wearFaceMm, 'context'),
      ...(section.wearingFace === 'stone-steel'
        ? [line('stone-steel-layer', section.tileSouthSetbackMm, -12, tileEnd, -12)]
        : []),
      box('bedding-territory', section.tileSouthSetbackMm, -section.wearFaceMm - section.beddingTerritoryMm,
        schedule.clearTileSideMm, section.beddingTerritoryMm, 'faint'),
      ...(release.code === 'SOUTH_BRIDGE_SHOE'
        ? [line('fixed-shoe-footprint', release.shoeExtentMm[0], 5, release.shoeExtentMm[1], 5)]
        : []),
      text('skirting-dimension', 29, 23, `${heightMm} high × ${projectionMm} projection`),
      text('wear-dimension', 31, 65, `${section.wearFaceMm} wearing face + ${section.beddingTerritoryMm} bedding territory`),
      text('reserved-zone', 33, 78, section.finishSupportDepthUnresolvedMm
        ? `${section.finishSupportDepthUnresolvedMm} mm support depth unassigned`
        : 'Finish support and perimeter piece unresolved'),
      text('rc-datum', 16, 93, `Ground RC top Z${section.rcTop}`),
      text('shoe-status', 16, 110, release.code === 'SOUTH_BRIDGE_SHOE'
        ? `Fixed bridge shoe clearance after setting: ${release.shoeClearanceMm} mm`
        : `Fixed bridge layout requires the ${release.referencePitchMm} mm trial pitch`),
    ],
  }
}
