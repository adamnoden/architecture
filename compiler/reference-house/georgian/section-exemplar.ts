import {createGeorgianElevation} from './elevations.js'
import {design as prior,openings} from './facade-source.js'
import {sectionAt} from './sections-roof-01.js'
import {createSectionPaperProjection} from '../../publication-drawing/projection.js'
import {sectionWallToDrawingPrimitives,sectionFloorToDrawingPrimitives} from '../../architectural-drawing/section-assemblies.js'
import {framedApertureToDrawingPrimitives,cutApertureToDrawingPrimitives} from '../../architectural-drawing/aperture-drawing.js'
import {sectionAssemblyModels,sectionAssemblyChoices,sectionProvenance} from './section-source.js'
import type {DrawingSceneV2,DrawingPrimitiveV2} from '../../publication-drawing-v2/model.js'
export const design={...prior,id:'RH-SECTION-JUNCTIONS-06',sectionAssemblies:sectionAssemblyChoices,roof:{...prior.roof,kind:'inward-outward-pitched-ring',courtEaves:6800,ridgeInset:2100,overhang:200},section:{bearing:75,weather:102.5,cavity:160,inner:140,finish:15,storageInset:1000},floor:{finish:20,deck:22,joist:238,serviceVoid:55,ceiling:15,endGap:25,supportProjection:100,ceilingMember:125,loftDeck:22,groundReserve:300,foundationDepthSelected:false,direction: "longitudinal to principal cut; nominal support on inner leaves"}}
export const roofHeight=(d:number)=>6800+Math.min(d,4200-d)*Math.tan(25*Math.PI/180)
export const roofTop=()=>roofHeight(2100)
export const exemplarViews=['PRINCIPAL','ROOF','ROOF-WATER','FRONT','COURT'] as const
export type ExemplarView=typeof exemplarViews[number]
export function createSectionExemplar(view:ExemplarView,scale:100|50):DrawingSceneV2{
 if(view==='FRONT'||view==='COURT')return createRoofConsequence(view,scale)
 const origin=scale===100?{x:12.5,y:18}:{x:90,y:150},p=(x:number,y:number)=>({x:origin.x+x/scale,y:origin.y+(12000-y)/scale})
 const projection=createSectionPaperProjection({scaleDenominator:scale,horizontalBounds:{min:0,max:12000},verticalBounds:{min:-2400,max:12000},paperOrigin:origin})
 const metadata={sources:'docs/publication/architectural-plate-section-assemblies.md',authority:'provisional',precision:'approximate',constructionDetailSelected:false},primitives:DrawingPrimitiveV2[]=[]
 const scene:DrawingSceneV2={widthMm:scale===100?145:420,heightMm:scale===100?190:594,viewId:`TWIN-PITCH-${view}-${scale}`,sourceId:design.id,title:view,description:'Shared nominal section assemblies; house-owned geometry; engineering and drainage sizing unresolved.',scaleDenominator:scale,primitives}
 const line=(id:string,x:number,z:number,xx:number,zz:number,role:'cut'|'profile'|'primary'|'secondary'='secondary',dash?:'datum')=>primitives.push({kind:'line',id,a:p(x,z),b:p(xx,zz),role,dash,metadata})
 const text=(id:string,x:number,z:number,value:string,role:'note'|'label'|'marker'='note')=>primitives.push({kind:'text',id,...p(x,z),value,role,anchor:'middle',metadata})
 const polygon=(id:string,points:number[][],fill:'faint'|'context'|'none'='none',role:'cut'|'profile'|'primary'|'secondary'='cut')=>primitives.push({kind:'path',id,rings:[points.map(([x,z])=>p(x,z))],stroke:role,fill,metadata})
 const box=(id:string,x:number,z:number,w:number,h:number)=>polygon(id,[[x,z],[x+w,z],[x+w,z+h],[x,z+h]],'none','secondary')
 if(view==='PRINCIPAL'){
  const m=sectionAt(6000),assemblies=sectionAssemblyModels(m,x=>roofHeight(Math.min(x,12000-x))-300)
  for(const wall of assemblies.walls)primitives.push(...sectionWallToDrawingPrimitives(wall,projection))
  for(const floor of assemblies.floors)primitives.push(...sectionFloorToDrawingPrimitives(floor,projection,sectionAssemblyChoices))
  for(const w of m.walls)for(const h of w.holes.filter(h=>h.kind==='window')){const centre=(w.lo+w.hi)/2;primitives.push(...cutApertureToDrawingPrimitives({id:w.id+'-'+h.id+'-cut-window',frameLeft:centre-30,frameWidth:60,bottom:h.lo,top:h.hi,leafX:centre,leafBottom:h.lo+60,leafTop:h.hi-60,threshold:[w.lo,w.hi],provenance:sectionProvenance},projection))}
  for(const w of m.partitions)polygon(w.id,[[w.at-62.5,w.base+(w.door?2850:0)],[w.at+62.5,w.base+(w.door?2850:0)],[w.at+62.5,w.base+3100],[w.at-62.5,w.base+3100]],'faint','primary')
  primitives.push(...cutApertureToDrawingPrimitives({id:'front-door',frameLeft:140,frameWidth:60,bottom:0,top:2850,leafX:200,leafBottom:50,leafTop:2250,fanlight:[2310,2790],threshold:[-120,470],provenance:sectionProvenance},projection))
  line('external-ground',-400,-150,0,-150)
  for(const [id,pts]of [['south',[[-200,roofHeight(-200)],[2100,roofTop()],[4400,roofHeight(4400)]]],['north',[[7600,roofHeight(4400)],[9900,roofTop()],[12200,roofHeight(-200)]]]] as const){polygon('roof-'+id,[...pts.map(q=>[...q]),...[...pts].reverse().map(([x,z])=>[x,z-300])],'faint','profile')}
  for(const level of ['GROUND','FIRST'] as const)for(const o of openings(level).filter(o=>o.wall==='court-west')){
   const base=level==='GROUND'?0:3450,z=base+(o.sill??750),head=base+(o.head??2850)
   primitives.push(...framedApertureToDrawingPrimitives({id:'beyond-'+level+'-'+o.id,left:o.centre-o.width/2,bottom:z,width:o.width,height:head-z,frameInset:60,columns:3,rows:4,sill:{height:60,projection:80},head:{height:120,projection:0},role:'secondary',provenance:sectionProvenance},projection))
  }
  // Ground package and support continuation are reservations, not invented footing sections.
  for(const [i,[a,b]]of m.floorRuns.entries()){
   polygon('ground-build-up-'+i,[[a,0],[b,0],[b,-300],[a,-300]],'faint','secondary')

  }
  for(const [id,x,z,label,target]of [['deck',9900,6900,'Storage deck',6712],['floor',10500,3800,'Finish / deck',3450]] as const){text('key-'+id,x,z,label);line('leader-'+id,x,z-100,x,target)}
  line('courtyard-ground',4200,-150,7800,-150)
  primitives.push(...cutApertureToDrawingPrimitives({id:'courtyard-door',frameLeft:7990,frameWidth:60,bottom:0,top:2850,leafX:8075,leafBottom:50,leafTop:2790,threshold:[7750,8270],provenance:sectionProvenance},projection))
  for(const [id,x,z,v]of [['court',6000,7150,'OPEN COURTYARD'],['a',2100,1600,'Entrance hall'],['b',9900,1600,'Family / dining'],['c',2100,5050,'South landing'],['d',9900,5050,'Walk-in']] as const)text(id,x,z,v,id==='court'?'marker':'label')
  text('key',6000,10500,'Twin 25-degree pitches; low storage only')
  text('layers',6000,10000,'Floor layers separated; thin finish / deck grouped where needed')
  text('scope',6000,9500,'Shaded heads: provisional lintel zones; structural design unresolved')
  text('foundation-key',6000,-1350,'Dashed support envelope: diagram only; foundation type / depth unresolved')
  for(const [i,z]of [0,3450,6550].entries()){line('tick-level'+i,-200,z,-50,z);text('level'+i,-650,z+90,(z/1000).toFixed(2))}
 }else if(view==='ROOF'||view==='ROOF-WATER'){
  box('shell',0,0,12000,12000);box('court',4200,4200,3600,3600);box('ridge',2100,2100,7800,7800)
  for(const [x,y,xx,yy]of [[0,0,4200,4200],[12000,0,7800,4200],[12000,12000,7800,7800],[0,12000,4200,7800]])line('hip'+x+y,x,y,xx,yy)
  for(const [x,y,xx,yy]of [[6000,1700,6000,500],[6000,2500,6000,3700],[10300,6000,11500,6000],[9500,6000,8300,6000],[6000,10300,6000,11500],[6000,9500,6000,8300],[1700,6000,500,6000],[2500,6000,3700,6000]]){line('fall'+x+y,x,y,xx,yy,'primary');const dx=Math.sign(xx-x),dy=Math.sign(yy-y);line('arrowa'+x+y,xx,yy,xx-dx*180-dy*80,yy-dy*180+dx*80);line('arrowb'+x+y,xx,yy,xx-dx*180+dy*80,yy-dy*180-dx*80)}
  if(view==='ROOF-WATER'){for(const [id,lo,hi]of [['outer',-150,12150],['inner',4350,7650]] as const){line(id+'a',lo,lo,hi,lo,'secondary','datum');line(id+'b',hi,lo,hi,hi,'secondary','datum');line(id+'c',hi,hi,lo,hi,'secondary','datum');line(id+'d',lo,hi,lo,lo,'secondary','datum')}text('key',6000,-1100,'Dashed: accessible eaves collection; outlet sizing/routes unresolved')}
  else text('key',6000,-1100,'Ridge ring; falls inward and outward; no flat roof')
  text('court',6000,6100,'OPEN COURT','marker');text('drain',6000,5500,'Surface drainage unresolved')
 }
 const yy=-1900;line('scale',9000,yy,12000,yy,'primary');for(let i=0;i<4;i++)line('tick'+i,9000+i*1000,yy-100,9000+i*1000,yy+100);text('bar',10500,yy-450,'3 m');text('scale-label',700,yy,`1:${scale}`,'marker')
 return scene
}

