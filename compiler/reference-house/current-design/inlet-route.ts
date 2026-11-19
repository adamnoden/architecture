import { readFileSync } from 'node:fs'
import { exactSegmentBoxDistance, finiteBends } from '../../../project/had/studies/incoming-water-geometry.mjs'
import { pathSeparation } from '../../../project/had/studies/service-interface-geometry.mjs'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import { createPlanPaperProjection } from '../../publication-drawing/projection.js'
import type { DrawingSceneV2 } from '../../publication-drawing-v2/model.js'
import type { CurrentDesignResolution } from './resolve.js'

type Point = readonly [number, number, number]
type Route = readonly Point[]
type Scope = 'indoor-reference' | 'south-development'
type InletDiagnostic = {
  readonly objectId: 'P0' | 'U0'
  readonly code: 'INSTALLED_INLET_OUTSIDE_SCOPE' | 'UNCHANGED_SERVICE_INTERFACES_REQUIRE_PROOF' | 'SUPERSEDED_UTILITY_HOT_ROUTE'
  readonly message: string
}

const base = 'project/had/studies/'
const nativePaths = [base + 'incoming-water-geometry.mjs', base + 'service-interface-geometry.mjs']
const pairClearance = 25
const comparisonSetting = 10
const bendRadius = 75
const report = (value: number) => Math.round(value * 100) / 100
const read = <T>(path: string): T =>
  JSON.parse(readFileSync(new URL('../../../' + base + path + '.json', import.meta.url), 'utf8'))

interface InletRouteCase {
  readonly schema: 'had-inlet-route-case/1'
  readonly scope: Scope
  readonly planDigest: string
  readonly bindingDigest: string
  readonly plantSouthLegLevelMm: number | null
}

function reference(resolved: CurrentDesignResolution, scope: Scope) {
  const id = scope === 'indoor-reference' ? 'had-inlet-indoor-reference' : 'had-inlet-south-development'
  const binding = resolved.disciplineBindings.find(binding => binding.id === id)
  if (!binding) throw new Error('The inlet routes require the exact current design and an applicable HAD binding')

  const network = read<{
    utility: {pipeR: number; vertices: {hot: Route}};
    utilitySuccessor: {vertices: {coldWasher: Route; coldSink: Route}};
  }>('incoming-water')
  const revised = read<{hot: {backbone: Route; terminal: Route}}>('utility-wide-capture')
  const occupied = read<{utility: {washer: number[]; washerFirstRest: number[]}}>('current-house-services')
  const bowl = read<{
    capture: {clearSweeps: {stage: number; box: number[]}[]};
    independentSupport: {
      straightAxis: Route; armBottom: number; armTop: number;
      standardTrolley: {actualAuthorFlangeMM: number[]};
    }
  }>('utility-dry-bowl-release')
  const pipeRadius = network.utility.pipeR
  const { washer: [x, y, width], washerFirstRest: [, restY,, restDepth] } = occupied.utility
  const kit = { binding, pipeRadius, hot: revised.hot, earlierHot: network.utility.vertices.hot,
    bowl: bowl.capture.clearSweeps, rail: bowl.independentSupport,
    washerSweep: [x, y, 0, width, restY + restDepth - y, 848],
    lowerCold: network.utilitySuccessor.vertices }

  if (scope === 'indoor-reference') {
    const fixed = read<{paths: {utility: Route; plant: Route; jointFreeSpool: Route}; separations: {utilityAndPlantMM: number}}>('inlet-fixed-station')
    const rewind = read<{trialInterior: {wall: readonly [number, number]}}>('inlet-rewind')
    const [, y, z] = fixed.paths.jointFreeSpool.at(-1)!
    const eastFace: Point = [rewind.trialInterior.wall[1], y, z]
    const wet = read<{receiving: {cells: {id: string; maxZ: number}[]}}>('inlet-protected-daylight')
    return {
      ...kit, routes: fixed.paths, sourcePairMm: report(fixed.separations.utilityAndPlantMM),
      settingMm: 0, southLeg: null,
      ports: [{ id: 'east-joint-free-spool', outerPoint: eastFace }],
      authority: {
        basis: 'Current indoor wet cabinet reference',
        receipt: base + 'inlet-fixed-station.json',
        hydraulicReceipt: base + 'inlet-protected-daylight.json',
        receivingLevelsMm: wet.receiving.cells.map(cell => ({ id: cell.id, level: cell.maxZ })),
      },
    }
  }
  const south = read<{
    continuation: {utility: Route; plant: Route; coldPairAfterSetting: number};
    walls: {bores: Route};
    hydro: {raisedBareCarrier: {carrierOD: number; halfWidthLmin: number}[]};
  }>('south-utility-inlet')
  const { utility, plant, coldPairAfterSetting } = south.continuation
  // The editable leg is the constant-Z route between the first vertical riser
  // and the fixed climb to the upper fan crossing. Other vertices stay bound.
  const risingLegs = plant.flatMap(([x, y, z], index) => {
    const before = plant[index - 1]
    const turn = plant[index + 1]
    const end = plant[index + 2]
    return before && turn && end && before[0] === x && before[1] === y && before[2] < z &&
      turn[0] > x && turn[1] === y && turn[2] === z &&
      end[0] === turn[0] && end[1] > y && end[2] === z ? [index] : []
  })
  if (risingLegs.length !== 1) {
    throw new Error('The south source no longer has one rising south plant service leg')
  }
  const [start] = risingLegs
  const level = plant[start][2]
  const legIndices = [start, start + 1, start + 2]
  return {
    ...kit, routes: { utility, plant }, sourcePairMm: coldPairAfterSetting,
    settingMm: comparisonSetting, southLeg: { level, legIndices },
    ports: south.walls.bores.map((outerPoint, i) => ({ id: i === 0 ? 'south-utility-sleeve' : 'south-plant-sleeve', outerPoint })),
    authority: {
      basis: 'Conditional south dual-entry development',
      receipt: base + 'south-utility-inlet.json',
      raisedCarrierHalfWidthComparison: south.hydro.raisedBareCarrier.map(row =>
        ({ carrierOD: row.carrierOD, flowLmin: row.halfWidthLmin })),
    },
  }
}

