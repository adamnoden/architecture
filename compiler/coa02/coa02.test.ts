import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'

import { REFERENCE_HOUSE_OUTPUTS } from '../reference-house/output/contract.js'
import { createReferenceHouseOutputContext } from '../reference-house/output/context.js'
import { renderBoundaryRegisterMarkdown, renderServiceRegisterMarkdown } from '../reference-house/output/reports.js'

describe('COA-02 non-spatial report extraction', () => {
  const context = createReferenceHouseOutputContext()
  const service = renderServiceRegisterMarkdown(context)
  const boundary = renderBoundaryRegisterMarkdown(context)

  test('renders service topology as an ordinary deterministic report', () => {
    assert.match(service, /^# Reference House — service topology register/m)
    assert.match(service, /\| Network \| Service class \| Semantic route \|/)
    assert.match(service, /## Selected crossings/)
    assert.match(service, /## Maintenance and access obligations/)
    assert.match(service, /Sizing, pressure loss, airflow, acoustics/)
    assert.doesNotMatch(service, /<svg/)
    assert.equal(renderServiceRegisterMarkdown(context), service)

    for (const route of context.result.services.derived.routes) {
      assert.match(service, new RegExp(route.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    }
  })

  test('renders boundary topology as ordinary registers while retaining directional drainage', () => {
    assert.match(boundary, /^# Reference House — envelope \/ boundary topology register/m)
    assert.match(boundary, /## Boundary carriers/)
    assert.match(boundary, /## Typed transitions/)
    assert.match(boundary, /## Directional drainage routes/)
    assert.match(boundary, /U-values, ψ-values, condensation/)
    assert.doesNotMatch(boundary, /<svg/)
    assert.equal(renderBoundaryRegisterMarkdown(context), boundary)

    for (const carrier of context.result.boundary.derived.carriers) assert.match(boundary, new RegExp(carrier.id))
    for (const route of context.result.boundary.derived.drainageRoutes) assert.match(boundary, new RegExp(route.id))
  })

  test('committed reports are exact renderer outputs from the canonical system compile', () => {
    assert.equal(readFileSync(REFERENCE_HOUSE_OUTPUTS.serviceRegister.path, 'utf8'), service)
    assert.equal(readFileSync(REFERENCE_HOUSE_OUTPUTS.boundaryRegister.path, 'utf8'), boundary)
  })

  test('keeps old report-shaped SVGs as historical evidence rather than overwriting them', () => {
    assert.ok(readFileSync('docs/reference-house/rhc3-service-topology.svg', 'utf8').startsWith('<svg'))
    assert.ok(readFileSync('docs/reference-house/rhc4-boundary-topology.svg', 'utf8').startsWith('<svg'))
    assert.notEqual(REFERENCE_HOUSE_OUTPUTS.serviceRegister.path, 'docs/reference-house/rhc3-service-topology.svg')
    assert.notEqual(REFERENCE_HOUSE_OUTPUTS.boundaryRegister.path, 'docs/reference-house/rhc4-boundary-topology.svg')
  })
})
