import assert from 'node:assert/strict'
import test from 'node:test'
import {execFileSync} from 'node:child_process'
import {readGroundPocketSettings} from './current-design/structural-ground-pocket-settings.js'
import {beginEngineeringEdit,applyEngineeringEdit,engineeringBase,saveEngineeringEdit,replayEngineeringEdit} from './current-design/engineering-edit.js'
import {readGeorgianDesignSnapshot} from './current-design/georgian-source.js'
import {readEngineeringDocument,compileEngineeringDocument} from './current-design/engineering-document.js'
import {readCurrentDesignResolution} from './current-design/resolve.js'
import {readInletSourceEnvelopeCase,readLocalUtilityPocketSettings} from './current-design/inlet-source-envelope.js'
import {readGroundSectionCase} from './current-design/structural-ground.js'
const choice={schema:'str-ground-pocket-settings/1',id:'STR/HAD/known-ground-stock',execution:'deferred',settings:{enabled:true,platePitchMm:250,contactPitchMm:250,plateLaw:{elasticModulusMPa:33000,poissonRatio:.2,flexuralFactor:1,shearFactor:5/6},mineralModulusMPa:1000,jointComplianceMmPerMPa:.1}}
test('known ground controls reject implicit material qualification, malformed execution and unsupported meshes',()=>{
 assert.deepEqual(readGroundPocketSettings(choice),choice)
 for(const edit of [{candidateAccepted:true},{execution:['deferred']},{settings:{...choice.settings,platePitchMm:0}},{settings:{...choice.settings,mineralModulusMPa:NaN}},{settings:{...choice.settings,plateLaw:{...choice.settings.plateLaw,qualified:true}}}])assert.throws(()=>readGroundPocketSettings({...choice,...edit}))
 const copy=readGroundPocketSettings(choice);copy.settings.plateLaw.elasticModulusMPa=1000;assert.equal(choice.settings.plateLaw.elasticModulusMPa,33000)
})
test('known ground comparison is an atomic reversible saved-document operation',()=>{
 const document={schema:'current-engineering-document/1',design:readGeorgianDesignSnapshot(),bindings:{unchanged:true},stages:{roofPitch:{pitchDeg:25},floorSection:{thicknessMm:200},groundSection:{caseId:'saved'},inletSourceEnvelope:{source:'saved'}}},state=beginEngineeringEdit(document,'ground'),before=saveEngineeringEdit(state),result=applyEngineeringEdit(state,{schema:'current-engineering-edit/1',units:'mm',base:engineeringBase(state),operation:{kind:'set-ground-pocket-comparison',assemblyId:choice.id,settings:choice}})
 assert.equal(result.status,'applied');assert.equal(saveEngineeringEdit(state),before)
 const changed=JSON.parse(saveEngineeringEdit(result.state));assert.deepEqual(changed.stages,{...document.stages,groundPocketLoads:choice})
 assert.equal(saveEngineeringEdit(replayEngineeringEdit(result.state,engineeringBase(result.state),'undo').state),before)
 assert.equal(saveEngineeringEdit(beginEngineeringEdit(changed,'reload')),saveEngineeringEdit(result.state))
})
test('actual saved room geometry feeds pending and computed known ground stock without an archive fallback',{skip:!process.env.STR_GROUND_POCKET_NATIVE,timeout:900000},async()=>{
 // Explicit historical case supplies authored engineering controls only. The
 // compiler rebuilds native source identity and both HAD bodies from current
 // source; no stored response or stored stock is consumed.
 const n=JSON.parse(execFileSync('python3',['-B','-c',"import json,tarfile;t=tarfile.open('project/str/studies/service-room-ground-development-checkpoint.tar.xz');print(json.dumps(json.load(t.extractfile('enabled-request.json'))['nativeCase']))"],{encoding:'utf8'})),stages=JSON.parse(execFileSync('python3',['-B','-c',"import sys,json;sys.path.insert(0,'project/ade/browser-editor');from engineering_browser_test import current_wet_stages;print(json.dumps(current_wet_stages(json.load(sys.stdin))))"],{input:JSON.stringify(n),encoding:'utf8'})),resolved=readCurrentDesignResolution(),ground=readGroundSectionCase(resolved),inlet=readInletSourceEnvelopeCase(resolved)
 stages.floorSection.cageComparison=null;stages.groundSection={caseId:ground.ground.caseId,settings:ground.ground.settings};stages.inletSourceEnvelope={...readLocalUtilityPocketSettings(),splitPlantRoom:inlet.sourceEnvelope.splitPlantRoom};stages.groundPocketLoads=choice
 const base=await readEngineeringDocument(readGeorgianDesignSnapshot()),doc={...base,stages},before=JSON.stringify(doc),pending=await compileEngineeringDocument(doc),p=pending.engineering.groundPocketLoads!
 assert.equal(p.status,'analysis-pending',JSON.stringify(p.diagnostics));if(p.status!=='analysis-pending')return
 assert.equal(p.request.structuralFloorBodies.length,2);assert.equal(p.request.structuralFloorBodies.some(b=>b.id.includes('lobby')),false)
 assert.equal(p.source.inletSource.inletCaseDigest,pending.engineering.inletSourceEnvelope!.knownGravityInventory.source.inletCaseDigest)
 assert.equal(p.source.floorCaseDigest,pending.engineering.floorSection!.source.caseDigest)
 assert.equal(p.request.structuralFloorBodies.reduce((s,b)=>s+b.independentKnownGravity.rcGKN+b.independentKnownGravity.mineralGKN,0),48.631071)
 assert.equal(p.request.nativeCase.thicknessMm,200);assert.equal(JSON.stringify(doc),before)
 const computed=structuredClone(doc);computed.stages.groundPocketLoads={...choice,execution:'compute'}
 const result=await compileEngineeringDocument(computed),r=result.engineering.groundPocketLoads!
 assert.equal(r.status,'computed-unselected-candidate',JSON.stringify(r.diagnostics));if(r.status!=='computed-unselected-candidate')return
 assert.equal(r.native.heads.length,52);assert.ok(Math.abs(r.comparison.addedPhysicalGKN-48.631071)<1e-8);assert.equal(r.candidateAccepted,false)
 assert.deepEqual(r.request.nativeCase,p.request.nativeCase);assert.deepEqual(r.request.structuralFloorBodies,p.request.structuralFloorBodies)
 assert.deepEqual(result.engineering.floorSection,pending.engineering.floorSection,'Ordinary frame remains separately identified unchanged control')
 const higher=structuredClone(doc);higher.stages.groundSection.settings.courseBottomMm+=20
 const unsupported=await compileEngineeringDocument(higher);assert.equal(unsupported.engineering.groundPocketLoads!.status,'unsupported')
 assert.ok(unsupported.coordinationDiagnostics.some(d=>d.code==='GROUND_POCKET_UNSUPPORTED'))
})
