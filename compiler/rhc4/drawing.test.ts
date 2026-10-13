import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

import { renderBoundaryTopologySvg } from '../boundary-slice/drawing.js'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { compileReferenceHouseBoundaryView } from './compile.js'

const here = dirname(fileURLToPath(import.meta.url))
const drawingPath = resolve(here, '../../docs/reference-house/rhc4-boundary-topology.svg')

test('RH-C4 committed boundary SVG is the exact deterministic canonical projection', () => {
  const first = compileReferenceHouseBoundaryView(createReferenceHouseSource())
  const second = compileReferenceHouseBoundaryView(createReferenceHouseSource())

  assert.equal(first.status, 'PASS')
  assert.deepEqual(first, second)

  const rendered = renderBoundaryTopologySvg(
    first.boundaries,
    'Reference House — RH-C4 envelope / boundary topology'
  )
  assert.equal(readFileSync(drawingPath, 'utf8'), rendered)
})
