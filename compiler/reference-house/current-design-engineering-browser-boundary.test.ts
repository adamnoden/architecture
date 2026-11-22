import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import test from 'node:test'
import { build } from 'vite'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

test('browser engineering edits initialize without Node globals and retain lighting admission, reversal and stale-reply checks', async () => {
  const output = await build({
    configFile: false, logLevel: 'silent',
    define: { 'import.meta.url': JSON.stringify('https://house.example/assets/engineering.js') },
    build: { write: false, minify: false, lib: {
      entry: fileURLToPath(new URL('./current-design/engineering-edit.ts', import.meta.url)),
      formats: ['iife'], name: 'EngineeringAuthoring',
    } },
  })
  const bundles = Array.isArray(output) ? output : [output]
  const script = bundles.flatMap(bundle => {
    assert.ok('output' in bundle)
    return bundle.output.filter(item => item.type === 'chunk').map(item => item.code)
  }).join('\n')
  const document = { schema: 'current-engineering-document/1', design: readGeorgianDesignSnapshot(), bindings: {}, stages: {
    roofPitch: { pitchDeg: 25 }, studyRoomKit: { pitchMm: 300 }, studyLighting: {
      arrangement: 'lamps-with-wall', socketCentreZMm: 600, serviceTotalDepthMm: 75,
      lampHand: 'left', failedSourceId: null, finishTrial: 'crafted-oak', automationConnected: false, localWallModule: true,
    },
  } }
  // Deliberately no process, require, Buffer or filesystem. The same production
  // browser entry must load before any HTTP/compiler response can be requested.
  const result = runInNewContext(`${script}\n(() => {
    const api = EngineeringAuthoring, document = JSON.parse(inputJson)
    const state = api.beginEngineeringEdit(document, 'browser-regression')
    const ticket = api.engineeringTicket(state, 'before-edit')
    const transaction = totalDepthMm => ({ schema: 'current-engineering-edit/1', units: 'mm', base: api.engineeringBase(state),
      operation: { kind: 'set-lighting-service-depth', assemblyId: api.editableStudyLightingId, totalDepthMm } })
    const changed = api.applyEngineeringEdit(state, transaction(85))
    if (changed.status !== 'applied') throw new Error(changed.message)
    const undo = api.replayEngineeringEdit(changed.state, api.engineeringBase(changed.state), 'undo')
    if (undo.status !== 'applied') throw new Error(undo.message)
    return { depth: changed.state.document.stages.studyLighting.serviceTotalDepthMm,
      roofUnchanged: changed.state.document.stages.roofPitch.pitchDeg === document.stages.roofPitch.pitchDeg,
      adverseRejected: api.applyEngineeringEdit(state, transaction(101)).status === 'rejected',
      staleIgnored: api.currentEngineeringReply(changed.state, api.engineeringTicket(changed.state, 'after-edit'), { ticket }) === undefined,
      restored: api.saveEngineeringEdit(undo.state) === api.saveEngineeringEdit(state),
      originalUnchanged: state.document.stages.studyLighting.serviceTotalDepthMm === 75 }
  })()`, { inputJson: JSON.stringify(document), structuredClone, URL }, { timeout: 1000 })
  assert.deepEqual(JSON.parse(JSON.stringify(result)), { depth: 85, roofUnchanged: true, adverseRejected: true,
    staleIgnored: true, restored: true, originalUnchanged: true })
})
