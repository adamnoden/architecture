import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './identity-order.js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const DPL09D_COVERAGE_SCHEMA_VERSION = 'dpl.englandScreeningCoverageRegistry.v1' as const

export const englandCoverageApplicabilityClasses = [
  'CORE',
  'CONDITIONAL',
  'TRANSITION_DEPENDENT',
  'PROCESS_CORE',
  'PROJECT_CLASS_EXCLUDED'
] as const
export type EnglandCoverageApplicabilityClass = (typeof englandCoverageApplicabilityClasses)[number]

export const englandCoverageScreeningDispositions = [
  'DUE_NOW_REPRESENTED',
  'DUE_NOW_MISSING',
  'FUTURE_DUE',
  'DUE_CLASSIFICATION_UNRESOLVED',
  'NOT_APPLICABLE_PROVED',
  'ADVISORY_NON_BLOCKING'
] as const
export type EnglandCoverageScreeningDisposition = (typeof englandCoverageScreeningDispositions)[number]

export const englandCoverageImplementationStates = [
  'SOURCE_APPLICABILITY_SPINE',
  'TARGET_SLICE_PARTIAL',
  'NO_TARGET_SLICE',
  'SELECTED_METHOD_ONLY',
  'REGISTRY_ONLY',
  'PROJECT_CLASS_EXCLUDED'
] as const
export type EnglandCoverageImplementationState = (typeof englandCoverageImplementationStates)[number]

export const englandCoverageResolutionAuthorities = [
  'NATIVE_APPLICABILITY_ONLY',
  'NATIVE_BOUNDED_METHOD',
  'STATUTORY_SOURCE_RECORD',
  'STATUTORY_PROCESS',
  'EXTERNAL_PROFESSIONAL_EVIDENCE',
  'EXTERNAL_EVIDENCE_AND_INSPECTION',
  'EXTERNAL_CALCULATION_OR_MODEL',
  'EXTERNAL_PRODUCT_OR_TEST_EVIDENCE',
  'UTILITY_OR_UNDERTAKER_EVIDENCE',
  'INSPECTION_OR_TEST'
] as const
export type EnglandCoverageResolutionAuthority = (typeof englandCoverageResolutionAuthorities)[number]

export interface EnglandCoverageEntry {
  readonly id: string
  readonly family: string
  readonly subject: string
  readonly applicabilityClass: EnglandCoverageApplicabilityClass
  readonly defaultScreeningDisposition: EnglandCoverageScreeningDisposition
  readonly accelerationTriggers: readonly string[]
  readonly implementationState: EnglandCoverageImplementationState
  readonly representedTargetIds: readonly string[]
  readonly selectedMethodRefs?: readonly string[]
  readonly resolutionAuthorities: readonly EnglandCoverageResolutionAuthority[]
  readonly sourceIdentityRequirement: string
  readonly positiveCompatibilityBlockingWhenDue: boolean
  readonly claimBoundary: string
}

export interface EnglandCoverageRegistry {
  readonly schemaVersion: typeof DPL09D_COVERAGE_SCHEMA_VERSION
  readonly id: 'DPL-09-ENGLAND-SCREENING-COVERAGE-v1'
  readonly authoritySources: readonly string[]
  readonly jurisdiction: 'ENGLAND'
  readonly projectClass: {
    readonly kind: 'NEW_DWELLING'
    readonly referenceFixture: string
    readonly higherRiskBuildingRegime: 'PROJECT_CLASS_EXCLUDED'
  }
  readonly assuranceProfile: 'SCREENING'
  readonly entries: readonly EnglandCoverageEntry[]
}

export interface LoadedEnglandCoverageRegistry {
  readonly registry: EnglandCoverageRegistry
  readonly fingerprint: string
  readonly authoritySetFingerprint: string
}

const registryPath = 'project/dpl/coverage/dpl-09-england-screening-coverage-v1.json'

export const expectedEnglandCoverageIds = [
  'ENG-COV-SOURCE-APPLICABILITY',
  'ENG-COV-A',
  'ENG-COV-B',
  'ENG-COV-C',
  'ENG-COV-D',
  'ENG-COV-E',
  'ENG-COV-F',
  'ENG-COV-G',
  'ENG-COV-H',
  'ENG-COV-J',
  'ENG-COV-K',
  'ENG-COV-L',
  'ENG-COV-M',
  'ENG-COV-O',
  'ENG-COV-P',
  'ENG-COV-Q',
  'ENG-COV-R',
  'ENG-COV-S',
  'ENG-COV-REG7',
  'ENG-COV-PROCESS-CONTROL',
  'ENG-COV-PROCESS-DUTYHOLDER',
  'ENG-COV-PROCESS-COMPLETION',
  'ENG-COV-PROCESS-HRB'
] as const

