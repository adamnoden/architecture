import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'

import { REFERENCE_HOUSE_OUTPUTS } from '../reference-house/output/contract.js'
import { createReferenceHouseOutputContext } from '../reference-house/output/context.js'
import {
  renderReferenceHousePlan,
  renderReferenceHousePrincipalSection,
  renderReferenceHouseSpatialInspectionSet
} from '../reference-house/output/spatial.js'

describe('COA-04 Reference House plan and section successors', () => {
  const context = createReferenceHouseOutputContext()
  const set = renderReferenceHouseSpatialInspectionSet(context)

  test('uses one canonical system compile and north-up inspection conventions', () => {
    for (const plan of [set.groundFloor, set.firstFloor]) {
      assert.match(plan, /data-convention="north-arrow"/)
      assert.match(plan, /data-section="A–A"/)
      assert.match(plan, /NORTH UP/)
      assert.match(plan, new RegExp(`data-source-compile="${context.result.identity.compile.fingerprint}"`))
    }
    assert.match(set.principalSection, /data-section="A–A"/)
    assert.match(set.principalSection, />S<\/text>/)
    assert.match(set.principalSection, />N<\/text>/)
    assert.match(set.principalSection, /SOUTH → NORTH/)
  })

  test('puts human architectural labels ahead of semantic IDs while preserving identity', () => {
    for (const space of context.result.house.derived.spaces) {
      const plan = space.levelId === 'GROUND' ? set.groundFloor : set.firstFloor
      assert.match(plan, new RegExp(`data-entity="${space.id}"`))
      const labelIndex = plan.indexOf(space.label[0].toUpperCase() + space.label.slice(1))
      const idIndex = plan.indexOf(space.id)
      assert.ok(labelIndex >= 0, `missing human label for ${space.id}`)
      assert.ok(idIndex >= 0, `missing semantic ID ${space.id}`)
    }
  })

  test('retains every numeric opening at its owned precision', () => {
    for (const opening of context.result.house.derived.openings) {
      const plan = opening.levelId === 'GROUND' ? set.groundFloor : set.firstFloor
      assert.match(plan, new RegExp(`data-entity="${opening.id}"`))
      assert.match(plan, new RegExp(`data-width-authority="${opening.width.kind}"`))
    }
  })

  test('shows qualitative opening obligations without inventing a point location', () => {
    for (const relationship of context.source.qualitativeOpeningRelationships) {
      const plan = relationship.levelId === 'GROUND' ? set.groundFloor : set.firstFloor
      const start = plan.indexOf(`data-entity="${relationship.id}"`)
      assert.ok(start >= 0, `missing ${relationship.id}`)
      const fragment = plan.slice(start, start + 500)
      assert.match(fragment, /data-authority="qualitative"/)
      assert.match(fragment, /data-geometry="unresolved"/)
      assert.doesNotMatch(fragment, /data-width=/)
    }
  })

  test('shows every required adjacency as an unresolved connection obligation', () => {
    for (const adjacency of context.source.requiredAdjacencies) {
      const plan = adjacency.levelId === 'GROUND' ? set.groundFloor : set.firstFloor
      assert.match(plan, new RegExp(`data-entity="${adjacency.id}"`))
      assert.match(plan, /connection required · position unresolved/)
    }
  })

  test('keeps planning information explicit without manufacturing wall or stair construction', () => {
    assert.match(set.groundFloor, /Wall family 400–425 mm; stress 450 mm/)
    assert.match(set.groundFloor, /Stair 18 rises · 6\/6\/6 · going 280 mm/)
    assert.match(set.groundFloor, /reservation 2400–2500 mm/)
    assert.match(set.groundFloor, /wall faces not represented/i)
    assert.match(set.principalSection, /No strings, treads, guards, headroom, floor build-up or exact well geometry is implied/)
  })

  test('renders the full section datum text inside a deliberately enlarged annotation layout', () => {
    assert.match(set.principalSection, /outer cornice\/eaves control \+6250 mm/)
    const viewBox = set.principalSection.match(/viewBox="([^"]+)"/)
    assert.ok(viewBox)
    const [x, , width] = viewBox[1].split(' ').map(Number)
    assert.ok(x + width >= context.result.house.derived.shell.depth + 3900)
  })

  test('is deterministic and committed successor SVGs are exact renderer outputs', () => {
    assert.equal(renderReferenceHousePlan(context, 'GROUND'), set.groundFloor)
    assert.equal(renderReferenceHousePlan(context, 'FIRST'), set.firstFloor)
    assert.equal(renderReferenceHousePrincipalSection(context), set.principalSection)

    assert.equal(readFileSync(REFERENCE_HOUSE_OUTPUTS.groundFloorPlan.path, 'utf8'), set.groundFloor)
    assert.equal(readFileSync(REFERENCE_HOUSE_OUTPUTS.firstFloorPlan.path, 'utf8'), set.firstFloor)
    assert.equal(readFileSync(REFERENCE_HOUSE_OUTPUTS.principalSection.path, 'utf8'), set.principalSection)
  })

  test('does not overwrite the six CH-frozen historical artefacts', () => {
    for (const path of [
      'docs/reference-house/rhc1-ground-floor.svg',
      'docs/reference-house/rhc1-first-floor.svg',
      'docs/reference-house/rhc1-principal-section.svg',
      'docs/reference-house/rhc2-structural-topology.svg',
      'docs/reference-house/rhc3-service-topology.svg',
      'docs/reference-house/rhc4-boundary-topology.svg'
    ]) {
      assert.ok(readFileSync(path, 'utf8').startsWith('<svg'))
    }
  })
})
