import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { DrawingScene } from '../../publication-drawing/model.js'
import { createPlanPaperProjection } from '../../publication-drawing/projection.js'
import type { CurrentDesignResolution } from './resolve.js'
import {
  runStructuralNorthDeadLoad, runStructuralNorthFixedBaseReplays, runStructuralNorthYawProbe,
  type NorthCornerDeadLoad, type NorthYawProbe,
} from './structural.js'

const repository = new URL('../../../', import.meta.url)
const studies = 'project/str/studies/'
const methodPath = studies + 'floor-portal-monolithic-drag.py'
const receiptPath = studies + 'floor-portal-monolithic-drag.json'
const geometryPath = studies + 'court_tie_starter_paths.py'
const id = 'STR-NORTH-FLOOR-COLLECTOR'

type Point = readonly [number, number]
type Vector3 = readonly [number, number, number]
type Wrench = readonly [number, number, number, number, number, number]
type KeyFace = {
  readonly contacts: readonly {
    readonly id: string
    readonly centreXYZMm: Vector3
    readonly forceKN: Vector3
    readonly bearingAreaMm2: number
    readonly meanBearingDemandMPa: number
  }[]
  readonly wrench: Wrench
}

interface NorthCollectorCase {
  readonly schema: 'str-north-collector-case/1'
  readonly planDigest: string
  readonly bindingDigest: string
  readonly collectorId: typeof id
  readonly portAxisXYMm: Point
  readonly dragDemandFactor: number
  readonly remoteMainBarShiftMm?: number
  readonly chordBendRadiusMm?: number
  readonly yawProbe?: NorthYawProbe
  readonly deadLoadReplay?: { readonly windIndex: number }
}

