import assert from 'node:assert/strict'
import {test} from 'node:test'
import {layoutRevision as d,entryVoid,revisionOpenings,createRevisionScene} from './georgian/layout-revision.js'
import {layoutFamilySource,layoutFamilyViews,createLayoutFamilyScene,layoutSectionAt,currentRoofZ,roofTop,elevationSource} from './georgian/layout-family.js'
import {layoutAnalysisViews,createLayoutAnalysisScene} from './georgian/layout-analysis.js'
import {sectionAssemblyModels} from './georgian/section-source.js'
const z=(paper:number,scale:number)=>12000-(paper-(scale===100?18:150))*scale
const x=(paper:number,scale:number)=>(paper-(scale===100?12.5:90))*scale

test('revised family keeps reviewed plans exact and every current sheet deterministic with unique identities',()=>{
 for(const scale of [50,100] as const){
  for(const view of layoutFamilyViews){const s=createLayoutFamilyScene(view,scale);assert.equal(s.sourceId,layoutFamilySource.id);assert.deepEqual(s,createLayoutFamilyScene(view,scale));assert.equal(new Set(s.primitives.map(q=>q.id)).size,s.primitives.length,view)}
  for(const view of ['GROUND','FIRST'] as const)assert.deepEqual(createLayoutFamilyScene(view,scale).primitives,createRevisionScene(view,scale).primitives)
 }
})
test('principal cut clears the parallel bedroom wall, cuts both court doors and removes only the atrium floor',()=>{
 const m=layoutSectionAt(layoutFamilySource.cuts.A);assert.equal(m.voidCut,true);assert.notEqual(m.x,6000)
 assert.deepEqual(m.floorRuns,[[417.5,3832.5],[8167.5,11582.5]])
 assert.deepEqual(m.firstFloorRuns,[[entryVoid.y+entryVoid.depth,3832.5],[8167.5,11582.5]])
 for(const side of ['south','north'])assert.ok(m.walls.find(w=>w.id==='court-'+side)!.holes.some(h=>h.kind==='door'&&h.lo===0&&h.hi===2850))
 const a=sectionAssemblyModels(m,y=>currentRoofZ(m.x,y)-300,{firstFloorRuns:m.firstFloorRuns,storageDeckRuns:m.storageDeckRuns})
 assert.equal(a.floors.filter(f=>f.id.startsWith('first-floor-'))[0].left,2712.5)
 assert.equal(a.floors.find(f=>f.id==='roof-ceiling-0')!.left,417.5)
 const scene=createLayoutFamilyScene('PRINCIPAL',100)
 assert.ok(scene.primitives.some(q=>q.id==='void-guard'));assert.ok(scene.primitives.some(q=>q.kind==='text'&&q.value==='Bedroom 4'));assert.ok(!scene.primitives.some(q=>q.kind==='text'&&q.value==='Walk-in'))
 assert.ok(!scene.primitives.some(q=>q.id.startsWith('first-floor-0')&&q.metadata?.representation==='indicative-seat'))
})
test('every elevation aperture derives from revised plan including two court doors and the four-bay rear first floor',()=>{
 for(const view of ['FRONT','REAR','SERVICE','COURT-ENTRY','COURT-WINDOWS'] as const){
  const m=elevationSource(view),s=createLayoutFamilyScene(view,100)
  assert.equal(m.width,m.court?3500:12000)
  for(const a of m.apertures){const o=revisionOpenings(a.level).find(o=>o.id===a.sourceId)!;assert.equal(a.width,o.width);assert.equal(a.u,m.reverse?d.shell-o.centre:o.centre)
   const q=s.primitives.find(q=>q.id===(a.kind==='window'?a.id+'-outline':a.id))!;assert.equal(q.kind,'path');if(q.kind==='path'){const xs=q.rings.flat().map(p=>x(p.x,100));assert.ok(Math.abs(Math.max(...xs)-Math.min(...xs)-a.width)<1e-6)}
  }
 }
 for(const view of ['COURT-ENTRY','COURT-WINDOWS'] as const)assert.equal(elevationSource(view).apertures.filter(a=>a.kind==='door').length,1)
 assert.equal(elevationSource('REAR').apertures.filter(a=>a.level==='FIRST').length,4)
 assert.equal(elevationSource('FRONT').apertures.filter(a=>a.level==='FIRST').length,5)
})
test('roof and section geometry use the smaller court and revised ridge, without flat fields or roof openings',()=>{
 assert.ok(Math.abs(roofTop()-(6800+2125*Math.tan(25*Math.PI/180)))<1e-8)
 for(const y of [0,4250,7750,12000])assert.equal(currentRoofZ(5900,y),6800)
 for(const scale of [50,100] as const){const roof=createLayoutFamilyScene('ROOF',scale),ridge=roof.primitives.find(q=>q.id==='ridge')!;assert.equal(ridge.kind,'path');if(ridge.kind==='path'){const xs=ridge.rings.flat().map(p=>x(p.x,scale));assert.ok(Math.abs(Math.min(...xs)-2125)<1e-6);assert.ok(Math.abs(Math.max(...xs)-9875)<1e-6)}
  const front=createLayoutFamilyScene('FRONT',scale).primitives.find(q=>q.id==='roof-ridge')!;assert.equal(front.kind,'line');if(front.kind==='line')assert.ok(Math.abs(z(front.a.y,scale)-roofTop())<1e-6)
 }
 const service=createLayoutFamilyScene('SERVICE-SECTION',100);assert.ok(service.primitives.some(q=>q.id==='riser-reserve'));assert.ok(service.primitives.some(q=>q.kind==='text'&&q.value==='Utility'));assert.ok(service.primitives.some(q=>q.kind==='text'&&q.value==='En suite'))
 assert.ok(!service.primitives.some(q=>q.metadata?.representation==='indicative-seat'))
})
test('analytical sheets retain exact current substrates and current service geography; weak anatomy is withheld',()=>{
 assert.equal(layoutAnalysisViews.length,6)
 for(const view of layoutAnalysisViews)for(const scale of [50,100] as const){const s=createLayoutAnalysisScene(view,scale);assert.deepEqual(s,createLayoutAnalysisScene(view,scale));assert.equal(new Set(s.primitives.map(q=>q.id)).size,s.primitives.length,view)
  const roof=view==='ROOF-FAILURE'||view==='EXTERNAL-ACCESS',base=createLayoutFamilyScene(roof?'ROOF-WATER':view==='FIRST-SERVICES'?'FIRST':'GROUND',scale)
  for(const q of s.primitives.filter(q=>!q.id.startsWith('analysis-')))assert.deepEqual(q,base.primitives.find(b=>b.id===q.id),view+'/'+q.id)
 }
 const s=createLayoutAnalysisScene('GROUND-SERVICES',100),r=s.primitives.find(q=>q.id==='analysis-riser')!;assert.equal(r.kind,'rect');if(r.kind==='rect'){assert.ok(Math.abs((r.x-22)*100-d.services.riser.x)<1e-6);assert.equal(r.width,d.services.riser.width/100)}
})
