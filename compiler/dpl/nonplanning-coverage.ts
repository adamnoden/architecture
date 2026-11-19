import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './identity-order.js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const DPL11B_COVERAGE_SCHEMA_VERSION = 'dpl.nonPlanningScreeningCoverageRegistry.v1' as const

export const nonPlanningCoverageDispositions = [
  'DUE_NOW_REPRESENTED',
  'DUE_NOW_MISSING',
  'FUTURE_DUE',
  'DUE_CLASSIFICATION_UNRESOLVED',
  'NOT_APPLICABLE_PROVED',
  'ADVISORY_NON_BLOCKING'
] as const
export type NonPlanningCoverageDisposition = (typeof nonPlanningCoverageDispositions)[number]

export const nonPlanningResolutionAuthorities = [
  'TITLE_OR_LEGAL_EVIDENCE',
  'SURVEY_EVIDENCE',
  'UTILITY_OR_UNDERTAKER_EVIDENCE',
  'GEOTECHNICAL_OR_ENVIRONMENTAL_EVIDENCE',
  'ARBORICULTURAL_EVIDENCE',
  'STATUTORY_PRIVATE_PROCESS',
  'LOGISTICS_OR_METHOD_PLAN',
  'NATIVE_APPLICABILITY_ONLY',
  'EXTERNAL_FLOOD_OR_WATER_EVIDENCE',
  'HIGHWAY_OR_ACCESS_EVIDENCE'
] as const
export type NonPlanningResolutionAuthority = (typeof nonPlanningResolutionAuthorities)[number]

export const nonPlanningRuntimeStates = ['SITE_CLAIM_REFERENCED', 'REGISTRY_ONLY'] as const
export type NonPlanningRuntimeState = (typeof nonPlanningRuntimeStates)[number]

export interface NonPlanningCoverageEntry {
  readonly id: string
  readonly family: string
  readonly subject: string
  readonly defaultScreeningDisposition: NonPlanningCoverageDisposition
  readonly accelerationTriggers: readonly string[]
  readonly applicabilityInputs: readonly string[]
  readonly resolutionAuthorities: readonly NonPlanningResolutionAuthority[]
  readonly runtimeRepresentationState: NonPlanningRuntimeState
  readonly referenceSiteClaimIds: readonly string[]
  readonly ownerBoundaries: readonly string[]
  readonly positiveCompatibilityBlockingWhenDue: boolean
  readonly claimBoundary: string
}

export interface NonPlanningCoverageRegistry {
  readonly schemaVersion: typeof DPL11B_COVERAGE_SCHEMA_VERSION
  readonly id: 'DPL-11-NONPLANNING-SCREENING-COVERAGE-v1'
  readonly authoritySources: readonly string[]
  readonly assuranceProfile: 'SCREENING'
  readonly entries: readonly NonPlanningCoverageEntry[]
}

export interface LoadedNonPlanningCoverageRegistry {
  readonly registry: NonPlanningCoverageRegistry
  readonly fingerprint: string
  readonly authoritySetFingerprint: string
}

const registryPath = 'project/dpl/coverage/dpl-11-nonplanning-screening-coverage-v1.json'

export const expectedNonPlanningCoverageIds = [
  'DPL11-COV-SITE-CONTROL',
  'DPL11-COV-LEGAL-BOUNDARY-TITLE',
  'DPL11-COV-PRIVATE-RIGHTS',
  'DPL11-COV-NEIGHBOUR-PRIVATE-PROCESS',
  'DPL11-COV-SEWER-UNDERTAKER',
  'DPL11-COV-UTILITIES',
  'DPL11-COV-GROUND-ENVIRONMENT',
  'DPL11-COV-PHYSICAL-FLOOD-WATER',
  'DPL11-COV-ACCESS-STATUS',
  'DPL11-COV-CONSTRUCTION-LOGISTICS'
] as const

const dispositionSet = new Set<string>(nonPlanningCoverageDispositions)
const resolutionSet = new Set<string>(nonPlanningResolutionAuthorities)
const runtimeSet = new Set<string>(nonPlanningRuntimeStates)

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

const canonicalEntry = (entry: NonPlanningCoverageEntry): NonPlanningCoverageEntry => ({
  ...entry,
  accelerationTriggers: canonicalStrings(entry.accelerationTriggers),
  applicabilityInputs: canonicalStrings(entry.applicabilityInputs),
  resolutionAuthorities: canonicalStrings(entry.resolutionAuthorities) as NonPlanningResolutionAuthority[],
  referenceSiteClaimIds: canonicalStrings(entry.referenceSiteClaimIds),
  ownerBoundaries: canonicalStrings(entry.ownerBoundaries)
})

const canonicalRegistry = (registry: NonPlanningCoverageRegistry): NonPlanningCoverageRegistry => ({
  ...registry,
  authoritySources: canonicalStrings(registry.authoritySources),
  entries: [...registry.entries].map(canonicalEntry).sort((a, b) => compareDplIdentityStrings(a.id, b.id))
})

