import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

test('current structural bridge is recomputed through the explicit compile on its actual supports', async () => {
  const input = readGeorgianDesignSnapshot()
  const receipt = JSON.parse(readFileSync(new URL('../../project/str/studies/current-house-bridge.json', import.meta.url), 'utf8'))
  const compile = prepareCurrentDesignCompile(input)
  const result = await compile.structuralBridge()
  assert.equal(result.status, 'computed-comparison')
  assert.deepEqual(result.source, compile.source)
  assert.deepEqual(result.native.comparison, receipt)
  assert.equal(result.native.installedAcceptance, false)
  assert.equal(result.native.sectionScreenPasses, true)
  assert.equal(result.native.comparison.members[0].capacityComparison[0].pass, false)
  const fromCli = JSON.parse(execFileSync(process.execPath, [
    '--import', 'tsx', 'scripts/compile-current-design.ts', '--structural-bridge', '-',
  ], { input: JSON.stringify(input), encoding: 'utf8' }))
  assert.deepEqual(fromCli, result)
})

test('moving the north end changes bending, torsion and deflection comparisons', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const reference = await compile.structuralBridge()
  const adjusted = await compile.structuralBridge([6100, 7730])
  assert.equal(reference.status, 'computed-comparison')
  assert.equal(adjusted.status, 'computed-comparison')
  assert.equal(adjusted.native.comparison.assumptions.axisSpanM, 1.63)
  assert.ok(Math.abs(adjusted.native.comparison.assumptions.actualClearSpanM - 1.03) < 1e-9)
  for (const [index, trial] of adjusted.native.comparison.members.entries()) {
    const before = reference.native.comparison.members[index].capacityComparison[0]
    const after = trial.capacityComparison[0]
    assert.ok(after.M > before.M)
    assert.ok(after.T > before.T)
    assert.ok(after.deflectionIncluding400microstrain > before.deflectionIncluding400microstrain)
  }
  assert.equal(adjusted.native.installedAcceptance, false)
  assert.equal(adjusted.diagnostics[0].code, 'BRIDGE_SCREEN_ONLY')
})

test('an outside axis, a closed clear span and an unbound candidate withhold structural results', async () => {
  const input = readGeorgianDesignSnapshot()
  const compile = prepareCurrentDesignCompile(input)
  for (const axes of [[6100, 7900], [6100, 6700], [6110, 7730]] as const) {
    const blocked = await compile.structuralBridge(axes)
    assert.equal(blocked.status, 'unavailable')
    assert.equal(blocked.diagnostics[0].code, 'BRIDGE_AXES_OUTSIDE_METHOD')
  }
  const candidate = await prepareCurrentDesignCompile({
    ...input,
    source: { kind: 'contrast-specimen', id: 'SPECIMEN-BRIDGE-TRIAL', state: 'candidate' },
  }).structuralBridge()
  assert.equal(candidate.status, 'unavailable')
  assert.equal(candidate.diagnostics[0].code, 'BRIDGE_REQUIRES_CURRENT_HAD')
})

test('the signed foundation projection reruns the actual 52-head comparison without accepting it', async () => {
  const input = readGeorgianDesignSnapshot()
  const compile = prepareCurrentDesignCompile(input)
  const result = await compile.structuralActions()
  assert.equal(result.status, 'computed-comparison')
  assert.deepEqual(result.source, compile.source)
  assert.equal(new Set(result.native.heads.map(head => head.id)).size, 52)
  assert.equal(new Set(result.native.coherentSignedStates.map(state => state.wind)).size, 96)
  assert.equal(result.native.admitted, false)
  assert.equal(Object.keys(result.method.inputs).length, 7)
  const candidate = await prepareCurrentDesignCompile({
    ...input,
    source: { kind: 'contrast-specimen', id: 'SPECIMEN-HEAD-TRIAL', state: 'candidate' },
  }).structuralActions()
  assert.equal(candidate.status, 'unavailable')
  assert.equal(candidate.diagnostics[0].code, 'HEAD_ACTIONS_REQUIRE_CURRENT_STR')
})

