import { sha256SemanticFingerprint } from '../../core/identity.js'

const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const same = (a: unknown, b: unknown) => sha256SemanticFingerprint(a) === sha256SemanticFingerprint(b)
const close = (a: number, b: number, tolerance = 1e-6) => Math.abs(a - b) <= tolerance
const six = (value: unknown): value is number[] => Array.isArray(value) && value.length === 6 && value.every(finite)
const roofSources = ['project/str/studies/roof_floor_compatibility.py', 'project/str/studies/roof_stock_gravity.py', 'project/str/studies/roof_surface_pressure.py',
  'project/str/studies/current-house-roof-bracing.py', 'project/str/studies/current-house-welded-network.json',
  'project/str/studies/current-house-welded-heel.json', 'project/had/studies/water-replan.json'] as const
function sourceMap(value: unknown, expected: Readonly<Record<string, string>>, paths: readonly string[]) {
  return record(value) && same(Object.keys(value).sort(), [...paths].sort())
    && Object.entries(value).every(([path, hash]) => expected[path] === hash)
}

/** A matching coordinate is insufficient: every receiver must use a physical element row. */
export function hasPhysicalPlateTrace(value: unknown) {
  const trace = record(value) ? value.physicalPlateParticipation : undefined
  return record(trace) && trace.schema === 'str-retained-plate-operator-participation/1'
    && trace.physicalTraceConfirmed === true
    && ['actual-physical-mesh-point-trace', 'existing-finite-rc-member-trace'].includes(String(trace.traceSource))
    && trace.createdScalarCoordinateCount === 0 && trace.allCoefficientRowsUsedByPhysicalElements === true
    && Number.isInteger(trace.participatingPortCount) && Number(trace.participatingPortCount) > 0
    && finite(trace.assembledTraceRowMaxAbs) && trace.assembledTraceRowMaxAbs > 0
    && finite(trace.condensedTraceRowMaxAbs) && trace.condensedTraceRowMaxAbs > 0
    && Array.isArray(trace.portIndices) && trace.portIndices.length === trace.participatingPortCount
    && new Set(trace.portIndices).size === trace.portIndices.length
    && trace.portIndices.every(index => Number.isInteger(index) && index >= 0)
}

