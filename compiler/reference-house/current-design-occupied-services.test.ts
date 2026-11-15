import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { resolveCurrentDesign } from './current-design/resolve.js'

const expectedSchedule = readFileSync(new URL('../../project/had/studies/current-house-services.json', import.meta.url), 'utf8')
const cli = (args: string[], input?: string) => spawnSync(process.execPath,
  ['--import', 'tsx', 'scripts/compile-current-design.ts', '--occupied-services', ...args], { input, encoding: 'utf8' })

test('the explicit current schedule uses the actual HAD compositor and all seventeen bound receipts', async () => {
  const input = JSON.parse(JSON.stringify(readGeorgianDesignSnapshot()))
  const resolved = resolveCurrentDesign(input)
  const had = resolved.disciplineBindings.find(binding => binding.id === 'had-occupied-services')!
  const result = await prepareCurrentDesignCompile(input).occupiedServices()
  assert.equal(result.schedule, expectedSchedule)
  assert.equal(result.bindingDigest, had.digest)
  assert.deepEqual(result.source, had.applicability)
  const schedule = JSON.parse(result.schedule)
  assert.equal(Object.keys(schedule.sources).length, 17)
  assert.deepEqual(schedule.sources, had.inputReceiptIdentities)
  assert.equal(schedule.structurallyAdopted, false)
  assert.equal(schedule.qualifiedPhysical, false)
  const command = cli(['-'], JSON.stringify(input))
  assert.equal(command.status, 0, command.stderr)
  assert.equal(command.stdout, expectedSchedule)
})

test('missing, stale and candidate inputs cannot emit a selected service schedule', () => {
  const omitted = cli([])
  assert.equal(omitted.status, 1)
  assert.equal(omitted.stdout, '')
  assert.match(omitted.stderr, /Usage/)

  const stale = JSON.parse(JSON.stringify(readGeorgianDesignSnapshot()))
  stale.storeys.GROUND.openings[0].widthMm -= 100
  const wrong = cli(['-'], JSON.stringify(stale))
  assert.equal(wrong.status, 1)
  assert.equal(wrong.stdout, '')
  assert.match(wrong.stderr, /differs from the current Georgian layout inputs/)

  stale.source = { kind: 'contrast-specimen', id: 'SPECIMEN-SERVICES', state: 'candidate' }
  const candidate = cli(['-'], JSON.stringify(stale))
  assert.equal(candidate.status, 1)
  assert.equal(candidate.stdout, '')
  assert.match(candidate.stderr, /requires an applicable selected HAD source/)
})
