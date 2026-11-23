import { deriveCommonDepthCorner, type CommonDepthCornerChoices } from './study-lighting-common-depth.js'
import { deriveLightingCornerDetail, type LightingCornerDetailInput } from './study-lighting-corner.js'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { sha256SemanticFingerprint } from '../../../core/identity.js'
import { readBoundOccupiedServices } from '../occupied-services.js'
import type { CurrentDesignResolution } from '../resolve.js'
import type { compileStudyRoomKitProjection } from './study-room-kit-projection.js'

export const studyLightingMethod = 'ias-study-lighting/1'
export const studyLightingDefaultsPath = 'project/ias/studies/adaptable-study-lighting.json'
export const studyLightingComponentsPath = 'project/ias/studies/lighting-component-references.json'
export { admitStudyLightingCase, studyLightingStageFields, studyLightingArrangements, type StudyLightingCase } from './study-lighting-case.js'
import { admitStudyLightingCase, type StudyLightingCase } from './study-lighting-case.js'
type Point = readonly [number, number, number]
type Box = readonly [number, number, number, number]
type Projection = ReturnType<typeof compileStudyRoomKitProjection>
const root = new URL('../../../../', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, root))
const sha256 = (data: Buffer) => createHash('sha256').update(data).digest('hex')
export const readStudyLightingReferenceCase = () => admitStudyLightingCase(JSON.parse(read(studyLightingDefaultsPath).toString('utf8')))
export function readLightingComponents() {
  const data = JSON.parse(read(studyLightingComponentsPath).toString('utf8'))
  if (data.schema !== 'ias-lighting-component-references/1') throw new TypeError('Unsupported lighting component reference schema')
  return data as {
    cornerConstruction: LightingCornerDetailInput['construction'], commonDepthCornerCandidate: CommonDepthCornerChoices,
    socket: { plateWidthMm: number; plateHeightMm: number; recommendedBoxDepthMm: number; bodyDepthMm: number },
    backBox: { widthMm: number; heightMm: number; depthMm: number }, plug: { insertedProjectionMm: number },
    deskLamp: { baseDiameterMm: number; leadLengthMm: number }, floorLamp: { baseDiameterMm: number; leadLengthMm: number },
    wallLamp: { shadeWidthMm: number; shadeHeightMm: number; reservedCompleteProjectionMm: number },
    wallTaskLamp: { wallPlateDiameterMm: number; maximumReachMm: number; shadeDiameterMm: number; shadeHeightMm: number },
    projectRequirements: { fixedBoundaryDepthMm: number; removableFaceDepthMm: number; localCarrierDepthReserveMm: number; bayWidthMm: number;
      doorStopMm: number;  socketGripNormalMm: number;
      panelRoomwardDrawMm: number; parkingSquareMm: number; wallModuleWidthMm: number; wallModuleHeightMm: number;
      wallModuleMaximumInstalledMassKg: number; wallModuleCentreOfGravityNormalMm: number;
      ceilingSurfaceBaseDiameterMm: number; ceilingCompleteFittingEnvelopeMm: readonly number[] }
  }
}
const intersects = (a: Box, b: Box) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]
const length = (path: readonly Point[]) => path.slice(1).reduce((sum, p, i) => sum + Math.hypot(...p.map((v, j) => v - path[i][j])), 0)

