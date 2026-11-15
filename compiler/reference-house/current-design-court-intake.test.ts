import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

function cli(mode: string, input: unknown) {
  return spawnSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', mode, '-'],
    { input: JSON.stringify(input), encoding: 'utf8' })
}

test('the explicit current intake case reuses the native selected-event result and actual opening plane', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const request = await compile.readCourtIntakeCase()
  const result = await compile.courtIntake(request.intake)
  const retained = JSON.parse(readFileSync(new URL('../../project/rwt/studies/selected-water-event.json', import.meta.url), 'utf8'))
  const native = retained.inlet.lossCases.find((row: { lossK: number; remainingFraction: number }) =>
    row.lossK === request.intake.lossK && row.remainingFraction === 1)
  assert.equal(result.calculation.capacityAtQuietLps, native.capacityAtQuietLps)
  assert.equal(result.calculation.requiredStageMm, native.requiredStageMm)
  assert.equal(result.calculation.assignedFlowLps, retained.duty.flowLps)
  assert.equal(result.source.planDigest, compile.source.planDigest)
  assert.deepEqual(result.method.entryPoints, ['mouthFlow', 'mouthStage'])

  const exported = cli('--read-court-intake', readGeorgianDesignSnapshot())
  assert.equal(exported.status, 0, exported.stderr)
  assert.deepEqual(JSON.parse(exported.stdout), request)
  const compiled = cli('--court-intake', request)
  assert.equal(compiled.status, 0, compiled.stderr)
  assert.deepEqual(JSON.parse(compiled.stdout), result)
})

test('narrowing the actual opening changes its diagram, capacity and evidence with the source geometry held', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const { intake } = await compile.readCourtIntakeCase()
  const original = await compile.courtIntake(intake)
  const [[a, b], ...rest] = intake.route.intervalsYMm
  const edited = await compile.courtIntake({ ...intake, route: { intervalsYMm: [[a, b - 25], ...rest] } })

  assert.equal(edited.calculation.widthMm, original.calculation.widthMm - 25)
  assert.ok(edited.calculation.capacityAtQuietLps < original.calculation.capacityAtQuietLps)
  assert.ok(edited.calculation.remainingCapacityLps < original.calculation.remainingCapacityLps)
  assert.notEqual(edited.source.caseDigest, original.source.caseDigest)
  assert.equal(edited.source.bindingDigest, original.source.bindingDigest)
  assert.deepEqual(edited.drawing.primitives.filter(p => p.id.startsWith('source-aperture')),
    original.drawing.primitives.filter(p => p.id.startsWith('source-aperture')))
  const stroke = edited.drawing.primitives.find(p => p.id === 'trial-aperture-0')
  assert.ok(stroke?.kind === 'line')
  const scale = edited.drawing.scaleDenominator
  assert.equal(scale, 10)
  assert.equal(Math.abs(stroke.b.y - stroke.a.y) * scale, b - a - 25)
  assert.equal(stroke.metadata?.xMm, intake.port.xMm)
})

test('blocked and out-of-domain cases earn no route capacity or invented geometry', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const { intake } = await compile.readCourtIntakeCase()
  const blocked = await compile.courtIntake({ ...intake, route: { intervalsYMm: [] } })
  assert.equal(blocked.status, 'blocked')
  assert.equal(blocked.calculation.capacityAtQuietLps, 0)
  assert.equal(blocked.calculation.requiredStageMm, null)
  assert.ok(blocked.drawing.primitives.every(p => p.id.startsWith('source-aperture')))
  const [[a], [, b]] = intake.route.intervalsYMm
  await assert.rejects(compile.courtIntake({ ...intake, route: { intervalsYMm: [[a, b]] } }), /may narrow the source apertures/)
  await assert.rejects(compile.courtIntake({ ...intake, bindingDigest: 'superseded' }), /Stale court intake case source binding/)
  await assert.rejects(compile.courtIntake({ ...intake, quietStageMm: intake.quietStageMm + 1 }), /below the source allocation/)
})
