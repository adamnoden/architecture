import type {PlanRectangle} from './inlet-orthogonal-plan.js'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { CurrentDesignResolution } from './resolve.js'
import { runGroundSectionCase } from './structural-ground.js'
import { inletRoomPocket, drawInletRoomPocket } from './inlet-room-pocket.js'
import { inletRoomPan, inletClosedOutfall, drawInletRoomPan } from './inlet-room-pan.js'

type Ground = ReturnType<typeof runGroundSectionCase>
export type RoomCatchmentSettings = {
  catchmentPanSlopeRatio: number
  catchmentPocketDepthMm: number
  catchmentIsolationGapMm: number
  catchmentClearWidthMm: number
  catchmentClearHeightMm: number
  catchmentInvertAboveDistributionMm: number
  catchmentReceiverWidthMm: number
  catchmentReceiverCrestAboveGradeMm: number
}

/** Conditional1D open-channel comparison, never a qualified flood/jet pass.
 * A whole outlet is unavailable; half the surviving width and32mm of its bed
 * are lost. At steep grade, use critical INLET control and a supercritical
 * downstream chute (normal depth <= critical). At mild grade, a free-critical
 * outlet and wholly subcritical profile give Sf<=Sf(critical); charge that
 * upper friction over the complete length without credit for the bed fall.
 * Require the entire upstream pool-head bound below the clear crown minus
 *15mm, so neither branch silently becomes a pressure-flow culvert model.
 * The entrance K1.5, obstruction shape and actual route remain unqualified.
 */
export function rectangularCatchmentScreen(qLmin: number, clearWidthMm: number, clearHeightMm: number, lengthMm: number, slopeRatio = 50) {
  if (![qLmin, clearWidthMm, clearHeightMm, lengthMm, slopeRatio].every(Number.isFinite)
      || qLmin <= 0 || clearWidthMm <= 0 || clearHeightMm <= 47 || lengthMm <= 0 || slopeRatio <= 0) throw new Error('Invalid rectangular catchment domain')
  const q = qLmin / 60000, width = clearWidthMm / 2000, bed = .032, air = .015,
    maximumDepth = clearHeightMm / 1000 - bed - air, g = 9.81, n = .015, entranceK = 1.5,
    criticalDepth = Math.cbrt(q * q / (g * width * width)), area = width * criticalDepth,
    radius = area / (width + 2 * criticalDepth), velocity = q / area,
    criticalFrictionSlope = n * n * velocity * velocity / radius ** (4 / 3), slope = 1 / slopeRatio,
    steep = slope >= criticalFrictionSlope,
    chargedFriction = steep ? 0 : criticalFrictionSlope * lengthMm / 1000,
    poolHead = bed + criticalDepth + (1 + entranceK) * velocity * velocity / (2 * g) + chargedFriction,
    openEntryReserve = clearHeightMm - air * 1000 - poolHead * 1000
  return { validDepth: criticalDepth <= maximumDepth, requiredHeadAboveInvertMm: poolHead * 1000,
    criticalDepthMm: criticalDepth * 1000, maximumWaterDepthMm: maximumDepth * 1000,
    control: steep ? 'critical-inlet-supercritical-chute' as const : 'critical-outlet-subcritical-upper-friction-bound' as const,
    criticalFrictionSlope, actualBedSlope: slope, chargedFrictionHeadMm: chargedFriction * 1000,
    survivingClearWidthMm: width * 1000, velocityAtControlMps: velocity,
    openEntryHeadReserveMm: openEntryReserve,
    necessaryOpenChannelScreen: criticalDepth <= maximumDepth && openEntryReserve >= 0,
    entranceKComparison: entranceK, entranceKMaximumBeforeOpenEntryFailure: (clearHeightMm / 1000 - air - bed - criticalDepth - chargedFriction) * 2 * g / (velocity * velocity) - 1, entranceKCeilingQualified: false }
}

