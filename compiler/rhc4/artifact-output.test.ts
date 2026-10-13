import { test } from 'node:test'

import { renderBoundaryTopologySvg } from '../boundary-slice/drawing.js'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { compileReferenceHouseBoundaryView } from './compile.js'

test('RH-C4 emit canonical SVG for artifact freeze', () => {
  const result = compileReferenceHouseBoundaryView(createReferenceHouseSource())
  const svg = renderBoundaryTopologySvg(result.boundaries, 'Reference House — RH-C4 envelope / boundary topology')
  console.log('RH_C4_SVG_BEGIN')
  console.log(svg)
  console.log('RH_C4_SVG_END')
})
