/** Conventional simply-supported comparison. No filesystem, UI or inherited RC reactions. */
export interface SteelSection {
  readonly id: string
  readonly depthMm: number
  readonly widthMm: number
  readonly massKgM: number
  readonly ixxCm4: number
}
export interface PrecastStairConstruction {
  readonly waistNormalMm: number
  readonly landingDepthMm: number
  readonly concreteWeightKnM3: number
  readonly flightFinishKnM2: number
  readonly landingFinishKnM2: number
  readonly imposedKnM2: number
  readonly finishDepthMm: number
  readonly endBlockLengthMm: number
  readonly postWidthMm: number
  readonly postMassKgM: number
  readonly postAreaCm2: number
  readonly postIxxCm4: number
}
const stairConstructionFields = ['waistNormalMm', 'landingDepthMm', 'concreteWeightKnM3', 'flightFinishKnM2',
  'landingFinishKnM2', 'imposedKnM2', 'finishDepthMm', 'endBlockLengthMm', 'postWidthMm', 'postMassKgM', 'postAreaCm2', 'postIxxCm4'] as const
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
  readonly bathReceiver: 'pier-lintel' | 'direct-wall'
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
  readonly stairConstruction: PrecastStairConstruction
  readonly entranceFloorTributaryChallengeMm: number
  readonly bathFloorTributaryChallengeMm: number
  readonly stairBeamOffsetFromVoidMm: number
  readonly padstoneLengthMm: number
  readonly padstoneWidthMm: number
  readonly minimumArchClearanceMm: number
  readonly sections: Readonly<Record<'floor' | 'edge' | 'portal' | 'sill' | 'lintel', SteelSection>>
}
export const steelPrecastStageFields = ['schema', 'caseId', 'firstFflMm', 'groundCeilingMm', 'plankDepthMm',
  'plankSelfWeightKnM2', 'finishDepthMm', 'finishLoadKnM2', 'camberReserveMm', 'settingReserveMm',
  'bearingBedMm', 'soffitReserveMm', 'fireSideMm', 'portalPlacement', 'bathReceiver', 'nominalSteelBearingMm',
  'opposedJointMm', 'bearingToleranceEachMm', 'steelYieldMpa', 'steelEMpa', 'permanentFactor',
  'variableFactor', 'imposedLoadKnM2', 'deflectionRatio', 'masonryWeightKnM3', 'plasterWeightKnM3',
  'upperWallHeightMm', 'plasterEachMm', 'roofPermanentChallengeKnM2', 'roofVariableChallengeKnM2',
  'stairConstruction', 'entranceFloorTributaryChallengeMm',
  'bathFloorTributaryChallengeMm', 'stairBeamOffsetFromVoidMm', 'padstoneLengthMm', 'padstoneWidthMm',
  'minimumArchClearanceMm', 'sections'] as const

export function admitSteelPrecastSettings(input: unknown): SteelPrecastSettings {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('Expected steel/precast settings')
  const value = input as Record<string, unknown>
  if (Object.keys(value).length !== steelPrecastStageFields.length || steelPrecastStageFields.some(key => !Object.hasOwn(value, key))) {
    throw new TypeError('Steel/precast settings require exactly the authored fields; derived identities are not editable')
  }
  if (value.schema !== 'str-steel-precast-settings/1' || typeof value.caseId !== 'string' || !value.caseId.trim()
    || !['beside-planks', 'below-planks'].includes(String(value.portalPlacement))
    || !['pier-lintel', 'direct-wall'].includes(String(value.bathReceiver))) throw new TypeError('Unsupported steel/precast case')
  for (const key of steelPrecastStageFields) {
    if (['schema', 'caseId', 'portalPlacement', 'bathReceiver', 'sections', 'stairConstruction'].includes(key)) continue
    if (typeof value[key] !== 'number' || !Number.isFinite(value[key]) || value[key] < 0) throw new TypeError(`Invalid finite nonnegative ${key}`)
  }
  const s = value as unknown as SteelPrecastSettings
  if (s.firstFflMm <= s.groundCeilingMm || s.plankDepthMm <= 0 || s.steelEMpa <= 0 || s.steelYieldMpa <= 0
    || s.deflectionRatio <= 0 || s.padstoneLengthMm <= 0 || s.padstoneWidthMm <= 0
    || s.permanentFactor < 1 || s.variableFactor < 1) throw new TypeError('Unsupported comparison dimensions or action factors')
  if (!s.stairConstruction || Object.keys(s.stairConstruction).sort().join(',') !== [...stairConstructionFields].sort().join(',')
    || stairConstructionFields.some(k => !Number.isFinite(s.stairConstruction[k]) || s.stairConstruction[k] <= 0)) throw new TypeError('Unsupported positive stair construction')
  if (!s.sections || Object.keys(s.sections).sort().join(',') !== 'edge,floor,lintel,portal,sill') throw new TypeError('Expected five explicit section roles')
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
  readonly role: 'floor' | 'edge' | 'portal' | 'sill' | 'lintel'
  readonly a: readonly [number, number]
  readonly b: readonly [number, number]
  readonly supports: readonly [string, string]
  readonly floorTributaryMm: number
  readonly wallCoreMm: number
  readonly wallLoadedLengthMm: number
  readonly roofTributaryMm: number
}

