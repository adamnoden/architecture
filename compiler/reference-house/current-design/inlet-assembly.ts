import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { exactSegmentBoxDistance, finiteBends } from '../../../project/had/studies/incoming-water-geometry.mjs'
import { pathSeparation } from '../../../project/had/studies/service-interface-geometry.mjs'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import { createSectionPaperProjection } from '../../publication-drawing/projection.js'
import type { DrawingSceneV2 } from '../../publication-drawing-v2/model.js'
import type { runInletCoverCase } from './inlet-cover.js'
import type { runInletFaultCase } from './inlet-fault.js'
import type { runInletRemovalCase } from './inlet-removal.js'
import type { runInletSillInsertCase } from './inlet-sill-insert.js'
import { compareSplitInletRoofs, readSplitRoofReferenceSettings } from './inlet-split-roof.js'
import type { CurrentDesignResolution } from './resolve.js'

type Point = readonly [number, number, number]
type Box = readonly [number, number, number, number, number, number]
type Branch = 'utility' | 'plant'
type Sources = {
  readonly insert: ReturnType<typeof runInletSillInsertCase>
  readonly fault: ReturnType<typeof runInletFaultCase>
  readonly removals: readonly ReturnType<typeof runInletRemovalCase>[]
  readonly covers: readonly ReturnType<typeof runInletCoverCase>[]
}
const branchIds = ['utility', 'plant'] as const
const root = 'project/had/studies/'
const round = (value: number) => Number(value.toFixed(4))
const settingMm = 10
const comparisonMm = 25
const radiusMm = 75
const suppliedInputs = ['south-inlet-under-sill', 'south-inlet-wet-box', 'utility-dry-bowl-release',
  'utility-wide-capture', 'current-house-services', 'incoming-water', 'inlet-fixed-station'] as const

function boundJson<T>(resolved: CurrentDesignResolution, name: string): T {
  const path = root + name + '.json'
  const expected = resolved.disciplineBindings.flatMap(binding => binding.identities[path] ? [binding.identities[path]] : [])
  const bytes = readFileSync(new URL('../../../' + path, import.meta.url))
  const actual = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex')
  if (!expected.length || expected.some(blob => blob !== actual)) throw new Error('Stale joined inlet source: ' + path)
  return JSON.parse(bytes.toString('utf8'))
}

function plantLegStart(points: readonly Point[]) {
  const legs = points.flatMap(([x, y, z], index) => {
    const before = points[index - 1], turn = points[index + 1], end = points[index + 2]
    return before && turn && end && before[0] === x && before[1] === y && before[2] < z
      && turn[0] > x && turn[1] === y && turn[2] === z && end[0] === turn[0] && end[1] > y && end[2] === z ? [index] : []
  })
  if (legs.length !== 1) throw new Error('The joined plant source requires one supported south leg')
  return legs[0]
}

export function readInletAssemblySettings(resolved: CurrentDesignResolution) {
  const source = boundJson<{ branches: { id: Branch; coordinates: Point[] }[] }>(resolved, 'south-inlet-under-sill')
  const plant = source.branches.find(branch => branch.id === 'plant')
  if (!plant) throw new Error('Missing joined plant route')
  return { plantSouthLegLevelMm: plant.coordinates[plantLegStart(plant.coordinates)][2], splitRoof: readSplitRoofReferenceSettings() }
}

function requireSources(sources: Sources) {
  if (!sources.insert || !sources.fault || sources.removals?.length !== 2 || sources.covers?.length !== 2) {
    throw new Error('The joined inlet requires the actual insert, fault, both removals and both covers from this document')
  }
  const insertDigest = sources.insert.source.caseDigest
  if (sources.fault.source.insertCaseDigest !== insertDigest) throw new Error('Joined inlet fault belongs to another insert')
  for (const branch of branchIds) {
    const removal = sources.removals.find(result => result.branch === branch)
    const cover = sources.covers.find(result => result.branch === branch)
    if (!removal || !cover || removal.source.insertCaseDigest !== insertDigest
        || cover.source.removalCaseDigest !== removal.source.caseDigest) {
      throw new Error('Joined inlet branch belongs to another insert or removal: ' + branch)
    }
  }
}