interface CollectorComparison {
  readonly sourceSHA256: Readonly<Record<string, string>>
  readonly geometry: {
    readonly wallUAndLegVLimitsMm: readonly [Point, Point]
    readonly receivingUMm: number
  }
  readonly retainedNWPort: {
    readonly referenceAxisXYmm: Point
    readonly axisXYmm: Point
    readonly axisUVAndDiameterMm: readonly [number, number, number]
    readonly gapToWidenedWallUMm: number
    readonly levels: readonly { readonly levelZMm: number; readonly minimumClearToFormedEdgeAfter5Mm: number }[]
    readonly admitted: false
  }
  readonly straightDrag: {
    readonly requiredBondLengthEachSideMm: number
    readonly lowerPathsLocalXYZMm: readonly (readonly [Vector3, Vector3])[]
    readonly upperPathsLocalXYZMm: readonly (readonly [Vector3, Vector3])[]
  }
  readonly lateralClosure: {
    readonly ownerHistoricalForceKN: number
    readonly comparisonForceKN: number
    readonly dragDemandFactor: number
    readonly normalCompressionReturnKN: number
    readonly momentAboutUnchangedGroundAxisU0KNm: number
  }
  readonly rearCabinetPortTerritory: {
    readonly state: 'no-port-territory' | 'overlap-throughout-territory'
      | 'cover-shortfall-throughout-territory' | 'cannot-exclude-cover-by-this-bound'
    readonly centreBoundsUVmm: readonly [number, number, number, number]
    readonly barCount?: number
    readonly continuousUpperBoundGapMm?: number
  }
  readonly gravity: {
    readonly directBearingURangeMm: Point
    readonly records: readonly { readonly field: string; readonly wingReactionKN: number }[]
  }
  readonly stack: {
    readonly axesInSectionZMm: readonly number[]
    readonly barDiametersMm: readonly number[]
    readonly uprightScreenClearShared5Mm: { readonly primaryH20: number; readonly secondaryH12: number }
    readonly primaryPlacingComparisonMm: number
    readonly primaryPlacingComparisonMet: boolean
  }
  readonly groundSplice: {
    readonly remoteMainBarShiftMm: number
    readonly knownMainBarAxes: readonly {
      readonly id: string
      readonly legacyBlindBoreXYMm: Point
      readonly upperBarXYMm: Point
      readonly axisOffsetMm: number
    }[]
    readonly legacyBoreAlignment: {
      readonly comparisonBudgetMm: number
      readonly axesOutsideBudgetCount: number
      readonly maximumAxisOffsetMm: number
    }
    readonly footprint: {
      readonly legacyMetalMm2: number
      readonly widenedBodyMm2: number
      readonly uncoveredByLegacyMetalMm2: number
      readonly uncoveredByExtendedWebMm2: number
      readonly extendedWebOverhangMm2: number
    }
    readonly extendedWeb: { readonly thicknessMm: number }
    readonly isolatedKeyLoadPath: {
      readonly status: string
      readonly legacyControl: {
        readonly widthMm: number
        readonly status: 'backing-unavailable'
        readonly unsupportedFaces: readonly string[]
      }
      readonly widenedWidthMm: number
      readonly widenedUnsupportedFaces: readonly string[]
      readonly runs: readonly {
        readonly upperYawSign: 1 | -1
        readonly upper: KeyFace
        readonly lower: KeyFace
        readonly externalNetWrench: Wrench
        readonly webCutDemands: readonly {
          readonly arm: 'x' | 'y'
          readonly section: 'root' | 'toe'
          readonly originXYZMm: Vector3
          readonly toeSideExternalWrench: Wrench
        }[]
      }[]
    }
    readonly receivingPlan: readonly {
      readonly heads: readonly string[]
      readonly girders: readonly string[]
      readonly receivingLevelZMm: number
      readonly uncoveredWithSettingMm2: number
      readonly verticalGapToWebUndersideMm: number
      readonly verticalGapToBlockUndersideMm: number
    }[]
    readonly nominalDeadLoadDelta: {
      readonly additionalFootprintMm2: number
      readonly centroidUVMm: Point
      readonly concreteUnitWeightKNPerM3: number
      readonly geometryWithinRetainedReceivingProjection: boolean
      readonly admitted: false
      readonly corners: readonly (NorthCornerDeadLoad & {
        readonly verticalExtentZMm: Point
        readonly additionalConcreteM3: number
        readonly additionalConcreteKN: number
        readonly additionalWebKg: number
        readonly additionalWebKN: number
      })[]
    }
  }
}

interface NativeResult {
  readonly schema: 'str-north-collector-native-result/1'
  readonly comparison: CollectorComparison
  readonly drawingSvg: string
}

const bindingFor = (resolved: CurrentDesignResolution) =>
  resolved.disciplineBindings.find(binding => binding.id === 'str-conditional-interface')

function unavailable() {
  return {
    schema: 'str-north-collector-result/1' as const,
    status: 'unavailable' as const,
    diagnostics: [{
      code: 'NORTH_COLLECTOR_REQUIRES_CURRENT_STR',
      message: 'Bind the current structural grid, floor and foul route before comparing the collector.',
    }],
  }
}

function readBound(path: string, identities: Readonly<Record<string, string>>) {
  const bytes = readFileSync(new URL(path, repository))
  const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
  if (blob !== identities[path]) throw new Error(`Stale or missing north collector binding at ${path}`)
  return { bytes, blob }
}

function readReference(binding: NonNullable<ReturnType<typeof bindingFor>>) {
  const { identities } = binding
  const method = readBound(methodPath, identities)
  const receipt = readBound(receiptPath, identities)
  const geometry = readBound(geometryPath, identities)
  const reference: CollectorComparison = JSON.parse(receipt.bytes.toString('utf8'))
  const inputs = Object.fromEntries(Object.entries(reference.sourceSHA256).map(([path, expected]) => {
    const source = readBound(path, identities)
    if (createHash('sha256').update(source.bytes).digest('hex') !== expected) {
      throw new Error(`Stale north collector receipt at ${path}`)
    }
    return [path, source.blob]
  }))
  return { reference, method, receipt, inputs: { ...inputs, [geometryPath]: geometry.blob } }
}

