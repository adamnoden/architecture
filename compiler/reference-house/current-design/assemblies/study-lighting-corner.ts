/** Local dead-mock-up geometry. Installed circuit, substrate/anchor and material acceptance are separate. */
export interface LightingCornerDetailInput {
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
      riserAxisXMm: cx - input.boxSizeMm[0] / 2 - c.bendCentrelineRadiusMm, branchSideEntryPointsXMmZMm: [input.socketCentreZMm, 1100, input.moduleCentreZMm].map(z => [cx - input.boxSizeMm[0] / 2, z]),
      sideEntryBendCentrelineRadiusRequirementMm: c.bendCentrelineRadiusMm, outerBendTerritoryMm: c.bendCentrelineRadiusMm + c.containmentOutsideDiameterMm / 2,
      entryCollarEnvelopeMm: [c.entryCollarOutsideDiameterMm, c.entryCollarAxialLengthMm],
      sourceInterfaceId: 'IAS/STUDY/room-supply-interface', sourceConnectedToCurrentHouseCircuit: false,
      topology: ['Room supply interface (unconnected)', 'Independent enclosed riser', 'Fixed socket island and ordinary switch island', 'Factory-enclosed fixed luminaire terminals'],
      switching: 'Ordinary switch in fixed island controls arrival light; dedicated floor-lamp socket control remains manual. Fixed light and sockets must each be identified and locked dead for common service work.',
      limitation: 'Geometric routing requirements only. Current house has no bound Study feeder/protection/cable specification; no current upstream connection, cable rating, segregation, bend/product acceptance or energisation is inferred.' },
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
