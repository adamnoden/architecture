import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { sha256SemanticFingerprint } from '../core/identity.js'
import { compileDeploymentCase } from './compile.js'
import {
  loadB2InterfaceContracts,
  loadB2TargetComposition,
  loadInterfaceContract,
  loadTargetSlice
} from './load.js'
import type {
  AssuranceProfile,
  DeploymentCandidateInput,
  DeploymentCaseInput,
  DeploymentLedger,
  EvidenceItem,
  ProposalFacts,
  RawTargetSlice,
  TargetAuthorityClass
} from './model.js'
import { assertBoroughStrategicParent, strategicPlanningTargetId } from './planning-target-identity.js'

export const DPL12C_COMPOSITION_VERSION = 'DPL-12C-COMPOSITION-1' as const

export type WaveCBoroughTarget = 'Bromley' | 'Croydon'
export type WaveCTargetAuthorityClass = TargetAuthorityClass | 'LOCAL_BOROUGH_PLANNING'

export interface WaveCCorpusSiteIndexEntry {
  readonly id: string
  readonly displayName: string
  readonly borough: string
  readonly admissionState: string
  readonly record: string
  readonly challengeTags: readonly string[]
}

export interface WaveCCorpusIndex {
  readonly schemaVersion: 'dpl.realSiteIndex.v1'
  readonly corpus: string
  readonly researchDate: string
  readonly assuranceProfile: string
  readonly sites: readonly WaveCCorpusSiteIndexEntry[]
}

export interface LoadedWaveCSite {
  readonly indexPath: string
  readonly corpus: string
  readonly researchDate: string
  readonly indexEntry: WaveCCorpusSiteIndexEntry
  readonly indexEntryFingerprint: string
  readonly recordPath: string
  readonly recordText: string
  readonly recordFingerprint: string
  readonly runtimeSite: DeploymentCaseInput['site']
  readonly claimLevelUnknownsExposedByIndex: false
}

export interface LoadedWaveCBoroughTarget {
  readonly borough: WaveCBoroughTarget
  readonly path: string
  readonly target: RawTargetSlice
  readonly targetFingerprint: string
  readonly runtimeTarget: DeploymentCaseInput['targets'][number]
}

export interface WaveCDeploymentCaseRequest {
  readonly siteId: string
  readonly boroughTarget: WaveCBoroughTarget
  readonly assuranceProfile?: AssuranceProfile
  readonly candidate?: DeploymentCandidateInput
  readonly proposalFacts?: ProposalFacts
  readonly evidence?: readonly EvidenceItem[]
}

export interface WaveCDeploymentCaseComposition {
  readonly schemaVersion: typeof DPL12C_COMPOSITION_VERSION
  readonly corpus: {
    readonly id: string
    readonly indexPath: string
    readonly researchDate: string
    readonly siteAdmissionState: string
    readonly siteChallengeTags: readonly string[]
    readonly claimLevelUnknownsExposedByIndex: false
  }
  readonly boroughTarget: {
    readonly borough: WaveCBoroughTarget
    readonly targetId: string
    readonly targetFingerprint: string
  }
  readonly waterVertical: {
    readonly interfaceContractId: 'DPL-08C-FOUL-SURFACE-SITE-WATER'
    readonly technicalTargetId: 'ENG-BC-DRAINAGE-WASTE-WATER-2026-10-21'
  }
}

export interface WaveCDeploymentCaseResult {
  readonly ledger: DeploymentLedger
  readonly composition: WaveCDeploymentCaseComposition
  readonly compositionFingerprint: string
}

const readText = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8')
const readJson = (path: string): unknown => JSON.parse(readText(path)) as unknown

const expectRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`)
  }
  return value as Record<string, unknown>
}

const expectString = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${label} must be a non-empty string.`)
  }
  return value
}

