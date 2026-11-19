import { sha256SemanticFingerprint } from '../../core/identity.js'
import { createPlanPaperProjection } from '../../publication-drawing/projection.js'
import type { DrawingSceneV2 } from '../../publication-drawing-v2/model.js'
import { readInletRemovalCases, runInletRemovalCase } from './inlet-removal.js'
import type { CurrentDesignResolution } from './resolve.js'

type Removal = ReturnType<typeof readInletRemovalCases>[number]['removal']
export type InletCoverSources = {
  readonly insertCase?: unknown
  readonly removalCases?: readonly unknown[]
}
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
    readonly minimumReceiverContactMm?: number
    readonly minimumTaperReservesMm?: TaperReserves
    readonly frontReceiver?: { readonly widthMm: number; readonly edgeInsetMm: number }
  }
}
const taperInterfaces = ['filler', 'baffle', 'purge'] as const
type TaperReserves = Readonly<Record<typeof taperInterfaces[number], number>>
type Bounds = readonly [number, number]
type PlanPoint = readonly [number, number]
type Footprint = { readonly x: Bounds; readonly y: Bounds }

function sourceDraw(resolved: CurrentDesignResolution, removal: Removal, sources?: InletCoverSources) {
  const explicitRemoval = sources?.removalCases?.some(input => input !== null && typeof input === 'object'
    && 'branch' in input && input.branch === removal.branch)
  const selected = explicitRemoval ? removal : { ...removal, roofAccess: 'clear-strip-comparison' as const }
  return runInletRemovalCase(resolved, selected, sources?.insertCase)
}

function sourceRemovals(resolved: CurrentDesignResolution, sources?: InletCoverSources) {
  if (sources !== undefined && (!sources || typeof sources !== 'object' || Array.isArray(sources)
      || Object.keys(sources).some(key => key !== 'insertCase' && key !== 'removalCases')
      || (sources.removalCases !== undefined && !Array.isArray(sources.removalCases)))) {
    throw new Error('Expected explicit inlet cover insert and removal source cases')
  }
  const defaults = readInletRemovalCases(resolved, sources?.insertCase).map(({ removal }) => removal)
  const selected = new Map<string, Removal>()
  for (const input of sources?.removalCases ?? []) {
    const result = runInletRemovalCase(resolved, input, sources?.insertCase)
    if (selected.has(result.branch)) throw new Error('A cover source cannot select the same removal branch twice')
    selected.set(result.branch, input as Removal)
  }
  return sources?.removalCases === undefined ? defaults : [...selected.values()]
}

