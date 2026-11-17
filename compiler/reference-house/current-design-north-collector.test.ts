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
  await assert.rejects(compile.northCollectorCase({ ...request.collector, remoteMainBarShiftMm: -1 }), /main bar shift/)
  await assert.rejects(compile.northCollectorCase({ ...request.collector, remoteMainBarShiftMm: 21 }), /main bar shift/)
  await assert.rejects(compile.northCollectorCase({ ...request.collector, portAxisXYMm: [660, 10927] }), /inside the source rear cabinet/)
  const edited = prepareCurrentDesignCompile({
    ...design,
    source: { kind: 'contrast-specimen', id: 'SPECIMEN-NORTH-COLLECTOR', state: 'candidate' },
    envelope: { ...design.envelope, widthMm: design.envelope.widthMm + 20 },
  })
  assert.equal((await edited.northCollectorCase(request.collector)).status, 'unavailable')
})

test('original main bar axes clear the collector and align with the legacy blind bores', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const request = await compile.readNorthCollectorCase()
  assert.ok('collector' in request)
  const [reference, explicitReference, aligned, adverse] = await Promise.all([
    compile.northCollectorCase(request.collector),
    compile.northCollectorCase({ ...request.collector, remoteMainBarShiftMm: 15 }),
    compile.northCollectorCase({ ...request.collector, remoteMainBarShiftMm: 0 }),
    compile.northCollectorCase({ ...request.collector, remoteMainBarShiftMm: 20 }),
  ])
  assert.ok(reference.status === 'computed-comparison' && explicitReference.status === 'computed-comparison'
    && aligned.status === 'computed-comparison' && adverse.status === 'computed-comparison')
  assert.deepEqual(reference, explicitReference)
  assert.equal(reference.comparison.groundSplice.legacyBoreAlignment.axesOutsideBudgetCount, 8)
  assert.equal(reference.comparison.groundSplice.knownMainBarAxes.length, 12)
  assert.deepEqual(reference.comparison.groundSplice.knownMainBarAxes.map(row => row.id), aligned.comparison.groundSplice.knownMainBarAxes.map(row => row.id))
  assert.ok(aligned.comparison.groundSplice.knownMainBarAxes.every(row => row.axisOffsetMm === 0))
  assert.deepEqual(aligned.comparison.groundSplice.footprint, {
    legacyMetalMm2: 260400, widenedBodyMm2: 422400, uncoveredByLegacyMetalMm2: 162000,
    uncoveredByExtendedWebMm2: 0, extendedWebOverhangMm2: 0,
  })
  assert.deepEqual(aligned.comparison.groundSplice.receivingPlan.map(corner =>
    [corner.receivingLevelZMm, corner.uncoveredWithSettingMm2, corner.verticalGapToWebUndersideMm, corner.verticalGapToBlockUndersideMm]), [
    [-180, 0, 130, 70], [-180, 0, 130, 70],
  ])
  assert.ok(aligned.comparison.stack.uprightScreenClearShared5Mm.primaryH20 > 40)
  assert.equal(aligned.comparison.stack.primaryPlacingComparisonMet, true)
  assert.ok(adverse.comparison.stack.uprightScreenClearShared5Mm.primaryH20 < 21)
  assert.equal(adverse.comparison.stack.primaryPlacingComparisonMet, false)
  assert.deepEqual(aligned.comparison.rearCabinetPortTerritory, reference.comparison.rearCabinetPortTerritory)
  assert.deepEqual(aligned.comparison.gravity, reference.comparison.gravity)
  assert.match(aligned.drawingSvg, /0 mm maximum H20 axis offset/)
})

