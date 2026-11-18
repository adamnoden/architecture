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

test('same-wind collector inputs compile concurrent signed actions without granting suction credit', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const request = await compile.readNorthCollectorCase()
  assert.ok('collector' in request)
  const [forward, reverse, independent] = await Promise.all(([['nw-positive', 58], ['ne-positive', 58], ['nw-positive', 8]] as const)
    .map(([sense, windIndex]) => compile.northCollectorCase({
      ...request.collector, yawProbe: { windIndex, sense }, deadLoadReplay: { windIndex: 58 },
    })))
  assert.ok(forward.status === 'computed-comparison' && forward.yawProbe && forward.deadLoadReplay && forward.fixedBaseActions
    && reverse.status === 'computed-comparison' && reverse.fixedBaseActions && independent.status === 'computed-comparison')
  assert.ok(independent.yawProbe && independent.deadLoadReplay)
  assert.equal(independent.fixedBaseActions, undefined)
  const { fixedBaseActions: actions, yawProbe, deadLoadReplay } = forward
  assert.deepEqual(deadLoadReplay, independent.deadLoadReplay)
  const oppositeStates = reverse.fixedBaseActions.states
  assert.equal(actions.windIndex, 58)
  assert.equal(actions.admitted, false)
  assert.deepEqual(actions.componentOrder, ['N_kN', 'Cx_kNm', 'Cy_kNm', 'Vx_kN', 'Vy_kN'])
  assert.deepEqual(actions.verticalEquilibriumOrder, ['N_kN', 'X_first_moment_kNm', 'Y_first_moment_kNm'])
  assert.deepEqual(actions.horizontalEquilibriumOrder, ['Fx_kN', 'Fy_kN', 'Mz_kNm'])
  assert.deepEqual(actions.states.map(state => [state.id, state.additionalGravityFactor]), [
    ['GQ+wind', 1.35], ['stripped suction+wind', 0], ['retained suction+wind', 0],
  ])
  for (const [stateIndex, state] of actions.states.entries()) {
    const gravity = deadLoadReplay.states[stateIndex]
    const opposite = oppositeStates[stateIndex]
    assert.equal(state.heads.length, 52)
    assert.equal(new Set(state.heads.map(head => head.id)).size, 52)
    assert.equal(state.releasedPassivePadCount, gravity.releasedPassivePadCount)
    assert.deepEqual(state.verticalEquilibrium, gravity.candidateVerticalEquilibrium)
    assert.deepEqual(state.horizontalEquilibrium, yawProbe.probedHorizontalEquilibrium)
    for (const [index, head] of state.heads.entries()) {
      const vertical = gravity.heads[index]
      const horizontal = yawProbe.heads[index]
      assert.deepEqual([head.id, head.xy], [vertical.id, vertical.xy])
      assert.deepEqual(head.candidate, [...vertical.candidateVertical, ...horizontal.probedHorizontalKN])
      assert.deepEqual(head.baseline, [...vertical.baselineVertical, ...horizontal.beforeHorizontalKN])
      assert.deepEqual(head.delta.slice(0, 3), opposite.heads[index].delta.slice(0, 3))
      if (state.additionalGravityFactor === 0) assert.deepEqual(head.delta.slice(0, 3), [0, 0, 0])
      assert.ok(head.delta.slice(3).every((value, axis) => Math.abs(value + opposite.heads[index].delta[axis + 3]) < 1e-8))
    }
    assert.ok(state.heads.some(head => head.delta.slice(3).some(value => Math.abs(value) > 1)))
  }
  const p12 = actions.states[0].heads.find(head => head.id === 'P12')!
  assert.ok(Math.abs(p12.candidate[0] - 666.63) < 0.01)
  assert.ok(p12.delta.slice(3).some(value => Math.abs(value) > 1))
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
  assert.deepEqual(result.grossRootWeb.section, {
    widthMm: 240, thicknessMm: 20, areaMm2: 4800,
    widthSectionModulusMm3: 192000, thicknessSectionModulusMm3: 16000,
  })
  assert.equal(result.grossRootWeb.admitted, false)
  assert.deepEqual(result.grossRootWeb.cuts.map(cut => [cut.upperYawSign, cut.arm]), [[1, 'x'], [1, 'y'], [-1, 'x'], [-1, 'y']])
  const [xRoot] = result.grossRootWeb.cuts
  assert.ok(Math.abs(xRoot.normalStressMPa.maximum - 114.70) < 0.02)
  assert.ok(Math.abs(xRoot.normalStressMPa.minimum + 106.58) < 0.02)
  assert.ok(xRoot.shearResultantKN > 19)
  assert.equal(xRoot.torsionKNm, rootCut.toeSideExternalWrench[3])
  assert.deepEqual(result.toeTransfer.intervalMm, [0, 140])
  assert.equal(result.toeTransfer.admitted, false)
  assert.deepEqual(result.toeTransfer.cuts.map(cut => [cut.upperYawSign, cut.arm]), [[1, 'x'], [1, 'y'], [-1, 'x'], [-1, 'y']])
  const [xToe, yToe] = result.toeTransfer.cuts
  assert.deepEqual(xToe.originXYZMm, [800, 70, -40])
  assert.deepEqual(yToe.originXYZMm, [70, 800, -40])
  assert.ok(Math.abs(xToe.wrench[5] + 1.94905612754844) < 1e-8)
  assert.equal(xToe.shearResultantKN, xRoot.shearResultantKN)
  const narrowToe = await compile.northCollectorCase({ ...request.collector, remoteMainBarShiftMm: 0, toeTransferIntervalMm: [50, 90] })
  assert.equal(narrowToe.status, 'computed-comparison')
  assert.deepEqual(narrowToe.comparison, result.comparison)
  assert.deepEqual(narrowToe.toeTransfer.cuts[0].wrench, xToe.wrench)
  assert.ok(narrowToe.toeTransfer.cuts[0].normalStressMPa.maximum > xToe.normalStressMPa.maximum)
  await assert.rejects(compile.northCollectorCase({ ...request.collector, toeTransferIntervalMm: [40, 40] }), /increasing toe transfer interval/)
  await assert.rejects(compile.northCollectorCase({ ...request.collector, toeTransferIntervalMm: [0, 141] }), /retained block width/)
  const reduced = await compile.northCollectorCase({ ...request.collector, dragDemandFactor: 0.5 })
  assert.equal(reduced.status, 'computed-comparison')
  for (const [index, cut] of result.grossRootWeb.cuts.entries()) {
    assert.ok(Math.abs(reduced.grossRootWeb.cuts[index].normalStressMPa.maximum - cut.normalStressMPa.maximum / 2) < 1e-8)
  }
})

