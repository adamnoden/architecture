import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import test from 'node:test'
import {sha256SemanticFingerprint} from '../core/identity.js'
import {readGeorgianDesignSnapshot} from './current-design/georgian-source.js'
import {readEngineeringDocument} from './current-design/engineering-document.js'
import {runFiniteFloorContourComponent,readFiniteFloorContourSettings,finiteFloorContourDefaults,finiteFloorContourPaths}
 from './current-design/structural-finite-floor-contour.js'
import type {CurrentDesignResolution} from './current-design/resolve.js'
// Explicit bounded adapter fixture. This does not manufacture a current compiler read.
const root=new URL('../../',import.meta.url)
const reference=JSON.parse(readFileSync(new URL('project/str/studies/fixed-normal-experiment-inputs.json',root),'utf8')).baseNativeRequest
function fixture(){
 const design=readGeorgianDesignSnapshot()
 const identities=Object.fromEntries(finiteFloorContourPaths.map(path=>{
  const bytes=readFileSync(new URL(path,root));return[path,createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')]
 }))
 const resolved={schema:'current-design-resolution/1',design,disciplineBindings:[{id:'str-finite-joint-development',identities,state:'candidate-interface',authority:'Explicit bounded adapter unit fixture',inputReceiptIdentities:{},digest:sha256SemanticFingerprint(identities),applicability:{sourceId:design.source.id,planDigest:sha256SemanticFingerprint(design),shellMm:[design.envelope.widthMm,design.envelope.depthMm],scope:'exact accepted Georgian plan basis only'}}]} as CurrentDesignResolution
 const binding={planDigest:sha256SemanticFingerprint(design),caseDigest:'explicit-experimental-unit-fixture',nativeRequestDigest:sha256SemanticFingerprint(reference)}
 return{resolved,binding}
}

test('explicit experimental applicability defers only under an actual owning method and saved request binding',()=>{
 const{resolved,binding}=fixture(),before=structuredClone(reference)
 const saved=JSON.parse(JSON.stringify(finiteFloorContourDefaults))
 const deferred=runFiniteFloorContourComponent(resolved,reference,saved,binding)!
 assert.equal(deferred.status,'deferred');assert.equal(deferred.nativeFloorAdmission,false)
 assert.equal(deferred.globalReplacementAvailable,false);assert.equal(deferred.jointResistanceAvailable,false)
 assert.deepEqual(reference,before)
 const changed=structuredClone(reference);changed.thicknessMm=250
 const unsupported=runFiniteFloorContourComponent(resolved,changed,saved,{...binding,nativeRequestDigest:sha256SemanticFingerprint(changed)})!
 assert.equal(unsupported.status,'unsupported');assert.equal(unsupported.diagnostics[0]?.code,'FINITE_CONTOUR_CHANGED_NATIVE_CASE')
 assert.equal(runFiniteFloorContourComponent(resolved,reference,undefined,binding),null)
 assert.throws(()=>runFiniteFloorContourComponent({...resolved,disciplineBindings:[]},reference,saved,binding),/Missing current/)
 assert.throws(()=>runFiniteFloorContourComponent(resolved,reference,saved,{...binding,planDigest:'stale'}),/revision\/request/)
 assert.throws(()=>runFiniteFloorContourComponent(resolved,reference,saved,{...binding,nativeRequestDigest:'stale'}),/revision\/request/)
 const stale={...resolved,disciplineBindings:resolved.disciplineBindings.map(row=>({...row,identities:{...row.identities,[finiteFloorContourPaths[0]]:'stale'}}))}
 assert.throws(()=>runFiniteFloorContourComponent(stale,reference,saved,binding),/Stale or missing/)
})

test('local controls are explicit bounded source choices, with no injected numerical result',()=>{
 assert.deepEqual(readFiniteFloorContourSettings(finiteFloorContourDefaults),finiteFloorContourDefaults)
 for(const bad of [null,{}, {...finiteFloorContourDefaults,pitchMm:250}, {...finiteFloorContourDefaults,youngKNPerM2:NaN},
 {...finiteFloorContourDefaults,poisson:.5},{...finiteFloorContourDefaults,slabVolumeLoadEquivalentKPa:-1},
 {...finiteFloorContourDefaults,matrix:[]}])assert.throws(()=>readFiniteFloorContourSettings(bad),/Explicit bounded/)
})

test('bounded actual Python adapter recomputes local material/load choices while native source remains unchanged',{
 skip:!process.env.STR_FINITE_SOLID_PYTHON,
},()=>{
 const{resolved,binding}=fixture(),before=structuredClone(reference)
 const compute={...finiteFloorContourDefaults,execution:'compute'}
 const run=(settings:typeof compute)=>runFiniteFloorContourComponent(resolved,reference,settings,binding)!
 const baseline=run(compute)
 assert.equal(baseline.status,'computed-local-comparison',JSON.stringify(baseline.diagnostics))
 const material=run({...compute,youngKNPerM2:66e6})
 assert.equal(material.status,'computed-local-comparison',JSON.stringify(material.diagnostics))
 const base=baseline.component!,changed=material.component!
 assert.equal(base.ports.length,112);assert.equal(base.freeRigidModes,6)
 for(let i=0;i<base.ports.length;i++)for(let j=0;j<base.ports.length;j++)assert.ok(Math.abs(changed.condensedStiffness[i][j]-2*base.condensedStiffness[i][j])<1e-6)
 const loaded=run({...compute,slabVolumeLoadEquivalentKPa:1})
 assert.equal(loaded.status,'computed-local-comparison',JSON.stringify(loaded.diagnostics))
 assert.notDeepEqual(loaded.component!.consistentLoad,base.consistentLoad)
 assert.deepEqual(loaded.component!.condensedStiffness,base.condensedStiffness)
 assert.deepEqual(reference,before,'A local experiment never mutates the actual native case')
 const restored=run(compute)
 assert.equal(restored.status,'computed-local-comparison')
 assert.deepEqual(restored.component!.condensedStiffness,base.condensedStiffness)
 assert.deepEqual(restored.component!.consistentLoad,base.consistentLoad)
})

test('the actual saved-document CLI computes35 beside its ordinary52-head floor with the same revision',{
 skip:!process.env.STR_FINITE_CONTOUR_SAVED_PROBE,
},async()=>{
 const retained=JSON.parse(readFileSync(process.env.STR_FINITE_CONTOUR_SAVED_PROBE!,'utf8'))
 assert.equal(retained.pitchMm,35)
 const stages=JSON.parse(execFileSync('python3',['-B','-c',"import sys,json;sys.path.insert(0,'project/ade/browser-editor');from engineering_browser_test import current_wet_stages;print(json.dumps(current_wet_stages(json.load(sys.stdin))))"],{input:JSON.stringify(reference),encoding:'utf8',stdio:'pipe'}))
 stages.floorSection.cageComparison=null
 stages.floorSection.contourComponent={...finiteFloorContourDefaults,execution:'compute',pitchMm:35}
 const current=await readEngineeringDocument(readGeorgianDesignSnapshot())
 const document={...current,stages},before=JSON.stringify(document)
 const bundle=JSON.parse(execFileSync(process.execPath,['--import','tsx','scripts/compile-current-design.ts','--bundle','-'],{input:before,encoding:'utf8',stdio:'pipe',maxBuffer:128*1024*1024,timeout:900000}))
 const floor=bundle.engineering.floorSection,local=floor.contourComponent
 assert.equal(local.status,'computed-local-comparison',JSON.stringify(local.diagnostics))
 assert.equal(floor.native.heads.length,52)
 assert.equal(local.source.caseDigest,floor.source.caseDigest)
 assert.equal(local.source.nativeRequestDigest,sha256SemanticFingerprint(reference))
 assert.equal(local.nativeFloorAdmission,false);assert.equal(local.globalReplacementAvailable,false)
 assert.deepEqual(local.component.inputs,retained.inputs)
 assert.deepEqual(local.component.ports,retained.ports)
 assert.deepEqual(local.component.methodSHA256,retained.methodSHA256)
 for(let i=0;i<112;i++)for(let j=0;j<112;j++)assert.ok(Math.abs(local.component.condensedStiffness[i][j]-retained.condensedStiffness[i][j])<1e-7)
 assert.equal(JSON.stringify(document),before)
})
