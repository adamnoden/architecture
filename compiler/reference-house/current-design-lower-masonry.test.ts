import assert from 'node:assert/strict'
import test from 'node:test'
import {execFileSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {savedFloorSectionCase} from './current-design/structural-floor-section.js'
import {readEngineeringDocument,compileEngineeringDocument} from './current-design/engineering-document.js'
import {readLowerMasonrySettings} from './current-design/structural-lower-masonry-settings.js'
import {runLowerMasonryComparison} from './current-design/structural-lower-masonry.js'
import {readGeorgianDesignSnapshot} from './current-design/georgian-source.js'
import {applyEngineeringEdit,beginEngineeringEdit,engineeringBase,saveEngineeringEdit,replayEngineeringEdit,editableFloorSectionId} from './current-design/engineering-edit.js'
const choice={schema:'str-lower-masonry-settings/1',id:'STR/WET/lower-masonry-comparison',execution:'deferred',archRiseMm:450,masonryElasticModulusMPa:3000,bearingCellsY:8,floorNormalComplianceMmPerMPa:.1,
 normalBed:{enabled:true,cellsPerAxis:8,normalComplianceMmPerMPa:.1,tangentialKeyHypothesis:'ideal-work-dual-centroid-ux-uy-rz'}}
const identity={planDigest:'actual-stage-plan',bindingDigest:'actual-stage-methods',caseDigest:'actual-stage-request'}
const native=()=>JSON.parse(execFileSync('python3',['-B','-c',"import json,tarfile; t=tarfile.open('project/str/studies/wet-masonry-arch-rise-captures.tar.xz');print(json.dumps(json.load(t.extractfile('rise450-null-request.json'))['nativeCase']))"],{encoding:'utf8',stdio:'pipe'}))
test('lower replacement carries exact saved inputs, changed loads and explicit pending/unsupported outcomes',()=>{
 const n=native(),before=JSON.stringify(n),a=runLowerMasonryComparison(n,choice,identity,'SAVED-LOWER')!
 assert.equal(a.status,'analysis-pending');assert.deepEqual(a.request!.nativeCase,n);assert.equal(a.candidateAccepted,false)
 const edit=structuredClone(n);edit.bearingCase.masonryCase.verticalCase.freshUniformLiveKPa=1
 const b=runLowerMasonryComparison(edit,choice,{...identity,caseDigest:'changed'},'SAVED-LOWER')!
 assert.equal(b.status,'analysis-pending');assert.deepEqual(b.request!.nativeCase,edit);assert.notEqual(b.source.nativeRequestDigest,a.source.nativeRequestDigest)
 const saved=savedFloorSectionCase({schema:'str-current-floor-section-case/1',planDigest:'plan',bindingDigest:'binding',comparison:n,sectionCuts:[],cageComparison:null,caseId:'SAVED'} as any,{thicknessMm:200,wetSupport:n.wetSupport,lowerMasonryComparison:choice},{caseId:'SAVED',comparison:n.bearingCase} as any)
 assert.deepEqual(saved.lowerMasonryComparison,choice);assert.deepEqual(saved.comparison,n)
 assert.equal(JSON.stringify(n),before)
 assert.equal(runLowerMasonryComparison({...n,thicknessMm:250},choice,identity,'SAVED-LOWER')!.status,'unsupported')
 assert.equal(runLowerMasonryComparison({...n,wetSupport:null},choice,identity,'SAVED-LOWER')!.status,'unsupported')
 const stale=structuredClone(n);stale.sourceSHA256[Object.keys(stale.sourceSHA256)[0]!]='0'.repeat(64)
 assert.equal(runLowerMasonryComparison(stale,choice,identity,'SAVED-LOWER')!.status,'unsupported')
 for(const bad of [{...choice,candidateAccepted:true},{...choice,execution:['deferred']},{...choice,execution:['compute']},{...choice,execution:1},{...choice,archRiseMm:300},{...choice,normalBed:{...choice.normalBed,tangentialKeyHypothesis:'friction'}},
  {...choice,normalBed:{...choice.normalBed,normalComplianceMmPerMPa:0}}])assert.throws(()=>readLowerMasonrySettings(bad))
})
test('lower replacement is an atomic reversible saved-document edit with ordinary stages unchanged',()=>{
 const document={schema:'current-engineering-document/1',design:readGeorgianDesignSnapshot(),bindings:{retained:'unchanged'},stages:{roofPitch:{pitchDeg:25},floorSection:{thicknessMm:200,wetSupport:{source:'retained'}}}}
 const state=beginEngineeringEdit(document,'lower-saved'),old=saveEngineeringEdit(state)
 const result=applyEngineeringEdit(state,{schema:'current-engineering-edit/1',units:'mm',base:engineeringBase(state),operation:{kind:'set-floor-lower-masonry-comparison',assemblyId:editableFloorSectionId,settings:choice}})
 assert.equal(result.status,'applied');assert.equal(saveEngineeringEdit(state),old)
 const changed=JSON.parse(saveEngineeringEdit(result.state));assert.deepEqual(changed.stages.roofPitch,document.stages.roofPitch)
 assert.deepEqual(changed.stages.floorSection,{...document.stages.floorSection,lowerMasonryComparison:choice})
 assert.equal(saveEngineeringEdit(replayEngineeringEdit(result.state,engineeringBase(result.state),'undo').state),old)
 assert.equal(saveEngineeringEdit(beginEngineeringEdit(changed,'reloaded')),saveEngineeringEdit(result.state))
})
test('explicit actual lower compute re-solves saved native inputs and retains all52 head controls',{skip:!process.env.STR_LOWER_MASONRY_NATIVE},()=>{
 const capture=JSON.parse(readFileSync(process.env.STR_LOWER_MASONRY_NATIVE!,'utf8')),n=capture.experimentalRequest.nativeCase
 const value=runLowerMasonryComparison(n,{...choice,execution:'compute'},identity,'SAVED-LOWER')!
 assert.equal(value.status,'computed-unselected-candidate',JSON.stringify(value.diagnostics))
 assert.deepEqual(value.request!.nativeCase,n);assert.equal(value.wholeHouseAccepted,false)
 assert.deepEqual(value.native.heads.map((h:any)=>h.id),capture.nativeVertical.native.heads.map((h:any)=>h.id))
 assert.ok(Math.max(...value.native.heads.flatMap((h:any,i:number)=>h.reactionKN_KNm.map((v:number,j:number)=>Math.abs(v-capture.nativeVertical.native.heads[i].reactionKN_KNm[j]))))<1e-8)
})

test('the complete current saved document compiles the pending candidate beside its actual ordinary floor',{skip:!process.env.STR_LOWER_MASONRY_NATIVE},async()=>{
 const capture=JSON.parse(readFileSync(process.env.STR_LOWER_MASONRY_NATIVE!,'utf8')),n=capture.experimentalRequest.nativeCase
 const stages=JSON.parse(execFileSync('python3',['-B','-c',"import sys,json;sys.path.insert(0,'project/ade/browser-editor');from engineering_browser_test import current_wet_stages;print(json.dumps(current_wet_stages(json.load(sys.stdin))))"],{input:JSON.stringify(n),encoding:'utf8',stdio:'pipe'}))
 stages.floorSection.cageComparison=null;stages.floorSection.lowerMasonryComparison=choice
 const start=await readEngineeringDocument(readGeorgianDesignSnapshot()),document={...start,stages},before=JSON.stringify(document)
 const result=await compileEngineeringDocument(JSON.parse(before)),floor=result.engineering.floorSection!
 assert.equal(floor.native.heads.length,52);assert.equal(floor.lowerMasonryComparison!.status,'analysis-pending')
 assert.equal(floor.source.caseDigest,floor.lowerMasonryComparison!.source.caseDigest)
 assert.deepEqual(floor.lowerMasonryComparison!.controls,choice)
 assert.ok(result.coordinationDiagnostics.some(d=>d.code==='LOWER_MASONRY_ANALYSIS_PENDING'))
 assert.equal(JSON.stringify(document),before)
})
