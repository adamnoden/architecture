import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import {
  receiverWeirHeadMm, reliefEntranceHeadMm, reverseSleeveFlow, solveHalfRoundRelief, southInletReliefComparison,
} from '../../../project/had/studies/south-inlet-relief-hydraulics.mjs'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import { createSectionPaperProjection } from '../../publication-drawing/projection.js'
import type { DrawingSceneV2 } from '../../publication-drawing-v2/model.js'
import { readInletSillInsertCase, runInletSillInsertCase } from './inlet-sill-insert.js'
import type { CurrentDesignResolution } from './resolve.js'

const hydraulics = 'project/had/studies/south-inlet-relief-hydraulics.mjs'
const reliefReceipt = 'project/had/studies/south-inlet-relief.json'
const sillReceipt = 'project/had/studies/south-inlet-under-sill.json'
const cellReceipt = 'project/had/studies/south-inlet-wet-box.json'
const inletReceipt = 'project/had/studies/south-utility-inlet.json'
const branchIds = ['utility', 'plant'] as const
type BranchId = typeof branchIds[number]
type BranchCase = {
  readonly flowLmin: number
  readonly entranceLossK: number
  readonly reliefBedMm: number
  readonly lowerReliefOpen: boolean
  readonly highHoodOpen: boolean
  readonly receiverTailwaterZMm: number | null
}
type FaultCase = {
  readonly schema: 'had-inlet-fault-case/1'
  readonly planDigest: string
  readonly bindingDigest: string
  readonly insertCaseDigest: string
  readonly branches: Readonly<Record<BranchId, BranchCase>>
}
type Receiver = {
  readonly terminalY: number
  readonly terminalInvertZ: number
  readonly receiverY: readonly [number, number]
  readonly overflowCrestZ: number
  readonly raisedCrestSensitivityMM: number
  readonly adverseBottomOpenWidthMM: number
  readonly maximumReceiverWaterZ: number
  readonly ratedReceiverWaterZ: number
  readonly freeDropReserveAfterSettingsMM: number
}
type ReliefReceipt = {
  readonly hydraulics: {
    readonly challengeLminPerBranch: number
    readonly downstreamBermMM: number
    readonly spareAirMM: number
    readonly designEntranceCoefficientCeiling: number
    readonly headWithK1p5MM: number
    readonly criticalLimitAt85mmLmin: number
  }
  readonly throughWallRupture: {
    readonly preferredWideBore: NonNullable<ReturnType<typeof reverseSleeveFlow>>
  }
  readonly geometry: { readonly lowerFormedDiameterMM: number; readonly upperFormedDiameterMM: number }
}
type Cell = {
  readonly permanentLowerTroughLipZ: number
  readonly designWetStageZ: number
  readonly dryReserveAfterSplashAndSettingMM: number
  readonly frontY: number
}
type Diagnostic = {
  readonly code: 'RELIEF_UNAVAILABLE' | 'HOOD_UNAVAILABLE' | 'OPEN_FLOW_UNAVAILABLE' | 'TROUGH_DRY_RESERVE' |
    'UPPER_SLEEVE_AIRWAY' | 'RECEIVER_FREE_DROP' | 'HIGH_VENT_AIRWAY'
  readonly message: string
}

const round = (value: number) => Number(value.toFixed(4))
const records = (value: unknown, keys: readonly string[]): value is Readonly<Record<string, unknown>> =>
  !!value && typeof value === 'object' && !Array.isArray(value) &&
  Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key))