const applicabilitySet = new Set<string>(englandCoverageApplicabilityClasses)
const dispositionSet = new Set<string>(englandCoverageScreeningDispositions)
const implementationSet = new Set<string>(englandCoverageImplementationStates)
const resolutionSet = new Set<string>(englandCoverageResolutionAuthorities)

const readText = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8')
const readJson = (path: string): unknown => JSON.parse(readText(path)) as unknown

const expectRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object.`)
  return value as Record<string, unknown>
}

const expectString = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${label} must be a non-empty string.`)
  return value
}

const expectBoolean = (value: unknown, label: string): boolean => {
  if (typeof value !== 'boolean') throw new Error(`${label} must be boolean.`)
  return value
}

const expectStringArray = (value: unknown, label: string, allowEmpty = false): readonly string[] => {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
    throw new Error(`${label} must be ${allowEmpty ? 'an' : 'a non-empty'} array.`)
  }
  return value.map((item, index) => expectString(item, `${label}[${index}]`))
}

const canonicalStrings = (values: readonly string[]): string[] =>
  [...new Set(values)].sort((a, b) => compareDplIdentityStrings(a, b))

const canonicalEntry = (entry: EnglandCoverageEntry): EnglandCoverageEntry => ({
  ...entry,
  accelerationTriggers: canonicalStrings(entry.accelerationTriggers),
  representedTargetIds: canonicalStrings(entry.representedTargetIds),
  selectedMethodRefs: entry.selectedMethodRefs ? canonicalStrings(entry.selectedMethodRefs) : undefined,
  resolutionAuthorities: canonicalStrings(entry.resolutionAuthorities) as EnglandCoverageResolutionAuthority[]
})

const canonicalRegistry = (registry: EnglandCoverageRegistry): EnglandCoverageRegistry => ({
  ...registry,
  authoritySources: canonicalStrings(registry.authoritySources),
  entries: [...registry.entries].map(canonicalEntry).sort((a, b) => compareDplIdentityStrings(a.id, b.id))
})

