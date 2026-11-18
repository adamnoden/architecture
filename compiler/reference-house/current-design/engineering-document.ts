import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { sha256SemanticFingerprint, stableJsonStringify } from '../../core/identity.js'
import { compileCurrentDesignBundle, prepareCurrentDesignCompile } from './compile.js'
import { readStudyRoomKitReferenceCase } from './assemblies/study-room-kit.js'
import { resolveCurrentDesign, type CurrentDesignResolution } from './resolve.js'

const repository = new URL('../../../', import.meta.url)
const implementationRoot = 'compiler/reference-house/current-design/'
const nativeAssemblyMethods = [
  'project/ias/studies/study-furniture-motion.py',
  'project/bcr/studies/bay-interface-study.py',
  'project/ias/studies/workable-floor-tiles.mjs',
  'project/ias/studies/workable-lining-dimensions.mjs',
] as const
const stageKeys = ['northCollector', 'rearFoulVent', 'inletCovers', 'studyRoomKit'] as const
type Settings = Readonly<Record<string, unknown>>
type EngineeringStages = Partial<Readonly<Record<Exclude<typeof stageKeys[number], 'inletCovers'>, Settings>>> & {
  readonly inletCovers?: readonly Settings[]
}
type SourceBindings = {
  readonly disciplines: Readonly<Record<string, string>>
  readonly implementations: Readonly<Record<string, string>>
}

const northFields = ['portAxisXYMm', 'dragDemandFactor', 'remoteMainBarShiftMm', 'chordBendRadiusMm',
  'toeTransferIntervalMm', 'keyContactTrial', 'placementToleranceMm', 'yawProbe', 'deadLoadReplay'] as const
const foulFields = ['riserAxisXYMm', 'wetStackAirTakeoffZMm', 'terminalZMm', 'buriedReceiving'] as const
const inletFields = ['branch', 'washer', 'cheekMm', 'retainedSideLandMm', 'receiverRailWidthMm',
  'minimumFrontBridgeMm', 'axialTravelMm', 'sideTravelMm', 'closure'] as const
const studyFields = ['pitchMm', 'wearingFace', 'finishDepthMm', 'groundDeckLevelLossMm', 'firstRestBoardSizeMm', 'opening'] as const

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
    return entry.isFile() && path.endsWith('.ts') ? [path] : []
  }).sort()
}

