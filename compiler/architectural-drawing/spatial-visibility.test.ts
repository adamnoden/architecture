import assert from 'node:assert/strict'
import {test} from 'node:test'
import {visibleSpatialSegments} from './spatial-visibility.js'
import type {SpatialSegment} from './spatial-line-drawing.js'
const basis={horizontal:[1,0,0],vertical:[0,1,0],viewDirection:[0,0,1]} as const
const edge=(z:number):SpatialSegment=>({id:'edge',a:{x:0,y:3,z},b:{x:10,y:3,z},role:'primary',meaning:'independent-fixture'})
const face={id:'asymmetric-screen',vertices:[{x:2,y:1,z:5},{x:6,y:1,z:5},{x:6,y:7,z:5},{x:2,y:7,z:5}]}
test('opaque convex face clips only the covered interval of a rear edge',()=>{
 const s=visibleSpatialSegments([edge(0)],[face],basis);assert.equal(s.length,2)
 assert.ok(Math.abs(s[0].b.x-2)<1e-6);assert.ok(Math.abs(s[1].a.x-6)<1e-6);assert.equal(s[1].b.x,10)
 assert.equal(s[0].role,'primary');assert.equal(s[0].meaning,'independent-fixture')
})
test('front and coplanar edges survive, and overlapping occluders form a union',()=>{
 for(const z of [5,8]){const s=visibleSpatialSegments([edge(z)],[face],basis);assert.equal(s.length,1);assert.deepEqual(s[0].a,edge(z).a);assert.deepEqual(s[0].b,edge(z).b)}
 const second={...face,id:'other',vertices:face.vertices.map(p=>({...p,x:p.x+2}))}
 const s=visibleSpatialSegments([edge(0)],[second,face],basis);assert.equal(s.length,2);assert.ok(Math.abs(s[1].a.x-8)<1e-6)
 assert.deepEqual(s,visibleSpatialSegments([edge(0)],[face,second],basis))
})
test('sloping occluders compare interpolated ray depth rather than mean face depth',()=>{
 const ramp={...face,vertices:face.vertices.map(p=>({...p,z:p.x-4}))}
 const s=visibleSpatialSegments([edge(0)],[ramp],basis);assert.equal(s.length,2);assert.ok(Math.abs(s[0].b.x-4)<1e-5);assert.ok(Math.abs(s[1].a.x-6)<1e-5)
})
test('rejects non-planar and non-convex occluders instead of guessing visibility',()=>{
 assert.throws(()=>visibleSpatialSegments([edge(0)],[{...face,vertices:face.vertices.map((p,i)=>({...p,z:i===2?6:5}))}],basis),/Non-planar/)
 assert.throws(()=>visibleSpatialSegments([edge(0)],[{...face,vertices:[face.vertices[0],face.vertices[1],{x:3,y:2,z:5},face.vertices[2],face.vertices[3]]}],basis),/Non-convex/)
})