function readReference(resolved: CurrentDesignResolution) {
  const binding = resolved.disciplineBindings.find(entry => entry.id === 'had-inlet-south-fault-envelope')
  if (!binding) throw new Error('The south inlet fault requires the applicable HAD relief and STR sill bindings')
  const observed = new Map([hydraulics, reliefReceipt, sillReceipt, cellReceipt, inletReceipt].map(path => {
    const bytes = readFileSync(new URL('../../../' + path, import.meta.url))
    const gitBlob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
    if (gitBlob !== binding.identities[path]) throw new Error(`Stale south inlet fault source: ${path}`)
    return [path, { bytes, gitBlob }]
  }))
  const json = <T>(path: string): T => JSON.parse(observed.get(path)!.bytes.toString('utf8'))
  const native = json<ReliefReceipt>(reliefReceipt)
  const { hydro: { sleeveConstructionMM } } = json<{
    readonly hydro: { readonly sleeveConstructionMM: { readonly clearDiameter: number; readonly formedDiameter: number } }
  }>(inletReceipt)
  if (native.geometry.lowerFormedDiameterMM !== sleeveConstructionMM.formedDiameter) {
    throw new Error('The lower relief opening no longer matches the source clear-bore comparison')
  }
  const sill = json<{ readonly branches: readonly { readonly id: BranchId; readonly reliefReceiver: Receiver }[] }>(sillReceipt)
  const wet = json<{ readonly branches: readonly { readonly id: BranchId; readonly case: Cell }[] }>(cellReceipt)
  const insert = runInletSillInsertCase(resolved, readInletSillInsertCase(resolved).insert)
  if (insert.status !== 'within-conditional-screen') throw new Error('The bound sill geometry no longer clears its conditional screen')

  const branchCase: BranchCase = {
    flowLmin: native.hydraulics.challengeLminPerBranch,
    entranceLossK: native.hydraulics.designEntranceCoefficientCeiling,
    reliefBedMm: native.hydraulics.downstreamBermMM,
    lowerReliefOpen: true,
    highHoodOpen: true,
    receiverTailwaterZMm: null,
  }
  const baseline: FaultCase = {
    schema: 'had-inlet-fault-case/1', planDigest: binding.applicability.planDigest,
    bindingDigest: binding.digest, insertCaseDigest: insert.source.caseDigest,
    branches: { utility: { ...branchCase }, plant: { ...branchCase } },
  }
  const branches = branchIds.map((id, index) => {
    const receiver = sill.branches.find(branch => branch.id === id)?.reliefReceiver
    const cell = wet.branches.find(branch => branch.id === id)?.case
    const upper = insert.calculation.bores.find(bore => bore.id === `${id}-pressure`)
    const relief = insert.calculation.bores.find(bore => bore.id === `${id}-relief`)
    const vent = insert.calculation.vents[index]
    if (!receiver || !cell || !upper || !relief || !vent ||
        upper.formedReserveODMM !== native.geometry.upperFormedDiameterMM ||
        relief.formedReserveODMM !== native.geometry.lowerFormedDiameterMM) {
      throw new Error(`Conditional sill fault geometry is unavailable for ${id}`)
    }
    return { id, receiver, cell, upper, relief, vent, lowerClearDiameterMm: sleeveConstructionMM.clearDiameter }
  })
  const sources = {
    planDigest: baseline.planDigest, bindingDigest: baseline.bindingDigest,
    insertCaseDigest: baseline.insertCaseDigest, insertBindingDigest: insert.source.bindingDigest,
  }
  const method = { id: 'HAD-SOUTH-INLET-RELIEF/1', path: hydraulics,
    gitBlob: observed.get(hydraulics)!.gitBlob,
    sources: Object.fromEntries([...observed].map(([path, file]) => [path, file.gitBlob])) }
  return { baseline, native, branches, host: insert.host, sources, method }
}

export function readInletFaultCase(resolved: CurrentDesignResolution) {
  return { schema: 'had-inlet-fault-request/1' as const, design: resolved.design, fault: readReference(resolved).baseline }
}

