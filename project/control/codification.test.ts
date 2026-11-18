import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { controlNodes } from './nodes/index.js'
import { codificationNodes } from './nodes/codification.js'
import { derivedState } from './derive.js'
import type { ControlNode } from './types.js'

const nodes: readonly ControlNode[] = controlNodes
const byId = new Map(nodes.map(node => [node.id, node]))
function node(id: string): ControlNode {
  const value = byId.get(id)
  assert.ok(value, `Missing node ${id}`)
  return value
}
function ancestors(id: string, result = new Set<string>()): Set<string> {
  for (const dependency of node(id).dependencies) {
    if (result.has(dependency)) continue
    result.add(dependency)
    ancestors(dependency, result)
  }
  return result
}

test('codification registration has unique known nodes and introduces no cycle', () => {
  assert.equal(byId.size, nodes.length)
  const finished = new Set<string>()
  const visiting = new Set<string>()
  function visit(id: string): void {
    if (finished.has(id)) return
    assert.equal(visiting.has(id), false, `Cycle through ${id}`)
    visiting.add(id)
    for (const dependency of node(id).dependencies) visit(dependency)
    visiting.delete(id)
    finished.add(id)
  }
  for (const entry of nodes) visit(entry.id)
  assert.equal(finished.size, nodes.length)
})

test('current source and reusable model foundation do not wait for house convergence', () => {
  for (const id of ['CCR-CURRENT-SOURCE', 'CCR-CURRENT-COMPILE', 'ADE-MODEL', 'CCR-EDIT-CONTRACT']) {
    const upstream = ancestors(id)
    for (const late of ['TRIAD-GATE', 'HRS-TECHNICAL', 'HRS-SYNTHESIS', 'BCR-CONVERGENCE']) {
      assert.equal(upstream.has(late), false, `${id} must not wait for ${late}`)
    }
  }
  assert.ok(ancestors('ADE-MODEL').has('CCR-CURRENT-SOURCE'))
  const successorIds = new Set<string>(codificationNodes.filter(entry => entry.id !== 'PCO-EXECUTABLE-DESIGN').map(entry => entry.id))
  const registered: ControlNode[] = nodes.map(entry => successorIds.has(entry.id) || entry.id === 'ADE-MODEL'
    ? {...entry, lifecycle: 'planned'} : entry)
  assert.deepEqual(registered.filter(entry => successorIds.has(entry.id) && derivedState(entry, registered) === 'ready')
    .map(entry => entry.id), ['CCR-CURRENT-SOURCE'])
  const sourceComplete: ControlNode[] = registered.map(entry => entry.id === 'CCR-CURRENT-SOURCE'
    ? {...entry, lifecycle: 'complete'} : entry)
  for (const id of ['CCR-CURRENT-COMPILE', 'ADE-MODEL']) {
    assert.equal(derivedState(sourceComplete.find(entry => entry.id === id)!, sourceComplete), 'ready', id)
  }
})

test('final technical bay retains technical applicability despite the earlier model foundation', () => {
  for (const id of ['ADE-DETAILS', 'ADE-SCHEDULES', 'ADE-EVIDENCE']) {
    assert.ok(ancestors(id).has('HRS-TECHNICAL'), id)
    assert.ok(ancestors(id).has('ADE-MODEL'), id)
  }
})

test('the early gallery cutover is available before final selection and has a separate registration record', () => {
  const gallery = node('CCR-CURRENT-GALLERY')
  assert.equal(gallery.agentDispatch?.mode, 'self-service')
  assert.equal(node('PCO-CURRENT-GALLERY').lifecycle, 'complete')
  const upstream = ancestors(gallery.id)
  for (const required of ['PCO-CURRENT-GALLERY', 'CCR-CURRENT-COMPILE', 'CCR-SERVICES-INTEGRATION', 'PLT-CURRENT-REVIEW']) {
    assert.ok(upstream.has(required), required)
  }
  for (const late of ['TRIAD-GATE', 'HRS-SYNTHESIS', 'CCR-CURRENT-RELEASE', 'PLT-FINAL-PREP']) {
    assert.equal(upstream.has(late), false, late)
  }
  const fixture = nodes.map(entry => entry.id === gallery.id ? { ...entry, lifecycle: 'planned' as const } : entry)
  assert.equal(derivedState(fixture.find(entry => entry.id === gallery.id)!, fixture), 'ready')
})

