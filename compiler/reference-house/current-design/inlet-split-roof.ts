import { sha256SemanticFingerprint } from '../../core/identity.js'
import { createPlanPaperProjection } from '../../publication-drawing/projection.js'
import type { DrawingSceneV2 } from '../../publication-drawing-v2/model.js'
import type { runInletRemovalCase } from './inlet-removal.js'

type Removal = ReturnType<typeof runInletRemovalCase>
type Point = readonly [number, number]
type Bounds = readonly [number, number]
export type SplitRoofSettings = {
  readonly liftMm: number
  readonly sideTravelMm: number
  readonly forwardTravelMm: number
  readonly plateThicknessMm: number
  readonly densityKgM3: number
  readonly handleAndRetainersMassBudgetKg: number
  readonly handMassComparisonKg: number
  readonly seamLapMm: number
  readonly collarOutsideDiameterMm: number
  readonly collarSealLandMm: number
  readonly rearReturnDepthMm: number
  readonly plantRoofRiseMm: number
  readonly handWidthMm: number
  readonly handDepthMm: number
  readonly handHeightMm: number
  readonly handleGripHeightMm: number
}
export function readSplitRoofReferenceSettings(): SplitRoofSettings {
  return { liftMm: 70, sideTravelMm: 100, forwardTravelMm: 400, plateThicknessMm: 1.5, densityKgM3: 8000,
    handleAndRetainersMassBudgetKg: 0.15, handMassComparisonKg: 2, seamLapMm: 10,
    collarOutsideDiameterMm: 92, collarSealLandMm: 4, rearReturnDepthMm: 8, plantRoofRiseMm: 0,
    handWidthMm: 100, handDepthMm: 60, handHeightMm: 60, handleGripHeightMm: 45 }
}
const keys = ['liftMm', 'sideTravelMm', 'forwardTravelMm', 'plateThicknessMm', 'densityKgM3',
  'handleAndRetainersMassBudgetKg', 'handMassComparisonKg', 'seamLapMm', 'collarOutsideDiameterMm',
  'collarSealLandMm', 'rearReturnDepthMm', 'plantRoofRiseMm', 'handWidthMm', 'handDepthMm', 'handHeightMm', 'handleGripHeightMm'] as const
const round = (value: number) => Number(value.toFixed(4))
const intervalGap = (a: Bounds, b: Bounds) => Math.max(a[0] - b[1], b[0] - a[1])
function clip(points: readonly Point[], x: number, keepWest: boolean): Point[] {
  const inside = ([u]: Point) => keepWest ? u <= x : u >= x
  const result: Point[] = []
  for (const [index, end] of points.entries()) {
    const start = points[(index + points.length - 1) % points.length]
    if (inside(start) !== inside(end)) result.push([x, start[1] + (end[1] - start[1]) * (x - start[0]) / (end[0] - start[0])])
    if (inside(end)) result.push(end)
  }
  return result
}
const area = (points: readonly Point[]) => Math.abs(points.reduce((sum, [x, y], i) => {
  const [u, v] = points[(i + 1) % points.length]
  return sum + x * v - u * y
}, 0)) / 2
function pointSegmentDistance([x, y]: Point, [u, v]: Point, [a, b]: Point) {
  const factor = Math.max(0, Math.min(1, ((x - u) * (a - u) + (y - v) * (b - v)) / ((a - u) ** 2 + (b - v) ** 2)))
  return Math.hypot(x - u - factor * (a - u), y - v - factor * (b - v))
}
const bounds = (points: readonly Point[]) => ({ x: [Math.min(...points.map(p => p[0])), Math.max(...points.map(p => p[0]))] as Bounds,
  y: [Math.min(...points.map(p => p[1])), Math.max(...points.map(p => p[1]))] as Bounds })

