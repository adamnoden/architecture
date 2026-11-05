import assert from 'node:assert/strict'
import test from 'node:test'
import { buildDispatchSnapshot } from './dispatch.js'
import { derivedState, directBlockers } from './derive.js'
import { controlNodes } from './nodes/index.js'
import type { ControlNode } from './types.js'
import { validateGraphStructure } from './validate.js'

test('the selected single-mouth architecture cannot redispatch RWT detailing before its source replan', () => {
  // Exercise the real graph with all prior evidence complete and only the
  // rejected architectural input withheld. Later programme progress must not
  // turn this regression into an assertion about a historical live frontier.
  const downstream = new Set(['RWT-06', 'RWT-07', 'ROF-RWT-GATE', 'STR-HOUSE'])
  const nodes: ControlNode[] = controlNodes.map(node => ({
    ...node,
    lifecycle: node.id === 'HAD-WATER-REPLAN' || downstream.has(node.id)
      ? 'planned' : 'complete'
  }))
  const get = (id: string) => nodes.find(node => node.id === id)!
  const snapshot = () => buildDispatchSnapshot(nodes, [], new Date('2026-11-05T12:00:00Z'))
  assert.equal(get('HAD-03').lifecycle, 'complete')
  assert.equal(derivedState(get('HAD-WATER-REPLAN'), nodes), 'ready')
  assert.deepEqual(directBlockers(get('RWT-06'), nodes), ['HAD-WATER-REPLAN'])
  assert.deepEqual(directBlockers(get('STR-HOUSE'), nodes), ['HAD-WATER-REPLAN'])
  assert.equal(snapshot().safeForAutomaticClaim, true)
  assert(snapshot().candidates.some(candidate => candidate.node.id === 'HAD-WATER-REPLAN'))
  assert(!snapshot().candidates.some(candidate => candidate.node.id === 'RWT-06'))
  assert(!snapshot().candidates.some(candidate => candidate.node.id === 'STR-HOUSE'))

  nodes[nodes.findIndex(node => node.id === 'HAD-WATER-REPLAN')] = {
    ...get('HAD-WATER-REPLAN'), lifecycle: 'complete'
  }
  assert.equal(derivedState(get('RWT-06'), nodes), 'ready')
  assert.equal(derivedState(get('STR-HOUSE'), nodes), 'ready')
  assert(snapshot().candidates.some(candidate => candidate.node.id === 'RWT-06'))
  assert(snapshot().candidates.some(candidate => candidate.node.id === 'STR-HOUSE'))
  assert.equal(derivedState(get('RWT-07'), nodes), 'blocked')
  assert.equal(derivedState(get('ROF-RWT-GATE'), nodes), 'blocked')
})

test('court architecture can be developed before downstream structural and hydraulic acceptance', () => {
  assert.deepEqual(validateGraphStructure(controlNodes), [])
  const byId = new Map<string, ControlNode>(controlNodes.map(node => [node.id, node]))
  const ancestors = (id: string, found = new Set<string>()): Set<string> => {
    for (const dependency of byId.get(id)!.dependencies) {
      if (!found.has(dependency)) {
        found.add(dependency)
        ancestors(dependency, found)
      }
    }
    return found
  }
  const upstream = ancestors('HAD-WATER-REPLAN')
  for (const later of ['STR-HOUSE', 'STR-RECONCILE', 'RWT-06', 'RWT-07', 'ROF-RWT-GATE', 'TRIAD-GATE']) {
    assert(!upstream.has(later), `Architectural replan must not wait for ${later}`)
  }
})
