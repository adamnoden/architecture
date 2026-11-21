import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { CurrentDesignResolution } from './resolve.js'
import type { runGroundSectionCase } from './structural-ground.js'
import { runInletRoomCatchment } from './inlet-room-catchment.js'
import { readBoundOccupiedServices } from './occupied-services.js'
import { inletCabinetProductFacts } from './inlet-cabinet-copper.js'
import { criticalHalfRoundFlow, receiverWeirHeadMm, reliefEntranceHeadMm, solveHalfRoundRelief,
  southInletReliefComparison } from '../../../project/had/studies/south-inlet-relief-hydraulics.mjs'

export const inletSourceEnvelopeFields = ['utilityApertureNominalMm', 'plantApertureNominalMm', 'apertureToleranceMm', 'sourceMaximumTotalBar',
  'sourceMinimumDynamicBar', 'requiredUtilityLmin', 'requiredPlantLmin', 'requiredResidualBar', 'utilityNetworkLossBar', 'plantNetworkLossBar',
  'dischargeCoefficientComparison', 'pressureRecoveryFractionComparison', 'atmosphericMinimumBar', 'atmosphericMaximumBar', 'mainboardNorthOffsetMm', 'plantTransferZMm', 'catchmentClearWidthMm', 'catchmentClearHeightMm',
  'catchmentInvertAboveDistributionMm', 'catchmentReceiverWidthMm', 'catchmentReceiverCrestAboveGradeMm'] as const
export type InletSourceEnvelopeSettings = Readonly<Record<typeof inletSourceEnvelopeFields[number], number>>
export const readInletSourceEnvelopeSettings = (): InletSourceEnvelopeSettings => ({ utilityApertureNominalMm: 6.5, plantApertureNominalMm: 10.2,
  apertureToleranceMm: .1, sourceMaximumTotalBar: 9, sourceMinimumDynamicBar: 3.5, requiredUtilityLmin: 20, requiredPlantLmin: 45,
  requiredResidualBar: 1, utilityNetworkLossBar: .5, plantNetworkLossBar: 1, dischargeCoefficientComparison: .55,
  pressureRecoveryFractionComparison: 0, atmosphericMinimumBar: .9, atmosphericMaximumBar: 1.1, mainboardNorthOffsetMm: 0, plantTransferZMm: 2235, catchmentClearWidthMm: 400, catchmentClearHeightMm: 150,
  catchmentInvertAboveDistributionMm: 60, catchmentReceiverWidthMm: 400, catchmentReceiverCrestAboveGradeMm: 0 })
const paths = ['project/had/studies/south-inlet-under-sill.json', 'project/had/studies/south-inlet-wet-box.json',
  'project/had/studies/south-inlet-relief.json', 'project/had/studies/south-utility-inlet.json',
  'project/had/studies/current-house-services.json', 'project/mat/studies/whole-house-service-baseline.json',
  'project/ias/studies/utility-first-release.json', 'project/had/studies/boundary-service-lodge.json'] as const
const methodPaths = ['compiler/reference-house/current-design/inlet-source-envelope.ts',
  'compiler/reference-house/current-design/inlet-room-catchment.ts',
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
    sourceEnvelope: { schema: 'had-inlet-source-envelope-case/3' as const, planDigest: b.planDigest,
      bindingDigest: b.bindingDigest, settings: readInletSourceEnvelopeSettings() } }
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
    || s.mainboardNorthOffsetMm < -100 || s.mainboardNorthOffsetMm > 400 || s.plantTransferZMm < 2100 || s.plantTransferZMm > 2600
    || s.catchmentClearWidthMm < 150 || s.catchmentClearWidthMm > 450 || s.catchmentClearHeightMm < 60 || s.catchmentClearHeightMm > 250
    || s.catchmentInvertAboveDistributionMm < 30 || s.catchmentInvertAboveDistributionMm > 200
    || s.catchmentReceiverWidthMm < 300 || s.catchmentReceiverWidthMm > 800 || s.catchmentReceiverCrestAboveGradeMm < -500 || s.catchmentReceiverCrestAboveGradeMm > 1000
    || s.requiredUtilityLmin < 18 || s.requiredPlantLmin < 44 || s.atmosphericMinimumBar < .5 || s.atmosphericMaximumBar > 1.5 || s.atmosphericMinimumBar > s.atmosphericMaximumBar) throw new Error('Inlet source settings exceed the comparison domain')
  return s
}