test('the isolated key trial separates each signed pair’s take-up from elastic rotation', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const request = await compile.readNorthCollectorCase()
  assert.ok('collector' in request)
  const face = { gapMm: 0.1, stiffnessKNPerMm: 100 }
  const lower = { 'x-toe-end': face, 'x-toe-side': face, 'y-toe-end': face, 'y-toe-side': face }
  const upper = { ...lower, 'x-toe-end': { ...face, gapMm: 1.1 } }
  const keyContactTrial = { upper, lower, rotationBudgetMrad: 2 }
  const [full, half, narrow] = await Promise.all([
    compile.northCollectorCase({ ...request.collector, keyContactTrial }),
    compile.northCollectorCase({ ...request.collector, keyContactTrial, dragDemandFactor: 0.5 }),
    compile.northCollectorCase({ ...request.collector, keyContactTrial: { ...keyContactTrial, rotationBudgetMrad: 1.5 } }),
  ])
  assert.ok(full.status === 'computed-comparison' && full.keyContact && half.status === 'computed-comparison' && half.keyContact
    && narrow.status === 'computed-comparison' && narrow.keyContact)
  assert.equal(full.keyContact.admitted, false)
  assert.equal(full.evidence.state, 'trial-only')
  const [positive, negative] = full.keyContact.runs
  assert.deepEqual(positive.faces.map(face => [face.level, face.yawSign, face.leverMm]), [['upper', 1, 830], ['lower', -1, 830]])
  assert.equal(positive.status, 'elastic-rotation-exceeds-budget')
  assert.equal(negative.status, 'within-trial-budget')
  assert.equal(narrow.keyContact.runs[0].status, 'gap-exhausts-budget')
  assert.ok(Math.abs(positive.gapRotationMrad - 1.4 / 830 * 1000) < 1e-8)
  const keyForce = full.comparison.lateralClosure.momentAboutUnchangedGroundAxisU0KNm * 1000 / 830
  assert.ok(Math.abs(positive.elasticRotationMrad - 4 * keyForce / 100 / 830 * 1000) < 1e-8)
  assert.equal(half.keyContact.runs[0].gapRotationMrad, positive.gapRotationMrad)
  assert.ok(Math.abs(half.keyContact.runs[0].elasticRotationMrad * 2 - positive.elasticRotationMrad) < 1e-8)
  await assert.rejects(compile.northCollectorCase({ ...request.collector, keyContactTrial: { ...keyContactTrial,
    upper: { ...upper, 'x-toe-end': { ...face, stiffnessKNPerMm: 0 } } } }), /positive stiffness/)
  await assert.rejects(compile.northCollectorCase({ ...request.collector, keyContactTrial: { ...keyContactTrial, lower: {} } }), /all four retained key contacts/)
})

