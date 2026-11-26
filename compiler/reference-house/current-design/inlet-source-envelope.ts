import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { CurrentDesignResolution } from './resolve.js'
import type { runGroundSectionCase } from './structural-ground.js'
import {runHouseVerticalProfileCase} from './house-vertical-profile.js'
import { inletEntrySideCuts, drawInletIndoorCuts, inletSplitPlantStationComparison, drawInletSplitPlantStation, type SplitPlantStationChoice } from './inlet-indoor-cuts.js'
import {inletSplitPlantBranch,drawInletSplitPlantBranch,derivePlantFittedFrame,coordinatePlantFrameBranch,type SplitPlantBranchChoice} from './inlet-split-plant-branch.js'
import {inletSplitPlantRoom,drawInletSplitPlantRoom,admitSplitPlantRoomChoice,type SplitPlantRoomChoice} from './inlet-split-plant-room.js'
import {derivePlantReleaseProfiles} from '../../../project/had/studies/plant-release-profiles.mjs'
import { inletIndoorRoutes, compareInletIndoorRouteCandidate, inletRouteRetainedServices, drawInletIndoorRoutes, type IndoorRoutesInput } from './inlet-indoor-routes.js'
import { inletBankReceiver, drawInletBankReceiver } from './inlet-bank-receiver.js'
import { compareInletBankShelfCarrier, drawInletBankShelfCarrier, type InletBankShelfCandidate } from './inlet-bank-carrier.js'
import { inletStaticGravityMps2 } from './inlet-room-pan.js'
import { inletScreenFrame } from './inlet-screen-frame.js'
import { inletElectricalScreen } from './inlet-electrical-screen.js'
import { runInletRoomCatchment } from './inlet-room-catchment.js'
import { readBoundOccupiedServices } from './occupied-services.js'
import { inletCabinetProductFacts } from './inlet-cabinet-copper.js'
import { criticalHalfRoundFlow, receiverWeirHeadMm, reliefEntranceHeadMm, solveHalfRoundRelief,
  southInletReliefComparison } from '../../../project/had/studies/south-inlet-relief-hydraulics.mjs'

export const inletSourceEnvelopeFields = ['utilityApertureNominalMm', 'plantApertureNominalMm', 'apertureToleranceMm', 'sourceMaximumTotalBar',
  'sourceMinimumDynamicBar', 'requiredUtilityLmin', 'requiredPlantLmin', 'requiredResidualBar', 'utilityNetworkLossBar', 'plantNetworkLossBar',
  'dischargeCoefficientComparison', 'pressureRecoveryFractionComparison', 'atmosphericMinimumBar', 'atmosphericMaximumBar', 'mainboardNorthOffsetMm', 'mainboardBaseZMm', 'utilityPortalShiftXMm', 'shieldStandOffMm', 'shieldVerticalInsetMm', 'frameLowerConnectionZMm', 'frameAnchorOffsetMm', 'plantTransferZMm', 'plantWithdrawalLoweringZMm', 'catchmentClearWidthMm', 'catchmentClearHeightMm',
  'indoorBankXMm', 'indoorBankYMm', 'indoorUtilityAxisZMm', 'indoorPlantAxisZMm', 'indoorOperatorXMm', 'indoorOperatorYMm', 'indoorOperatorZMm', 'indoorMaintenanceShiftXMm', 'indoorMaintenanceShiftYMm', 'indoorWheelInboardMm', 'indoorDoorHingeNorthOfWallMm', 'pipeFrictionFactorComparison', 'pipeCornerKComparison', 'pipeTemperatureChangeK',
  'indoorTailOffsetMm', 'indoorUtilityReturnXMm', 'indoorWesternReturnXMm', 'indoorClampWidthMm', 'indoorClampHeightMm', 'indoorClampRadialThicknessMm', 'indoorToolAxialMm', 'indoorToolSouthStrokeMm', 'pipeJacketDensityComparisonKgM3', 'pipeInsulationDensityComparisonKgM3',
  'catchmentPocketDepthMm', 'catchmentIsolationGapMm', 'catchmentPanSlopeRatio', 'catchmentInvertAboveDistributionMm', 'catchmentReceiverWidthMm', 'catchmentReceiverCrestAboveGradeMm'] as const
export type InletSourceEnvelopeSettings = Readonly<Record<typeof inletSourceEnvelopeFields[number], number>>
export const readInletSourceEnvelopeSettings = (): InletSourceEnvelopeSettings => ({ utilityApertureNominalMm: 6.5, plantApertureNominalMm: 10.2,
  apertureToleranceMm: .1, sourceMaximumTotalBar: 9, sourceMinimumDynamicBar: 3.5, requiredUtilityLmin: 20, requiredPlantLmin: 45,
  requiredResidualBar: 1, utilityNetworkLossBar: .5, plantNetworkLossBar: 1, dischargeCoefficientComparison: .55,
  pressureRecoveryFractionComparison: 0, atmosphericMinimumBar: .9, atmosphericMaximumBar: 1.1, mainboardNorthOffsetMm: 250, mainboardBaseZMm: 900, utilityPortalShiftXMm: -100, shieldStandOffMm: 100, shieldVerticalInsetMm: 50, frameLowerConnectionZMm: 1100, frameAnchorOffsetMm: 89.5, plantTransferZMm: 2400, plantWithdrawalLoweringZMm: 2235, catchmentClearWidthMm: 400, catchmentClearHeightMm: 150,
  indoorBankXMm: 11360, indoorBankYMm: 2350, indoorUtilityAxisZMm: 1270, indoorPlantAxisZMm: 1890, indoorOperatorXMm: 10670, indoorOperatorYMm: 2430, indoorOperatorZMm: 1450, indoorMaintenanceShiftXMm: -100, indoorMaintenanceShiftYMm: -20, indoorWheelInboardMm: 40, indoorDoorHingeNorthOfWallMm: 50, pipeFrictionFactorComparison: .03, pipeCornerKComparison: .9, pipeTemperatureChangeK: 40,
  indoorTailOffsetMm:250, indoorUtilityReturnXMm:11150, indoorWesternReturnXMm:10040, indoorClampWidthMm:210, indoorClampHeightMm:25, indoorClampRadialThicknessMm:5, indoorToolAxialMm:30, indoorToolSouthStrokeMm:100, pipeJacketDensityComparisonKgM3:8000, pipeInsulationDensityComparisonKgM3:200,
  catchmentPocketDepthMm: 0, catchmentPanSlopeRatio: 100, catchmentIsolationGapMm: 50, catchmentInvertAboveDistributionMm: 60, catchmentReceiverWidthMm: 400, catchmentReceiverCrestAboveGradeMm: 0 })
/** Explicit unchanged geometry control; still uses current methods and required complete fields. */
export const readLegacyIndoorBankControlSettings=():InletSourceEnvelopeSettings=>({...readInletSourceEnvelopeSettings(),indoorBankXMm:11350,indoorUtilityAxisZMm:1350,indoorTailOffsetMm:200,indoorUtilityReturnXMm:11180})
/** Authored coordinated comparison; no house/source adoption. Ground remains530/65. */
export const readLocalUtilityPocketSettings = (): InletSourceEnvelopeSettings => ({ ...readInletSourceEnvelopeSettings(),
  catchmentPocketDepthMm: 245, catchmentIsolationGapMm: 50, catchmentInvertAboveDistributionMm: 55, plantApertureNominalMm: 10.4 })
const paths = ['project/had/studies/south-inlet-under-sill.json', 'project/had/studies/south-inlet-wet-box.json',
  'project/had/studies/south-inlet-relief.json', 'project/had/studies/south-utility-inlet.json',
  'project/had/studies/current-house-services.json', 'project/mat/studies/whole-house-service-baseline.json',
  'project/ias/studies/utility-first-release.json', 'project/had/studies/boundary-service-lodge.json', 'project/str/studies/current-house-grid.json', 'project/had/studies/inlet-bank-shelf-candidate.json', 'project/had/studies/utility-wide-capture.json', 'project/had/studies/inlet-route-candidate.json', 'project/had/studies/inlet-split-plant-station-candidate.json', 'project/had/studies/inlet-split-plant-branch-candidate.json','project/had/studies/inlet-fixed-station.json','project/had/studies/inlet-split-plant-room-candidate.json'] as const
const methodPaths = ['compiler/reference-house/current-design/house-vertical-profile.ts','project/had/studies/house_vertical_profile.py','compiler/reference-house/current-design/inlet-split-plant-room-choice.ts','compiler/reference-house/current-design/inlet-split-plant-room.ts','compiler/reference-house/current-design/inlet-split-plant-branch.ts', 'project/had/studies/plant-release-profiles.mjs', 'project/had/studies/incoming-water-geometry.mjs', 'compiler/reference-house/current-design/inlet-bank-carrier.ts', 'compiler/reference-house/current-design/inlet-bank-receiver.ts', 'project/had/studies/service-interface-geometry.mjs', 'compiler/reference-house/current-design/inlet-indoor-routes.ts', 'compiler/reference-house/current-design/inlet-indoor-cuts.ts', 'compiler/reference-house/current-design/inlet-source-envelope.ts',
  'compiler/reference-house/current-design/inlet-room-catchment.ts',
  'compiler/reference-house/current-design/inlet-room-pocket.ts',
  'compiler/reference-house/current-design/inlet-room-pan.ts',
  'compiler/reference-house/current-design/inlet-electrical-screen.ts',
  'compiler/reference-house/current-design/inlet-screen-frame.ts',
  'compiler/reference-house/current-design/inlet-fixed-receiver.ts',
  'project/had/studies/south-inlet-relief-hydraulics.mjs',
  'compiler/reference-house/current-design/inlet-cabinet-copper.ts'] as const
const blob = (bytes: Buffer) => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
const round = (n: number) => {
  if (!Number.isFinite(n)) throw new RangeError('Non-finite inlet source or hydraulic result')
  return Number(n.toFixed(6)) || 0
}
const flow = (diameterMm: number, pressureBar: number, coefficient = 1, density = 990) =>
  coefficient * Math.PI * (diameterMm / 1000) ** 2 / 4 * Math.sqrt(2 * pressureBar * 1e5 / density) * 60000
const diameter = (qLmin: number, pressureBar: number, coefficient = 1, density = 990) =>
  1000 * Math.sqrt(4 * qLmin / 60000 / (Math.PI * coefficient * Math.sqrt(2 * pressureBar * 1e5 / density)))

