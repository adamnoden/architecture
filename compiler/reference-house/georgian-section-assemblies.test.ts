import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createSectionExemplar,design} from './georgian/section-exemplar.js'
import {createSectionExemplar as prior} from './georgian/section-exemplar-05.js'
import {sectionAssemblyModels,sectionAssemblyChoices} from './georgian/section-source.js'
import {sectionAt} from './georgian/sections-roof-01.js'
import {roofHeight} from './georgian/section-exemplar.js'
test('current principal uses shared assembly semantics with heads under both leaves',()=>{
 const scene=createSectionExemplar('PRINCIPAL',100)
 for(const w of sectionAt(6000).walls){
  const support=scene.primitives.find(p=>p.id===w.id+'-support-reservation')!;assert.equal(support.metadata?.dimensionable,false)
  for(const o of w.holes.filter(o=>o.kind==='window'))assert.ok(scene.primitives.some(p=>p.id===`${w.id}-${o.id}-cut-window-frame`))
  for(const o of w.holes)for(const layer of ['weather','inner'])assert.ok(scene.primitives.some(p=>p.id===`${w.id}-${o.id}-head-${layer}`))
 }
 assert.ok(scene.primitives.some(p=>p.id==='courtyard-door-leaf'))
 assert.ok(!scene.primitives.some(p=>p.id.startsWith('foundation-axis-')||p.id.startsWith('service-void-')))
 assert.equal(design.sectionAssemblies.foundationTypeSelected,false)
})
test('house geometry remains in source and packages land at held levels',()=>{
 const m=sectionAssemblyModels(sectionAt(6000),x=>roofHeight(Math.min(x,12000-x))-300)
 for(const f of m.floors.filter(f=>f.id.startsWith('first-floor'))){
  const depth=f.layers.reduce((sum,l)=>sum+('value' in l.thickness?l.thickness.value:NaN),0)
  assert.equal(f.top-depth,3100)
  assert.equal(f.left,sectionAt(6000).floorRuns[Number(f.id.at(-1))][0])
 }
 const book=createSectionExemplar('PRINCIPAL',100),wall=createSectionExemplar('PRINCIPAL',50)
 assert.equal(book.primitives.filter(p=>p.metadata?.coalesced===true).length,2)
 assert.equal(wall.primitives.filter(p=>p.metadata?.coalesced===true).length,0)
 assert.equal(sectionAssemblyChoices.layers.weather+sectionAssemblyChoices.layers.cavity+sectionAssemblyChoices.layers.innerIncludingFinish,417.5)
})
test('section refactor does not redraw held roof or exterior family',()=>{
 const geometry=(view:'ROOF'|'ROOF-WATER'|'FRONT'|'COURT',scale:100|50,current:boolean)=> (current?createSectionExemplar:prior)(view,scale).primitives.map(({metadata,...rest})=>rest)
 for(const v of ['ROOF','ROOF-WATER','FRONT','COURT'] as const)for(const scale of [50,100] as const)assert.deepEqual(geometry(v,scale,true),geometry(v,scale,false))
})