export function runInletSourceEnvelopeCase(resolved: CurrentDesignResolution, input: unknown, ground?: ReturnType<typeof runGroundSectionCase>) {
  const b = binding(resolved)
  if (!input || typeof input !== 'object' || Array.isArray(input)
    || Object.keys(input).length !== 4 || !['schema', 'planDigest', 'bindingDigest', 'settings'].every(key => Object.hasOwn(input, key))) throw new Error('Versioned source-bound inlet source-envelope case required')
  const v = input as Record<string, unknown>
  if (v.schema !== 'had-inlet-source-envelope-case/3' || v.planDigest !== b.planDigest || v.bindingDigest !== b.bindingDigest) throw new Error('Stale inlet source-envelope source, design or method')
  const s = settings(v.settings), native = b.data[paths[0]], wet = b.data[paths[1]], relief = b.data[paths[2]], inlet = b.data[paths[3]], services = b.data[paths[4]]
  const groundDatumLiftMm = ground?.native.levelsMm.ffl ?? 0, groundDatumLiftBar = groundDatumLiftMm * 9.80665e-5,
    deliveryAtRoomDatumBar = s.sourceMinimumDynamicBar - groundDatumLiftBar,
    absoluteMaximumBar = s.sourceMaximumTotalBar + s.atmosphericMaximumBar + Math.max(0, -groundDatumLiftBar)
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
    const joinedDirection = joinedServiceDirection(b, s, branches),
    roomCatchment = runInletRoomCatchment(resolved, ground, maximumCombinedLmin, { planMm: joinedDirection.room.wetUtilityPlanMm,
      rawWindowXMm: joinedDirection.room.southWindowOpeningXMm, retainedFurniture: joinedDirection.room.retainedFurniture,
      northOpeningXMm: joinedDirection.room.northOpeningXMm, purgeBodyMm: joinedDirection.room.purge.body, wallFacesYMm: [native.branches[0].bores[0].outer[1], native.branches[0].bores[0].inner[1]] }, s)
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
  const result = { schema: 'had-inlet-source-envelope-result/3' as const, state: 'existing-whole-arrangement-rejected' as const,
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
      sourceDatumAndInternalPressureBudgetQualified: false, deliveryCdIsComparisonNotGuaranteedLowerBound: true }, branches, states, joinedDirection, roomCatchment,
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
function joinedServiceDirection(b: ReturnType<typeof binding>, s: InletSourceEnvelopeSettings, branches: readonly any[]) {
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
      sourceAirVelocityUpperMps: round(Math.sqrt(2 * (s.sourceMaximumTotalBar + s.atmosphericMaximumBar - s.atmosphericMinimumBar) * 1e5 / 990)),
      byBranch: branches.map(c => { const momentum = 1000 * c.maximumLimitedEachLmin / 60000 * Math.sqrt(2 * (s.sourceMaximumTotalBar + s.atmosphericMaximumBar - s.atmosphericMinimumBar) * 1e5 / 990);
        return { id: c.id, incidentMomentumUpperN: round(momentum), fullReversalUpperN: round(2 * momentum) } }),
      actualFootprintSeamsDurationPenetrationsAndStoredHotReleaseQualified: false,
      source: 'https://www.nvent.com/sites/default/files/dam/cat-00059_chapter13.pdf' },
    sources: ['https://www.nvent.com/en-us/hoffman/products/enchdw0606130/pdf', 'https://www.nvent.com/sites/default/files/dam/hoffman-im-hdw-mi-manual-usen-2108.pdf'] }
  const depth = board.bodyDepthMm + board.wallStandOffMm + board.roofOverhangMm,
    boardBox = [east - depth, lobbySouth + s.mainboardNorthOffsetMm, 300, depth, board.bodyWidthMm, board.rearHeightMm],
    normalPathX = model.plantReferenceDoor.operatorCentrePath[1][0], normalBodyR = model.plantReferenceDoor.retainedBodyRadius
  const transfer: readonly (readonly number[])[] = [[utilityWall.holes[0][1] - 150, north - 93, s.plantTransferZMm],
    [plantWall.holes[0][1] - 325, plantWall.finishedFaces[1] + 103, s.plantTransferZMm]]
  const delta = transfer[1].map((v, i) => v - transfer[0][i]), fullyDrawn = transfer.map(p => p.map((v, i) => v + delta[i])),
    insulation = b.data[paths[5]].pipeInsulation, jacketMaximumMm = inletCabinetProductFacts.pipe.maximumOuterDiameterIncludingOvalityMm
      + 2 * insulation.selectedInternalRadialThickness + 2 * insulation.jacketThicknessEachSide, jacketR = jacketMaximumMm / 2,
    buffer = services.plant.primaryBuffer, bufferReserve = s.plantTransferZMm - jacketR - buffer.maxRetainedHeight,
    doorReserve = services.plant.cylinder.minDoor[1] - s.plantTransferZMm - jacketR
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
    room: { wetUtilityPlanMm: [west, model.envelope, east - west, north - model.envelope],
      southWindowOpeningXMm: (() => { const opening = model.archOpeningRegister.GROUND.find((o: any) => o.id === 'south-window-4'); return [opening.centre - opening.width / 2, opening.centre + opening.width / 2] })(), northWallFacesYMm: utilityWall.finishedFaces, northOpeningXMm: utilityWall.holes[0],
      retainedFurniture: Object.fromEntries(Object.entries(model.groundFurniture).filter(([id]) => /service-utility-|service-emitter-utility-/.test(id) && !/electricalStation|PVinverter/.test(id))),
      retiredFurniture: ['service-utility-electricalStation', 'service-utility-PVinverter'],
      newMainboard: { ...board, proposedGrossBoxMm: boardBox, normalRouteAfter10Mm: round(boardBox[0] - normalPathX - normalBodyR - 10),
        northWallAfter10Mm: round(plantWall.finishedFaces[0] - boardBox[1] - boardBox[4] - 10),
        southWallGapMm: round(boardBox[1] - lobbySouth),
        workingFieldPlanMm: [boardBox[0] - 1000, boardBox[1], 1000, boardBox[4]],
        serviceState: 'Temporary service-suite closure. Before enclosure opening isolate source-fed water and cylinder/upper inventory, relieve and prove zero pressure; independently isolate utility AC and PV AC.' },
      purge: model.archOpeningRegister.GROUND.find((o: any) => o.id === 'south-window-4').selectedPurge,
      maintenanceFields: model.serviceMaintenanceFields.filter((f: any) => f.id === 'utility'),
      sourceOpenArchMustBecomeRealWetDoor: true, doorOpenSprayPass: false, ordinaryWasherIsNotSprayRated: true,
      counterfactualRoomGeometryAuthored: true, replacementOccupiedHouseCompiled: false },
    transfer: { jacketMaximumMm: round(jacketMaximumMm), pipeMaximumOdMm: inletCabinetProductFacts.pipe.maximumOuterDiameterIncludingOvalityMm,
      radialInsulationMm: insulation.selectedInternalRadialThickness, jacketEachSideMm: insulation.jacketThicknessEachSide, pathMm: transfer, centrelineLengthMm: round(Math.hypot(...delta)), fullNorthDrawPathMm: fullyDrawn,
      utilityArch: crossing(utilityWall), plantArch: crossing(plantWall),
      bufferAfter10Mm: round(bufferReserve - 10), doorAfter10Mm: round(doorReserve - 10),
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
    diagnostics: [...(bufferReserve < 10 ? ['TRANSFER_INTERCEPTS_BUFFER_RESERVATION'] : []), ...(doorReserve < 10 ? ['TRANSFER_EXCEEDS_CARGO_HEIGHT'] : []),
      ...(plantWall.finishedFaces[0] - boardBox[1] - boardBox[4] < 10 ? ['MAINBOARD_INTERCEPTS_PLANT_WALL'] : []),
      ...(boardBox[1] < lobbySouth ? ['MAINBOARD_INTERCEPTS_UTILITY_WALL'] : []),
      'PLANT_REQUIRES_NEW_RECEIVER_AND_STORED_RELEASE_MODEL', 'ACTUAL_INDOOR_CUT_RENEWAL_AND_INDEPENDENT_SUPPORT_REQUIRED',
      'WET_DOOR_OPEN_MAINBOARD_JET_AND_MATERIALS_UNQUALIFIED', 'ACTUAL_WARM_FLOOR_DRAINS_AND_52_HEAD_LOAD_ACCOUNT_UNQUALIFIED'],
    completeArrangementSelected: false, hadPacketComplete: false }
}

