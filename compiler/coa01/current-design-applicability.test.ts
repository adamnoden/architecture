import assert from 'node:assert/strict'
import test from 'node:test'
import { requireGeorgianDesignBasis } from '../reference-house/current-design/georgian-source.js'
import { createReferenceHouseOutputContext } from '../reference-house/output/context.js'

test('the historical output default cannot fill a missing Georgian input', () => {
  const historical = createReferenceHouseOutputContext()
  assert.equal(historical.result.status, 'PASS')
  assert.throws(() => requireGeorgianDesignBasis(historical.source), /design: expected exactly/)
  assert.throws(() => requireGeorgianDesignBasis(undefined), /expected a JSON object/)
})