function reference(resolved: CurrentDesignResolution, removal: Removal, sources?: InletCoverSources) {
  const { calculation, source } = sourceDraw(resolved, removal, sources)
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

export function readInletCoverCases(resolved: CurrentDesignResolution, sources?: InletCoverSources) {
  return sourceRemovals(resolved, sources).map(removal => ({
    schema: 'had-inlet-cover-request/1' as const, design: resolved.design, cover: reference(resolved, removal, sources),
  }))
}

const round = (value: number) => Number(value.toFixed(4))
const offset = ({ x, y }: Footprint, dx: number, dy: number): Footprint => ({
  x: [x[0] + dx, x[1] + dx], y: [y[0] + dy, y[1] + dy],
})
const clearInside = ([lo, hi]: Bounds, [innerLo, innerHi]: Bounds) => Math.min(innerLo - lo, hi - innerHi)
const intervalGap = (first: Bounds, second: Bounds) => Math.max(first[0] - second[1], second[0] - first[1])

function reserveEnvelope(
  maximumToeReliefMm: number, required: TaperReserves, availableAt: (reliefMm: number) => TaperReserves, trialReliefMm: number,
) {
  const clearAtHeldHeel = availableAt(0)
  const clearAtFlatLimit = availableAt(maximumToeReliefMm)
  const bestIncreasingReserve = ({ filler, baffle }: TaperReserves) => Math.min(filler, baffle)
  const locate = (reached: (reserves: TaperReserves) => boolean) => {
    let low = 0
    let high = maximumToeReliefMm
    for (let index = 0; index < 48; index++) {
      const mid = (low + high) / 2
      if (reached(availableAt(mid))) high = mid
      else low = mid
    }
    return { low, high }
  }

  // Holding the heel fixed makes filler and baffle clearance increase as the
  // toe moves west. Every point of the taper instead approaches the western purge stance.
  const clearsInterior = ({ filler, baffle }: TaperReserves) => filler >= required.filler && baffle >= required.baffle
  const lower = clearsInterior(clearAtHeldHeel) ? 0 :
    clearsInterior(clearAtFlatLimit) ? locate(clearsInterior).high : null
  const upper = clearAtHeldHeel.purge < required.purge ? null :
    clearAtFlatLimit.purge >= required.purge ? maximumToeReliefMm : locate(({ purge }) => purge < required.purge).low

  const purgeGoverns = (reserves: TaperReserves) => bestIncreasingReserve(reserves) >= reserves.purge
  const optimumToe = purgeGoverns(clearAtHeldHeel) ? 0 :
    purgeGoverns(clearAtFlatLimit) ? locate(purgeGoverns).high : maximumToeReliefMm
  const optimum = availableAt(optimumToe)
  const common = Math.min(...taperInterfaces.map(name => optimum[name]))
  const trial = availableAt(trialReliefMm)
  return {
    requiredAfterSettingsMm: required,
    trialMisses: taperInterfaces.filter(name => trial[name] < required[name]),
    toeReliefRangeMm: lower !== null && upper !== null && lower <= upper && lower < maximumToeReliefMm
      ? { minimum: lower, maximum: upper, maximumIncluded: upper < maximumToeReliefMm } : null,
    bestCommonReserve: {
      afterSettingsMm: round(common), toeReliefMm: round(optimumToe), attained: optimumToe < maximumToeReliefMm,
      controllingInterfaces: taperInterfaces.filter(name => Math.abs(optimum[name] - common) < 1e-7),
    },
  }
}

function taperAwareProfile(
  plan: readonly PlanPoint[], envelope: Footprint, centre: PlanPoint, radiusMm: number, settingMm: number,
  toeReliefMm: number, neighbors: ReturnType<typeof sourceDraw>['calculation']['wetBox']['utilityClosureNeighbors'], accessMm: number,
  minimumTaperReservesMm: TaperReserves | undefined,
) {
  const sloped = plan.flatMap(([x, y], index) => {
    const next = plan[(index + 1) % plan.length]
    if (x === next[0] || y === next[1]) return []
    const here = [x, y] as const
    return [y < next[1] ? [here, next] as const : [next, here] as const]
  })
  if (sloped.length !== 1) throw new Error('The rounded cover requires one bound straight Utility taper')
  const [heel, boundToe] = sloped[0]
  const originalDx = boundToe[0] - heel[0]
  if (toeReliefMm >= originalDx) throw new Error('Utility taper toe relief must retain a positive taper slope')
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
  const availableAt = (westwardMm: number): TaperReserves => {
    const runX = originalDx - westwardMm
    const runLength = Math.hypot(runX, dy)
    const foot = Math.max(0, Math.min(1, (px * runX + py * dy) / (runLength * runLength)))
    return {
      filler: (dy * rx - runX * ry) / runLength - radiusWithSetting,
      baffle: baffleWestAllowance - baffleRun * runX / dy,
      purge: Math.hypot(px - foot * runX, py - foot * dy) - purge.bodyRadiusMM - accessMm,
    }
  }
  if (minimumTaperReservesMm && px > 0) throw new Error('The taper reserve interval requires the purge stance west of the heel')
  const available = availableAt(toeReliefMm)
  const relief = {
    heelMm: heel, boundToeMm: boundToe, trialToeMm: toe,
    minimumToeReliefForSelectedFillerMm: requiredReliefMm === null ? null : round(requiredReliefMm),
    minimumToeReliefForBaffleMm: baffleWestAllowance <= 0 ? null :
      round(Math.max(0, boundToe[0] - heel[0] - dy * baffleWestAllowance / baffleRun)),
    purgeBodyReserveAfterAccessSettingMm: round(available.purge),
    baffleWestReserveAfterFabricationSettingMm: round(available.baffle),
    ...(minimumTaperReservesMm ? { reserveEnvelope: reserveEnvelope(originalDx, minimumTaperReservesMm, availableAt, toeReliefMm) } : {}),
  }
  return {
    outline, relief,
    westFrontTrimMm: round(westAt(front) - west),
    coverSideAfterSettingMm: round(Math.min(...outline.map(signedDistance)) - settingMm),
    centreToTaperMm: round(distanceMm),
    fillerToTaperAfterSettingMm: round(available.filler),
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
  const optional = ['profile', 'fillerAndCollarClear', 'taperDetached', 'taperToeReliefMm', 'minimumReceiverContactMm', 'minimumTaperReservesMm', 'frontReceiver']
  if (!closure || typeof closure !== 'object' || Array.isArray(closure) ||
      Object.keys(closure).some(key => !(keys as readonly string[]).includes(key) && !optional.includes(key)) ||
      keys.some(key => !Object.hasOwn(closure, key) || !Number.isFinite(closure[key]) || closure[key] <= 0 ||
        closure[key] > wetBox.sideLimitsXMm[1] - wetBox.sideLimitsXMm[0])) {
    throw new Error('Expected finite positive south inlet closure comparison dimensions')
  }
  const { notchLapMm, collarSealLandMm, collarOutsideDiameterMm, wallReturnDepthMm, profile, fillerAndCollarClear, taperDetached, taperToeReliefMm, minimumReceiverContactMm, minimumTaperReservesMm } = closure
  const rounded = profile === 'rounded-taper'
  if ((Object.hasOwn(closure, 'profile') || Object.hasOwn(closure, 'fillerAndCollarClear') || Object.hasOwn(closure, 'taperDetached') || Object.hasOwn(closure, 'taperToeReliefMm') || Object.hasOwn(closure, 'minimumReceiverContactMm') || Object.hasOwn(closure, 'minimumTaperReservesMm') || Object.hasOwn(closure, 'frontReceiver')) &&
      (!rounded || trial.branch !== 'utility' || typeof fillerAndCollarClear !== 'boolean' || typeof taperDetached !== 'boolean')) {
    throw new Error('Expected a rounded Utility taper profile and explicit release states')
  }
  const checksRelief = Object.hasOwn(closure, 'taperToeReliefMm')
  const checksReserve = Object.hasOwn(closure, 'minimumTaperReservesMm')
  if (checksRelief && (typeof taperToeReliefMm !== 'number' || !Number.isFinite(taperToeReliefMm) || taperToeReliefMm < 0)) {
    throw new Error('Expected a finite non-negative Utility taper toe relief')
  }
  if (Object.hasOwn(closure, 'minimumReceiverContactMm') &&
      (typeof minimumReceiverContactMm !== 'number' || !Number.isFinite(minimumReceiverContactMm) || minimumReceiverContactMm <= 0)) {
    throw new Error('Expected a finite positive Utility minimum receiver contact length')
  }
  if (checksReserve && (!minimumTaperReservesMm || typeof minimumTaperReservesMm !== 'object' ||
      Object.keys(minimumTaperReservesMm).length !== taperInterfaces.length ||
      taperInterfaces.some(name => !Object.hasOwn(minimumTaperReservesMm, name) ||
        !Number.isFinite(minimumTaperReservesMm[name]) || minimumTaperReservesMm[name] < 0))) {
    throw new Error('Expected separate finite non-negative Utility taper reserve requirements')
  }
  if (Object.hasOwn(closure, 'frontReceiver')) {
    const receiver = closure.frontReceiver
    if (!receiver || typeof receiver !== 'object' || Array.isArray(receiver) || Object.keys(receiver).length !== 2 ||
        !Object.hasOwn(receiver, 'widthMm') || !Object.hasOwn(receiver, 'edgeInsetMm') ||
        ![receiver.widthMm, receiver.edgeInsetMm].every(value => Number.isFinite(value) && value > 0 && value <= wetBox.sideLimitsXMm[1] - wetBox.sideLimitsXMm[0])) {
      throw new Error('Expected finite positive Utility front receiver width and edge inset')
    }
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
    taperToeReliefMm ?? 0, utilityClosureNeighbors, baseline.settingsMm.access, minimumTaperReservesMm) : null
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
    ['TAPER_RELIEF_MISSES_DECLARED_RESERVES', (shaped?.relief.reserveEnvelope?.trialMisses.length ?? 0) > 0],
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

type RoundedTaper = NonNullable<ReturnType<typeof closedCoverComparison>['roundedTaper']>

function roundedReceiverContact(taper: RoundedTaper, rails: readonly Footprint[], fabricationMm: number,
  sideMm: number, axialMm: number, rectangularBearingReserveMm: number, minimumContactMm: number | undefined) {
  const { heelMm: [heelX, heelY], trialToeMm: [toeX, toeY] } = taper.relief
  const dx = toeX - heelX
  const dy = toeY - heelY
  const setbackX = fabricationMm * Math.hypot(dx, dy) / dy
  const contact = rails.map((rail, index) => {
    // The padding of either band stays outside the formed notch whenever the rectangular cheek check passes.
    const bandWest = rail.x[0] - sideMm - fabricationMm
    const taperLimitY = heelY + (bandWest - heelX - setbackX) * dy / dx + axialMm
    const contactEnd = Math.min(rail.y[1], taperLimitY)
    const lengthMm = rectangularBearingReserveMm < 0 ? 0 : Math.max(0, contactEnd - rail.y[0])
    return {
      side: index === 0 ? 'west' as const : 'east' as const,
      fullWidthContactMm: round(lengthMm),
      boundsMm: lengthMm > 0 ? { x: rail.x, y: [rail.y[0], contactEnd] as const } : null,
    }
  })
  return {
    requiredFullWidthContactMm: minimumContactMm ?? null,
    contact,
    lengthRequirementMet: minimumContactMm === undefined ? null : contact.every(({ boundsMm }) => boundsMm !== null && boundsMm.y[1] - boundsMm.y[0] >= minimumContactMm),
  }
}

function roundedLidCentroid(taper: RoundedTaper, fabricationMm: number) {
  const { outline, centre: [cx, cy], formedNotchRadiusMm: radius } = taper
  const back = outline[0][1] - cy
  const front = outline[2][1] - cy
  const { heelMm: [heelX, heelY], trialToeMm: [toeX, toeY] } = taper.relief
  const dx = toeX - heelX
  const dy = toeY - heelY
  const distance = (dy * (cx - heelX) - dx * (cy - heelY)) / Math.hypot(dx, dy)
  if (back > 0 || front < radius || distance < radius + fabricationMm ||
      outline[0][0] > cx - radius || outline[1][0] < cx + radius) return null

  const ring = outline.map(([x, y]) => [x - cx, y - cy] as const)
  let twiceArea = 0
  let firstMomentXTimesSix = 0
  let firstMomentYTimesSix = 0
  for (const [index, [x, y]] of ring.entries()) {
    const [u, v] = ring[(index + 1) % ring.length]
    const cross = x * v - u * y
    twiceArea += cross
    firstMomentXTimesSix += (x + u) * cross
    firstMomentYTimesSix += (y + v) * cross
  }
  const throatArea = -2 * radius * back
  const arcArea = Math.PI * radius * radius / 2
  const areaMm2 = twiceArea / 2 - throatArea - arcArea
  if (areaMm2 <= 0) return null
  // The rear throat and front semicircle are both symmetric across the riser axis.
  const notchFirstMomentY = throatArea * back / 2 + 2 * radius ** 3 / 3
  return { areaMm2, centreMm: [cx + firstMomentXTimesSix / (6 * areaMm2),
    cy + (firstMomentYTimesSix / 6 - notchFirstMomentY) / areaMm2] as const }
}

function frontReceiverComparison(taper: RoundedTaper, dimensions: NonNullable<NonNullable<CoverCase['closure']>['frontReceiver']>,
  fabricationMm: number, sideMm: number, axialMm: number, carrier: Footprint, room: Footprint, accessMm: number) {
  const { heelMm: [heelX, heelY], trialToeMm: [toeX, toeY] } = taper.relief
  const dx = toeX - heelX
  const dy = toeY - heelY
  const frontY = taper.outline[2][1]
  const eastX = taper.outline[1][0]
  const front = frontY - dimensions.edgeInsetMm
  const back = front - dimensions.widthMm
  const west = Math.max(taper.outline[0][0], heelX + ((front - heelY) * dx + fabricationMm * Math.hypot(dx, dy)) / dy)
    + fabricationMm
  const local: Footprint = { x: [west, eastX - fabricationMm], y: [back, front] }
  const reservation = offset(local, sideMm, axialMm)
  const clearance = {
    frontEdgeAfterSettingMm: dimensions.edgeInsetMm - fabricationMm,
    notchAfterSettingMm: back - taper.centre[1] - taper.formedNotchRadiusMm - fabricationMm,
    contactWidthMm: local.x[1] - local.x[0],
    carrierAfterSettingMm: intervalGap(reservation.x, carrier.x) - fabricationMm,
    roomAfterAccessSettingMm: Math.min(clearInside(room.x, reservation.x), clearInside(room.y, reservation.y)) - accessMm,
  }
  const diagnostics = ([
    ['FRONT_RECEIVER_EDGE_RESERVE_SHORT', clearance.frontEdgeAfterSettingMm < 0],
    ['FRONT_RECEIVER_ENTERS_NOTCH', clearance.notchAfterSettingMm < 0],
    ['FRONT_RECEIVER_HAS_NO_CONTACT_WIDTH', clearance.contactWidthMm <= 0],
    ['FRONT_RECEIVER_ENTERS_CARRIER_CORRIDOR', clearance.carrierAfterSettingMm < 0],
    ['FRONT_RECEIVER_EXCEEDS_ROOM', clearance.roomAfterAccessSettingMm < 0],
  ] as const).filter(([, failed]) => failed).map(([code]) => code)
  return {
    status: diagnostics.length ? 'blocked' as const : 'within-plan-contact-screen' as const,
    inputs: dimensions, reservation, contact: diagnostics.length ? null : reservation, clearance, diagnostics,
    anchoredSupportAndCaptureQualified: false as const,
  }
}

function receiverSupportPolygon(bands: readonly Footprint[]): PlanPoint[] {
  const points = bands.flatMap(({ x, y }) => [[x[0], y[0]], [x[1], y[0]], [x[1], y[1]], [x[0], y[1]]] as PlanPoint[])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = ([ax, ay]: PlanPoint, [bx, by]: PlanPoint, [cx, cy]: PlanPoint) =>
    (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)
  const boundary = (sequence: readonly PlanPoint[]) => {
    const hull: PlanPoint[] = []
    for (const point of sequence) {
      while (hull.length > 1 && cross(hull[hull.length - 2], hull[hull.length - 1], point) <= 0) hull.pop()
      hull.push(point)
    }
    return hull.slice(0, -1)
  }
  return [...boundary(points), ...boundary([...points].reverse())]
}

type SupportEdge = readonly [PlanPoint, PlanPoint]
const signedSupportMargin = ([[x, y], [u, v]]: SupportEdge, [px, py]: PlanPoint) =>
  ((u - x) * (py - y) - (v - y) * (px - x)) / Math.hypot(u - x, v - y)

function eccentricVerticalLoad(outline: readonly PlanPoint[], edges: readonly SupportEdge[], centreMm: PlanPoint) {
  let governing: { ratio: number; vertexMm: PlanPoint; supportEdgeMm: SupportEdge } | null = null
  for (const supportEdgeMm of edges) {
    const lidMarginMm = signedSupportMargin(supportEdgeMm, centreMm)
    // The signed moment arm is linear in the load point. Its extreme over
    // the remaining lid is at an outer vertex, despite the inner U-notch.
    for (const vertexMm of outline) {
      const loadArmMm = signedSupportMargin(supportEdgeMm, vertexMm)
      if (loadArmMm >= 0) continue
      const ratio = lidMarginMm / -loadArmMm
      if (governing === null || ratio < governing.ratio) governing = { ratio, vertexMm, supportEdgeMm }
    }
  }
  return governing === null ? { status: 'entire-outline-inside-support' as const } : {
    status: 'finite-support-edge-limit' as const,
    pointLoadToBareLidWeightAtEdge: round(governing.ratio),
    governingVertexMm: governing.vertexMm, governingSupportEdgeMm: governing.supportEdgeMm,
  }
}

function roundedGravityRest(taper: RoundedTaper, receiver: ReturnType<typeof roundedReceiverContact>,
  fabricationMm: number, sideMm: number, axialMm: number, frontContact?: Footprint | null) {
  const lid = roundedLidCentroid(taper, fabricationMm)
  const supportPolygonMm = receiverSupportPolygon([
    ...receiver.contact.flatMap(({ boundsMm }) => boundsMm ? [boundsMm] : []), ...(frontContact ? [frontContact] : []),
  ])
  const centreMm = lid ? [lid.centreMm[0] + sideMm, lid.centreMm[1] + axialMm] as const : null
  const edges = supportPolygonMm.map((vertex, i) => [vertex, supportPolygonMm[(i + 1) % supportPolygonMm.length]] as const)
  const edgeMargins = centreMm ? edges.map(edge => signedSupportMargin(edge, centreMm)) : []
  const margin = edgeMargins.length > 0 ? Math.min(...edgeMargins) : null
  const status = lid === null ? 'unsupported-lid-profile' : margin === null ? 'no-full-width-support' :
    margin < 0 ? 'centre-outside-support' : margin === 0 ? 'centre-on-support-edge' : 'centre-inside-support'
  return {
    status, lidAreaMm2: lid === null ? null : round(lid.areaMm2), centreOfMassMm: centreMm, supportPolygonMm,
    minimumSignedSupportEdgeMarginMm: margin === null ? null : round(margin),
    eccentricVerticalPointLoad: centreMm && margin !== null && margin > 0
      ? eccentricVerticalLoad(taper.outline.map(([x, y]) => [x + sideMm, y + axialMm]), edges, centreMm) : null,
    evidence: 'bare uniform flat lid under vertical gravity only' as const,
  }
}

function coverPlan(branch: CoverCase['branch'], positions: Readonly<Record<string, readonly Footprint[]>>,
  caseDigest: string, rounded?: { taper: RoundedTaper; axialMm: number; sideMm: number;
    gravity: ReturnType<typeof roundedGravityRest> | null }): DrawingSceneV2 {
  const items = Object.values(positions).flat()
  const taper = rounded ? [rounded.taper.relief.heelMm, rounded.taper.relief.boundToeMm, rounded.taper.relief.trialToeMm] : []
  const west = Math.min(...items.map(item => item.x[0]), ...taper.map(([x]) => x))
  const east = Math.max(...items.map(item => item.x[1]))
  const south = Math.min(...items.map(item => item.y[0]), ...taper.map(([, y]) => y))
  const north = Math.max(...items.map(item => item.y[1]), ...taper.map(([, y]) => y))
  const modelBounds = { x: west, y: south, width: east - west, height: north - south }
  const scaleDenominator = 10
  const project = createPlanPaperProjection({ scaleDenominator, modelBounds, paperOrigin: { x: 12, y: 12 } })
  const primitives: DrawingSceneV2['primitives'] = Object.entries(positions).flatMap(([stage, boxes]) => {
    if (rounded && ['closed-envelope', 'after-axial-release', 'first-rest'].includes(stage)) return []
    return boxes.map((box, i) => ({
      id: stage + '-' + i, kind: 'rect' as const,
      stroke: stage === 'first-rest' || stage === 'receiver-full-width-contact' || stage === 'front-receiver' ? 'primary' as const : 'secondary' as const,
      ...project.rect({ x: box.x[0], y: box.y[0], width: box.x[1] - box.x[0], height: box.y[1] - box.y[0] }),
      metadata: { caseDigest, xMinMm: box.x[0], xMaxMm: box.x[1], yMinMm: box.y[0], yMaxMm: box.y[1] },
    }))
  })
  if (rounded) {
    const addLine = (id: string, from: PlanPoint, to: PlanPoint, role: 'primary' | 'secondary' = 'primary') => primitives.push({
      id, kind: 'line', role,
      a: project.point(...from), b: project.point(...to),
      metadata: { caseDigest, fromXMm: from[0], fromYMm: from[1], toXMm: to[0], toYMm: to[1] },
    })
    const { taper, axialMm, sideMm } = rounded
    const { heelMm, boundToeMm, trialToeMm } = taper.relief
    addLine('utility-taper-bound', heelMm, boundToeMm)
    if (trialToeMm[0] !== boundToeMm[0]) addLine('utility-taper-relief-trial', heelMm, trialToeMm)
    const stages = [['closed', 0, 0], ['after-axial-release', 0, axialMm], ['first-rest', sideMm, axialMm]] as const
    for (const [stage, dx, dy] of stages) {
      const translate = ([x, y]: PlanPoint): PlanPoint => [x + dx, y + dy]
      const [cx, cy] = taper.centre
      const radius = taper.formedNotchRadiusMm
      const yBack = positions['closed-envelope'][0].y[0]
      const [backWest, backEast] = taper.outline
      if (backWest[0] < cx - radius) addLine('rounded-outer-' + stage + '-0', translate(backWest), translate([cx - radius, yBack]))
      if (backEast[0] > cx + radius) addLine('rounded-back-east-' + stage, translate([cx + radius, yBack]), translate(backEast))
      taper.outline.slice(1).forEach((from, index) => addLine('rounded-outer-' + stage + '-' + (index + 1),
        translate(from), translate(taper.outline[(index + 2) % taper.outline.length])))
      const arcSegments = 16
      const arcPoint = (index: number): PlanPoint => {
        const angle = index * Math.PI / arcSegments
        return translate([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)])
      }
      const notch = stage === 'closed' ? 'rounded-notch-' : 'rounded-' + stage + '-notch-'
      for (let index = 0; index < arcSegments; index++) addLine(notch + 'arc-' + index, arcPoint(index), arcPoint(index + 1))
      addLine(notch + 'west', translate([cx - radius, cy]), translate([cx - radius, yBack]))
      addLine(notch + 'east', translate([cx + radius, cy]), translate([cx + radius, yBack]))
    }
    const gravity = rounded.gravity
    if (gravity) {
      gravity.supportPolygonMm.forEach((from, index, ring) => addLine('first-rest-support-polygon-' + index,
        from, ring[(index + 1) % ring.length], 'secondary'))
      if (gravity.centreOfMassMm) {
        const [x, y] = gravity.centreOfMassMm
        addLine('first-rest-lid-centre-x', [x - 2, y], [x + 2, y])
        addLine('first-rest-lid-centre-y', [x, y - 2], [x, y + 2])
      }
    }
  }
  return {
    viewId: 'HAD-SOUTH-INLET-COVER-' + branch.toUpperCase(), sourceId: 'south-inlet-' + branch,
    title: 'South inlet upper cover and first rest',
    description: 'Roof-plane plan of the U-notched cover, its axial release and side first rest, bearing reservations, and the complete carrier path.',
    scaleDenominator, widthMm: 24 + project.length(modelBounds.width), heightMm: 24 + project.length(modelBounds.height), primitives,
  }
}

export function runInletCoverCase(resolved: CurrentDesignResolution, input: unknown, sources?: InletCoverSources) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Expected a versioned south inlet cover case')
  const trial = input as CoverCase
  const removal = sourceRemovals(resolved, sources).find(removal => removal.branch === trial.branch)
  if (!removal) throw new Error('Expected a south inlet cover case for one bound branch')
  const selectedDraw = sourceDraw(resolved, removal, sources)
  const explicitRemoval = sources?.removalCases?.some(input => input !== null && typeof input === 'object'
    && 'branch' in input && input.branch === removal.branch)
  if (explicitRemoval && selectedDraw.status === 'blocked') {
    throw new Error(`The selected ${removal.branch} removal blocks the dependent cover: ${selectedDraw.diagnostics.map(item => item.code).join(', ')}`)
  }
  const { calculation: baseline, source, method } = selectedDraw
  const fields = ['schema', 'branch', 'removalCaseDigest', 'washer', 'cheekMm', 'retainedSideLandMm', 'receiverRailWidthMm',
    'minimumFrontBridgeMm', 'axialTravelMm', 'sideTravelMm']
  if (trial.schema !== 'had-inlet-cover-case/1' || fields.some(key => !Object.hasOwn(trial, key)) ||
      Object.keys(trial).some(key => key !== 'closure' && !fields.includes(key))) throw new Error('Expected a versioned south inlet cover case')
  if (trial.removalCaseDigest !== source.caseDigest) throw new Error('Stale south inlet cover source binding')
  if (explicitRemoval && trial.washer !== removal.washer) {
    throw new Error('The cover washer state differs from the selected upstream removal scenario')
  }
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
    sourceDraw(resolved, { ...removal, washer: trial.washer }, sources).calculation.washerEnvelopeMm
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
  const rounded = installedClosure.roundedTaper
  const receiver = rounded ? roundedReceiverContact(rounded, rails, fabrication, side, axial,
    calculation.receiverBearingReserveMm, trial.closure?.minimumReceiverContactMm) : null
  const frontReceiver = rounded && trial.closure?.frontReceiver ? frontReceiverComparison(rounded, trial.closure.frontReceiver,
    fabrication, side, axial, carrier, { x: [room.x, room.x + room.width], y: [room.y, room.y + room.depth] }, access) : null
  const gravity = rounded && receiver ? roundedGravityRest(rounded, receiver, fabrication, side, axial, frontReceiver?.contact) : null
  const shapedReleaseDiagnostics = rounded ? [
    ...(trial.closure?.fillerAndCollarClear ? [] : ['FILLER_AND_COLLAR_REMAIN_ENGAGED']),
    ...(trial.closure?.taperDetached ? [] : ['UTILITY_TAPER_REMAINS_ATTACHED']),
    ...(receiver?.lengthRequirementMet === false ? ['ROUNDED_RECEIVER_CONTACT_TOO_SHORT'] : []),
    ...(frontReceiver?.diagnostics ?? []),
    ...(gravity?.status === 'unsupported-lid-profile' ? ['UNSUPPORTED_ROUNDED_LID_CENTROID'] : []),
    ...(gravity?.status === 'no-full-width-support' ? ['ROUNDED_LID_HAS_NO_FULL_WIDTH_SUPPORT'] : []),
    ...(gravity?.status === 'centre-outside-support' || gravity?.status === 'centre-on-support-edge'
      ? ['ROUNDED_LID_LACKS_POSITIVE_GRAVITY_RESERVE'] : []),
    ...diagnostics.map(({ code }) => code),
  ] : null
  const roundedRelease = shapedReleaseDiagnostics && {
    status: shapedReleaseDiagnostics.length ? 'blocked' as const : 'within-declared-rounded-release-screen' as const,
    assembledCandidateStatus: installedClosure.status === 'blocked' || shapedReleaseDiagnostics.length
      ? 'blocked' as const : 'within-conditional-fit-and-withdrawal' as const,
    diagnostics: shapedReleaseDiagnostics, receiver, frontReceiver, gravity,
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
    drawing: coverPlan(trial.branch, { ...(rounded ? { 'closed-envelope': [envelope] } : { closed }),
      'installed-filler-reservation': [installedClosure.filler],
      'installed-collar-reservation': [installedClosure.collar], 'after-axial-release': closed.map(item => offset(item, 0, axial)),
      'first-rest': parkedPanels, 'receiver-bearing': rails,
      'receiver-full-width-contact': receiver?.contact.flatMap(({ boundsMm }) => boundsMm ? [boundsMm] : []) ?? [],
      'front-receiver': frontReceiver ? [frontReceiver.reservation] : [],
      'carrier-corridor': [carrier], washer: [washerBox] }, caseDigest, rounded ? { taper: rounded, axialMm: axial, sideMm: side, gravity } : undefined),
    evidence: {
      wetClosure: 'unqualified', receiverAnchorageAndPositiveCapture: 'unqualified',
      coverThicknessSealsLatchAndTools: 'unqualified', heldCaptureThroughTransfer: 'unqualified',
    },
  }
}
