import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

const design = readGeorgianDesignSnapshot()
const compile = prepareCurrentDesignCompile(design)
const cli = (mode: string, input: unknown) => spawnSync(process.execPath,
  ['--import', 'tsx', 'scripts/compile-current-design.ts', mode, '-'],
  { input: JSON.stringify(input), encoding: 'utf8' })

test('each native draw with a local collar needs a continuous opening through its own wet box roof', async () => {
  const requests = await compile.readInletRemovalCases()
  const [utility, plant] = await Promise.all(requests.map(({ removal }) => compile.inletRemoval(removal)))
  assert.deepEqual([utility.branch, plant.branch], ['utility', 'plant'])
  assert.deepEqual([utility.status, plant.status], ['blocked', 'blocked'])
  assert.deepEqual(utility.calculation.roofStrip, {
    xMm: [10038, 10122], yMm: [538, 665], zMm: 680, widthMm: 84, lengthMm: 127, splitCollarTravelMm: 2,
  })
  assert.deepEqual(plant.calculation.roofStrip, {
    xMm: [10243, 10327], yMm: [503, 665], zMm: 730, widthMm: 84, lengthMm: 162, splitCollarTravelMm: 2,
  })
  for (const result of [utility, plant]) {
    assert.deepEqual(result.diagnostics.map(({ code }) => code), ['ROOF_STRIP_REQUIRED'])
    assert.equal(result.calculation.exteriorTipPastInsideFaceMm, 50.5)
    assert.equal(result.calculation.sleeveRadialReserveAfterSettingMm, 38)
    assert.equal(result.calculation.dryBreak.zMm, 900)
    assert.equal(result.calculation.dryBreak.fixedCompanionRetreatMm, null)
    assert.equal(result.calculation.dryBreak.guideAndFirstRestQualified, false)
    assert.equal(result.evidence.installedRelease, 'unavailable')
    assert.match(result.method.gitBlob, /^[a-f\d]{40}$/)
  }

  const exported = cli('--read-inlet-removal', design)
  assert.equal(exported.status, 0, exported.stderr)
  assert.deepEqual(JSON.parse(exported.stdout), requests)
  const compiled = cli('--inlet-removal', requests[0])
  assert.equal(compiled.status, 0, compiled.stderr)
  assert.deepEqual(JSON.parse(compiled.stdout), JSON.parse(JSON.stringify(utility)))
})

test('the hypothetical clear strip and parked washer admit only the conditional straight draw', async () => {
  const [{ removal }, { removal: sibling }] = await compile.readInletRemovalCases()
  const siblingControl = await compile.inletRemoval(sibling)
  const clear = { ...removal, roofAccess: 'clear-strip-comparison' as const }
  const pass = await compile.inletRemoval(clear)
  assert.equal(pass.status, 'within-conditional-draw-screen')
  assert.equal(pass.calculation.washerGapAfterSettingMm, 252.9971)
  assert.equal(pass.calculation.troughGapAfterSettingMm, 73.0954)
  assert.equal(pass.evidence.retainedClosureAndRoofStrip, 'unqualified')

  const short = await compile.inletRemoval({ ...clear, drawMm: 565 })
  assert.equal(short.calculation.exteriorTipPastInsideFaceMm, -4.5)
  assert.equal(short.status, 'blocked')
  assert.ok(short.diagnostics.some(({ code }) => code === 'WALL_TIP_NOT_RELEASED'))
  assert.notEqual(short.source.caseDigest, pass.source.caseDigest)
  assert.notDeepEqual(short.drawing.primitives, pass.drawing.primitives)
  const partial = await compile.inletRemoval({ ...clear, drawMm: 25 })
  assert.equal(partial.calculation.roofStrip.lengthMm, 109)
  assert.equal(partial.drawing.primitives.find(({ id }) => id === 'required-roof-strip')?.metadata?.toYmm, 647)

  const installed = await compile.inletRemoval({ ...clear, washer: 'installed', utilityTaperRemoved: false })
  assert.ok(installed.calculation.washerGapAfterSettingMm < 0)
  for (const failure of ['WASHER_SWEEP_INTERFERENCE', 'FIXED_UTILITY_TAPER_INTERFERENCE']) {
    assert.ok(installed.diagnostics.some(({ code }) => code === failure))
  }

  const openedBoth = await compile.inletRemoval({
    ...clear, preparation: { ...clear.preparation, siblingClosureRetained: false, connectionsDisengaged: false },
  })
  assert.equal(openedBoth.status, 'blocked')
  assert.deepEqual(openedBoth.diagnostics.map(({ objectId }) => objectId), ['connectionsDisengaged', 'siblingClosureRetained'])
  assert.deepEqual(await compile.inletRemoval(sibling), siblingControl)
})

test('a removal case cannot inherit applicability from another sill or layout', async () => {
  const [{ removal }] = await compile.readInletRemovalCases()
  await assert.rejects(compile.inletRemoval({ ...removal, insertCaseDigest: 'other-insert' }), /source binding/)
  await assert.rejects(compile.inletRemoval({ ...removal, drawMm: 621 }), /draw range/)
  const specimen = prepareCurrentDesignCompile({
    ...design, source: { kind: 'contrast-specimen', id: 'SPECIMEN-NO-INLET-REMOVAL', state: 'candidate' },
  })
  await assert.rejects(specimen.inletRemoval(removal), /applicable HAD inlet and utility layout/)
})
