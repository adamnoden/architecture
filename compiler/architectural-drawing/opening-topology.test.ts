import assert from 'node:assert/strict'
import test from 'node:test'

import { mm } from '../units.js'
import { compileWallAssemblyTopology } from './assembly-topology.js'
import type {
  AdeArchitecturalPlan,
  AdeOpening,
  AdePlanNode,
  AdeProvenance,
  AdeWallAssembly,
  AdeWallAssemblyLayer,
  AdeWallRun
} from './model.js'
import {
  applyOpeningCutoutsToAssemblyBands,
  applyOpeningCutoutsToWallRegions,
  compileOpeningCutouts
} from './opening-topology.js'
import { compileWallTopology } from './topology.js'

const exact: AdeProvenance = {
  sourceIds: ['ADE-04A-FIXTURE'],
  authority: 'controlled',
  precision: 'exact'
}
const ranged: AdeProvenance = {
  sourceIds: ['ADE-04A-RANGE'],
  authority: 'provisional',
  precision: 'range'
}

const node = (id: string, x: number, y: number): AdePlanNode => ({ kind: 'node', id, point: { x: mm(x), y: mm(y) }, provenance: exact })
const layer = (id: string, role: AdeWallAssemblyLayer['role'], value: number): AdeWallAssemblyLayer => ({
  id, role, thickness: { kind: 'exact', value: mm(value) }, provenance: exact
})
const monolithic: AdeWallAssembly = {
  kind: 'wall-assembly', id: 'WA-400', thickness: { kind: 'exact', value: mm(400) }, provenance: exact
}
const layered: AdeWallAssembly = {
  kind: 'wall-assembly',
  id: 'WA-LAYERED',
  thickness: { kind: 'exact', value: mm(400) },
  layers: [
    layer('L-WEATHER', 'weathering-leaf', 100),
    layer('L-CAVITY', 'cavity-zone', 150),
    layer('L-STRUCT', 'structural-leaf', 140),
    layer('L-FINISH', 'finish-zone', 10)
  ],
  provenance: exact
}

const wall = (id: string, fromNodeId: string, toNodeId: string, assemblyId = 'WA-400'): AdeWallRun => ({
  kind: 'wall',
  id,
  fromNodeId,
  toNodeId,
  reference: 'right-face',
  assemblyId,
  assemblyStartFace: assemblyId === 'WA-LAYERED' ? 'right-face' : undefined,
  provenance: exact
})

const opening = (
  id: string,
  hostWallId: string,
  centre: AdeOpening['centreOffset'],
  width: AdeOpening['width'],
  provenance: AdeProvenance = exact
): AdeOpening => ({ kind: 'opening', id, hostWallId, role: 'window', centreOffset: centre, width, provenance })

const plan = (options: {
  id: string
  nodes: AdePlanNode[]
  walls: AdeWallRun[]
  openings: AdeOpening[]
  assemblies?: AdeWallAssembly[]
}): AdeArchitecturalPlan => ({
  id: options.id,
  sourceId: 'ADE-04A-SYNTHETIC',
  nodes: options.nodes,
  wallAssemblies: options.assemblies ?? [monolithic],
  walls: options.walls,
  openings: options.openings,
  partitionDatums: [],
  spaces: [],
  adjacencies: [],
  dimensions: [],
  labels: []
})

const options = {
  resolveAssemblyThicknessMm: (assembly: AdeWallAssembly) => {
    if (assembly.thickness.kind !== 'exact') throw new Error('fixture expects exact wall thickness')
    return assembly.thickness.value
  },
  resolveOpeningCentreOffsetMm: (candidate: AdeOpening) => {
    if (candidate.centreOffset.kind === 'exact' || candidate.centreOffset.kind === 'approximate') return candidate.centreOffset.value
    if (candidate.centreOffset.kind === 'range') return mm((candidate.centreOffset.min + candidate.centreOffset.max) / 2)
    throw new Error(`fixture cannot resolve ${candidate.centreOffset.kind} centre`)
  },
  resolveOpeningWidthMm: (candidate: AdeOpening) => {
    if (candidate.width.kind === 'exact' || candidate.width.kind === 'approximate') return candidate.width.value
    if (candidate.width.kind === 'range') return candidate.width.min
    throw new Error(`fixture cannot resolve ${candidate.width.kind} width`)
  }
}

