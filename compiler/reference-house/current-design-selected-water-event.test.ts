import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { resolveCurrentDesign } from './current-design/resolve.js'
import { prepareCurrentDesignCompile } from './current-design/compile.js'

const expected = readFileSync(new URL('../../project/rwt/studies/selected-water-event.json', import.meta.url), 'utf8')
const cli = (args: string[], input?: string) => spawnSync(process.execPath,
  ['--import', 'tsx', 'scripts/compile-current-design.ts', '--selected-water-event', ...args], { input, encoding: 'utf8' })

test('the accepted document runs the native selected event against the bound HAD and RWT inputs', async () => {
  const input = JSON.parse(JSON.stringify(readGeorgianDesignSnapshot()))
  const resolution = resolveCurrentDesign(input)
  const rwt = resolution.disciplineBindings.find(binding => binding.id === 'rwt-conditional-receiving')!
  const result = await prepareCurrentDesignCompile(input).selectedWaterEvent()
  assert.equal(result.event, expected)
  assert.equal(result.bindingDigest, rwt.digest)
  assert.deepEqual(result.source, rwt.applicability)
  const event = JSON.parse(result.event)
  for (const { path, blob } of [event.source, event.receivers.interface.source]) {
    assert.equal(blob, rwt.identities[path])
  }
  assert.equal(event.claimCeiling.hydraulicAdmission, false)
  assert.equal(event.claimCeiling.siteAccepted, false)

  const command = cli(['-'], JSON.stringify(input))
  assert.equal(command.status, 0, command.stderr)
  assert.equal(command.stdout, expected)
})

test('missing, stale and candidate inputs cannot emit a selected event', () => {
  const omitted = cli([])
  assert.equal(omitted.status, 1)
  assert.equal(omitted.stdout, '')
  assert.match(omitted.stderr, /Usage/)

  const stale = JSON.parse(JSON.stringify(readGeorgianDesignSnapshot()))
  stale.envelope.court.width -= 50
  const wrong = cli(['-'], JSON.stringify(stale))
  assert.equal(wrong.status, 1)
  assert.equal(wrong.stdout, '')
  assert.match(wrong.stderr, /differs from the current Georgian layout inputs/)

  stale.source = { kind: 'contrast-specimen', id: 'SPECIMEN-WATER', state: 'candidate' }
  const candidate = cli(['-'], JSON.stringify(stale))
  assert.equal(candidate.status, 1)
  assert.equal(candidate.stdout, '')
  assert.match(candidate.stderr, /requires an applicable RWT source/)
})
