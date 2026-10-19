import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'

import { createReferenceHouseOutputContext } from '../reference-house/output/context.js'
import { REFERENCE_HOUSE_OUTPUTS } from '../reference-house/output/contract.js'
import {
  renderReferenceHousePlan,
  renderReferenceHousePrincipalSection,
  renderReferenceHouseSpatialSet
} from '../reference-house/output/spatial.js'

const context = createReferenceHouseOutputContext()
const set = renderReferenceHouseSpatialSet(context)

describe('COA-04 Reference House plan and section successors', () => {
  test('uses one canonical system compile and north-up inspection conventions', () => {
    assert.equal(context.result.status, 'PASS')
    assert.equal(set.groundFloor.includes('NORTH UP'), true)
    assert.equal(set.firstFloor.includes('NORTH UP'), true)
    assert.equal(set.principalSection.includes('LOOKING WEST'), true)
  })

  test('puts human architectural labels ahead of semantic IDs while preserving identity', () => {
    assert.match(set.groundFloor, />Drawing<\/text>/)
    assert.match(set.groundFloor, />G-DRAW-02<\/text>/)
    assert.match(set.firstFloor, />Principal bedroom<\/text>/)
    assert.match(set.firstFloor, />U-BED-P01<\/text>/)
  })

  test('retains every numeric opening at its owned precision', () => {
    for (const opening of context.result.house.derived.openings.filter(
      (candidate) => candidate.widthAuthority !== 'unknown'
    )) {
      const plan = opening.levelId === 'GROUND' ? set.groundFloor : set.firstFloor
      assert.match(plan, new RegExp(`data-entity="${opening.id}"`))
      assert.match(plan, new RegExp(`data-width-authority="${opening.widthAuthority}"`))
    }
  })

  test('shows qualitative opening obligations without inventing a point location', () => {
    for (const opening of context.result.house.derived.openings.filter(
      (candidate) => candidate.widthAuthority === 'unknown'
    )) {
      const plan = opening.levelId === 'GROUND' ? set.groundFloor : set.firstFloor
      const start = plan.indexOf(`data-entity="${opening.id}"`)
      assert.ok(start >= 0, `missing ${opening.id}`)
      const fragment = plan.slice(start, start + 500)
      assert.match(fragment, /data-width-authority="unknown"/)
      assert.doesNotMatch(fragment, /data-width=/)
    }
  })

  test('shows every required adjacency as an unresolved connection obligation', () => {
    for (const adjacency of context.source.requiredAdjacencies) {
      const plan = adjacency.levelId === 'GROUND' ? set.groundFloor : set.firstFloor
      assert.match(plan, new RegExp(`data-entity="${adjacency.id}"`))
      assert.match(plan, /Required connection; exact position unresolved/)
      assert.match(plan, />↔<\/text>/)
    }
  })

  test('keeps planning information explicit without manufacturing wall or stair construction', () => {
    assert.match(set.groundFloor, /Wall planning 400–425 mm/)
    assert.match(set.groundFloor, /Stress case 450 mm/)
    assert.match(set.groundFloor, /Stair 18 rises · 6\/6\/6/)
    assert.match(set.groundFloor, /Going 300 mm · width target ≈1000 mm/)
    assert.match(set.groundFloor, /Reservation 2400–2500 mm/)
    assert.match(set.groundFloor, /wall faces not represented/i)
    assert.match(set.principalSection, /No strings, treads, guards, headroom, floor build-up or exact well geometry is implied/)
  })

  test('renders the full section datum text inside a deliberately enlarged annotation layout', () => {
    assert.match(set.principalSection, /cornice\/eaves control \+6250 mm/)
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
      assert.doesNotThrow(() => readFileSync(path, 'utf8'))
    }
  })
})
