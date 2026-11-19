import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './identity-order.js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { composeDPL15G } from './dpl15gComparison.js'

export const DPL15H_PATH = 'project/dpl/sites/dpl-15h-rp007-spatial-evidence-v01.json' as const
export const DPL15H_EXPECTED_PARENT = 'de89a475c840b8c4deaf1509662389e26d7199c31439a7034a3190dd771cfb71' as const
export const DPL15H_RESULT = 'RP007_NOT_READY_CROYDON_DOCUMENT_TRANSPORT_AND_SPATIAL_AUTHORITY_BOUNDARY' as const

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

export interface DPL15HResult {
  readonly result: typeof DPL15H_RESULT
  readonly siteId: 'DPL-RP-007'
  readonly satisfiedCount: 1
  readonly residualCount: 5
  readonly candidateAuthoringReady: false
  readonly resultFingerprint: string
  readonly nextPacket: string
}

export const validateDPL15H = (value: unknown): Record<string, unknown> => {
  const raw = record(value, 'DPL-15H result')
  if (raw.schemaVersion !== 'dpl.rp007SpatialEvidence.v1') throw new Error('Unexpected DPL-15H schemaVersion.')
  if (raw.packet !== 'DPL-15H') throw new Error('DPL-15H packet mismatch.')
  if (raw.siteId !== 'DPL-RP-007') throw new Error('DPL-15H must evaluate RP-007.')
  if (raw.assuranceProfile !== 'SCREENING') throw new Error('DPL-15H assurance profile must be SCREENING.')

  const parent = record(raw.parent, 'parent')
  if (parent.packet !== 'DPL-15G') throw new Error('DPL-15H parent must be DPL-15G.')
  if (parent.resultFingerprint !== DPL15H_EXPECTED_PARENT) throw new Error('DPL-15H frozen parent fingerprint mismatch.')
  const liveParent = composeDPL15G()
  if (liveParent.resultFingerprint !== DPL15H_EXPECTED_PARENT) throw new Error(`DPL-15H parent drift: ${liveParent.resultFingerprint}`)

  const identity = record(raw.controlledIdentity, 'controlledIdentity')
  if (identity.applicationRef !== '25/03774/FUL' || identity.uprn !== '10095497120') throw new Error('RP-007 exact identity drifted.')
  if (identity.applicantProposalTransfer !== 'PROHIBITED') throw new Error('Applicant proposal transfer must remain prohibited.')

  if (!Array.isArray(raw.acquisitionAttempts) || raw.acquisitionAttempts.length !== 5) throw new Error('DPL-15H requires exactly five bounded acquisition attempts.')
  const attempts = raw.acquisitionAttempts.map((attempt, index) => record(attempt, `acquisitionAttempts[${index}]`))
  const attemptIds = attempts.map((attempt, index) => string(attempt.id, `acquisitionAttempts[${index}].id`))
  if (new Set(attemptIds).size !== 5) throw new Error('DPL-15H acquisition attempt IDs must be unique.')
  for (const [index, attempt] of attempts.entries()) strings(attempt.observed, `acquisitionAttempts[${index}].observed`)

  if (!Array.isArray(raw.readiness) || raw.readiness.length !== 6) throw new Error('DPL-15H requires exactly six readiness dimensions.')
  const readiness = raw.readiness.map((entry, index) => record(entry, `readiness[${index}]`))
  const expectedStates = new Map([
    ['R1_CONTROLLED_SPATIAL_IDENTITY', 'NOT_SATISFIED'],
    ['R2_FOOTPRINT_TEST_GEOMETRY', 'NOT_SATISFIED'],
    ['R3_REAL_ORIENTATION_FRAME', 'NOT_SATISFIED'],
    ['R4_DATUM_LEVEL_EVIDENCE', 'NOT_SATISFIED'],
    ['R5_PHYSICAL_ACCESS_STREET_GEOMETRY', 'NOT_SATISFIED'],
    ['R6_SITE_IDENTITY_COHERENCE', 'SATISFIED']
  ])
  if (new Set(readiness.map((entry) => String(entry.dimension))).size !== 6) throw new Error('DPL-15H readiness dimensions must be unique.')
  for (const entry of readiness) {
    const dimension = string(entry.dimension, 'readiness.dimension')
    if (entry.state !== expectedStates.get(dimension)) throw new Error(`DPL-15H readiness state drift for ${dimension}.`)
    strings(entry.evidenceRefs, `${dimension}.evidenceRefs`)
  }

  if (raw.candidateAuthoringReady !== false) throw new Error('RP-007 candidate authoring must remain locked.')
  if (strings(raw.satisfiedDimensions, 'satisfiedDimensions').length !== 1) throw new Error('DPL-15H must satisfy exactly one readiness dimension.')
  if (strings(raw.residualDimensions, 'residualDimensions').length !== 5) throw new Error('DPL-15H must retain exactly five residual readiness dimensions.')

  const disposition = record(raw.nextDisposition, 'nextDisposition')
  if (disposition.rp007 !== 'HOLD_AT_EXTERNAL_OR_PORTAL_CONTROLLED_SPATIAL_EVIDENCE_BOUNDARY') throw new Error('RP-007 hold disposition drifted.')
  if (disposition.rp008 !== 'EXECUTE_BOUNDED_NO_SPEND_TRANSPORT_TEST_NEXT') throw new Error('RP-008 next disposition drifted.')

  const boundary = record(raw.proofBoundary, 'proofBoundary')
  for (const key of ['marketingGeometryAsAuthority', 'applicantProposalTransfer', 'planningRedLineAsLegalTitle', 'titleIndexAsDeterminedBoundary', 'narrativeSteepnessAsDatum', 'referenceHouseMutation']) {
    if (boundary[key] !== 'PROHIBITED') throw new Error(`${key} must remain prohibited.`)
  }
  if (boundary.referenceHouseCandidate !== 'NOT_AUTHORISED') throw new Error('Reference House candidate authority leaked into DPL-15H.')
  if (boundary.compatibleAtScreening !== 'NOT_ADMITTED' || boundary.incompatible !== 'NOT_ADMITTED') throw new Error('Whole-site conclusion authority leaked into DPL-15H.')
  if (boundary.externalSpend !== 'NONE' || boundary.dpl16 !== 'HELD') throw new Error('Spend/DPL-16 boundary drifted.')

  if (raw.result !== DPL15H_RESULT) throw new Error('DPL-15H result mismatch.')
  return raw
}