test('the local H28 turn resolves finite drag crossings and port overlap from the saved north case', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const request = await compile.readNorthCollectorCase()
  assert.ok('collector' in request)
  const [compact, broad, moved] = await Promise.all([
    compile.northCollectorCase({ ...request.collector, chordBendRadiusMm: 140 }),
    compile.northCollectorCase({ ...request.collector, chordBendRadiusMm: 500 }),
    compile.northCollectorCase({ ...request.collector, chordBendRadiusMm: 140, portAxisXYMm: [649.5, 10927] }),
  ])
  assert.ok(compact.status === 'computed-comparison' && compact.chordTurn
    && broad.status === 'computed-comparison' && broad.chordTurn && moved.status === 'computed-comparison' && moved.chordTurn)
  assert.equal(compact.chordTurn.admitted, false)
  assert.deepEqual(compact.chordTurn.geometry, {
    chordZMm: 3284, diameterMm: 28, radiusMm: 140, arcCentreUVmm: [310, 310],
    arcStartUVmm: [170, 310], arcEndUVmm: [310, 170], tailStartUVmm: [170, 930], tailEndUVmm: [930, 170],
  })
  for (const layer of compact.chordTurn.layers) {
    assert.equal(layer.verticalSurfaceGapAtCrossingMm, 0)
    assert.deepEqual(layer.crossings, [...Array(5).fill('u-tail'), ...Array(5).fill('v-tail')])
  }
  assert.ok(broad.chordTurn.layers.some(layer => layer.crossings.includes('bend')))
  assert.ok(broad.chordTurn.layers.some(layer => layer.crossings.includes(null)))
  assert.deepEqual(compact.chordTurn.nwPort, { overlap: true, portGapMm: -29 })
  assert.deepEqual(moved.chordTurn.nwPort, { overlap: false, portGapMm: 53 })
  assert.ok(moved.comparison.retainedNWPort.levels.some(layer => layer.minimumClearToFormedEdgeAfter5Mm < 0))
  assert.deepEqual(compact.chordTurn.layers, moved.chordTurn.layers)
  assert.deepEqual(compact.comparison.gravity, broad.comparison.gravity)
  const drawingPath = (result: typeof compact.chordTurn, prefix: string) =>
    result.drawing.primitives.filter(primitive => primitive.id.startsWith(prefix))
  assert.notDeepEqual(drawingPath(compact.chordTurn, 'h28-'), drawingPath(broad.chordTurn, 'h28-'))
  assert.deepEqual(drawingPath(compact.chordTurn, 'h28-'), drawingPath(moved.chordTurn, 'h28-'))
  assert.notDeepEqual(drawingPath(compact.chordTurn, 'floor-port-'), drawingPath(moved.chordTurn, 'floor-port-'))
  await assert.rejects(compile.northCollectorCase({ ...request.collector, chordBendRadiusMm: 0 }), /positive chord bend radius/)
  await assert.rejects(compile.northCollectorCase({ ...request.collector, chordBendRadiusMm: 761 }), /leaves the local collector legs/)
})