function requestCase(scope: Scope, source: ReturnType<typeof reference>): InletRouteCase {
  return {
    schema: 'had-inlet-route-case/1',
    scope,
    planDigest: source.binding.applicability.planDigest,
    bindingDigest: source.binding.digest,
    plantSouthLegLevelMm: source.southLeg?.level ?? null,
  }
}

export function readInletRouteCases(resolved: CurrentDesignResolution) {
  return (['indoor-reference', 'south-development'] as const).map(scope => ({
    schema: 'had-inlet-route-request/1' as const,
    design: resolved.design,
    inlet: requestCase(scope, reference(resolved, scope)),
  }))
}

function readCase(value: unknown): InletRouteCase {
  const fields = ['schema', 'scope', 'planDigest', 'bindingDigest', 'plantSouthLegLevelMm']
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== fields.length ||
      fields.some(field => !Object.hasOwn(value, field))) {
    throw new Error('Expected an explicit inlet route case')
  }
  const input = value as InletRouteCase
  if (input.schema !== 'had-inlet-route-case/1' ||
      !['indoor-reference', 'south-development'].includes(input.scope)) {
    throw new Error('Unknown inlet route schema or method scope')
  }
  return input
}

function matchCase(input: InletRouteCase, source: ReturnType<typeof reference>) {
  const expected = requestCase(input.scope, source)
  if (input.planDigest !== expected.planDigest || input.bindingDigest !== expected.bindingDigest) {
    throw new Error('Stale inlet route case source binding')
  }
  if (!source.southLeg) {
    if (input.plantSouthLegLevelMm !== null) throw new Error('The indoor reference has no editable south route')
    return source.routes.plant
  }
  const level = input.plantSouthLegLevelMm
  if (typeof level !== 'number' || !Number.isFinite(level) || Math.abs(level - source.southLeg.level) > 50) {
    throw new Error('The plant service-leg level must stay within 50 mm of its source reservation')
  }
  const legIndices: readonly number[] = source.southLeg.legIndices
  return source.routes.plant.map((point, index): Point =>
    legIndices.includes(index) ? [point[0], point[1], level] : point)
}

function gapToBox(route: ReturnType<typeof finiteBends>, radius: number, box: readonly number[]) {
  return Math.min(...route.path.slice(1).map((end, i) => exactSegmentBoxDistance(route.path[i], end, box))) -
    radius - route.hausdorffError
}

