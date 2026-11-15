import assert from 'node:assert/strict'
import test from 'node:test'
import { controlNodes } from './nodes/index.js'
import type { ControlNode } from './types.js'

const nodes = new Map<string, ControlNode>(controlNodes.map(node => [node.id, node]))

function ancestors(id: string, visiting = new Set<string>()): Set<string> {
  assert.ok(!visiting.has(id), `Dependency cycle at ${id}`)
  const node = nodes.get(id)
  assert.ok(node, `Missing canonical node ${id}`)
  const path = new Set([...visiting, id])
  const result = new Set<string>()
  for (const dependency of node.dependencies) {
    result.add(dependency)
    for (const parent of ancestors(dependency, path)) result.add(parent)
  }
  return result
}

function requires(id: string, dependencies: readonly string[]): void {
  const actual = ancestors(id)
  for (const dependency of dependencies) assert.ok(actual.has(dependency), `${id} must consume ${dependency}`)
}

test('editable-input and current-compile foundations do not wait for final architectural selection', () => {
  for (const id of ['ADE-DESIGN-INPUT', 'ADE-CURRENT-COMPILE']) {
    const dependencies = ancestors(id)
    for (const delayed of ['TRIAD-GATE', 'HRS-TECHNICAL', 'HRS-SYNTHESIS', 'ADE-MODEL', 'HAD-OWNER-DESIGN-REVIEW']) {
      assert.equal(dependencies.has(delayed), false, `${id} unexpectedly waits for ${delayed}`)
    }
    assert.equal(nodes.get(id)?.agentDispatch?.mode, 'self-service')
  }
})

test('edit regression consumes actual migration and dependency behaviour', () => {
  requires('ADE-EDIT-REGRESSION', ['ADE-DESIGN-INPUT', 'ADE-CURRENT-COMPILE', 'ADE-PARAMETRIC-SYSTEMS', 'ADE-CHANGE-PROPAGATION'])
  requires('ADE-MODEL', ['HRS-TECHNICAL', 'ADE-EDIT-REGRESSION'])
  requires('ADE-EVIDENCE', ['ADE-CHANGE-PROPAGATION'])
})

test('final current-house publication cannot bypass executable change proof', () => {
  for (const id of ['PLT-FINAL-PREP', 'PLT-FINAL-FREEZE', 'PUB-02-FINAL']) {
    requires(id, ['ADE-EDIT-REGRESSION'])
  }
})

test('the browser client is executable work but not an extra book or architectural approval blocker', () => {
  requires('ADE-BROWSER-EDITOR', ['ADE-EDIT-REGRESSION'])
  assert.equal(nodes.get('ADE-BROWSER-EDITOR')?.agentDispatch?.mode, 'self-service')
  for (const id of ['TRIAD-GATE', 'HRS-TECHNICAL', 'HRS-SYNTHESIS', 'ADE-MODEL', 'PLT-FINAL-FREEZE', 'PUB-02-FINAL']) {
    assert.equal(ancestors(id).has('ADE-BROWSER-EDITOR'), false, `${id} must not wait for the UI`)
  }
})

test('real owner design decisions stay manual and in the release path', () => {
  for (const id of ['HAD-OWNER-DESIGN-REVIEW', 'PLT-OWNER-FINAL-DESIGN-ACCEPTANCE']) {
    assert.equal(nodes.get(id)?.agentDispatch?.mode, 'manual')
    requires('PUB-02-FINAL', [id])
  }
})