/** Source construction belongs to the existing occupied-service/room-kit path. No independent house fixture. */
export function lightingBasis(resolved: CurrentDesignResolution, projection: Projection) {
  const { house, binding } = readBoundOccupiedServices(resolved)
  const { kit, wallTransition, roomAssembly } = projection
  if (wallTransition.status !== 'DEVELOPMENT_COMPARISON' || kit.source.currentPlanBasis !== resolved.design.source.id
    || kit.source.bindingDigest !== binding.digest) throw new Error('IAS_LIGHTING_STALE_ROOM_INTERFACE')
  const model = house.model as unknown as { groundFurniture: Record<string, number[]>; kitchenOccurrence: {
    station: number[]; cooking: { footprint: number[]; top: number } } }
  const furniture = model.groundFurniture
  const table = furniture['dining-table1200x800'], worker = furniture['dining-chair-west-south']
  const kitchen = model.kitchenOccurrence
  if (![table, worker, kitchen?.cooking?.footprint, kitchen?.station].every(rect => Array.isArray(rect) && rect.length === 4 && rect.every(Number.isFinite) && rect[2] > 0 && rect[3] > 0)
    || !Number.isFinite(kitchen?.cooking?.top)) throw new Error('IAS_LIGHTING_CURRENT_KITCHEN_UNAVAILABLE')
  const skirting = wallTransition.field.retainedSkirtingEndPiecesXMm
  if (!skirting) throw new Error('IAS_LIGHTING_CURRENT_DOOR_SKIRT_UNAVAILABLE')
  return {
    source: { room: kit.source, roomKitCaseDigest: kit.caseDigest, wallTransitionDigest: wallTransition.source.transitionCaseDigest,
      occupiedBindingDigest: binding.digest, inputsSHA256: { [studyLightingDefaultsPath]: sha256(read(studyLightingDefaultsPath)), [studyLightingComponentsPath]: sha256(read(studyLightingComponentsPath)) } },
    room: { bands: kit.bands, occupied: kit.occupied, openings: kit.wall.boundRoomOpenings.map(value => {
      const opening = value as typeof value & { spring?: unknown }
      if (typeof opening.spring !== 'number' || !Number.isFinite(opening.spring) || opening.spring >= opening.head) throw new Error('IAS_LIGHTING_OPENING_ARCH_UNAVAILABLE')
      return { ...value, spring: opening.spring }
    }), door: kit.door,
      generalDepthMm: kit.wall.referenceDepthMm, ceilingZMm: wallTransition.field.ceilingZMm,
      floorFaces: kit.floor.parts.flatMap(piece => piece.facePieces), walls: roomAssembly.walls.map(wall => ({ id: wall.id, axis: wall.axis, fixedMm: wall.fixedMm, fromMm: wall.fromMm, toMm: wall.toMm,
        pieces: wall.pieces.map(piece => ({ id: piece.id, box: piece.faceBox })) })),
      southModuleXZMm: wallTransition.field.moduleXZMm, grilleXZMm: kit.grilleKeepOut.box,
      skirtingTopMm: roomAssembly.design.bottomMm, settingMm: roomAssembly.design.settingMm,
      retainedSkirtingEndXMm: skirting[0], retainedSkirtingDrawMm: wallTransition.field.retainedSkirtingFirstDrawMm },
    kitchen: { tableXYWHMm: table as number[], workerXYWHMm: worker as number[], sinkXYWHMm: kitchen.station as number[],
      cookingXYWHMm: kitchen.cooking.footprint as number[], cookingTopMm: kitchen.cooking.top as number },
  }
}
export type LightingBasis = ReturnType<typeof lightingBasis>