function routeDrawing(routes: Readonly<Record<Branch, readonly Point[]>>, digest: string): DrawingSceneV2 {
  const points = [...routes.utility, ...routes.plant]
  const horizontalBounds = { min: Math.min(...points.map(point => point[0])) - 100, max: Math.max(...points.map(point => point[0])) + 100 }
  const verticalBounds = { min: 0, max: Math.max(...points.map(point => point[2])) + 100 }
  const scaleDenominator = 20
  const project = createSectionPaperProjection({ scaleDenominator, horizontalBounds, verticalBounds, paperOrigin: { x: 12, y: 22 } })
  const heightMm = 58 + project.length(verticalBounds.max)
  const primitives: DrawingSceneV2['primitives'] = [
    { kind: 'text', id: 'joined-route-title', x: 12, y: 9, role: 'label', value: 'South inlet · pressure paths' },
    { kind: 'text', id: 'joined-route-scope', x: 12, y: 15, role: 'note', value: 'X/Z projection · conditional geometry · 1:20' },
    { kind: 'text', id: 'joined-route-utility-key', x: 12, y: heightMm - 19, role: 'note', value: 'Solid: Utility to washer' },
    { kind: 'text', id: 'joined-route-plant-key', x: 12, y: heightMm - 13, role: 'note', value: 'Dashed: Plant to factory cold port' },
    { kind: 'text', id: 'joined-route-sink-key', x: 12, y: heightMm - 7, role: 'note', value: 'Sink branch and 3D clearances: result schedule' },
  ]
  for (const branch of branchIds) {
    for (const [index, b] of routes[branch].slice(1).entries()) {
      const a = routes[branch][index]
      if (a[0] === b[0] && a[2] === b[2]) continue
      primitives.push({ kind: 'line', id: `${branch}-joined-route-${index}`,
        a: project.point(a[0], a[2]), b: project.point(b[0], b[2]), role: branch === 'utility' ? 'primary' : 'secondary', dash: branch === 'plant' ? 'provisional' : 'none',
        metadata: { caseDigest: digest, branch, fromXMm: a[0], fromYMm: a[1], fromZMm: a[2], toXMm: b[0], toYMm: b[1], toZMm: b[2] } })
    }
  }
  return { viewId: 'HAD-JOINED-INLET-ROUTES', sourceId: 'south-sill-inlet-assembly',
    title: 'Joined south inlet routes', description: 'Actual sill axes and wet-cell risers continue to the retained upper service routes. X/Z projection; clearances use the complete three-dimensional paths.',
    widthMm: 24 + project.length(horizontalBounds.max - horizontalBounds.min), heightMm,
    scaleDenominator, primitives }
}