export function runInletRoomCatchment(resolved: CurrentDesignResolution, ground: Ground | undefined,
  maximumSourceLmin: number, room: { planMm: readonly number[];planExclusionsMm?:readonly PlanRectangle[]; rawWindowXMm: readonly number[]; wallFacesYMm: readonly number[]; retainedFurniture: Record<string, readonly number[]>; northOpeningXMm: readonly number[]; purgeBodyMm: readonly number[] }, settings: RoomCatchmentSettings, grid: Parameters<typeof inletRoomPocket>[0]['grid']) {
  if (!ground) return { state: 'missing-ground-section' as const,
    diagnostics: ['INLET_ROOM_CATCHMENT_REQUIRES_SAVED_GROUND_SECTION'], selected: false as const }
  if (room.planMm.length !== 4 || room.rawWindowXMm.length !== 2 || room.wallFacesYMm.length !== 2
    || ![...room.planMm, ...room.rawWindowXMm, ...room.wallFacesYMm, ...Object.values(settings)].every(Number.isFinite)
    || room.planMm[2] <= 0 || room.planMm[3] <= 0 || room.rawWindowXMm[1] - room.rawWindowXMm[0] < 600
    || room.wallFacesYMm[1] <= room.wallFacesYMm[0]) throw new Error('Invalid occupied inlet catchment geometry')
  const replayed = runGroundSectionCase(resolved, ground.authoredCase)
  if (sha256SemanticFingerprint(replayed) !== sha256SemanticFingerprint(ground)) throw new Error('Stale or modified inlet catchment ground result')
  const levels = ground.native.levelsMm as unknown as Record<string, unknown>
  const pair = (key: string): readonly [number, number] => {
    const v = levels[key]
    if (!Array.isArray(v) || v.length !== 2 || !v.every(Number.isFinite) || v[0] >= v[1]) throw new Error('Unsupported inlet catchment ground interval: ' + key)
    return [v[0], v[1]]
  }
  const globalDistribution = pair('accessibleDistribution'), finish = pair('finish'), globalMineral = pair('mineralCourse'),
    ffl = ground.native.levelsMm.ffl, grade = levels.authoredExteriorGrade as number,
    pocket = inletRoomPocket({ levels: { mineralCourse: globalMineral, dryRC: pair('dryRC'), glass: pair('glass'),
      accessibleDistribution: globalDistribution, finish, ffl, coldGridTop: levels.coldGridTop as number },
      roomPlanMm: room.planMm,planExclusionsMm:room.planExclusionsMm,depthMm: settings.catchmentPocketDepthMm, isolationGapMm: settings.catchmentIsolationGapMm, grid,
      rcDensityKNm3: (ground.authoredCase.settings as Record<string, number>).rcDensityKNm3,
      mineralDensityKNm3: (ground.authoredCase.settings as Record<string, number>).mineralDensityBudgetKNm3 }),
    distribution = pocket.levels.accessibleDistribution, mineral = pocket.levels.mineralCourse
  if (!Number.isFinite(grade) || finish[1] !== ffl || finish[0] !== distribution[1]) throw new Error('Unsupported inlet catchment ground datum')
  const [x, y, width, depth] = room.planMm, [windowLo, windowHi] = room.rawWindowXMm,
    [wallOuterY, wallInnerY] = room.wallFacesYMm, wallDepth = wallInnerY - wallOuterY,
    insulation = 20, metal = 2, allowance = 10, fallRatio = 50,
    length = wallDepth + 260 + 900, invert = distribution[0] + settings.catchmentInvertAboveDistributionMm,
    outerBottom = invert - insulation - metal, outerTop = invert + settings.catchmentClearHeightMm + insulation + metal,
    outerWidth = settings.catchmentClearWidthMm + 2 * (insulation + metal), terminalInvert = invert - length / fallRatio,
    receiverCrest = grade + settings.catchmentReceiverCrestAboveGradeMm + 32,
    // Broad-crested comparator. It is not a lawful-site or debris qualification.
    receiverHead = 1000 * (maximumSourceLmin / 60000 / (1.7 * settings.catchmentReceiverWidthMm / 1000)) ** (2 / 3),
    receiverWater = receiverCrest + receiverHead, freeDrop = terminalInvert - receiverWater - 25 - allowance,
    hydraulic = rectangularCatchmentScreen(maximumSourceLmin, settings.catchmentClearWidthMm, settings.catchmentClearHeightMm, length),
    availableHead = ffl - 15 - invert, headReserve = availableHead - hydraulic.requiredHeadAboveInvertMm,
    bottomReserve = outerBottom - (wallDepth + 260) / fallRatio - distribution[0] - allowance, topReserve = distribution[1] - outerTop - allowance,
    grossPoolDepthMm = Math.max(0, ffl - invert),
    // Separate exterior lanes below the actual south-window opening. These are
    // NEW explicit penetrations, never inferred holes in the permanent fabric.
    outlets = [windowLo + 240, windowHi - 240].map((axisX, i) => ({ id: `HAD/utility-floor-outfall-${i + 1}`,
      newWallApertureMm: [axisX - outerWidth / 2, wallOuterY, outerBottom - (wallDepth + 260) / fallRatio, outerWidth, wallDepth, outerTop - outerBottom + wallDepth / fallRatio],
      inletMm: [axisX, y + 260, invert], terminalMm: [axisX, y + 260 - length, terminalInvert],
      dischargeWidthMm: settings.catchmentReceiverWidthMm, receiverCrestMm: receiverCrest,
      receiverWaterMm: receiverWater, sharesD2OrRoofReceiver: false, structuralOpeningAdmitted: false,
      localFloorBodyWestOverhangMm: pocket.local ? Math.max(0, pocket.local.bodyMinMaxMm[0] - (axisX - outerWidth / 2)) : null,
      localFloorBodyEastOverhangMm: pocket.local ? Math.max(0, axisX + outerWidth / 2 - pocket.local.bodyMinMaxMm[2]) : null,
      pipeSeatsAndPerimeterCrossingQualified: false }))
  const pan = inletRoomPan({ roomPlanMm: room.planMm,planExclusionsMm:room.planExclusionsMm,outletXmm: outlets.map(o => o.inletMm[0]), inletYmm: y + 260,
    invertMm: invert, slopeRatio: settings.catchmentPanSlopeRatio, floorMm: ffl, floorUndersideMm: finish[0],
    distributionBottomMm: distribution[0], datumMm: levels.coldGridTop as number, settingMm: allowance, metalMm: metal, insulationMm: insulation, chuteWidthMm:settings.catchmentClearWidthMm,chuteHeightMm:settings.catchmentClearHeightMm,chuteSlopeRatio:fallRatio,
    waterStageComparisonsMm: { 'single-surviving-outlet-unqualified-uniform-stage': invert + hydraulic.requiredHeadAboveInvertMm + allowance,
      'both-blocked-below-floor-upper': ffl, 'declared-exterior-receiver-tailwater': receiverWater } })
  const closedOutfalls=outlets.map(o=>inletClosedOutfall({id:o.id,axisXMm:o.inletMm[0],wallInnerYMm:wallInnerY,terminalYMm:o.terminalMm[1],
    wallInvertMm:invert-260/fallRatio,terminalInvertMm:terminalInvert,widthMm:settings.catchmentClearWidthMm,heightMm:settings.catchmentClearHeightMm,
    metalMm:metal,originMm:[x+width/2,y+depth/2,levels.coldGridTop as number],settingMm:allowance,
    waterStageComparisonsMm:{'both-blocked-below-floor-upper':ffl,'declared-exterior-receiver-tailwater':receiverWater}}))
  const diagnostics = [
    ...pan.diagnostics,
    ...(pocket.local?.diagnostics ?? []),
    ...(bottomReserve < 0 || topReserve < 0 ? ['INLET_FLOOR_ROUTE_EXCEEDS_ACTUAL_DISTRIBUTION_ZONE'] : []),
    ...(!hydraulic.necessaryOpenChannelScreen || headReserve < 0 ? ['INLET_FLOOR_SINGLE_SURVIVING_OUTLET_SCREEN_FAILS'] : []),
    ...(freeDrop < 0 ? ['INLET_FLOOR_RECEIVER_TAILWATER_SCREEN_FAILS'] : []),
    ...(settings.catchmentReceiverWidthMm + 2 * 20 + 2 * allowance > (windowHi - windowLo - 480) ? ['INLET_FLOOR_SEPARATE_RECEIVER_LANES_OVERLAP'] : []),
    ...(outlets.some(o => o.newWallApertureMm[0] - allowance < windowLo || o.newWallApertureMm[0] + outerWidth + allowance > windowHi) ? ['INLET_FLOOR_PORT_EXCEEDS_EXISTING_WINDOW_AXIS'] : []),
    'INLET_FLOOR_RECEIVER_COEFFICIENT_AND_FULL_PLAN_UNQUALIFIED',
    'INLET_FLOOR_NEW_WALL_OPENINGS_NOT_ADMITTED', 'INLET_FLOOR_COMMON_SITE_RECEIVING_NOT_ADMITTED', 'INLET_ROOM_STORED_RELEASE_UNBOUNDED',
    'INLET_ROOM_PRESSURE_JET_AND_OPEN_DOOR_UNQUALIFIED', 'INLET_ROOM_WARM_OUTFALL_BOUNDARY_UNQUALIFIED',
    'INLET_ROOM_PAN_SUPPORT_SEAMS_AND_MATERIALS_UNQUALIFIED', 'INLET_ROOM_ADDED_LOADS_NOT_IN_52_HEAD_MODEL',
  ]
  const result = { state: 'whole-room-development-comparison' as const, selected: false as const,
    groundAuthority: { caseId: ground.source.caseId, caseDigest: ground.source.caseDigest,
      resultDigest: sha256SemanticFingerprint(ground), planDigest: ground.source.planDigest },
    levelsMm: { ffl, distribution, finish, mineralCourse: mineral, exteriorGrade: grade },
    localPocket: pocket.local, localPocketSvg: pocket.local ? drawInletRoomPocket(pocket.local) : null, retainedGlobalDistributionMm: globalDistribution,
    wetFloorPlanMm: [x, y, width, depth], retainedRoom: { furniture: room.retainedFurniture, northOpeningXMm: room.northOpeningXMm, purgeBodyMm: room.purgeBodyMm }, settings,
    sourceOnlyEvent: { maximumCombinedLmin: maximumSourceLmin, storedInventoryIncluded: false,
      scope: 'Both restricted cold branches together; one complete outlet unavailable and half the surviving width blocked, plus32mm bed deposit.',
      hydraulic, availableHeadMm: availableHead, headReserveMm: headReserve,
      receiverWaterMm: receiverWater, raisedCrestAdverseMm: 32, receiverCoefficientComparison: 1.7, receiverCoefficientQualified: false, freeDropReserveMm: freeDrop,
      necessarySourceOnlyScreen: hydraulic.necessaryOpenChannelScreen && headReserve >= 0 && freeDrop >= 0 },
    route: { clearMm: [settings.catchmentClearWidthMm, settings.catchmentClearHeightMm],
      insulationEachSideMm: insulation, metalEachSideMm: metal, wholeOuterMm: [outerWidth, outerTop - outerBottom],
      outerZMm: [outerBottom, outerTop], bottomAfterSettingMm: bottomReserve, topAfterSettingMm: topReserve,
      fitsActualDistributionZone: bottomReserve >= 0 && topReserve >= 0, lengthMm: length, slopeRatio: fallRatio,
      dpcVerticalReserveMm: outerBottom - (wallDepth + 260) / fallRatio - globalMineral[1],
      exteriorWallDpcMm: globalMineral, wallOutletBelowAfterSettingMm: outerBottom - (wallDepth + 260) / fallRatio - allowance, outlets, actualApertureOrFloorSupportApproval: false },
    room: { floorLipAboveFflMm: 0, pressurePoolIsBelowFlushRemovableFloor: true, normalFloorAndCoverSupportResolved: false,
      necessaryPanAndPocketGeometryScreen: pan.necessaryGeometryScreen && (!pocket.local || pocket.local.necessaryGeometryScreen),
      panMaterial: '2mm copper comparison; seams, corrosion, touch/jet protection and complete material admission remain open',
      flatPanSheetOnlyKg: pan.projectedAreaM2*.002*8960, upstandsSeamsGratesAndStandsKg: null, grossBelowFloorPoolDepthMm: grossPoolDepthMm,
      grossUndisplacedBelowFloorPoolLitres: pan.nominalGrossWaterToFloorLitres, belowFloorGrossWaterUpperKg: pan.afterLowerSettingGrossWaterToFloorUpperKg,
      actualGradedPan: pan, actualGradedPanSvg:pan.necessaryGeometryScreen?drawInletRoomPan(pan):null, closedOutfalls, wholeFaultMaximumWaterKg: null,
      assuredAvailableStorageLitres: null, optimisticGrossBothBlockedTimeToFloorSeconds: pan.nominalGrossWaterToFloorLitres === null ? null : pan.nominalGrossWaterToFloorLitres / maximumSourceLmin * 60,
      bothBlockedVerdict: 'reject-unattended-event', manualResponseCredited: false,
      retainedWasherOrElectricalEquipmentSprayRated: false, loadTransferAnd52HeadsSolved: false },
    maintenance: { pressureNetworkSupportIndependentOfPan: 'required-not-proved',
      commonPanRenewal: 'Close BOTH Lodge and indoor cold cuts, isolate/drain actual hot store and upper network, verify zero energy, then release supported retained ends. No live-sibling credit with common pan open.',
      normalBranchIsolation: 'Independent Lodge and indoor cuts remain required; appliance stop is not the house cut.',
      floorPanRenewal: 'All fixtures and removable floor/seat assemblies over pan must be removed on proved dry rests; full-room pan export and reinstatement remain unproved.',
      failureInventory: 'Actual cylinder, expansion and upper-network release is unbounded here. No catalogue/minimum litres or aperture is used as its maximum.' },
    methodReferences: [
      'https://www.fhwa.dot.gov/publications/research/infrastructure/hydraulics/06138/chapt3.cfm',
      'https://www.txdot.gov/manuals/des/hyd/chapter-8--culverts/section-3--hydraulic-operation-of-culverts/direct-step-backwater-method.html'],
    diagnostics, preSiteArrangementComplete: false as const }
  return { ...result, sectionSvg: draw(result) }
}

