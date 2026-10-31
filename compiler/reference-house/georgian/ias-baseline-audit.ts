import {layoutRevision,createRevisionPlan} from './layout-revision.js'
import {sectionAssemblyChoices} from './section-source.js'

export interface PanelIntervalInput {
 centreMm:number
 reservationWidthMm:number
 lowerReturnDatumMm?:number
 upperReturnDatumMm?:number
 partitionThicknessMm?:number
}

/** One drawing-reservation interval against nominal partition faces. This is
 * neither a panel/frame design nor an access, handling or performance verdict. */
export function comparePanelReservation(input:PanelIntervalInput){
 const {centreMm:c,reservationWidthMm:w,lowerReturnDatumMm:lo,upperReturnDatumMm:hi,partitionThicknessMm:t}=input
 const qualification='Reservation interval only; frame, fixing, tool and withdrawal allowances unselected'
 if(lo===undefined||hi===undefined||t===undefined||![c,w,lo,hi,t].every(Number.isFinite)||w<=0||t<=0||hi-lo<=t)return {status:'UNKNOWN' as const,qualification}
 const reservation=[c-w/2,c+w/2],clear=[lo+t/2,hi-t/2],margins=[reservation[0]-clear[0],clear[1]-reservation[1]]
 return {status:margins.some(m=>m<0)?'INTERSECTS-NOMINAL-RETURN' as const:'WITHIN-NOMINAL-INTERVAL' as const,reservationIntervalMm:reservation,nominalClearIntervalMm:clear,signedEndMarginsMm:margins,qualification}
}

/** Read-only current-house baseline. Historical RH-06/RH-09 performance or
 * route results are deliberately not inputs. No design is altered or approved. */
export function auditIasBaseline(){
 const d=layoutRevision,plan=createRevisionPlan('FIRST'),part=plan.wallAssemblies.find(a=>a.id==='RH-PART-DRY-01')!,finish=plan.wallAssemblies.find(a=>a.id==='RH-ADE-ENVELOPE')!.layers!.find(l=>l.role==='finish-zone')!
 const thickness='value' in part.thickness?part.thickness.value:undefined,finishDepth='value' in finish.thickness?finish.thickness.value:undefined
 const floor=sectionAssemblyChoices.floor,allocations={finish:floor.finish,deck:floor.deck,nominalFraming:floor.joist,serviceVoid:floor.void,ceiling:floor.ceiling},zone=d.levels.first-d.levels.ceilingGround,total=Object.values(allocations).reduce((a,b)=>a+b,0)
 const spine=d.partitions.FIRST.find(w=>w.id==='wet-spine'),wetRooms=new Set(['U-ENS3','U-BATH','U-ENSP'])
 const panels=d.services.panels.map((panel,index)=>{
  const host=panel.level==='FIRST'&&spine&&spine.a[0]===spine.b[0]&&panel.x===spine.a[0]?spine:undefined
  const rooms=host?d.rooms.FIRST.filter(r=>wetRooms.has(r.id)&&r.boxes.some(b=>b.x===host.a[0]&&panel.y>b.y&&panel.y<b.y+b.depth)):[]
  const room=rooms.length===1?rooms[0]:undefined,box=room?.boxes.find(b=>b.x===host!.a[0]&&panel.y>b.y&&panel.y<b.y+b.depth)
  const hasReturn=(y:number)=>!!host&&d.partitions.FIRST.some(w=>w.a[1]===y&&w.b[1]===y&&Math.min(w.a[0],w.b[0])<=host.a[0]&&Math.max(w.a[0],w.b[0])>host.a[0])
  return {index,level:panel.level,hostWallId:host?.id,roomId:room?.id,centre:{x:panel.x,y:panel.y},reservationWidthMm:panel.width,
   ...comparePanelReservation({centreMm:panel.y,reservationWidthMm:panel.width,lowerReturnDatumMm:box&&hasReturn(box.y)?box.y:undefined,upperReturnDatumMm:box&&hasReturn(box.y+box.depth)?box.y+box.depth:undefined,partitionThicknessMm:thickness})}
 })
 return {sourceId:d.id,geometryChanged:false,performanceAcceptance:false,
  sourceFiles:['compiler/reference-house/georgian/layout-revision.ts','compiler/reference-house/georgian/section-source.ts','compiler/reference-house/georgian/plan.ts','compiler/reference-house/ade-plan.ts'],
  envelope:{representedDepthMm:d.envelope,nominalFinishDepthMm:finishDepth,additionalLiningDepthSelected:false},
  floor:{nominalZoneMm:zone,allocationsMm:allocations,allocatedMm:total,unallocatedDepthMm:zone-total,structuralOrAcousticAdequacyVerified:false},
  serviceReservations:{riser:structuredClone(d.services.riser),upperLining:structuredClone(d.services.upperLining),panels,completeAssemblyDepthSelected:false},
  reviewPanelIndices:panels.filter(p=>p.status!=='WITHIN-NOMINAL-INTERVAL').map(p=>p.index),
  qualification:'Current nominal drawing geography only; no installed assembly, frame clearance, access sequence or performance is certified'}
}