const expectStringArray = (value: unknown, label: string): readonly string[] => {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`)
  for (const [index, item] of value.entries()) {
    if (typeof item !== 'string' || item.length === 0) {
      throw new Error(`${label}[${index}] must be a non-empty string.`)
    }
  }
  return value as readonly string[]
}

const validateCorpusIndex = (value: unknown, path: string): WaveCCorpusIndex => {
  const index = expectRecord(value, `Wave-C corpus index ${path}`)
  if (index.schemaVersion !== 'dpl.realSiteIndex.v1') {
    throw new Error(`Unsupported DPL Wave-C corpus schema ${String(index.schemaVersion)} at ${path}.`)
  }

  const corpus = expectString(index.corpus, `Wave-C corpus index ${path} corpus`)
  const researchDate = expectString(index.researchDate, `Wave-C corpus index ${path} researchDate`)
  const assuranceProfile = expectString(index.assuranceProfile, `Wave-C corpus index ${path} assuranceProfile`)
  if (!Array.isArray(index.sites)) {
    throw new Error(`Wave-C corpus index ${path} sites must be an array.`)
  }

  const ids = new Set<string>()
  const sites = index.sites.map((site, siteIndex): WaveCCorpusSiteIndexEntry => {
    const item = expectRecord(site, `Wave-C corpus index ${path} sites[${siteIndex}]`)
    const id = expectString(item.id, `Wave-C corpus index ${path} sites[${siteIndex}].id`)
    if (ids.has(id)) throw new Error(`Duplicate Wave-C corpus site id ${id} at ${path}.`)
    ids.add(id)

    return {
      id,
      displayName: expectString(item.displayName, `Wave-C corpus index ${path} sites[${siteIndex}].displayName`),
      borough: expectString(item.borough, `Wave-C corpus index ${path} sites[${siteIndex}].borough`),
      admissionState: expectString(item.admissionState, `Wave-C corpus index ${path} sites[${siteIndex}].admissionState`),
      record: expectString(item.record, `Wave-C corpus index ${path} sites[${siteIndex}].record`),
      challengeTags: expectStringArray(item.challengeTags, `Wave-C corpus index ${path} sites[${siteIndex}].challengeTags`)
    }
  })

  return {
    schemaVersion: 'dpl.realSiteIndex.v1',
    corpus,
    researchDate,
    assuranceProfile,
    sites
  }
}

export const loadWaveCSite = (
  siteId: string,
  indexPath = 'project/dpl/sites/corpus-1-index.json'
): LoadedWaveCSite => {
  const index = validateCorpusIndex(readJson(indexPath), indexPath)
  const site = index.sites.find((candidate) => candidate.id === siteId)
  if (!site) throw new Error(`Wave-C site ${siteId} is not admitted by ${indexPath}.`)

  const recordPath = `project/dpl/sites/${site.record}`
  const recordText = readText(recordPath)
  const recordFingerprint = sha256SemanticFingerprint({ recordPath, recordText })
  const indexEntryFingerprint = sha256SemanticFingerprint(site)

  return {
    indexPath,
    corpus: index.corpus,
    researchDate: index.researchDate,
    indexEntry: site,
    indexEntryFingerprint,
    recordPath,
    recordText,
    recordFingerprint,
    claimLevelUnknownsExposedByIndex: false,
    runtimeSite: {
      indexEntry: {
        id: site.id,
        displayName: site.displayName,
        borough: site.borough,
        record: site.record,
        primaryIdentityBasis:
          'DPL-CORPUS-1 controlled index entry + controlled site record; claim-level identity basis is not exposed by this index schema.',
        challengeTags: [...site.challengeTags],
        decisionCriticalUnknowns: []
      },
      recordPath,
      recordText,
      recordFingerprint,
      indexEntryFingerprint
    }
  }
}

const boroughTargetPaths: Readonly<Record<WaveCBoroughTarget, string>> = {
  Bromley: 'project/dpl/targets/bromley-local-planning-v1.json',
  Croydon: 'project/dpl/targets/croydon-local-planning-v1.json'
}

const validateBoroughTarget = (value: unknown, path: string): RawTargetSlice => {
  const target = expectRecord(value, `Borough target ${path}`)
  if (target.schemaVersion !== 'dpl.boroughPlanningSlice.v1') {
    throw new Error(`Unsupported DPL borough target schema ${String(target.schemaVersion)} at ${path}.`)
  }

  expectString(target.id, `Borough target ${path} id`)
  expectString(target.borough, `Borough target ${path} borough`)
  expectString(target.parentStrategicTargetId, `Borough target ${path} parentStrategicTargetId`)

  if (!Array.isArray(target.methodClasses)) {
    throw new Error(`Borough target ${path} methodClasses must be an array.`)
  }
  if (!Array.isArray(target.sourceSnapshots)) {
    throw new Error(`Borough target ${path} sourceSnapshots must be an array.`)
  }
  if (!Array.isArray(target.obligations)) {
    throw new Error(`Borough target ${path} obligations must be an array.`)
  }

  for (const [index, method] of target.methodClasses.entries()) {
    const item = expectRecord(method, `Borough target ${path} methodClasses[${index}]`)
    expectString(item.id, `Borough target ${path} methodClasses[${index}].id`)
    expectString(item.kind, `Borough target ${path} methodClasses[${index}].kind`)
  }

  const sourceIds = new Set<string>()
  for (const [index, source] of target.sourceSnapshots.entries()) {
    const item = expectRecord(source, `Borough target ${path} sourceSnapshots[${index}]`)
    const id = expectString(item.id, `Borough target ${path} sourceSnapshots[${index}].id`)
    if (sourceIds.has(id)) throw new Error(`Duplicate borough source snapshot ${id} at ${path}.`)
    sourceIds.add(id)
  }

  const obligationIds = new Set<string>()
  for (const [index, obligation] of target.obligations.entries()) {
    const item = expectRecord(obligation, `Borough target ${path} obligations[${index}]`)
    const id = expectString(item.id, `Borough target ${path} obligations[${index}].id`)
    if (obligationIds.has(id)) throw new Error(`Duplicate borough obligation ${id} at ${path}.`)
    obligationIds.add(id)
    const sourceSnapshot = expectString(item.sourceSnapshot, `Borough target ${path} obligations[${index}].sourceSnapshot`)
    if (!sourceIds.has(sourceSnapshot)) {
      throw new Error(`Borough obligation ${id} references missing source snapshot ${sourceSnapshot}.`)
    }
    expectString(item.title, `Borough target ${path} obligations[${index}].title`)
    expectString(item.applicability, `Borough target ${path} obligations[${index}].applicability`)
    expectString(item.resolutionMethod, `Borough target ${path} obligations[${index}].resolutionMethod`)
  }

  return target as unknown as RawTargetSlice
}

export const loadWaveCBoroughTarget = (
  borough: WaveCBoroughTarget,
  path = boroughTargetPaths[borough]
): LoadedWaveCBoroughTarget => {
  const target = validateBoroughTarget(readJson(path), path)
  const declaredBorough = expectString(
    (target as unknown as Record<string, unknown>).borough,
    `Borough target ${path} borough`
  )
  if (!declaredBorough.includes(borough)) {
    throw new Error(`Borough target ${target.id} does not declare ${borough}; found ${declaredBorough}.`)
  }

  const targetFingerprint = sha256SemanticFingerprint(target)
  const runtimeTarget = {
    authorityClass: 'LOCAL_BOROUGH_PLANNING',
    target
  } as unknown as DeploymentCaseInput['targets'][number]

  return {
    borough,
    path,
    target,
    targetFingerprint,
    runtimeTarget
  }
}

export const loadWaveCInterfaceContracts = () => [
  ...loadB2InterfaceContracts(),
  loadInterfaceContract(
    'DPL-08C-FOUL-SURFACE-SITE-WATER',
    'project/dpl/dpl-08c-foul-surface-site-water-interface.md'
  )
] as const

export const composeWaveCTargets = (
  b2Targets: ReturnType<typeof loadB2TargetComposition>,
  drainageTarget: DeploymentCaseInput['targets'][number],
  boroughTarget: LoadedWaveCBoroughTarget
): readonly DeploymentCaseInput['targets'][number][] => {
  const strategicTargetId = strategicPlanningTargetId(b2Targets)
  assertBoroughStrategicParent(boroughTarget.target, strategicTargetId)
  return [...b2Targets, drainageTarget, boroughTarget.runtimeTarget]
}

export const loadWaveCTargetComposition = (borough: WaveCBoroughTarget) => {
  const b2Targets = loadB2TargetComposition()
  const drainageTarget = loadTargetSlice(
    'project/dpl/targets/england-drainage-waste-water-v1.json',
    'ENGLAND_BUILDING_CONTROL'
  )
  const boroughTarget = loadWaveCBoroughTarget(borough)
  return composeWaveCTargets(b2Targets, drainageTarget, boroughTarget)
}

export const createWaveCDeploymentCaseInput = (
  request: WaveCDeploymentCaseRequest
): {
  readonly input: DeploymentCaseInput
  readonly site: LoadedWaveCSite
  readonly boroughTarget: LoadedWaveCBoroughTarget
} => {
  const site = loadWaveCSite(request.siteId)
  const boroughTarget = loadWaveCBoroughTarget(request.boroughTarget)

  if (site.indexEntry.borough !== request.boroughTarget) {
    throw new Error(
      `Site ${site.indexEntry.id} is in ${site.indexEntry.borough}; ${request.boroughTarget} borough target is not applicable.`
    )
  }

  const b2Targets = loadB2TargetComposition()
  const drainageTarget = loadTargetSlice(
    'project/dpl/targets/england-drainage-waste-water-v1.json',
    'ENGLAND_BUILDING_CONTROL'
  )

  return {
    site,
    boroughTarget,
    input: {
      assuranceProfile: request.assuranceProfile ?? 'SCREENING',
      site: site.runtimeSite,
      interfaceContracts: loadWaveCInterfaceContracts(),
      targets: composeWaveCTargets(b2Targets, drainageTarget, boroughTarget),
      candidate: request.candidate,
      proposalFacts: request.proposalFacts,
      evidence: request.evidence
    }
  }
}

export const compileWaveCDeploymentCase = (
  request: WaveCDeploymentCaseRequest
): WaveCDeploymentCaseResult => {
  const prepared = createWaveCDeploymentCaseInput(request)
  const ledger = compileDeploymentCase(prepared.input)
  const composition: WaveCDeploymentCaseComposition = {
    schemaVersion: DPL12C_COMPOSITION_VERSION,
    corpus: {
      id: prepared.site.corpus,
      indexPath: prepared.site.indexPath,
      researchDate: prepared.site.researchDate,
      siteAdmissionState: prepared.site.indexEntry.admissionState,
      siteChallengeTags: [...prepared.site.indexEntry.challengeTags].sort(),
      claimLevelUnknownsExposedByIndex: false
    },
    boroughTarget: {
      borough: prepared.boroughTarget.borough,
      targetId: prepared.boroughTarget.target.id,
      targetFingerprint: prepared.boroughTarget.targetFingerprint
    },
    waterVertical: {
      interfaceContractId: 'DPL-08C-FOUL-SURFACE-SITE-WATER',
      technicalTargetId: 'ENG-BC-DRAINAGE-WASTE-WATER-2026-10-21'
    }
  }

  return {
    ledger,
    composition,
    compositionFingerprint: sha256SemanticFingerprint(composition)
  }
}