function coldRiserComparison(source: ReturnType<typeof reference>) {
  const { hot, earlierHot, lowerCold, pipeRadius: radius, bowl, rail, washerSweep } = source
  const cold = source.routes.utility
  const [originalX, terminalY] = cold.at(-1)!
  const shiftMM = 15
  const shift = (point: Point): Point => [point[0] - shiftMM, point[1], point[2]]
  // Preserve the source plantward direction of the upper elbow and the
  // fixed lower tee, washer valve and forward sink break.
  const shifted = [...cold.slice(0, -3), ...cold.slice(-3).map(shift)]
  const changedWasher = [...lowerCold.coldWasher.slice(0, 2).map(shift), ...lowerCold.coldWasher.slice(2)]
  const earlierBackbone = finiteBends(earlierHot, bendRadius)
  const hotBackbone = finiteBends(hot.backbone, bendRadius)
  const hotTerminal = finiteBends(hot.terminal, 25)
  const [[railX, railSouth], [, railNorth]] = rail.straightAxis
  const [railWidth] = rail.standardTrolley.actualAuthorFlangeMM
  const railBox = [railX - railWidth / 2, railSouth, rail.armBottom, railWidth, railNorth - railSouth, rail.armTop - rail.armBottom]
  function compare(backbone: Route, washer: Route) {
    const coldBackbone = finiteBends(backbone, bendRadius)
    const coldTails = [washer, lowerCold.coldSink].map(vertices => finiteBends(vertices, 25))
    const pair = (a: typeof coldBackbone, b: typeof coldBackbone, totalRadius: number) =>
      pathSeparation(a.path, b.path) - totalRadius - a.hausdorffError - b.hausdorffError - comparisonSetting
    const coldBodies = [coldBackbone, ...coldTails].map((route, i) => ({ route, radius: i === 0 ? radius : 25 }))
    const nearest = (box: readonly number[]) => Math.min(...coldBodies.map(item => gapToBox(item.route, item.radius, box))) -
      comparisonSetting
    return {
      earlierHotBackboneMm: report(pair(coldBackbone, earlierBackbone, 2 * radius)),
      revisedHotBackboneMm: report(pair(coldBackbone, hotBackbone, 2 * radius)),
      revisedHotAndColdTerminalMm: report(Math.min(
        pair(coldBackbone, hotTerminal, radius + 25),
        ...coldTails.flatMap(route => [pair(route, hotBackbone, radius + 25), pair(route, hotTerminal, 50)]))),
      washerSweepMm: report(nearest(washerSweep)),
      bowlTransferMm: report(Math.min(...bowl.map(({ box }) => nearest(box)))),
      bowlRailMm: report(nearest(railBox)),
    }
  }
  return {
    sourceX: originalX, trialX: originalX - shiftMM, terminalY,
    washerValve: lowerCold.coldWasher.at(-1), forwardBreak: lowerCold.coldSink.at(-1),
    source: compare(cold, lowerCold.coldWasher), trial: compare(shifted, changedWasher),
    pressureFittingsAndNewSupportsAdmitted: false,
  }
}

function clearance(utility: Route, plant: Route, hot: Route, radius: number,
  sweeps: readonly {stage: number; box: number[]}[]) {
  const u = finiteBends(utility, bendRadius)
  const p = finiteBends(plant, bendRadius)
  const h = finiteBends(hot, bendRadius)
  const between = (a: typeof u, b: typeof u) =>
    pathSeparation(a.path, b.path) - 2 * radius - a.hausdorffError - b.hausdorffError
  const bowlGap = (route: typeof u) => sweeps.map(({ stage, box }) => ({ stage, gap: gapToBox(route, radius, box) }))
  return {
    pair: between(u, p), plantToHot: between(p, h), utilityToHot: between(u, h),
    utilityToBowl: bowlGap(u), plantToBowl: bowlGap(p),
  }
}