export function readNorthCollectorCase(resolved: CurrentDesignResolution) {
  const binding = bindingFor(resolved)
  if (!binding) return unavailable()
  const { reference } = readReference(binding)
  const collector: NorthCollectorCase = {
    schema: 'str-north-collector-case/1',
    planDigest: binding.applicability.planDigest,
    bindingDigest: binding.digest,
    collectorId: id,
    portAxisXYMm: reference.retainedNWPort.referenceAxisXYmm,
    dragDemandFactor: 1,
  }
  return { schema: 'str-north-collector-request/1' as const, design: resolved.design, collector }
}

function admitCase(value: unknown, binding: NonNullable<ReturnType<typeof bindingFor>>): NorthCollectorCase {
  const fields = ['schema', 'planDigest', 'bindingDigest', 'collectorId', 'portAxisXYMm', 'dragDemandFactor']
  const optional = ['remoteMainBarShiftMm', 'chordBendRadiusMm', 'yawProbe', 'deadLoadReplay']
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || fields.some(field => !Object.hasOwn(value, field))
      || Object.keys(value).some(field => !optional.includes(field) && !fields.includes(field))) {
    throw new Error('Expected an explicit versioned north collector case')
  }
  const trial = value as NorthCollectorCase
  if (trial.schema !== 'str-north-collector-case/1' || trial.collectorId !== id
      || trial.planDigest !== binding.applicability.planDigest || trial.bindingDigest !== binding.digest) {
    throw new Error('Stale or unsupported north collector binding')
  }
  if (!Array.isArray(trial.portAxisXYMm) || trial.portAxisXYMm.length !== 2 || !trial.portAxisXYMm.every(Number.isFinite)
      || !Number.isFinite(trial.dragDemandFactor) || trial.dragDemandFactor <= 0 || trial.dragDemandFactor > 1) {
    throw new Error('Use finite port XY coordinates and a positive demand factor at or below one')
  }
  const shift = trial.remoteMainBarShiftMm
  if (Object.hasOwn(trial, 'remoteMainBarShiftMm') && (typeof shift !== 'number' || !Number.isFinite(shift) || shift < 0 || shift > 20)) {
    throw new Error('Remote main bar shift must be between zero and 20 mm')
  }
  if (Object.hasOwn(trial, 'chordBendRadiusMm')
      && (typeof trial.chordBendRadiusMm !== 'number' || !Number.isFinite(trial.chordBendRadiusMm) || trial.chordBendRadiusMm <= 0)) {
    throw new Error('Use a finite positive chord bend radius in mm')
  }
  if (Object.hasOwn(trial, 'yawProbe')) {
    const probe = trial.yawProbe
    if (!probe || typeof probe !== 'object' || Array.isArray(probe) || Object.keys(probe).length !== 2
        || !Object.hasOwn(probe, 'windIndex') || !Object.hasOwn(probe, 'sense')
        || !Number.isSafeInteger(probe.windIndex) || probe.windIndex < 0
        || !['zero', 'nw-positive', 'ne-positive'].includes(probe.sense)) {
      throw new Error('Choose a named wind index and zero, nw-positive or ne-positive yaw')
    }
  }
  if (Object.hasOwn(trial, 'deadLoadReplay')) {
    const replay = trial.deadLoadReplay
    if (!replay || typeof replay !== 'object' || Array.isArray(replay) || Object.keys(replay).length !== 1
        || !Object.hasOwn(replay, 'windIndex') || !Number.isSafeInteger(replay.windIndex) || replay.windIndex < 0) {
      throw new Error('Choose a named wind index for the north dead load replay')
    }
  }
  return trial
}

