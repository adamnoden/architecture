import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './identity-order.js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { composeDPL15FRp006 } from './dpl15fRp006.js'

export const DPL15G_PATH = 'project/dpl/sites/dpl-15g-rp007-rp008-comparison-v01.json' as const
export const DPL15G_EXPECTED_PARENT = '035ef8d620c4a1f7f5117344c298ddac5b58ed1d4260548975826ce6395bc942' as const
export const DPL15G_RESULT = 'RP007_SELECTED_NEXT_NO_SPEND_CORPUS_EVIDENCE_TARGET' as const
export const DPL15G_UNIVERSE = ['DPL-RP-007', 'DPL-RP-008'] as const

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
const same = (actual: readonly string[], expected: readonly string[], label: string): void => {
  if (JSON.stringify([...actual].sort()) !== JSON.stringify([...expected].sort())) throw new Error(`${label} mismatch.`)
}

export interface DPL15GResult {
  readonly result: typeof DPL15G_RESULT
  readonly selectedSiteId: 'DPL-RP-007'
  readonly heldSiteId: 'DPL-RP-008'
  readonly comparisonCount: 2
  readonly resultFingerprint: string
  readonly nextPacket: string
}

export const validateDPL15G = (value: unknown): Record<string, unknown> => {
  const raw = record(value, 'DPL-15G result')
  if (raw.schemaVersion !== 'dpl.corpusNoSpendPathComparison.v1') throw new Error('Unexpected DPL-15G schemaVersion.')
  if (raw.packet !== 'DPL-15G') throw new Error('DPL-15G packet mismatch.')
  if (raw.assuranceProfile !== 'SCREENING') throw new Error('DPL-15G assurance profile must be SCREENING.')

  const parent = record(raw.parent, 'parent')
  if (parent.packet !== 'DPL-15F') throw new Error('DPL-15G parent must be DPL-15F.')
  if (parent.resultFingerprint !== DPL15G_EXPECTED_PARENT) throw new Error('DPL-15G frozen parent fingerprint mismatch.')
  const liveParent = composeDPL15FRp006()
  if (liveParent.resultFingerprint !== DPL15G_EXPECTED_PARENT) throw new Error(`DPL-15G parent drift: ${liveParent.resultFingerprint}`)

  same(strings(raw.comparisonUniverse, 'comparisonUniverse'), DPL15G_UNIVERSE, 'comparison universe')
  const criteria = strings(raw.criteria, 'criteria')
  if (criteria.length !== 8 || new Set(criteria).size !== 8) throw new Error('DPL-15G requires exactly eight unique categorical criteria.')

  if (!Array.isArray(raw.sites) || raw.sites.length !== 2) throw new Error('DPL-15G requires exactly two site records.')
  const sites = raw.sites.map((site, index) => record(site, `sites[${index}]`))
  same(sites.map((site, index) => string(site.siteId, `sites[${index}].siteId`)), DPL15G_UNIVERSE, 'site universe')

  const rp007 = sites.find((site) => site.siteId === 'DPL-RP-007')!
  const rp008 = sites.find((site) => site.siteId === 'DPL-RP-008')!
  if (rp007.nextPacketSuitability !== 'SELECT') throw new Error('RP-007 must be the selected next evidence target.')
  if (rp008.nextPacketSuitability !== 'HOLD_AS_LOWER_PATHOLOGY_CONTROL') throw new Error('RP-008 must remain held as lower-pathology control.')

  const rp007Identity = record(rp007.currentPlanningIdentity, 'RP-007 currentPlanningIdentity')
  if (rp007Identity.uprn !== '10095497120') throw new Error('RP-007 exact UPRN is not frozen.')
  if (rp007Identity.decisionState !== 'CONFLICTING_PUBLIC_DECISION_LABELS_NOT_USED') throw new Error('RP-007 decision-label conflict must remain explicit.')
  if (rp007Identity.decisionUse !== 'PROVENANCE_ONLY_NOT_CANDIDATE_READINESS') throw new Error('RP-007 planning outcome leaked into readiness.')
  const rp008Identity = record(rp008.currentPlanningIdentity, 'RP-008 currentPlanningIdentity')
  if (rp008Identity.decisionUse !== 'PROVENANCE_ONLY_NOT_CANDIDATE_READINESS') throw new Error('RP-008 planning outcome leaked into readiness.')

  const rp007Disposition = record(rp007.dispositions, 'RP-007 dispositions')
  const rp008Disposition = record(rp008.dispositions, 'RP-008 dispositions')
  if (rp007Disposition.DOCUMENT_TRANSPORT_PATH !== 'STRONG_29_LINKED_DOCUMENTS') throw new Error('RP-007 document transport finding drifted.')
  if (rp007Disposition.DATUM_TOPOGRAPHY_PATH !== 'MATERIAL_PUBLIC_PATH_WITH_STEEP_STRESS') throw new Error('RP-007 topography finding drifted.')
  if (rp008Disposition.ONE_HOUSE_EXPERIMENT_COHERENCE !== 'STRONG') throw new Error('RP-008 one-house coherence must remain explicit.')
  if (rp008Disposition.CONTROLLED_GEOMETRY_RECOVERY_PATH !== 'POSSIBLE_NOT_YET_DEMONSTRATED') throw new Error('RP-008 geometry route must remain unproved.')

  const selection = record(raw.selection, 'selection')
  if (selection.siteId !== 'DPL-RP-007' || selection.result !== DPL15G_RESULT) throw new Error('DPL-15G selection mismatch.')
  if (!string(selection.reason, 'selection.reason').includes('29-document')) throw new Error('Selection must be evidence-transport based.')

  const boundary = record(raw.proofBoundary, 'proofBoundary')
  if (boundary.scalarRanking !== 'PROHIBITED') throw new Error('Scalar ranking must remain prohibited.')
  if (boundary.marketingGeometryAsAuthority !== 'PROHIBITED') throw new Error('Marketing geometry must remain non-authoritative.')
  if (boundary.applicantProposalTransfer !== 'PROHIBITED') throw new Error('Applicant proposal transfer must remain prohibited.')
  if (boundary.referenceHouseCandidate !== 'NOT_AUTHORISED_IN_15G') throw new Error('DPL-15G cannot author a Reference House candidate.')
  if (boundary.referenceHouseMutation !== 'PROHIBITED') throw new Error('Reference House mutation must remain prohibited.')
  if (boundary.compatibleAtScreening !== 'NOT_ADMITTED' || boundary.incompatible !== 'NOT_ADMITTED') throw new Error('Whole-site conclusion authority leaked into DPL-15G.')
  if (boundary.dpl16 !== 'HELD' || boundary.externalSpend !== 'NONE') throw new Error('DPL-16/spend boundary drifted.')

  return raw
}

