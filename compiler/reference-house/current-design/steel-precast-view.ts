import type { DrawingSceneV2, DrawingPrimitiveV2 } from '../../publication-drawing-v2/model.js'
import type { calculateSteelPrecast } from './steel-precast-kernel.js'

/** Inspection drawings: the result owns every dimension; these are not an erection or panel schedule. */
export function drawSteelPrecastComparison(result: ReturnType<typeof calculateSteelPrecast>) {
  const g = result.geometry, s = result.settings
  const p = (x: number, y: number) => ({ x: 16 + x / 75, y: 184 - y / 75 })
  const rect = (id: string, r: readonly number[], fill: 'none' | 'paper' | 'faint' = 'none'): DrawingPrimitiveV2 => ({ kind: 'rect', id,
    ...p(r[0], r[3]), width: (r[2] - r[0]) / 75, height: (r[3] - r[1]) / 75, stroke: 'secondary', fill })
  const xyxy = (r: readonly number[]) => [r[0], r[1], r[0] + r[2], r[1] + r[3]]
  const text = (id: string, x: number, y: number, value: string, role: 'label' | 'note' | 'marker' = 'note'): DrawingPrimitiveV2 => ({ kind: 'text', id, x, y, value, role })
  const plan: DrawingSceneV2 = { widthMm: 210, heightMm: 297, viewId: 'STR-STEEL-PRECAST-PLAN', title: 'Ordinary steel and precast: critical members',
    description: 'Selected-source geometry, floor and half-landing members. Secondary fields are inherited RC span references, not a precast layout.',
    scaleDenominator: 75, sourceId: result.caseId, primitives: [
      text('title', 16, 12, 'Steel + precast · critical-member comparison', 'label'),
      text('scope', 16, 19, 'Source-ground datum · north up · not a complete framing plan'),
      rect('floor-envelope', g.floorEnvelopeXYXYMm, 'faint'),
      ...g.floorFields.map(f => rect('field-' + f.id, f.rectangleXYXYMm)),
      rect('court', xyxy(g.courtXYWHMm), 'paper'), rect('stair-void', xyxy(g.stair.footprintXYWHMm), 'paper'),
      rect('entrance-void', xyxy(g.entranceVoidXYWHMm), 'paper'),
      text('court-label', p(5100, 6000).x, p(5100, 6000).y, 'COURT'),
      text('stair-label', p(700, 6600).x, p(700, 6600).y, 'STAIR'),
      rect('straight-stair-post', xyxy(result.stair.post.fireEnvelopeXYWHMm)),
      ...result.beams.flatMap((b, i): DrawingPrimitiveV2[] => {
        const a = p(...b.a), z = p(...b.b), vertical = b.a[0] === b.b[0]
        return [{ kind: 'line', id: b.id, role: 'cut', a, b: z, metadata: { memberId: b.id, spanMm: b.spanMm, section: b.section.id } },
          ...[a, z].map((v, n): DrawingPrimitiveV2 => ({ kind: 'rect', id: `${b.id}-support-${n}`, x: v.x - 1.2, y: v.y - 1.2, width: 2.4, height: 2.4, fill: 'ink' })),
          text(b.id + '-label', (a.x + z.x) / 2 + (vertical ? 2 : -2), (a.y + z.y) / 2 - (vertical ? 0 : 2)
            + (['stair-east-north', 'stair-west-sill'].includes(b.id) ? 3 : 0), 'B' + (i + 1), 'marker')]
      }),
      text('legend', 16, 196, 'Solid: beam screens. Squares: receiving locations, bearings unqualified.', 'note'),
      ...result.beams.map((b, i) => text('schedule-' + i, 16, 204 + i * 5,
        `B${i + 1}  ${b.id} · ${(b.spanMm / 1000).toFixed(3)} m · ${b.section.id}`)),
      text('half-level', 16, 276, 'B10–11: half-landing level. Stair post continues down to ground support.'),
      text('coverage', 16, 289, 'Panel joints, cuts, wall-head closures and remaining supports are unresolved.'),
    ] }
  const z = (v: number) => 159 - (v - 2700) / 10
  const box = (id: string, x: number, width: number, bottom: number, top: number, fill: 'context' | 'faint' | 'none' = 'context'): DrawingPrimitiveV2 => ({
    kind: 'rect', id, x, y: z(top), width, height: (top - bottom) / 10, stroke: 'secondary', fill })
  const line = (id: string, x: number, end: number, level: number): DrawingPrimitiveV2 => ({ kind: 'line', id, a: { x, y: z(level) }, b: { x: end, y: z(level) }, role: 'secondary', dash: 'datum' })
  const v = result.section
  const section: DrawingSceneV2 = { widthMm: 297, heightMm: 210, viewId: 'STR-STEEL-PRECAST-SECTION', title: 'Floor depth and independent portal beam',
    description: 'Section envelopes at 1:10. Fire, bedding, camber and setting are authored allowances; no product or thermal acceptance is implied.',
    scaleDenominator: 10, sourceId: result.caseId, primitives: [
      text('title', 16, 12, 'Ordinary floor / insulated loggia beam', 'label'),
      text('sub', 16, 19, 'Comparison envelopes · 1:10 · all levels from the source ground floor'),
      text('left-title', 16, 28, 'A · top-bearing floor beam', 'label'),
      text('right-title', 157, 28, 'B · wall beam beside planks', 'label'),
      box('ordinary-finish', 16, 102, v.plankEndTopMm, s.firstFflMm, 'faint'),
      box('ordinary-plank', 16, 102, v.plankEndBottomMm, v.plankEndTopMm),
      box('ordinary-beam', 54, s.sections.edge.widthMm / 10, v.deepestSteelBottomMm, v.topBearingSteelTopMm),
      line('ceiling', 16, 118, s.groundCeilingMm),
      text('ceiling-label', 17, z(s.groundCeilingMm) + 5, `Ceiling ${s.groundCeilingMm} · spare ${v.ordinaryMarginMm.toFixed(1)} mm`),
      box('portal-finish', 157, 118, v.plankEndTopMm, s.firstFflMm, 'faint'),
      box('portal-beam', 205, s.sections.portal.widthMm / 10, v.portalSteelBottomMm, v.portalSteelTopMm),
      box('portal-plank-left', 157, 48, v.plankEndBottomMm, v.plankEndTopMm),
      box('portal-plank-right', 205 + s.sections.portal.widthMm / 10, 70 - s.sections.portal.widthMm / 10, v.plankEndBottomMm, v.plankEndTopMm),
      box('insulation-plank-left', 157, 48, v.plankEndBottomMm - g.loggiaSoffitLayersMm, v.plankEndBottomMm, 'faint'),
      box('insulation-plank-right', 205 + s.sections.portal.widthMm / 10, 70 - s.sections.portal.widthMm / 10,
        v.plankEndBottomMm - g.loggiaSoffitLayersMm, v.plankEndBottomMm, 'faint'),
      box('insulated-portal', 205, s.sections.portal.widthMm / 10, v.portalInsulatedSoffitMm, v.portalSteelBottomMm, 'faint'),
      line('arch-crown', 157, 275, g.archOuterCrownMm),
      text('arch-crown-label', 158, z(g.archOuterCrownMm) + 5, `Arch outer crown ${g.archOuterCrownMm}`),
      text('ffl', 16, 35, `First FFL ${s.firstFflMm} · change +${result.vertical.deltaMm} mm`),
      text('clearance', 157, 35, `Insulated beam / arch gap ${v.archClearanceMm.toFixed(1)} mm`),
      text('left-key-1', 16, 155, `Plank ${s.plankDepthMm}; finish ${s.finishDepthMm}; camber reserve ${s.camberReserveMm} mm.`),
      text('left-key-2', 16, 162, `Setting ${s.settingReserveMm}; bed ${s.bearingBedMm}; soffit allowance ${s.soffitReserveMm} mm.`),
      text('left-key-3', 16, 169, `Deepest beam ${s.sections.edge.depthMm}; total required ${v.requiredOrdinaryFloorZoneMm.toFixed(1)} mm.`),
      text('right-key-1', 157, 155, `Portal ${s.sections.portal.id}; ${s.portalPlacement}.`),
      text('right-key-2', 157, 162, `Retained insulation/lining envelope ${g.loggiaSoffitLayersMm} mm.`),
      text('right-key-3', 157, 169, 'Independent arch, ties, beam seats and junctions still require design.'),
      text('stair', 16, 185, `Stair: ${g.stair.risers} rises of ${result.stair.riseMm.toFixed(1)} mm; going ${g.stair.goingMm}; pitch ${result.stair.pitchDegrees.toFixed(1)}°.`),
      text('limitations', 16, 194, 'This is a selected-source comparison, not an adopted whole-house section, fire detail or precast shop drawing.'),
    ] }
  return { plan, section }
}
