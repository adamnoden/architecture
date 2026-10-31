import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  PUBLICATION_FIRST_SERVICE_MAINTENANCE_PATH,
  PUBLICATION_GROUND_SERVICE_MAINTENANCE_PATH,
  renderCanonicalFirstServiceMaintenanceOverlay,
  renderCanonicalGroundServiceMaintenanceOverlay
} from './generate-publication-service-maintenance-overlays.js'

const cases = [
  {
    name: 'ground',
    path: PUBLICATION_GROUND_SERVICE_MAINTENANCE_PATH,
    render: renderCanonicalGroundServiceMaintenanceOverlay,
    viewId: 'REFERENCE-HOUSE-GROUND-SERVICE-MAINTENANCE-OVERLAY'
  },
  {
    name: 'first-floor',
    path: PUBLICATION_FIRST_SERVICE_MAINTENANCE_PATH,
    render: renderCanonicalFirstServiceMaintenanceOverlay,
    viewId: 'REFERENCE-HOUSE-FIRST-SERVICE-MAINTENANCE-OVERLAY'
  }
] as const

for (const fixture of cases) {
  test(`DRW-10B.1 committed ${fixture.name} service-maintenance SVG is the deterministic canonical render`, () => {
    const first = fixture.render()
    const second = fixture.render()

    assert.equal(first, second)
    assert.equal(readFileSync(fixture.path, 'utf8'), first)
    assert.match(first, new RegExp(`data-view-id="${fixture.viewId}"`))
    assert.match(first, /width="136mm" height="145mm"/)
    assert.match(first, /data-scale-denominator="100"/)
  })
}

test('DRW-10B.1 frozen service-maintenance pair preserves host geography without fabricated routes', () => {
  const ground = renderCanonicalGroundServiceMaintenanceOverlay()
  const first = renderCanonicalFirstServiceMaintenanceOverlay()

  assert.match(ground, /host-space-field-not-service-route/)
  assert.match(first, /host-space-field-not-service-route/)
  assert.match(first, /REMOVED_RATHER_THAN_ADD_SECOND_PERMANENT_STACK/)
  assert.match(ground, /ABSENT_TECHNICAL/)
  assert.match(first, /ABSENT_TECHNICAL/)
})
