import assert from 'node:assert/strict'
import {test} from 'node:test'
import {layoutRevision as d,revisionOpenings} from './georgian/layout-revision.js'
import {layoutFamilySource,layoutSectionAt,roofTop} from './georgian/layout-family.js'
import {compileCurrentSectionContext,currentCourtyardSectionFacades,sectionCutWallOccluders,currentPartitionOccluders} from './georgian/section-context.js'
const eq=(a:number,b:number)=>Math.abs(a-b)<1e-5

test('all current courtyard background windows are hosted in original house geometry',()=>{
 const facades=currentCourtyardSectionFacades()
 assert.deepEqual(facades.map(f=>f.id),['court-west','court-east'])
 assert.deepEqual(facades.map(f=>f.plane),[d.court.x,d.court.x+d.court.width])
 assert.ok(facades.every(f=>f.top===d.roof.courtEaves&&f.start===d.court.y&&f.end===d.court.y+d.court.depth))
 for(const face of facades) {
   const source=(['GROUND','FIRST'] as const).flatMap(level=>revisionOpenings(level).filter(o=>o.wall===face.id))
   assert.equal(face.openings.length,source.length)
   for(const opening of face.openings) {
     const s=source.find(o=>opening.id.endsWith(o.id))!
     assert.equal((opening.start+opening.end)/2,s.centre)
     assert.equal(opening.end-opening.start,s.width)
     assert.ok(opening.head<=face.top)
   }
 }
})
test('principal and service use real retained 3D faces, not a forced paper-space far facade',()=>{
 for(const station of [layoutFamilySource.cuts.A,layoutFamilySource.cuts.B]) {
   const view=compileCurrentSectionContext({station,roofBuildDepth:layoutFamilySource.roofBuildZone,
     walls:layoutSectionAt(station).walls})
   assert.ok(view.background.length>5)
   assert.ok(view.retainedFaces.some(f=>f.id.startsWith('roof-')))
   assert.equal(view.cut.length>0,true)
   assert.ok(view.background.every(s=>s.role==='secondary'))
 }
 const principal=compileCurrentSectionContext({station:layoutFamilySource.cuts.A,
   roofBuildDepth:layoutFamilySource.roofBuildZone})
 assert.ok(principal.retainedFaces.some(f=>f.id.startsWith('court-west:material:')))
 assert.ok(!principal.retainedFaces.some(f=>f.id.startsWith('court-east:material:')))
 assert.ok(principal.background.some(s=>s.meaning.includes('roof-')))
 assert.ok(principal.background.some(s=>s.meaning.includes('court-west')))
 assert.ok(principal.background.some(s=>eq(s.a.z,roofTop())||eq(s.b.z,roofTop())))
})
test('an opening in a cut leaf remains empty rather than becoming an opaque window mask',()=>{
 const station=layoutFamilySource.cuts.A,m=layoutSectionAt(station)
 const wall=m.walls.find(w=>w.holes.length>0)!
 const pieces=sectionCutWallOccluders(station,[wall])
 assert.ok(pieces.length>0)
 for(const hole of wall.holes) assert.ok(!pieces.some(f=>{
   const z=f.vertices.map(p=>p.z)
   return Math.min(...z)>=hole.lo&&Math.max(...z)<=hole.hi
 }))
})
test('section source fails closed for unsupported station and unrelated inner/outer roof eaves',()=>{
 assert.throws(()=>compileCurrentSectionContext({station:-1,roofBuildDepth:300}),/outside the shell/)
 const saved=d.roof.courtEaves
 try{d.roof.courtEaves=saved+50
   assert.throws(()=>compileCurrentSectionContext({station:5900,roofBuildDepth:300}),/eaves mismatch/)
 } finally {d.roof.courtEaves=saved}
})

test('source-owned service partitions block background glazing, not roof or visible courtyard walls',()=>{
 const faces=currentPartitionOccluders()
 const ground=faces.filter(f=>f.id.startsWith('partition-GROUND-service-spine:'))
 const first=faces.filter(f=>f.id.startsWith('partition-FIRST-wet-spine:'))
 assert.ok(ground.length>1&&first.length>1)
 assert.ok(ground.every(f=>f.vertices.every(p=>p.x===9500&&p.z>=0&&p.z<=d.levels.ceilingGround)))
 assert.ok(first.every(f=>f.vertices.every(p=>p.x===9500&&p.z>=d.levels.first&&p.z<=d.levels.ceilingFirst)))
 const service=compileCurrentSectionContext({station:layoutFamilySource.cuts.B,
  roofBuildDepth:layoutFamilySource.roofBuildZone})
 assert.ok(service.background.some(s=>s.meaning.includes('roof-')))
 assert.ok(!service.background.some(s=>s.meaning.startsWith('partition-')))
 const principal=compileCurrentSectionContext({station:layoutFamilySource.cuts.A,
  roofBuildDepth:layoutFamilySource.roofBuildZone})
 assert.ok(principal.background.some(s=>s.meaning.includes('court-west')))
})
