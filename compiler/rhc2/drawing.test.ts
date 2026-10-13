import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { renderStructuralTopologySvg } from '../structure-slice/drawing.js'
import { compileReferenceHouseStructuralView } from './compile.js'

const here = dirname(fileURLToPath(import.meta.url))
const drawingPath = resolve(here, '../../docs/reference-house/rhc2-structural-topology.svg')

test('RH-C2 committed structural SVG is the exact deterministic canonical projection', () => {
  const first = compileReferenceHouseStructuralView(createReferenceHouseSource())
  const second = compileReferenceHouseStructuralView(createReferenceHouseSource())

  assert.equal(first.status, 'PASS')
  assert.deepEqual(first, second)

  const rendered = renderStructuralTopologySvg(
    first.structure,
    first.plan,
    'Reference House — RH-C2 structural topology'
  )
  assert.equal(readFileSync(drawingPath, 'utf8'), rendered)
})
