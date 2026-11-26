import {subtractPlan,expandPlan,planArea,type PlanRectangle} from './inlet-orthogonal-plan.js'
type Pair = readonly [number, number]
type Rectangle = readonly [number, number, number, number]
type Grid = {
  girders: Record<string, { axis: string; datum: number; extent: Pair; width: number; z: Pair }>
  crossBeams: Record<string, { a: Pair; b: Pair; width: number; z: Pair }>
  heads: { id: string; xy: Pair; capXY: Pair; capZ: Pair }[]
}
type Levels = { mineralCourse: Pair; dryRC: Pair; glass: Pair; accessibleDistribution: Pair; finish: Pair; ffl: number; coldGridTop: number }
const area = (r: Rectangle) => (r[2] - r[0]) * (r[3] - r[1])
const intersect = (a: Rectangle, b: Rectangle): Rectangle | null => {
  const r = [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.min(a[2], b[2]), Math.min(a[3], b[3])] as const
  return r[2] > r[0] && r[3] > r[1] ? r : null
}

/** Local topology below ONE clear room, not a second uniform ground section.
 * Boxes use min/max XY and absolute source ground datum Z. Existing floor and
 * wall DPC remain separate. Contact union is partitioned once, including caps.
 * No plate, masonry, soil, thermal or waterproof resistance is inferred.
 */
