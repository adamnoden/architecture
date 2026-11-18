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
  readonly closure?: {
    readonly notchLapMm: number
    readonly collarSealLandMm: number
    readonly collarOutsideDiameterMm: number
    readonly wallReturnDepthMm: number
    readonly profile?: 'rounded-taper'
    readonly fillerAndCollarClear?: boolean
    readonly taperDetached?: boolean
    readonly taperToeReliefMm?: number
  }
}
type Bounds = readonly [number, number]
type PlanPoint = readonly [number, number]
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

function taperAwareProfile(
  plan: readonly PlanPoint[], envelope: Footprint, centre: PlanPoint, radiusMm: number, settingMm: number,
  toeReliefMm: number, neighbors: ReturnType<typeof sourceDraw>['calculation']['wetBox']['utilityClosureNeighbors'], accessMm: number,
) {
  const sloped = plan.flatMap(([x, y], index) => {
    const next = plan[(index + 1) % plan.length]
    if (x === next[0] || y === next[1]) return []
    const here = [x, y] as const
    return [y < next[1] ? [here, next] as const : [next, here] as const]
  })
  if (sloped.length !== 1) throw new Error('The rounded cover requires one bound straight Utility taper')
  const [heel, boundToe] = sloped[0]
  if (toeReliefMm >= boundToe[0] - heel[0]) throw new Error('Utility taper toe relief must retain a positive taper slope')
  const toe = [boundToe[0] - toeReliefMm, boundToe[1]] as const
  const dx = toe[0] - heel[0]
  const dy = toe[1] - heel[1]
  const length = Math.hypot(dx, dy)
  const [back, front] = envelope.y
  if (dx <= 0 || back < heel[1] || front > toe[1]) throw new Error('The Utility taper no longer bounds the full cover length')
  const [west, east] = envelope.x
  const signedDistance = ([x, y]: PlanPoint) => (dy * (x - heel[0]) - dx * (y - heel[1])) / length
  const westAt = (y: number) => Math.max(west, heel[0] + ((y - heel[1]) * dx + settingMm * length) / dy)
  const knee = heel[1] + ((west - heel[0]) * dy - settingMm * length) / dx
  if (westAt(front) >= east) throw new Error('The available Utility taper does not leave a remaining cover')
  const outline: PlanPoint[] = [[westAt(back), back], [east, back], [east, front], [westAt(front), front]]
  if (knee > back && knee < front) outline.push([west, knee])
  const distanceMm = signedDistance(centre)
  const baffle = neighbors?.baffle
  const purge = neighbors?.purge
  if (!baffle || !purge || ![...baffle.x, ...baffle.y, ...purge.body, purge.bodyRadiusMM].every(Number.isFinite) ||
      purge.bodyRadiusMM <= 0 || baffle.y[0] < heel[1] || baffle.y[1] > toe[1] || baffle.y[1] <= baffle.y[0]) {
    throw new Error('The taper relief requires a bound Utility purge stance and baffle within the taper')
  }
  const rx = centre[0] - heel[0]
  const ry = centre[1] - heel[1]
  if (rx <= 0 || ry <= 0 || ry >= dy) throw new Error('The Utility riser no longer lies east of the screened taper heel and within its run')
  const radiusWithSetting = radiusMm + settingMm
  // The centre offset to a taper at angle theta from +Y is rx cos(theta) - ry sin(theta).
  const requiredReliefMm = radiusWithSetting >= rx ? null : Math.max(0, boundToe[0] - heel[0] - dy *
    Math.tan(Math.acos(radiusWithSetting / Math.hypot(rx, ry)) - Math.atan2(ry, rx)))
  const baffleRun = baffle.y[1] - heel[1]
  const baffleWestAllowance = baffle.x[0] - heel[0] - settingMm
  const px = purge.body[0] - heel[0]
  const py = purge.body[1] - heel[1]
  const foot = Math.max(0, Math.min(1, (px * dx + py * dy) / (length * length)))
  const relief = {
    heelMm: heel, boundToeMm: boundToe, trialToeMm: toe,
    minimumToeReliefForSelectedFillerMm: requiredReliefMm === null ? null : round(requiredReliefMm),
    minimumToeReliefForBaffleMm: baffleWestAllowance <= 0 ? null :
      round(Math.max(0, boundToe[0] - heel[0] - dy * baffleWestAllowance / baffleRun)),
    purgeBodyReserveAfterAccessSettingMm: round(Math.hypot(px - foot * dx, py - foot * dy) - purge.bodyRadiusMM - accessMm),
    baffleWestReserveAfterFabricationSettingMm: round(baffleWestAllowance - baffleRun * dx / dy),
  }
  return {
    outline, relief,
    westFrontTrimMm: round(westAt(front) - west),
    coverSideAfterSettingMm: round(Math.min(...outline.map(signedDistance)) - settingMm),
    centreToTaperMm: round(distanceMm),
    fillerToTaperAfterSettingMm: round(distanceMm - radiusMm - settingMm),
  }
}

