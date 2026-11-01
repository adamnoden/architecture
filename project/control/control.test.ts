import assert from 'node:assert/strict'
import test from 'node:test'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  directBlockers,
  nodesByDerivedState,
  readyFrontier,
  structuralCriticalPath,
  unlocksOnCompletion,
  weightedCriticalPath
} from './derive.js'
import { controlNodes } from './nodes/index.js'
import type { ControlNode } from './types.js'
import { validateControlPlane, validateGraphStructure } from './validate.js'
import {
  maturityAssessments,
  maturityFreshnessFromChangedPaths
} from '../maturity-freshness.js'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

function node(id: string): ControlNode {
  const result = controlNodes.find((candidate) => candidate.id === id)
  if (!result) throw new Error(`Missing test node: ${id}`)
  return result
}

test('current PCO registry and graph are internally valid', () => {
  assert.deepEqual(validateControlPlane(repoRoot), [])
})

test('triad fan-out advances only after constitutions and the shared interface gate', () => {
  const candidateIds = [
    'IAS-01V', 'IAS-01H', 'OAS-01E', 'OAS-01I',
    'HAD-01E', 'HAD-01P', 'HAD-01S'
  ]
  const ids = new Set([
    'BSR-ROOT', 'IAS-00', 'OAS-00', 'HAD-00',
    'TRIAD-IFACE-FREEZE', ...candidateIds
  ])
  // Exercise the real dependency topology at controlled lifecycle checkpoints.
  // Live programme progress must not invalidate a historical scheduling test.
  const fixture: ControlNode[] = controlNodes
    .filter((candidate) => ids.has(candidate.id))
    .map((candidate) => ({
      ...candidate,
      lifecycle: ['BSR-ROOT', 'IAS-00', 'OAS-00'].includes(candidate.id)
        ? 'complete' : 'planned'
    }))
  const readyIds = () => readyFrontier(fixture).map((candidate) => candidate.id).sort()
  assert.deepEqual(readyIds(), ['HAD-00'])
  assert.deepEqual(
    directBlockers(fixture.find((candidate) => candidate.id === 'TRIAD-IFACE-FREEZE')!, fixture),
    ['HAD-00']
  )
  const complete = (id: string) => {
    const index = fixture.findIndex((candidate) => candidate.id === id)
    fixture[index] = { ...fixture[index], lifecycle: 'complete' }
  }
  complete('HAD-00')
  assert.deepEqual(readyIds(), ['TRIAD-IFACE-FREEZE'])
  assert.deepEqual(
    unlocksOnCompletion('TRIAD-IFACE-FREEZE', fixture).map((candidate) => candidate.id).sort(),
    [...candidateIds].sort()
  )
  complete('TRIAD-IFACE-FREEZE')
  assert.deepEqual(readyIds(), [...candidateIds].sort())
  assert.equal(node('BCR-CONVERGENCE').dependencies.some((id) => /PHY|EPR|DEL/.test(id)), false)
})

test('MRA starts in parallel but gates construction convergence and final synthesis at the correct boundaries', () => {
  assert.deepEqual(node('MRA-00').dependencies, ['BSR-ROOT'])

  for (const id of ['MRA-01', 'MRA-02', 'MRA-03']) {
    assert.deepEqual(node(id).dependencies, ['MRA-00', 'TRIAD-GATE'])
  }

  assert.deepEqual(node('MRA-04').dependencies, ['MRA-01', 'MRA-02', 'MRA-03'])
  assert.equal(node('BCR-CONVERGENCE').dependencies.includes('MRA-04'), true)
  assert.deepEqual(node('MRA-05').dependencies, ['BCR-CONVERGENCE'])
  assert.equal(node('HRS-SYNTHESIS').dependencies.includes('MRA-05'), true)
})

test('held evidence research never leaks into the ready frontier', () => {
  const groups = nodesByDerivedState(controlNodes)
  assert.deepEqual(
    groups.held.map((candidate) => candidate.id).sort(),
    ['PHY-01', 'PHY-02']
  )
  assert.equal(groups.ready.some((candidate) => candidate.id === 'PHY-01'), false)
  assert.equal(groups.ready.some((candidate) => candidate.id === 'PHY-02'), false)
})

test('PHY-03 engineering does not silently authorize a physical specimen node', () => {
  assert.equal(node('PHY-03-ENGINEERING').aliases?.includes('PHY-03'), true)
  assert.equal(controlNodes.some((candidate) => String(candidate.id) === 'PHY-03B'), false)
})

