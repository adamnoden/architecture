import {design,openings,roofHeight,roofTop} from './facade-source.js'
import type {DrawingSceneV2,DrawingPrimitiveV2,DrawingLineRole,DrawingDashRole} from '../../publication-drawing-v2/model.js'
export const technicalViews=['LOCATOR','PRINCIPAL','SERVICE-SECTION','ROOF','ROOF-WATER'] as const
export type TechnicalView=typeof technicalViews[number]
/** Nominal drawing decisions. These do not select structural members or size drainage. */
export const sectionRoofSource={id:'PLT-SECTION-ROOF-01',principalX:6000,serviceX:9900,storageFloorInset:1000,partitionHead:2850,
 gutters:'External eaves collection; symbolic gutter line, not a selected profile',outlets:[[11000,0],[12000,11000],[11000,12000],[0,11000]],
 limitations:['Structural framing and storage floor support unresolved','Roof-work access and hatch position unresolved','Gutter/outlet sizes, discharge connections and capacity unresolved','Courtyard surface drainage unresolved'],
 roofFields:[[[0,0],[12000,0],[7800,4200],[4200,4200]],[[12000,0],[12000,12000],[7800,7800],[7800,4200]],[[12000,12000],[0,12000],[4200,7800],[7800,7800]],[[0,12000],[0,0],[4200,4200],[4200,7800]]],
 falls:[[[6000,3300],[6000,1000]],[[8700,6000],[11000,6000]],[[6000,8700],[6000,11000]],[[3300,6000],[1000,6000]]]}
