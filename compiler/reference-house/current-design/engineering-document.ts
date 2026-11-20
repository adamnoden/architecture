import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { sha256SemanticFingerprint, stableJsonStringify } from '../../core/identity.js'
import { compileCurrentDesignBundle, prepareCurrentDesignCompile } from './compile.js'
import { readStudyRoomKitReferenceCase } from './assemblies/study-room-kit.js'
import { resolveCurrentDesign, type CurrentDesignResolution } from './resolve.js'
import { readStructuralDpcOriginSettings } from './structural-dpc.js'
import { compileInletAssembly, readInletAssemblySettings } from './inlet-assembly.js'

const repository = new URL('../../../', import.meta.url)
const implementationRoots = [
  'compiler/reference-house/current-design/', 'compiler/reference-house/georgian/', 'compiler/core/',
  'compiler/architectural-drawing/', 'compiler/publication-drawing/', 'compiler/publication-drawing-v2/',
] as const
const additionalImplementationFiles = [
  'compiler/units.ts',
  'compiler/reference-house/ade-plan.ts',
  'compiler/reference-house/construction-bay/opening-inspection.ts',
  'compiler/reference-house/internal-partitions.ts',
  'compiler/reference-house/units.ts',
  'project/ccr/studies/source-coverage.ts',
  'project/design-constraints.ts',
  'project/had/studies/inlet-maintenance.mjs',
  'project/had/studies/purge-window-interfaces.mjs',
  'project/had/studies/radiator-maintenance.mjs',
  'project/had/studies/store-discharge-release.mjs',
  'project/had/studies/store-exchange.mjs',
  'project/oas/studies/study-dry-seam.mjs',
  'project/ias/studies/study-furniture-motion.py',
  'project/ias/studies/study-floor-handling.py',
  'project/bcr/studies/bay-interface-study.py',
  'project/ias/studies/workable-floor-tiles.mjs',
  'project/ias/studies/workable-lining-dimensions.mjs',
] as const
const stageKeys = ['northCollector', 'rearFoulVent', 'inletSillInsert', 'inletFault', 'inletRemovals', 'inletCovers', 'inletAssembly', 'studyRoomKit'] as const
type Settings = Readonly<Record<string, unknown>>
type EngineeringStages = Partial<Readonly<Record<Exclude<typeof stageKeys[number], 'inletCovers' | 'inletRemovals'>, Settings>>> & {
  readonly inletRemovals?: readonly Settings[]
  readonly inletCovers?: readonly Settings[]
}
type SourceBindings = {
  readonly disciplines: Readonly<Record<string, string>>
  readonly implementations: Readonly<Record<string, string>>
  readonly authoredDefaults: Readonly<Record<string, string>>
}

const northFields = ['portAxisXYMm', 'dragDemandFactor', 'remoteMainBarShiftMm', 'chordBendRadiusMm',
  'toeTransferIntervalMm', 'keyContactTrial', 'placementToleranceMm', 'yawProbe', 'deadLoadReplay', 'portStrategy', 'dpcOriginAudit'] as const
const foulFields = ['riserAxisXYMm', 'wetStackAirTakeoffZMm', 'terminalZMm', 'buriedReceiving'] as const
const inletFields = ['branch', 'washer', 'cheekMm', 'retainedSideLandMm', 'receiverRailWidthMm',
  'minimumFrontBridgeMm', 'axialTravelMm', 'sideTravelMm', 'closure'] as const
const insertFields = ['eastEdgeMm', 'headZMm', 'plantPressureAxisXMm', 'plantVentOuterZMm'] as const
const faultFields = ['branches'] as const
const assemblyFields = ['plantSouthLegLevelMm', 'splitRoof', 'supportRails'] as const
const removalFields = ['branch', 'drawMm', 'roofAccess', 'washer', 'utilityTaperRemoved', 'preparation'] as const
const studyFields = ['pitchMm', 'wearingFace', 'finishDepthMm', 'groundDeckLevelLossMm', 'firstRestBoardSizeMm', 'ordinaryHandling', 'frameFootClearanceMm', 'floorBorderMinimumMm', 'installedServices', 'floorWorkerTopMm', 'floorPosture', 'wallPanelWidthMm', 'wallFace', 'wallReleaseMm', 'opening'] as const

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype
}

function exactKeys(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  return object(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key))
}

function settings(value: unknown, allowed: readonly string[], name: string): Settings {
  if (!object(value) || Object.keys(value).some(key => !allowed.includes(key))) {
    throw new TypeError(`Unknown ${name} engineering setting or derived identity supplied`)
  }
  return value
}

