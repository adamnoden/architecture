import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  composeDPL15G,
  DPL15G_EXPECTED_PARENT,
  DPL15G_PATH,
  DPL15G_RESULT,
  DPL15G_UNIVERSE,
  validateDPL15G
} from './dpl15gComparison.js'

const raw = (): Record<string, unknown> => JSON.parse(readFileSync(DPL15G_PATH, 'utf8')) as Record<string, unknown>
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

test('DPL-15G binds the exact landed DPL-15F result and two-site universe', () => {
  const validated = validateDPL15G(raw())
  const parent = validated.parent as Record<string, unknown>
  assert.equal(parent.resultFingerprint, DPL15G_EXPECTED_PARENT)
  assert.deepEqual([...(validated.comparisonUniverse as string[])].sort(), [...DPL15G_UNIVERSE].sort())
})

test('DPL-15G selects RP-007 categorically and holds RP-008', () => {
  const result = composeDPL15G()
  assert.equal(result.result, DPL15G_RESULT)
  assert.equal(result.selectedSiteId, 'DPL-RP-007')
  assert.equal(result.heldSiteId, 'DPL-RP-008')
  assert.equal(result.comparisonCount, 2)
})

test('DPL-15G selection is driven by demonstrated transport, not planning outcome', () => {
  const validated = validateDPL15G(raw())
  const sites = validated.sites as Record<string, unknown>[]
  const rp007 = sites.find((site) => site.siteId === 'DPL-RP-007')!
  const identity = rp007.currentPlanningIdentity as Record<string, unknown>
  const disposition = rp007.dispositions as Record<string, unknown>
  assert.equal(identity.decisionUse, 'PROVENANCE_ONLY_NOT_CANDIDATE_READINESS')
  assert.equal(disposition.DOCUMENT_TRANSPORT_PATH, 'STRONG_29_LINKED_DOCUMENTS')
  assert.equal(disposition.DATUM_TOPOGRAPHY_PATH, 'MATERIAL_PUBLIC_PATH_WITH_STEEP_STRESS')
})

test('DPL-15G preserves RP-008 one-house coherence without promoting marketing area', () => {
  const validated = validateDPL15G(raw())
  const sites = validated.sites as Record<string, unknown>[]
  const rp008 = sites.find((site) => site.siteId === 'DPL-RP-008')!
  const disposition = rp008.dispositions as Record<string, unknown>
  const evidence = rp008.publicEvidence as Record<string, unknown>[]
  assert.equal(disposition.ONE_HOUSE_EXPERIMENT_COHERENCE, 'STRONG')
  assert.equal(disposition.CONTROLLED_GEOMETRY_RECOVERY_PATH, 'POSSIBLE_NOT_YET_DEMONSTRATED')
  assert.match(String(evidence.find((entry) => entry.id === '15G-RP008-E02')?.authorityBoundary), /cannot establish fit, no-fit or controlled geometry/i)
})

test('DPL-15G rejects scalar ranking and candidate-authoring authority', () => {
  const validated = validateDPL15G(raw())
  const boundary = validated.proofBoundary as Record<string, unknown>
  assert.equal(boundary.scalarRanking, 'PROHIBITED')
  assert.equal(boundary.referenceHouseCandidate, 'NOT_AUTHORISED_IN_15G')
  assert.equal(boundary.compatibleAtScreening, 'NOT_ADMITTED')
  assert.equal(boundary.incompatible, 'NOT_ADMITTED')
  assert.equal(boundary.dpl16, 'HELD')
})

test('DPL-15G fails closed if RP-008 is promoted merely for lower pathology', () => {
  const changed = clone(raw())
  const sites = changed.sites as Record<string, unknown>[]
  sites.find((site) => site.siteId === 'DPL-RP-007')!.nextPacketSuitability = 'HOLD_AS_TOPOGRAPHY_STRESS'
  sites.find((site) => site.siteId === 'DPL-RP-008')!.nextPacketSuitability = 'SELECT'
  const selection = changed.selection as Record<string, unknown>
  selection.siteId = 'DPL-RP-008'
  selection.result = 'RP008_SELECTED_NEXT_NO_SPEND_CORPUS_EVIDENCE_TARGET'
  assert.throws(() => validateDPL15G(changed), /RP-007 must be the selected next evidence target/)
})

test('DPL-15G semantic identity is ordering-neutral but evidence-sensitive', () => {
  const baseline = composeDPL15G()
  const reordered = raw()
  reordered.comparisonUniverse = [...(reordered.comparisonUniverse as string[])].reverse()
  reordered.criteria = [...(reordered.criteria as string[])].reverse()
  reordered.sites = [...(reordered.sites as Record<string, unknown>[])].reverse().map((site) => ({
    ...site,
    publicEvidence: [...(site.publicEvidence as Record<string, unknown>[])].reverse().map((evidence) => ({
      ...evidence,
      observed: [...(evidence.observed as string[])].reverse()
    }))
  }))
  assert.equal(composeDPL15G(reordered).resultFingerprint, baseline.resultFingerprint)

  const changed = clone(raw())
  const sites = changed.sites as Record<string, unknown>[]
  const rp007 = sites.find((site) => site.siteId === 'DPL-RP-007')!
  const evidence = rp007.publicEvidence as Record<string, unknown>[]
  evidence[0].authorityBoundary = `${String(evidence[0].authorityBoundary)} Material mutation.`
  assert.notEqual(composeDPL15G(changed).resultFingerprint, baseline.resultFingerprint)
})

test('DPL-15G emits one deterministic frozen line', () => {
  const result = composeDPL15G()
  console.log(`DPL-15G-FROZEN ${JSON.stringify(result)}`)
})