export function inletRoomPocket(input: {
  levels: Levels; roomPlanMm: readonly number[];planExclusionsMm?:readonly PlanRectangle[]; depthMm: number; isolationGapMm: number; grid: Grid
  rcDensityKNm3: number; mineralDensityKNm3: number; roomId?: 'utility' | 'plant'
}) {
  const { levels: g, depthMm, isolationGapMm: gap, grid } = input,roomId=input.roomId??'utility'
  if(!['utility','plant'].includes(roomId))throw new Error('Unsupported local pocket identity')
  if (![depthMm, gap, input.rcDensityKNm3, input.mineralDensityKNm3, ...input.roomPlanMm,
    ...Object.values(g).flat()].every(Number.isFinite) || depthMm < 0 || depthMm > 350 || gap < 25 || gap > 100
    || input.roomPlanMm.length !== 4 || Math.min(...input.roomPlanMm.slice(2)) <= 2 * gap
    || input.rcDensityKNm3 <= 0 || input.mineralDensityKNm3 <= 0) throw new Error('Unsupported local service pocket geometry')
  const [x, y, w, d] = input.roomPlanMm, room = [x, y, x + w, y + d] as const,
    inner = [x + gap, y + gap, x + w - gap, y + d - gap] as const,
    drop = depthMm - (g.accessibleDistribution[1] - g.accessibleDistribution[0]),
    shift = (p: Pair): Pair => [p[0] - drop, p[1] - drop],
    local = { mineralCourse: shift(g.mineralCourse), dryRC: shift(g.dryRC), glass: shift(g.glass),
      accessibleDistribution: [g.accessibleDistribution[1] - depthMm, g.accessibleDistribution[1]] as Pair,
      finish: g.finish, ffl: g.ffl, coldGridTop: g.coldGridTop }
  const bodyPlans=subtractPlan(inner,(input.planExclusionsMm??[]).map(r=>expandPlan(r,gap))),bodyArea=bodyPlans.reduce((n,r)=>n+planArea(r),0),notched=bodyArea<area(inner)-1e-8
  if (depthMm === 0) return { state: 'uniform-ground-stack' as const, levels: g, local: null }
  if (drop <= 0) throw new Error('A local service pocket must be deeper than the actual global distribution zone')
  const supports: { id: string; rect: Rectangle; z: Pair }[] = []
  for (const [id, s] of Object.entries(grid.girders)) {
    if (!['x', 'y'].includes(s.axis)) throw new Error('Unsupported cold-grid girder axis')
    const [lo, hi] = s.extent, half = s.width / 2
    supports.push({ id, rect: s.axis === 'x' ? [lo, s.datum - half, hi, s.datum + half] : [s.datum - half, lo, s.datum + half, hi], z: s.z })
  }
  for (const [id, s] of Object.entries(grid.crossBeams)) {
    const half = s.width / 2
    if (s.a[0] !== s.b[0] && s.a[1] !== s.b[1]) throw new Error('Unsupported diagonal local cold-grid support')
    supports.push({ id, rect: s.a[1] === s.b[1]
      ? [Math.min(s.a[0], s.b[0]), s.a[1] - half, Math.max(s.a[0], s.b[0]), s.a[1] + half]
      : [s.a[0] - half, Math.min(s.a[1], s.b[1]), s.a[0] + half, Math.max(s.a[1], s.b[1])], z: s.z })
  }
  for (const s of grid.heads) supports.push({ id: s.id, rect: [s.xy[0] - s.capXY[0] / 2, s.xy[1] - s.capXY[1] / 2,
    s.xy[0] + s.capXY[0] / 2, s.xy[1] + s.capXY[1] / 2], z: s.capZ })
  const contact = supports.flatMap(s => {
    return s.z[1]===g.coldGridTop?bodyPlans.flatMap(p=>{const r=intersect(p,s.rect);return r?[{id:s.id,rectangleMm:r,coldTopMm:s.z[1]}]:[]}):[]
  })
  const xs = [...new Set(contact.flatMap(s => [s.rectangleMm[0], s.rectangleMm[2]]))].sort((a, b) => a - b),
    ys = [...new Set(contact.flatMap(s => [s.rectangleMm[1], s.rectangleMm[3]]))].sort((a, b) => a - b)
  const cells: { id: string; rectangleMm: Rectangle; possibleReceivers: string[] }[] = []
  for (let i = 1; i < xs.length; i++) for (let j = 1; j < ys.length; j++) {
    const r = [xs[i - 1], ys[j - 1], xs[i], ys[j]] as const,
      receivers = contact.filter(s => intersect(s.rectangleMm, r)).map(s => s.id)
    if (receivers.length) cells.push({ id: `HAD/local-${roomId}-contact/${i}-${j}`, rectangleMm: r, possibleReceivers: receivers })
  }
  const contactM2 = cells.reduce((sum, s) => sum + area(s.rectangleMm), 0) / 1e6,
    sides = { west: contact.some(s => s.rectangleMm[0] === inner[0]), east: contact.some(s => s.rectangleMm[2] === inner[2]),
      south: contact.some(s => s.rectangleMm[1] === inner[1]), north: contact.some(s => s.rectangleMm[3] === inner[3]) },
    slabVolume = bodyArea / 1e6 * (local.dryRC[1] - local.dryRC[0]) / 1000,
    mineralVolume = contactM2 * (local.mineralCourse[1] - local.mineralCourse[0]) / 1000,
    plinth = local.mineralCourse[0] - g.coldGridTop,
    origin = [(inner[0] + inner[2]) / 2, (inner[1] + inner[3]) / 2, g.coldGridTop],
    diagnostics = [
      ...(plinth < 0 ? ['LOCAL_POCKET_INTRUDES_COLD_GRID'] : []),
      ...(!Object.values(sides).every(Boolean) ? ['LOCAL_POCKET_MISSING_PERIMETER_COLD_SUPPORT'] : []),
      'LOCAL_POCKET_SLAB_SPAN_EDGE_AND_CONTACT_RESISTANCE_UNQUALIFIED',
      'LOCAL_POCKET_MINERAL_DRY_BEARING_AND_RETENTION_UNQUALIFIED',
      'LOCAL_POCKET_STEP_THERMAL_AND_WATERPROOFING_UNQUALIFIED',
      'LOCAL_POCKET_PERIMETER_FLOOR_BRIDGE_AND_LOADED_RENEWAL_UNQUALIFIED',
      'LOCAL_POCKET_REPLACEMENT_ACTIONS_NOT_IN_52_HEAD_MODEL']
  const load = (id: string, forceKN: number, plan: Rectangle, z: Pair) => ({ id, piece: { planMinMaxMm: plan, zMm: z },
    originMm: [(plan[0] + plan[2]) / 2, (plan[1] + plan[3]) / 2, g.coldGridTop],
    wrenchKN_KNm: { Fx: 0, Fy: 0, Fz: -forceKN, Mx: 0, My: 0, Mz: 0 },
    action: 'unfactored-gravity-only', transferToReceivers: 'unresolved-plate/contact-distribution' })
  return { state: 'local-room-pocket-reservation' as const, levels: local, local: {
    id: `HAD/local-${roomId}-service-pocket`, selected: false as const, groundDatum: 'Same absolute datum as saved groundSection; no translation of house, roof or retained walls',
    roomMinMaxMm:room,bodyMinMaxMm:inner,...(notched?{bodyPlanRectanglesXYMm:bodyPlans,bodyMinMaxIsEnvelopeOnly:true,actualBodyPlanAreaMm2:bodyArea,cornerReturnSeparationApplied:true}:{}),depthMm, loweringMm: drop, isolationGapMm: gap,
    levelBoxes: Object.entries(local).filter((row): row is [string, Pair] => Array.isArray(row[1])).map(([id, z]) => ({id,planMinMaxMm:inner,...(notched?{planRectanglesXYMm:bodyPlans,planMinMaxIsEnvelopeOnly:true}:{}),zMm:z})),
    retainedGlobal: g, wallAndExteriorDpcMm: g.mineralCourse,
    floorStep: { northEdgeYmm: room[3], thresholdOpeningSupport: `Independent flush bridge over${gap}mm perimeter separation; exact metal, fixings, removal and foot loads unqualified`,
      clearanceClaim: 'No RC or mineral bridges the declared perimeter gap. Upstand and gap infill cannot be credited as structural or waterproof support.' },
    thermalReservation: { horizontalGlassMm: local.glass, verticalSeparationGapMm: gap,
      minimumJunctionTemperatureOrPsi: null, requirement: 'Continuous load-compatible insulation across slab edge and lower mineral/cold-grid contact; complete2D/3D thermal and moisture path not established.' },
    lowerPlinthRequiredMm: plinth, coldGridContact: contact, disjointContactCells: cells,
    contactUnionM2: contactM2, supportPresentAtSides: sides,
    unsupportedCentralSlabAreaM2: bodyArea / 1e6 - contactM2,
    loadOrigins: [...(notched?bodyPlans.map((r,k)=>load(`HAD/local-${roomId}-dry-rc/part-${k}-G`,area(r)/1e6*(local.dryRC[1]-local.dryRC[0])/1000*input.rcDensityKNm3,r,local.dryRC)):[load(`HAD/local-${roomId}-dry-rc-G`,slabVolume*input.rcDensityKNm3,inner,local.dryRC)]),
      ...cells.map(c => load(c.id + '/mineral-G', area(c.rectangleMm) / 1e6 * (local.mineralCourse[1] - local.mineralCourse[0]) / 1000 * input.mineralDensityKNm3, c.rectangleMm, local.mineralCourse))],
    quantityBounds: { dryRcM3: slabVolume, mineralOnContactOnlyM3: mineralVolume, glassM3: bodyArea / 1e6 * (local.glass[1] - local.glass[0]) / 1000,
      slabAndMineralWeightKN: slabVolume * input.rcDensityKNm3 + mineralVolume * input.mineralDensityKNm3,
      glassLinerCoversFramesFixturesAndUnknownPlinthWeightKN: null, floorCoverAndEquipmentTemporaryReactionsKN: null },
    structuralJoin: { originMm: origin, reactionsAtColdGridAnd52Heads: null,
      replacingExistingFloorNotAutomaticallyAdded: true, requirement: 'Remove original floor/mineral stock over the exact replaced polygon before adding this candidate. Preserve wall and exterior DPC/plinth. Solve actual local plate/contact and signed full wrenches on current grid; no centroid lump or head mapping invented.' },
    necessaryGeometryScreen: plinth >= 0 && Object.values(sides).every(Boolean),
    constructionAdmitted: false as const, diagnostics,
  } }
}

