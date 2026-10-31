import assert from 'node:assert/strict'
import test from 'node:test'

import { mm } from '../units.js'
import type {
  AdeArchitecturalPlan,
  AdePlanNode,
  AdeProvenance,
  AdeWallAssembly,
  AdeWallAssemblyLayer,
  AdeWallRun
} from './model.js'
import { compileWallAssemblyTopology } from './assembly-topology.js'
import { validateArchitecturalPlan } from './validate.js'

const controlledExact: AdeProvenance = {
  sourceIds: ['ADE-03A-FIXTURE'],
  authority: 'controlled',
  precision: 'exact'
}

const controlledRange: AdeProvenance = {
  sourceIds: ['ADE-03A-RANGE'],
  authority: 'controlled',
  precision: 'range'
}

const node = (id: string, x: number, y: number): AdePlanNode => ({
  kind: 'node', id, point: { x: mm(x), y: mm(y) }, provenance: controlledExact
})

const layer = (
  id: string,
  role: AdeWallAssemblyLayer['role'],
  thickness: AdeWallAssemblyLayer['thickness'],
  provenance: AdeProvenance = controlledExact
): AdeWallAssemblyLayer => ({ id, role, thickness, provenance })

const exactAssembly = (): AdeWallAssembly => ({
  kind: 'wall-assembly',
  id: 'WA-LAYERED',
  thickness: { kind: 'exact', value: mm(400) },
  layers: [
    layer('L-WEATHER', 'weathering-leaf', { kind: 'exact', value: mm(100) }),
    layer('L-CAVITY', 'cavity-zone', { kind: 'exact', value: mm(150) }),
    layer('L-STRUCT', 'structural-leaf', { kind: 'exact', value: mm(140) }),
    layer('L-FINISH', 'finish-zone', { kind: 'exact', value: mm(10) })
  ],
  provenance: controlledExact
})

const rangedAssembly = (): AdeWallAssembly => ({
  kind: 'wall-assembly',
  id: 'WA-RH10-LIKE',
  thickness: { kind: 'range', min: mm(410), max: mm(435) },
  layers: [
    layer('L-RH10-WEATHER', 'weathering-leaf', { kind: 'approximate', value: mm(102.5) }),
    layer('L-RH10-CAVITY', 'cavity-zone', { kind: 'range', min: mm(150), max: mm(175) }, controlledRange),
    layer('L-RH10-STRUCT', 'structural-leaf', { kind: 'approximate', value: mm(140) }),
    layer('L-RH10-FINISH', 'finish-zone', { kind: 'approximate', value: mm(15) })
  ],
  provenance: controlledRange
})

const wall = (id: string, fromNodeId: string, toNodeId: string, assemblyId = 'WA-LAYERED'): AdeWallRun => ({
  kind: 'wall',
  id,
  fromNodeId,
  toNodeId,
  reference: 'right-face',
  assemblyId,
  assemblyStartFace: 'right-face',
  provenance: controlledExact
})

const perimeterPlan = (assembly: AdeWallAssembly = exactAssembly()): AdeArchitecturalPlan => ({
  id: 'ADE03A-PERIMETER',
  sourceId: 'ADE-03A-SYNTHETIC',
  nodes: [node('A', 0, 0), node('B', 6000, 0), node('C', 6000, 4000), node('D', 0, 4000)],
  wallAssemblies: [assembly],
  walls: [
    wall('S', 'A', 'B', assembly.id),
    wall('E', 'B', 'C', assembly.id),
    wall('N', 'C', 'D', assembly.id),
    wall('W', 'D', 'A', assembly.id)
  ],
  openings: [],
  partitionDatums: [],
  spaces: [],
  adjacencies: [],
  dimensions: [],
  labels: []
})

const ringBounds = (ring: readonly { x: number; y: number }[]) => ({
  minX: Math.min(...ring.map((point) => point.x)),
  maxX: Math.max(...ring.map((point) => point.x)),
  minY: Math.min(...ring.map((point) => point.y)),
  maxY: Math.max(...ring.map((point) => point.y))
})

const ringAreaByBounds = (ring: readonly { x: number; y: number }[]): number => {
  const bounds = ringBounds(ring)
  return (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY)
}

const sortedRings = (rings: readonly (readonly { x: number; y: number }[])[]) =>
  [...rings].sort((a, b) => ringAreaByBounds(b) - ringAreaByBounds(a))