/** Pressure rows retain their actual area, sign and origins through condensation and local recovery. */
export function validateRoofSurfacePressure(roof: Readonly<Record<string, unknown>>, setting: unknown,
  sources: Readonly<Record<string, string>>) {
  const ledger = roof.roofSurfacePressure
  if (setting === null) {
    if (ledger !== null || roof.roofSurfacePressureIntegrated !== false) throw new Error('Unrequested roof surface pressure cannot enter the current result')
    return null
  }
  if (!record(setting) || setting.kind !== 'authored-equivalent-plan-pressure-control'
    || !finite(setting.uniformKPa) || setting.uniformKPa < -2.25 || setting.uniformKPa > 6.3
    || !record(setting.rowMultipliers) || !record(ledger) || ledger.schema !== 'str-roof-surface-pressure/1'
    || !same(ledger.request, setting) || !sourceMap(ledger.sourceSHA256, sources, roofSources)
    || roof.roofSurfacePressureIntegrated !== true || !finite(ledger.planAreaM2) || ledger.planAreaM2 <= 0
    || !finite(ledger.loadedWeightedPlanAreaM2) || !finite(ledger.verticalDownKN)
    || !six(ledger.pressureWrenchKN_KNm) || !six(ledger.originAndCondensedWrenchResidualKN_KNm)
    || ledger.originAndCondensedWrenchResidualKN_KNm.some(value => Math.abs(value) > 1e-7)
    || !six(ledger.sixRigidWorkResidualKN_KNmm) || ledger.sixRigidWorkResidualKN_KNmm.some(value => Math.abs(value) > 1e-5)
    || !finite(ledger.loadOnlyEnergyKNmm) || ledger.loadOnlyEnergyKNmm < 0
    || ['siteWindQualified', 'siteSnowQualified', 'facadePressureCorrelationQualified', 'roofLayerGravityIncluded', 'candidateAccepted']
      .some(key => ledger[key] !== false)
    || !Array.isArray(ledger.origins) || ledger.origins.length !== 108
    || !Array.isArray(ledger.actualLocalActions) || ledger.actualLocalActions.length !== 24) {
    throw new Error('The signed roof pressure lost its authored rows, physical work recovery or unqualified scope')
  }
  const expectedIds = Array.from({ length: 12 }, (_, frame) => Array.from({ length: 9 }, (_, row) => `ROOF-ROW/${frame}/${row}`)).flat()
  if (!same(Object.keys(setting.rowMultipliers).sort(), expectedIds.sort())) throw new Error('Roof pressure requires the exact actual 108 row IDs')
  const ids = new Set<string>(), wrench = [0, 0, 0, 0, 0, 0]
  let area = 0, weightedArea = 0
  const halfPressure = new Map<string, number>()
  for (const row of ledger.origins) {
    if (!record(row) || typeof row.id !== 'string' || ids.has(row.id) || !expectedIds.includes(row.id)
      || !Number.isInteger(row.frameIndex) || !Number.isInteger(row.rowIndex)
      || row.id !== `ROOF-ROW/${row.frameIndex}/${row.rowIndex}`
      || !['ordinary', 'hip'].includes(String(row.frameFamily)) || !['inner', 'outer'].includes(String(row.halfKind))
      || !finite(row.planAreaM2) || row.planAreaM2 <= 0 || !finite(row.multiplier) || row.multiplier < 0 || row.multiplier > 1
      || row.multiplier !== setting.rowMultipliers[row.id] || !finite(row.pressureKPa)
      || !close(row.pressureKPa, setting.uniformKPa * row.multiplier)
      || !Array.isArray(row.pointXYZMm) || row.pointXYZMm.length !== 3 || !row.pointXYZMm.every(finite)
      || !Array.isArray(row.forceKN) || row.forceKN.length !== 3 || !row.forceKN.every(finite)
      || row.forceKN[0] !== 0 || row.forceKN[1] !== 0 || !close(row.forceKN[2], -row.pressureKPa * row.planAreaM2)) {
      throw new Error('A roof pressure row changed its actual territory, signed pressure or physical origin')
    }
    ids.add(row.id); area += row.planAreaM2; weightedArea += row.planAreaM2 * row.multiplier
    const halfId = `ROOF-PRIMARY/${row.frameIndex}/${row.halfKind}`
    halfPressure.set(halfId, (halfPressure.get(halfId) ?? 0) - row.forceKN[2])
    const p = row.pointXYZMm as number[], f = row.forceKN as number[]
    for (let axis = 0; axis < 3; axis++) wrench[axis] += f[axis]
    wrench[3] += (p[1] * f[2] - p[2] * f[1]) / 1000
    wrench[4] += (p[2] * f[0] - p[0] * f[2]) / 1000
    wrench[5] += (p[0] * f[1] - p[1] * f[0]) / 1000
  }
  if (!close(area, ledger.planAreaM2) || !close(weightedArea, ledger.loadedWeightedPlanAreaM2)
    || !close(ledger.verticalDownKN, setting.uniformKPa * weightedArea)
    || !close(ledger.verticalDownKN, -wrench[2])
    || wrench.some((value, axis) => !close(value, (ledger.pressureWrenchKN_KNm as number[])[axis]))) {
    throw new Error('The roof surface pressure loses signed force, actual area or originating first moment')
  }
  const actions = ledger.actualLocalActions
  const actionIds = new Set(actions.map(row => record(row) ? row.id : undefined))
  if (actionIds.size !== 24 || actions.some(row => !record(row) || typeof row.id !== 'string'
    || !['finite-outer', 'pin-ended-inner'].includes(String(row.physicalHalfKind)) || row.strengthAccepted !== false
    || !Array.isArray(row.actualAxialEndForcesN) || row.actualAxialEndForcesN.length !== 2 || !row.actualAxialEndForcesN.every(finite)
    || !finite(row.appliedSteelGKN) || !finite(row.appliedSurfaceVerticalDownKN))) {
    throw new Error('The roof pressure lost its actual combined local member cuts')
  }
  const expectedActions = Array.from({ length: 12 }, (_, frame) => ['inner', 'outer'].map(half => `ROOF-PRIMARY/${frame}/${half}`)).flat().sort()
  if (!same([...actionIds].sort(), expectedActions)) throw new Error('Roof pressure local cuts require all actual twelve finite/released primary pairs')
  for (const row of actions as Record<string, unknown>[]) {
    if (!close(Number(row.appliedSurfaceVerticalDownKN), halfPressure.get(String(row.id)) ?? 0)
      || String(row.id).endsWith('/outer') !== (row.physicalHalfKind === 'finite-outer')) {
      throw new Error('A roof primary cut changed its actual signed row load territory or end release')
    }
    if (row.physicalHalfKind === 'finite-outer') {
      const elastic = row.elasticStrongEndVectorN_Nmm, applied = row.appliedEquivalentStrongEndVectorN_Nmm, actual = row.actualStrongEndVectorN_Nmm
      if (![elastic, applied, actual].every(value => Array.isArray(value) && value.length === 4 && value.every(finite))
        || (actual as number[]).some((value, axis) => !close(value, (elastic as number[])[axis] - (applied as number[])[axis], 1e-5))
        || !Array.isArray(row.momentSamples) || !row.momentSamples.length
        || row.momentSamples.some(point => !record(point) || !finite(point.axisMm) || !finite(point.momentKNm))
        || !finite(row.maximumAbsoluteStrongMomentKNm)
        || !close(row.maximumAbsoluteStrongMomentKNm, Math.max(...row.momentSamples.map(point => Math.abs(Number(point.momentKNm)))))
        || !finite(row.rightEndMomentResidualNmm)
        || Math.abs(row.rightEndMomentResidualNmm) > 1e-7 * Math.max(1, ...(actual as number[]).map(Math.abs))) {
        throw new Error('The finite roof cuts must subtract the actual combined applied load vector and recover their moment diagram')
      }
    } else {
      const local = row.localReleasedBending
      if (!record(local) || !finite(local.heelReactionN) || !finite(local.crownReactionN)
        || !finite(local.forceResidualN) || Math.abs(local.forceResidualN) > 1e-6
        || !finite(local.momentResidualNmm) || Math.abs(local.momentResidualNmm) > 1e-3
        || local.strengthAccepted !== false || local.releasedRotationLawPreserved !== true
        || !Array.isArray(local.samples) || !local.samples.length
        || local.samples.some(point => !record(point) || !finite(point.axisMm) || !finite(point.momentKNm))
        || !finite(local.maximumAbsoluteLocalMomentKNm)
        || !close(local.maximumAbsoluteLocalMomentKNm, Math.max(...local.samples.map(point => Math.abs(Number(point.momentKNm)))))) {
        throw new Error('The released roof half lost its actual particular bending or its release law')
      }
    }
  }
  if (record(roof.roofSteelGravity) && !same(roof.roofSteelGravity.actualLocalActions, actions)) {
    throw new Error('Roof pressure and steel gravity must recover the same combined local cuts')
  }
  return ledger
}