/** Macaulay integration: exact equilibrium and elastic deflection, constant EI, downward loads only. */
export function analyseSimpleBeam(spanMm: number, section: SteelSection, eMpa: number,
  loads: readonly { fromMm: number; toMm: number; knM: number }[], points: readonly { atMm: number; kn: number }[]) {
  if (!Number.isFinite(spanMm) || spanMm <= 0 || !Number.isFinite(eMpa) || eMpa <= 0 || !Number.isFinite(section.ixxCm4) || section.ixxCm4 <= 0
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
  readonly stair: {
    readonly risers: number; readonly goingMm: number; readonly footprintXYWHMm: readonly number[]; readonly finishedFlightWidthBeforeRailMm: number
    readonly bearingAxesYMm: readonly number[]; readonly flightCentreXMm: readonly number[]; readonly landingNorthAxisYMm: number
    readonly sourcePostXYWHMm: readonly number[]; readonly westSillXYWHMm: readonly number[]; readonly headerFloorTributaryMm: number
    readonly finishedWestEdgeMm: number; readonly referenceWindowSillMm: number; readonly referenceWindowHeadMm: number
    readonly referenceGuardBaseMm: number; readonly referenceUpperHeadroomMm: number; readonly groundSupportTopMm: number
    readonly upperWindowYMm: readonly number[]; readonly upperWindowOuterCrownMm: number
    readonly allWestOpeningsYMm: readonly (readonly number[])[]; readonly westRoofTributaryMm: number
    readonly southWallExtentXMm: readonly number[]; readonly southWallOpeningsXMm: readonly (readonly number[])[]
    readonly southWallCoreYMm: readonly number[]
  }
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
  readonly eastArchReceiver: { readonly wallAxisXMm: number; readonly coreWidthMm: number; readonly finishedInsideXMm: number;
    readonly openingYMm: readonly number[]; readonly archOuterCrownMm: number; readonly groundSupportAxesYMm: readonly number[];
    readonly allOpeningsYMm: readonly (readonly number[])[]; readonly floorTributaryMm: number; readonly roofTributaryMm: number }
  readonly beams: readonly BeamModel[]
}

export function calculateSteelPrecast(geometry: SteelPrecastGeometry, input: unknown) {
  const s = admitSteelPrecastSettings(input)
  const er = geometry.eastArchReceiver
  // Shift a narrow lintel roomward only as far as necessary to keep its fire envelope out of the cold-side layers.
  const eastLintelHalfMm = s.sections.lintel.widthMm / 2 + s.fireSideMm
  const eastLintelAxisXMm = er.wallAxisXMm - Math.max(0, eastLintelHalfMm - er.coreWidthMm / 2)
  const screenBeam = (beam: BeamModel, extraLoads: BeamLoad[] = [], points: BeamPoint[] = []) => {
    const section = s.sections[beam.role], spanMm = Math.hypot(beam.b[0] - beam.a[0], beam.b[1] - beam.a[1])
    const loads: BeamLoad[] = [{ fromMm: 0, toMm: spanMm,
      permanentKnM: (s.plankSelfWeightKnM2 + s.finishLoadKnM2) * beam.floorTributaryMm / 1000,
      variableKnM: s.imposedLoadKnM2 * beam.floorTributaryMm / 1000, source: 'explicit floor tributary challenge' }, ...extraLoads,
    { fromMm: 0, toMm: spanMm, permanentKnM: section.massKgM * 9.81 / 1000, variableKnM: 0, source: 'section self weight' }]
    if (beam.wallCoreMm) loads.push({ fromMm: 0, toMm: Math.min(spanMm, beam.wallLoadedLengthMm),
      permanentKnM: (beam.wallCoreMm * s.masonryWeightKnM3 + 2 * s.plasterEachMm * s.plasterWeightKnM3) * s.upperWallHeightMm / 1e6,
      variableKnM: 0, source: 'gross upper masonry and finishes; no opening relief' })
    if (beam.roofTributaryMm) loads.push({ fromMm: 0, toMm: spanMm,
      permanentKnM: s.roofPermanentChallengeKnM2 * beam.roofTributaryMm / 1000,
      variableKnM: s.roofVariableChallengeKnM2 * beam.roofTributaryMm / 1000, source: 'authored roof action challenge; not inherited roof reactions' })
    const analyse = (g: number, q: number) => analyseSimpleBeam(spanMm, section, s.steelEMpa,
      loads.map(v => ({ fromMm: v.fromMm, toMm: v.toMm, knM: g * v.permanentKnM + q * v.variableKnM })),
      points.map(v => ({ atMm: v.atMm, kn: g * v.permanentKn + q * v.variableKn })))
    const permanent = analyse(1, 0), variable = analyse(0, 1), service = analyse(1, 1), ultimate = analyse(s.permanentFactor, s.variableFactor)
    const elasticModulusMm3 = 2 * section.ixxCm4 * 1e4 / section.depthMm
    const elasticStressMpa = ultimate.maximumMomentKnm * 1e6 / elasticModulusMm3
    return { ...beam, loads, points, section, spanMm, permanent, variable, service, ultimate, elasticStressMpa,
      elasticYieldRatio: elasticStressMpa / s.steelYieldMpa,
      deflectionComparatorMm: spanMm / s.deflectionRatio,
      deflectionRatio: service.maximumDeflectionMm / (spanMm / s.deflectionRatio),
      nominalSupportPressureMpa: ultimate.reactionsKn.map(v => v * 1000 / (s.padstoneLengthMm * s.padstoneWidthMm)),
      screen: elasticStressMpa <= s.steelYieldMpa && service.maximumDeflectionMm <= spanMm / s.deflectionRatio ? 'within-elastic-screen' as const : 'fails-elastic-screen' as const }
  }
  const beams = geometry.beams.filter(b => b.id !== 'stair-east').map(original => screenBeam(
    original.id.startsWith('entrance-') ? { ...original, floorTributaryMm: s.entranceFloorTributaryChallengeMm }
      : original.id === 'bath-north' ? { ...original, floorTributaryMm: s.bathFloorTributaryChallengeMm,
        b: [s.bathReceiver === 'pier-lintel' ? eastLintelAxisXMm : er.wallAxisXMm, original.b[1]],
        supports: [original.supports[0], s.bathReceiver === 'pier-lintel' ? 'east-arch-lintel bolted beam joint' : 'outer-east wall above actual arched water opening; direct pier unavailable'] } : original))
  const deepestTopBearingBeamMm = Math.max(s.sections.floor.depthMm, s.sections.edge.depthMm, s.sections.lintel.depthMm)
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
  // One explicit, acyclic stair load path. Each receiver gets the child's separately computed G and Q reaction.
  const st = geometry.stair, sc = s.stairConstruction
  const stairAxis = st.footprintXYWHMm[0] + st.footprintXYWHMm[2] + s.stairBeamOffsetFromVoidMm
  const [headerY, midY] = st.bearingAxesYMm, westX = geometry.floorEnvelopeXYXYMm[0]
  const westLintelAxisXMm = westX + Math.max(0, eastLintelHalfMm - er.coreWidthMm / 2)
  const flightSpanMm = midY - headerY, flightWidthMm = st.finishedFlightWidthBeforeRailMm
  const landingSpanMm = st.landingNorthAxisYMm - midY, crossSpanMm = stairAxis - westX
  if (flightSpanMm <= sc.endBlockLengthMm || landingSpanMm <= 0 || crossSpanMm <= 0) throw new TypeError('Unsupported stair support geometry')
  const waistVerticalMm = sc.waistNormalMm / Math.cos(pitchDegrees * Math.PI / 180)
  const flightPermanentKnM2 = (waistVerticalMm + riseMm / 2) / 1000 * sc.concreteWeightKnM3 + sc.flightFinishKnM2
  const flightAreaM2 = flightSpanMm * flightWidthMm / 1e6
  const flightEndG = flightPermanentKnM2 * flightAreaM2 / 2, flightEndQ = sc.imposedKnM2 * flightAreaM2 / 2
  const upperEndDepthMm = s.firstFflMm - sc.finishDepthMm - topBearingSteelTopMm - s.bearingBedMm
  const upperEndExtraDepthMm = Math.max(0, upperEndDepthMm - waistVerticalMm)
  const upperEndExtraG = upperEndExtraDepthMm * sc.endBlockLengthMm * flightWidthMm / 1e9 * sc.concreteWeightKnM3
  const upperExtraToMidG = upperEndExtraG * sc.endBlockLengthMm / (2 * flightSpanMm)
  const landingPermanentKnM2 = sc.landingDepthMm / 1000 * sc.concreteWeightKnM3 + sc.landingFinishKnM2
  const landingAreaM2 = crossSpanMm * landingSpanMm / 1e6
  const midlandingFflMm = (s.firstFflMm + geometry.referenceGroundFflMm) / 2
  const midlandingSteelTopMm = midlandingFflMm - sc.finishDepthMm - sc.landingDepthMm - s.bearingBedMm
  const model = (id: string, role: BeamModel['role'], a: readonly [number, number], b: readonly [number, number],
    supports: readonly [string, string], floorTributaryMm = 0): BeamModel => ({ id, role, a, b, supports,
    floorTributaryMm, wallCoreMm: 0, wallLoadedLengthMm: 0, roofTributaryMm: 0 })
  const point = (atMm: number, permanentKn: number, variableKn: number, source: string): BeamPoint => ({ atMm, permanentKn, variableKn, source })
  const transfer = (from: ReturnType<typeof screenBeam>, end: number, atMm: number) => point(atMm,
    from.permanent.reactionsKn[end], from.variable.reactionsKn[end], `reaction from ${from.id} end ${end}`)
  const header = screenBeam(model('stair-upper-header', 'floor', [westLintelAxisXMm, headerY], [stairAxis, headerY],
    ['stair-west-upper-lintel bolted beam joint', 'stair-east-south bolted beam joint'], st.headerFloorTributaryMm), [],
  [point(st.flightCentreXMm[1] - westLintelAxisXMm, flightEndG + upperEndExtraG - upperExtraToMidG, flightEndQ, 'upper flight top, including formed end-block mass')])
  const midBeam = screenBeam(model('stair-midlanding', 'floor', [westX, midY], [stairAxis, midY],
    ['west sill beam joint', 'straight stair post']), [{ fromMm: 0, toMm: crossSpanMm,
    permanentKnM: landingPermanentKnM2 * landingSpanMm / 2000, variableKnM: sc.imposedKnM2 * landingSpanMm / 2000,
    source: 'half of precast landing on actual NS bearing axes; conservative full beam-width strip' }],
  [point(st.flightCentreXMm[0] - westX, flightEndG, flightEndQ, 'lower flight at midlanding'),
    point(st.flightCentreXMm[1] - westX, flightEndG + upperExtraToMidG, flightEndQ, 'upper flight at midlanding')])
  const sillY = st.westSillXYWHMm[1], sillEndY = sillY + st.westSillXYWHMm[3]
  const sill = screenBeam(model('stair-west-sill', 'sill', [westX, sillY], [westX, sillEndY],
    ['outer-west masonry south of landing window', 'outer-west masonry north of landing window']), [], [transfer(midBeam, 0, midY - sillY)])
  const oldTrimmer = geometry.beams.find(b => b.id === 'stair-east')!
  const floorTrib = (geometry.westGallerySupportXMm - stairAxis) / 2
  const stairSouth = screenBeam(model('stair-east-south', 'edge', [stairAxis, oldTrimmer.a[1]], [stairAxis, midY],
    ['study-cloak-north solid wall', 'straight stair post'], floorTrib), [], [transfer(header, 1, headerY - oldTrimmer.a[1])])
  const stairNorth = screenBeam(model('stair-east-north', 'edge', [stairAxis, midY], [stairAxis, oldTrimmer.b[1]],
    ['straight stair post', 'rear-west wall beside rear-wet bearing'], floorTrib))
  const stairBeams = [stairSouth, stairNorth, header, midBeam, sill]
  beams.push(...stairBeams)
  const postHeightMm = topBearingSteelTopMm - s.sections.edge.depthMm - st.groundSupportTopMm
  const postSelfG = postHeightMm / 1000 * sc.postMassKgM * 9.81 / 1000
  const postG = stairSouth.permanent.reactionsKn[1] + stairNorth.permanent.reactionsKn[0] + midBeam.permanent.reactionsKn[1] + postSelfG
  const postQ = stairSouth.variable.reactionsKn[1] + stairNorth.variable.reactionsKn[0] + midBeam.variable.reactionsKn[1]
  const postUltimateKn = s.permanentFactor * postG + s.variableFactor * postQ
  const postHalfMm = sc.postWidthMm / 2 + s.fireSideMm
  const postXYWHMm = [stairAxis - postHalfMm, midY - postHalfMm, 2 * postHalfMm, 2 * postHalfMm]
  const postFits = postXYWHMm[0] >= st.sourcePostXYWHMm[0] && postXYWHMm[1] >= st.sourcePostXYWHMm[1]
    && postXYWHMm[0] + postXYWHMm[2] <= st.sourcePostXYWHMm[0] + st.sourcePostXYWHMm[2]
    && postXYWHMm[1] + postXYWHMm[3] <= st.sourcePostXYWHMm[1] + st.sourcePostXYWHMm[3]
  const sillEnvelopeWidthMm = s.sections.sill.widthMm + 2 * s.fireSideMm
  const sillFits = sillEnvelopeWidthMm <= st.westSillXYWHMm[2]
  const landingRearG = landingPermanentKnM2 * landingAreaM2 / 2, landingRearQ = sc.imposedKnM2 * landingAreaM2 / 2
  const externalReceivers = [
    { id: 'ground-flight-toe', permanentKn: flightEndG, variableKn: flightEndQ },
    { id: 'landing-rear-wall-at-half-height', permanentKn: landingRearG, variableKn: landingRearQ },
    { id: 'straight-post-base', permanentKn: postG, variableKn: postQ },
    ...[[header, 0], [stairSouth, 0], [stairNorth, 1], [sill, 0], [sill, 1]].map(([b, end]) => {
      const beam = b as ReturnType<typeof screenBeam>, n = end as number
      return { id: beam.id === header.id ? 'stair-upper-header-to-west-lintel' : `${beam.id}-wall-${n}`,
        permanentKn: beam.permanent.reactionsKn[n], variableKn: beam.variable.reactionsKn[n] }
    }),
  ].map(v => ({ ...v, ultimateKn: s.permanentFactor * v.permanentKn + s.variableFactor * v.variableKn }))
  const beamSelfG = stairBeams.reduce((v, b) => v + b.section.massKgM * 9.81 / 1000 * b.spanMm / 1000, 0)
  const stairBeamFloorAreaM2 = stairBeams.reduce((v, b) => v + b.floorTributaryMm * b.spanMm / 1e6, 0)
  const totalNetworkG = 4 * flightEndG + upperEndExtraG + landingPermanentKnM2 * landingAreaM2 + beamSelfG + postSelfG
    + stairBeamFloorAreaM2 * (s.plankSelfWeightKnM2 + s.finishLoadKnM2)
  const totalNetworkQ = 4 * flightEndQ + sc.imposedKnM2 * landingAreaM2 + stairBeamFloorAreaM2 * s.imposedLoadKnM2
  const landingDeltaMm = midlandingFflMm - (geometry.referenceFirstFflMm + geometry.referenceGroundFflMm) / 2
  const bathBeam = beams.find(b => b.id === 'bath-north')!
  const [eastSouthY, eastNorthY] = er.groundSupportAxesYMm
  const directBathAboveOpening = er.openingYMm[0] < bathBeam.b[1] && bathBeam.b[1] < er.openingYMm[1]
  const eastLintel = s.bathReceiver === 'pier-lintel' ? screenBeam({ ...model('east-arch-lintel', 'lintel',
    [eastLintelAxisXMm, eastSouthY], [eastLintelAxisXMm, eastNorthY],
    ['south pier over reserved ground node', 'north pier over reserved ground node'], er.floorTributaryMm),
  wallCoreMm: er.coreWidthMm, wallLoadedLengthMm: eastNorthY - eastSouthY, roofTributaryMm: er.roofTributaryMm }, [],
  [transfer(bathBeam, 1, bathBeam.b[1] - eastSouthY)]) : null
  if (eastLintel) beams.push(eastLintel)
  const eastPadYMm = [eastSouthY, eastNorthY].map(y => [y - s.padstoneLengthMm / 2, y + s.padstoneLengthMm / 2])
  const eastPadsClear = eastPadYMm.every(pad => !er.allOpeningsYMm.some(h => pad[0] < h[1] && pad[1] > h[0]))
  const eastEnvelopeFits = eastLintelAxisXMm - eastLintelHalfMm >= er.finishedInsideXMm
    && eastLintelAxisXMm + eastLintelHalfMm <= er.wallAxisXMm + er.coreWidthMm / 2
  const eastArchClearanceMm = topBearingSteelTopMm - Math.max(s.sections.floor.depthMm, s.sections.lintel.depthMm)
    - s.fireSideMm - er.archOuterCrownMm
  const westSeatOffsetMm = s.padstoneLengthMm / 2 + 2 * s.bearingToleranceEachMm
  const westSeatYMm = [st.upperWindowYMm[0] - westSeatOffsetMm, st.upperWindowYMm[1] + westSeatOffsetMm]
  const westLintel = screenBeam({ ...model('stair-west-upper-lintel', 'lintel', [westLintelAxisXMm, westSeatYMm[0]],
    [westLintelAxisXMm, westSeatYMm[1]], ['outer-west south window pier', 'outer-west north window pier'], crossSpanMm / 2),
  wallCoreMm: er.coreWidthMm, wallLoadedLengthMm: westSeatYMm[1] - westSeatYMm[0], roofTributaryMm: st.westRoofTributaryMm }, [],
  [transfer(header, 0, headerY - westSeatYMm[0])])
  beams.push(westLintel)
  const westPadYMm = westSeatYMm.map(y => [y - s.padstoneLengthMm / 2, y + s.padstoneLengthMm / 2])
  const westPadsClear = westPadYMm.every(pad => !st.allWestOpeningsYMm.some(h => pad[0] < h[1] && pad[1] > h[0]))
  const westEnvelopeFits = westLintelAxisXMm - eastLintelHalfMm >= westX - er.coreWidthMm / 2
    && westLintelAxisXMm + eastLintelHalfMm <= st.finishedWestEdgeMm
  const westArchClearanceMm = topBearingSteelTopMm - Math.max(header.section.depthMm, westLintel.section.depthMm)
    - s.fireSideMm - st.upperWindowOuterCrownMm
  const southPadCentreXMm = Math.min(Math.max(stairAxis, st.southWallExtentXMm[0] + s.padstoneLengthMm / 2),
    st.southWallExtentXMm[1] - s.padstoneLengthMm / 2)
  const southPadXMm = [southPadCentreXMm - s.padstoneLengthMm / 2, southPadCentreXMm + s.padstoneLengthMm / 2]
  const southEccentricityMm = stairAxis - southPadCentreXMm
  const southPadFits = southPadXMm[0] >= st.southWallExtentXMm[0] && southPadXMm[1] <= st.southWallExtentXMm[1]
    && s.padstoneWidthMm <= st.southWallCoreYMm[1] - st.southWallCoreYMm[0]
    && !st.southWallOpeningsXMm.some(h => southPadXMm[0] < h[1] && southPadXMm[1] > h[0])
    && stairAxis - stairSouth.section.widthMm / 2 >= southPadXMm[0] && stairAxis + stairSouth.section.widthMm / 2 <= southPadXMm[1]
  const southMeanPressureMpa = stairSouth.ultimate.reactionsKn[0] * 1000 / (s.padstoneLengthMm * s.padstoneWidthMm)
  const requiredOpposedSeatMm = 2 * (s.nominalSteelBearingMm + s.bearingToleranceEachMm) + s.opposedJointMm
  const edgeHalfFinishedMm = s.sections.edge.widthMm / 2 + s.fireSideMm
  const stairBeam = stairSouth
  const stairClearanceMm = stairBeam.a[0] - edgeHalfFinishedMm - (geometry.stair.footprintXYWHMm[0] + geometry.stair.footprintXYWHMm[2])
  const west = beams.find(v => v.id === 'entrance-west')!, east = beams.find(v => v.id === 'entrance-east')!
  const revisedEntranceEdgesMm = [Math.max(geometry.entranceVoidXYWHMm[0], west.a[0] + edgeHalfFinishedMm),
    Math.min(geometry.entranceVoidXYWHMm[0] + geometry.entranceVoidXYWHMm[2], east.a[0] - edgeHalfFinishedMm)]
  const fieldAreaM2 = geometry.floorFields.reduce((a, f) => a + (f.rectangleXYXYMm[2] - f.rectangleXYXYMm[0]) * (f.rectangleXYXYMm[3] - f.rectangleXYXYMm[1]) / 1e6, 0)
  const deltaMm = s.firstFflMm - geometry.referenceFirstFflMm
  const rearWet = beams.find(b => b.id === 'rear-wet')!, stair = stairNorth
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
    ...(!postFits ? [{ code: 'STAIR_POST_ENVELOPE_FAIL', message: 'The proposed post and fire envelope exceed the source post territory.' }] : []),
    ...(!sillFits ? [{ code: 'STAIR_SILL_ENVELOPE_FAIL', message: 'The proposed sill steel and fire envelope exceed the source wall core.' }] : []),
    ...(s.bathReceiver === 'direct-wall' && directBathAboveOpening ? [{ code: 'BATH_DIRECT_PIER_UNAVAILABLE', message: 'The bath transfer at Y6500 is above the actual east arched opening, not a solid pier. The direct-wall route has no proved receiver.' }] : []),
    ...(!eastPadsClear || !eastEnvelopeFits || eastArchClearanceMm < s.minimumArchClearanceMm ? [{ code: 'EAST_ARCH_LINTEL_GEOMETRY_FAIL', message: 'The proposed lintel pads, fire envelope or retained arch clearance do not fit.' }] : []),
    ...(!westPadsClear || !westEnvelopeFits || westArchClearanceMm < s.minimumArchClearanceMm ? [{ code: 'WEST_STAIR_LINTEL_GEOMETRY_FAIL', message: 'The upper stair header is above a window; the proposed independent lintel pads, fire envelope or arch clearance do not fit.' }] : []),
    ...(!southPadFits || Math.abs(southEccentricityMm) > s.padstoneLengthMm / 6 ? [{ code: 'STAIR_SOUTH_BEARING_GEOMETRY_FAIL', message: 'The shifted end pad cannot retain the steel footprint and full-compression geometric comparison.' }] : []),
    { code: 'EAST_ARCH_RECEIVER_CAPACITY_REQUIRED', message: 'The ordinary lintel transfers the bath-beam reaction plus explicit wall/floor/roof challenges to the existing side-pier axes. Its bolted joint, pier bearings, genuine arch and ground receivers remain unqualified.' },
    { code: 'PRECAST_STAIR_ENDS_AND_CONNECTIONS_REQUIRED', message: 'Actual flight/landing gravity and transfer reactions are derived. Precast reinforcement/end profiles, bearings, bolted joints, post stability/base, guard upstands and full headroom remain unqualified.' },
    ...(landingDeltaMm !== 0 ? [{ code: 'STAIR_WINDOW_AND_GUARD_CHANGE', message: 'The midlanding, window sill and guard base move by half the floor-datum change; the window head is retained. The source guard mounting does not transfer to the lower steel sill.' }] : []),
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
      finishedTrimmerClearanceMm: stairClearanceMm, headroomAndStructureAccepted: false as const,
      flight: { bearingSpanMm: flightSpanMm, widthMm: flightWidthMm, horizontalAreaEachM2: flightAreaM2, waistVerticalMm,
        permanentKnM2: flightPermanentKnM2, variableKnM2: sc.imposedKnM2, ordinaryEndPermanentKn: flightEndG, ordinaryEndVariableKn: flightEndQ,
        upperEndDepthMm, upperEndExtraDepthMm, upperEndExtraPermanentKn: upperEndExtraG,
        groundToeRequiredEndDepthMm: geometry.referenceGroundFflMm - sc.finishDepthMm - st.groundSupportTopMm - s.bearingBedMm,
        endReinforcementAndBearingAccepted: false as const },
      landing: { firstFflMm: midlandingFflMm, deltaMm: landingDeltaMm, spanMm: landingSpanMm, areaM2: landingAreaM2,
        permanentKnM2: landingPermanentKnM2, steelTopMm: midlandingSteelTopMm, steelBottomMm: midlandingSteelTopMm - midBeam.section.depthMm },
      post: { axisXYMm: [stairAxis, midY], fireEnvelopeXYWHMm: postXYWHMm, sourceTerritoryScreen: postFits,
        heightToBeamUndersideMm: postHeightMm, permanentKn: postG, variableKn: postQ, ultimateKn: postUltimateKn,
        grossStressMpa: postUltimateKn * 1000 / (sc.postAreaCm2 * 100),
        pinnedEulerLoadKn: Math.PI ** 2 * s.steelEMpa * sc.postIxxCm4 * 1e4 / postHeightMm ** 2 / 1000,
        stabilityConnectionsAndBaseAccepted: false as const },
      window: { sillMm: st.referenceWindowSillMm + landingDeltaMm, headMm: st.referenceWindowHeadMm,
        heightLossMm: landingDeltaMm, guardBaseMm: st.referenceGuardBaseMm + landingDeltaMm,
        guardUpstandAboveSteelMm: st.referenceGuardBaseMm + landingDeltaMm - midlandingSteelTopMm,
        sillSteelAndFireWidthMm: sillEnvelopeWidthMm, sourceCoreScreen: sillFits, guardAndWindowAccepted: false as const },
      limitedHeadrooms: { firstNoseUnderHeaderMm: topBearingSteelTopMm - header.section.depthMm - s.fireSideMm - geometry.referenceGroundFflMm - riseMm,
        upperArrivalBelowRaisedRoofMm: st.referenceUpperHeadroomMm, continuousHeadroomAccepted: false as const },
      network: { memberIds: stairBeams.map(b => b.id), externalReceivers, totalPermanentKn: totalNetworkG, totalVariableKn: totalNetworkQ,
        permanentBalanceResidualKn: externalReceivers.reduce((v, r) => v + r.permanentKn, 0) - totalNetworkG,
        variableBalanceResidualKn: externalReceivers.reduce((v, r) => v + r.variableKn, 0) - totalNetworkQ,
        fullHouseLoadPathAccepted: false as const } },
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
    eastArchReceiver: { selected: s.bathReceiver, directBathAboveOpening, directPierAvailable: !directBathAboveOpening,
      openingYMm: er.openingYMm, supportingAxesYMm: er.groundSupportAxesYMm, padYMm: eastPadYMm,
      padsClearOpeningsScreen: eastPadsClear, steelAxisXMm: eastLintelAxisXMm,
      roomwardShiftMm: er.wallAxisXMm - eastLintelAxisXMm, envelopeFitsScreen: eastEnvelopeFits,
      fireEnvelopeToArchMm: eastArchClearanceMm, bathReactionUltimateKn: bathBeam.ultimate.reactionsKn[1],
      pierReactionsUltimateKn: eastLintel?.ultimate.reactionsKn ?? null,
      connectionsArchPierAndGroundAccepted: false as const },
    westStairReceiver: { openingYMm: st.upperWindowYMm, supportingAxesYMm: westSeatYMm, padYMm: westPadYMm,
      padsClearOpeningsScreen: westPadsClear, steelAxisXMm: westLintelAxisXMm, roomwardShiftMm: westLintelAxisXMm - westX,
      envelopeFitsScreen: westEnvelopeFits, fireEnvelopeToArchMm: westArchClearanceMm,
      headerReactionUltimateKn: header.ultimate.reactionsKn[0], pierReactionsUltimateKn: westLintel.ultimate.reactionsKn,
      completeThermalArchPierAndGroundAccepted: false as const },
    stairSouthBearing: { wallExtentXMm: st.southWallExtentXMm, padXMm: southPadXMm, loadEccentricityMm: southEccentricityMm,
      footprintScreen: southPadFits, linearFullCompressionScreen: Math.abs(southEccentricityMm) <= s.padstoneLengthMm / 6,
      meanPressureMpa: southMeanPressureMpa,
      linearPressureRangeMpa: [1 - 6 * Math.abs(southEccentricityMm) / s.padstoneLengthMm,
        1 + 6 * Math.abs(southEccentricityMm) / s.padstoneLengthMm].map(v => v * southMeanPressureMpa),
      padAndMasonryResistanceAccepted: false as const },
    floorCoverage: { inheritedFieldAreaM2: fieldAreaM2, bridgeAreaM2: geometry.bridgeAreaM2,
      residualAreaM2: geometry.residualAreaM2, grossSourceFloorAreaM2: geometry.grossSourceFloorAreaM2,
      areaResidualM2: geometry.grossSourceFloorAreaM2 - fieldAreaM2 - geometry.bridgeAreaM2 - geometry.residualAreaM2,
      precastPanelizationComplete: false as const }, diagnostics,
    evidence: { scope: 'geometry, independent simple-beam elastic screens and explicit architectural trade only',
      completeLoadPath: false as const, structuralAcceptance: false as const, ownerAcceptance: false as const } }
}
