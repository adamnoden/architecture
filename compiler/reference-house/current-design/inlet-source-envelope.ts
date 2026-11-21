import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { CurrentDesignResolution } from './resolve.js'
import { inletCabinetProductFacts } from './inlet-cabinet-copper.js'
import { criticalHalfRoundFlow, receiverWeirHeadMm, reliefEntranceHeadMm, solveHalfRoundRelief,
  southInletReliefComparison } from '../../../project/had/studies/south-inlet-relief-hydraulics.mjs'

export const inletSourceEnvelopeFields = ['apertureNominalMm', 'apertureToleranceMm', 'sourceMaximumTotalBar',
  'sourceMinimumDynamicBar', 'requiredEachLmin', 'requiredResidualBar', 'additionalNetworkLossBar',
  'dischargeCoefficientComparison'] as const
export type InletSourceEnvelopeSettings = Readonly<Record<typeof inletSourceEnvelopeFields[number], number>>
export const readInletSourceEnvelopeSettings = (): InletSourceEnvelopeSettings => ({ apertureNominalMm: 9,
  apertureToleranceMm: .1, sourceMaximumTotalBar: 9, sourceMinimumDynamicBar: 3.5,
  requiredEachLmin: 50, requiredResidualBar: 1, additionalNetworkLossBar: .5, dischargeCoefficientComparison: .62 })
const paths = ['project/had/studies/south-inlet-under-sill.json', 'project/had/studies/south-inlet-wet-box.json',
  'project/had/studies/south-inlet-relief.json', 'project/had/studies/south-utility-inlet.json',
  'project/had/studies/current-house-services.json'] as const
const methodPaths = ['compiler/reference-house/current-design/inlet-source-envelope.ts',
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
  return { planDigest: sha256SemanticFingerprint(resolved.design), bindingDigest: sha256SemanticFingerprint({ inputs, methods }), inputs, methods, data }
}
export function readInletSourceEnvelopeCase(resolved: CurrentDesignResolution) {
  const b = binding(resolved)
  return { schema: 'had-inlet-source-envelope-request/1' as const, design: resolved.design,
    sourceEnvelope: { schema: 'had-inlet-source-envelope-case/1' as const, planDigest: b.planDigest,
      bindingDigest: b.bindingDigest, settings: readInletSourceEnvelopeSettings() } }
}
function settings(value: unknown): InletSourceEnvelopeSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).length !== inletSourceEnvelopeFields.length
    || inletSourceEnvelopeFields.some(key => !Object.hasOwn(value, key))) throw new Error('Complete authored inlet source settings required')
  const s = value as InletSourceEnvelopeSettings
  if (inletSourceEnvelopeFields.some(key => !Number.isFinite(s[key])) || s.apertureNominalMm < 4 || s.apertureNominalMm > 20
    || s.apertureToleranceMm < 0 || s.apertureToleranceMm > .5 || s.sourceMaximumTotalBar <= 0 || s.sourceMaximumTotalBar > 10
    || s.sourceMinimumDynamicBar <= 0 || s.sourceMinimumDynamicBar > s.sourceMaximumTotalBar || s.requiredEachLmin <= 0
    || s.requiredEachLmin > 90 || s.requiredResidualBar < 0 || s.additionalNetworkLossBar < 0
    || s.dischargeCoefficientComparison <= 0 || s.dischargeCoefficientComparison > 1) throw new Error('Inlet source settings exceed the comparison domain')
  return s
}

