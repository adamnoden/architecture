import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
import { auditSourceCoverage } from '../../project/ccr/studies/source-coverage.js'
import { readCurrentDesignResolution } from './current-design/resolve.js'
import { readGroundSectionCase } from './current-design/structural-ground.js'
import { readHouseVerticalProfileCase, runHouseVerticalProfileCase } from './current-design/house-vertical-profile.js'


test('profile replays the one authored ground case and distinguishes structural from occupied first floor', () => {
  assert.deepEqual(auditSourceCoverage().findings, [])
  const current = readCurrentDesignResolution()
  const request = readHouseVerticalProfileCase(current).profile
  assert.deepEqual(Object.keys(request).sort(), ['schema', 'planDigest', 'bindingDigest', 'groundCase'].sort())
  const result = runHouseVerticalProfileCase(current, request)
  assert.equal(result.native.occupied.groundFFLMm, 530)
  assert.equal(result.native.occupied.firstFFLMm, 3980)
  assert.deepEqual(result.native.occupied.firstRCMm, [3700, 3900])
  assert.equal(result.native.occupied.storeyIntervalMm, 3450)
  assert.equal(result.native.roof.coherentWeatherProfile, null)
  assert.ok(result.diagnostics.some(d => d.code === 'PROFILE_FORCE_REPLAY_REQUIRED'))
})

test('the sole ground250 to270 edit drives the profile, approaches, identities and rendered section', () => {
  const current = readCurrentDesignResolution()
  const base = readGroundSectionCase(current).ground
  const before = readHouseVerticalProfileCase(current, { ...base, settings: { ...base.settings, serviceZoneMm: 250 } }).profile
  const after = readHouseVerticalProfileCase(current, { ...base, settings: { ...base.settings, serviceZoneMm: 270 } }).profile
  const a = runHouseVerticalProfileCase(current, before)
  const b = runHouseVerticalProfileCase(current, after)
  assert.equal(a.native.occupied.groundFFLMm, 715)
  assert.equal(b.native.occupied.groundFFLMm, 735)
  assert.equal(b.native.occupied.firstFFLMm - a.native.occupied.firstFFLMm, 20)
  assert.equal(b.native.occupied.atticDatumMm - a.native.occupied.atticDatumMm, 20)
  assert.equal(b.native.groundLevelsMm.coldGridTop, -180)
  assert.notEqual(b.source.groundCaseDigest, a.source.groundCaseDigest)
  assert.match(b.sectionSvg, /Ground FFL735/)
  assert.doesNotMatch(b.sectionSvg, /Ground FFL715/)
})

test('direct profile levels, forged computed ground, stale source and stale current-plan bindings reject', () => {
  const current = readCurrentDesignResolution()
  const request = readHouseVerticalProfileCase(current).profile
  assert.throws(() => runHouseVerticalProfileCase(current, { ...request, ffl: 715 }), /no.*|only|derive/)
  assert.throws(() => runHouseVerticalProfileCase(current, { ...request, computedGround: { native: { levelsMm: { ffl: 715 } } } }), /derive/)
  assert.throws(() => runHouseVerticalProfileCase(current, { ...request, planDigest: 'stale' }), /Stale/)
  assert.throws(() => runHouseVerticalProfileCase(current, { ...request, groundCase: { ...request.groundCase, bindingDigest: 'stale' } }), /Stale/)
  const missing = { ...current, disciplineBindings: current.disciplineBindings.map(row => ({ ...row,
    identities: Object.fromEntries(Object.entries(row.identities).filter(([path]) => path !== 'project/had/studies/house_vertical_profile.py')) })) }
  assert.throws(() => readHouseVerticalProfileCase(missing), /Stale vertical-profile/)
})

test('canonical saved ground and public ground CLI supply the same sole profile authority through an edit', async () => {
  const { compileEngineeringDocument, readEngineeringDocument } = await import('./current-design/engineering-document.js')
  const current = readCurrentDesignResolution()
  const saved = await readEngineeringDocument(current.design)
  const groundRequest = readGroundSectionCase(current)
  const request = { ...groundRequest.ground, caseId: 'canonical-profile-ground',
    settings: { ...groundRequest.ground.settings, serviceZoneMm: 250 } }
  const document = { ...saved, stages: { groundSection: { caseId: request.caseId, settings: request.settings } } }
  const edited = { ...document, stages: { groundSection: { ...document.stages.groundSection,
    settings: { ...request.settings, serviceZoneMm: 270 } } } }
  const before = await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))
  const after = await compileEngineeringDocument(JSON.parse(JSON.stringify(edited)))
  assert.ok(before.engineering.groundSection && after.engineering.groundSection)
  const cliGround = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--ground-section', '-'], {
    input: JSON.stringify({ ...groundRequest, ground: request }), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  }))
  assert.deepEqual(cliGround, JSON.parse(JSON.stringify(before.engineering.groundSection)))
  const a = runHouseVerticalProfileCase(current, readHouseVerticalProfileCase(current, cliGround.authoredCase).profile)
  const b = runHouseVerticalProfileCase(current, readHouseVerticalProfileCase(current, after.engineering.groundSection.authoredCase as typeof request).profile)
  assert.equal(a.source.groundCaseDigest, before.engineering.groundSection.source.caseDigest)
  assert.equal(b.source.groundCaseDigest, after.engineering.groundSection.source.caseDigest)
  assert.deepEqual([a.native.occupied.groundFFLMm, b.native.occupied.groundFFLMm], [715, 735])
  assert.equal(b.native.occupied.firstFFLMm - a.native.occupied.firstFFLMm, 20)
  assert.ok(b.diagnostics.some(d => d.code === 'PROFILE_ROOF_ASSEMBLY_UNRESOLVED'))
  assert.equal(b.native.installedAcceptance, false)
})
