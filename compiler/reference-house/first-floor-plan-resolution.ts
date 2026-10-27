import {mm} from '../units.js'
import type {AdeArchitecturalPlan, AdeOpening, AdeWallRun} from '../architectural-drawing/model.js'
import {assertValidArchitecturalPlan} from '../architectural-drawing/validate.js'
import {createResolvedReferenceHouseSource, type PlanOpeningChoice} from './plan-resolution.js'
import {createResolvedReferenceHouseAdePlan} from './resolved-ade-plan.js'
import type {ReferenceHouseCompileResult,ReferenceHouseCoordinationSource} from './model.js'

/** Provisional first-floor choices paired with the screen-approved B6 ground.
 * No historical factory changes; privacy/access supersede the old connecting
 * bedroom obligation. Nominal apertures do not establish escape performance. */
export const firstFloorPlanResolution={
 id:'RH-FIRST-PLAN-RESOLUTION-01',
 addPartitions:[
  {id:'U-HALL-WEST-RETURN-B',a:[3200,4200],b:[4200,4200]},
  {id:'U-BATH-SOUTH-B',a:[9350,3845],b:[12000,3845]},
  {id:'U-BATH-NORTH-B',a:[9350,8155],b:[12000,8155]}],
 openConnections:['ADJ-U-STAIR-GAL','ADJ-U-GAL-LAND'],
 openings:[
  ...[1650,4550,7450,10350].map((centre,i)=>({id:`U-FRONT-W0${i+1}`,hostBoundaryId:'U-OUTER-SOUTH',centre,width:925,role:'window',replaces:[`U-FRONT-W0${i+1}`]})),
  ...['W','E'].flatMap(side=>[5100,6900].map((centre,i)=>({id:`U-COURT-${side}-W0${i+1}`,hostBoundaryId:`U-COURT-${side==='W'?'WEST':'EAST'}`,centre,width:1200,role:'window',replaces:i===0?[`RHCF-COURT-${side}-U`]:[]}))),
  ...['NORTH','SOUTH'].map(side=>({id:`U-COURT-${side}-W01`,hostBoundaryId:`U-COURT-${side}`,centre:6000,width:1400,role:'window',replaces:[`U-COURT-${side}-O01`]})),
  ...[2100,5100,6900,9900].map((centre,i)=>({id:`U-GARDEN-W0${i+1}`,hostBoundaryId:'U-OUTER-NORTH',centre,width:925,role:'window',replaces:i===1?['RHCF-GARDEN-CENTRE-U']:[]})),
  ...[2850,6000,10050].map((centre,i)=>({id:`U-SIDE-E-W0${i+1}`,hostBoundaryId:'U-OUTER-EAST',centre,width:i===1?1200:925,nominalSillMm:i===1?1500:800,role:'window',replaces:[]})),
  ...[2850,10050].map((centre,i)=>({id:`U-SIDE-W-W0${i+1}`,hostBoundaryId:'U-OUTER-WEST',centre,width:925,role:'window',replaces:[]})),
  {id:'U-BED02-D01',hostBoundaryId:'U-HALL-WEST-B',centre:3300,width:900,role:'door',swingSide:'left',hingeEnd:'high',replaces:['ADJ-U-BED02-STAIR']},
  {id:'U-BED03-D01',hostBoundaryId:'U-GALLERY-SERVICE-B',centre:2850,width:900,role:'door',swingSide:'right',hingeEnd:'high',replaces:['ADJ-U-STAIR-BED03']},
  {id:'U-BATH-D01',hostBoundaryId:'U-GALLERY-SERVICE-B',centre:6000,width:900,role:'door',swingSide:'right',hingeEnd:'low',replaces:['ADJ-U-GAL-BATH']},
  {id:'U-BED04-D01',hostBoundaryId:'U-GALLERY-SERVICE-B',centre:8800,width:900,role:'door',swingSide:'right',hingeEnd:'low',replaces:['ADJ-U-BED04-LAND']},
  {id:'U-PRINCIPAL-D01',hostBoundaryId:'U-COURT-WEST-NORTH-CONT-B',centre:8700,width:900,role:'door',swingSide:'left',hingeEnd:'high',replaces:['ADJ-U-PRINCIPAL-LAND']},
  {id:'U-DRESS-D01',hostBoundaryId:'U-NORTH-SPLIT-B',centre:5100,width:900,role:'door',swingSide:'left',hingeEnd:'low',replaces:['ADJ-U-DRESS-LAND']},
  {id:'U-LINEN-D01',hostBoundaryId:'U-NORTH-SPLIT-B',centre:6900,width:900,role:'door',swingSide:'left',hingeEnd:'high',replaces:['ADJ-U-LINEN-LAND']}
 ] as PlanOpeningChoice[]
}
export const createPairedReferenceHouseSource=()=>{
 const s=createResolvedReferenceHouseSource()
 s.partitions.westRoomSplitY={...s.partitions.westRoomSplitY,id:'RHPR-UPPER-WEST-CENTRE',value:mm(6000)}
 s.partitions.upperDrySplitX={...s.partitions.upperDrySplitX,id:'RHPR-UPPER-DRY-CENTRE',value:mm(6000)}
 s.requiredAdjacencies=s.requiredAdjacencies.filter(a=>a.id!=='ADJ-U-BED02-P01')
 for(const [id,a] of [['ADJ-U-PRINCIPAL-LAND','U-BED-P01'],['ADJ-U-DRESS-LAND','U-DRESS-01'],['ADJ-U-LINEN-LAND','U-LIN-01']])s.requiredAdjacencies.push({id,a,b:'U-LAND-N01',levelId:'FIRST'})
 return s
}