test('continuous port territory cannot fit the retained cage even with independently repositioned stations', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const request = await compile.readNorthCollectorCase()
  assert.ok('collector' in request)
  const [reference, moved, reduced] = await Promise.all([
    compile.northCollectorCase(request.collector),
    compile.northCollectorCase({ ...request.collector, portAxisXYMm: [649.5, 10927] }),
    compile.northCollectorCase({ ...request.collector, dragDemandFactor: 0.5 }),
  ])
  assert.ok(reference.status === 'computed-comparison' && moved.status === 'computed-comparison' && reduced.status === 'computed-comparison')
  assert.equal(reference.stationCapacity.state, 'required-station-count-excluded')
  assert.equal(reference.stationCapacity.requiredStationsPerGroup, 5)
  assert.deepEqual(reference.stationCapacity.groups.map(group => group.profiles.map(profile => profile.maximumStations)),
    [[4, 4], [7, 7], [5, 3], [7, 7]])
  for (const group of reference.stationCapacity.groups) {
    assert.ok(Math.abs(group.minimumStationPitchMm - 97.9825055) < 1e-7)
    for (const profile of group.profiles) {
      assert.equal(profile.maximumStations, profile.exampleStationCentresMm.length)
      for (const [index, station] of profile.exampleStationCentresMm.entries()) {
        assert.ok(profile.availableStationIntervalsMm.some(([low, high]) => station >= low && station <= high))
        if (index) assert.ok(station - profile.exampleStationCentresMm[index - 1] >= group.minimumStationPitchMm - 1e-9)
      }
    }
  }
  assert.ok(moved.stationCapacity.groups.every(group => group.profiles[1].maximumStations >= 5))
  assert.equal(moved.stationCapacity.state, 'required-shared-plane-gap-excluded')
  assert.ok(Math.abs(moved.stationCapacity.sharedPlanes[0].gapUpperBoundAfterSettingMm + 16.6494467) < 1e-7)
  assert.equal(moved.stationCapacity.sharedPlanes[0].requiredGapMm, 21)
  assert.deepEqual(moved.cabinetStationCapacity, reference.cabinetStationCapacity)
  const certificate = reference.cabinetStationCapacity
  assert.equal(certificate.admitted, false)
  assert.equal(certificate.state, 'excluded-throughout-territory')
  assert.deepEqual(certificate.centreBoundsUVmm, [250, 317, 197.5, 787.5])
  assert.equal(certificate.unresolvedWitnessBoxUVmm, null)
  assert.equal(certificate.cellsChecked, 2 * Object.values(certificate.resolvedCells).reduce((sum, count) => sum + count, 0) - 1)
  assert.equal(reduced.stationCapacity.state, 'placing-ranges-remain')
  assert.equal(reduced.cabinetStationCapacity.state, 'unresolved-cell')
  assert.ok(reduced.cabinetStationCapacity.unresolvedWitnessBoxUVmm)
  assert.deepEqual(reference.comparison.gravity, reduced.comparison.gravity)
})

test('added wall and web mass replays over the real north heads in adverse gravity only', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const request = await compile.readNorthCollectorCase()
  assert.ok('collector' in request)
  const reference = await compile.northCollectorCase(request.collector)
  assert.equal(reference.status, 'computed-comparison')
  assert.equal(Object.hasOwn(reference, 'deadLoadReplay'), false)
  const result = await compile.northCollectorCase({ ...request.collector, deadLoadReplay: { windIndex: 58 } })
  assert.ok(result.status === 'computed-comparison' && result.deadLoadReplay)
  const nominal = result.comparison.groundSplice.nominalDeadLoadDelta
  const near = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} differs from ${expected}`)
  assert.deepEqual(result.comparison, reference.comparison)
  assert.equal(nominal.admitted, false)
  assert.equal(result.deadLoadReplay.admitted, false)
  assert.equal(nominal.additionalFootprintMm2, 162000)
  assert.equal(nominal.geometryWithinRetainedReceivingProjection, true)
  assert.equal(nominal.corners.length, 2)
  for (const corner of nominal.corners) {
    assert.deepEqual(corner.verticalExtentZMm, [-180, 3170])
    near(corner.additionalConcreteM3, 0.53946)
    near(corner.additionalWebKg, 25.92)
    near(corner.characteristicKN, 13.7407752)
  }
  const [gravity, stripped, retained] = result.deadLoadReplay.states
  assert.deepEqual(result.deadLoadReplay.states.map(state => state.id), ['GQ+wind', 'stripped suction+wind', 'retained suction+wind'])
  assert.equal(result.deadLoadReplay.states.every(state => state.heads.length === 52), true)
  assert.equal(gravity.additionalGravityFactor, 1.35)
  const expected = [37.10009304, 222.60055824, 420.9291821538]
  gravity.deltaVerticalEquilibrium.forEach((component, index) => near(component, expected[index]))
  const affected = gravity.heads.filter(head => head.deltaVertical.some(component => Math.abs(component) > 1e-8))
  assert.deepEqual(affected.map(head => head.id), ['P07', 'P08', 'P09', 'P10', 'P11', 'P12'])
  near(affected[0].deltaVertical[0], 4.670798391627907)
  near(affected[5].baselineVertical[0], 659.6914368816067)
  near(affected[5].candidateVertical[0], 666.6310609457928)
  for (const control of [stripped, retained]) {
    assert.equal(control.additionalGravityFactor, 0)
    assert.deepEqual(control.candidateVerticalEquilibrium, control.baselineVerticalEquilibrium)
    assert.ok(control.heads.every(head => head.deltaVertical.every(component => component === 0)))
  }
  await assert.rejects(compile.northCollectorCase({
    ...request.collector, deadLoadReplay: { windIndex: 58, additionalGravityFactor: 1 },
  }), /north dead load/)
})