test('explicit signed load request recomputes shaft actions and checks the separate bridge joint', async () => {
  const design = readGeorgianDesignSnapshot()
  const compile = prepareCurrentDesignCompile(design)
  const request = await compile.readStructuralCase()
  assert.ok('case' in request)
  assert.equal(request.schema, 'str-structural-case-request/1')
  const baseline = await compile.structuralCase(request.case)
  const alteredRequest = {
    ...request,
    case: {
      ...request.case,
      combination: { id: 'stripped suction+wind', suctionFactor: 0.75 },
      joint: { ...request.case.joint, supportAxesYMm: [6100, 7730], sectionDepthMm: 200 },
    },
  }
  const altered = JSON.parse(execFileSync(process.execPath, [
    '--import', 'tsx', 'scripts/compile-current-design.ts', '--structural-case', '-',
  ], { input: JSON.stringify(alteredRequest), encoding: 'utf8' })) as typeof baseline
  assert.equal(baseline.status, 'computed-comparison')
  assert.equal(altered.status, 'computed-comparison')
  assert.equal(altered.foundation.native.heads.length, 52)
  const { heads, verticalEquilibrium, horizontalEquilibrium } = altered.foundation.native
  const sums = heads.reduce((sum, { xy: [x, y], actions: [n, cx, cy, vx, vy] }) => [
    sum[0] + n, sum[1] + n * x / 1000 + cx, sum[2] + n * y / 1000 + cy,
    sum[3] + vx, sum[4] + vy, sum[5] + (x * vy - y * vx) / 1000,
  ], [0, 0, 0, 0, 0, 0])
  assert.ok(sums.every((sum, i) => Math.abs(sum - [...verticalEquilibrium, ...horizontalEquilibrium][i]) < 0.005))
  assert.deepEqual(horizontalEquilibrium, baseline.foundation.native.horizontalEquilibrium)
  const oldTotals = baseline.foundation.native.verticalEquilibrium
  const oldSourceReceipt = JSON.parse(readFileSync(new URL('../../project/str/studies/current-house-joined-foundation.json', import.meta.url), 'utf8'))
  const retained = oldSourceReceipt.coherentSignedStates[request.case.windIndex].conservedStates['stripped suction+wind']
  assert.deepEqual(oldTotals.map(value => Number(value.toFixed(4))), retained.N_Xmoment_Ymoment)
  const suctionTotal = oldSourceReceipt.named_source_totals['uniform roof suction only'][0]
  assert.ok(Math.abs(verticalEquilibrium[0] - oldTotals[0] + 0.25 * suctionTotal) < 0.005)
  assert.ok(heads.some((head, i) => Math.abs(head.actions[0] - baseline.foundation.native.heads[i].actions[0]) > 1))
  assert.equal(altered.foundation.native.admitted, false)
  assert.equal(baseline.joint.clearSpanMm, 1000)
  assert.ok(Math.abs(altered.joint.clearSpanMm - 1030) < 1e-9)
  assert.ok(altered.joint.members.every(member => member.compareAtBothCovers.length === 2 &&
    member.compareAtBothCovers.every(row => row.depth === 200 && !row.pass)))
  assert.equal(altered.joint.installedAcceptance, false)
})

test('the versioned structural case rejects unbound design, material and unsupported combinations', async () => {
  const design = readGeorgianDesignSnapshot()
  const compile = prepareCurrentDesignCompile(design)
  const request = await compile.readStructuralCase()
  assert.ok('case' in request)
  assert.equal(request.schema, 'str-structural-case-request/1')
  await assert.rejects(compile.structuralCase({ ...request.case, planDigest: 'edited plan' }), /source binding/)
  await assert.rejects(compile.structuralCase({
    ...request.case, joint: { ...request.case.joint, materials: { concrete: 'C35', reinforcingSteel: 'S500' } },
  }), /material change/)
  await assert.rejects(compile.structuralCase({
    ...request.case, combination: { id: 'stripped suction+wind', suctionFactor: 1.01 },
  }), /outside the existing source envelope/)
  const edited = prepareCurrentDesignCompile({
    ...design,
    source: { kind: 'contrast-specimen', id: 'SPECIMEN-STRUCTURE-EDIT', state: 'candidate' },
    envelope: { ...design.envelope, widthMm: design.envelope.widthMm + 30 },
  })
  assert.equal((await edited.structuralCase(request.case)).status, 'unavailable')
})

