import { mm } from '../units.js'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { groundPlanResolution as choices, createResolvedReferenceHouseSource, auditCurrentStairReservation } from './plan-resolution.js'
import { auditResolvedHallCirculation } from './hall-circulation.js'
import { groundPlanResolution as b3Choices, createResolvedReferenceHouseSource as b3Source } from './plan-resolution-b3.js'
import { referenceHouseCourtGeometry } from './plan-adapter.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { compileReferenceHouseSystem } from './system-compile.js'
import { createResolvedReferenceHouseAdePlan } from './resolved-ade-plan.js'
import { createResolvedReferenceHouseAdePlanScene } from './resolved-ade-plan-scene.js'
import { validateArchitecturalPlan } from '../architectural-drawing/validate.js'
import { renderDrawingSceneV2Svg } from '../publication-drawing-v2/svg.js'

const source=createResolvedReferenceHouseSource(),system=compileReferenceHouseSystem(source),result=system.house

test('coordination successor passes existing complete-system checks without rewriting historical C1',()=>{
  assert.equal(system.status,'PASS')
  assert.equal(createReferenceHouseSource().partitions.frontHallWestX.value,4000)
  assert.deepEqual(createReferenceHouseSource().stair.riseTopology.value.flightRiseGroups,[6,6,6])
  assert.deepEqual(result.derived.stair.flightRiseGroups,[9,9])
  assert.equal(result.derived.stair.flightRun,2400)
  assert.equal(result.derived.stair.rise,3300/18)
})

test('all ground opening and connection obligations have explicit design dispositions',()=>{
  const p=createResolvedReferenceHouseAdePlan(result,source)
  assert.deepEqual(validateArchitecturalPlan(p),[])
  assert.equal(p.openings.length,choices.openings.length)
  assert.equal(p.adjacencies.length,0)
  assert.ok(p.openings.every(o=>o.symbol&&o.width.kind==='approximate'&&o.centreOffset.kind==='approximate'))
  for(const id of choices.removePartitions)assert.ok(!p.walls.some(w=>w.provenance.sourceIds.includes(id)))
  for(const w of choices.addPartitions)assert.ok(p.walls.some(n=>n.id===w.id))
  assert.ok(p.walls.some(w=>w.id.startsWith('G-GALLERY-SERVICE-B::resolution-')),'service enclosure T junctions must be split semantically')
})

test('occupied door approaches and cross-hall route clear the entire stair on both floors',()=>{
  assert.equal(auditCurrentStairReservation().ordinaryThreeSidedUFitsSquare,false)
  const audit=auditResolvedHallCirculation(source,choices)
  assert.equal(audit.pass,true,JSON.stringify(audit.checks))
  assert.equal(audit.clearCrossHallMm,1032.5)
  assert.equal(audit.underFlightRouteUsed,false)
  assert.equal(audit.stairHeadroomProved,false)
  const previous=auditResolvedHallCirculation(b3Source(),b3Choices)
  assert.equal(previous.pass,false)
  assert.equal(previous.checks.crossHallWidth,false)
  assert.equal(previous.checks.drawingApproach,false)
  const wrongHand={...choices,openings:choices.openings.map(o=>o.id==='G-FRONT-D01'?{...o,hingeEnd:'low' as const}:o)}
  assert.equal(auditResolvedHallCirculation(source,wrongHand).checks.entranceOpenLeafOutsideArrival,false)
  // Moving just the doorway cannot repair the old 32.5 mm cross passage.
  assert.equal(auditResolvedHallCirculation(b3Source(),{...b3Choices,openings:choices.openings}).pass,false)
})

test('courtyard reduction is explicit and service/study reservations retain their B3 area',()=>{
  assert.deepEqual([result.derived.court.y0,result.derived.court.y1,result.derived.court.depth],[4100,7400,3300])
  const previous=compileReferenceHouse(b3Source())
  for(const id of ['G-STUDY-02','G-SVC-02'])assert.equal(result.derived.spaces.find(s=>s.id===id)!.area,previous.derived.spaces.find(s=>s.id===id)!.area)
  const invalid=createResolvedReferenceHouseSource()
  delete invalid.court.value.offsetY
  assert.throws(()=>referenceHouseCourtGeometry(invalid),/requires a finite offset/)
  invalid.court.value.offsetY=mm(10000)
  assert.throws(()=>referenceHouseCourtGeometry(invalid),/strictly within shell/)
  const centred=createReferenceHouseSource();centred.court.value.offsetY=mm(350)
  assert.throws(()=>referenceHouseCourtGeometry(centred),/cannot carry an offset/)
})