function inletSection(input: InletRouteCase, utility: Route, sourcePlant: Route, trialPlant: Route): DrawingSceneV2 {
  const all = [...utility, ...trialPlant, ...sourcePlant]
  const xs = all.map(point => point[0])
  const zs = all.map(point => point[2])
  const x = Math.min(...xs)
  const z = Math.min(...zs)
  const width = Math.max(...xs) - x
  const height = Math.max(...zs) - z
  const scaleDenominator = 20
  const projection = createPlanPaperProjection({ scaleDenominator,
    modelBounds: { x, y: z, width, height }, paperOrigin: { x: 11, y: 11 } })
  const primitives: DrawingSceneV2['primitives'] = []
  for (const [id, route] of [['utility', utility], ['source-plant', sourcePlant], ['trial-plant', trialPlant]] as const) {
    for (const [i, b] of route.slice(1).entries()) {
      const a = route[i]
      if (a[0] === b[0] && a[2] === b[2]) continue
      primitives.push({
        kind: 'line', id: `${id}-${i}`, a: projection.point(a[0], a[2]), b: projection.point(b[0], b[2]),
        role: id === 'trial-plant' ? 'primary' : 'secondary',
        metadata: { scope: input.scope, bindingDigest: input.bindingDigest, startZMm: a[2], endZMm: b[2] },
      })
    }
  }
  return {
    viewId: 'HAD-INLET-BRANCH-SECTION', sourceId: input.scope,
    title: 'Utility and plant cold routes · X/Z section',
    description: 'Projected source and trial centrelines. Three-dimensional bends and clearance are calculated separately.',
    widthMm: 22 + projection.length(width), heightMm: 22 + projection.length(height), scaleDenominator, primitives,
  }
}

export function runInletRouteCase(resolved: CurrentDesignResolution, value: unknown) {
  const input = readCase(value)
  const source = reference(resolved, input.scope)
  const plant = matchCase(input, source)
  const { utility, plant: sourcePlant } = source.routes
  const measured = clearance(utility, plant, source.hot.backbone, source.pipeRadius, source.bowl)
  const available = measured.pair - source.settingMm
  const nativeReplay = input.plantSouthLegLevelMm === (source.southLeg?.level ?? null)
  if (nativeReplay && report(available) !== source.sourcePairMm) {
    throw new Error('Native inlet route replay differs from the bound HAD source result')
  }
  const riser = input.scope === 'south-development' ? coldRiserComparison(source) : null
  const checks = [measured.pair, measured.plantToHot, measured.utilityToHot,
    ...measured.utilityToBowl.map(row => row.gap), ...measured.plantToBowl.map(row => row.gap)]
  const routeMeetsComparison = Math.min(...checks) - source.settingMm >= pairClearance &&
    (riser === null || riser.source.revisedHotAndColdTerminalMm >= pairClearance)
  const diagnostics: InletDiagnostic[] = [
    { objectId: 'P0', code: 'INSTALLED_INLET_OUTSIDE_SCOPE',
      message: 'Branch geometry cannot establish matched tools or supports, hydraulic service duty, pressure wetting, tailwater, frost or any product and site admission.' },
    { objectId: 'P0', code: 'UNCHANGED_SERVICE_INTERFACES_REQUIRE_PROOF',
      message: 'Port relocations and changes to the inherited fan and heating crossing need a separate supported method.' },
  ]
  if (riser && riser.source.earlierHotBackboneMm < pairClearance) {
    diagnostics.push({
      objectId: 'U0', code: 'SUPERSEDED_UTILITY_HOT_ROUTE',
      message: 'The earlier hot route fails the south setting comparison. This result uses the revised hot/H0 route carried by the dry-bowl source. Keep cold in place pending matched supports and fittings.',
    })
  }
  return {
    schema: 'had-inlet-route-result/1' as const,
    status: routeMeetsComparison ? 'within-screened-clearances' as const : 'blocked-screened-clearance' as const,
    source: { planDigest: input.planDigest, bindingDigest: input.bindingDigest, caseDigest: sha256SemanticFingerprint(input),
      scope: input.scope, authority: source.authority, nativeReplay },
    method: { id: 'HAD-INLET-ROUTE-GEOMETRY/1',
      entries: nativePaths.map(path => ({ path, gitBlob: source.binding.identities[path] })) },
    calculation: {
      ports: source.ports, branch: 'P0' as const, plantSouthLegLevelMm: input.plantSouthLegLevelMm,
      pairMeetsComparison: available >= pairClearance,
      coldRiserComparison: riser,
      completeEnvelopeDiameterMm: source.pipeRadius * 2, radiusMm: bendRadius, settingDeductionMm: source.settingMm,
      comparisonMm: pairClearance, pairClearanceMm: report(available),
      utilityToHotMm: report(measured.utilityToHot - source.settingMm),
      plantToHotMm: report(measured.plantToHot - source.settingMm),
      bowlClearanceMm: [measured.utilityToBowl, measured.plantToBowl].map(route =>
        route.map(({ stage, gap }) => ({ stage, marginMm: report(gap - source.settingMm) }))),
    },
    drawing: inletSection(input, utility, sourcePlant, plant),
    diagnostics,
  }
}
