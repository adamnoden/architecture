import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

test('current compiler reproduces north collector evidence and excludes the full source cabinet', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const request = await compile.readNorthCollectorCase()
  assert.ok('collector' in request)
  assert.deepEqual(request.collector.portAxisXYMm, [567.5, 11177.5])

  const result = await compile.northCollectorCase(request.collector)
  assert.equal(result.status, 'computed-comparison')
  assert.equal(result.source.planDigest, compile.source.planDigest)
  assert.equal(result.evidence.installedAcceptance, false)
  assert.deepEqual(result.comparison.retainedNWPort.axisUVAndDiameterMm, [235, 490, 160])
  assert.ok(result.comparison.retainedNWPort.levels.every(layer => layer.minimumClearToFormedEdgeAfter5Mm < -80))
  assert.equal(result.comparison.retainedNWPort.gapToWidenedWallUMm, -15)
  assert.deepEqual(result.comparison.rearCabinetPortTerritory.centreBoundsUVmm, [250, 317, 197.5, 787.5])
  assert.equal(result.comparison.rearCabinetPortTerritory.barCount, 20)
  const upperBound = result.comparison.rearCabinetPortTerritory.continuousUpperBoundGapMm
  assert.ok(typeof upperBound === 'number' && upperBound < -10)
  assert.equal(result.comparison.rearCabinetPortTerritory.state, 'overlap-throughout-territory')

  const studyFile = (extension: string) => new URL(`../../project/str/studies/floor-portal-monolithic-drag.${extension}`, import.meta.url)
  assert.deepEqual(result.comparison, JSON.parse(readFileSync(studyFile('json'), 'utf8')))
  assert.equal(result.drawingSvg, readFileSync(studyFile('svg'), 'utf8'))
  assert.deepEqual(JSON.parse(execFileSync(process.execPath, [
    '--import', 'tsx', 'scripts/compile-current-design.ts', '--north-collector', '-',
  ], { input: JSON.stringify(request), encoding: 'utf8' })), result)
})

test('port movement and demand changes propagate separately through the north collector comparison', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const request = await compile.readNorthCollectorCase()
  assert.ok('collector' in request)
  const original = await compile.northCollectorCase(request.collector)
  const moved = await compile.northCollectorCase({ ...request.collector, portAxisXYMm: [649.5, 10927] })
  const reduced = await compile.northCollectorCase({ ...request.collector, dragDemandFactor: 0.5 })

  assert.equal(original.status, 'computed-comparison')
  assert.equal(moved.status, 'computed-comparison')
  assert.equal(reduced.status, 'computed-comparison')
  assert.notEqual(moved.source.caseDigest, original.source.caseDigest)
  assert.deepEqual(moved.comparison.retainedNWPort.axisUVAndDiameterMm, [317, 740.5, 160])
  assert.equal(moved.comparison.retainedNWPort.gapToWidenedWallUMm, 67)
  assert.ok(Math.min(...moved.comparison.retainedNWPort.levels.map(layer => layer.minimumClearToFormedEdgeAfter5Mm)) < -10)
  assert.deepEqual(moved.comparison.rearCabinetPortTerritory, original.comparison.rearCabinetPortTerritory)
  assert.notEqual(moved.drawingSvg, original.drawingSvg)
  assert.match(moved.drawingSvg, /trial port shown/)

  assert.equal(reduced.comparison.straightDrag.requiredBondLengthEachSideMm,
    original.comparison.straightDrag.requiredBondLengthEachSideMm/2)
  assert.equal(reduced.comparison.lateralClosure.normalCompressionReturnKN,
    original.comparison.lateralClosure.normalCompressionReturnKN/2)
  assert.equal(reduced.comparison.lateralClosure.momentAboutUnchangedGroundAxisU0KNm,
    original.comparison.lateralClosure.momentAboutUnchangedGroundAxisU0KNm/2)
  assert.deepEqual(reduced.comparison.gravity, original.comparison.gravity)
  assert.equal(reduced.comparison.rearCabinetPortTerritory.state, 'cover-shortfall-throughout-territory')
  assert.equal(reduced.evidence.installedAcceptance, false)
})

test('stale, outside-cabinet and unbound north collector cases fail closed', async () => {
  const design = readGeorgianDesignSnapshot()
  const compile = prepareCurrentDesignCompile(design)
  const request = await compile.readNorthCollectorCase()
  assert.ok('collector' in request)
  await assert.rejects(compile.northCollectorCase({ ...request.collector, bindingDigest: 'stale' }), /binding/)
  await assert.rejects(compile.northCollectorCase({ ...request.collector, dragDemandFactor: 1.1 }), /demand factor/)
  await assert.rejects(compile.northCollectorCase({ ...request.collector, portAxisXYMm: [660, 10927] }), /inside the source rear cabinet/)
  const edited = prepareCurrentDesignCompile({
    ...design,
    source: { kind: 'contrast-specimen', id: 'SPECIMEN-NORTH-COLLECTOR', state: 'candidate' },
    envelope: { ...design.envelope, widthMm: design.envelope.widthMm + 20 },
  })
  assert.equal((await edited.northCollectorCase(request.collector)).status, 'unavailable')
})