for(const level of ['GROUND','FIRST'] as const)test(`${level}: two-scale stair and architectural symbols are deterministic`,()=>{
  const a=createResolvedReferenceHouseAdePlanScene(result,source,100,level),b=createResolvedReferenceHouseAdePlanScene(result,source,50,level)
  assert.deepEqual(a.primitives.map(p=>p.id),b.primitives.map(p=>p.id))
  assert.equal(a.primitives.filter(p=>p.id.includes('-riser-')).length,18)
  if(level==='GROUND') assert.ok(a.primitives.filter(p=>p.id.includes('landing-')).every(p=>p.kind==='line'&&p.dash==='overhead'))
  assert.ok(a.primitives.some(p=>p.kind==='text'&&p.value===(level==='GROUND'?'UP':'DN')))
  if(level==='GROUND'){
    assert.ok(!a.primitives.some(p=>p.metadata?.epistemic==='opening-uncertainty'||p.metadata?.between))
    for(const opening of choices.openings)assert.ok(a.primitives.some(p=>p.metadata?.opening===opening.id))
    assert.ok(a.primitives.some(p=>p.kind==='path'&&p.strokeOpacity===0.45))
  }
  assert.equal(renderDrawingSceneV2Svg(a),renderDrawingSceneV2Svg(createResolvedReferenceHouseAdePlanScene(result,source,100,level)))
})

test('an unknown aperture cannot acquire a window symbol and invalid stairs fail closed',()=>{
  const p=createResolvedReferenceHouseAdePlan(result,source)
  p.openings=[{...p.openings[0],width:{kind:'unknown'}}]
  assert.ok(validateArchitecturalPlan(p).some(d=>d.code==='ADE-OPENING-SYMBOL'))
  p.stairs=[{...p.stairs![0],cutHeight:p.stairs![0].floorToFloor}]
  assert.ok(validateArchitecturalPlan(p).some(d=>d.code==='ADE-STAIR-GEOMETRY'))
  p.stairs=[{...p.stairs![0],riserCount:17}]
  assert.ok(validateArchitecturalPlan(p).some(d=>d.code==='ADE-STAIR-GEOMETRY'))
})

test('successor cannot be drawn against stale historical source',()=>{
 const old=createReferenceHouseSource()
 assert.throws(()=>createResolvedReferenceHouseAdePlan(compileReferenceHouse(old),old),/paired architectural source/)
})

test('outward garden leaves clear the overall dimension at both scales',()=>{
 for(const scale of [100,50] as const){
  const scene=createResolvedReferenceHouseAdePlanScene(result,source,scale)
  const dim=scene.primitives.find(p=>p.id==='GROUND-width-dimension-line')!
  const leaf=scene.primitives.find(p=>p.id==='G-GARDEN-D01-leaf-1')!
  assert.ok(dim.kind==='line'&&leaf.kind==='line')
  if(dim.kind==='line'&&leaf.kind==='line')assert.ok(Math.min(leaf.a.y,leaf.b.y)-dim.a.y>=3.9)
 }
})

test('side daylight, wider garden doors and joined hall return are semantic choices; bay axes stay out of presentation',()=>{
 const plan=createResolvedReferenceHouseAdePlan(result,source)
 for(const id of ['G-STUDY-E-W01','G-SERVICE-E-W01'])assert.equal(plan.openings.find(o=>o.id===id)?.symbol?.kind,'window')
 assert.equal(choices.openings.find(o=>o.id==='G-GARDEN-D01')?.width,1800)
 const drawWindow=choices.openings.find(o=>o.id==='G-COURT-W-W01')!
 assert.ok(drawWindow.centre+drawWindow.width/2 < source.partitions.westRoomSplitY.value-62.5,'window aperture must clear the family partition body')
 assert.ok(drawWindow.centre-drawWindow.width/2 > result.derived.court.y0)
 const leaf=createResolvedReferenceHouseAdePlanScene(result,source,100).primitives.find(p=>p.id==='G-FRONT-D01-leaf-1')!
 assert.ok(leaf.kind==='line' && Math.abs(leaf.a.x-(16+7850/100))<1e-8)
 const ret=plan.walls.find(w=>w.id==='G-HALL-WEST-RETURN-B')!
 const hall=plan.walls.filter(w=>w.provenance.sourceIds.includes('G-HALL-WEST-B'))
 assert.ok(hall.some(w=>[w.fromNodeId,w.toNodeId].includes(ret.fromNodeId)))
 assert.ok(!createResolvedReferenceHouseAdePlanScene(result,source,100).primitives.some(p=>p.id.startsWith('front-axis-')))
 assert.ok(createResolvedReferenceHouseAdePlanScene(compileReferenceHouse(b3Source()),b3Source(),100).primitives.some(p=>p.id==='front-axis-label-1'))
})
