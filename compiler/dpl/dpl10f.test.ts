import { sha256DplSemanticFingerprint } from './identity-order.js'
import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { loadB2TargetComposition, loadTargetSlice } from './load.js'
import type { RawTargetSlice } from './model.js'
import { controlledPlanningTargetIds } from './planning-coverage.js'
import { assertBoroughStrategicParent, strategicPlanningTargetId } from './planning-target-identity.js'
import { composeWaveCTargets, loadWaveCBoroughTarget } from './wavec.js'

const strategicTargets = () => loadB2TargetComposition()
const drainageTarget = () =>
  loadTargetSlice(
    'project/dpl/targets/england-drainage-waste-water-v1.json',
    'ENGLAND_BUILDING_CONTROL'
  )

const cloneTarget = (target: RawTargetSlice): RawTargetSlice =>
  JSON.parse(JSON.stringify(target)) as RawTargetSlice

describe('DPL-10F planning strategic/local target identity graph', () => {
  test('derives the exact controlled London strategic target from the composition', () => {
    const id = strategicPlanningTargetId(strategicTargets())
    assert.equal(id, 'LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20')
    assert.equal(id, controlledPlanningTargetIds[0])
  })

  test('Croydon and Bromley both declare the exact strategic target actually composed with them', () => {
    const strategicId = strategicPlanningTargetId(strategicTargets())

    for (const borough of ['Croydon', 'Bromley'] as const) {
      const loaded = loadWaveCBoroughTarget(borough)
      const raw = loaded.target as unknown as Record<string, unknown>
      const composition = raw.composition as Record<string, unknown>

      assert.equal(raw.parentStrategicTargetId, strategicId)
      assert.equal(composition.strategicTargetId, strategicId)
      assert.doesNotThrow(() => assertBoroughStrategicParent(loaded.target, strategicId))
    }
  })

  test('DPL-10E controlled target identities and borough parent edges reconcile as one graph', () => {
    const strategicId = strategicPlanningTargetId(strategicTargets())
    const croydon = loadWaveCBoroughTarget('Croydon')
    const bromley = loadWaveCBoroughTarget('Bromley')

    assert.deepEqual(
      [strategicId, croydon.target.id, bromley.target.id].sort((a, b) => a.localeCompare(b)),
      [...controlledPlanningTargetIds].sort((a, b) => a.localeCompare(b))
    )
    assert.doesNotThrow(() => assertBoroughStrategicParent(croydon.target, strategicId))
    assert.doesNotThrow(() => assertBoroughStrategicParent(bromley.target, strategicId))
  })

  test('fails closed before Wave-C composition when a borough declares a stale strategic parent', () => {
    const b2Targets = strategicTargets()
    const loaded = loadWaveCBoroughTarget('Croydon')
    const target = cloneTarget(loaded.target) as unknown as Record<string, unknown>
    target.parentStrategicTargetId = 'LON-PLAN-2021-RESIDENTIAL-DESIGN-2026-10-20'

    const badLoaded = {
      ...loaded,
      target: target as unknown as RawTargetSlice,
      targetFingerprint: sha256DplSemanticFingerprint(target),
      runtimeTarget: {
        ...loaded.runtimeTarget,
        target: target as unknown as RawTargetSlice
      }
    }

    assert.throws(
      () => composeWaveCTargets(b2Targets, drainageTarget(), badLoaded),
      /declares strategic parent .* expected LON-STRATEGIC-RESIDENTIAL-DESIGN/
    )
  })

  test('fails closed when nested composition identity contradicts the declared strategic parent', () => {
    const strategicId = strategicPlanningTargetId(strategicTargets())
    const loaded = loadWaveCBoroughTarget('Bromley')
    const target = cloneTarget(loaded.target) as unknown as Record<string, unknown>
    target.composition = {
      ...(target.composition as Record<string, unknown>),
      strategicTargetId: 'STALE-STRATEGIC-TARGET'
    }

    assert.throws(
      () => assertBoroughStrategicParent(target as unknown as RawTargetSlice, strategicId),
      /composition declares strategic target STALE-STRATEGIC-TARGET/
    )
  })

  test('target parent identity is fingerprint-bearing rather than an alias', () => {
    const loaded = loadWaveCBoroughTarget('Croydon')
    const changed = cloneTarget(loaded.target) as unknown as Record<string, unknown>
    changed.parentStrategicTargetId = 'ANOTHER-STRATEGIC-TARGET'

    assert.notEqual(
      sha256DplSemanticFingerprint(loaded.target),
      sha256DplSemanticFingerprint(changed)
    )
  })

  test('identity reconciliation creates no planning or whole-site conclusion', () => {
    const loaded = loadWaveCBoroughTarget('Bromley')
    const raw = loaded.target as unknown as Record<string, unknown>

    assert.equal(Object.prototype.hasOwnProperty.call(raw, 'planningPermission'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(raw, 'compatibility'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(raw, 'deploymentConclusion'), false)
  })
})
