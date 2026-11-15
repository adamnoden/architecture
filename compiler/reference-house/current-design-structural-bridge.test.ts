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
