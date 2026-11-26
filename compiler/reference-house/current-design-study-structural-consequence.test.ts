import assert from 'node:assert/strict'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { readStudyRoomKitReferenceCase } from './current-design/assemblies/study-room-kit.js'
import { deriveStudyStructuralContext } from './current-design/assemblies/study-structural-context.js'
const compiler=prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
const choice={...readStudyRoomKitReferenceCase(),finishDepthMm:15 as const,installedServices:'wall-hung-candidate' as const,frameFootClearanceMm:5 as const}
const widths=(SW:number)=>({cornerWidthsMm:{NW:240,NE:240,SW,SE:140}})
const data=Promise.all([compiler.studyRoomKit(choice),compiler.studyRoomKit(choice,widths(200)),compiler.studyRoomKit(choice,widths(180))])
const area=(b:readonly number[])=>(b[2]!-b[0]!)*(b[3]!-b[1]!)
const overlap=(a:readonly number[],b:readonly number[])=>a[0]!<b[2]!&&a[2]!>b[0]!&&a[1]!<b[3]!&&a[3]!>b[1]!

test('the same saved structural width makes the actual two pilasters, emitter/desk arrangement and current room outputs',async()=>{
 const[base,room]=await data,k=room.kit,c=k.structuralConsequence!
 assert.equal(c.source.controlPath,'stages.distributedFloor.cornerWidthsMm.SW')
 assert.equal(c.source.native.widthMm,200);assert.equal(c.source.native.areaMm2,360000)
 assert.equal(c.roomAreaRemovedMm2,99600)
 assert.deepEqual(c.finishedFaceXYMm,[489.5,489.5]);assert.deepEqual(c.finishedToeXYMm,[1289.5,1289.5])
 assert.equal(k.bands.length,5);assert.equal(room.roomAssembly.walls.length,12)
 assert.deepEqual(k.occupied.find(([id])=>id==='study-desk')![1],[680,600,2280,1300])
 assert.deepEqual(k.occupied.find(([id])=>id==='service-emitter-study-W')![1],[429.5,1325,629.5,2475])
 assert.deepEqual(k.occupied.find(([id])=>id==='study-chair'),base.kit.occupied.find(([id])=>id==='study-chair'))
 assert.deepEqual(k.opening,base.kit.opening);assert.deepEqual(k.door,base.kit.door)
 assert.deepEqual(room.eyeLevel.day.camera,base.eyeLevel.day.camera)
 assert.match(room.eyeLevel.day.svg,/SW200 room proposal/)
 assert.match(room.eyeLevel.day.svg,/Unselected structural-room proposal/)
 assert.notEqual(room.eyeLevel.day.sceneDigest,base.eyeLevel.day.sceneDigest)
 assert.equal(room.roomAssembly.schedule.fixedProtectiveReturns.filter(id=>id.includes('structural-return')).length,2)
 assert.equal(k.floor.handling.state,'withheld')
 assert.equal(c.acceptance.ownerAppearance,false);assert.equal(c.acceptance.structureSelected,false)
})

test('real cut stock conserves the actual room and only local floor geometry changes',async()=>{
 const[base,room]=await data,k=room.kit,c=k.structuralConsequence!,f=k.floor.structuralFloor!
 assert.equal(k.floor.parts.length,136)
 assert.deepEqual(f.remainingFragile,[]);assert.equal(f.proofState,'CUT_STOCK_RECOMPUTED')
 assert.equal(f.mergedGroups.length,7)
 assert.equal(f.stockAreaMm2+f.emitterAreaMm2,k.bands.reduce((s,b)=>s+area(b),0))
 assert.equal(f.finishedRoomAreaMm2,8314049.75)
 assert.equal(k.floor.coverageMm2,8310944.75) // Exact unchanged north frame-foot cuts remove3105mm².
 assert.equal(k.floor.emitterPlinth.state,'geometry-screen-only')
 if(k.floor.emitterPlinth.state==='geometry-screen-only')assert.deepEqual(k.floor.emitterPlinth.box,[429.5,1289.5,634.5,2480])
 const physical=(p:typeof k.floor.parts[number])=>JSON.stringify({faces:p.facePieces,keys:p.grip})
 const old=new Set(base.kit.floor.parts.map(physical))
 assert.equal(k.floor.parts.filter(p=>old.has(physical(p))).length,126)
 for(const part of k.floor.parts){
  assert.ok(part.grip,part.id)
  for(const face of part.facePieces){assert.ok(area(face)>0);assert.ok(!c.finishReservations.some(r=>overlap(face,r)),part.id)}
  for(const[x,y]of part.grip!.centres)assert.ok(part.facePieces.some(b=>x>=b[0]&&x<=b[2]&&y>=b[1]&&y<=b[3]),part.id)
 }
 for(let i=0;i<k.floor.parts.length;i++)for(let j=i+1;j<k.floor.parts.length;j++)assert.ok(!k.floor.parts[i]!.facePieces.some(a=>k.floor.parts[j]!.facePieces.some(b=>overlap(a,b))))
})