test('an explicit north yaw probe replays both signs and leaves global actions unchanged across all 52 heads', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const request = await compile.readNorthCollectorCase()
  assert.ok('collector' in request)
  const ordinary = await compile.northCollectorCase(request.collector)
  assert.equal(ordinary.status, 'computed-comparison')
  assert.equal(Object.hasOwn(ordinary, 'yawProbe'), false)

  const windIndex = 8
  const [zero, forward, reverse] = await Promise.all((['zero', 'nw-positive', 'ne-positive'] as const).map(sense =>
    compile.northCollectorCase({ ...request.collector, yawProbe: { windIndex, sense } })))
  assert.ok(zero.status === 'computed-comparison' && zero.yawProbe
    && forward.status === 'computed-comparison' && forward.yawProbe
    && reverse.status === 'computed-comparison' && reverse.yawProbe)
  const probes = [zero.yawProbe, forward.yawProbe, reverse.yawProbe]
  const near = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} differs from ${expected}`)
  for (const probe of probes) {
    assert.equal(probe.heads.length, 52)
    assert.equal(new Set(probe.heads.map(head => head.id)).size, 52)
    assert.equal(probe.admitted, false)
    assert.equal(probe.method.solver.path, 'project/str/studies/current-house-joined-foundation.py')
    assert.ok(probe.method.inputs['project/str/studies/current-house-ring-floor-stations.json'])
    assert.deepEqual(probe.groups.map(group => [group.id, group.headIds]), [
      ['NW', ['P07', 'P08', 'P09']], ['NE', ['P10', 'P11', 'P12']],
    ])
    probe.deltaHorizontalEquilibrium.forEach(value => near(value, 0))
    for (const group of probe.groups) {
      near(group.deltaHorizontalEquilibrium[0], 0)
      near(group.deltaHorizontalEquilibrium[1], 0)
      near(group.deltaHorizontalEquilibrium[2], group.appliedYawKNm)
    }
  }
  assert.deepEqual(forward.comparison, ordinary.comparison)
  assert.deepEqual(forward.drawingSvg, ordinary.drawingSvg)
  assert.notEqual(forward.source.caseDigest, reverse.source.caseDigest)
  const yaw = ordinary.comparison.lateralClosure.momentAboutUnchangedGroundAxisU0KNm
  near(forward.yawProbe.groups[0].appliedYawKNm, yaw)
  near(forward.yawProbe.groups[1].appliedYawKNm, -yaw)
  near(reverse.yawProbe.groups[0].appliedYawKNm, -yaw)
  near(reverse.yawProbe.groups[1].appliedYawKNm, yaw)
  const affected = forward.yawProbe.heads.filter(head => head.deltaHorizontalKN.some(value => Math.abs(value) > 1e-8))
  assert.deepEqual(affected.map(head => head.id), ['P07', 'P08', 'P09', 'P10', 'P11', 'P12'])
  near(affected[1].deltaHorizontalKN[1], 9.405328988)
  for (const [index, head] of zero.yawProbe.heads.entries()) {
    assert.deepEqual(head.beforeHorizontalKN, head.probedHorizontalKN)
    assert.deepEqual(head.beforeHorizontalKN, forward.yawProbe.heads[index].beforeHorizontalKN)
    forward.yawProbe.heads[index].deltaHorizontalKN.forEach((value, axis) =>
      near(value, -reverse.yawProbe!.heads[index].deltaHorizontalKN[axis]))
  }

  const reduced = await compile.northCollectorCase({
    ...request.collector, dragDemandFactor: 0.5, yawProbe: { windIndex, sense: 'nw-positive' },
  })
  assert.ok(reduced.status === 'computed-comparison' && reduced.yawProbe)
  near(reduced.yawProbe.yawMagnitudeKNm, yaw/2)
  near(reduced.yawProbe.heads.find(head => head.id === 'P08')!.deltaHorizontalKN[1], 9.405328988/2)
  assert.deepEqual(reduced.yawProbe.baselineHorizontalEquilibrium, forward.yawProbe.baselineHorizontalEquilibrium)
})

test('a yaw probe rejects unbound wind patterns, missing sense and supplied base shear', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const request = await compile.readNorthCollectorCase()
  assert.ok('collector' in request)
  await assert.rejects(compile.northCollectorCase({ ...request.collector, yawProbe: { windIndex: 96, sense: 'zero' } }),
    /named wind pattern/)
  await assert.rejects(compile.northCollectorCase({ ...request.collector, yawProbe: { windIndex: 8 } }), /yaw/)
  await assert.rejects(compile.northCollectorCase({
    ...request.collector, yawProbe: { windIndex: 8, sense: 'nw-positive', baseShearKN: 95.16 },
  }), /yaw/)
})

test('the widened splice provides backed reversible key pairs and exposes both web-cut wrenches', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const request = await compile.readNorthCollectorCase()
  assert.ok('collector' in request)
  const result = await compile.northCollectorCase({ ...request.collector, remoteMainBarShiftMm: 0 })
  assert.equal(result.status, 'computed-comparison')
  const keyPath = result.comparison.groundSplice.isolatedKeyLoadPath
  assert.equal(keyPath.status, 'balanced-compression-only-comparison')
  assert.deepEqual(keyPath.legacyControl, {
    widthMm: 140, status: 'backing-unavailable', unsupportedFaces: ['y-toe-side', 'x-toe-side'],
  })
  assert.equal(keyPath.widenedWidthMm, 240)
  assert.deepEqual(keyPath.widenedUnsupportedFaces, [])
  const [positive, negative] = keyPath.runs
  assert.deepEqual(positive.upper.contacts.map(contact => contact.id), ['x-toe-end', 'y-toe-side'])
  assert.deepEqual(positive.lower.contacts.map(contact => contact.id), ['x-toe-side', 'y-toe-end'])
  assert.deepEqual(negative.upper.contacts.map(contact => contact.id), positive.lower.contacts.map(contact => contact.id))
  const yaw = result.comparison.lateralClosure.momentAboutUnchangedGroundAxisU0KNm
  for (const run of keyPath.runs) {
    assert.ok(run.externalNetWrench.every(component => Math.abs(component) < 1e-8))
    assert.ok(Math.abs(run.upper.wrench[5] - run.upperYawSign*yaw) < 1e-8)
    assert.ok(Math.abs(run.lower.wrench[5] + run.upperYawSign*yaw) < 1e-8)
    assert.deepEqual(run.upper.contacts.map(contact => contact.bearingAreaMm2).sort((a, b) => a-b), [8400, 12000])
    assert.equal(run.webCutDemands.length, 4)
  }
  const rootCut = positive.webCutDemands.find(cut => cut.arm === 'x' && cut.section === 'root')!
  const toeCut = positive.webCutDemands.find(cut => cut.arm === 'x' && cut.section === 'toe')!
  assert.deepEqual(rootCut.originXYZMm, [240, 120, -40])
  assert.deepEqual(toeCut.originXYZMm, [800, 120, -40])
  assert.ok(Math.abs(rootCut.toeSideExternalWrench[5] + 11.889242378045482) < 1e-8)
  assert.ok(Math.abs(toeCut.toeSideExternalWrench[5] + 0.9745280637742199) < 1e-8)
  assert.notEqual(rootCut.toeSideExternalWrench[3], 0)
  assert.notEqual(rootCut.toeSideExternalWrench[4], 0)
  assert.equal(result.evidence.installedAcceptance, false)
})