/** A body's own weight and its unilateral top contact are different load paths. */
export function validateLowerCoreBodies(input: unknown, responseInput: unknown, setting: unknown,
  sources: Readonly<Record<string, string>>, physicalGFactor: unknown) {
  if (setting === null) {
    if (input !== null || responseInput !== null) throw new Error('Unrequested lower masonry bodies cannot enter the current result')
    return { lowerCoreBodies: null, lowerCoreResponse: null }
  }
  if (!record(setting) || !finite(setting.masonryUnitWeightKNPerM3) || !record(input) || !record(responseInput)) {
    throw new Error('Explicit lower masonry body settings and their actual response are required')
  }
  const inventory = input.inventory
  if (input.schema !== 'str-lower-clearcore-body-comparison/1' || !same(input.request, setting)
    || !sourceMap(input.sourceSHA256, sources, ['project/str/studies/lower_core_bodies.py',
      'project/str/studies/vertical_rc_floor.py', 'project/str/studies/vertical_floor_numerics.py',
      'project/had/studies/water-replan.json', 'project/str/studies/current-house-grid.json'])
    || !record(inventory) || !finite(inventory.netClearCoreVolumeM3) || inventory.netClearCoreVolumeM3 <= 0
    || !finite(inventory.netClearCoreAreaMm2) || inventory.netClearCoreAreaMm2 <= 0
    || !finite(inventory.bodyHeightMm) || inventory.bodyHeightMm <= 0 || !finite(inventory.physicalGKN)
    || !finite(input.contactBodyAreaMm2) || !finite(input.sourceMissingGroundAreaMm2) || !finite(inventory.freeTopAreaMm2)
    || !Number.isInteger(input.contactBodyCount) || Number(input.contactBodyCount) <= 0
    || !finite(input.addedPhysicalGKN) || !finite(input.unsupportedBodyPhysicalGKN) || input.unsupportedBodyPhysicalGKN < 0
    || !close(inventory.physicalGKN, inventory.netClearCoreVolumeM3 * setting.masonryUnitWeightKNPerM3)
    || !close(inventory.physicalGKN, input.addedPhysicalGKN + input.unsupportedBodyPhysicalGKN)
    || !close(inventory.netClearCoreAreaMm2, input.contactBodyAreaMm2 + input.sourceMissingGroundAreaMm2 + inventory.freeTopAreaMm2, 1e-5)
    || !six(input.addedPhysicalFamilyWrenchKN_KNm) || !six(input.sourceSelfGAndFirstMomentResidualKN_KNm)
    || input.sourceSelfGAndFirstMomentResidualKN_KNm.some(value => Math.abs(value) > 1e-6)
    || input.noNewLateralStiffness !== true || input.noMasonryTopTension !== true
    || input.bodyAxialComparisonLawAccepted !== false || input.candidateAccepted !== false) {
    throw new Error('The lower masonry body inventory changed its source, mass partition, load path or unqualified constitutive scope')
  }
  const response = responseInput
  const contactMass = input.contactBodyAreaMm2 * inventory.bodyHeightMm / 1e9 * setting.masonryUnitWeightKNPerM3
  if (response.schema !== 'str-lower-clearcore-response/1' || !finite(response.topCompressionKN)
    || !finite(response.baseCompressionKN) || !finite(response.maximumBodyShorteningMm)
    || !finite(response.minimumBodyEndCompressionKN) || response.minimumBodyEndCompressionKN < -1e-8
    || !Number.isInteger(response.activeTopContactCount) || !Number.isInteger(response.openTopContactCount)
    || Number(response.activeTopContactCount) + Number(response.openTopContactCount) !== input.contactBodyCount
    || !finite(physicalGFactor) || !close(response.baseCompressionKN - response.topCompressionKN, contactMass * physicalGFactor)
    || response.gaugeReactionsAcceptedAsSupport !== false || response.candidateAccepted !== false) {
    throw new Error('The lower masonry response lost body gravity, unilateral top contact or its actual body count')
  }
  return { lowerCoreBodies: input, lowerCoreResponse: response }
}