function binding(resolved: CurrentDesignResolution) {
  const family = resolved.disciplineBindings.find(value => value.id === 'had-fixed-inlet-arrangement')
  if (!family || resolved.design.source.kind !== 'georgian-layout-revision') throw new Error('Inlet source envelope requires the admitted current HAD family')
  const inputs: Record<string, string> = {}, methods: Record<string, string> = {}, data: Record<string, any> = {}
  for (const path of [...paths, ...methodPaths]) {
    const bytes = readFileSync(new URL('../../../' + path, import.meta.url)), hash = blob(bytes)
    if (family.identities[path] !== hash) throw new Error('Stale or missing inlet source-envelope binding: ' + path)
    if ((paths as readonly string[]).includes(path)) { inputs[path] = hash; data[path] = JSON.parse(bytes.toString('utf8')) }
    else methods[path] = hash
  }
  const occupied = readBoundOccupiedServices(resolved)
  return { planDigest: sha256SemanticFingerprint(resolved.design), bindingDigest: sha256SemanticFingerprint({ inputs, methods, occupiedDigest: occupied.binding.digest }),
    inputs, methods, data, occupied }
}
export function readInletSourceEnvelopeCase(resolved: CurrentDesignResolution) {
  const b = binding(resolved)
  return { schema: 'had-inlet-source-envelope-request/1' as const, design: resolved.design,
    sourceEnvelope: { schema: 'had-inlet-source-envelope-case/8' as const, planDigest: b.planDigest,
      bindingDigest: b.bindingDigest, settings: readInletSourceEnvelopeSettings(), splitPlantRoom:admitSplitPlantRoomChoice(b.data['project/had/studies/inlet-split-plant-room-candidate.json']) } }
}
function settings(value: unknown): InletSourceEnvelopeSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).length !== inletSourceEnvelopeFields.length
    || inletSourceEnvelopeFields.some(key => !Object.hasOwn(value, key))) throw new Error('Complete authored inlet source settings required')
  const s = value as InletSourceEnvelopeSettings
  if (inletSourceEnvelopeFields.some(key => !Number.isFinite(s[key])) || [s.utilityApertureNominalMm, s.plantApertureNominalMm].some(d => d < 4 || d > 20)
    || s.apertureToleranceMm < 0 || s.apertureToleranceMm > .5 || s.sourceMaximumTotalBar <= 0 || s.sourceMaximumTotalBar > 10
    || s.sourceMinimumDynamicBar <= 0 || s.sourceMinimumDynamicBar > s.sourceMaximumTotalBar || [s.requiredUtilityLmin, s.requiredPlantLmin].some(q => q <= 0 || q > 90) || s.requiredResidualBar < 0 || s.utilityNetworkLossBar < 0 || s.plantNetworkLossBar < 0
    || s.dischargeCoefficientComparison <= 0 || s.dischargeCoefficientComparison > 1 || s.pressureRecoveryFractionComparison < 0 || s.pressureRecoveryFractionComparison > 1
    ||s.indoorBankXMm<9000||s.indoorBankXMm>12000||s.indoorBankYMm<500||s.indoorBankYMm>2600
    ||s.indoorUtilityAxisZMm<700||s.indoorPlantAxisZMm<=s.indoorUtilityAxisZMm||s.indoorPlantAxisZMm>2300
    ||s.indoorOperatorXMm<9000||s.indoorOperatorXMm>12000||s.indoorOperatorYMm<1000||s.indoorOperatorYMm>3500||s.indoorOperatorZMm<1000||s.indoorOperatorZMm>1800
    ||Math.abs(s.indoorMaintenanceShiftXMm)>300||Math.abs(s.indoorMaintenanceShiftYMm)>300||s.indoorDoorHingeNorthOfWallMm< -30||s.indoorDoorHingeNorthOfWallMm>150
    ||s.indoorWheelInboardMm<0||s.indoorWheelInboardMm>80
    ||s.indoorTailOffsetMm<200||s.indoorTailOffsetMm>400||s.indoorUtilityReturnXMm>=s.indoorBankXMm||s.indoorWesternReturnXMm>=s.indoorUtilityReturnXMm
    ||s.indoorClampWidthMm<40||s.indoorClampHeightMm<=0||s.indoorClampRadialThicknessMm<=0||s.indoorToolAxialMm<=0||s.indoorToolSouthStrokeMm<=0
    ||s.pipeJacketDensityComparisonKgM3<=0||s.pipeJacketDensityComparisonKgM3>10000||s.pipeInsulationDensityComparisonKgM3<=0||s.pipeInsulationDensityComparisonKgM3>1000
    ||s.pipeFrictionFactorComparison<=0||s.pipeFrictionFactorComparison>.2||s.pipeCornerKComparison<0||s.pipeCornerKComparison>20||s.pipeTemperatureChangeK<0||s.pipeTemperatureChangeK>80
    ||s.frameAnchorOffsetMm<60||s.frameAnchorOffsetMm>250
    ||s.frameLowerConnectionZMm<500||s.frameLowerConnectionZMm>1500
    ||s.utilityPortalShiftXMm < -200 ||s.utilityPortalShiftXMm>0||s.shieldStandOffMm<25||s.shieldStandOffMm>150||s.shieldVerticalInsetMm<0||s.shieldVerticalInsetMm>100
    || s.mainboardBaseZMm < 300 || s.mainboardBaseZMm > 2700
    || s.plantWithdrawalLoweringZMm<2100||s.plantWithdrawalLoweringZMm>2600
    || s.mainboardNorthOffsetMm < -100 || s.mainboardNorthOffsetMm > 400 || s.plantTransferZMm < 2100 || s.plantTransferZMm > 2600
    || s.catchmentClearWidthMm < 150 || s.catchmentClearWidthMm > 450 || s.catchmentClearHeightMm < 60 || s.catchmentClearHeightMm > 250
    || s.catchmentPanSlopeRatio < 50 || s.catchmentPanSlopeRatio > 200
    || s.catchmentPocketDepthMm < 0 || s.catchmentPocketDepthMm > 350 || s.catchmentIsolationGapMm < 25 || s.catchmentIsolationGapMm > 100
    || s.catchmentInvertAboveDistributionMm < 30 || s.catchmentInvertAboveDistributionMm > 200
    || s.catchmentReceiverWidthMm < 300 || s.catchmentReceiverWidthMm > 800 || s.catchmentReceiverCrestAboveGradeMm < -500 || s.catchmentReceiverCrestAboveGradeMm > 1000
    || s.requiredUtilityLmin < 18 || s.requiredPlantLmin < 44 || s.atmosphericMinimumBar < .5 || s.atmosphericMaximumBar > 1.5 || s.atmosphericMinimumBar > s.atmosphericMaximumBar) throw new Error('Inlet source settings exceed the comparison domain')
  return s
}

