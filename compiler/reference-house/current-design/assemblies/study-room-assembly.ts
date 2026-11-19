import { sha256SemanticFingerprint } from '../../../core/identity.js'
import type { StudyRoomKit } from './study-room-kit.js'
import type { compileStudyWallTransition } from './study-wall-transition.js'

type Box = readonly [number, number, number, number]
type Edge = { readonly id: string; readonly axis: 'x' | 'y'; readonly fixedMm: number; readonly fromMm: number; readonly toMm: number; readonly normal: -1 | 1; readonly sourceWallId: string }
type Transition = ReturnType<typeof compileStudyWallTransition>
type Basis = Pick<StudyRoomKit, 'bands' | 'wall' | 'opening' | 'door' | 'grilleKeepOut' | 'request' | 'source' | 'floor' | 'occupied'>

const design = {
  cornerStopMm: 50, jointMm: 3, bottomMm: 150, topMm: 2970,
  timberRowsMm: [150, 900, 2730, 2970], tileRowMaximumMm: 450,
  releasePocketMm: 20, settingMm: 5, releaseMm: 10, roomwardDrawMm: 40,
  maximumMovingDepthMm: 10.5, maximumModuleKg: 10, trimMaximumLengthMm: 600,
  oakKgPerM3: 650, porcelainKgPerM3: 2400, steelKgPerM3: 7850, beddingKgPerM3: 2700,
} as const

function edges(bands: readonly Box[]): Edge[] {
  if (bands.length !== 3 || !bands.every(band => band.every(Number.isFinite))
    || bands.some((band, index) => band[0] !== bands[0][0] || (index && band[1] !== bands[index - 1][3]))
    || !(bands[0][2] > bands[1][2] && bands[1][2] > bands[2][2])) {
    throw new RangeError('UNSUPPORTED_STUDY_ROOM_ASSEMBLY_BANDS')
  }
  const [a, b, c] = bands
  return [
    { id: 'south', sourceWallId: 'outer-S', axis: 'x', fixedMm: a[1], fromMm: a[0], toMm: a[2], normal: 1 },
    { id: 'east-neck', sourceWallId: 'wall:study-east', axis: 'y', fixedMm: a[2], fromMm: a[1], toMm: a[3], normal: -1 },
    { id: 'cloak-south', sourceWallId: 'wall:cloak-south', axis: 'x', fixedMm: a[3], fromMm: b[2], toMm: a[2], normal: -1 },
    { id: 'cloak-west', sourceWallId: 'wall:cloak-west', axis: 'y', fixedMm: b[2], fromMm: b[1], toMm: b[3], normal: -1 },
    { id: 'cloak-north-return', sourceWallId: 'wall:study-cloak-north', axis: 'x', fixedMm: b[3], fromMm: c[2], toMm: b[2], normal: -1 },
    { id: 'door-east-return', sourceWallId: 'wall:study-L-return', axis: 'y', fixedMm: c[2], fromMm: c[1], toMm: c[3], normal: -1 },
    { id: 'north-door', sourceWallId: 'wall:study-L-north', axis: 'x', fixedMm: c[3], fromMm: c[0], toMm: c[2], normal: -1 },
    { id: 'west', sourceWallId: 'outer-W', axis: 'y', fixedMm: a[0], fromMm: a[1], toMm: c[3], normal: 1 },
  ]
}

function subtract(box: Box, aperture: Box): readonly Box[] {
  const [a, b, c, d] = box
  const [x, y, z, w] = aperture
  const left = Math.max(a, x), right = Math.min(c, z), bottom = Math.max(b, y), top = Math.min(d, w)
  if (left >= right || bottom >= top) return [box]
  const parts: Box[] = [[a, b, left, d], [right, b, c, d], [left, b, right, bottom], [left, top, right, d]]
  return parts.filter(([x0, z0, x1, z1]) => x1 > x0 && z1 > z0)
}

