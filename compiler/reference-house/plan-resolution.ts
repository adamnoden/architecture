import {mm} from '../units.js'
import {groundPlanResolution as previous,createResolvedReferenceHouseSource as previousSource} from './plan-resolution-b5.js'
export {auditCurrentStairReservation} from './plan-resolution-b3.js'
export type {PlanOpeningChoice} from './plan-resolution-b3.js'

/** Owner-selected square current-house study; modest-site migration is deferred.
 * Faces, not unequal wall centrelines, own the service/courtyard alignment. */
export const groundPlanResolution={
 ...previous,id:'RH-GROUND-PLAN-RESOLUTION-04',
 addPartitions:[
  {id:'G-SERVICE-SOUTH-B',a:[9350,3845],b:[12000,3845]},
  {id:'G-SERVICE-NORTH-B',a:[9350,8155],b:[12000,8155]},
  {id:'G-PANTRY-SOUTH-B',a:[9350,6650],b:[12000,6650]},
  {id:'G-STUDY-EAST-B',a:[3200,0],b:[3200,2712.5]},
  {id:'G-STUDY-NORTH-B',a:[0,2712.5],b:[3200,2712.5]},
  {id:'G-GUEST-SPLIT-B',a:[9350,1750],b:[12000,1750]}],
 openings:[...previous.openings.map(o=>{
  if(o.id==='G-FRONT-W01')return {...o,centre:1650}
  if(o.id==='G-FRONT-W02')return {...o,centre:4550}
  if(o.id==='G-FRONT-D01')return {...o,centre:7450}
  if(o.id==='G-FRONT-W04')return {...o,centre:10350}
  if(['G-COURT-W-W01','G-COURT-E-W01'].includes(o.id))return {...o,centre:5100,width:1200}
  if(['G-COURT-W-W02','G-COURT-E-W02'].includes(o.id))return {...o,centre:6900,width:1200}
  if(o.id==='G-PLANT-EXTERNAL-D01')return {...o,centre:5750}
  if(o.id==='G-KITCHEN-E-W01')return {...o,centre:10050}
  if(o.id==='G-SERVICE-E-W01')return {...o,centre:4500}
  if(o.id==='G-SERVICE-GALLERY-D01')return {...o,centre:5100}
  if(o.id==='G-CLOAK-HALL-D01')return {...o,centre:1100,width:900}
  if(o.id==='G-WC-HALL-D01')return {...o,centre:2800,width:900}
  if(o.id==='G-WC-E-W01')return {...o,centre:2850}
  return o
 }),
 {id:'G-PANTRY-KITCHEN-D01',hostBoundaryId:'G-SERVICE-NORTH-B',centre:10400,width:900,role:'door' as const,leaves:1 as const,swingSide:'right' as const,replaces:['ADJ-G-PANTRY-KITCHEN']},
 {id:'G-PANTRY-E-W01',hostBoundaryId:'G-OUTER-EAST',centre:7400,width:900,nominalSillMm:1500,role:'window' as const,replaces:[]}],
 stair:{...previous.stair,x:3350,y:475,landingDepth:1100,wellGap:250,footprintWidth:3500,footprintDepth:2250,coordinationWidth:3600,coordinationDepth:2350},
 serviceSubdivision:'UTILITY_PLANT_AND_SEPARATE_KITCHEN_PANTRY',
 roomFit:{study:{desk:{x:450,y:600,width:700,depth:1600},chair:{x:1150,y:700,width:1000,depth:1000}},
 cloak:{storage:{x:10982.5,y:650,width:600,depth:1000}},
 wc:{pan:{x:10750,y:2932.5,width:400,depth:700},basin:{x:11182.5,y:2350,width:400,depth:400},serviceLining:{x:9412.5,y:3632.5,width:2170,depth:150}},
 pantry:{westShelves:{x:9412.5,y:6750,width:300,depth:1250},eastShelves:{x:11132.5,y:6750,width:450,depth:1250}}}
}
export const createResolvedReferenceHouseSource=()=>{
 const s=previousSource(),fact=s.partitions.serviceSouthY!
 const provisional=<T>(id:string,value:T)=>({...fact,id,value})
 s.shell.depth=provisional('RHPR-SQUARE-DEPTH',mm(12000))
 s.court={...s.court,id:'RHPR-SQUARE-COURT',value:{...s.court.value,width:mm(3600),depth:mm(3600),placement:'centred-in-shell'}}
 delete s.court.value.offsetY
 s.partitions.frontHallWestX=provisional('RHPR-SQUARE-HALL-WEST',mm(3200))
 s.partitions.groundStudyNorthY=provisional('RHPR-SQUARE-STUDY-NORTH',mm(2712.5))
 s.partitions.groundGuestSplitY=provisional('RHPR-SQUARE-GUEST-SPLIT',mm(1750))
 s.partitions.serviceSouthY=provisional('RHPR-SQUARE-SERVICE-SOUTH',mm(3845))
 s.partitions.serviceNorthY=provisional('RHPR-SQUARE-SERVICE-NORTH',mm(8155))
 s.partitions.pantrySouthY=provisional('RHPR-SQUARE-PANTRY-SOUTH',mm(6650))
 s.partitions.upperNorthSplitY=provisional('RHPR-SQUARE-UPPER-NORTH',mm(9600))
 // Full upper arrival fits between the original main-hall side faces.
 s.partitions.upperSouthLandingTurnDepth=provisional('RHPR-SQUARE-UPPER-TURN',mm(2600))
 s.frontField={...s.frontField,id:'RHPR-SQUARE-FRONT-FIELD',value:{...s.frontField.value,spacing:mm(2900)},authority:'PROVISIONAL',authorship:'AUTHORED_PROVISIONAL',disposition:'PROVISIONAL_BUT_REPRESENTABLE'}
 s.levels.groundCeiling=provisional('RHPR-CEILING-G',mm(3100))
 s.levels.firstFfl=provisional('RHPR-FFL-1',mm(3450))
 s.levels.upperCeiling=provisional('RHPR-CEILING-U',mm(6550))
 s.levels.corniceControl=provisional('RHPR-CORNICE',mm(6800))
 s.roof={...s.roof,id:'RHPR-SQUARE-ROOF',value:{...s.roof.value,outerEdgeControl:mm(6800)}}
 s.stair.reservation={...s.stair.reservation,value:{min:mm(2350),max:mm(2450)}}
 for(const r of s.spaces){
  if(r.id==='G-SVC-02'){r.label='utility / plant';r.rectangles[0].y1='PANTRY_SOUTH'}
  if(r.id==='G-GAL-01')r.rectangles[0].y1='SERVICE_NORTH'
  if(r.id==='G-KIT-02')r.rectangles[0].y0='SERVICE_NORTH'
  if(r.id==='U-BATH-01')r.rectangles[0].y1='SERVICE_NORTH'
  if(r.id==='U-BED-04')for(const b of r.rectangles)if(b.y0==='COURT_NORTH'&&b.x0==='GALLERY_SERVICE')b.y0='SERVICE_NORTH'
 }
 for(const b of s.boundaries)if(b.id==='G-GALLERY-SERVICE-B')b.to='SERVICE_NORTH'
 s.spaces.push({id:'G-PANTRY-01',levelId:'GROUND',kind:'room',label:'pantry',rectangles:[{x0:'GALLERY_SERVICE',x1:'SHELL_EAST',y0:'PANTRY_SOUTH',y1:'SERVICE_NORTH'}],disposition:'PROVISIONAL_BUT_REPRESENTABLE'})
 s.requiredAdjacencies=s.requiredAdjacencies.filter(a=>a.id!=='ADJ-G-GARDEN-KIT')
 // Open rear connection is still shared above SERVICE_NORTH.
 s.requiredAdjacencies.push({id:'ADJ-G-GARDEN-KIT',levelId:'GROUND',a:'G-GARDEN-02',b:'G-KIT-02'},{id:'ADJ-G-PANTRY-KITCHEN',levelId:'GROUND',a:'G-PANTRY-01',b:'G-KIT-02'})
 return s
}
