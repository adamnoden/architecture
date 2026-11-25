import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import { build } from 'vite'
import { savedFloorSectionCase } from './current-design/structural-floor-section.js'
import { readWetBeamEndDevelopmentControls, readWetBeamEndDevelopmentDefaults, runWetBeamEndDevelopment } from './current-design/structural-wet-beam-end.js'
import { readWetSupportCageDefaults, runWetSupportCageComparison } from './current-design/structural-wet-support-cage.js'

test('versioned local controls use one bounded pure admission in Node, browser and the Python batch adapter', () => {
  const defaults = readWetBeamEndDevelopmentDefaults()
  assert.deepEqual(defaults, { endReturnMandrelMm: 80, strutCotangentComparisons: [1, 2.5] })
  const python = (value: unknown) => JSON.parse(execFileSync('python3', ['-B', 'project/str/studies/wet_beam_rectangular_return.py', '--validate-controls'], { input: JSON.stringify(value), encoding: 'utf8', stdio: 'pipe' }))
  for (const value of [defaults, { endReturnMandrelMm: 100, strutCotangentComparisons: [2] }]) {
    assert.deepEqual(readWetBeamEndDevelopmentControls(value), python(value))
  }
  for (const value of [{ ...defaults, endReturnMandrelMm: 47 }, { ...defaults, endReturnMandrelMm: 200 },
    { ...defaults, strutCotangentComparisons: [] }, { ...defaults, strutCotangentComparisons: [1, 1] },
    { ...defaults, strutCotangentComparisons: [3] }, { ...defaults, accepted: true }]) {
    assert.throws(() => readWetBeamEndDevelopmentControls(value))
    assert.throws(() => python(value))
  }
  assert.equal(runWetBeamEndDevelopment({}, null, undefined), null)
  assert.equal(runWetBeamEndDevelopment({}, null, defaults)?.status, 'unsupported')
})

test('local controls initialize in the production browser without Node globals', async () => {
  const output = await build({ configFile: false, logLevel: 'silent', build: { write: false, minify: false, lib: {
    entry: fileURLToPath(new URL('./current-design/structural-wet-beam-end-settings.ts', import.meta.url)),
    formats: ['iife'], name: 'LocalEndControls',
  } } })
  const bundles = Array.isArray(output) ? output : [output]
  const script = bundles.flatMap(bundle => {
    assert.ok('output' in bundle)
    return bundle.output.filter(item => item.type === 'chunk').map(item => item.code)
  }).join('\n')
  const result = runInNewContext(`${script}\n(() => {
    const good = LocalEndControls.readWetBeamEndDevelopmentControls({endReturnMandrelMm:100,strutCotangentComparisons:[2]})
    let rejected=false
    try { LocalEndControls.readWetBeamEndDevelopmentControls({...good,accepted:true}) } catch { rejected=true }
    return {good,rejected}
  })()`, {}, {timeout:1000})
  assert.deepEqual(JSON.parse(JSON.stringify(result)), {good:{endReturnMandrelMm:100,strutCotangentComparisons:[2]},rejected:true})
})

test('actual same-case alternative recomputes real geometry, preserves native inputs and reverses exactly', {
  skip: !process.env.STR_WET_BEAM_END_NATIVE,
}, () => {
  const native = JSON.parse(readFileSync(process.env.STR_WET_BEAM_END_NATIVE!, 'utf8'))
  const before = JSON.stringify(native)
  const request = {schema:'str-current-floor-section-case/1',planDigest:'admission-test',bindingDigest:'admission-test',
    comparison:native.request,sectionCuts:[],cageComparison:null,caseId:native.nativeVertical.native.caseId} as Parameters<typeof savedFloorSectionCase>[0]
  const upper = {schema:'str-current-upper-roof-bearing-case/1',planDigest:request.planDigest,bindingDigest:request.bindingDigest,
    caseId:request.caseId,comparison:native.request.bearingCase} as Parameters<typeof savedFloorSectionCase>[2]
  const settings = {thicknessMm:200,wetSupport:native.request.wetSupport,cageComparison:{...readWetSupportCageDefaults(),postTopLevelRaiseMm:10},
    beamEndDevelopment:readWetBeamEndDevelopmentDefaults()}
  assert.deepEqual(savedFloorSectionCase(request,settings,upper).beamEndDevelopment,settings.beamEndDevelopment)
  assert.throws(()=>savedFloorSectionCase(request,{...settings,cageComparison:null},upper),/explicit actual wet cage/)
  assert.throws(()=>savedFloorSectionCase(request,{...settings,beamEndDevelopment:{...settings.beamEndDevelopment,candidateAccepted:true}},upper))
  const cage = runWetSupportCageComparison(native, { ...readWetSupportCageDefaults(), postTopLevelRaiseMm: 10 })
  const controls = readWetBeamEndDevelopmentDefaults()
  const baseline = runWetBeamEndDevelopment(native, cage, controls)!
  assert.ok(baseline.status === 'computed-development-comparison', JSON.stringify(baseline))
  assert.equal(baseline.nativeCaseId, native.nativeVertical.native.caseId)
  assert.equal(baseline.candidateAccepted, false)
  assert.equal(baseline.beamEndDRegionAccepted, false)
  assert.equal(baseline.nativeSolveExecuted, false)
  assert.equal(baseline.nativeCageMassFeedbackApplied, false)
  const changed = runWetBeamEndDevelopment(native, cage, { ...controls, endReturnMandrelMm: 100 })!
  assert.ok(changed.status === 'computed-development-comparison')
  assert.notEqual(changed.candidateCageGeometrySHA256, baseline.candidateCageGeometrySHA256)
  assert.notEqual(changed.drawings['wet-beam-end.svg'], baseline.drawings['wet-beam-end.svg'])
  assert.deepEqual(changed.nativeRequest, baseline.nativeRequest)
  const stale = structuredClone(native)
  stale.sourceSHA256[Object.keys(stale.sourceSHA256)[0]!] = '0'.repeat(64)
  assert.equal(runWetBeamEndDevelopment(stale, cage, controls)?.status, 'unsupported')
  const restored = runWetBeamEndDevelopment(native, cage, controls)!
  assert.ok(restored.status === 'computed-development-comparison')
  assert.equal(restored.candidateCageGeometrySHA256, baseline.candidateCageGeometrySHA256)
  assert.deepEqual(restored.sameCaseCutComparisons, baseline.sameCaseCutComparisons)
  assert.equal(restored.drawings['wet-beam-end.svg'], baseline.drawings['wet-beam-end.svg'])
  assert.equal(JSON.stringify(native), before)
})