const xs = (rings: readonly (readonly { x: number; y: number }[])[]): number[] =>
  [...new Set(rings.flat().map((point) => point.x))].sort((a, b) => a - b)

const ys = (rings: readonly (readonly { x: number; y: number }[])[]): number[] =>
  [...new Set(rings.flat().map((point) => point.y))].sort((a, b) => a - b)

test('ADE-04A exact opening is a true gap in a joined wall region, not a white overpaint', () => {
  const fixture = plan({
    id: 'STRAIGHT-OPENING',
    nodes: [node('A', 0, 0), node('B', 6000, 0)],
    walls: [wall('W1', 'A', 'B')],
    openings: [opening('O1', 'W1', { kind: 'exact', value: mm(3000) }, { kind: 'exact', value: mm(1200) })]
  })
  const topology = compileWallTopology(fixture, { resolveAssemblyThicknessMm: options.resolveAssemblyThicknessMm })
  const cuts = compileOpeningCutouts(fixture, options)
  const opened = applyOpeningCutoutsToWallRegions(topology.regions, cuts)

  assert.equal(cuts.length, 1)
  assert.deepEqual(cuts[0].rect, { x0: 2400, y0: 0, x1: 3600, y1: 400 })
  assert.equal(opened.length, 1)
  assert.deepEqual(opened[0].openingIds, ['O1'])
  assert.ok(xs(opened[0].rings).includes(2400))
  assert.ok(xs(opened[0].rings).includes(3600))
  assert.ok(opened[0].sourceIds.includes('ADE-04A-FIXTURE'))
})

test('ADE-04A multiple openings subtract independently from the same host wall', () => {
  const fixture = plan({
    id: 'MULTI',
    nodes: [node('A', 0, 0), node('B', 8000, 0)],
    walls: [wall('W1', 'A', 'B')],
    openings: [
      opening('O1', 'W1', { kind: 'exact', value: mm(2000) }, { kind: 'exact', value: mm(1000) }),
      opening('O2', 'W1', { kind: 'exact', value: mm(6000) }, { kind: 'exact', value: mm(1600) })
    ]
  })
  const topology = compileWallTopology(fixture, { resolveAssemblyThicknessMm: options.resolveAssemblyThicknessMm })
  const cuts = compileOpeningCutouts(fixture, options)
  const opened = applyOpeningCutoutsToWallRegions(topology.regions, cuts)

  assert.deepEqual(opened[0].openingIds, ['O1', 'O2'])
  for (const coordinate of [1500, 2500, 5200, 6800]) assert.ok(xs(opened[0].rings).includes(coordinate))
})

test('ADE-04A subtracts the same physical aperture through every layered assembly band', () => {
  const fixture = plan({
    id: 'LAYERED',
    nodes: [node('A', 0, 0), node('B', 6000, 0)],
    assemblies: [layered],
    walls: [wall('W1', 'A', 'B', 'WA-LAYERED')],
    openings: [opening('O1', 'W1', { kind: 'exact', value: mm(3000) }, { kind: 'exact', value: mm(1200) })]
  })
  const assemblyTopology = compileWallAssemblyTopology(fixture, 'WA-LAYERED', {
    resolveAssemblyThicknessMm: () => mm(400),
    resolveLayerThicknessMm: (candidate) => {
      if (candidate.thickness.kind !== 'exact') throw new Error('fixture expects exact layer thickness')
      return candidate.thickness.value
    }
  })
  const cuts = compileOpeningCutouts(fixture, { ...options, resolveAssemblyThicknessMm: () => mm(400) })
  const openedBands = applyOpeningCutoutsToAssemblyBands(assemblyTopology.bands, cuts)

  assert.equal(openedBands.length, 4)
  for (const band of openedBands) {
    assert.deepEqual(band.openingIds, ['O1'])
    const coordinates = xs(band.rings)
    assert.ok(coordinates.includes(2400), `${band.layerId} lost left jamb`)
    assert.ok(coordinates.includes(3600), `${band.layerId} lost right jamb`)
  }
})

