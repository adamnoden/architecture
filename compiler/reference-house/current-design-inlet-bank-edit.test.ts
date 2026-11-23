import assert from 'node:assert/strict'
import test from 'node:test'
import {execFileSync} from 'node:child_process'
import {readGeorgianDesignSnapshot} from './current-design/georgian-source.js'
import {applyEngineeringEdit,beginEngineeringEdit,currentEngineeringReply,editableInletBankId,engineeringBase,engineeringTicket,replayEngineeringEdit,saveEngineeringEdit} from './current-design/engineering-edit.js'
import {readInletSourceEnvelopeCase,readLegacyIndoorBankControlSettings,runInletSourceEnvelopeCase} from './current-design/inlet-source-envelope.js'
import {readCurrentDesignResolution} from './current-design/resolve.js'
import {readEditorEngineeringDocument,runEditorEngineeringRequest} from '../../project/ade/browser-editor/engineering-api.js'
const edit=(state:ReturnType<typeof beginEngineeringEdit>,inputId:string,value:number,units='mm')=>applyEngineeringEdit(state,{schema:'current-engineering-edit/1',units,base:engineeringBase(state),operation:{kind:'set-inlet-bank-field',assemblyId:editableInletBankId,inputId,value}})
test('explicit saved bank edit shares compiler output, preserves roof/source controls, invalidates stale replies and reverses exactly',async()=>{
 const start=await readEditorEngineeringDocument(),resolved=readCurrentDesignResolution(),request=readInletSourceEnvelopeCase(resolved),
  doc={...start,stages:{...start.stages,inletSourceEnvelope:request.sourceEnvelope.settings}},state=beginEngineeringEdit(doc,'inlet-bank'),baseTicket=engineeringTicket(state,'base'),
  before=await runEditorEngineeringRequest({ticket:baseTicket})
 assert.equal(before.inletBank?.receiver.necessaryRouteOperationAndClampEnvelopeScreen,true)
 const changed=edit(state,'pipeJacketDensityComparisonKgM3',4000,'kg/m3')
 assert.equal(changed.status,'applied');if(changed.status!=='applied')return
 const ticket=engineeringTicket(changed.state,'density'),after=await runEditorEngineeringRequest({ticket})
 assert.equal(currentEngineeringReply(changed.state,baseTicket,before),undefined)
 assert.ok(currentEngineeringReply(changed.state,ticket,after))
 assert.ok(after.inletBank!.route.insulationAndJacketInventory.jacketDensityReferenceKg<before.inletBank!.route.insulationAndJacketInventory.jacketDensityReferenceKg)
 assert.deepEqual(after.inletBank!.sourceOnlyBound,before.inletBank!.sourceOnlyBound)
 assert.deepEqual(after.inletBank!.receiver.receivers,before.inletBank!.receiver.receivers)
 assert.deepEqual(after.roof,before.roof)
 assert.equal(after.inletBank!.receiver.nativeStructuralActionsAdopted,false)
 const undo=replayEngineeringEdit(changed.state,engineeringBase(changed.state),'undo')
 assert.equal(undo.status,'applied');if(undo.status==='applied')assert.equal(saveEngineeringEdit(undo.state),saveEngineeringEdit(state))
 assert.equal(edit(state,'pipeJacketDensityComparisonKgM3',4000).status,'rejected')
 assert.equal(edit(state,'sourceMaximumTotalBar',1).status,'rejected')
 assert.equal(edit(state,'indoorBankXMm',NaN).status,'rejected')
 assert.equal(edit(beginEngineeringEdit(start,'missing'),'indoorBankXMm',11360).status,'rejected')
})
test('legacy bank is an explicit current-method adverse control; old source7 request is unsupported',()=>{
 const resolved=readCurrentDesignResolution(),request=readInletSourceEnvelopeCase(resolved),legacy=runInletSourceEnvelopeCase(resolved,{...request.sourceEnvelope,settings:readLegacyIndoorBankControlSettings()})
 assert.equal(legacy.joinedDirection.room.indoorRoutes.necessaryStraightPipeGeometryAndBudgetComparison,true)
 assert.equal(legacy.joinedDirection.room.bankReceiver.necessaryRouteOperationAndClampEnvelopeScreen,false)
 assert.ok(legacy.joinedDirection.room.bankReceiver.receivers.every(v=>v.stripAfterTwoSettingsMm<0))
 assert.throws(()=>runInletSourceEnvelopeCase(resolved,{...request.sourceEnvelope,schema:'had-inlet-source-envelope-case/7'}),/Stale/)
})


test('the public inlet reader dispatches its explicit design through the shared current-source method',()=>{
 const request=readInletSourceEnvelopeCase(readCurrentDesignResolution())
 const actual=JSON.parse(execFileSync(process.execPath,['--import','tsx','scripts/compile-current-design.ts','--read-inlet-source-envelope','-'],{input:JSON.stringify(readGeorgianDesignSnapshot()),encoding:'utf8'}))
 assert.deepEqual(actual,request)
})
