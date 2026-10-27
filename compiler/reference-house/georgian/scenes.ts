import {compileArchitecturalPlanScene} from '../../architectural-drawing/compile-plan.js'
import {returnStairToDrawingPrimitives} from '../../architectural-drawing/stair-drawing.js'
import {createPlanPaperProjection} from '../../publication-drawing/projection.js'
import type {DrawingSceneV2,DrawingPrimitiveV2} from '../../publication-drawing-v2/model.js'
import {mm} from '../../units.js'
import {createGeorgianPlan,provenance} from './plan.js'
import {design,roofHeight,roofTop,openings,type Level,type Box} from './source.js'
const metadata={sources:provenance.sourceIds.join(','),authority:'provisional',precision:'approximate',constructionDetailSelected:false}
export const createGeorgianScene=(view:'GROUND'|'FIRST'|'ATTIC'|'FRONT'|'REAR'|'SECTION'|'STAIR'|'SERVICES',scale:100|50):DrawingSceneV2=>{
 const origin=scale===100?{x:22,y:20}:{x:90,y:150},widthMm=scale===100?145:420,heightMm=scale===100?190:594
 const projection=createPlanPaperProjection({scaleDenominator:scale,modelBounds:{x:0,y:0,width:12000,height:12000},paperOrigin:origin})
 const groundView=view==='GROUND'||view==='SERVICES',isPlan=['GROUND','FIRST','ATTIC','SERVICES'].includes(view),level:Level=groundView?'GROUND':view==='ATTIC'?'ATTIC':'FIRST'
 let scene:DrawingSceneV2={widthMm,heightMm,viewId:`GEORGIAN-${view}-${scale}`,title:view,description:'Provisional coordinated architecture; dimensions and service envelopes are authored choices, not construction approval.',sourceId:design.id,scaleDenominator:scale,primitives:[]}
 const p=(x:number,y:number)=>projection.point(x,y)
 const line=(id:string,x:number,y:number,xx:number,yy:number,role:'cut'|'profile'|'primary'|'secondary'='secondary',dash?:'overhead'|'datum')=>scene.primitives.push({kind:'line',id,a:p(x,y),b:p(xx,yy),role,dash,metadata})
 const text=(id:string,x:number,y:number,value:string,role:'label'|'note'|'marker'='note')=>{const q=p(x,y);scene.primitives.push({kind:'text',id,x:q.x,y:q.y,value,role,anchor:'middle',metadata})}
 const rect=(id:string,b:Box,dash?:'overhead'|'datum')=>{const a=p(b.x,b.y+b.depth);scene.primitives.push({kind:'rect',id,x:a.x,y:a.y,width:b.width/scale,height:b.depth/scale,stroke:'secondary',fill:'none',dash,metadata})}
 if(isPlan){
  const plan=createGeorgianPlan(level)
  scene=compileArchitecturalPlanScene(plan,{title:`Georgian re-plan ${view}`,profile:{id:`GEORGIAN-${view}-${scale}`,output:scale===100?'BOOK':'WALL',scaleDenominator:scale},projection,widthMm,heightMm,resolveAssemblyThicknessMm:a=>mm(a.id==='RH-ADE-ENVELOPE'?417.5:125),resolveLayerThicknessMm:l=>{if(l.thickness.kind==='approximate'||l.thickness.kind==='exact')return l.thickness.value;return mm(160)},abutments:level==='ATTIC'?{}:{'RH-PART-DRY-01':['RH-ADE-ENVELOPE']},openingSide:()=> 'right',layerBoundaryOpacity:.45,dimensionOptions:{annotationSide:'right',offsetPaperMm:18},labelLayout:()=>({})})
  const stair=design.stair
  const stairProjection={...projection,point:(x:number,y:number)=>p(stair.x+y,stair.y+stair.length-x)}
  const stairPrimitives=returnStairToDrawingPrimitives({kind:'return-stair',id:`GEORGIAN-STAIR-${level}`,origin:{x:mm(0),y:mm(0)},riserCount:20,floorToFloor:mm(3450),going:mm(300),clearWidth:mm(1200),landingDepth:mm(stair.landing),wellGap:mm(300),cutHeight:mm(1200),level:level==='ATTIC'?'FIRST':'GROUND',provenance},stairProjection)
  for(const prim of stairPrimitives){if(prim.kind==='text'&&level==='FIRST')prim.value='UP / DN';scene.primitives.push(prim)}
  text('landing-note',1900,8250,'Half-landing', 'note')
  if(level!=='ATTIC'){
   text('hall-label',6100,1700,level==='GROUND'?'Entrance hall':'South landing','label')
   text('east-route',8750,6500,view==='SERVICES'?'Service approach':'Gallery','note')
   if(level==='FIRST')text('north-route',6500,8750,'North landing','note')
  }else{
   rect('floor-outline',{x:0,y:0,width:12000,depth:12000},'overhead')
   const limit=(6900+2100+design.roof.buildZone-design.roof.breakZ)/Math.tan(Math.PI/6)+design.roof.breakInset
   rect('headroom-contour',{x:limit,y:limit,width:12000-2*limit,depth:12000-2*limit},'datum')
   text('attic-headroom',6000,3200,'Dashed line: nominal 2.1 m clear headroom')
   text('attic-lowzone',6000,-800,'Lower eaves: storage only')
   text('attic-store-rear',6000,9400,'Storage / maintenance','label')
   rect('rear-roof-access',{x:7550,y:10850,width:1100,depth:1000},'overhead')
   text('access-note',8100,10200,'Roof access: platform unresolved')
   text('attic-east',9900,6000,'Service inspection','label')
   for(const [i,axis]of design.roof.dormerAxes.entries()){rect(`dormer-${i}`,{x:axis-550,y:150,width:1100,depth:1000});line(`dormer-glass-${i}`,axis-550,150,axis+550,150)}
  }
  if(view==='FIRST'){
   text('upper-service-key',6000,-900,'Dashed: riser, dry-side access and guest en-suite service branch')
   for(const id of ['bed2','bed3','bed4','principal'] as const){const b=design.furniture[id];rect(id+'-bed',b);line(id+'-pillow',b.x+100,b.y+300,b.x+b.width-100,b.y+300)}
   rect('riser-upper',design.services.riser,'datum');rect('dry-access-lining-lower',{x:9662.5,y:4062.5,width:250,depth:187.5},'overhead');rect('dry-access-lining-upper',{x:9662.5,y:5150,width:250,depth:1287.5},'overhead');rect('ensuite-access-lining',{x:9662.5,y:6562.5,width:250,depth:2075},'overhead')
   const branch=design.services.guestEnsuiteBranch;for(let i=0;i<branch.length-1;i++)line('ensuite-branch-'+i,branch[i][0],branch[i][1],branch[i+1][0],branch[i+1][1],'secondary','datum')
   for(const panel of design.services.panels)line(`panel-${panel.y}`,panel.x,panel.y-panel.width/2,panel.x,panel.y+panel.width/2,'primary','datum')
  }
  if(view==='GROUND'||view==='SERVICES')rect('plant-riser',design.services.riser,'datum')
  if(view==='SERVICES'){
   rect('plant-working',design.services.plantWorking,'datum')
   scene.primitives=scene.primitives.filter(p=>!(p.kind==='text'&&['Plant room','Gallery','Service approach'].includes(p.value)))
   text('plant-zone',11100,5400,'Working aisle');const workText=scene.primitives.at(-1);if(workText?.kind==='text')workText.rotateDeg=-90
   text('cylinder-name',10212,3950,'HW')
   text('dry-name',10112,7350,'Dry')
   text('riser-name',9937,5850,'R')
   text('service-approach',8750,6500,'Service approach');const routeText=scene.primitives.at(-1);if(routeText?.kind==='text')routeText.rotateDeg=-90
   text('lining-note',6000,-900,'HW: cylinder reserve / R: riser / dashed: working and access space')
  }
 }else if(view==='FRONT'||view==='REAR'){
  const roof=design.roof
  line('base',0,0,12000,0,'profile');line('left-edge',0,0,0,6800,'profile');line('right-edge',12000,0,12000,6800,'profile')
  for(const [i,z] of [3250,6700,6800].entries())line(`cornice-${i}`,0,z,12000,z,i===2?'profile':'secondary')
  // Outward-draining roof: the highest edge adjoins the open courtyard.
  line('roof-left',0,6800,600,8800,'profile');line('roof-left-upper',600,8800,4200,roofTop(),'profile')
  line('roof-high',4200,roofTop(),7800,roofTop(),'profile');line('roof-right-upper',7800,roofTop(),11400,8800,'profile');line('roof-right',11400,8800,12000,6800,'profile')
  let breakStart=600;for(const [i,c]of roof.dormerAxes.entries()){line('roof-break-'+i,breakStart,8800,c-550,8800);breakStart=c+550}line('roof-break-end',breakStart,8800,11400,8800)
  for(const level of ['GROUND','FIRST'] as const){const ffl=level==='GROUND'?0:3450;const ops=openings(level).filter(o=>o.wall===(view==='FRONT'?'outer-south':'outer-north'))
   for(const o of ops){const sill=o.kind==='door'?ffl:ffl+750,head=ffl+2850;rect(`${level}-${o.id}`,{x:o.centre-o.width/2,y:sill,width:o.width,depth:head-sill});line(`${level}-${o.id}-mid`,o.centre,sill,o.centre,head);if(o.kind==='window'){line(`${level}-${o.id}-meeting`,o.centre-o.width/2,sill+(head-sill)/2,o.centre+o.width/2,sill+(head-sill)/2)}}
  }
  for(const [i,c]of roof.dormerAxes.entries()){const half=roof.dormerWidth/2;const access=view==='REAR'&&i===2;rect('dormer-face-'+i,{x:c-half,y:access?6900:roof.dormerSill,width:1100,depth:access?2400:1300});line(`dormer-gable-a-${i}`,c-half-100,9300,c,9850,'profile');line(`dormer-gable-b-${i}`,c,9850,c+half+100,9300,'profile');line(`dormer-sash-${i}`,c,access?6900:8000,c,9300);if(access)text('rear-access-note',6000,-1050,'Roof access: platform and protection unresolved')}
  text('elevation-size',6000,-650,'12000 mm')
  text('roof-height',6000,11600,`Roof high edge ${Math.round(roofTop())} mm`)
 }else if(view==='SECTION'){
  line('ground',0,0,12000,0,'cut')
  for(const [i,z] of [3450,6900].entries()){line(`floor-west-${i}`,0,z,4200,z,'cut');line(`floor-east-${i}`,7800,z,12000,z,'cut');line(`soffit-west-${i}`,0,z-350,4200,z-350);line(`soffit-east-${i}`,7800,z-350,12000,z-350)}
  for(const [i,x]of [0,4200,7800,12000].entries())line(`wall-${i}`,x,0,x,x===0||x===12000?6800:roofTop(),'profile')
  for(const [side,xx]of [['west',0],['east',7800]] as const){
   const points=side==='west'?[[0,6800],[600,8800],[4200,roofTop()]]:[[7800,roofTop()],[11400,8800],[12000,6800]]
   for(let i=0;i<2;i++){line(`roof-${side}-${i}`,points[i][0],points[i][1],points[i+1][0],points[i+1][1],'profile');line(`roof-inner-${side}-${i}`,points[i][0],points[i][1]-300,points[i+1][0],points[i+1][1]-300)}
   text(`headroom-${side}`,xx+2100,7500,'Usable attic')
  }
  text('court-section',6000,4300,'OPEN COURTYARD','marker')
  text('roof-drainage',6000,11200,'All roof planes fall to external eaves')
  text('roof-build',6000,-900,'Roof build zone: 300 mm coordination assumption')
 }else{
  const s=design.stair
  for(const [storey,z]of [0,3450].entries()){
   for(let flight=0;flight<2;flight++){
    const start=flight===0?s.y:s.y+s.length-s.landing
    for(let i=0;i<10;i++){
     const y=flight===0?s.y+i*300:s.y+2700-i*300,elevation=z+(flight*10+i+1)*172.5
     line(`tread-${storey}-${flight}-${i}`,y,elevation,y+300,elevation,'primary')
     line(`riser-${storey}-${flight}-${i}`,y,elevation-172.5,y,elevation,'secondary')
    }
    line(`landing-${storey}`,s.y+2700,z+1725,s.y+s.length,z+1725,'primary')
   }
  }
  for(const z of [0,3450,6900]){line('floor-'+z,3500,z,4800,z,'cut');text('ffl-'+z,10500,z+100,`FFL ${z}`)}
  const y=7000,x=2050;line('roof-min',3500,roofHeight(x)-300,11000,roofHeight(x)-300,'secondary','datum')
  text('roof-datum',7600,roofHeight(x),'Minimum roof underside at attic arrival')
  text('stair-rises',7600,11100,'20 × 172.5 mm rises per storey / 300 mm goings')
  text('stair-clear',7600,10600,'1200 mm flights / 1750 mm half-landing')
  text('stair-limit',7600,-900,'Developed stair diagram; framing and fire enclosure unresolved')
 }
 // Shared physical notation, never fit to sheet.
 const yy=-1900
 line('scale-bar',9000,yy,12000,yy,'primary');for(let i=0;i<4;i++)line(`scale-tick-${i}`,9000+i*1000,yy-100,9000+i*1000,yy+100)
 text('scale-label',10500,yy-450,'3 m');text('north',700,yy,'N ↑','marker')
 return scene
}
