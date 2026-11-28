/** Conventional simply-supported comparison. No filesystem, UI or inherited RC reactions. */
export interface SteelSection {
  readonly id: string
  readonly depthMm: number
  readonly widthMm: number
  readonly massKgM: number
  readonly ixxCm4: number
}
export interface SteelPrecastSettings {
  readonly schema: 'str-steel-precast-settings/1'
  readonly caseId: string
  readonly firstFflMm: number
  readonly groundCeilingMm: number
  readonly plankDepthMm: number
  readonly plankSelfWeightKnM2: number
  readonly finishDepthMm: number
  readonly finishLoadKnM2: number
  readonly camberReserveMm: number
  readonly settingReserveMm: number
  readonly bearingBedMm: number
  readonly soffitReserveMm: number
  readonly fireSideMm: number
  readonly portalPlacement: 'beside-planks' | 'below-planks'
  readonly nominalSteelBearingMm: number
  readonly opposedJointMm: number
  readonly bearingToleranceEachMm: number
  readonly steelYieldMpa: number
  readonly steelEMpa: number
  readonly permanentFactor: number
  readonly variableFactor: number
  readonly imposedLoadKnM2: number
  readonly deflectionRatio: number
  readonly masonryWeightKnM3: number
  readonly plasterWeightKnM3: number
  readonly upperWallHeightMm: number
  readonly plasterEachMm: number
  readonly roofPermanentChallengeKnM2: number
  readonly roofVariableChallengeKnM2: number
  readonly stairPointPermanentKn: number
  readonly stairPointVariableKn: number
  readonly entranceFloorTributaryChallengeMm: number
  readonly bathFloorTributaryChallengeMm: number
  readonly stairBeamOffsetFromVoidMm: number
  readonly padstoneLengthMm: number
  readonly padstoneWidthMm: number
  readonly minimumArchClearanceMm: number
  readonly sections: Readonly<Record<'floor' | 'edge' | 'portal', SteelSection>>
}
export const steelPrecastStageFields = ['schema', 'caseId', 'firstFflMm', 'groundCeilingMm', 'plankDepthMm',
  'plankSelfWeightKnM2', 'finishDepthMm', 'finishLoadKnM2', 'camberReserveMm', 'settingReserveMm',
  'bearingBedMm', 'soffitReserveMm', 'fireSideMm', 'portalPlacement', 'nominalSteelBearingMm',
  'opposedJointMm', 'bearingToleranceEachMm', 'steelYieldMpa', 'steelEMpa', 'permanentFactor',
  'variableFactor', 'imposedLoadKnM2', 'deflectionRatio', 'masonryWeightKnM3', 'plasterWeightKnM3',
  'upperWallHeightMm', 'plasterEachMm', 'roofPermanentChallengeKnM2', 'roofVariableChallengeKnM2',
  'stairPointPermanentKn', 'stairPointVariableKn', 'entranceFloorTributaryChallengeMm',
  'bathFloorTributaryChallengeMm', 'stairBeamOffsetFromVoidMm', 'padstoneLengthMm', 'padstoneWidthMm',
  'minimumArchClearanceMm', 'sections'] as const

export function admitSteelPrecastSettings(input: unknown): SteelPrecastSettings {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('Expected steel/precast settings')
  const value = input as Record<string, unknown>
  if (Object.keys(value).length !== steelPrecastStageFields.length || steelPrecastStageFields.some(key => !Object.hasOwn(value, key))) {
    throw new TypeError('Steel/precast settings require exactly the authored fields; derived identities are not editable')
  }
  if (value.schema !== 'str-steel-precast-settings/1' || typeof value.caseId !== 'string' || !value.caseId.trim()
    || !['beside-planks', 'below-planks'].includes(String(value.portalPlacement))) throw new TypeError('Unsupported steel/precast case')
  for (const key of steelPrecastStageFields) {
    if (['schema', 'caseId', 'portalPlacement', 'sections'].includes(key)) continue
    if (typeof value[key] !== 'number' || !Number.isFinite(value[key]) || value[key] < 0) throw new TypeError(`Invalid finite nonnegative ${key}`)
  }
  const s = value as unknown as SteelPrecastSettings
  if (s.firstFflMm <= s.groundCeilingMm || s.plankDepthMm <= 0 || s.steelEMpa <= 0 || s.steelYieldMpa <= 0
    || s.deflectionRatio <= 0 || s.padstoneLengthMm <= 0 || s.padstoneWidthMm <= 0
    || s.permanentFactor < 1 || s.variableFactor < 1) throw new TypeError('Unsupported comparison dimensions or action factors')
  if (!s.sections || Object.keys(s.sections).sort().join(',') !== 'edge,floor,portal') throw new TypeError('Expected three explicit section roles')
  for (const section of Object.values(s.sections)) {
    if (!section || Object.keys(section).sort().join(',') !== 'depthMm,id,ixxCm4,massKgM,widthMm'
      || typeof section.id !== 'string' || !section.id
      || [section.depthMm, section.widthMm, section.massKgM, section.ixxCm4].some(v => !Number.isFinite(v) || v <= 0)) {
      throw new TypeError('Unsupported positive section properties')
    }
  }
  return structuredClone(s)
}

