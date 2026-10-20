import assert from 'node:assert/strict'
import test from 'node:test'

import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createFutureAdaptationOverlayScene } from './publication-future-adaptation.js'
import { createGroundFloorPublicationPlanScene } from './publication-ground-plan.js'
import { createGroundFloorPublicationPlanSource } from './publication-plan-source.js'

const compiled = () => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  if (result.status === 'FAIL') throw new Error('Reference House compile failed in DRW-10E.1 test.')
  return result
}

test('DRW-10E.1 reuses the canonical ground plan unchanged before analytical marks', () => {
  const result = compiled()
  const base = createGroundFloorPublicationPlanScene(result, createGroundFloorPublicationPlanSource())
  const scene = createFutureAdaptationOverlayScene()

  assert.equal(scene.scaleDenominator, 100)
  assert.equal(scene.viewId, 'REFERENCE-HOUSE-ENTRANCE-STOREY-FUTURE-ADAPTATION-OVERLAY')
  assert.deepEqual(scene.primitives.slice(0, base.primitives.length), base.primitives)

  const added = scene.primitives.slice(base.primitives.length)
  assert.ok(added.length > 0)
  assert.ok(added.every((primitive) => primitive.kind === 'rect' || primitive.kind === 'text'))
})

test('DRW-10E.1 uses whole owned host-space boxes and no invented route/fixture geometry', () => {
  const result = compiled()
  const scene = createFutureAdaptationOverlayScene()
  const overlay = scene.primitives.filter((primitive) => primitive.metadata?.overlay === 'future-adaptation')

  const expectedSpaceIds = ['G-FAM-02', 'G-HALL-02', 'G-GAL-01', 'G-SVC-02']
  for (const spaceId of expectedSpaceIds) {
    const space = result.derived.spaces.find((candidate) => candidate.levelId === 'GROUND' && candidate.id === spaceId)
    assert.ok(space, `missing ${spaceId}`)
    const fields = overlay.filter((primitive) => primitive.kind === 'rect' && primitive.metadata?.space === spaceId)
    assert.equal(fields.length, space.boxes.length)
  }

  assert.equal(overlay.filter((primitive) => primitive.kind === 'line').length, 0)
  assert.ok(overlay.some((primitive) => primitive.metadata?.role === 'fallback-sleeping-topological-capability'))
  assert.ok(overlay.some((primitive) => primitive.metadata?.role === 'one-level-route-territory'))
  assert.ok(overlay.some((primitive) => primitive.metadata?.role === 'sanitary-shower-adaptation-geography'))

  const entityIds = overlay.map((primitive) => primitive.id).join(' ')
  assert.doesNotMatch(entityIds, /turning-circle|bed-clearance|wc-fixture|shower-tray|route-centreline/i)

  const serialized = JSON.stringify(overlay)
  assert.match(serialized, /not-route-centreline/)
  assert.match(serialized, /NOT_CLAIMED/)
  assert.match(serialized, /ABSENT/)
  assert.match(serialized, /NOT_MODELLED/)
})