function sourceBindings(resolved: CurrentDesignResolution): SourceBindings {
  const paths = [...implementationFiles(implementationRoot), ...nativeAssemblyMethods].sort()
  return {
    disciplines: Object.fromEntries(resolved.disciplineBindings.map(binding => [binding.id, binding.digest]).sort(([a], [b]) => a.localeCompare(b))),
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
  const [north, foul, covers] = await Promise.all([
    compile.readNorthCollectorCase(), compile.readRearFoulVentCase(), compile.readInletCoverCases(),
  ])
  if (!('collector' in north) || !('vent' in foul)) throw new Error('Current engineering cases are unavailable')
  return {
    schema: 'current-engineering-document/1' as const,
    design: resolved.design,
    bindings: sourceBindings(resolved),
    stages: {
      northCollector: select(north.collector, northFields),
      rearFoulVent: select(foul.vent, foulFields),
      inletCovers: covers.map(({ cover }) => select(cover, inletFields)).sort((a, b) => String(a.branch).localeCompare(String(b.branch))),
      studyRoomKit: select(readStudyRoomKitReferenceCase(), studyFields),
    },
  }
}

function admitStages(value: unknown): EngineeringStages {
  if (!object(value) || !Object.keys(value).length || Object.keys(value).some(key => !(stageKeys as readonly string[]).includes(key))) {
    throw new TypeError('Specify at least one supported engineering stage')
  }
  const stages: EngineeringStages = {
    ...(Object.hasOwn(value, 'northCollector') ? { northCollector: settings(value.northCollector, northFields, 'north collector') } : {}),
    ...(Object.hasOwn(value, 'rearFoulVent') ? { rearFoulVent: settings(value.rearFoulVent, foulFields, 'rear foul vent') } : {}),
    ...(Object.hasOwn(value, 'studyRoomKit') ? { studyRoomKit: settings(value.studyRoomKit, studyFields, 'Study room kit') } : {}),
  }
  if (!Object.hasOwn(value, 'inletCovers')) return stages
  if (!Array.isArray(value.inletCovers) || !value.inletCovers.length) throw new TypeError('Specify at least one inlet cover branch')
  const seen = new Set<unknown>()
  const inletCovers = value.inletCovers.map(input => {
    const cover = settings(input, inletFields, 'inlet cover')
    if (!['utility', 'plant'].includes(cover.branch as string) || seen.has(cover.branch)) {
      throw new TypeError('Specify each bound inlet cover branch at most once')
    }
    seen.add(cover.branch)
    return cover
  }).sort((a, b) => String(a.branch).localeCompare(String(b.branch)))
  return { ...stages, inletCovers }
}

export async function compileEngineeringDocument(input: unknown) {
  if (!exactKeys(input, ['schema', 'design', 'bindings', 'stages']) || input.schema !== 'current-engineering-document/1') {
    throw new TypeError('Expected a versioned current engineering document with design, source bindings and stages')
  }
  const { resolved, compile } = acceptedCompile(input.design)
  const observedBindings = sourceBindings(resolved)
  if (!exactKeys(input.bindings, ['disciplines', 'implementations'])
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
    inletCovers?: readonly Awaited<ReturnType<typeof compile.inletCover>>[]
    studyRoomKit?: Awaited<ReturnType<typeof compile.studyRoomKit>>
  } = {}
  const manifest: { stage: string; settingsDigest: string; resultDigest: string; controls: readonly string[]; dependsOn: readonly string[] }[] = []
  const recordResult = (stage: string, settings: unknown, result: unknown) => {
    manifest.push({ stage, settingsDigest: sha256SemanticFingerprint(settings), resultDigest: sha256SemanticFingerprint(result),
      controls: object(settings) && Object.keys(settings).length ? Object.keys(settings).sort().map(key => `stages.${stage}.${key}`) : ['design'],
      dependsOn: ['design', 'bindings.disciplines', 'bindings.implementations'] })
  }
  const base = await compileCurrentDesignBundle(resolved.design)
  recordResult('plans', {}, base.plans)
  recordResult('occupiedServices', {}, base.occupiedServices)
  recordResult('selectedWaterEvent', {}, base.selectedWaterEvent)
  if (stages.northCollector) {
    const request = await compile.readNorthCollectorCase()
    if (!('collector' in request)) throw new Error('The bound north collector case is unavailable')
    engineering.northCollector = await compile.northCollectorCase({ ...request.collector, ...stages.northCollector })
    recordResult('northCollector', stages.northCollector, engineering.northCollector)
  }
  if (stages.rearFoulVent) {
    const request = await compile.readRearFoulVentCase()
    if (!('vent' in request)) throw new Error('The bound rear foul vent case is unavailable')
    engineering.rearFoulVent = await compile.rearFoulVent({ ...request.vent, ...stages.rearFoulVent })
    recordResult('rearFoulVent', stages.rearFoulVent, engineering.rearFoulVent)
  }
  if (stages.inletCovers) {
    const requests = await compile.readInletCoverCases()
    const results = []
    for (const cover of stages.inletCovers) {
      const request = requests.find(request => request.cover.branch === cover.branch)
      if (!request) throw new Error('The requested inlet branch is unavailable')
      const result = await compile.inletCover({ ...request.cover, ...cover })
      results.push(result)
      recordResult(`inletCovers/${cover.branch}`, cover, result)
    }
    engineering.inletCovers = results
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
