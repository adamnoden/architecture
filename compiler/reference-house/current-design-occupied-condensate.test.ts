import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
const request = compile.readOccupiedCondensateCase()
const cli = (mode: string, input: unknown) => spawnSync(process.execPath,
  ['--import', 'tsx', 'scripts/compile-current-design.ts', mode, '-'],
  { input: JSON.stringify(input), encoding: 'utf8' })

test('the current ground WC case replays the exact selected schedule, measured shell and outdoor cartridge', async () => {
  const input = await request
  const result = await compile.occupiedCondensate(input.condensate)
  const current = readFileSync(new URL('../../project/had/studies/current-house-services.json', import.meta.url), 'utf8')
  assert.equal(result.trialSchedule, current)
  assert.equal((await compile.occupiedServices()).schedule, current)
  assert.equal(result.source.nativeReplay, true)
  assert.equal(result.status, 'within-screened-geometry')
  assert.deepEqual(result.calculation.port.point, [9130, 0, 2700])
  assert.equal(result.calculation.port.formedDiameterMm, 40)
  assert.equal(result.calculation.weatherFaceMm, 25)
  assert.equal(result.calculation.roomToolMm, 565.44)
  assert.equal(result.calculation.drawMm, 805)
  assert.equal(result.diagnostics[0].code, 'ASSEMBLED_OPERATION_UNQUALIFIED')
  const exported = cli('--read-occupied-condensate', input.design)
  assert.equal(exported.status, 0, exported.stderr)
  assert.deepEqual(JSON.parse(exported.stdout), input)
  const compiled = cli('--occupied-condensate', input)
  assert.equal(compiled.status, 0, compiled.stderr)
  assert.deepEqual(JSON.parse(compiled.stdout), result)
})

test('lowering the built condensate tail changes its tool requirement, schedule and projected route together', async () => {
  const input = await request
  const before = await compile.occupiedCondensate(input.condensate)
  const trial = await compile.occupiedCondensate({ ...input.condensate, portLevelMm: 2675 })
  assert.equal(trial.status, 'within-screened-geometry')
  assert.equal(trial.source.nativeReplay, false)
  assert.equal(trial.source.bindingDigest, before.source.bindingDigest)
  assert.notEqual(trial.source.caseDigest, before.source.caseDigest)
  assert.deepEqual(trial.calculation.route.slice(-2), [[9130, 800, 2683], [9130, 0, 2675]])
  assert.deepEqual(trial.calculation.fall.at(-1), {horizontalMm: 800, fallMm: 8})
  assert.equal(trial.calculation.drainToExhaustMm, 29)
  assert.equal(trial.calculation.roomToolMm, 551.17)
  assert.deepEqual(trial.calculation.outletIndoorToolTarget, [9130, 505, 2666.05])
  const schedule = JSON.parse(trial.trialSchedule!)
  assert.equal(schedule.architecturalServiceSelected, false)
  assert.equal(schedule.qualifiedPhysical, false)
  const selected = schedule.selectedServiceInterfaces
  assert.deepEqual(selected.ports.find((port: {id: string}) => port.id === input.condensate.portId).point, [9130, 0, 2675])
  assert.deepEqual(selected.weatherFaces.find((port: {id: string}) => port.id === input.condensate.portId).point, [9130, 0, 2675])
  const terminal = selected.wallTerminalRenewal.find((port: {id: string}) => port.id === 'ground-WC')
  assert.deepEqual(terminal.renewal.cartridges.find((port: {id: string}) => port.id === input.condensate.portId).wallAxis, [9130, 0, 2675])
  const selectedStroke = before.drawing.primitives.find(p => p.id === 'selected-formed-sleeve')
  const trialStroke = trial.drawing.primitives.find(p => p.id === 'trial-formed-sleeve')
  assert.ok(selectedStroke?.kind === 'line' && trialStroke?.kind === 'line')
  const scale = trial.drawing.scaleDenominator
  assert.equal(scale, 10)
  assert.equal((trialStroke.a.y - selectedStroke.a.y) * scale, 25)
})

test('fall and socket reach block different states and stale or unsupported ports cannot replay', async () => {
  const { condensate } = await request
  const socket = await compile.occupiedCondensate({ ...condensate, portLevelMm: 2760 })
  assert.equal(socket.status, 'blocked-geometry')
  assert.equal(socket.trialSchedule, null)
  assert.equal(socket.calculation.roomToolMm, 602.53)
  assert.deepEqual(socket.diagnostics.filter(item => item.severity === 'blocking').map(item => item.code), ['SOCKET_REACH_EXCEEDED'])
  const fall = await compile.occupiedCondensate({ ...condensate, portLevelMm: 2785 })
  assert.equal(fall.trialSchedule, null)
  assert.ok(fall.diagnostics.some(item => item.code === 'OUTWARD_FALL_REVERSED'))
  await assert.rejects(compile.occupiedCondensate({ ...condensate, portLevelMm: 2900 }), /within 100 mm/)
  await assert.rejects(compile.occupiedCondensate({ ...condensate, portId: 'utility-condensate' }), /only the selected ground WC condensate/i)
  await assert.rejects(compile.occupiedCondensate({ ...condensate, bindingDigest: 'stale' }), /stale occupied condensate case/i)
})
