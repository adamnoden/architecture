import assert from 'node:assert/strict'
import {test} from 'node:test'
import {roofRingFaces,ringRoofHeight,type RingRoofSource} from './georgian/roof-surfaces.js'
import {layoutRevision as d} from './georgian/layout-revision.js'
import {currentRoofZ} from './georgian/layout-family.js'
import {exteriorFaces} from './georgian/exterior-isometrics.js'

const source = (): RingRoofSource => ({
  shell:d.shell,courtInset:d.court.x,ridgeInset:d.roof.ridgeInset,overhang:d.roof.overhang,
  eaves:d.roof.eaves,pitchDeg:d.roof.upperPitchDeg,buildDepth:300
})
const eq = (a:number,b:number)=>Math.abs(a-b)<1e-7
test('one roof surface generator preserves the existing intact-isometric field IDs and shape',()=>{
 const faces=roofRingFaces(source())
 assert.equal(faces.length,48)
 const used=exteriorFaces().filter(f=>f.id.startsWith('roof-'))
 assert.deepEqual(used,faces)
 assert.equal(new Set(faces.map(f=>f.id)).size,48)
 for(const f of faces.filter(f=>f.id.endsWith('-0')))for(const p of f.vertices)
   assert.ok(eq(p.z, currentRoofZ(p.x,p.y)))
})
test('all roof vertices share the section/elevation roof height law and respond to source mutation',()=>{
 const s=source(),faces=roofRingFaces(s)
 assert.ok(faces.every(f=>f.vertices.every(p=>Number.isFinite(p.z))))
 for(const f of faces.filter(f=>f.id.endsWith('-0')))for(const p of f.vertices)
   assert.ok(eq(p.z,ringRoofHeight(s,p.x,p.y)))
 const raised=roofRingFaces({...s,eaves:s.eaves+130})
 for(let i=0;i<faces.length;i++)for(let j=0;j<faces[i].vertices.length;j++)
   assert.ok(eq(raised[i].vertices[j].z-faces[i].vertices[j].z,130))
 const changed=roofRingFaces({...s,pitchDeg:s.pitchDeg+4})
 assert.ok(changed.some((f,i)=>f.vertices.some((p,j)=>!eq(p.z,faces[i].vertices[j].z))))
})
test('impossible ring geometry fails closed rather than fabricate flat or inverted roofs',()=>{
 const s=source()
 for(const other of [{...s,pitchDeg:0},{...s,ridgeInset:s.courtInset},{...s,overhang:4000},{...s,buildDepth:0},{...s,shell:NaN}])
   assert.throws(()=>roofRingFaces(other),/Invalid/)
})
