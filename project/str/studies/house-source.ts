/** Source-bound STR-HOUSE geometry control and negative comparisons.
 * Does not adopt geometry or establish structural/occupation adequacy.
 * Run from repository root; --check verifies retained JSON. */
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { layoutRevision as d, revisionOpenings, entryVoid } from '../../../compiler/reference-house/georgian/layout-revision.ts'
import { layoutFamilySource } from '../../../compiler/reference-house/georgian/layout-family.ts'

const out = dirname(fileURLToPath(import.meta.url))
const repo = resolve(out, '../../..')
const sourceHead = '68d0273f928681aed7222bba2927dc8a89ae5ead'
const blobId = (p: string) => {
  const bytes = readFileSync(resolve(repo, p))
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
}
const round = (n: number, digits = 4) => +n.toFixed(digits)
type Rect = { x: number; y: number; width: number; depth: number }
type Level = 'GROUND' | 'FIRST'
const inside = (r: Rect, x: number, y: number) => x > r.x && x < r.x + r.width && y > r.y && y < r.y + r.depth
const envelopeRects = (e: number): Rect[] => [
  { x: 0, y: 0, width: d.shell, depth: e },
  { x: 0, y: d.shell - e, width: d.shell, depth: e },
  { x: 0, y: 0, width: e, depth: d.shell },
  { x: d.shell - e, y: 0, width: e, depth: d.shell },
  { x: d.court.x - e, y: d.court.y - e, width: d.court.width + 2 * e, depth: d.court.depth + 2 * e }
]
const partitionRects = (level: Level, t: number): Rect[] => d.partitions[level].map(w => w.a[1] === w.b[1]
  ? { x: w.a[0], y: w.a[1] - t / 2, width: w.b[0] - w.a[0], depth: t }
  : { x: w.a[0] - t / 2, y: w.a[1], width: t, depth: w.b[1] - w.a[1] })

// Exact axis-aligned cell decomposition, no spatial grid approximation. Door
// thresholds remain inside full wall reservations: these are consistent net
// planning areas, not a statutory area convention or masonry volume take-off.
function usableArea(inclusions: Rect[], exclusions: Rect[]) {
  const all = [...inclusions, ...exclusions]
  const xs = [...new Set(all.flatMap(r => [r.x, r.x + r.width]))].sort((a, b) => a - b)
  const ys = [...new Set(all.flatMap(r => [r.y, r.y + r.depth]))].sort((a, b) => a - b)
  let area = 0
  for (let i = 0; i < xs.length - 1; ++i) for (let j = 0; j < ys.length - 1; ++j) {
    const x = (xs[i] + xs[i + 1]) / 2, y = (ys[j] + ys[j + 1]) / 2
    if (inclusions.some(r => inside(r, x, y)) && !exclusions.some(r => inside(r, x, y))) area += (xs[i + 1] - xs[i]) * (ys[j + 1] - ys[j])
  }
  return area / 1e6
}