export function runInletSourceEnvelopeCase(resolved: CurrentDesignResolution, input: unknown, ground?: ReturnType<typeof runGroundSectionCase>, profile?:ReturnType<typeof runHouseVerticalProfileCase>) {
  const b = binding(resolved)
  if (!input || typeof input !== 'object' || Array.isArray(input)
    || Object.keys(input).some(key=>!['schema','planDigest','bindingDigest','settings','splitPlantRoom'].includes(key)) || !['schema', 'planDigest', 'bindingDigest', 'settings'].every(key => Object.hasOwn(input, key))) throw new Error('Versioned source-bound inlet source-envelope case required')
  const v = input as Record<string, unknown>
  if (v.schema !== 'had-inlet-source-envelope-case/8' || v.planDigest !== b.planDigest || v.bindingDigest !== b.bindingDigest) throw new Error('Stale inlet source-envelope source, design or method')
  const currentRoomChoice=admitSplitPlantRoomChoice(b.data['project/had/studies/inlet-split-plant-room-candidate.json']),authoredRoomChoice=admitSplitPlantRoomChoice(Object.hasOwn(v,'splitPlantRoom')?v.splitPlantRoom:currentRoomChoice)
  if(authoredRoomChoice.id!==currentRoomChoice.id||authoredRoomChoice.fittedFrame.id!==currentRoomChoice.fittedFrame.id)throw Error('Unsupported saved Plant room object identity')
  const s = settings(v.settings), native = b.data[paths[0]], wet = b.data[paths[1]], relief = b.data[paths[2]], inlet = b.data[paths[3]], services = b.data[paths[4]]
  const groundDatumLiftMm = ground?.native.levelsMm.ffl ?? 0, groundDatumLiftBar = groundDatumLiftMm * 9.80665e-5,
    deliveryAtRoomDatumBar = s.sourceMinimumDynamicBar - groundDatumLiftBar,
    absoluteMaximumBar = s.sourceMaximumTotalBar + s.atmosphericMaximumBar + Math.max(0, -groundDatumLiftBar)
  const joinedProfile=profile?runHouseVerticalProfileCase(resolved,profile.authoredCase):undefined
  if(joinedProfile&&(!ground||joinedProfile.source.groundResultDigest!==sha256SemanticFingerprint(ground.native)||sha256SemanticFingerprint(joinedProfile)!==sha256SemanticFingerprint(profile)))throw Error('Unsupported inlet and house vertical profile ground/source join')
  const profileArch=(joinedProfile?.native.arches as readonly {id:string;datumsMm:{spring:number;head:number}}[]|undefined)?.find(a=>a.id==='GROUND/plant-replacement')
  if(joinedProfile&&!profileArch)throw Error('Unsupported joined Plant profile arch')
  const fullBoreMm = inletCabinetProductFacts.pipe.maximumOuterDiameterIncludingOvalityMm - 2 * inletCabinetProductFacts.pipe.minimumWallMm
  type Point = readonly [number, number, number]
  type Branch = { id: string; coordinates: readonly Point[]; bores: readonly { inner: Point; outer: Point; radius: number }[] }
  const branches = (native.branches as readonly Branch[]).map(branch => {
    if (!['utility', 'plant'].includes(branch.id)) throw new Error('Unsupported branch identity in the occupied inlet source')
    const utility = branch.id === 'utility', nominalMm = utility ? s.utilityApertureNominalMm : s.plantApertureNominalMm,
      requiredLmin = utility ? s.requiredUtilityLmin : s.requiredPlantLmin, networkLossBar = utility ? s.utilityNetworkLossBar : s.plantNetworkLossBar
    const maximumDiameterMm = nominalMm + s.apertureToleranceMm, minimumDiameterMm = nominalMm - s.apertureToleranceMm
    const maximumEachLmin = flow(maximumDiameterMm, absoluteMaximumBar)
  // A flooded throat may be below atmospheric after downstream pressure recovery.
  // Bound against zero absolute throat pressure, not an assumed atmospheric free jet.
  // Maximum flow uses Cd<=1 and the lowest declared density. Delivery LOSS uses density1000,
  // the smallest bore and an explicitly unqualified Cd comparison; these are different bounds.
    const throatDynamicBar = .5 * 1000 * (requiredLmin / 60000 / (s.dischargeCoefficientComparison * Math.PI * (minimumDiameterMm / 1000) ** 2 / 4)) ** 2 / 1e5
  const pressureLossBar = (1 - s.pressureRecoveryFractionComparison) * throatDynamicBar
  const throatAbsoluteBar = deliveryAtRoomDatumBar + s.atmosphericMinimumBar - throatDynamicBar
  const residualBar = deliveryAtRoomDatumBar - pressureLossBar - networkLossBar
  const availableRestrictionBar = deliveryAtRoomDatumBar - s.requiredResidualBar - networkLossBar
  const deliveryDiameter = (cd: number) => availableRestrictionBar >= 0
    && (availableRestrictionBar > 0 || s.pressureRecoveryFractionComparison === 1) ? Math.max(
    s.pressureRecoveryFractionComparison === 1 ? 0 : diameter(requiredLmin, availableRestrictionBar / (1 - s.pressureRecoveryFractionComparison), cd, 1000),
    diameter(requiredLmin, deliveryAtRoomDatumBar + s.atmosphericMinimumBar, cd, 1000)) : null
  const minimumDeliveryDiameterMm = deliveryDiameter(s.dischargeCoefficientComparison)
  const optimisticDeliveryDiameterMm = deliveryDiameter(1)
    const cell = wet.branches.find((item: any) => item.id === branch.id), lower = branch.bores[1], receiver = cell.case.exteriorReceiver
    const clear = inlet.hydro.sleeveConstructionMM.clearDiameter, bed = relief.hydraulics.downstreamBermMM, k = relief.hydraulics.designEntranceCoefficientCeiling
    const slope = (lower.inner[2] - lower.outer[2]) / (lower.inner[1] - lower.outer[1])
    const capacity = (q: number) => {
      const solved = solveHalfRoundRelief({ flowM3s: q / 60000, diameterM: clear / 1000, bedM: bed / 1000, slope, roughness: southInletReliefComparison.roughness })
      const entranceHeadMm = solved ? reliefEntranceHeadMm(solved, k) : null
      const receiverWaterZMm = receiver.overflowCrestZ + receiver.raisedCrestSensitivityMM + receiverWeirHeadMm({ flowM3s: q / 60000,
        widthM: receiver.adverseBottomOpenWidthMM / 1000, coefficient: southInletReliefComparison.receiverWeirCoefficient })
      const freeDropReserveMm = receiver.terminalInvertZ - receiverWaterZMm - 25 - southInletReliefComparison.settingMm
      return { entranceHeadMm: entranceHeadMm === null ? null : round(entranceHeadMm),
        crownReserveMm: solved ? round(clear - relief.hydraulics.spareAirMM - solved.critical * 1000) : null,
        staticHeadReserveMm: entranceHeadMm === null ? null : round(relief.hydraulics.staticHeadLimitMM - entranceHeadMm),
        receiverWaterZMm: round(receiverWaterZMm), freeDropReserveMm: round(freeDropReserveMm),
        necessaryChannelAndReceiverScreen: solved !== null && clear - relief.hydraulics.spareAirMM >= solved.critical * 1000
          && entranceHeadMm! <= relief.hydraulics.staticHeadLimitMM && freeDropReserveMm >= 0 }
    }
    let lo = 0, hi = 2000
    for (let step = 0; step < 70; step++) { const mid = (lo + hi) / 2; if (capacity(mid).necessaryChannelAndReceiverScreen) lo = mid; else hi = mid }
    const maximumScreenedLmin = lo, maximumContainmentDiameterMm = diameter(maximumScreenedLmin, absoluteMaximumBar)
    const nominalMinimumMm = minimumDeliveryDiameterMm === null ? null : minimumDeliveryDiameterMm + s.apertureToleranceMm
    const nominalMaximumMm = maximumContainmentDiameterMm - s.apertureToleranceMm
    const intervalExists = nominalMinimumMm !== null && nominalMinimumMm <= nominalMaximumMm
    return { id: branch.id, seriesPath: ['public utility source', `Lodge/${branch.id}/independent upstream cut`,
      `Lodge/${branch.id}/accessible fixed metal restriction`, `${branch.id}/joint-free replaceable wall spool`,
      `SERVICEHUB/${branch.id}/independent indoor house cut`, `${branch.id}/supported upper network and local appliance cuts`],
      sourceEntryAxisMm: branch.coordinates[1], retainedUpperDestinationMm: branch.coordinates.at(-1),
      internalHouseCut: { required: true, suppliedByLodge: false, suppliedByApplianceStop: false, location: 'unresolved-internal-wet-service-hub', usableOrdinaryAccessProved: false },
      maximumLimitedEachLmin: round(maximumEachLmin), requiredDeliveryEachLmin: requiredLmin, apertureNominalMm: nominalMm, apertureToleranceMm: s.apertureToleranceMm, minimumDiameterMm, maximumDiameterMm, additionalNetworkLossBar: networkLossBar, additionalGroundDatumLiftMm: groundDatumLiftMm, additionalGroundDatumLiftBar: round(groundDatumLiftBar),
      pressureLossComparisonBar: round(pressureLossBar), residualPressureComparisonBar: round(residualBar),
      throatAbsolutePressureComparisonBar: round(throatAbsoluteBar), nonnegativeThroatPressureScreen: throatAbsoluteBar >= 0,
      minimumResidualScreen: residualBar >= s.requiredResidualBar && throatAbsoluteBar >= 0, dischargeCoefficientQualified: false,
      existingReceiver: { lowerBore: lower, maximumScreenedLmin: round(maximumScreenedLmin),
        crownOnlyCapacityLmin: round(criticalHalfRoundFlow(clear / 1000, (clear - relief.hydraulics.spareAirMM) / 1000, bed / 1000) * 60000),
        limitedFault: capacity(maximumEachLmin), requiredDemandControl: capacity(requiredLmin),
        fullBoreWithoutRestriction: { maximumLmin: round(flow(fullBoreMm, absoluteMaximumBar)), ...capacity(flow(fullBoreMm, absoluteMaximumBar)) } },
      feasibleNominalApertureIntervalMm: { minimumForDelivery: nominalMinimumMm === null ? null : round(nominalMinimumMm),
        maximumForExistingReceiver: round(nominalMaximumMm), existsForNecessaryScreens: intervalExists,
        optimisticCdOneMinimumForDelivery: optimisticDeliveryDiameterMm === null ? null : round(optimisticDeliveryDiameterMm + s.apertureToleranceMm),
        optimisticCdOneIntervalExists: optimisticDeliveryDiameterMm !== null && optimisticDeliveryDiameterMm + s.apertureToleranceMm <= nominalMaximumMm,
        verdict: intervalExists ? 'necessary-hydraulic-interval-only' : 'reject-existing-receiver-plus-demand-envelope' },
      minimumSourceDynamicBarForExistingReceiverComparison: round(groundDatumLiftBar + Math.max(s.requiredResidualBar + networkLossBar
        + (1 - s.pressureRecoveryFractionComparison) * .5 * 1000 * (requiredLmin / 60000 / (s.dischargeCoefficientComparison * Math.PI * ((maximumContainmentDiameterMm - 2 * s.apertureToleranceMm) / 1000) ** 2 / 4)) ** 2 / 1e5,
        .5 * 1000 * (requiredLmin / 60000 / (s.dischargeCoefficientComparison * Math.PI * ((maximumContainmentDiameterMm - 2 * s.apertureToleranceMm) / 1000) ** 2 / 4)) ** 2 / 1e5 - s.atmosphericMinimumBar)) }
  })
  const maximumCombinedLmin = round(branches.reduce((total, branch) => total + branch.maximumLimitedEachLmin, 0))
    const joinedDirection = joinedServiceDirection(resolved, b, s, branches, absoluteMaximumBar, groundDatumLiftMm,authoredRoomChoice,profileArch),
    rawCatchment = runInletRoomCatchment(resolved, ground, maximumCombinedLmin, { planMm: joinedDirection.room.wetUtilityPlanMm,
      rawWindowXMm: joinedDirection.room.southWindowOpeningXMm, retainedFurniture: joinedDirection.room.retainedFurniture,
      northOpeningXMm: joinedDirection.room.northOpeningXMm, purgeBodyMm: joinedDirection.room.purge.body, wallFacesYMm: [native.branches[0].bores[0].outer[1], native.branches[0].bores[0].inner[1]] }, s, b.data['project/str/studies/current-house-grid.json'])
  if(rawCatchment.state==='whole-room-development-comparison'&&!ground)throw new Error('A computed room inventory requires its actual saved ground case')
  const roomCatchment=rawCatchment.state==='whole-room-development-comparison'
    ?{...rawCatchment,verticalInventory:inletVerticalInventory(rawCatchment,joinedDirection,ground!)}:rawCatchment
  const plantBranch=joinedDirection.room.indoorRoutes.splitStationComparison.branchDevelopment.comparison,
    splitPlantRoom=(()=>{
      if(!plantBranch)return{state:'unsupported-current-source' as const,selected:false as const,diagnostics:['SPLIT_PLANT_ROOM/current-branch-required'],comparison:null}
      const currentChoice=currentRoomChoice,choice=authoredRoomChoice,
        levels=ground?.native.levelsMm as Record<string,any>|undefined,raw=services.plant.cylinder.doorRaw,
        actualArch=(b.occupied.house.model as any).archOpeningRegister.GROUND.find((a:any)=>a.id==='plant-replacement'),
        cargo=services.plant.cylinder.minDoor[0],cargoYMm=[(raw[0]+raw[1]-cargo)/2,(raw[0]+raw[1]+cargo)/2] as const,
        reference={plateWidthYMm:[cargoYMm[0]+choice.bridgePlateCargoInsetsYMm[0],cargoYMm[1]-choice.bridgePlateCargoInsetsYMm[1]] as const,outerEdgeXMm:plantBranch.choice.sourceEntryMm[0],wheelActionIncludingDynamicN:choice.referenceWheelActionIncludingDynamicN,wheelBandMm:choice.referenceWheelBandMm,elasticModulusMPa:choice.referenceElasticModulusMPa,steelDensityKgM3:choice.referenceSteelDensityKgM3,proofComparisonMPa:choice.referenceProofComparisonMPa},
        candidateGroundUnsupported=levels&&choice.localPocketDepthMm<=levels.accessibleDistribution[1]-levels.accessibleDistribution[0]
      if(choice.id!==currentChoice.id)throw Error('Unsupported saved Plant room object identity')
      // This particular245mm local-pocket recipe requires a deeper cut than
      // the actual global zone. Other valid ground/Utility/source comparisons
      // still compute; no historical Plant result substitutes for this case.
      if(candidateGroundUnsupported)return{choiceOwnership:Object.hasOwn(v,'splitPlantRoom')?'complete-authored-request':'bound-current-source-default',state:'unsupported-current-ground' as const,selected:false as const,diagnostics:['SPLIT_PLANT_ROOM/local-pocket-not-deeper-than-saved-distribution'],unsupportedGround:{groundCaseDigest:ground!.source.caseDigest,distributionMm:levels.accessibleDistribution,globalDistributionDepthMm:levels.accessibleDistribution[1]-levels.accessibleDistribution[0],requestedLocalPocketDepthMm:choice.localPocketDepthMm},comparison:null}
      const result=(()=>{return inletSplitPlantRoom({choice,branch:plantBranch,rawArchVerticalInput:{rawSpringMm:actualArch?.spring,rawHeadMm:actualArch?.head,groundFflMm:groundDatumLiftMm,minimumCargoHeightMm:services.plant.cylinder.minDoor[1],settingEachMm:choice.settingMm,...(profileArch&&joinedProfile?{translatedProfile:{springAbsoluteMm:profileArch.datumsMm.spring,headAbsoluteMm:profileArch.datumsMm.head,occupiedShiftMm:(joinedProfile.native.transforms as any).occupiedTranslationMm,groundCaseDigest:joinedProfile.source.groundCaseDigest,profileCaseDigest:joinedProfile.source.caseDigest}}:{})},sourceMaximumAbsoluteBar:absoluteMaximumBar,sourceMaximumPlantLmin:branches.find(v=>v.id==='plant')!.maximumLimitedEachLmin,rawEastOpeningYMm:raw,cargoClearYMm:cargoYMm,eastOuterXMm:resolved.design.envelope.widthMm+Math.abs(native.branches[0].bores[0].outer[1]),
          ...(levels?{ground:{ffl:levels.ffl,mineralCourse:levels.mineralCourse,dryRC:levels.dryRC,glass:levels.glass,accessibleDistribution:levels.accessibleDistribution,finish:levels.finish,coldGridTop:levels.coldGridTop,exteriorGrade:levels.authoredExteriorGrade,rcDensityKNm3:(ground!.authoredCase.settings as any).rcDensityKNm3,mineralDensityKNm3:(ground!.authoredCase.settings as any).mineralDensityBudgetKNm3}}:{}),
          grid:b.data['project/str/studies/current-house-grid.json'],threshold:reference,exteriorPlanObstacles:[{id:'actual-east-foul-downstack-territory',planMm:b.data[paths[5]].eastFoulExit.externalDownstackBodyTerritory}],bridgeHomeObstacles:[{id:'actual-Plant-valve-body',boxMm:plantBranch.referenceValve.bodyMm},{id:'actual-Plant-valve-stem',boxMm:plantBranch.referenceValve.stemMm},...plantBranch.obstacles.filter(o=>o.id!=='actual-radiator-renewal-reservation'),...(b.occupied.house.model as any).architecturalServices.emitters.filter((e:any)=>e.id==='plant-N').map((e:any)=>({id:'actual-plant-radiator-home',boxMm:[...e.completePlanWithValvesAndBrackets.slice(0,2),e.bottomLocal,...e.completePlanWithValvesAndBrackets.slice(2),e.topLocal-e.bottomLocal] as const}))],
          stored:{family:services.plant.cylinder.family,orderedMinimumUsableL:services.plant.cylinder.orderedMinUsableL,catalogueComparatorL:services.plant.cylinder.catalogueL,maximumRetainedAndDrainableL:null,d2OutfallMm:services.plant.independentSafety.outfall}})})()
      return{choiceOwnership:Object.hasOwn(v,'splitPlantRoom')?'complete-authored-request':'bound-current-source-default',state:result.state,selected:false as const,diagnostics:result.diagnostics,comparison:{...result,reviewSvg:drawInletSplitPlantRoom(result)}}
    })()
  const states = [
    { id: 'plant-stored-water-backflow', sourceFed: false, eachLmin: null, result: 'actual-factory-release-model-required', obligation: 'Catalogue/minimum litres are not maximum inventory. Model actual store/expansion/upper-pipe pressure, nonreturn and anti-vacuum states; the Lodge aperture does not bound this release.' },
    { id: 'utility-crossfeed-from-plant', sourceFed: true, eachLmin: null, result: 'retire-cold-link-and-separate-pillar-taps', obligation: 'Retire the original Plant-fed Utility cold link and exclude mixer crossconnection using actual independent air-gapped taps. No invented nonreturn protection.' },
    { id: 'wet-room-door-open-mainboard', sourceFed: true, eachLmin: null, result: 'assembled-jet-and-dry-escape-unqualified', obligation: 'Move PV to a separated dry Streethead occurrence; qualify actual mainboard seams, entries, heat and source-jet duty with the Utility door open. Source/store isolation is required before cabinet opening.' },
    { id: 'ordinary-both-open', sourceFed: true, byBranchLmin: { utility: s.requiredUtilityLmin, plant: s.requiredPlantLmin }, combinedLmin: s.requiredUtilityLmin + s.requiredPlantLmin, result: 'unqualified-delivery-and-internal-access', obligation: 'Prove simultaneous two-branch source curve, actual restriction Cd, full valves and network losses; no double allocation of one source.' },
    { id: 'downstream-house-cut-closed', sourceFed: true, eachLmin: 0, result: 'full-source-static-pressure-retained', obligation: 'A restriction does not reduce shut-in pressure; all pressure components still require the complete maximum pressure and transient envelope.' },
    { id: 'one-wall-spool-ruptures-primary-mouth-blocked', sourceFed: true, byBranchLmin: Object.fromEntries(branches.map(branch => [branch.id, branch.maximumLimitedEachLmin])), result: branches.every((c: any) => c.existingReceiver.limitedFault.necessaryChannelAndReceiverScreen) ? 'necessary-channel-only' : 'reject-existing-channel', obligation: 'Actual low receiver, reverse sleeve, impact shield, support and wet seams still require joined proof.' },
    { id: 'downstream-indoor-cut-or-upper-joint-fault', sourceFed: true, byBranchLmin: Object.fromEntries(branches.map(branch => [branch.id, branch.maximumLimitedEachLmin])), result: 'reject-uncontained-upper-network', obligation: 'Low entry containment does not catch the relocated house cut or upper joints. Replan the complete internal wet station; do not reuse the rejected tall cabinet.' },
    { id: 'both-branches-rupture', sourceFed: true, byBranchLmin: Object.fromEntries(branches.map(branch => [branch.id, branch.maximumLimitedEachLmin])), combinedLmin: maximumCombinedLmin, result: 'separate-outfall-and-common-site-proof-required', obligation: 'Charge both flows independently. One receiving depression, obstruction or site flood cannot be credited twice.' },
    { id: 'secondary-high-or-submerged', sourceFed: true, byBranchLmin: Object.fromEntries(branches.map(branch => [branch.id, branch.maximumLimitedEachLmin])), result: 'reject-tailwater-outside-envelope', obligation: 'The free-drop model is inapplicable; no pressure-backed or submerged outlet credit.' },
    { id: 'both-reliefs-blocked', sourceFed: true, byBranchLmin: Object.fromEntries(branches.map(branch => [branch.id, branch.maximumLimitedEachLmin])), result: 'reject-unattended-event', obligation: 'Finite storage is time to spill, not isolation. No manual response time is assigned.' },
    { id: 'restriction-missing-eroded-or-bypassed', sourceFed: true, eachLmin: round(flow(fullBoreMm, absoluteMaximumBar)), result: 'reject-limited-flow-credit', obligation: 'Use full-bore source bound, tamper/effective-bore inspection and no bypass. A nameplate flow setting is insufficient.' },
    { id: 'upstream-of-restriction-rupture', sourceFed: true, eachLmin: null, result: 'separate-boundary-wet-territory-required', obligation: 'Keep restriction immediately after the Lodge cut and all upstream joints outside the house. Public-side flow is not bounded by this aperture; independent provider action remains required.' },
    { id: 'own-branch-isolated-sibling-live', sourceFed: false, eachLmin: 0, result: 'own-branch-cold-work-only', obligation: 'Close own Lodge and house cuts; isolate/drain the upper trapped network and prove zero pressure. Keep sibling enclosure and supports independent.' },
    { id: 'restriction-or-house-cut-renewal', sourceFed: false, eachLmin: 0, result: 'two-sided-cold-isolation-required', obligation: 'Close Lodge/provider side as applicable and isolate/drain house side; support both pipe ends. Restriction removal temporarily destroys the flow bound; prohibit charging until verified reinstatement.' },
    { id: 'wall-spool-renewal-inward-and-outward', sourceFed: false, eachLmin: 0, result: 'retained-pan-inward-conflict-not-discharged', obligation: 'The prior permanent-pan and ordinary operator/tool/rest conflicts remain. New room geometry must prove both actual extraction directions or explicitly reject one with a complete ordinary alternative.' },
    { id: 'frost-or-loss-of-warmth', sourceFed: false, eachLmin: null, result: 'whole-route-thermal-proof-required', obligation: 'Restriction, Lodge, spool and room drains must stay serviceable through the declared cold event. Permanent open spill slots do not establish a warm enclosure; no trace heating, antifreeze or moving flap is invented.' },
  ]
  const result = { schema: 'had-inlet-source-envelope-result/7' as const, state: 'existing-whole-arrangement-rejected' as const,
    source: { planDigest: b.planDigest, bindingDigest: b.bindingDigest, inputs: b.inputs, methods: b.methods }, settings: s,
    bound: { method: 'Incompressible energy comparison Q<=A sqrt(2 p_total_absolute/rho), Cd<=1, local pressure>=0absolute; recovery/cavitation qualification remains required.',
      maximumAbsoluteTotalBar: absoluteMaximumBar, minimumThroatAbsoluteBarForUpperBound: 0,
      pressureRecoveryAndCavitationQualified: false,
      minimumDensityKgM3: 990, maximumDensityKgM3ForDeliveryLoss: 1000, declaredWaterDomainC: [0, 40], densityDomainQualification: 'authored-water-comparison-bound',
      maximumPressureIncludesStaticDynamicElevationAndTransientHead: true, installedSourceMaximumProved: false,
      pressureRecoveryFractionIsAuthoredComparisonNotProductEvidence: true,
      maximumCombinedLmin, branchMaximumsLmin: Object.fromEntries(branches.map(branch => [branch.id, branch.maximumLimitedEachLmin])),
      sourceMinimumIsAtSimultaneousDemand: true, sourcePressureReferenceDatumMm: 0, additionalGroundDatumLiftMm: groundDatumLiftMm,
      sourceToRoomLiftDebitedSeparately: true, existingNetworkLossBudgetIncludesRetainedRoomToFixtureRise: true,
      sourceDatumAndInternalPressureBudgetQualified: false, deliveryCdIsComparisonNotGuaranteedLowerBound: true }, branches, states, joinedDirection, roomCatchment, splitPlantRoom,
    architectureDecision: { prefer: 'internal-wet-utility-and-service-hub-replan',
      reject: ['further-tall-cabinet-glands-and-local-steel', 'adopt-low-box-without-genuine-internal-house-cuts', 'default-east-annex'],
      retainedPlantCylinderPathMm: services.plant.cylinder.path, retainedBufferStationMm: services.plant.primaryBuffer.station,
      retainedD2OutfallMm: services.plant.independentSafety.outfall, retainedUtilityElectricalFieldMm: services.utility.electricalWorkingField,
      selectedReferenceDutiesLmin: { utility: s.requiredUtilityLmin, plant: s.requiredPlantLmin },
      electricalDirection: 'sealed-indoor-mainboard-and-independent-streethead-pv',
      rationale: 'The current small lobby is circulation, the Utility valve bay already contains rack/waste duties, and the plant control reservation is occupied. None is spare room. Replan the whole Utility wet station and separate its electrical task before adding footprint, roof, openings and another frost boundary.',
      newRoomGeometryAuthored: true, electricalRelocationSelected: false, replacementOccupiedHouseCompiled: false, annexSelected: false },
    materials: { valve: inletCabinetProductFacts.valve.model, knownPolymerItemsAcrossTwoValves: 6, ownerExceptionsApproved: 0,
      fixedRestrictionAllConstituentsQualified: false, potableApprovalQualified: false },
    selected: false, preSiteArrangementComplete: false, installedAcceptance: false }
  return { ...result, reviewSvg: draw(result) }
}


