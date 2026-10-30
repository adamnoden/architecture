import assert from 'node:assert/strict'
import test from 'node:test'
import { controlNodes } from './nodes/index.js'

function dependencies(id: string): readonly string[] {
  const node = controlNodes.find(candidate => candidate.id === id)
  assert.ok(node, `Missing canonical node ${id}`)
  return node.dependencies
}

function requires(id: string, prerequisites: readonly string[]): void {
  for (const prerequisite of prerequisites) {
    assert.ok(dependencies(id).includes(prerequisite), `${id} must consume ${prerequisite}`)
  }
}

test('selected-house integration cannot bypass the owner material-policy review', () => {
  requires('TRIAD-GATE', ['MAT-COORDINATION'])
  requires('MAT-COORDINATION', [
    'MAT-ENVELOPE', 'MAT-SERVICES', 'MAT-INTERIORS',
    'IAS-03', 'HAD-03', 'OAS-DETAIL', 'ROF-RWT-GATE'
  ])
  assert.ok(!dependencies('MAT-COORDINATION').includes('TRIAD-GATE'))
})

test('material alternatives consume the constituent audit rather than inventing a clean baseline', () => {
  requires('MAT-AUDIT', ['MAT-00'])
  for (const id of ['MAT-ENVELOPE', 'MAT-SERVICES', 'MAT-INTERIORS']) {
    requires(id, ['MAT-AUDIT'])
  }
})

test('rainwater synthesis consumes free-shed, metal and independent-failure evidence', () => {
  requires('RWT-SHED', ['MAT-00', 'RWT-01', 'ROF-02'])
  requires('RWT-METALS', ['MAT-00', 'RWT-04'])
  requires('RWT-ROBUSTNESS', ['RWT-SHED', 'RWT-METALS', 'RWT-05'])
  requires('RWT-07', ['RWT-SHED', 'RWT-METALS', 'RWT-ROBUSTNESS', 'RWT-06'])
})