function select<T extends object>(value: T, fields: readonly string[]): Settings {
  return Object.fromEntries(Object.entries(value).filter(([key]) => fields.includes(key)))
}

function implementationFiles(directory: string): string[] {
  return readdirSync(new URL(directory, repository), { withFileTypes: true }).flatMap(entry => {
    const path = directory + entry.name
    if (entry.isDirectory()) return implementationFiles(path + '/')
    return entry.isFile() && path.endsWith('.ts') && !path.endsWith('.test.ts') ? [path] : []
  }).sort()
}

function sourceBindings(resolved: CurrentDesignResolution): SourceBindings {
  const paths = [...implementationRoots.flatMap(implementationFiles), ...additionalImplementationFiles].sort()
  return {
    disciplines: Object.fromEntries(resolved.disciplineBindings.map(binding => [binding.id, binding.digest]).sort(([a], [b]) => a.localeCompare(b))),
    authoredDefaults: { 'project/ias/studies/crafted-study-handling-plan.json': createHash('sha1')
      .update(`blob ${readFileSync(new URL('project/ias/studies/crafted-study-handling-plan.json', repository)).length}\0`)
      .update(readFileSync(new URL('project/ias/studies/crafted-study-handling-plan.json', repository))).digest('hex') },
    implementations: Object.fromEntries(paths.map(path => {
      const bytes = readFileSync(new URL(path, repository))
      return [path, createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')]
    })),
  }
}

function acceptedCompile(design: unknown) {
  const resolved = resolveCurrentDesign(design)
  if (resolved.design.source.kind !== 'georgian-layout-revision') {
    throw new TypeError('Engineering stages require the accepted current design basis')
  }
  return { resolved, compile: prepareCurrentDesignCompile(resolved.design) }
}

export async function readEngineeringDocument(design: unknown) {
  const { resolved, compile } = acceptedCompile(design)
  const [north, foul, sill] = await Promise.all([
    compile.readNorthCollectorCase(), compile.readRearFoulVentCase(), compile.readInletSillInsertCase(),
  ])
  if (!('collector' in north) || !('vent' in foul)) throw new Error('Current engineering cases are unavailable')
  const [fault, removals] = await Promise.all([
    compile.readInletFaultCase(sill.insert), compile.readInletRemovalCases(sill.insert),
  ])
  const removalCases = removals.map(({ removal }) => ({ ...removal, roofAccess: 'clear-strip-comparison' as const }))
  const covers = await compile.readInletCoverCases({ insertCase: sill.insert, removalCases })
  return {
    schema: 'current-engineering-document/1' as const,
    design: resolved.design,
    bindings: sourceBindings(resolved),
    stages: {
      northCollector: { ...select(north.collector, northFields), dpcOriginAudit: readStructuralDpcOriginSettings(resolved) },
      rearFoulVent: select(foul.vent, foulFields),
      inletSillInsert: select(sill.insert, insertFields),
      inletFault: select(fault.fault, faultFields),
      inletRemovals: removalCases.map(removal => select(removal, removalFields)).sort((a, b) => String(a.branch).localeCompare(String(b.branch))),
      inletCovers: covers.map(({ cover }) => select(cover, inletFields)).sort((a, b) => String(a.branch).localeCompare(String(b.branch))),
      inletAssembly: readInletAssemblySettings(resolved),
      studyRoomKit: select({ ...readStudyRoomKitReferenceCase(), finishDepthMm: 15, installedServices: 'wall-hung-candidate',
        frameFootClearanceMm: 5, firstRestBoardSizeMm: [300, 300],
        ordinaryHandling: JSON.parse(readFileSync(new URL('project/ias/studies/crafted-study-handling-plan.json', repository), 'utf8')) }, studyFields),
    },
  }
}

function branchSettings(value: unknown, fields: readonly string[], name: string) {
  if (!Array.isArray(value) || !value.length) throw new TypeError(`Specify at least one ${name} branch`)
  const seen = new Set<unknown>()
  return value.map(input => {
    const selected = settings(input, fields, name)
    if (!['utility', 'plant'].includes(selected.branch as string) || seen.has(selected.branch)) {
      throw new TypeError(`Specify each bound ${name} branch at most once`)
    }
    seen.add(selected.branch)
    return selected
  }).sort((a, b) => String(a.branch).localeCompare(String(b.branch)))
}

function admitStages(value: unknown): EngineeringStages {
  if (!object(value) || !Object.keys(value).length || Object.keys(value).some(key => !(stageKeys as readonly string[]).includes(key))) {
    throw new TypeError('Specify at least one supported engineering stage')
  }
  const stages: EngineeringStages = {
    ...(Object.hasOwn(value, 'northCollector') ? { northCollector: settings(value.northCollector, northFields, 'north collector') } : {}),
    ...(Object.hasOwn(value, 'rearFoulVent') ? { rearFoulVent: settings(value.rearFoulVent, foulFields, 'rear foul vent') } : {}),
    ...(Object.hasOwn(value, 'inletSillInsert') ? { inletSillInsert: settings(value.inletSillInsert, insertFields, 'inlet sill insert') } : {}),
    ...(Object.hasOwn(value, 'inletFault') ? { inletFault: settings(value.inletFault, faultFields, 'inlet fault') } : {}),
    ...(Object.hasOwn(value, 'inletRemovals') ? { inletRemovals: branchSettings(value.inletRemovals, removalFields, 'inlet removal') } : {}),
    ...(Object.hasOwn(value, 'inletCovers') ? { inletCovers: branchSettings(value.inletCovers, inletFields, 'inlet cover') } : {}),
    ...(Object.hasOwn(value, 'inletAssembly') ? { inletAssembly: settings(value.inletAssembly, assemblyFields, 'inlet assembly') } : {}),
    ...(Object.hasOwn(value, 'studyRoomKit') ? { studyRoomKit: settings(value.studyRoomKit, studyFields, 'Study room kit') } : {}),
  }
  return stages
}

export async function compileEngineeringDocument(input: unknown) {
  if (!exactKeys(input, ['schema', 'design', 'bindings', 'stages']) || input.schema !== 'current-engineering-document/1') {
    throw new TypeError('Expected a versioned current engineering document with design, source bindings and stages')
  }
  const { resolved, compile } = acceptedCompile(input.design)
  const observedBindings = sourceBindings(resolved)
  if (!exactKeys(input.bindings, ['disciplines', 'implementations', 'authoredDefaults'])
      || stableJsonStringify(input.bindings) !== stableJsonStringify(observedBindings)) {
    throw new Error('Stale engineering source or implementation binding; explicitly read and review a refreshed document')
  }
  const stages = admitStages(input.stages)
  const document = { schema: input.schema, design: resolved.design, bindings: observedBindings, stages }
  const documentIdentity = {
    digest: sha256SemanticFingerprint(document),
    planDigest: compile.source.planDigest,
    sourceBindingsDigest: sha256SemanticFingerprint(observedBindings),
  }
  const engineering: {
    northCollector?: Awaited<ReturnType<typeof compile.northCollectorCase>>
    rearFoulVent?: Awaited<ReturnType<typeof compile.rearFoulVent>>
    inletSillInsert?: Awaited<ReturnType<typeof compile.inletSillInsert>>
    inletFault?: Awaited<ReturnType<typeof compile.inletFault>>
    inletRemovals?: readonly Awaited<ReturnType<typeof compile.inletRemoval>>[]
    inletCovers?: readonly Awaited<ReturnType<typeof compile.inletCover>>[]
    inletAssembly?: ReturnType<typeof compileInletAssembly>
    studyRoomKit?: Awaited<ReturnType<typeof compile.studyRoomKit>>
  } = {}
  const manifest: { stage: string; settingsDigest: string; resultDigest: string; controls: readonly string[]; dependsOn: readonly string[] }[] = []
  const recordResult = (stage: string, settings: unknown, result: unknown, upstream: readonly string[] = []) => {
    manifest.push({ stage, settingsDigest: sha256SemanticFingerprint(settings), resultDigest: sha256SemanticFingerprint(result),
      controls: object(settings) && Object.keys(settings).length ? Object.keys(settings).sort().map(key => `stages.${stage}.${key}`) : ['design'],
      dependsOn: ['design', 'bindings.disciplines', 'bindings.implementations', ...upstream] })
  }
  const base = await compileCurrentDesignBundle(resolved.design)
  recordResult('plans', {}, base.plans)
  recordResult('occupiedServices', {}, base.occupiedServices)
  recordResult('selectedWaterEvent', {}, base.selectedWaterEvent)
  const linkedPort = stages.northCollector?.portStrategy === 'linked-west-foul-route'
  let westVentCase: unknown
  const compileWestVent = async (settings: Settings) => {
    const request = await compile.readRearFoulVentCase()
    if (!('vent' in request)) throw new Error('The bound rear foul vent case is unavailable')
    westVentCase = { ...request.vent, ...settings }
    engineering.rearFoulVent = await compile.rearFoulVent(westVentCase)
    recordResult('rearFoulVent', settings, engineering.rearFoulVent)
  }
  if (linkedPort) {
    if (!stages.rearFoulVent) throw new Error('The linked north collector requires an explicit saved west foul vent stage')
    await compileWestVent(stages.rearFoulVent)
  }
  if (stages.northCollector) {
    const request = await compile.readNorthCollectorCase()
    if (!('collector' in request)) throw new Error('The bound north collector case is unavailable')
    engineering.northCollector = await compile.northCollectorCase({ ...request.collector, ...stages.northCollector },
      linkedPort ? westVentCase : undefined)
    recordResult('northCollector', stages.northCollector, engineering.northCollector, linkedPort ? ['rearFoulVent'] : [])
  }
  if (stages.rearFoulVent && !linkedPort) await compileWestVent(stages.rearFoulVent)
  const sill = stages.inletSillInsert || stages.inletFault || stages.inletRemovals || stages.inletCovers
    ? await compile.readInletSillInsertCase() : undefined
  const insertCase = sill ? { ...sill.insert, ...stages.inletSillInsert } : undefined
  const insertDependency = stages.inletSillInsert ? ['inletSillInsert'] : []
  if (stages.inletSillInsert) {
    engineering.inletSillInsert = await compile.inletSillInsert(insertCase)
    recordResult('inletSillInsert', stages.inletSillInsert, engineering.inletSillInsert)
  }
  if (stages.inletFault) {
    const request = await compile.readInletFaultCase(insertCase)
    engineering.inletFault = await compile.inletFault({ ...request.fault, ...stages.inletFault }, insertCase)
    recordResult('inletFault', stages.inletFault, engineering.inletFault, insertDependency)
  }
  const removalCases = []
  if (stages.inletRemovals) {
    const requests = await compile.readInletRemovalCases(insertCase)
    const results = []
    for (const removal of stages.inletRemovals) {
      const request = requests.find(request => request.removal.branch === removal.branch)
      if (!request) throw new Error('The requested inlet removal branch is unavailable')
      const selected = { ...request.removal, ...removal }
      const result = await compile.inletRemoval(selected, insertCase)
      removalCases.push(selected)
      results.push(result)
      recordResult(`inletRemovals/${removal.branch}`, removal, result, insertDependency)
    }
    engineering.inletRemovals = results
  }
  if (stages.inletCovers) {
    const sources = { insertCase, ...(stages.inletRemovals ? { removalCases } : {}) }
    const requests = await compile.readInletCoverCases(sources)
    const results = []
    for (const cover of stages.inletCovers) {
      const request = requests.find(request => request.cover.branch === cover.branch)
      if (!request) throw new Error('The requested inlet branch is unavailable')
      const result = await compile.inletCover({ ...request.cover, ...cover }, sources)
      results.push(result)
      recordResult(`inletCovers/${cover.branch}`, cover, result, [...insertDependency,
        ...(stages.inletRemovals?.some(removal => removal.branch === cover.branch) ? [`inletRemovals/${cover.branch}`] : [])])
    }
    engineering.inletCovers = results
  }
  if (stages.inletAssembly) {
    if (!engineering.inletSillInsert || !engineering.inletFault || !engineering.inletRemovals || !engineering.inletCovers) {
      throw new Error('The joined inlet requires explicit insert, fault, both removals and both covers in the saved document')
    }
    engineering.inletAssembly = compileInletAssembly(resolved, stages.inletAssembly, {
      insert: engineering.inletSillInsert, fault: engineering.inletFault, removals: engineering.inletRemovals, covers: engineering.inletCovers,
    })
    recordResult('inletAssembly', stages.inletAssembly, engineering.inletAssembly, ['inletSillInsert', 'inletFault',
      'inletRemovals/utility', 'inletRemovals/plant', 'inletCovers/utility', 'inletCovers/plant'])
  }
  if (stages.studyRoomKit) {
    engineering.studyRoomKit = await compile.studyRoomKit({ schema: 'ias-study-room-kit-case/1', units: 'mm', ...stages.studyRoomKit })
    recordResult('studyRoomKit', stages.studyRoomKit, engineering.studyRoomKit)
  }
  const completedBindings = sourceBindings(resolveCurrentDesign(resolved.design))
  if (stableJsonStringify(completedBindings) !== stableJsonStringify(observedBindings)) {
    throw new Error('Engineering sources or implementations changed during compilation; review the changes and rerun the document')
  }
  return {
    ...base, schema: 'current-engineering-bundle/1' as const, documentIdentity, engineering, manifest,
    evidence: {
      state: 'conditional-stage-comparisons' as const,
      installedAcceptance: false as const,
      scope: 'Stage settings describe conditional alternatives. They do not change nominal plans or adopted discipline sources. No joined load, hydraulic, wet closure or handling acceptance follows from running them together.',
    },
  }
}