const levels = ['GROUND', 'FIRST'] as const
const sourceFiles = [
  'compiler/reference-house/georgian/layout-revision.ts',
  'compiler/reference-house/georgian/layout-family.ts',
  'compiler/reference-house/georgian/section-exemplar.ts',
  'compiler/reference-house/georgian/source.ts',
  'project/bcr/bcr-structure-result.md',
  'project/bcr/bcr-occupation-result.md',
  'project/bcr/bcr-wet-result.md',
  'project/bcr/bcr-services-result.md',
  'project/bcr/bcr-preflight-result.md',
  'docs/reference-house/structural-brief.md'
]
const expectedSourceBlobs: Record<string, string> = {
  "compiler/reference-house/georgian/layout-revision.ts": "af955c7da2e2469fd24598f98db6fc942a119ed3",
  "compiler/reference-house/georgian/layout-family.ts": "30ef287f3176e0f4cf2b03ef57c4fdfc915494c9",
  "compiler/reference-house/georgian/section-exemplar.ts": "75bf5c749da5095c07eed46105817a79095ca418",
  "compiler/reference-house/georgian/source.ts": "1edcfe12392e7b56bf957ffa10a57e21878f3fa0",
  "project/bcr/bcr-structure-result.md": "334798985eeb828f7c3e6f175c0ee1678bc1c8ea",
  "project/bcr/bcr-occupation-result.md": "434c634347c07a473fbb5c13c764064aceb37bb7",
  "project/bcr/bcr-wet-result.md": "a8c28116e5b795704667b8fec44a297645f47ba9",
  "project/bcr/bcr-services-result.md": "6bcca017f919726c245986d5c936ef7208f1dca4",
  "project/bcr/bcr-preflight-result.md": "1af61accfaa5bbcb84fa02fca208b6121273f102",
  "docs/reference-house/structural-brief.md": "ee6ffe9704e1da927ff3a6a1d052da2f0dba7abf"
}
for (const [path, expected] of Object.entries(expectedSourceBlobs)) {
  if (blobId(path) !== expected) throw new Error(`Source changed: ${path}; re-evaluate HOUSE before regenerating`)
}

const source = {
  head: sourceHead,
  design: d.id, family: layoutFamilySource.id,
  files: Object.fromEntries(sourceFiles.map(p => [p, blobId(p)]))
}
const areaRows = [125, 170, 220, 245].flatMap(t => levels.map(level => {
  const exclusions = [...envelopeRects(d.envelope), ...partitionRects(level, t)]
  const whole = usableArea([{ x: 0, y: 0, width: d.shell, depth: d.shell }], exclusions)
  return {
    level, finishedPartitionMm: t,
    description: t === 125 ? 'Source reservation' : `${t - 30} core + two 15 finishes: geometric sensitivity only`,
    remainingPlanM2BeforeStairAndVoid: round(whole),
    addedWallFootprintM2: round(usableArea([{ x: 0, y: 0, width: d.shell, depth: d.shell }], [...envelopeRects(d.envelope), ...partitionRects(level, 125)]) - whole),
    roomPlanningAreasM2: Object.fromEntries(d.rooms[level].map(r => [r.id, round(usableArea(r.boxes, exclusions))]))
  }
}))

function overlapLen(a: [number, number], b: [number, number]) { return Math.max(0, Math.min(a[1], b[1]) - Math.max(a[0], b[0])) }
const alignment = d.partitions.FIRST.map(w => {
  const horizontal = w.a[1] === w.b[1], at = horizontal ? w.a[1] : w.a[0]
  const lo = Math.max(d.envelope, horizontal ? w.a[0] : w.a[1]), hi = Math.min(d.shell - d.envelope, horizontal ? w.b[0] : w.b[1])
  const matches = d.partitions.GROUND.filter(g => (g.a[1] === g.b[1]) === horizontal && (horizontal ? g.a[1] : g.a[0]) === at && overlapLen([lo, hi], horizontal ? [g.a[0], g.b[0]] : [g.a[1], g.b[1]]) > 0)
  const intervals = matches.map(g => [Math.max(lo, horizontal ? g.a[0] : g.a[1]), Math.min(hi, horizontal ? g.b[0] : g.b[1])] as [number, number]).filter(([a, b]) => b > a)
  const aligned = intervals.reduce((sum, [a, b]) => sum + b - a, 0)
  const lowerDoorMm = matches.reduce((sum, g) => sum + revisionOpenings('GROUND').filter(o => o.wall === g.id && o.kind === 'door').reduce((n, o) => n + overlapLen([lo, hi], [o.centre - o.width / 2, o.centre + o.width / 2]), 0), 0)
  return { id: w.id, axis: horizontal ? 'y' : 'x', at, from: lo, to: hi, lengthMm: hi - lo, collinearBelowMm: aligned, lowerOpeningMmWithinCollinear: lowerDoorMm, solidCollinearBelowMm: aligned - lowerDoorMm, withoutCollinearWallBelowMm: hi - lo - aligned, lowerWallIds: matches.map(g => g.id) }
})
const totals = alignment.reduce((r, a) => ({ lengthMm: r.lengthMm + a.lengthMm, collinearMm: r.collinearMm + a.collinearBelowMm, overLowerOpeningMm: r.overLowerOpeningMm + a.lowerOpeningMmWithinCollinear, noCollinearBelowMm: r.noCollinearBelowMm + a.withoutCollinearWallBelowMm }), { lengthMm: 0, collinearMm: 0, overLowerOpeningMm: 0, noCollinearBelowMm: 0 })