export const createPairedReferenceHouseAdePlan=(result:ReferenceHouseCompileResult,source:ReferenceHouseCoordinationSource,level:'GROUND'|'FIRST'='GROUND'):AdeArchitecturalPlan=>{
 const plan=createResolvedReferenceHouseAdePlan(result,source,level)
 if(level==='GROUND')return plan
 if(source.partitions.westRoomSplitY.value!==6000||source.partitions.upperDrySplitX.value!==6000||result.derived.shell.depth!==12000)throw new Error('First-floor choices require the paired square source')
 const choice=firstFloorPlanResolution
 const provenance={authority:'provisional' as const,precision:'approximate' as const,sourceIds:['docs/reference-house/first-floor-plan-resolution.md',choice.id]}
 const nodes=new Map(plan.nodes.map(n=>[n.id,n]))
 const node=(x:number,y:number)=>{
  const id=`FIRST-NODE-${x}-${y}`
  if(!nodes.has(id))nodes.set(id,{kind:'node',id,point:{x:mm(x),y:mm(y)},provenance})
  return id
 }
 let walls:AdeWallRun[]=[...plan.walls,...choice.addPartitions.map(w=>({kind:'wall' as const,id:w.id,fromNodeId:node(w.a[0],w.a[1]),toNodeId:node(w.b[0],w.b[1]),reference:'centreline' as const,assemblyId:'RH-PART-DRY-01',provenance}))]
 const ends=walls.filter(w=>w.assemblyId==='RH-PART-DRY-01').flatMap(w=>[nodes.get(w.fromNodeId)!.point,nodes.get(w.toNodeId)!.point])
 walls=walls.flatMap(w=>{
  if(w.assemblyId!=='RH-PART-DRY-01')return [w]
  const a=nodes.get(w.fromNodeId)!.point,b=nodes.get(w.toNodeId)!.point,h=a.y===b.y
  const cuts=[...new Map(ends.filter(p=>h?p.y===a.y&&p.x>Math.min(a.x,b.x)&&p.x<Math.max(a.x,b.x):p.x===a.x&&p.y>Math.min(a.y,b.y)&&p.y<Math.max(a.y,b.y)).map(p=>[`${p.x},${p.y}`,p])).values()]
  if(!cuts.length)return [w]
  const points=[a,...cuts,b].sort((p,q)=>h?(p.x-q.x)*Math.sign(b.x-a.x):(p.y-q.y)*Math.sign(b.y-a.y))
  return points.slice(0,-1).map((p,i)=>({...w,id:`${w.id}::paired-${i+1}`,fromNodeId:node(p.x,p.y),toNodeId:node(points[i+1].x,points[i+1].y)}))
 })
 plan.walls=walls;plan.nodes=[...nodes.values()]
 plan.openings=choice.openings.map((o):AdeOpening=>{
  const hosts=walls.filter(w=>w.id===o.hostBoundaryId||w.provenance.sourceIds.includes(o.hostBoundaryId))
  const host=hosts.find(w=>{
   const a=nodes.get(w.fromNodeId)!.point,b=nodes.get(w.toNodeId)!.point,from=a.x===b.x?a.y:a.x,to=a.x===b.x?b.y:b.x
   return o.centre-o.width/2>Math.min(from,to)&&o.centre+o.width/2<Math.max(from,to)
  })
  if(!host)throw new Error(`First-floor aperture ${o.id} does not fit one host`)
  const a=nodes.get(host.fromNodeId)!.point,b=nodes.get(host.toNodeId)!.point,from=a.x===b.x?a.y:a.x,to=a.x===b.x?b.y:b.x
  return {kind:'opening',id:o.id,hostWallId:host.id,role:o.role,centreOffset:{kind:'approximate',value:mm((o.centre-from)*Math.sign(to-from))},width:{kind:'approximate',value:mm(o.width)},symbol:o.role==='window'?{kind:'window'}:{kind:'door',leaves:1,swingSide:o.swingSide!,hingeEnd:o.hingeEnd},provenance:{...provenance,sourceIds:[...provenance.sourceIds,...o.replaces]}}
 })
 const resolved=new Set([...choice.openConnections,...choice.openings.flatMap(o=>o.replaces)])
 for(const id of [...plan.adjacencies.map(a=>a.id),...source.qualitativeOpeningRelationships.filter(o=>o.levelId==='FIRST').map(o=>o.id),...result.derived.openings.filter(o=>o.levelId==='FIRST').map(o=>o.id)])if(!resolved.has(id))throw new Error(`Unresolved first-floor obligation ${id}`)
 plan.adjacencies=[]
 const anchors:Record<string,[number,number]>={'U-BED-02':[1600,3300],'U-BED-P01':[2100,9200],'U-BED-03':[10600,2100],'U-BED-04':[10400,10300],'U-BATH-01':[10675,7000],'U-LAND-N01':[6500,8700],'U-DRESS-01':[5100,10400],'U-LIN-01':[6900,10400]}
 const names:Record<string,string>={'U-BED-02':'Bedroom 2','U-BED-03':'Bedroom 3','U-BED-04':'Bedroom 4','U-DRESS-01':'Dressing','U-LAND-N01':'Landing'}
 plan.labels=plan.labels.map(l=>l.targetId&&anchors[l.targetId]?{...l,anchor:{x:mm(anchors[l.targetId][0]),y:mm(anchors[l.targetId][1])},text:names[l.targetId]??l.text}:l)
 assertValidArchitecturalPlan(plan)
 return plan
}
