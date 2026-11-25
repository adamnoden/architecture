import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import { readFileSync } from 'node:fs'
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
    roofPitch: { pitchDeg: 25 }, floorSection: { thicknessMm: 200, wetSupport: {}, cageComparison: {schema:'str-wet-support-cage-comparison/1',postTopLevelRaiseMm:10},
      beamEndDevelopment:{endReturnMandrelMm:80,strutCotangentComparisons:[1,2.5]} },
    inletSourceEnvelope: { splitPlantRoom: JSON.parse(readFileSync(new URL('../../project/had/studies/inlet-split-plant-room-candidate.json', import.meta.url), 'utf8')) },
    studyRoomKit: { pitchMm: 300 }, studyLighting: {
      arrangement: 'lamps-with-wall', socketCentreZMm: 600, serviceTotalDepthMm: 75,
      lampHand: 'left', failedSourceId: null, finishTrial: 'crafted-oak', automationConnected: false, localWallModule: true,
    },
  } }
  // Deliberately no process, require, Buffer or filesystem. The same production
  // browser entry must load before any HTTP/compiler response can be requested.
  // The document contract is plain JSON. Clone inside this browser realm;
  // injecting Node's structuredClone would manufacture foreign prototypes.
  const result = runInNewContext(`const structuredClone = value => JSON.parse(JSON.stringify(value));\n${script}\n(() => {
    const api = EngineeringAuthoring, document = JSON.parse(inputJson)
    const state = api.beginEngineeringEdit(document, 'browser-regression')
    const ticket = api.engineeringTicket(state, 'before-edit')
    const transaction = totalDepthMm => ({ schema: 'current-engineering-edit/1', units: 'mm', base: api.engineeringBase(state),
      operation: { kind: 'set-lighting-service-depth', assemblyId: api.editableStudyLightingId, totalDepthMm } })
    const changed = api.applyEngineeringEdit(state, transaction(85))
    if (changed.status !== 'applied') throw new Error(changed.message)
    const undo = api.replayEngineeringEdit(changed.state, api.engineeringBase(changed.state), 'undo')
    if (undo.status !== 'applied') throw new Error(undo.message)
    const contour = { execution: 'deferred', pitchMm: 140, youngKNPerM2: 33000000, poisson: .2, slabVolumeLoadEquivalentKPa: 0 }
    const contourTransaction = settings => ({ schema: 'current-engineering-edit/1', units: 'mm', base: api.engineeringBase(state),
      operation: { kind: 'set-floor-contour-comparison', assemblyId: api.editableFloorSectionId, settings } })
    const contourEdit = api.applyEngineeringEdit(state, contourTransaction(contour))
    if (contourEdit.status !== 'applied') throw new Error(contourEdit.message)
    const contourUndo = api.replayEngineeringEdit(contourEdit.state, api.engineeringBase(contourEdit.state), 'undo')
    if (contourUndo.status !== 'applied') throw new Error(contourUndo.message)
    const endTransaction = (endReturnMandrelMm, extra={}) => ({schema:'current-engineering-edit/1',units:'mm',base:api.engineeringBase(state),
      operation:{kind:'set-wet-beam-end-mandrel',assemblyId:api.editableWetBeamEndId,endReturnMandrelMm,...extra}})
    const endEdit=api.applyEngineeringEdit(state,endTransaction(100))
    if(endEdit.status!=='applied')throw new Error(endEdit.message)
    const endUndo=api.replayEngineeringEdit(endEdit.state,api.engineeringBase(endEdit.state),'undo')
    if(endUndo.status!=='applied')throw new Error(endUndo.message)
    const plantTransaction = (inputId, value) => ({ schema: 'current-engineering-edit/1', units: 'mm', base: api.engineeringBase(state),
      operation: { kind: 'set-plant-room-field', assemblyId: api.editablePlantRoomId, inputId, value } })
    const plantEdit = api.applyEngineeringEdit(state, plantTransaction('clearWidthMm', 350))
    if (plantEdit.status !== 'applied') throw new Error(plantEdit.message)
    const plantUndo = api.replayEngineeringEdit(plantEdit.state, api.engineeringBase(plantEdit.state), 'undo')
    if (plantUndo.status !== 'applied') throw new Error(plantUndo.message)
    return {endMandrel:endEdit.state.document.stages.floorSection.beamEndDevelopment.endReturnMandrelMm,
      endRejected:[47,200,NaN].every(value=>api.applyEngineeringEdit(state,endTransaction(value)).status==='rejected'),
      endInjectionRejected:api.applyEngineeringEdit(state,endTransaction(100,{accepted:true})).status==='rejected',
      endUnchangedControl:JSON.stringify(endEdit.state.document.stages.floorSection.cageComparison)===JSON.stringify(state.document.stages.floorSection.cageComparison),
      endNoOp:api.applyEngineeringEdit(state,endTransaction(80)).state===state,
      endRestored:api.saveEngineeringEdit(endUndo.state)===api.saveEngineeringEdit(state),
      endStaleIgnored:api.currentEngineeringReply(endEdit.state,api.engineeringTicket(endEdit.state,'after-end'),{ticket})===undefined,
      depth: changed.state.document.stages.studyLighting.serviceTotalDepthMm,
      plantWidth: plantEdit.state.document.stages.inletSourceEnvelope.splitPlantRoom.clearWidthMm,
      plantRejected: api.applyEngineeringEdit(state, plantTransaction('selected', 1)).status === 'rejected',
      plantRestored: api.saveEngineeringEdit(plantUndo.state) === api.saveEngineeringEdit(state),
      contourAdmitted: contourEdit.state.document.stages.floorSection.contourComponent.pitchMm === 140,
      contourRejected: api.applyEngineeringEdit(state, contourTransaction({ ...contour, matrix: [] })).status === 'rejected',
      contourRestored: api.saveEngineeringEdit(contourUndo.state) === api.saveEngineeringEdit(state),
      roofUnchanged: changed.state.document.stages.roofPitch.pitchDeg === document.stages.roofPitch.pitchDeg,
      adverseRejected: api.applyEngineeringEdit(state, transaction(101)).status === 'rejected',
      staleIgnored: api.currentEngineeringReply(changed.state, api.engineeringTicket(changed.state, 'after-edit'), { ticket }) === undefined,
      restored: api.saveEngineeringEdit(undo.state) === api.saveEngineeringEdit(state),
      originalUnchanged: state.document.stages.studyLighting.serviceTotalDepthMm === 75 }
  })()`, { inputJson: JSON.stringify(document), URL }, { timeout: 1000 })
  assert.deepEqual(JSON.parse(JSON.stringify(result)), {endMandrel:100,endRejected:true,endInjectionRejected:true,endUnchangedControl:true,endNoOp:true,endRestored:true,endStaleIgnored:true, depth: 85, plantWidth: 350, plantRejected: true, plantRestored: true,
    contourAdmitted: true, contourRejected: true, contourRestored: true,
    roofUnchanged: true, adverseRejected: true,
    staleIgnored: true, restored: true, originalUnchanged: true })
})
