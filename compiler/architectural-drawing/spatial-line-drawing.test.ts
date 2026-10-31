import assert from 'node:assert/strict'
import {test} from 'node:test'
import {spatialSegmentsToDrawingPrimitives} from './spatial-line-drawing.js'
const options={basis:{horizontal:[1,0,0] as const,vertical:[0,1,0] as const,viewDirection:[0,0,1] as const},paperOrigin:{x:20,y:30},paperMmPerModelMm:.01,provenance:{sourceIds:['CONTRAST'],authority:'controlled' as const,precision:'exact' as const}}
const segments=[{id:'offset',a:{x:-500,y:700,z:900},b:{x:1300,y:1700,z:450},role:'primary' as const,meaning:'contrast'}]
test('generic spatial lines preserve model provenance and use explicit projection without house dimensions',()=>{
 const out=spatialSegmentsToDrawingPrimitives(segments,options),v=out[0];assert.ok(v.kind==='line');assert.deepEqual(v.a,{x:15,y:23});assert.deepEqual(v.b,{x:33,y:13});assert.equal(v.metadata?.solidGeometry,false);assert.equal(v.metadata?.hiddenLineRemoval,false)
 const twice=spatialSegmentsToDrawingPrimitives(segments,{...options,paperMmPerModelMm:.02})[0];assert.ok(twice.kind==='line');assert.equal(twice.b.x-twice.a.x,2*(v.b.x-v.a.x))
 assert.throws(()=>spatialSegmentsToDrawingPrimitives(segments,{...options,paperMmPerModelMm:NaN}));assert.throws(()=>spatialSegmentsToDrawingPrimitives([...segments,...segments],options));assert.throws(()=>spatialSegmentsToDrawingPrimitives([{...segments[0],a:{x:NaN,y:0,z:0}}],options))
})
