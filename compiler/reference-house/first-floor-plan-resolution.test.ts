import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createPairedReferenceHouseSource,createPairedReferenceHouseAdePlan,firstFloorPlanResolution as choice} from './first-floor-plan-resolution.js'
import {createResolvedReferenceHouseSource} from './plan-resolution.js'
import {compileReferenceHouseSystem} from './system-compile.js'
import {createResolvedReferenceHouseAdePlanScene} from './resolved-ade-plan-scene.js'
import {renderDrawingSceneV2SvgWithTokens} from '../publication-drawing-v2/svg.js'
import {PLT_CANDIDATE_TOKENS as tokens} from '../publication-drawing-v2/plt-candidate-tokens.js'
const source=createPairedReferenceHouseSource(),system=compileReferenceHouseSystem(source),plan=createPairedReferenceHouseAdePlan(system.house,source,'FIRST')

test('paired upper source compiles without altering either B6 ground plate',()=>{
 assert.equal(system.status,'PASS',JSON.stringify(system.diagnostics))
 const old=createResolvedReferenceHouseSource(),oldSystem=compileReferenceHouseSystem(old)
 for(const scale of [100,50] as const){
  const retained=createResolvedReferenceHouseAdePlanScene(oldSystem.house,old,scale)
  const paired=createResolvedReferenceHouseAdePlanScene(system.house,source,scale,'GROUND',createPairedReferenceHouseAdePlan(system.house,source))
  assert.equal(renderDrawingSceneV2SvgWithTokens(paired,tokens),renderDrawingSceneV2SvgWithTokens(retained,tokens))
 }
})

test('upstairs has independent private-room access and no unresolved aperture/adjacency notation',()=>{
 assert.equal(plan.adjacencies.length,0)
 assert.ok(plan.openings.every(o=>o.symbol&&o.width.kind==='approximate'&&o.centreOffset.kind==='approximate'))
 assert.ok(!source.requiredAdjacencies.some(a=>a.id==='ADJ-U-BED02-P01'))
 const destinations:Record<string,string>={'U-BED02-D01':'U-BED-02','U-BED03-D01':'U-BED-03','U-BED04-D01':'U-BED-04','U-BATH-D01':'U-BATH-01','U-PRINCIPAL-D01':'U-BED-P01','U-DRESS-D01':'U-DRESS-01','U-LINEN-D01':'U-LIN-01'}
 for(const [id,roomId] of Object.entries(destinations)){
  const o=plan.openings.find(o=>o.id===id)!,w=plan.walls.find(w=>w.id===o.hostWallId)!,a=plan.nodes.find(n=>n.id===w.fromNodeId)!.point,b=plan.nodes.find(n=>n.id===w.toNodeId)!.point
  assert.ok(o.symbol?.kind==='door'&&o.width.kind==='approximate'&&o.centreOffset.kind==='approximate')
  assert.equal(o.width.value,900)
  const len=Math.hypot(b.x-a.x,b.y-a.y),ux=(b.x-a.x)/len,uy=(b.y-a.y)/len
  const high=o.symbol.hingeEnd==='high',hinge=o.centreOffset.value+(high?450:-450),side=o.symbol.swingSide==='left'?1:-1
  const boxes=system.house.derived.spaces.find(s=>s.id===roomId)!.boxes
  // Sample the entire swing, including mid-arc points; no leaf occupies a
  // landing or another room. 1 mm tolerance is only numeric round-off.
  for(let step=0;step<=16;step++){
   const angle=step*Math.PI/32,along=hinge+(high?-1:1)*900*Math.cos(angle),normal=side*900*Math.sin(angle)
   const x=a.x+ux*along-uy*normal,y=a.y+uy*along+ux*normal
   assert.ok(boxes.some(b=>x>=b.x-1&&x<=b.x+b.width+1&&y>=b.y-1&&y<=b.y+b.height+1),`${id} swing leaves ${roomId}: ${x},${y}`)
  }
 }
})

test('court glazing stacks with ground; bedroom division clears both windows and bathroom is enclosed',()=>{
 for(const side of ['W','E'])assert.deepEqual(choice.openings.filter(o=>o.id.startsWith(`U-COURT-${side}-W`)).map(o=>[o.centre,o.width]),[[5100,1200],[6900,1200]])
 assert.equal(source.partitions.westRoomSplitY.value,6000)
 for(const centre of [5100,6900])assert.ok(Math.abs(centre-6000)-600-62.5>=200,'partition has a real pier beside the window')
 for(const [id,y] of [['U-BATH-SOUTH-B',3845],['U-BATH-NORTH-B',8155]] as const){
  const w=plan.walls.find(w=>w.id===id)!
  assert.equal(plan.nodes.find(n=>n.id===w.fromNodeId)!.point.y,y)
  assert.equal(w.assemblyId,'RH-PART-DRY-01')
 }
 assert.ok(plan.walls.some(w=>w.id==='U-HALL-WEST-RETURN-B'),'close the L-shaped front-bedroom corner')
})

test('new unresolved relationships fail instead of disappearing from the upper plate',()=>{
 const s=createPairedReferenceHouseSource()
 s.qualitativeOpeningRelationships.push({...s.qualitativeOpeningRelationships.find(o=>o.levelId==='FIRST')!,id:'UNOWNED-UPPER-OPENING'})
 assert.throws(()=>createPairedReferenceHouseAdePlan(compileReferenceHouseSystem(s).house,s,'FIRST'),/Unresolved first-floor obligation UNOWNED-UPPER-OPENING/)
})
