/** A passive dry-side service cupboard, not a pressure-rated enclosure.
 * The whole service-lobby east side is screened, from Utility pier to Plant
 * pier and floor to ceiling. A short screen around the board alone cannot
 * intercept every ray entering through the two different doorways.
 */
export function inletElectricalScreen(input: {
  boardBoxMm: readonly number[]
  lobbyYMm: readonly number[]
  portalMaximumXMm: readonly number[]
  portalMinimumXMm: readonly number[]
  standOffMm:number
  horizontalInsetMm:number
  verticalInsetMm:number
  clearHeightMm: number
  ordinaryBody: { axisXMm: number; radiusMm: number }
  fullReversalUpperN: readonly number[]
}) {
  const { boardBoxMm: b, lobbyYMm: y, portalMaximumXMm: portals, ordinaryBody: body } = input
  if (b.length !== 6 || y.length !== 2 || portals.length !== 2 || input.portalMinimumXMm.length!==2
      || ![...b, ...y, ...portals, ...input.portalMinimumXMm,input.standOffMm,input.horizontalInsetMm,input.verticalInsetMm,body.axisXMm, body.radiusMm, input.clearHeightMm, ...input.fullReversalUpperN].every(Number.isFinite)
      || b.slice(3).some(v => v <= 0) || y[1] <= y[0] || input.clearHeightMm <= 0 || body.radiusMm <= 0
      ||input.standOffMm<=0||input.horizontalInsetMm<0||input.verticalInsetMm<0||2*input.horizontalInsetMm>=y[1]-y[0]||2*input.verticalInsetMm>=input.clearHeightMm
      || input.fullReversalUpperN.length !== 2 || input.fullReversalUpperN.some(v => v < 0)) throw new Error('Invalid source-bound electrical screen geometry or actions')
  const planeX = b[0] - input.standOffMm, sheetMm = 4, normalFace = planeX - sheetMm,
    portalReserve = planeX - Math.max(...portals), routeReserve = normalFace - body.axisXMm - body.radiusMm - 10,
    boardFits = b[1] >= y[0] && b[1] + b[4] <= y[1] && b[2] >= 0 && b[2] + b[5] <= input.clearHeightMm,
    panelY=[y[0]+input.horizontalInsetMm,y[1]-input.horizontalInsetMm], panelZ=[input.verticalInsetMm,input.clearHeightMm-input.verticalInsetMm],
    panelWidth = (panelY[1] - panelY[0]) / 2, panelHeight = (panelZ[1]-panelZ[0]) / 4,
    panelFlatMetalKg = panelWidth * panelHeight * sheetMm / 1e9 * 8000,
    panels = Array.from({ length: 8 }, (_, i) => ({ id: `HAD/mainboard-shield-panel-${i + 1}`,
      boxMm: [normalFace, panelY[0] + (i % 2) * panelWidth, panelZ[0]+Math.floor(i / 2) * panelHeight, sheetMm, panelWidth, panelHeight],
      flatSheetOnlyKg: panelFlatMetalKg, retainedBy: 'passive bottom seating and accessible captive mechanical retention; actual detail unqualified' }))
  // Exact extrema of the portal/target BOX ray envelope: for fixed X the
  // projected Y/Z are affine; the interpolation fraction is monotone in both
  // X endpoints. Thus vertices bound the complete continuous boxes, not a
  // sampled jet cone. Actual arched portals lie within these conservative boxes.
  const projected:number[][]=[]
  let crossPlane=portals.every((v,i)=>input.portalMinimumXMm[i]<=v&&v<planeX)&&planeX<b[0]
  if(crossPlane)for(let i=0;i<2;i++)for(const px of [input.portalMinimumXMm[i],portals[i]])for(const pz of [0,input.clearHeightMm])
    for(const qx of [b[0],b[0]+b[3]])for(const qy of [b[1],b[1]+b[4]])for(const qz of [b[2],b[2]+b[5]]){
      const t=(planeX-px)/(qx-px);projected.push([y[i]+t*(qy-y[i]),pz+t*(qz-pz)])
    }
  const rayBounds=crossPlane?[ [Math.min(...projected.map(p=>p[0])),Math.max(...projected.map(p=>p[0]))],
    [Math.min(...projected.map(p=>p[1])),Math.max(...projected.map(p=>p[1]))] ]:null,
    rayReserves=rayBounds?[rayBounds[0][0]-panelY[0],panelY[1]-rayBounds[0][1],rayBounds[1][0]-panelZ[0],panelZ[1]-rayBounds[1][1]]:null,
    interception=crossPlane&&boardFits&&rayReserves!==null&&rayReserves.every(v=>v>=0)
  return {
    state: 'passive-screen-pre-site-proposal' as const, selected: false as const,
    barrierPlaneMm: { x: planeX, y:panelY, z:panelZ }, panels,
    ordinaryRouteAfterSettingMm: routeReserve, boardToShieldNominalMm: input.standOffMm,
    visibility: {
      portalMaximumXMm: portals, portalToShieldReserveMm: portalReserve,
      allDirectPortalRaysIntercepted: interception,
      projectedRayBoundsMm:rayBounds,edgeReservesMm:rayReserves,afterTwo5MmSettings:rayReserves?.map(v=>v-10)??null,
      necessaryInterceptionAfterSettings:interception&&rayReserves!==null&&rayReserves.every(v=>v>=10),
      proof: 'Both conservative complete portal boxes lie west of the shield and the target box lies east. Vertex extrema of the monotone interpolation fraction bound every segment-plane intersection. The finite shield covers those Y/Z bounds; raw and10mm setting reserves are separate. No arbitrary jet cone or installed impact resistance is inferred.',
      scope: 'Straight rays through either actual Utility or Plant portal, plus a source west of the shield inside the lobby. No pressure pipe is permitted inside the dry cupboard.',
      pressureJetRicochetSeamsOrFloodQualification: false,
    },
    actions: { fullReversalUpperN: input.fullReversalUpperN,
      maximumSingleBranchN: Math.max(...input.fullReversalUpperN), simultaneousPairN: input.fullReversalUpperN.reduce((n, f) => n + f, 0),
      totalFlatSheetOnlyKg: panelFlatMetalKg * panels.length,
      framesSeatsRetainersAndFinishKg: null, localImpactPanelAndIndependentFloorCeilingSupportQualified: false },
    maintenance: {
      normalState: 'All shield panels retained, board case closed, no water-bearing service in dry cupboard. Routine house water cuts remain in Utility.',
      boardOpening: 'Temporarily close the service suite; isolate BOTH Lodge feeds and actual hot/store/upper inventory, drain and verify zero pressure; isolate utility AC and PV AC. Remove supported shield panels to a dry rest, then open the board from its retained1000mm work field.',
      restoration: 'Close and inspect board, restore all shield/backing/receiving and fire boundaries, verify electrical and water systems, then restore occupied use.',
      liveWetBoardMaintenanceClaimed: false, siblingLiveWithCommonShieldRemoved: false,
      actualSeatedPanelLiftAndDryRestProved: false,
    },
    wetBoundary: { material: 'uncoated316 stainless comparison', gaps: 'independently supported overlapping backing and visible removable wet-side toe receiver required',
      hiddenFloorOrWallVoidReceivingCredited: false, hydraulicDrainOrDryRetreatPass: false,
      heatFromFilledBoardWithShieldClosedW: null, passiveThermalPassTransferred: false,
      ownerMaterialOrAppearanceApproval: false, assembledElectricalOrInstalledAcceptance: false },
    diagnostics: [...(!interception ? ['MAINBOARD_SCREEN_DIRECT_PORTAL_INTERCEPTION_FAILS'] : []),
      ...(routeReserve < 0 ? ['MAINBOARD_SCREEN_INTERCEPTS_NORMAL_ROUTE'] : []),
      'MAINBOARD_SCREEN_IMPACT_SEAMS_TOE_AND_DRY_ESCAPE_UNQUALIFIED',
      'MAINBOARD_SCREEN_ACTUAL_SUPPORT_HANDLING_AND_HEAT_UNQUALIFIED'],
  }
}
