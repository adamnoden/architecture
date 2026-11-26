import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { admitStudyOakComposition } from './current-design/assemblies/study-oak-composition.js'

const document=JSON.parse(readFileSync(new URL('../../project/ccr/studies/working-house-comparison.json',import.meta.url),'utf8'))
// A test input, not a second selected finish: the actual choice belongs to the
// same saved Study case consumed by browser, CLI and ordinary drawing producer.
const composition=admitStudyOakComposition({schema:'ias-study-oak-composition/1',pattern:'basket-weave',fieldGrainAxis:'y',
 fieldColour:'#ad8d67',borderColour:'#9f805b',grainColour:'#725d42',borderWidthMm:75,grainSpacingMm:24,grainOpacity:.12})
const {oakComposition:_,...stage}=document.stages.studyRoomKit
const compiler=prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
const input={schema:'ias-study-room-kit-case/1',units:'mm',...stage}
const rooms=Promise.all([compiler.studyRoomKit(input,document.stages.distributedFloor),compiler.studyRoomKit({...input,oakComposition:composition},document.stages.distributedFloor)])
const area=(b:readonly number[])=>(b[2]!-b[0]!)*(b[3]!-b[1]!)

test('authored oak composition covers exactly the actual136faces while physical parts and all renewal evidence remain unchanged',async()=>{
 const[base,room]=await rooms,s=room.kit.floor.oakComposition!
 const{beginEngineeringEdit,saveEngineeringEdit}=await import('./current-design/engineering-edit.js')
 const saved=structuredClone(document);saved.stages.studyRoomKit.oakComposition=composition
 const transported=JSON.parse(saveEngineeringEdit(beginEngineeringEdit(saved,'oak-finish-test')))
 assert.deepEqual(transported.stages.studyRoomKit.oakComposition,composition)
 assert.equal(s.actualPartCount,136);assert.equal(s.physicalCutsAdded,0)
 assert.equal(s.input.pattern,'basket-weave');assert.equal(s.compositionDatum.borderFollowsActualRoomPerimeter,true)
 assert.deepEqual(room.kit.floor.parts,base.kit.floor.parts)
 assert.deepEqual(room.kit.floor.structuralRenewal,base.kit.floor.structuralRenewal)
 assert.deepEqual(room.kit.floor.ordinaryHandling,base.kit.floor.ordinaryHandling)
 assert.equal(room.kit.floor.ordinaryHandling!.witnessCount,136)
 assert.deepEqual(room.roomAssembly,base.roomAssembly);assert.deepEqual(room.kit.occupied,base.kit.occupied)
 assert.deepEqual(room.eyeLevel.day.camera,base.eyeLevel.day.camera)
 assert.notEqual(room.eyeLevel.day.sceneDigest,base.eyeLevel.day.sceneDigest)
 assert.equal(new Set(s.components.map(c=>c.partId)).size,136)
 for(const component of s.components){
  assert.equal(component.zones.reduce((a,z)=>a+area(z.box),0),component.facePieces.reduce((a,b)=>a+area(b),0))
  for(const z of component.zones)assert.ok(component.facePieces.some(b=>z.box[0]>=b[0]&&z.box[1]>=b[1]&&z.box[2]<=b[2]&&z.box[3]<=b[3]))
  for(let i=0;i<component.zones.length;i++)for(let j=i+1;j<component.zones.length;j++){
   const a=component.zones[i]!.box,b=component.zones[j]!.box
   assert.ok(!(a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1]))
  }
 }
 const fields=s.components.flatMap(c=>c.zones).filter(z=>z.role==='field')
 assert.equal(new Set(fields.map(z=>z.colour)).size,1)
 assert.deepEqual([...new Set(fields.map(z=>z.grainAxis))].sort(),['x','y'])
 assert.ok(s.components.flatMap(c=>c.zones).some(z=>z.role==='perimeter'))
 const internalBandPoint=s.components.flatMap(c=>c.zones).filter(z=>z.box[0]<1500&&z.box[2]>1500&&z.box[1]<1095&&z.box[3]>1095)
 assert.ok(internalBandPoint.length);assert.ok(internalBandPoint.every(z=>z.role==='field'))
 assert.deepEqual(s.claims,{materialSelected:false,workshopFabricationQualified:false,installedAcceptance:false,ownerAcceptance:false})
 assert.match(room.eyeLevel.day.svg,/oak-composition\/base/)
 assert.match(room.eyeLevel.day.svg,/data-study-view="fixed"/)
 assert.match(room.eyeLevel.day.svg,/data-study-view="removable"/)
})

test('changing the saved finish input propagates through schedule and both views without changing geometry or witnesses',async()=>{
 const[,base]=await rooms
 const changed=await compiler.studyRoomKit({...input,oakComposition:{...composition,pattern:'straight-grain',fieldGrainAxis:'x',borderWidthMm:90}},document.stages.distributedFloor)
 assert.notEqual(changed.kit.floor.oakComposition!.digest,base.kit.floor.oakComposition!.digest)
 assert.notDeepEqual(changed.kit.floor.oakComposition!.components,base.kit.floor.oakComposition!.components)
 assert.notEqual(changed.eyeLevel.day.sceneDigest,base.eyeLevel.day.sceneDigest)
 assert.notEqual(changed.eyeLevel.evening.sceneDigest,base.eyeLevel.evening.sceneDigest)
 assert.deepEqual(changed.kit.floor.parts,base.kit.floor.parts)
 assert.deepEqual(changed.kit.floor.structuralRenewal,base.kit.floor.structuralRenewal)
 assert.deepEqual(changed.kit.occupied,base.kit.occupied);assert.deepEqual(changed.roomAssembly,base.roomAssembly)
})

test('unknown finish fields, non-colours and unsupported figures reject without acquiring material or owner acceptance',async()=>{
 await assert.rejects(compiler.studyRoomKit({...input,oakComposition:{...composition,accepted:true}},document.stages.distributedFloor),/INVALID_STUDY_OAK_COMPOSITION/)
 await assert.rejects(compiler.studyRoomKit({...input,oakComposition:{...composition,fieldColour:'oak'}},document.stages.distributedFloor),/INVALID_STUDY_OAK_COMPOSITION/)
 await assert.rejects(compiler.studyRoomKit({...input,oakComposition:{...composition,borderWidthMm:500}},document.stages.distributedFloor),/INVALID_STUDY_OAK_COMPOSITION/)
})