const validateRegistry = (value: unknown, path: string): NonPlanningCoverageRegistry => {
  const raw = expectRecord(value, `DPL-11B registry ${path}`)
  if (raw.schemaVersion !== DPL11B_COVERAGE_SCHEMA_VERSION) {
    throw new Error(`Unsupported DPL-11B registry schema ${String(raw.schemaVersion)} at ${path}.`)
  }
  if (raw.id !== 'DPL-11-NONPLANNING-SCREENING-COVERAGE-v1') {
    throw new Error(`DPL-11B registry ${path} has unexpected identity.`)
  }
  if (raw.assuranceProfile !== 'SCREENING') {
    throw new Error(`DPL-11B registry ${path} must use SCREENING assurance profile.`)
  }
  const authoritySources = expectStringArray(raw.authoritySources, `DPL-11B registry ${path} authoritySources`)

  if (!Array.isArray(raw.entries)) throw new Error(`DPL-11B registry ${path} entries must be an array.`)
  const ids = new Set<string>()
  const entries = raw.entries.map((value, index): NonPlanningCoverageEntry => {
    const item = expectRecord(value, `DPL-11B registry ${path} entries[${index}]`)
    const id = expectString(item.id, `DPL-11B registry ${path} entries[${index}].id`)
    if (ids.has(id)) throw new Error(`Duplicate DPL-11B coverage id ${id}.`)
    ids.add(id)

    const disposition = expectString(item.defaultScreeningDisposition, `${id}.defaultScreeningDisposition`)
    const runtimeState = expectString(item.runtimeRepresentationState, `${id}.runtimeRepresentationState`)
    if (!dispositionSet.has(disposition)) throw new Error(`Unsupported DPL-11B screening disposition ${disposition} for ${id}.`)
    if (!runtimeSet.has(runtimeState)) throw new Error(`Unsupported DPL-11B runtime state ${runtimeState} for ${id}.`)

    const authorities = expectStringArray(item.resolutionAuthorities, `${id}.resolutionAuthorities`).map((authority) => {
      if (!resolutionSet.has(authority)) throw new Error(`Unsupported DPL-11B resolution authority ${authority} for ${id}.`)
      return authority as NonPlanningResolutionAuthority
    })

    const entry: NonPlanningCoverageEntry = {
      id,
      family: expectString(item.family, `${id}.family`),
      subject: expectString(item.subject, `${id}.subject`),
      defaultScreeningDisposition: disposition as NonPlanningCoverageDisposition,
      accelerationTriggers: expectStringArray(item.accelerationTriggers, `${id}.accelerationTriggers`, true),
      applicabilityInputs: expectStringArray(item.applicabilityInputs, `${id}.applicabilityInputs`),
      resolutionAuthorities: authorities,
      runtimeRepresentationState: runtimeState as NonPlanningRuntimeState,
      referenceSiteClaimIds: expectStringArray(item.referenceSiteClaimIds, `${id}.referenceSiteClaimIds`),
      ownerBoundaries: expectStringArray(item.ownerBoundaries, `${id}.ownerBoundaries`),
      positiveCompatibilityBlockingWhenDue: expectBoolean(
        item.positiveCompatibilityBlockingWhenDue,
        `${id}.positiveCompatibilityBlockingWhenDue`
      ),
      claimBoundary: expectString(item.claimBoundary, `${id}.claimBoundary`)
    }

    if (entry.defaultScreeningDisposition === 'NOT_APPLICABLE_PROVED') {
      throw new Error(`DPL-11B registry ${id} cannot statically assert NOT_APPLICABLE_PROVED.`)
    }
    if (entry.defaultScreeningDisposition === 'FUTURE_DUE' && entry.positiveCompatibilityBlockingWhenDue !== true) {
      throw new Error(`Future-due DPL-11B family ${id} must block positive compatibility when it becomes due.`)
    }
    if (entry.runtimeRepresentationState === 'SITE_CLAIM_REFERENCED' && entry.referenceSiteClaimIds.length === 0) {
      throw new Error(`DPL-11B site-claim family ${id} must name its Reference Site claim references.`)
    }

    return entry
  })

  for (const expected of expectedNonPlanningCoverageIds) {
    if (!ids.has(expected)) throw new Error(`DPL-11B registry ${path} is missing family ${expected}.`)
  }
  if (ids.size !== expectedNonPlanningCoverageIds.length) {
    throw new Error(`DPL-11B registry ${path} contains families outside the controlled DPL-11 coverage universe.`)
  }

  return canonicalRegistry({
    schemaVersion: DPL11B_COVERAGE_SCHEMA_VERSION,
    id: 'DPL-11-NONPLANNING-SCREENING-COVERAGE-v1',
    authoritySources,
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

export const loadNonPlanningCoverageRegistry = (
  path = registryPath
): LoadedNonPlanningCoverageRegistry => {
  const registry = validateRegistry(readJson(path), path)
  return {
    registry,
    fingerprint: sha256DplSemanticFingerprint(registry),
    authoritySetFingerprint: authoritySetFingerprint(registry.authoritySources)
  }
}

export const nonPlanningCoverageEntry = (
  registry: NonPlanningCoverageRegistry,
  id: string
): NonPlanningCoverageEntry | undefined => registry.entries.find((entry) => entry.id === id)
