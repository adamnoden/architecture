import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { sha256SemanticFingerprint } from '../core/identity.js'

export const DPL02C_COVERAGE_SCHEMA_VERSION = 'dpl.conformanceCoverageRegistry.v1' as const

export const conformanceCoverageClasses = [
  'IDENTITY_INVARIANT',
  'PROTECTED_ORDER',
  'PERMITTED_DISCRETE_VARIANT',
  'SITE_INTERFACE_FREEDOM',
  'IMPLEMENTATION_FREEDOM'
] as const
export type ConformanceCoverageClass = (typeof conformanceCoverageClasses)[number]

export const conformanceCoverageResolutionModes = [
  'NATIVE_EXECUTABLE',
  'ARCHITECTURAL_REVIEW',
  'EXTERNAL_PROFESSIONAL_EVIDENCE',
  'AUTHORED_ROUTE_SELECTION',
  'SITE_INTERFACE_EVIDENCE',
  'IMPLEMENTATION_DETAIL_FUTURE',
  'OPEN_NOT_CLASSIFIABLE'
] as const
export type ConformanceCoverageResolutionMode = (typeof conformanceCoverageResolutionModes)[number]

export const conformanceCoverageExecutableStatuses = [
  'NATIVE',
  'NATIVE_ROUTE',
  'NOT_NATIVE'
] as const
export type ConformanceCoverageExecutableStatus = (typeof conformanceCoverageExecutableStatuses)[number]

export const conformanceCoverageScreeningPostures = [
  'POSITIVE_CONFORMANCE_REQUIRES_RESOLUTION',
  'ADMITTED_ROUTE_ONLY',
  'RESOLVE_IF_INVOKED',
  'FUTURE_IMPLEMENTATION_BOUNDARY'
] as const
export type ConformanceCoverageScreeningPosture = (typeof conformanceCoverageScreeningPostures)[number]

export interface ConformanceCoverageEntry {
  readonly id: string
  readonly conformanceClass: ConformanceCoverageClass
  readonly subject: string
  readonly ownerRefs: readonly string[]
  readonly resolutionMode: ConformanceCoverageResolutionMode
  readonly executableStatus: ConformanceCoverageExecutableStatus
  readonly screeningCoveragePosture: ConformanceCoverageScreeningPosture
  readonly unresolvedBlocksPositiveConformance: boolean
  readonly canProveSiteIncompatibilityAlone: false
  readonly claimBoundary: string
}

export interface ConformanceCoverageNonClauseCategory {
  readonly id: 'PREFERRED' | 'OPEN' | 'SUPERSEDED'
  readonly rule: string
}

export interface ConformanceCoverageRegistry {
  readonly schemaVersion: typeof DPL02C_COVERAGE_SCHEMA_VERSION
  readonly id: 'DPL-02-CONFORMANCE-COVERAGE-v1'
  readonly authoritySource: string
  readonly assuranceProfile: 'SCREENING'
  readonly nonClauseCategories: readonly ConformanceCoverageNonClauseCategory[]
  readonly entries: readonly ConformanceCoverageEntry[]
}

export interface LoadedConformanceCoverageRegistry {
  readonly registry: ConformanceCoverageRegistry
  readonly fingerprint: string
  readonly authorityFingerprint: string
}

const registryPath = 'project/dpl/coverage/dpl-02-conformance-coverage-v1.json'

export const expectedDpl02CoverageIds = [
  'RH-I01',
  'RH-I02',
  'RH-I03',
  'RH-I04',
  'RH-I05',
  'RH-I06',
  'RH-I07',
  'RH-PROT-01',
  'RH-PROT-02',
  'RH-PROT-03',
  'RH-PROT-04',
  'RH-PROT-05',
  'RH-PROT-06',
  'RH-PROT-07',
  'RH-PROT-08',
  'RH-PROT-09',
  'RH-PROT-10',
  'RH-PROT-11',
  'RH-PROT-12',
  'RH-PROT-13',
  'RH-PROT-14',
  'RH-PROT-15',
  'RH-V01',
  'RH-V02',
  'RH-SI01',
  'RH-SI02',
  'RH-SI03',
  'RH-SI04',
  'RH-SI05',
  'RH-SI06',
  'RH-IMP01',
  'RH-IMP02',
  'RH-IMP03',
  'RH-IMP04',
  'RH-IMP05',
  'RH-IMP06',
  'RH-IMP07',
  'RH-IMP08'
] as const

const expectedClassCounts: Readonly<Record<ConformanceCoverageClass, number>> = {
  IDENTITY_INVARIANT: 7,
  PROTECTED_ORDER: 15,
  PERMITTED_DISCRETE_VARIANT: 2,
  SITE_INTERFACE_FREEDOM: 6,
  IMPLEMENTATION_FREEDOM: 8
}

