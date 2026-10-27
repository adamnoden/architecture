import assert from 'node:assert/strict'
import { test } from 'node:test'
import { groundPlanResolution as choices, createResolvedReferenceHouseSource, auditCurrentStairReservation } from './plan-resolution.js'
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

test('real stair, floor landings and widened turning route fit the represented fabric on both levels',()=>{
  assert.equal(auditCurrentStairReservation().ordinaryThreeSidedUFitsSquare,false)
  assert.equal(auditCurrentStairReservation().deficitMm,1000)
  const s=choices.stair,envelope=417.5,partition=125
  assert.equal(s.footprintWidth,(9-1)*s.going+s.landingDepth)
  assert.equal(s.footprintDepth,2*s.clearWidth+s.wellGap)
  assert.ok(s.landingDepth>=s.clearWidth)
  assert.ok(s.x-50>source.partitions.frontHallWestX.value+partition/2)
  assert.ok(s.y-50>envelope)
  assert.ok(s.y+s.footprintDepth+50<3400-envelope)
  // At the top landing, the east continuation is above the selected upper
  // south-turn partition. Keep a full 1000 mm floor arrival beyond the well.
  assert.ok(s.y+s.clearWidth+s.wellGap>3400-source.partitions.upperSouthLandingTurnDepth.value+partition/2)
  assert.ok(s.x+s.footprintWidth+50+1000<source.partitions.galleryServiceX.value-partition/2)
  const eastClear=source.partitions.galleryServiceX.value-partition/2-(7800+envelope)
  const turnClear=(3400-envelope)-(3400-source.partitions.upperSouthLandingTurnDepth.value+partition/2)
  assert.equal(eastClear,1070)
  assert.equal(turnClear,1120)
  // Entrance sweep's westernmost point stays east of the full stair envelope.
  const door=choices.openings.find(o=>o.id==='G-FRONT-D01')!
  assert.ok(door.centre-door.width/2>s.x+s.footprintWidth+50)
})

for(const level of ['GROUND','FIRST'] as const)test(`${level}: two-scale stair and architectural symbols are deterministic`,()=>{
  const a=createResolvedReferenceHouseAdePlanScene(result,source,100,level),b=createResolvedReferenceHouseAdePlanScene(result,source,50,level)
  assert.deepEqual(a.primitives.map(p=>p.id),b.primitives.map(p=>p.id))
  assert.equal(a.primitives.filter(p=>p.id.includes('-riser-')).length,18)
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
