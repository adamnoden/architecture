import { sha256SemanticFingerprint } from '../../core/identity.js'
import { createPlanPaperProjection } from '../../publication-drawing/projection.js'
import type { DrawingSceneV2 } from '../../publication-drawing-v2/model.js'
import { readInletRemovalCases, runInletRemovalCase } from './inlet-removal.js'
import type { CurrentDesignResolution } from './resolve.js'

type Removal = ReturnType<typeof readInletRemovalCases>[number]['removal']
type CoverCase = {
  readonly schema: 'had-inlet-cover-case/1'
  readonly branch: Removal['branch']
  readonly removalCaseDigest: string
  readonly washer: Removal['washer']
  readonly cheekMm: number
  readonly retainedSideLandMm: number
  readonly receiverRailWidthMm: number
  readonly minimumFrontBridgeMm: number
  readonly axialTravelMm: number
  readonly sideTravelMm: number
}
type Bounds = readonly [number, number]
type Footprint = { readonly x: Bounds; readonly y: Bounds }

const sourceDraw = (resolved: CurrentDesignResolution, removal: Removal) =>
  runInletRemovalCase(resolved, { ...removal, roofAccess: 'clear-strip-comparison' })

function reference(resolved: CurrentDesignResolution, removal: Removal) {
  const { calculation, source } = sourceDraw(resolved, removal)
  const { roofStrip, settingsMm } = calculation
  const cheekMm = 20
  const width = roofStrip.widthMm
  const axialTravelMm = roofStrip.lengthMm + settingsMm.fabrication
  const acrossCarrier = width + cheekMm + settingsMm.fabrication
  const baseline: CoverCase = {
    schema: 'had-inlet-cover-case/1', branch: removal.branch, removalCaseDigest: source.caseDigest,
    washer: removal.washer, cheekMm, retainedSideLandMm: 20, receiverRailWidthMm: 8, minimumFrontBridgeMm: 20,
    axialTravelMm, sideTravelMm: removal.branch === 'utility' ? -acrossCarrier : acrossCarrier,
  }
  return baseline
}

export function readInletCoverCases(resolved: CurrentDesignResolution) {
  return readInletRemovalCases(resolved).map(({ removal }) => ({
    schema: 'had-inlet-cover-request/1' as const, design: resolved.design, cover: reference(resolved, removal),
  }))
}

const round = (value: number) => Number(value.toFixed(4))
const offset = ({ x, y }: Footprint, dx: number, dy: number): Footprint => ({
  x: [x[0] + dx, x[1] + dx], y: [y[0] + dy, y[1] + dy],
})
const clearInside = ([lo, hi]: Bounds, [innerLo, innerHi]: Bounds) => Math.min(innerLo - lo, hi - innerHi)
const intervalGap = (first: Bounds, second: Bounds) => Math.max(first[0] - second[1], second[0] - first[1])

function coverPlan(branch: CoverCase['branch'], positions: Readonly<Record<string, readonly Footprint[]>>,
  caseDigest: string): DrawingSceneV2 {
  const items = Object.values(positions).flat()
  const west = Math.min(...items.map(item => item.x[0]))
  const east = Math.max(...items.map(item => item.x[1]))
  const south = Math.min(...items.map(item => item.y[0]))
  const north = Math.max(...items.map(item => item.y[1]))
  const modelBounds = { x: west, y: south, width: east - west, height: north - south }
  const scaleDenominator = 10
  const project = createPlanPaperProjection({ scaleDenominator, modelBounds, paperOrigin: { x: 12, y: 12 } })
  const primitives: DrawingSceneV2['primitives'] = Object.entries(positions).flatMap(([stage, boxes]) => boxes.map((box, i) => ({
    id: stage + '-' + i, kind: 'rect' as const, stroke: stage === 'first-rest' ? 'primary' as const : 'secondary' as const,
    ...project.rect({ x: box.x[0], y: box.y[0], width: box.x[1] - box.x[0], height: box.y[1] - box.y[0] }),
    metadata: { caseDigest, xMinMm: box.x[0], xMaxMm: box.x[1], yMinMm: box.y[0], yMaxMm: box.y[1] },
  })))
  return {
    viewId: 'HAD-SOUTH-INLET-COVER-' + branch.toUpperCase(), sourceId: 'south-inlet-' + branch,
    title: 'South inlet upper cover and first rest',
    description: 'Roof-plane plan of the U-notched cover, its axial release and side first rest, fixed bearing bands and the complete carrier path.',
    scaleDenominator, widthMm: 24 + project.length(modelBounds.width), heightMm: 24 + project.length(modelBounds.height), primitives,
  }
}