const classSet = new Set<string>(conformanceCoverageClasses)
const resolutionSet = new Set<string>(conformanceCoverageResolutionModes)
const executableSet = new Set<string>(conformanceCoverageExecutableStatuses)
const postureSet = new Set<string>(conformanceCoverageScreeningPostures)
const nonClauseSet = new Set(['PREFERRED', 'OPEN', 'SUPERSEDED'])

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

const expectBoolean = (value: unknown, label: string): boolean => {
  if (typeof value !== 'boolean') throw new Error(`${label} must be boolean.`)
  return value
}

const expectStringArray = (value: unknown, label: string): readonly string[] => {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${label} must be a non-empty array.`)
  const values = value.map((item, index) => expectString(item, `${label}[${index}]`))
  return values
}

const canonicalEntry = (entry: ConformanceCoverageEntry): ConformanceCoverageEntry => ({
  ...entry,
  ownerRefs: [...new Set(entry.ownerRefs)].sort((a, b) => a.localeCompare(b))
})

const canonicalRegistry = (registry: ConformanceCoverageRegistry): ConformanceCoverageRegistry => ({
  ...registry,
  nonClauseCategories: [...registry.nonClauseCategories].sort((a, b) => a.id.localeCompare(b.id)),
  entries: [...registry.entries].map(canonicalEntry).sort((a, b) => a.id.localeCompare(b.id))
})

const validateRegistry = (value: unknown, path: string): ConformanceCoverageRegistry => {
  const raw = expectRecord(value, `DPL-02C registry ${path}`)
  if (raw.schemaVersion !== DPL02C_COVERAGE_SCHEMA_VERSION) {
    throw new Error(`Unsupported DPL-02C registry schema ${String(raw.schemaVersion)} at ${path}.`)
  }
  if (raw.id !== 'DPL-02-CONFORMANCE-COVERAGE-v1') {
    throw new Error(`DPL-02C registry ${path} has unexpected identity.`)
  }
  if (raw.assuranceProfile !== 'SCREENING') {
    throw new Error(`DPL-02C registry ${path} must use SCREENING assurance profile.`)
  }
  expectString(raw.authoritySource, `DPL-02C registry ${path} authoritySource`)

  if (!Array.isArray(raw.nonClauseCategories)) {
    throw new Error(`DPL-02C registry ${path} nonClauseCategories must be an array.`)
  }
  const nonClauseIds = new Set<string>()
  const nonClauseCategories = raw.nonClauseCategories.map((value, index): ConformanceCoverageNonClauseCategory => {
    const item = expectRecord(value, `DPL-02C registry ${path} nonClauseCategories[${index}]`)
    const id = expectString(item.id, `DPL-02C registry ${path} nonClauseCategories[${index}].id`)
    if (!nonClauseSet.has(id)) throw new Error(`Unsupported DPL-02C non-clause category ${id}.`)
    if (nonClauseIds.has(id)) throw new Error(`Duplicate DPL-02C non-clause category ${id}.`)
    nonClauseIds.add(id)
    return {
      id: id as ConformanceCoverageNonClauseCategory['id'],
      rule: expectString(item.rule, `DPL-02C registry ${path} nonClauseCategories[${index}].rule`)
    }
  })
  for (const id of nonClauseSet) {
    if (!nonClauseIds.has(id)) throw new Error(`DPL-02C registry ${path} is missing non-clause category ${id}.`)
  }

  if (!Array.isArray(raw.entries)) throw new Error(`DPL-02C registry ${path} entries must be an array.`)
  const ids = new Set<string>()
  const entries = raw.entries.map((value, index): ConformanceCoverageEntry => {
    const item = expectRecord(value, `DPL-02C registry ${path} entries[${index}]`)
    const id = expectString(item.id, `DPL-02C registry ${path} entries[${index}].id`)
    if (ids.has(id)) throw new Error(`Duplicate DPL-02C coverage id ${id}.`)
    ids.add(id)

    const conformanceClass = expectString(item.conformanceClass, `${id}.conformanceClass`)
    const resolutionMode = expectString(item.resolutionMode, `${id}.resolutionMode`)
    const executableStatus = expectString(item.executableStatus, `${id}.executableStatus`)
    const screeningCoveragePosture = expectString(item.screeningCoveragePosture, `${id}.screeningCoveragePosture`)

    if (!classSet.has(conformanceClass)) throw new Error(`Unsupported DPL-02C conformance class ${conformanceClass} for ${id}.`)
    if (!resolutionSet.has(resolutionMode)) throw new Error(`Unsupported DPL-02C resolution mode ${resolutionMode} for ${id}.`)
    if (!executableSet.has(executableStatus)) throw new Error(`Unsupported DPL-02C executable status ${executableStatus} for ${id}.`)
    if (!postureSet.has(screeningCoveragePosture)) throw new Error(`Unsupported DPL-02C screening posture ${screeningCoveragePosture} for ${id}.`)

    const incompatible = expectBoolean(item.canProveSiteIncompatibilityAlone, `${id}.canProveSiteIncompatibilityAlone`)
    if (incompatible !== false) {
      throw new Error(`DPL-02C coverage entry ${id} must not claim site incompatibility authority.`)
    }

    return {
      id,
      conformanceClass: conformanceClass as ConformanceCoverageClass,
      subject: expectString(item.subject, `${id}.subject`),
      ownerRefs: expectStringArray(item.ownerRefs, `${id}.ownerRefs`),
      resolutionMode: resolutionMode as ConformanceCoverageResolutionMode,
      executableStatus: executableStatus as ConformanceCoverageExecutableStatus,
      screeningCoveragePosture: screeningCoveragePosture as ConformanceCoverageScreeningPosture,
      unresolvedBlocksPositiveConformance: expectBoolean(
        item.unresolvedBlocksPositiveConformance,
        `${id}.unresolvedBlocksPositiveConformance`
      ),
      canProveSiteIncompatibilityAlone: false,
      claimBoundary: expectString(item.claimBoundary, `${id}.claimBoundary`)
    }
  })

  for (const expected of expectedDpl02CoverageIds) {
    if (!ids.has(expected)) throw new Error(`DPL-02C registry ${path} is missing conformance id ${expected}.`)
  }
  if (ids.size !== expectedDpl02CoverageIds.length) {
    throw new Error(`DPL-02C registry ${path} contains ids outside the frozen DPL-02 clause/route universe.`)
  }

  for (const [conformanceClass, expectedCount] of Object.entries(expectedClassCounts)) {
    const actualCount = entries.filter((entry) => entry.conformanceClass === conformanceClass).length
    if (actualCount !== expectedCount) {
      throw new Error(`DPL-02C class ${conformanceClass} expected ${expectedCount} entries; found ${actualCount}.`)
    }
  }

  for (const entry of entries) {
    if (entry.executableStatus === 'NATIVE' && entry.resolutionMode !== 'NATIVE_EXECUTABLE') {
      throw new Error(`DPL-02C native clause ${entry.id} must use NATIVE_EXECUTABLE resolution mode.`)
    }
    if (entry.executableStatus === 'NATIVE_ROUTE' && entry.resolutionMode !== 'AUTHORED_ROUTE_SELECTION') {
      throw new Error(`DPL-02C native route ${entry.id} must use AUTHORED_ROUTE_SELECTION resolution mode.`)
    }
    if (entry.conformanceClass === 'PERMITTED_DISCRETE_VARIANT' && entry.screeningCoveragePosture !== 'ADMITTED_ROUTE_ONLY') {
      throw new Error(`DPL-02C variant ${entry.id} must remain ADMITTED_ROUTE_ONLY.`)
    }
    if (entry.conformanceClass === 'IMPLEMENTATION_FREEDOM' && entry.screeningCoveragePosture !== 'FUTURE_IMPLEMENTATION_BOUNDARY') {
      throw new Error(`DPL-02C implementation freedom ${entry.id} must remain a future implementation boundary.`)
    }
  }

  return canonicalRegistry({
    schemaVersion: DPL02C_COVERAGE_SCHEMA_VERSION,
    id: 'DPL-02-CONFORMANCE-COVERAGE-v1',
    authoritySource: raw.authoritySource as string,
    assuranceProfile: 'SCREENING',
    nonClauseCategories,
    entries
  })
}

const authorityFingerprint = (path: string): string =>
  sha256SemanticFingerprint({ path, content: readText(path) })

export const loadConformanceCoverageRegistry = (
  path = registryPath
): LoadedConformanceCoverageRegistry => {
  const registry = validateRegistry(readJson(path), path)
  return {
    registry,
    fingerprint: sha256SemanticFingerprint(registry),
    authorityFingerprint: authorityFingerprint(registry.authoritySource)
  }
}

export const nativeConformanceCoverageIds = (registry: ConformanceCoverageRegistry): string[] =>
  registry.entries
    .filter((entry) => entry.executableStatus === 'NATIVE' || entry.executableStatus === 'NATIVE_ROUTE')
    .map((entry) => entry.id)
    .sort((a, b) => a.localeCompare(b))

export const unresolvedPositiveConformanceBlockers = (
  registry: ConformanceCoverageRegistry
): string[] =>
  registry.entries
    .filter((entry) => entry.unresolvedBlocksPositiveConformance)
    .map((entry) => entry.id)
    .sort((a, b) => a.localeCompare(b))
