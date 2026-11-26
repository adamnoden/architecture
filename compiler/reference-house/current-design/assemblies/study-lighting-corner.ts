import { segmentDistance, segmentBoxDistance } from '../../../../project/had/studies/service-interface-geometry.mjs'
/** Local dead-mock-up geometry. Installed circuit, substrate/anchor and material acceptance are separate. */
export interface LocalHomeRunChoices {
  readonly sourceRiseMm:number;readonly bayWidthMm: number; readonly stationOffsetXMm: number; readonly tubeWallMm: number; readonly routeGapMm: number
  readonly lowerPortRearInsetMm: number; readonly maximumClipSpanMm: number; readonly clipEndInsetMm: number
  readonly carrierCentrePlateOffsetXMm: number; readonly minimumResidualMm: number; readonly upperBendClipFraction: number
  readonly additionalCornerDepthMm:number; readonly accessoryExtensionMm:number; readonly upperAccessoryExtensionMm:number;readonly upperCentreOffsetZMm:number;readonly upperBoxBacksetMm:number; readonly upperPortRearInsetMm:number; readonly moduleHandlingSideAllowanceMm:number;readonly moduleHandlingBelowAllowanceMm:number;readonly moduleRestFrontExtensionMm:number;readonly mainRestSouthShiftMm:number; readonly caseRestSizeMm:number;readonly fixedIslandHeightMm:number
}
export interface LightingCornerDetailInput {
  readonly homeRuns: LocalHomeRunChoices
  readonly support: { readonly boxExtension:{readonly baseWidthMm:number;readonly baseHeightMm:number;readonly baseDepthMm:number;readonly extensionDepthMm:number}; readonly saddle: { readonly lengthMm:number; readonly widthMm:number; readonly formedHeightMm:number; readonly standOffMm:number }; readonly driver: { readonly lengthMm:number; readonly maximumDiameterMm:number; readonly bladeLengthMm:number; readonly bladeDiameterMm:number } }
  readonly floorBandsMm:readonly(readonly number[])[]
  readonly bayPlanMm: readonly number[]
  readonly jointMm: number; readonly totalDepthMm: number; readonly fixedBoundaryMm: number; readonly decorativeFaceMm: number
  readonly bottomZMm: number; readonly topZMm: number
  readonly moduleCentreZMm: number; readonly moduleSizeMm: readonly number[]; readonly completeProjectionMm: number
  readonly moduleMassLimitKg: number; readonly socketCentreZMm: number;readonly accessoryBodyDepthMm:number
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
    input.moduleCentreZMm, input.completeProjectionMm, input.moduleMassLimitKg,input.accessoryBodyDepthMm, input.socketCentreZMm, input.normalDrawMm,
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
  const fixedBoxes = [input.socketCentreZMm, 1100, input.moduleCentreZMm+input.homeRuns.upperCentreOffsetZMm].map(z => [cx - input.boxSizeMm[0] / 2, z - input.boxSizeMm[1] / 2, cx + input.boxSizeMm[0] / 2, z + input.boxSizeMm[1] / 2])
  for (let i = 0; i < fixedBoxes.length; i++) for (let j = i + 1; j < fixedBoxes.length; j++) if (overlap(fixedBoxes[i], fixedBoxes[j])) issues.push('fixed-electrical-boxes-overlap')
  const infill = { id: 'IAS/STUDY/service-corner/infill/central', xMm: [cx - half, cx + half], zMm: [c.infillBottomZMm, z0 - c.infillModuleGapMm],
    firstDrawMm: input.normalDrawMm, positiveFrontScrewCount: 4,
    boundary: 'Stopped decoration between fixed electrical islands and light carrier. Retained enclosure/rails remain closed and independently supported.' }
  if (infill.zMm[1] <= infill.zMm[0]) issues.push('no-positive-infill-between-switch-and-module')
  const fixedIslandJoints = [input.socketCentreZMm, 1100, input.moduleCentreZMm+input.homeRuns.upperCentreOffsetZMm].map(z => [cx - c.fixedIslandWidthMm / 2 - input.jointMm, z - c.fixedIslandHeightMm / 2 - input.jointMm, cx + c.fixedIslandWidthMm / 2 + input.jointMm, z + c.fixedIslandHeightMm / 2 + input.jointMm])
  if (fixedIslandJoints.slice(0, 2).some(box => overlap([infill.xMm[0], infill.zMm[0], infill.xMm[1], infill.zMm[1]], box))) issues.push('fixed-electrical-island-intersects-removable-infill')
  // A quarter-circle ends at a straight collar tangent, never at the box wall.
  // Collars occupy axial length outside that wall; the tube occupies its full OD.
  // These are three local entry branches, not an invented connected feeder/riser.
  const boxLeft = cx - input.boxSizeMm[0] / 2
  const collarTangentX = boxLeft - c.entryCollarAxialLengthMm
  const riserX = collarTangentX - c.bendCentrelineRadiusMm
  const tubeRadius = c.containmentOutsideDiameterMm / 2
  const collarRadius = c.entryCollarOutsideDiameterMm / 2
  const localEntryBranches = [input.socketCentreZMm, 1100, input.moduleCentreZMm+input.homeRuns.upperCentreOffsetZMm].map((z, i) => {
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
    fixedEnclosures: [input.socketCentreZMm, 1100, input.moduleCentreZMm+input.homeRuns.upperCentreOffsetZMm].map((z, i) => {
      const boxFrontDepth = i === 2 ? carrierDepth[0] - steelThickness : input.totalDepthMm
      return { id: `IAS/STUDY/service-corner/fixed-island/${i}`,
      bodyXZMm: [cx - input.boxSizeMm[0] / 2, z - input.boxSizeMm[1] / 2, cx + input.boxSizeMm[0] / 2, z + input.boxSizeMm[1] / 2], faceXZMm: [cx - input.plateSizeMm[0] / 2, z - input.plateSizeMm[1] / 2, cx + input.plateSizeMm[0] / 2, z + input.plateSizeMm[1] / 2], bodyDepthMm: [boxFrontDepth - input.boxSizeMm[2], boxFrontDepth],
      requiredDecorativeJointMm: input.jointMm, independentIslandXZMm: [cx - c.fixedIslandWidthMm / 2, z - c.fixedIslandHeightMm / 2, cx + c.fixedIslandWidthMm / 2, z + c.fixedIslandHeightMm / 2],
      sideEntryAxisDepthMm: boxFrontDepth - input.boxSizeMm[2] / 2,
      independentFixedCoverDepthMm: i === 2 ? [boxFrontDepth, carrierDepth[0]] : null,
      clearanceToCarrierDepthMm: i === 2 ? carrierDepth[0] - boxFrontDepth : null,
      independentOfDecoration: true, bodyDepthAuthority: 'Referenced72x72x47mm steel box. Junction box is recessed behind independent fixed cover and carrier; socket/switch islands interrupt decoration locally. Accessory/earth/entries/insulation and product material admission remain required.' } }),
    containment: { outsideDiameterRequirementMm: c.containmentOutsideDiameterMm, localUsableDepthMm: input.totalDepthMm - input.fixedBoundaryMm - input.decorativeFaceMm - steelThickness,
      riserAxisXMm: riserX, localEntryBranches, branchSideEntryPointsXMmZMm: [input.socketCentreZMm, 1100, input.moduleCentreZMm+input.homeRuns.upperCentreOffsetZMm].map(z => [cx - input.boxSizeMm[0] / 2, z]),
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
        'Support the complete fitting/carrier before releasing its manufacturer mounting screws; never pull on its factory lead.',
        'Unplug the prepared fitting from its accessible fixed lighting-only outlet after safe isolation; retain its short flex and fused plug together. Ordinary cassette renewal does not open fitting terminals. Actual grip/lead parking remains unqualified.',
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
 * Ports are authored interface requirements, not qualified manufacturer connections.
 * Arc chords are checked with an outward sagitta bound; no point-only clearance pass.
 */
function deriveLocalHomeRuns(input: LightingCornerDetailInput) {
  const h = input.homeRuns, c = input.construction
  const keys = ['sourceRiseMm','bayWidthMm', 'stationOffsetXMm', 'tubeWallMm', 'routeGapMm', 'lowerPortRearInsetMm', 'maximumClipSpanMm', 'clipEndInsetMm', 'carrierCentrePlateOffsetXMm', 'minimumResidualMm', 'upperBendClipFraction', 'additionalCornerDepthMm', 'accessoryExtensionMm', 'upperBoxBacksetMm', 'upperAccessoryExtensionMm', 'upperCentreOffsetZMm', 'upperPortRearInsetMm', 'mainRestSouthShiftMm', 'moduleRestFrontExtensionMm', 'moduleHandlingSideAllowanceMm', 'moduleHandlingBelowAllowanceMm', 'caseRestSizeMm', 'fixedIslandHeightMm']
  if (!h || Object.keys(h).length !== keys.length || keys.some(k => !Object.hasOwn(h, k))
    || !Object.entries(h).every(([key,n]) => Number.isFinite(n) && ((['stationOffsetXMm','carrierCentrePlateOffsetXMm','upperCentreOffsetZMm'].includes(key)||(['sourceRiseMm','upperBendClipFraction','additionalCornerDepthMm','accessoryExtensionMm','upperAccessoryExtensionMm','upperBoxBacksetMm','mainRestSouthShiftMm','moduleRestFrontExtensionMm','moduleHandlingSideAllowanceMm','moduleHandlingBelowAllowanceMm'].includes(key)&&n>=0)) || n > 0))
    || h.tubeWallMm * 2 >= c.containmentOutsideDiameterMm || h.upperBendClipFraction < 0 || h.upperBendClipFraction >= 1) throw new TypeError('IAS_LIGHTING_HOME_RUN_INPUT_INVALID')
  if(!Array.isArray(input.floorBandsMm)||!input.floorBandsMm.length||input.floorBandsMm.some(b=>b.length!==4||!b.every(Number.isFinite))) throw new TypeError('IAS_LIGHTING_ROOM_FLOOR_REFERENCE_INVALID')
  const floorGeometryValid=!input.floorBandsMm.some((b,i)=>b[2]!<=b[0]!||b[3]!<=b[1]!||input.floorBandsMm.slice(i+1).some(other=>overlap(b,other)))
  const support=input.support
  if(!support || !support.saddle || !support.driver || !support.boxExtension || ![support.boxExtension.baseWidthMm,support.boxExtension.baseHeightMm,support.boxExtension.baseDepthMm,support.boxExtension.extensionDepthMm,support.saddle.lengthMm,support.saddle.widthMm,support.saddle.formedHeightMm,support.saddle.standOffMm,support.driver.lengthMm,support.driver.maximumDiameterMm,support.driver.bladeLengthMm,support.driver.bladeDiameterMm].every(n=>Number.isFinite(n)&&n>0)) throw new TypeError('IAS_LIGHTING_SUPPORT_REFERENCE_INVALID')
  const [,,right,north] = input.bayPlanMm, left = right - h.bayWidthMm, cx = (left + right) / 2 + h.stationOffsetXMm
  const coreY = input.bayPlanMm[1] + input.totalDepthMm, tubeR = c.containmentOutsideDiameterMm / 2
  const collarR = c.entryCollarOutsideDiameterMm / 2, pitch = 2 * tubeR + h.routeGapMm
  const totalDepthMm=input.totalDepthMm+h.additionalCornerDepthMm,frontY=coreY-totalDepthMm
  const faceBack = totalDepthMm - input.decorativeFaceMm
  const carrierDepth = [faceBack - c.steelThicknessMm, faceBack] as const
  const carrierXZ = [cx - input.moduleSizeMm[0] / 2, input.moduleCentreZMm - input.moduleSizeMm[1] / 2,
    cx + input.moduleSizeMm[0] / 2, input.moduleCentreZMm + input.moduleSizeMm[1] / 2] as const
  const half=input.moduleSizeMm[0]/2, rail=c.railWidthMm, zLow=carrierXZ[1], zHigh=carrierXZ[3]
  const centrePlate=[cx+h.carrierCentrePlateOffsetXMm-c.centrePlateWidthMm/2,input.moduleCentreZMm-c.centrePlateHeightMm/2,
    cx+h.carrierCentrePlateOffsetXMm+c.centrePlateWidthMm/2,input.moduleCentreZMm+c.centrePlateHeightMm/2]
  const carrierStripsXZMm=[
    [cx-half,zLow,cx-half+rail,zHigh],[cx+half-rail,zLow,cx+half,zHigh],
    [cx-half+rail,zLow,cx+half-rail,zLow+rail],[cx-half+rail,zHigh-rail,cx+half-rail,zHigh],centrePlate,
    [cx-half+rail,input.moduleCentreZMm-c.crossbarCentreOffsetMm-rail/2,cx+half-rail,input.moduleCentreZMm-c.crossbarCentreOffsetMm+rail/2],
    [cx-half+rail,input.moduleCentreZMm+c.crossbarCentreOffsetMm-rail/2,cx+half-rail,input.moduleCentreZMm+c.crossbarCentreOffsetMm+rail/2],
  ]
  const cableOpening={centreXMm:cx,centreZMm:input.moduleCentreZMm,diameterMm:c.containmentOutsideDiameterMm,
    minimumPlateEdgeReserveMm:Math.min(cx-tubeR-centrePlate[0],centrePlate[2]-cx-tubeR,input.moduleCentreZMm-tubeR-centrePlate[1],centrePlate[3]-input.moduleCentreZMm-tubeR)-input.jointMm}
  const z = [input.socketCentreZMm, 1100, input.moduleCentreZMm+h.upperCentreOffsetZMm]
  const boxes = z.map((centre, i) => {
    const front = totalDepthMm-h.accessoryExtensionMm-(i===2?h.upperBoxBacksetMm:0)
    const rear = front - input.boxSizeMm[2]
    const axis = rear+(i===2?h.upperPortRearInsetMm:h.lowerPortRearInsetMm)
    return { id: `IAS/STUDY/local-home-runs/enclosure/${i}`, xMm: [cx - input.boxSizeMm[0] / 2, cx + input.boxSizeMm[0] / 2],
      zMm: [centre - input.boxSizeMm[1] / 2, centre + input.boxSizeMm[1] / 2], depthMm: [rear, front],
      fixedIslandXZMm:[cx-c.fixedIslandWidthMm/2,centre-h.fixedIslandHeightMm/2,cx+c.fixedIslandWidthMm/2,centre+h.fixedIslandHeightMm/2],
      extensionDepthMm:i===2?h.upperAccessoryExtensionMm:h.accessoryExtensionMm,closedCoverDepthMm:i===2&&h.upperAccessoryExtensionMm===0?[front,front+c.steelThicknessMm]:null,
      entryAxisCoreDepthRequirementMm: axis, actualEntryCoordinatesQualified: false, ordinaryAccessoryFaceRecessMm: i === 2 && h.upperAccessoryExtensionMm===0 ? null : 0 }
  })
  const routeIssues: string[] = []
  if(!floorGeometryValid)routeIssues.push('home-run-room-floor-geometry-invalid')
  if(input.boxSizeMm[0]!==support.boxExtension.baseWidthMm||input.boxSizeMm[1]!==support.boxExtension.baseHeightMm||input.boxSizeMm[2]!==support.boxExtension.baseDepthMm)routeIssues.push('home-run-manufactured-base-envelope-unsupported')
  if([h.accessoryExtensionMm,h.upperAccessoryExtensionMm].some(n=>n!==0&&n!==support.boxExtension.extensionDepthMm))routeIssues.push('home-run-manufactured-extension-depth-unsupported')
  const routes = boxes.map((box, i) => {
    const radius = c.bendCentrelineRadiusMm + i * pitch, tangentX = box.xMm[0]! - c.entryCollarAxialLengthMm
    const riserX = tangentX - radius, bendStartZ = z[i]! - radius, d = box.entryAxisCoreDepthRequirementMm
    const bottomZMm=input.bottomZMm+h.sourceRiseMm
    const start = [riserX, coreY - d, bottomZMm], bendStart = [riserX, coreY - d, bendStartZ]
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
    const straightLengthMm = bendStartZ - bottomZMm
    const intervals = Math.max(1, Math.ceil((straightLengthMm - 2 * h.clipEndInsetMm) / h.maximumClipSpanMm))
    const clips = Array.from({length: intervals + 1}, (_, j) => ({ id: `IAS/STUDY/local-home-runs/${i}/clip/${j}`,
      pointMm: [riserX, coreY - d, bottomZMm + h.clipEndInsetMm + j / intervals * (straightLengthMm - 2 * h.clipEndInsetMm)],
      independentlyFixed: true, supportResistanceQualified: false }))
    const bendClipFraction=i===2?h.upperBendClipFraction:0
    const bendClipAngle=bendClipFraction*Math.PI/2
    const bendClip=bendClipFraction>0?{id:`IAS/STUDY/local-home-runs/${i}/clip/bend`,
      pointMm:[tangentX-radius*Math.cos(bendClipAngle),coreY-d,bendStartZ+radius*Math.sin(bendClipAngle)],
      independentlyFixed:true,supportResistanceQualified:false}:null
    const finalSpansMm=bendClip?[h.clipEndInsetMm+bendClipFraction*Math.PI*radius/2,(1-bendClipFraction)*Math.PI*radius/2+c.entryCollarAxialLengthMm]
      :[h.clipEndInsetMm+Math.PI*radius/2+c.entryCollarAxialLengthMm]
    const reservesMm = { left: riserX - tubeR - left - input.jointMm,
      rear: d - Math.max(tubeR, collarR) - input.fixedBoundaryMm - c.steelThicknessMm - input.jointMm,
      tubeFront: faceBack - d - tubeR - 2*input.jointMm,
      collarFront: (i === 2 ? carrierDepth[0] : totalDepthMm) - d - collarR - 2*input.jointMm,
      portRear: d - collarR - box.depthMm[0]! - input.jointMm, portFront: box.depthMm[1]! - d - collarR - input.jointMm,
      straightForClips: straightLengthMm - 2 * h.clipEndInsetMm,
      finalUnsupportedArc: h.maximumClipSpanMm-Math.max(...finalSpansMm) }
    const issues = Object.entries(reservesMm).filter(([key,v]) => v < (['left','rear','collarFront'].includes(key)?h.minimumResidualMm:0)-1e-9).map(([key]) => `home-run-${i}-${key}-rejected`)
    routeIssues.push(...issues)
    return { id: `IAS/STUDY/local-home-runs/${i}`, sourceInterfaceId: `IAS/STUDY/local-home-runs/source/${i}`,
      enclosureId: box.id, sourcePointMm: start, actualHouseSupplyConnected: false,
      pathMm: path, segments, collar, clips:bendClip?[...clips,bendClip]:clips, finalSpansMm, bendClip, bend: { radiusMm: radius, angleDegrees: 90, startMm: bendStart, endMm: end, centreMm: [tangentX,coreY-d,bendStartZ], checkedChordCount: count,
        startUnitTangent: [0,0,1], endUnitTangent: [1,0,0], chordSagittaBoundMm: sagitta },
      straightLengthMm, bendLengthMm: Math.PI * radius / 2, tubeLengthMm: straightLengthMm + Math.PI * radius / 2,
      collarLengthMm: c.entryCollarAxialLengthMm, reservesMm, issues }
  })
  const separations = routes.flatMap((a, i) => routes.slice(i + 1).map(b => ({ routeIds: [a.id,b.id],
    reserveMm: Math.min(...a.segments.concat(a.collar).flatMap(sa => b.segments.concat(b.collar).map(sb =>
      segmentDistance(sa.a,sa.b,sb.a,sb.b) - sa.radiusMm - sb.radiusMm - sa.errorMm - sb.errorMm - 2 * input.jointMm))) })))
  for (const [i, row] of separations.entries()) if (row.reserveMm < h.minimumResidualMm-1e-9) routeIssues.push(`home-run-pair-${i}-rejected`)
  const hardLands = [cx - input.moduleSizeMm[0] / 2 + c.boltEdgeMm, cx + input.moduleSizeMm[0] / 2 - c.boltEdgeMm]
    .flatMap(x => [carrierXZ[1] + c.boltEndInsetMm, carrierXZ[3] - c.boltEndInsetMm].map(z => ({
      id: `hard-land/${x}/${z}`, box: [x - c.railWidthMm/2, coreY - carrierDepth[1], z - c.railWidthMm/2,
        c.railWidthMm, carrierDepth[1], c.railWidthMm] })))
  const obstacles = [
    ...carrierStripsXZMm.map((r,i)=>({id:`carrier-stock/${i}`,box:[r[0],coreY-carrierDepth[1],r[1],r[2]-r[0],c.steelThicknessMm,r[3]-r[1]]})),...hardLands,
    ...boxes.map(box => ({ id: box.id, box: [box.xMm[0]!,coreY-box.depthMm[1]!,box.zMm[0]!,
      box.xMm[1]!-box.xMm[0]!,box.depthMm[1]!-box.depthMm[0]!,box.zMm[1]!-box.zMm[0]!] })),
  ]
  const obstacleChecks = routes.flatMap(route => obstacles.filter(o => o.id !== route.enclosureId).map(o => ({
    routeId: route.id, obstacleId: o.id, reserveMm: Math.min(...route.segments.concat(route.collar).map(s =>
      segmentBoxDistance(s.a,s.b,o.box)-s.radiusMm-s.errorMm-2*input.jointMm)) })))
  for (const row of obstacleChecks) if (row.reserveMm < h.minimumResidualMm-1e-9) routeIssues.push(`${row.routeId}-intersects-${row.obstacleId}`)
  if(cableOpening.minimumPlateEdgeReserveMm<h.minimumResidualMm-1e-9) routeIssues.push('home-run-carrier-cable-edge-reserve-rejected')
  const bayPlanMm = [left,frontY,right,north]
  const firstRestPlanMm = [left,input.firstRestPlanMm[1]!-h.mainRestSouthShiftMm-h.moduleRestFrontExtensionMm,right,input.firstRestPlanMm[3]!-h.mainRestSouthShiftMm]
  const moduleHandlingXZMm=[carrierXZ[0]!-h.moduleHandlingSideAllowanceMm,carrierXZ[1]!-h.moduleHandlingBelowAllowanceMm,carrierXZ[2]!+h.moduleHandlingSideAllowanceMm,carrierXZ[3]!] as const
  const parkedBackY=firstRestPlanMm[3]!-c.cradleBackMarginMm
  const parkedModulePlanMm=[moduleHandlingXZMm[0],parkedBackY-input.completeProjectionMm,moduleHandlingXZMm[2],parkedBackY]
  const fieldReservesMm={ carrierLeft:carrierXZ[0]-left-input.jointMm, carrierRight:right-carrierXZ[2]-input.jointMm,
    boxesLeft:Math.min(...boxes.map(b=>b.xMm[0]!))-left-input.jointMm, boxesRight:right-Math.max(...boxes.map(b=>b.xMm[1]!))-input.jointMm,
    islandsLeft:cx-c.fixedIslandWidthMm/2-left-input.jointMm, islandsRight:right-cx-c.fixedIslandWidthMm/2-input.jointMm,
    restLeft:parkedModulePlanMm[0]!-firstRestPlanMm[0]!-input.jointMm, restRight:firstRestPlanMm[2]!-parkedModulePlanMm[2]!-input.jointMm,
    restFront:parkedModulePlanMm[1]!-firstRestPlanMm[1]!-input.jointMm, restBack:firstRestPlanMm[3]!-parkedModulePlanMm[3]!-input.jointMm }
  for(const [key,value] of Object.entries(fieldReservesMm)) if(value < h.minimumResidualMm-1e-9) routeIssues.push(`home-run-field-${key}-rejected`)
  const moduleSweepPlanMm = [moduleHandlingXZMm[0], Math.min(parkedBackY-input.completeProjectionMm,
    frontY-input.completeProjectionMm-input.normalDrawMm),moduleHandlingXZMm[2],frontY]
  const occupiedConflicts = input.occupied.filter(([,b]) => overlap(moduleSweepPlanMm,b) || overlap(firstRestPlanMm,b)).map(([id])=>id)
  if (occupiedConflicts.length) routeIssues.push('home-run-candidate-occupied-conflict')
  const upper=routes[2]!, p=upper.bendClip?.pointMm
  const saddle=p&&coreY-p[1]!-tubeR-support.saddle.standOffMm>0?(()=>{
    const a=h.upperBendClipFraction*Math.PI/2, tangent=[Math.sin(a),Math.cos(a)], transverse=[-Math.cos(a),Math.sin(a)]
    const halfX=Math.abs(transverse[0])*support.saddle.lengthMm/2+Math.abs(tangent[0])*support.saddle.widthMm/2
    const halfZ=Math.abs(transverse[1])*support.saddle.lengthMm/2+Math.abs(tangent[1])*support.saddle.widthMm/2
    const axisDepth=coreY-p[1]!, baseDepth=axisDepth-tubeR-support.saddle.standOffMm
    const bodyBox=[p[0]!-halfX,coreY-baseDepth-support.saddle.formedHeightMm,p[2]!-halfZ,2*halfX,support.saddle.formedHeightMm,2*halfZ]
    const receiverBox=[p[0]!-support.saddle.widthMm/2,coreY-baseDepth,p[2]!-support.saddle.widthMm/2,support.saddle.widthMm,baseDepth,support.saddle.widthMm]
    const tip=[p[0]!,coreY-baseDepth,p[2]!], toolEnd=[p[0]!,coreY-baseDepth-support.driver.lengthMm,p[2]!]
    const boxDistance=(a:readonly number[],b:readonly number[])=>Math.hypot(...[0,1,2].map(i=>Math.max(a[i]!-(b[i]!+b[i+3]!),b[i]!-(a[i]!+a[i+3]!),0)))
    const occupiedObstacles=[...obstacles,...input.occupied.map(([id,b])=>({id:`occupied/${id}`,box:[b[0],b[1],0,b[2]-b[0],b[3]-b[1],input.ceilingZMm]})),
      {id:'parked-complete-module',box:[parkedModulePlanMm[0]!,parkedModulePlanMm[1]!,c.cradleBottomZMm-h.moduleHandlingBelowAllowanceMm,parkedModulePlanMm[2]!-parkedModulePlanMm[0]!,parkedModulePlanMm[3]!-parkedModulePlanMm[1]!,input.moduleSizeMm[1]!+h.moduleHandlingBelowAllowanceMm]}]
    const bodyChecks=occupiedObstacles.map(o=>({obstacleId:o.id,reserveMm:boxDistance(bodyBox,o.box)-2*input.jointMm}))
    const receiverChecks=occupiedObstacles.map(o=>({obstacleId:o.id,reserveMm:boxDistance(receiverBox,o.box)-2*input.jointMm}))
    const toolChecks=occupiedObstacles.map(o=>({obstacleId:o.id,reserveMm:segmentBoxDistance(tip,toolEnd,o.box)-support.driver.maximumDiameterMm/2-2*input.jointMm}))
    const otherRouteChecks=routes.filter(r=>r.id!==upper.id).map(r=>({routeId:r.id,reserveMm:Math.min(...r.segments.concat(r.collar).map(s=>segmentBoxDistance(s.a,s.b,bodyBox)-s.radiusMm-s.errorMm-2*input.jointMm))}))
    const fieldReserveMm=Math.min(bodyBox[0]!-left,right-bodyBox[0]!-bodyBox[3]!,bodyBox[2]!-input.bottomZMm,input.topZMm-bodyBox[2]!-bodyBox[5]!,faceBack-(baseDepth+support.saddle.formedHeightMm))-input.jointMm
    const sourceQualifiedForBend=false
    return {id:upper.bendClip!.id,pointMm:p,reference:'D-Line SAFE-DCOND20 dimensional witness',bodyBox,receiverBox,tool:{reference:'Wera355PZ05009315001',tipMm:tip,endMm:toolEnd,maximumDiameterMm:support.driver.maximumDiameterMm,
      phase:'Remove the named local decorative cover while fixed electrical enclosures stay closed. Base fastening occurs before tube placement, or after isolated separately supported tube release. No tool-through-tube operation or loaded human qualification is claimed.'},
      bodyChecks,receiverChecks,toolChecks,otherRouteChecks,fieldReserveMm,sourceQualifiedForBend,
      receiverSteelStockKg:receiverBox[3]!*receiverBox[4]!*receiverBox[5]!/1e9*c.steelDensityKgM3Comparison,
      supportPath:{coreContactPointMm:[p[0]!,coreY,p[2]!],masonryToSaddleDepthMm:[0,baseDepth],protectedPlaneDepthMm:input.fixedBoundaryMm,
        path:'Saddle base screw to continuous20mm square steel hard land seated at actual masonry core0; the land crosses the protected plane in its own sealed collar. Board/air plane carries no support load.',anchorEmbedmentQualified:false,penetrationSealQualified:false},
      limits:'Whole manufacturer envelope and actual hand-tool envelope are charged. Bend use, anchor/substrate, tab release, complete clip mass and human/loaded handling remain unqualified.'}
  })():null
  if(p&&!saddle)routeIssues.push('home-run-saddle-support-depth-rejected')
  if(saddle){
    if(saddle.fieldReserveMm<h.minimumResidualMm-1e-9) routeIssues.push('home-run-bend-saddle-field-rejected')
    for(const [kind,checks] of [['body',saddle.bodyChecks],['receiver',saddle.receiverChecks],['tool',saddle.toolChecks],['other-route',saddle.otherRouteChecks]] as const)
      if(checks.some(r=>r.reserveMm<h.minimumResidualMm-1e-9)) routeIssues.push(`home-run-bend-saddle-${kind}-rejected`)
  }
  const carrierStockRows=carrierStripsXZMm.map((r,i)=>{
    const massKg=(r[2]-r[0])*(r[3]-r[1])*c.steelThicknessMm/1e9*c.steelDensityKgM3Comparison
    const x=(r[0]+r[2])/2,z=(r[1]+r[3])/2,depth=(carrierDepth[0]+carrierDepth[1])/2
    return {id:`carrier-stock/${i}`,massKg,originMm:[x,coreY-depth,z],wrenchAboutCoreCentreNAndNm:[0,0,-massKg*9.81,massKg*9.81*depth/1000,massKg*9.81*(x-cx)/1000,0]}
  })
  const carrierStock={rows:carrierStockRows,massKgUpperComparison:carrierStockRows.reduce((sum,r)=>sum+r.massKg,0),
    wrenchAboutCoreCentreNAndNm:[0,1,2,3,4,5].map(i=>carrierStockRows.reduce((sum,r)=>sum+r.wrenchAboutCoreCentreNAndNm[i]!,0)),
    note:'Overlap stock and opening are charged in full; actual fabricated mass and complete module CG remain unqualified. This stock is already within the3kg complete-module budget and is not another3kg load.'}
  const caseDrawClearanceMm=3*input.jointMm+h.minimumResidualMm
  const caseRestPlanMm=[cx-h.caseRestSizeMm/2,frontY-input.jointMm-h.caseRestSizeMm,cx+h.caseRestSizeMm/2,frontY-input.jointMm]
  const boxDistance=(a:readonly number[],b:readonly number[])=>Math.hypot(...[0,1,2].map(i=>Math.max(a[i]!-(b[i]!+b[i+3]!),b[i]!-(a[i]!+a[i+3]!),0)))
  const inFloor=(r:readonly number[])=>{
    if(!floorGeometryValid)return false
    const e=[r[0]!-input.jointMm,r[1]!-input.jointMm,r[2]!+input.jointMm,r[3]!+input.jointMm]
    const area=input.floorBandsMm.reduce((sum,b)=>sum+Math.max(0,Math.min(e[2]!,b[2]!)-Math.max(e[0]!,b[0]!))*Math.max(0,Math.min(e[3]!,b[3]!)-Math.max(e[1]!,b[1]!)),0)
    return Math.abs(area-(e[2]!-e[0]!)*(e[3]!-e[1]!))<1e-6
  }
  if(!inFloor(firstRestPlanMm)||!inFloor(caseRestPlanMm))routeIssues.push('home-run-rest-outside-supported-room-floor')
  const caseRenewal=boxes.map((box,i)=>{
    const outerWidth=Math.max(input.boxSizeMm[0]!,input.plateSizeMm[0]!),outerHeight=Math.max(input.boxSizeMm[1]!,input.plateSizeMm[1]!)
    const front=box.closedCoverDepthMm?.[1]??totalDepthMm
    const drawMm=totalDepthMm-box.depthMm[0]!+caseDrawClearanceMm
    const withdrawnPlanMm=[cx-outerWidth/2,coreY-front-drawMm,cx+outerWidth/2,coreY-box.depthMm[0]!-drawMm]
    const body=[withdrawnPlanMm[0]!,withdrawnPlanMm[1]!,c.cradleBottomZMm,outerWidth,front-box.depthMm[0]!,outerHeight]
    const restReservesMm={left:withdrawnPlanMm[0]!-caseRestPlanMm[0]!-2*input.jointMm,right:caseRestPlanMm[2]!-withdrawnPlanMm[2]!-2*input.jointMm,
      front:withdrawnPlanMm[1]!-caseRestPlanMm[1]!-2*input.jointMm,back:caseRestPlanMm[3]!-withdrawnPlanMm[3]!-2*input.jointMm,
      moduleCradle:caseRestPlanMm[1]!-firstRestPlanMm[3]!-2*input.jointMm,
      mouthWidth:(c.fixedIslandWidthMm-outerWidth)/2-2*input.jointMm,mouthHeight:(h.fixedIslandHeightMm-outerHeight)/2-2*input.jointMm}
    // At the held withdrawal plane the complete case lowers vertically, clear
    // of every other fixed front and both actual temporary support footprints.
    const initialLowZ=z[i]!-outerHeight/2
    const normalSweepBox=[cx-outerWidth/2,withdrawnPlanMm[1]!,initialLowZ,outerWidth,coreY-box.depthMm[0]!-withdrawnPlanMm[1]!,outerHeight]
    const lowerSweepBox=[cx-outerWidth/2,withdrawnPlanMm[1]!,Math.min(c.cradleBottomZMm,initialLowZ),outerWidth,front-box.depthMm[0]!,Math.max(z[i]!+outerHeight/2,c.cradleBottomZMm+outerHeight)-Math.min(c.cradleBottomZMm,initialLowZ)]
    const retained=[...hardLands,...boxes.filter(b=>b.id!==box.id).map(b=>({id:b.id,box:[b.xMm[0]!-7,coreY-(b.closedCoverDepthMm?.[1]??totalDepthMm),b.zMm[0]!-7,86,(b.closedCoverDepthMm?.[1]??totalDepthMm)-b.depthMm[0]!,86]})),
      ...input.occupied.map(([id,b])=>({id:`occupied/${id}`,box:[b[0],b[1],0,b[2]-b[0],b[3]-b[1],input.ceilingZMm]})),
      {id:'module-first-rest',box:[firstRestPlanMm[0]!,firstRestPlanMm[1]!,0,firstRestPlanMm[2]!-firstRestPlanMm[0]!,firstRestPlanMm[3]!-firstRestPlanMm[1]!,c.cradleBottomZMm]},
      {id:'parked-module',box:[parkedModulePlanMm[0]!,parkedModulePlanMm[1]!,c.cradleBottomZMm-h.moduleHandlingBelowAllowanceMm,parkedModulePlanMm[2]!-parkedModulePlanMm[0]!,parkedModulePlanMm[3]!-parkedModulePlanMm[1]!,input.moduleSizeMm[1]!+h.moduleHandlingBelowAllowanceMm]}]
    // The86mm face does not occupy the whole47mm box depth. Keep the
    // actual72mm base/extension and the full86x86x23mm device shadow separate;
    // otherwise a coarse overall prism invents a collision with the own tube.
    const parts=[{id:'base',width:input.boxSizeMm[0]!,height:input.boxSizeMm[1]!,rear:box.depthMm[0]!,front:box.depthMm[1]!},
      ...(box.extensionDepthMm?[{id:'extension',width:input.boxSizeMm[0]!,height:input.boxSizeMm[1]!,rear:box.depthMm[1]!,front:totalDepthMm}]:[]),
      {id:box.closedCoverDepthMm?'closed-cover':'device-shadow',width:outerWidth,height:outerHeight,rear:box.closedCoverDepthMm?.[0]??(totalDepthMm-input.accessoryBodyDepthMm),front}]
    const finalShift=c.cradleBottomZMm-initialLowZ
    const sweeps=parts.flatMap(part=>{
      const low=z[i]!-part.height/2, high=z[i]!+part.height/2, y=coreY-part.front-drawMm
      return [{phase:'normal-draw',partId:part.id,box:[cx-part.width/2,y,low,part.width,coreY-part.rear-y,part.height]},
        {phase:'lower-to-rest',partId:part.id,box:[cx-part.width/2,y,Math.min(low,low+finalShift),part.width,part.front-part.rear,Math.max(high,high+finalShift)-Math.min(low,low+finalShift)]}]
    })
    const sweptBodyChecks=sweeps.flatMap(sweep=>retained.map(o=>({phase:sweep.phase,partId:sweep.partId,obstacleId:o.id,reserveMm:boxDistance(sweep.box,o.box)-2*input.jointMm})))
    const pipeChecks=sweeps.flatMap(sweep=>routes.map(r=>({phase:sweep.phase,partId:sweep.partId,routeId:r.id,
      ownCollarExcluded:sweep.phase==='normal-draw'&&r.enclosureId===box.id,
      reserveMm:Math.min(...[...r.segments,...(sweep.phase==='normal-draw'&&r.enclosureId===box.id?[]:[r.collar])].map(s=>segmentBoxDistance(s.a,s.b,sweep.box)-s.radiusMm-s.errorMm-2*input.jointMm))})))
    if([...sweptBodyChecks,...pipeChecks].some(c=>c.reserveMm<h.minimumResidualMm-1e-9))routeIssues.push(`home-run-case-${i}-sweep-rejected`)
    const occupying=input.occupied.filter(([,b])=>overlap(withdrawnPlanMm,b)||overlap(caseRestPlanMm,b)).map(([id])=>id)
    if(Object.entries(restReservesMm).some(([key,v])=>v<h.minimumResidualMm-1e-9)||occupying.length) routeIssues.push(`home-run-case-${i}-renewal-space-rejected`)
    return {id:box.id,completeSizeMm:[outerWidth,front-box.depthMm[0]!,outerHeight],normalDrawMm:drawMm,withdrawnPlanMm,restReservesMm,occupying,
      parkedBodyBox:body,normalOverallSweepBox:normalSweepBox,lowerOverallSweepBox:lowerSweepBox,parts,checkedPartSweeps:sweeps,sweptBodyChecks,pipeChecks,
      ownConnectionRelease:'Own mating collar is excluded only from normal draw after qualified release; that release interface remains unqualified, so this is not an installed renewal pass.',sourceConnectionsQualified:false,completeMassAndRestCapacityQualified:false,
      operation:'Unplug corner portable loads; isolate/prove dead; park supported fitting/module first; qualified joints must release before normal case draw. Place separate small cradle only after the module is parked; lower the case in its clear withdrawal plane. Remove case cradle before refitting module.'}
  })
  const enclosureCarrierChecks=boxes.flatMap(b=>carrierStripsXZMm.map((r,i)=>({boxId:b.id,carrierStrip:i,
    reserveMm:boxDistance([b.xMm[0]!-7,coreY-(b.closedCoverDepthMm?.[1]??totalDepthMm),b.zMm[0]!-7,86,(b.closedCoverDepthMm?.[1]??totalDepthMm)-b.depthMm[0]!,86],
      [r[0]!,coreY-carrierDepth[1]!,r[1]!,r[2]!-r[0]!,carrierDepth[1]!-carrierDepth[0]!,r[3]!-r[1]!])-2*input.jointMm})))
  if(enclosureCarrierChecks.some(r=>r.reserveMm<h.minimumResidualMm-1e-9))routeIssues.push('home-run-closed-cover-carrier-reserve-rejected')
  const extensionStockRows=boxes.filter(b=>b.extensionDepthMm>0).map(b=>{
    const wall=c.steelThicknessMm,w=support.boxExtension.baseWidthMm,height=support.boxExtension.baseHeightMm
    const massKg=(w*height-(w-2*wall)*(height-2*wall))*b.extensionDepthMm/1e9*c.steelDensityKgM3Comparison
    const depth=(b.depthMm[1]!+totalDepthMm)/2
    return {id:`${b.id}/extension-stock`,massKgComparison:massKg,originMm:[cx,coreY-depth,(b.zMm[0]!+b.zMm[1]!)/2],
      wrenchAboutCoreCentreNAndNm:[0,0,-massKg*9.81,massKg*9.81*depth/1000,0,0],
      authority:'2mm wall stock comparison for nominal72mm steel frame; actual supplied gauge, lugs, fixings, mass and constituents remain unqualified.'}
  })
  const extensionStockKg=extensionStockRows.reduce((sum,r)=>sum+r.massKgComparison,0)
  const tubeLengthMm = routes.reduce((sum,r)=>sum+r.tubeLengthMm,0), collarLengthMm = routes.reduce((sum,r)=>sum+r.collarLengthMm,0)
  const tubeMassKg = Math.PI * (tubeR**2-(tubeR-h.tubeWallMm)**2)*tubeLengthMm/1e9*c.steelDensityKgM3Comparison
  const collarGrossStockKg = Math.PI * collarR**2 * collarLengthMm/1e9*c.steelDensityKgM3Comparison
  return { schema:'ias-local-home-runs/2', selection:'unselected-development-direction', choices:h,
    status:routeIssues.length?'GEOMETRY_REJECTED':'DECLARED_EXTERNAL_CONTAINMENT_CONTINUOUS', bayPlanMm, firstRestPlanMm, finishBottomZMm:input.bottomZMm-input.jointMm,finishTopZMm:input.topZMm,
    totalDepthMm,conduitInsideDiameterMm:c.containmentOutsideDiameterMm-2*h.tubeWallMm,frontYMm:frontY,independentRouteSettingMm:input.jointMm, pairSettingMm:2*input.jointMm,
    moduleHandlingXZMm,carrierXZMm:carrierXZ, carrierDepthMm:carrierDepth,carrierStripsXZMm,cableOpening,carrierStock,saddle,caseRestPlanMm,caseRenewal,enclosureCarrierChecks, parkedModulePlanMm, fieldReservesMm, moduleSweepPlanMm, occupiedConflicts, boxes,
    routes:routes.map(({segments:_checkedSegments,pathMm:_checkedPoints,...route})=>({...route,straight:{startMm:route.sourcePointMm,endMm:route.bend.startMm}})),
    separations, obstacleChecks, issues:routeIssues, sourceInterfaceIds:routes.map(r=>r.sourceInterfaceId),
    residualGeometryWarnings:routes.flatMap(r=>Object.entries(r.reservesMm).filter(([k,v])=>['left','rear','collarFront','tubeFront','portRear','portFront'].includes(k)&&v<h.minimumResidualMm).map(([boundary,reserveMm])=>({routeId:r.id,boundary,reserveMm,status:'UNQUALIFIED_COMPONENT_OR_LINING_INTERFACE'}))),
    topology:'Three separate conventional home runs: socket, ordinary switch and fixed light. No in-corner splitter, shared trunk, through-device route or depth transition.',
    architecturalConsequence:{ additionalBayWidthMm:h.bayWidthMm-(input.bayPlanMm[2]!-input.bayPlanMm[0]!),
      carrierShiftXMm:cx-(input.bayPlanMm[0]!+input.bayPlanMm[2]!)/2, accessoryRecessMm:0,
      addedConservativeFloorTerritoryM2:(h.bayWidthMm-(input.bayPlanMm[2]!-input.bayPlanMm[0]!))*(north-input.bayPlanMm[1]!)/1e6+h.bayWidthMm*h.additionalCornerDepthMm/1e6 },
    stock:{ authority:'Known tube and gross collar stock only; cases, rails, clips, fittings, covers and wiring excluded. Not a complete installed mass.',
      tubeLengthMm,collarLengthMm,tubeMassKg,collarGrossStockKg,totalKnownContainmentStockKg:tubeMassKg+collarGrossStockKg,
      clipCount:routes.reduce((sum,r)=>sum+r.clips.length,0),densityKgM3Comparison:c.steelDensityKgM3Comparison,
      extensionStockRows,extensionStockKgComparison:extensionStockKg,separateKnownSaddleReceiverStockKg:saddle?.receiverSteelStockKg??0,
      knownTubeCollarAndReceiverStockKg:tubeMassKg+collarGrossStockKg+(saddle?.receiverSteelStockKg??0),
      tubeCollarReceiverAndExtensionStockKgComparison:tubeMassKg+collarGrossStockKg+(saddle?.receiverSteelStockKg??0)+extensionStockKg },
    evidence:{ geometricContinuity:!routeIssues.length, actualBoxPortsQualified:false, connectorsAndToolsQualified:false,
      actualDeviceTerminalsConnected:false, installedCircuitAccepted:false, materialAdmission:false, physicalTrialComplete:false, ownerAcceptance:false },
    limitations:['Standalone containment geometry; the integrated circuit binds specified sourcebox/nets. Actual installed connections remain unearned.',
      'Port coordinates are authored requirements within the nominalBarton base/extension envelopes; the catalogue does not qualify actual port coordinates or assembled connections.',
      'Tube walls and gross collars are stock comparisons; actual unions, clips, earthing, thermal/protective design and material admission remain unqualified.',
      'Actual connector release, tools, temporary support and whole-enclosure renewal require qualification before a trial-ready assembly claim.'] }
}
