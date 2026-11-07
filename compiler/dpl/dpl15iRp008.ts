import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { sha256SemanticFingerprint } from '../core/identity.js'
import { composeDPL15HRp007 } from './dpl15hRp007.js'

export const DPL15I_PATH = 'project/dpl/sites/dpl-15i-rp008-spatial-evidence-v01.json' as const
export const DPL15I_EXPECTED_PARENT = '3033112069a44c4676e333ee7afa51f66607d9bd9141cd789d84992f9ba201c3' as const
export const DPL15I_RESULT = 'RP008_NOT_READY_LAMBETH_DOCUMENT_TRANSPORT_AND_CONTROLLED_SPATIAL_EVIDENCE_BOUNDARY' as const

const text = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8')
const record = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object.`)
  return value as Record<string, unknown>
}
const string = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || !value.length) throw new Error(`${label} must be a non-empty string.`)
  return value
}
const strings = (value: unknown, label: string): string[] => {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`)
  return value.map((item, index) => string(item, `${label}[${index}]`))
}

export interface DPL15IResult {
  readonly result: typeof DPL15I_RESULT
  readonly siteId: 'DPL-RP-008'
  readonly satisfiedCount: 1
  readonly residualCount: 5
  readonly candidateAuthoringReady: false
  readonly closeNoSpendCorpusTransportSearch: true
  readonly resultFingerprint: string
  readonly nextPacket: string
}

export const validateDPL15I = (value: unknown): Record<string, unknown> => {
  const raw = record(value, 'DPL-15I result')
  if (raw.schemaVersion !== 'dpl.rp008SpatialEvidence.v1') throw new Error('Unexpected DPL-15I schemaVersion.')
  if (raw.packet !== 'DPL-15I') throw new Error('DPL-15I packet mismatch.')
  if (raw.siteId !== 'DPL-RP-008') throw new Error('DPL-15I must evaluate RP-008.')
  if (raw.assuranceProfile !== 'SCREENING') throw new Error('DPL-15I assurance profile must be SCREENING.')

  const parent = record(raw.parent, 'parent')
  if (parent.packet !== 'DPL-15H') throw new Error('DPL-15I parent must be DPL-15H.')
  if (parent.resultFingerprint !== DPL15I_EXPECTED_PARENT) throw new Error('DPL-15I frozen parent fingerprint mismatch.')
  const liveParent = composeDPL15HRp007()
  if (liveParent.resultFingerprint !== DPL15I_EXPECTED_PARENT) throw new Error(`DPL-15I parent drift: ${liveParent.resultFingerprint}`)

  const identity = record(raw.controlledIdentity, 'controlledIdentity')
  if (identity.applicationRef !== '24/00124/FUL') throw new Error('RP-008 exact application identity drifted.')
  if (identity.corpusRole !== 'LOWER_PATHOLOGY_ONE_HOUSE_CONTROL') throw new Error('RP-008 corpus role drifted.')
  if (identity.applicantProposalTransfer !== 'PROHIBITED' || identity.marketingGeometryUse !== 'PROHIBITED_FOR_FIT_NO_FIT') throw new Error('RP-008 authority firewall drifted.')

  if (!Array.isArray(raw.acquisitionAttempts) || raw.acquisitionAttempts.length !== 5) throw new Error('DPL-15I requires exactly five bounded acquisition attempts.')
  const attempts = raw.acquisitionAttempts.map((attempt, index) => record(attempt, `acquisitionAttempts[${index}]`))
  if (new Set(attempts.map((attempt, index) => string(attempt.id, `acquisitionAttempts[${index}].id`))).size !== 5) throw new Error('DPL-15I acquisition attempt IDs must be unique.')
  for (const [index, attempt] of attempts.entries()) strings(attempt.observed, `acquisitionAttempts[${index}].observed`)

  if (!Array.isArray(raw.readiness) || raw.readiness.length !== 6) throw new Error('DPL-15I requires exactly six readiness dimensions.')
  const readiness = raw.readiness.map((entry, index) => record(entry, `readiness[${index}]`))
  const expectedStates = new Map([
    ['R1_CONTROLLED_SPATIAL_IDENTITY', 'NOT_SATISFIED'],
    ['R2_FOOTPRINT_TEST_GEOMETRY', 'NOT_SATISFIED'],
    ['R3_REAL_ORIENTATION_FRAME', 'NOT_SATISFIED'],
    ['R4_DATUM_LEVEL_EVIDENCE', 'NOT_SATISFIED'],
    ['R5_PHYSICAL_ACCESS_STREET_GEOMETRY', 'NOT_SATISFIED'],
    ['R6_SITE_IDENTITY_COHERENCE', 'SATISFIED']
  ])
  if (new Set(readiness.map((entry) => String(entry.dimension))).size !== 6) throw new Error('DPL-15I readiness dimensions must be unique.')
  for (const entry of readiness) {
    const dimension = string(entry.dimension, 'readiness.dimension')
    if (entry.state !== expectedStates.get(dimension)) throw new Error(`DPL-15I readiness state drift for ${dimension}.`)
    strings(entry.evidenceRefs, `${dimension}.evidenceRefs`)
  }

  if (raw.candidateAuthoringReady !== false) throw new Error('RP-008 candidate authoring must remain locked.')
  if (strings(raw.satisfiedDimensions, 'satisfiedDimensions').length !== 1) throw new Error('DPL-15I must satisfy exactly one readiness dimension.')
  if (strings(raw.residualDimensions, 'residualDimensions').length !== 5) throw new Error('DPL-15I must retain exactly five residual readiness dimensions.')

  const disposition = record(raw.programmeDisposition, 'programmeDisposition')
  if (disposition.noSpendCorpusTransportSearch !== 'CLOSE_AFTER_DPL15I') throw new Error('DPL-15I must close the bounded no-spend corpus transport search.')
  if (disposition.nextAction !== 'AUTHOR_PROGRAMME_LEVEL_DPL15_EXTERNAL_EVIDENCE_BOUNDARY') throw new Error('DPL-15I programme next action drifted.')
  if (disposition.additionalConvenienceSiteSearch !== 'PROHIBITED_UNLESS_NEW_EXPERIMENT_INDEPENDENT_OF_DOCUMENT_ACCESSIBILITY') throw new Error('Convenience-site stop rule drifted.')

  const boundary = record(raw.proofBoundary, 'proofBoundary')
  for (const key of ['marketingGeometryAsAuthority', 'applicantProposalTransfer', 'planningRedLineAsLegalTitle', 'titleIndexAsDeterminedBoundary', 'postcodeElevationAsDatum', 'referenceHouseMutation']) {
    if (boundary[key] !== 'PROHIBITED') throw new Error(`${key} must remain prohibited.`)
  }
  if (boundary.referenceHouseCandidate !== 'NOT_AUTHORISED') throw new Error('Reference House candidate authority leaked into DPL-15I.')
  if (boundary.compatibleAtScreening !== 'NOT_ADMITTED' || boundary.incompatible !== 'NOT_ADMITTED') throw new Error('Whole-site conclusion authority leaked into DPL-15I.')
  if (boundary.externalSpend !== 'NONE' || boundary.dpl16 !== 'HELD') throw new Error('Spend/DPL-16 boundary drifted.')
  if (boundary.routeExhaustion !== 'NOT_CLAIMED_BEYOND_BOUNDED_NO_SPEND_CORPUS_TRANSPORT_EXPERIMENT') throw new Error('DPL-15I route-exhaustion restraint drifted.')

  if (raw.result !== DPL15I_RESULT) throw new Error('DPL-15I result mismatch.')
  return raw
}

