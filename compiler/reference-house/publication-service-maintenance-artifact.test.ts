import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  PUBLICATION_FIRST_SERVICE_MAINTENANCE_PATH,
  PUBLICATION_GROUND_SERVICE_MAINTENANCE_PATH,
  renderCanonicalFirstServiceMaintenanceOverlay,
  renderCanonicalGroundServiceMaintenanceOverlay
} from './generate-publication-service-maintenance-overlays.js'

test('DRW-10F recovered service-maintenance artifacts are deterministic canonical renders', () => {
  const ground = renderCanonicalGroundServiceMaintenanceOverlay()
  const first = renderCanonicalFirstServiceMaintenanceOverlay()

  assert.equal(renderCanonicalGroundServiceMaintenanceOverlay(), ground)
  assert.equal(renderCanonicalFirstServiceMaintenanceOverlay(), first)
  assert.equal(readFileSync(PUBLICATION_GROUND_SERVICE_MAINTENANCE_PATH, 'utf8'), ground)
  assert.equal(readFileSync(PUBLICATION_FIRST_SERVICE_MAINTENANCE_PATH, 'utf8'), first)
})

test('DRW-10F recovered pair retains bounded host-space semantics', () => {
  const ground = renderCanonicalGroundServiceMaintenanceOverlay()
  const first = renderCanonicalFirstServiceMaintenanceOverlay()

  for (const svg of [ground, first]) {
    assert.match(svg, /width="136mm" height="145mm"/)
    assert.match(svg, /data-scale-denominator="100"/)
    assert.match(svg, /data-overlay="service-maintenance-geography"/)
    assert.doesNotMatch(svg, /data-role="service-route-centreline"/)
  }
  assert.match(ground, /host-space-field-not-service-route/)
  assert.match(first, /REMOVED_RATHER_THAN_ADD_SECOND_PERMANENT_STACK/)
})
