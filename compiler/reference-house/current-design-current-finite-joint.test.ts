import assert from 'node:assert/strict'
import test from 'node:test'
import {readCurrentFiniteJointSettings,currentFiniteJointDefaults} from './current-design/structural-current-finite-joint-settings.js'
import {runCurrentFiniteJointComparison} from './current-design/structural-current-finite-joint.js'
import {readGeorgianDesignSnapshot} from './current-design/georgian-source.js'
import {applyEngineeringEdit,beginEngineeringEdit,engineeringBase,replayEngineeringEdit,saveEngineeringEdit,editableFloorSectionId} from './current-design/engineering-edit.js'
const choice={...currentFiniteJointDefaults}
const source={planDigest:'saved-plan',bindingDigest:'current-methods',caseDigest:'actual-case'}
test('finite whole-house input preserves exact saved case and rejects injected response/acceptance',()=>{
 const native={geometry:{actual:true},loads:{g:1.35,q:2}},before=JSON.stringify(native)
 const a=runCurrentFiniteJointComparison(native,choice,source,'FINITE-SAVED')!
 assert.equal(a.status,'analysis-pending');assert.deepEqual(a.request.nativeCase,native);assert.equal(a.candidateAccepted,false)
 assert.equal(JSON.stringify(native),before)
 const edited={...native,loads:{g:1.35,q:3}}
 const b=runCurrentFiniteJointComparison(edited,{...choice,solidPitchMm:140},{...source,caseDigest:'changed'},'FINITE-SAVED')!
 assert.deepEqual(b.request.nativeCase,edited);assert.notDeepEqual(a.request,b.request)
 for(const invalid of [{...choice,accepted:true},{...choice,execution:['compute']},{...choice,youngMPa:0},{...choice,solidPitchMm:50},{...choice,enabled:1}])assert.throws(()=>readCurrentFiniteJointSettings(invalid))
 assert.equal(runCurrentFiniteJointComparison(native,undefined,source,'NONE'),null)
})
test('finite joint edit is atomic, saved, reloadable and independently reversible',()=>{
 const document={schema:'current-engineering-document/1',design:readGeorgianDesignSnapshot(),bindings:{retained:'unchanged'},stages:{roofPitch:{pitchDeg:25},floorSection:{thicknessMm:200,wetSupport:{actual:'retained'}}}}
 const start=beginEngineeringEdit(document,'finite-joint-saved'),before=saveEngineeringEdit(start)
 const changed=applyEngineeringEdit(start,{schema:'current-engineering-edit/1',units:'mm',base:engineeringBase(start),operation:{kind:'set-floor-finite-joint-comparison',assemblyId:editableFloorSectionId,settings:choice}})
 assert.equal(changed.status,'applied');if(changed.status!=='applied')return
 assert.equal(saveEngineeringEdit(start),before)
 assert.deepEqual(changed.state.document.stages.floorSection,{...document.stages.floorSection,finiteJointComparison:choice})
 assert.deepEqual(changed.state.document.stages.roofPitch,document.stages.roofPitch)
 assert.equal(saveEngineeringEdit(beginEngineeringEdit(JSON.parse(saveEngineeringEdit(changed.state)),'reloaded')),saveEngineeringEdit(changed.state))
 assert.equal(saveEngineeringEdit(replayEngineeringEdit(changed.state,engineeringBase(changed.state),'undo').state),before)
 const rejected=applyEngineeringEdit(start,{schema:'current-engineering-edit/1',units:'mm',base:engineeringBase(start),operation:{kind:'set-floor-finite-joint-comparison',assemblyId:editableFloorSectionId,settings:{...choice,accepted:true}}})
 assert.equal(rejected.status,'rejected');assert.equal(saveEngineeringEdit(start),before)
})
