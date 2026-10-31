import assert from 'node:assert/strict'
import test from 'node:test'

import { createFutureAdaptationPublicationSource } from './publication-future-adaptation-source.js'

test('DRW-10E.1 source exposes only the audited entrance-storey adaptation meanings', () => {
  const source = createFutureAdaptationPublicationSource()

  assert.equal(source.view.substrate, 'REFERENCE-HOUSE-GROUND-PLAN')
  assert.equal(source.view.scale, 100)
  assert.equal(source.sleeping.value.spaceId, 'G-FAM-02')
  assert.equal(source.sleeping.value.sourceStatus, 'PROVISIONAL')
  assert.deepEqual(source.route.value.spaceIds, ['G-HALL-02', 'G-GAL-01'])
  assert.equal(source.sanitary.value.spaceId, 'G-SVC-02')
  assert.equal(source.sanitary.value.sourceStatus, 'FROZEN_GROSS_GEOGRAPHY_ONLY')
  assert.equal(source.comparator.value, 'M4(2)-informed-comparator-no-compliance-claim')
})

test('DRW-10E.1 source keeps unmodelled adaptation geometry explicitly absent', () => {
  const { absences } = createFutureAdaptationPublicationSource()

  assert.deepEqual(absences, {
    bedGeometry: 'ABSENT',
    routeCentreline: 'ABSENT',
    finishedRouteClearWidth: 'NOT_MODELLED',
    doorwayManoeuvres: 'NOT_MODELLED',
    thresholds: 'NOT_MODELLED',
    siteApproach: 'NOT_MODELLED_SITE_BOUND',
    exactSanitarySubdivision: 'ABSENT',
    wcFixtureGeometry: 'NOT_MODELLED',
    showerGeometry: 'NOT_MODELLED',
    drainage: 'NOT_MODELLED_TECHNICAL',
    showerControls: 'NOT_MODELLED',
    supportGeometry: 'NOT_MODELLED',
    dryStaging: 'NOT_MODELLED',
    accessibilityCompliance: 'NOT_CLAIMED',
    completeFallbackModeProof: 'NOT_MODELLED'
  })
})
