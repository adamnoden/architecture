import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { createReferenceHouseOutputContext } from '../reference-house/output/context.js'
import { renderReferenceHouseStructuralInspection } from '../reference-house/output/structure.js'

describe('COA-05 topology successor views', () => {
  const context = createReferenceHouseOutputContext()
  const svg = renderReferenceHouseStructuralInspection(context)

  test('uses north-up projection consistently with the architectural plan set', () => {
    assert.match(svg, /NORTH UP/)
    assert.match(svg, /data-convention="north-arrow"/)

    const north = context.result.structure.derived.spanFields.find((field) => field.id === 'F-N')
    const south = context.result.structure.derived.spanFields.find((field) => field.id === 'F-S')
    assert.ok(north && south)

    const northIndex = svg.indexOf('data-entity="F-N"')
    const southIndex = svg.indexOf('data-entity="F-S"')
    assert.ok(northIndex >= 0 && southIndex >= 0)
    assert.match(svg.slice(northIndex, northIndex + 1200), /north centre floor strip/)
    assert.match(svg.slice(southIndex, southIndex + 1200), /south centre floor strip/)
  })

  test('renders span axes as undirected', () => {
    for (const field of context.result.structure.derived.spanFields) {
      const start = svg.indexOf(`data-entity="${field.id}" data-convention="span-axis"`)
      assert.ok(start >= 0, `missing span axis ${field.id}`)
      const fragment = svg.slice(start, start + 500)
      assert.match(fragment, /marker-start="url\(#oh-span-arrow\)"/)
      assert.match(fragment, /marker-end="url\(#oh-span-arrow\)"/)
    }
  })

  test('preserves structural topology categories and reaction identity', () => {
    for (const line of context.result.structure.derived.lineElements) {
      assert.match(svg, new RegExp(`data-entity="${line.id}"`))
      assert.match(svg, new RegExp(`data-kind="${line.kind}"`))
    }
    for (const node of context.result.structure.derived.reactionNodes) {
      assert.match(svg, new RegExp(`data-entity="${node.id}"`))
      assert.match(svg, /data-kind="reaction-node"/)
    }
  })

  test('shows interruptions without manufacturing a plan location', () => {
    for (const interruption of context.result.structure.derived.interruptions) {
      const start = svg.indexOf(`data-entity="${interruption.id}"`)
      assert.ok(start >= 0, `missing interruption ${interruption.id}`)
      const fragment = svg.slice(start, start + 900)
      assert.match(fragment, new RegExp(`data-geometry="${interruption.geometry.kind}"`))
      assert.match(fragment, /unresolved/)
    }
    assert.match(svg, /1050 × 850 mm · exact position unresolved/)
    assert.match(svg, /qualitative · exact geometry unresolved/)
  })

  test('carries canonical identity and the structural proof boundary', () => {
    assert.match(svg, new RegExp(`data-source-compile="${context.result.identity.compile.fingerprint}"`))
    assert.match(svg, /Strength, deflection, vibration, fire, robustness, bearing, connection and foundation adequacy remain external/)
  })

  test('is deterministic for unchanged compiled state', () => {
    assert.equal(renderReferenceHouseStructuralInspection(context), svg)
  })
})
