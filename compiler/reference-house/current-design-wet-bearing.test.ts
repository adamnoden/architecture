import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { admitWetBearingNumericalInputs, compareWetBearingRefinement, readWetBearingNumericalInputs,
  runWetBearingContactAnalysis, wetBearingConsumerPaths, wetBearingInputsPath } from './current-design/structural-wet-bearing.js'

const root = new URL('../../', import.meta.url)
// These nine fixtures exercise the transport and mathematical method. Current
// source stamps authenticate method bytes, not fictional zero house reactions.
// The coupled pair is an actually equilibrated *local pad*, never a house solve.
const fixtures = JSON.parse(execFileSync('python3', ['-B', '-c', `
import json,sys
from pathlib import Path
sys.path.insert(0,'project/str/studies')
from floor_section_model import load_source
from wet_bearing_refinement_test import fixture
sources=load_source(Path.cwd())['identities']
cases={
 'uniform8':fixture(8),'uniform16':fixture(16),'uniform32':fixture(32),
 'small16':fixture(16,rectangle=(-100,-40,100,40)),
 'clipped8':fixture(8,plane=(.09,-.001,.001)),
 'zero16':fixture(16,plane=(0,0,0)),'zero32':fixture(32,plane=(0,0,0)),
 'coupled16':fixture(16,coupled=True),'coupled32':fixture(32,coupled=True)}
for name,r in cases.items():
 r['sourceSHA256']=sources;r['request']['sourceSHA256']=sources
 r['request']['fixtureScope']='local-mathematics-only-not-house-execution-evidence'
 r['candidateAccepted']=False;r['completeHouseProof']=False
 r['nativeVertical']['native']['caseId']='SYNTHETIC-'+name
print(json.dumps(cases,allow_nan=False))
`], { cwd: fileURLToPath(root), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1', OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1' } })) as Record<string, any>

function computed(result: ReturnType<typeof runWetBearingContactAnalysis>) {
  if (!result || result.status !== 'computed-comparison') assert.fail(JSON.stringify(result))
  return result
}
function rejected(result: ReturnType<typeof runWetBearingContactAnalysis>, code: string) {
  assert.equal(result?.status, 'unsupported')
  if (!result || result.status !== 'unsupported') assert.fail(JSON.stringify(result))
  assert.equal(result.comparison, null)
  assert.equal(result.diagnostics[0]!.code, code)
  assert.equal(result.diagnostics[0]!.severity, 'error')
  assert.ok(Object.values(result.evidence).every(v => v === false))
}

test('authored numerical criteria are explicit and reject unknown units, fields and non-finite values', () => {
  const inputs = readWetBearingNumericalInputs()
  assert.deepEqual(inputs, JSON.parse(readFileSync(new URL(wetBearingInputsPath, root), 'utf8')))
  assert.equal(inputs.criteria.forceRelative, .001)
  assert.equal(inputs.criteria.centreOfPressureAbsoluteMm, .1)
  for (const change of [{ units: 'cm' }, { orders: [8, 16, 128] }, { conditionalNextOrder: 128 },
    { criteria: { ...inputs.criteria, forceRelative: NaN } }, { criteria: { ...inputs.criteria, unloadedForceKN: false } },
    { criteria: { ...inputs.criteria, physicalAccepted: true } }]) {
    assert.throws(() => admitWetBearingNumericalInputs({ ...inputs, ...change }), /NUMERICAL_INPUTS_UNSUPPORTED/)
  }
})

test('nine local/synthetic controls use the same Python stdin method without promoting them into house evidence', () => {
  assert.equal(Object.keys(fixtures).length, 9)
  for (const input of Object.values(fixtures)) {
    const result = computed(runWetBearingContactAnalysis(input))
    const comparison = result.comparison as any
    assert.equal(comparison.nativeCaseId, input.nativeVertical.native.caseId)
    assert.deepEqual(comparison.sourceSHA256, input.sourceSHA256)
    assert.deepEqual(comparison.executedRequest, input.request)
    assert.ok(Object.values(result.evidence).every(value => value === false))
    assert.deepEqual(Object.keys(result.method.sourceSHA256), [...wetBearingConsumerPaths])
    assert.ok(result.diagnostics.some(d => d.code === 'WET_BEARING_NOT_PHYSICAL_ACCEPTANCE'))
    assert.ok(result.diagnostics.some(d => d.code === 'WET_BEARING_COUPLED_REFINEMENT_NOT_EXECUTED'))
    assert.match(result.source.scope, /does not certify/)
  }
})

test('actual supplied response, criteria and method identities are returned; raw stdin agrees with adapter', () => {
  const input = fixtures.uniform16, result = computed(runWetBearingContactAnalysis(input))
  const direct = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(result.method.path, root))], {
    input: JSON.stringify({ schema: 'str-wet-bearing-analysis-request/1', operation: 'assess', native: input,
      criteria: readWetBearingNumericalInputs().criteria }), encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1' },
  }))
  assert.deepEqual(result.comparison, direct)
  assert.deepEqual(result.source.nativeCaseIds, [input.nativeVertical.native.caseId])
  assert.equal(result.source.nativeResponseSemanticDigests.length, 1)
  assert.ok(result.source.nativeResponseSemanticDigests.every(v => /^[a-f0-9]{64}$/.test(v)))
})