function divisions(from: number, to: number, maximum: number): readonly number[] {
  const count = Math.ceil((to - from) / maximum)
  return Array.from({ length: count + 1 }, (_, index) => from + (to - from) * index / count)
}

export function compileStudyRoomAssembly(kit: Basis, transition: Transition) {
  const widthMm = kit.request.wallPanelWidthMm ?? 420
  const face = kit.request.wallFace ?? 'oak'
  const releaseMm = kit.request.wallReleaseMm ?? design.releaseMm
  const rows: readonly number[] = face === 'oak' ? design.timberRowsMm
    : design.timberRowsMm.slice(1).reduce<number[]>((result, end) => [...result, ...divisions(result.at(-1)!, end, design.tileRowMaximumMm).slice(1)], [design.bottomMm])
  const surfaceKgPerM2 = face === 'oak' ? design.maximumMovingDepthMm * design.oakKgPerM3 / 1000
    : (6 * design.porcelainKgPerM3 + 3 * design.steelKgPerM3 + 1.5 * design.beddingKgPerM3) / 1000
  const roomEdges = edges(kit.bands)
  const boundWindows = kit.wall.boundRoomOpenings
  if (boundWindows.length !== 3 || !boundWindows.some(window => 'GROUND/' + window.id === kit.opening.id)
    || !boundWindows.some(window => window.wall === 'outer-west')) throw new TypeError('MISSING_BOUND_STUDY_ROOM_ASSEMBLY_OPENING')
  const windows = boundWindows.map(window => ({ id: 'GROUND/' + window.id, wall: window.wall,
    box: ('GROUND/' + window.id === kit.opening.id ? kit.opening.box
      : [window.centre - window.width / 2, window.sill, window.centre + window.width / 2, window.head]) as Box }))
  const emitter = kit.occupied.find(([id]) => id === 'service-emitter-study-W')
  if (!emitter) throw new TypeError('MISSING_BOUND_STUDY_ROOM_ASSEMBLY_EMITTER')
  const reserves = (edge: Edge) => [
    ...(edge.id === 'west' ? [{ id: emitter[0], role: 'retained-emitter-background' as const,
      box: [emitter[1][1] - 25, 0, emitter[1][3] + 25, transition.field.ceilingZMm] as Box }] : []),
    ...windows.filter(window => window.wall === 'outer-' + edge.id).map(window => ({ ...window, role: 'retained-mineral-window-surround' as const,
      box: [window.box[0] - design.cornerStopMm, window.box[1] - design.cornerStopMm, window.box[2] + design.cornerStopMm, window.box[3] + design.cornerStopMm] as Box })),
    ...(edge.id === 'south' ? [{ id: kit.grilleKeepOut.id, role: 'independent-service-opening' as const, box: kit.grilleKeepOut.box }] : []),
    ...(edge.id === 'north-door' ? [{ id: kit.door.id, role: 'retained-protected-door-strip' as const,
      box: [kit.door.rough[0] - design.cornerStopMm, 0, kit.door.rough[1] + design.cornerStopMm, transition.field.ceilingZMm] as Box }] : []),
  ]
  const walls = roomEdges.map(edge => {
    const kept = reserves(edge)
    const fieldStart = edge.fromMm + design.cornerStopMm, fieldEnd = edge.toMm - design.cornerStopMm
    const architecturalDatums = [fieldStart, fieldEnd, ...kept.filter(reserve => reserve.role !== 'independent-service-opening')
      .flatMap(reserve => [reserve.box[0], reserve.box[2]]).filter(value => value > fieldStart && value < fieldEnd)]
      .sort((a, b) => a - b).filter((value, index, sorted) => index === 0 || value !== sorted[index - 1])
    const columns = architecturalDatums.slice(1).reduce<number[]>((result, end) => [
      ...result, ...divisions(result.at(-1)!, end, widthMm).slice(1),
    ], [fieldStart])
    const pieces = columns.slice(1).flatMap((right, column) => rows.slice(1).flatMap((top, row) => {
      const zone: Box = [columns[column], rows[row], right, top]
      const boxes = kept.reduce<readonly Box[]>((parts, reserve) => parts.flatMap(part => subtract(part, reserve.box)), [zone])
      return boxes.map((box, cut) => {
        const id = `${kit.source.roomId}/room-kit/wall/${edge.id}/${column}/${row}/${cut}`
        const [x0, z0, x1, z1] = box
        const slim = x1 - x0 < 80 || z1 - z0 < design.releasePocketMm + 60
        const faceBox: Box = [x0 + design.jointMm / 2, z0 + design.jointMm / 2, x1 - design.jointMm / 2,
          z1 - (slim ? design.jointMm / 2 : design.releasePocketMm)]
        const sizeMm = [faceBox[2] - faceBox[0], faceBox[3] - faceBox[1]] as const
        const movingKg = sizeMm[0] * sizeMm[1] * surfaceKgPerM2 / 1e6
        return { id, box, faceBox, sizeMm, movingKg, family: slim ? 'roomward-screwed-edge-piece' as const : 'gravity-hung-cassette' as const,
          releaseMm: slim ? 0 : releaseMm, roomwardDrawMm: design.roomwardDrawMm,
          localStopId: `${id}/release-rail`, independentOfAdjacentPanels: true,
          supports: slim ? { method: 'positive-roomward-screws' as const, capacity: 'unqualified' as const }
            : { method: 'two-independent-hard-lands' as const, capacity: 'unqualified' as const,
              totalGravityN: movingKg * 9.81, oneLandLossN: movingKg * 9.81 },
          evidence: kit.opening.relation === 'native' || edge.id !== 'south' ? 'candidate-unqualified' as const : 'opening-details-stale' as const }
      })
    }))
    const trimRanges = edge.id === 'north-door' ? [[edge.fromMm, kit.door.rough[0]], [kit.door.rough[1], edge.toMm]]
      : edge.id === 'west' ? [[edge.fromMm, emitter[1][1] - 25], [emitter[1][3] + 25, edge.toMm]] : [[edge.fromMm, edge.toMm]]
    const protectedEnds = edge.id === 'north-door' ? transition.field.retainedSkirtingEndPiecesXMm ?? [] : []
    const trims = trimRanges.flatMap(([from, to], range) => {
      const protectedCuts = protectedEnds.flatMap(piece => [...piece]).filter(value => value > from && value < to)
      const cuts = [from, ...protectedCuts, to].sort((a, b) => a - b)
      return cuts.slice(1).flatMap((last, section) => {
        const first = cuts[section]
        const inherited = protectedEnds.some(([a, b]) => a === first && b === last)
        const split = inherited ? [first, last] : divisions(first, last, design.trimMaximumLengthMm)
        return split.slice(1).map((end, index) => ({ id: `${kit.source.roomId}/room-kit/trim/${edge.id}/${range}/${section}/${index}`,
          intervalMm: [split[index], end], heightMm: design.bottomMm, firstDrawMm: inherited ? transition.field.retainedSkirtingFirstDrawMm! : design.roomwardDrawMm,
          inheritedProtectedEnd: inherited, projectionMm: 18,
          retention: 'roomward-accessible-screws', joinedMitre: false, serviceSupport: false, boundaryDisturbed: false }))
      })
    })
    return { ...edge, retainedCornerStopMm: design.cornerStopMm, reserves: kept, pieces, trims }
  })
  const pieces = walls.flatMap(wall => wall.pieces)
  const oversized = pieces.filter(piece => piece.movingKg > design.maximumModuleKg)
  const releaseReserveMm = design.releasePocketMm - design.settingMm - releaseMm
  const diagnostic = (code: string, objectIds: readonly string[]) => ({ code, objectIds, severity: 'error' as const })
  const diagnostics = [
    ...(!transition.field.retainedSkirtingEndPiecesXMm ? [diagnostic('IAS_ROOM_KIT_PROTECTED_DOOR_SOURCE_UNAVAILABLE', [kit.door.id])] : []),
    ...(releaseReserveMm < 0 ? [diagnostic('IAS_ROOM_KIT_INDEPENDENT_RELEASE_POCKET_EXCEEDED', pieces.filter(piece => piece.family === 'gravity-hung-cassette').map(piece => piece.id))] : []),
    ...(oversized.length ? [diagnostic('IAS_ROOM_KIT_COMPLETE_FACE_MASS_LIMIT_EXCEEDED', oversized.map(piece => piece.id))] : []),
    ...(!transition.fitUm.maximumStack.admitted ? [diagnostic('IAS_ROOM_KIT_SHARED_WALL_DEPTH_UNSUPPORTED', [kit.wall.id])] : []),
  ]
  const catalogue = kit.floor.firstRestBoardTrial && 'boardCatalogue' in kit.floor.firstRestBoardTrial ? kit.floor.firstRestBoardTrial.boardCatalogue : null
  const ordinary = kit.floor.ordinaryHandling
  const releaseRequests = ordinary && ordinary.state !== 'source-withheld' ? ordinary.parts.flatMap(row => {
    if (row.state !== 'joined-geometry-witness' || !row.trimReleases?.length || !row.boardXYXYMm) return []
    const sourcePart = kit.floor.parts.find(part => part.id === row.partId)!
    const boxes = [row.boardXYXYMm, ...(row.staging?.placement?.carriedXYXYMm ? [row.staging.placement.carriedXYXYMm] : []),
      ...[[0, 0], ...(row.panelPathWaypointDeltasMm ?? [])].map(delta => [sourcePart.face[0] + delta[0], sourcePart.face[1] + delta[1], sourcePart.face[2] + delta[0], sourcePart.face[3] + delta[1]] as Box)]
    const accessEnvelope: Box = [Math.min(...boxes.map(box => box[0])), Math.min(...boxes.map(box => box[1])),
      Math.max(...boxes.map(box => box[2])), Math.max(...boxes.map(box => box[3]))]
    return [{ partId: row.partId, stage: row.stage!, boardXYXYMm: row.boardXYXYMm, accessEnvelope, trimReleases: row.trimReleases }]
  }) : catalogue?.localWallTrimReleased.placements.filter(row => row.trimReleases.length).map(row => ({ ...row, accessEnvelope: row.boardXYXYMm })) ?? []
  const trimReleaseBindings = releaseRequests.map(row => ({
    partId: row.partId, stage: row.stage, boardXYXYMm: row.boardXYXYMm, releases: row.trimReleases.map(obstacleId => {
      const edge = walls.find(wall => obstacleId === wall.sourceWallId || obstacleId.startsWith(wall.sourceWallId + ':'))
      const tangent = edge?.axis === 'x' ? 0 : 1
      const trims = edge?.trims.filter(trim => trim.intervalMm[0] < row.accessEnvelope[tangent + 2] && trim.intervalMm[1] > row.accessEnvelope[tangent]) ?? []
      return { obstacleId, wallId: edge?.id ?? null, trimIds: trims.map(trim => trim.id),
        localGeometry: trims.map(trim => ({ intervalMm: trim.intervalMm, firstDrawMm: trim.firstDrawMm, inheritedProtectedEnd: trim.inheritedProtectedEnd })),
        physicalAccessQualified: false }
    }),
  })) ?? []
  const unmatchedTrimBindings = trimReleaseBindings.flatMap(row => row.releases.filter(release => !release.trimIds.length))
  if (unmatchedTrimBindings.length) diagnostics.push(diagnostic('IAS_ROOM_KIT_TRIM_DEPENDENCY_UNBOUND', unmatchedTrimBindings.map(release => release.obstacleId)))
  const source = { roomId: kit.source.roomId, bindingDigest: kit.source.bindingDigest, jointInterfaceDigest: sha256SemanticFingerprint(trimReleaseBindings),
    inputDigest: sha256SemanticFingerprint({ bands: kit.bands, emitter, windows, door: kit.door, grille: kit.grilleKeepOut,
      widthMm, face, releaseMm, design, depth: transition.fitUm }), method: 'ias-whole-study-assembly/1' }
  return {
    schema: 'ias-whole-study-assembly/1', units: 'mm', state: diagnostics.length ? 'geometry-rejected' : 'candidate-unqualified',
    source, face, widthMm, releaseMm, design, rowsMm: rows, walls, trimReleaseBindings,
    serviceAccess: { id: kit.grilleKeepOut.id + '/local-cover', hostId: 'south', boxXZMm: kit.grilleKeepOut.box,
      retention: 'roomward-accessible-screws', ownIndependentSupport: true,
      containsRetainedG1Grille: true, carriesCartridgeOrCarrierLoad: false, installedConstituentsAndHandling: 'unqualified' },
    structuralActions: walls.map(wall => ({ sourceWallId: wall.sourceWallId, wallId: wall.id,
      movingFaceGravityN: wall.pieces.reduce((sum, piece) => sum + piece.movingKg * 9.81, 0),
      omitted: ['fixed rails, stops, anchors, backing and independent service cover'], structuralAcceptance: 'not-assessed' as const })), releaseReserveMm, diagnostics,
    schedule: { wallCount: walls.length, movingFaceCount: pieces.length,
      hungFaces: pieces.filter(piece => piece.family === 'gravity-hung-cassette').length,
      screwedEdgeFaces: pieces.filter(piece => piece.family === 'roomward-screwed-edge-piece').length,
      floorLevelTrimCount: walls.reduce((sum, wall) => sum + wall.trims.length, 0),
      completeFaceMassKg: pieces.reduce((sum, piece) => sum + piece.movingKg, 0), maximumFaceMassKg: Math.max(...pieces.map(piece => piece.movingKg)),
      fixedProtectiveReturns: windows.map(window => window.id).concat(kit.door.id),
    },
    layersMm: { fixedAirPlane: .5, fixedSetting: .5, fixedMineralMaximum: 6.5, rail: 6.35, fitting: 2,
      movingFace: face === 'oak' ? { oakComplete: 10.5 } : { porcelain: 6, steelTray: 3, mineralBedding: 1.5 },
      maximumTotalBeforeMeasuredPack: transition.fitUm.stackUm / 1000, retainedFinishDatum: kit.wall.referenceDepthMm },
    removal: [
      'Park furniture using the bound occupied-room sequence; isolate only affected service work.',
      'Undo the selected local moulding and anti-lift screws from the room; retain the moulding with the module identity.',
      'For a hung cassette lift within its own pocket, then draw roomward; adjacent cassettes and cornice remain installed.',
      'For a narrow edge face undo its roomward screws and draw straight forward without vertical lift.',
      'Support the complete face on a protected first rest; fixed returns, independent service carriers and protective backing stay in place.',
      'Refit on both hard lands, restore the local positive restraint, check flushness and record any damaged edge or lost retainer.',
    ],
    claims: { ownerAestheticApproval: false, installedLoadOrBoundaryAcceptance: false, wholeFloorHandlingAcceptance: false,
      oneHourInstallationAchieved: false, tileWetRoomAcceptance: false },
    remaining: [
      'Complete panel, anchor, fixed air-plane collar and non-plastic constituent qualification; tile tray adhesion and restrained edge tests.',
      'Hand/tool clearance, loaded release and first-rest access at each occupied wall; geometry is a local release proposal, not a carried-body simulation.',
      'Floor substrate and depth; full module release, installed G1 support heights, remaining southeast strips and board placement.',
      'Owner comparison with the fixed-room proposal after joined house integration. Wet-room waterproofing stays outside this dry Study tile variant.',
    ],
  } as const
}