export interface BeamLoad {
  readonly fromMm: number
  readonly toMm: number
  readonly permanentKnM: number
  readonly variableKnM: number
  readonly source: string
}
export interface BeamPoint {
  readonly atMm: number
  readonly permanentKn: number
  readonly variableKn: number
  readonly source: string
}
export interface BeamModel {
  readonly id: string
  readonly role: 'floor' | 'edge' | 'portal'
  readonly a: readonly [number, number]
  readonly b: readonly [number, number]
  readonly supports: readonly [string, string]
  readonly floorTributaryMm: number
  readonly wallCoreMm: number
  readonly wallLoadedLengthMm: number
  readonly roofTributaryMm: number
  readonly stairPoint: boolean
}

/** Macaulay integration: exact equilibrium and elastic deflection, constant EI, downward loads only. */
export function analyseSimpleBeam(spanMm: number, section: SteelSection, eMpa: number,
  loads: readonly { fromMm: number; toMm: number; knM: number }[], points: readonly { atMm: number; kn: number }[]) {
  if (!Number.isFinite(spanMm) || spanMm <= 0 || !Number.isFinite(eMpa) || eMpa <= 0 || section.ixxCm4 <= 0
    || loads.some(q => ![q.fromMm, q.toMm, q.knM].every(Number.isFinite) || q.fromMm < 0 || q.toMm > spanMm || q.fromMm >= q.toMm || q.knM < 0)
    || points.some(p => ![p.atMm, p.kn].every(Number.isFinite) || p.atMm < 0 || p.atMm > spanMm || p.kn < 0)) {
    throw new TypeError('Simple beam supports finite downward loads within a positive span only')
  }
  const totalN = loads.reduce((s, q) => s + q.knM * (q.toMm - q.fromMm), 0) + points.reduce((s, p) => s + p.kn * 1000, 0)
  const momentAtLeft = loads.reduce((s, q) => s + q.knM * (q.toMm - q.fromMm) * (q.fromMm + q.toMm) / 2, 0)
    + points.reduce((s, p) => s + p.kn * 1000 * p.atMm, 0)
  const rb = momentAtLeft / spanMm, ra = totalN - rb
  const pos = (v: number) => Math.max(0, v)
  const moment = (x: number) => ra * x - loads.reduce((s, q) => s + q.knM / 2 * (pos(x - q.fromMm) ** 2 - pos(x - q.toMm) ** 2), 0)
    - points.reduce((s, p) => s + p.kn * 1000 * pos(x - p.atMm), 0)
  const shear = (x: number) => ra - loads.reduce((s, q) => s + q.knM * (pos(x - q.fromMm) - pos(x - q.toMm)), 0)
    - points.reduce((s, p) => s + (x >= p.atMm ? p.kn * 1000 : 0), 0)
  const integral = (x: number) => ra * x ** 3 / 6 - loads.reduce((s, q) => s + q.knM / 24 * (pos(x - q.fromMm) ** 4 - pos(x - q.toMm) ** 4), 0)
    - points.reduce((s, p) => s + p.kn * 1000 / 6 * pos(x - p.atMm) ** 3, 0)
  const c1 = -integral(spanMm) / spanMm
  const slopeNumerator = (x: number) => ra * x ** 2 / 2 - loads.reduce((s, q) => s + q.knM / 6 * (pos(x - q.fromMm) ** 3 - pos(x - q.toMm) ** 3), 0)
    - points.reduce((s, p) => s + p.kn * 1000 / 2 * pos(x - p.atMm) ** 2, 0) + c1
  const root = (f: (x: number) => number, increasing: boolean) => {
    let lo = 0, hi = spanMm
    for (let i = 0; i < 64; i++) { const mid = (lo + hi) / 2; if ((f(mid) < 0) === increasing) lo = mid; else hi = mid }
    return (lo + hi) / 2
  }
  const maxMomentAtMm = root(shear, false), maxDeflectionAtMm = root(slopeNumerator, true)
  return { reactionsKn: [ra / 1000, rb / 1000] as const, totalKn: totalN / 1000,
    equilibriumResidualKn: (ra + rb - totalN) / 1000, momentResidualKnm: (rb * spanMm - momentAtLeft) / 1e6,
    maximumMomentKnm: moment(maxMomentAtMm) / 1e6, maxMomentAtMm,
    maximumDeflectionMm: Math.abs((integral(maxDeflectionAtMm) + c1 * maxDeflectionAtMm) / (eMpa * section.ixxCm4 * 1e4)), maxDeflectionAtMm }
}