function closedCoverComparison(
  trial: CoverCase, baseline: ReturnType<typeof sourceDraw>['calculation'], envelope: Footprint, throatEndMm: number,
) {
  const { roofStrip, wetBox, dryBreak, settingsMm: { fabrication } } = baseline
  const closure = Object.hasOwn(trial, 'closure') ? trial.closure : {
    notchLapMm: 10, collarSealLandMm: 4, collarOutsideDiameterMm: roofStrip.boundSplitCollarOutsideDiameterMm,
    wallReturnDepthMm: 12,
  }
  const keys = ['notchLapMm', 'collarSealLandMm', 'collarOutsideDiameterMm', 'wallReturnDepthMm'] as const
  const optional = ['profile', 'fillerAndCollarClear', 'taperDetached', 'taperToeReliefMm']
  if (!closure || typeof closure !== 'object' || Array.isArray(closure) ||
      Object.keys(closure).some(key => !(keys as readonly string[]).includes(key) && !optional.includes(key)) ||
      keys.some(key => !Object.hasOwn(closure, key) || !Number.isFinite(closure[key]) || closure[key] <= 0 ||
        closure[key] > wetBox.sideLimitsXMm[1] - wetBox.sideLimitsXMm[0])) {
    throw new Error('Expected finite positive south inlet closure comparison dimensions')
  }
  const { notchLapMm, collarSealLandMm, collarOutsideDiameterMm, wallReturnDepthMm, profile, fillerAndCollarClear, taperDetached, taperToeReliefMm } = closure
  const rounded = profile === 'rounded-taper'
  if ((Object.hasOwn(closure, 'profile') || Object.hasOwn(closure, 'fillerAndCollarClear') || Object.hasOwn(closure, 'taperDetached') || Object.hasOwn(closure, 'taperToeReliefMm')) &&
      (!rounded || trial.branch !== 'utility' || typeof fillerAndCollarClear !== 'boolean' || typeof taperDetached !== 'boolean')) {
    throw new Error('Expected a rounded Utility taper profile and explicit release states')
  }
  const checksRelief = Object.hasOwn(closure, 'taperToeReliefMm')
  if (checksRelief && (typeof taperToeReliefMm !== 'number' || !Number.isFinite(taperToeReliefMm) || taperToeReliefMm < 0)) {
    throw new Error('Expected a finite non-negative Utility taper toe relief')
  }
  const { planMm, innerVentAxisMm, formedVentDiameterMm, utilityClosureNeighbors } = wetBox
  const [back, front] = envelope.y
  const xLimitsAt = (y: number): Bounds => {
    const x = planMm.flatMap(([x0, y0], i) => {
      const [x1, y1] = planMm[(i + 1) % planMm.length]
      if (y < Math.min(y0, y1) || y > Math.max(y0, y1)) return []
      return y0 === y1 ? [x0, x1] : [x0 + (y - y0) * (x1 - x0) / (y1 - y0)]
    })
    if (x.length < 2) throw new Error('The installed cover no longer has a bound cell plan section')
    return [Math.min(...x), Math.max(...x)]
  }
  const yStations = [back, ...planMm.map(([, y]) => y).filter(y => y > back && y < front), front]
  const plantOrUtilitySideFit = Math.min(...yStations.map(y => clearInside(xLimitsAt(y), envelope.x)))
  const filler: Footprint = {
    x: [roofStrip.xMm[0] - notchLapMm, roofStrip.xMm[1] + notchLapMm],
    y: [back - notchLapMm, throatEndMm + notchLapMm],
  }
  const formedNotchRadiusMm = roofStrip.widthMm / 2
  const fillerRadiusMm = formedNotchRadiusMm + notchLapMm
  const centre = [dryBreak.xMm, dryBreak.yMm] as const
  const shaped = rounded ? taperAwareProfile(planMm, envelope, centre, fillerRadiusMm, fabrication,
    taperToeReliefMm ?? 0, utilityClosureNeighbors, baseline.settingsMm.access) : null
  const collarRadius = collarOutsideDiameterMm / 2
  const collar: Footprint = {
    x: [dryBreak.xMm - collarRadius, dryBreak.xMm + collarRadius],
    y: [dryBreak.yMm - collarRadius, dryBreak.yMm + collarRadius],
  }
  const clearance = {
    installedCoverToCellSideAfterSettingMm: shaped
      ? Math.min(shaped.coverSideAfterSettingMm, wetBox.sideLimitsXMm[1] - envelope.x[1] - fabrication)
      : round(plantOrUtilitySideFit - fabrication),
    fillerSideLapBackingAfterSettingMm: round(trial.cheekMm - notchLapMm - fabrication),
    fillerRearLapBackingAfterSettingMm: round(filler.y[0] - innerVentAxisMm[1] - fabrication),
    fillerFrontLapBackingAfterSettingMm: round(front - filler.y[1] - trial.minimumFrontBridgeMm - fabrication),
    collarRadialSealLandAfterSettingMm: round(collarRadius - roofStrip.jacketOutsideDiameterMm / 2 - fabrication),
    collarInsideFillerAfterSettingMm: round(Math.min(clearInside(filler.x, collar.x), clearInside(filler.y, collar.y)) - fabrication),
    formedVentBelowWallReturnAfterSettingMm: round(roofStrip.zMm - innerVentAxisMm[2] -
      formedVentDiameterMm / 2 - wallReturnDepthMm - fabrication),
  }
  const diagnostics = ([
    ['RECTANGULAR_COVER_EXCEEDS_INSTALLED_CELL_PLAN', clearance.installedCoverToCellSideAfterSettingMm < 0],
    ['FILLER_LAP_HAS_INSUFFICIENT_BACKING', Math.min(clearance.fillerSideLapBackingAfterSettingMm,
      clearance.fillerRearLapBackingAfterSettingMm, clearance.fillerFrontLapBackingAfterSettingMm) < 0],
    ['ROUND_FILLER_INTERSECTS_TAPER', shaped !== null && shaped.fillerToTaperAfterSettingMm < 0],
    ['TAPER_RELIEF_INTERSECTS_PURGE_STANCE', checksRelief && shaped !== null && shaped.relief.purgeBodyReserveAfterAccessSettingMm < 0],
    ['TAPER_RELIEF_INTERSECTS_BAFFLE', checksRelief && shaped !== null && shaped.relief.baffleWestReserveAfterFabricationSettingMm < 0],
    ['COLLAR_RADIAL_SEAL_LAND_SHORT', clearance.collarRadialSealLandAfterSettingMm < collarSealLandMm],
    ['COLLAR_EXCEEDS_FILLER', clearance.collarInsideFillerAfterSettingMm < 0],
    ['WALL_RETURN_INTERCEPTS_FORMED_VENT', clearance.formedVentBelowWallReturnAfterSettingMm < 0],
  ] as const).filter(([, failed]) => failed).map(([code]) => code)
  return {
    status: diagnostics.length ? 'blocked' as const : 'within-conditional-closure-fit' as const,
    inputs: closure, clearance, diagnostics, filler, collar,
    roundedTaper: shaped && {
      ...shaped, centre, formedNotchRadiusMm, fillerRadiusMm,
      maximumConcentricLapAfterSettingMm: round(shaped.fillerToTaperAfterSettingMm + notchLapMm),
      minimumConcentricLapForCollarMm: round(collarRadius + fabrication - formedNotchRadiusMm),
    },
    splitFillerReleaseQualified: false, wetClosureQualified: false,
  }
}