test('a width perturbation recomputes body/stock while140 remains the exact unchanged control and unsupported source geometry rejects',async()=>{
 const[base,room,narrow]=await data
 assert.deepEqual(await compiler.studyRoomKit(choice,widths(140)),base)
 assert.deepEqual(narrow.kit.structuralConsequence!.finishedFaceXYMm,[469.5,469.5])
 assert.equal(narrow.kit.structuralConsequence!.roomAreaRemovedMm2,67200)
 assert.notEqual(narrow.kit.caseDigest,room.kit.caseDigest)
 assert.notDeepEqual(narrow.kit.floor.parts,room.kit.floor.parts)
 assert.deepEqual(narrow.kit.opening,room.kit.opening)
 assert.deepEqual(narrow.kit.door,room.kit.door)
 await assert.rejects(compiler.studyRoomKit(choice,widths(139)),/WIDTH_UNSUPPORTED/)
 await assert.rejects(compiler.studyRoomKit(choice,{...widths(200),accepted:true}),/UNEXPECTED_FLOOR_CONTROL/)
 const c=room.kit.structuralConsequence!,bad=structuredClone(c.source.native)
 ;(bad.rectanglesXYMm as unknown as number[][])[0]![2]!+=1
 assert.throws(()=>deriveStudyStructuralContext(c.source.baseBands,c.source.baseOccupied,c.source.finishDepthMm,bad),/RECTANGLE_MISMATCH/)
})

test('fresh ordinary operations include the real pilaster/plinth and explicit furniture preparation; changed receivers invalidate evidence',async()=>{
 const{readFileSync}=await import('node:fs')
 const doc=JSON.parse(readFileSync(new URL('../../project/ccr/studies/working-house-comparison.json',import.meta.url),'utf8'))
 const inputs={schema:'ias-study-room-kit-case/1',units:'mm',...doc.stages.studyRoomKit}
 const current=await compiler.studyRoomKit(inputs,doc.stages.distributedFloor),f=current.kit.floor,r=f.structuralRenewal!
 assert.equal(f.parts.length,136);assert.equal(r.status,'computed-geometry-witnesses')
 assert.equal(f.ordinaryHandling!.witnessCount,136);assert.equal(f.structuralFloor!.ordinaryRenewalRevalidated,true)
 assert.equal(r.physicalAcceptance,false)
 assert.ok('preparation'in r&&'furniture'in r)
 if('preparation'in r&&'furniture'in r){
  assert.deepEqual(r.preparation!.conflictingPhaseIds,[]);assert.deepEqual(r.furniture!.conflictingPhaseIds,[])
  assert.deepEqual(r.preparation!.dailyDeskXYXYMm,[680,600,2280,1300])
  assert.deepEqual(r.preparation!.preparedDeskXYXYMm,[660,600,2260,1300])
  assert.equal(r.preparation!.socketIsolatedAndUnplugged,true)
 }
 const bad=structuredClone(inputs)
 bad.ordinaryHandling.protocols[0].boardOriginXYMm=[-10000,-10000]
 const stale=await compiler.studyRoomKit(bad,doc.stages.distributedFloor)
 assert.equal(stale.kit.floor.ordinaryHandling!.witnessCount,135)
 assert.equal(stale.kit.floor.structuralFloor!.ordinaryRenewalRevalidated,false)
 assert.deepEqual(stale.kit.floor.parts,f.parts)
 const wrongParts=structuredClone(inputs);wrongParts.ordinaryHandling.protocols.pop()
 const omitted=await compiler.studyRoomKit(wrongParts,doc.stages.distributedFloor)
 assert.equal(omitted.kit.floor.ordinaryHandling!.witnessCount,0)
 assert.equal(omitted.kit.floor.structuralRenewal!.status,'source-withheld')
})
