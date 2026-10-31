import assert from 'node:assert/strict'
import {test} from 'node:test'
import {mm} from '../units.js'
import {createSectionPaperProjection} from '../publication-drawing/projection.js'
import {sectionContrastModel,createSectionContrastScene} from './section-contrast-fixture.js'
import {sectionWallToDrawingPrimitives,sectionFloorToDrawingPrimitives} from './section-assemblies.js'
import {framedApertureToDrawingPrimitives,cutApertureToDrawingPrimitives} from './aperture-drawing.js'
const p=(scale=100)=>createSectionPaperProjection({scaleDenominator:scale,horizontalBounds:{min:0,max:12000},verticalBounds:{min:-2000,max:12000},paperOrigin:{x:0,y:0}})
const bounds=(v:ReturnType<typeof sectionWallToDrawingPrimitives>[number])=>{assert.ok(v.kind==='path');return {left:Math.min(...v.rings.flat().map(p=>p.x)),right:Math.max(...v.rings.flat().map(p=>p.x)),top:Math.min(...v.rings.flat().map(p=>p.y)),bottom:Math.max(...v.rings.flat().map(p=>p.y))}}
test('section leaves preserve actual cavity, mirrored order, openings, heads and connected substructure',()=>{
 for(const shift of [-1300,0,530])for(const w of sectionContrastModel(shift).walls){
  const out=sectionWallToDrawingPrimitives(w,p()),outer=out.find(v=>v.id===w.id+'-outer-upper')!,inner=out.find(v=>v.id===w.id+'-inner-upper')!
  const a=bounds(outer),b=bounds(inner)
  assert.equal(Math.round((w.exteriorFace==='left'?b.left-a.right:a.left-b.right)*100),120)
  assert.equal(Math.round((a.right-a.left)*100),90);assert.equal(Math.round((b.right-b.left)*100),160)
  for(const o of w.openings){
   const closure=out.find(v=>v.id===`${w.id}-${o.id}-air-closure`)!;assert.ok(closure.kind==='line');assert.equal(Math.round(Math.abs(closure.b.x-closure.a.x)*100),120)
   for(const id of ['outer','inner']){const head=out.find(v=>v.id===`${w.id}-${o.id}-head-${id}`)!;assert.equal(Math.round((bounds(head).bottom-bounds(head).top)*100),180)}
  }
  const leaf=out.find(v=>v.id===`${w.id}-outer-below-${w.openings[0].id}`)!,support=out.find(v=>v.id===w.id+'-support-reservation')!
  assert.equal(bounds(leaf).bottom,bounds(support).top)
  assert.equal(support.metadata?.dimensionable,false);assert.equal(support.metadata?.foundationDepthSelected,false)
  assert.ok(!out.some(v=>v.metadata?.layer==='air'))
 }
})
test('floor grouping is physical-scale aware, voids stay empty, seats do not turn into wall pockets',()=>{
 const f=sectionContrastModel().floors[0]
 for(const scale of [50,100]){
  const out=sectionFloorToDrawingPrimitives(f,p(scale),{minimumBoundarySpacingMm:.25})
  assert.equal(out.filter(v=>v.metadata?.coalesced===true).length,scale===100?1:0)
  assert.ok(!out.some(v=>v.metadata?.layers==='void'))
  const timber=out.find(v=>v.id==='floor-0-timber')!,b=bounds(timber)
  assert.equal(Math.round(b.left*scale),f.left+35);assert.equal(Math.round(b.right*scale),f.right-35)
  const seat=out.find(v=>v.id==='floor-0-seat-left')!;assert.equal(bounds(seat).top,b.bottom)
  const top=out.find(v=>v.id.startsWith('floor-0-finish'))!;assert.equal(bounds(top).top,(12000-f.top)/scale)
 }
})
test('nominal inputs fail closed for unknown layers, overlaps, invalid supports and non-finite geometry',()=>{
 const {walls,floors}=sectionContrastModel(),w=walls[0],f=floors[0]
 for(const bad of [
  {...w,left:NaN}, {...w,layers:[{...w.layers[0],thickness:{kind:'unknown'} as const}]},
  {...w,layers:[{...w.layers[0],thickness:{kind:'exact',value:mm(0)} as const}]},
  {...w,openings:[...w.openings,{...w.openings[0],id:'overlap'}]},
  {...w,openings:[{...w.openings[0],head:{depth:5000,layerIds:['outer'],closeCavity:true}}]},
  {...w,openings:[{...w.openings[0],head:{depth:100,layerIds:['absent'],closeCavity:true}}]},
  {...w,substructure:{bottom:100,reservationHeight:200,reservationProjection:100}},
  {...w,provenance:{...w.provenance,precision:'unknown' as const}}
 ])assert.throws(()=>sectionWallToDrawingPrimitives(bad,p()))
 assert.throws(()=>sectionFloorToDrawingPrimitives({...f,seats:{underLayerId:'timber',projection:20,depth:20}},p(),{minimumBoundarySpacingMm:.25}))
 assert.throws(()=>sectionFloorToDrawingPrimitives({...f,layers:[{...f.layers[0],endGap:4000}]},p(),{minimumBoundarySpacingMm:.25}))
})
test('frame grids respond to aperture dimensions/counts and preserve supplied provenance',()=>{
 const a={id:'variant',left:123,bottom:800,width:1400,height:1800,frameInset:70,columns:2,rows:3,role:'secondary' as const,provenance:sectionContrastModel().walls[0].provenance}
 const out=framedApertureToDrawingPrimitives(a,p())
 assert.equal(out.filter(v=>v.kind==='line').length,3)
 const frame=out.find(v=>v.id==='variant-frame')!;assert.equal(Math.round((bounds(frame).right-bounds(frame).left)*100),1260)
 assert.ok(out.every(v=>v.metadata?.sources===a.provenance.sourceIds.join(',')))
 assert.throws(()=>framedApertureToDrawingPrimitives({...a,columns:2.5},p()))
 assert.throws(()=>framedApertureToDrawingPrimitives({...a,frameInset:800},p()))
 assert.throws(()=>cutApertureToDrawingPrimitives({id:'bad',frameLeft:0,frameWidth:50,bottom:0,top:2000,leafX:20,leafBottom:0,leafTop:2100,provenance:a.provenance},p()))
})
test('contrast scenes compile deterministically at both actual scales',()=>{
 for(const scale of [50,100] as const){const a=createSectionContrastScene(scale);assert.deepEqual(a,createSectionContrastScene(scale));assert.ok(a.primitives.length>30);assert.equal(a.scaleDenominator,scale)}
})
