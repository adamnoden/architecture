import assert from 'node:assert/strict'
import test from 'node:test'
import { controlNodes } from './nodes/index.js'
import { buildDispatchSnapshot } from './dispatch.js'
import type { ControlNode } from './types.js'

function node(id: string): ControlNode {
  const value = controlNodes.find((candidate) => candidate.id === id)
  assert.ok(value, `Missing room-kit delivery node ${id}`)
  return value
}

function ancestors(id: string, seen = new Set<string>()): Set<string> {
  for (const dependency of node(id).dependencies) {
    if (seen.has(dependency)) continue
    seen.add(dependency)
    ancestors(dependency, seen)
  }
  return seen
}

test('crafted room research is shared design work with a concrete result', () => {
  const kit = node('IAS-CRAFT-ROOM-KIT')
  assert.deepEqual(kit.owners, ['IAS', 'HAD'])
  assert.equal(kit.agentDispatch?.mode, 'self-service')
  assert.deepEqual(kit.closeoutEvidence, ['project/ias/crafted-room-kit-result.md'])
  assert.ok(kit.dependencies.includes('IAS-WORKABLE-CONCEPT'))
  assert.ok(kit.dependencies.includes('CCR-ASSEMBLY-INTEGRATION'))
  assert.equal(node('PCO-CRAFT-ROOM-KIT').agentDispatch?.mode, 'manual')
  assert.notDeepEqual(kit.closeoutEvidence, node('PCO-CRAFT-ROOM-KIT').closeoutEvidence)
})

test('room-kit foundations do not wait for physical bottlenecks or owner selection', () => {
  const dependencies = ancestors('IAS-CRAFT-ROOM-KIT')
  for (const excluded of ['TRIAD-GATE', 'STR-FLOOR-PORTAL', 'HAD-INLET-RESOLUTION', 'HAD-OWNER-DESIGN-REVIEW', 'PLT-OWNER-FINAL-DESIGN-ACCEPTANCE', 'ADE-BROWSER-EDITOR', 'EPR-RH11', 'EPR-BAY-REVIEW', 'PHY-04']) {
    assert.equal(dependencies.has(excluded), false, excluded)
  }
})

test('joint house acceptance waits for the room kit and retains the existing engineering inputs', () => {
  const required = ['IAS-CRAFT-ROOM-KIT', 'IAS-WORKABLE-CONCEPT', 'STR-FLOOR-PORTAL', 'HAD-INLET-RESOLUTION', 'ROF-RWT-GATE', 'MAT-COORDINATION']
  for (const dependency of required) assert.ok(node('TRIAD-GATE').dependencies.includes(dependency), dependency)
  for (const endpoint of ['HAD-OWNER-DESIGN-REVIEW', 'IAS-WORKABLE-DETAILS', 'BCR-CONVERGENCE', 'PLT-FINAL-PREP']) {
    assert.ok(ancestors(endpoint).has('IAS-CRAFT-ROOM-KIT'), endpoint)
  }
})

test('room-kit completion does not impersonate either personal design approval', () => {
  for (const gate of ['HAD-OWNER-DESIGN-REVIEW', 'PLT-OWNER-FINAL-DESIGN-ACCEPTANCE']) {
    assert.equal(node(gate).agentDispatch?.mode, 'manual')
    assert.ok(node(gate).agentDispatch?.reason)
  }
  assert.deepEqual(node('IAS-WORKABLE-DETAILS').dependencies, ['HAD-OWNER-DESIGN-REVIEW'])
  assert.ok(node('PLT-FINAL-FREEZE').dependencies.includes('PLT-OWNER-FINAL-DESIGN-ACCEPTANCE'))
  assert.ok(node('PLT-FINAL-FREEZE').dependencies.includes('PLT-PRINT-REVIEW'))
})

test('the dispatcher exposes the room kit before TRIAD and unlocks TRIAD only afterwards', () => {
  const makeFixture = (kitComplete: boolean): ControlNode[] => controlNodes.map((value) => ({
    ...value,
    lifecycle: value.id === 'TRIAD-GATE' || (!kitComplete && value.id === 'IAS-CRAFT-ROOM-KIT') ? 'planned' : 'complete'
  }))
  const now = new Date('2026-11-15T21:00:00Z')
  const before = buildDispatchSnapshot(makeFixture(false), [], now)
  assert.ok(before.candidates.some((candidate) => candidate.node.id === 'IAS-CRAFT-ROOM-KIT'))
  assert.equal(before.candidates.some((candidate) => candidate.node.id === 'TRIAD-GATE'), false)
  const after = buildDispatchSnapshot(makeFixture(true), [], now)
  assert.ok(after.candidates.some((candidate) => candidate.node.id === 'TRIAD-GATE'))
})
