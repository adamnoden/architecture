import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import test from 'node:test'
import {applyEngineeringEdit,beginEngineeringEdit,editableRearBearingId,engineeringBase,replayEngineeringEdit,saveEngineeringEdit} from './current-design/engineering-edit.js'
import {readRearBearingSettings} from './current-design/structural-rear-bearing.js'

const rear=readRearBearingSettings({mode:'direct-masonry-short-rc-lintel',openingYMm:[9100,10950],lintelWidthMm:200,lintelDepthMm:300,
 bearingLengthMm:200,jointThicknessMm:10,jointNormalComplianceMmPerMPa:.1,masonryUnitWeightKNPerM3:20,concreteUnitWeightKNPerM3:25,
 jointUnitWeightKNPerM3:20,maxBeamPitchMm:500,bearingQuadratureOrder:4,execution:'deferred'})
function document(){
 const d=JSON.parse(readFileSync(new URL('../../project/ccr/studies/working-house-comparison.json',import.meta.url),'utf8'))
 assert.equal(d.stages.floorSection.thicknessMm,200);assert.ok(d.stages.floorSection.wetSupport)
 d.stages.floorSection={...d.stages.floorSection,finiteJointComparison:{...d.stages.floorSection.finiteJointComparison,enabled:true,execution:'deferred'},rearBearingComparison:structuredClone(rear)}
 return d
}
function edit(state:ReturnType<typeof beginEngineeringEdit>,openingWidthMm=1900,execution='deferred',extra={}){
 return applyEngineeringEdit(state,{schema:'current-engineering-edit/1',units:'mm',base:engineeringBase(state),
  operation:{kind:'set-floor-rear-bearing-comparison',assemblyId:editableRearBearingId,openingWidthMm,execution,...extra}})
}
test('rear opening and execution edits retain the same centre, native inputs and all other choices; undo is exact',()=>{
 const d=document(),s=beginEngineeringEdit(d,'rear-atomic'),before=JSON.stringify(d),result=edit(s)
 assert.equal(result.status,'applied');if(result.status!=='applied')return
 const expected=structuredClone(d);expected.stages.floorSection.rearBearingComparison.openingYMm=[9075,10975]
 assert.equal(saveEngineeringEdit(result.state),JSON.stringify(expected))
 assert.equal(JSON.stringify(d),before)
 const computed=edit(result.state,1900,'compute')
 assert.equal(computed.status,'applied');if(computed.status!=='applied')return
 expected.stages.floorSection.rearBearingComparison.execution='compute'
 assert.equal(saveEngineeringEdit(computed.state),JSON.stringify(expected))
 assert.deepEqual(computed.state.document.stages.distributedFloor,d.stages.distributedFloor)
 assert.deepEqual((computed.state.document.stages.floorSection as any).finiteJointComparison,d.stages.floorSection.finiteJointComparison)
 const back=replayEngineeringEdit(computed.state,engineeringBase(computed.state),'undo');assert.equal(back.status,'applied');if(back.status!=='applied')return
 const original=replayEngineeringEdit(back.state,engineeringBase(back.state),'undo');assert.equal(original.status,'applied');if(original.status!=='applied')return
 assert.equal(saveEngineeringEdit(original.state),before)
 assert.equal(edit(s,1850).status,'applied');const noop=edit(s,1850);if(noop.status==='applied')assert.equal(noop.state,s)
})
test('rear edits require an existing complete saved stage, strict controls, the stable ID and current revision',()=>{
 const d=document(),s=beginEngineeringEdit(d,'rear-adverse')
 for(const result of [edit(s,NaN),edit(s,Infinity),edit(s,-1),edit(s,1900,'cached'),edit(s,1900,'deferred',{accepted:true}),edit(s,1900,'deferred',{assemblyId:'other'})])assert.equal(result.status,'rejected')
 const missing=structuredClone(d);delete missing.stages.floorSection.rearBearingComparison
 assert.equal(edit(beginEngineeringEdit(missing,'missing')).status,'rejected');assert.equal(Object.hasOwn(missing.stages.floorSection,'rearBearingComparison'),false)
 const bad=structuredClone(d);bad.stages.floorSection.rearBearingComparison.extraLoadKN=1
 assert.equal(edit(beginEngineeringEdit(bad,'bad')).status,'rejected')
 const reference=structuredClone(d);reference.stages.floorSection.finiteJointComparison.enabled=false
 assert.equal(edit(beginEngineeringEdit(reference,'reference')).status,'rejected')
 const changed=edit(s);assert.equal(changed.status,'applied');if(changed.status==='applied'){
  const stale=applyEngineeringEdit(changed.state,{schema:'current-engineering-edit/1',units:'mm',base:engineeringBase(s),operation:{kind:'set-floor-rear-bearing-comparison',assemblyId:editableRearBearingId,openingWidthMm:1900,execution:'deferred'}})
  assert.equal(stale.status,'rejected')
 }
})