function draw(result: {branches: readonly any[]; joinedDirection: ReturnType<typeof joinedServiceDirection>; bound: any}) {
  const j = result.joinedDirection, k = .16, X = (x: number) => 35 + (x - 9397) * k, Y = (y: number) => 935 - (y - 429.5) * k,
    rect = (p: readonly number[], fill: string) => `<rect x="${X(p[0])}" y="${Y(p[1] + p[3])}" width="${p[2]*k}" height="${p[3]*k}" fill="${fill}" stroke="#554f43"/>`,
    t = (x: number, y: number, text: string, size=15) => `<text x="${x}" y="${y}" font-size="${size}">${text}</text>`
  const board=j.room.newMainboard.proposedGrossBoxMm, wall=j.room.northWallFacesYMm, wet=j.room.wetUtilityPlanMm, opening=j.room.northOpeningXMm, rows = result.branches.map((b,i)=>t(40,130+i*77,`${b.id.toUpperCase()} ${b.requiredDeliveryEachLmin} L/min · bore ${b.apertureNominalMm}±${b.apertureToleranceMm}mm · upper fault ${b.maximumLimitedEachLmin.toFixed(1)} L/min`,18)
    +t(40,155+i*77,`Residual ${b.residualPressureComparisonBar.toFixed(2)} bar · old channel ${b.existingReceiver.maximumScreenedLmin.toFixed(2)} L/min · ${b.existingReceiver.limitedFault.necessaryChannelAndReceiverScreen?'necessary screen only':'REJECT OLD RECEIVER'}`)).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1050" viewBox="0 0 1200 1050"><rect width="1200" height="1050" fill="#f5f1e6"/><g font-family="Arial,sans-serif" fill="#25221c">${t(35,44,'One inlet direction · distinct duties, one whole-room decision',26)}${t(35,76,'Authored reference proposal. Existing Plant receiver rejected; room, source and material acceptance remain open.',16)}${rows}${t(40,300,`Common source must deliver ${j.designDuties.commonSourceSimultaneousLmin} L/min; simultaneous source faults ${result.bound.maximumCombinedLmin.toFixed(1)} L/min + actual stored release.`)}${rect(j.room.wetUtilityPlanMm,'#dae8e5')}${rect([wet[0],wall[0],wet[2],wall[1]-wall[0]],'#c6c2b5')}${rect([opening[0],wall[0],opening[1]-opening[0],wall[1]-wall[0]],'#f5f1e6')}${t(42,653,`Utility · ${wet[2]} × ${wet[3]} mm`,14)}${t(42,364,'Plant entry · retained arch',14)}${t(42,465,'Dry service lobby',14)}${Object.values(j.room.retainedFurniture).map((p:any)=>rect(p,'#ccc7b8')).join('')}${rect([board[0],board[1],board[3],board[4]],'#d6b987')}${t(420,380,'WET UTILITY / DRY MAINBOARD',19)}${t(420,415,'Keep washer, sink, south purge and both east-head tasks.')}${t(420,445,'Retire old cold connection; two independent pillar taps.')}${t(420,475,'Ordinary indoor cuts and supported cold renewal still required.')}${t(420,515,'Mainboard only: actual sealed case, no inverter heat.')}${t(420,545,'Door-open spray and actual filled-board heat remain unqualified.')}${t(420,585,'STREETHEAD PV · separate dry, shaded, ventilated bay',19)}${t(420,618,'900 × 1400 mm clear + service face; never borrow DNO cell.')}${t(420,648,'Actual module strings, DC/AC isolation and rated cable routes.')}${t(420,688,'PLANT: new receiver + factory stored-water release model',18)}${t(420,720,'The Lodge aperture does not bound cylinder/upper-pipe backflow.')}${t(420,758,'SUPPORT / FLOOR / DRAINS / FROST',18)}${t(420,790,'No new mass or pressure anchors enter the 52-head solve yet.')}${t(420,820,'No assumed recess, DPC cut, open spill slot or manual response.')}${t(420,860,'Transfer is a necessary envelope, not a whole handling pass.')}${t(420,890,`Buffer/door reserve after settings: ${j.transfer.bufferAfter10Mm.toFixed(1)} / ${j.transfer.doorAfter10Mm.toFixed(1)} mm.`)}<polyline points="${j.transfer.pathMm.map(p=>`${X(p[0])},${Y(p[1])}`).join(' ')}" stroke="#247b91" stroke-width="4" fill="none"/>${t(40,995,'HAD OPEN · counterfactual room geometry only · no owner, physical, source, product or material approval',17)}</g></svg>`
}