export const composeDPL15IRp008 = (value: unknown = JSON.parse(text(DPL15I_PATH)) as unknown): DPL15IResult => {
  const validated = validateDPL15I(value)
  const attempts = (validated.acquisitionAttempts as Record<string, unknown>[]).map((attempt): Record<string, unknown> => ({
    ...attempt,
    observed: [...(attempt.observed as string[])].sort()
  })).sort((a, b) => String(a.id).localeCompare(String(b.id)))
  const readiness = (validated.readiness as Record<string, unknown>[]).map((entry): Record<string, unknown> => ({
    ...entry,
    evidenceRefs: [...(entry.evidenceRefs as string[])].sort()
  })).sort((a, b) => String(a.dimension).localeCompare(String(b.dimension)))
  const canonical = {
    ...validated,
    acquisitionAttempts: attempts,
    readiness,
    satisfiedDimensions: [...(validated.satisfiedDimensions as string[])].sort(),
    residualDimensions: [...(validated.residualDimensions as string[])].sort()
  }
  return {
    result: DPL15I_RESULT,
    siteId: 'DPL-RP-008',
    satisfiedCount: 1,
    residualCount: 5,
    candidateAuthoringReady: false,
    closeNoSpendCorpusTransportSearch: true,
    resultFingerprint: sha256SemanticFingerprint(canonical),
    nextPacket: string(validated.nextPacket, 'nextPacket')
  }
}
