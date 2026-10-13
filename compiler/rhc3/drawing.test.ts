import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { renderServiceTopologySvg } from '../service-slice/drawing.js'
import { compileReferenceHouseServiceView } from './compile.js'

const here = dirname(fileURLToPath(import.meta.url))
const drawingPath = resolve(here, '../../docs/reference-house/rhc3-service-topology.svg')

test('RH-C3 committed service SVG is the exact deterministic canonical projection', () => {
  const first = compileReferenceHouseServiceView(createReferenceHouseSource())
  const second = compileReferenceHouseServiceView(createReferenceHouseSource())

  assert.equal(first.status, 'PASS')
  assert.deepEqual(first, second)

  const rendered = renderServiceTopologySvg(first.services, 'RH-C3 service topology')
  assert.equal(readFileSync(drawingPath, 'utf8'), rendered)
})