const validateRegistry = (value: unknown, path: string): EnglandCoverageRegistry => {
  const raw = expectRecord(value, `DPL-09D registry ${path}`)
  if (raw.schemaVersion !== DPL09D_COVERAGE_SCHEMA_VERSION) {
    throw new Error(`Unsupported DPL-09D registry schema ${String(raw.schemaVersion)} at ${path}.`)
  }
  if (raw.id !== 'DPL-09-ENGLAND-SCREENING-COVERAGE-v1') {
    throw new Error(`DPL-09D registry ${path} has unexpected identity.`)
  }
  if (raw.jurisdiction !== 'ENGLAND' || raw.assuranceProfile !== 'SCREENING') {
    throw new Error(`DPL-09D registry ${path} has unexpected jurisdiction/profile.`)
  }
  const authoritySources = expectStringArray(raw.authoritySources, `DPL-09D registry ${path} authoritySources`)
  const projectClass = expectRecord(raw.projectClass, `DPL-09D registry ${path} projectClass`)
  if (projectClass.kind !== 'NEW_DWELLING' || projectClass.higherRiskBuildingRegime !== 'PROJECT_CLASS_EXCLUDED') {
    throw new Error(`DPL-09D registry ${path} has unexpected controlled project class.`)
  }

  if (!Array.isArray(raw.entries)) throw new Error(`DPL-09D registry ${path} entries must be an array.`)
  const ids = new Set<string>()
  const entries = raw.entries.map((value, index): EnglandCoverageEntry => {
    const item = expectRecord(value, `DPL-09D registry ${path} entries[${index}]`)
    const id = expectString(item.id, `DPL-09D registry ${path} entries[${index}].id`)
    if (ids.has(id)) throw new Error(`Duplicate DPL-09D coverage id ${id}.`)
    ids.add(id)

    const applicabilityClass = expectString(item.applicabilityClass, `${id}.applicabilityClass`)
    const defaultScreeningDisposition = expectString(item.defaultScreeningDisposition, `${id}.defaultScreeningDisposition`)
    const implementationState = expectString(item.implementationState, `${id}.implementationState`)
    if (!applicabilitySet.has(applicabilityClass)) throw new Error(`Unsupported DPL-09D applicability class ${applicabilityClass} for ${id}.`)
    if (!dispositionSet.has(defaultScreeningDisposition)) throw new Error(`Unsupported DPL-09D screening disposition ${defaultScreeningDisposition} for ${id}.`)
    if (!implementationSet.has(implementationState)) throw new Error(`Unsupported DPL-09D implementation state ${implementationState} for ${id}.`)

    const resolutionAuthorities = expectStringArray(item.resolutionAuthorities, `${id}.resolutionAuthorities`).map((authority) => {
      if (!resolutionSet.has(authority)) throw new Error(`Unsupported DPL-09D resolution authority ${authority} for ${id}.`)
      return authority as EnglandCoverageResolutionAuthority
    })

    const entry: EnglandCoverageEntry = {
      id,
      family: expectString(item.family, `${id}.family`),
      subject: expectString(item.subject, `${id}.subject`),
      applicabilityClass: applicabilityClass as EnglandCoverageApplicabilityClass,
      defaultScreeningDisposition: defaultScreeningDisposition as EnglandCoverageScreeningDisposition,
      accelerationTriggers: expectStringArray(item.accelerationTriggers, `${id}.accelerationTriggers`, true),
      implementationState: implementationState as EnglandCoverageImplementationState,
      representedTargetIds: expectStringArray(item.representedTargetIds, `${id}.representedTargetIds`, true),
      selectedMethodRefs: item.selectedMethodRefs === undefined
        ? undefined
        : expectStringArray(item.selectedMethodRefs, `${id}.selectedMethodRefs`),
      resolutionAuthorities,
      sourceIdentityRequirement: expectString(item.sourceIdentityRequirement, `${id}.sourceIdentityRequirement`),
      positiveCompatibilityBlockingWhenDue: expectBoolean(
        item.positiveCompatibilityBlockingWhenDue,
        `${id}.positiveCompatibilityBlockingWhenDue`
      ),
      claimBoundary: expectString(item.claimBoundary, `${id}.claimBoundary`)
    }

    if (entry.applicabilityClass === 'CONDITIONAL' && entry.defaultScreeningDisposition === 'NOT_APPLICABLE_PROVED') {
      throw new Error(`Conditional DPL-09D family ${id} cannot be NOT_APPLICABLE_PROVED statically.`)
    }
    if (entry.defaultScreeningDisposition === 'NOT_APPLICABLE_PROVED' && entry.applicabilityClass !== 'PROJECT_CLASS_EXCLUDED') {
      throw new Error(`DPL-09D family ${id} needs proved project-class exclusion for NOT_APPLICABLE_PROVED.`)
    }
    if (entry.implementationState === 'TARGET_SLICE_PARTIAL' && entry.representedTargetIds.length === 0) {
      throw new Error(`DPL-09D partial target family ${id} must name its represented target slice.`)
    }
    if (entry.implementationState === 'SELECTED_METHOD_ONLY' && (entry.selectedMethodRefs?.length ?? 0) === 0) {
      throw new Error(`DPL-09D selected-method family ${id} must name its selected method.`)
    }
    if (entry.implementationState === 'NO_TARGET_SLICE' && entry.representedTargetIds.length !== 0) {
      throw new Error(`DPL-09D no-target family ${id} cannot name a target slice.`)
    }
    if (entry.defaultScreeningDisposition === 'FUTURE_DUE' && entry.positiveCompatibilityBlockingWhenDue !== true) {
      throw new Error(`Future-due DPL-09D family ${id} must still block positive compatibility when it becomes due.`)
    }

    return entry
  })

  for (const expected of expectedEnglandCoverageIds) {
    if (!ids.has(expected)) throw new Error(`DPL-09D registry ${path} is missing family ${expected}.`)
  }
  if (ids.size !== expectedEnglandCoverageIds.length) {
    throw new Error(`DPL-09D registry ${path} contains families outside the controlled DPL-09 coverage universe.`)
  }

  return canonicalRegistry({
    schemaVersion: DPL09D_COVERAGE_SCHEMA_VERSION,
    id: 'DPL-09-ENGLAND-SCREENING-COVERAGE-v1',
    authoritySources,
    jurisdiction: 'ENGLAND',
    projectClass: {
      kind: 'NEW_DWELLING',
      referenceFixture: expectString(projectClass.referenceFixture, `DPL-09D registry ${path} projectClass.referenceFixture`),
      higherRiskBuildingRegime: 'PROJECT_CLASS_EXCLUDED'
    },
    assuranceProfile: 'SCREENING',
    entries
  })
}

const authoritySetFingerprint = (paths: readonly string[]): string =>
  sha256DplSemanticFingerprint(
    canonicalStrings(paths).map((path) => ({
      path,
      fingerprint: sha256DplSemanticFingerprint({ path, content: readText(path) })
    }))
  )

export const loadEnglandCoverageRegistry = (
  path = registryPath
): LoadedEnglandCoverageRegistry => {
  const registry = validateRegistry(readJson(path), path)
  return {
    registry,
    fingerprint: sha256DplSemanticFingerprint(registry),
    authoritySetFingerprint: authoritySetFingerprint(registry.authoritySources)
  }
}

export const englandCoverageEntry = (
  registry: EnglandCoverageRegistry,
  id: string
): EnglandCoverageEntry | undefined => registry.entries.find((entry) => entry.id === id)
