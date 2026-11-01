import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { sha256SemanticFingerprint } from '../core/identity.js'

export const DPL10E_COVERAGE_SCHEMA_VERSION = 'dpl.planningScreeningCoverageRegistry.v1' as const

export const planningCoverageDispositions = [
  'DUE_NOW_REPRESENTED',
  'DUE_NOW_MISSING',
  'FUTURE_DUE',
  'DUE_CLASSIFICATION_UNRESOLVED',
  'NOT_APPLICABLE_PROVED',
  'ADVISORY_NON_BLOCKING'
] as const
export type PlanningCoverageDisposition = (typeof planningCoverageDispositions)[number]

export const planningSourceClasses = [
  'OFFICIAL_SOURCE_STATUS_RECORD',
  'NATIONAL_MATERIAL_CONSIDERATION',
  'LONDON_DEVELOPMENT_PLAN_POLICY',
  'LONDON_ADOPTED_GUIDANCE',
  'BOROUGH_DEVELOPMENT_PLAN_POLICY',
  'BOROUGH_ADOPTED_GUIDANCE',
  'EMERGING_NON_OPERATIVE_POLICY',
  'PLANNING_APPLICATION_EVIDENCE',
  'EXTERNAL_STATUTORY_DETERMINATION'
] as const
export type PlanningSourceClass = (typeof planningSourceClasses)[number]

export const planningApplicabilityClasses = [
  'SOURCE_STATUS_CORE',
  'CORE_LONDON',
  'CONDITIONAL_SITE_CONTEXT',
  'LOCAL_AUTHORITY_DEPENDENT',
  'PROCESS_DEPENDENT',
  'EXTERNAL_DECISION_DEPENDENT'
] as const
export type PlanningApplicabilityClass = (typeof planningApplicabilityClasses)[number]

export const planningResolutionClasses = [
  'P1_SITE_PROJECT_FACT',
  'P2_MECHANICAL_APPLICABILITY',
  'P3_BOUNDED_QUANTITATIVE_POLICY',
  'P4_EVIDENCE_LED_TECHNICAL_PLANNING_ASSESSMENT',
  'P5_QUALITATIVE_PLANNING_JUDGEMENT',
  'P6_STATUTORY_DETERMINATION'
] as const
export type PlanningResolutionClass = (typeof planningResolutionClasses)[number]

export const planningImplementationStates = [
  'SOURCE_STATUS_SPINE',
  'STRATEGIC_TARGET_SLICE_PARTIAL',
  'BOROUGH_EXEMPLAR_PARTIAL',
  'REGISTRY_ONLY',
  'EXTERNAL_ONLY'
] as const
export type PlanningImplementationState = (typeof planningImplementationStates)[number]

export const planningLocalTargetStates = ['NO_REAL_BOROUGH_ASSIGNED'] as const
export type PlanningLocalTargetState = (typeof planningLocalTargetStates)[number]

export const controlledPlanningTargetIds = [
  'LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20',
  'CROYDON-LOCAL-PLANNING-2018-2026-10-21',
  'BROMLEY-LOCAL-PLANNING-2019-2026-10-22'
] as const

export const expectedPlanningCoverageIds = [
  'DPL10-COV-SOURCE-COMPOSITION-STATUS',
  'DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY',
  'DPL10-COV-HOUSING-QUALITY-ACCESSIBILITY',
  'DPL10-COV-NEIGHBOUR-AMENITY-PRIVACY-DAYLIGHT',
  'DPL10-COV-TRANSPORT-ACCESS-HIGHWAY-PARKING',
  'DPL10-COV-HERITAGE-DESIGNATION-SETTING',
  'DPL10-COV-TREES-LANDSCAPE-URBAN-GREENING',
  'DPL10-COV-ECOLOGY-BIODIVERSITY-GREEN-INFRASTRUCTURE',
  'DPL10-COV-FLOOD-DRAINAGE-SUDS-PLANNING',
  'DPL10-COV-AIR-QUALITY-NOISE-AGENT-OF-CHANGE',
  'DPL10-COV-ENERGY-CARBON-SUSTAINABILITY-PLANNING',
  'DPL10-COV-LOCAL-QUANTITATIVE-POLICY',
  'DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY',
  'DPL10-COV-VALIDATION-PROCESS-SPECIALIST-EVIDENCE',
  'DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT',
  'DPL10-COV-EXTERNAL-DETERMINATION-HISTORY-CONDITIONS'
] as const

