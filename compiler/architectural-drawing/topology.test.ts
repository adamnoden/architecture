import assert from 'node:assert/strict'
import test from 'node:test'

import { mm } from '../units.js'
import type {
  AdeArchitecturalPlan,
  AdePlanNode,
  AdeProvenance,
  AdeWallAssembly,
  AdeWallReference,
  AdeWallRun
} from './model.js'
import { compileWallTopology } from './topology.js'

const controlledExact: AdeProvenance = {
  sourceIds: ['ADE-02-FIXTURE'],
  authority: 'controlled',
  precision: 'exact'
}

const node = (id: string, x: number, y: number): AdePlanNode => ({
  kind: 'node', id, point: { x: mm(x), y: mm(y) }, provenance: controlledExact
})

const assembly = (id = 'WA-400', thickness = 400): AdeWallAssembly => ({
  kind: 'wall-assembly', id, thickness: { kind: 'exact', value: mm(thickness) }, provenance: controlledExact
})

const wall = (
  id: string,
  fromNodeId: string,
  toNodeId: string,
  assemblyId = 'WA-400',
  reference: AdeWallReference = 'centreline'
): AdeWallRun => ({
  kind: 'wall', id, fromNodeId, toNodeId, reference, assemblyId, provenance: controlledExact
})

const plan = (options: {
  id: string
  nodes: AdePlanNode[]
  walls: AdeWallRun[]
  assemblies?: AdeWallAssembly[]
}): AdeArchitecturalPlan => ({
  id: options.id,
  sourceId: 'ADE-02-SYNTHETIC',
  nodes: options.nodes,
  wallAssemblies: options.assemblies ?? [assembly()],
  walls: options.walls,
  openings: [],
  partitionDatums: [],
  spaces: [],
  adjacencies: [],
  dimensions: [],
  labels: []
})

const compile = (fixture: AdeArchitecturalPlan) => compileWallTopology(fixture, {
  resolveAssemblyThicknessMm: (wallAssembly) => {
    if (wallAssembly.thickness.kind !== 'exact') throw new Error('fixture expects exact wall thickness')
    return wallAssembly.thickness.value
  }
})

const bounds = (ring: readonly { x: number; y: number }[]) => ({
  minX: Math.min(...ring.map((point) => point.x)),
  maxX: Math.max(...ring.map((point) => point.x)),
  minY: Math.min(...ring.map((point) => point.y)),
  maxY: Math.max(...ring.map((point) => point.y))
})

const consecutiveDuplicates = (ring: readonly { x: number; y: number }[]): number =>
  ring.filter((point, index) => {
    const next = ring[(index + 1) % ring.length]
    return point.x === next.x && point.y === next.y
  }).length

test('ADE-02 straight wall compiles to one clean rectangular region', () => {
  const result = compile(plan({
    id: 'STRAIGHT',
    nodes: [node('A', 0, 0), node('B', 4000, 0)],
    walls: [wall('W1', 'A', 'B')]
  }))

  assert.equal(result.regions.length, 1)
  assert.equal(result.regions[0].rings.length, 1)
  assert.equal(result.regions[0].rings[0].length, 4)
  assert.deepEqual(bounds(result.regions[0].rings[0]), { minX: 0, maxX: 4000, minY: -200, maxY: 200 })
})

test('ADE-02 L junction becomes one continuous region without an end-cap notch', () => {
  const result = compile(plan({
    id: 'L-JOIN',
    nodes: [node('A', 0, 0), node('B', 4000, 0), node('C', 4000, 3000)],
    walls: [wall('W1', 'A', 'B'), wall('W2', 'B', 'C')]
  }))

  assert.equal(result.regions.length, 1)
  assert.equal(result.regions[0].rings.length, 1)
  assert.deepEqual(bounds(result.regions[0].rings[0]), { minX: 0, maxX: 4200, minY: -200, maxY: 3000 })
  assert.equal(consecutiveDuplicates(result.regions[0].rings[0]), 0)
  // A joined L is a single boundary, not two outlined rectangles with a seam.
  assert.equal(result.regions[0].wallIds.length, 2)
  assert.ok(result.regions[0].rings[0].length >= 6)
})

test('ADE-02 T junction compiles as one material region', () => {
  const result = compile(plan({
    id: 'T-JOIN',
    nodes: [node('A', 0, 0), node('B', 4000, 0), node('C', 8000, 0), node('D', 4000, 3000)],
    walls: [wall('W1', 'A', 'B'), wall('W2', 'B', 'C'), wall('W3', 'B', 'D')]
  }))

  assert.equal(result.regions.length, 1)
  assert.equal(result.regions[0].rings.length, 1)
  assert.equal(result.regions[0].wallIds.length, 3)
  assert.deepEqual(bounds(result.regions[0].rings[0]), { minX: 0, maxX: 8000, minY: -200, maxY: 3000 })
})

test('ADE-02 cross junction compiles as one material region', () => {
  const result = compile(plan({
    id: 'CROSS',
    nodes: [
      node('C', 0, 0), node('W', -3000, 0), node('E', 3000, 0), node('N', 0, 3000), node('S', 0, -3000)
    ],
    walls: [wall('WW', 'W', 'C'), wall('WE', 'C', 'E'), wall('WN', 'C', 'N'), wall('WS', 'S', 'C')]
  }))

  assert.equal(result.regions.length, 1)
  assert.equal(result.regions[0].rings.length, 1)
  assert.equal(result.regions[0].wallIds.length, 4)
})

