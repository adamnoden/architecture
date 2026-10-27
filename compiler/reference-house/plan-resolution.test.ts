import {mm} from '../units.js'
import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createResolvedReferenceHouseSource,groundPlanResolution as choice} from './plan-resolution.js'
import {compileReferenceHouseSystem} from './system-compile.js'
import {createResolvedReferenceHouseAdePlan} from './resolved-ade-plan.js'
import {createResolvedReferenceHouseAdePlanScene} from './resolved-ade-plan-scene.js'
import {auditResolvedHallCirculation} from './hall-circulation.js'
import {createReferenceHouseServiceSource} from '../rhc3/fixture.js'
import {validateArchitecturalPlan} from '../architectural-drawing/validate.js'
const source=createResolvedReferenceHouseSource(),system=compileReferenceHouseSystem(source),plan=createResolvedReferenceHouseAdePlan(system.house,source)

test('option 3 source has three real rooms, open hall/family and closed floor areas without the former drawing room',()=>{
 assert.equal(system.status,'PASS',JSON.stringify(system.diagnostics))
 assert.ok(!source.spaces.some(s=>s.id==='G-DRAW-02'))
 for(const id of ['G-STUDY-02','G-WC-01','G-CLOAK-01'])assert.ok(plan.spaces.some(s=>s.id===id))
 assert.ok(source.requiredAdjacencies.some(a=>a.id==='ADJ-G-HALL-FAMILY'))
 assert.ok(!plan.walls.some(w=>w.provenance.sourceIds.includes('G-WEST-SPLIT-B')||w.provenance.sourceIds.includes('G-HALL-WEST-B')))
 assert.equal(plan.adjacencies.length,0)
 assert.equal(auditResolvedHallCirculation(source,choice).pass,true)
 assert.equal(auditResolvedHallCirculation(source,choice).clearCrossHallMm,1032.5)
})

test('private study, WC and cloak have independent usable doors, with room fittings inside actual wall faces',()=>{
 const boxes={study:{x0:417.5,x1:3037.5,y0:417.5,y1:2487.5},cloak:{x0:9412.5,x1:11582.5,y0:417.5,y1:1587.5},wc:{x0:9412.5,x1:11582.5,y0:1712.5,y1:3337.5}}
 const fits=(f:{x:number;y:number;width:number;depth:number},r:typeof boxes.study)=>assert.ok(f.x>=r.x0&&f.x+f.width<=r.x1&&f.y>=r.y0&&f.y+f.depth<=r.y1)
 for(const f of Object.values(choice.roomFit.study))fits(f,boxes.study)
 fits(choice.roomFit.cloak.storage,boxes.cloak)
 for(const f of Object.values(choice.roomFit.wc))fits(f,boxes.wc)
 assert.equal(choice.roomFit.wc.serviceLining.y-(choice.roomFit.wc.pan.y+choice.roomFit.wc.pan.depth),0)
 assert.ok(choice.roomFit.wc.pan.y-boxes.wc.y0>=750,'WC front working field')
 assert.ok(choice.roomFit.cloak.storage.x-boxes.cloak.x0>=1000,'real walk-in aisle beside 600 mm hanging')
 const cloak=choice.openings.find(o=>o.id==='G-CLOAK-HALL-D01')!,wc=choice.openings.find(o=>o.id==='G-WC-HALL-D01')!,study=choice.openings.find(o=>o.id==='G-STUDY-FAMILY-D01')!
 assert.ok(cloak.centre+cloak.width/2<boxes.cloak.y1)
 assert.ok(wc.centre-wc.width/2>boxes.wc.y0)
 assert.ok(9350+wc.width<choice.roomFit.wc.pan.x,'open WC leaf stops short of pan')
 assert.ok(9350+cloak.width<choice.roomFit.cloak.storage.x,'cloak door opens clear of storage')
 assert.ok(study.centre+study.width/2<=boxes.study.x1)
 assert.ok(2550-study.width>=choice.roomFit.study.chair.y+choice.roomFit.study.chair.depth,'study swing stays clear of chair envelope')
})

test('WC is included in wet services/extract; primary routes avoid the study and cloakroom',()=>{
 const s=createReferenceHouseServiceSource(source)
 assert.ok(s.protectedPrimaryFreeSpaceIds.includes('G-STUDY-02'))
 for(const id of ['G-WET-TERMINALS','MV-G-EXTRACT-TERMINALS','DRY-G-TERMINALS','HYD-G-TERMINALS'])assert.ok(s.nodes.find(n=>n.id===id)!.hostSpaceIds.includes('G-WC-01'))
 for(const id of ['R-WATER-GROUND','R-FOUL-GROUND','R-MV-EXT-G','R-DRY-G-BRANCH','R-HYD-G-BRANCH'])assert.ok(s.routes.find(r=>r.id===id)!.hostSpaceIds.includes('G-WC-01'))
 assert.ok(!s.routes.some(r=>r.primaryInfrastructure&&r.hostSpaceIds.some(id=>['G-STUDY-02','G-CLOAK-01'].includes(id))))
 assert.ok(!s.nodes.find(n=>n.id==='MV-G-SUPPLY-TERMINALS')!.hostSpaceIds.includes('G-WC-01'))
})

test('schematic fittings are sourced semantic entities and reject invalid dimensions',()=>{
 assert.deepEqual(validateArchitecturalPlan(plan),[])
 assert.equal(plan.fittings?.length,4)
 const p=structuredClone(plan);p.fittings=[{...p.fittings![0],width:mm(NaN)}]
 assert.ok(validateArchitecturalPlan(p).some(d=>d.code==='ADE-FITTING-GEOMETRY'))
 for(const scale of [100,50] as const){
  const scene=createResolvedReferenceHouseAdePlanScene(system.house,source,scale)
  for(const f of plan.fittings!)assert.ok(scene.primitives.some(p=>p.metadata?.fitting===f.id))
 }
})

test('guest WC has a side window wholly within its room; courtyard west windows now belong to family only',()=>{
 const wc=choice.openings.find(o=>o.id==='G-WC-E-W01')!
 assert.equal(wc.hostBoundaryId,'G-OUTER-EAST')
 assert.equal(wc.width,900)
 assert.ok(wc.centre-wc.width/2>1650+62.5 && wc.centre+wc.width/2<3400-62.5)
 assert.equal(plan.openings.find(o=>o.id===wc.id)?.symbol?.kind,'window')
 assert.deepEqual(source.qualitativeOpeningRelationships.find(o=>o.levelId==='GROUND'&&o.hostBoundaryId==='G-COURT-WEST')?.spaceIds,['G-FAM-02'])
})
