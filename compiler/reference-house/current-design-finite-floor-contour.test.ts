import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import test from 'node:test'
import {sha256SemanticFingerprint} from '../core/identity.js'
import {readGeorgianDesignSnapshot} from './current-design/georgian-source.js'
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
