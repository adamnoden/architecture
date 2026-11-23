import assert from 'node:assert/strict'
import test from 'node:test'
import { inspectSlabSolidCompatibility } from './current-design/structural-slab-constitutive.js'

const request = (thicknessMm = 200, membraneE = 1200, flexuralFactor = .25) => ({ thicknessMm,
  bearingCase: { masonryCase: { verticalCase: {
    plateLaw: { elasticModulusMPa: 33000, poissonRatio: .2, flexuralFactor },
    monolithicCase: { houseCase: { joinedCase: { floor: { membraneLaw: {
      elasticModulusMPa: membraneE, poissonRatio: .15, shearModulusMPa: 440,
    } } } } },
  } } },
})

test('actual separate slab laws violate the common positive modulus bound without changing the request', () => {
  const input = request(), before = structuredClone(input)
  const result = inspectSlabSolidCompatibility(input)
  assert.equal(result.status, 'common-modulus-ruled-out')
  assert.ok(Math.abs(result.ratioToNecessaryBound!-2.333441840277778) < 1e-12)
  assert.ok(Math.abs(result.ratioMm2!-23334.41840277778) < 1e-8)
  assert.equal(result.membraneIsotropicRelationMatches, false)
  assert.equal(result.commonSolidMaterialQualified, false)
  assert.equal(result.nativeConstitutiveLawUnchanged, true)
  assert.deepEqual(input, before)
})

test('thickening the whole slab cannot hide a constitutive mismatch; authored law edits recompute the bound', () => {
  const source = inspectSlabSolidCompatibility(request())
  const thicker = inspectSlabSolidCompatibility(request(250))
  if (source.status === 'unsupported' || thicker.status === 'unsupported') throw new Error('Physical controls must be supported')
  assert.equal(thicker.ratioToNecessaryBound, source.ratioToNecessaryBound)
  const changed = inspectSlabSolidCompatibility(request(200, 33000))
  assert.equal(changed.status, 'necessary-bound-not-exceeded')
  assert.equal(changed.commonSolidMaterialQualified, false)
  assert.equal(inspectSlabSolidCompatibility(request(200, 1200, 1)).status, 'common-modulus-ruled-out')
})

test('missing or nonphysical laws remain unsupported rather than supplying an equivalent solid', () => {
  for (const input of [null, {}, request(-1), request(1e200), request(200, 0), request(200, 1200, NaN)]) {
    const result = inspectSlabSolidCompatibility(input)
    assert.equal(result.status, 'unsupported')
    assert.equal(result.commonSolidMaterialQualified, false)
    assert.deepEqual(result.diagnostics, ['SLAB_SOLID_LAW/input-unsupported'])
  }
})
