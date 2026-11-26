import { segmentDistance, segmentBoxDistance } from '../../../../project/had/studies/service-interface-geometry.mjs'
/** Local dead-mock-up geometry. Installed circuit, substrate/anchor and material acceptance are separate. */
export interface LocalHomeRunChoices {
  readonly bayWidthMm: number; readonly stationOffsetXMm: number; readonly tubeWallMm: number; readonly routeGapMm: number
  readonly lowerPortRearInsetMm: number; readonly maximumClipSpanMm: number; readonly clipEndInsetMm: number
}
export interface LightingCornerDetailInput {
  readonly homeRuns: LocalHomeRunChoices
  readonly bayPlanMm: readonly number[]
  readonly jointMm: number; readonly totalDepthMm: number; readonly fixedBoundaryMm: number; readonly decorativeFaceMm: number
  readonly bottomZMm: number; readonly topZMm: number
  readonly moduleCentreZMm: number; readonly moduleSizeMm: readonly number[]; readonly completeProjectionMm: number
  readonly moduleMassLimitKg: number; readonly socketCentreZMm: number
  readonly firstRestPlanMm: readonly number[]; readonly normalDrawMm: number
  readonly occupied: readonly (readonly [string, readonly number[]])[]
  readonly construction: {
    readonly railWidthMm: number; readonly steelThicknessMm: number; readonly boltEdgeMm: number; readonly holeDiameterMm: number; readonly boltEndInsetMm: number
    readonly centrePlateWidthMm: number; readonly centrePlateHeightMm: number; readonly crossbarCentreOffsetMm: number
    readonly steelDensityKgM3Comparison: number; readonly infillBottomZMm: number; readonly infillModuleGapMm: number
    readonly containmentOutsideDiameterMm: number; readonly bendCentrelineRadiusMm: number; readonly cradleBackMarginMm: number; readonly cradleBottomZMm: number
    readonly fixedIslandWidthMm: number; readonly fixedIslandHeightMm: number; readonly entryCollarOutsideDiameterMm: number; readonly entryCollarAxialLengthMm: number
  }
  readonly boxSizeMm: readonly number[]; readonly plateSizeMm: readonly number[]
  readonly ceilingZMm: number
}
const overlap = (a: readonly number[], b: readonly number[]) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]
export function deriveLightingCornerDetail(input: LightingCornerDetailInput) {
  const { bayPlanMm: bay, moduleSizeMm: size, construction: c } = input
  const numeric = [input.jointMm, input.totalDepthMm, input.fixedBoundaryMm, input.decorativeFaceMm, input.bottomZMm, input.topZMm,
    input.moduleCentreZMm, input.completeProjectionMm, input.moduleMassLimitKg, input.socketCentreZMm, input.normalDrawMm,
    input.ceilingZMm, ...bay, ...size, ...input.firstRestPlanMm, ...input.boxSizeMm, ...input.plateSizeMm, ...Object.values(c)]
  if (!Object.values(c).every(n => Number.isFinite(n) && n > 0) || !input.boxSizeMm.every(n => Number.isFinite(n) && n > 0) || !input.plateSizeMm.every(n => Number.isFinite(n) && n > 0) || !numeric.every(Number.isFinite) || bay.length !== 4 || size.length !== 2 || size.some(n => n <= 0) || input.moduleMassLimitKg <= 0) throw new TypeError('IAS_LIGHTING_DETAIL_INVALID_INPUT')
  const cx = (bay[0] + bay[2]) / 2, faceY = bay[1], coreY = faceY + input.totalDepthMm
  const width = size[0], height = size[1], half = width / 2
  const z0 = input.moduleCentreZMm - height / 2, z1 = input.moduleCentreZMm + height / 2
  const railWidth = c.railWidthMm, steelThickness = c.steelThicknessMm, boltEdge = c.boltEdgeMm, holeDiameter = c.holeDiameterMm
  if (width <= 2 * railWidth || height <= 2 * railWidth || height <= 2 * c.boltEndInsetMm) throw new TypeError('IAS_LIGHTING_DETAIL_UNSUPPORTED_FRAME_DIMENSIONS')
  const railX = [cx - half + boltEdge, cx + half - boltEdge]
  const boltZ = [z0 + c.boltEndInsetMm, z1 - c.boltEndInsetMm]
  const attachmentPoints = railX.flatMap((x, i) => boltZ.map((z, j) => ({ id: `IAS/STUDY/carrier/bolt/${i}/${j}`, xMm: x, zMm: z, holeDiameterMm: holeDiameter })))
  const fixedRailDepth = [input.fixedBoundaryMm, input.fixedBoundaryMm + steelThickness]
  const carrierDepth = [input.totalDepthMm - input.decorativeFaceMm - steelThickness, input.totalDepthMm - input.decorativeFaceMm]
  // Every point has a real hard land to the masonry face: decoration/mineral board carry no light load.
  const hardLands = attachmentPoints.map(point => ({ ...point, coreDepthStartMm: 0, coreDepthEndMm: carrierDepth[1],
    path: 'Carrier positive screw → fixed steel sleeve/hard land → permanent masonry substrate; anchor resistance and sealed penetration unqualified.' }))
  const weightN = input.moduleMassLimitKg * 9.81
  const moduleCoupleSpacingMm = boltZ[1] - boltZ[0]
  const faceMomentNm = weightN * input.completeProjectionMm / 1000
  const coreMomentNm = weightN * (input.totalDepthMm + input.completeProjectionMm) / 1000
  const normalCoupleN = coreMomentNm * 1000 / moduleCoupleSpacingMm
  const rest = input.firstRestPlanMm, parkedBackY = rest[3] - c.cradleBackMarginMm
  const parked = { xMm: [cx - half, cx + half], yMm: [parkedBackY - input.completeProjectionMm, parkedBackY], zMm: [c.cradleBottomZMm, c.cradleBottomZMm + height] }
  const withdrawn = { xMm: [cx - half, cx + half], yMm: [faceY - input.completeProjectionMm - input.normalDrawMm, faceY - input.normalDrawMm], zMm: [z0, z1] }
  const sweepPlan = [cx - half, Math.min(parked.yMm[0], withdrawn.yMm[0]), cx + half, faceY] as const
  const conflicts = input.occupied.filter(([, box]) => overlap(sweepPlan, box)).map(([id]) => id)
  const issues: string[] = []
  if (moduleCoupleSpacingMm <= 0 || width <= 2 * boltEdge + holeDiameter || railX[0] - railWidth / 2 < bay[0] || railX[1] + railWidth / 2 > bay[2]) issues.push('carrier-fastener-or-rail-outside-bay')
  if (carrierDepth[0] <= fixedRailDepth[1]) issues.push('carrier-depth-closes-routing-space')
  if (z0 < input.bottomZMm || z1 > input.topZMm || z1 > input.ceilingZMm) issues.push('module-outside-local-field')
  if (parked.xMm[0] < rest[0] || parked.xMm[1] > rest[2] || parked.yMm[0] < rest[1] || parked.yMm[1] > rest[3]) issues.push('complete-module-outside-first-rest')
  if (conflicts.length) issues.push('complete-module-sweep-intersects-occupied-furniture')
  const carrierStrips = [
    [cx - half, z0, cx - half + railWidth, z1], [cx + half - railWidth, z0, cx + half, z1],
    [cx - half + railWidth, z0, cx + half - railWidth, z0 + railWidth], [cx - half + railWidth, z1 - railWidth, cx + half - railWidth, z1],
    [cx - c.centrePlateWidthMm / 2, input.moduleCentreZMm - c.centrePlateHeightMm / 2, cx + c.centrePlateWidthMm / 2, input.moduleCentreZMm + c.centrePlateHeightMm / 2],
    [cx - half + railWidth, input.moduleCentreZMm - c.crossbarCentreOffsetMm - railWidth / 2, cx + half - railWidth, input.moduleCentreZMm - c.crossbarCentreOffsetMm + railWidth / 2],
    [cx - half + railWidth, input.moduleCentreZMm + c.crossbarCentreOffsetMm - railWidth / 2, cx + half - railWidth, input.moduleCentreZMm + c.crossbarCentreOffsetMm + railWidth / 2],
  ]
  // Charge overlap stock in full. This is an upper stock comparison, not a fabricated/cut takeoff.
  const stockAreaMm2Upper = carrierStrips.reduce((sum, r) => sum + (r[2] - r[0]) * (r[3] - r[1]), 0)
  const steelDensityKgM3Comparison = c.steelDensityKgM3Comparison
  const carrierStockMassKgUpperComparison = stockAreaMm2Upper * steelThickness / 1e9 * steelDensityKgM3Comparison
  if (c.fixedIslandWidthMm < input.boxSizeMm[0] + 2 * c.entryCollarAxialLengthMm + 2 * input.jointMm || c.fixedIslandHeightMm < input.boxSizeMm[1] || c.entryCollarOutsideDiameterMm > input.boxSizeMm[2]) issues.push('box-entry-collar-outside-fixed-island')
  const fixedBoxes = [input.socketCentreZMm, 1100, input.moduleCentreZMm].map(z => [cx - input.boxSizeMm[0] / 2, z - input.boxSizeMm[1] / 2, cx + input.boxSizeMm[0] / 2, z + input.boxSizeMm[1] / 2])
  for (let i = 0; i < fixedBoxes.length; i++) for (let j = i + 1; j < fixedBoxes.length; j++) if (overlap(fixedBoxes[i], fixedBoxes[j])) issues.push('fixed-electrical-boxes-overlap')
  const infill = { id: 'IAS/STUDY/service-corner/infill/central', xMm: [cx - half, cx + half], zMm: [c.infillBottomZMm, z0 - c.infillModuleGapMm],
    firstDrawMm: input.normalDrawMm, positiveFrontScrewCount: 4,
    boundary: 'Stopped decoration between fixed electrical islands and light carrier. Retained enclosure/rails remain closed and independently supported.' }
  if (infill.zMm[1] <= infill.zMm[0]) issues.push('no-positive-infill-between-switch-and-module')
  const fixedIslandJoints = [input.socketCentreZMm, 1100, input.moduleCentreZMm].map(z => [cx - c.fixedIslandWidthMm / 2 - input.jointMm, z - c.fixedIslandHeightMm / 2 - input.jointMm, cx + c.fixedIslandWidthMm / 2 + input.jointMm, z + c.fixedIslandHeightMm / 2 + input.jointMm])
  if (fixedIslandJoints.slice(0, 2).some(box => overlap([infill.xMm[0], infill.zMm[0], infill.xMm[1], infill.zMm[1]], box))) issues.push('fixed-electrical-island-intersects-removable-infill')
  // A quarter-circle ends at a straight collar tangent, never at the box wall.
  // Collars occupy axial length outside that wall; the tube occupies its full OD.
  // These are three local entry branches, not an invented connected feeder/riser.
  const boxLeft = cx - input.boxSizeMm[0] / 2
  const collarTangentX = boxLeft - c.entryCollarAxialLengthMm
  const riserX = collarTangentX - c.bendCentrelineRadiusMm
  const tubeRadius = c.containmentOutsideDiameterMm / 2
  const collarRadius = c.entryCollarOutsideDiameterMm / 2
  const localEntryBranches = [input.socketCentreZMm, 1100, input.moduleCentreZMm].map((z, i) => {
    const boxFrontDepth = i === 2 ? carrierDepth[0] - steelThickness : input.totalDepthMm
    const axisDepth = boxFrontDepth - input.boxSizeMm[2] / 2
    const bendStartZ = z - c.bendCentrelineRadiusMm
    const bendEnvelope = { xMm: [riserX - tubeRadius, collarTangentX + tubeRadius],
      zMm: [bendStartZ - tubeRadius, z + tubeRadius], depthMm: [axisDepth - tubeRadius, axisDepth + tubeRadius] }
    const collarEnvelope = { xMm: [collarTangentX, boxLeft], zMm: [z - collarRadius, z + collarRadius],
      depthMm: [axisDepth - collarRadius, axisDepth + collarRadius] }
    const settingClearanceMm = { left: bendEnvelope.xMm[0] - bay[0],
      bottom: bendEnvelope.zMm[0] - input.bottomZMm, top: input.topZMm - collarEnvelope.zMm[1],
      rear: Math.min(bendEnvelope.depthMm[0], collarEnvelope.depthMm[0]) - fixedRailDepth[1],
      front: (i === 2 ? carrierDepth[0] : input.totalDepthMm) - Math.max(bendEnvelope.depthMm[1], collarEnvelope.depthMm[1]) }
    const branchIssues: string[] = []
    if (Object.values(settingClearanceMm).some(gap => gap < input.jointMm - 1e-9)) branchIssues.push('entry-branch-setting-envelope-outside-local-field')
    if (collarEnvelope.depthMm[0] < boxFrontDepth - input.boxSizeMm[2] || collarEnvelope.depthMm[1] > boxFrontDepth || collarRadius > input.boxSizeMm[1] / 2) branchIssues.push('entry-collar-outside-actual-box-side')
    for (const issue of branchIssues) if (!issues.includes(issue)) issues.push(issue)
    return { id: `IAS/STUDY/service-corner/entry-branch/${i}`, boxId: `IAS/STUDY/service-corner/fixed-island/${i}`,
      bend: { plane: 'XZ at constant core depth', axisCoreDepthMm: axisDepth, centreMm: [collarTangentX, coreY - axisDepth, bendStartZ],
        centrelineRadiusMm: c.bendCentrelineRadiusMm, angleDegrees: 90,
        startMm: [riserX, coreY - axisDepth, bendStartZ], endMm: [collarTangentX, coreY - axisDepth, z],
        startUnitTangent: [0, 0, 1], endUnitTangent: [1, 0, 0], sweptEnvelope: bendEnvelope },
      collar: { startMm: [collarTangentX, coreY - axisDepth, z], boxEntryMm: [boxLeft, coreY - axisDepth, z],
        axialLengthMm: c.entryCollarAxialLengthMm, outsideDiameterMm: c.entryCollarOutsideDiameterMm, envelope: collarEnvelope },
      settingClearanceMm, requiredSettingMm: input.jointMm, issues: branchIssues,
      currentHouseSupplyConnected: false, commonRiserDepthTransitionResolved: false }
  })
  return {
    schema: 'ias-study-lighting-corner-detail/1', status: issues.length ? 'GEOMETRY_REJECTED' : 'DEAD_MOCKUP_GEOMETRY_COMPARISON',
    coordinateConvention: 'XYZ house mm; depth d is roomward from actual masonry core face. No invented anchor embedment.', coreFaceYMm: coreY,
    fixedRails: railX.map((x, i) => ({ id: `IAS/STUDY/service-corner/rail/${i}`, xMm: [x - railWidth / 2, x + railWidth / 2],
      zMm: [input.bottomZMm, input.topZMm], depthMm: fixedRailDepth })),
    fixedRailStockMassKgComparison: 2 * railWidth * (input.topZMm - input.bottomZMm) * steelThickness / 1e9 * steelDensityKgM3Comparison,
    carrier: { id: 'IAS/STUDY/service-corner/carrier', xMm: [cx - half, cx + half], zMm: [z0, z1], depthMm: carrierDepth,
      stripsXZMm: carrierStrips, centralCableOpening: { centreXMm: cx, centreZMm: input.moduleCentreZMm, diameterMm: c.containmentOutsideDiameterMm, holeStockCreditTaken: false }, steelThicknessMm: steelThickness, steelDensityKgM3Comparison, carrierStockMassKgUpperComparison,
      completeModuleMassLimitKg: input.moduleMassLimitKg, remainingAuthoredMassBudgetKg: input.moduleMassLimitKg - carrierStockMassKgUpperComparison,
      note: 'Overlap stock is charged twice conservatively. Fasteners, decoration, bracket, luminaire, shade, lamp and wiring must fit remaining authored budget; none has a qualified installed upper mass.' },
    attachmentPoints, hardLands, loadDemand: { weightN, faceMomentNm, coreMomentNm, moduleCoupleSpacingMm, normalCoupleN,
      equalFourFixingShearN: weightN / 4, equalTwoUpperFixingTensionN: normalCoupleN / 2,
      oneUpperFixingLostNecessaryTensionN: normalCoupleN, resistanceAccepted: false },
    fixedEnclosures: [input.socketCentreZMm, 1100, input.moduleCentreZMm].map((z, i) => {
      const boxFrontDepth = i === 2 ? carrierDepth[0] - steelThickness : input.totalDepthMm
      return { id: `IAS/STUDY/service-corner/fixed-island/${i}`,
      bodyXZMm: [cx - input.boxSizeMm[0] / 2, z - input.boxSizeMm[1] / 2, cx + input.boxSizeMm[0] / 2, z + input.boxSizeMm[1] / 2], faceXZMm: [cx - input.plateSizeMm[0] / 2, z - input.plateSizeMm[1] / 2, cx + input.plateSizeMm[0] / 2, z + input.plateSizeMm[1] / 2], bodyDepthMm: [boxFrontDepth - input.boxSizeMm[2], boxFrontDepth],
      requiredDecorativeJointMm: input.jointMm, independentIslandXZMm: [cx - c.fixedIslandWidthMm / 2, z - c.fixedIslandHeightMm / 2, cx + c.fixedIslandWidthMm / 2, z + c.fixedIslandHeightMm / 2],
      sideEntryAxisDepthMm: boxFrontDepth - input.boxSizeMm[2] / 2,
      independentFixedCoverDepthMm: i === 2 ? [boxFrontDepth, carrierDepth[0]] : null,
      clearanceToCarrierDepthMm: i === 2 ? carrierDepth[0] - boxFrontDepth : null,
      independentOfDecoration: true, bodyDepthAuthority: 'Referenced72x72x47mm steel box. Junction box is recessed behind independent fixed cover and carrier; socket/switch islands interrupt decoration locally. Accessory/earth/entries/insulation and product material admission remain required.' } }),
    containment: { outsideDiameterRequirementMm: c.containmentOutsideDiameterMm, localUsableDepthMm: input.totalDepthMm - input.fixedBoundaryMm - input.decorativeFaceMm - steelThickness,
      riserAxisXMm: riserX, localEntryBranches, branchSideEntryPointsXMmZMm: [input.socketCentreZMm, 1100, input.moduleCentreZMm].map(z => [cx - input.boxSizeMm[0] / 2, z]),
      sideEntryBendCentrelineRadiusRequirementMm: c.bendCentrelineRadiusMm, outerBendTerritoryMm: c.bendCentrelineRadiusMm + c.containmentOutsideDiameterMm / 2,
      entryCollarEnvelopeMm: [c.entryCollarOutsideDiameterMm, c.entryCollarAxialLengthMm],
      sourceInterfaceId: 'IAS/STUDY/room-supply-interface', sourceConnectedToCurrentHouseCircuit: false,
      topology: ['Room supply interface (unconnected)', 'Three local side-entry branches; common riser/depth transitions unresolved', 'Fixed socket island and ordinary switch island', 'Factory-enclosed fixed luminaire terminals'],
      switching: 'Ordinary switch in fixed island controls arrival light; dedicated floor-lamp socket control remains manual. Fixed light and sockets must each be identified and locked dead for common service work.',
      limitation: 'Local bend/collar swept-envelope geometry only. Distinct branch depth axes are not a connected common riser; vertical trunk, junctions and depth transitions remain unresolved. Current house has no bound Study feeder/protection/cable specification; no current upstream connection, cable rating, segregation, bend/product acceptance or energisation is inferred.' },
    localHomeRunComparison: deriveLocalHomeRuns(input),
    infill, firstRelease: { withdrawn, parked, sweepPlanMm: sweepPlan, conflictingOccupiedIds: conflicts,
      cradle: { planMm: rest, supportedModuleBottomZMm: c.cradleBottomZMm, jawClearWidthRequirementMm: width, positivelyRetainedUpright: true,
        demandKg: input.moduleMassLimitKg, capacityAndFloorSupportAccepted: false },
      stages: [
        'Keep floor closed. Identify and isolate/prove dead both affected fixed-light and socket circuits; ordinary switch OFF is insufficient.',
        'Latch an independent temporary tether/support before loosening either factory side screw. Follow the Astro body/bracket sequence; do not pull on the supply.',
        'Support and release the fitting body to access factory-enclosed terminals, disconnect there after proof dead; retain the factory earth and strain-relief arrangements. Actual tail/work space requires product trial.',
        'The independent fixed socket/switch islands remain enclosed when decoration alone is removed. An opened luminaire repair enclosure stays locked dead until fully reinstated.',
        'Support the complete module, release four front positive carrier screws, draw normal by the declared stroke, translate to the reserved rest, then lower into the positively retained upright cradle.',
        'Release the separate central decorative infill at its four front screws with support before normal draw; adjacent panels, skirt, door reveal, rails and electrical islands remain fixed.',
        'Reinstate carrier retention, manufacturer bracket/body, connections, earth, strain relief and enclosures; complete required electrical verification before enabling the identified circuits.',
      ] },
    evidence: { prototypeGeometryOnly: true, anchorsAccepted: false, installedCircuitAccepted: false, liveReplacementPermitted: false,
      manufacturerBracketHolePatternConfirmed: false, physicalTrialComplete: false, materialAdmission: false, completeModuleMassQualified: false }, issues,
  } as const
}

