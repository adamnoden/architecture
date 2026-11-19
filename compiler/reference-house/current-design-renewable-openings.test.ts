import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { compileRenewableOpenings } from './current-design/assemblies/renewable-openings.js'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { readCurrentDesignResolution } from './current-design/resolve.js'

const root = new URL('../../', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, root))
const design = readGeorgianDesignSnapshot()
const widthCase = (widthMm: number) => ({ schema: 'oas-study-width-case/1', widthMm })

test('accepted basis reuses ADE Study occurrence, OAS dry profiles and the separate HAD paired-door method', async () => {
  const result = await prepareCurrentDesignCompile(design).renewableOpenings()
  assert.deepEqual(result.window.opening, {
    id: 'GROUND/south-window-0', hostId: 'GROUND/outer-south',
    nominalCentreMm: 1800, occupiedCentreMm: 2100, nativeWidthMm: 1000, widthMm: 1000,
  })
  assert.equal(result.window.fixedFrameWidthMm, 922)
  assert.deepEqual(result.window.schedule.map(row => [row.remainingFrameWidth, row.nominalDryReleaseAfterSettings, row.retainedFrameClearanceEachJamb, row.fit]),
    [[914, 1, -4, 'fixed-frame-conflict'], [904, 4, -9, 'fixed-frame-conflict']])
  assert.deepEqual(result.window.release, { state: 'native-half-head-only', inwardStrokeMm: 250, pocketReserveMm: 2 })
  assert.equal(result.door.id, 'HAD/southCourtWeatherDoor')
  assert.deepEqual(result.door.schedule, { leaves: 2, leafDimensionsMm: [845.5, 44, 2100], sillClearanceMm: 4, beyondOpenLeafMm: 650 })
  assert.equal(result.door.release.leaves.northStrokeMm, 500)
  assert.equal(result.door.release.pan.northStrokeMm, 500)
  assert.equal(result.door.release.geometryProof.pass, true)
  assert.ok(result.door.release.geometryProof.bodyReserve > 28 && result.door.release.geometryProof.bodyReserve < 29)
  assert.equal(result.door.drawing.svg, read(result.door.drawing.path).toString('utf8'))
})

test('one versioned width input changes the CLI drawing, schedule and fixed-frame clearances together', async () => {
  const compile = prepareCurrentDesignCompile(design)
  const baseline = await compile.renewableOpenings()
  const actual = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--renewable-openings', '-'], {
    cwd: root, input: JSON.stringify({ schema: 'renewable-opening-request/1', design, study: widthCase(1020) }), encoding: 'utf8',
  }))
  assert.deepEqual(actual.window.schedule.map((row: (typeof baseline.window.schedule)[number]) =>
    [row.remainingFrameWidth, row.retainedFrameClearanceEachJamb, row.fit]),
    [[934, 6, 'jamb-screen-only'], [924, 1, 'jamb-screen-only']])
  assert.equal(actual.window.fixedFrameWidthMm, 922)
  assert.match(actual.window.jambSvg, /width="1020"/)
  assert.match(actual.window.jambSvg, /width="934"/)
  assert.match(actual.window.jambSvg, /width="922"/)
  assert.notEqual(actual.window.jambSvg, baseline.window.jambSvg)
  assert.deepEqual(actual.window.release, { state: 'withheld-for-width-change', code: 'NATIVE_HEAD_AND_HANDLING_NOT_RESIZED' })
  assert.deepEqual(actual.door, baseline.door)
})

test('reject unbound candidate snapshots, wrong case fields and independently changed native receipt paths', async () => {
  const candidate = { ...design, source: { kind: 'contrast-specimen', id: 'SPECIMEN-OPENING-TEST', state: 'candidate' } }
  await assert.rejects(prepareCurrentDesignCompile(candidate).renewableOpenings(), /exact accepted/)
  const resolved = readCurrentDesignResolution()
  assert.throws(() => compileRenewableOpenings(resolved, { ...widthCase(1020), frameWidthMm: 920 }), /versioned Study width case/)
  assert.throws(() => compileRenewableOpenings(resolved, widthCase(NaN)), /whole millimetres/)
  assert.throws(() => compileRenewableOpenings(resolved, widthCase(60)), /No nominal frame width/)
  const tamper = (victim: string) => (path: string) => path === victim ? Buffer.concat([read(path), Buffer.from(' ')]) : read(path)
  assert.throws(() => compileRenewableOpenings(resolved, undefined, tamper('project/oas/studies/study-subframe.json')), /comparison receipt changed/)
  assert.throws(() => compileRenewableOpenings(resolved, undefined, tamper('project/bcr/studies/bay-interface-study.json')), /provenance disagrees/)
  assert.throws(() => compileRenewableOpenings(resolved, undefined, tamper('project/had/studies/water-replan.json')), /OAS occupied-house input changed/)
  assert.throws(() => compileRenewableOpenings(resolved, undefined, tamper('project/had/studies/south-court-threshold.svg')), /native drawing changed/)
})