function readTrial(input: unknown, reference: ReturnType<typeof readReference>): FaultCase {
  const { baseline, native } = reference
  if (!records(input, Object.keys(baseline)) || input.schema !== baseline.schema ||
      !records(input.branches, branchIds)) throw new Error('Expected a versioned south inlet fault case with two independent branches')
  if (input.planDigest !== baseline.planDigest || input.bindingDigest !== baseline.bindingDigest ||
      input.insertCaseDigest !== baseline.insertCaseDigest) throw new Error('Stale south inlet fault source binding')
  for (const id of branchIds) {
    const branch = input.branches[id]
    if (!records(branch, Object.keys(baseline.branches[id]))) throw new Error(`Expected an explicit ${id} fault branch`)
    if (typeof branch.flowLmin !== 'number' || !Number.isFinite(branch.flowLmin) || branch.flowLmin <= 0 ||
        branch.flowLmin > native.hydraulics.criticalLimitAt85mmLmin ||
        typeof branch.entranceLossK !== 'number' || !Number.isFinite(branch.entranceLossK) || branch.entranceLossK < 0 ||
        branch.entranceLossK > 3 ||
        typeof branch.reliefBedMm !== 'number' || !Number.isFinite(branch.reliefBedMm) || branch.reliefBedMm < 0 || branch.reliefBedMm > 50 ||
        typeof branch.lowerReliefOpen !== 'boolean' || typeof branch.highHoodOpen !== 'boolean' ||
        (branch.receiverTailwaterZMm !== null && (typeof branch.receiverTailwaterZMm !== 'number' ||
          !Number.isFinite(branch.receiverTailwaterZMm) || branch.receiverTailwaterZMm > reference.host.rawSillZMm))) {
      throw new Error(`The ${id} fault inputs exceed the open-flow comparison range`)
    }
  }
  return input as FaultCase
}

