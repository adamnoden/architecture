import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { DrawingScene } from '../../publication-drawing/model.js'
import { createPlanPaperProjection } from '../../publication-drawing/projection.js'
import type { CurrentDesignResolution } from './resolve.js'
import { runStructuralDpcOriginAudit } from './structural-dpc.js'
import { runRearFoulVentCase } from './rear-foul-vent.js'
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
const keyContactIds = ['x-toe-end', 'x-toe-side', 'y-toe-end', 'y-toe-side'] as const
type KeyContactId = typeof keyContactIds[number]
type ContactCondition = { readonly gapMm: number; readonly stiffnessKNPerMm: number }
type KeyContactTrial = {
  readonly upper: Readonly<Record<KeyContactId, ContactCondition>>
  readonly lower: Readonly<Record<KeyContactId, ContactCondition>>
  readonly rotationBudgetMrad: number
}
const placementGroups = ['withinDragCage', 'toRetainedSteel', 'toFormwork'] as const
type PlacementTolerances = Readonly<Record<typeof placementGroups[number], number>>
type KeyFace = {
  readonly contacts: readonly {
    readonly id: KeyContactId
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
  readonly toeTransferIntervalMm?: Point
  readonly keyContactTrial?: KeyContactTrial
  readonly placementToleranceMm?: PlacementTolerances
  readonly yawProbe?: NorthYawProbe
  readonly deadLoadReplay?: { readonly windIndex: number }
  readonly dpcOriginAudit?: { readonly cutZMm: number }
  readonly portStrategy?: 'linked-west-foul-route'
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
    readonly gapToWidenedWallUMm: number | null
    readonly state?: 'omitted-in-linked-candidate'
    readonly canonicalSourcePortRetained?: true
    readonly levels: readonly { readonly levelZMm: number; readonly minimumClearToFormedEdgeAfter5Mm: number }[]
    readonly admitted: false
  }
  readonly straightDrag: {
    readonly requiredBondLengthEachSideMm: number
    readonly coverToActualToeEndAfter5mm: number
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
    readonly state: 'no-port-territory' | 'overlap-throughout-territory' | 'not-applicable-no-floor-port'
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
    readonly unrelatedDragPlanesClearShared5Mm: number
    readonly samePlaneWingPairClearShared5Mm: number
    readonly alongOneSignClearShared5Mm: number
    readonly wallLongitudinalTrial: { readonly minimumUnrelatedGapMm: number }
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
  readonly placementReferences: { readonly relativeSettingMm: number; readonly concreteCoverMm: number }
  readonly stationCapacity: {
    readonly schema: 'str-north-collector-station-capacity/1'
    readonly state: 'required-station-count-excluded' | 'required-shared-plane-gap-excluded' | 'placing-ranges-remain' | 'not-applicable-no-floor-port'
    readonly requiredStationsPerGroup: number
    readonly admitted: false
    readonly groups: readonly {
      readonly band: 'lower' | 'upper'
      readonly leg: 'west' | 'north'
      readonly stationAxis: 'U' | 'V'
      readonly endCoverStationIntervalMm: Point
      readonly minimumStationPitchMm: number
      readonly profiles: readonly {
        readonly portCoverMm: number
        readonly openForbiddenStationIntervalMm: Point | null
        readonly availableStationIntervalsMm: readonly Point[]
        readonly maximumStations: number
        readonly exampleStationCentresMm: readonly number[]
      }[]
    }[]
    readonly sharedPlanes: readonly {
      readonly band: 'lower' | 'upper'
      readonly westFirstStationIntervalMm: Point
      readonly northFirstStationIntervalMm: Point
      readonly requiredGapMm: number
      readonly gapUpperBoundAfterSettingMm: number
    }[]
  }
  readonly cabinetStationCapacity: {
    readonly schema: 'str-north-collector-cabinet-station-capacity/1'
    readonly state: 'no-port-territory' | 'excluded-throughout-territory' | 'unresolved-cell' | 'not-applicable-no-floor-port'
    readonly centreBoundsUVmm: readonly [number, number, number, number]
    readonly cellsChecked: number
    readonly resolvedCells: Readonly<Record<'required-station-count-excluded' | 'required-shared-plane-gap-excluded', number>>
    readonly minimumSubdivisionSideMm: number
    readonly unresolvedWitnessBoxUVmm: readonly [number, number, number, number] | null
    readonly admitted: false
  }
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
  const optional = ['remoteMainBarShiftMm', 'chordBendRadiusMm', 'toeTransferIntervalMm', 'keyContactTrial',
    'placementToleranceMm', 'yawProbe', 'deadLoadReplay', 'portStrategy', 'dpcOriginAudit']
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || fields.some(field => !Object.hasOwn(value, field))
      || Object.keys(value).some(field => !optional.includes(field) && !fields.includes(field))) {
    throw new Error('Expected an explicit versioned north collector case')
  }
  const trial = value as NorthCollectorCase
  if (Object.hasOwn(trial, 'dpcOriginAudit') && (!trial.dpcOriginAudit || typeof trial.dpcOriginAudit !== 'object'
      || Object.keys(trial.dpcOriginAudit).length !== 1 || !Object.hasOwn(trial.dpcOriginAudit, 'cutZMm')
      || !Number.isFinite(trial.dpcOriginAudit.cutZMm))) throw new Error('Expected a finite explicit DPC cut level')
  if (Object.hasOwn(trial, 'portStrategy') && trial.portStrategy !== 'linked-west-foul-route') {
    throw new Error('Expected a linked west foul route port strategy')
  }
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
  const toeInterval = trial.toeTransferIntervalMm
  if (Object.hasOwn(trial, 'toeTransferIntervalMm') && (!Array.isArray(toeInterval) || toeInterval.length !== 2
      || !toeInterval.every(Number.isFinite) || toeInterval[0] < 0 || toeInterval[0] >= toeInterval[1])) {
    throw new Error('Use an increasing toe transfer interval in millimetres from the outboard edge')
  }
  if (Object.hasOwn(trial, 'keyContactTrial')) admitKeyContactTrial(trial.keyContactTrial)
  const tolerances = trial.placementToleranceMm
  if (Object.hasOwn(trial, 'placementToleranceMm') && (!tolerances || !hasExactKeys(tolerances, placementGroups)
      || placementGroups.some(group => !Number.isFinite(tolerances[group]) || tolerances[group] < 0))) {
    throw new Error('Specify finite nonnegative placement tolerances for all three interface groups')
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

function hasExactKeys(value: unknown, keys: readonly string[]) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key))
}