export function validateLowerLWeight(input: unknown, setting: unknown) {
  if (setting === null) {
    if (input !== null) throw new Error('Unrequested lower L-member weight cannot enter the current result')
    return null
  }
  if (!record(setting) || !finite(setting.unitWeightKNPerM3) || !record(input)
    || input.schema !== 'str-lower-L-physical-weight-comparison/1' || !same(input.request, setting)
    || input.memberCount !== 8 || !Array.isArray(input.members) || input.members.length !== input.memberCount
    || !finite(input.RCVolumeM3) || input.RCVolumeM3 <= 0 || !finite(input.physicalGKN)
    || !close(input.physicalGKN, input.RCVolumeM3 * setting.unitWeightKNPerM3)
    || !six(input.addedPhysicalFamilyWrenchKN_KNm) || !six(input.sourceSelfGAndFirstMomentResidualKN_KNm)
    || input.sourceSelfGAndFirstMomentResidualKN_KNm.some(value => Math.abs(value) > 1e-7)
    || input.DPCGapOwnGExcluded !== true || input.newUpperRoofLOwnGIncluded !== false
    || input.reinforcementAccepted !== false || input.candidateAccepted !== false) {
    throw new Error('The lower L-member weight changed its actual finite members, authored density or unqualified scope')
  }
  return input
}