export const composeDPL15HRp007 = (value: unknown = JSON.parse(text(DPL15H_PATH)) as unknown): DPL15HResult => {
  const validated = validateDPL15H(value)
  const attempts = (validated.acquisitionAttempts as Record<string, unknown>[]).map((attempt): Record<string, unknown> => ({
    ...attempt,
    observed: [...(attempt.observed as string[])].sort()
  })).sort((a, b) => compareDplIdentityStrings(String(a.id), String(b.id)))
  const readiness = (validated.readiness as Record<string, unknown>[]).map((entry): Record<string, unknown> => ({
    ...entry,
    evidenceRefs: [...(entry.evidenceRefs as string[])].sort()
  })).sort((a, b) => compareDplIdentityStrings(String(a.dimension), String(b.dimension)))
  const canonical = {
    ...validated,
    acquisitionAttempts: attempts,
    readiness,
    satisfiedDimensions: [...(validated.satisfiedDimensions as string[])].sort(),
    residualDimensions: [...(validated.residualDimensions as string[])].sort()
  }
  return {
    result: DPL15H_RESULT,
    siteId: 'DPL-RP-007',
    satisfiedCount: 1,
    residualCount: 5,
    candidateAuthoringReady: false,
    resultFingerprint: sha256DplSemanticFingerprint(canonical),
    nextPacket: string(validated.nextPacket, 'nextPacket')
  }
}