function combineFixedBaseActions(
  yaw: ReturnType<typeof runStructuralNorthYawProbe>,
  gravity: ReturnType<typeof runStructuralNorthDeadLoad>,
) {
  if (yaw.windIndex !== gravity.windIndex
      || sha256SemanticFingerprint(yaw.windProgramme) !== sha256SemanticFingerprint(gravity.windProgramme)) {
    throw new Error('The north collector replays must share a retained wind state')
  }
  return {
    schema: 'str-north-collector-fixed-base-actions/1' as const,
    windIndex: yaw.windIndex,
    windProgramme: yaw.windProgramme,
    yawSense: yaw.sense,
    admitted: false as const,
    componentOrder: ['N_kN', 'Cx_kNm', 'Cy_kNm', 'Vx_kN', 'Vy_kN'] as const,
    verticalEquilibriumOrder: gravity.equilibriumOrder,
    horizontalEquilibriumOrder: yaw.horizontalEquilibriumOrder,
    method: yaw.method,
    states: gravity.states.map(state => {
      if (state.heads.length !== yaw.heads.length) throw new Error('North collector head sets differ')
      return {
        id: state.id,
        additionalGravityFactor: state.additionalGravityFactor,
        releasedPassivePadCount: state.releasedPassivePadCount,
        verticalEquilibrium: state.candidateVerticalEquilibrium,
        horizontalEquilibrium: yaw.probedHorizontalEquilibrium,
        heads: state.heads.map((head, index) => {
          const horizontal = yaw.heads[index]
          if (head.id !== horizontal.id || head.xy.some((value, axis) => value !== horizontal.xy[axis])) {
            throw new Error(`North collector action coordinates differ at ${head.id}`)
          }
          return {
            id: head.id,
            xy: head.xy,
            baseline: [...head.baselineVertical, ...horizontal.beforeHorizontalKN] as const,
            candidate: [...head.candidateVertical, ...horizontal.probedHorizontalKN] as const,
            delta: [...head.deltaVertical, ...horizontal.deltaHorizontalKN] as const,
          }
        }),
      }
    }),
    scope: 'Independent vertical and horizontal responses placed in one fixed-base load case. Changes in contact, stiffness and load sharing require an assembled model.',
  }
}

function grossRootWebDemands({ extendedWeb, isolatedKeyLoadPath }: CollectorComparison['groundSplice']) {
  const { widenedWidthMm: widthMm, runs } = isolatedKeyLoadPath
  const { thicknessMm } = extendedWeb
  const areaMm2 = widthMm * thicknessMm
  const widthSectionModulusMm3 = thicknessMm * widthMm ** 2 / 6
  const thicknessSectionModulusMm3 = widthMm * thicknessMm ** 2 / 6
  return {
    schema: 'str-north-collector-gross-root-web/1' as const,
    section: { widthMm, thicknessMm, areaMm2, widthSectionModulusMm3, thicknessSectionModulusMm3 },
    cuts: runs.flatMap(run => run.webCutDemands.filter(cut => cut.section === 'root').map(cut => {
      const [fx, fy, fz, mx, my, mz] = cut.toeSideExternalWrench
      const alongX = cut.arm === 'x'
      const directMPa = 1000 * (alongX ? fx : fy) / areaMm2
      const atPositiveWidthEdgeMPa = 1e6 * (alongX ? -mz : mz) / widthSectionModulusMm3
      const atTopEdgeMPa = 1e6 * (alongX ? my : -mx) / thicknessSectionModulusMm3
      const extremeBendingMPa = Math.abs(atPositiveWidthEdgeMPa) + Math.abs(atTopEdgeMPa)
      return {
        upperYawSign: run.upperYawSign, arm: cut.arm, originXYZMm: cut.originXYZMm,
        normalStressMPa: {
          direct: directMPa, bendingAtPositiveWidthEdge: atPositiveWidthEdgeMPa, bendingAtTopEdge: atTopEdgeMPa,
          minimum: directMPa - extremeBendingMPa, maximum: directMPa + extremeBendingMPa,
        },
        shearResultantKN: Math.hypot(alongX ? fy : fx, fz),
        torsionKNm: alongX ? mx : my,
      }
    })),
    admitted: false as const,
    scope: 'Nominal elastic normal stress on the gross solid rectangular root cuts under isolated key yaw. Effective section, combined shear and torsion, toe weld, bedding and stiffness require separate checks.',
  }
}

