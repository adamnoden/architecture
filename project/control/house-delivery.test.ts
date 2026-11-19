import assert from 'node:assert/strict'
import test from 'node:test'
import { controlNodes } from './nodes/index.js'
import { buildDispatchSnapshot } from './dispatch.js'
import type { ControlNode } from './types.js'

function ancestors(id: string, seen = new Set<string>()): Set<string> {
  const node = controlNodes.find((candidate) => candidate.id === id)
  assert.ok(node, `Missing delivery node ${id}`)
  for (const dependency of node.dependencies) {
    if (seen.has(dependency)) continue
    seen.add(dependency)
    ancestors(dependency, seen)
  }
  return seen
}

test('actual-house delivery is independent of editorial and publication completion', () => {
  for (const endpoint of ['DEL-BAY-PACK', 'DPL-SITE-ASSESSMENT', 'DEL-COMMISSION-PLAN']) {
    assert.deepEqual([...ancestors(endpoint)].filter((id) => /^(EDA|PLT|PUB)-/.test(id)), [])
  }
  assert.ok(ancestors('DEL-BAY-PACK').has('CCR-IDENTITY'))
  assert.equal(ancestors('DEL-COMMISSION-PLAN').has('EPR-BAY-REVIEW'), false)
  assert.ok(ancestors('DEL-COMMISSION-PLAN').has('DEL-BAY-PACK'))
  assert.ok(ancestors('DEL-COMMISSION-PLAN').has('DPL-COMMISSION'))
})

test('commission planning proceeds with a site and reviewable package while practitioner evidence remains outstanding', () => {
  const pending = ['DEL-COMMISSION-PLAN', 'EPR-BAY-REVIEW']
  const fixture: ControlNode[] = controlNodes.map((node) => ({
    ...node, lifecycle: pending.includes(node.id) ? 'planned' : 'complete'
  }))
  const snapshot = buildDispatchSnapshot(fixture, [], new Date('2026-10-31T12:00:00Z'))
  assert.deepEqual(snapshot.candidates.map((candidate) => candidate.node.id), ['DEL-COMMISSION-PLAN'])
  assert.ok(snapshot.manualReady.some((item) => item.node.id === 'EPR-BAY-REVIEW'))
})

test('internal review and floor-edge development proceed without completing external or physical evidence', () => {
  const pending = ['PHY-03-ENGINEERING', 'EPR-DESK-REVIEW', 'EPR-RH11', 'PHY-04']
  const fixture: ControlNode[] = controlNodes.map((node) => ({
    ...node, lifecycle: pending.includes(node.id) ? 'planned' : 'complete'
  }))
  const snapshot = buildDispatchSnapshot(fixture, [], new Date('2026-10-31T12:00:00Z'))
  assert.deepEqual(snapshot.candidates.map((candidate) => candidate.node.id).sort(), ['EPR-DESK-REVIEW', 'PHY-03-ENGINEERING'])
  assert.deepEqual(snapshot.manualReady.map((item) => item.node.id).sort(), ['EPR-RH11', 'PHY-04'])
})

test('real-site assessment does not wait for software completion', () => {
  assert.deepEqual([...ancestors('DPL-SITE-ASSESSMENT')].filter((id) => /^(ADE|CCR)-/.test(id) || id === 'HRS-TECHNICAL'), [])
})

test('owner plot selection and practitioner evidence remain manual even with all prerequisites complete', () => {
  const gates = ['DPL-COMMISSION', 'EPR-BAY-REVIEW']
  const fixture: ControlNode[] = controlNodes.map((node) => ({
    ...node, lifecycle: gates.includes(node.id) ? 'planned' : 'complete'
  }))
  const snapshot = buildDispatchSnapshot(fixture, [], new Date('2026-10-29T12:00:00Z'))
  assert.deepEqual(snapshot.candidates.map((candidate) => candidate.node.id), [])
  for (const id of gates) {
    const node = fixture.find((candidate) => candidate.id === id)!
    assert.equal(node.agentDispatch?.mode, 'manual')
    assert.ok(node.agentDispatch?.reason)
  }
})
