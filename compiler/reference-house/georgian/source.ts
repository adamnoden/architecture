import {PROJECT_DESIGN_CONSTRAINTS} from '../../../project/design-constraints.js'
/** Authored coordination candidate, not a replacement for the frozen RH fixtures.
 * All coordinates are model millimetres; north is +Y, front is south. */
export type Level='GROUND'|'FIRST'|'ATTIC'
export type Box={x:number;y:number;width:number;depth:number}
export type Room={id:string;label:string;boxes:Box[];at:[number,number]}
export type Wall={id:string;a:[number,number];b:[number,number]}
export type Opening={id:string;wall:string;centre:number;width:number;kind:'window'|'door';swing?:'left'|'right';hinge?:'low'|'high';leaves?:1|2;sill?:number;head?:number}
const box=(x:number,y:number,width:number,depth:number):Box=>({x,y,width,depth})
const room=(id:string,label:string,boxes:Box[],at:[number,number]):Room=>({id,label,boxes,at})
const wall=(id:string,x:number,y:number,xx:number,yy:number):Wall=>({id,a:[x,y],b:[xx,yy]})
export const design={id:'RH-GEORGIAN-REPLAN-01',shell:12000,court:{x:4200,y:4200,width:3600,depth:3600},envelope:417.5,partition:125,
 levels:{ground:0,first:3450,attic:6900,ceilingGround:3100,ceilingFirst:6550},
 frontAxes:[1800,3900,6000,8100,10200],otherAxes:[1800,4600,7400,10200],courtAxes:[5100,6900],
 stair:{x:550,y:4800,width:2700,length:4450,flight:1200,well:300,landing:1750,going:300,risers:20,rise:172.5,floorRise:3450},
 roof:{kind:'outward-pitched-mansard',flatRoofsAllowed:PROJECT_DESIGN_CONSTRAINTS.roofs.flatRoofsAllowed,minimumPitchDeg:PROJECT_DESIGN_CONSTRAINTS.roofs.currentCandidateMinimumPitchDeg,eaves:6800,breakInset:600,breakZ:8800,upperPitchDeg:30,buildZone:300,dormerAxes:[3900,6000,8100],dormerWidth:1100,dormerSill:8000,dormerHead:9300,dormerApex:9850,roofAccess:'rear service-side dormer door; platform/edge protection unresolved'},
 rooms:{
 GROUND:[room('G-STUDY','Study',[box(0,0,2600,3537.5)],[1750,2200]),room('G-CLOAK','Cloakroom',[box(2600,0,2200,2500)],[3900,700]),room('G-WC','Guest WC',[box(9600,0,2400,3000)],[10800,1000]),room('G-UTILITY','Utility',[box(7800,0,1800,3845)],[8700,1900]),room('G-PLANT','Plant room',[box(9600,3000,2400,5155)],[10800,6500]),room('G-PANTRY','Pantry',[box(9600,8155,2400,1245)],[10800,8800]),room('G-KITCHEN','Kitchen',[box(7800,9400,4200,2600),box(7800,8155,1800,1245)],[8800,11000]),room('G-FAMILY','Family / garden dining',[box(0,9400,7800,2600),box(0,9300,4200,100)],[3900,10500])],
 FIRST:[room('U-BED2','Bedroom 2',[box(0,0,3300,3550)],[2500,1800]),room('U-BED3','Bedroom 3',[box(7800,0,4200,3300)],[8800,3000]),room('U-ENS3','En suite',[box(9400,3300,2600,1500)],[10800,4000]),room('U-BATH','Family bathroom',[box(9400,4800,2600,2400)],[10800,6100]),room('U-ENSP','En suite',[box(9400,7200,2600,1500)],[10800,7400]),room('U-PRINCIPAL','Principal bedroom',[box(7800,9400,4200,2600),box(9400,8700,2600,700)],[8800,11000]),room('U-WIC','Walk-in wardrobe',[box(5400,9400,2400,2600)],[6600,10500]),room('U-BED4','Bedroom 4',[box(0,9400,5400,2600)],[4000,11200])],
 ATTIC:[room('A-STORE','Storage / maintenance',[box(0,0,12000,4200),box(0,7800,12000,4200),box(0,4200,4200,3600),box(7800,4200,4200,3600)],[6000,2300])]
 } as Record<Level,Room[]>,
 partitions:{
 GROUND:[wall('study-east',2600,0,2600,3537.5),wall('study-north',0,3537.5,2600,3537.5),wall('cloak-east',4800,0,4800,2500),wall('cloak-north',2600,2500,4800,2500),wall('utility-west',7800,0,7800,3845),wall('service-spine',9600,0,9600,9400),wall('wc-north',9600,3000,12000,3000),wall('utility-north',7800,3845,9600,3845),wall('plant-north',9600,8155,12000,8155),wall('pantry-north',9600,9400,12000,9400)],
 FIRST:[wall('bed2-east',3300,0,3300,3550),wall('bed2-north',0,3550,3300,3550),wall('bed3-west',7800,0,7800,3300),wall('bed3-north',7800,3300,12000,3300),wall('wet-spine',9400,3300,9400,9400),wall('bath-south',9400,4800,12000,4800),wall('bath-north',9400,7200,12000,7200),wall('ensuite-north',9400,8700,12000,8700),wall('rear-split',0,9400,9400,9400),wall('wardrobe-west',5400,9400,5400,12000),wall('wardrobe-east',7800,9400,7800,12000)],ATTIC:[]
 } as Record<Level,Wall[]>,
 services:{riser:box(9662.5,5500,550,700),upperLining:box(9462.5,3362.5,250,5275),plantWater:box(9862.5,3600,700,700),plantDry:box(9862.5,6900,500,1000),plantWorking:box(10662.5,3400,920,4000),panels:[{level:'FIRST',x:9400,y:4100,width:900},{level:'FIRST',x:9400,y:5750,width:900},{level:'FIRST',x:9400,y:7900,width:900}],replacementDoor:1400,plantAccess:'separate side door and gallery door',policy:'No service inside permanent fabric; dry-side removable linings; wet/dry separation; panel access and withdrawal envelopes reserved'},
 furniture:{studyDesk:box(450,700,700,1600),studyChair:box(1150,900,1000,1000),cloakHanging:box(2737.5,450,600,1500),bed2:box(600,700,1200,2000),bed3:box(10082.5,417.5,1500,2000),bed4:box(650,10232.5,2000,1350),principal:box(9982.5,9582.5,1600,2000),wardrobeWest:box(5462.5,9562.5,600,1800),wardrobeEastNorth:box(7137.5,11100,600,480),wardrobeEastSouth:box(7137.5,9562.5,600,480)},
 limitations:['Candidate not yet migrated into full RH structural/energy/service compiler','Actual stair opening framing, fire separation and evacuation unproved','Roof waterproofing, structure, maintenance protection and drainage details unproved','Furniture templates are occupied footprints, not a certified carrying simulation','Plant envelopes are coordination assumptions, not selected products']
}
export const roofHeight=(distanceFromOuter:number)=>distanceFromOuter<=design.roof.breakInset?design.roof.eaves+(design.roof.breakZ-design.roof.eaves)*distanceFromOuter/design.roof.breakInset:design.roof.breakZ+(distanceFromOuter-design.roof.breakInset)*Math.tan(design.roof.upperPitchDeg*Math.PI/180)
export const roofTop=()=>roofHeight(4200)
const op=(id:string,wall:string,centre:number,width:number,kind:'window'|'door',swing:'left'|'right'='left',hinge:'low'|'high'='low',leaves:1|2=1):Opening=>({id,wall,centre,width,kind,swing,hinge,leaves})
export const openings=(level:Level):Opening[]=>{
 if(level==='ATTIC')return []
 const a:Opening[]=[]
 for(const side of ['south','north','east','west'])for(const [i,c] of (side==='south'?design.frontAxes:design.otherAxes).entries()){
  if(level==='GROUND'&&side==='south'&&i===2)a.push(op('front-door','outer-south',c,1600,'door','left','low',2))
  else if(level==='GROUND'&&side==='north'&&(i===1||i===2))a.push(op(`garden-door-${i}`,'outer-north',c,1600,'door','right','low',2))
  else if(level==='GROUND'&&side==='east'&&i===1)a.push(op('plant-replacement','outer-east',c,1400,'door','right'))
  else a.push(op(`${side}-window-${i}`,`outer-${side}`,c,1000,'window'))
 }
 for(const side of ['south','north','east','west']){
  if(level==='GROUND'&&side==='north'){a.push(op('grand-court-entry','court-north',6000,2400,'door','right','low',2));continue}
  for(const [i,c] of design.courtAxes.entries())a.push(op(`court-${side}-${i}`,`court-${side}`,c,1000,'window'))
 }
 if(level==='GROUND')a.push(op('study-door','study-north',1750,900,'door','right','low'),op('cloak-door','cloak-north',3900,900,'door','right','low'),op('utility-door','utility-west',2200,900,'door','right','high'),op('wc-door','service-spine',1800,900,'door','right','high'),op('plant-door','service-spine',4900,1000,'door','right','low'),op('pantry-door','pantry-north',10800,900,'door','right','low'))
 else a.push(op('bed2-door','bed2-north',2000,900,'door','right','high'),op('bed3-door','bed3-west',1800,900,'door','right','high'),op('ensuite3-door','bed3-north',10200,900,'door','right','low'),op('family-bath-door','wet-spine',6700,900,'door','right','low'),op('principal-ensuite-door','ensuite-north',10700,900,'door','right','high'),op('principal-door','rear-split',8600,1000,'door','left','high'),op('bed4-door','rear-split',4800,900,'door','left','low'),op('wardrobe-door','wardrobe-east',10550,900,'door','right','low'))
 return a
}