export function compareSplitInletRoofs(input: unknown, removals: readonly Removal[], room: { x: number; y: number; width: number; depth: number }) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length !== keys.length
      || keys.some(key => !Object.hasOwn(input, key))) throw new Error('Expected complete split-roof authoring settings')
  const settings = input as SplitRoofSettings
  if (keys.some(key => !Number.isFinite(settings[key]) || settings[key] < 0 || (settings[key] === 0 && key !== 'plantRoofRiseMm'))
      || settings.liftMm > 200 || settings.sideTravelMm > 300 || settings.forwardTravelMm > 600
      || settings.plateThicknessMm > 5 || settings.densityKgM3 < 1000 || settings.densityKgM3 > 20000
      || settings.seamLapMm > 20 || settings.plantRoofRiseMm > 15) throw new Error('Split-roof settings exceed the bounded two-plate comparison')
  if (removals.length !== 2 || !removals.some(r => r.branch === 'utility') || !removals.some(r => r.branch === 'plant')) {
    throw new Error('The split roof requires both actual inlet removal cases')
  }
  const branches = removals.map(removal => {
    const sibling = removals.find(other => other.branch !== removal.branch)!
    const { wetBox, roofStrip, dryBreak, settingsMm: { fabrication, access }, washerEnvelopeMm: washer } = removal.calculation
    const roofZ = roofStrip.zMm + (removal.branch === 'plant' ? settings.plantRoofRiseMm : 0)
    const siblingRoofZ = sibling.calculation.roofStrip.zMm + (sibling.branch === 'plant' ? settings.plantRoofRiseMm : 0)
    const centre: Point = [dryBreak.xMm, dryBreak.yMm]
    const notchRadius = roofStrip.jacketOutsideDiameterMm / 2 + fabrication
    const collarRadius = settings.collarOutsideDiameterMm / 2
    const collarToSide = Math.min(...wetBox.planMm.map((a, i) => pointSegmentDistance(centre, a, wetBox.planMm[(i + 1) % wetBox.planMm.length]))) - collarRadius - fabrication
    const collarSealLand = collarRadius - roofStrip.jacketOutsideDiameterMm / 2 - fabrication
    const formedVentBelowReturn = roofZ - wetBox.innerVentAxisMm[2] - wetBox.formedVentDiameterMm / 2 - settings.rearReturnDepthMm - fabrication
    const siblingBounds = bounds(sibling.calculation.wetBox.planMm)
    const gripYOptions = [wetBox.planMm[0][1] + settings.handDepthMm / 2 + access, wetBox.frontYMm - settings.handDepthMm / 2 - access]
    const gripY = gripYOptions.reduce((best, trial) => Math.abs(trial - dryBreak.yMm) > Math.abs(best - dryBreak.yMm) ? trial : best)
    const parts = (['west', 'east'] as const).map(side => {
      const polygon = clip(wetBox.planMm, dryBreak.xMm + (side === 'west' ? settings.seamLapMm : 0), side === 'west')
      const footprint = bounds(polygon)
      const plateDatumZ = roofZ + (side === 'west' ? settings.plateThicknessMm : 0)
      const lateral = side === 'west' ? -settings.sideTravelMm : settings.sideTravelMm
      const parked = { x: footprint.x.map(x => x + lateral) as unknown as Bounds,
        y: footprint.y.map(y => y + settings.forwardTravelMm) as unknown as Bounds }
      const plateMassUpperBoundKg = area(polygon) * settings.plateThicknessMm * settings.densityKgM3 / 1e9
      const completeMassBudgetKg = plateMassUpperBoundKg + settings.handleAndRetainersMassBudgetKg
      const hasSiblingPlanOverlap = intervalGap([Math.min(footprint.x[0], footprint.x[0] + lateral), Math.max(footprint.x[1], footprint.x[1] + lateral)], siblingBounds.x) < access
      const initialSiblingGap = intervalGap(footprint.x, siblingBounds.x) - access
      const lowerSiblingGap = Math.max(intervalGap(parked.x, siblingBounds.x), intervalGap(parked.y, siblingBounds.y)) - access
      const washerPlanOverlap = intervalGap(parked.x, [washer[0], washer[0] + washer[3]]) < access
      const washerGap = washerPlanOverlap ? washer[1] - parked.y[1] - access : null
      const gripXs = polygon.flatMap(([x, y], i) => {
        const [u, v] = polygon[(i + 1) % polygon.length]
        return gripY < Math.min(y, v) || gripY > Math.max(y, v) ? [] : y === v ? [x, u] : [x + (u - x) * (gripY - y) / (v - y)]
      })
      const gripX = (Math.min(...gripXs) + Math.max(...gripXs)) / 2
      const grip: Point = [gripX, gripY]
      const handX: Bounds = [gripX - settings.handWidthMm / 2, gripX + settings.handWidthMm / 2]
      const handY: Bounds = [gripY - settings.handDepthMm / 2, gripY + settings.handDepthMm / 2]
      const handToRiser = Math.hypot(Math.max(handX[0] - dryBreak.xMm, dryBreak.xMm - handX[1], 0),
        Math.max(handY[0] - dryBreak.yMm, dryBreak.yMm - handY[1], 0)) - roofStrip.jacketOutsideDiameterMm / 2 - access
      const handSiblingGap = Math.max(intervalGap(handX, siblingBounds.x), intervalGap(handY, siblingBounds.y)) - access
      const margins = {
        startToSiblingMm: round(initialSiblingGap),
        handToRiserMm: round(handToRiser), handAtStartToSiblingMm: round(handSiblingGap),
        handBelowOwnRetainedCompanionPlateMm: round(settings.handleGripHeightMm - settings.handHeightMm / 2 - settings.plateThicknessMm - access),
        handAtStartToWallMm: round(handY[0] - wetBox.planMm[0][1] - access),
        liftedUnderplateToSiblingRoofMm: hasSiblingPlanOverlap ? round(roofZ + settings.liftMm - siblingRoofZ - access) : null,
        liftedHandToDryConnectionMm: round(dryBreak.zMm - plateDatumZ - settings.liftMm - settings.plateThicknessMm - settings.handleGripHeightMm - settings.handHeightMm / 2 - access),
        lateralToRetainedRiserMm: round(settings.sideTravelMm - (side === 'west' ? settings.seamLapMm : 0) - roofStrip.jacketOutsideDiameterMm / 2 - access),
        loweredToSiblingMm: round(lowerSiblingGap),
        parkedToWasherMm: washerGap === null ? null : round(washerGap),
        parkedInRoomMm: round(Math.min(parked.x[0] - room.x, room.x + room.width - parked.x[1], parked.y[0] - room.y, room.y + room.depth - parked.y[1]) - access),
        massBudgetReserveKg: round(settings.handMassComparisonKg - completeMassBudgetKg),
      }
      const diagnostics = Object.entries(margins).flatMap(([key, value]) => value !== null && value < 0 ? [key] : [])
      return { id: `south-inlet-${removal.branch}-roof-${side}`, side, polygonMm: polygon,
        grossPlateAreaUpperBoundMm2: round(area(polygon)), plateMassUpperBoundKg: round(plateMassUpperBoundKg),
        completeMassBudgetKg: round(completeMassBudgetKg), plateDatumZMm: plateDatumZ, notchRadiusMm: notchRadius, seamLapMm: side === 'west' ? settings.seamLapMm : 0,
        parkedBoundsMm: parked, gripMm: grip, handEnvelopeMm: [settings.handWidthMm, settings.handDepthMm, settings.handHeightMm], margins, diagnostics,
        movesMm: [[0, 0, 0], [0, 0, settings.liftMm], [lateral, 0, settings.liftMm],
          [lateral, settings.forwardTravelMm, settings.liftMm], [lateral, settings.forwardTravelMm, -plateDatumZ]] as const,
        removalOrder: side === 'west' ? 1 : 2,
        support: 'operator holds an integral handle before captive retainers release; place on a protected dry floor parts area',
      }
    })
    const diagnostics = [
      ...(collarToSide < 0 ? ['COLLAR_INTERCEPTS_FIXED_CELL'] : []),
      ...(collarSealLand < settings.collarSealLandMm ? ['COLLAR_SEAL_LAND_SHORT'] : []),
      ...(formedVentBelowReturn < 0 ? ['RETURN_INTERCEPTS_HIGH_VENT'] : []),
      ...(roofZ + 2 * settings.plateThicknessMm + fabrication >= removal.host.rawSillZMm ? ['RAISED_ROOF_REACHES_RAW_SILL'] : []),
      ...parts.flatMap(part => part.diagnostics.map(code => part.side + ':' + code)),
    ]
    return { branch: removal.branch, roofZMm: roofZ, sourceRemovalDigest: removal.source.caseDigest,
      directSplitCollar: { outsideDiameterMm: settings.collarOutsideDiameterMm, notchRadiusMm: notchRadius,
        sealLandAfterSettingMm: round(collarSealLand), collarToFixedCellAfterSettingMm: round(collarToSide),
        noSeparateOversizeFiller: true },
      rearReturnIsFixedAndAbsentFromMovingPlate: true,
      rearReturnBelowVentAfterSettingMm: round(formedVentBelowReturn), parts, diagnostics,
      restoredWetSeamAndRetainersQualified: false, actualMassAndGripEvidence: 'not-measured',
    }
  })
  const diagnostics = branches.flatMap(branch => branch.diagnostics.map(code => branch.branch + ':' + code))
  const primitives: DrawingSceneV2['primitives'] = []
  const scaleDenominator = 5
  for (const [index, branch] of branches.entries()) {
    const removal = removals.find(row => row.branch === branch.branch)!
    const all = branch.parts.flatMap(part => [...part.polygonMm, [part.parkedBoundsMm.x[0], part.parkedBoundsMm.y[0]] as Point,
      [part.parkedBoundsMm.x[1], part.parkedBoundsMm.y[1]] as Point])
    const bound = bounds(all)
    const projection = createPlanPaperProjection({ scaleDenominator, modelBounds: { x: bound.x[0], y: bound.y[0],
      width: bound.x[1] - bound.x[0], height: bound.y[1] - bound.y[0] }, paperOrigin: { x: 12 + index * 98, y: 25 } })
    primitives.push({ kind: 'text', id: branch.branch + '-label', x: 12 + index * 98, y: 10, role: 'label', value: branch.branch === 'plant' ? 'Plant · split roof' : 'Utility · split roof' })
    primitives.push({ kind: 'text', id: branch.branch + '-lift', x: 12 + index * 98, y: 17, role: 'note', value: 'Lift ' + settings.liftMm + ' mm, then move aside' })
    for (const part of branch.parts) {
      primitives.push({ kind: 'path', id: part.id + '-gross-blank', rings: [part.polygonMm.map(([x, y]) => projection.point(x, y))], stroke: 'primary', metadata: { grossBlankBeforeNotch: true } })
      const parked = projection.point(part.parkedBoundsMm.x[0], part.parkedBoundsMm.y[0])
      primitives.push({ kind: 'rect', id: part.id + '-parts-area', x: parked.x, y: parked.y, width: projection.length(part.parkedBoundsMm.x[1] - part.parkedBoundsMm.x[0]), height: projection.length(part.parkedBoundsMm.y[1] - part.parkedBoundsMm.y[0]), stroke: 'secondary', dash: 'provisional' })
      const grip = projection.point(part.gripMm[0], part.gripMm[1])
      const side = part.side === 'west' ? -settings.sideTravelMm : settings.sideTravelMm
      const offset = projection.point(part.gripMm[0] + side, part.gripMm[1])
      const rest = projection.point(part.gripMm[0] + side, part.gripMm[1] + settings.forwardTravelMm)
      primitives.push({ kind: 'line', id: part.id + '-side-move', a: grip, b: offset, role: 'secondary', dash: 'provisional' },
        { kind: 'line', id: part.id + '-forward-move', a: offset, b: rest, role: 'secondary', dash: 'provisional' },
        { kind: 'text', id: part.id + '-mass', x: parked.x, y: parked.y + projection.length(part.parkedBoundsMm.y[1] - part.parkedBoundsMm.y[0]) + 5, role: 'note', value: part.completeMassBudgetKg.toFixed(3) + ' kg budget' })
    }
    const centre = [removal.calculation.dryBreak.xMm, removal.calculation.dryBreak.yMm]
    const r = branch.parts[0].notchRadiusMm
    for (let segment = 0; segment < 32; segment++) {
      const a = segment * 2 * Math.PI / 32, b = (segment + 1) * 2 * Math.PI / 32
      primitives.push({ kind: 'line', id: branch.branch + '-notch-' + segment, a: projection.point(centre[0] + r * Math.cos(a), centre[1] + r * Math.sin(a)), b: projection.point(centre[0] + r * Math.cos(b), centre[1] + r * Math.sin(b)), role: 'secondary', dash: 'provisional' })
    }
  }
  const drawing: DrawingSceneV2 = { viewId: 'HAD-SPLIT-INLET-ROOF-PLAN', sourceId: 'south-inlet-split-roof',
    title: 'Split inlet roofs and dry parts areas', description: 'Gross blanks with separately indicated riser-notch cuts. One branch serviced at a time. Dashed grip routes occur after the vertical lift; source calculations check the full sequence.',
    widthMm: 208, heightMm: 170, scaleDenominator, primitives }
  return { schema: 'had-inlet-split-roof-result/1' as const,
    status: diagnostics.length ? 'blocked' as const : 'within-conditional-split-roof-screen' as const,
    caseDigest: sha256SemanticFingerprint({ settings, removals: removals.map(row => row.source.caseDigest) }),
    settings, branches, diagnostics, drawing, removesHardware: ['whole U-shaped lid transfer', 'axial lid guides', 'offset lid receiver and front bearing'],
    retainedRequirements: ['subject branch isolated and drained', 'washer restrained at first rest', 'front, target and Utility taper released',
      'separate fixed trough, relief and sibling closure retained', 'complete carrier guide/support and draw', 'rated split collar and wet seams', 'fixed rear return remains in place', 'remove subject collar before plates', 'west lap plate before east plate', 'one branch serviced at a time'],
    evidence: { wetClosureQualified: false, physicalHandlingQualified: false, ordinaryOccupiedOperationQualified: false,
      massIsAnAuthoredBudget: true, sourceGeometryOnly: true },
  }
}
