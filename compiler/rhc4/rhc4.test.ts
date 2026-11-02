import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { renderBoundaryTopologySvg } from '../boundary-slice/drawing.js'
import type { BoundaryTopologyCompileResult } from '../boundary-slice/model.js'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { compileReferenceHouseServiceView } from '../rhc3/compile.js'
import { mm } from '../units.js'
import { compileReferenceHouseBoundaryView } from './compile.js'
import { cloneReferenceHouseBoundarySource, createReferenceHouseBoundarySource } from './fixture.js'

const codes = (result: BoundaryTopologyCompileResult): string[] =>
  result.diagnostics.map((item) => item.code)

const sourceFor = (house = createReferenceHouseSource()) => {
  const c3 = compileReferenceHouseServiceView(house)
  return createReferenceHouseBoundarySource(house, c3.c2.plan, c3.services)
}

describe('RH-C4 bounded envelope / boundary view', () => {
  test('compiles the coordinated envelope topology without claiming building-physics performance', () => {
    const result = compileReferenceHouseBoundaryView(createReferenceHouseSource())

    assert.equal(result.status, 'PASS')
    assert.equal(result.c3.status, 'PASS')
    assert.equal(result.boundaries.status, 'PASS')
    assert.deepEqual(result.boundaries.diagnostics, [])
    assert.deepEqual(result.proofBoundary, {
      topology: 'MACHINE-CHECKED',
      performance: 'EXTERNAL-NOT-PROVED'
    })
    assert.equal(result.boundaries.derived.systems.length, 4)
    assert.equal(result.boundaries.derived.systems.every((item) => item.connected), true)
  })

  test('keeps weather, air, thermal and moisture as independent boundary systems', () => {
    const result = compileReferenceHouseBoundaryView(createReferenceHouseSource()).boundaries
    assert.deepEqual(
      result.derived.systems.map((item) => item.role).sort(),
      ['air', 'moisture', 'thermal', 'weather']
    )
    assert.equal(result.derived.carriers.length, 16)
    assert.equal(result.derived.carriers.every((item) => item.critical && !item.removable), true)
  })

  test('turns every numeric and qualitative enclosure opening into an explicit boundary obligation', () => {
    const result = compileReferenceHouseBoundaryView(createReferenceHouseSource()).boundaries
    const numeric = result.derived.openingObligations.filter((item) => item.openingRefKind === 'numeric')
    const qualitative = result.derived.openingObligations.filter((item) => item.openingRefKind === 'qualitative')

    assert.equal(numeric.length, 12)
    assert.equal(qualitative.length, 6)
    assert.equal(result.derived.openingObligations.every((item) => item.roles.length === 4), true)
    assert.ok(qualitative.some((item) => item.openingRefId === 'RHCF-GARDEN-CENTRE-G'))
    assert.ok(qualitative.some((item) => item.openingRefId === 'RHCF-COURT-E-U'))
  })

  test('preserves courtyard threshold duties without inventing exact opening width', () => {
    const result = compileReferenceHouseBoundaryView(createReferenceHouseSource()).boundaries
    const south = result.derived.openingObligations.find((item) => item.openingRefId === 'G-COURT-SOUTH-O01')
    const north = result.derived.openingObligations.find((item) => item.openingRefId === 'G-COURT-NORTH-O01')
    assert.ok(south)
    assert.ok(north)
    assert.ok(south.obligations.includes('THRESHOLD-DRAINAGE-MOVEMENT-AND-ACCESSIBILITY'))
    assert.ok(north.obligations.includes('THRESHOLD-DRAINAGE-MOVEMENT-AND-ACCESSIBILITY'))
    assert.equal(result.derived.openingObligations.find((item) => item.openingRefId === 'RHCF-GARDEN-CENTRE-G')?.openingRefKind, 'qualitative')
  })

  test('carries selected wall, roof and foundation service crossings into boundary reinstatement obligations', () => {
    const result = compileReferenceHouseBoundaryView(createReferenceHouseSource()).boundaries
    assert.deepEqual(
      result.derived.serviceObligations.map((item) => item.serviceCrossingId).sort(),
      ['PEN-FD-01', 'PEN-HS-01', 'PEN-KX-01', 'PEN-MV-01', 'PEN-PV-01', 'PEN-SV-RF-01', 'PEN-UE-01']
    )
    assert.equal(result.derived.serviceObligations.every((item) => item.roles.length === 4), true)
    assert.equal(result.derived.serviceObligations.some((item) => item.serviceCrossingId === 'PEN-BX-01'), false)
  })

  test('represents RH-08 drainage as four outward roof fields plus independent courtyard primary and emergency routes', () => {
    const result = compileReferenceHouseBoundaryView(createReferenceHouseSource())
    const routes = result.boundaries.derived.drainageRoutes
    const roof = routes.filter((item) => item.kind === 'roof-field')

    assert.equal(roof.length, 4)
    assert.equal(roof.every((item) => item.direction === 'outward' && item.visibleFailure), true)
    assert.equal(routes.filter((item) => item.kind === 'courtyard-primary').length, 1)
    assert.equal(routes.filter((item) => item.kind === 'courtyard-emergency').length, 1)
    assert.notEqual(
      routes.find((item) => item.kind === 'courtyard-primary')?.to,
      routes.find((item) => item.kind === 'courtyard-emergency')?.to
    )
  })

  test('derives RH-08 plan catchments from the same shell/courtyard geometry and closes them to the enclosed plate', () => {
    const result = compileReferenceHouseBoundaryView(createReferenceHouseSource())
    const byId = new Map(result.coordination.roofCatchments.map((item) => [item.id, item.planArea]))

    assert.equal(byId.get('SOUTH'), 26_520_000)
    assert.equal(byId.get('NORTH'), 26_520_000)
    assert.equal(byId.get('WEST'), 31_080_000)
    assert.equal(byId.get('EAST'), 31_080_000)
    assert.equal(result.coordination.roofCatchmentTotal, 115_200_000)
    assert.equal(result.coordination.enclosedPlateArea, 115_200_000)
    assert.equal(result.coordination.courtyardOpenSkyArea, 14_400_000)
    assert.equal(result.coordination.wallPlanningStressThicknessMm, 450)
  })

  test('propagates a courtyard-width change into roof catchments instead of preserving stale RH-08 numbers', () => {
    const house = createReferenceHouseSource()
    house.court.value.width = mm(4000)
    const result = compileReferenceHouseBoundaryView(house)

    assert.equal(result.status, 'PASS')
    assert.equal(result.coordination.roofCatchmentTotal, result.coordination.enclosedPlateArea)
    assert.notEqual(result.coordination.roofCatchments.find((item) => item.id === 'SOUTH')?.planArea, 26_520_000)
    assert.notEqual(result.coordination.roofCatchments.find((item) => item.id === 'WEST')?.planArea, 31_080_000)
  })

  test('fails when a critical environmental boundary is placed on a routinely removable carrier', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseBoundarySource(sourceFor(house))
    source.carriers.find((item) => item.id === 'AIR-OUTER')!.removable = true

    const result = compileReferenceHouseBoundaryView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.boundaries).includes('CRITICAL_BOUNDARY_ON_REMOVABLE_CARRIER'))
  })

  test('fails when an environmental carrier is mapped onto an internal planning partition', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseBoundarySource(sourceFor(house))
    source.carriers.find((item) => item.id === 'THM-OUTER')!.planBoundaryIds.push('G-HALL-WEST-B')

    const result = compileReferenceHouseBoundaryView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.boundaries).includes('BOUNDARY_CARRIER_ON_INTERNAL_PARTITION'))
  })

  test('fails when one boundary system loses continuity between its carriers', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseBoundarySource(sourceFor(house))
    for (const id of ['INT-AIR-OUTER-ROOF', 'INT-AIR-OUTER-GROUND']) {
      source.transitions = source.transitions.filter((item) => item.id !== id)
      source.systems.find((item) => item.id === 'BND-AIR-01')!.transitionIds =
        source.systems.find((item) => item.id === 'BND-AIR-01')!.transitionIds.filter((candidate) => candidate !== id)
    }

    const result = compileReferenceHouseBoundaryView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.boundaries).includes('BOUNDARY_SYSTEM_DISCONNECTED'))
  })

  test('fails when a numeric architectural opening disappears from the boundary graph', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseBoundarySource(sourceFor(house))
    source.transitions = source.transitions.filter((item) => item.openingId !== 'G-FRONT-W01')
    for (const system of source.systems) system.transitionIds = system.transitionIds.filter((id) => id !== 'INT-OPEN-G-FRONT-W01')

    const result = compileReferenceHouseBoundaryView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.boundaries).includes('ENVELOPE_OPENING_UNACCOUNTED'))
  })

  test('fails when an opening transition is assigned to the wrong architectural host', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseBoundarySource(sourceFor(house))
    source.transitions.find((item) => item.openingId === 'G-FRONT-W01')!.hostPlanBoundaryId = 'G-OUTER-NORTH'

    const result = compileReferenceHouseBoundaryView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.boundaries).includes('BOUNDARY_OPENING_HOST_MISMATCH'))
  })

  test('fails when a deliberately qualitative opening loses its boundary obligation', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseBoundarySource(sourceFor(house))
    const transitionId = 'INT-QOPEN-RHCF-GARDEN-CENTRE-G'
    source.transitions = source.transitions.filter((item) => item.id !== transitionId)
    for (const system of source.systems) system.transitionIds = system.transitionIds.filter((id) => id !== transitionId)

    const result = compileReferenceHouseBoundaryView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.boundaries).includes('RH_QUALITATIVE_OPENING_BOUNDARY_OBLIGATION_MISSING'))
  })

  test('fails when a selected wall service penetration disappears from the boundary graph', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseBoundarySource(sourceFor(house))
    const transitionId = 'INT-SVC-PEN-MV-01'
    source.transitions = source.transitions.filter((item) => item.id !== transitionId)
    for (const system of source.systems) system.transitionIds = system.transitionIds.filter((id) => id !== transitionId)

    const result = compileReferenceHouseBoundaryView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.boundaries).includes('ENVELOPE_SERVICE_CROSSING_UNACCOUNTED'))
  })

  test('fails when a selected roof penetration disappears from RH-C4', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseBoundarySource(sourceFor(house))
    const transitionId = 'INT-ROOF-SVC-PEN-SV-RF-01'
    source.transitions = source.transitions.filter((item) => item.id !== transitionId)
    for (const system of source.systems) system.transitionIds = system.transitionIds.filter((id) => id !== transitionId)

    const result = compileReferenceHouseBoundaryView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.boundaries).includes('RH_SELECTED_ENVELOPE_SERVICE_CROSSING_MISSING'))
  })

  test('fails if the fallback direct bathroom extract is promoted into the active envelope topology', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseBoundarySource(sourceFor(house))
    source.transitions.push({
      id: 'INT-SVC-PEN-BX-01',
      kind: 'service-penetration',
      carrierIds: ['WEA-OUTER', 'AIR-OUTER', 'THM-OUTER', 'MOI-OUTER'],
      hostPlanBoundaryId: 'U-OUTER-EAST',
      serviceCrossingId: 'PEN-BX-01',
      obligations: ['fallback-should-not-be-active'],
      provisional: true
    })

    const result = compileReferenceHouseBoundaryView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.boundaries).includes('BOUNDARY_USES_UNSELECTED_SERVICE_CROSSING'))
    assert.ok(codes(result.boundaries).includes('RH_FALLBACK_BATHROOM_EXTRACT_PROMOTED'))
  })

  test('fails when a roof drainage field turns inward toward the courtyard', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseBoundarySource(sourceFor(house))
    source.drainageRoutes.find((item) => item.id === 'RW-ROOF-SOUTH')!.direction = 'service-side'

    const result = compileReferenceHouseBoundaryView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.boundaries).includes('ROOF_DRAINAGE_NOT_OUTWARD'))
  })

  test('fails when the independent courtyard emergency overflow is deleted', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseBoundarySource(sourceFor(house))
    source.drainageRoutes = source.drainageRoutes.filter((item) => item.kind !== 'courtyard-emergency')

    const result = compileReferenceHouseBoundaryView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.boundaries).includes('RH_COURTYARD_DRAINAGE_REDUNDANCY_MISSING'))
  })

  test('fails when courtyard primary and emergency routes collapse onto one destination', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseBoundarySource(sourceFor(house))
    const primary = source.drainageRoutes.find((item) => item.kind === 'courtyard-primary')!
    source.drainageRoutes.find((item) => item.kind === 'courtyard-emergency')!.to = primary.to

    const result = compileReferenceHouseBoundaryView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.boundaries).includes('RH_COURTYARD_OVERFLOW_NOT_INDEPENDENT'))
  })

  test('fails when a drainage route hides its failure behaviour', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseBoundarySource(sourceFor(house))
    source.drainageRoutes.find((item) => item.id === 'RW-ROOF-EAST')!.visibleFailure = false

    const result = compileReferenceHouseBoundaryView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.boundaries).includes('DRAINAGE_FAILURE_NOT_VISIBLE'))
  })

  test('preserves an upstream architectural REVIEW instead of allowing boundary coherence to erase it', () => {
    const house = createReferenceHouseSource()
    house.court.value.depth = mm(4400)
    const result = compileReferenceHouseBoundaryView(house)

    assert.equal(result.c3.status, 'REVIEW')
    assert.equal(result.boundaries.status, 'PASS')
    assert.equal(result.status, 'REVIEW')
  })

  test('renders a deterministic non-spatial boundary view and refuses failed topology', () => {
    const house = createReferenceHouseSource()
    const baseline = compileReferenceHouseBoundaryView(house)
    const first = renderBoundaryTopologySvg(baseline.boundaries, 'RH-C4 envelope / boundary topology')
    const second = renderBoundaryTopologySvg(baseline.boundaries, 'RH-C4 envelope / boundary topology')

    assert.equal(first, second)
    assert.match(first, /BOUNDARY TOPOLOGY ONLY/)
    assert.match(first, /data-entity="AIR-OUTER"/)
    assert.match(first, /RW-COURT-EMERGENCY/)
    assert.match(first, /U-values/)

    const source = cloneReferenceHouseBoundarySource(sourceFor(house))
    source.carriers.find((item) => item.id === 'WEA-OUTER')!.removable = true
    const broken = compileReferenceHouseBoundaryView(house, source)
    assert.equal(broken.boundaries.status, 'FAIL')
    assert.throws(
      () => renderBoundaryTopologySvg(broken.boundaries, 'broken'),
      /Cannot render failed boundary topology/
    )
  })

  test('does not smuggle thermal, moisture or airtightness performance claims into the C4 source contract', () => {
    const serialized = JSON.stringify(sourceFor())
    for (const forbidden of [
      'uValue',
      'psiValue',
      'thermalConductivity',
      'dewPoint',
      'condensationRisk',
      'airPermeability',
      'watertightnessClass',
      'fireResistanceMinutes',
      'acousticRw'
    ]) assert.equal(serialized.includes(forbidden), false, forbidden)
  })
})
