import assert from 'node:assert/strict'
import {test} from 'node:test'
import {groundPlanResolution as choice,createResolvedReferenceHouseSource} from './plan-resolution.js'
import {compileReferenceHouseSystem} from './system-compile.js'
import {createResolvedReferenceHouseAdePlan} from './resolved-ade-plan.js'
import {createResolvedReferenceHouseAdePlanScene} from './resolved-ade-plan-scene.js'
import {auditResolvedHallCirculation} from './hall-circulation.js'
import {auditSquareStairOptions} from './square-stair-audit.js'
import {createReferenceHouseServiceSource} from '../rhc3/fixture.js'
const source=createResolvedReferenceHouseSource(),system=compileReferenceHouseSystem(source),plan=createResolvedReferenceHouseAdePlan(system.house,source)

test('square shell/court are concentric with four equal rings and both 3100 mm ceilings',()=>{
 assert.equal(system.status,'PASS',JSON.stringify(system.diagnostics))
 const d=system.house.derived
 assert.deepEqual([d.shell.width,d.shell.depth,d.court.width,d.court.depth],[12000,12000,3600,3600])
 assert.deepEqual([d.ring.west,d.ring.east,d.ring.south,d.ring.north],[4200,4200,4200,4200])
 assert.deepEqual([d.levels.groundCeiling,d.levels.upperClearHeight,d.levels.firstFfl],[3100,3100,3450])
 assert.equal(d.levels.interStoreyGap,350)
 assert.equal(d.stair.rise,3450/18)
 assert.deepEqual(choice.openings.filter(o=>['G-FRONT-W01','G-FRONT-W02','G-FRONT-D01','G-FRONT-W04'].includes(o.id)).map(o=>o.centre),d.frontAxes)
})

test('service boundary faces align exactly with courtyard faces; all four courtyard windows mirror',()=>{
 const d=system.house.derived,wall=(id:string)=>choice.addPartitions.find(w=>w.id===id)!
 assert.equal(wall('G-SERVICE-SOUTH-B').a[1]-62.5,d.court.y0-417.5)
 assert.equal(wall('G-SERVICE-NORTH-B').a[1]+62.5,d.court.y1+417.5)
 for(const side of ['W','E']){
  const windows=choice.openings.filter(o=>o.id.startsWith(`G-COURT-${side}-W`))
  assert.deepEqual(windows.map(w=>[w.centre,w.width]),[[5100,1200],[6900,1200]])
  assert.equal((windows[0].centre+windows[1].centre)/2,6000)
 }
 assert.ok(plan.walls.filter(w=>w.id.startsWith('G-SERVICE-')).every(w=>w.assemblyId==='RH-PART-DRY-01'),'no unearned bearing-wall claim')
})

test('pantry is independently entered from kitchen and plant replacement stays in utility',()=>{
 const pantry=choice.openings.find(o=>o.id==='G-PANTRY-KITCHEN-D01')!,plant=choice.openings.find(o=>o.id==='G-PLANT-EXTERNAL-D01')!
 assert.equal(pantry.hostBoundaryId,'G-SERVICE-NORTH-B')
 assert.ok(plant.centre-plant.width/2>3845+62.5&&plant.centre+plant.width/2<6650-62.5)
 assert.ok(!source.requiredAdjacencies.some(a=>[a.a,a.b].includes('G-PANTRY-01')&&[a.a,a.b].includes('G-SVC-02')))
 const services=createReferenceHouseServiceSource(source)
 assert.ok(services.nodes.find(n=>n.id==='DRY-G-TERMINALS')!.hostSpaceIds.includes('G-PANTRY-01'))
 assert.ok(!services.routes.some(r=>r.primaryInfrastructure&&r.hostSpaceIds.includes('G-PANTRY-01')))
 assert.ok(plan.fittings!.some(f=>f.id==='RHPR-eastShelves'))
})

test('study grows with a bigger desk; full passage and all chosen fitting envelopes remain clear',()=>{
 const studyWidth=3200-62.5-417.5,studyDepth=2712.5-62.5-417.5
 assert.ok(studyWidth*studyDepth>1.1*(3100-62.5-417.5)*(2550-62.5-417.5))
 assert.equal(choice.roomFit.study.desk.depth,1600)
 const audit=auditResolvedHallCirculation(source,choice)
 assert.equal(audit.pass,true,JSON.stringify(audit.checks))
 assert.equal(audit.clearCrossHallMm,1007.5)
 assert.equal(source.partitions.groundStudyNorthY!.value+62.5,audit.stair.y1)
 const fits=(r:{x:number;y:number;width:number;depth:number},x0:number,x1:number,y0:number,y1:number)=>assert.ok(r.x>=x0&&r.x+r.width<=x1&&r.y>=y0&&r.y+r.depth<=y1)
 for(const f of Object.values(choice.roomFit.study))fits(f,417.5,3137.5,417.5,2650)
 for(const f of Object.values(choice.roomFit.cloak))fits(f,9412.5,11582.5,417.5,1687.5)
 for(const f of Object.values(choice.roomFit.wc))fits(f,9412.5,11582.5,1812.5,3782.5)
 for(const f of Object.values(choice.roomFit.pantry))fits(f,9412.5,11582.5,6712.5,8092.5)
 assert.ok(choice.roomFit.pantry.eastShelves.x-(choice.roomFit.pantry.westShelves.x+choice.roomFit.pantry.westShelves.width)>1000)
})

test('stair options retain negative evidence and both new physical profiles contain their notation',()=>{
 const a=auditSquareStairOptions()
 assert.equal(a.options.find(o=>o.id==='balanced-return-20')!.arrivalConflictMm,250)
 assert.ok(a.options.find(o=>o.id==='ordinary-three-sided-u-20')!.requiredBandWithFrameAndPassageMm!>a.clearFrontBandMm)
 assert.equal(a.options.filter(o=>o.status==='SELECT_PROVISIONAL').length,1)
 for(const level of ['GROUND','FIRST'] as const)for(const scale of [100,50] as const){
  const scene=createResolvedReferenceHouseAdePlanScene(system.house,source,scale,level)
  assert.ok(!scene.primitives.some(p=>p.id.startsWith('front-axis-')))
  assert.ok(scene.primitives.every(p=>p.kind!=='text'||p.y<scene.heightMm))
  assert.equal(scene.primitives.filter(p=>p.id.includes('-riser-')).length,18)
 }
})