function compareChordTurn(comparison: CollectorComparison, radiusMm: number) {
  const axis = comparison.geometry.receivingUMm
  const toe = comparison.geometry.wallUAndLegVLimitsMm[1][1]
  const tangent = axis + radiusMm
  if (tangent > toe) throw new Error('The chord bend radius leaves the local collector legs')
  const centre = [tangent, tangent] as const
  const [,, lower, chordZMm, upper] = comparison.stack.axesInSectionZMm
  const [,, lowerDiameter, diameterMm, upperDiameter] = comparison.stack.barDiametersMm
  const tailStart = [axis, toe] as const
  const tailEnd = [toe, axis] as const
  const arcStart = [axis, tangent] as const
  const arcEnd = [tangent, axis] as const

  function intersection([a, b]: readonly [Vector3, Vector3]) {
    const du = b[0] - a[0]
    const dv = b[1] - a[1]
    const atU = (axis - a[0]) / du
    const v = a[1] + atU * dv
    if (atU >= 0 && atU <= 1 && v >= tangent && v <= toe) return 'u-tail'
    const atV = (axis - a[1]) / dv
    const u = a[0] + atV * du
    if (atV >= 0 && atV <= 1 && u >= tangent && u <= toe) return 'v-tail'
    const x = a[0] - centre[0]
    const y = a[1] - centre[1]
    const lengthSquared = du ** 2 + dv ** 2
    const projection = x * du + y * dv
    const discriminant = projection ** 2 - lengthSquared * (x ** 2 + y ** 2 - radiusMm ** 2)
    if (discriminant < 0) return null
    const root = Math.sqrt(discriminant)
    return [(-projection - root) / lengthSquared, (-projection + root) / lengthSquared]
      .some(t => t >= 0 && t <= 1 && x + t * du <= 0 && y + t * dv <= 0) ? 'bend' : null
  }

  const [portU, portV, portDiameter] = comparison.retainedNWPort.axisUVAndDiameterMm
  const radial = Math.hypot(portU - tangent, portV - tangent)
  const arcDistance = portU <= tangent && portV <= tangent
    ? Math.abs(radial - radiusMm)
    : Math.min(Math.hypot(portU - arcStart[0], portV - arcStart[1]), Math.hypot(portU - arcEnd[0], portV - arcEnd[1]))
  const clampToTail = (coordinate: number) => Math.max(tangent, Math.min(toe, coordinate))
  const portGapMm = Math.min(arcDistance, Math.hypot(portU - axis, portV - clampToTail(portV)),
    Math.hypot(portV - axis, portU - clampToTail(portU))) - (portDiameter + diameterMm) / 2
  const layers = [
    { side: 'lower', zMm: lower, dragDiameterMm: lowerDiameter, paths: comparison.straightDrag.lowerPathsLocalXYZMm },
    { side: 'upper', zMm: upper, dragDiameterMm: upperDiameter, paths: comparison.straightDrag.upperPathsLocalXYZMm },
  ] as const
  return {
    schema: 'str-north-collector-chord-turn/1' as const,
    admitted: false as const,
    geometry: { chordZMm, diameterMm, radiusMm, arcCentreUVmm: centre, arcStartUVmm: arcStart, arcEndUVmm: arcEnd,
      tailStartUVmm: tailStart, tailEndUVmm: tailEnd },
    layers: layers.map(({ side, zMm, dragDiameterMm, paths }) => ({
      side, zMm, verticalSurfaceGapAtCrossingMm: Math.abs(zMm - chordZMm) - (dragDiameterMm + diameterMm) / 2,
      crossings: paths.map(intersection),
    })),
    nwPort: { portGapMm, overlap: portGapMm < 0 },
    scope: 'Local centreline fit and bare clearance only. Bend bearing, cover, the full ring and adjoining chord development require separate geometry and checks.',
  }
}

