import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createOrthographicScene,orthographicViews,orthographicSource,currentRoofZ,createCurrentElevation} from './georgian/orthographic-family.js'
import {design,roofTop,createSectionExemplar} from './georgian/section-exemplar.js'
import {elevationSource} from './georgian/elevations.js'
import {openings} from './georgian/source.js'
import {sectionAt} from './georgian/sections-roof-01.js'
const modelX=(paper:number,scale:number)=>(paper-(scale===100?12.5:90))*scale
const modelZ=(paper:number,scale:number)=>12000-(paper-(scale===100?18:150))*scale
test('current family has one source identity and no superseded attic storey claim',()=>{
 for(const scale of [50,100] as const)for(const view of orthographicViews){const s=createOrthographicScene(view,scale);assert.equal(s.sourceId,orthographicSource.id);assert.deepEqual(s,createOrthographicScene(view,scale));assert.ok(!s.primitives.some(q=>q.kind==='text'&&/UP \/ DN|Usable attic|FFL 6900|dormer/i.test(q.value)));const ids=s.primitives.map(q=>q.id);assert.equal(new Set(ids).size,ids.length,view)}
})
test('all exterior projections share held ridge and eaves with source-owned aperture widths/positions',()=>{
 for(const view of ['FRONT','REAR','SERVICE','COURT-ENTRY','COURT-WINDOWS'] as const)for(const scale of [50,100] as const){
  const scene=createCurrentElevation(view,scale),model=elevationSource(view)
  const top=scene.primitives.find(q=>q.id===(model.court?'court-eaves':'roof-ridge'))!;assert.ok(top.kind==='line');assert.ok(Math.abs(modelZ(top.a.y,scale)-(model.court?6800:roofTop()))<1e-6)
  assert.ok(!scene.primitives.some(q=>q.id.includes('dormer')||q.id.startsWith('roof-envelope')))
  for(const a of model.apertures){const q=scene.primitives.find(q=>q.id===(a.kind==='window'?a.id+'-outline':a.id))!;assert.ok(q.kind==='path');const xs=q.rings.flat().map(q=>modelX(q.x,scale));assert.ok(Math.abs((Math.max(...xs)-Math.min(...xs))-a.width)<1e-6);assert.ok(Math.abs((Math.min(...xs)+Math.max(...xs))/2-a.u)<1e-6)}
  const tick=scene.primitives.find(q=>q.id==='datum-eaves')!;assert.ok(tick.kind==='text'&&tick.value==='+6.80')
 }
 const rear=elevationSource('REAR');for(const a of rear.apertures){const o=openings(a.level).find(o=>o.id===a.sourceId)!;assert.equal(a.u,12000-o.centre)}
})
test('service section uses shared layered heads and explicit framing/riser reservations',()=>{
 const scene=createOrthographicScene('SERVICE-SECTION',100),m=sectionAt(orthographicSource.cuts.B)
 for(const w of m.walls){assert.ok(scene.primitives.some(q=>q.id===w.id+'-support-reservation'));for(const h of w.holes)for(const leaf of ['weather','inner'])assert.ok(scene.primitives.some(q=>q.id===`${w.id}-${h.lo>=3450?'FIRST-':'GROUND-'}${h.id}-head-${leaf}`))}
 assert.ok(scene.primitives.some(q=>q.id==='riser-reserve'))
 assert.ok(scene.primitives.some(q=>q.metadata?.layers==='framing-reserve'&&q.metadata?.framingDirectionSelected===false))
 assert.ok(!scene.primitives.some(q=>q.metadata?.representation==='indicative-seat'))
 for(const id of ['G-WC','G-PLANT','G-PANTRY','G-KITCHEN','U-BED3','U-BATH','U-ENSP','U-PRINCIPAL'])assert.ok(scene.primitives.some(q=>q.id===id),id)
 const roof=scene.primitives.find(q=>q.id==='service-roof')!;assert.ok(roof.kind==='path');assert.equal(roof.metadata?.flatRoof,false)
 assert.ok(Math.abs(modelZ(roof.rings[0][1].y,100)-currentRoofZ(9900,2100))<1e-6)
 assert.equal(currentRoofZ(9900,5000),roofTop());assert.ok(currentRoofZ(9900,500)<roofTop())
})
test('first-floor stair descends only; roof and principal geometry remain held',()=>{
 for(const scale of [50,100] as const){const first=createOrthographicScene('FIRST',scale);assert.ok(first.primitives.some(q=>q.kind==='text'&&q.value==='DN'));assert.ok(!first.primitives.some(q=>q.kind==='text'&&/UP/.test(q.value)));const ground=createOrthographicScene('GROUND',scale);assert.ok(ground.primitives.some(q=>q.kind==='text'&&q.value==='UP'))
 for(const v of ['PRINCIPAL','ROOF'] as const){const held=createSectionExemplar(v,scale);if(v==='ROOF')for(const q of held.primitives)if(q.kind==='text'&&q.id==='court')q.id='court-label';assert.deepEqual(createOrthographicScene(v,scale).primitives,held.primitives)}
 }
 assert.equal(design.shell,12000)
})