export const roofZ=(x:number,y:number)=>roofHeight(Math.min(x,y,12000-x,12000-y))
export function sectionAt(x:number){
 const court=x>=4200&&x<=7800
 const envelope=court?[{id:'outer-south',lo:0,hi:417.5,top:6800},{id:'court-south',lo:3782.5,hi:4200,top:roofTop()},{id:'court-north',lo:7800,hi:8217.5,top:roofTop()},{id:'outer-north',lo:11582.5,hi:12000,top:6800}]:[{id:'outer-south',lo:0,hi:417.5,top:6800},{id:'outer-north',lo:11582.5,hi:12000,top:6800}]
 const walls=envelope.map(w=>({...w,holes:(['GROUND','FIRST'] as const).flatMap(level=>openings(level).filter(o=>o.wall===w.id&&Math.abs(o.centre-x)<o.width/2).map(o=>({id:o.id,kind:o.kind,lo:(level==='GROUND'?0:3450)+(o.kind==='door'?0:o.sill??750),hi:(level==='GROUND'?0:3450)+(o.head??2850)})))}))
 const partitions=(['GROUND','FIRST'] as const).flatMap(level=>design.partitions[level].filter(w=>w.a[1]===w.b[1]&&x>w.a[0]&&x<w.b[0]).map(w=>({id:w.id,at:w.a[1],base:level==='GROUND'?0:3450,door:openings(level).some(o=>o.wall===w.id&&Math.abs(o.centre-x)<o.width/2)})))
 const floorRuns=court?[[417.5,3782.5],[8217.5,11582.5]]:[[417.5,11582.5]]
 return {x,court,walls,partitions,floorRuns}
}
export function createSectionRoofScene(view:TechnicalView,scale:100|50):DrawingSceneV2{
 const origin=scale===100?{x:12.5,y:18}:{x:90,y:150},p=(x:number,y:number)=>({x:origin.x+x/scale,y:origin.y+(12000-y)/scale})
 const primitives:DrawingPrimitiveV2[]=[],metadata={sources:'docs/publication/architectural-plate-sections-roof.md',authority:'provisional',precision:'approximate',constructionDetailSelected:false}
 const scene:DrawingSceneV2={widthMm:scale===100?145:420,heightMm:scale===100?190:594,viewId:`PLT-${view}-${scale}`,sourceId:design.id,title:view,description:'Source-derived section and roof candidate; structural framing, access and drainage capacity unresolved.',scaleDenominator:scale,primitives}
 const line=(id:string,x:number,y:number,xx:number,yy:number,role:DrawingLineRole='secondary',dash?:DrawingDashRole)=>primitives.push({kind:'line',id,a:p(x,y),b:p(xx,yy),role,dash,metadata})
 const text=(id:string,x:number,y:number,value:string,role:'note'|'label'|'marker'='note')=>primitives.push({kind:'text',id,...p(x,y),value,role,anchor:'middle',metadata})
 const rect=(id:string,x:number,y:number,w:number,h:number,cut=false,dash?:DrawingDashRole)=>cut?primitives.push({kind:'path',id,rings:[[p(x,y),p(x+w,y),p(x+w,y+h),p(x,y+h)]],stroke:'cut',fill:'faint',metadata}):primitives.push({kind:'rect',id,...p(x,y+h),width:w/scale,height:h/scale,stroke:'secondary',fill:'none',dash,metadata})
 const arrow=(id:string,a:number[],b:number[])=>{line(id,a[0],a[1],b[0],b[1],'primary');const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),ux=dx/l,uy=dy/l;line(id+'-a',b[0],b[1],b[0]-ux*250-uy*120,b[1]-uy*250+ux*120,'primary');line(id+'-b',b[0],b[1],b[0]-ux*250+uy*120,b[1]-uy*250-ux*120,'primary')}
 if(view==='PRINCIPAL'||view==='SERVICE-SECTION'){
  const m=sectionAt(view==='PRINCIPAL'?sectionRoofSource.principalX:sectionRoofSource.serviceX)
  for(const w of m.walls){let cursor=0;for(const h of w.holes.sort((a,b)=>a.lo-b.lo)){if(h.lo>cursor)rect(w.id+'-'+cursor,w.lo,cursor,w.hi-w.lo,h.lo-cursor,true);line(h.id+'-head',w.lo,h.hi,w.hi,h.hi,'primary');if(h.kind==='window')line(h.id+'-glazing',(w.lo+w.hi)/2,h.lo,(w.lo+w.hi)/2,h.hi);cursor=h.hi}if(cursor<w.top)rect(w.id+'-top',w.lo,cursor,w.hi-w.lo,w.top-cursor,true)}
  for(const [i,[a,b]]of m.floorRuns.entries()){
   rect('floor-'+i,a,3100,b-a,350,true);line('ground-'+i,a,0,b,0,'cut');line('ceiling-'+i,a,6550,b,6550)
   const lo=Math.max(a,sectionRoofSource.storageFloorInset),hi=Math.min(b,12000-sectionRoofSource.storageFloorInset)
   rect('storage-platform-'+i,lo,6550,hi-lo,350,true)
  }
  for(const w of m.partitions){const bottom=w.base+(w.door?sectionRoofSource.partitionHead:0),top=w.base+3100;rect(w.id,w.at-62.5,bottom,125,top-bottom,true)}
  const runs=m.court?[[0,4200],[7800,12000]]:[[0,12000]],breaks=[0,Math.min(m.x,12000-m.x),12000-Math.min(m.x,12000-m.x),12000]
  for(const [r,[a,b]]of runs.entries()){
   const points=[a,...breaks.filter(y=>y>a&&y<b),b]
   for(let i=0;i<points.length-1;i++){const y=points[i],yy=points[i+1];line(`roof-${r}-${i}`,y,roofZ(m.x,y),yy,roofZ(m.x,yy),'profile');line(`roof-under-${r}-${i}`,y,roofZ(m.x,y)-300,yy,roofZ(m.x,yy)-300)}
  }
  if(m.court){
   // West courtyard face lies beyond the cut; keep it subordinate to cut fabric.
   for(const level of ['GROUND','FIRST'] as const)for(const o of openings(level).filter(o=>o.wall==='court-west')){
    const z=(level==='GROUND'?0:3450)+750,head=(level==='GROUND'?0:3450)+2850,id='beyond-'+level+'-'+o.id
    rect(id,o.centre-o.width/2,z,o.width,head-z)
    for(const third of [1,2])line(id+'-bar-'+third,o.centre-o.width/2+o.width*third/3,z,o.centre-o.width/2+o.width*third/3,head)
    for(const quarter of [1,2,3])line(id+'-row-'+quarter,o.centre-o.width/2,z+(head-z)*quarter/4,o.centre+o.width/2,z+(head-z)*quarter/4)
   }
   text('court',6000,7200,'OPEN COURTYARD','marker');text('south-ground',2100,1600,'Entrance hall','label');text('north-ground',9900,1600,'Family / dining','label');text('south-upper',2100,5100,'South landing','label');text('north-upper',9900,5100,'Walk-in','label')}
  else{
   for(const [id,y,z,label]of [['wc',1500,1600,'Guest WC'],['plant',4500,1600,'Plant'],['pantry',8700,1600,'Pantry'],['kitchen',10600,1600,'Kitchen'],['bed',2000,5100,'Bedroom 3'],['bath',4750,5100,'Family bath'],['ens',7600,5100,'En suite'],['principal',10300,5100,'Principal']] as const)text(id,y,z,label,'label')
   rect('riser',design.services.riser.y,0,design.services.riser.depth,6550,false,'datum');text('riser-note',6000,-950,'Dashed: riser reserve; access is from dry-side gallery')
  }
  for(const [i,z]of [0,3450,6900].entries()){line('level-'+i,-200,z,-50,z);text('level-label-'+i,-650,z+90,(z/1000).toFixed(2))}
  text('low-storage',6000,9600,'Low storage only; upper stair withdrawn')
  text('roof-note',6000,10100,m.court?'25-degree roof falls outward':'Roof also falls perpendicular to this section')
  text('scope',6000,-500,'Nominal floor/roof zones; framing and hatch access unresolved')
 }else{
  rect('shell',0,0,12000,12000);rect('court',4200,4200,3600,3600)
  if(view==='LOCATOR'){
   for(const [id,x]of [['A',6000],['B',9900]] as const){line('cut-'+id,x,-200,x,12300,'primary','datum');text(id+'-start',x,-600,id,'marker');text(id+'-end',x,12700,id,'marker')}
   text('court',6000,6000,'Courtyard','label');text('legend',6000,-1100,'A: principal / B: service section; north is up')
  }else{
   for(const [i,points]of sectionRoofSource.roofFields.entries())for(let j=0;j<points.length;j++){const a=points[j],b=points[(j+1)%points.length];line(`field-${i}-${j}`,a[0],a[1],b[0],b[1],j%2?'secondary':'primary')}
   for(const [i,[a,b]]of sectionRoofSource.falls.entries())arrow('fall-'+i,a,b)
   text('court',6000,6100,'OPEN COURT','marker');text('court-drain',6000,5550,'Drainage unresolved')
   text('roof-pitch',8500,10300,'25-degree outward fall')
   if(view==='ROOF-WATER'){
    rect('gutter-symbol',-150,-150,12300,12300,false,'datum')
    for(const [i,[x,y]]of sectionRoofSource.outlets.entries()){rect('outlet-'+i,x-100,y-100,200,200);const end=[x===0?-650:x===12000?12650:x,y===0?-650:y===12000?12650:y];arrow('spill-'+i,[x,y],end)}
    text('water-key',6000,-1100,'Dashed: external collection / squares: provisional outlets')
   }else text('roof-key',6000,-1100,'Four pitched fields; no dormers, roof windows or flat roof')
  }
 }
 const yy=-1900;line('scale',9000,yy,12000,yy,'primary');for(let i=0;i<4;i++)line('tick-'+i,9000+i*1000,yy-100,9000+i*1000,yy+100);text('bar',10500,yy-450,'3 m');text('scale-label',700,yy,`1:${scale}`,'marker')
 return scene
}
