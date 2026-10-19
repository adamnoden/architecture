import assert from 'node:assert/strict'
import test from 'node:test'

import { createReferenceHouseSource } from './fixture.js'
import { referenceHouseCourtGeometry } from './plan-adapter.js'
import {
  createSectionalAxonometricViewSpec,
  type AxonometricVector3
} from './publication-sectional-axonometric-view.js'

const dot = (a: AxonometricVector3, b: AxonometricVector3): number =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

const length = (value: AxonometricVector3): number => Math.sqrt(dot(value, value))

const cross = (a: AxonometricVector3, b: AxonometricVector3): AxonometricVector3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
]

const near = (a: number, b: number, tolerance = 1e-12): boolean => Math.abs(a - b) <= tolerance

test('DRW-09A derives the hero cut from the controlled south courtyard edge', () => {
  const house = createReferenceHouseSource()
  const court = referenceHouseCourtGeometry(house)
  const view = createSectionalAxonometricViewSpec()

  assert.equal(view.scale, 'NTS')
  assert.equal(view.pageClass, 'PLATE_SPREAD')
  assert.deepEqual(view.cut, {
    axis: 'y',
    coordinate: court.y0,
    derivedFrom: 'COURT_SOUTH',
    keep: 'north'
  })
  assert.equal(view.cut.coordinate, 3400)
})

test('DRW-09A freezes a deterministic right-handed parallel isometric basis', () => {
  const { projection } = createSectionalAxonometricViewSpec()
  const { horizontalBasis: u, verticalBasis: v, viewDirection: d } = projection

  assert.equal(projection.kind, 'parallel-isometric')
  assert.equal(projection.viewer, 'south-east-elevated')
  assert.ok(near(length(u), 1))
  assert.ok(near(length(v), 1))
  assert.ok(near(length(d), 1))
  assert.ok(near(dot(u, v), 0))
  assert.ok(near(dot(u, d), 0))
  assert.ok(near(dot(v, d), 0))

  const uv = cross(u, v)
  assert.ok(near(uv[0], d[0]))
  assert.ok(near(uv[1], d[1]))
  assert.ok(near(uv[2], d[2]))

  assert.ok(d[0] > 0, 'viewer must remain east of the house')
  assert.ok(d[1] < 0, 'viewer must remain south of the house')
  assert.ok(d[2] > 0, 'viewer must remain elevated')
})

test('DRW-09A admits synthesis without reopening absent construction geometry', () => {
  const view = createSectionalAxonometricViewSpec()

  assert.equal(view.admission, 'OPTIONAL_ADMITTED_BOUNDED_SYNTHESIS')
  assert.equal(view.geometryPolicy.replaceableLayers, 'SEMANTIC_ANNOTATION_ONLY_NO_UNEARNED_THICKNESS')
  assert.equal(view.geometryPolicy.openings, 'ONLY_WHEN_COMPLETE_3D_AUTHORITY_EXISTS_IN_ONE_SOURCE_FAMILY')
  assert.equal(view.geometryPolicy.viewLocalProxyComposition, 'FORBIDDEN')
  assert.ok(view.explicitAbsences.includes('construction-layer-thicknesses'))
  assert.ok(view.explicitAbsences.includes('complete-window-and-door-solids'))
  assert.ok(view.explicitAbsences.includes('furniture-people-landscape'))
})