function drawChordTurn(comparison: CollectorComparison, turn: ReturnType<typeof compareChordTurn>): DrawingScene {
  const { arcCentreUVmm: [tangent], arcStartUVmm: arcStart, arcEndUVmm: arcEnd,
    tailStartUVmm: tailStart, tailEndUVmm: tailEnd, radiusMm, chordZMm } = turn.geometry
  const [axis, toe] = tailStart
  const [portU, portV, portDiameter] = comparison.retainedNWPort.axisUVAndDiameterMm
  const { portGapMm } = turn.nwPort
  const [heel] = comparison.geometry.wallUAndLegVLimitsMm[1]
  const scaleDenominator = 10
  const plan = createPlanPaperProjection({
    scaleDenominator, modelBounds: { x: heel, y: -toe, width: toe - heel, height: toe - heel },
    paperOrigin: { x: 12, y: 20 },
  })
  const paper = ([u, v]: Point) => plan.point(u, -v)
  const primitives: DrawingScene['primitives'] = []
  const trace = (id: string, points: readonly Point[], role: 'cut' | 'primary' | 'secondary', provisional = false) => {
    for (let i = 1; i < points.length; i++) {
      primitives.push({ id: `${id}-${i}`, kind: 'line', a: paper(points[i - 1]), b: paper(points[i]), role,
        ...(provisional ? { dash: 'provisional' as const } : {}) })
    }
  }
  trace('receiving-axes', [[axis, toe], [axis, axis], [toe, axis]], 'secondary', true)
  const { lowerPathsLocalXYZMm, upperPathsLocalXYZMm } = comparison.straightDrag
  lowerPathsLocalXYZMm.forEach(([a, b], i) => trace(`drag-lower-${i}`, [[a[0], a[1]], [b[0], b[1]]], 'primary'))
  upperPathsLocalXYZMm.forEach(([a, b], i) => trace(`drag-upper-${i}`, [[a[0], a[1]], [b[0], b[1]]], 'secondary', true))
  const bend = Array.from({ length: 35 }, (_, i): Point => {
    const angle = (i + 1) * Math.PI / 72
    return [tangent - radiusMm * Math.cos(angle), tangent - radiusMm * Math.sin(angle)]
  })
  trace('h28', [tailStart, arcStart, ...bend, arcEnd, tailEnd], 'cut')
  const portRing = Array.from({ length: 48 }, (_, i): Point => {
    const angle = i * Math.PI / 24
    return [portU + portDiameter / 2 * Math.cos(angle), portV + portDiameter / 2 * Math.sin(angle)]
  })
  trace('floor-port', [...portRing, portRing[0]], 'primary', true)
  const size = plan.length(toe - heel)
  return {
    viewId: 'STR-NORTH-COLLECTOR-CHORD-TURN', sourceId: id, title: 'North collector chord turn',
    description: 'Local NW plan with upper and lower H20 bands, H28 chord centreline and formed floor port.',
    scaleDenominator, widthMm: size + 24, heightMm: size + 47,
    primitives: [
      { kind: 'text', id: 'title', x: 12, y: 10, role: 'label', value: 'NW collector · local H28 turn' },
      ...primitives,
      { kind: 'text', id: 'bend-radius', x: 12, y: size + 32, role: 'note',
        value: `Bend R${radiusMm.toFixed(1)} mm · nominal Z${chordZMm} mm` },
      { kind: 'text', id: 'port-gap', x: 12, y: size + 38, role: 'note',
        value: `Bare gap at NW port ${portGapMm.toFixed(1)} mm` },
    ],
  }
}

