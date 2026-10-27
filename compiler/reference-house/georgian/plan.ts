import type {AdeArchitecturalPlan,AdeOpening,AdeWallRun,AdeModelPoint} from '../../architectural-drawing/model.js'
import {assertValidArchitecturalPlan} from '../../architectural-drawing/validate.js'
import {referenceHouseAdeEnvelope} from '../ade-plan.js'
import {mm} from '../../units.js'
import {design,openings,type Level,type Box} from './source.js'
export const provenance={authority:'provisional' as const,precision:'approximate' as const,sourceIds:['compiler/reference-house/georgian/source.ts','docs/reference-house/georgian-replan.md',design.id]}
export const createGeorgianPlan=(level:Level):AdeArchitecturalPlan=>{
 const p:AdeArchitecturalPlan={id:`RH-GEORGIAN-${level}`,sourceId:design.id,nodes:[],wallAssemblies:[referenceHouseAdeEnvelope(),{kind:'wall-assembly',id:'RH-PART-DRY-01',thickness:{kind:'approximate',value:mm(125)},provenance}],walls:[],openings:[],partitionDatums:[],spaces:[],adjacencies:[],dimensions:[],labels:[],fittings:[]}
 const nodes=new Map<string,AdeArchitecturalPlan['nodes'][number]>()
 const node=(a:readonly number[])=>{const id=`${level}-${a[0]}-${a[1]}`;if(!nodes.has(id))nodes.set(id,{kind:'node',id,point:{x:mm(a[0]),y:mm(a[1])},provenance});return id}
 const envelope=[{id:'outer-south',a:[0,0],b:[12000,0]},{id:'outer-east',a:[12000,0],b:[12000,12000]},{id:'outer-north',a:[12000,12000],b:[0,12000]},{id:'outer-west',a:[0,12000],b:[0,0]},{id:'court-south',a:[7800,4200],b:[4200,4200]},{id:'court-west',a:[4200,4200],b:[4200,7800]},{id:'court-north',a:[4200,7800],b:[7800,7800]},{id:'court-east',a:[7800,7800],b:[7800,4200]}]
 for(const w of envelope)(p.walls as AdeWallRun[]).push({kind:'wall',id:w.id,fromNodeId:node(w.a),toNodeId:node(w.b),reference:'right-face',assemblyStartFace:'right-face',assemblyId:'RH-ADE-ENVELOPE',provenance})
 for(const w of design.partitions[level])(p.walls as AdeWallRun[]).push({kind:'wall',id:w.id,fromNodeId:node(w.a),toNodeId:node(w.b),reference:'centreline',assemblyId:'RH-PART-DRY-01',provenance:{...provenance,sourceIds:[...provenance.sourceIds,w.id]}})
 const ends=p.walls.filter(w=>w.assemblyId==='RH-PART-DRY-01').flatMap(w=>[nodes.get(w.fromNodeId)!.point,nodes.get(w.toNodeId)!.point])
 p.walls=p.walls.flatMap((w):AdeWallRun[]=>{
  if(w.assemblyId!=='RH-PART-DRY-01')return [w]
  const a=nodes.get(w.fromNodeId)!.point,b=nodes.get(w.toNodeId)!.point,h=a.y===b.y
  const on=(q:AdeModelPoint)=>h?q.y===a.y&&q.x>Math.min(a.x,b.x)&&q.x<Math.max(a.x,b.x):q.x===a.x&&q.y>Math.min(a.y,b.y)&&q.y<Math.max(a.y,b.y)
  const cuts=[...new Map(ends.filter(on).map(q=>[`${q.x},${q.y}`,q])).values()]
  if(!cuts.length)return [w]
  const all=[a,...cuts,b].sort((q,r)=>h?(q.x-r.x)*Math.sign(b.x-a.x):(q.y-r.y)*Math.sign(b.y-a.y))
  return all.slice(0,-1).map((q,i)=>({...w,id:`${w.id}::${i}`,fromNodeId:node([q.x,q.y]),toNodeId:node([all[i+1].x,all[i+1].y])}))
 })
 p.nodes=[...nodes.values()]
 p.openings=openings(level).map((o):AdeOpening=>{
  const host=p.walls.filter(w=>w.id===o.wall||w.provenance.sourceIds.includes(o.wall)).find(w=>{const a=nodes.get(w.fromNodeId)!.point,b=nodes.get(w.toNodeId)!.point,lo=Math.min(a.x===b.x?a.y:a.x,a.x===b.x?b.y:b.x),hi=Math.max(a.x===b.x?a.y:a.x,a.x===b.x?b.y:b.x);return o.centre-o.width/2>lo&&o.centre+o.width/2<hi})
  if(!host)throw new Error(`${level}: aperture ${o.id} crosses a host end/junction`)
  const a=nodes.get(host.fromNodeId)!.point,b=nodes.get(host.toNodeId)!.point,from=a.x===b.x?a.y:a.x,to=a.x===b.x?b.y:b.x
  return {kind:'opening',id:o.id,hostWallId:host.id,role:o.kind,centreOffset:{kind:'approximate',value:mm((o.centre-from)*Math.sign(to-from))},width:{kind:'approximate',value:mm(o.width)},symbol:o.kind==='window'?{kind:'window'}:{kind:'door',leaves:o.leaves??1,swingSide:o.swing??'left',...(o.leaves===2?{}:{hingeEnd:o.hinge??'low'})},provenance:{...provenance,sourceIds:[...provenance.sourceIds,o.id]}}
 })
 if(level==='ATTIC')p.walls=p.walls.filter(w=>w.id.startsWith('court-'))
 for(const r of design.rooms[level]){(p.spaces as Array<AdeArchitecturalPlan['spaces'][number]>).push({kind:'space',id:r.id,label:r.label,provenance});(p.labels as Array<AdeArchitecturalPlan['labels'][number]>).push({kind:'label',id:r.id+'-label',targetId:r.id,text:r.label,anchor:{x:mm(r.at[0]),y:mm(r.at[1])},role:'space',provenance})}
 (p.labels as Array<AdeArchitecturalPlan['labels'][number]>).push({kind:'label',id:'court-label',text:'Courtyard',anchor:{x:mm(6000),y:mm(6150)},role:'space',provenance},{kind:'label',id:'court-size',text:'3600 × 3600',anchor:{x:mm(6000),y:mm(5600)},role:'annotation',provenance})
 p.dimensions=[{kind:'dimension',id:'width',a:{x:mm(0),y:mm(12000)},b:{x:mm(12000),y:mm(12000)},provenance},{kind:'dimension',id:'depth',a:{x:mm(0),y:mm(0)},b:{x:mm(0),y:mm(12000)},provenance}]
 const fit=(id:string,role:'storage'|'desk'|'wc'|'basin',b:Box)=>(p.fittings as Array<NonNullable<AdeArchitecturalPlan['fittings']>[number]>).push({kind:'fitting',id,role,origin:{x:mm(b.x),y:mm(b.y)},width:mm(b.width),depth:mm(b.depth),provenance})
 if(level==='GROUND'){
  fit('study-desk','desk',design.furniture.studyDesk);fit('cloak-hanging','storage',design.furniture.cloakHanging)
  fit('wc-pan','wc',design.wetFit.guestPan);fit('wc-basin','basin',design.wetFit.guestBasin)
  fit('plant-cylinder','storage',design.services.plantWater);fit('plant-dry','storage',design.services.plantDry)
 }
 if(level==='FIRST')for(const id of ['wardrobeWest','wardrobeEastNorth','wardrobeEastSouth'] as const)fit(id,'storage',design.furniture[id])
 assertValidArchitecturalPlan(p);return p
}