test('ADE-03A layered perimeter compiles four continuous nested bands from one authored face', () => {
  const plan = perimeterPlan()
  assert.deepEqual(validateArchitecturalPlan(plan), [])

  const result = compileWallAssemblyTopology(plan, 'WA-LAYERED', {
    resolveAssemblyThicknessMm: () => mm(400),
    resolveLayerThicknessMm: (candidate) => {
      if (candidate.thickness.kind !== 'exact') throw new Error('fixture expects exact layer thickness')
      return candidate.thickness.value
    }
  })

  assert.equal(result.bands.length, 4)
  assert.deepEqual(result.resolvedLayerThicknessMm, {
    'L-WEATHER': 100,
    'L-CAVITY': 150,
    'L-STRUCT': 140,
    'L-FINISH': 10
  })

  for (const band of result.bands) {
    assert.deepEqual(band.wallIds, ['E', 'N', 'S', 'W'])
    assert.equal(band.rings.length, 2, `${band.layerId} should remain a closed continuous ring`)
    assert.ok(band.sourceIds.includes('ADE-03A-FIXTURE'))
  }

  const byLayer = new Map(result.bands.map((band) => [band.layerId, band]))
  const weather = sortedRings(byLayer.get('L-WEATHER')!.rings)
  const cavity = sortedRings(byLayer.get('L-CAVITY')!.rings)
  const structural = sortedRings(byLayer.get('L-STRUCT')!.rings)
  const finish = sortedRings(byLayer.get('L-FINISH')!.rings)

  assert.deepEqual(ringBounds(weather[0]), { minX: 0, maxX: 6000, minY: 0, maxY: 4000 })
  assert.deepEqual(ringBounds(weather[1]), { minX: 100, maxX: 5900, minY: 100, maxY: 3900 })

  assert.deepEqual(ringBounds(cavity[0]), { minX: 100, maxX: 5900, minY: 100, maxY: 3900 })
  assert.deepEqual(ringBounds(cavity[1]), { minX: 250, maxX: 5750, minY: 250, maxY: 3750 })

  assert.deepEqual(ringBounds(structural[0]), { minX: 250, maxX: 5750, minY: 250, maxY: 3750 })
  assert.deepEqual(ringBounds(structural[1]), { minX: 390, maxX: 5610, minY: 390, maxY: 3610 })

  assert.deepEqual(ringBounds(finish[0]), { minX: 390, maxX: 5610, minY: 390, maxY: 3610 })
  assert.deepEqual(ringBounds(finish[1]), { minX: 400, maxX: 5600, minY: 400, maxY: 3600 })
})

test('ADE-03A accepts an RH-10-like ranged family only through explicit representative values inside source authority', () => {
  const plan = perimeterPlan(rangedAssembly())
  assert.deepEqual(validateArchitecturalPlan(plan), [])

  const result = compileWallAssemblyTopology(plan, 'WA-RH10-LIKE', {
    resolveAssemblyThicknessMm: () => mm(417.5),
    resolveLayerThicknessMm: (candidate) => {
      if (candidate.role === 'cavity-zone') return mm(160)
      if (candidate.thickness.kind === 'approximate') return candidate.thickness.value
      throw new Error(`Unexpected layer authority for ${candidate.id}`)
    }
  })

  assert.equal(result.resolvedOverallThicknessMm, 417.5)
  assert.equal(result.resolvedLayerThicknessMm['L-RH10-CAVITY'], 160)
  assert.equal(result.bands.length, 4)
})

test('ADE-03A rejects a layered wall whose ordered assembly face is not authored', () => {
  const plan = perimeterPlan()
  const invalid: AdeArchitecturalPlan = {
    ...plan,
    walls: plan.walls.map((candidate, index) => index === 0 ? { ...candidate, assemblyStartFace: undefined } : candidate)
  }

  assert.ok(validateArchitecturalPlan(invalid).some((item) => item.code === 'ADE-WALL-LAYER-ORIENTATION'))
})

test('ADE-03A rejects empty, duplicate and impossible layer families', () => {
  const base = exactAssembly()
  const empty = perimeterPlan({ ...base, layers: [] })
  assert.ok(validateArchitecturalPlan(empty).some((item) => item.code === 'ADE-ASSEMBLY-LAYERS-EMPTY'))

  const duplicate = perimeterPlan({
    ...base,
    layers: [base.layers![0], { ...base.layers![1], id: base.layers![0].id }]
  })
  assert.ok(validateArchitecturalPlan(duplicate).some((item) => item.code === 'ADE-DUPLICATE-ID'))

  const impossible = perimeterPlan({
    ...base,
    layers: [
      layer('L-A', 'weathering-leaf', { kind: 'exact', value: mm(200) }),
      layer('L-B', 'structural-leaf', { kind: 'exact', value: mm(250) })
    ]
  })
  assert.ok(validateArchitecturalPlan(impossible).some((item) => item.code === 'ADE-ASSEMBLY-LAYER-SUM'))
})

test('ADE-03A refuses resolved layer values whose sum does not equal represented overall thickness', () => {
  const plan = perimeterPlan(rangedAssembly())

  assert.throws(() => compileWallAssemblyTopology(plan, 'WA-RH10-LIKE', {
    resolveAssemblyThicknessMm: () => mm(420),
    resolveLayerThicknessMm: (candidate) => {
      if (candidate.role === 'cavity-zone') return mm(160)
      if (candidate.thickness.kind === 'approximate') return candidate.thickness.value
      throw new Error(`Unexpected layer authority for ${candidate.id}`)
    }
  }), /resolved layers sum to 417.5 mm but represented overall thickness is 420 mm/)
})

test('ADE-03A deliberately requires the wall reference to be the authored assembly start face', () => {
  const plan = perimeterPlan()
  const unsupported: AdeArchitecturalPlan = {
    ...plan,
    walls: plan.walls.map((candidate) => ({ ...candidate, reference: 'centreline' }))
  }

  assert.throws(() => compileWallAssemblyTopology(unsupported, 'WA-LAYERED', {
    resolveAssemblyThicknessMm: () => mm(400),
    resolveLayerThicknessMm: (candidate) => candidate.thickness.kind === 'exact' ? candidate.thickness.value : mm(0)
  }), /must reference the same physical face that starts its layered assembly/)
})