export function drawStudyRoomAssembly(result: ReturnType<typeof compileStudyRoomAssembly>) {
  if (result.state === 'geometry-rejected') return null
  const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')
  const colour = result.face === 'oak' ? '#ad8661' : '#c5c0b3'
  const scale = .085
  const elevations = result.walls.map((wall, index) => {
    const x = 40 + (index % 4) * 430, y = 200 + Math.floor(index / 4) * 420
    const p = ([s, z]: readonly number[]) => [x + (s - wall.fromMm) * scale, y + (3100 - z) * scale]
    const rect = (box: Box, fill: string, stroke = '#776953') => {
      const [a, b] = p([box[0], box[3]])
      return `<rect x="${a}" y="${b}" width="${(box[2] - box[0]) * scale}" height="${(box[3] - box[1]) * scale}" fill="${fill}" stroke="${stroke}" stroke-width=".7"/>`
    }
    return `<g><text x="${x}" y="${y - 25}" class="name">${escape(wall.id)} · ${wall.toMm - wall.fromMm} mm</text>`
      + rect([wall.fromMm, 0, wall.toMm, 3100], '#e8e1d1')
      + wall.reserves.map(reserve => rect(reserve.box, '#d8ded7', '#56645d')).join('')
      + wall.pieces.map(piece => `<g id="${escape(piece.id)}">${rect(piece.faceBox, colour)}<title>${escape(piece.id)}; ${piece.movingKg.toFixed(2)} kg; ${piece.family}</title></g>`).join('')
      + wall.trims.map(trim => rect([trim.intervalMm[0], 0, trim.intervalMm[1], trim.heightMm], '#80694f')).join('')
      + `<text x="${x}" y="${y + 290}" class="small">${wall.pieces.length} moving faces · ${wall.trims.length} local skirts</text></g>`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1320" viewBox="0 0 1800 1320" role="img" aria-labelledby="title desc"><title id="title">The whole Study: ${result.face === 'oak' ? 'timber' : 'tiled'} wall kit</title><desc id="desc">Eight source-bound wall elevations, with retained protected openings and local release pockets. Candidate local release geometry only; installed load and occupied handling remain unqualified.</desc><metadata>${result.source.inputDigest}</metadata><style>text{font-family:Arial;fill:#302d27}.title{font:36px Georgia}.name{font:21px Georgia}.small{font-size:16px}.body{font-size:20px}</style><rect width="1800" height="1320" fill="#f7f2e7"/><text x="40" y="60" class="title">The whole Study · ${result.face === 'oak' ? 'hung timber faces' : 'independently tiled trays'}</text><text x="40" y="100" class="body">${result.schedule.movingFaceCount} moving wall faces · ${result.schedule.floorLevelTrimCount} separate skirts · maximum face ${result.schedule.maximumFaceMassKg.toFixed(2)} kg</text><text x="40" y="135" class="body">Open the local moulding, lift ${result.releaseMm} mm, draw ${result.design.roomwardDrawMm} mm. Adjacent faces stay installed.</text>${elevations}<path d="M40 1050H1760" stroke="#9e9686"/><text x="40" y="1090" class="name">A separate release pocket at every row</text><text x="40" y="1125" class="body">20 mm local pocket − 5 mm setting − ${result.releaseMm} mm lift = ${result.releaseReserveMm} mm reserve.</text><text x="40" y="1160" class="body">Local positive stops prevent lift. Narrow cut faces draw forward on accessible screws.</text><text x="40" y="1195" class="body">Corners and protected returns stay fixed. Services and the cornice have independent positive support.</text><text x="40" y="1245" class="small">Reference proposal · wall anchors, sealed backing, occupied handling and complete moving assemblies remain unqualified.</text><text x="40" y="1275" class="small">${result.face === 'oak' ? 'Dry Study timber variant.' : 'Dry Study tiled variant.'} Wet-room performance, whole-floor access and owner acceptance remain separate.</text></svg>\n`
}