test('input order changes, save/load and snapshot restoration preserve exact mathematical results and unchanged controls', () => {
  const baseline = computed(runWetBearingContactAnalysis(fixtures.uniform16))
  const changed = computed(runWetBearingContactAnalysis(JSON.parse(JSON.stringify(fixtures.uniform32))))
  const restored = computed(runWetBearingContactAnalysis(JSON.parse(JSON.stringify(fixtures.uniform16))))
  assert.notDeepEqual(changed.source.nativeResponseSemanticDigests, baseline.source.nativeResponseSemanticDigests)
  assert.deepEqual(restored, baseline)
  const a = baseline.comparison as any, b = changed.comparison as any
  assert.equal(a.order, 16); assert.equal(b.order, 32)
  assert.ok(Math.abs(a.posts[0].normalCompressionKN - b.posts[0].normalCompressionKN) < 1e-10)
  assert.deepEqual(a.posts.map((p: any) => p.padRectangleXYMm), b.posts.map((p: any) => p.padRectangleXYMm))
  const pair = computed(compareWetBearingRefinement(fixtures.uniform16, fixtures.uniform32))
  assert.equal((pair.comparison as any).numericalRefinementPassing, true)
  assert.ok(!pair.diagnostics.some(d => d.code === 'WET_BEARING_COUPLED_REFINEMENT_NOT_EXECUTED'))
})

test('clipped patches and the re-equilibrated local pair retain failed numerical screens at unchanged criteria', () => {
  const clipped = computed(runWetBearingContactAnalysis(fixtures.clipped8))
  assert.equal((clipped.comparison as any).numericalSamePlaneIntegrationPassing, false)
  assert.ok(clipped.diagnostics.some(d => d.code === 'WET_BEARING_NUMERICAL_SCREEN_FAILED'))
  const pair = computed(compareWetBearingRefinement(fixtures.coupled16, fixtures.coupled32))
  assert.equal((pair.comparison as any).numericalRefinementPassing, false)
  assert.ok(pair.diagnostics.some(d => d.code === 'WET_BEARING_NUMERICAL_SCREEN_FAILED'))
  assert.deepEqual((pair.comparison as any).coarse.criteria, readWetBearingNumericalInputs().criteria)
})

test('different pad geometry recomputes force and zero-force controls retain null centroids without physical-open claims', () => {
  const large = computed(runWetBearingContactAnalysis(fixtures.uniform16)).comparison as any
  const small = computed(runWetBearingContactAnalysis(fixtures.small16)).comparison as any
  assert.ok(Math.abs(large.posts[0].normalCompressionKN - 22) < 1e-10)
  assert.ok(Math.abs(small.posts[0].normalCompressionKN - 16) < 1e-10)
  const zero = computed(compareWetBearingRefinement(fixtures.zero16, fixtures.zero32)).comparison as any
  assert.equal(zero.numericalRefinementPassing, true)
  assert.ok(zero.fine.posts.every((post: any) => post.centreOfPressureFromPadCentreMm === null))
  assert.ok(!Object.hasOwn(zero, 'physicalContactOpen'))
})

test('missing samples, unsupported order, altered tractions and different physical requests return explicit unsupported diagnostics', () => {
  for (const mutation of ['missing', 'order', 'force']) {
    const bad = structuredClone(fixtures.uniform16)
    if (mutation === 'missing') bad.seatedWetSupport.contactFibres.pop()
    if (mutation === 'order') {
      bad.seatedWetSupport.settings.bearingQuadratureOrder = 3
      bad.request.wetSupport.bearingQuadratureOrder = 3
    }
    if (mutation === 'force') bad.seatedWetSupport.contactFibres[0].normalCompressionKN += 1
    rejected(runWetBearingContactAnalysis(bad), 'WET_BEARING_METHOD_REJECTED')
  }
  const different = structuredClone(fixtures.uniform32); different.request.extraPhysicalChange = 1
  rejected(compareWetBearingRefinement(fixtures.uniform16, different), 'WET_BEARING_METHOD_REJECTED')
})

test('stale source bytes, forged adoption and missing native identities cannot emit a comparison', () => {
  const stale = structuredClone(fixtures.uniform16), path = Object.keys(stale.sourceSHA256)[0]!
  stale.sourceSHA256[path] = '0'.repeat(64); stale.request.sourceSHA256[path] = '0'.repeat(64)
  rejected(runWetBearingContactAnalysis(stale), 'WET_BEARING_NATIVE_SOURCE_STALE')
  rejected(runWetBearingContactAnalysis({ ...fixtures.uniform16, candidateAccepted: true }), 'WET_BEARING_NATIVE_RESPONSE_UNSUPPORTED')
  const missing = structuredClone(fixtures.uniform16); delete missing.nativeVertical.native.caseId
  rejected(runWetBearingContactAnalysis(missing), 'WET_BEARING_NATIVE_RESPONSE_UNSUPPORTED')
})

test('the non-wet control is absent and never needs a Python executable or a criteria/source fallback', () => {
  const previousPath = process.env.PATH
  try {
    process.env.PATH = '/not-a-python-directory'
    assert.equal(runWetBearingContactAnalysis({ request: { wetSupport: null } }), null)
  } finally { process.env.PATH = previousPath }
})
