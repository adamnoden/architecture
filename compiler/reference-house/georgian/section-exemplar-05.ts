import {createGeorgianElevation} from './elevations.js'
import {design as prior,openings} from './facade-source.js'
import {sectionAt} from './sections-roof-01.js'
import {subtractRectilinearRectangles} from '../../architectural-drawing/rectilinear-region.js'
import {mm} from '../../units.js'
import type {DrawingSceneV2,DrawingPrimitiveV2} from '../../publication-drawing-v2/model.js'
export const design={...prior,id:'RH-COHERENT-SECTION-05',roof:{...prior.roof,kind:'inward-outward-pitched-ring',courtEaves:6800,ridgeInset:2100,overhang:200},section:{bearing:75,weather:102.5,cavity:160,inner:140,finish:15,storageInset:1000},floor:{finish:20,deck:22,joist:238,serviceVoid:55,ceiling:15,endGap:25,supportProjection:100,ceilingMember:125,loftDeck:22,groundReserve:300,foundationDepthSelected:false,direction: "longitudinal to principal cut; nominal support on inner leaves"}}
export const roofHeight=(d:number)=>6800+Math.min(d,4200-d)*Math.tan(25*Math.PI/180)
export const roofTop=()=>roofHeight(2100)
type R={x0:number;x1:number;y0:number;y1:number}
/** Use the existing ADE boundary tracer on the complement of a rectangle union. */
export function joinSectionRegions(rects:R[]){
 const xs=[...new Set(rects.flatMap(r=>[r.x0,r.x1]))].sort((a,b)=>a-b),ys=[...new Set(rects.flatMap(r=>[r.y0,r.y1]))].sort((a,b)=>a-b),cuts:R[]=[]
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++){const x=(xs[i]+xs[i+1])/2,y=(ys[j]+ys[j+1])/2;if(!rects.some(r=>x>r.x0&&x<r.x1&&y>r.y0&&y<r.y1))cuts.push({x0:xs[i],x1:xs[i+1],y0:ys[j],y1:ys[j+1]})}
 const x0=xs[0],x1=xs.at(-1)!,y0=ys[0],y1=ys.at(-1)!
 return subtractRectilinearRectangles([[{x:mm(x0),y:mm(y0)},{x:mm(x1),y:mm(y0)},{x:mm(x1),y:mm(y1)},{x:mm(x0),y:mm(y1)}]],cuts.map(r=>({x0:mm(r.x0),x1:mm(r.x1),y0:mm(r.y0),y1:mm(r.y1)})))
}
export const exemplarViews=['PRINCIPAL','ROOF','ROOF-WATER','FRONT','COURT'] as const
export type ExemplarView=typeof exemplarViews[number]
export function createSectionExemplar(view:ExemplarView,scale:100|50):DrawingSceneV2{
 if(view==='FRONT'||view==='COURT')return createRoofConsequence(view,scale)
 const origin=scale===100?{x:12.5,y:18}:{x:90,y:150},p=(x:number,y:number)=>({x:origin.x+x/scale,y:origin.y+(12000-y)/scale})
 const metadata={sources:'docs/publication/architectural-plate-joined-section.md',authority:'provisional',precision:'approximate',constructionDetailSelected:false},primitives:DrawingPrimitiveV2[]=[]
 const scene:DrawingSceneV2={widthMm:scale===100?145:420,heightMm:scale===100?190:594,viewId:`TWIN-PITCH-${view}-${scale}`,sourceId:design.id,title:view,description:'Joined nominal assemblies; layer family retained from plan; engineering and drainage sizing unresolved.',scaleDenominator:scale,primitives}
 const line=(id:string,x:number,z:number,xx:number,zz:number,role:'cut'|'profile'|'primary'|'secondary'='secondary',dash?:'datum')=>primitives.push({kind:'line',id,a:p(x,z),b:p(xx,zz),role,dash,metadata})
 const text=(id:string,x:number,z:number,value:string,role:'note'|'label'|'marker'='note')=>primitives.push({kind:'text',id,...p(x,z),value,role,anchor:'middle',metadata})
 const polygon=(id:string,points:number[][],fill:'faint'|'context'|'none'='none',role:'cut'|'profile'|'secondary'='cut')=>primitives.push({kind:'path',id,rings:[points.map(([x,z])=>p(x,z))],stroke:role,fill,metadata})
 const box=(id:string,x:number,z:number,w:number,h:number)=>polygon(id,[[x,z],[x+w,z],[x+w,z+h],[x,z+h]],'none','secondary')
 if(view==='PRINCIPAL'){
  const m=sectionAt(6000),weather:R[]=[],inner:R[]=[]
  for(const [i,w]of m.walls.entries()){
   const forward=i===0||i===2,leaf=(offset:number,width:number)=>forward?[w.lo+offset,w.lo+offset+width]:[w.hi-offset-width,w.hi-offset]
   for(const [target,off,width]of [[weather,0,102.5],[inner,262.5,155]] as const){const [lo,hi]=leaf(off,width);let cursor=0;for(const hole of w.holes){if(hole.lo>cursor)target.push({x0:lo,x1:hi,y0:cursor,y1:hole.lo});cursor=hole.hi}if(cursor<6500)target.push({x0:lo,x1:hi,y0:cursor,y1:6500})}
   for(const h of w.holes){if(h.kind==='window'){line(h.id+'-glass',(w.lo+w.hi)/2,h.lo,(w.lo+w.hi)/2,h.hi);line(h.id+'-sill',w.lo,h.lo,w.hi,h.lo)}line(h.id+'-head',w.lo,h.hi,w.hi,h.hi)}
  }
  for(const [a,b]of m.floorRuns){line('ground-'+a,a,0,b,0,'profile');line('ceiling-'+a,a,6550,b,6550)}
  // Platforms stop short of both low eaves; no full-height attic stair.
  for(const [a,b]of m.floorRuns){
   polygon('roof-ceiling-lining-'+a,[[a,6550],[b,6550],[b,6565],[a,6565]],'faint','secondary')
   polygon('roof-ceiling-member-'+a,[[a+25,6565],[b-25,6565],[b-25,6690],[a+25,6690]],'none','secondary')
   line('roof-seat-a-'+a,a,6565,a+100,6565,'primary');line('roof-seat-b-'+a,b-100,6565,b,6565,'primary')
  }
  for(const [a,b]of [[1000,3200],[8800,11000]])polygon('limited-storage-deck-'+a,[[a,6690],[b,6690],[b,6712],[a,6712]],'faint','secondary')
  for(const w of m.partitions)inner.push({x0:w.at-62.5,x1:w.at+62.5,y0:w.base+(w.door?2850:0),y1:w.base+3100})
  for(const [id,rects,fill]of [['weather-leaves',weather,'context'],['inner-floor-partition',inner,'faint']] as const){let rings=joinSectionRegions(rects);primitives.push({kind:'path',id,rings:rings.map(r=>r.map(q=>p(q.x,q.y===6500?roofHeight(Math.min(q.x,12000-q.x))-300:q.y))),stroke:'primary',fill,metadata})}
  for(const [i,[a,b]]of m.floorRuns.entries()){
   const lo=a+25,hi=b-25
   polygon('floor-finish-'+i,[[a,3430],[b,3430],[b,3450],[a,3450]],'none','secondary')
   polygon('floor-deck-'+i,[[lo,3408],[hi,3408],[hi,3430],[lo,3430]],'faint','secondary')
   polygon('timber-joist-'+i,[[lo,3170],[hi,3170],[hi,3408],[lo,3408]],'none','profile')
   // Separate indicative seats; no timber pockets, anchors or proprietary hanger invented.
   polygon('seat-left-'+i,[[a,3130],[a+100,3130],[a+100,3170],[a,3170]],'faint','secondary')
   polygon('seat-right-'+i,[[b-100,3130],[b,3130],[b,3170],[b-100,3170]],'faint','secondary')
   polygon('ceiling-'+i,[[a,3100],[b,3100],[b,3115],[a,3115]],'faint','secondary')
   line('service-void-'+i,a,3142.5,b,3142.5,'secondary','datum')
  }
  // Section passes through the paired entrance; show a closed leaf convention.
  polygon('front-door-frame',[[140,0],[200,0],[200,2850],[140,2850]],'none','secondary')
  line('front-door-leaf',200,50,200,2250,'primary');line('front-fanlight',200,2310,200,2790)
  line('front-threshold',-120,0,470,0,'primary');line('external-ground',-400,-150,0,-150)
  for(const [id,pts]of [['south',[[-200,roofHeight(-200)],[2100,roofTop()],[4400,roofHeight(4400)]]],['north',[[7600,roofHeight(4400)],[9900,roofTop()],[12200,roofHeight(-200)]]]] as const){polygon('roof-'+id,[...pts.map(q=>[...q]),...[...pts].reverse().map(([x,z])=>[x,z-300])],'faint','profile')}
  for(const level of ['GROUND','FIRST'] as const)for(const o of openings(level).filter(o=>o.wall==='court-west')){const z=(level==='GROUND'?0:3450)+750;box('beyond-'+level+o.id,o.centre-500,z,1000,2100);for(const d of [1,2])line(o.id+level+'bar'+d,o.centre-500+1000*d/3,z,o.centre-500+1000*d/3,z+2100);for(const d of [1,2,3])line(o.id+level+'row'+d,o.centre-500,z+2100*d/4,o.centre+500,z+2100*d/4)}
  // Ground package and support continuation are reservations, not invented footing sections.
  for(const [i,[a,b]]of m.floorRuns.entries()){
   polygon('ground-build-up-'+i,[[a,0],[b,0],[b,-300],[a,-300]],'faint','secondary')
   line('ground-reserve-'+i,a,-180,b,-180,'secondary','datum')
  }
  for(const w of m.walls){const x=(w.lo+w.hi)/2;line('foundation-axis-'+w.id,x,-320,x,-900,'secondary','datum');line('foundation-break-a-'+w.id,x-65,-900,x+65,-950);line('foundation-break-b-'+w.id,x-65,-960,x+65,-1010)}
  line('courtyard-ground',4200,-150,7800,-150)
  polygon('courtyard-door-frame',[[7990,0],[8050,0],[8050,2850],[7990,2850]],'none','secondary')
  line('courtyard-door-leaf',8075,50,8075,2790,'primary');line('courtyard-threshold',7750,0,8270,0,'primary')
  // Retain aperture articulation beyond the cut, with subordinate strokes.
  for(const level of ['GROUND','FIRST'] as const)for(const o of openings(level).filter(o=>o.wall==='court-west')){
   const z=(level==='GROUND'?0:3450)+750,id='beyond-detail-'+level+o.id
   box(id+'-frame',o.centre-440,z+60,880,1980)
   box(id+'-sill',o.centre-580,z-60,1160,60)
   box(id+'-head',o.centre-500,z+2100,1000,120)
  }
  for(const [id,x,z,v]of [['court',6000,7150,'OPEN COURTYARD'],['a',2100,1600,'Entrance hall'],['b',9900,1600,'Family / dining'],['c',2100,5050,'South landing'],['d',9900,5050,'Walk-in']] as const)text(id,x,z,v,id==='court'?'marker':'label')
  text('key',6000,10500,'Twin 25-degree pitches; low storage only')
  text('layers',6000,10000,'Floor: finish 20 / deck 22 / joist 238 / service void 55 / ceiling 15 mm')
  text('scope',6000,9500,'Indicative seats and limited storage deck; supports and sizes unverified')
  text('foundation-key',6000,-1350,'Ground build-up reserved; foundation type and depth unresolved')
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