export function validateRoofCoupling(input: unknown, setting: unknown, sources: Readonly<Record<string, string>>,
  floorCase: Readonly<Record<string, unknown>>, native: Readonly<Record<string, unknown>>) {
  if (setting === null) {
    if (input !== null) throw new Error('An unrequested roof cannot enter the current coupled result')
    return null
  }
  const wind = floorCase.boundaryCase
  const pressure = native.pressureBoundary
  const nativeWind = record(pressure) ? pressure.nativeWind : undefined
  if (!record(setting) || !record(input) || !record(wind) || !record(nativeWind)
    || input.schema !== 'str-roof-floor-coupling-result/1' || !same(input.request, setting)
    || !sourceMap(input.sourceSHA256, sources, roofSources)
    || input.windIndex !== wind.windIndex || input.windIndex !== nativeWind.windIndex
    || !same(input.programme, nativeWind.programme) || input.courtProjection !== nativeWind.courtProjection
    || ['roofGravityIntegrated', 'roofAdoption', 'completeHouseProof', 'candidateAccepted', 'installedAcceptance']
      .some(key => input[key] !== false)) {
    throw new Error('The roof coupling changed its source, sole floor wind programme or unqualified proof scope')
  }
  const operator = input.operator
  const datums = input.datumsMm
  if (!record(operator) || operator.schema !== 'str-roof-only-operator/1'
    || !same(operator.sourceSHA256, input.sourceSHA256) || operator.activeCoordinateCount !== 456
    || operator.retainedRingCoordinateCount !== 348 || operator.internalCoordinateCount !== 108
    || operator.ringPointCount !== 58 || operator.rigidBodyModeCount !== 6
    || !finite(operator.rigidModeRelativeResidual) || operator.rigidModeRelativeResidual > 1e-10
    || !same(operator.removedInheritedBoundaryTerms, { lowerL: 1, verticalGround: 1, unusedGauge: 1, oldFloor: 1 })
    || !Array.isArray(operator.actualUpperSupportPointsXYMm) || operator.actualUpperSupportPointsXYMm.length !== 22
    || ['roofGravityIntegrated', 'roofAdoption', 'completeHouseProof'].some(key => operator[key] !== false)
    || !record(datums) || !same(datums.floorSlabZMm, [3170, 3370])
    || !same(datums.upperLBodyZMm, [3370, 6540]) || !same(datums.metalRingZMm, [6540, 6660])
    || datums.ringMasterZMm !== 6600 || datums.heelZMm !== 6860 || datums.roofWeatherDatumMm !== null
    || !six(input.additionalPressureWrenchKN_KNm) || !finite(input.upperLPhysicalGKN)
    || !finite(input.maximumRingTranslationMm) || !finite(input.roofPhysicalWorkRelativeResidual) || input.roofPhysicalWorkRelativeResidual > 1e-7
    || !finite(input.roofPhysicalStrainEnergyKNmm) || input.roofPhysicalStrainEnergyKNmm < 0
    || !finite(input.energyModeReconstructionRelativeError) || input.energyModeReconstructionRelativeError > 1e-8
    || input.actualHeadCount !== 52
    || typeof input.roofSvg !== 'string' || !input.roofSvg.startsWith('<svg')) {
    throw new Error('The roof result lost its actual free operator, physical support datums or computed view')
  }
  const laws = setting.intermediateSupportLaws
  const receivers = input.receivers
  const ring = input.ringDisplacements
  const upper = input.upperL
  if (!record(laws) || Object.keys(laws).length !== 18 || !Array.isArray(receivers) || receivers.length !== 18
    || new Set(receivers.map(row => record(row) ? row.id : undefined)).size !== 18
    || receivers.some(row => !record(row) || typeof row.id !== 'string' || !same(row.law, laws[row.id])
      || row.physicalAcceptance !== false || typeof row.active !== 'boolean'
      || !finite(row.forceKN) || !finite(row.relativeExtensionMm) || !hasPhysicalPlateTrace(row.plateTrace))
    || !Array.isArray(ring) || ring.length !== 58 || new Set(ring.map(row => record(row) ? row.id : undefined)).size !== 58
    || ring.some(row => !record(row) || typeof row.id !== 'string' || !six(row.displacementMmRad) || !Array.isArray(row.xyMm)
      || row.xyMm.length !== 2 || !row.xyMm.every(finite))
    || !Array.isArray(upper) || upper.length !== 4 || !finite(setting.upperUnitWeightKNPerM3)
    || upper.some(row => !record(row) || !finite(row.physicalRCUnionVolumeM3) || !finite(row.physicalSelfGKN)
      || !close(row.physicalSelfGKN, row.physicalRCUnionVolumeM3 * Number(setting.upperUnitWeightKNPerM3)))) {
    throw new Error('The roof lost its actual four upper bodies, eighteen authored receivers or fifty-eight solved ring points')
  }
  const upperG = upper.reduce((sum, row) => sum + Number((row as Record<string, unknown>).physicalSelfGKN), 0)
  const maximumTranslation = Math.max(...ring.map(row => Math.hypot(...(row as { displacementMmRad: number[] }).displacementMmRad.slice(0, 3))))
  if (!close(upperG, input.upperLPhysicalGKN) || !close(maximumTranslation, input.maximumRingTranslationMm, 1e-8)) {
    throw new Error('The coupled roof body/translation ledger differs from its actual solved geometry')
  }
  const origins = input.sourcePressureOrigins
  const pressureWrench = [0, 0, 0, 0, 0, 0]
  if (!Array.isArray(origins) || !origins.length || origins.some(row => !record(row)
    || !Array.isArray(row.pointXYZMm) || row.pointXYZMm.length !== 3 || !row.pointXYZMm.every(finite)
    || !Array.isArray(row.forceKN) || row.forceKN.length !== 3 || !row.forceKN.every(finite))) {
    throw new Error('The actual roof pressure origins are missing or non-finite')
  }
  for (const origin of origins) {
    const { pointXYZMm: p, forceKN: f } = origin as { pointXYZMm: number[]; forceKN: number[] }
    for (let axis = 0; axis < 3; axis++) pressureWrench[axis] += f[axis]
    pressureWrench[3] += (p[1] * f[2] - p[2] * f[1]) / 1000
    pressureWrench[4] += (p[2] * f[0] - p[0] * f[2]) / 1000
    pressureWrench[5] += (p[0] * f[1] - p[1] * f[0]) / 1000
  }
  const declaredPressure = input.additionalPressureWrenchKN_KNm as number[]
  if (pressureWrench.some((value, axis) => !close(value, declaredPressure[axis]))) {
    throw new Error('The roof pressure ledger loses its actual force or originating moment')
  }
  validateRoofSurfacePressure(input, setting.roofSurfacePressure, sources)
  return input
}