export const composeDPL15G = (value: unknown = JSON.parse(text(DPL15G_PATH)) as unknown): DPL15GResult => {
  const validated = validateDPL15G(value)
  const rawSites = validated.sites as Record<string, unknown>[]
  const sites: Record<string, unknown>[] = rawSites.map((site): Record<string, unknown> => {
    const rawEvidence = site.publicEvidence as Record<string, unknown>[]
    const publicEvidence: Record<string, unknown>[] = rawEvidence.map((evidence): Record<string, unknown> => ({
      ...evidence,
      observed: [...(evidence.observed as string[])].sort()
    }))
    publicEvidence.sort((a, b) => compareDplIdentityStrings(String(a.id), String(b.id)))
    return {
      ...site,
      publicEvidence,
      dispositions: Object.fromEntries(Object.entries(site.dispositions as Record<string, unknown>).sort(([a], [b]) => compareDplIdentityStrings(a, b)))
    }
  })
  sites.sort((a, b) => compareDplIdentityStrings(String(a.siteId), String(b.siteId)))

  const canonical = {
    ...validated,
    comparisonUniverse: [...(validated.comparisonUniverse as string[])].sort(),
    criteria: [...(validated.criteria as string[])].sort(),
    sites
  }
  return {
    result: DPL15G_RESULT,
    selectedSiteId: 'DPL-RP-007',
    heldSiteId: 'DPL-RP-008',
    comparisonCount: 2,
    resultFingerprint: sha256DplSemanticFingerprint(canonical),
    nextPacket: string(validated.nextPacket, 'nextPacket')
  }
}
