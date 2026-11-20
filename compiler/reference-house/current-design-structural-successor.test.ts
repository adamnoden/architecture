import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'

const memberLaw = { mode: 'authored-linear-comparison', elasticModulusMPa: 33000, poissonRatio: 0.2,
  flexuralFactor: 0.25, torsionFactor: 0.25, shearAreaFactor: 0.5 }
const jointLaw = { mode: 'authored-spring-comparison', compressionStiffnessKNPerMm3: 0.5,
  tieStiffnessKNPerMm: 50, shearKeyStiffnessKNPerMm: 100, compressionGapMm: 0, tieGapMm: 0 }

test('the current successor reader requires explicit physical-law comparisons and rejects stale cases', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const request = await compile.readStructuralSuccessorCase()
  assert.equal((request.successor.comparison as Record<string, unknown>).memberLaw, null)
  await assert.rejects(() => compile.structuralSuccessorCase(request.successor), /authored member law/)
  await assert.rejects(() => compile.structuralSuccessorCase({ ...request.successor, bindingDigest: 'stale' }), /Stale/)
  await assert.rejects(() => compile.structuralSuccessorCase({ ...request.successor, injectedResult: true }), /explicit/)
})

test('one saved engineering file solves actual grid compatibility and invalidates the affected result when joint stiffness changes', async () => {
  const design = readGeorgianDesignSnapshot()
  const compile = prepareCurrentDesignCompile(design)
  const request = await compile.readStructuralSuccessorCase()
  const reference = request.successor.comparison as Record<string, unknown>
  const settings = { northWallWidthMm: reference.northWallWidthMm, boundaryActions: reference.boundaryActions, memberLaw, jointLaw }
  const document = { ...await readEngineeringDocument(design), stages: { structuralSuccessor: settings } }
  const baseline = await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))
  const result = baseline.engineering.structuralSuccessor!
  assert.equal(result.native.heads.length, 52)
  assert.ok(result.native.memberCount > 100)
  assert.ok(result.native.equilibriumResidualKN_KNm.every(value => Math.abs(value) < 1e-6))
  assert.equal(result.native.installedAcceptance, false)
  assert.equal(result.native.completeHouseProof, false)
  await assert.rejects(() => compile.structuralSuccessorCase({ ...request.successor, comparison: {
    ...reference, memberLaw, jointLaw: { ...jointLaw, tieGapMm: 1 },
  } }), /zero-gap|free travel/)
  const changed = await compileEngineeringDocument({ ...document, stages: { structuralSuccessor: {
    ...settings, jointLaw: { ...jointLaw, tieStiffnessKNPerMm: 10 },
  } } })
  assert.notDeepEqual(changed.engineering.structuralSuccessor!.native.heads, result.native.heads)
  assert.deepEqual(changed.engineering.structuralSuccessor!.native.applied, result.native.applied)
  const stage = (bundle: typeof baseline, name: string) => bundle.manifest.find(row => row.stage === name)
  assert.notEqual(stage(changed, 'structuralSuccessor')!.resultDigest, stage(baseline, 'structuralSuccessor')!.resultDigest)
  for (const name of ['plans', 'occupiedServices', 'selectedWaterEvent']) assert.deepEqual(stage(changed, name), stage(baseline, name))
  const cli = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx',
    fileURLToPath(new URL('../../scripts/compile-current-design.ts', import.meta.url)), '--bundle', '-'],
  { input: JSON.stringify(document), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }))
  assert.deepEqual(cli.engineering.structuralSuccessor.native, JSON.parse(JSON.stringify(result.native)))
  await assert.rejects(() => compileEngineeringDocument({ ...document, stages: { structuralSuccessor: {
    ...settings, sourceSHA256: {},
  } } }), /Unknown structural successor/)
  const stale = { ...document, bindings: { ...document.bindings, implementations: {
    ...document.bindings.implementations, 'compiler/reference-house/current-design/structural-successor.ts': 'stale',
  } } }
  await assert.rejects(() => compileEngineeringDocument(stale), /Stale engineering/)
})