function branchFault(source: ReturnType<typeof readReference>['branches'][number], trial: BranchCase, native: ReliefReceipt) {
  const { id, receiver, cell, relief, upper, vent, lowerClearDiameterMm } = source
  const { roughness, settingMm, splashMm, carrierRiseM, receiverWeirCoefficient } = southInletReliefComparison
  const { preferredWideBore: upperBasis } = native.throughWallRupture
  const { spareAirMM } = native.hydraulics
  const [[, reliefOuterY, reliefOuterZ], [, reliefInnerY, reliefInnerZ]] = relief.axis
  const [[, upperOuterY, upperOuterZ], [, upperInnerY, upperInnerZ]] = upper.axis
  const lowerInvert = reliefInnerZ - lowerClearDiameterMm / 2
  const upperInvert = upperInnerZ - upperBasis.cleanBoreMM / 2
  const dryLimit = cell.permanentLowerTroughLipZ - splashMm - settingMm
  const ventInvert = Math.min(...vent.axis.map(point => point[2])) - vent.clearMM / 2
  const receiverLimit = receiver.maximumReceiverWaterZ - settingMm
  const geometry = { lowerInvertZMm: round(lowerInvert), upperInvertZMm: round(upperInvert),
    dryLimitZMm: round(dryLimit), highVentInvertZMm: round(ventInvert), receiverLimitZMm: round(receiverLimit) }
  const diagnostic: Diagnostic[] = []
  const outcome = { id, geometry, normalSleeve: 'outside-mouth-blocked' as const,
    sibling: 'independent-closure-and-receiver-assumed-intact' as const,
    installedPressureAssessment: 'unavailable' as const }
  if (!trial.lowerReliefOpen) diagnostic.push({ code: 'RELIEF_UNAVAILABLE', message: 'No independent lower discharge is available in this branch.' })
  if (!trial.highHoodOpen) diagnostic.push({ code: 'HOOD_UNAVAILABLE', message: 'The atmospheric hood is unavailable. A vented stage comparison cannot be made.' })
  if (diagnostic.length) return { ...outcome, status: 'no-passive-path' as const, diagnostic, calculation: null }

  const flowM3s = trial.flowLmin / 60000
  const lower = solveHalfRoundRelief({ flowM3s, diameterM: lowerClearDiameterMm / 1000,
    bedM: trial.reliefBedMm / 1000, slope: (reliefInnerZ - reliefOuterZ) / (reliefInnerY - reliefOuterY), roughness })
  const reversed = reverseSleeveFlow({ flowM3s, diameterM: upperBasis.cleanBoreMM / 1000,
    bedM: upperBasis.bedObstructionMM / 1000, carrierM: upperBasis.carrierEnvelopeODMM / 1000,
    carrierRiseM, lengthM: (upperInnerY - upperOuterY) / 1000, riseM: (upperInnerZ - upperOuterZ) / 1000,
    roughness, entranceLossK: upperBasis.entranceLossK, spareAirMM })
  if (!lower || !reversed) {
    diagnostic.push({ code: 'OPEN_FLOW_UNAVAILABLE', message: 'The open-flow solver has no bounded crown-depth solution.' })
    return { ...outcome, status: 'outside-open-flow-comparison' as const, diagnostic, calculation: null }
  }

  const head = reliefEntranceHeadMm(lower, trial.entranceLossK)
  const stage = lowerInvert + head
  const upperStageGap = upperInvert - stage
  const openReceiverStage = receiver.overflowCrestZ + receiver.raisedCrestSensitivityMM + receiverWeirHeadMm({
    flowM3s, coefficient: receiverWeirCoefficient, widthM: receiver.adverseBottomOpenWidthMM / 1000,
  })
  const receiverStageLowerBound = Math.max(openReceiverStage, trial.receiverTailwaterZMm ?? openReceiverStage)
  const receiverControlled = receiverStageLowerBound > openReceiverStage
  const airMargin = lowerClearDiameterMm - spareAirMM - 1000 * Math.max(lower.normal, lower.critical)
  if (airMargin < 0) diagnostic.push({
    code: 'OPEN_FLOW_UNAVAILABLE', message: 'The lower relief flow depth exhausts its crown air allowance.',
  })
  if (dryLimit < stage) diagnostic.push({
    code: 'TROUGH_DRY_RESERVE', message: 'The lower relief exceeds the available water depth below the permanent trough lip.',
  })
  if (!reversed.ventedCrownRetained || upperStageGap < 0) diagnostic.push({
    code: 'UPPER_SLEEVE_AIRWAY', message: 'The reverse flow or the inboard wet stage exhausts the upper sleeve airway.',
  })
  if (receiverStageLowerBound > receiverLimit) diagnostic.push({
    code: 'RECEIVER_FREE_DROP', message: 'The local receiver stage exhausts the branch terminal free-drop allowance.',
  })
  if (ventInvert <= stage) diagnostic.push({
    code: 'HIGH_VENT_AIRWAY', message: 'The static wet stage reaches the high vent clear-core elevation.',
  })
  const calculation = {
    headMm: round(head), wetStageZMm: round(stage), dryReserveMm: round(dryLimit - stage),
    normalReliefDepthMm: round(lower.normal * 1000), criticalReliefDepthMm: round(lower.critical * 1000),
    lowerCrownAllowanceMm: round(airMargin), upperMouthAboveBoxStageMm: round(upperStageGap),
    upperMouthAboveBoxDryLimitMm: round(upperInvert - dryLimit), highVentAboveBoxStageMm: round(ventInvert - stage),
    reverseSleeve: reversed, openReceiverStageZMm: round(openReceiverStage),
    imposedReceiverTailwaterZMm: trial.receiverTailwaterZMm,
    receiverStageLowerBoundZMm: round(receiverStageLowerBound), receiverFreeDropReserveMm: round(receiverLimit - receiverStageLowerBound),
    receiverBoundary: receiverControlled ? 'imposed-level-discharge-unproved' as const : 'free-overflow-comparison' as const,
  }
  return { ...outcome, status: diagnostic.length ? 'blocked' as const :
    receiverControlled ? 'receiver-boundary-unproved' as const : 'within-conditional-open-flow' as const,
    diagnostic, calculation }
}

