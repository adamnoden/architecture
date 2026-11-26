import type { StudyLightingResult } from './study-lighting.js'

const esc = (v: unknown) => String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const n = (v: number) => Number(v.toFixed(2))
const text = (x: number, y: number, value: string, kind = 'note') => `<text x="${n(x)}" y="${n(y)}" class="${kind}">${esc(value)}</text>`
const line = (a: readonly number[], b: readonly number[], colour = '#514b40', width = 1) => `<path d="M${a.map(n).join(',')}L${b.map(n).join(',')}" fill="none" stroke="${colour}" stroke-width="${width}"/>`
const polygon = (points: readonly (readonly number[])[], fill: string, stroke = '#6b5946') => `<polygon points="${points.map(p => p.map(n).join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width=".8"/>`
const rect = (x: number, y: number, w: number, h: number, fill: string, stroke = '#6b5946') => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${fill}" stroke="${stroke}"/>`
const page = (w: number, h: number, title: string, body: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">Source-derived geometric review. Luminaire symbols show placement and intended use, not measured light distribution or accepted materials.</desc><style>.title{font:32px Georgia;fill:#342d25}.heading{font:23px Georgia;fill:#342d25}.note{font:16px Arial;fill:#48443b}.small{font:13px Arial;fill:#514c42}.dimension{font:15px monospace;fill:#285f69}</style><rect width="${w}" height="${h}" fill="#f2eee3"/>${body}</svg>\n`

function furnishedView(result: StudyLightingResult, arrangement: StudyLightingResult['arrangements'][number]) {
  const room=result.commonRoom,x0=Math.min(...room.bands.map(b=>b[0]!)),y0=Math.min(...room.bands.map(b=>b[1]!))
  const p = (x: number, y: number, z = 0) => [110 + (x - x0) * .12 + (y - y0) * .058, 420 + (x - x0) * .026 - (y - y0) * .055 - z * .102]
  const floor = (box: readonly number[], fill: string) => polygon([p(box[0], box[1]), p(box[2], box[1]), p(box[2], box[3]), p(box[0], box[3])], fill)
  const face = (wall: typeof room.walls[number], box: readonly number[], fill: string) => {
    const q = (s: number, z: number) => wall.axis === 'x' ? p(s, wall.fixedMm, z) : p(wall.fixedMm, s, z)
    return polygon([q(box[0], box[1]), q(box[2], box[1]), q(box[2], box[3]), q(box[0], box[3])], fill)
  }
  const darker = result.request.finishTrial === 'darker-oak', timber = darker ? '#695039' : '#aa805b', inset = darker ? '#7e6044' : '#bd9873'
  let out = room.floorFaces.map((box, i) => floor(box, [timber, inset, darker ? '#8c7051' : '#c6a781'][i % 3])).join('')
  // The same two rear wall faces show the real panel set-out; no fictitious ceiling void or door head is drawn.
  out += room.walls.filter(wall => ['north-door', 'west'].includes(wall.id)).map(wall => {
    const background = face(wall, [wall.fromMm, 0, wall.toMm, room.ceilingZMm], '#e6dcc8')
    const panels = wall.pieces.map(piece => face(wall, piece.box, timber)).join('')
    const door = wall.id === 'north-door' ? face(wall, [room.door.rough[0], 0, room.door.rough[1], room.ceilingZMm], '#f2eee3') : ''
    return background + panels + door
  }).join('')
  // Actual west opening, including its segmental arch, within the current wall.
  const westWall = room.walls.find(wall => wall.id === 'west')!
  out += room.openings.filter(opening => opening.wall === 'outer-west').map(opening => {
    const a = opening.centre - opening.width / 2, b = opening.centre + opening.width / 2, rise = opening.head - opening.spring
    const radius = opening.width ** 2 / (8 * rise) + rise / 2
    const curve = Array.from({ length: 25 }, (_, i) => { const y = a + (b - a) * i / 24
      return p(westWall.fixedMm, y, opening.spring + Math.sqrt(radius ** 2 - (y - opening.centre) ** 2) - (radius - rise)) })
    return polygon([p(x0, a, opening.sill), ...curve, p(x0, b, opening.sill)], '#b7c6c0', '#e5ddc8')
  }).join('')
  const desk = room.occupied.find(([id]) => id === 'study-desk')![1], chair = room.occupied.find(([id]) => id === 'study-chair')![1]
  out += room.occupied.filter(([id]) => id.includes('emitter')).map(([, box]) => polygon([p(box[2], box[1], 115), p(box[2], box[3], 115), p(box[2], box[3], 710), p(box[2], box[1], 710)], '#8c8e77')).join('')
  out += [[desk[0] + 70, desk[1] + 70], [desk[2] - 70, desk[1] + 70], [desk[0] + 70, desk[3] - 70], [desk[2] - 70, desk[3] - 70]].map(([x, y]) => line(p(x, y), p(x, y, 730), '#624632', 6)).join('')
  out += polygon([p(desk[0], desk[1], 730), p(desk[2], desk[1], 730), p(desk[2], desk[3], 730), p(desk[0], desk[3], 730)], '#76553e')
  const cx = (chair[0] + chair[2]) / 2, cy = (chair[1] + chair[3]) / 2
  out += polygon([p(cx - 210, cy - 210, 450), p(cx + 210, cy - 210, 450), p(cx + 210, cy + 210, 450), p(cx - 210, cy + 210, 450)], '#778066')
  out += line(p(cx, cy + 160, 450), p(cx, cy + 160, 850), '#5e6650', 19)
  const head = p(cx, cy, 1100)
  out += `<circle cx="${n(head[0])}" cy="${n(head[1])}" r="10" fill="#a68e74"/>` + line(p(cx, cy, 600), p(cx, cy, 980), '#837d70', 20)
  // Screen is a declared task witness; its reflected image is not simulated.
  out += polygon([p(cx - 240, desk[1] + 100, 800), p(cx + 240, desk[1] + 100, 800), p(cx + 240, desk[1] + 100, 1120), p(cx - 240, desk[1] + 100, 1120)], '#48575a')
  if (arrangement.addedOccupiedStandMm) out += floor(arrangement.addedOccupiedStandMm, '#d7c3a4')
    + polygon([p(arrangement.addedOccupiedStandMm[0], 1750, 750), p(arrangement.addedOccupiedStandMm[2], 1750, 750), p(arrangement.addedOccupiedStandMm[2], 2050, 750), p(arrangement.addedOccupiedStandMm[0], 2050, 750)], timber)
  const corner = result.corner, [l, , r] = corner.bayPlanMm
  out += face(room.walls.find(wall => wall.id === 'north-door')!, [l, corner.bayBottomZMm, r, 2100], '#c6b18e')
  for (const source of arrangement.sources) {
    const [x, y, z] = source.positionMm, q = p(x, y, z), foot = p(x, y, source.kind === 'desk' ? 730 : source.kind === 'side' ? 750 : 0)
    if (['desk', 'floor', 'side'].includes(source.kind)) out += line(foot, q, '#55472e', 3)
    const colour = source.available ? '#b68a35' : '#9c342c'
    out += polygon([[q[0] - 13, q[1] - 7], [q[0] + 13, q[1] - 7], [q[0] + 18, q[1] + 10], [q[0] - 18, q[1] + 10]], colour)
    if (!source.available) out += line([q[0] - 19, q[1] - 14], [q[0] + 19, q[1] + 16], '#8e2824', 3)
    out += text(q[0] + 22, q[1], source.id, 'small')
  }
  return out
}

export function drawStudyLightingComparison(result: StudyLightingResult) {
  const body = text(35, 46, 'The Study · four ways to relight one furnished room', 'title')
    + text(35, 77, 'Matched source geometry and finish · fixture placement and use, not photometric rendering')
    + result.arrangements.map((arrangement, index) => {
      const x = 20 + index % 2 * 850, y = 105 + Math.floor(index / 2) * 790
      return `<g transform="translate(${x},${y})">` + rect(0, 0, 825, 750, '#eee7d9', '#c8bdab')
        + text(20, 35, arrangement.title, 'heading') + `<g transform="translate(45,115)">${furnishedView(result, arrangement)}</g>`
        + text(20, 690, `${arrangement.fixedLightPoints} fixed light point(s) · ${arrangement.roles[0].liveSourceIds.length ? 'arrival source available' : 'arrival source removed'}`)
        + text(20, 720, 'Desk/screen and seated figure are task witnesses; no measured lighting pass.', 'small') + '</g>'
    }).join('')
    + text(35, 1700, `Finish: ${result.request.finishTrial} · selected development comparison: ${result.selectedArrangement}`)
    + text(35, 1730, 'Ordinary manual controls remain operable without automation. Fixed-source geometry does not prove task adequacy.')
    + text(35, 1760, `Source: ${result.source.room.currentPlanBasis} / ${result.source.room.occupiedHouse} · case ${result.caseDigest.slice(0, 16)}`, 'small')
  return page(1740, 1800, 'Four furnished Study lighting arrangements', body)
}

export function drawStudyLightingServiceCorner(result: StudyLightingResult) {
  const c = result.corner, scale = .26, bottom = 720, elevation = (x: number, z: number) => [90 + (x - c.bayPlanMm[0]) * scale, bottom - z * scale]
  const ebox = (a: number, z: number, b: number, top: number, fill: string) => polygon([elevation(a, z), elevation(b, z), elevation(b, top), elevation(a, top)], fill)
  const [left, , right] = c.bayPlanMm
  let body = text(35, 48, 'A service corner that leaves the wall intact', 'title')
    + text(35, 80, 'Local candidate · independent enclosure and support · no acoustic or material acceptance')
    + text(55, 125, 'Door-side elevation', 'heading')
    + ebox(left, c.bayBottomZMm, right, 2100, '#c9b18e')
    + ebox(c.retainedSkirtingEndXMm[0], 0, c.retainedSkirtingEndXMm[1], result.commonRoom.skirtingTopMm, '#7f6247')
    + ebox(c.doorRoughXMm[0], 0, c.doorRoughXMm[0] + 25, 2200, '#9d8e77')
    + text(245, 182, 'Actual door rough X ' + c.doorRoughXMm.join('..') + ' mm')
    + text(245, 211, `${c.jambStopMm} mm stop to bay; reveal stays fixed`)
  for (const [name, point] of [['Socket', c.socketCentreMm], ['Ordinary switch', c.switchCentreMm]] as const) {
    const q = elevation(point[0], point[2])
    body += rect(q[0] - 43 * scale, q[1] - 43 * scale, 86 * scale, 86 * scale, '#e5dbc8')
      + line(q, [240, q[1]], '#285f69') + text(245, q[1] + 5, `${name}: ${point[2]} mm centre`)
  }
  const centre = c.module.centreMm, q = elevation(centre[0], centre[2])
  body += rect(q[0] - 130 * scale, q[1] - 225 * scale, 260 * scale, 450 * scale, '#8e9b8c')
    + rect(q[0] - 72 * scale, q[1] - 125 * scale, 144 * scale, 250 * scale, '#d3bd8a')
    + line(q, [240, q[1]], '#285f69') + text(245, q[1] + 5, '260 × 450 independent carrier/module')
    + text(245, q[1] + 34, `${c.module.authoredMassLimitKg} kg authored limit; ${c.module.authoredMomentNm.toFixed(3)} Nm demand`)
    + text(245, q[1] + 63, 'Actual anchors / mass / retention remain unqualified')
    + text(55, 755, `Start bay at Z ${c.bayBottomZMm}; retained skirt draws ${c.retainedSkirtingDrawMm} mm independently`)
    + text(55, 785, `Low route stops at X ${c.lowRouteStopXMm}; no cable loop across the door`)
  // True relative depth strip. Widths are enlarged equally; connected space is distinct from total stand-off.
  body += text(780, 125, 'Depth allocation · enlarged section', 'heading')
  const sx = 800, sy = 170, ds = 5
  body += rect(sx, sy, c.boundaryDepthMm * ds, 300, '#aaa99d')
    + rect(sx + c.boundaryDepthMm * ds, sy, c.grossStandOffMm * ds, 300, '#e3d9c2')
    + rect(sx + (c.totalLiningDepthMm - c.decorativeFaceMm) * ds, sy, c.decorativeFaceMm * ds, 300, '#a67b55')
    + rect(sx + (c.totalLiningDepthMm - c.backBoxSizeMm[2]) * ds, sy + 80, c.backBoxSizeMm[2] * ds, 72 * 2, '#a5adb0')
    + text(780, 510, `Total core → face: ${c.totalLiningDepthMm} mm`, 'dimension')
    + text(780, 540, `Gross behind decorative face: ${c.grossStandOffMm} mm`, 'dimension')
    + text(780, 570, `Usable route after carrier reserve: ${c.connectedUsableRoutingDepthMm} mm`, 'dimension')
    + text(780, 600, `Box ${c.backBoxSizeMm.join(' × ')} mm; remaining depth ${c.remainingBoxDepthMm} mm`)
    + text(780, 630, `General lining ${c.retainedGeneralDepthMm} mm; local intrusion ${c.roomIntrusionMm} mm`)
    + text(780, 660, 'No extra hidden cleat stack is assumed inside this local bay')
    + text(780, 690, `Containment ${c.containmentEnvelopeMm} mm; bend territory ${c.bendReserveMm} mm (authored)`)
    + text(780, 720, 'Class I earthing, insulation, enclosures and thermal functions retained')
  body += text(55, 855, 'Plan · complete fitting draw, hand use and first rest', 'heading')
  const plan = (box: readonly number[], fill: string) => rect(80 + (box[0] - left) * .6, 920 + (result.commonRoom.bands.at(-1)![3] - box[3]) * .6, (box[2] - box[0]) * .6, (box[3] - box[1]) * .6, fill)
  body += plan(c.firstRestPlanMm, '#bbc7b9') + plan(c.completeModuleDrawPlanMm, '#dfc987') + plan(c.handUsePlanMm, '#c5b69e') + plan(c.bayPlanMm, '#8f7860')
    + text(325, 935, `Complete fitting + ${c.normalDrawMm} mm roomward draw (gold)`)
    + text(325, 966, '100 mm hand reserve + 20 mm reference plug (brown)')
    + text(325, 997, '300 mm first-rest stand (green); clear of actual furniture')
    + text(325, 1028, `Conservative charged territory ${c.conservativeFloorTerritoryM2.toFixed(4)} m²`)
    + text(55, 1225, 'Removal: isolate/prove dead → temporary support → front screws → enclosed disconnection → normal draw → first rest')
    + text(55, 1256, 'Decorative infills stop around independently fixed socket/control islands. Adjacent panels and reveal stay in place.')
    + text(55, 1287, 'Reference components show geometry only. Full circuit/thermal/penetration design and trial criteria remain in the owning result.')
  return page(1510, 1330, 'Study lighting service corner geometry', body)
}

export function drawKitchenLightingCheck(result: StudyLightingResult) {
  const k = result.kitchen, p = (x: number, y: number) => [90 + (x - 7800) * .22, 680 - (y - 8900) * .22]
  const box = (r: readonly number[], fill: string) => { const q = p(r[0], r[1] + r[3]); return rect(q[0], q[1], r[2] * .22, r[3] * .22, fill) }
  const task = p(k.taskMm[0], k.taskMm[1])
  return page(1130, 900, 'Actual central kitchen task lighting check', text(35, 48, 'The kitchen tests the limit of the lamp preference', 'title')
    + text(35, 80, 'Actual table, occupied worker, sink and cooking footprints · no kitchen layout change')
    + box(k.tableXYWHMm, '#b9956c') + box(k.workerXYWHMm, '#929f85') + box(k.sinkXYWHMm, '#b7c9c5') + box(k.cookingXYWHMm, '#b8aaa0')
    + `<circle cx="${n(task[0])}" cy="${n(task[1])}" r="18" fill="none" stroke="#9b742f" stroke-width="3"/>`
    + line(task, [task[0] + 135, task[1] - 75], '#9b742f', 2) + text(task[0] + 140, task[1] - 80, 'Fixed ceiling task fallback')
    + text(task[0] + 140, task[1] - 50, `Task XY ${k.taskMm[0]}, ${k.taskMm[1]} mm`)
    + text(55, 740, 'No portable flex across occupied circulation, wet work or the hob. Wall-only central performance remains unmeasured.')
    + text(55, 774, 'Use ordinary switching and a cleanable, replaceable source on an independent surface support; no whole ceiling lining.')
    + text(55, 808, '750 mm table task plane is authored, not measured. Confirm actual ceiling/table height, shadows, glare and cleaning.')
    + text(55, 842, 'Retain separate sink/hob/hood task duties. This is a transferability screen, not a lighting performance pass.'))
}

export function drawStudyLightingRoutes(result: StudyLightingResult) {
  const room=result.commonRoom,origin=[Math.min(...room.bands.map(b=>b[0]!)),Math.min(...room.bands.map(b=>b[1]!))],scale=.205
  const p = (x: number, y: number) => [100 + (x - origin[0]) * scale, 790 - (y - origin[1]) * scale]
  const box = (r: readonly number[], fill: string) => polygon([p(r[0], r[1]), p(r[2], r[1]), p(r[2], r[3]), p(r[0], r[3])], fill)
  let body = text(35, 48, 'Sockets, flex and useful access territory', 'title')
    + text(35, 80, 'Same furnished Study · local deep stations are explicit · flex support and electrical design require trial')
    + room.bands.map(band => box(band, '#e5d4b5')).join('')
    + room.occupied.map(([id, r]) => box(r, '#a7ad98') + text(p(r[0], r[3])[0] + 3, p(r[0], r[3])[1] + 15, id.replace('study-', ''), 'small')).join('')
    + box(result.corner.completeModuleDrawPlanMm, '#e1bd7e') + box(result.corner.firstRestPlanMm, '#b8c9b6')
    + box(result.corner.bayPlanMm, '#8d7052')
  const portable = result.arrangements.find(row => row.id === 'portable')!
  if (portable.addedOccupiedStandMm) body += box(portable.addedOccupiedStandMm, '#c49a6b')
  for (const station of result.serviceStations) body += box(station.usePlanMm, '#c6b399') + box(station.bayPlanMm, '#8d7052')
  for (const [name, lead] of Object.entries(result.leads)) {
    if (typeof lead !== 'object') continue
    body += `<polyline points="${lead.pathMm.map(point => p(point[0], point[1]).map(n).join(',')).join(' ')}" fill="none" stroke="#316b74" stroke-width="3" stroke-dasharray="5,3"/>`
    const q = p(lead.pathMm[0][0], lead.pathMm[0][1])
    body += text(q[0] + 15, q[1] - 10, `${name}: ${Math.round(lead.routedMm)} mm + ${result.leads.authoredSlackMm} mm slack`, 'small')
  }
  body += text(1020, 170, 'Local depths', 'heading')
    + text(1020, 210, `Core → face ${result.corner.totalLiningDepthMm} mm`)
    + text(1020, 245, `Usable ${result.corner.connectedUsableRoutingDepthMm} mm`)
    + text(1020, 280, `Box ${result.corner.backBoxSizeMm[2]} mm`)
    + text(1020, 330, 'North: arrival + floor socket')
    + text(1020, 365, 'West: desk socket')
    + text(1020, 400, 'East: portable-only side socket')
    + text(1020, 460, 'Brown: use space')
    + text(1020, 495, 'Gold: complete fitting draw')
    + text(1020, 530, 'Green: first rest')
    + text(1020, 585, 'All stations independently')
    + text(1020, 615, 'enclosed and supported;')
    + text(1020, 645, 'no spare 27 mm cavity credit.')
    + text(55, 880, 'The side stand is shifted 50 mm away from its socket. The former stand overlapped the plug/hand-use territory.')
    + text(55, 915, 'Drawn flex lengths and room clearance do not qualify cable supports, minimum bend radii, thermal design or trip safety.')
    + text(55, 950, 'West emitter and retained door skirting remain fixed. Final containment crossings and panel first release need the service-corner trial.')
    + text(55, 985, `Source case ${result.caseDigest.slice(0, 16)} · no furniture position changed except the explicit added portable side stand.`, 'small')
  return page(1470, 1030, 'Study lighting socket and lead routes', body)
}

export function drawStudyLightingConstruction(result: StudyLightingResult) {
  const d = result.construction, c = result.corner
  const carrier = d.carrier, [x0] = carrier.xMm, top = carrier.zMm[1]
  const p = (x: number, z: number) => [110 + x - x0, 190 + top - z]
  let body = text(35,48,`Earlier ${c.totalLiningDepthMm} mm corner · carrier and first release`,'title')
    + text(35, 80, 'Dead-mock-up geometry · fixed islands stay independent · anchors, circuit, materials and physical trial unqualified')
    + text(70, 135, 'Positive front carrier', 'heading')
  for (const strip of carrier.stripsXZMm) {
    const q = p(strip[0], strip[3]); body += rect(q[0], q[1], strip[2] - strip[0], strip[3] - strip[1], '#8f9b9b')
  }
  const branch = d.containment.localEntryBranches[2], start = p(branch.bend.startMm[0], branch.bend.startMm[2]), end = p(branch.bend.endMm[0], branch.bend.endMm[2])
  const entry = p(branch.collar.boxEntryMm[0], branch.collar.boxEntryMm[2])
  body += `<path d="M ${n(start[0])} ${n(start[1])} A ${branch.bend.centrelineRadiusMm} ${branch.bend.centrelineRadiusMm} 0 0 1 ${n(end[0])} ${n(end[1])}" fill="none" stroke="#567a86" stroke-width="${d.containment.outsideDiameterRequirementMm}"/>`
    + `<path d="M ${n(end[0])} ${n(end[1])} L ${n(entry[0])} ${n(entry[1])}" fill="none" stroke="#a47c50" stroke-width="${branch.collar.outsideDiameterMm}"/>`
  for (const point of d.attachmentPoints) {
    const q = p(point.xMm, point.zMm)
    body += `<circle cx="${n(q[0])}" cy="${n(q[1])}" r="${n(point.holeDiameterMm / 2)}" fill="#f2eee3" stroke="#315d64"/>`
  }
  const cable = p(carrier.centralCableOpening.centreXMm, carrier.centralCableOpening.centreZMm)
  body += `<circle cx="${n(cable[0])}" cy="${n(cable[1])}" r="${n(carrier.centralCableOpening.diameterMm / 2)}" fill="#f2eee3" stroke="#315d64"/>`
    + text(70, 690, `${carrier.xMm[1] - carrier.xMm[0]} × ${carrier.zMm[1] - carrier.zMm[0]} × ${carrier.steelThicknessMm} mm frame`)
    + text(70, 720, 'Four positive front fixings; two fixed side rails')
    + text(70, 750, 'Hard lands carry loads directly to masonry')
    + text(70, 780, 'No load through decoration or mineral board')
    + text(550, 135, 'Depth and actual demand', 'heading')
    + text(550, 185, `Core face Y ${d.coreFaceYMm} mm; datum is not decorative face`)
    + text(550, 220, `Module G ${d.loadDemand.weightN.toFixed(3)} N; face moment ${d.loadDemand.faceMomentNm.toFixed(4)} Nm`)
    + text(550, 255, `Core moment ${d.loadDemand.coreMomentNm.toFixed(4)} Nm (includes ${c.totalLiningDepthMm} mm stand-off)`)
    + text(550, 290, `Fixing rows ${d.loadDemand.moduleCoupleSpacingMm} mm apart; couple ${d.loadDemand.normalCoupleN.toFixed(4)} N`)
    + text(550, 325, `Equal upper fixing ${d.loadDemand.equalTwoUpperFixingTensionN.toFixed(4)} N; no anchor rating inferred`)
    + text(550, 360, `Carrier stock upper comparison ${carrier.carrierStockMassKgUpperComparison.toFixed(5)} kg`)
    + text(550, 395, `Remaining ${carrier.remainingAuthoredMassBudgetKg.toFixed(5)} kg is a budget, not actual installed mass`)
    + text(550, 445, `Local entry starts X ${d.containment.riserAxisXMm}; side-entry radius ${d.containment.sideEntryBendCentrelineRadiusRequirementMm} mm`)
    + text(550, 480, `Outer bend requirement ${d.containment.outerBendTerritoryMm} mm; three independent fixed boxes`)
    + text(550, 515, `Straight collar ${d.containment.entryCollarEnvelopeMm[1]} mm; left setting gap ${d.containment.localEntryBranches[0].settingClearanceMm.left} mm (needs ${d.containment.localEntryBranches[0].requiredSettingMm})`)
    + text(550, 550, 'Local depth axes differ; common riser, feeder/protection and transitions remain unresolved')
    + text(550, 605, 'Removal follows factory body/bracket access after isolation and support')
    + text(550, 640, 'Full module is released only after the electrical disconnection is safe')
  const depthX = (depth: number) => 550 + depth * 4
  const socketBox = d.fixedEnclosures[0], junctionBox = d.fixedEnclosures[2]
  body += text(550, 685, 'Real box depths behind the finish · enlarged', 'small')
    + rect(depthX(0), 700, c.boundaryDepthMm * 4, 100, '#aaa99d')
    + rect(depthX(socketBox.bodyDepthMm[0]), 700, (socketBox.bodyDepthMm[1] - socketBox.bodyDepthMm[0]) * 4, 35, '#a5b4b7')
    + text(900, 724, `Socket box d ${socketBox.bodyDepthMm.join('..')} mm; fixed island interrupts decoration`, 'small')
    + rect(depthX(junctionBox.bodyDepthMm[0]), 760, (junctionBox.bodyDepthMm[1] - junctionBox.bodyDepthMm[0]) * 4, 35, '#a5b4b7')
    + rect(depthX(junctionBox.independentFixedCoverDepthMm![0]), 760, (junctionBox.independentFixedCoverDepthMm![1] - junctionBox.independentFixedCoverDepthMm![0]) * 4, 35, '#6b8a87')
    + rect(depthX(carrier.depthMm[0]), 760, (carrier.depthMm[1] - carrier.depthMm[0]) * 4, 35, '#a47c50')
    + text(900, 784, `Junction d ${junctionBox.bodyDepthMm.join('..')}; own cover; carrier d ${carrier.depthMm.join('..')}`, 'small')
  const q = (x: number, y: number) => [110 + (x - c.bayPlanMm[0]) * .9, 1050 - (y - c.firstRestPlanMm[1]) * .5]
  const box = (r: readonly number[], fill: string) => polygon([q(r[0], r[1]), q(r[2], r[1]), q(r[2], r[3]), q(r[0], r[3])], fill)
  const r = d.firstRelease
  body += text(70, 855, 'Full fitting + module first rest', 'heading')
    + box(c.firstRestPlanMm, '#b4c3ae')
    + box([r.withdrawn.xMm[0], r.withdrawn.yMm[0], r.withdrawn.xMm[1], r.withdrawn.yMm[1]], '#dec58e')
    + box([r.parked.xMm[0], r.parked.yMm[0], r.parked.xMm[1], r.parked.yMm[1]], '#899e9e')
    + text(500, 895, `Draw ${c.normalDrawMm} mm, translate into rest, then lower upright into captive cradle`)
    + text(500, 930, `Parked module Z ${r.parked.zMm.join('..')} mm; cradle ${c.firstRestPlanMm[2] - c.firstRestPlanMm[0]} × ${c.firstRestPlanMm[3] - c.firstRestPlanMm[1]} mm`)
    + text(500, 965, `Complete swept footprint has ${r.conflictingOccupiedIds.length} current furniture conflicts`)
    + text(500, 1000, 'Cradle capacity/floor support, actual human handling and full supplied tail remain unqualified')
    + text(70, 1080, 'Ordinary infill: support → release four front screws → normal draw; fixed electrical islands and reveal remain closed.')
    + text(70, 1115, 'Never enable an opened repair enclosure. Reconnect earth/strain relief, reinstate closures and verify before energising.')
  const h = d.localHomeRunComparison
  const hp = (x: number,z: number) => [85+(x-h.bayPlanMm[0]!)*.5,2350-z*.5]
  const hbox = (b: readonly number[],fill: string) => polygon([hp(b[0]!,b[1]!),hp(b[2]!,b[1]!),hp(b[2]!,b[3]!),hp(b[0]!,b[3]!)],fill)
  body += text(35,1210,'Simplify the corner · three conventional separate home runs','title')
    + text(35,1245,'Unselected development direction · keep ordinary flush accessories; no bespoke splitter, recessed controls or in-corner depth transition')
    + hbox([h.bayPlanMm[0]!,h.finishBottomZMm,h.bayPlanMm[2]!,2100],'#ddceb3')
  for (const route of h.routes) {
    const a=hp(route.straight.startMm[0]!,route.straight.startMm[2]!), b=hp(route.bend.startMm[0]!,route.bend.startMm[2]!), e=hp(route.bend.endMm[0]!,route.bend.endMm[2]!)
    body += `<path d="M${a.map(n).join(',')} L${b.map(n).join(',')} A${route.bend.radiusMm*.5},${route.bend.radiusMm*.5} 0 0 1 ${e.map(n).join(',')}" fill="none" stroke="#567a86" stroke-width="${d.containment.outsideDiameterRequirementMm*.5}"/>`
      + line(hp(route.collar.a[0]!,route.collar.a[2]!),hp(route.collar.b[0]!,route.collar.b[2]!), '#a47c50',d.containment.entryCollarEnvelopeMm[0]*.5)
    for (const clip of route.clips) { const q=hp(clip.pointMm[0]!,clip.pointMm[2]!); body+=rect(q[0]-8,q[1]-2,16,4,'#7b827b') }
    const q=hp(route.sourcePointMm[0]!,route.sourcePointMm[2]!);body+=`<circle cx="${n(q[0])}" cy="${n(q[1])}" r="5" fill="#f2eee3" stroke="#9b4233"/>`
  }
  for (const box of h.boxes) body+=hbox([box.xMm[0]!,box.zMm[0]!,box.xMm[1]!,box.zMm[1]!],'#a9b8b4')
  const cx=(h.boxes[0]!.xMm[0]!+h.boxes[0]!.xMm[1]!)/2
  for (const z of [c.socketCentreMm[2]!,c.switchCentreMm[2]!]) body+=hbox([cx-43,z-43,cx+43,z+43],'#ede2cc')
  body += h.carrierStripsXZMm.map(r=>hbox(r,'#899c9c')).join('')
    + `<circle cx="${n(hp(h.cableOpening.centreXMm,h.cableOpening.centreZMm)[0])}" cy="${n(hp(h.cableOpening.centreXMm,h.cableOpening.centreZMm)[1])}" r="${h.cableOpening.diameterMm*.25}" fill="#f2eee3" stroke="#315d64"/>`
    + line(hp(c.doorRoughXMm[0]!,c.bayBottomZMm),hp(c.doorRoughXMm[0]!,2100),'#8e7860',4)
    + hbox([c.retainedSkirtingEndXMm[0]!,0,c.retainedSkirtingEndXMm[1]!,result.commonRoom.skirtingTopMm],'#8c6d4d')
    + text(345,1335,`${h.choices.bayWidthMm} mm local bay · ${h.architecturalConsequence.additionalBayWidthMm} mm wider to the left`)
    + text(345,1370,`Door/reveal datum fixed; complete carrier and accessories shift ${Math.abs(h.architecturalConsequence.carrierShiftXMm)} mm left`)
    + text(345,1405,`Candidate depth ${h.totalDepthMm} mm vs earlier ${c.totalLiningDepthMm} mm; added floor territory ${h.architecturalConsequence.addedConservativeFloorTerritoryM2.toFixed(5)} m²`)
    + text(345,1465,'The innermost tube ends at the socket; the next ends at the switch')
    + text(345,1500,'The outer tube rises to the light after the lower tubes have ended')
    + text(345,1535,'No tube crosses a continuing lower run; all three retain independent support')
    + text(345,1595,`Bend radii ${h.routes.map(r=>r.bend.radiusMm).join(' / ')} mm; minimum pair reserve ${Math.min(...h.separations.map(r=>r.reserveMm)).toFixed(3)} mm after ${h.pairSettingMm} mm pair setting`)
    + text(345,1630,`${h.issues.length ? 'Geometry rejected' : 'Routes clear within the declared geometry'}; current house supply remains unbound`)
    + text(345,1690,`Tube ${h.stock.tubeLengthMm.toFixed(1)} mm + gross collars ${h.stock.collarLengthMm} mm; ${h.stock.clipCount} authored clip positions`)
    + text(345,1725,`Known containment steel ${h.stock.totalKnownContainmentStockKg.toFixed(3)} kg; not complete installed mass`)
    + text(345,1760,`New fixed saddle receiver ${h.stock.separateKnownSaddleReceiverStockKg.toFixed(5)} kg; actual saddle mass/strength unqualified`)
    + text(345,1820,`${result.localHomeRunWallDisposition.length} actual north-wall pieces intersect the wider replacement bay`)
    + text(345,1855,`Symmetric carrier retained; ordinary ${h.choices.accessoryExtensionMm} mm steel frames keep the lower controls flush`)
    + text(345,1915,'At the skirt top: three explicit unconnected source interfaces, not selected circuits')
    + text(345,1950,'Ports are authored requirements within current reference box envelopes')
    + text(345,1985,'Actual Barton side ports and matched hardware remain unqualified')
    + text(345,2045,`Tube/actual steel reserve ${Math.min(...h.obstacleChecks.map(r=>r.reserveMm)).toFixed(3)} mm after both settings`)
    + text(345,2080,`Ordinary upper-bend saddle splits its span to ${h.routes[2]!.finalSpansMm.map(v=>v.toFixed(1)).join(' / ')} mm`)
    + text(345,2140,`Closed junction/carrier reserve ${Math.min(...h.enclosureCarrierChecks.map(r=>r.reserveMm)).toFixed(1)} mm; actual full-face clearance is charged`)
    + text(345,2175,'Actual steel strips, full saddle/receiver, hand tool, boxes, furniture and first rest are checked')
    + text(345,2235,'The old shallow full face, narrow spacing or absent bend saddle fail the retained screens')
    + text(345,2270,'The old75 mm full-face arrangement fails; actual box ports/connections remain unqualified')

  if(h.saddle){
    const sb=h.saddle.bodyBox
    body+=hbox([sb[0]!,sb[2]!,sb[0]!+sb[3]!,sb[2]!+sb[5]!],'#b59568')
      + text(345,2325,`Wera205 ×37 mm tool witness; base-first after cover/tube release`,'small')
      + text(345,2355,`D-Line86.19 ×20 ×23 mm saddle witness; bend/anchor/loaded handling unqualified`,'small')
  }
  const depth=(v:number)=>90+v*3
  body+=text(35,2460,'Complete depth and ordinary enclosure renewal','title')
    +text(35,2495,'Enlarged depth budget; fixed cases/closures are independent of decoration and the removable fitting carrier')
    +rect(depth(0),2520,c.boundaryDepthMm*3,110,'#a6a69c')
    +rect(depth(h.boxes[2]!.depthMm[0]!),2540,(h.boxes[2]!.depthMm[1]!-h.boxes[2]!.depthMm[0]!)*3,72,'#b3c2c1')
    +rect(depth(h.boxes[2]!.closedCoverDepthMm![0]!),2540,(h.boxes[2]!.closedCoverDepthMm![1]!-h.boxes[2]!.closedCoverDepthMm![0]!)*3,72,'#8fa7a1')
    +rect(depth(h.carrierDepthMm[0]!),2520,(h.carrierDepthMm[1]!-h.carrierDepthMm[0]!)*3,110,'#8c9c9b')
    +rect(depth(h.totalDepthMm-c.decorativeFaceMm),2520,c.decorativeFaceMm*3,110,'#b58d65')
    +text(445,2545,`Upper box d ${h.boxes[2]!.depthMm.join('..')} mm; own cover ${h.boxes[2]!.closedCoverDepthMm!.join('..')}`)
    +text(445,2580,`Retained carrier d ${h.carrierDepthMm.join('..')} mm; timber face ends at ${h.totalDepthMm} mm`)
    +text(445,2615,`Two ordinary ${h.choices.accessoryExtensionMm} mm lower frames: ${h.stock.extensionStockKgComparison.toFixed(6)} kg at authored2 mm wall stock`)
    +text(445,2650,'Actual supplied gauges/lugs/weights, mating entries, device/earth/union and protection remain unqualified')
  const rp=(x:number,y:number)=>[90+(x-h.bayPlanMm[0]!)*.6,2890-(y-h.firstRestPlanMm[1]!)*.5]
  const rr=(b:readonly number[],colour:string)=>polygon([rp(b[0]!,b[1]!),rp(b[2]!,b[1]!),rp(b[2]!,b[3]!),rp(b[0]!,b[3]!)],colour)
  body+=rr(h.firstRestPlanMm,'#b8c5b1')+rr(h.caseRestPlanMm,'#9ebdc4')
    +text(445,2730,`Park fitting/module first; its support territory moves ${h.choices.mainRestSouthShiftMm} mm south`)
    +text(445,2765,`Then place separate ${h.choices.caseRestSizeMm} ×${h.choices.caseRestSizeMm} mm case rest; ${h.caseRenewal[0]!.restReservesMm.moduleCradle} mm after both settings`)
    +text(445,2800,`Complete closed-case draws: ${h.caseRenewal.map(r=>r.normalDrawMm).join(' / ')} mm; lower in the cleared plane`)
    +text(445,2835,'Whole cases, remaining closed fronts/pipes, protected lands, furniture and both support footprints are charged')
    +text(445,2870,'Own collar release, actual loaded handling and complete cradle capacity remain unqualified')
    +text(35,2960,'Geometric design comparison only. Hardware, materials, protection, installed mass, physical trial and owner appearance remain unearned.','small')
  return page(1510, 3010, 'Study lighting carrier and conventional home-run comparison', body)
}

export function drawCommonDepthCornerComparison(result: StudyLightingResult) {
  const c = result.commonDepthCornerComparison, p = c.purpose
  const q = (x: number, z: number) => [80 + (x - result.corner.bayPlanMm[0]!) * .4, 1000 - z * .4]
  let body = text(35, 48, 'One depth · a replaceable enclosure comparison', 'title')
    + text(35, 82, 'Unselected purpose design · containment geometry is distinct from actual terminals, protection and material acceptance')
    + text(60, 130, 'Actual local elevation', 'heading')
    + text(320, 135, 'What the candidate buys', 'heading')
    + text(320, 185, `All port axes: ${c.commonAxisCoreDepthMm} mm from the masonry core`)
    + text(320, 220, `Accessory faces: ${c.accessoryFaceRecessMm} mm behind decoration`)
    + text(320, 255, `Three ${c.choices.enclosureWidthMm} × ${c.choices.enclosureHeightMm} × ${result.corner.backBoxSizeMm[2]} mm cases`)
    + text(320, 290, `${p.straightContainmentLengthMm} mm of finite straight tube; ${p.collars.length} finite collars`)
    + text(320, 325, 'No external bend; existing R70 demand remains where bends exist')
    + text(320, 370, `${p.pipes[0]!.outsideDiameterMm} mm route + two ${c.settingMm} mm allowances: ${c.stockComparison.requiredRouteSpaceMm} mm`)
    + text(320, 405, `Stock rear space ${c.stockComparison.nominalRearSpaceMm} mm: reject that through-route`)
    + text(320, 440, 'BG HGS06: offset knockouts have no dimensioned entry axes')
    + text(320, 475, 'No actual HGS06 connection has been qualified')
    + text(320, 525, `Purpose side bypass ${p.internalBypassWidthMm} mm`)
    + text(320, 560, `Collar side clearances ${p.collarSideClearanceMm} mm; depth ${p.collarRearClearanceMm}/${p.collarFrontClearanceMm} mm`)
    + text(320, 605, `The ${result.commonDepthCornerComparison.purpose.enclosures[0]!.accessoryReservedVolumeXYZMm[4]! - result.commonDepthCornerComparison.purpose.enclosures[0]!.accessoryReservedVolumeXYZMm[1]!} mm interface reserve is retained; nothing enters permanent fabric`)
    + text(320, 650, 'Independent closed cases remain when decoration is released')
    + text(320, 685, 'Unbound device/earth terminals and union/tool details stay explicit')
    + text(320, 730, 'Equipment terminals and circuit acceptance remain unqualified')
  const left = q(result.corner.bayPlanMm[0]!, 2100), right = q(result.corner.bayPlanMm[2]!, 155)
  body += rect(left[0], left[1], right[0]! - left[0]!, right[1]! - left[1]!, '#dfd0b4')
  for (const pipe of p.pipes) body += line(q(pipe.startXYZMm[0]!, pipe.startXYZMm[2]!), q(pipe.endXYZMm[0]!, pipe.endXYZMm[2]!), '#57777e', pipe.outsideDiameterMm * .4)
  for (const collar of p.collars) body += line(q(collar.startXYZMm[0]!, collar.startXYZMm[2]!), q(collar.endXYZMm[0]!, collar.endXYZMm[2]!), '#a47c50', collar.outsideDiameterMm * .4)
  for (const clip of p.pipeClips) {
    const point = q(clip.pointXYZMm[0]!, clip.pointXYZMm[2]!)
    body += `<circle cx="${n(point[0])}" cy="${n(point[1])}" r="4" fill="#f2eee3" stroke="#315d64"/>`
  }
  for (const [i, box] of p.enclosures.entries()) {
    const top = q(box.xMm[0]!, box.zMm[1]!)
    body += rect(top[0], top[1], (box.xMm[1]! - box.xMm[0]!) * .4, (box.zMm[1]! - box.zMm[0]!) * .4, '#b8c3c1')
    const device = box.accessoryReservedVolumeXYZMm
    const dp = q(device[0]!, device[5]!)
    body += rect(dp[0], dp[1], (device[3]! - device[0]!) * .4, (device[5]! - device[2]!) * .4, '#eadcba')
    const path = box.internalRoute.pointXYZMm
    body += line(q(path[0]![0]!, path[0]![2]!), q(path[1]![0]!, path[1]![2]!), '#57777e', box.internalRoute.diameterRequirementMm * .4)
    body += text(60, top[1] - 12, `${['Socket', 'Switch', 'Light enclosure'][i]} · ${(box.zMm[0]! + box.zMm[1]!) / 2} mm`, 'small')
    for (const fixing of box.fixings) {
      const xy = q(fixing.pointXYZMm[0]!, fixing.pointXYZMm[2]!)
      body += `<circle cx="${n(xy[0])}" cy="${n(xy[1])}" r="2" fill="#735b3e"/>`
    }
  }
  const depth = (d: number) => 920 + d * 5
  const sample = p.enclosures[0]!, device = sample.accessoryReservedVolumeXYZMm
  body += text(900, 135, 'Core-to-face budget · enlarged section', 'heading')
    + rect(depth(0), 190, result.corner.boundaryDepthMm * 5, 320, '#a7a69c')
    + rect(depth(sample.bodyDepthMm[0]!), 190, (sample.bodyDepthMm[1]! - sample.bodyDepthMm[0]!) * 5, 320, '#d5dddd')
    + rect(depth(sample.fixedCoverDepthMm[0]!), 190, (sample.fixedCoverDepthMm[1]! - sample.fixedCoverDepthMm[0]!) * 5, 115, '#8faaa5')
    + rect(depth(sample.fixedCoverDepthMm[0]!), 391, (sample.fixedCoverDepthMm[1]! - sample.fixedCoverDepthMm[0]!) * 5, 119, '#8faaa5')
    + rect(depth(result.corner.totalLiningDepthMm - result.corner.decorativeFaceMm), 150, result.corner.decorativeFaceMm * 5, 30, '#ad865f')
    + rect(depth(result.corner.totalLiningDepthMm - result.corner.decorativeFaceMm), 520, result.corner.decorativeFaceMm * 5, 30, '#ad865f')
    + line([depth(sample.accessoryFaceDepthMm),190], [depth(result.corner.totalLiningDepthMm),190], '#8faaa5', 6)
    + line([depth(sample.accessoryFaceDepthMm),510], [depth(result.corner.totalLiningDepthMm),510], '#8faaa5', 6)
    + rect(depth(sample.accessoryFaceDepthMm - (device[4]! - device[1]!)), 305, (device[4]! - device[1]!) * 5, result.corner.plateSizeMm[1]!, '#eadcba')
    + text(900, 575, `Purpose body d ${sample.bodyDepthMm.join('..')} mm; own cover ${sample.fixedCoverDepthMm.join('..')} mm`)
    + text(900, 610, 'Recess lies entirely in replaceable lining; retained boundary is intact')
    + text(900, 645, `Inserted plug projects ${c.accessoryUse.insertedPlugRoomwardProjectionBeyondDecorationMm} mm beyond decoration`)
    + text(900, 680, 'The side bypass is beside the device, not inside its occupied depth')
    + text(900, 725, `Local enclosure geometry: ${c.evidence.localGeometryPassing ? 'within declared checks' : 'REJECTED'}`)
    + text(900, 760, `Device terminals connected: ${p.deviceTerminalsConnected}; complete room circuit: ${p.completeRoomCircuit}`)
  const s = (x: number, y: number) => [80 + (x - result.commonRoom.bands[0]![0]!) * .36, 1350 - (y - c.renewal.secondaryRestPlanMm[1]! + 50) * .36]
  const plan = (r: readonly number[], fill: string) => polygon([s(r[0]!, r[1]!), s(r[2]!, r[1]!), s(r[2]!, r[3]!), s(r[0]!, r[3]!)], fill)
  body += text(550, 855, 'Pay for complete enclosure withdrawal', 'heading')
    + text(550, 900, `Required normal draw ${c.renewal.requiredWholeEnclosureNormalDrawMm} mm; proposed ${c.renewal.firstNormalDrawMm} mm`)
    + text(550, 935, 'Keep the light module in its existing separate rest')
    + text(1050, 900, `Charge full ${c.renewal.completeCaseIncludingSurroundDepthMm} mm case/surround depth`)
    + text(550, 970, 'Isolate/prove dead; support and disconnect; qualified unions must release first')
    + text(550, 1005, 'Draw normal, translate left above the main rest, then south and lower')
    + text(550, 1040, `Additional rest ${c.choices.secondaryRestSizeMm} × ${c.choices.secondaryRestSizeMm} mm: ${c.renewal.additionalTemporaryFloorTerritoryM2} m²`)
    + text(550, 1075, `Occupied/main-rest conflicts: ${c.renewal.moves.flatMap(m => m.conflictingIds).length}`)
    + text(550, 1110, 'Actual union release, tools and temporary support remain unqualified')
    + text(550, 1155, `Additional case gravity ceiling: ${c.loadInterface.authoredTotalCaseGravityN.toFixed(2)} N`)
    + text(550, 1190, `Known case/surround/tube/collar steel: ${c.loadInterface.totalKnownSteelStockKgComparison.toFixed(3)} kg`)
    + text(550, 1235, 'A smaller box, 50 mm draw or missing device volume is not a substitute')
  const main = result.construction.firstRelease.parked
  body += c.renewal.moves.slice(1).map(move => plan(move.planMm, '#e0e6df')).join('')
    + plan([main.xMm[0]!, main.yMm[0]!, main.xMm[1]!, main.yMm[1]!], '#a6b29c')
    + plan(c.renewal.secondaryRestPlanMm, '#b9cbd1')
    + plan([c.renewal.parkedCase.xMm[0]!, c.renewal.parkedCase.yMm[0]!, c.renewal.parkedCase.xMm[1]!, c.renewal.parkedCase.yMm[1]!], '#8dabb3')
    + text(65, 1385, 'Plan: green = retained module rest; blue = additional case rest', 'small')
    + text(35, 2070, 'Unselected geometric comparison. Actual terminals, fabrication, protective enclosure/earth continuity, material admission, physical renewal and owner appearance remain open.', 'small')
  const grip = c.accessoryUse, g = c.choices, gx = 350, gz = 1710, scale = 1.5
  body += text(60, 1505, 'Ordinary recessed plug use · front view', 'heading')
    + rect(gx - g.enclosureWidthMm * scale / 2, gz - g.enclosureHeightMm * scale / 2, g.enclosureWidthMm * scale, g.enclosureHeightMm * scale, '#b8c3c1')
    + rect(gx - g.accessoryOpeningWidthMm * scale / 2, gz - g.accessoryOpeningHeightMm * scale / 2, g.accessoryOpeningWidthMm * scale, g.accessoryOpeningHeightMm * scale, '#f2eee3')
    + rect(gx - grip.completeReferencePlugMm[0]! * scale / 2, gz - grip.completeReferencePlugMm[1]! * scale / 2, grip.completeReferencePlugMm[0]! * scale, grip.completeReferencePlugMm[1]! * scale, '#a47c50')
  for (const side of [-1, 1]) {
    const x = gx + side * grip.completeReferencePlugMm[0]! * scale / 2 + (side < 0 ? -g.fingerThicknessMm * scale : 0)
    body += rect(x, gz - g.fingerHeightMm * scale / 2, g.fingerThicknessMm * scale, g.fingerHeightMm * scale, '#dfb89d')
  }
  body += text(620, 1580, `${g.accessoryOpeningWidthMm} × ${g.accessoryOpeningHeightMm} mm fixed opening`)
    + text(620, 1620, `${g.fingerThicknessMm} mm finger requirements beside plug`)
    + text(620, 1660, `Two independent settings: ${grip.twoIndependentSettingsMm} mm`)
    + text(620, 1700, `Side / vertical reserve: ${grip.gripSideReserveMm} / ${grip.gripVerticalReserveMm} mm`)
    + text(620, 1740, `Normal draw: ${grip.authoredPlugNormalDrawMm} mm`)
    + text(60, 1900, 'Brown: referenced complete plug; pink: authored fingers; cream: clear fixed mouth')
    + text(60, 1940, `Grip geometry: ${grip.geometryStatus === 'DECLARED_PLUG_AND_FINGER_SWEEP_CLEAR' ? 'within declared checks' : 'REJECTED'}`)
    + text(60, 1980, 'The electrical face stays closed; actual grip force and supplied lead need trial')
    + text(60, 2020, 'Terminals/earth, feeder, unions, complete installed mass and capacity remain unqualified')
  return page(1650, 2110, 'Common-depth service enclosure comparison and renewal', body)
}