/** One source-bound architectural direction. Geometry is a proposal, never a replacement occupied-house pass. */
function inletVerticalInventory(c:Extract<ReturnType<typeof runInletRoomCatchment>,{state:'whole-room-development-comparison'}>,
  direction:ReturnType<typeof joinedServiceDirection>,ground:ReturnType<typeof runGroundSectionCase>) {
  const pan=c.room.actualGradedPan,pipes=c.room.closedOutfalls,frame=direction.room.electricalScreen.supportFrame,
    [x,y,width,depth]=c.wetFloorPlanMm,origin=[x+width/2,y+depth/2,(ground.native.levelsMm as unknown as Record<string,number>).coldGridTop],
    keys=['Fx','Fy','Fz','Mx','My','Mz'] as const,
    summary=(id:string,event:string,loads:readonly{massKg:number;massCentroidXYZMm:readonly number[];wrenchKN_KNm:Record<typeof keys[number],number>}[])=>{
      const mass=loads.reduce((s,l)=>s+l.massKg,0)
      return{id,event,massKg:mass,massCentroidXYZMm:mass?origin.map((_v,i)=>loads.reduce((s,l)=>s+l.massKg*l.massCentroidXYZMm[i],0)/mass):null,
        originMm:origin,wrenchKN_KNm:Object.fromEntries(keys.map(k=>[k,loads.reduce((s,l)=>s+l.wrenchKN_KNm[k],0)])),
        sourcePieceIds:loads.map((l:any)=>l.id),installedSupportQualified:false}
    },
    panStock=pan.afterLowerSettingDevelopedSheetUpperKg===null?null:summary('HAD/inventory/pan-developed-stock-low-bed','permanent-reference-stock',pan.upperMetalStockCase.loadOrigins),
    bodyStock=pipes.map(p=>summary(p.id+'/inventory-copper-body','permanent-reference-stock',[p.bodyStockGravity])),
    panWater=pan.afterLowerSettingGrossWaterToFloorUpperKg===null?null:summary('HAD/inventory/pan-water-low-bed-to-flush-floor','both-blocked-before-overflow-comparison',pan.waterLoadOrigins),
    pipeWater=pipes.map(p=>summary(p.id+'/inventory-full-water','same-both-blocked-comparison',[p.fullWaterInventoryControl])),
    frameMass=frame.quantities.totalReferenceKg,
    frameStock={id:'HAD/inventory/shield-frame-stock',event:'permanent-reference-stock',massKg:frameMass,
      massCentroidXYZMm:null,coordinateDatum:'Existing nominal occupied groundFFL0 frame geometry; no ground-candidate translation/adoption executed.',
      forceKN:[0,0,-frameMass*inletStaticGravityMps2],fullGravityMomentKNm:null,
      sourceGeometry:'joinedDirection.room.electricalScreen.supportFrame:members,panelSeats,panelRetainers; electricalScreen.panels',
      actualConnectionOriginsMm:frame.structuralHandoff.attachmentPointsMm,
      missing:'Actual4kg nut/washer/bolt budget distribution and returned-cover developed-stock centroids; weld/unknown hardware mass. Use actual member/sheet pieces and existing nonconcurrent core-interface envelopes, not a fabricated aggregate centroid or four summed envelopes.'},
    bounds=pipes.map(p=>{const v=p.clearCornersMm;return{id:p.id,x:[Math.min(...v.map(v=>v[0])),Math.max(...v.map(v=>v[0]))],
      y:[Math.min(...v.map(v=>v[1])),Math.max(...v.map(v=>v[1]))],nominalEndpointsMm:[v[0],v[2]],
      nominalPrismCentroidMm:p.bodyStockGravity.massCentroidXYZMm,lowBedWaterCentroidMm:p.fullWaterInventoryControl.massCentroidXYZMm}}),
    roomPortTouch=bounds.every(b=>b.y[1]===y),
    pairwiseDisjoint=bounds.every((a,i)=>bounds.every((b,j)=>i===j||a.x[1]<=b.x[0]||b.x[1]<=a.x[0]||a.y[1]<=b.y[0]||b.y[1]<=a.y[0])),
    positiveVolumeDisjoint=roomPortTouch&&pairwiseDisjoint&&bounds.every(b=>b.y[1]<=y),
    dead=panStock?panStock.massKg+bodyStock.reduce((s,b)=>s+b.massKg,0)+frameMass:null,
    water=panWater?panWater.massKg+pipeWater.reduce((s,b)=>s+b.massKg,0):null
  return{schema:'had-service-room-vertical-inventory/1',id:'HAD/utility-room/vertical-inventory',selected:false,
    source:{...c.groundAuthority,sourcePlanId:ground.source.id},units:{mass:'kg',length:'mm',force:'kN',moment:'kNm',staticGravityMps2:inletStaticGravityMps2},
    groundDatum:'Pan, local plate/mineral and outfalls use exact saved-ground absolute coordinates. SourceSTR ground0 and the nominal-FFL0 shield are NOT silently transformed or loaded.',
    proposedFrameTranslationMm:[0,0,c.levelsMm.ffl],frameTranslationAndMasonryLoadPathAdmitted:false,
    permanentReferenceStock:[...(panStock?[panStock]:[]),...bodyStock,frameStock],
    blockedEventWaterInventory:[...(panWater?[panWater]:[]),...pipeWater],
    ownership:{panWaterPlanMinMaxMm:[x,y,x+width,y+depth],openChutesIncludedInsidePanWaterOnce:true,
      actualClosedPassageBounds:bounds,sharedWallHydraulicCutYMm:y,sharedCutsHaveZeroVolume:true,
      positiveVolumeDisjoint,waterMassSubtotalsCanCombine:positiveVolumeDisjoint&&panWater!==null,
      metalFoldSeamAndToleranceOverlapQualified:false,
      hydraulicFaceAndCutLoadsAreNotExtraWaterGravity:'Use their independent weight controls for equilibrium only; do not add them again to the metal pressure actions of the same water.'},
    requestedReferenceSubtotals:{deadStockKg:dead,blockedBelowFloorAndFullClosedBodyWaterKg:positiveVolumeDisjoint?water:null,
      concurrentRequestedMassKg:dead!==null&&water!==null&&positiveVolumeDisjoint?dead+water:null,
      wholeHouseOrWholeFaultMaximumKg:null,fullCombinedWrench:null,headShares:null},
    localFloorReplacement:c.localPocket?{id:c.localPocket.id,planMinMaxMm:c.localPocket.bodyMinMaxMm,levelBoxes:c.localPocket.levelBoxes,
      replacementRcAndMineralKN:c.localPocket.quantityBounds.slabAndMineralWeightKN,
      sourceLoadOrigins:c.localPocket.loadOrigins,notAutomaticallyAdditionalToExistingFloor:true,
      mineralContactUnionM2:c.localPocket.contactUnionM2,disjointContactCells:c.localPocket.disjointContactCells,
      physicalReceiverPath:[
        `Pan, removable walking floor and actual seats/stands → local RC${c.localPocket.levelBoxes.find(b=>b.id==='dryRC')!.zMm.join('..')}: actual attachments, spans, resistance and full temporary/removal actions unqualified.`,
        `Local RC plate → mineral${c.localPocket.levelBoxes.find(b=>b.id==='mineralCourse')!.zMm.join('..')} on the exact${c.localPocket.contactUnionM2}m² contact union: local plate/contact, bed pressure/shear, mineral bond/retention and anti-slip evidence unqualified.`,
        'Mineral/contact → actual spine, outer-E, outer-S, utility-north cold-grid strips/caps at−180: no arbitrary distribution or positive receiver resistance inferred.',
        `Actual grid → existing52 heads/foundation/soil: thisFFL${c.levelsMm.ffl}/local-pocket arrangement has no compatible candidate solve, signed head actions or foundation resistance.`
      ],wallAndExteriorDpcRetainedMm:c.localPocket.wallAndExteriorDpcMm}:null,
    independentFrameReceiver:'Actual opposed140mm cores → named wall ground receivers → grid/52heads remains unqualified; wall-hung frame is not supported by this pan or local floor.',
    closedBodyReceiver:'Actual wall/outside copper bodies have no qualified independent seats/anchors/thermal restraints or weather receivers. Join the real inside/outside hydraulic cuts once, then derive actual support actions; do not assign their centroid wrench to arbitrary grid heads.',
    independentMainboardCaseReference:{emptyKg:direction.room.newMainboard.emptyKg,
      grossBoxMm:direction.room.newMainboard.proposedGrossBoxMm,actualLoadedMassAndCentroidQualified:false,includedInRequestedSubtotals:false},
    missingMassAndEvents:['Pan bends/seams/seats/insulation and walking/perimeter covers; complete ordinary removal rests and access-equipment reactions.',
      'Closed-body weather jackets/insulation, joints, pressure/thermal restraints and receiving supports.',
      'Frame unknown weld/hardware; mainboard actual contents/doors/cables; separate Streethead PV stock and supports.',
      'Actual hot/store/upper-network release, flooded room above flush floor, transient source jet/air loads and real adverse site tailwater. No whole-fault cap or manual-response credit.'],
    diagnostics:[...(!positiveVolumeDisjoint?['INLET_PAN_CLOSED_OUTFALL_WATER_OWNERSHIP_MISMATCH']:[]),
      'INLET_VERTICAL_INVENTORY_NOT_ADOPTED_IN_SOURCE_STR_GROUND0','INLET_LOCAL_RC_MINERAL_RETENTION_GRID_AND_SOIL_PATH_UNQUALIFIED']}
}

