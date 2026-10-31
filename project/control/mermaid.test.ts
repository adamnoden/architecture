import assert from 'node:assert/strict'
import test from 'node:test'
import { createClaimRecord } from './claims.js'
import { renderControlMermaid } from './mermaid.js'
import type { ControlNode } from './types.js'

const fixture: readonly ControlNode[] = [
  {
    id: 'PCO-A',
    owners: ['PCO'],
    title: 'Completed prerequisite',
    dependencies: [],
    lifecycle: 'complete',
    closeoutEvidence: ['project/control/README.md']
  },
  {
    id: 'PCO-B',
    owners: ['PCO'],
    title: 'Ready packet',
    dependencies: ['PCO-A'],
    lifecycle: 'planned',
    closeoutEvidence: []
  },
  {
    id: 'IAS-C',
    owners: ['IAS'],
    title: 'Held prerequisite',
    dependencies: [],
    lifecycle: 'held',
    closeoutEvidence: []
  },
  {
    id: 'SHARED-D',
    owners: ['PCO', 'IAS'],
    title: 'Shared blocked gate',
    dependencies: ['PCO-B', 'IAS-C'],
    lifecycle: 'planned',
    closeoutEvidence: []
  }
]

test('current Mermaid view omits completed history but preserves remaining dependency edges', () => {
  const graph = renderControlMermaid(fixture)
  assert.match(graph, /^flowchart LR/m)
  assert.doesNotMatch(graph, /n_PCO_A\[/)
  assert.match(graph, /n_PCO_B\["PCO-B<br\/>Ready packet<br\/><b>READY<\/b>"\]/)
  assert.match(graph, /n_IAS_C --> n_SHARED_D/)
  assert.match(graph, /Shared integration gates/)
  assert.match(graph, /class n_PCO_B ready;/)
})

test('complete Mermaid view includes durable history', () => {
  const graph = renderControlMermaid(fixture, { includeDone: true })
  assert.match(graph, /n_PCO_A\["PCO-A<br\/>Completed prerequisite<br\/><b>DONE<\/b>"\]/)
  assert.match(graph, /n_PCO_A --> n_PCO_B/)
  assert.match(graph, /class n_PCO_A done;/)
})

test('live Mermaid overlay distinguishes available, claimed and invalid occupancy', () => {
  const now = new Date('2026-10-29T08:00:00Z')
  const claim = createClaimRecord({
    node: 'PCO-B',
    generation: 1,
    leaseId: 'lease-1',
    holder: { kind: 'chatgpt', label: 'agent-one' },
    now,
    ttlMinutes: 120,
    branch: 'work/example'
  })
  const invalid = createClaimRecord({
    node: 'IAS-C',
    generation: 1,
    leaseId: 'lease-2',
    holder: { kind: 'codex', label: 'agent-two' },
    now,
    ttlMinutes: 120
  })
  const claims = new Map([
    ['PCO-B', claim],
    ['IAS-C', invalid]
  ])

  const graph = renderControlMermaid(fixture, { claims, observedAt: now })
  assert.match(graph, /CLAIMED · agent-one/)
  assert.match(graph, /until 10:00Z/)
  assert.match(graph, /class n_PCO_B claimed;/)
  assert.match(graph, /INVALID LIVE CLAIM · HELD/)
  assert.match(graph, /class n_IAS_C invalidClaim;/)
})

test('Mermaid node ids are deterministic and safe for punctuated canonical ids', () => {
  const graph = renderControlMermaid([
    {
      id: 'IAS-OAS.JUNCTION',
      owners: ['IAS', 'OAS'],
      title: 'Synthetic punctuation fixture',
      dependencies: [],
      lifecycle: 'planned',
      closeoutEvidence: []
    }
  ] as unknown as readonly ControlNode[])

  assert.match(graph, /n_IAS_OAS_JUNCTION/)
})