function draw(r: {
  levelsMm: { ffl: number; distribution: readonly number[]; mineralCourse: readonly number[]; exteriorGrade: number }
  wetFloorPlanMm: number[]
  retainedRoom: { furniture: Record<string, readonly number[]>; northOpeningXMm: readonly number[]; purgeBodyMm: readonly number[] }
  route: { outerZMm: number[]; bottomAfterSettingMm: number; topAfterSettingMm: number; outlets: { inletMm: number[]; terminalMm: number[] }[] }
  sourceOnlyEvent: { maximumCombinedLmin: number; headReserveMm: number | null; hydraulic: { openEntryHeadReserveMm: number } }
  diagnostics: string[]
}) {
  const [west, south, width, depth] = r.wetFloorPlanMm, k = .18,
    X = (v: number) => 35 + (v - west) * k, Y = (v: number) => 530 - (v - south) * k,
    Z = (v: number) => 680 - v * .55,
    box = (p: readonly number[]) => `<rect x="${X(p[0])}" y="${Y(p[1] + p[3])}" width="${p[2] * k}" height="${p[3] * k}" fill="#cbc5b5" stroke="#554f43"/>`,
    t = (x: number, y: number, text: string, size = 15) => `<text x="${x}" y="${y}" font-size="${size}">${text}</text>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="870" viewBox="0 0 1080 870"><rect width="1080" height="870" fill="#f5f1e6"/><g font-family="Arial,sans-serif" fill="#25221c">
${t(35,40,'Utility whole-floor catchment · actual ground authority',25)}
${t(35,72,`Source-only ${r.sourceOnlyEvent.maximumCombinedLmin.toFixed(1)} L/min; actual stored release remains unbounded.`)}
${t(35,104,'Conditional room comparison. Flush floor; independent pressure supports and safe pan renewal still required.')}
<rect x="${X(west)}" y="${Y(south + depth)}" width="${width * k}" height="${depth * k}" fill="#dce9e5" stroke="#554f43"/>
${Object.values(r.retainedRoom.furniture).map(box).join('')}
<line x1="${X(r.retainedRoom.northOpeningXMm[0])}" y1="${Y(south + depth)}" x2="${X(r.retainedRoom.northOpeningXMm[1])}" y2="${Y(south + depth)}" stroke="#f5f1e6" stroke-width="8"/>
<circle cx="${X(r.retainedRoom.purgeBodyMm[0])}" cy="${Y(r.retainedRoom.purgeBodyMm[1])}" r="${300 * k}" fill="none" stroke="#906944" stroke-dasharray="5 4"/>
${r.route.outlets.map((o, i) => `<line x1="${X(o.inletMm[0])}" y1="${Y(o.inletMm[1])}" x2="${X(o.terminalMm[0])}" y2="${Y(o.terminalMm[1])}" stroke="#247b91" stroke-width="7"/>${t(X(o.terminalMm[0])-45,Y(o.terminalMm[1])+25,`Outfall${i+1}`,13)}`).join('')}
${t(35,565,'Retained washer/sink/heat and purge stance shown.')}${t(35,590,'Blue routes BELOW floor; new structural wall ports.')}${t(35,840,'Plan: floor and pressure supports are not borrowed from the retained furniture.',13)}
${t(535,155,`Ground FFL${r.levelsMm.ffl}mm`,20)}
${t(535,185,`Accessible distribution${r.levelsMm.distribution.join('–')}mm`)}
<rect x="540" y="${Z(r.levelsMm.distribution[1])}" width="450" height="${(r.levelsMm.distribution[1]-r.levelsMm.distribution[0])*.55}" fill="#ded8ba"/>
<rect x="580" y="${Z(r.route.outerZMm[1])}" width="320" height="${(r.route.outerZMm[1]-r.route.outerZMm[0])*.55}" fill="#97bcc5" stroke="#173a44"/>
<line x1="520" y1="${Z(r.levelsMm.ffl)}" x2="1010" y2="${Z(r.levelsMm.ffl)}" stroke="#25221c" stroke-width="3"/>
${t(535,480,`Full insulated route${r.route.outerZMm.join('–')}mm at inlet.`)}
${t(535,510,`Top/bottom after setting:${r.route.topAfterSettingMm.toFixed(1)}/${r.route.bottomAfterSettingMm.toFixed(1)}mm.`)}
${t(535,550,`Pool-head reserve:${r.sourceOnlyEvent.headReserveMm?.toFixed(1) ?? 'FAIL'}mm.`)}
${t(535,580,`Open-entry reserve:${r.sourceOnlyEvent.hydraulic.openEntryHeadReserveMm.toFixed(1)}mm at assumedK1.5.`)}
${t(535,620,'Neither entrance coefficient nor tailwater is qualified.')}
${t(535,660,'No concealed-fabric opening or warm outlet is admitted.')}
${t(535,700,'Whole pan water, covers and supports need load transfer.')}
${t(535,740,'No raised threshold, guaranteed response or storage credit.')}
${t(535,790,`${r.diagnostics.length} explicit diagnostics retained. HAD remains open.`,17)}
</g></svg>`
}