/** Pure geometry/role comparison. Photometry, acoustics, product admission and installed capacity stay unqualified. */
export function deriveStudyLighting(input: unknown, basis: LightingBasis, components: ReturnType<typeof readLightingComponents>) {
  const request = admitStudyLightingCase(input), p = components.projectRequirements, room = basis.room
  const dimensions = [room.generalDepthMm, room.ceilingZMm, ...Object.values(p).filter(value => typeof value !== 'string').flat(), components.backBox.widthMm, components.backBox.heightMm,
    components.backBox.depthMm, components.socket.plateWidthMm, components.socket.plateHeightMm, components.wallTaskLamp.maximumReachMm]
  if (!dimensions.every(v => typeof v === 'number' && Number.isFinite(v) && v > 0)) throw new TypeError('IAS_LIGHTING_COMPONENT_GEOMETRY_INVALID')
  const desk = room.occupied.find(([id]) => id === 'study-desk')?.[1], chair = room.occupied.find(([id]) => id === 'study-chair')?.[1]
  if (!desk || !chair) throw new Error('IAS_LIGHTING_FURNITURE_REQUIRED')
  const north = room.bands.at(-1)![3], west = room.bands[0][0], south = room.bands[0][1]
  const intrusion = request.serviceTotalDepthMm - room.generalDepthMm
  const right = room.door.rough[0] - p.doorStopMm, left = right - p.bayWidthMm, front = north - intrusion, centre = (left + right) / 2
  const bay: Box = [left, front, right, north], parking: Box = [left, north - p.parkingSquareMm - 150, right, north - 150]
  const use: Box = [left, front - components.plug.insertedProjectionMm - p.socketGripNormalMm, right, front]
  const draw: Box = [left, front - p.panelRoomwardDrawMm, right, front]
  const moduleDraw: Box = [left, front - components.wallLamp.reservedCompleteProjectionMm - p.panelRoomwardDrawMm, right, front]
  const gross = request.serviceTotalDepthMm - p.fixedBoundaryDepthMm - p.removableFaceDepthMm, usable = gross - p.localCarrierDepthReserveMm
  const socket: Point = [centre, front, request.socketCentreZMm], westSocket: Point = [west + intrusion, desk[1] + 200, request.socketCentreZMm]
  const deskBase: Point = [request.lampHand === 'left' ? desk[0] + 140 : desk[2] - 140, desk[1] + 200, 730]
  const deskLead: readonly Point[] = [deskBase, [deskBase[0], deskBase[1], 600], [desk[0] - 30, deskBase[1], 600], westSocket]
  const floorBase: Point = [west + components.floorLamp.baseDiameterMm / 2 + 40, north - 350, 0]
  const floorLead: readonly Point[] = [floorBase, [floorBase[0], north - 70, 0], [centre, north - 70, 0], socket]
  const sideStand: Box = [room.bands[1][2] - 500, 1750, room.bands[1][2] - 200, 2050]
  const sideSocket: Point = [room.bands[1][2] - intrusion, 1900, request.socketCentreZMm]
  const sideLead: readonly Point[] = [[sideStand[2] - 140, 1900, 750], [sideStand[2] - 30, 1900, 600], sideSocket]
  const light = (id: string, kind: string, positionMm: Point) => ({ id, kind, positionMm, available: request.failedSourceId !== id })
  const D = light('desk-task', 'desk', deskBase), F = light('floor-fill', 'floor', [floorBase[0], floorBase[1], 1500])
  const T = light('side-task', 'side', [sideStand[0] + 150, 1900, 1050]), W = light('wall-arrival', 'wall', [centre, front, 1800])
  const WT = light('wall-task', 'wall-task', [desk[0] + 450, south + intrusion, 1450])
  const [s0, z0, s1, z1] = room.southModuleXZMm
  const WF = light('wall-fill', 'wall', [(s0 + s1) / 2, south + intrusion, (z0 + z1) / 2])
  const C = light('ceiling-general', 'ceiling', [(desk[0] + room.bands[1][2]) / 2, (south + north) / 2, room.ceilingZMm - 175])
  const westStation: Box = [west, westSocket[1] - p.bayWidthMm / 2, west + intrusion, westSocket[1] + p.bayWidthMm / 2]
  const westUse: Box = [west + intrusion, westStation[1], west + intrusion + components.plug.insertedProjectionMm + p.socketGripNormalMm, westStation[3]]
  const sideStation: Box = [sideSocket[0], sideSocket[1] - p.bayWidthMm / 2, room.bands[1][2], sideSocket[1] + p.bayWidthMm / 2]
  const sideUse: Box = [sideSocket[0] - components.plug.insertedProjectionMm - p.socketGripNormalMm, sideStation[1], sideSocket[0], sideStation[3]]
  const serviceStations = [
    { id: 'IAS/STUDY/desk-socket', wallId: 'west', bayPlanMm: westStation, usePlanMm: westUse, centreMm: westSocket,
      localDepthMm: request.serviceTotalDepthMm, usableDepthMm: usable, intendedArrangements: ['portable', 'lamps-with-wall', 'ceiling-with-lamps'] },
    { id: 'IAS/STUDY/side-socket', wallId: 'cloak-west', bayPlanMm: sideStation, usePlanMm: sideUse, centreMm: sideSocket,
      localDepthMm: request.serviceTotalDepthMm, usableDepthMm: usable, intendedArrangements: ['portable'] },
  ]
  const taskProjectionMm = components.wallTaskLamp.maximumReachMm + components.wallTaskLamp.shadeDiameterMm / 2
  const fixedInterfaces = [
    { sourceId: W.id, supportId: 'IAS/STUDY/service-corner/carrier', projectionEnvelopeMm: components.wallLamp.reservedCompleteProjectionMm,
      approach: 'Normal draw to the north service-corner first rest after circuit isolation and temporary support.', qualification: 'UNQUALIFIED_LOAD_AND_PRODUCT' },
    { sourceId: WT.id, supportId: 'IAS/STUDY/south-task/carrier', projectionEnvelopeMm: taskProjectionMm,
      approach: 'Independent south-wall removable carrier; task lamp aiming sweep and cable exit require the actual product trial. No background-lamp mass or 180 mm envelope is reused.', qualification: 'UNQUALIFIED_TASK_CARRIER_AND_LEAD' },
    { sourceId: WF.id, supportId: 'IAS/STUDY/south-module/carrier', projectionEnvelopeMm: components.wallLamp.reservedCompleteProjectionMm,
      approach: 'Existing independent south module; retain actual grille and window release reserves. Added fitting load and electrical enclosure require detail.', qualification: 'UNQUALIFIED_LOAD_AND_PRODUCT' },
    { sourceId: C.id, supportId: 'IAS/STUDY/ceiling-surface-base', projectionEnvelopeMm: p.ceilingCompleteFittingEnvelopeMm[2],
      approach: 'Surface conduit and independently fixed accessible base; isolated source replacement from stable access equipment. No whole-ceiling panel system.', qualification: 'UNQUALIFIED_CEILING_SUPPORT_AND_ACCESS' },
  ]
  const commonGeometryDigest = sha256SemanticFingerprint(room)
  const roleIds = ['arrival', 'desk-reading', 'surrounding-light', 'cleaning-small-objects'] as const
  const arrangements = [
    { id: 'portable', title: 'Portable lamps', sources: [D, F, T], roleSources: [['floor-fill'], ['desk-task', 'side-task'], ['floor-fill', 'side-task'], ['desk-task', 'side-task', 'floor-fill']], fixedLightPoints: 0 },
    { id: 'lamps-with-wall', title: 'Lamps + one wall light', sources: [D, F, W], roleSources: [['wall-arrival'], ['desk-task'], ['floor-fill', 'wall-arrival'], ['desk-task', 'floor-fill', 'wall-arrival']], fixedLightPoints: 1 },
    { id: 'wall-led', title: 'Predominantly wall light', sources: [W, WT, WF], roleSources: [['wall-arrival'], ['wall-task'], ['wall-arrival', 'wall-fill'], ['wall-task', 'wall-arrival', 'wall-fill']], fixedLightPoints: 3 },
    { id: 'ceiling-with-lamps', title: 'One ceiling fitting + lamps', sources: [D, F, C], roleSources: [['ceiling-general'], ['desk-task'], ['ceiling-general', 'floor-fill'], ['ceiling-general', 'desk-task', 'floor-fill']], fixedLightPoints: 1 },
  ].map(({ roleSources, ...item }) => ({ ...item, commonGeometryDigest, roles: roleIds.map((id, i) => ({ id, intendedSourceIds: roleSources[i], liveSourceIds: roleSources[i].filter(id => request.failedSourceId !== id),
    photometricAdequacy: 'UNMEASURED' as const })), photometry: { taskLux: null, surroundingLuminance: null, glareRating: null },
    addedOccupiedStandMm: item.id === 'portable' ? sideStand : null }))
  const diagnostics: { code: string; message: string; objectIds: string[] }[] = []
  const fail = (code: string, message: string, objectIds = ['IAS/STUDY/service-corner']) => diagnostics.push({ code, message, objectIds })
  if (components.cornerConstruction.steelThicknessMm > p.localCarrierDepthReserveMm) fail('IAS_LIGHTING_CARRIER_RESERVE_REJECTED', 'Actual steel thickness exceeds the authored carrier reserve; increase the reservation and recheck connected routing depth.')
  if (usable < components.backBox.depthMm || usable < components.cornerConstruction.containmentOutsideDiameterMm) fail('IAS_LIGHTING_DEPTH_REJECTED', 'Actual independently enclosed box/route does not fit the usable local depth; the crafted lining is not spare cavity.')
  if (p.bayWidthMm - components.backBox.widthMm < 2 * (components.cornerConstruction.bendCentrelineRadiusMm + components.cornerConstruction.containmentOutsideDiameterMm / 2)) fail('IAS_LIGHTING_BEND_REJECTED', 'The box leaves insufficient side territory for the authored bend envelope.')
  if (left < west || right > room.bands.at(-1)![2] || room.occupied.some(([, box]) => [bay, use, moduleDraw, parking, sideStand].some(test => intersects(test, box)))) fail('IAS_LIGHTING_ACCESS_REJECTED', 'A local service/use/draw/rest or portable-comparator stand conflicts with actual furniture or room boundaries.')
  for (const station of serviceStations) {
    const obstructions = room.occupied.filter(([, box]) => intersects(station.usePlanMm, box) || intersects(station.bayPlanMm, box)).map(([id]) => id)
    if (station.id.endsWith('side-socket') && intersects(station.usePlanMm, sideStand)) obstructions.push('portable-comparator-side-stand')
    if (obstructions.length) fail('IAS_LIGHTING_STATION_ACCESS_REJECTED', `Local station ${station.id} conflicts with ${obstructions.join(', ')}.`, [station.id, ...obstructions])
  }
  if (request.socketCentreZMm < 450 || request.socketCentreZMm > 1200) fail('IAS_LIGHTING_REACH_ADVERSE', 'Outside the completed research reach comparator; no accessibility acceptance is implied.')
  if (length(deskLead) + 200 > components.deskLamp.leadLengthMm || length(floorLead) + 200 > components.floorLamp.leadLengthMm || length(sideLead) + 200 > components.deskLamp.leadLengthMm) fail('IAS_LIGHTING_LEAD_REJECTED', 'Declared route plus authored slack exceeds reference flex; no circulation extension is credited.')
  if (!request.localWallModule && ['lamps-with-wall', 'wall-led'].includes(request.arrangement)) fail('IAS_LIGHTING_CARRIER_MISSING', 'A fixed wall choice requires its independent carrier; decoration may not carry it.')
  if (request.failedSourceId) fail('IAS_LIGHTING_SOURCE_REMOVED', `Removed source ${request.failedSourceId}; intended roles are not silently reassigned.`, [request.failedSourceId])
  if (request.finishTrial === 'darker-oak') fail('IAS_LIGHTING_FINISH_TRIAL_INVALIDATED', 'Changed finish invalidates reflected-light evidence. No numeric reflectance or substitute photometric pass is invented.')
  const selected = arrangements.find(row => row.id === request.arrangement)!
  if (!selected.roles[0].liveSourceIds.length) fail('IAS_LIGHTING_ARRIVAL_UNAVAILABLE', 'The intended manually switched arrival source is unavailable.')
  const task: Point = [basis.kitchen.tableXYWHMm[0] + 200, basis.kitchen.workerXYWHMm[1] + basis.kitchen.workerXYWHMm[3] / 2, 750]
  const corner = {
    id: 'IAS/STUDY/service-corner', bayPlanMm: bay, totalLiningDepthMm: request.serviceTotalDepthMm, retainedGeneralDepthMm: room.generalDepthMm,
    boundaryDepthMm: p.fixedBoundaryDepthMm, decorativeFaceMm: p.removableFaceDepthMm, carrierReserveMm: p.localCarrierDepthReserveMm,
    grossStandOffMm: gross, connectedUsableRoutingDepthMm: usable, remainingBoxDepthMm: usable - components.backBox.depthMm,
    roomIntrusionMm: intrusion, conservativeFloorTerritoryM2: Math.max(0, intrusion) * p.bayWidthMm / 1e6,
    socketCentreMm: socket, switchCentreMm: [centre, front, 1100], westDeskSocketMm: westSocket, sideSocketMm: sideSocket,
    plateSizeMm: [components.socket.plateWidthMm, components.socket.plateHeightMm], backBoxSizeMm: [components.backBox.widthMm, components.backBox.heightMm, components.backBox.depthMm],
    bayBottomZMm: room.skirtingTopMm + room.settingMm, doorRoughXMm: room.door.rough, jambStopMm: room.door.rough[0] - right,
    retainedSkirtingEndXMm: room.retainedSkirtingEndXMm, retainedSkirtingDrawMm: room.retainedSkirtingDrawMm,
    lowRouteStopXMm: room.retainedSkirtingEndXMm[0] - room.settingMm,
    handUsePlanMm: use, panelDrawPlanMm: draw, completeModuleDrawPlanMm: moduleDraw, firstRestPlanMm: parking,
    normalDrawMm: p.panelRoomwardDrawMm, containmentEnvelopeMm: components.cornerConstruction.containmentOutsideDiameterMm, bendReserveMm: (components.cornerConstruction.bendCentrelineRadiusMm + components.cornerConstruction.containmentOutsideDiameterMm / 2),
    localReplacedNorthPanelIds: room.walls.find(wall => wall.id === 'north-door')!.pieces.filter(piece => intersects(piece.box, [left, room.skirtingTopMm + room.settingMm, right, 2100])).map(piece => piece.id),
    module: { present: request.localWallModule, centreMm: W.positionMm, sizeMm: [p.wallModuleWidthMm, p.wallModuleHeightMm], completeProjectionMm: components.wallLamp.reservedCompleteProjectionMm,
      authoredMassLimitKg: p.wallModuleMaximumInstalledMassKg, gravityDemandN: 9.81 * p.wallModuleMaximumInstalledMassKg,
      authoredMomentNm: 9.81 * p.wallModuleMaximumInstalledMassKg * p.wallModuleCentreOfGravityNormalMm / 1000, capacityQualified: false },
    independentSupport: 'Manufacturer bracket → removable positive-screw metal carrier/temporary support → fixed side rails → declared hard lands → permanent structure. Decoration, air plane and mineral board carry no luminaire or electrical enclosure.',
    electricalBoundary: 'Independent enclosed short riser, box and accessible corner; low run stops before retained door end piece. Separate data territory. Complete circuit/feed, protection, cable size, bend radius, earthing, thermal and penetration design remains an installation duty; no water/PV shared route or exposed custom live busbar.',
    release: ['Ordinary portable loads unplug before furniture movement.', 'Fixed light: identify circuit, isolate and prove dead; socket switching alone does not isolate it.',
      'Support module by temporary stand/tether, undo front screws, disconnect only inside manufacturer enclosure after isolation.',
      'Withdraw complete fitting/carrier normal to wall, park in clear first rest; adjacent wall panels and door reveal remain fixed.',
      'Decoration uses stopped joints around fixed electrical islands. Removing it leaves services independently enclosed/supported.',
      'Repair/refit retention, earthing, strain relief and closures, verify electrical safety and manual operation before reinstating.'],
    acousticCreditDb: null,
  }
  const construction = deriveLightingCornerDetail({ bayPlanMm: bay, jointMm: room.settingMm, totalDepthMm: request.serviceTotalDepthMm,
    fixedBoundaryMm: p.fixedBoundaryDepthMm, decorativeFaceMm: p.removableFaceDepthMm, bottomZMm: corner.bayBottomZMm, topZMm: 2100,
    moduleCentreZMm: W.positionMm[2], moduleSizeMm: corner.module.sizeMm, completeProjectionMm: corner.module.completeProjectionMm,
    moduleMassLimitKg: corner.module.authoredMassLimitKg, socketCentreZMm: request.socketCentreZMm, firstRestPlanMm: parking,
    normalDrawMm: p.panelRoomwardDrawMm, occupied: room.occupied, ceilingZMm: room.ceilingZMm,
    construction: components.cornerConstruction, boxSizeMm: corner.backBoxSizeMm, plateSizeMm: corner.plateSizeMm })
  const floorLampRadius = components.floorLamp.baseDiameterMm / 2
  const commonDepthCornerComparison = deriveCommonDepthCorner({ bayPlanMm: bay, coreFaceYMm: construction.coreFaceYMm,
    totalDepthMm: request.serviceTotalDepthMm, fixedBoundaryDepthMm: p.fixedBoundaryDepthMm, settingMm: room.settingMm, fixedRails: construction.fixedRails,
    legacyJunctionBodyDepthMm: construction.fixedEnclosures[2]!.bodyDepthMm,
    legacyJunctionAxisDepthMm: construction.fixedEnclosures[2]!.sideEntryAxisDepthMm,
    referenceBoxDepthMm: components.backBox.depthMm, accessoryBodyDepthMm: components.socket.bodyDepthMm,
    insertedPlugProjectionMm: components.plug.insertedProjectionMm, plateSizeMm: corner.plateSizeMm,
    socketCentreZMm: request.socketCentreZMm, switchCentreZMm: 1100, lightCentreZMm: W.positionMm[2],
    fieldBottomZMm: corner.bayBottomZMm, fieldTopZMm: 2100,
    routeDiameterMm: components.cornerConstruction.containmentOutsideDiameterMm,
    collarDiameterMm: components.cornerConstruction.entryCollarOutsideDiameterMm,
    collarLengthMm: components.cornerConstruction.entryCollarAxialLengthMm, mainRestPlanMm: parking,
    parkedModule: construction.firstRelease.parked, floorBandsMm: room.bands,
    occupiedPlanMm: [...room.occupied, ['reserved-floor-lamp', [floorBase[0] - floorLampRadius, floorBase[1] - floorLampRadius, floorBase[0] + floorLampRadius, floorBase[1] + floorLampRadius]]],
  }, components.commonDepthCornerCandidate)
  fail('IAS_LIGHTING_SUPPLY_INTERFACE_UNBOUND', 'Current occupied source has no bound Study feeder, protection or cable specification. The identified room interface remains unconnected; do not infer an installed circuit.', ['IAS/STUDY/room-supply-interface'])
  fail('IAS_LIGHTING_RISER_TRANSITION_UNRESOLVED', 'The three local entry branches have different depth axes. Their local bends and collars do not establish a connected common riser, junctions or depth transitions.', construction.containment.localEntryBranches.map(branch => branch.id))
  for (const issue of construction.issues) fail('IAS_LIGHTING_CONSTRUCTION_REJECTED', issue)
  return {
    schema: studyLightingMethod, status: diagnostics.some(d => /REJECTED|MISSING/.test(d.code)) ? 'GEOMETRY_REJECTED' : 'DEVELOPMENT_COMPARISON', request, source: basis.source,
    caseDigest: sha256SemanticFingerprint({ request, basis, components }), commonRoom: room, arrangements, selectedArrangement: selected.id, corner, serviceStations, fixedInterfaces, construction, commonDepthCornerComparison,
    leads: { desk: { pathMm: deskLead, routedMm: length(deskLead), suppliedMm: components.deskLamp.leadLengthMm }, floor: { pathMm: floorLead, routedMm: length(floorLead), suppliedMm: components.floorLamp.leadLengthMm },
      side: { pathMm: sideLead, routedMm: length(sideLead), suppliedMm: components.deskLamp.leadLengthMm }, authoredSlackMm: 200 },
    controls: { automationConnected: request.automationConnected, automationRequired: false, ordinaryArrivalWorking: !!selected.roles[0].liveSourceIds.length,
      ordinaryControl: 'Door-side ordinary switch operates fixed wall/ceiling or dedicated floor-lamp socket. Task lamps retain local controls. No dimmer compatibility is assumed.' },
    kitchen: { ...basis.kitchen, taskMm: task, taskPlaneAuthority: '750 mm authored table comparison plane, actual height/food suitability unmeasured',
      fixedFallback: { positionMm: [task[0], task[1], room.ceilingZMm], datumAuthority: 'Current occupied-storey ceiling reference; actual kitchen ceiling must be checked at coordinated technical issue',
        surfaceBaseDiameterMm: p.ceilingSurfaceBaseDiameterMm, fittingEnvelopeMm: p.ceilingCompleteFittingEnvelopeMm, wholeCeilingRequired: false },
      verdict: 'Retain fixed task lighting for central kitchen work. Portable leads across circulation/wet/hot work are rejected; wall-only central coverage/shadows remain unmeasured. Sink/hob/hood lighting keeps its own obligations.', photometricAdequacy: 'UNMEASURED' },
    evidence: { photometry: null, physicalTrial: null, materialAdmission: false, acousticImprovement: false, ownerAcceptance: false, anchorCapacity: false, electricalRelease: false, wholeCeilingMandated: false,
      craftedKitReopened: false, localInterfacesChanged: true }, diagnostics,
  } as const
}
export function compileStudyLighting(resolved: CurrentDesignResolution, input: unknown, kit: Projection) {
  return deriveStudyLighting(input, lightingBasis(resolved, kit), readLightingComponents())
}
export type StudyLightingResult = ReturnType<typeof deriveStudyLighting>
