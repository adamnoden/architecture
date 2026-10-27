import assert from 'node:assert/strict'
import {test} from 'node:test'
import {design,roofTop} from './georgian/facade-source.js'
import {sectionAt,roofZ,sectionRoofSource,technicalViews,createSectionRoofScene} from './georgian/sections-roof.js'
import {renderDrawingSceneV2SvgWithTokens} from '../publication-drawing-v2/svg.js'
import {PLT_CANDIDATE_TOKENS} from '../publication-drawing-v2/plt-candidate-tokens.js'
test('principal section intersects real doors/windows and leaves courtyard floors absent',()=>{
 const m=sectionAt(6000);assert.equal(m.court,true);assert.deepEqual(m.floorRuns,[[417.5,3782.5],[8217.5,11582.5]])
 assert.deepEqual(m.walls.find(w=>w.id==='outer-south')!.holes.map(h=>h.id),['front-door','south-window-2'])
 assert.deepEqual(m.walls.find(w=>w.id==='court-north')!.holes.map(h=>h.id),['grand-court-entry'])
 assert.equal(m.walls.find(w=>w.id==='court-south')!.holes.length,0)
})
test('service section intersects the held wet-room partitions and riser strip',()=>{
 const m=sectionAt(9900);assert.equal(m.court,false);assert.ok(9900>=design.services.riser.x&&9900<=design.services.riser.x+design.services.riser.width)
 assert.deepEqual(m.partitions.filter(w=>w.base===0).map(w=>w.at),[3000,8155,9400]);assert.deepEqual(m.partitions.filter(w=>w.base===3450).map(w=>w.at),[4000,6500,8700])
})
test('four roof fields cover the ring once, omit the court and fall monotonically outward',()=>{
 const area=(p:number[][])=>Math.abs(p.reduce((n,a,i)=>{const b=p[(i+1)%p.length];return n+a[0]*b[1]-b[0]*a[1]},0))/2
 assert.equal(sectionRoofSource.roofFields.reduce((n,p)=>n+area(p),0),12000**2-3600**2)
 for(const [a,b]of sectionRoofSource.falls){assert.ok(roofZ(a[0],a[1])>roofZ(b[0],b[1]));for(let i=0;i<20;i++){const t=i/20,tt=(i+1)/20;assert.ok(roofZ(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t)>roofZ(a[0]+(b[0]-a[0])*tt,a[1]+(b[1]-a[1])*tt))}}
 assert.equal(roofZ(4200,4200),roofTop());assert.equal(roofZ(0,6000),6800)
})
test('storage platform clears roof zone at setback and upper stair is absent',()=>{
 const inset=sectionRoofSource.storageFloorInset;assert.ok(roofZ(inset,6000)-300>=6900)
 for(const v of ['PRINCIPAL','SERVICE-SECTION'] as const){const s=createSectionRoofScene(v,100);assert.ok(!s.primitives.some(p=>p.id.includes('tread')));assert.ok(s.primitives.some(p=>p.kind==='text'&&p.value.includes('upper stair withdrawn')))}
})
test('all five section/roof candidates are deterministic vectors with explicit drainage limits',()=>{
 for(const v of technicalViews)for(const scale of [100,50] as const){const s=createSectionRoofScene(v,scale);assert.equal(renderDrawingSceneV2SvgWithTokens(s,PLT_CANDIDATE_TOKENS),renderDrawingSceneV2SvgWithTokens(createSectionRoofScene(v,scale),PLT_CANDIDATE_TOKENS));assert.equal(s.sourceId,design.id)}
 assert.ok(sectionRoofSource.limitations.some(s=>s.includes('Courtyard')))
 const s=createSectionRoofScene('ROOF-WATER',100);assert.equal(s.primitives.filter(p=>p.id.startsWith('outlet-')).length,4)
})
