/** A passive dry-side service cupboard, not a pressure-rated enclosure.
 * The whole service-lobby east side is screened, from Utility pier to Plant
 * pier and floor to ceiling. A short screen around the board alone cannot
 * intercept every ray entering through the two different doorways.
 */
export function inletElectricalScreen(input: {
  boardBoxMm: readonly number[]
  lobbyYMm: readonly number[]
  portalMaximumXMm: readonly number[]
  clearHeightMm: number
  ordinaryBody: { axisXMm: number; radiusMm: number }
  fullReversalUpperN: readonly number[]
}) {
  const { boardBoxMm: b, lobbyYMm: y, portalMaximumXMm: portals, ordinaryBody: body } = input
  if (b.length !== 6 || y.length !== 2 || portals.length !== 2
      || ![...b, ...y, ...portals, body.axisXMm, body.radiusMm, input.clearHeightMm, ...input.fullReversalUpperN].every(Number.isFinite)
      || b.slice(3).some(v => v <= 0) || y[1] <= y[0] || input.clearHeightMm <= 0 || body.radiusMm <= 0
      || input.fullReversalUpperN.length !== 2 || input.fullReversalUpperN.some(v => v < 0)) throw new Error('Invalid source-bound electrical screen geometry or actions')
  const planeX = b[0] - 25, sheetMm = 4, normalFace = planeX - sheetMm,
    portalReserve = planeX - Math.max(...portals), routeReserve = normalFace - body.axisXMm - body.radiusMm - 10,
    boardFits = b[1] >= y[0] && b[1] + b[4] <= y[1] && b[2] >= 0 && b[2] + b[5] <= input.clearHeightMm,
    panelWidth = (y[1] - y[0]) / 2, panelHeight = input.clearHeightMm / 4,
    panelFlatMetalKg = panelWidth * panelHeight * sheetMm / 1e9 * 8000,
    panels = Array.from({ length: 8 }, (_, i) => ({ id: `HAD/mainboard-shield-panel-${i + 1}`,
      boxMm: [normalFace, y[0] + (i % 2) * panelWidth, Math.floor(i / 2) * panelHeight, sheetMm, panelWidth, panelHeight],
      flatSheetOnlyKg: panelFlatMetalKg, retainedBy: 'passive bottom seating and accessible captive mechanical retention; actual detail unqualified' }))
  return {
    state: 'passive-screen-pre-site-proposal' as const, selected: false as const,
    barrierPlaneMm: { x: planeX, y, z: [0, input.clearHeightMm] }, panels,
    ordinaryRouteAfterSettingMm: routeReserve, boardToShieldNominalMm: 25,
    visibility: {
      portalMaximumXMm: portals, portalToShieldReserveMm: portalReserve,
      allDirectPortalRaysIntercepted: portalReserve > 0 && boardFits,
      proof: 'Both complete portals lie west of the shield; every target point lies east. A connecting segment crosses the plane. Its Y/Z are convex combinations within the full lobby/ceiling rectangle. No corner sampling or arbitrary jet cone is used.',
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
    diagnostics: [...(portalReserve <= 0 || !boardFits ? ['MAINBOARD_SCREEN_DIRECT_PORTAL_INTERCEPTION_FAILS'] : []),
      ...(routeReserve < 0 ? ['MAINBOARD_SCREEN_INTERCEPTS_NORMAL_ROUTE'] : []),
      'MAINBOARD_SCREEN_IMPACT_SEAMS_TOE_AND_DRY_ESCAPE_UNQUALIFIED',
      'MAINBOARD_SCREEN_ACTUAL_SUPPORT_HANDLING_AND_HEAT_UNQUALIFIED'],
  }
}
