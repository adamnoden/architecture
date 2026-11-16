import type { DrawingSceneV2 } from '../../../publication-drawing-v2/model.js'
import { createSectionPaperProjection } from '../../../publication-drawing/projection.js'
import type { compileStudyLinings } from './study-linings.js'

type Linings = ReturnType<typeof compileStudyLinings>

export function drawStudyLiningComparison(model: Linings): DrawingSceneV2 {
  const scaleDenominator = 2
  const { wall, grille } = model
  const projection = createSectionPaperProjection({
    scaleDenominator, horizontalBounds: { min: 0, max: 250 }, verticalBounds: { min: 0, max: 60 }, paperOrigin: { x: 77, y: 32 },
  })
  const caption = (id: string, x: number, y: number, value: string) => ({ kind: 'text' as const, id, x, y, value, role: 'note' as const })
  const rect = (id: string, x: number, y: number, width: number, height: number, fill: 'none' | 'faint' | 'context') =>
    ({ kind: 'rect' as const, id, x, y, width, height, fill, stroke: 'profile' as const })
  const wallOriginX = 12
  let liningOffset = 0
  const layers = wall.layerSchedule.map(layer => {
    const region = rect(layer.id, wallOriginX + liningOffset / scaleDenominator, 30, layer.depthMm / scaleDenominator, 39,
      layer.role === 'removable-timber-face' ? 'context' : layer.role === 'fit-allowance' ? 'none' : 'faint')
    liningOffset += layer.depthMm
    return { ...region, metadata: { depthMm: layer.depthMm, source: 'IAS W1' } }
  })
  const datum = wallOriginX + wall.referenceDepthMm / scaleDenominator
  const slot = grille.slotSchedule
  const actualPoint = grille.actualRetainedInlet.stationDatumMm
  return {
    title: 'Study wall lining and room-side inlet cover',
    description: 'Nominal section and one clear slot, each drawn at 1:2.',
    widthMm: 210, heightMm: 110, scaleDenominator, viewId: 'ias-study-linings', sourceId: model.source.occupiedHouse,
    primitives: [
      caption('wall-title', 12, 17, 'W1 · wall section'),
      ...layers,
      { kind: 'line', id: 'held-wall-face', a: { x: datum, y: 24 }, b: { x: datum, y: 75 }, role: 'secondary', dash: 'provisional' },
      caption('wall-dimension', 12, 82, `${wall.totalDepthMm} mm total depth`),
      caption('wall-status', 12, 92, wall.wallFaceOverrunMm > 0 ? `${wall.wallFaceOverrunMm} mm past the held face` : 'Aligned with the held face'),
      caption('grille-title', 77, 17, 'G1 · one slot, face view'),
      caption('grille-station', 77, 25, `Study inlet X${actualPoint[0]} / Z${actualPoint[2]}`),
      {
        kind: 'rect', id: slot.id, fill: 'none', stroke: 'profile',
        ...projection.rect({ x: 0, y: 20, width: slot.lengthMm, height: slot.clearWidthMm }),
        metadata: { count: slot.count, plateMm: grille.nominalPlateMm, grossOpenAreaMm2: slot.totalOpenAreaMm2 },
      },
      caption('grille-slot-dimension', 77, 64, `${slot.count} slots × ${slot.lengthMm} × ${slot.clearWidthMm} mm clear`),
      caption('grille-plate-thickness', 77, 74, `${grille.nominalPlateMm} mm trial plate · overall set-out unresolved`),
      caption('grille-gross', 77, 84, `${slot.totalOpenAreaMm2} mm² gross opening`),
      caption('grille-status', 77, 94, grille.grossAreaScreen.state === 'below-reference'
        ? 'Below the inward gross-area comparison'
        : 'Installed air and acoustic performance unresolved'),
    ],
  }
}

export function drawStudyPanellingElevation(model: {
  readonly source: Pick<Linings['source'], 'occupiedHouse'>
  readonly wall: Pick<Linings['wall'], 'southField'>
}): DrawingSceneV2 {
  const field = model.wall.southField
  const scaleDenominator = 25
  const projection = createSectionPaperProjection({
    scaleDenominator,
    horizontalBounds: { min: field.startXMm, max: field.startXMm + field.widthMm },
    verticalBounds: { min: 0, max: 3100 },
    paperOrigin: { x: 13, y: 15 },
  })
  const drawnBox = (id: string, [x0, z0, x1, z1]: readonly [number, number, number, number], stroke: 'profile' | 'secondary') => ({
    kind: 'rect' as const, id, fill: 'none' as const, stroke,
    ...projection.rect({ x: x0, y: z0, width: x1 - x0, height: z1 - z0 }),
  })
  return {
    viewId: 'ias-study-south-panelling', sourceId: model.source.occupiedHouse, scaleDenominator,
    title: 'Study south panelling stock and window reserves',
    description: 'Rectangular stock allowances stop at the complete native window surrounds.',
    widthMm: 200, heightMm: 156,
    primitives: [
      { kind: 'text', id: 'panel-title', x: 13, y: 11, role: 'label', value: 'Study south wall · panel stock and clear openings' },
      ...field.pieces.map(piece => drawnBox(piece.id, piece.box, 'secondary')),
      ...field.windows.flatMap(window => [
        drawnBox(window.id, window.box, 'profile'),
        { kind: 'text' as const, id: window.id + '/reserve', x: projection.point(window.box[0], 1800).x + 5,
          y: projection.point(window.box[0], 1800).y, role: 'note' as const, value: 'Window reserve' },
      ]),
      { kind: 'text', id: 'panel-pitch', x: 13, y: 147, role: 'note',
        value: `${field.pitchMm} mm pitch · ${field.pieceCount} stock zones · ${field.faceAreaM2.toFixed(2)} m²` },
    ],
  }
}