test('shared interface work is canonical once with per-stream packet aliases', () => {
  assert.deepEqual(node('IAS-OAS-JUNCTION').aliases, ['IAS-02O', 'OAS-02I'])
  assert.deepEqual(node('IAS-HAD-JUNCTION').aliases, ['IAS-02H', 'HAD-02I'])
  assert.deepEqual(node('OAS-HAD-JUNCTION').aliases, ['OAS-02H', 'HAD-02O'])
})

test('completion unlock calculation is derived rather than persisted', () => {
  assert.deepEqual(
    unlocksOnCompletion('IAS-00', controlNodes).map((candidate) => candidate.id),
    []
  )

  const tiny: ControlNode[] = [
    {
      id: 'AAA-00',
      owners: ['PCO'],
      title: 'upstream',
      dependencies: [],
      lifecycle: 'planned',
      closeoutEvidence: []
    },
    {
      id: 'BBB-00',
      owners: ['PCO'],
      title: 'downstream',
      dependencies: ['AAA-00'],
      lifecycle: 'planned',
      closeoutEvidence: []
    }
  ]
  assert.deepEqual(unlocksOnCompletion('AAA-00', tiny).map((candidate) => candidate.id), ['BBB-00'])
})

test('structural critical path is available without pretending missing effort estimates are time estimates', () => {
  const path = structuralCriticalPath(controlNodes)
  assert.equal(path.length > 0, true)
  assert.equal(path.at(-1), 'PUB-02-FINAL')
  assert.equal(weightedCriticalPath(controlNodes), null)
})

test('maturity evidence drift becomes stale without changing the assessed M-level', () => {
  const referenceHouse = maturityAssessments.find((assessment) => assessment.id === 'reference-house')
  assert.ok(referenceHouse)
  assert.equal(referenceHouse.maturity, 'M3')

  const freshness = maturityFreshnessFromChangedPaths(
    new Set(['docs/reference-house/whole-house-coordination-audit.md'])
  )
  const status = freshness.get('reference-house')
  assert.equal(status?.state, 'stale')
  assert.equal(referenceHouse.maturity, 'M3')

  const unrelated = freshness.get('pattern-language')
  assert.equal(unrelated?.state, 'fresh')
})

test('validation rejects dangling dependencies, cycles and started work with unmet hard prerequisites', () => {
  const invalid = [
    {
      id: 'AAA-00',
      owners: ['PCO'],
      title: 'A',
      dependencies: ['BBB-00'],
      lifecycle: 'started',
      closeoutEvidence: []
    },
    {
      id: 'BBB-00',
      owners: ['PCO'],
      title: 'B',
      dependencies: ['AAA-00', 'MISSING-00'],
      lifecycle: 'planned',
      closeoutEvidence: []
    }
  ] as const satisfies readonly ControlNode[]

  const failures = validateGraphStructure(invalid)
  assert.equal(failures.some((failure) => failure.includes('missing dependency: MISSING-00')), true)
  assert.equal(failures.some((failure) => failure.includes('dependency cycle:')), true)
  assert.equal(failures.some((failure) => failure.includes('started with incomplete dependency BBB-00')), true)
})

test('validation rejects unknown workstream ownership and duplicate shared aliases', () => {
  const invalid = [
    {
      id: 'AAA-00',
      owners: ['PCO'],
      title: 'A',
      dependencies: [],
      lifecycle: 'planned',
      aliases: ['SHARED-X'],
      closeoutEvidence: []
    },
    {
      id: 'BBB-00',
      owners: ['PCO'],
      title: 'B',
      dependencies: [],
      lifecycle: 'planned',
      aliases: ['SHARED-X'],
      closeoutEvidence: []
    }
  ] as const satisfies readonly ControlNode[]

  const failures = validateGraphStructure(invalid)
  assert.equal(failures.some((failure) => failure.includes('SHARED-X is claimed by both')), true)

  const unknownOwner = [
    {
      id: 'CCC-00',
      owners: ['ZZZ'],
      title: 'C',
      dependencies: [],
      lifecycle: 'planned',
      closeoutEvidence: []
    }
  ] as unknown as readonly ControlNode[]
  assert.equal(
    validateGraphStructure(unknownOwner).some((failure) => failure.includes('unknown workstream: ZZZ')),
    true
  )
})
