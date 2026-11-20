import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

test('the saved ground authority drives the complete vertical profile through bundle, CLI and reversal', async () => {
  const source = await readEngineeringDocument(readGeorgianDesignSnapshot())
  const compile = prepareCurrentDesignCompile(source.design)
  const { ground } = await compile.readGroundSectionCase()
  const document = { ...source, stages: { groundSection: { caseId: ground.caseId, settings: { ...ground.settings, serviceZoneMm: 250 } }, houseVerticalProfile: {} } }
  const before = await compileEngineeringDocument(document)
  const edited = { ...document, stages: { ...document.stages, groundSection: { ...document.stages.groundSection,
    settings: { ...document.stages.groundSection.settings, serviceZoneMm: 270 } } } }
  const after = await compileEngineeringDocument(JSON.parse(JSON.stringify(edited)))
  const a = before.engineering.houseVerticalProfile, b = after.engineering.houseVerticalProfile
  assert.ok(a && b)
  assert.deepEqual([a.native.occupied.groundFFLMm, b.native.occupied.groundFFLMm], [715, 735])
  assert.equal(b.native.occupied.firstFFLMm - a.native.occupied.firstFFLMm, 20)
  assert.equal(b.native.occupied.atticDatumMm - a.native.occupied.atticDatumMm, 20)
  assert.notEqual(a.sectionSvg, b.sectionSvg)
  assert.equal(a.native.roof.coherentWeatherProfile, null)
  assert.equal(a.evidence.installedAcceptance, false)
  assert.deepEqual(after.plans, before.plans)
  assert.ok(after.manifest.find(row => row.stage === 'houseVerticalProfile')?.dependsOn.includes('groundSection'))
  const cli = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'], {
    input: JSON.stringify(edited), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  }))
  assert.deepEqual(cli.engineering.houseVerticalProfile, JSON.parse(JSON.stringify(b)))
  assert.deepEqual((await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))).engineering.houseVerticalProfile, a)
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { houseVerticalProfile: {} } }), /sole saved groundSection/)
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { ...document.stages, houseVerticalProfile: { groundFFLMm: 735 } } }), /Unknown house vertical profile/)
})

test('the public profile reader and executor replay their exact single ground case', async () => {
  const design = readGeorgianDesignSnapshot()
  const compile = prepareCurrentDesignCompile(design)
  const run = (mode: string, input: unknown) => JSON.parse(execFileSync(process.execPath,
    ['--import', 'tsx', 'scripts/compile-current-design.ts', mode, '-'], {
      input: JSON.stringify(input), encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
    }))
  const request = run('--read-house-vertical-profile', design)
  assert.deepEqual(request, await compile.readHouseVerticalProfileCase())
  const result = run('--house-vertical-profile', request)
  assert.deepEqual(result, await compile.houseVerticalProfileCase(request.profile))
  assert.equal(result.native.occupied.groundFFLMm, 530)
  assert.equal(result.native.selectedHouseAdmitted, false)
  assert.equal(result.native.roof.wholeHouseWeatherHeightAboveAuthoredGradeMm, null)
  assert.throws(() => run('--house-vertical-profile', { ...request, profile: { ...request.profile, groundFFLMm: 0 } }), /Stale or unsupported house vertical-profile/)
})