function joinedServiceDirection(resolved: CurrentDesignResolution, b: ReturnType<typeof binding>, s: InletSourceEnvelopeSettings, branches: readonly any[], maximumAbsoluteBar: number, groundFflMm: number,plantRoomChoice:SplitPlantRoomChoice,profileArch?:{id:string;datumsMm:{spring:number;head:number}}) {
  const model = b.occupied.house.model as unknown as { architecturalServices: any; groundWalls: any[]; shell: number; envelope: number; groundFurniture: Record<string, readonly number[]>; plantReferenceDoor: any; archOpeningRegister: any; serviceMaintenanceFields: any[]; internalArchControls: any }, services = model.architecturalServices, utilityWall = model.groundWalls.find((w: any) => w.id === 'utility-north'),
    spine = model.groundWalls.find((w: any) => w.id === 'service-spine'), plantWall = model.groundWalls.find((w: any) => w.id === 'plant-intermediate-arch')
  if (!utilityWall || !spine || !plantWall || utilityWall.holes.length !== 1 || plantWall.holes.length !== 1) throw new Error('Unsupported joined Utility/Plant room topology')
  const west = spine.finishedFaces[1], east = model.shell - model.envelope, north = utilityWall.finishedFaces[0], lobbySouth = utilityWall.finishedFaces[1],
    fixtures = b.data[paths[5]].fixtures as readonly {id: string; duties: string[]}[], utilityIds = ['utility-sink-PROPOSED', 'washer-PROPOSED']
  if (fixtures.length !== 14 || utilityIds.some(id => !fixtures.some(f => f.id === id))) throw new Error('Changed fixture inventory requires an explicit branch-demand/topology disposition')
  const board = { model: 'nVent HDW0606130', bodyWidthMm: 610, rearHeightMm: 605, frontHeightMm: 430, bodyDepthMm: 300,
    wallStandOffMm: 50, roofOverhangMm: 30, emptyKg: 26.5, passiveOnWallWAt20K: 108, doorOpenDeg: 120,
    gasket: 'replaceable silicone', actualBoardContentsSelected: false, assembledHeatLossW: null,
    completeJetDutyQualified: false, ownerMaterialExceptionApproved: false,
    jetComparison: { coldOnly: true, nozzlePressureIsNotImpactEquivalence: true,
      ip69kComparator: { nozzleBar: 100, flowLmin: 16, nozzle: '30-degree fan', standOffMm: [100, 150],
        idealIncidentMomentumN: round(1000 * 16 / 60000 * Math.sqrt(2 * 100e5 / 1000)) },
      sourceAirVelocityUpperMps: round(Math.sqrt(2 * (maximumAbsoluteBar - s.atmosphericMinimumBar) * 1e5 / 990)),
      byBranch: branches.map(c => { const momentum = 1000 * c.maximumLimitedEachLmin / 60000 * Math.sqrt(2 * (maximumAbsoluteBar - s.atmosphericMinimumBar) * 1e5 / 990);
        return { id: c.id, incidentMomentumUpperN: round(momentum), fullReversalUpperN: round(2 * momentum) } }),
      actualFootprintSeamsDurationPenetrationsAndStoredHotReleaseQualified: false,
      source: 'https://www.nvent.com/sites/default/files/dam/cat-00059_chapter13.pdf' },
    sources: ['https://www.nvent.com/en-us/hoffman/products/enchdw0606130/pdf', 'https://www.nvent.com/sites/default/files/dam/hoffman-im-hdw-mi-manual-usen-2108.pdf'] }
  const sourceUtilityOpening=[...utilityWall.holes[0]],candidateUtilityOpening=sourceUtilityOpening.map((v:number)=>v+s.utilityPortalShiftXMm)
  const candidateUtilityWall={...utilityWall,holes:[candidateUtilityOpening]}
  const depth = board.bodyDepthMm + board.wallStandOffMm + board.roofOverhangMm,
    boardBox = [east - depth, lobbySouth + s.mainboardNorthOffsetMm, s.mainboardBaseZMm, depth, board.bodyWidthMm, board.rearHeightMm],
    normalPathX = model.plantReferenceDoor.operatorCentrePath[1][0], normalBodyR = model.plantReferenceDoor.retainedBodyRadius,
    intermediateFloor = resolved.design.assemblies.find(a => a.id === resolved.design.assemblyRefs['intermediate-floor']),
    clearHeight = resolved.design.storeys.FIRST.elevationMm - resolved.design.storeys.GROUND.elevationMm - (intermediateFloor?.depthMm ?? NaN),
    sourceAirVelocity = Math.sqrt(2 * (maximumAbsoluteBar - s.atmosphericMinimumBar) * 1e5 / 990),
    dryScreen = inletElectricalScreen({ boardBoxMm: boardBox,
      lobbyYMm: [lobbySouth, plantWall.finishedFaces[0]],
      portalMaximumXMm: [candidateUtilityOpening[1], plantWall.holes[0][1]],portalMinimumXMm:[candidateUtilityOpening[0],plantWall.holes[0][0]],
      standOffMm:s.shieldStandOffMm,horizontalInsetMm:5,verticalInsetMm:s.shieldVerticalInsetMm,clearHeightMm: clearHeight,
      ordinaryBody: { axisXMm: normalPathX, radiusMm: normalBodyR },
      fullReversalUpperN: branches.map(c => 2 * 1000 * c.maximumLimitedEachLmin / 60000 * sourceAirVelocity) })
  const frame=inletScreenFrame({planeXMm:dryScreen.barrierPlaneMm.x,board:boardBox,panelY:dryScreen.barrierPlaneMm.y,panelZ:dryScreen.barrierPlaneMm.z,
    lowerConnectionZMm:s.frameLowerConnectionZMm,anchorOffsetMm:s.frameAnchorOffsetMm,clearHeightMm:clearHeight,sheetKg:dryScreen.actions.totalFlatSheetOnlyKg,sourceReversalN:dryScreen.actions.simultaneousPairN,panelCount:dryScreen.panels.length,
    walls:[{id:utilityWall.id,coreY:utilityWall.structuralCore,finishesY:utilityWall.finishedFaces,portalX:candidateUtilityOpening},{id:plantWall.id,coreY:plantWall.structuralCore,finishesY:plantWall.finishedFaces,portalX:plantWall.holes[0]}]})
  const plantEmitter=services.emitters.find((e:any)=>e.id==='plant-N'),utilityPlatform=model.serviceMaintenanceFields.find((f:any)=>f.id==='utility').platform,
    plantToolLower=frame.connections.filter(c=>c.wallId===plantWall.id).map(c=>c.localZMm-50-200),
    opposedAccess={nutToolRadiusComparisonMm:200,actualToolAndHandAdmission:false,
      plantRadiator:{id:plantEmitter.id,bodyTopMm:plantEmitter.topLocal,renewalLiftMm:plantEmitter.renewal.requiredLift,frontPullMm:plantEmitter.renewal.requiredFrontPull,
        toolAfterLiftAnd10Mm:Math.min(...plantToolLower)-plantEmitter.topLocal-plantEmitter.renewal.requiredLift-10},
      utilityEquipmentFieldMm:utilityPlatform,utilityCoverToEquipmentPlanMm:Math.min(...frame.connections.filter(c=>c.wallId===utilityWall.id).map(c=>utilityWall.finishedFaces[0]-40-utilityPlatform[1]-utilityPlatform[3]-10)),
      utilityHeadWorkerAndCompleteToolSweepQualified:false,opposedPlateWithdrawal:'Both water branches and stored inventory isolated/drained; utilityAC andPVAC independently isolated. Retain whole frame on independent rated capture before removing any load-bearing rod or backing plate. Both room faces and source radiator renewal remain accessible.'}
  const transfer: readonly (readonly number[])[] = [[candidateUtilityOpening[1] - 150, north - 93, s.plantTransferZMm],
    [plantWall.holes[0][1] - 325, plantWall.finishedFaces[1] + 103, s.plantTransferZMm]]
  const delta = transfer[1].map((v, i) => v - transfer[0][i]), fullyDrawn = transfer.map(p => p.map((v, i) => v + delta[i])),
    insulation = b.data[paths[5]].pipeInsulation, jacketMaximumMm = inletCabinetProductFacts.pipe.maximumOuterDiameterIncludingOvalityMm
      + 2 * insulation.selectedInternalRadialThickness + 2 * insulation.jacketThicknessEachSide, jacketR = jacketMaximumMm / 2,
    buffer = services.plant.primaryBuffer, bufferReserve = s.plantTransferZMm - jacketR - buffer.maxRetainedHeight,
    doorReserve = services.plant.cylinder.minDoor[1] - s.plantWithdrawalLoweringZMm - jacketR
  const crossing = (wall: any) => wall.finishedFaces.map((y: number) => {
    const t = (y - transfer[0][1]) / delta[1], x = transfer[0][0] + delta[0] * t
    const [lo, hi] = wall.holes[0], half = (hi - lo) / 2, rise = model.internalArchControls.rise,
      finish = model.internalArchControls.actualRadialFinish, radius = (half * half + rise * rise) / (2 * rise),
      insideRadius = radius - finish, zCentre = model.internalArchControls.head - radius,
      roof = Math.abs(x - (lo + hi) / 2) < insideRadius ? zCentre + Math.sqrt(insideRadius ** 2 - (x - (lo + hi) / 2) ** 2) : null
    return { wallYmm: y, centreXMm: round(x), horizontalAfterJacketAnd10Mm: round(Math.min(x - lo, hi - x) - finish - jacketR - 10),
      archHeadAfterJacketAnd10Mm: roof === null ? null : round(roof - s.plantTransferZMm - jacketR - 10) }
  })
  const rejectedBase = { rectangleMm: [10080 - 90, 600 - 80 - 75, 180, 150], body: model.archOpeningRegister.GROUND.find((o: any) => o.id === 'south-window-4').selectedPurge.body }
  const baseGap = Math.hypot(rejectedBase.rectangleMm[0] - rejectedBase.body[0], rejectedBase.rectangleMm[1] + rejectedBase.rectangleMm[3] - rejectedBase.body[1]) - 300
  const airSlotAreaEachM2 = .75 * .05, airLps = .6 * airSlotAreaEachM2 / Math.sqrt(2) * Math.sqrt(2 * 2 / 1.2) * 1000,
    addedHeatW = airLps / 1000 * 1.2 * 1005 * 15, roomHeat = b.data[paths[4]].wholeHeat
  const wetUtilityPlanMm = [west, model.envelope, east-west, north-model.envelope] as const,
    retainedFurniture=Object.fromEntries(Object.entries(model.groundFurniture).filter(([id])=>/service-utility-|service-emitter-utility-/.test(id)&&!/electricalStation|PVinverter/.test(id))),
    indoorCuts=inletEntrySideCuts({roomPlanMm:wetUtilityPlanMm,portalXMm:candidateUtilityOpening as [number,number],wallFacesYMm:utilityWall.finishedFaces,
      jambFinishMm:model.internalArchControls.actualRadialFinish,shieldPlaneXMm:dryScreen.barrierPlaneMm.x,
      washerFirstRestMm:b.data[paths[6]].geometry.rest,maintenancePlanMm:utilityPlatform,maintenanceTopMm:clearHeight,
      operatorXYZMm:[s.indoorOperatorXMm,s.indoorOperatorYMm,s.indoorOperatorZMm],
      frameCoversMm:frame.connections.filter(c=>c.wallId===utilityWall.id).map(c=>c.oppositeCoverEnvelopeMm as [number,number,number,number,number,number]),
      bankXMm:s.indoorBankXMm,bankYMm:s.indoorBankYMm,utilityAxisZMm:s.indoorUtilityAxisZMm,plantAxisZMm:s.indoorPlantAxisZMm,
      tailOffsetMm:s.indoorTailOffsetMm,maintenanceShiftXMm:s.indoorMaintenanceShiftXMm,maintenanceShiftYMm:s.indoorMaintenanceShiftYMm,wheelInboardMm:s.indoorWheelInboardMm,
      utilityLmin:s.requiredUtilityLmin,plantLmin:s.requiredPlantLmin,maximumGaugeBar:maximumAbsoluteBar-s.atmosphericMinimumBar,
      groundFflMm,doorHingeNorthOfWallMm:s.indoorDoorHingeNorthOfWallMm,plantWall:{facesYMm:plantWall.finishedFaces,openingXMm:plantWall.holes[0]},
      retainedFurniture:Object.fromEntries(Object.entries({...retainedFurniture,...Object.fromEntries(Object.entries(model.groundFurniture).filter(([id])=>/plant-water|plant-riser|plant-controls|plant-primary-buffer|service-emitter-plant/.test(id)))}).map(([id,p])=>{
        if(p.length!==4)throw new Error("Changed indoor-cut fixed furniture rectangle: "+id)
        return [id,p as [number,number,number,number]]
      })),
      protectedDoorOpenLeafMm:model.plantReferenceDoor.fullyOpenEastLeaf}),
    indoorRouteInput:IndoorRoutesInput={roomPlanMm:wetUtilityPlanMm,bankMm:[s.indoorBankXMm,s.indoorBankYMm],utilityAxisZMm:s.indoorUtilityAxisZMm,plantAxisZMm:s.indoorPlantAxisZMm,
      tailOffsetMm:s.indoorTailOffsetMm,utilityReturnXMm:s.indoorUtilityReturnXMm,westernReturnXMm:s.indoorWesternReturnXMm,
      utilitySourcePathMm:b.data[paths[0]].branches[0].coordinates,plantSourcePathMm:b.data[paths[0]].branches[1].coordinates,
      plantTransferMm:transfer as readonly (readonly[number,number,number])[],groundFflMm,ceilingMm:clearHeight,
      utilityLmin:s.requiredUtilityLmin,plantLmin:s.requiredPlantLmin,maximumGaugeBar:maximumAbsoluteBar-s.atmosphericMinimumBar,
      networkAllowancesBar:[s.utilityNetworkLossBar,s.plantNetworkLossBar],
      comparison:{frictionFactor:s.pipeFrictionFactorComparison,cornerK:s.pipeCornerKComparison,temperatureChangeK:s.pipeTemperatureChangeK,jacketDensityKgM3:s.pipeJacketDensityComparisonKgM3,insulationDensityKgM3:s.pipeInsulationDensityComparisonKgM3},
      obstacles:[{id:'ordinary-operator-body-and-approach',boxMm:[s.indoorOperatorXMm-300,Math.min(...indoorCuts.ordinaryOperator.approachMm.map(p=>p[1]))-300,0,600,Math.abs(indoorCuts.ordinaryOperator.approachMm[1][1]-indoorCuts.ordinaryOperator.approachMm[0][1])+600,2000]},
        ...indoorCuts.door.leafSweptOuterBoxesMm.map((b,k)=>({id:'wet-door-complete-moving-leaf-'+k,boxMm:b})),
        {id:'protected-parked-leaf-full2300-comparison',boxMm:[...model.plantReferenceDoor.fullyOpenEastLeaf.slice(0,2),0,...model.plantReferenceDoor.fullyOpenEastLeaf.slice(2),2300] as [number,number,number,number,number,number]},
        {id:'complete-shifted-utility-maintenance',boxMm:[indoorCuts.candidateMaintenancePlanMm[0],indoorCuts.candidateMaintenancePlanMm[1],0,indoorCuts.candidateMaintenancePlanMm[2],indoorCuts.candidateMaintenancePlanMm[3],clearHeight]},
        {id:'occupied-washer-rest',boxMm:[...b.data[paths[6]].geometry.rest.slice(0,2),0,...b.data[paths[6]].geometry.rest.slice(2),848] as [number,number,number,number,number,number]},
        {id:'retained-washer',boxMm:[...services.utility.washer.slice(0,2),0,...services.utility.washer.slice(2),b.data[paths[6]].native.height] as [number,number,number,number,number,number]},
        {id:'retained-sink-conservative2000-high-envelope',boxMm:[...services.utility.sink.slice(0,2),0,...services.utility.sink.slice(2),2000] as [number,number,number,number,number,number]},
        {id:'utility-radiator',boxMm:[...services.emitters.find((e:any)=>e.id==='utility-E').completePlanWithValvesAndBrackets.slice(0,2),services.emitters.find((e:any)=>e.id==='utility-E').bottomLocal,...services.emitters.find((e:any)=>e.id==='utility-E').completePlanWithValvesAndBrackets.slice(2),services.emitters.find((e:any)=>e.id==='utility-E').topLocal-services.emitters.find((e:any)=>e.id==='utility-E').bottomLocal] as [number,number,number,number,number,number]},
        ...frame.connections.filter(c=>c.wallId===utilityWall.id).map(c=>({id:c.id,boxMm:c.oppositeCoverEnvelopeMm as [number,number,number,number,number,number]}))]},
    indoorRoutes=inletIndoorRoutes(indoorRouteInput),
    bankReceiver=inletBankReceiver({routes:indoorRoutes,cuts:indoorCuts,wallCoreYMm:utilityWall.structuralCore,settings:{clampWidthMm:s.indoorClampWidthMm,clampHeightMm:s.indoorClampHeightMm,clampRadialThicknessMm:s.indoorClampRadialThicknessMm,toolAxialMm:s.indoorToolAxialMm,toolSouthStrokeMm:s.indoorToolSouthStrokeMm}}),
    bankShelfCarrier=compareInletBankShelfCarrier({bank:bankReceiver,routes:indoorRoutes,cuts:indoorCuts,candidate:b.data['project/had/studies/inlet-bank-shelf-candidate.json'] as InletBankShelfCandidate}),
    wide=b.data['project/had/studies/utility-wide-capture.json'],fan=services.fanAccess.find((v:any)=>v.id==='utility'),
    retainedRouteServices={boxes:[
      {id:'actual-utility-fan-pod',boxMm:[...fan.podPlan.slice(0,2),fan.podZ[0],...fan.podPlan.slice(2),fan.podZ[1]-fan.podZ[0]] as [number,number,number,number,number,number]},
      {id:'actual-hot-H0-body',boxMm:wide.hot.body as [number,number,number,number,number,number]},
      ...wide.stages.map((v:any)=>({id:'complete620mm-head-sweep/'+v.stage,boxMm:v.box as [number,number,number,number,number,number]}))
     ],paths:[
      {id:'actual-utility-fan-duct-with20mm-supports',pointsMm:fan.path,radiusWithSupportsMm:fan.selectedRoute.maximumCollarOD/2+20},
      {id:'actual-utility-fan-condensate',pointsMm:fan.ceilingTrapDrainPort.path,radiusWithSupportsMm:fan.ceilingTrapDrainPort.maximumDrainOD/2},
      {id:'actual-retained-hot-backbone',pointsMm:wide.hot.backbone,radiusWithSupportsMm:37},
      {id:'actual-retained-hot-terminal',pointsMm:wide.hot.terminal,radiusWithSupportsMm:25}
     ]},
    retainedServiceComparison=inletRouteRetainedServices(indoorRoutes,retainedRouteServices),
    referenceSplitChoice=b.data['project/had/studies/inlet-split-plant-station-candidate.json'] as SplitPlantStationChoice,
    rawPlantArch=model.archOpeningRegister.GROUND.find((o:any)=>o.id==='plant-replacement'),
    fittedFrame=derivePlantFittedFrame({choice:plantRoomChoice.fittedFrame,rawOpeningYMm:services.plant.cylinder.doorRaw,rawSpringMm:rawPlantArch?.spring,rawHeadMm:rawPlantArch?.head,groundFflMm,openingShiftMm:profileArch?groundFflMm:groundFflMm===0?0:null,minimumCargoMm:services.plant.cylinder.minDoor,wallInnerXMm:east,wallOuterXMm:model.shell+Math.abs(b.data[paths[0]].branches[0].bores[0].outer[1]),settingEachMm:plantRoomChoice.settingMm}),
    frameBranch=coordinatePlantFrameBranch(fittedFrame,b.data['project/had/studies/inlet-split-plant-branch-candidate.json'] as SplitPlantBranchChoice,referenceSplitChoice),splitChoice=frameBranch.stationChoice,
    splitDoor=model.plantReferenceDoor,splitCylinder=services.plant.cylinder,splitEmitter=services.emitters.find((v:any)=>v.id==='plant-N'),
    splitObstacles=[
      {id:'actual-plant-south-west-pier',boxMm:[west,plantWall.finishedFaces[0],0,plantWall.holes[0][0]+model.internalArchControls.actualRadialFinish-west,plantWall.finishedFaces[1]-plantWall.finishedFaces[0],clearHeight]},
      {id:'actual-plant-south-east-pier',boxMm:[plantWall.holes[0][1]-model.internalArchControls.actualRadialFinish,plantWall.finishedFaces[0],0,east-plantWall.holes[0][1]+model.internalArchControls.actualRadialFinish,plantWall.finishedFaces[1]-plantWall.finishedFaces[0],clearHeight]},
      {id:'actual-protected-door-open-leaf',boxMm:[...splitDoor.fullyOpenEastLeaf.slice(0,2),0,...splitDoor.fullyOpenEastLeaf.slice(2),2300]},
      {id:'actual-service-spine-south',boxMm:[spine.finishedFaces[0],0,0,spine.finishedFaces[1]-spine.finishedFaces[0],splitDoor.effectiveOpenClearY[0],clearHeight]},
      {id:'actual-service-spine-north',boxMm:[spine.finishedFaces[0],splitDoor.effectiveOpenClearY[1],0,spine.finishedFaces[1]-spine.finishedFaces[0],model.shell-splitDoor.effectiveOpenClearY[1],clearHeight]},
      {id:'actual-vessel-home-conservative-box',boxMm:[...splitCylinder.body.slice(0,2),0,...splitCylinder.body.slice(2),splitCylinder.height]},
      {id:'actual-buffer-complete-station',boxMm:[...services.plant.primaryBuffer.station.slice(0,2),0,...services.plant.primaryBuffer.station.slice(2),services.plant.primaryBuffer.maxRetainedHeight]},
      {id:'actual-controls-full-height-comparator',boxMm:[...services.plant.controlsHydraulics.slice(0,2),0,...services.plant.controlsHydraulics.slice(2),clearHeight]},
      {id:'actual-riser-full-height-comparator',boxMm:[...services.plant.riserGross.slice(0,2),0,...services.plant.riserGross.slice(2),clearHeight]},
      {id:'actual-radiator-renewal-reservation',boxMm:[...splitEmitter.completePlanWithValvesAndBrackets.slice(0,2),splitEmitter.bottomLocal,splitEmitter.completePlanWithValvesAndBrackets[2],splitEmitter.completePlanWithValvesAndBrackets[3]+splitEmitter.renewal.requiredFrontPull,splitEmitter.topLocal-splitEmitter.bottomLocal+splitEmitter.renewal.requiredLift]},
      {id:'actual-dry-mainboard',boxMm:boardBox},
      ...frame.connections.filter(c=>c.wallId===plantWall.id).map(c=>({id:c.id,boxMm:c.oppositeCoverEnvelopeMm}))
     ].map(o=>({...o,boxMm:o.boxMm as [number,number,number,number,number,number]})),
    splitInput={reference:indoorCuts,choice:splitChoice,obstacles:splitObstacles,
      cart:{pathMm:splitCylinder.path,radiusMm:splitCylinder.cartRadius},opposedPlateSouthFaceYMm:frame.connections.find(c=>c.wallId===plantWall.id)!.frontPlateMm[1],
      mainboardBoxMm:boardBox as [number,number,number,number,number,number],plantCoreYMm:plantWall.structuralCore,
      roomPlanMm:[west,plantWall.finishedFaces[1],east-west,model.groundWalls.find((w:any)=>w.id==='plant-north').finishedFaces[0]-plantWall.finishedFaces[1]] as [number,number,number,number],ceilingMm:clearHeight,groundFflMm:indoorCuts.groundStage.fflMm},
    splitNormal=inletSplitPlantStationComparison(splitInput),
    splitBranchDevelopment=(()=>{
      const choice=frameBranch.choice,
        tree=b.data[paths[5]].trunks?.find((v:any)=>v.id==='ground-front-west'),treePoint=tree?.selected3DProfile?.[1],
        profiles=derivePlantReleaseProfiles({plant:services.plant,insideWestMm:west,insideSouthMm:plantWall.finishedFaces[1],openingHeightMm:services.plant.cylinder.minDoor[1]}),
        rawDoor=services.plant.cylinder.doorRaw,cargoSouth=fittedFrame.effectiveClearYMm[0],
        actualValve=splitNormal.referenceValveId===indoorCuts.valves.find(v=>v.branch==='plant')?.id
          ?{axisMm:splitChoice.axisMm,bodyMm:splitNormal.boxes[0].boxMm,stemMm:splitNormal.boxes[1].boxMm,knownKg:splitNormal.nominalValveOnlyGravity.kg}:null
      if(!actualValve||!Array.isArray(treePoint)||treePoint.length!==3||!tree.duties?.includes('cold'))return{state:'unsupported-current-source' as const,selected:false,diagnostics:['SPLIT_PLANT_BRANCH/current-station-or-cold-tree-reference-missing'],comparison:null}
      try{
       const result=inletSplitPlantBranch({choice,sourceBindingDigest:b.bindingDigest,groundFflMm,roomPlanMm:splitInput.roomPlanMm,ceilingMm:clearHeight,
        fittedFrame,valve:actualValve,ordinaryShoulderMm:splitChoice.operatorShoulderMm,
        envelope:{backboneRadiusMm:jacketR,terminalRadiusMm:b.data['project/had/studies/inlet-fixed-station.json'].removal.exposedColdConnectorEnvelopeOD/2,settingsEachMm:indoorRoutes.pipe.settingEachPipeMm,insulationRadialThicknessMm:insulation.selectedInternalRadialThickness,jacketThicknessMm:insulation.jacketThicknessEachSide},
        operating:{plantDutyLmin:s.requiredPlantLmin,temperatureChangeK:s.pipeTemperatureChangeK,maximumGaugeBar:maximumAbsoluteBar-s.atmosphericMinimumBar},
        obstacles:splitObstacles,goods:[profiles.cylinder,profiles.buffer],cylindricalStore:{centreXYMm:splitCylinder.centre,radiusMm:splitCylinder.body[2]/2,heightMm:splitCylinder.height},
        retainedStorePortTrialMm:services.plant.independentSafety.mainsPortTrial,retainedTreeInterfaceMm:treePoint as [number,number,number],sourceEntryCargoSouthYMm:cargoSouth,sourceEntryInfillYMm:fittedFrame.infills[0].intervalYMm,
        comparison:{frictionFactor:s.pipeFrictionFactorComparison,cornerK:s.pipeCornerKComparison,jacketDensityKgM3:s.pipeJacketDensityComparisonKgM3,insulationDensityKgM3:s.pipeInsulationDensityComparisonKgM3}})
       return{state:'unadopted-current-source-branch-development' as const,selected:false,diagnostics:result.diagnostics,
        goodsEvidence:{...profiles,requiredDoorwayIsAReferenceComparisonNotMeasuredClearance:true,cargoJambBoundaryIsARequiredClearWidthComparison:true},comparison:{...result,reviewSvg:drawInletSplitPlantBranch(result)}}
      }catch(error){if(error instanceof Error&&error.message.startsWith('Unsupported'))return{state:'unsupported-current-source' as const,selected:false,diagnostics:[error.message],comparison:null};throw error}
    })(),
    splitStationComparison={fittedFrame,frameCoordination:{referenceAxisYMm:frameBranch.referenceAxisYMm,stationShiftYMm:frameBranch.stationShiftYMm,retainedStoreAndTreeInterfacesMoved:false},branchDevelopment:splitBranchDevelopment,normal:{...splitNormal,reviewSvg:drawInletSplitPlantStation(splitNormal)},largerPositioningAdverse:inletSplitPlantStationComparison({...splitInput,choice:{...splitChoice,settingEachMm:20}})},
    routeCandidateComparison=(()=>{
      let route:ReturnType<typeof compareInletIndoorRouteCandidate>
      try{route=compareInletIndoorRouteCandidate(indoorRouteInput,b.data['project/had/studies/inlet-route-candidate.json'] as Parameters<typeof compareInletIndoorRouteCandidate>[1])}
      catch(error){if(error instanceof Error&&error.message==='Unsupported changed candidate connection')return{state:'unsupported-for-edited-connections' as const,diagnostics:['INLET_ROUTE_CANDIDATE/current-connections-changed'],selected:false,comparison:null};throw error}
      const bank=inletBankReceiver({routes:route,cuts:indoorCuts,wallCoreYMm:utilityWall.structuralCore,settings:bankReceiver.settings}),retained=inletRouteRetainedServices(route,retainedRouteServices),
       diagnostics=[...route.diagnostics,...bank.diagnostics,...retained.diagnostics]
      return{state:'unadopted-explicit-comparison' as const,selected:false,diagnostics,
       comparison:{route,bank,retained,necessaryJoinedEnvelopeScreen:diagnostics.length===0,completeOccupiedArrangementQualified:false,
        reviewSvg:drawInletIndoorRoutes(route,bank.routeOperation,retained)}}
    })()
  return { state: 'one-recommended-replacement-not-an-adopted-room' as const,
    sourceOccupiedBindingDigest: b.occupied.binding.digest,
    designDuties: { status: 'authored-reference-design-requirements', utilityLmin: s.requiredUtilityLmin, plantLmin: s.requiredPlantLmin,
      commonSourceSimultaneousLmin: s.requiredUtilityLmin + s.requiredPlantLmin,
      utilityAllocation: [{id: utilityIds[0], Lmin: 6}, {id: utilityIds[1], Lmin: 12}, {id: 'design-allowance', Lmin: s.requiredUtilityLmin - 18}],
      plantComfortExample: [{id: 'two-showers', Lmin: 18}, {id: 'bath-fill', Lmin: 12}, {id: 'kitchen', Lmin: 6}, {id: 'aggregate-cistern-refill', Lmin: 8}],
      plantComfortAllowanceLmin: s.requiredPlantLmin - 44, fixtureIds: fixtures.map(f => f.id),
      allOutletsSimultaneousGuaranteed: false, nativeFixtureRateGuaranteesInvented: false,
      washer: { model: b.data[paths[6]].native.model, status: b.data[paths[6]].native.role, pressureBar: [1, 10],
        selectedRateLmin: 12, factoryRateGuaranteeAvailable: false, source: b.data[paths[6]].native.url } },
    topology: { directUtilityColdOnly: utilityIds, plantColdAndStore: fixtures.filter(f => !utilityIds.includes(f.id)).map(f => f.id),
      utilityHotRemainsPlantFed: true, retireColdTreeConnection: 'ground-utility/cold from ground-front-west at [10350,3200]',
      retireRejectedInlet: ['lobby-I0', 'lobby-U0', 'lobby-P0', 'lobby-common-header', 'inherited-east-low-route'],
      requiredSink: { kind: 'two-independent-pillar-taps', holesMm: [28, 28], centresMm: 180, mixingOnlyInOpenBowl: true,
        actualAirGapAboveFloodRimRequired: true, tapProductsAndConstituentsSelected: false },
      oldColdConnectionRetiredInOccupiedSource: false, crossfeedIndependenceQualified: false },
    room: { wetUtilityPlanMm, bankShelfCarrier:{...bankShelfCarrier,reviewSvg:drawInletBankShelfCarrier(bankShelfCarrier)}, indoorRoutes: {...indoorRoutes,operation:bankReceiver.routeOperation,retainedServiceComparison,candidateComparison:routeCandidateComparison,splitStationComparison,reviewSvg:drawInletIndoorRoutes(indoorRoutes,bankReceiver.routeOperation,retainedServiceComparison)}, bankReceiver:{...bankReceiver,reviewSvg:drawInletBankReceiver(bankReceiver)}, indoorCuts: {...indoorCuts,reviewSvg:drawInletIndoorCuts(indoorCuts)},
      southWindowOpeningXMm: (() => { const opening = model.archOpeningRegister.GROUND.find((o: any) => o.id === 'south-window-4'); return [opening.centre - opening.width / 2, opening.centre + opening.width / 2] })(), northWallFacesYMm: utilityWall.finishedFaces, northOpeningXMm: candidateUtilityOpening,
      portalReplacement:{sourceOpeningXMm:sourceUtilityOpening,candidateOpeningXMm:candidateUtilityOpening,shiftXMm:s.utilityPortalShiftXMm,widthPreservedMm:candidateUtilityOpening[1]-candidateUtilityOpening[0],normalBodyAfter10Mm:Math.min(normalPathX-normalBodyR-candidateUtilityOpening[0],candidateUtilityOpening[1]-normalPathX-normalBodyR)-model.internalArchControls.actualRadialFinish-10,adoptedInOccupiedSource:false},
      retainedFurniture,
      retiredFurniture: ['service-utility-electricalStation', 'service-utility-PVinverter'],
      newMainboard: { ...board, proposedGrossBoxMm: boardBox, normalRouteAfter10Mm: round(boardBox[0] - normalPathX - normalBodyR - 10),
        northWallAfter10Mm: round(plantWall.finishedFaces[0] - boardBox[1] - boardBox[4] - 10),
        southWallGapMm: round(boardBox[1] - lobbySouth),
        workingFieldPlanMm: [boardBox[0] - 1000, boardBox[1], 1000, boardBox[4]],
        serviceState: 'Temporary service-suite closure. Before enclosure opening isolate source-fed water and cylinder/upper inventory, relieve and prove zero pressure; independently isolate utility AC and PV AC.' },
      purge: model.archOpeningRegister.GROUND.find((o: any) => o.id === 'south-window-4').selectedPurge,
      maintenanceFields: model.serviceMaintenanceFields.filter((f: any) => f.id === 'utility'),
      electricalScreen: { ...dryScreen,
        supportFrame:{...frame,opposedAccess,sourceReference:{sourceId:resolved.design.source.id,planDigest:b.planDigest,occupiedBindingDigest:b.occupied.binding.digest,datum:'Local nominal groundFFL0; uncoordinated raised-ground or changed-slab acceptance not transferred'},
          loadedRemoval:{panelGrossDesignLimitKg:15,actualGrossMassMeasured:false,referenceBareSheetEachKg:dryScreen.panels[0].flatSheetOnlyKg,
            seatFeetEachKg:2*25*40*6*8000/1e9,actualRetainersFinishAndWeldKg:null,
            requiredPhases:['Retain all panels and isolate/drain both sources plus actual stored pressure; independently isolate AC/PVAC.',
              'Reach and release each captive retainer with panel still on both bearing feet and under independent rated capture.',
              'Lift at least12mm, draw clear of the50mm frame and independently support the complete payload; no live-sibling or ladder carrying credit.',
              'Lower to a qualified positive first rest, then export through the actual occupied door; qualify temporary access equipment, people and every swept body.',
              'For frame renewal support the complete loaded frame before removing opposed through-rods; retained case, pipes and finishes stay independent.'],
            panelFirstRestAndCompleteHandlingProved:false,wholeFrameGrossHandlingMassKg:null,
            temporaryEquipmentFloorLoadsQualified:false}},
        coordinateDatum: 'local nominal ground FFL; actual raised-ground and changed intermediate-floor coordination remain unadmitted',
        actualHouseSource: resolved.design.source.id, nominalClearHeightMm: clearHeight,
        changedGroundOrSlabHeightAcceptanceTransferred: false },
      sourceOpenArchMustBecomeRealWetDoor: true, doorOpenSprayPass: false, ordinaryWasherIsNotSprayRated: true,
      counterfactualRoomGeometryAuthored: true, replacementOccupiedHouseCompiled: false },
    transfer: { jacketMaximumMm: round(jacketMaximumMm), pipeMaximumOdMm: inletCabinetProductFacts.pipe.maximumOuterDiameterIncludingOvalityMm,
      radialInsulationMm: insulation.selectedInternalRadialThickness, jacketEachSideMm: insulation.jacketThicknessEachSide, pathMm: transfer, centrelineLengthMm: round(Math.hypot(...delta)), fullNorthDrawPathMm: fullyDrawn,
      utilityArch: crossing(candidateUtilityWall), plantArch: crossing(plantWall),
      bufferAfter10Mm: round(bufferReserve - 10),
      fixedTransferAboveWetLeafAfter10Mm:round(s.plantTransferZMm-indoorCuts.door.projectLeafMm[1]-jacketR-10),
      wetDoorHeadAndFrameProjectionQualified:false,
      eastCargoExport:{requiredClearHeightMm:services.plant.cylinder.minDoor[1],requiredClearWidthMm:services.plant.cylinder.minDoor[0],
        datum:'Actual east cargo doorway; this is not the installed two-arch transfer height limit.',
        plannedNorthWithdrawnLoweringZMm:s.plantWithdrawalLoweringZMm,
        loweredTubeApertureAfter10Mm:round(doorReserve-10),loweredTubeBufferAfter10Mm:round(s.plantWithdrawalLoweringZMm-jacketR-buffer.maxRetainedHeight-10),
        fullNorthWithdrawalLoweringRotationExportAndCaptureQualified:false},
      independentClampsReleaseToolsCradleAndExportQualified: false, supportOnApparatusCredited: false,
      retainedPlantCylinderPathMm: services.plant.cylinder.path, retainedBufferStationMm: buffer.station, retainedD2Mm: services.plant.independentSafety.outfall },
    storedRelease: { factoryStore: services.plant.cylinder.family, orderedMinimumUsableL: services.plant.cylinder.orderedMinUsableL,
      catalogueComparatorL: services.plant.cylinder.catalogueL, actualMaximumRetainedAndDrainableL: null,
      catalogueOrMinimumUsedAsMaximum: false, houseSideFlowLimitedByLodgeAperture: false, actualThermalPressureStateQualified: false,
      cases: ['cold-break-with-house-cut-open', 'factory-nonreturn-normal', 'failed-nonreturn-plus-rupture', 'hot-store-and-expansion-release', 'trapped-upper-network-drain'],
      primaryBuffer: 'Separate closed primary; no ordinary potable connection. Actual heat-exchanger separation failure is a separately declared compound case.' },
    receivingAndThermal: { plantOldReceiver: 'reject', requiredSourcePairOutfallLmin: round(branches.reduce((n, c) => n + c.maximumLimitedEachLmin, 0)),
      storedReleaseAdditional: 'Unbounded until the actual factory inventory/pressure model is supplied; no restriction credit transferred.',
      floorSeatZMm: 0, newPipeAndWetLoadsIn52HeadSolve: false, newBoardEmptyGravityN: round(board.emptyKg * 9.81),
      boardContentsAnchorsAndReceivingResistanceQualified: false, sourceFloorOrDpcDepthBorrowed: false,
      floorDrainTrapWarmEnvelopeOneBlockedAndTailwaterQualified: false,
      rejectTransplantedBase: { ...rejectedBase, bodyClearanceMm: round(baseGap), afterTwo5MmSettings: round(baseGap - 10) },
      rejectPermanentOpenSpills: { slotEachMm: [750, 50], pressureComparisonPa: 2, airLps: round(airLps), addedAt15K_W: round(addedHeatW),
        currentWholeHouseHotSpareW: roomHeat.hotSpareW, currentUtilitySpareW: services.rooms.utility.marginW, inheritedHeatOrFrostPass: false, actualWindPrediction: false } },
    pv: { direction: 'separate-outdoor-ventilated-streethead-dry-bay', inverterComparator: 'SMA STP4.0-3AV-40', bodyMm: [435, 470, 176], massKg: 17,
      sideClearEachMm: 200, topClearMm: 300, bottomClearMm: 500, frontClearMm: 500, requiredWidthMm: 835, requiredHeightMm: 1270,
      proposedClearBayMm: [900, 1400, 350], existingDnoClearBayMm: [b.data[paths[7]].geometryMm.cabinet.internal[0], b.data[paths[7]].geometryMm.cabinet.internal[2], b.data[paths[7]].geometryMm.cabinet.internal[1]],
      dnoCellBorrowed: false, streetheadFoundationReceivingQualified: false, combinedIndoorBoardPvRejected: true, shadedConvectionOutdoorInstallationRequired: true,
      sourceTopology: ['roof-PV-strings', 'separate-rated-DC-conduit-and-dry-raceway', 'accessible-DC-disconnection', 'inverter', 'local-AC-isolation-and-protection', 'service-AC'],
      maximumDcV: 850, minimumMppV: 175, moduleStringsAndCablesMatched: false, enclosedWorstCaseHeatLossW: null,
      wetValveSeparatorQualified: false, actualGridAndElectricalAdmission: false, ownerVisibleKioskAppearanceAccepted: false,
      sources: ['https://manuals.sma.de/STPxx-3av-40-BE/en-US/391431051.html', 'https://manuals.sma.de/STPxx-3av-40-BE/en-US/505337995.html',
        'https://manuals.sma.de/STPxx-3av-40-BE/en-US/3190770571.html'] },
    diagnostics: [...(bufferReserve < 10 ? ['TRANSFER_INTERCEPTS_BUFFER_RESERVATION'] : []), ...(doorReserve < 10 ? ['TRANSFER_LOWERED_EXPORT_EXCEEDS_EAST_CARGO_HEIGHT'] : []),
      ...(s.plantWithdrawalLoweringZMm>s.plantTransferZMm?['TRANSFER_PLANNED_LOWERING_RAISES']:[]),
      ...indoorRoutes.diagnostics,...bankReceiver.diagnostics,...retainedServiceComparison.diagnostics,
      ...(!bankShelfCarrier.necessaryCarrierComparison?['INLET_BANK_FLAT_SHELF_CARRIER_REJECTED']:[]),
      ...(plantWall.finishedFaces[0] - boardBox[1] - boardBox[4] < 10 ? ['MAINBOARD_INTERCEPTS_PLANT_WALL'] : []),
      ...(boardBox[1] < lobbySouth ? ['MAINBOARD_INTERCEPTS_UTILITY_WALL'] : []),
      'PLANT_REQUIRES_NEW_RECEIVER_AND_STORED_RELEASE_MODEL', 'ACTUAL_INDOOR_CUT_RENEWAL_AND_INDEPENDENT_SUPPORT_REQUIRED',
      ...dryScreen.diagnostics,...frame.diagnostics,
      ...(opposedAccess.plantRadiator.toolAfterLiftAnd10Mm<0?['SHIELD_OPPOSED_FIXINGS_INTERCEPT_RADIATOR_RENEWAL']:[]),
      'WET_DOOR_OPEN_MAINBOARD_JET_AND_MATERIALS_UNQUALIFIED', 'ACTUAL_WARM_FLOOR_DRAINS_AND_52_HEAD_LOAD_ACCOUNT_UNQUALIFIED'],
    completeArrangementSelected: false, hadPacketComplete: false }
}

