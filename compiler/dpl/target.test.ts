import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { loadTargetSlice } from './load.js'
import { validateTargetSlice } from './target.js'

const target = () => ({
  schemaVersion: 'dpl.londonStrategicPlanningSlice.v1', id: 'TEST',
  methodClasses: [{ id: 'NATIVE', kind: 'NATIVE_DETERMINISTIC' }],
  sourceSnapshots: [{ id: 'SOURCE' }],
  obligations: [{ id: 'LON-D6-GIA-STORAGE', sourceSnapshot: 'SOURCE', title: 'Space', applicability: 'APPLIES', resolutionMethod: 'NATIVE' }],
  spaceTable: [{ bedrooms: 4, bedspaces: 6, storeys: 2, minGIA: 130, minBuiltInStorage: 3 }]
})

test('file admission rejects malformed space table before it can reach evaluator array APIs', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dpl-target-'))
  try {
    const path = join(dir, 'target.json')
    writeFileSync(path, JSON.stringify({ ...target(), spaceTable: {} }))
    assert.throws(() => loadTargetSlice(path, 'LONDON_STRATEGIC_PLANNING'), /spaceTable must be an array/)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('consumed nested values and duplicate identities are checked at admission', () => {
  const invalid = [
    { ...target(), spaceTable: [{ ...target().spaceTable[0], minGIA: NaN }] },
    { ...target(), spaceTable: [{ ...target().spaceTable[0], bedspaces: 1.5 }] },
    { ...target(), spaceTable: [target().spaceTable[0], target().spaceTable[0]] },
    { ...target(), methodClasses: [target().methodClasses[0], target().methodClasses[0]] },
    { ...target(), sourceSnapshots: [{ id: 'SOURCE' }, { id: 'SOURCE' }] },
    { ...target(), obligations: [target().obligations[0], target().obligations[0]] },
    { ...target(), obligations: [{ ...target().obligations[0], sourceSnapshot: 'MISSING' }] },
    { ...target(), obligations: [{ ...target().obligations[0], requiredInputs: [42] }] },
    { ...target(), obligations: [{ ...target().obligations[0], deterministicApplicabilityRule: { input: 'fact' } }] },
    { ...target(), obligations: [{ ...target().obligations[0], crossTargetOutput: {} }] }
  ]
  for (const value of invalid) assert.throws(() => validateTargetSlice(value, 'probe.json'), /Target probe.json/)
})

test('metadata and future method kinds remain intact rather than being silently narrowed', () => {
  const source = { ...target(), metadata: { provenance: 'authored' }, methodClasses: [{ id: 'NATIVE', kind: 'FUTURE_METHOD' }] }
  assert.equal(validateTargetSlice(source, 'future.json'), source)
})