export function runInletCoverCase(resolved: CurrentDesignResolution, input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Expected a versioned south inlet cover case')
  const trial = input as CoverCase
  const removal = readInletRemovalCases(resolved).find(row => row.removal.branch === trial.branch)?.removal
  if (!removal) throw new Error('Expected a south inlet cover case for one bound branch')
  const { calculation: baseline, source, method } = sourceDraw(resolved, removal)
  const fields = ['schema', 'branch', 'removalCaseDigest', 'washer', 'cheekMm', 'retainedSideLandMm', 'receiverRailWidthMm',
    'minimumFrontBridgeMm', 'axialTravelMm', 'sideTravelMm']
  if (trial.schema !== 'had-inlet-cover-case/1' || Object.keys(trial).length !== fields.length ||
      fields.some(key => !Object.hasOwn(trial, key))) throw new Error('Expected a versioned south inlet cover case')
  if (trial.removalCaseDigest !== source.caseDigest) throw new Error('Stale south inlet cover source binding')
  const [cellWest, cellEast] = baseline.wetBox.sideLimitsXMm
  const cellWidthMm = cellEast - cellWest
  if ((trial.washer !== 'installed' && trial.washer !== 'restrained-first-rest') ||
      ![trial.cheekMm, trial.retainedSideLandMm, trial.receiverRailWidthMm, trial.minimumFrontBridgeMm].every(n =>
        Number.isFinite(n) && n > 0 && n <= cellWidthMm) ||
      !Number.isFinite(trial.sideTravelMm) || Math.abs(trial.sideTravelMm) > resolved.design.envelope.widthMm ||
      !Number.isFinite(trial.axialTravelMm) ||
      trial.axialTravelMm < 0 || trial.axialTravelMm > baseline.drawMm) throw new Error('South inlet cover inputs exceed the screened motion range')
  const { roofStrip, wetBox, dryBreak, settingsMm, drawMm } = baseline
  const washer = trial.washer === removal.washer ? baseline.washerEnvelopeMm :
    sourceDraw(resolved, { ...removal, washer: trial.washer }).calculation.washerEnvelopeMm
  const utility = resolved.design.storeys.GROUND.rooms.find(room => room.id === 'GROUND/G-UTILITY')
  if (utility?.boxes.length !== 1) throw new Error('The cover path requires the bound rectangular ground Utility')
  const [room] = utility.boxes
  const { axialTravelMm: axial, sideTravelMm: side, cheekMm: cheek, receiverRailWidthMm: rail } = trial
  const { fabrication, access } = settingsMm
  const [slotLeft, slotRight] = roofStrip.xMm
  const [back, front] = roofStrip.yMm
  const half = roofStrip.widthMm / 2
  const throatEnd = dryBreak.yMm + half
  const envelope = { x: [slotLeft - cheek, slotRight + cheek], y: roofStrip.yMm } as const
  const closed: readonly Footprint[] = [
    { x: [envelope.x[0], slotLeft], y: envelope.y },
    { x: [slotRight, envelope.x[1]], y: envelope.y },
    { x: roofStrip.xMm, y: [throatEnd, front] },
  ]
  const turned = offset(envelope, 0, axial)
  const parked = offset(envelope, side, axial)
  const parkedPanels = closed.map(footprint => offset(footprint, side, axial))
  const rails = parkedPanels.slice(0, 2).map(({ x, y }) => {
    const centre = (x[0] + x[1]) / 2
    return { x: [centre - rail / 2, centre + rail / 2] as Bounds, y }
  })
  const carrier = { x: roofStrip.xMm, y: [dryBreak.yMm - half, dryBreak.yMm + drawMm + half] } as const
  const firstCarrierContact = parkedPanels.flatMap(({ x, y }) => {
    const dx = Math.max(x[0] - dryBreak.xMm, dryBreak.xMm - x[1], 0)
    if (dx >= half) return []
    const available = y[0] - Math.sqrt(half * half - dx * dx) - dryBreak.yMm
    return available < drawMm ? [round(Math.max(0, available))] : []
  })
  const washerBox = { x: [washer[0], washer[0] + washer[3]], y: [washer[1], washer[1] + washer[4]] } as const
  const washerInPath = intervalGap(envelope.x, washerBox.x) < access && roofStrip.zMm >= washer[2] && roofStrip.zMm <= washer[2] + washer[5]
  const clearStationaryRiserMm = dryBreak.yMm + half - back
  const beyondFrontToTurnMm = wetBox.frontYMm - back + fabrication
  const washerAxialAvailableMm = washerInPath ? washer[1] - front - access : null
  const calculation = {
    roofDatumZMm: roofStrip.zMm, authoredFrontBridgeMm: trial.minimumFrontBridgeMm, frontBridgeAvailableMm: front - throatEnd,
    sideLandReserveMm: clearInside(wetBox.sideLimitsXMm, envelope.x) - trial.retainedSideLandMm,
    receiverBearingReserveMm: (cheek - rail) / 2 - fabrication,
    clearStationaryRiserMm, beyondFrontToTurnMm, washerAxialAvailableMm,
    washerTravelReserveMm: washerAxialAvailableMm === null ? null : washerAxialAvailableMm - axial,
    turnReserveMm: axial - beyondFrontToTurnMm,
    parkedCarrierClearanceMm: intervalGap(parked.x, carrier.x),
    carrierTravelToContactMm: firstCarrierContact.length ? Math.min(...firstCarrierContact) : null,
    parkedRoomReserveMm: Math.min(clearInside([room.x, room.x + room.width], parked.x),
      clearInside([room.y, room.y + room.depth], parked.y), clearInside([room.x, room.x + room.width], turned.x)) - access,
    firstRest: { boundsMm: parked, bearingBandsMm: rails, captureQualified: false },
  }
  const diagnostics = ([
    ['SIDE_LAND_OVERBOOKED', calculation.sideLandReserveMm < 0],
    ['FRONT_BRIDGE_TOO_SHORT', calculation.frontBridgeAvailableMm < trial.minimumFrontBridgeMm],
    ['RECEIVER_BEARING_OVERBOOKED', calculation.receiverBearingReserveMm < 0],
    ['RISER_STILL_ENGAGED', axial < clearStationaryRiserMm],
    ['TURN_CROSSES_RETAINED_FRONT', side !== 0 && calculation.turnReserveMm < 0],
    ['WASHER_OBSTRUCTS_AXIAL_RELEASE', washerAxialAvailableMm !== null && axial > washerAxialAvailableMm],
    ['FIRST_REST_OVERLAPS_CARRIER_CORRIDOR', calculation.parkedCarrierClearanceMm < fabrication],
    ['FIRST_REST_EXCEEDS_UTILITY_ROOM', calculation.parkedRoomReserveMm < 0],
  ] as const).flatMap(([code, blocked]) => blocked ? [{ code, objectId: 'south-inlet-' + trial.branch }] : [])
  const caseDigest = sha256SemanticFingerprint(trial)
  return {
    schema: 'had-inlet-cover-result/1' as const, branch: trial.branch,
    status: diagnostics.length ? 'blocked' as const : 'within-conditional-cover-screen' as const,
    source: { ...source, removalCaseDigest: source.caseDigest, caseDigest, method: 'HAD-SOUTH-INLET-COVER/1',
      gitBlob: resolved.disciplineBindings.find(binding => binding.id === 'had-inlet-south-removal')!
        .identities['compiler/reference-house/current-design/inlet-cover.ts'], carrierMethod: method.id },
    calculation, diagnostics,
    drawing: coverPlan(trial.branch, { closed, 'after-axial-release': closed.map(item => offset(item, 0, axial)),
      'first-rest': parkedPanels, 'receiver-bearing': rails, 'carrier-corridor': [carrier], washer: [washerBox] }, caseDigest),
    evidence: {
      wetClosure: 'unqualified', receiverAnchorageAndPositiveCapture: 'unqualified',
      coverThicknessSealsLatchAndTools: 'unqualified', heldCaptureThroughTransfer: 'unqualified',
    },
  }
}
