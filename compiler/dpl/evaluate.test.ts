import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { compileCanonicalReferenceSiteCase, evaluateCanonicalReferenceSiteCase, loadCanonicalReferenceSiteEvidence } from './canonical.js'
import { compileDeploymentCase } from './compile.js'
import { evaluateDeploymentCase } from './evaluate.js'
import { loadB2InterfaceContracts, loadB2TargetComposition, loadPilotSite } from './load.js'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { referenceHouseSourceFingerprint } from '../reference-house/identity.js'

test('captured canonical evidence evaluates identically without access to the repository cwd', () => {
  const captured = loadCanonicalReferenceSiteEvidence()
  const before = structuredClone(captured)
  const expected = compileCanonicalReferenceSiteCase()
  const cwd = process.cwd(), dir = mkdtempSync(join(tmpdir(), 'dpl-evaluation-'))
  try {
    process.chdir(dir)
    assert.deepEqual(evaluateCanonicalReferenceSiteCase(captured), expected)
    assert.deepEqual(captured, before)
  } finally { process.chdir(cwd); rmSync(dir, { recursive: true, force: true }) }
})

test('deployment evaluator uses explicit source authority; default wrapper retains its result', () => {
  const input = { assuranceProfile: 'SCREENING' as const, site: loadPilotSite('DPL-RP-003'), interfaceContracts: loadB2InterfaceContracts(), targets: loadB2TargetComposition() }
  const source = createReferenceHouseSource()
  assert.deepEqual(evaluateDeploymentCase(input, source), compileDeploymentCase(input))
  const original = evaluateDeploymentCase(input, source)
  source.levels.firstFfl.id = 'ALTERNATIVE-AUTHORED-FFL'
  const changed = evaluateDeploymentCase(input, source)
  assert.equal(changed.caseIdentity.manifest.referenceHouseSourceFingerprint, referenceHouseSourceFingerprint(source))
  assert.notEqual(changed.caseIdentity.fingerprint, original.caseIdentity.fingerprint)
})
