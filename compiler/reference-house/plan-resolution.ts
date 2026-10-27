import { mm } from '../units.js'
import {groundPlanResolution as previous,createResolvedReferenceHouseSource as previousSource} from './plan-resolution-b4.js'
export {auditCurrentStairReservation} from './plan-resolution-b3.js'
export type {PlanOpeningChoice} from './plan-resolution-b3.js'

/** Owner-selected option 3: quiet south-west study; open arrival/family field;
 * north-east guest WC beside services and separate front-east cloakroom. */
export const groundPlanResolution = {
 ...previous, id:'RH-GROUND-PLAN-RESOLUTION-03',
 removePartitions:[...previous.removePartitions,'G-WEST-SPLIT-B','G-HALL-WEST-B'],
 addPartitions:[...previous.addPartitions.filter(w=>w.id!=='G-HALL-WEST-RETURN-B'),
  {id:'G-STUDY-EAST-B',a:[3100,0],b:[3100,2550]},
  {id:'G-STUDY-NORTH-B',a:[0,2550],b:[3100,2550]},
  {id:'G-GUEST-SPLIT-B',a:[9350,1650],b:[12000,1650]}],
 openings:[...previous.openings.filter(o=>!['G-DRAW-HALL-D01','G-DRAW-FAMILY-D01','G-STUDY-GALLERY-D01','G-STUDY-E-W01'].includes(o.id)),
  {id:'G-STUDY-FAMILY-D01',hostBoundaryId:'G-STUDY-NORTH-B',centre:2100,width:900,role:'door' as const,leaves:1 as const,swingSide:'right' as const,hingeEnd:'high' as const,replaces:['ADJ-G-STUDY-FAMILY']},
  {id:'G-CLOAK-HALL-D01',hostBoundaryId:'G-GALLERY-SERVICE-B',centre:1050,width:800,role:'door' as const,leaves:1 as const,swingSide:'right' as const,hingeEnd:'high' as const,replaces:['ADJ-G-CLOAK-GAL']},
  {id:'G-WC-HALL-D01',hostBoundaryId:'G-GALLERY-SERVICE-B',centre:2500,width:800,role:'door' as const,leaves:1 as const,swingSide:'right' as const,hingeEnd:'high' as const,replaces:['ADJ-G-WC-GAL']},
  {id:'G-WC-E-W01',hostBoundaryId:'G-OUTER-EAST',centre:2550,width:900,nominalSillMm:1500,role:'window' as const,replaces:[]}],
 serviceSubdivision:'UTILITY_PLANT_WITH_SEPARATE_GUEST_WC',
 openConnections:[...previous.openConnections,'ADJ-G-HALL-FAMILY'],
 // Occupancy envelopes are authored coordination choices, not product sizes.
 roomFit:{study:{desk:{x:450,y:600,width:700,depth:1400},chair:{x:1150,y:700,width:900,depth:900}},
  cloak:{storage:{x:10982.5,y:450,width:600,depth:1050}},
  wc:{pan:{x:10750,y:2487.5,width:400,depth:700},basin:{x:11182.5,y:2050,width:400,depth:400},serviceLining:{x:9412.5,y:3187.5,width:2170,depth:150}}}
}
export const createResolvedReferenceHouseSource = () => {
 const s=previousSource(),fact=s.partitions.serviceSouthY!
 s.partitions.groundStudyNorthY={...fact,id:'RHPR-STUDY-NORTH',value:mm(2550)}
 s.partitions.groundGuestSplitY={...fact,id:'RHPR-GUEST-SPLIT',value:mm(1650)}
 s.spaces=s.spaces.filter(r=>r.id!=='G-DRAW-02')
 for(const r of s.spaces){
  if(r.id==='G-STUDY-02'){r.rectangles=[{x0:'SHELL_WEST',x1:'HALL_WEST',y0:'SHELL_SOUTH',y1:'STUDY_NORTH'}];r.disposition='PROVISIONAL_BUT_REPRESENTABLE'}
  if(r.id==='G-FAM-02')r.rectangles=[{x0:'SHELL_WEST',x1:'HALL_WEST',y0:'STUDY_NORTH',y1:'COURT_SOUTH'},{x0:'SHELL_WEST',x1:'COURT_WEST',y0:'COURT_SOUTH',y1:'SHELL_NORTH'}]
 }
 for(const [id,label,y0,y1] of [['G-CLOAK-01','Walk-in cloakroom','SHELL_SOUTH','GUEST_SPLIT'],['G-WC-01','Guest WC','GUEST_SPLIT','SERVICE_SOUTH']])s.spaces.push({id,label,levelId:'GROUND',kind:'room',rectangles:[{x0:'GALLERY_SERVICE',x1:'SHELL_EAST',y0,y1}],disposition:'PROVISIONAL_BUT_REPRESENTABLE'})
 s.requiredAdjacencies=s.requiredAdjacencies.filter(a=>!['ADJ-G-DRAW-FAM','ADJ-G-DRAW-HALL','ADJ-G-STUDY-GAL'].includes(a.id))
 for(const [id,a,b] of [['ADJ-G-STUDY-FAMILY','G-STUDY-02','G-FAM-02'],['ADJ-G-HALL-FAMILY','G-HALL-02','G-FAM-02'],['ADJ-G-CLOAK-GAL','G-CLOAK-01','G-GAL-01'],['ADJ-G-WC-GAL','G-WC-01','G-GAL-01']])s.requiredAdjacencies.push({id,a,b,levelId:'GROUND'})
 const remap=(id:string)=>id==='G-DRAW-02'?'G-STUDY-02':id==='G-STUDY-02'?'G-CLOAK-01':id
 for(const o of s.openings)o.spaceIds=o.spaceIds.map(remap)
 for(const o of s.qualitativeOpeningRelationships)if(o.spaceIds)o.spaceIds=o.spaceIds.map(remap)
 return s
}