/** Three conventional independent home runs eliminate the splitter and depth offset.
 * Ports are authored interface requirements, not qualified HGS06 connections.
 * Arc chords are checked with an outward sagitta bound; no point-only clearance pass.
 */
function deriveLocalHomeRuns(input: LightingCornerDetailInput) {
  const h = input.homeRuns, c = input.construction
  const keys = ['bayWidthMm', 'stationOffsetXMm', 'tubeWallMm', 'routeGapMm', 'lowerPortRearInsetMm', 'maximumClipSpanMm', 'clipEndInsetMm']
  if (!h || Object.keys(h).length !== keys.length || keys.some(k => !Object.hasOwn(h, k))
    || !Object.entries(h).every(([key,n]) => Number.isFinite(n) && (key === 'stationOffsetXMm' || n > 0))
    || h.tubeWallMm * 2 >= c.containmentOutsideDiameterMm) throw new TypeError('IAS_LIGHTING_HOME_RUN_INPUT_INVALID')
  const [,,right,north] = input.bayPlanMm, left = right - h.bayWidthMm, cx = (left + right) / 2 + h.stationOffsetXMm
  const coreY = input.bayPlanMm[1] + input.totalDepthMm, tubeR = c.containmentOutsideDiameterMm / 2
  const collarR = c.entryCollarOutsideDiameterMm / 2, pitch = 2 * tubeR + h.routeGapMm
  const faceBack = input.totalDepthMm - input.decorativeFaceMm
  const carrierDepth = [faceBack - c.steelThicknessMm, faceBack] as const
  const carrierXZ = [cx - input.moduleSizeMm[0] / 2, input.moduleCentreZMm - input.moduleSizeMm[1] / 2,
    cx + input.moduleSizeMm[0] / 2, input.moduleCentreZMm + input.moduleSizeMm[1] / 2] as const
  const z = [input.socketCentreZMm, 1100, input.moduleCentreZMm]
  const boxes = z.map((centre, i) => {
    const front = i === 2 ? carrierDepth[0] - c.steelThicknessMm : input.totalDepthMm
    const rear = front - input.boxSizeMm[2]
    const axis = i === 2 ? (rear + front) / 2 : rear + h.lowerPortRearInsetMm
    return { id: `IAS/STUDY/local-home-runs/enclosure/${i}`, xMm: [cx - input.boxSizeMm[0] / 2, cx + input.boxSizeMm[0] / 2],
      zMm: [centre - input.boxSizeMm[1] / 2, centre + input.boxSizeMm[1] / 2], depthMm: [rear, front],
      entryAxisCoreDepthRequirementMm: axis, actualEntryCoordinatesQualified: false, ordinaryAccessoryFaceRecessMm: i === 2 ? null : 0 }
  })
  const routeIssues: string[] = []
  const routes = boxes.map((box, i) => {
    const radius = c.bendCentrelineRadiusMm + i * pitch, tangentX = box.xMm[0]! - c.entryCollarAxialLengthMm
    const riserX = tangentX - radius, bendStartZ = z[i]! - radius, d = box.entryAxisCoreDepthRequirementMm
    const start = [riserX, coreY - d, input.bottomZMm], bendStart = [riserX, coreY - d, bendStartZ]
    const count = Math.ceil(Math.PI * radius / 4), angleStep = Math.PI / (2 * count)
    const sagitta = radius * (1 - Math.cos(angleStep / 2))
    const arc = Array.from({length: count + 1}, (_, j) => {
      const a = j * angleStep
      return [tangentX - radius * Math.cos(a), coreY - d, bendStartZ + radius * Math.sin(a)]
    })
    const end = [tangentX, coreY - d, z[i]!], entry = [box.xMm[0]!, coreY - d, z[i]!]
    // Exact endpoints retain graph continuity despite floating point cosine(pi/2).
    arc[0] = bendStart; arc[arc.length - 1] = end
    const path = [start, ...arc]
    const segments = path.slice(1).map((b, j) => ({ a: path[j]!, b, radiusMm: tubeR,
      errorMm: j === 0 ? 0 : sagitta, kind: j === 0 ? 'straight' : 'bend' }))
    const collar = { a: end, b: entry, radiusMm: collarR, errorMm: 0, kind: 'collar' }
    const straightLengthMm = bendStartZ - input.bottomZMm
    const intervals = Math.max(1, Math.ceil((straightLengthMm - 2 * h.clipEndInsetMm) / h.maximumClipSpanMm))
    const clips = Array.from({length: intervals + 1}, (_, j) => ({ id: `IAS/STUDY/local-home-runs/${i}/clip/${j}`,
      pointMm: [riserX, coreY - d, input.bottomZMm + h.clipEndInsetMm + j / intervals * (straightLengthMm - 2 * h.clipEndInsetMm)],
      independentlyFixed: true, supportResistanceQualified: false }))
    const reservesMm = { left: riserX - tubeR - left - input.jointMm,
      rear: d - Math.max(tubeR, collarR) - input.fixedBoundaryMm - c.steelThicknessMm - input.jointMm,
      tubeFront: faceBack - d - tubeR - input.jointMm,
      collarFront: (i === 2 ? carrierDepth[0] : input.totalDepthMm) - d - collarR - input.jointMm,
      portRear: d - collarR - box.depthMm[0]! - input.jointMm, portFront: box.depthMm[1]! - d - collarR - input.jointMm,
      straightForClips: straightLengthMm - 2 * h.clipEndInsetMm,
      finalUnsupportedArc: h.maximumClipSpanMm - h.clipEndInsetMm - Math.PI * radius / 2 - c.entryCollarAxialLengthMm }
    const issues = Object.entries(reservesMm).filter(([,v]) => v < -1e-9).map(([key]) => `home-run-${i}-${key}-rejected`)
    routeIssues.push(...issues)
    return { id: `IAS/STUDY/local-home-runs/${i}`, sourceInterfaceId: `IAS/STUDY/local-home-runs/source/${i}`,
      enclosureId: box.id, sourcePointMm: start, actualHouseSupplyConnected: false,
      pathMm: path, segments, collar, clips, bend: { radiusMm: radius, angleDegrees: 90, startMm: bendStart, endMm: end, centreMm: [tangentX,coreY-d,bendStartZ], checkedChordCount: count,
        startUnitTangent: [0,0,1], endUnitTangent: [1,0,0], chordSagittaBoundMm: sagitta },
      straightLengthMm, bendLengthMm: Math.PI * radius / 2, tubeLengthMm: straightLengthMm + Math.PI * radius / 2,
      collarLengthMm: c.entryCollarAxialLengthMm, reservesMm, issues }
  })
  const separations = routes.flatMap((a, i) => routes.slice(i + 1).map(b => ({ routeIds: [a.id,b.id],
    reserveMm: Math.min(...a.segments.concat(a.collar).flatMap(sa => b.segments.concat(b.collar).map(sb =>
      segmentDistance(sa.a,sa.b,sb.a,sb.b) - sa.radiusMm - sb.radiusMm - sa.errorMm - sb.errorMm - 2 * input.jointMm))) })))
  for (const [i, row] of separations.entries()) if (row.reserveMm < -1e-9) routeIssues.push(`home-run-pair-${i}-rejected`)
  const hardLands = [cx - input.moduleSizeMm[0] / 2 + c.boltEdgeMm, cx + input.moduleSizeMm[0] / 2 - c.boltEdgeMm]
    .flatMap(x => [carrierXZ[1] + c.boltEndInsetMm, carrierXZ[3] - c.boltEndInsetMm].map(z => ({
      id: `hard-land/${x}/${z}`, box: [x - c.railWidthMm/2, coreY - carrierDepth[1], z - c.railWidthMm/2,
        c.railWidthMm, carrierDepth[1], c.railWidthMm] })))
  const obstacles = [
    { id: 'independent-carrier-reserved-volume', box: [carrierXZ[0], coreY - carrierDepth[1], carrierXZ[1],
      carrierXZ[2]-carrierXZ[0], carrierDepth[1]-carrierDepth[0], carrierXZ[3]-carrierXZ[1]] }, ...hardLands,
    ...boxes.map(box => ({ id: box.id, box: [box.xMm[0]!,coreY-box.depthMm[1]!,box.zMm[0]!,
      box.xMm[1]!-box.xMm[0]!,box.depthMm[1]!-box.depthMm[0]!,box.zMm[1]!-box.zMm[0]!] })),
  ]
  const obstacleChecks = routes.flatMap(route => obstacles.filter(o => o.id !== route.enclosureId).map(o => ({
    routeId: route.id, obstacleId: o.id, reserveMm: Math.min(...route.segments.concat(route.collar).map(s =>
      segmentBoxDistance(s.a,s.b,o.box)-s.radiusMm-s.errorMm-2*input.jointMm)) })))
  for (const row of obstacleChecks) if (row.reserveMm < -1e-9) routeIssues.push(`${row.routeId}-intersects-${row.obstacleId}`)
  const bayPlanMm = [left,input.bayPlanMm[1],right,north]
  const firstRestPlanMm = [left,input.firstRestPlanMm[1],right,input.firstRestPlanMm[3]]
  const parkedBackY=input.firstRestPlanMm[3]!-c.cradleBackMarginMm
  const parkedModulePlanMm=[carrierXZ[0],parkedBackY-input.completeProjectionMm,carrierXZ[2],parkedBackY]
  const fieldReservesMm={ carrierLeft:carrierXZ[0]-left-input.jointMm, carrierRight:right-carrierXZ[2]-input.jointMm,
    boxesLeft:Math.min(...boxes.map(b=>b.xMm[0]!))-left-input.jointMm, boxesRight:right-Math.max(...boxes.map(b=>b.xMm[1]!))-input.jointMm,
    islandsLeft:cx-c.fixedIslandWidthMm/2-left-input.jointMm, islandsRight:right-cx-c.fixedIslandWidthMm/2-input.jointMm,
    restLeft:parkedModulePlanMm[0]!-firstRestPlanMm[0]!-input.jointMm, restRight:firstRestPlanMm[2]!-parkedModulePlanMm[2]!-input.jointMm,
    restFront:parkedModulePlanMm[1]!-firstRestPlanMm[1]!-input.jointMm, restBack:firstRestPlanMm[3]!-parkedModulePlanMm[3]!-input.jointMm }
  for(const [key,value] of Object.entries(fieldReservesMm)) if(value < -1e-9) routeIssues.push(`home-run-field-${key}-rejected`)
  const moduleSweepPlanMm = [carrierXZ[0], Math.min(input.firstRestPlanMm[3]-c.cradleBackMarginMm-input.completeProjectionMm,
    input.bayPlanMm[1]-input.completeProjectionMm-input.normalDrawMm), carrierXZ[2], input.bayPlanMm[1]]
  const occupiedConflicts = input.occupied.filter(([,b]) => overlap(moduleSweepPlanMm,b) || overlap(firstRestPlanMm,b)).map(([id])=>id)
  if (occupiedConflicts.length) routeIssues.push('home-run-candidate-occupied-conflict')
  const tubeLengthMm = routes.reduce((sum,r)=>sum+r.tubeLengthMm,0), collarLengthMm = routes.reduce((sum,r)=>sum+r.collarLengthMm,0)
  const tubeMassKg = Math.PI * (tubeR**2-(tubeR-h.tubeWallMm)**2)*tubeLengthMm/1e9*c.steelDensityKgM3Comparison
  const collarGrossStockKg = Math.PI * collarR**2 * collarLengthMm/1e9*c.steelDensityKgM3Comparison
  return { schema:'ias-local-home-runs/1', selection:'unselected-development-direction', choices:h,
    status:routeIssues.length?'GEOMETRY_REJECTED':'DECLARED_EXTERNAL_CONTAINMENT_CONTINUOUS', bayPlanMm, firstRestPlanMm, finishBottomZMm:input.bottomZMm-input.jointMm,
    independentRouteSettingMm:input.jointMm, pairSettingMm:2*input.jointMm,
    carrierXZMm:carrierXZ, carrierDepthMm:carrierDepth, parkedModulePlanMm, fieldReservesMm, moduleSweepPlanMm, occupiedConflicts, boxes,
    routes:routes.map(({segments:_checkedSegments,pathMm:_checkedPoints,...route})=>({...route,straight:{startMm:route.sourcePointMm,endMm:route.bend.startMm}})),
    separations, obstacleChecks, issues:routeIssues, sourceInterfaceIds:routes.map(r=>r.sourceInterfaceId),
    topology:'Three separate conventional home runs: socket, ordinary switch and fixed light. No in-corner splitter, shared trunk, through-device route or depth transition.',
    architecturalConsequence:{ additionalBayWidthMm:h.bayWidthMm-(input.bayPlanMm[2]!-input.bayPlanMm[0]!),
      carrierShiftXMm:cx-(input.bayPlanMm[0]!+input.bayPlanMm[2]!)/2, accessoryRecessMm:0,
      addedConservativeFloorTerritoryM2:(h.bayWidthMm-(input.bayPlanMm[2]!-input.bayPlanMm[0]!))*(north-input.bayPlanMm[1]!)/1e6 },
    stock:{ authority:'Known tube and gross collar stock only; cases, rails, clips, fittings, covers and wiring excluded. Not a complete installed mass.',
      tubeLengthMm,collarLengthMm,tubeMassKg,collarGrossStockKg,totalKnownContainmentStockKg:tubeMassKg+collarGrossStockKg,
      clipCount:routes.reduce((sum,r)=>sum+r.clips.length,0),densityKgM3Comparison:c.steelDensityKgM3Comparison },
    evidence:{ geometricContinuity:!routeIssues.length, actualBoxPortsQualified:false, connectorsAndToolsQualified:false,
      actualDeviceTerminalsConnected:false, installedCircuitAccepted:false, materialAdmission:false, physicalTrialComplete:false, ownerAcceptance:false },
    limitations:['The three source ports at the skirt top are explicit unconnected interfaces, not an invented supply or three selected circuits.',
      'Port coordinates are authored requirements within referenced box envelopes; current HGS06 sheet does not qualify them.',
      'Tube walls and gross collars are stock comparisons; actual unions, clips, earthing, thermal/protective design and material admission remain unqualified.',
      'Actual connector release, tools, temporary support and whole-enclosure renewal require qualification before a trial-ready assembly claim.'] }
}