export function drawInletRoomPocket(p: NonNullable<ReturnType<typeof inletRoomPocket>['local']>) {
  const [x, y, xx, yy] = p.roomMinMaxMm, scale = .18,
    X = (v: number) => 40 + (v - x) * scale, Y = (v: number) => 520 - (v - y) * scale,
    Z = (v: number) => 590 - v * .5,
    rect = (r: Rectangle, colour: string) => `<rect x="${X(r[0])}" y="${Y(r[3])}" width="${(r[2] - r[0]) * scale}" height="${(r[3] - r[1]) * scale}" fill="${colour}" stroke="#46564f"/>`,
    layer = (xa: number, w: number, z: Pair, colour: string) => `<rect x="${xa}" y="${Z(z[1])}" width="${w}" height="${(z[1] - z[0]) * .5}" fill="${colour}" stroke="#665e4c"/>`,
    text = (a: number, b: number, t: string, size = 15) => `<text x="${a}" y="${b}" font-size="${size}">${t}</text>`,
    colours = ['#c5b08a', '#afbfb7', '#e5cc8a', '#d9e7ea', '#c09a77']
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="950" viewBox="0 0 1280 950"><rect width="1280" height="950" fill="#f5f1e6"/><g font-family="Arial,sans-serif" fill="#29271f">
${text(40,42,`Local Utility${p.depthMm} · retained global${p.retainedGlobal.ffl}/${p.retainedGlobal.accessibleDistribution[1]-p.retainedGlobal.accessibleDistribution[0]} · geometry reservation`,26)}
${text(40,76,'Same saved ground datum. No wall/roof/frame rise; no structural, thermal or waterproof admission.')}
${rect(p.roomMinMaxMm,'#e8ddc7')}${(p.bodyPlanRectanglesXYMm??[p.bodyMinMaxMm]).map(r=>rect(r,'#e7efeb')).join('')}
${p.disjointContactCells.map(c => rect(c.rectangleMm, '#b1c0b5')).join('')}
${text(40,560,`Room${(xx - x).toFixed(1)} ×${(yy - y).toFixed(1)}; perimeter separation${p.isolationGapMm}mm.`)}
${text(40,590,`Cold contact union${p.contactUnionM2.toFixed(6)}m²; central slab span${p.unsupportedCentralSlabAreaM2.toFixed(6)}m².`)}
${text(40,620,'Green polygons are actual girders/caps, partitioned without overlap.')}
${text(40,650,`Mineral only above those contacts; the${p.levelBoxes[1].zMm[1]-p.levelBoxes[1].zMm[0]}mm RC body spans between them.`)}
${text(40,680,'Perimeter gap is not a support: flush cover, tool and renewal reactions remain open.')}
${text(600,150,'Retained global section',19)}${text(920,150,'Local Utility section',19)}
${[p.retainedGlobal.mineralCourse,p.retainedGlobal.dryRC,p.retainedGlobal.glass,p.retainedGlobal.accessibleDistribution,p.retainedGlobal.finish].map((z,i)=>layer(600,215,z,colours[i])).join('')}
${p.levelBoxes.map((b,i)=>layer(920,215,b.zMm,colours[i])).join('')}
${layer(600,215,[p.retainedGlobal.coldGridTop,p.retainedGlobal.mineralCourse[0]],'#949c95')}
${layer(600,535,[p.retainedGlobal.coldGridTop-60,p.retainedGlobal.coldGridTop],'#718c7e')}
<line x1="580" y1="${Z(p.retainedGlobal.ffl)}" x2="1155" y2="${Z(p.retainedGlobal.ffl)}" stroke="#332b20" stroke-width="3"/>
<path d="M855 ${Z(p.retainedGlobal.coldGridTop)} V${Z(p.retainedGlobal.glass[1])}" fill="none" stroke="#bb8335" stroke-width="12" stroke-dasharray="7 5"/>
${text(600,205,`FFL${p.retainedGlobal.ffl}; finish${p.retainedGlobal.finish.join('–')}.`,17)}
${text(600,245,'Brown mineral; gray RC; gold glass; blue service.')}
${text(600,725,`Local mineral${p.levelBoxes[0].zMm.join('–')}; RC${p.levelBoxes[1].zMm.join('–')}; glass${p.levelBoxes[2].zMm.join('–')}.`)}
${text(600,755,`Local service${p.levelBoxes[3].zMm.join('–')}; cold-grid top${p.retainedGlobal.coldGridTop}.`)}
${text(600,790,'Diagram separates sections; horizontal gap is schematic.')}
${text(40,835,`Retain wall/exterior DPC${p.wallAndExteriorDpcMm.join('..')} and plinth. Local mineral${p.levelBoxes[0].zMm.join('..')} stays separate.`,17)}
${text(40,870,'No thermal bridge coefficient, local plate/contact capacity, waterproof junction or installed outlet qualification is inferred.')}
${text(40,910,'Source-only drain route, retained furniture and actual wall ports are shown in the accompanying room catchment receipt.')}
</g></svg>`
}