const envelopeSensitivity = [140, 190, 215].map(inner => {
  const e = d.envelope + inner - 140
  return {
    innerLeafMm: inner, totalEnvelopeMm: e,
    ordinaryClearBandMm: d.court.x - 2 * e,
    stairWestMmAfterMovingOutOfWall: e,
    westGalleryWith2400StairMm: d.court.x - 2 * e - d.stair.width,
    eastGalleryWith125SpineMm: 9500 - 62.5 - (d.court.x + d.court.width + e),
    frontRoomClearDepthWith170PartitionMm: 2650 - 85 - e,
    planInteriorRingM2BeforePartitions: round((d.shell - 2 * e) ** 2 / 1e6 - (d.court.width + 2 * e) ** 2 / 1e6)
  }
})
const clearances = [125, 170, 220, 245].map(t => ({
  finishedWallMm: t,
  frontBedroomClearDepthMm: 2650 - t / 2 - d.envelope,
  bridgeBandIfHeadFollowsNorthWallFaceMm: d.court.y - d.envelope - (2650 + t / 2),
  eastGalleryMm: 9500 - t / 2 - (d.court.x + d.court.width + d.envelope),
  originalStairOverlapByUnmovedRearWestWallMm: Math.max(0, d.stair.y + d.stair.length - (8230 - t / 2)),
  rearWallCentreToKeepStairFootprintMm: d.stair.y + d.stair.length + t / 2,
  plantWidthMm: d.shell - d.envelope - 9500 - t / 2,
  currentSmallEnsuiteDepthMm: 3850 - 2650 - t
}))

const offsetFrame = [4600, 7400].map(x => ({
  x, edgeShiftMm: Math.min(Math.abs(x - entryVoid.x), Math.abs(x - entryVoid.x - entryVoid.width)),
  courtPierInterval: x < 6000 ? [4250, 4800] : [7200, 7750],
  outerFrontPierInterval: x < 6000 ? [4400, 5100] : [6900, 7600],
  commonSolidInterval: x < 6000 ? [4400, 4800] : [7200, 7600],
  nominal200WideMemberFootprint: [x - 100, x + 100],
  maxSymmetricWidthInsideCommonIntervalMm: x < 6000 ? 2 * Math.min(x - 4400, 4800 - x) : 2 * Math.min(x - 7200, 7600 - x)
}))
const archEnvelopes = [0, 150, 200, 250, 300, 400, 600, 1200].map(rise => ({
  riseMm: rise, springingMm: 2850, crownIntradosMm: 2850 + rise,
  distanceToCeiling3100Mm: 3100 - 2850 - rise,
  distanceToSeat3130Mm: 3130 - 2850 - rise,
  distanceToFraming3170Mm: 3170 - 2850 - rise,
  meaning: 'Residual above intrados, before arch-ring depth, bearing/spandrel and tolerance. No ring or capacity selected.'
}))
const rearDivider = [6000, 7400].map(x => ({
  x, lowerCourtDoorConflict: x > 4800 && x < 7200,
  rearGardenDoorConflict: x > 4800 && x < 7200,
  upperCourtWindowConflictAt245: [[4650, 5650], [6350, 7350]].some(([a, b]) => overlapLen([x - 122.5, x + 122.5], [a, b]) > 0),
  wallFacesAt245: [x - 122.5, x + 122.5],
  clearWestRoomWidthMmAt245: x - 122.5 - d.envelope,
  clearEastRoomWidthMmAt245: d.shell - d.envelope - x - 122.5,
  fullWingFloorWallFootprintM2At245: round(0.245 * 3.415),
  shiftedCourtNorthRightWindowTrial: x === 7400 ? { interval: [6200, 7200], centre: 6700, oldCentre: 6850, shiftMm: -150, gapTo245WallFaceMm: 77.5, oppositeOuterFacadeGapMm: 77.5 } : null
}))