export function validateRoofSteelGravity(roof: Readonly<Record<string, unknown>> | null, setting: unknown,
  sources: Readonly<Record<string, string>>, physicalGFactor: unknown) {
  if (roof === null) return null
  const ledger = roof.roofSteelGravity
  if (setting === null) {
    if (ledger !== null || roof.modeledSteelGravityIntegrated !== false) throw new Error('Unrequested roof stock gravity cannot enter the current result')
    return null
  }
  if (!record(setting) || !finite(setting.unitWeightKNPerM3) || !record(ledger)
    || ledger.schema !== 'str-roof-stock-gravity/1' || !same(ledger.request, setting)
    || !sourceMap(ledger.sourceSHA256, sources, roofSources)
    || !finite(ledger.physicalGKN) || ledger.physicalGKN <= 0 || !finite(ledger.physicalVolumeM3) || ledger.physicalVolumeM3 <= 0
    || !close(ledger.physicalGKN, ledger.physicalVolumeM3 * setting.unitWeightKNPerM3)
    || !finite(physicalGFactor) || ledger.appliedPhysicalGFactor !== physicalGFactor
    || !finite(ledger.appliedPhysicalGKN) || !close(ledger.appliedPhysicalGKN, ledger.physicalGKN * physicalGFactor)
    || !six(ledger.gravityWrenchKN_KNm) || !six(ledger.stockOriginForceAndMomentResidualKN_KNm)
    || ledger.stockOriginForceAndMomentResidualKN_KNm.some(value => Math.abs(value) > 1e-7)
    || roof.modeledSteelGravityIntegrated !== true || ledger.modeledSteelGravityIntegrated !== true
    || ledger.completeRoofGravity !== false || ledger.retainedMinimumGQualified !== false
    || !Array.isArray(ledger.actualLocalActions) || ledger.actualLocalActions.length !== 24
    || !record(ledger.categories) || !same(Object.keys(ledger.categories).sort(), ['primary', 'secondary', 'twin-rails', 'ring'].sort())
    || !Array.isArray(ledger.stockLedger) || !ledger.stockLedger.length || !Array.isArray(ledger.origins) || !ledger.origins.length) {
    throw new Error('The modeled roof steel gravity changed its actual stock, authored density, applied factor or unqualified scope')
  }
  const stocks = ledger.stockLedger
  const identifiers = new Set(stocks.map(row => record(row) ? row.id : undefined))
  if (identifiers.size !== stocks.length || stocks.some(row => !record(row) || typeof row.id !== 'string'
    || !finite(row.physicalVolumeM3) || !finite(row.physicalGKN) || !finite(row.physicalLengthM) || !finite(row.sectionAreaMm2)
    || !close(row.physicalVolumeM3, row.physicalLengthM * row.sectionAreaMm2 / 1e6)
    || !close(row.physicalGKN, row.physicalVolumeM3 * Number(setting.unitWeightKNPerM3)))
    || !close(stocks.reduce((sum, row) => sum + Number(row.physicalGKN), 0), ledger.physicalGKN)) {
    throw new Error('The roof stock takeoff differs from its actual enumerated lengths, sections or gravity')
  }
  const wrench = [0, 0, 0, 0, 0, 0]
  for (const origin of ledger.origins) {
    if (!record(origin) || !identifiers.has(origin.stockId) || !Array.isArray(origin.pointXYZMm)
      || origin.pointXYZMm.length !== 3 || !origin.pointXYZMm.every(finite) || !Array.isArray(origin.forceKN)
      || origin.forceKN.length !== 3 || !origin.forceKN.every(finite)) throw new Error('Roof stock gravity lost its actual load origins')
    const p = origin.pointXYZMm as number[], f = origin.forceKN as number[]
    for (let axis = 0; axis < 3; axis++) wrench[axis] += f[axis]
    wrench[3] += (p[1] * f[2] - p[2] * f[1]) / 1000
    wrench[4] += (p[2] * f[0] - p[0] * f[2]) / 1000
    wrench[5] += (p[0] * f[1] - p[1] * f[0]) / 1000
  }
  const declared = ledger.gravityWrenchKN_KNm as number[]
  if (!close(wrench[2], -ledger.physicalGKN) || wrench.some((value, axis) => !close(value, declared[axis]))) {
    throw new Error('The roof steel gravity loses its originating force or first moment')
  }
  return ledger
}