function coverPlan(branch: CoverCase['branch'], positions: Readonly<Record<string, readonly Footprint[]>>,
  caseDigest: string, rounded?: NonNullable<ReturnType<typeof closedCoverComparison>['roundedTaper']>): DrawingSceneV2 {
  const items = Object.values(positions).flat()
  const taper = rounded ? [rounded.relief.heelMm, rounded.relief.boundToeMm, rounded.relief.trialToeMm] : []
  const west = Math.min(...items.map(item => item.x[0]), ...taper.map(([x]) => x))
  const east = Math.max(...items.map(item => item.x[1]))
  const south = Math.min(...items.map(item => item.y[0]), ...taper.map(([, y]) => y))
  const north = Math.max(...items.map(item => item.y[1]), ...taper.map(([, y]) => y))
  const modelBounds = { x: west, y: south, width: east - west, height: north - south }
  const scaleDenominator = 10
  const project = createPlanPaperProjection({ scaleDenominator, modelBounds, paperOrigin: { x: 12, y: 12 } })
  const primitives: DrawingSceneV2['primitives'] = Object.entries(positions).flatMap(([stage, boxes]) => boxes.map((box, i) => ({
    id: stage + '-' + i, kind: 'rect' as const, stroke: stage === 'first-rest' ? 'primary' as const : 'secondary' as const,
    ...project.rect({ x: box.x[0], y: box.y[0], width: box.x[1] - box.x[0], height: box.y[1] - box.y[0] }),
    metadata: { caseDigest, xMinMm: box.x[0], xMaxMm: box.x[1], yMinMm: box.y[0], yMaxMm: box.y[1] },
  })))
  if (rounded) {
    const addLine = (id: string, from: PlanPoint, to: PlanPoint) => primitives.push({
      id, kind: 'line', role: 'primary',
      a: project.point(...from), b: project.point(...to),
      metadata: { caseDigest, fromXMm: from[0], fromYMm: from[1], toXMm: to[0], toYMm: to[1] },
    })
    rounded.outline.forEach((from, index) => addLine('rounded-outer-closed-' + index, from,
      rounded.outline[(index + 1) % rounded.outline.length]))
    const { heelMm, boundToeMm, trialToeMm } = rounded.relief
    addLine('utility-taper-bound', heelMm, boundToeMm)
    if (trialToeMm[0] !== boundToeMm[0]) addLine('utility-taper-relief-trial', heelMm, trialToeMm)
    const [cx, cy] = rounded.centre
    const radius = rounded.formedNotchRadiusMm
    const arcSegments = 16
    const arcPoint = (index: number): PlanPoint => {
      const angle = index * Math.PI / arcSegments
      return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]
    }
    for (let index = 0; index < arcSegments; index++) addLine('rounded-notch-arc-' + index, arcPoint(index), arcPoint(index + 1))
    const yBack = positions['closed-envelope'][0].y[0]
    addLine('rounded-notch-west', [cx - radius, cy], [cx - radius, yBack])
    addLine('rounded-notch-east', [cx + radius, cy], [cx + radius, yBack])
  }
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
  if (trial.schema !== 'had-inlet-cover-case/1' || fields.some(key => !Object.hasOwn(trial, key)) ||
      Object.keys(trial).some(key => key !== 'closure' && !fields.includes(key))) throw new Error('Expected a versioned south inlet cover case')
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
  const installedClosure = closedCoverComparison(trial, baseline, envelope, throatEnd)
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
  const shapedReleaseDiagnostics = installedClosure.roundedTaper ? [
    ...(trial.closure?.fillerAndCollarClear ? [] : ['FILLER_AND_COLLAR_REMAIN_ENGAGED']),
    ...(trial.closure?.taperDetached ? [] : ['UTILITY_TAPER_REMAINS_ATTACHED']),
    ...diagnostics.map(({ code }) => code),
  ] : null
  const roundedRelease = shapedReleaseDiagnostics && {
    status: shapedReleaseDiagnostics.length ? 'blocked' as const : 'within-declared-rounded-release-screen' as const,
    assembledCandidateStatus: installedClosure.status === 'blocked' || shapedReleaseDiagnostics.length
      ? 'blocked' as const : 'within-conditional-fit-and-withdrawal' as const,
    diagnostics: shapedReleaseDiagnostics,
    axialStrokeToClearRiserMm: clearStationaryRiserMm,
    axialStrokeBeforeSideTransferMm: beyondFrontToTurnMm,
    splitFillerWithdrawalQualified: false,
    captureQualified: false,
  }
  const caseDigest = sha256SemanticFingerprint(trial)
  return {
    schema: 'had-inlet-cover-result/1' as const, branch: trial.branch,
    status: diagnostics.length ? 'blocked' as const : 'within-conditional-cover-screen' as const,
    source: { ...source, removalCaseDigest: source.caseDigest, caseDigest, method: 'HAD-SOUTH-INLET-COVER/1',
      gitBlob: resolved.disciplineBindings.find(binding => binding.id === 'had-inlet-south-removal')!
        .identities['compiler/reference-house/current-design/inlet-cover.ts'], carrierMethod: method.id },
    calculation, diagnostics, installedClosure, roundedRelease,
    drawing: coverPlan(trial.branch, { ...(installedClosure.roundedTaper ? { 'closed-envelope': [envelope] } : { closed }),
      'installed-filler-reservation': [installedClosure.filler],
      'installed-collar-reservation': [installedClosure.collar], 'after-axial-release': closed.map(item => offset(item, 0, axial)),
      'first-rest': parkedPanels, 'receiver-bearing': rails, 'carrier-corridor': [carrier], washer: [washerBox] }, caseDigest, installedClosure.roundedTaper ?? undefined),
    evidence: {
      wetClosure: 'unqualified', receiverAnchorageAndPositiveCapture: 'unqualified',
      coverThicknessSealsLatchAndTools: 'unqualified', heldCaptureThroughTransfer: 'unqualified',
    },
  }
}