export function runNorthCollectorCase(resolved: CurrentDesignResolution, value: unknown) {
  const binding = bindingFor(resolved)
  if (!binding) return unavailable()
  const trial = admitCase(value, binding)
  const { reference, method, receipt, inputs } = readReference(binding)
  const { portAxisXYMm, dragDemandFactor } = trial
  const remoteMainBarShiftMm = trial.remoteMainBarShiftMm ?? reference.groundSplice.remoteMainBarShiftMm
  const native: NativeResult = JSON.parse(execFileSync('python3', [
    '-B', fileURLToPath(new URL(methodPath, repository)), fileURLToPath(repository), '--current-request',
  ], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    input: JSON.stringify({ schema: 'str-north-collector-native-case/1', portAxisXYMm, dragDemandFactor, remoteMainBarShiftMm }),
  }))
  const { comparison, drawingSvg } = native
  const isReference = dragDemandFactor === 1
    && remoteMainBarShiftMm === reference.groundSplice.remoteMainBarShiftMm
    && portAxisXYMm.every((coordinate, index) => coordinate === reference.retainedNWPort.referenceAxisXYmm[index])
  if (native.schema !== 'str-north-collector-native-result/1'
      || comparison.lateralClosure.dragDemandFactor !== dragDemandFactor
      || comparison.groundSplice.remoteMainBarShiftMm !== remoteMainBarShiftMm
      || portAxisXYMm.some((coordinate, index) => coordinate !== comparison.retainedNWPort.axisXYmm[index])
      || (isReference && sha256SemanticFingerprint(comparison) !== sha256SemanticFingerprint(reference))) {
    throw new Error('The recomputed north collector does not match its source-bound case')
  }
  const deadLoad = comparison.groundSplice.nominalDeadLoadDelta
  if (trial.deadLoadReplay && !deadLoad.geometryWithinRetainedReceivingProjection) {
    throw new Error('The widened north load leaves the retained receiving projection')
  }
  const yawMagnitudeKNm = comparison.lateralClosure.momentAboutUnchangedGroundAxisU0KNm
  const sameWind = trial.yawProbe && trial.yawProbe.windIndex === trial.deadLoadReplay?.windIndex
    ? runStructuralNorthFixedBaseReplays(resolved, trial.yawProbe, yawMagnitudeKNm, deadLoad.corners)
    : undefined
  const yawProbe = sameWind?.yawProbe ?? (trial.yawProbe
    ? runStructuralNorthYawProbe(resolved, trial.yawProbe, yawMagnitudeKNm)
    : undefined)
  const deadLoadReplay = sameWind?.deadLoadReplay ?? (trial.deadLoadReplay
    ? runStructuralNorthDeadLoad(resolved, trial.deadLoadReplay.windIndex, deadLoad.corners)
    : undefined)
  const fixedBaseActions = sameWind ? combineFixedBaseActions(sameWind.yawProbe, sameWind.deadLoadReplay) : undefined
  const chordTurn = trial.chordBendRadiusMm === undefined ? undefined : compareChordTurn(comparison, trial.chordBendRadiusMm)
  return {
    schema: 'str-north-collector-result/1' as const,
    status: 'computed-comparison' as const,
    source: { id: resolved.design.source.id, planDigest: trial.planDigest,
      caseDigest: sha256SemanticFingerprint({ ...trial, remoteMainBarShiftMm }) },
    method: { id, path: methodPath, blob: method.blob, receipt: { path: receiptPath, blob: receipt.blob }, inputs },
    comparison,
    grossRootWeb: grossRootWebDemands(comparison.groundSplice),
    drawingSvg,
    ...(yawProbe ? { yawProbe } : {}),
    ...(deadLoadReplay ? { deadLoadReplay } : {}),
    ...(fixedBaseActions ? { fixedBaseActions } : {}),
    ...(chordTurn ? { chordTurn: { ...chordTurn, drawing: drawChordTurn(comparison, chordTurn) } } : {}),
    evidence: {
      state: isReference ? 'historical-demand-comparison' : 'trial-only',
      installedAcceptance: false as const,
      outstanding: ['Continuous chord and wall cage', 'Imperforate ground splice', 'Coupled signed 52-head replay', 'Usable foul route and renewal'],
    },
  }
}
