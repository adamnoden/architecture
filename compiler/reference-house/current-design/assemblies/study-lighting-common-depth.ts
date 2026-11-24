/** Unselected replaceable-enclosure comparison; no permanent-fabric recess. */
export interface CommonDepthCornerChoices {
  readonly schema: 'ias-common-depth-corner-choices/2'
  readonly units: 'mm'
  readonly enclosureWidthMm: number
  readonly enclosureHeightMm: number
  readonly shellThicknessMm: number
  readonly internalPortProjectionMm: number
  readonly firstNormalDrawMm: number
  readonly secondaryRestSizeMm: number
  readonly secondaryRestGapMm: number
  readonly secondaryRestSideGapMm: number
  readonly maximumEnclosureMassKg: number
  readonly fixingEdgeMm: number; readonly fixingHoleDiameterMm: number; readonly maximumClipSpanMm: number
  readonly accessoryOpeningWidthMm: number; readonly accessoryOpeningHeightMm: number
  readonly fingerThicknessMm: number; readonly fingerHeightMm: number; readonly gripRearOffsetMm: number; readonly gripEngagementMm: number
  readonly plugNormalDrawMm: number; readonly pipeWallMm: number
}
export interface CommonDepthCornerContext {
  readonly bayPlanMm: readonly number[]; readonly coreFaceYMm: number; readonly totalDepthMm: number
  readonly fixedBoundaryDepthMm: number; readonly settingMm: number
  readonly fixedRails: readonly { readonly xMm: readonly number[]; readonly depthMm: readonly number[] }[]
  readonly legacyJunctionBodyDepthMm: readonly number[]; readonly legacyJunctionAxisDepthMm: number
  readonly referenceBoxDepthMm: number; readonly accessoryBodyDepthMm: number; readonly insertedPlugProjectionMm: number; readonly plateSizeMm: readonly number[]
  readonly plugSizeMm: readonly number[]; readonly steelDensityKgM3Comparison: number
  readonly socketCentreZMm: number; readonly switchCentreZMm: number; readonly lightCentreZMm: number
  readonly fieldBottomZMm: number; readonly fieldTopZMm: number
  readonly routeDiameterMm: number; readonly collarDiameterMm: number; readonly collarLengthMm: number
  readonly mainRestPlanMm: readonly number[]
  readonly parkedModule: { readonly xMm: readonly number[]; readonly yMm: readonly number[]; readonly zMm: readonly number[] }
  readonly occupiedPlanMm: readonly (readonly [string, readonly number[]])[]
  readonly floorBandsMm: readonly (readonly number[])[]
}
const overlap = (a: readonly number[], b: readonly number[]) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]
const coveredByBands = (r: readonly number[], bands: readonly (readonly number[])[]) => {
  const xs = [...new Set([r[0]!, r[2]!, ...bands.flatMap(b => [b[0]!, b[2]!]).filter(x => x > r[0]! && x < r[2]!)])].sort((a, b) => a - b)
  const ys = [...new Set([r[1]!, r[3]!, ...bands.flatMap(b => [b[1]!, b[3]!]).filter(y => y > r[1]! && y < r[3]!)])].sort((a, b) => a - b)
  return xs.slice(1).every((x, i) => ys.slice(1).every((y, j) => bands.some(b =>
    (xs[i]! + x) / 2 >= b[0]! && (xs[i]! + x) / 2 <= b[2]! && (ys[j]! + y) / 2 >= b[1]! && (ys[j]! + y) / 2 <= b[3]!)))
}
const rect = (x: readonly number[], y: readonly number[]) => [x[0], y[0], x[1], y[1]]
const samePoint = (a: readonly number[], b: readonly number[]) => a.length === b.length && a.every((v, i) => Math.abs(v - b[i]!) < 1e-9)
export function admitCommonDepthChoices(input: unknown): CommonDepthCornerChoices {
  const numeric = ['enclosureWidthMm', 'enclosureHeightMm', 'shellThicknessMm', 'internalPortProjectionMm',
    'firstNormalDrawMm', 'secondaryRestSizeMm', 'secondaryRestGapMm', 'secondaryRestSideGapMm', 'maximumEnclosureMassKg', 'fixingEdgeMm', 'fixingHoleDiameterMm', 'maximumClipSpanMm',
    'accessoryOpeningWidthMm', 'accessoryOpeningHeightMm', 'fingerThicknessMm', 'fingerHeightMm', 'gripRearOffsetMm', 'gripEngagementMm', 'plugNormalDrawMm', 'pipeWallMm']
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('IAS_COMMON_DEPTH_CHOICES_UNSUPPORTED')
  const x = input as Record<string, unknown>
  if (x.schema !== 'ias-common-depth-corner-choices/2' || x.units !== 'mm'
    || Object.keys(x).length !== numeric.length + 2 || numeric.some(k => typeof x[k] !== 'number' || !Number.isFinite(x[k]) || Number(x[k]) <= 0)) {
    throw new TypeError('IAS_COMMON_DEPTH_CHOICES_UNSUPPORTED: exact finite authored mm/kg requirements required')
  }
  return structuredClone(x) as unknown as CommonDepthCornerChoices
}
export function deriveCommonDepthCorner(context: CommonDepthCornerContext, input: unknown) {
  const q = admitCommonDepthChoices(input), c = context
  if (q.accessoryOpeningWidthMm + 2 * q.shellThicknessMm > q.enclosureWidthMm
    || q.accessoryOpeningHeightMm + 2 * q.shellThicknessMm > q.enclosureHeightMm) throw new TypeError('IAS_COMMON_DEPTH_OPENING_OUTSIDE_CASE')
  const values = [c.coreFaceYMm, c.totalDepthMm, c.fixedBoundaryDepthMm, c.settingMm, c.referenceBoxDepthMm,
    c.accessoryBodyDepthMm, c.socketCentreZMm, c.switchCentreZMm, c.lightCentreZMm, c.fieldBottomZMm, c.fieldTopZMm,
    c.routeDiameterMm, c.collarDiameterMm, c.collarLengthMm, ...c.bayPlanMm, ...c.legacyJunctionBodyDepthMm,
    c.legacyJunctionAxisDepthMm, ...c.plateSizeMm, ...c.mainRestPlanMm, ...c.plugSizeMm, c.steelDensityKgM3Comparison]
  if (!Array.isArray(c.fixedRails) || c.fixedRails.length !== 2 || c.fixedRails.some(rail => ![...rail.xMm, ...rail.depthMm].every(Number.isFinite))) throw new TypeError('IAS_COMMON_DEPTH_FIXED_SUPPORTS_UNSUPPORTED')
  if (!values.every(Number.isFinite) || c.settingMm <= 0 || c.referenceBoxDepthMm <= 0 || c.plateSizeMm.length !== 2
    || c.plugSizeMm.length !== 3 || c.plugSizeMm.some(v => v <= 0) || c.steelDensityKgM3Comparison <= 0
    || c.insertedPlugProjectionMm <= 0 || c.plugSizeMm[2]! <= c.insertedPlugProjectionMm
    || 2 * q.pipeWallMm >= c.routeDiameterMm) throw new TypeError('IAS_COMMON_DEPTH_CONTEXT_UNSUPPORTED')
  const cx = (c.bayPlanMm[0]! + c.bayPlanMm[2]!) / 2
  const frontDepth = c.legacyJunctionBodyDepthMm[1]!, rearDepth = frontDepth - c.referenceBoxDepthMm
  const commonDepth = c.legacyJunctionAxisDepthMm, faceY = c.coreFaceYMm - frontDepth
  const sideSpace = (q.enclosureWidthMm - 2 * q.shellThicknessMm - c.plateSizeMm[0]!) / 2
  const bypassX = cx - c.plateSizeMm[0]! / 2 - sideSpace / 2
  const internalDepth = [rearDepth + q.shellThicknessMm, frontDepth - q.shellThicknessMm]
  const requiredRouteSpace = c.routeDiameterMm + 2 * c.settingMm
  const requiredCollarSpace = c.collarDiameterMm + 2 * c.settingMm
  const geometryIssues: string[] = []
  if (q.fixingEdgeMm < q.internalPortProjectionMm + c.settingMm + q.fixingHoleDiameterMm / 2) geometryIssues.push('front-fixing-access-intersects-internal-port-hardware')
  if (q.fixingEdgeMm < q.fixingHoleDiameterMm / 2 + c.settingMm || q.fixingEdgeMm * 2 >= Math.min(q.enclosureWidthMm, q.enclosureHeightMm)) geometryIssues.push('purpose-fixing-edge-or-actual-hole-setting-rejected')
  if (rearDepth < c.fixedBoundaryDepthMm + c.settingMm) geometryIssues.push('purpose-enclosure-enters-retained-boundary-or-setting-space')
  if (c.accessoryBodyDepthMm > c.referenceBoxDepthMm - q.shellThicknessMm) geometryIssues.push('device-body-enters-case-rear-shell')
  if (frontDepth + q.shellThicknessMm + c.settingMm > c.totalDepthMm) geometryIssues.push('fixed-cover-loses-replaceable-recess-setting-space')
  if (sideSpace < requiredCollarSpace) geometryIssues.push('purpose-bypass-loses-collar-and-two-setting-allowances')
  if (q.enclosureHeightMm < c.plateSizeMm[1]! + 2 * (q.internalPortProjectionMm + c.settingMm)) geometryIssues.push('port-hardware-intersects-device-volume')
  if (commonDepth - c.collarDiameterMm / 2 < internalDepth[0]! + c.settingMm
    || commonDepth + c.collarDiameterMm / 2 > internalDepth[1]! - c.settingMm) geometryIssues.push('purpose-port-depth-loses-setting-space')
  const stations = [c.socketCentreZMm, c.switchCentreZMm, c.lightCentreZMm]
  const enclosures = stations.map((z, i) => {
    const id = `IAS/STUDY/common-depth/enclosure/${i}`, low = z - q.enclosureHeightMm / 2, high = z + q.enclosureHeightMm / 2
    const x = [cx - q.enclosureWidthMm / 2, cx + q.enclosureWidthMm / 2], bodyZ = [z - c.plateSizeMm[1]! / 2, z + c.plateSizeMm[1]! / 2]
    if (low < c.fieldBottomZMm + c.settingMm || high > c.fieldTopZMm - c.settingMm
      || x[0]! < c.bayPlanMm[0]! + c.settingMm || x[1]! > c.bayPlanMm[2]! - c.settingMm) geometryIssues.push('purpose-enclosure-outside-replaceable-field')
    return { id, xMm: x, zMm: [low, high], bodyDepthMm: [rearDepth, frontDepth],
      fixedCoverDepthMm: [frontDepth, frontDepth + q.shellThicknessMm],
      fixedRecessSurroundDepthMm: [frontDepth, c.totalDepthMm], decorativeStopJointMm: c.settingMm, fixedRecessSurroundRetainedOnDecorativeRelease: true,
      accessoryFaceDepthMm: frontDepth, accessoryFaceRecessMm: c.totalDepthMm - frontDepth,
      accessoryReservedVolumeXYZMm: [cx - c.plateSizeMm[0]! / 2, c.coreFaceYMm - frontDepth, bodyZ[0],
        cx + c.plateSizeMm[0]! / 2, c.coreFaceYMm - (frontDepth - c.accessoryBodyDepthMm), bodyZ[1]],
      deviceReferenceBinding: i === 0 ? 'Referenced socket body envelope; terminal/earth/fixing protrusions unbound' : i === 1 ? 'Authored switch-interface reserve; actual switch body/terminals unbound' : 'Authored luminaire-junction reserve; actual Astro terminals/bracket unbound; existing complete luminaire module unchanged',
      deviceVolumeAuthority: 'An authored full plate-shadow reserve using the socket 23 mm depth witness. At switch and luminaire-junction stations this is a requirement, not matched product geometry.',
      actualProductInterfaceQualified: false,
      bottomPort: { id: `${id}/bottom`, pointXYZMm: [bypassX, c.coreFaceYMm - commonDepth, low], outwardDirection: [0, 0, -1] },
      topPort: i < stations.length - 1 ? { id: `${id}/top`, pointXYZMm: [bypassX, c.coreFaceYMm - commonDepth, high], outwardDirection: [0, 0, 1] } : null,
      internalPortProjectionMm: q.internalPortProjectionMm,
      internalRoute: { diameterRequirementMm: c.routeDiameterMm, pointXYZMm: [[bypassX, c.coreFaceYMm - commonDepth, low], [bypassX, c.coreFaceYMm - commonDepth, i === stations.length - 1 ? z : high]],
        kind: 'Enclosed routing-volume reservation, not an extra uninterrupted pipe through the device.', equipmentTerminalPortBound: false },
      independentOfDecoration: true, frontPositiveFixingCount: 4,
      fixings: [x[0]! + q.fixingEdgeMm, x[1]! - q.fixingEdgeMm].flatMap((fx, col) => [low + q.fixingEdgeMm, high - q.fixingEdgeMm].map((fz, row) => ({
        id: `${id}/fixing/${col}/${row}`, holeDiameterMm: q.fixingHoleDiameterMm, pointXYZMm: [fx, c.coreFaceYMm - rearDepth, fz],
        frontServiceToolAccessDiameterRequirementMm: q.fixingHoleDiameterMm + 2 * c.settingMm,
        toolAndFastenerQualified: false,
        hardLandDepthMm: [c.fixedRails[0]!.depthMm[1]!, rearDepth],
        crossCleatXMm: c.fixedRails.map(rail => (rail.xMm[0]! + rail.xMm[1]!) / 2),
        intentionalSupportContact: true, loadCapacityQualified: false }))),
      protectedCoverRetainedOnDecorativeRelease: true,
      supportPath: 'Case positive fixings → independent fixed rails/cross-cleats → existing declared hard lands; no decoration or mineral-board bearing.',
    }
  })
  const sourcePoint = [bypassX, c.coreFaceYMm - commonDepth, c.fieldBottomZMm + c.settingMm]
  const collars: { id: string; startXYZMm: number[]; endXYZMm: number[]; outsideDiameterMm: number; internalProjectionMm: number }[] = []
  const pipes: { id: string; startXYZMm: number[]; endXYZMm: number[]; outsideDiameterMm: number; lengthMm: number }[] = []
  let previous = [...sourcePoint]
  collars.push({ id: 'IAS/STUDY/common-depth/entry-collar', startXYZMm: previous, endXYZMm: [bypassX, previous[1]!, previous[2]! + c.collarLengthMm], outsideDiameterMm: c.collarDiameterMm, internalProjectionMm: q.internalPortProjectionMm })
  previous = [...collars[0]!.endXYZMm]
  for (const [i, box] of enclosures.entries()) {
    const port = box.bottomPort.pointXYZMm, before = [port[0]!, port[1]!, port[2]! - c.collarLengthMm]
    if (before[2]! - previous[2]! < 2 * c.settingMm) geometryIssues.push('finite-connectors-leave-no-supported-straight')
    pipes.push({ id: `IAS/STUDY/common-depth/pipe/${i}`, startXYZMm: previous, endXYZMm: before,
      outsideDiameterMm: c.routeDiameterMm, lengthMm: before[2]! - previous[2]! })
    collars.push({ id: `${box.id}/bottom-collar`, startXYZMm: before, endXYZMm: [...port], outsideDiameterMm: c.collarDiameterMm, internalProjectionMm: q.internalPortProjectionMm })
    if (box.topPort) {
      const p = box.topPort.pointXYZMm
      const collar = { id: `${box.id}/top-collar`, startXYZMm: [...p], endXYZMm: [p[0]!, p[1]!, p[2]! + c.collarLengthMm], outsideDiameterMm: c.collarDiameterMm, internalProjectionMm: q.internalPortProjectionMm }
      collars.push(collar); previous = [...collar.endXYZMm]
    }
  }
  const pipeClips = pipes.map(pipe => ({ id: `${pipe.id}/independent-clip`,
    pointXYZMm: [bypassX, c.coreFaceYMm - commonDepth, (pipe.startXYZMm[2]! + pipe.endXYZMm[2]!) / 2],
    maximumUnsupportedLengthToEndPortMm: pipe.lengthMm / 2,
    supportPath: 'Independent clip/standoff → fixed cross-cleat between existing side rails; case ports are separate fixed supports.',
    installedSupportQualified: false }))
  if (pipeClips.some(clip => clip.maximumUnsupportedLengthToEndPortMm > q.maximumClipSpanMm)) geometryIssues.push('pipe-support-span-exceeds-authored-comparison')
  const allMatesCoaxial = pipes.every((pipe, i) => {
    const lower = collars.find(row => samePoint(row.endXYZMm, pipe.startXYZMm))
    const upper = collars.find(row => samePoint(row.startXYZMm, pipe.endXYZMm))
    return !!lower && !!upper && samePoint(upper.endXYZMm, enclosures[i]!.bottomPort.pointXYZMm)
  })
  if (!allMatesCoaxial) geometryIssues.push('finite-containment-ports-do-not-meet')
  const extraSize = q.secondaryRestSizeMm
  const right = c.parkedModule.xMm[0]! - q.secondaryRestSideGapMm, north = c.mainRestPlanMm[1]! - q.secondaryRestGapMm
  const secondaryRest = [right - extraSize, north - extraSize, right, north]
  const parkedX = [(secondaryRest[0]! + secondaryRest[2]!) / 2 - q.enclosureWidthMm / 2, (secondaryRest[0]! + secondaryRest[2]!) / 2 + q.enclosureWidthMm / 2]
  const completeDepth = c.referenceBoxDepthMm + q.shellThicknessMm
  const parkedY = [secondaryRest[3]! - completeDepth, secondaryRest[3]!]
  const withdrawnY = [c.coreFaceYMm - (frontDepth + q.shellThicknessMm) - q.firstNormalDrawMm, c.coreFaceYMm - rearDepth - q.firstNormalDrawMm]
  const initialX = enclosures[0]!.xMm
  const mainModulePlan = rect(c.parkedModule.xMm, c.parkedModule.yMm)
  const obstacles = [...c.occupiedPlanMm, ['parked-light-module', mainModulePlan] as const]
  const moves = [
    { id: 'normal-draw', planMm: [initialX[0]!, withdrawnY[0]!, initialX[1]!, c.coreFaceYMm - rearDepth] },
    { id: 'translate-left-above-main-rest', planMm: [Math.min(parkedX[0]!, initialX[0]!), withdrawnY[0]!, Math.max(parkedX[1]!, initialX[1]!), withdrawnY[1]!] },
    { id: 'translate-south-beside-main-rest', planMm: [parkedX[0]!, Math.min(parkedY[0]!, withdrawnY[0]!), parkedX[1]!, Math.max(parkedY[1]!, withdrawnY[1]!)] },
  ].map(move => ({ ...move, conflictingIds: obstacles.filter(([, r]) => overlap(move.planMm, [r[0]! - c.settingMm, r[1]! - c.settingMm, r[2]! + c.settingMm, r[3]! + c.settingMm])).map(([id]) => id) }))
  if (q.firstNormalDrawMm < c.totalDepthMm - rearDepth + c.settingMm) geometryIssues.push('complete-enclosure-normal-draw-is-too-short')
  if (q.enclosureWidthMm + 2 * c.settingMm > extraSize || completeDepth + 2 * c.settingMm > extraSize) geometryIssues.push('complete-enclosure-does-not-fit-secondary-rest')
  if (moves.some(move => move.conflictingIds.length)) geometryIssues.push('enclosure-first-release-intersects-occupied-or-main-rest')
  if (!coveredByBands(secondaryRest, c.floorBandsMm)) geometryIssues.push('secondary-rest-is-outside-actual-floor')
  if (obstacles.some(([, r]) => overlap(secondaryRest, [r[0]! - c.settingMm, r[1]! - c.settingMm, r[2]! + c.settingMm, r[3]! + c.settingMm]))) geometryIssues.push('secondary-rest-intersects-occupied-or-main-rest')
  const stockRearSpaceMm = c.referenceBoxDepthMm - c.accessoryBodyDepthMm
  const recessMm = c.totalDepthMm - frontDepth, [plugWidth, plugHeight, plugDepth] = c.plugSizeMm
  // This is a project finger envelope beside the referenced complete plug,
  // not a claim about grip force or about every supplied plug.
  const fingerWidth = q.fingerThicknessMm, requiredPlugDrawMm = plugDepth! - c.insertedPlugProjectionMm + c.settingMm
  const gripWidthMm = plugWidth! + 2 * fingerWidth, gripHeightMm = Math.max(plugHeight!, q.fingerHeightMm)
  const gripSideReserveMm = (q.accessoryOpeningWidthMm - gripWidthMm) / 2 - 2 * c.settingMm
  const gripVerticalReserveMm = (q.accessoryOpeningHeightMm - gripHeightMm) / 2 - 2 * c.settingMm
  const plateDrawReserveMm = Math.min((q.accessoryOpeningWidthMm - c.plateSizeMm[0]!) / 2,
    (q.accessoryOpeningHeightMm - c.plateSizeMm[1]!) / 2) - 2 * c.settingMm
  const surroundOpenings = enclosures.slice(0, 2).map(box => {
    const z = (box.zMm[0]! + box.zMm[1]!) / 2
    const openingXZMm = [cx - q.accessoryOpeningWidthMm / 2, z - q.accessoryOpeningHeightMm / 2,
      cx + q.accessoryOpeningWidthMm / 2, z + q.accessoryOpeningHeightMm / 2]
    const fixingChecks = box.fixings.map(fixing => {
      const [x, , height] = fixing.pointXYZMm
      const dx = Math.max(openingXZMm[0]! - x!, x! - openingXZMm[2]!, 0), dz = Math.max(openingXZMm[1]! - height!, height! - openingXZMm[3]!, 0)
      return { id: fixing.id, reserveMm: Math.hypot(dx, dz) - fixing.frontServiceToolAccessDiameterRequirementMm / 2 }
    })
    return { id: `${box.id}/fixed-surround-opening`, openingXZMm, depthMm: [frontDepth, c.totalDepthMm],
      ordinaryUseLeavesElectricalFaceClosed: true, retainedOnDecorationRelease: true, fixingChecks }
  })
  const gripIssues: string[] = []
  if (gripSideReserveMm < 0 || gripVerticalReserveMm < 0) gripIssues.push('ordinary-plug-finger-sweep-loses-two-settings')
  if (plateDrawReserveMm < 0) gripIssues.push('isolated-accessory-plate-cannot-pass-surround')
  if (q.gripRearOffsetMm + q.gripEngagementMm > c.insertedPlugProjectionMm || q.gripRearOffsetMm < c.settingMm) gripIssues.push('finger-engagement-crosses-protected-face-or-complete-plug-body')
  if (q.plugNormalDrawMm < requiredPlugDrawMm) gripIssues.push('normal-plug-draw-leaves-pins-in-socket')
  if (surroundOpenings.some(row => row.fixingChecks.some(fixing => fixing.reserveMm < 0))) gripIssues.push('surround-opening-removes-fixing-tool-lands')
  const socketZ = c.socketCentreZMm, fingerRear = q.gripRearOffsetMm - recessMm, fingerFront = fingerRear + q.gripEngagementMm
  const fingerSweeps = [-1, 1].map((side, i) => {
    const inner = cx + side * plugWidth! / 2, outer = inner + side * fingerWidth
    return { id: `IAS/STUDY/common-depth/socket/finger/${i}`, intendedPlugSideContact: true,
      sweptXYZMm: [Math.min(inner, outer), faceY - q.gripRearOffsetMm - q.gripEngagementMm - q.plugNormalDrawMm,
        socketZ - q.fingerHeightMm / 2, Math.max(inner, outer), faceY - q.gripRearOffsetMm, socketZ + q.fingerHeightMm / 2] }
  })
  // Charge case faces without aperture credits, then the separate fixed
  // surround face and its finite return. Collars are charged as solid stock.
  const density = c.steelDensityKgM3Comparison, width = q.enclosureWidthMm, height = q.enclosureHeightMm, t = q.shellThicknessMm
  const caseSteelKg = (2 * width * height + 2 * (width + height) * c.referenceBoxDepthMm) * t / 1e9 * density
  const surroundFaceKg = (width * height - q.accessoryOpeningWidthMm * q.accessoryOpeningHeightMm) * t / 1e9 * density
  const surroundReturnKg = 2 * (q.accessoryOpeningWidthMm + q.accessoryOpeningHeightMm + 4 * t) * recessMm * t / 1e9 * density
  const surroundSteelKg = surroundFaceKg + surroundReturnKg
  type Stock = { id: string; kg: number; originXYZMm: number[]; interpretation: string }
  const steelStock: Stock[] = enclosures.flatMap((box, i) => {
    const z = (box.zMm[0]! + box.zMm[1]!) / 2
    const rows: Stock[] = [{ id: `${box.id}/case-stock`, kg: caseSteelKg,
      originXYZMm: [cx, c.coreFaceYMm - (rearDepth + frontDepth) / 2, z], interpretation: 'Full front/rear face and four side stock; no holes deducted.' }]
    if (i < 2) rows.push({ id: `${box.id}/surround-face-stock`, kg: surroundFaceKg,
      originXYZMm: [cx, c.coreFaceYMm - (c.totalDepthMm - t / 2), z], interpretation: 'Separate front face ring at the decorative plane; actual clear mouth deducted.' },
      { id: `${box.id}/surround-return-stock`, kg: surroundReturnKg,
        originXYZMm: [cx, c.coreFaceYMm - (frontDepth + c.totalDepthMm) / 2, z], interpretation: 'Four full outside-width returns; corner overlap charged in full.' })
    return rows
  })
  for (const pipe of pipes) steelStock.push({ id: `${pipe.id}/tube-stock`,
    kg: Math.PI / 4 * (c.routeDiameterMm ** 2 - (c.routeDiameterMm - 2 * q.pipeWallMm) ** 2) * pipe.lengthMm / 1e9 * density,
    originXYZMm: pipe.startXYZMm.map((v, k) => (v + pipe.endXYZMm[k]!) / 2), interpretation: 'Authored tube wall at explicit comparison density; not a selected product.' })
  for (const collar of collars) steelStock.push({ id: `${collar.id}/gross-stock`,
    kg: Math.PI / 4 * collar.outsideDiameterMm ** 2 * c.collarLengthMm / 1e9 * density,
    originXYZMm: collar.startXYZMm.map((v, k) => (v + collar.endXYZMm[k]!) / 2), interpretation: 'Gross solid cylindrical stock, without bore/thread deductions.' })
  const knownStock = steelStock.map(row => {
    const [x, y] = row.originXYZMm, gravityN = row.kg * 9.81
    return { ...row, gravityWrenchN_Nm: [0, 0, -gravityN, -y! / 1000 * gravityN, x! / 1000 * gravityN, 0] }
  })
  const caseBudgets = enclosures.map((box, i) => ({ id: box.id, knownSteelStockKgComparison: caseSteelKg + (i < 2 ? surroundSteelKg : 0),
    maximumCompleteCaseRequirementKg: q.maximumEnclosureMassKg, remainingRequirementForDeviceFixingsAndOtherStockKg: q.maximumEnclosureMassKg - caseSteelKg - (i < 2 ? surroundSteelKg : 0) }))
  if (caseBudgets.some(row => row.remainingRequirementForDeviceFixingsAndOtherStockKg < 0)) geometryIssues.push('known-case-steel-exceeds-complete-case-mass-ceiling')
  for (const issue of gripIssues) geometryIssues.push(issue)
  const diagnostics = [
    { code: 'IAS_LIGHTING_REFERENCE_BOX_PORT_COORDINATES_UNSUPPORTED', objectId: 'IAS/STUDY/reference/BG-HGS06', state: 'unsupported',
      message: 'Manufacturer line diagrams show offset side knockouts without dimensioned axes. Legacy centred ports are requirements, not matched HGS06 connections.' },
    ...(stockRearSpaceMm < requiredRouteSpace ? [{ code: 'IAS_LIGHTING_COMMON_DEPTH_STOCK_REAR_ROUTE_REJECTED', objectId: 'IAS/STUDY/common-depth/stock-box', state: 'rejected-comparison',
      message: `${stockRearSpaceMm} mm nominal rear space cannot contain the retained ${c.routeDiameterMm} mm route plus two ${c.settingMm} mm allowances (${requiredRouteSpace} mm).` }] : []),
    { code: 'IAS_LIGHTING_COMMON_DEPTH_DEVICE_TERMINALS_UNBOUND', objectId: 'IAS/STUDY/common-depth/device-interfaces', state: 'unsupported',
      message: 'Finite cases, collars and trunk meet, but actual device/earth terminal coordinates, conductor paths and compatible hardware are unbound; this is not a completed electrical connection.' },
    { code: 'IAS_LIGHTING_COMMON_DEPTH_GRIP_PHYSICAL_EVIDENCE_PENDING', objectId: 'IAS/STUDY/common-depth/accessory-use', state: 'unqualified',
      message: 'A finite fixed-surround opening and complete referenced plug/two-finger normal sweep are now explicit. Actual supplied plug shape, grip/withdrawal force, lead and human operation still require the representative trial; no physical result is inferred.' },
    { code: 'IAS_LIGHTING_COMMON_DEPTH_HARDWARE_AND_RENEWAL_UNQUALIFIED', objectId: 'IAS/STUDY/common-depth', state: 'unqualified',
      message: 'Purpose-designed closed cases and front-serviced unions are geometric requirements. Actual joint/earth continuity, fitting manufacture, tool/axial release, temporary support and load capacity remain unqualified.' },
    ...geometryIssues.map(message => ({ code: 'IAS_LIGHTING_COMMON_DEPTH_GEOMETRY_REJECTED', objectId: 'IAS/STUDY/common-depth', state: 'rejected-comparison', message })),
  ]
  return { schema: 'ias-common-depth-corner-comparison/2', selection: 'unselected-comparison', choices: q,
    status: geometryIssues.length ? 'GEOMETRY_REJECTED' : 'LOCAL_ENCLOSURE_GEOMETRY_WITH_UNBOUND_DEVICE_INTERFACES',
    settingMm: c.settingMm, commonAxisCoreDepthMm: commonDepth, accessoryFaceRecessMm: c.totalDepthMm - frontDepth,
    sourceBoundaryPort: { id: 'IAS/STUDY/common-depth/source-boundary', pointXYZMm: sourcePoint, houseFeederConnected: false },
    stockComparison: { nominalRearSpaceMm: stockRearSpaceMm, requiredRouteSpaceMm: requiredRouteSpace, rearThroughRouteFits: stockRearSpaceMm >= requiredRouteSpace, manufacturerPortCoordinatesQualified: false },
    purpose: { enclosures, pipes, collars, pipeClips, internalBypassWidthMm: sideSpace, requiredCollarSpaceMm: requiredCollarSpace,
      tubeSideClearanceMm: (sideSpace - c.routeDiameterMm) / 2, collarSideClearanceMm: (sideSpace - c.collarDiameterMm) / 2,
      collarRearClearanceMm: commonDepth - c.collarDiameterMm / 2 - internalDepth[0]!, collarFrontClearanceMm: internalDepth[1]! - commonDepth - c.collarDiameterMm / 2,
      externalBendsRequired: 0, legacyR70RequirementRetainedWhereBendsExist: true, allMatesCoaxial,
      straightContainmentLengthMm: pipes.reduce((sum, pipe) => sum + pipe.lengthMm, 0),
      deviceTerminalsConnected: false, completeRoomCircuit: false, protectiveLayersIndependentOfDecoration: true, permanentFabricCutsRequired: false },
    accessoryUse: { insertedPlugRoomwardProjectionBeyondDecorationMm: c.insertedPlugProjectionMm - (c.totalDepthMm - frontDepth),
      actualRecessOpeningAndBodyGripQualified: false,
      geometryStatus: gripIssues.length ? 'GEOMETRY_REJECTED' : 'DECLARED_PLUG_AND_FINGER_SWEEP_CLEAR', surroundOpenings,
      completeReferencePlugMm: c.plugSizeMm, twoIndependentSettingsMm: 2 * c.settingMm,
      gripSideReserveMm, gripVerticalReserveMm, isolatedPlateDrawReserveMm: plateDrawReserveMm,
      requiredPlugNormalDrawMm: requiredPlugDrawMm, authoredPlugNormalDrawMm: q.plugNormalDrawMm, fingerSweeps,
      fingerNormalIntervalBeyondDecorationMm: [fingerRear, fingerFront + q.plugNormalDrawMm],
      ordinaryUseChangesProtectiveClosures: false, suppliedLeadBendAndGripForceQualified: false,
      plateFirstDrawClearanceRequirementMm: c.accessoryBodyDepthMm + c.totalDepthMm - frontDepth + c.settingMm },
    renewal: { firstNormalDrawMm: q.firstNormalDrawMm, requiredWholeEnclosureNormalDrawMm: c.totalDepthMm - rearDepth + c.settingMm,
      moves, secondaryRestPlanMm: secondaryRest, parkedCase: { xMm: parkedX, yMm: parkedY, zMm: [c.parkedModule.zMm[0]!, c.parkedModule.zMm[0]! + q.enclosureHeightMm] },
      additionalTemporaryFloorTerritoryM2: extraSize ** 2 / 1e6, preservesSeparateMainModuleRest: true,
      qualifiedUnionsAndToolRelease: false, temporarySupportCapacityQualified: false },
    loadInterface: { authoredMaximumCaseMassKgEach: q.maximumEnclosureMassKg, caseCount: enclosures.length,
      authoredTotalCaseGravityN: q.maximumEnclosureMassKg * enclosures.length * 9.81,
      sourceModelMassFeedbackApplied: false, actualInstalledMassQualified: false,
      steelDensityKgM3Comparison: density, pipeWallMmComparison: q.pipeWallMm, knownStock,
      totalKnownSteelStockKgComparison: knownStock.reduce((sum, row) => sum + row.kg, 0), caseBudgets,
      knownStockGravityWrenchN_Nm: [0, 0, 0, 0, 0, 0].map((_, k) => knownStock.reduce((sum, row) => sum + row.gravityWrenchN_Nm[k]!, 0)),
      secondaryRestCompleteCaseDemandN: q.maximumEnclosureMassKg * 9.81,
      unknownInstalledStock: ['actual devices and terminal/earth/strain-relief hardware', 'front-serviced unions', 'clips and cross-cleats', 'fixings and finishes'],
      scope: 'A requirements ceiling for three independent cases, additional to the retained luminaire/module. Conduit, unions, clips and delivered complete mass remain to be inventoried; no selected house load is changed.' },
    diagnostics, geometryIssues, evidence: { localGeometryPassing: !geometryIssues.length, actualReferenceProductConnected: false,
      equipmentTerminalGeometryComplete: false, installedProtectionQualified: false, materialAdmission: false,
      completeRenewalQualified: false, physicalTrialComplete: false, ownerAcceptance: false, candidateSelected: false },
  } as const
}