test('ADE-04A opening near a corner remains valid when it does not touch the semantic junction', () => {
  const fixture = plan({
    id: 'NEAR-CORNER',
    nodes: [node('A', 0, 0), node('B', 5000, 0), node('C', 5000, 3500)],
    walls: [wall('W1', 'A', 'B'), wall('W2', 'B', 'C')],
    openings: [opening('O1', 'W1', { kind: 'exact', value: mm(4100) }, { kind: 'exact', value: mm(1000) })]
  })
  const topology = compileWallTopology(fixture, { resolveAssemblyThicknessMm: options.resolveAssemblyThicknessMm })
  const cuts = compileOpeningCutouts(fixture, options)
  const opened = applyOpeningCutoutsToWallRegions(topology.regions, cuts)

  assert.equal(opened.length, 1)
  assert.deepEqual(opened[0].openingIds, ['O1'])
  assert.ok(xs(opened[0].rings).includes(3600))
  assert.ok(xs(opened[0].rings).includes(4600))
})

test('ADE-04A rejects an opening that reaches a wall endpoint/junction', () => {
  const fixture = plan({
    id: 'TOUCH-JUNCTION',
    nodes: [node('A', 0, 0), node('B', 5000, 0), node('C', 5000, 3500)],
    walls: [wall('W1', 'A', 'B'), wall('W2', 'B', 'C')],
    openings: [opening('O1', 'W1', { kind: 'exact', value: mm(4500) }, { kind: 'exact', value: mm(1000) })]
  })

  assert.throws(() => compileOpeningCutouts(fixture, options), /reaches\/touches host-wall endpoint or semantic junction/)
})

test('ADE-04A allows an explicit representative width inside a source-owned range and rejects values outside it', () => {
  const fixture = plan({
    id: 'RANGE',
    nodes: [node('A', 0, 0), node('B', 6000, 0)],
    walls: [wall('W1', 'A', 'B')],
    openings: [opening(
      'O1',
      'W1',
      { kind: 'exact', value: mm(3000) },
      { kind: 'range', min: mm(900), max: mm(1200) },
      ranged
    )]
  })

  assert.doesNotThrow(() => compileOpeningCutouts(fixture, {
    ...options,
    resolveOpeningWidthMm: () => mm(900)
  }))
  assert.throws(() => compileOpeningCutouts(fixture, {
    ...options,
    resolveOpeningWidthMm: () => mm(1300)
  }), /outside authored range/)
})

test('ADE-04A refuses qualitative/unknown opening dimensions rather than inventing a plausible aperture', () => {
  const fixture = plan({
    id: 'UNKNOWN',
    nodes: [node('A', 0, 0), node('B', 6000, 0)],
    walls: [wall('W1', 'A', 'B')],
    openings: [opening('O1', 'W1', { kind: 'exact', value: mm(3000) }, { kind: 'unknown' }, {
      sourceIds: ['ADE-04A-UNKNOWN'], authority: 'provisional', precision: 'unknown'
    })]
  })

  assert.throws(() => compileOpeningCutouts(fixture, {
    ...options,
    resolveOpeningWidthMm: () => mm(1000)
  }), /unknown distance authority/)
})

test('ADE-04A vertical host produces a full-depth vertical aperture rectangle', () => {
  const fixture = plan({
    id: 'VERTICAL',
    nodes: [node('A', 0, 0), node('B', 0, 5000)],
    walls: [wall('W1', 'A', 'B')],
    openings: [opening('O1', 'W1', { kind: 'exact', value: mm(2500) }, { kind: 'exact', value: mm(1000) })]
  })
  const cuts = compileOpeningCutouts(fixture, options)
  assert.deepEqual(cuts[0].rect, { x0: -400, y0: 2000, x1: 0, y1: 3000 })
  assert.ok(ys([[
    { x: cuts[0].rect.x0, y: cuts[0].rect.y0 },
    { x: cuts[0].rect.x1, y: cuts[0].rect.y1 }
  ]]).includes(3000))
})
