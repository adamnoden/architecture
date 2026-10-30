import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import type { RhDiagnostic } from '../reference-house/model.js'
import { createReferenceHouseCompileIdentity, linkReferenceHouseArtefacts } from '../reference-house/identity.js'
import { compileReferenceHouseSystem } from '../reference-house/system-compile.js'
import type { ReferenceHouseSystemCoreResult } from '../reference-house/system-compile.js'
import { privateStairGeometryMethod } from '../rhc5/method.js'
import { mm } from '../units.js'
import { buildReferenceHouseOutputManifest, buildReferenceHouseSuccessorOutputs } from '../reference-house/output/build.js'

const source = createReferenceHouseSource()
const canonical = compileReferenceHouseSystem(source)
const identity = (result: ReferenceHouseSystemCoreResult) =>
  createReferenceHouseCompileIdentity(source, result, privateStairGeometryMethod)

// These are controlled runtime perturbations, not validated architectural inputs.
// They test the identity contract without claiming the altered object passed compilation.
test('an omitted service endpoint preserves compact identity while actual output bytes identify the change', () => {
  const changedCore = {
    ...canonical,
    services: {
      ...canonical.services,
      derived: {
        ...canonical.services.derived,
        routes: canonical.services.derived.routes.map((route, index) => index === 0
          ? { ...route, toNodeId: 'CCR-IDENTITY-ENDPOINT-PERTURBATION' }
          : route)
      }
    }
  }
  assert.notEqual(changedCore.services.derived.routes[0].toNodeId, canonical.services.derived.routes[0].toNodeId)
  const changed = { ...changedCore, identity: identity(changedCore) }
  assert.deepEqual(changed.identity, canonical.identity)
  const context = (result: typeof canonical) => ({ source, result, reviewStateVisible: result.status === 'REVIEW' })
  const beforeOutputs = buildReferenceHouseSuccessorOutputs(context(canonical))
  const afterOutputs = buildReferenceHouseSuccessorOutputs(context(changed))
  const before = buildReferenceHouseOutputManifest(context(canonical), beforeOutputs)
  const after = buildReferenceHouseOutputManifest(context(changed), afterOutputs)
  assert.deepEqual(after.sourceCompile, before.sourceCompile)
  assert.deepEqual(after.artefacts.filter((item, i) => item.content.fingerprint !== before.artefacts[i].content.fingerprint)
    .map(item => item.artefactId), ['RH-SERVICE-REGISTER-1'])
  const report = afterOutputs.find(item => item.descriptor.id === 'RH-SERVICE-REGISTER-1')!
  const reportIdentity = after.artefacts.find(item => item.artefactId === report.descriptor.id)!
  assert.equal(reportIdentity.content.fingerprint, createHash('sha256').update(report.content).digest('hex'))
  assert.notEqual(report.content, readFileSync(report.descriptor.path, 'utf8'))
})

test('included result quantities change compact result and compile identities without changing input identities', () => {
  const changed = identity({ ...canonical, floorZoneDepth: mm(canonical.floorZoneDepth + 1) })
  assert.deepEqual(changed.source, canonical.identity.source)
  assert.deepEqual(changed.methods, canonical.identity.methods)
  assert.notEqual(changed.result.semanticFingerprint, canonical.identity.result.semanticFingerprint)
  assert.notEqual(changed.compile.fingerprint, canonical.identity.compile.fingerprint)
  assert.equal(changed.schemaVersion, 'HK-RH-COMPILE-1')
})

test('diagnostic prose is excluded while its controlled code and subjects remain identity-bearing', () => {
  const diagnostic: RhDiagnostic = { code: 'CCR-IDENTITY-CONTROL', status: 'REVIEW', subjectIds: ['SUBJECT-A'], message: 'Original prose' }
  const withDiagnostic = (value: RhDiagnostic) => ({
    ...canonical,
    diagnostics: { ...canonical.diagnostics, house: [...canonical.diagnostics.house, value] }
  })
  const baseline = identity(withDiagnostic({ ...diagnostic, subjectIds: ['SUBJECT-A'] }))
  const prose = identity(withDiagnostic({ ...diagnostic, subjectIds: ['SUBJECT-A'], message: 'Different explanatory prose' }))
  assert.deepEqual(prose, baseline)
  for (const value of [
    { ...diagnostic, code: 'CCR-IDENTITY-OTHER', subjectIds: ['SUBJECT-A'] },
    { ...diagnostic, subjectIds: ['SUBJECT-B'] }
  ]) assert.notEqual(identity(withDiagnostic(value)).compile.fingerprint, baseline.compile.fingerprint)
})

test('artefact association retains supplied byte identities without pretending to verify their source relation', () => {
  const supplied = { example: { path: 'not-read-by-this-helper.svg', gitBlobSha1: 'supplied-unverified-byte-pin' } }
  const linked = linkReferenceHouseArtefacts(canonical.identity, supplied)
  assert.equal(linked.artefacts, supplied)
  assert.equal(linked.compileFingerprint, canonical.identity.compile.fingerprint)
  assert.equal(linked.sourceFingerprint, canonical.identity.source.semanticFingerprint)
})