// A front-west L-room test: retain the main wall at y2650 east of x2817.5;
// extend the western portion north. This is a family of explicit proposals,
// not an adoption. A 2700 depth is a1500 bed plus two600 diagnostic fields.
const frontL = [170, 220, 245].flatMap(t => [600, 900, 1100].map(arrival => {
  const targetBedBayDepth = 2700
  const innerNorth = d.envelope + targetBedBayDepth
  const outerNorth = innerNorth + t
  const stairSouth = outerNorth + arrival
  const stairNorth = stairSouth + d.stair.length
  return {
    finishedWallMm: t, targetBedBayDepthMm: targetBedBayDepth,
    northWallCentreY: innerNorth + t / 2, northWallNorthFaceY: outerNorth,
    arrivalBandMm: arrival, originalArrivalBandMm: 1120,
    proposedStairSouthY: stairSouth, stairShiftNorthMm: stairSouth - d.stair.y,
    proposedStairNorthY: stairNorth,
    westRearRoomClearDepthIfRearWallFollowsMm: d.shell - d.envelope - stairNorth - t,
    centralRearRoomClearDepthUnaffectedMm: 3415,
    retainedGalleryAtLVerticalReturnMm: 3832.5 - (2817.5 + t / 2),
    note: 'The L re-entrant corner, actual bed/headboard/door/guard actions and rear sanitary layout still require a joint path/section study. Bare600 fields are diagnostics, not a universal minimum.'
  }
}))

const result = {
  status: 'Source-bound control and declared comparisons; no adopted geometry, capacity or statutory acceptance',
  source,
  sourceInventory: { partitions: d.partitions, rooms: d.rooms, furniture: d.furniture, services: d.services, wetFit: d.wetFit, openings: { GROUND: revisionOpenings('GROUND'), FIRST: revisionOpenings('FIRST') } },
  sourceDimensions: { shell: d.shell, court: d.court, envelope: d.envelope, partition: d.partition, stair: d.stair, entryVoid, floor: d.floor, levels: d.levels },
  spanGeometry: {
    ordinaryClearBandMm: 3415,
    sourceInnerLeafFaceGapMm: 3445,
    source140InnerLeafCentrelineDistanceMm: 3585,
    explanation: 'For the nominal102.5 weather+160 cavity+140 inner+15 finish, outer-south inner leaf is y262.5–402.5 and court-south inner leaf y3847.5–3987.5. Their inner structural faces are3445 apart; centres3585. Bearing/effective span remains unselected. Corner plates are not four independent3415 strips.'
  },
  alignment, alignmentTotals: totals, areaRows, clearances, envelopeSensitivity,
  entrance: { sourceVoidSideLines: [4862.5, 7137.5], lowerCourtDoor: [4800, 7200], sideLineDistanceInsideJambMm: 62.5, serviceCrossingY: 3300, offsetFrame, archEnvelopes },
  rearDivider,
  frontL
}
const output = resolve(out, 'house-source.json')
const serialized = JSON.stringify(result, null, 2) + '\n'
if (process.argv.includes('--check')) {
  if (readFileSync(output, 'utf8') !== serialized) throw new Error('Retained house-source.json differs; inspect and regenerate')
} else writeFileSync(output, serialized)
console.log(JSON.stringify({ source: source.head, alignmentTotals: totals, areaRows: areaRows.map(({ roomPlanningAreasM2, ...r }) => r), envelopeSensitivity, clearances, frontL }, null, 2))