test('final publication cannot bypass the migrated current model or edit/change proof', () => {
  const upstream = ancestors('PLT-FINAL-PREP')
  for (const required of ['CCR-CURRENT-SOURCE', 'CCR-CURRENT-COMPILE', 'CCR-STRUCTURE-INTEGRATION', 'CCR-SERVICES-INTEGRATION', 'CCR-ASSEMBLY-INTEGRATION', 'CCR-EDIT-CONTRACT', 'CCR-CHANGE-PROOF', 'CCR-CURRENT-GALLERY', 'CCR-CURRENT-RELEASE', 'HRS-SYNTHESIS', 'ADE-DETAILS', 'ADE-SCHEDULES', 'ADE-EVIDENCE']) {
    assert.ok(upstream.has(required), `Publication missing ${required}`)
  }
  const fixture: ControlNode[] = nodes.map(entry => ({...entry, lifecycle: ['CCR-CURRENT-RELEASE', 'PLT-FINAL-PREP'].includes(entry.id) ? 'planned' : 'complete'}))
  assert.equal(derivedState(fixture.find(entry => entry.id === 'PLT-FINAL-PREP')!, fixture), 'blocked')
})

test('browser delivery uses the change proof and sits outside architectural and publication gates', () => {
  assert.ok(ancestors('ADE-BROWSER-EDITOR').has('CCR-CHANGE-PROOF'))
  assert.equal(node('ADE-BROWSER-EDITOR').agentDispatch?.mode, 'self-service')
  for (const id of ['TRIAD-GATE', 'HRS-TECHNICAL', 'HRS-SYNTHESIS', 'ADE-MODEL', 'CCR-CURRENT-RELEASE', 'HAD-OWNER-DESIGN-REVIEW', 'PLT-OWNER-FINAL-DESIGN-ACCEPTANCE', 'PUB-02-FINAL']) {
    assert.equal(ancestors(id).has('ADE-BROWSER-EDITOR'), false, id)
  }
})

test('physical investigation and real-site assessment are not blocked by a software rewrite', () => {
  const newIds = new Set(codificationNodes.map(entry => entry.id as string))
  for (const id of ['STR-FLOOR-PORTAL', 'HAD-INLET-RESOLUTION', 'DPL-SITE-ASSESSMENT']) {
    assert.deepEqual([...ancestors(id)].filter(upstream => newIds.has(upstream)), [], id)
  }
})

test('owner approvals stay manual and no blanket external book review is introduced', () => {
  for (const id of ['HAD-OWNER-DESIGN-REVIEW', 'PLT-OWNER-FINAL-DESIGN-ACCEPTANCE', 'PLT-PRINT-REVIEW', 'PUB-02-FINAL']) {
    assert.equal(node(id).agentDispatch?.mode, 'manual', id)
  }
  const release = ancestors('CCR-CURRENT-RELEASE')
  for (const id of ['EPR-RH11', 'EPR-BAY-REVIEW', 'DPL-COMMISSION', 'PHY-04']) {
    assert.equal(release.has(id), false, id)
  }
  for (const entry of codificationNodes.filter(entry => entry.id !== 'PCO-EXECUTABLE-DESIGN')) {
    assert.equal(entry.agentDispatch.mode, 'self-service', entry.id)
  }
})

test('the instruction and implementation contract are discoverable and do not claim migration complete', () => {
  const agents = readFileSync(new URL('../../AGENTS.md', import.meta.url), 'utf8')
  const programme = readFileSync(new URL('../ccr/current-house-integration-programme.md', import.meta.url), 'utf8')
  assert.ok(agents.includes('executable-design-contract.md'))
  for (const entry of codificationNodes.filter(entry => entry.id !== 'PCO-EXECUTABLE-DESIGN')) {
    assert.ok(programme.includes(entry.id), `Missing implementation contract ${entry.id}`)
    assert.ok(entry.closeoutEvidence.length > 0)
  }
})
