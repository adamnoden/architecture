import type { StudyLightingResult } from './study-lighting.js'

const esc = (v: unknown) => String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const n = (v: number) => Number(v.toFixed(2))
const text = (x: number, y: number, value: string, kind = 'note') => `<text x="${n(x)}" y="${n(y)}" class="${kind}">${esc(value)}</text>`
const line = (a: readonly number[], b: readonly number[], colour = '#514b40', width = 1) => `<path d="M${a.map(n).join(',')}L${b.map(n).join(',')}" fill="none" stroke="${colour}" stroke-width="${width}"/>`
const polygon = (points: readonly (readonly number[])[], fill: string, stroke = '#6b5946') => `<polygon points="${points.map(p => p.map(n).join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width=".8"/>`
const rect = (x: number, y: number, w: number, h: number, fill: string, stroke = '#6b5946') => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${fill}" stroke="${stroke}"/>`
const page = (w: number, h: number, title: string, body: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">Source-derived geometric review. Luminaire symbols show placement and intended use, not measured light distribution or accepted materials.</desc><style>.title{font:32px Georgia;fill:#342d25}.heading{font:23px Georgia;fill:#342d25}.note{font:16px Arial;fill:#48443b}.small{font:13px Arial;fill:#514c42}.dimension{font:15px monospace;fill:#285f69}</style><rect width="${w}" height="${h}" fill="#f2eee3"/>${body}</svg>\n`

function furnishedView(result: StudyLightingResult, arrangement: StudyLightingResult['arrangements'][number]) {
  const room = result.commonRoom, [x0, y0] = room.bands[0]
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
      const x = 20 + index % 2 * 850, y = 105 + Math.floor(index / 2) * 590
      return `<g transform="translate(${x},${y})">` + rect(0, 0, 825, 565, '#eee7d9', '#c8bdab')
        + text(20, 35, arrangement.title, 'heading') + `<g transform="translate(5,55)">${furnishedView(result, arrangement)}</g>`
        + text(20, 507, `${arrangement.fixedLightPoints} fixed light point(s) · ${arrangement.roles[0].liveSourceIds.length ? 'arrival source available' : 'arrival source removed'}`)
        + text(20, 535, 'Desk/screen and seated figure are task witnesses; no measured lighting pass.', 'small') + '</g>'
    }).join('')
    + text(35, 1325, `Finish: ${result.request.finishTrial} · selected development comparison: ${result.selectedArrangement}`)
    + text(35, 1354, 'Ordinary manual controls remain operable without automation. Fixed-source geometry does not prove task adequacy.')
    + text(35, 1383, `Source: ${result.source.room.currentPlanBasis} / ${result.source.room.occupiedHouse} · case ${result.caseDigest.slice(0, 16)}`, 'small')
  return page(1740, 1420, 'Four furnished Study lighting arrangements', body)
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
    + ebox(c.doorRoughXMm[0], 0, c.doorRoughXMm[0] + 25, result.commonRoom.ceilingZMm, '#9d8e77')
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
