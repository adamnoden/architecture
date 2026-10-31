import assert from 'node:assert/strict'
import test from 'node:test'
import { derivedState, directBlockers } from './derive.js'
import { controlNodes } from './nodes/index.js'
import type { ControlNode } from './types.js'

function scenario() {
  // Use the real dependency graph at controlled lifecycle checkpoints. Later
  // programme progress must not change what these admission tests prove.
  const nodes: ControlNode[] = controlNodes.map(node => ({ ...node, lifecycle: 'planned' }))
  const get = (id: string): ControlNode => {
    const result = nodes.find(node => node.id === id)
    assert.ok(result, `Missing canonical node ${id}`)
    return result
  }
  const completeBranch = (id: string, withheld: ReadonlySet<string> = new Set(), visiting = new Set<string>()): void => {
    if (withheld.has(id) || get(id).lifecycle === 'complete') return
    assert.ok(!visiting.has(id), `Dependency cycle through ${id}`)
    visiting.add(id)
    for (const dependency of get(id).dependencies) completeBranch(dependency, withheld, visiting)
    visiting.delete(id)
    if (get(id).dependencies.every(dependency => get(dependency).lifecycle === 'complete')) {
      const index = nodes.findIndex(node => node.id === id)
      nodes[index] = { ...get(id), lifecycle: 'complete' }
    }
  }
  return { nodes, get, completeBranch }
}

test('STR admits both options studies independently and requires both plus existing preflight for house design', () => {
  for (const [first, second] of [
    ['STR-MASONRY', 'STR-SPANS'],
    ['STR-SPANS', 'STR-MASONRY']
  ] as const) {
    const { nodes, get, completeBranch } = scenario()
    completeBranch('HRS-BASELINE')
    assert.equal(derivedState(get(first), nodes), 'blocked')
    assert.equal(derivedState(get(second), nodes), 'blocked')

    completeBranch('STR-00')
    assert.equal(derivedState(get(first), nodes), 'ready')
    assert.equal(derivedState(get(second), nodes), 'ready')
    assert.equal(get('ROF-RWT-GATE').lifecycle, 'planned')
    assert.equal(get('MAT-COORDINATION').lifecycle, 'planned')

    completeBranch(first)
    assert.equal(derivedState(get(second), nodes), 'ready')
    assert.ok(directBlockers(get('STR-HOUSE'), nodes).includes(second))

    completeBranch(second)
    assert.deepEqual(directBlockers(get('STR-HOUSE'), nodes), ['BCR-PREFLIGHT'])
    completeBranch('BCR-PREFLIGHT')
    assert.equal(derivedState(get('STR-HOUSE'), nodes), 'ready')

    completeBranch('STR-HOUSE')
    assert.deepEqual(directBlockers(get('STR-RECONCILE'), nodes), ['STR-GROUND'])
    assert.equal(derivedState(get('STR-RECONCILE'), nodes), 'blocked')
    // The ground system is a separate research duty, not a hidden assumption
    // satisfied by completing the masonry and primary-span house design.
    completeBranch('STR-GROUND')
    assert.equal(derivedState(get('STR-RECONCILE'), nodes), 'ready')
    assert.equal(get('ROF-RWT-GATE').lifecycle, 'planned')
    assert.equal(get('MAT-COORDINATION').lifecycle, 'planned')
    assert.equal(get('TRIAD-GATE').lifecycle, 'planned')
  }
})

test('roof and selected-house admission each wait for structural reconciliation', () => {
  for (const gateId of ['ROF-RWT-GATE', 'TRIAD-GATE']) {
    const { nodes, get, completeBranch } = scenario()
    const withheld = new Set(['STR-RECONCILE'])
    for (const dependency of get(gateId).dependencies) completeBranch(dependency, withheld)

    assert.ok(directBlockers(get(gateId), nodes).includes('STR-RECONCILE'), `${gateId} must directly consume the structural reconciliation`)
    assert.equal(derivedState(get(gateId), nodes), 'blocked')

    // Resolve STR, then any downstream roof/material prerequisite which was
    // correctly held by it. No completed node is left with an unmet dependency.
    completeBranch('STR-RECONCILE')
    for (const dependency of get(gateId).dependencies) completeBranch(dependency)
    assert.deepEqual(directBlockers(get(gateId), nodes), [])
    assert.equal(derivedState(get(gateId), nodes), 'ready')
  }
})


test('Boundary Service Lodge study is claimable without blocking the inhabited-house selection', () => {
  const { nodes, get, completeBranch } = scenario()
  completeBranch('HAD-01E')
  assert.deepEqual(directBlockers(get('HAD-BOUNDARY'), nodes), ['DPL-SITE-BRIEF'])
  completeBranch('DPL-SITE-BRIEF')
  assert.equal(derivedState(get('HAD-BOUNDARY'), nodes), 'ready')
  // The outward site-service study is a separate future-site handoff, not
  // an invented precondition for the already-running interior selection.
  assert.ok(!get('HAD-03').dependencies.includes('HAD-BOUNDARY'))
})
