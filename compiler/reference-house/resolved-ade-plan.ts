import type { AdeArchitecturalPlan, AdeModelPoint, AdeOpening, AdeWallRun } from '../architectural-drawing/model.js'
import { assertValidArchitecturalPlan } from '../architectural-drawing/validate.js'
import { mm } from '../units.js'
import { createReferenceHouseAdePlan } from './ade-plan.js'
import { groundPlanResolution as currentChoice, type PlanOpeningChoice } from './plan-resolution.js'
import {groundPlanResolution as b5Choice} from './plan-resolution-b5.js'
import {groundPlanResolution as b4Choice} from './plan-resolution-b4.js'
import { groundPlanResolution as previousChoice } from './plan-resolution-b3.js'
import type { LevelId, ReferenceHouseCompileResult, ReferenceHouseCoordinationSource } from './model.js'

/** Adapter of an upstream architectural choice register, not an admission of
 * publication-only geometry into the frozen historical C1 source. */
export const createResolvedReferenceHouseAdePlan = (result: ReferenceHouseCompileResult, source: ReferenceHouseCoordinationSource, level: LevelId = 'GROUND'): AdeArchitecturalPlan => {
  const square=result.derived.shell.depth===12000
  const legacy = !square && source.court.value.placement === 'centred-in-shell'
  const revision5=source.spaces.some(s=>s.id==='G-WC-01')
  const choice = square ? currentChoice : legacy ? previousChoice : revision5 ? b5Choice : b4Choice
  if(result.derived.shell.width!==12000 || result.derived.shell.depth!==(square?12000:10800) || result.derived.court.x0!==4200 || result.derived.court.y0!==(square?4200:legacy?3400:4100))throw new Error('Ground-plan choices require architectural reconciliation after base geometry changes.')
  if(source.partitions.frontHallWestX.value!==(square?3200:3100) || source.partitions.galleryServiceX.value!==9350 || source.partitions.upperSouthLandingTurnDepth.value!==(square?2600:1600) || result.derived.stair.flightRun!==2400 || result.derived.stair.flightRiseGroups.join('/')!=='9/9' || result.derived.levels.firstFfl-result.derived.levels.groundFfl!==(square?3450:3300))throw new Error('Resolved plan requires its paired architectural source; do not apply choices to historical geometry.')
  if(!legacy && (source.partitions.serviceSouthY?.value!==(square?3845:3400) || result.derived.court.y1!==(square?7800:7400)))throw new Error('Resolved service and courtyard geography must remain paired')
  const plan = createReferenceHouseAdePlan(result, source, level)
  plan.id = `RH-RESOLVED-${level}`
  const provenance = { authority: 'provisional' as const, precision: 'approximate' as const,
    sourceIds: ['docs/reference-house/ground-plan-resolution.md', 'compiler/reference-house/plan-resolution.ts', choice.id] }
  const stair=choice.stair
  plan.stairs=[{kind:'return-stair',id:`RHPR-STAIR-${level}`,origin:{x:mm(stair.x),y:mm(stair.y)},riserCount:stair.risers,floorToFloor:mm(result.derived.levels.firstFfl-result.derived.levels.groundFfl),going:mm(stair.going),clearWidth:mm(stair.clearWidth),landingDepth:mm(stair.landingDepth),wellGap:mm(stair.wellGap),cutHeight:mm(1200),level,provenance}]
  plan.labels=plan.labels.filter((l)=>!l.id.endsWith('stair-note'))
  if(level==='FIRST') {
    plan.labels=plan.labels.map((l)=>l.id==='U-STAIR-01-label'?{...l,text:'Stair / landing',anchor:square?{x:mm(8000),y:mm(2100)}:{x:mm(5500),y:mm(500)}}:l)
    assertValidArchitecturalPlan(plan)
    return plan
  }
  const nodes = new Map(plan.nodes.map((n) => [n.id, n]))
  const node = (x: number, y: number) => {
    const id = `GROUND-NODE-${x}-${y}`
    if (!nodes.has(id)) nodes.set(id, { kind: 'node', id, point: { x: mm(x), y: mm(y) }, provenance })
    return id
  }
  let walls = plan.walls.filter((w) => !choice.removePartitions.some((id) => w.provenance.sourceIds.includes(id)))
  for (const w of choice.addPartitions) walls.push({ kind: 'wall', id: w.id, fromNodeId: node(w.a[0],w.a[1]), toNodeId: node(w.b[0],w.b[1]), reference: 'centreline', assemblyId: 'RH-PART-DRY-01', provenance: { ...provenance, sourceIds: [...provenance.sourceIds, w.id] } })
  // New enclosure walls have real authored T junctions on the service spine.
  // Split at these nodes before topology compilation, never patch with masks.
  const ends = walls.filter((w) => w.assemblyId === 'RH-PART-DRY-01').flatMap((w) => [nodes.get(w.fromNodeId)!.point, nodes.get(w.toNodeId)!.point])
  walls = walls.flatMap((w): AdeWallRun[] => {
    if (w.assemblyId !== 'RH-PART-DRY-01') return [w]
    const a = nodes.get(w.fromNodeId)!.point, b = nodes.get(w.toNodeId)!.point
    const horizontal = a.y === b.y
    const on = (p: AdeModelPoint) => horizontal ? p.y === a.y && p.x > Math.min(a.x,b.x) && p.x < Math.max(a.x,b.x) : p.x === a.x && p.y > Math.min(a.y,b.y) && p.y < Math.max(a.y,b.y)
    const cuts = [...new Map(ends.filter(on).map((p) => [`${p.x},${p.y}`, p])).values()]
    if (!cuts.length) return [w]
    const points = [a,...cuts,b].sort((p,q) => horizontal ? (p.x-q.x)*Math.sign(b.x-a.x) : (p.y-q.y)*Math.sign(b.y-a.y))
    return points.slice(0,-1).map((p,i) => ({ ...w, id: `${w.id}::resolution-${i+1}`, fromNodeId: node(p.x,p.y), toNodeId: node(points[i+1].x,points[i+1].y) }))
  })
  plan.walls = walls
  plan.nodes = [...nodes.values()]
  plan.openings = choice.openings.map((o: PlanOpeningChoice): AdeOpening => {
    const hosts = walls.filter((w) => w.id === o.hostBoundaryId || w.provenance.sourceIds.includes(o.hostBoundaryId))
    const host = hosts.find((w) => {
      const a=nodes.get(w.fromNodeId)!.point,b=nodes.get(w.toNodeId)!.point
      const lo = Math.min(a.x===b.x?a.y:a.x,a.x===b.x?b.y:b.x), hi = Math.max(a.x===b.x?a.y:a.x,a.x===b.x?b.y:b.x)
      return o.centre-o.width/2 > lo && o.centre+o.width/2 < hi
    })
    if (!host) throw new Error(`Authored aperture ${o.id} does not fit one host segment`)
    const a=nodes.get(host.fromNodeId)!.point,b=nodes.get(host.toNodeId)!.point
    const from=a.x===b.x?a.y:a.x,to=a.x===b.x?b.y:b.x
    return { kind:'opening',id:o.id,hostWallId:host.id,role:o.role,
      centreOffset:{kind:'approximate',value:mm((o.centre-from)*Math.sign(to-from))},width:{kind:'approximate',value:mm(o.width)},
      symbol: o.role==='window' ? { kind:'window' } : {kind:'door',leaves:o.leaves??1,swingSide:o.swingSide??'left',...(o.hingeEnd ? {hingeEnd:o.hingeEnd} : {})},
      provenance:{...provenance,sourceIds:[...provenance.sourceIds,...o.replaces]} }
  })
  const resolved = new Set<string>([...choice.openConnections,...choice.openings.flatMap((o)=>o.replaces)])
  for (const adj of plan.adjacencies) if (!resolved.has(adj.id)) throw new Error(`Unresolved connectivity obligation ${adj.id}`)
  for (const o of source.qualitativeOpeningRelationships.filter((o)=>o.levelId==='GROUND')) if (!resolved.has(o.id)) throw new Error(`Unresolved opening relationship ${o.id}`)
  plan.adjacencies = [] // Each obligation is now resolved upstream to a doorway or open connection.
  plan.labels = plan.labels.map((l)=>l.id==='G-SVC-02-label'?{...l,text:square?'Utility / plant':'Service suite',anchor:{x:mm(10550),y:mm(square?4200:4300)}}:l.id==='G-STUDY-02-label'?{...l,anchor:revision5?{x:mm(2300),y:mm(1000)}:{x:mm(10675),y:mm(2500)}}:l.id==='G-HALL-02-label'?{...l,text:'Hall / stair',anchor:{x:mm(7900),y:mm(1400)}}:l)
  if(revision5){
    plan.labels=plan.labels.map(l=>l.id==='G-WC-01-label'?{...l,anchor:{x:mm(10250),y:mm(square?2050:1850)}}:l.id==='G-CLOAK-01-label'?{...l,text:'Cloakroom',anchor:{x:mm(10350),y:mm(500)}}:l)
    const fit=square?currentChoice.roomFit:b5Choice.roomFit
    plan.fittings=Object.entries({desk:fit.study.desk,storage:fit.cloak.storage,wc:fit.wc.pan,basin:fit.wc.basin}).map(([role,f])=>({kind:'fitting',id:`RHPR-${role}`,role:role as 'desk'|'storage'|'wc'|'basin',origin:{x:mm(f.x),y:mm(f.y)},width:mm(f.width),depth:mm(f.depth),provenance}))
  }
  if(square){
    plan.labels=plan.labels.map(l=>l.id==='G-PANTRY-01-label'?{...l,anchor:{x:mm(10450),y:mm(7000)}}:l.id==='G-GARDEN-02-label'?{...l,anchor:{x:mm(6000),y:mm(10000)}}:l.id==='G-KIT-02-label'?{...l,anchor:{x:mm(9900),y:mm(10000)}}:l)
    plan.fittings=[...plan.fittings!,...Object.entries(currentChoice.roomFit.pantry).map(([id,f])=>({kind:'fitting' as const,id:`RHPR-${id}`,role:'storage' as const,origin:{x:mm(f.x),y:mm(f.y)},width:mm(f.width),depth:mm(f.depth),provenance}))]
  }
  plan.labels = plan.labels.filter((l)=>l.id!=='GROUND-stair-note')
  assertValidArchitecturalPlan(plan)
  return plan
}
