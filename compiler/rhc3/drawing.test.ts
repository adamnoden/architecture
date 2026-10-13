import assert from 'node:assert/strict'
import { test } from 'node:test'

import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { renderServiceTopologySvg } from '../service-slice/drawing.js'
import { compileReferenceHouseServiceView } from './compile.js'

test('RH-C3 service projection is deterministic for the canonical source', () => {
  const result = compileReferenceHouseServiceView(createReferenceHouseSource())
  const first = renderServiceTopologySvg(result.services, 'RH-C3 service topology')
  const second = renderServiceTopologySvg(result.services, 'RH-C3 service topology')
  assert.equal(first, second)
  console.log('RH_C3_SVG_BEGIN')
  console.log(first)
  console.log('RH_C3_SVG_END')
})