export function runInletSourceEnvelopeCase(resolved: CurrentDesignResolution, input: unknown) {
  const b = binding(resolved)
  if (!input || typeof input !== 'object' || Array.isArray(input)
    || Object.keys(input).length !== 4 || !['schema', 'planDigest', 'bindingDigest', 'settings'].every(key => Object.hasOwn(input, key))) throw new Error('Versioned source-bound inlet source-envelope case required')
  const v = input as Record<string, unknown>
  if (v.schema !== 'had-inlet-source-envelope-case/1' || v.planDigest !== b.planDigest || v.bindingDigest !== b.bindingDigest) throw new Error('Stale inlet source-envelope source, design or method')
  const s = settings(v.settings), native = b.data[paths[0]], wet = b.data[paths[1]], relief = b.data[paths[2]], inlet = b.data[paths[3]], services = b.data[paths[4]]
  const maximumDiameterMm = s.apertureNominalMm + s.apertureToleranceMm, minimumDiameterMm = s.apertureNominalMm - s.apertureToleranceMm
  const maximumEachLmin = flow(maximumDiameterMm, s.sourceMaximumTotalBar)
  // Maximum flow uses Cd<=1 and the lowest declared density. Delivery LOSS uses density1000,
  // the smallest bore and an explicitly unqualified Cd comparison; these are different bounds.
  const pressureLossBar = .5 * 1000 * (s.requiredEachLmin / 60000 / (s.dischargeCoefficientComparison * Math.PI * (minimumDiameterMm / 1000) ** 2 / 4)) ** 2 / 1e5
  const residualBar = s.sourceMinimumDynamicBar - pressureLossBar - s.additionalNetworkLossBar
  const availableRestrictionBar = s.sourceMinimumDynamicBar - s.requiredResidualBar - s.additionalNetworkLossBar
  const minimumDeliveryDiameterMm = availableRestrictionBar > 0 ? diameter(s.requiredEachLmin, availableRestrictionBar, s.dischargeCoefficientComparison, 1000) : null
  const optimisticDeliveryDiameterMm = availableRestrictionBar > 0 ? diameter(s.requiredEachLmin, availableRestrictionBar, 1, 1000) : null
  const fullBoreMm = inletCabinetProductFacts.pipe.maximumOuterDiameterIncludingOvalityMm - 2 * inletCabinetProductFacts.pipe.minimumWallMm
  type Point = readonly [number, number, number]
  type Branch = { id: string; coordinates: readonly Point[]; bores: readonly { inner: Point; outer: Point; radius: number }[] }
  const branches = (native.branches as readonly Branch[]).map(branch => {
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
    const maximumScreenedLmin = lo, maximumContainmentDiameterMm = diameter(maximumScreenedLmin, s.sourceMaximumTotalBar)
    const nominalMinimumMm = minimumDeliveryDiameterMm === null ? null : minimumDeliveryDiameterMm + s.apertureToleranceMm
    const nominalMaximumMm = maximumContainmentDiameterMm - s.apertureToleranceMm
    const intervalExists = nominalMinimumMm !== null && nominalMinimumMm <= nominalMaximumMm
    return { id: branch.id, seriesPath: ['public utility source', `Lodge/${branch.id}/independent upstream cut`,
      `Lodge/${branch.id}/accessible fixed metal restriction`, `${branch.id}/joint-free replaceable wall spool`,
      `SERVICEHUB/${branch.id}/independent indoor house cut`, `${branch.id}/supported upper network and local appliance cuts`],
      sourceEntryAxisMm: branch.coordinates[1], retainedUpperDestinationMm: branch.coordinates.at(-1),
      internalHouseCut: { required: true, suppliedByLodge: false, suppliedByApplianceStop: false, location: 'unresolved-internal-wet-service-hub', usableOrdinaryAccessProved: false },
      maximumLimitedEachLmin: round(maximumEachLmin), requiredDeliveryEachLmin: s.requiredEachLmin,
      pressureLossComparisonBar: round(pressureLossBar), residualPressureComparisonBar: round(residualBar),
      minimumResidualScreen: residualBar >= s.requiredResidualBar, dischargeCoefficientQualified: false,
      existingReceiver: { lowerBore: lower, maximumScreenedLmin: round(maximumScreenedLmin),
        crownOnlyCapacityLmin: round(criticalHalfRoundFlow(clear / 1000, (clear - relief.hydraulics.spareAirMM) / 1000, bed / 1000) * 60000),
        limitedFault: capacity(maximumEachLmin), requiredDemandControl: capacity(s.requiredEachLmin),
        fullBoreWithoutRestriction: { maximumLmin: round(flow(fullBoreMm, s.sourceMaximumTotalBar)), ...capacity(flow(fullBoreMm, s.sourceMaximumTotalBar)) } },
      feasibleNominalApertureIntervalMm: { minimumForDelivery: nominalMinimumMm === null ? null : round(nominalMinimumMm),
        maximumForExistingReceiver: round(nominalMaximumMm), existsForNecessaryScreens: intervalExists,
        optimisticCdOneMinimumForDelivery: optimisticDeliveryDiameterMm === null ? null : round(optimisticDeliveryDiameterMm + s.apertureToleranceMm),
        optimisticCdOneIntervalExists: optimisticDeliveryDiameterMm !== null && optimisticDeliveryDiameterMm + s.apertureToleranceMm <= nominalMaximumMm,
        verdict: intervalExists ? 'necessary-hydraulic-interval-only' : 'reject-existing-receiver-plus-demand-envelope' },
      minimumSourceDynamicBarForExistingReceiverComparison: round(s.requiredResidualBar + s.additionalNetworkLossBar
        + .5 * 1000 * (s.requiredEachLmin / 60000 / (s.dischargeCoefficientComparison * Math.PI * ((maximumContainmentDiameterMm - 2 * s.apertureToleranceMm) / 1000) ** 2 / 4)) ** 2 / 1e5) }
  })
  const states = [
    { id: 'ordinary-both-open', sourceFed: true, eachLmin: s.requiredEachLmin, result: 'unqualified-delivery-and-internal-access', obligation: 'Prove simultaneous two-branch source curve, actual restriction Cd, full valves and network losses; no double allocation of one source.' },
    { id: 'downstream-house-cut-closed', sourceFed: true, eachLmin: 0, result: 'full-source-static-pressure-retained', obligation: 'A restriction does not reduce shut-in pressure; all pressure components still require the complete maximum pressure and transient envelope.' },
    { id: 'one-wall-spool-ruptures-primary-mouth-blocked', sourceFed: true, eachLmin: round(maximumEachLmin), result: branches.every((c: any) => c.existingReceiver.limitedFault.necessaryChannelAndReceiverScreen) ? 'necessary-channel-only' : 'reject-existing-channel', obligation: 'Actual low receiver, reverse sleeve, impact shield, support and wet seams still require joined proof.' },
    { id: 'downstream-indoor-cut-or-upper-joint-fault', sourceFed: true, eachLmin: round(maximumEachLmin), result: 'reject-uncontained-upper-network', obligation: 'Low entry containment does not catch the relocated house cut or upper joints. Replan the complete internal wet station; do not reuse the rejected tall cabinet.' },
    { id: 'both-branches-rupture', sourceFed: true, eachLmin: round(maximumEachLmin), combinedLmin: round(2 * maximumEachLmin), result: 'separate-outfall-and-common-site-proof-required', obligation: 'Charge both flows independently. One receiving depression, obstruction or site flood cannot be credited twice.' },
    { id: 'secondary-high-or-submerged', sourceFed: true, eachLmin: round(maximumEachLmin), result: 'reject-tailwater-outside-envelope', obligation: 'The free-drop model is inapplicable; no pressure-backed or submerged outlet credit.' },
    { id: 'both-reliefs-blocked', sourceFed: true, eachLmin: round(maximumEachLmin), result: 'reject-unattended-event', obligation: 'Finite storage is time to spill, not isolation. No manual response time is assigned.' },
    { id: 'restriction-missing-eroded-or-bypassed', sourceFed: true, eachLmin: round(flow(fullBoreMm, s.sourceMaximumTotalBar)), result: 'reject-limited-flow-credit', obligation: 'Use full-bore source bound, tamper/effective-bore inspection and no bypass. A nameplate flow setting is insufficient.' },
    { id: 'upstream-of-restriction-rupture', sourceFed: true, eachLmin: null, result: 'separate-boundary-wet-territory-required', obligation: 'Keep restriction immediately after the Lodge cut and all upstream joints outside the house. Public-side flow is not bounded by this aperture; independent provider action remains required.' },
    { id: 'own-branch-isolated-sibling-live', sourceFed: false, eachLmin: 0, result: 'own-branch-cold-work-only', obligation: 'Close own Lodge and house cuts; isolate/drain the upper trapped network and prove zero pressure. Keep sibling enclosure and supports independent.' },
    { id: 'restriction-or-house-cut-renewal', sourceFed: false, eachLmin: 0, result: 'two-sided-cold-isolation-required', obligation: 'Close Lodge/provider side as applicable and isolate/drain house side; support both pipe ends. Restriction removal temporarily destroys the flow bound; prohibit charging until verified reinstatement.' },
    { id: 'wall-spool-renewal-inward-and-outward', sourceFed: false, eachLmin: 0, result: 'retained-pan-inward-conflict-not-discharged', obligation: 'The prior permanent-pan and ordinary operator/tool/rest conflicts remain. New room geometry must prove both actual extraction directions or explicitly reject one with a complete ordinary alternative.' },
    { id: 'frost-or-loss-of-warmth', sourceFed: false, eachLmin: null, result: 'whole-route-thermal-proof-required', obligation: 'Restriction, Lodge, spool and room drains must stay serviceable through the declared cold event. Permanent open spill slots do not establish a warm enclosure; no trace heating, antifreeze or moving flap is invented.' },
  ]
  const result = { schema: 'had-inlet-source-envelope-result/1' as const, state: 'existing-whole-arrangement-rejected' as const,
    source: { planDigest: b.planDigest, bindingDigest: b.bindingDigest, inputs: b.inputs, methods: b.methods }, settings: s,
    bound: { method: 'Incompressible steady energy upper bound Q<=A sqrt(2 p_total/rho), Cd<=1; no upstream velocity-head double count.',
      minimumDensityKgM3: 990, maximumDensityKgM3ForDeliveryLoss: 1000, declaredWaterDomainC: [0, 40], densityDomainQualification: 'authored-water-comparison-bound',
      maximumPressureIncludesStaticDynamicElevationAndTransientHead: true, installedSourceMaximumProved: false,
      minimumDiameterMm: round(minimumDiameterMm), maximumDiameterMm: round(maximumDiameterMm), maximumEachLmin: round(maximumEachLmin),
      sourceMinimumIsAtSimultaneousDemand: true, deliveryCdIsComparisonNotGuaranteedLowerBound: true }, branches, states,
    architectureDecision: { prefer: 'internal-wet-utility-and-service-hub-replan',
      reject: ['further-tall-cabinet-glands-and-local-steel', 'adopt-low-box-without-genuine-internal-house-cuts', 'default-east-annex'],
      retainedPlantCylinderPathMm: services.plant.cylinder.path, retainedBufferStationMm: services.plant.primaryBuffer.station,
      retainedD2OutfallMm: services.plant.independentSafety.outfall, retainedUtilityElectricalFieldMm: services.utility.electricalWorkingField,
      rationale: 'The current small lobby is circulation, the Utility valve bay already contains rack/waste duties, and the plant control reservation is occupied. None is spare room. Replan the whole Utility wet station and separate its electrical task before adding footprint, roof, openings and another frost boundary.',
      newRoomGeometryAuthored: false, electricalRelocationSelected: false, annexSelected: false },
    materials: { valve: inletCabinetProductFacts.valve.model, knownPolymerItemsAcrossTwoValves: 6, ownerExceptionsApproved: 0,
      fixedRestrictionAllConstituentsQualified: false, potableApprovalQualified: false },
    selected: false, preSiteArrangementComplete: false, installedAcceptance: false }
  return { ...result, reviewSvg: draw(result) }
}
function draw(result: { branches: readonly any[]; bound: { maximumEachLmin: number }; settings: InletSourceEnvelopeSettings }) {
  const rows = result.branches.map((b, i) => `<text x="45" y="${220 + i * 95}" font-size="18">${b.id}: ${b.maximumLimitedEachLmin.toFixed(1)} L/min upper fault bound; existing channel ${b.existingReceiver.maximumScreenedLmin.toFixed(1)} L/min</text><text x="45" y="${249 + i * 95}" font-size="15">Nominal aperture: delivery ≥${b.feasibleNominalApertureIntervalMm.minimumForDelivery?.toFixed(2) ?? 'none'} mm; existing receiver ≤${b.feasibleNominalApertureIntervalMm.maximumForExistingReceiver.toFixed(2)} mm → ${b.feasibleNominalApertureIntervalMm.existsForNecessaryScreens ? 'necessary interval only' : 'NO COMMON INTERVAL'}</text>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="690" viewBox="0 0 1100 690"><rect width="1100" height="690" fill="#f5f1e6"/><g font-family="Arial,sans-serif" fill="#25221c"><text x="40" y="45" font-size="27">Incoming water · resolve the source and the whole room</text><text x="40" y="80" font-size="17">Reject the existing whole arrangement; an aperture does not repair its upper wet boundary.</text><rect x="40" y="110" width="1020" height="65" fill="none" stroke="#6a6251"/><text x="55" y="136" font-size="15">Utility source → Lodge cut → fixed metal restriction → joint-free wall spool</text><text x="55" y="160" font-size="15">→ genuine internal house cut → independently supported upper network and local appliance cuts</text>${rows}<text x="45" y="435" font-size="17">${result.settings.apertureNominalMm} ±${result.settings.apertureToleranceMm} mm; maximum ${result.settings.sourceMaximumTotalBar} bar TOTAL head; both branches ${ (2 * result.bound.maximumEachLmin).toFixed(1)} L/min.</text><text x="45" y="468" font-size="16">Restriction retains full shut-in pressure. Bypass/missing aperture loses all limited-flow credit.</text><text x="45" y="510" font-size="17">Develop: a real internal wet Utility / service hub with a separated electrical task.</text><text x="45" y="540" font-size="16">Retain cylinder, buffer, D2, dock and normal passage; price every moved appliance and route.</text><text x="45" y="580" font-size="16">No annex, valve exception, frost pass, ordinary loaded renewal or source adoption is granted.</text><text x="45" y="625" font-size="14">New whole-room geometry, support, independent drainage, source curve and warm boundary remain proof duties.</text><text x="45" y="655" font-size="13">Reference investigation. Diagram and hydraulic screens do not establish an installed inlet.</text></g></svg>`
}
