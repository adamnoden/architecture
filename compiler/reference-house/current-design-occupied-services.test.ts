import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { deriveBoundOccupiedServiceHouse } from '../../project/had/studies/current-house-service-outputs.mjs'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { runOccupiedServiceDrawings } from './current-design/occupied-services.js'
import { resolveCurrentDesign } from './current-design/resolve.js'

const expectedSchedule = readFileSync(new URL('../../project/had/studies/current-house-services.json', import.meta.url), 'utf8')
const cli = (args: string[], input?: string) => spawnSync(process.execPath,
  ['--import', 'tsx', 'scripts/compile-current-design.ts', '--occupied-services', ...args], { input, encoding: 'utf8' })
const drawingCli = (input: unknown) => spawnSync(process.execPath,
  ['--import', 'tsx', 'scripts/compile-current-design.ts', '--occupied-service-drawings', '-'], {
    input: JSON.stringify(input), encoding: 'utf8',
  })

test('the explicit current schedule uses the actual HAD compositor and all seventeen bound receipts', async () => {
  const input = JSON.parse(JSON.stringify(readGeorgianDesignSnapshot()))
  const resolved = resolveCurrentDesign(input)
  const had = resolved.disciplineBindings.find(binding => binding.id === 'had-occupied-services')!
  const result = await prepareCurrentDesignCompile(input).occupiedServices()
  assert.equal(result.schedule, expectedSchedule)
  assert.equal(result.bindingDigest, had.digest)
  const { scope, ...requestSource } = result.source
  const { scope: boundRequestScope, ...boundRequestSource } = had.applicability
  assert.deepEqual(requestSource, boundRequestSource)
  assert.notEqual(scope, boundRequestScope, 'Source binding must not masquerade as exact nominal-plan correspondence')
  assert.equal(result.applicability.nominalPlanApplicability.state, 'withheld-for-source-correspondence')
  assert.deepEqual(result.stairCorrespondence.deltaXYWHMm, [0, 600, 0, 0])
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

test('the current drawing compiler and native checked producer reproduce all occupied-service SVGs', async () => {
  const design = readGeorgianDesignSnapshot()
  const compile = prepareCurrentDesignCompile(design)
  const result = await compile.occupiedServiceDrawings()
  const schedule = await compile.occupiedServices()
  assert.equal(result.schema, 'had-occupied-service-drawings/1')
  assert.deepEqual(result.source, schedule.source)
  assert.equal(result.bindingDigest, schedule.bindingDigest)
  assert.deepEqual(Object.keys(result.drawings), ['current-house-services.svg', 'store-exchange.svg', 'selected-service-interfaces.svg'])
  for (const [filename, svg] of Object.entries(result.drawings)) {
    assert.equal(svg, readFileSync(new URL(`../../project/had/studies/${filename}`, import.meta.url), 'utf8'))
  }
  const actual = drawingCli(design)
  assert.equal(actual.status, 0, actual.stderr)
  assert.deepEqual(JSON.parse(actual.stdout), result)
  const native = spawnSync(process.execPath, ['project/had/studies/current-house-service-outputs.mjs', '--check'], { encoding: 'utf8' })
  assert.equal(native.status, 0, native.stderr)
})

test('unbound candidate, altered input receipts and stale renderers cannot publish drawings', () => {
  const design = readGeorgianDesignSnapshot()
  const draft = { ...design, source: { kind: 'contrast-specimen', id: 'SPECIMEN-SERVICE-DRAWINGS', state: 'candidate' } }
  const candidate = drawingCli(draft)
  assert.equal(candidate.status, 1)
  assert.equal(candidate.stdout, '')
  assert.match(candidate.stderr, /requires an applicable selected HAD source/)

  const resolved = resolveCurrentDesign(design)
  const binding = resolved.disciplineBindings.find(item => item.id === 'had-occupied-services')!
  const firstReceipt = Object.keys(binding.inputReceiptIdentities)[0]
  assert.throws(() => deriveBoundOccupiedServiceHouse({ ...binding,
    inputReceiptIdentities: { ...binding.inputReceiptIdentities, [firstReceipt]: '0'.repeat(40) },
  }), /outside the resolved HAD source binding/)
  const renderer = 'project/had/studies/selected-service-plate.mjs'
  assert.throws(() => runOccupiedServiceDrawings({ ...resolved, disciplineBindings: [{ ...binding,
    identities: { ...binding.identities, [renderer]: '0'.repeat(40) },
  }] }), /method is unbound or stale at project\/had\/studies\/selected-service-plate.mjs/)
})