function admitKeyContactTrial(trial: KeyContactTrial | undefined) {
  if (!trial || !hasExactKeys(trial, ['upper', 'lower', 'rotationBudgetMrad'])
      || !Number.isFinite(trial.rotationBudgetMrad) || trial.rotationBudgetMrad <= 0) {
    throw new Error('Specify both key contact levels and a finite positive rotation budget in mrad')
  }
  for (const level of [trial.upper, trial.lower]) {
    if (!hasExactKeys(level, keyContactIds)) throw new Error('Specify all four retained key contacts at each level')
    for (const id of keyContactIds) {
      const contact = level[id]
      if (!contact || !hasExactKeys(contact, ['gapMm', 'stiffnessKNPerMm']) || !Number.isFinite(contact.gapMm)
          || contact.gapMm < 0 || !Number.isFinite(contact.stiffnessKNPerMm) || contact.stiffnessKNPerMm <= 0) {
        throw new Error(`Specify a finite nonnegative gap and positive stiffness for ${id}`)
      }
    }
  }
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

function rectangularWebSection(widthMm: number, thicknessMm: number) {
  return {
    widthMm, thicknessMm, areaMm2: widthMm * thicknessMm,
    widthSectionModulusMm3: thicknessMm * widthMm ** 2 / 6,
    thicknessSectionModulusMm3: widthMm * thicknessMm ** 2 / 6,
  }
}

function rectangularWebDemand(arm: 'x' | 'y', [fx, fy, fz, mx, my, mz]: Wrench, section: ReturnType<typeof rectangularWebSection>) {
  const alongX = arm === 'x'
  const direct = 1000 * (alongX ? fx : fy) / section.areaMm2
  const bendingAtPositiveWidthEdge = 1e6 * (alongX ? -mz : mz) / section.widthSectionModulusMm3
  const bendingAtTopEdge = 1e6 * (alongX ? my : -mx) / section.thicknessSectionModulusMm3
  const extremeBending = Math.abs(bendingAtPositiveWidthEdge) + Math.abs(bendingAtTopEdge)
  return {
    normalStressMPa: { direct, bendingAtPositiveWidthEdge, bendingAtTopEdge,
      minimum: direct - extremeBending, maximum: direct + extremeBending },
    shearResultantKN: Math.hypot(alongX ? fy : fx, fz),
    torsionKNm: alongX ? mx : my,
  }
}

function grossRootWebDemands({ extendedWeb, isolatedKeyLoadPath }: CollectorComparison['groundSplice']) {
  const { widenedWidthMm: widthMm, runs } = isolatedKeyLoadPath
  const section = rectangularWebSection(widthMm, extendedWeb.thicknessMm)
  return {
    schema: 'str-north-collector-gross-root-web/1' as const,
    section,
    cuts: runs.flatMap(run => run.webCutDemands.filter(cut => cut.section === 'root').map(cut => ({
      upperYawSign: run.upperYawSign, arm: cut.arm, originXYZMm: cut.originXYZMm,
      ...rectangularWebDemand(cut.arm, cut.toeSideExternalWrench, section),
    }))),
    admitted: false as const,
    scope: 'Nominal elastic normal stress on the gross solid rectangular root cuts under isolated key yaw. Effective section, combined shear and torsion, toe weld, bedding and stiffness require separate checks.',
  }
}

function toeTransferDemands({ extendedWeb, isolatedKeyLoadPath }: CollectorComparison['groundSplice'], interval?: Point) {
  const blockWidthMm = isolatedKeyLoadPath.legacyControl.widthMm
  const span: Point = interval ?? [0, blockWidthMm]
  if (span[1] > blockWidthMm) throw new Error('Toe transfer interval exceeds the retained block width')
  const centroidMm = (span[0] + span[1]) / 2
  const section = rectangularWebSection(span[1] - span[0], extendedWeb.thicknessMm)
  const cuts = isolatedKeyLoadPath.runs.flatMap(run => run.webCutDemands.filter(cut => cut.section === 'toe').map(cut => {
    const [x, y, z] = cut.originXYZMm
    const originXYZMm: Vector3 = cut.arm === 'x' ? [x, centroidMm, z] : [centroidMm, y, z]
    const dx = (originXYZMm[0] - x) / 1000
    const dy = (originXYZMm[1] - y) / 1000
    const [fx, fy, fz, mx, my, mz] = cut.toeSideExternalWrench
    const wrench: Wrench = [fx, fy, fz, mx - dy * fz, my + dx * fz, mz - dx * fy + dy * fx]
    const demand = rectangularWebDemand(cut.arm, wrench, section)
    if (!Object.values(demand.normalStressMPa).every(Number.isFinite)) throw new Error('Toe transfer demand is outside the finite comparison range')
    return { upperYawSign: run.upperYawSign, arm: cut.arm, originXYZMm, wrench, ...demand }
  }))
  return {
    schema: 'str-north-collector-toe-transfer/1' as const, intervalMm: span, section, cuts, admitted: false as const,
    scope: 'Isolated key yaw transferred over a rectangular toe-cut envelope at web depth. Weld topology, effective area, resistance, stiffness and coupled actions remain open.',
  }
}

function compareKeyContact(comparison: CollectorComparison['groundSplice'], trial: KeyContactTrial) {
  const levels = ['upper', 'lower'] as const
  const runs = comparison.isolatedKeyLoadPath.runs.map(run => {
    const faces = levels.map(level => {
      const { contacts, wrench } = run[level]
      const [a, b] = contacts
      if (contacts.length !== 2 || !a || !b || a.forceKN.some((force, axis) => force !== -b.forceKN[axis])) {
        throw new Error('Expected two opposing native key forces')
      }
      const forceKN = Math.hypot(...a.forceKN)
      const dxMm = a.centreXYZMm[0] - b.centreXYZMm[0]
      const dyMm = a.centreXYZMm[1] - b.centreXYZMm[1]
      const leverMm = Math.abs((dxMm * a.forceKN[1] - dyMm * a.forceKN[0]) / forceKN)
      if (!Number.isFinite(leverMm) || leverMm <= 0) throw new Error('Expected a finite native key couple arm')
      const contactClosures = contacts.map(({ id }) => {
        const { gapMm, stiffnessKNPerMm } = trial[level][id]
        return { id, gapMm, stiffnessKNPerMm, compressionMm: forceKN / stiffnessKNPerMm }
      })
      const gapRotationMrad = 1000 * contactClosures.reduce((sum, contact) => sum + contact.gapMm, 0) / leverMm
      const elasticRotationMrad = 1000 * contactClosures.reduce((sum, contact) => sum + contact.compressionMm, 0) / leverMm
      return { level, yawSign: Math.sign(wrench[5]), forceKN, leverMm, contactClosures, gapRotationMrad, elasticRotationMrad }
    })
    const gapRotationMrad = faces.reduce((sum, face) => sum + face.gapRotationMrad, 0)
    const elasticRotationMrad = faces.reduce((sum, face) => sum + face.elasticRotationMrad, 0)
    const rotationMrad = gapRotationMrad + elasticRotationMrad
    if (!Number.isFinite(rotationMrad)) throw new Error('Key rotation is outside the finite comparison range')
    const remainingMrad = trial.rotationBudgetMrad - rotationMrad
    return { upperYawSign: run.upperYawSign, faces, gapRotationMrad, elasticRotationMrad, rotationMrad, remainingMrad,
      status: gapRotationMrad >= trial.rotationBudgetMrad ? 'gap-exhausts-budget' as const
        : remainingMrad < 0 ? 'elastic-rotation-exceeds-budget' as const : 'within-trial-budget' as const }
  })
  return {
    schema: 'str-north-collector-key-contact/1' as const, rotationBudgetMrad: trial.rotationBudgetMrad, runs,
    admitted: false as const,
    scope: 'Small rotation from gap closure and linear compression of two engaged key pairs in series. The rotation budget and springs are trial inputs. Plate and weld flexibility, bedding, load redistribution and neighbouring actions are excluded.',
  }
}

function comparePlacementTolerances(comparison: CollectorComparison, references: NativeResult['placementReferences'], trial: PlacementTolerances) {
  const { straightDrag, stack, retainedNWPort } = comparison
  const { relativeSettingMm, concreteCoverMm } = references
  if (![relativeSettingMm, concreteCoverMm].every(value => Number.isFinite(value) && value > 0)) {
    throw new Error('Expected finite native placement references')
  }
  const row = (group: typeof placementGroups[number], interfaceId: string, clearAfterReferenceMm: number, requiredClearMm: number) => {
    const nominalClearMm = clearAfterReferenceMm + relativeSettingMm
    const maximumRelativeSettingMm = nominalClearMm - requiredClearMm
    const remainingMm = maximumRelativeSettingMm - trial[group]
    return { group, interfaceId, nominalClearMm, requiredClearMm, maximumRelativeSettingMm, remainingMm }
  }
  const placing = stack.primaryPlacingComparisonMm
  const rows = [
    row('withinDragCage', 'parallel-same-sign', stack.alongOneSignClearShared5Mm, placing),
    row('withinDragCage', 'same-level-adjacent-wings', stack.samePlaneWingPairClearShared5Mm, placing),
    row('withinDragCage', 'separate-drag-levels', stack.unrelatedDragPlanesClearShared5Mm, placing),
    row('toRetainedSteel', 'wall-primary-h20', stack.uprightScreenClearShared5Mm.primaryH20, placing),
    row('toRetainedSteel', 'wall-secondary-h12', stack.uprightScreenClearShared5Mm.secondaryH12, placing),
    row('toRetainedSteel', 'wall-longitudinal-rails', stack.wallLongitudinalTrial.minimumUnrelatedGapMm, placing),
    row('toFormwork', 'concrete-toe', straightDrag.coverToActualToeEndAfter5mm, concreteCoverMm),
    ...retainedNWPort.levels.map(level => row('toFormwork', `nw-formed-port-Z${level.levelZMm}`, level.minimumClearToFormedEdgeAfter5Mm, concreteCoverMm)),
  ]
  return {
    schema: 'str-north-collector-placement-tolerance/1' as const, tolerancesMm: trial, referenceRelativeSettingMm: relativeSettingMm,
    rows, exceededInterfaces: rows.filter(item => item.remainingMm < 0).map(item => item.interfaceId), admitted: false as const,
    scope: 'Conservative loss of nominal finite clearance for bounded relative placement of the represented surfaces. Intended H28 contacts, production jig evidence, full cage and installation remain outside this comparison.',
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
    nwPort: comparison.retainedNWPort.state === 'omitted-in-linked-candidate'
      ? { state: 'not-applicable-no-floor-port' as const, portGapMm: null, overlap: null }
      : { portGapMm, overlap: portGapMm < 0 },
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
  if (portGapMm !== null) trace('floor-port', [...portRing, portRing[0]], 'primary', true)
  const size = plan.length(toe - heel)
  return {
    viewId: 'STR-NORTH-COLLECTOR-CHORD-TURN', sourceId: id, title: 'North collector chord turn',
    description: portGapMm === null
      ? 'Local NW intact-floor candidate with upper and lower H20 bands and H28 chord centreline.'
      : 'Local NW plan with upper and lower H20 bands, H28 chord centreline and formed floor port.',
    scaleDenominator, widthMm: size + 24, heightMm: size + 47,
    primitives: [
      { kind: 'text', id: 'title', x: 12, y: 10, role: 'label', value: 'NW collector · local H28 turn' },
      ...primitives,
      { kind: 'text', id: 'bend-radius', x: 12, y: size + 32, role: 'note',
        value: `Bend R${radiusMm.toFixed(1)} mm · nominal Z${chordZMm} mm` },
      { kind: 'text', id: 'port-gap', x: 12, y: size + 38, role: 'note',
        value: portGapMm === null ? 'Intact-floor candidate · linked west foul route required'
          : `Bare gap at NW port ${portGapMm.toFixed(1)} mm` },
    ],
  }
}

function linkedWestRoute(resolved: CurrentDesignResolution, trial: NorthCollectorCase, westVentCase: unknown) {
  if (trial.portStrategy !== 'linked-west-foul-route') {
    if (westVentCase !== undefined) throw new Error('A west foul route case requires the linked collector strategy')
    return null
  }
  if (westVentCase === undefined) throw new Error('The linked collector candidate requires an explicit west foul route case')
  const route = runRearFoulVentCase(resolved, westVentCase)
  if (route.status !== 'computed-comparison' || route.source.planDigest !== trial.planDigest) {
    throw new Error('The linked west foul route does not share the current collector design')
  }
  const { comparison, buriedReceiving } = route
  if (comparison.state !== 'bounded-dry-return-comparison' || comparison.failedChecks.length
      || comparison.terminalApplicability.modelledOpenings.state !== 'passes'
      || buriedReceiving.state !== 'bounded-direct-run-comparison' || buriedReceiving.failedChecks.length) {
    throw new Error('The linked west foul route fails its dry, terminal or buried receiving geometry')
  }
  return {
    state: 'conditional-pre-site-route' as const, canonicalSourcePortRetained: true as const,
    installedAcceptance: false as const, source: route.source, method: route.method,
    requiredSiteEnvelope: {
      trialHostAxisXYZMm: buriedReceiving.hostAxisXYZMm, maximumHostAxisZMm: buriedReceiving.maximumHostAxisZMm,
      gradient: buriedReceiving.gradient, pipeEnvelopeDiameterMm: buriedReceiving.pipeEnvelopeDiameterMm,
      minimumCrownCoverMm: buriedReceiving.requiredCoverMm, gradeProfile: buriedReceiving.coverProfile,
    },
    adoptionConditions: comparison.hostAndRenewalUnresolved ?? [],
  }
}

export function runNorthCollectorCase(resolved: CurrentDesignResolution, value: unknown, westVentCase?: unknown) {
  const binding = bindingFor(resolved)
  if (!binding) return unavailable()
  const trial = admitCase(value, binding)
  const { reference, method, receipt, inputs } = readReference(binding)
  const serviceDependency = linkedWestRoute(resolved, trial, westVentCase)
  if (serviceDependency && trial.portAxisXYMm.some((coordinate, axis) => coordinate !== reference.retainedNWPort.referenceAxisXYmm[axis])) {
    throw new Error('The intact collector candidate must retain the canonical source port identity')
  }
  const { portAxisXYMm, dragDemandFactor } = trial
  const remoteMainBarShiftMm = trial.remoteMainBarShiftMm ?? reference.groundSplice.remoteMainBarShiftMm
  const native: NativeResult = JSON.parse(execFileSync('python3', [
    '-B', fileURLToPath(new URL(methodPath, repository)), fileURLToPath(repository), '--current-request',
  ], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    input: JSON.stringify({ schema: 'str-north-collector-native-case/1', portAxisXYMm, dragDemandFactor, remoteMainBarShiftMm,
      ...(serviceDependency ? { portStrategy: trial.portStrategy } : {}) }),
  }))
  const { comparison, drawingSvg, stationCapacity, cabinetStationCapacity } = native
  const isReference = !serviceDependency && dragDemandFactor === 1
    && remoteMainBarShiftMm === reference.groundSplice.remoteMainBarShiftMm
    && portAxisXYMm.every((coordinate, index) => coordinate === reference.retainedNWPort.referenceAxisXYmm[index])
  if (native.schema !== 'str-north-collector-native-result/1'
      || stationCapacity.schema !== 'str-north-collector-station-capacity/1' || stationCapacity.admitted !== false
      || cabinetStationCapacity.schema !== 'str-north-collector-cabinet-station-capacity/1' || cabinetStationCapacity.admitted !== false
      || comparison.lateralClosure.dragDemandFactor !== dragDemandFactor
      || comparison.groundSplice.remoteMainBarShiftMm !== remoteMainBarShiftMm
      || portAxisXYMm.some((coordinate, index) => coordinate !== comparison.retainedNWPort.axisXYmm[index])
      || (serviceDependency && (comparison.retainedNWPort.state !== 'omitted-in-linked-candidate'
        || comparison.retainedNWPort.canonicalSourcePortRetained !== true || comparison.retainedNWPort.levels.length
        || comparison.retainedNWPort.gapToWidenedWallUMm !== null
        || stationCapacity.state !== 'not-applicable-no-floor-port' || cabinetStationCapacity.state !== 'not-applicable-no-floor-port'))
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
  const keyContact = trial.keyContactTrial ? compareKeyContact(comparison.groundSplice, trial.keyContactTrial) : undefined
  const placementTolerance = trial.placementToleranceMm
    ? comparePlacementTolerances(comparison, native.placementReferences, trial.placementToleranceMm)
    : undefined
  return {
    schema: 'str-north-collector-result/1' as const,
    status: 'computed-comparison' as const,
    source: { id: resolved.design.source.id, planDigest: trial.planDigest,
      caseDigest: sha256SemanticFingerprint({ ...trial, remoteMainBarShiftMm,
        ...(serviceDependency ? { westFoulRouteCaseDigest: serviceDependency.source.caseDigest } : {}) }) },
    method: { id, path: methodPath, blob: method.blob, receipt: { path: receiptPath, blob: receipt.blob }, inputs },
    comparison,
    ...(serviceDependency ? { serviceDependency } : {}),
    grossRootWeb: grossRootWebDemands(comparison.groundSplice),
    toeTransfer: toeTransferDemands(comparison.groundSplice, trial.toeTransferIntervalMm),
    ...(keyContact ? { keyContact } : {}),
    ...(placementTolerance ? { placementTolerance } : {}),
    stationCapacity,
    cabinetStationCapacity,
    drawingSvg,
    ...(yawProbe ? { yawProbe } : {}),
    ...(deadLoadReplay ? { deadLoadReplay } : {}),
    ...(fixedBaseActions ? { fixedBaseActions } : {}),
    ...(trial.dpcOriginAudit ? { dpcOriginAudit: runStructuralDpcOriginAudit(resolved, trial.dpcOriginAudit.cutZMm) } : {}),
    ...(chordTurn ? { chordTurn: { ...chordTurn, drawing: drawChordTurn(comparison, chordTurn) } } : {}),
    evidence: {
      state: isReference && !keyContact && !placementTolerance ? 'historical-demand-comparison' : 'trial-only',
      installedAcceptance: false as const,
      outstanding: ['Continuous chord and wall cage', 'Imperforate ground splice', 'Coupled signed 52-head replay', 'Usable foul route and renewal'],
    },
  }
}
