import assert from 'node:assert/strict'
import test from 'node:test'

import { createPlanPaperProjection } from '../publication-drawing/projection.js'
import { mm } from '../units.js'
import type { AdeArchitecturalPlan, AdeOpening, AdeProvenance, AdeWallAssembly } from './model.js'
import {
  compileOpeningUncertaintyInstruction,
  openingUncertaintyToDrawingPrimitives
} from './opening-uncertainty.js'

const exact: AdeProvenance = { sourceIds: ['ADE-04B'], authority: 'controlled', precision: 'exact' }
const provisional: AdeProvenance = { sourceIds: ['ADE-04B-PROVISIONAL'], authority: 'provisional', precision: 'range' }
const assembly: AdeWallAssembly = {
  kind: 'wall-assembly', id: 'WA-400', thickness: { kind: 'exact', value: mm(400) }, provenance: exact
}

const opening = (id: string, centreOffset: AdeOpening['centreOffset'], width: AdeOpening['width'], provenance = exact): AdeOpening => ({
  kind: 'opening', id, hostWallId: 'W1', role: 'window', centreOffset, width, provenance
})

const planWith = (candidate: AdeOpening): AdeArchitecturalPlan => ({
  id: `ADE04B-${candidate.id}`,
  sourceId: 'ADE-04B-TEST',
  nodes: [
    { kind: 'node', id: 'A', point: { x: mm(0), y: mm(0) }, provenance: exact },
    { kind: 'node', id: 'B', point: { x: mm(6000), y: mm(0) }, provenance: exact }
  ],
  wallAssemblies: [assembly],
  walls: [{
    kind: 'wall', id: 'W1', fromNodeId: 'A', toNodeId: 'B', reference: 'right-face', assemblyId: 'WA-400', provenance: exact
  }],
  openings: [candidate],
  partitionDatums: [], spaces: [], adjacencies: [], dimensions: [], labels: []
})

const projection = createPlanPaperProjection({
  scaleDenominator: 100,
  modelBounds: { x: 0, y: -1000, width: 6000, height: 2000 },
  paperOrigin: { x: 20, y: 20 }
})
const drawOptions = {
  annotationSide: 'left' as const,
  resolveAssemblyThicknessMm: () => mm(400),
  showLabels: false
}

test('ADE-04B exact opening emits no uncertainty notation', () => {
  const plan = planWith(opening('EXACT', { kind: 'exact', value: mm(3000) }, { kind: 'exact', value: mm(1200) }))
  const instruction = compileOpeningUncertaintyInstruction(plan, 'EXACT')
  assert.equal(instruction.kind, 'exact')
  assert.deepEqual(openingUncertaintyToDrawingPrimitives(plan, instruction, projection, drawOptions), [])
})

test('ADE-04B approximate aperture uses an external paper-space span', () => {
  const plan = planWith(opening('APPROX', { kind: 'exact', value: mm(3000) }, { kind: 'approximate', value: mm(1200) }, {
    sourceIds: ['ADE-04B-APPROX'], authority: 'provisional', precision: 'approximate'
  }))
  const instruction = compileOpeningUncertaintyInstruction(plan, 'APPROX')
  assert.equal(instruction.kind, 'approximate-aperture')
  const primitives = openingUncertaintyToDrawingPrimitives(plan, instruction, projection, drawOptions)
  assert.equal(primitives.filter((primitive) => primitive.kind === 'line').length, 3)
  assert.ok(primitives.every((primitive) => primitive.metadata?.epistemic === 'opening-uncertainty'))
  assert.ok(primitives.filter((primitive) => primitive.kind === 'line').every((primitive) => primitive.kind !== 'line' || primitive.dash === undefined))
})

test('ADE-04B ranged width preserves min/max authority without pseudo-jambs', () => {
  const plan = planWith(opening('RANGE', { kind: 'exact', value: mm(3000) }, { kind: 'range', min: mm(900), max: mm(1200) }, provisional))
  const instruction = compileOpeningUncertaintyInstruction(plan, 'RANGE')
  assert.equal(instruction.kind, 'range-width')
  if (instruction.kind !== 'range-width') return
  assert.equal(instruction.minimumWidth, 900)
  assert.equal(instruction.maximumWidth, 1200)
  const primitives = openingUncertaintyToDrawingPrimitives(plan, instruction, projection, drawOptions)
  assert.equal(primitives.filter((primitive) => primitive.kind === 'line').length, 5)
  assert.ok(primitives.every((primitive) => primitive.metadata?.state === 'range-width'))
})

test('ADE-04B known centre / unknown width becomes a point marker, not a plausible aperture', () => {
  const plan = planWith(opening('CENTRE', { kind: 'exact', value: mm(3000) }, { kind: 'unknown' }, {
    sourceIds: ['ADE-04B-UNKNOWN-WIDTH'], authority: 'provisional', precision: 'unknown'
  }))
  const instruction = compileOpeningUncertaintyInstruction(plan, 'CENTRE')
  assert.equal(instruction.kind, 'centre-only')
  const primitives = openingUncertaintyToDrawingPrimitives(plan, instruction, projection, drawOptions)
  assert.equal(primitives.filter((primitive) => primitive.kind === 'line').length, 5)
  const leader = primitives.find((primitive) => primitive.id === 'CENTRE-pin-leader')
  assert.ok(leader && leader.kind === 'line')
  if (!leader || leader.kind !== 'line') return
  // Right-face wall material projects above the reference line; left-side
  // annotation is below it. The leader must terminate at the physical face and
  // never enter the wall body.
  const referenceY = projection.point(3000, 0).y
  assert.ok(leader.a.y > referenceY && Math.abs(leader.b.y - referenceY) < 1e-6)
})

test('ADE-04B unknown position becomes a host-span obligation with no invented centre', () => {
  const plan = planWith(opening('HOST', { kind: 'unknown' }, { kind: 'unknown' }, {
    sourceIds: ['ADE-04B-HOST'], authority: 'provisional', precision: 'unknown'
  }))
  const instruction = compileOpeningUncertaintyInstruction(plan, 'HOST')
  assert.equal(instruction.kind, 'host-obligation')
  const primitives = openingUncertaintyToDrawingPrimitives(plan, instruction, projection, drawOptions)
  assert.equal(primitives.filter((primitive) => primitive.kind === 'line').length, 3)
  assert.ok(primitives.every((primitive) => primitive.metadata?.state === 'host-obligation'))
})

test('ADE-04B refuses ranged position until a dedicated notation is earned', () => {
  const plan = planWith(opening('POS-RANGE', { kind: 'range', min: mm(2500), max: mm(3500) }, { kind: 'exact', value: mm(1200) }, provisional))
  assert.throws(() => compileOpeningUncertaintyInstruction(plan, 'POS-RANGE'), /ranged-position notation is not yet an earned capability/)
})