function draw(result: {branches: readonly any[]; joinedDirection: ReturnType<typeof joinedServiceDirection>; bound: any}) {
  const j = result.joinedDirection, k = .16, X = (x: number) => 35 + (x - 9397) * k, Y = (y: number) => 935 - (y - 429.5) * k,
    rect = (p: readonly number[], fill: string) => `<rect x="${X(p[0])}" y="${Y(p[1] + p[3])}" width="${p[2]*k}" height="${p[3]*k}" fill="${fill}" stroke="#554f43"/>`,
    t = (x: number, y: number, text: string, size=15) => `<text x="${x}" y="${y}" font-size="${size}">${text}</text>`
  const board=j.room.newMainboard.proposedGrossBoxMm, wall=j.room.northWallFacesYMm, wet=j.room.wetUtilityPlanMm, opening=j.room.northOpeningXMm, rows = result.branches.map((b,i)=>t(40,130+i*77,`${b.id.toUpperCase()} ${b.requiredDeliveryEachLmin} L/min · bore ${b.apertureNominalMm}±${b.apertureToleranceMm}mm · upper fault ${b.maximumLimitedEachLmin.toFixed(1)} L/min`,18)
    +t(40,155+i*77,`Residual ${b.residualPressureComparisonBar.toFixed(2)} bar · old channel ${b.existingReceiver.maximumScreenedLmin.toFixed(2)} L/min · ${b.existingReceiver.limitedFault.necessaryChannelAndReceiverScreen?'necessary screen only':'REJECT OLD RECEIVER'}`)).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1050" viewBox="0 0 1200 1050"><rect width="1200" height="1050" fill="#f5f1e6"/><g font-family="Arial,sans-serif" fill="#25221c">${t(35,44,'One inlet direction · distinct duties, one whole-room decision',26)}${t(35,76,'Authored reference proposal. Existing Plant receiver rejected; room, source and material acceptance remain open.',16)}${rows}${t(40,300,`Common source must deliver ${j.designDuties.commonSourceSimultaneousLmin} L/min; simultaneous source faults ${result.bound.maximumCombinedLmin.toFixed(1)} L/min + actual stored release.`)}${rect(j.room.wetUtilityPlanMm,'#dae8e5')}${rect([wet[0],wall[0],wet[2],wall[1]-wall[0]],'#c6c2b5')}${rect([opening[0],wall[0],opening[1]-opening[0],wall[1]-wall[0]],'#f5f1e6')}${t(42,653,`Utility · ${wet[2]} × ${wet[3]} mm`,14)}${t(42,364,'Plant entry · retained arch',14)}${t(42,465,'Dry service lobby',14)}${Object.values(j.room.retainedFurniture).map((p:any)=>rect(p,'#ccc7b8')).join('')}${rect([board[0],board[1],board[3],board[4]],'#d6b987')}<line x1="${X(j.room.electricalScreen.barrierPlaneMm.x)}" y1="${Y(j.room.electricalScreen.barrierPlaneMm.y[0])}" x2="${X(j.room.electricalScreen.barrierPlaneMm.x)}" y2="${Y(j.room.electricalScreen.barrierPlaneMm.y[1])}" stroke="#8e403a" stroke-width="4"/>${t(420,380,'WET UTILITY / DRY MAINBOARD',19)}${t(420,415,'Keep washer, sink, south purge and both east-head tasks.')}${t(420,445,`Board base${j.room.newMainboard.proposedGrossBoxMm[2]}mm; shield flat metal${j.room.electricalScreen.actions.totalFlatSheetOnlyKg.toFixed(1)}kg.`)}${t(420,475,'Indoor cuts and four cold paths authored; fitted renewal open.')}${t(420,515,'Mainboard only: actual sealed case, no inverter heat.')}${t(420,545,`Shield ray interception:${j.room.electricalScreen.visibility.allDirectPortalRaysIntercepted ? 'PASS' : 'FAIL'}; impact, seams and heat unqualified.`)}${t(420,585,'STREETHEAD PV · separate dry, shaded, ventilated bay',19)}${t(420,618,'900 × 1400 mm clear + service face; never borrow DNO cell.')}${t(420,648,'Actual module strings, DC/AC isolation and rated cable routes.')}${t(420,688,'PLANT: new receiver + factory stored-water release model',18)}${t(420,720,'The Lodge aperture does not bound cylinder/upper-pipe backflow.')}${t(420,758,'SUPPORT / FLOOR / DRAINS / FROST',18)}${t(420,790,'No new mass or pressure anchors enter the 52-head solve yet.')}${t(420,820,'No assumed recess, DPC cut, open spill slot or manual response.')}${t(420,860,'Transfer is a necessary envelope, not a whole handling pass.')}${t(420,890,`Fixed pipe over wet leaf / lowered east export: ${j.transfer.fixedTransferAboveWetLeafAfter10Mm.toFixed(1)} / ${j.transfer.eastCargoExport.loweredTubeApertureAfter10Mm.toFixed(1)} mm.`)}<polyline points="${j.transfer.pathMm.map(p=>`${X(p[0])},${Y(p[1])}`).join(' ')}" stroke="#247b91" stroke-width="4" fill="none"/>${t(40,995,'HAD OPEN · counterfactual room geometry only · no owner, physical, source, product or material approval',17)}</g></svg>`
}