export function validateStraightFrameCage(input: unknown, setting: unknown, sources: Readonly<Record<string, string>>,
  caseId: string, beamWidth: unknown, native: Readonly<Record<string, unknown>>) {
  if (setting === null) {
    if (input !== null) throw new Error('An unrequested straight-frame cage cannot enter the current result')
    return null
  }
  const cuts = native.memberCuts
  if (!record(input) || input.schema !== 'str-straight-frame-cage-result/1' || !same(input.settings, setting)
    || input.sourceCaseId !== caseId || !same(input.nativeSourceSHA256, sources)
    || !sourceMap(input.sourceSHA256, sources, ['project/str/studies/straight_frame_cage.py',
      'project/str/studies/continuous_rc_cage.py', 'project/had/studies/water-replan.json', 'project/str/studies/current-house-grid.json'])
    || !record(input.geometry) || input.geometry.beamNormalWidthMm !== beamWidth
    || !Array.isArray(cuts) || !Array.isArray(input.sectionScreens) || input.solvedGeometrySuppliesDemand !== true
    || ['candidateAccepted', 'jointPanelAccepted', 'capGridJointAccepted', 'pileInterfaceAccepted',
      'reinforcementAccepted', 'installedAcceptance'].some(key => input[key] !== false)) {
    throw new Error('The straight-frame cage changed its source, authored geometry or unqualified proof scope')
  }
  const sections = cuts.filter(row => record(row) && ['post', 'upstand'].includes(String(row.kind)))
  if (input.sectionScreens.length !== sections.length || input.sectionScreens.some(screen => {
    if (!record(screen) || !record(screen.simultaneousActions)) return true
    const actual = sections.find(row => record(row) && row.memberId === screen.memberId && row.end === screen.end)
    return !record(actual) || !same(screen.actualSectionMm, [actual.depthMm, actual.breadthMm])
      || ['axialCompressionKN', 'shearYKN', 'shearZKN', 'torsionKNm', 'bendingYKNm', 'bendingZKNm']
        .some(key => (screen.simultaneousActions as Record<string, unknown>)[key] !== actual[key])
  })) {
    throw new Error('The cage must consume the actual simultaneous signed cuts, not an old force envelope on new sections')
  }
  return input
}