test('ADE-02 closed wall loop preserves its interior as an even-odd hole', () => {
  const result = compile(plan({
    id: 'RING',
    nodes: [node('A', 0, 0), node('B', 6000, 0), node('C', 6000, 4000), node('D', 0, 4000)],
    walls: [wall('W1', 'A', 'B'), wall('W2', 'B', 'C'), wall('W3', 'C', 'D'), wall('W4', 'D', 'A')]
  }))

  assert.equal(result.regions.length, 1)
  assert.equal(result.regions[0].rings.length, 2)
  const sorted = [...result.regions[0].rings].sort((a, b) => {
    const areaA = (bounds(a).maxX - bounds(a).minX) * (bounds(a).maxY - bounds(a).minY)
    const areaB = (bounds(b).maxX - bounds(b).minX) * (bounds(b).maxY - bounds(b).minY)
    return areaB - areaA
  })
  assert.deepEqual(bounds(sorted[0]), { minX: -200, maxX: 6200, minY: -200, maxY: 4200 })
  assert.deepEqual(bounds(sorted[1]), { minX: 200, maxX: 5800, minY: 200, maxY: 3800 })
})

test('ADE-02 face-referenced perimeter walls join without extending beyond the authored outer corner', () => {
  const result = compile(plan({
    id: 'FACE-RING',
    nodes: [node('A', 0, 0), node('B', 6000, 0), node('C', 6000, 4000), node('D', 0, 4000)],
    walls: [
      wall('S', 'A', 'B', 'WA-400', 'right-face'),
      wall('E', 'B', 'C', 'WA-400', 'right-face'),
      wall('N', 'C', 'D', 'WA-400', 'right-face'),
      wall('W', 'D', 'A', 'WA-400', 'right-face')
    ]
  }))

  assert.equal(result.regions.length, 1)
  assert.equal(result.regions[0].rings.length, 2)
  const outer = [...result.regions[0].rings].sort((a, b) => {
    const ba = bounds(a); const bb = bounds(b)
    return (bb.maxX - bb.minX) * (bb.maxY - bb.minY) - (ba.maxX - ba.minX) * (ba.maxY - ba.minY)
  })[0]
  assert.deepEqual(bounds(outer), { minX: 0, maxX: 6000, minY: 0, maxY: 4000 })
})

test('ADE-02 differing wall thicknesses join through one authored node without a seam', () => {
  const fixture = plan({
    id: 'MIXED',
    nodes: [node('A', 0, 0), node('B', 4000, 0), node('C', 4000, 2500)],
    assemblies: [assembly('WA-400', 400), assembly('WA-200', 200)],
    walls: [wall('W1', 'A', 'B', 'WA-400'), wall('W2', 'B', 'C', 'WA-200')]
  })
  const result = compileWallTopology(fixture, {
    resolveAssemblyThicknessMm: (item) => item.thickness.kind === 'exact' ? item.thickness.value : mm(0)
  })

  assert.equal(result.regions.length, 1)
  assert.equal(result.regions[0].rings.length, 1)
  assert.equal(result.regions[0].wallIds.length, 2)
})

test('ADE-02 keeps disconnected wall networks as separate semantic regions', () => {
  const result = compile(plan({
    id: 'DISCONNECTED',
    nodes: [node('A', 0, 0), node('B', 2000, 0), node('C', 5000, 0), node('D', 7000, 0)],
    walls: [wall('W1', 'A', 'B'), wall('W2', 'C', 'D')]
  }))

  assert.equal(result.regions.length, 2)
  assert.deepEqual(result.regions.map((region) => region.wallIds), [['W1'], ['W2']])
})

test('ADE-02 rejects non-orthogonal walls rather than growing an unearned geometry kernel', () => {
  const fixture = plan({
    id: 'DIAGONAL',
    nodes: [node('A', 0, 0), node('B', 2000, 1000)],
    walls: [wall('W1', 'A', 'B')]
  })

  assert.throws(() => compile(fixture), /non-orthogonal/)
})

test('ADE-02 validates representation thickness against source-owned range', () => {
  const ranged: AdeWallAssembly = {
    kind: 'wall-assembly',
    id: 'WA-RANGE',
    thickness: { kind: 'range', min: mm(400), max: mm(425) },
    provenance: { sourceIds: ['ADE-02-RANGE'], authority: 'provisional', precision: 'range' }
  }
  const fixture = plan({
    id: 'RANGE',
    nodes: [node('A', 0, 0), node('B', 2000, 0)],
    assemblies: [ranged],
    walls: [wall('W1', 'A', 'B', 'WA-RANGE')]
  })

  assert.doesNotThrow(() => compileWallTopology(fixture, { resolveAssemblyThicknessMm: () => mm(410) }))
  assert.throws(() => compileWallTopology(fixture, { resolveAssemblyThicknessMm: () => mm(450) }), /outside authored range/)
})