test('current structural interface defaults omit retired details and predecessor system replays', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const request = await compile.readStructuralInterfaces()
  assert.ok('replay' in request)
  assert.deepEqual(request.replay.interfaces, [
    'outward-arch-widths', 'wall-load-transfers', 'north-cap-layer', 'north-floor-cage',
  ])
})

test('explicit historical structural interface replay preserves the actual floor, roof, wall and opening kernels', async () => {
  const design = readGeorgianDesignSnapshot()
  const compile = prepareCurrentDesignCompile(design)
  const request = await compile.readStructuralInterfaces()
  assert.ok('replay' in request)
  const historicalIds = [
    'north-floor-collar', 'north-roof-shoe', 'roof-action-route', 'roof-stiffness', 'floor-membrane', 'floor-stops',
  ]
  const explicitIds = [
    'north-floor-collar', 'north-roof-shoe', 'outward-arch-widths', 'roof-action-route', 'roof-stiffness',
    'floor-membrane', 'floor-stops', 'wall-load-transfers', 'north-cap-layer', 'north-floor-cage',
  ]
  const result = JSON.parse(execFileSync(process.execPath, [
    '--import', 'tsx', 'scripts/compile-current-design.ts', '--structural-interfaces', '-',
  ], { input: JSON.stringify({ ...request, replay: { ...request.replay, interfaces: explicitIds } }), encoding: 'utf8' })) as Awaited<ReturnType<typeof compile.structuralInterfaces>>
  assert.equal(result.status, 'recomputed-comparisons')
  assert.deepEqual(result.source, compile.source)
  const [floor, roof, arch] = result.interfaces
  assert.equal(floor.geometry.id, 'north-floor-collar')
  assert.deepEqual(floor.geometry.slabAndCollarZMm, [3170, 3370, 3415])
  assert.equal(floor.geometry.minimumWindowReserveMm, 107.5)
  assert.equal(roof.geometry.id, 'north-roof-shoe')
  assert.deepEqual(roof.geometry.slotXZMm, [60, 34])
  assert.deepEqual(roof.geometry.rodAxesXYMm, [[4340, 11667.5], [7660, 11667.5]])
  assert.equal(arch.geometry.id, 'outward-arch-widths')
  assert.deepEqual(arch.geometry.controls.map(control => control.widthMm), [160, 180])
  assert.ok(arch.geometry.controls.every(control => control.memberRecoveries > 0 && control.largestAdverseRatio > 1))
  assert.deepEqual(result.interfaces.map(row => row.geometry.id), explicitIds)
  assert.deepEqual(result.interfaces.filter(row => row.disposition.state === 'historical-comparison')
    .map(row => row.geometry.id), historicalIds)
  assert.ok(result.interfaces.filter(row => row.disposition.state === 'historical-comparison')
    .every(row => row.disposition.reason && row.disposition.source === 'project/str/floor-portal-reconciliation.md'))
  assert.ok(result.interfaces.every(row => row.successorProof === 'not-established'))
  assert.ok(result.interfaces.every(row => !row.installedAcceptance && row.method.blob && row.receipt.blob
    && Object.keys(row.inputs).length >= 1))
})

test('edited snapshots, stale bindings and unsupported interface IDs withhold native receipts', async () => {
  const design = readGeorgianDesignSnapshot()
  const compile = prepareCurrentDesignCompile(design)
  const request = await compile.readStructuralInterfaces()
  assert.ok('replay' in request)
  const invalidRequests = [
    { ...request.replay, bindingDigest: 'stale' },
    { ...request.replay, interfaces: ['north-floor-collar', 'unsupported'] },
    { ...request.replay, interfaces: ['north-floor-collar', 'north-floor-collar'] },
  ]
  for (const invalid of invalidRequests) {
    const result = await compile.structuralInterfaces(invalid)
    assert.equal(result.status, 'unavailable')
    assert.equal('interfaces' in result, false)
  }
  const edited = prepareCurrentDesignCompile({
    ...design,
    source: { kind: 'contrast-specimen', id: 'SPECIMEN-STRUCTURE-EDIT', state: 'candidate' },
    envelope: { ...design.envelope, widthMm: design.envelope.widthMm + 30 },
  })
  const result = await edited.structuralInterfaces(request.replay)
  assert.equal(result.status, 'unavailable')
  assert.equal('interfaces' in result, false)
})