export interface PlanningCoverageEntry {
  readonly id: string
  readonly family: string
  readonly subject: string
  readonly sourceClasses: readonly PlanningSourceClass[]
  readonly applicabilityClass: PlanningApplicabilityClass
  readonly defaultScreeningDisposition: PlanningCoverageDisposition
  readonly accelerationTriggers: readonly string[]
  readonly resolutionClasses: readonly PlanningResolutionClass[]
  readonly implementationState: PlanningImplementationState
  readonly representedTargetIds: readonly string[]
  readonly referenceSiteClaimIds: readonly string[]
  readonly ownerBoundaries: readonly string[]
  readonly positiveCompatibilityBlockingWhenDue: boolean
  readonly claimBoundary: string
}

export interface PlanningCoverageRegistry {
  readonly schemaVersion: typeof DPL10E_COVERAGE_SCHEMA_VERSION
  readonly id: 'DPL-10-PLANNING-SCREENING-COVERAGE-v1'
  readonly jurisdictionContext: 'GREATER_LONDON'
  readonly assuranceProfile: 'SCREENING'
  readonly authoritySources: readonly string[]
  readonly canonicalFixture: {
    readonly siteId: 'DPL-RS-01'
    readonly siteManifestPath: string
    readonly localPlanningTargetState: PlanningLocalTargetState
    readonly localPlanningTargetIds: readonly string[]
  }
  readonly entries: readonly PlanningCoverageEntry[]
}

export interface LoadedPlanningCoverageRegistry {
  readonly registry: PlanningCoverageRegistry
  readonly fingerprint: string
  readonly authoritySetFingerprint: string
  readonly canonicalSiteClaimSetFingerprint: string
  readonly targetIdentitySetFingerprint: string
}

const registryPath = 'project/dpl/coverage/dpl-10-planning-screening-coverage-v1.json'
const targetPaths = [
  'project/dpl/targets/london-strategic-residential-design-v1.json',
  'project/dpl/targets/croydon-local-planning-v1.json',
  'project/dpl/targets/bromley-local-planning-v1.json'
] as const

const dispositionSet = new Set<string>(planningCoverageDispositions)
const sourceSet = new Set<string>(planningSourceClasses)
const applicabilitySet = new Set<string>(planningApplicabilityClasses)
const resolutionSet = new Set<string>(planningResolutionClasses)
const implementationSet = new Set<string>(planningImplementationStates)
const localTargetStateSet = new Set<string>(planningLocalTargetStates)
const targetIdSet = new Set<string>(controlledPlanningTargetIds)

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
  [...new Set(values)].sort((a, b) => a.localeCompare(b))

const canonicalEntry = (entry: PlanningCoverageEntry): PlanningCoverageEntry => ({
  ...entry,
  sourceClasses: canonicalStrings(entry.sourceClasses) as PlanningSourceClass[],
  accelerationTriggers: canonicalStrings(entry.accelerationTriggers),
  resolutionClasses: canonicalStrings(entry.resolutionClasses) as PlanningResolutionClass[],
  representedTargetIds: canonicalStrings(entry.representedTargetIds),
  referenceSiteClaimIds: canonicalStrings(entry.referenceSiteClaimIds),
  ownerBoundaries: canonicalStrings(entry.ownerBoundaries)
})

const canonicalRegistry = (registry: PlanningCoverageRegistry): PlanningCoverageRegistry => ({
  ...registry,
  authoritySources: canonicalStrings(registry.authoritySources),
  canonicalFixture: {
    ...registry.canonicalFixture,
    localPlanningTargetIds: canonicalStrings(registry.canonicalFixture.localPlanningTargetIds)
  },
  entries: [...registry.entries].map(canonicalEntry).sort((a, b) => a.id.localeCompare(b.id))
})

const readReferenceSiteClaimIds = (path: string): readonly string[] => {
  const raw = expectRecord(readJson(path), `Reference Site manifest ${path}`)
  if (raw.siteId !== 'DPL-RS-01') throw new Error(`Planning coverage canonical site manifest ${path} must be DPL-RS-01.`)
  if (!Array.isArray(raw.claims)) throw new Error(`Reference Site manifest ${path} claims must be an array.`)
  const ids = raw.claims.map((value, index) => {
    const claim = expectRecord(value, `Reference Site manifest ${path} claims[${index}]`)
    return expectString(claim.id, `Reference Site manifest ${path} claims[${index}].id`)
  })
  return canonicalStrings(ids)
}

const readTargetIds = (): readonly string[] =>
  targetPaths.map((path) => {
    const raw = expectRecord(readJson(path), `Planning target ${path}`)
    return expectString(raw.id, `Planning target ${path}.id`)
  }).sort((a, b) => a.localeCompare(b))