export interface SteelPrecastGeometry {
  readonly referenceGroundFflMm: number
  readonly referenceFirstFflMm: number
  readonly referenceAtticDatumMm: number
  readonly referenceEavesMm: number
  readonly referenceRidgeMm: number
  readonly stair: { readonly risers: number; readonly goingMm: number; readonly footprintXYWHMm: readonly number[]; readonly finishedFlightWidthBeforeRailMm: number }
  readonly entranceVoidXYWHMm: readonly number[]
  readonly archOuterCrownMm: number
  readonly loggiaSoffitLayersMm: number
  readonly floorEnvelopeXYXYMm: readonly number[]
  readonly courtXYWHMm: readonly number[]
  readonly floorFields: readonly { readonly id: string; readonly rectangleXYXYMm: readonly number[]; readonly direction: string; readonly spanMm: number }[]
  readonly grossSourceFloorAreaM2: number
  readonly bridgeAreaM2: number
  readonly residualAreaM2: number
  readonly westGallerySupportXMm: number
  readonly rearReceivingWall: { readonly axisYMm: number; readonly coreYMm: readonly number[]; readonly extentXMm: readonly number[]; readonly openingsXMm: readonly (readonly number[])[] }
  readonly beams: readonly BeamModel[]
}

export function calculateSteelPrecast(geometry: SteelPrecastGeometry, input: unknown) {
  const s = admitSteelPrecastSettings(input)
  const beams = geometry.beams.map(original => {
    const stairAxis = geometry.stair.footprintXYWHMm[0] + geometry.stair.footprintXYWHMm[2] + s.stairBeamOffsetFromVoidMm
    const beam: BeamModel = original.id === 'stair-east'
      ? { ...original, a: [stairAxis, original.a[1]], b: [stairAxis, original.b[1]], floorTributaryMm: (geometry.westGallerySupportXMm - stairAxis) / 2 }
      : original.id.startsWith('entrance-') ? { ...original, floorTributaryMm: s.entranceFloorTributaryChallengeMm }
      : original.id === 'bath-north' ? { ...original, floorTributaryMm: s.bathFloorTributaryChallengeMm } : original
    const section = s.sections[beam.role], spanMm = Math.hypot(beam.b[0] - beam.a[0], beam.b[1] - beam.a[1])
    const loads: BeamLoad[] = [{ fromMm: 0, toMm: spanMm,
      permanentKnM: (s.plankSelfWeightKnM2 + s.finishLoadKnM2) * beam.floorTributaryMm / 1000,
      variableKnM: s.imposedLoadKnM2 * beam.floorTributaryMm / 1000, source: 'explicit floor tributary challenge' },
    { fromMm: 0, toMm: spanMm, permanentKnM: section.massKgM * 9.81 / 1000, variableKnM: 0, source: 'section self weight' }]
    if (beam.wallCoreMm) loads.push({ fromMm: 0, toMm: Math.min(spanMm, beam.wallLoadedLengthMm),
      permanentKnM: (beam.wallCoreMm * s.masonryWeightKnM3 + 2 * s.plasterEachMm * s.plasterWeightKnM3) * s.upperWallHeightMm / 1e6,
      variableKnM: 0, source: 'gross upper masonry and finishes; no opening relief' })
    if (beam.roofTributaryMm) loads.push({ fromMm: 0, toMm: spanMm,
      permanentKnM: s.roofPermanentChallengeKnM2 * beam.roofTributaryMm / 1000,
      variableKnM: s.roofVariableChallengeKnM2 * beam.roofTributaryMm / 1000, source: 'authored roof action challenge; not inherited roof reactions' })
    const points: BeamPoint[] = beam.stairPoint ? [{ atMm: spanMm / 2, permanentKn: s.stairPointPermanentKn,
      variableKn: s.stairPointVariableKn, source: 'authored midspan stair action challenge; stair design not derived' }] : []
    const analyse = (g: number, q: number) => analyseSimpleBeam(spanMm, section, s.steelEMpa,
      loads.map(v => ({ fromMm: v.fromMm, toMm: v.toMm, knM: g * v.permanentKnM + q * v.variableKnM })),
      points.map(v => ({ atMm: v.atMm, kn: g * v.permanentKn + q * v.variableKn })))
    const service = analyse(1, 1), ultimate = analyse(s.permanentFactor, s.variableFactor)
    const elasticModulusMm3 = 2 * section.ixxCm4 * 1e4 / section.depthMm
    const elasticStressMpa = ultimate.maximumMomentKnm * 1e6 / elasticModulusMm3
    return { ...beam, loads, points, section, spanMm, service, ultimate, elasticStressMpa,
      elasticYieldRatio: elasticStressMpa / s.steelYieldMpa,
      deflectionComparatorMm: spanMm / s.deflectionRatio,
      deflectionRatio: service.maximumDeflectionMm / (spanMm / s.deflectionRatio),
      nominalSupportPressureMpa: ultimate.reactionsKn.map(v => v * 1000 / (s.padstoneLengthMm * s.padstoneWidthMm)),
      screen: elasticStressMpa <= s.steelYieldMpa && service.maximumDeflectionMm <= spanMm / s.deflectionRatio ? 'within-elastic-screen' as const : 'fails-elastic-screen' as const }
  })
  const deepestTopBearingBeamMm = Math.max(s.sections.floor.depthMm, s.sections.edge.depthMm)
  const requiredOrdinaryFloorZoneMm = s.finishDepthMm + s.camberReserveMm + s.settingReserveMm + s.plankDepthMm
    + s.bearingBedMm + deepestTopBearingBeamMm + s.soffitReserveMm
  const plankEndTopMm = s.firstFflMm - s.finishDepthMm - s.camberReserveMm - s.settingReserveMm
  const plankEndBottomMm = plankEndTopMm - s.plankDepthMm
  const topBearingSteelTopMm = plankEndBottomMm - s.bearingBedMm
  const portalSteelTopMm = s.portalPlacement === 'beside-planks' ? plankEndTopMm : topBearingSteelTopMm
  const portalSteelBottomMm = portalSteelTopMm - s.sections.portal.depthMm
  const portalInsulatedSoffitMm = portalSteelBottomMm - geometry.loggiaSoffitLayersMm
  const archClearanceMm = portalInsulatedSoffitMm - geometry.archOuterCrownMm
  const riseMm = (s.firstFflMm - geometry.referenceGroundFflMm) / geometry.stair.risers
  const pitchDegrees = Math.atan(riseMm / geometry.stair.goingMm) * 180 / Math.PI
  const twoRiseGoingMm = 2 * riseMm + geometry.stair.goingMm
  const privateStairDimensionScreen = riseMm >= 150 && riseMm <= 220 && geometry.stair.goingMm >= 220 && geometry.stair.goingMm <= 300
    && pitchDegrees <= 42 && twoRiseGoingMm >= 550 && twoRiseGoingMm <= 700
  const requiredOpposedSeatMm = 2 * (s.nominalSteelBearingMm + s.bearingToleranceEachMm) + s.opposedJointMm
  const edgeHalfFinishedMm = s.sections.edge.widthMm / 2 + s.fireSideMm
  const stairBeam = beams.find(v => v.id === 'stair-east')!
  const stairClearanceMm = stairBeam.a[0] - edgeHalfFinishedMm - (geometry.stair.footprintXYWHMm[0] + geometry.stair.footprintXYWHMm[2])
  const west = beams.find(v => v.id === 'entrance-west')!, east = beams.find(v => v.id === 'entrance-east')!
  const revisedEntranceEdgesMm = [Math.max(geometry.entranceVoidXYWHMm[0], west.a[0] + edgeHalfFinishedMm),
    Math.min(geometry.entranceVoidXYWHMm[0] + geometry.entranceVoidXYWHMm[2], east.a[0] - edgeHalfFinishedMm)]
  const fieldAreaM2 = geometry.floorFields.reduce((a, f) => a + (f.rectangleXYXYMm[2] - f.rectangleXYXYMm[0]) * (f.rectangleXYXYMm[3] - f.rectangleXYXYMm[1]) / 1e6, 0)
  const deltaMm = s.firstFflMm - geometry.referenceFirstFflMm
  const rearWet = beams.find(b => b.id === 'rear-wet')!, stair = beams.find(b => b.id === 'stair-east')!
  const combinedRearReactionKn = rearWet.ultimate.reactionsKn[0] + stair.ultimate.reactionsKn[1]
  const rearBearingCentreXMm = (rearWet.ultimate.reactionsKn[0] * rearWet.a[0] + stair.ultimate.reactionsKn[1] * stair.b[0]) / combinedRearReactionKn
  const rearPadXMm = [rearBearingCentreXMm - s.padstoneLengthMm / 2, rearBearingCentreXMm + s.padstoneLengthMm / 2]
  const rearSteelFootprintXMm = [Math.min(rearWet.a[0] - rearWet.section.widthMm / 2, stair.b[0] - stair.section.widthMm / 2),
    Math.max(rearWet.a[0] + rearWet.section.widthMm / 2, stair.b[0] + stair.section.widthMm / 2)]
  const rw = geometry.rearReceivingWall
  const rearPadFits = rearPadXMm[0] >= rw.extentXMm[0] && rearPadXMm[1] <= rw.extentXMm[1]
    && !rw.openingsXMm.some(h => rearPadXMm[0] < h[1] && rearPadXMm[1] > h[0])
    && rearPadXMm[0] <= rearSteelFootprintXMm[0] && rearPadXMm[1] >= rearSteelFootprintXMm[1]
    && s.padstoneWidthMm <= rw.coreYMm[1] - rw.coreYMm[0]
  const diagnostics = [
    ...(s.firstFflMm - s.groundCeilingMm < requiredOrdinaryFloorZoneMm ? [{ code: 'FLOOR_ZONE_TOO_SHALLOW', message: 'The ordinary top-bearing beam, precast and explicit allowances do not fit.' }] : []),
    ...(archClearanceMm < s.minimumArchClearanceMm ? [{ code: 'PORTAL_THERMAL_ARCH_CLASH', message: 'The insulated beam envelope conflicts with the retained arch or its clearance allowance.' }] : []),
    ...(s.sections.floor.widthMm < requiredOpposedSeatMm ? [{ code: 'OPPOSED_BEARING_TOO_NARROW', message: 'Opposed nominal seats, joint and authored setting tolerances exceed the flange width.' }] : []),
    ...(stairClearanceMm < 0 ? [{ code: 'STAIR_TRIMMER_CLASH', message: 'The fire-envelope allowance intrudes into the selected stair footprint.' }] : []),
    ...(!privateStairDimensionScreen ? [{ code: 'PRIVATE_STAIR_DIMENSION_SCREEN_FAIL', message: 'Rise, going, pitch or 2R+G falls outside the stated England AD K comparison.' }] : []),
    ...beams.filter(b => b.screen !== 'within-elastic-screen').map(b => ({ code: 'BEAM_ELASTIC_SCREEN_FAIL', message: b.id })),
    ...(!rearPadFits ? [{ code: 'REAR_COMMON_BEARING_GEOMETRY_FAIL', message: 'The combined rear-wet/stair bearing does not fit the receiving wall, opening or steel footprints.' }] : []),
    { code: 'REAR_COMMON_BEARING_RESISTANCE_REQUIRED', message: 'The wet-wall beam and stair trimmer meet at one receiving wall. Their combined reaction and eccentricity must be designed together; separate nominal pad pressures are not independent capacities.' },
    { code: 'PANEL_LAYOUT_AND_CLOSURES_REQUIRED', message: 'Inherited RC field rectangles are geometric span references, not a precast unit schedule. Bridge, residual strips, wall heads, cuts and actual bearing edges remain explicit design work.' },
    { code: 'CONNECTION_AND_STABILITY_UNQUALIFIED', message: 'Section classification, lateral torsional buckling, erection torsion/restraint, connections, concentrated bearing, diaphragm/ties, fire and installed materials have not been qualified.' },
    { code: 'SOURCE_HOUSE_NOT_ADOPTED', message: 'This changed floor and upper datum do not adopt or regenerate the occupied house, foundation reactions, roof, stair headroom, openings or services.' },
  ]
  return { schema: 'str-steel-precast-result/1' as const, caseId: s.caseId, settings: s, geometry, beams,
    section: { availableOrdinaryFloorZoneMm: s.firstFflMm - s.groundCeilingMm, requiredOrdinaryFloorZoneMm,
      ordinaryMarginMm: s.firstFflMm - s.groundCeilingMm - requiredOrdinaryFloorZoneMm,
      plankEndTopMm, plankEndBottomMm, topBearingSteelTopMm, deepestSteelBottomMm: topBearingSteelTopMm - deepestTopBearingBeamMm,
      portalSteelTopMm, portalSteelBottomMm, portalInsulatedSoffitMm, archClearanceMm,
      ordinaryPlankGuideCamberMm: Math.max(...geometry.floorFields.map(f => f.spanMm)) / 300,
      guideCamberIsNotAnAcceptanceTolerance: true as const },
    vertical: { deltaMm, firstFflMm: s.firstFflMm, atticDatumMm: geometry.referenceAtticDatumMm + deltaMm,
      eavesMm: geometry.referenceEavesMm + deltaMm, ridgeMm: geometry.referenceRidgeMm + deltaMm,
      groundCeilingMm: s.groundCeilingMm, upperHeightRetained: true as const },
    stair: { ...geometry.stair, riseMm, pitchDegrees, twoRiseGoingMm, privateStairDimensionScreen,
      finishedTrimmerClearanceMm: stairClearanceMm, headroomAndStructureAccepted: false as const },
    bearing: { requiredOpposedSeatMm, availableFloorFlangeMm: s.sections.floor.widthMm,
      spareWidthMm: s.sections.floor.widthMm - requiredOpposedSeatMm, nominalSupportAreaMm2: s.padstoneLengthMm * s.padstoneWidthMm,
      nominalBearingIsNotVerifiedMinimum: true as const },
    entrance: { referenceWidthMm: geometry.entranceVoidXYWHMm[2], revisedEdgesMm: revisedEntranceEdgesMm,
      revisedWidthMm: revisedEntranceEdgesMm[1] - revisedEntranceEdgesMm[0],
      widthLossMm: geometry.entranceVoidXYWHMm[2] - (revisedEntranceEdgesMm[1] - revisedEntranceEdgesMm[0]) },
    rearCommonBearing: { memberIds: [rearWet.id, stair.id], combinedUltimateReactionKn: combinedRearReactionKn,
      reactionCentreXMm: rearBearingCentreXMm, padXMm: rearPadXMm, steelFootprintXMm: rearSteelFootprintXMm,
      sourceWallCoreYMm: rw.coreYMm, nominalPressureMpa: combinedRearReactionKn * 1000 / (s.padstoneLengthMm * s.padstoneWidthMm),
      planFootprintScreen: rearPadFits, rawStairEndToWallCoreMm: rw.coreYMm[0] - (geometry.stair.footprintXYWHMm[1] + geometry.stair.footprintXYWHMm[3]),
      receivingCapacityAndStairLandingAccepted: false as const },
    floorCoverage: { inheritedFieldAreaM2: fieldAreaM2, bridgeAreaM2: geometry.bridgeAreaM2,
      residualAreaM2: geometry.residualAreaM2, grossSourceFloorAreaM2: geometry.grossSourceFloorAreaM2,
      areaResidualM2: geometry.grossSourceFloorAreaM2 - fieldAreaM2 - geometry.bridgeAreaM2 - geometry.residualAreaM2,
      precastPanelizationComplete: false as const }, diagnostics,
    evidence: { scope: 'geometry, independent simple-beam elastic screens and explicit architectural trade only',
      completeLoadPath: false as const, structuralAcceptance: false as const, ownerAcceptance: false as const } }
}