function elevation(reference: ReturnType<typeof readReference>, results: readonly ReturnType<typeof branchFault>[], caseDigest: string): DrawingSceneV2 {
  const scaleDenominator = 20
  const horizontalBounds = { min: Math.min(...reference.branches.map(branch => branch.receiver.receiverY[0])),
    max: Math.max(...reference.branches.map(branch => branch.cell.frontY)) }
  const verticalBounds = { min: Math.min(0, ...results.map(result => result.calculation?.receiverStageLowerBoundZMm ?? 0)),
    max: Math.max(reference.host.rawSillZMm, ...results.map(result => result.calculation?.wetStageZMm ?? 0)) }
  const primitives: DrawingSceneV2['primitives'] = []
  const column = (horizontalBounds.max - horizontalBounds.min) / scaleDenominator + 20
  for (const [index, source] of reference.branches.entries()) {
    const { id, cell, receiver } = source
    const result = results[index]
    const x = 10 + index * column
    const project = createSectionPaperProjection({ scaleDenominator, horizontalBounds, verticalBounds, paperOrigin: { x, y: 19 } })
    const draw = (key: string, [fromY, fromZ]: readonly [number, number], [toY, toZ]: readonly [number, number],
      role: 'primary' | 'secondary') => primitives.push({
      kind: 'line', id: `${id}-${key}`, a: project.point(fromY, fromZ), b: project.point(toY, toZ),
      role, metadata: { caseDigest, fromYmm: fromY, toYmm: toY, fromZmm: fromZ, toZmm: toZ },
    })
    const [[, upperY0, upperZ0], [, innerY, upperZ1]] = source.upper.axis
    const [[, ventY0, ventZ0], [, ventY1, ventZ1]] = source.vent.axis
    primitives.push({ kind: 'text', id: `${id}-label`, x, y: 9, role: 'label',
      value: id === 'utility' ? 'Utility · separate branch' : 'Plant · separate branch' })
    draw('upper-sleeve-axis', [upperY0, upperZ0], [innerY, upperZ1], 'secondary')
    draw('high-vent-axis', [ventY0, ventZ0], [ventY1, ventZ1], 'secondary')
    draw('low-relief-invert', [receiver.terminalY, receiver.terminalInvertZ], [innerY, result.geometry.lowerInvertZMm], 'secondary')
    draw('dry-limit', [innerY, result.geometry.dryLimitZMm], [cell.frontY, result.geometry.dryLimitZMm], 'secondary')
    if (result.calculation) {
      const wet = result.calculation.wetStageZMm
      const tail = result.calculation.receiverStageLowerBoundZMm
      draw('box-stage', [innerY, wet], [cell.frontY, wet], 'primary')
      draw('receiver-stage', [receiver.receiverY[0], tail], [receiver.receiverY[1], tail], 'primary')
    } else {
      primitives.push({ kind: 'text', id: `${id}-unavailable`, x, y: 15, role: 'note',
        value: 'Open-flow result unavailable' })
    }
  }
  return { viewId: 'HAD-SOUTH-INLET-FAULT-ENVELOPE', sourceId: reference.host.id, scaleDenominator,
    title: 'South inlet · blocked upper sleeve mouth',
    description: 'Independent Y/Z comparisons of the open fault paths. Solid stage lines do not establish installed pressure or discharge.',
    widthMm: 2 * column, heightMm: 29 + (verticalBounds.max - verticalBounds.min) / scaleDenominator, primitives }
}

export function runInletFaultCase(resolved: CurrentDesignResolution, input: unknown) {
  const reference = readReference(resolved)
  const trial = readTrial(input, reference)
  const caseDigest = sha256SemanticFingerprint(trial)
  const results = reference.branches.map(branch => branchFault(branch, trial.branches[branch.id], reference.native))
  const nativeReplay = caseDigest === sha256SemanticFingerprint(reference.baseline)
  if (nativeReplay && results.some((result, index) => {
    const { calculation } = result
    const { cell, receiver } = reference.branches[index]
    return !calculation || calculation.headMm !== reference.native.hydraulics.headWithK1p5MM ||
      Math.abs(calculation.wetStageZMm - cell.designWetStageZ) > .0002 ||
      Math.abs(calculation.dryReserveMm - cell.dryReserveAfterSplashAndSettingMM) > .0002 ||
      Math.abs(calculation.receiverFreeDropReserveMm - receiver.freeDropReserveAfterSettingsMM) > .0002 ||
      calculation.reverseSleeve.reserveToAirLimitMM !== reference.native.throughWallRupture.preferredWideBore.reserveToAirLimitMM
  })) throw new Error('The source fault case no longer replays its bound hydraulic receipts')
  return {
    schema: 'had-inlet-fault-result/1' as const, source: { ...reference.sources, caseDigest, nativeReplay },
    host: reference.host, method: reference.method, branchCases: results,
    evidence: { candidateOnly: true, installedPressureAssessment: 'unavailable' as const,
      outstanding: ['actual supply envelope', 'installed hood resistance and blockage', 'wet impact and closure',
        'sustained tailwater and independent site disposal', 'frost and recovery'] },
    drawing: elevation(reference, results, caseDigest),
  }
}
