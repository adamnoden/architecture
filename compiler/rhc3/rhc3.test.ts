import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { renderServiceTopologySvg } from '../service-slice/drawing.js'
import type { ServiceTopologyCompileResult } from '../service-slice/model.js'
import { mm } from '../units.js'
import { compileReferenceHouseServiceView } from './compile.js'
import { cloneReferenceHouseServiceSource, createReferenceHouseServiceSource } from './fixture.js'

const codes = (result: ServiceTopologyCompileResult): string[] =>
  result.diagnostics.map((item) => item.code)

const route = (result: ServiceTopologyCompileResult, id: string) => {
  const found = result.derived.routes.find((item) => item.id === id)
  assert.ok(found, `Expected route ${id}`)
  return found
}

describe('RH-C3 bounded service view', () => {
  test('compiles RH-06/RH-07/RH-10 topology without claiming MEP performance', () => {
    const result = compileReferenceHouseServiceView(createReferenceHouseSource())

    assert.equal(result.status, 'PASS')
    assert.equal(result.c2.status, 'PASS')
    assert.equal(result.services.status, 'PASS')
    assert.deepEqual(result.services.diagnostics, [])
    assert.deepEqual(result.proofBoundary, {
      topology: 'MACHINE-CHECKED',
      performance: 'EXTERNAL-NOT-PROVED'
    })
    assert.equal(result.services.derived.networks.length, 13)
    assert.equal(result.services.derived.networks.every((item) => item.connected), true)
  })

  test('carries the selected crossing register and keeps direct bathroom extract as fallback', () => {
    const source = createReferenceHouseServiceSource(createReferenceHouseSource())
    const selected = source.crossings.filter((item) => item.selected).map((item) => item.id).sort()

    assert.deepEqual(selected, [
      'PEN-FD-01',
      'PEN-HS-01',
      'PEN-KX-01',
      'PEN-MV-01',
      'PEN-PV-01',
      'PEN-SV-01',
      'PEN-SV-RF-01',
      'PEN-UE-01'
    ])
    assert.equal(source.crossings.find((item) => item.id === 'PEN-BX-01')?.selected, false)
    assert.equal(source.crossings.some((item) => item.id === 'PEN-CD-01'), false)
  })

  test('uses the one RH-C2 service opening for every selected vertical trunk class', () => {
    const result = compileReferenceHouseServiceView(createReferenceHouseSource()).services
    const crossing = result.derived.crossings.find((item) => item.id === 'PEN-SV-01')
    assert.ok(crossing)
    assert.equal(crossing.host.kind, 'structural-interruption')
    assert.equal(crossing.routeIds.length, 6)
    assert.deepEqual(
      crossing.routeIds.map((id) => route(result, id).serviceClass).sort(),
      ['domestic-water', 'electrical-data', 'foul', 'hydronic', 'mvhr-extract', 'mvhr-supply']
    )
  })

  test('keeps primary infrastructure out of protected principal spaces while allowing local branches', () => {
    const result = compileReferenceHouseServiceView(createReferenceHouseSource()).services
    const protectedSpaces = new Set(createReferenceHouseServiceSource(createReferenceHouseSource()).protectedPrimaryFreeSpaceIds)

    for (const item of result.derived.routes.filter((candidate) => candidate.primaryInfrastructure)) {
      assert.equal(item.hostSpaceIds.some((id) => protectedSpaces.has(id)), false)
    }
    assert.equal(route(result, 'R-MV-SUP-U-BRANCH').hostSpaceIds.includes('U-BED-P01'), true)
    assert.equal(route(result, 'R-MV-SUP-U-BRANCH').primaryInfrastructure, false)
  })

  test('makes plant, riser, stack-base and MVHR maintenance geography explicit', () => {
    const result = compileReferenceHouseServiceView(createReferenceHouseSource()).services
    const access = result.derived.access.map((item) => `${item.targetNodeId}:${item.kind}`)

    for (const expected of [
      'G-PLANT-01:working',
      'G-PLANT-01:replacement',
      'G-PLANT-01:isolation',
      'MVHR-01:working',
      'MVHR-01:replacement',
      'MVHR-01:filter-service',
      'SV-01:inspection',
      'FS-BASE-01:inspection'
    ]) assert.ok(access.includes(expected), expected)
  })

  test('fails when a required domestic-water endpoint becomes disconnected', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseServiceSource(createReferenceHouseServiceSource(house))
    source.routes = source.routes.filter((item) => item.id !== 'R-WATER-BATH')
    source.networks.find((item) => item.id === 'NET-DOMESTIC-WATER')!.routeIds =
      source.networks.find((item) => item.id === 'NET-DOMESTIC-WATER')!.routeIds.filter((id) => id !== 'R-WATER-BATH')

    const result = compileReferenceHouseServiceView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.services).includes('SERVICE_NETWORK_DISCONNECTED'))
  })

  test('fails when a vertical service trunk loses its registered structural opening', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseServiceSource(createReferenceHouseServiceSource(house))
    const water = source.routes.find((item) => item.id === 'R-WATER-RISER')!
    water.crossingIds = []
    source.crossings.find((item) => item.id === 'PEN-SV-01')!.routeIds =
      source.crossings.find((item) => item.id === 'PEN-SV-01')!.routeIds.filter((id) => id !== water.id)

    const result = compileReferenceHouseServiceView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.services).includes('STRUCTURAL_ROUTE_WITHOUT_CROSSING'))
  })

  test('fails when PEN-SV-01 no longer resolves the RH-C2 structural interruption', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseServiceSource(createReferenceHouseServiceSource(house))
    const crossing = source.crossings.find((item) => item.id === 'PEN-SV-01')!
    crossing.host = { kind: 'structural-interruption', interruptionId: 'PEN-NOT-REAL' }

    const result = compileReferenceHouseServiceView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.services).includes('SERVICE_STRUCTURAL_CROSSING_MISSING'))
  })

  test('fails if a primary dry route is moved through a protected principal room', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseServiceSource(createReferenceHouseServiceSource(house))
    source.routes.find((item) => item.id === 'R-DRY-G')!.hostSpaceIds.push('G-DRAW-02')

    const result = compileReferenceHouseServiceView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.services).includes('PRIMARY_SERVICE_IN_PROTECTED_SPACE'))
  })

  test('fails if the selected MVHR topology starts using the fallback direct bathroom crossing', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseServiceSource(createReferenceHouseServiceSource(house))
    const bathRoute = source.routes.find((item) => item.id === 'R-MV-EXT-BATH')!
    bathRoute.crossingIds.push('PEN-BX-01')
    source.crossings.find((item) => item.id === 'PEN-BX-01')!.routeIds.push(bathRoute.id)

    const result = compileReferenceHouseServiceView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.services).includes('SERVICE_ROUTE_USES_UNSELECTED_CROSSING'))
  })

  test('fails when required MVHR filter access disappears', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseServiceSource(createReferenceHouseServiceSource(house))
    source.access = source.access.filter((item) => item.id !== 'ACC-MVHR-FILTER')

    const result = compileReferenceHouseServiceView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.services).includes('SERVICE_ACCESS_OBLIGATION_MISSING'))
  })

  test('fails when a route and registered crossing disagree about ownership', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseServiceSource(createReferenceHouseServiceSource(house))
    source.crossings.find((item) => item.id === 'PEN-MV-01')!.routeIds = ['R-MV-OA']

    const result = compileReferenceHouseServiceView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.services).includes('SERVICE_CROSSING_RECIPROCITY_MISMATCH'))
  })

  test('fails when a boundary crossing is mapped to a non-existent architectural boundary', () => {
    const house = createReferenceHouseSource()
    const source = cloneReferenceHouseServiceSource(createReferenceHouseServiceSource(house))
    source.crossings.find((item) => item.id === 'PEN-KX-01')!.host = {
      kind: 'plan-boundary',
      boundaryId: 'G-OUTER-NOT-REAL'
    }

    const result = compileReferenceHouseServiceView(house, source)
    assert.equal(result.status, 'FAIL')
    assert.ok(codes(result.services).includes('SERVICE_CROSSING_BOUNDARY_MISSING'))
  })

  test('preserves upstream architectural REVIEW instead of allowing service coherence to erase it', () => {
    const house = createReferenceHouseSource()
    house.court.value.depth = mm(4400)
    const result = compileReferenceHouseServiceView(house)

    assert.equal(result.c2.status, 'REVIEW')
    assert.equal(result.services.status, 'PASS')
    assert.equal(result.status, 'REVIEW')
  })

  test('renders a deterministic non-spatial topology view and refuses failed topology', () => {
    const house = createReferenceHouseSource()
    const baseline = compileReferenceHouseServiceView(house)
    const first = renderServiceTopologySvg(baseline.services, 'RH-C3 service topology')
    const second = renderServiceTopologySvg(baseline.services, 'RH-C3 service topology')

    assert.equal(first, second)
    assert.match(first, /TOPOLOGY ONLY — NOT PLAN GEOMETRY/)
    assert.match(first, /data-entity="R-WATER-RISER"/)
    assert.match(first, /PEN-SV-01/)
    assert.match(first, /Sizing, pressure loss, airflow, acoustics/)

    const brokenSource = cloneReferenceHouseServiceSource(createReferenceHouseServiceSource(house))
    brokenSource.routes.find((item) => item.id === 'R-HYD-RISER')!.crossingIds = []
    brokenSource.crossings.find((item) => item.id === 'PEN-SV-01')!.routeIds =
      brokenSource.crossings.find((item) => item.id === 'PEN-SV-01')!.routeIds.filter((id) => id !== 'R-HYD-RISER')
    const broken = compileReferenceHouseServiceView(house, brokenSource)
    assert.equal(broken.services.status, 'FAIL')
    assert.throws(() => renderServiceTopologySvg(broken.services, 'broken'), /Refusing to render failed service topology/)
  })

  test('does not smuggle MEP sizing or performance claims into the C3 source contract', () => {
    const serialized = JSON.stringify(createReferenceHouseServiceSource(createReferenceHouseSource()))
    for (const forbidden of [
      'airflow',
      'pressureLoss',
      'fanDuty',
      'ductDiameter',
      'pipeDiameter',
      'cableSize',
      'heatLoad',
      'capacity',
      'commissionedFlow'
    ]) assert.equal(serialized.includes(forbidden), false, forbidden)
  })
})
