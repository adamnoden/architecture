import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import test from 'node:test'
import {readEngineeringDocument} from './current-design/engineering-document.js'
import {readGeorgianDesignSnapshot} from './current-design/georgian-source.js'
import {applyEngineeringEdit,beginEngineeringEdit,editableWetSupportId,engineeringBase,replayEngineeringEdit,saveEngineeringEdit} from './current-design/engineering-edit.js'

test('a pad-width edit preserves every other stage, complete relative placement and exact undo',async()=>{
 const document=await readEngineeringDocument(readGeorgianDesignSnapshot()),proof=JSON.parse(readFileSync(new URL('../../project/str/studies/floor-section-proof.json',import.meta.url),'utf8')),
  support=proof.controls.find((c:any)=>c.nativeCaseId==='wet-aligned-quadrature8').executedRequest.wetSupport,
  state=beginEngineeringEdit({...document,stages:{...document.stages,floorSection:{thicknessMm:200,wetSupport:support}}},'pad-width'),
  transaction={schema:'current-engineering-edit/1',units:'mm',base:engineeringBase(state),operation:{kind:'set-wet-bearing-width',assemblyId:editableWetSupportId,widthMm:140}}
 const result=applyEngineeringEdit(state,transaction)
 assert.equal(result.status,'applied');if(result.status!=='applied')return
 assert.deepEqual(result.state.document.stages.floorSection,{thicknessMm:200,wetSupport:{...support,padWidthMm:140}})
 for(const[key,value]of Object.entries(document.stages))assert.deepEqual(result.state.document.stages[key],value)
 assert.equal(result.state.revision,state.revision+1)
 const undo=replayEngineeringEdit(result.state,engineeringBase(result.state),'undo')
 assert.equal(undo.status,'applied');if(undo.status==='applied')assert.equal(saveEngineeringEdit(undo.state),saveEngineeringEdit(state))
 for(const width of [0,-1,NaN,241])assert.equal(applyEngineeringEdit(state,{...transaction,operation:{...transaction.operation,widthMm:width}}).status,'rejected')
 assert.equal(applyEngineeringEdit(state,{...transaction,units:'m'}).status,'rejected')
 assert.equal(applyEngineeringEdit(state,{...transaction,operation:{...transaction.operation,derivedDemand:1}}).status,'rejected')
 assert.equal(applyEngineeringEdit(beginEngineeringEdit(document,'missing'),{...transaction,base:engineeringBase(beginEngineeringEdit(document,'missing'))}).status,'rejected')
})