function createRoofConsequence(view:'FRONT'|'COURT',scale:100|50):DrawingSceneV2{
 const scene=createGeorgianElevation(view==='FRONT'?'FRONT':'COURT-WINDOWS',scale),o=scale===100?{x:12.5,y:18}:{x:90,y:150},p=(x:number,z:number)=>({x:o.x+x/scale,y:o.y+(12000-z)/scale})
 scene.sourceId=design.id;scene.viewId=`TWIN-PITCH-${view}-${scale}`
 scene.primitives=scene.primitives.filter(q=>!q.id.startsWith('roof-envelope-')&&q.id!=='height'&&q.id!=='court-high-edge'&&!(view==='COURT'&&['left-edge','right-edge'].includes(q.id)))
 const line=(id:string,x:number,z:number,xx:number,zz:number)=>scene.primitives.push({kind:'line',id,a:p(x,z),b:p(xx,zz),role:'profile'})
 if(view==='FRONT'){line('new-roofa',0,6800,2100,roofTop());line('new-ridge',2100,roofTop(),9900,roofTop());line('new-roofb',9900,roofTop(),12000,6800)}
 else{line('court-high-edge',4200,6800,7800,6800);line('left-edge',4200,0,4200,6800);line('right-edge',7800,0,7800,6800)}
 const rect=(id:string,x:number,z:number,w:number,h:number)=>{const a=p(x,z+h);scene.primitives.push({kind:'rect',id,...a,width:w/scale,height:h/scale,stroke:'secondary',fill:'none'})}
 scene.primitives=scene.primitives.filter(q=>!q.id.endsWith('-sill')&&!q.id.endsWith('-head')&&!q.id.startsWith('door-panel-')&&q.id!=='fanlight-rail'&&q.id!=='GROUND-front-door-leaves')
 for(const level of ['GROUND','FIRST'] as const)for(const w of openings(level).filter(w=>w.wall===(view==='FRONT'?'outer-south':'court-south')&&w.kind==='window')){
  const z=(level==='GROUND'?0:3450)+750,head=(level==='GROUND'?0:3450)+2850
  rect(w.id+level+'-sill-profile',w.centre-580,z-60,1160,60)
  rect(w.id+level+'-head-profile',w.centre-500,head,1000,120)
 }
 if(view==='FRONT'){
  const bottom=60,doorTop=2250
  line('meeting-stile',6000,bottom,6000,doorTop)
  rect('door-frame',5150,0,1700,2310)
  rect('fanlight-frame',5150,2310,1700,480)
  // Two leaves, each with six panels separated by consistent stiles/rails.
  for(const [i,x]of [5180,6080].entries())for(const [j,z]of [180,850,1520].entries())for(const [k,xx]of [x+70,x+415].entries())rect(`panel-${i}-${j}-${k}`,xx,z,255,520)
  line('fanlight-centre',6000,2310,6000,2790)
 }
 scene.primitives.push({kind:'text',id:'height',...p(6000,roofTop()+650),value:`Ridge +${(roofTop()/1000).toFixed(2)} m / courtyard eaves +6.80 m`,role:'note',anchor:'middle'})
 return scene
}