const validateRegistry = (value: unknown, path: string): PlanningCoverageRegistry => {
  const raw = expectRecord(value, `DPL-10E registry ${path}`)
  if (raw.schemaVersion !== DPL10E_COVERAGE_SCHEMA_VERSION) {
    throw new Error(`Unsupported DPL-10E registry schema ${String(raw.schemaVersion)} at ${path}.`)
  }
  if (raw.id !== 'DPL-10-PLANNING-SCREENING-COVERAGE-v1') throw new Error(`DPL-10E registry ${path} has unexpected identity.`)
  if (raw.jurisdictionContext !== 'GREATER_LONDON') throw new Error(`DPL-10E registry ${path} must use GREATER_LONDON jurisdiction context.`)
  if (raw.assuranceProfile !== 'SCREENING') throw new Error(`DPL-10E registry ${path} must use SCREENING assurance profile.`)

  const authoritySources = expectStringArray(raw.authoritySources, `DPL-10E registry ${path} authoritySources`)
  const fixtureRaw = expectRecord(raw.canonicalFixture, `DPL-10E registry ${path} canonicalFixture`)
  if (fixtureRaw.siteId !== 'DPL-RS-01') throw new Error(`DPL-10E canonical fixture must be DPL-RS-01.`)
  const siteManifestPath = expectString(fixtureRaw.siteManifestPath, `DPL-10E canonicalFixture.siteManifestPath`)
  const localTargetState = expectString(fixtureRaw.localPlanningTargetState, `DPL-10E canonicalFixture.localPlanningTargetState`)
  if (!localTargetStateSet.has(localTargetState)) throw new Error(`Unsupported DPL-10E local planning target state ${localTargetState}.`)
  const localPlanningTargetIds = expectStringArray(fixtureRaw.localPlanningTargetIds, `DPL-10E canonicalFixture.localPlanningTargetIds`, true)
  if (localTargetState === 'NO_REAL_BOROUGH_ASSIGNED' && localPlanningTargetIds.length !== 0) {
    throw new Error(`DPL-10E synthetic fixture cannot assign a local planning target.`)
  }

  const claimIds = new Set(readReferenceSiteClaimIds(siteManifestPath))
  const actualTargetIds = readTargetIds()
  if (JSON.stringify(actualTargetIds) !== JSON.stringify([...controlledPlanningTargetIds].sort((a, b) => a.localeCompare(b)))) {
    throw new Error(`DPL-10E controlled planning target identities drifted from the current target artefacts.`)
  }

  if (!Array.isArray(raw.entries)) throw new Error(`DPL-10E registry ${path} entries must be an array.`)
  const ids = new Set<string>()
  const entries = raw.entries.map((value, index): PlanningCoverageEntry => {
    const item = expectRecord(value, `DPL-10E registry ${path} entries[${index}]`)
    const id = expectString(item.id, `DPL-10E registry ${path} entries[${index}].id`)
    if (ids.has(id)) throw new Error(`Duplicate DPL-10E coverage id ${id}.`)
    ids.add(id)

    const sourceClasses = expectStringArray(item.sourceClasses, `${id}.sourceClasses`).map((source) => {
      if (!sourceSet.has(source)) throw new Error(`Unsupported DPL-10E source class ${source} for ${id}.`)
      return source as PlanningSourceClass
    })
    const applicability = expectString(item.applicabilityClass, `${id}.applicabilityClass`)
    const disposition = expectString(item.defaultScreeningDisposition, `${id}.defaultScreeningDisposition`)
    const implementation = expectString(item.implementationState, `${id}.implementationState`)
    if (!applicabilitySet.has(applicability)) throw new Error(`Unsupported DPL-10E applicability class ${applicability} for ${id}.`)
    if (!dispositionSet.has(disposition)) throw new Error(`Unsupported DPL-10E screening disposition ${disposition} for ${id}.`)
    if (!implementationSet.has(implementation)) throw new Error(`Unsupported DPL-10E implementation state ${implementation} for ${id}.`)

    const resolutions = expectStringArray(item.resolutionClasses, `${id}.resolutionClasses`).map((resolution) => {
      if (!resolutionSet.has(resolution)) throw new Error(`Unsupported DPL-10E resolution class ${resolution} for ${id}.`)
      return resolution as PlanningResolutionClass
    })
    const representedTargetIds = expectStringArray(item.representedTargetIds, `${id}.representedTargetIds`, true)
    for (const targetId of representedTargetIds) {
      if (!targetIdSet.has(targetId)) throw new Error(`DPL-10E ${id} references uncontrolled planning target ${targetId}.`)
    }
    const referenceSiteClaimIds = expectStringArray(item.referenceSiteClaimIds, `${id}.referenceSiteClaimIds`, true)
    for (const claimId of referenceSiteClaimIds) {
      if (!claimIds.has(claimId)) throw new Error(`DPL-10E ${id} references unknown DPL-RS-01 claim ${claimId}.`)
    }

    const entry: PlanningCoverageEntry = {
      id,
      family: expectString(item.family, `${id}.family`),
      subject: expectString(item.subject, `${id}.subject`),
      sourceClasses,
      applicabilityClass: applicability as PlanningApplicabilityClass,
      defaultScreeningDisposition: disposition as PlanningCoverageDisposition,
      accelerationTriggers: expectStringArray(item.accelerationTriggers, `${id}.accelerationTriggers`, true),
      resolutionClasses: resolutions,
      implementationState: implementation as PlanningImplementationState,
      representedTargetIds,
      referenceSiteClaimIds,
      ownerBoundaries: expectStringArray(item.ownerBoundaries, `${id}.ownerBoundaries`),
      positiveCompatibilityBlockingWhenDue: expectBoolean(item.positiveCompatibilityBlockingWhenDue, `${id}.positiveCompatibilityBlockingWhenDue`),
      claimBoundary: expectString(item.claimBoundary, `${id}.claimBoundary`)
    }

    if (entry.defaultScreeningDisposition === 'NOT_APPLICABLE_PROVED') {
      throw new Error(`DPL-10E registry ${id} cannot statically assert NOT_APPLICABLE_PROVED.`)
    }
    if (entry.defaultScreeningDisposition === 'FUTURE_DUE' && !entry.positiveCompatibilityBlockingWhenDue) {
      throw new Error(`Future-due DPL-10E family ${id} must block positive compatibility when it becomes due.`)
    }
    if (entry.resolutionClasses.includes('P6_STATUTORY_DETERMINATION')) {
      if (entry.implementationState !== 'EXTERNAL_ONLY' || entry.resolutionClasses.length !== 1) {
        throw new Error(`DPL-10E P6 determination family ${id} must remain EXTERNAL_ONLY and cannot mix P1-P5 resolution.`)
      }
    }
    if (entry.implementationState === 'STRATEGIC_TARGET_SLICE_PARTIAL' && !entry.representedTargetIds.includes(controlledPlanningTargetIds[0])) {
      throw new Error(`DPL-10E strategic partial family ${id} must map the controlled London strategic target.`)
    }
    if (entry.implementationState === 'BOROUGH_EXEMPLAR_PARTIAL') {
      const boroughIds = new Set(entry.representedTargetIds.filter((targetId) => targetId !== controlledPlanningTargetIds[0]))
      if (boroughIds.size === 0) throw new Error(`DPL-10E borough exemplar family ${id} must map at least one controlled borough target.`)
    }

    return entry
  })

  for (const expected of expectedPlanningCoverageIds) {
    if (!ids.has(expected)) throw new Error(`DPL-10E registry ${path} is missing family ${expected}.`)
  }
  if (ids.size !== expectedPlanningCoverageIds.length) {
    throw new Error(`DPL-10E registry ${path} contains families outside the controlled DPL-10 coverage universe.`)
  }

  return canonicalRegistry({
    schemaVersion: DPL10E_COVERAGE_SCHEMA_VERSION,
    id: 'DPL-10-PLANNING-SCREENING-COVERAGE-v1',
    jurisdictionContext: 'GREATER_LONDON',
    assuranceProfile: 'SCREENING',
    authoritySources,
    canonicalFixture: {
      siteId: 'DPL-RS-01',
      siteManifestPath,
      localPlanningTargetState: localTargetState as PlanningLocalTargetState,
      localPlanningTargetIds
    },
    entries
  })
}

const authoritySetFingerprint = (paths: readonly string[]): string =>
  sha256SemanticFingerprint(canonicalStrings(paths).map((path) => ({
    path,
    fingerprint: sha256SemanticFingerprint({ path, content: readText(path) })
  })))

export const loadPlanningCoverageRegistry = (path = registryPath): LoadedPlanningCoverageRegistry => {
  const registry = validateRegistry(readJson(path), path)
  const siteClaimIds = readReferenceSiteClaimIds(registry.canonicalFixture.siteManifestPath)
  const targetIds = readTargetIds()
  return {
    registry,
    fingerprint: sha256SemanticFingerprint(registry),
    authoritySetFingerprint: authoritySetFingerprint(registry.authoritySources),
    canonicalSiteClaimSetFingerprint: sha256SemanticFingerprint(siteClaimIds),
    targetIdentitySetFingerprint: sha256SemanticFingerprint(targetIds)
  }
}

export const planningCoverageEntry = (
  registry: PlanningCoverageRegistry,
  id: string
): PlanningCoverageEntry | undefined => registry.entries.find((entry) => entry.id === id)