export function compileInletAssembly(resolved: CurrentDesignResolution, input: unknown, sources: Sources) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(key => !['plantSouthLegLevelMm', 'splitRoof'].includes(key))
      || !Object.hasOwn(input, 'plantSouthLegLevelMm')) throw new Error('Expected an explicit joined inlet plant-leg setting')
  const { plantSouthLegLevelMm, splitRoof } = input as { plantSouthLegLevelMm: number; splitRoof?: unknown }
  requireSources(sources)
  const underSill = boundJson<{ branches: { id: Branch; coordinates: Point[]; bores: { outer: Point; inner: Point }[] }[] }>(resolved, 'south-inlet-under-sill')
  const wet = boundJson<{ branches: { id: Branch; access: { parkedRiserY: number; requiredDrawMM: number; releasedSpoolOutline: { x: [number, number] } } }[];
    installedColdPairAfterSettingMM: number; installedUtilityToRevisedHotAfterSettingMM: number }>(resolved, 'south-inlet-wet-box')
  const bowl = boundJson<{ capture: { clearSweeps: { stage: number; box: Box }[] } }>(resolved, 'utility-dry-bowl-release')
  const hot = boundJson<{ hot: { backbone: Point[]; terminal: Point[] } }>(resolved, 'utility-wide-capture')
  const services = boundJson<{ utility: { washer: [number, number, number, number]; washerFirstRest: [number, number, number, number]; PVworkingField: [number, number, number, number] } }>(resolved, 'current-house-services')
  const network = boundJson<{ utilitySuccessor: { vertices: { coldWasher: Point[]; coldSink: Point[] } } }>(resolved, 'incoming-water')
  const station = boundJson<{ paths: { removablePlantDrop: Point[]; exposedColdConnector: Point[] }; removal: { factoryColdPort: Point; completeDryLoadAndMotionProved: boolean } }>(resolved, 'inlet-fixed-station')
  const routes = {} as Record<Branch, Point[]>
  const pipeRadii = {} as Record<Branch, number>
  for (const branch of branchIds) {
    const native = underSill.branches.find(row => row.id === branch)
    const cell = wet.branches.find(row => row.id === branch)
    const bore = sources.insert.calculation.bores.find(row => row.id === branch + '-pressure')
    const removal = sources.removals.find(row => row.branch === branch)!
    if (!native || !cell || !bore || native.coordinates.length < 5) throw new Error('Missing continuous inlet branch: ' + branch)
    const [outer, inner] = bore.axis
    const carrierOffsetMm = native.coordinates[0][2] - native.bores[0].outer[2]
    const riserY = cell.access.parkedRiserY - cell.access.requiredDrawMM
    if (removal.calculation.dryBreak.xMm !== inner[0] || removal.calculation.dryBreak.yMm !== riserY) {
      throw new Error('Joined inlet carrier does not meet its retained riser: ' + branch)
    }
    const coordinates = native.coordinates.map(([x, y, z], index): Point => [
      index < 4 ? inner[0] : x,
      index >= 2 && index <= 4 ? riserY : y,
      index < 3 ? (index === 0 ? outer[2] : inner[2]) + carrierOffsetMm : z,
    ])
    pipeRadii[branch] = (cell.access.releasedSpoolOutline.x[1] - cell.access.releasedSpoolOutline.x[0]) / 2
    routes[branch] = coordinates
  }
  const p = routes.plant
  const start = plantLegStart(p)
  const nativeLevel = p[start][2]
  if (!Number.isFinite(plantSouthLegLevelMm) || Math.abs(plantSouthLegLevelMm - nativeLevel) > 50) {
    throw new Error('The joined plant leg must remain within 50 mm of its source level')
  }
  routes.plant = p.map((point, index) => index >= start && index <= start + 2 ? [point[0], point[1], plantSouthLegLevelMm] : point)
  const samePoint = (a: Point | undefined, b: Point | undefined) => !!a && !!b && a.every((value, index) => value === b[index])
  const continuity = [
    { id: 'utility-upper-to-washer', meets: samePoint(routes.utility.at(-1), network.utilitySuccessor.vertices.coldWasher[0]) },
    { id: 'utility-tee-to-sink', meets: network.utilitySuccessor.vertices.coldWasher.some(point => samePoint(point, network.utilitySuccessor.vertices.coldSink[0])) },
    { id: 'plant-upper-to-removable-drop', meets: samePoint(routes.plant.at(-1), station.paths.removablePlantDrop[0]) },
    { id: 'plant-drop-to-cold-connector', meets: samePoint(station.paths.removablePlantDrop.at(-1), station.paths.exposedColdConnector[0]) },
    { id: 'plant-connector-to-factory-port', meets: samePoint(station.paths.exposedColdConnector.at(-1), station.removal.factoryColdPort) },
  ]
  if (continuity.some(joint => !joint.meets)) throw new Error('The joined inlet pressure paths have disconnected ends: ' + continuity.filter(joint => !joint.meets).map(joint => joint.id).join(', '))
  const geometric = { utility: finiteBends(routes.utility, radiusMm), plant: finiteBends(routes.plant, radiusMm) }
  const hotRoutes = [finiteBends(hot.hot.backbone, radiusMm), finiteBends(hot.hot.terminal, 25)]
  const pair = (a: ReturnType<typeof finiteBends>, b: ReturnType<typeof finiteBends>, combinedRadius: number) =>
    round(pathSeparation(a.path, b.path) - combinedRadius - a.hausdorffError - b.hausdorffError - settingMm)
  const pairMm = pair(geometric.utility, geometric.plant, pipeRadii.utility + pipeRadii.plant)
  const utility = services.utility
  const washer: Box = [utility.washer[0], utility.washer[1], 0, utility.washer[2],
    utility.washerFirstRest[1] + utility.washerFirstRest[3] - utility.washer[1], sources.removals[0].calculation.washerEnvelopeMm[5]]
  const inverter: Box = [utility.PVworkingField[0], utility.PVworkingField[1], 0, utility.PVworkingField[2], utility.PVworkingField[3], 2800]
  const gapToBox = (branch: Branch, box: Box) => {
    const path = geometric[branch]
    return round(Math.min(...path.path.slice(1).map((end, index) => exactSegmentBoxDistance(path.path[index], end, box)))
      - pipeRadii[branch] - path.hausdorffError - settingMm)
  }
  const clearance = branchIds.map(branch => ({ branch,
    hotBackboneMm: pair(geometric[branch], hotRoutes[0], pipeRadii[branch] + pipeRadii.utility),
    hotTerminalMm: pair(geometric[branch], hotRoutes[1], pipeRadii[branch] + 25),
    washerThroughFirstRestMm: gapToBox(branch, washer), inverterWorkMm: gapToBox(branch, inverter),
    bowlTransport: bowl.capture.clearSweeps.map(({ stage, box }) => ({ stage, reserveMm: gapToBox(branch, box) })),
  }))
  const lowerTerminals = [network.utilitySuccessor.vertices.coldWasher, network.utilitySuccessor.vertices.coldSink].map(route => finiteBends(route, 25))
  const terminalToHotMm = Math.min(...lowerTerminals.flatMap(route => hotRoutes.map((h, index) => pair(route, h, 25 + (index === 0 ? pipeRadii.utility : 25)))))
  const routesClear = Math.min(pairMm, terminalToHotMm, ...clearance.flatMap(row => [row.hotBackboneMm, row.hotTerminalMm,
    row.washerThroughFirstRestMm, row.inverterWorkMm, ...row.bowlTransport.map(stage => stage.reserveMm)])) >= comparisonMm
  const inputs = suppliedInputs.map(name => ({ path: root + name + '.json', gitBlob: resolved.disciplineBindings.flatMap(binding =>
    binding.identities[root + name + '.json'] ? [binding.identities[root + name + '.json']] : [])[0] }))
  const method = { id: 'HAD-JOINED-INLET/1', gitBlob: resolved.disciplineBindings.find(binding => binding.id === 'had-inlet-south-removal')!
    .identities['compiler/reference-house/current-design/inlet-assembly.ts'] }
  const caseDigest = sha256SemanticFingerprint({ input, inputs, method, insert: sources.insert.source.caseDigest,
    fault: sources.fault.source.caseDigest, removals: sources.removals.map(row => row.source.caseDigest), covers: sources.covers.map(row => row.source.caseDigest) })
  const utilityRoom = resolved.design.storeys.GROUND.rooms.find(room => room.id === 'GROUND/G-UTILITY')
  if (utilityRoom?.boxes.length !== 1) throw new Error('The split roof requires the bound rectangular Utility')
  const upperClosure = Object.hasOwn(input, 'splitRoof') ? compareSplitInletRoofs(splitRoof, sources.removals, utilityRoom.boxes[0]) : null
  const branches = branchIds.map(branch => {
    const removal = sources.removals.find(row => row.branch === branch)!
    const cover = sources.covers.find(row => row.branch === branch)!
    const fault = sources.fault.branchCases.find(row => row.id === branch)!
    const split = upperClosure?.branches.find(row => row.branch === branch)
    const closureBlockers = split ? split.diagnostics : [
      ...(cover.status === 'blocked' ? cover.diagnostics.map(row => row.code) : []),
      ...cover.installedClosure.diagnostics, ...(cover.roundedRelease?.diagnostics ?? []),
    ]
    const blockers = [
      ...(removal.status === 'blocked' ? removal.diagnostics.map(row => row.code) : []),
      ...closureBlockers,
      ...(fault.status === 'within-conditional-open-flow' ? [] : [fault.status]),
    ]
    return { branch, routeMm: routes[branch], dryBreak: removal.calculation.dryBreak, sourceCaseDigests: {
      removal: removal.source.caseDigest, cover: cover.source.caseDigest, fault: sources.fault.source.caseDigest },
      geometryBlockers: [...new Set(blockers)],
      closedWetBoundary: split ? 'split-roof-fit-wet-seams-unqualified' : cover.installedClosure.status,
      sourceFailure: { upperMouth: 'blocked', lowerReliefAndHighHood: fault.status, manualClosureCredited: false },
      serviceSequence: [
        'Close the subject Lodge branch and dry local cut; prove both sides at zero pressure and drain separately.',
        'Restrain the washer at its first rest and exclude occupied, purge and electrical work fields.',
        'Keep the sibling fixed trough, cover, high hood, lower relief and independent receiver closed and available.',
        'Support both retained pipe ends; disengage and retract the actual dry companion before moving the carrier.',
        'Hold and detach the subject upper closure, target and collar; keep the fixed lower trough intact.',
        `Maintain positive support through the ${removal.calculation.drawMm} mm straight draw and captured first rest.`,
        'Restore all pressure and wet boundaries, prove seals and unobstructed relief/vent before reopening the cuts.',
      ],
      isolatedServiceEvidence: 'declared-sequence-not-installed-proof',
    }
  })
  const geometryBlockers = [
    ...(routesClear ? [] : ['JOINED_OCCUPIED_ROUTE_CLEARANCE']),
    ...(sources.insert.status === 'within-conditional-screen' ? [] : ['SILL_INSERT_GEOMETRY']),
    ...branches.flatMap(row => row.geometryBlockers.map(code => row.branch + ':' + code)),
  ]
  return {
    schema: 'had-inlet-assembly-result/1' as const,
    disposition: geometryBlockers.length ? 'reject-current-arrangement' as const : 'conditional-arrangement-incomplete' as const,
    source: { planDigest: sources.insert.source.planDigest, insertCaseDigest: sources.insert.source.caseDigest, caseDigest,
      inputs }, method,
    routeCalculation: { plantSouthLegLevelMm, nativeLevelMm: nativeLevel, settingMm, comparisonMm, bendRadiusMm: radiusMm,
      pairClearanceMm: pairMm, terminalToHotMm, branches: clearance, routesClear,
      nativeWetBoxControl: { pairClearanceMm: wet.installedColdPairAfterSettingMM, utilityHotMm: wet.installedUtilityToRevisedHotAfterSettingMM } },
    branches, geometryBlockers, upperClosure,
    displacedCoverComparison: upperClosure ? { state: 'historical-comparison-only', cases: sources.covers.map(row => row.source.caseDigest) } : null,
    pressureNetwork: { continuity, utilityWasherTerminalMm: network.utilitySuccessor.vertices.coldWasher,
      utilitySinkTerminalMm: network.utilitySuccessor.vertices.coldSink, plantRemovableDropMm: station.paths.removablePlantDrop,
      plantColdConnectorMm: station.paths.exposedColdConnector, factoryColdPortMm: station.removal.factoryColdPort,
      terminalMotionProved: station.removal.completeDryLoadAndMotionProved,
      completeRouteToNamedEndpoints: true, installedContinuityAndRatedConnectionsProved: false },
    independentSupport: { upperClosure: upperClosure ? 'two handheld flat plates; full U-lid receiver and guides retired' : 'whole-lid receiver and capture unqualified', windowSill: sources.insert.calculation.loads, carrierAndWetCells: 'separate-anchored-support-not-qualified',
      pressureReactionMustNotUse: ['removable wet closure', 'window sash', 'sibling wet cell', 'finish backing'] },
    materialBoundary: { pressureTube: 'continuous metallic candidate; matched fittings and complete potable pressure rating outstanding',
      wetLiner: 'continuously joined metal; complete seams and corrosion compatibility outstanding',
      sealsInsulationAndCollars: 'constituents and policy exceptions require MAT admission',
      noBlanketMaterialAcceptance: true },
    occupiedConsequences: { ordinaryRouteRetained: routesClear, washerMovementBeforeBranchRenewal: true,
      liveSiblingConditionalOnIndependentFixedBoundaries: true, upstreamStopRenewal: 'B0 plus downstream isolation and proved drain',
      failureAheadOfB0: 'provider-controlled upstream action; no private stop credit',
      unattendedPressureFault: 'separate passive receiver; finite maintenance pan and manual isolation receive no fault credit' },
    remainingProof: [
      { owner: 'HAD/MAT', stage: 'pre-site arrangement', obligation: upperClosure ? 'Complete retained pressure-end disconnect and reaction supports; direct split collar, seam and captive-retainer wet detail. The oversized filler and full-lid rest are retired.' : 'Complete rated dry connection, split filler/collar wet closure and hand/tool release; ordinary operating access with covers closed.' },
      { owner: 'STR/HAD', stage: 'pre-site arrangement', obligation: 'Actual independent sleeve/trough/receiver/guide sections, anchored pressure and handling reactions, retained sub-sill restraint and full barrier continuity.' },
      { owner: 'HAD/IAS/MRA', stage: 'pre-site arrangement', obligation: upperClosure ? 'Complete the carrier mass/reaction envelope, independent guided draw and captured carrier rest, branch isolation and restoration. Split roof plates use the dimensioned hand route and conservative authored mass budgets.' : 'Complete carried mass, hand loads and positive captured transfer, carrier and cover rest, branch isolation and restoration on the joined geometry.' },
      { owner: 'DPL/HAD', stage: 'plot acceptance', obligation: 'Actual provider pressure/flow, lengths, frost protection, dry access and independent lawful receiver tailwaters.' },
      { owner: 'MAT/PHY/MRA', stage: 'installation and occupied use', obligation: 'Qualified constituents and separate assembled blocked-upper-mouth, hood, relief, wet impact, loaded handling and reinstatement challenges.' },
    ],
    evidence: { preSiteArrangementComplete: false, selectedInlet: false, installedAcceptance: false,
      preparationBooleansAreEvidence: false, simultaneousStageResultsAreWholeSystemProof: false },
    drawing: routeDrawing({ utility: [...routes.utility, ...network.utilitySuccessor.vertices.coldWasher.slice(1)],
      plant: [...routes.plant, ...station.paths.removablePlantDrop.slice(1), ...station.paths.exposedColdConnector.slice(1)] }, caseDigest),
  }
}
