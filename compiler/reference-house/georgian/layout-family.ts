import {layoutRevision as design,revisionOpenings,createRevisionScene,entryVoid} from './layout-revision.js'
import type {ElevationView} from './elevations.js'
import {sectionAssemblyModels,sectionAssemblyChoices,sectionProvenance} from './section-source.js'
import {sectionWallToDrawingPrimitives,sectionFloorToDrawingPrimitives} from '../../architectural-drawing/section-assemblies.js'
import {framedApertureToDrawingPrimitives,cutApertureToDrawingPrimitives} from '../../architectural-drawing/aperture-drawing.js'
import {createSectionPaperProjection} from '../../publication-drawing/projection.js'
import {compileCurrentSectionContext} from './section-context.js'
import {spatialSegmentsToDrawingPrimitives} from '../../architectural-drawing/spatial-line-drawing.js'
import type {DrawingSceneV2,DrawingLineRole,DrawingDashRole} from '../../publication-drawing-v2/model.js'

/** One current candidate family; older specimen adapters retain their exact identities. */
export const layoutFamilySource={id:'RH-LAYOUT-FAMILY-02',design,entryVoid,openings:{GROUND:revisionOpenings('GROUND'),FIRST:revisionOpenings('FIRST')},sectionAssemblyChoices,
 cuts:{A:5900,B:10100},roofBuildZone:300,groundReserve:300,
 limitations:['Candidate orthographics, not final BOOK spread composition','Support, lintel and foundation engineering unresolved','Service framing direction and riser crossings unresolved','Roof collection, overflow and maintenance access unresolved','No physical print acceptance or full technical compiler migration']}
export const layoutFamilyViews=['GROUND','FIRST','LOCATOR','PRINCIPAL','SERVICE-SECTION','FRONT','REAR','SERVICE','COURT-ENTRY','COURT-WINDOWS','ROOF','ROOF-WATER'] as const
export type LayoutFamilyView=typeof layoutFamilyViews[number]
const provenance={...sectionProvenance,sourceIds:['docs/publication/architectural-plate-layout-family.md']}
const metadata={sources:provenance.sourceIds.join(','),authority:provenance.authority,precision:provenance.precision,constructionDetailSelected:false}
/** Height of the authored twin-pitched ring, not a generic roof solver. */
export const currentRoofZ=(x:number,y:number)=>roofHeight(Math.min(x,y,design.shell-x,design.shell-y))
const context=(view:string,scale:100|50|25)=>{
 const origin=scale===100?{x:12.5,y:18}:scale===25?{x:57,y:70}:{x:90,y:150}
 const p=createSectionPaperProjection({scaleDenominator:scale,horizontalBounds:{min:0,max:design.shell},verticalBounds:{min:-2400,max:design.shell},paperOrigin:origin})
 const scene:DrawingSceneV2={widthMm:scale===100?145:scale===25?594:420,heightMm:scale===100?190:scale===25?841:594,viewId:`LAYOUT-FAMILY-${view}-${scale}`,sourceId:layoutFamilySource.id,title:view,description:'Coordinated source-owned candidate; technical and physical acceptance limits retained.',scaleDenominator:scale,primitives:[]}
 const line=(id:string,x:number,z:number,xx:number,zz:number,role:DrawingLineRole='secondary',dash?:DrawingDashRole)=>scene.primitives.push({kind:'line',id,a:p.point(x,z),b:p.point(xx,zz),role,dash,metadata})
 const text=(id:string,x:number,z:number,value:string,role:'note'|'label'|'marker'='note')=>scene.primitives.push({kind:'text',id,...p.point(x,z),value,role,anchor:'middle',metadata})
 const box=(id:string,x:number,z:number,w:number,h:number,fill:'none'|'faint'='none',dash?:DrawingDashRole)=>scene.primitives.push({kind:'path',id,rings:[[p.point(x,z),p.point(x+w,z),p.point(x+w,z+h),p.point(x,z+h)]],stroke:'secondary',fill,dash,metadata})
 const finish=()=>{const yy=-1900;line('scale',9000,yy,12000,yy,'primary');for(let i=0;i<4;i++)line('tick-'+i,9000+i*1000,yy-100,9000+i*1000,yy+100);text('bar',10500,yy-450,'3 m');text('scale-label',700,yy,`1:${scale}`,'marker');return scene}
 return {scene,p,line,text,box,finish}
}

export function createLayoutElevation(view:ElevationView,scale:100|50):DrawingSceneV2{
 const {scene,p,line,text,box,finish}=context(view,scale),model=elevationSource(view)
 const top=design.roof.eaves
 line('base',model.min,0,model.max,0,'profile');line('left-edge',model.min,0,model.min,top,'profile');line('right-edge',model.max,0,model.max,top,'profile')
 if(model.court)line('court-eaves',model.min,top,model.max,top,'primary')
 else{
  line('eaves',0,top,design.shell,top,'primary')
  line('roof-left',0,top,design.roof.ridgeInset,roofTop(),'profile')
  line('roof-ridge',design.roof.ridgeInset,roofTop(),design.shell-design.roof.ridgeInset,roofTop(),'profile')
  line('roof-right',design.shell-design.roof.ridgeInset,roofTop(),design.shell,top,'profile')
  line('cornice-lower',0,top-design.facade.corniceDepth,design.shell,top-design.facade.corniceDepth,'primary')
  line('cornice-fascia',0,top-60,design.shell,top-60)
 }
 scene.primitives.push(...layoutAperturePrimitives(view,model.apertures,p))
 let cursor=model.min
 for(const d of model.apertures.filter(a=>a.kind==='door'&&a.level==='GROUND').sort((a,b)=>a.u-b.u)){line('plinth-'+d.id,cursor,150,d.u-d.width/2,150);cursor=d.u+d.width/2}
 line('plinth-end',cursor,150,model.max,150);line('grade',model.min-100,-150,model.max+100,-150)
 for(const [id,z,value]of [['ground',0,'0.00'],['first',design.levels.first,'+3.45'],['eaves',top,'+6.80']] as const){line('level-'+id,model.min-250,z,model.min-50,z);text('datum-'+id,model.min-650,z+90,value)}
 text('height',6000,roofTop()+650,`Ridge +${(roofTop()/1000).toFixed(2)} m / eaves +6.80 m`)
 text('width',6000,-550,`${model.width/1000} m`)
 text('scope',6000,-1100,model.court?'Nominal joinery / profiles; court drainage and detailed closures unresolved':view==='SERVICE'?'Plant replacement door retained; roof-work access unresolved':'Nominal joinery / profiles; ground -150 mm / entrance threshold 0')
 return finish()
}

/** Shared face-on aperture convention. Its drawing plane does not select a frame setback. */
export function layoutAperturePrimitives(view:ElevationView,apertures:ReturnType<typeof elevationSource>['apertures'],p:ReturnType<typeof createSectionPaperProjection>):DrawingSceneV2['primitives']{
 const out:DrawingSceneV2['primitives']=[]
 const model={apertures}
 const line=(id:string,x:number,z:number,xx:number,zz:number,role:DrawingLineRole='secondary')=>out.push({kind:'line',id,a:p.point(x,z),b:p.point(xx,zz),role,dash:undefined,metadata})
 const box=(id:string,x:number,z:number,w:number,h:number)=>out.push({kind:'path',id,rings:[[p.point(x,z),p.point(x+w,z),p.point(x+w,z+h),p.point(x,z+h)]],stroke:'secondary',fill:'none',dash:undefined,metadata})
 for(const a of model.apertures){
  if(a.kind==='window')out.push(...framedApertureToDrawingPrimitives({id:a.id,left:a.u-a.width/2,bottom:a.sill,width:a.width,height:a.head-a.sill,frameInset:design.facade.frameFace,columns:3,rows:4,head:{height:design.facade.headHeight,projection:0},sill:{height:60,projection:design.facade.sillProjection},role:'secondary',outlineRole:'primary',provenance},p))
  else{
   if(view==='FRONT'){
    box(a.id,a.u-a.width/2,a.sill,a.width,a.head-a.sill)
    // Retain the accepted paired six-panel / separate fanlight convention.
    box('entrance-surround',a.u-a.width/2-design.facade.doorSurround,0,a.width+2*design.facade.doorSurround,a.head+180)
    const doorTop=2250,frame=50,fanlightBase=2310
    box('door-frame',a.u-a.width/2+frame,0,a.width-2*frame,fanlightBase)
    box('fanlight-frame',a.u-a.width/2+frame,fanlightBase,a.width-2*frame,480)
    line('door-meeting',a.u,60,a.u,doorTop,'primary');line('fanlight-centre',a.u,fanlightBase,a.u,2790)
    for(const [i,x]of [a.u-820,a.u+80].entries())for(const [j,z]of [180,850,1520].entries())for(const [k,dx]of [70,415].entries())box(`panel-${i}-${j}-${k}`,x+dx,z,255,520)
   }else{
    const joinery=framedApertureToDrawingPrimitives({id:a.id,left:a.u-a.width/2,bottom:a.sill,width:a.width,height:a.head-a.sill,frameInset:design.facade.frameFace,columns:a.leaves,rows:1,role:'secondary',outlineRole:'primary',provenance},p)
    for(const q of joinery)if(q.id===a.id+'-outline')q.id=a.id
    out.push(...joinery)
   }
   line(a.id+'-threshold',a.u-a.width/2-80,a.sill+50,a.u+a.width/2+80,a.sill+50,'primary')
  }
 }
 return out
}

export function createLayoutSection(view:'PRINCIPAL'|'SERVICE-SECTION',scale:100|50|25){
 const {scene,p,line,text,box,finish}=context(view,scale),station=view==='PRINCIPAL'?layoutFamilySource.cuts.A:layoutFamilySource.cuts.B,m=layoutSectionAt(station)
 const distance=Math.min(station,design.shell-station),r=design.roof.ridgeInset,c=design.court
 const roofRanges=m.court?[[-200,c.y+200],[c.y+c.depth-200,design.shell+200]]:[[-200,design.shell+200]]
 // The same source-derived cut profile supplies both the filled section and
 // exact planar occluder faces; neither is an independently invented roof.
 const roofSections=roofRanges.map(([lo,hi],i)=>{
  const run=[lo,...[distance,r,design.shell-r,design.shell-distance].filter(y=>y>lo&&y<hi),hi].sort((a,b)=>a-b).filter((y,i,a)=>i===0||y!==a[i-1])
  const top=run.map(y=>({y,z:currentRoofZ(station,y)}))
  const lower=[...top].reverse().map(q=>({...q,z:q.z-layoutFamilySource.roofBuildZone}))
  return {i,top,lower}
 })
 const roofCutFaces=roofSections.flatMap(section=>section.top.slice(0,-1).map((a,i)=>{
  const b=section.top[i+1],z=layoutFamilySource.roofBuildZone
  return {id:'section-roof-cut-'+section.i+'-'+i,vertices:[
   {x:station,y:a.y,z:a.z},{x:station,y:b.y,z:b.z},
   {x:station,y:b.y,z:b.z-z},{x:station,y:a.y,z:a.z-z}
  ]}
 }))
 // Draw actual background first. Cut construction is subsequently rendered on
 // top, while the 3D visibility compiler has already removed hidden intervals.
 const background=compileCurrentSectionContext({station,roofBuildDepth:layoutFamilySource.roofBuildZone,
  walls:m.walls,cutRoofFaces:roofCutFaces})
 scene.primitives.push(...spatialSegmentsToDrawingPrimitives(background.background,{
  basis:background.basis,paperOrigin:p.point(0,0),paperMmPerModelMm:1/scale,provenance
 }))
 const assemblies=sectionAssemblyModels(m,y=>currentRoofZ(station,y)-layoutFamilySource.roofBuildZone,{firstFloorRuns:m.firstFloorRuns,storageDeckRuns:m.storageDeckRuns})
 for(const w of assemblies.walls)scene.primitives.push(...sectionWallToDrawingPrimitives(w,p))
 for(const f of assemblies.floors){
  if(view==='SERVICE-SECTION'&&f.id.startsWith('first-floor-')){f.seats=undefined;f.layers=f.layers.map(l=>l.id==='joist'?{...l,id:'framing-reserve'}:l)}
  if(m.voidCut&&f.id==='first-floor-0')f.seats=undefined
  const out=sectionFloorToDrawingPrimitives(f,p,sectionAssemblyChoices)
  for(const q of out)q.metadata={...q.metadata,framingDirectionSelected:view==='PRINCIPAL',memberSpanVerified:false}
  scene.primitives.push(...out)
 }
 for(const w of m.walls)for(const h of w.holes){const x=(w.lo+w.hi)/2;scene.primitives.push(...cutApertureToDrawingPrimitives({id:w.id+'-'+h.id,frameLeft:x-30,frameWidth:60,bottom:h.lo,top:h.hi,leafX:x,leafBottom:h.lo+60,leafTop:h.id.endsWith('front-door')?2250:h.hi-60,...(h.id.endsWith('front-door')?{fanlight:[2310,2790] as [number,number]}:{}),threshold:[w.lo,w.hi],provenance},p))}
 for(const [i,w]of m.partitions.entries()){
  box('partition-'+i,w.at-62.5,w.base+(w.door?2850:0),125,w.door?250:3100,'faint')
  if(w.door)scene.primitives.push(...cutApertureToDrawingPrimitives({id:w.id+'-'+w.base,frameLeft:w.at-25,frameWidth:50,bottom:w.base,top:w.base+2850,leafX:w.at,leafBottom:w.base+50,leafTop:w.base+2800,provenance},p))
 }
 for(const roof of roofSections){
  scene.primitives.push({kind:'path',id:'section-roof-'+roof.i,
   rings:[[...roof.top,...roof.lower].map(q=>p.point(q.y,q.z))],
   stroke:'profile',fill:'faint',metadata:{...metadata,representation:'source-derived-roof-trace',flatRoof:false}})
 }
 if(m.court){
  // Hosted apertures and their wall termination come from the visible 3D
  // courtyard facades above; no unsupported free-floating window glyphs.
  text('open-court',6000,7200,'OPEN COURTYARD','marker');line('court-grade',c.y,-150,c.y+c.depth,-150)
 }
 if(m.voidCut){
  const edge=entryVoid.y+entryVoid.depth;line('void-guard',edge,design.levels.first,edge,design.levels.first+1100,'primary')
  text('entrance-void',1600,5050,'Entrance void','label');text('entrance-hall',1800,1600,'Entrance hall','label')
 }
 for(const [i,[a,b]]of m.floorRuns.entries())box('ground-reserve-'+i,a,-layoutFamilySource.groundReserve,b-a,layoutFamilySource.groundReserve,'faint')
 line('grade-left',-400,-150,0,-150);line('grade-right',12000,-150,12400,-150)
 const riser=design.services.riser
 if(station>riser.x&&station<riser.x+riser.width)box('riser-reserve',riser.y,0,riser.depth,design.levels.ceilingFirst,'none','provisional')
 for(const level of ['GROUND','FIRST'] as const){const base=level==='GROUND'?0:design.levels.first
  for(const room of design.rooms[level]){
   const slices=room.boxes.filter(b=>station>b.x&&station<b.x+b.width);if(!slices.length)continue
   const lo=Math.min(...slices.map(b=>b.y)),hi=Math.max(...slices.map(b=>b.y+b.depth)),at=lo<riser.y&&hi>riser.y+riser.depth?(riser.y-lo>hi-riser.y-riser.depth?(lo+riser.y)/2:(riser.y+riser.depth+hi)/2):(lo+hi)/2
   if(room.id==='U-BATH'){text(room.id,at,base+1750,'Family','label');text(room.id+'-second',at,base+1450,'bath','label')}else text(room.id,at,base+1600,room.label,'label')
  }
 }
 for(const [id,z]of [['ground',0],['first',design.levels.first],['ceiling',design.levels.ceilingFirst]] as const){line('level-'+id,-250,z,-50,z);text('datum-'+id,-650,z+90,(z/1000).toFixed(2))}
 text('ridge-key',6000,10500,view==='PRINCIPAL'?'Twin 25-degree pitches; entrance void interrupts first floor':'Roof also falls perpendicular to this cut; no flat field')
 text('framing-key',6000,10000,view==='PRINCIPAL'?'Guard shown schematically; edge framing and fire strategy unresolved':'Floor bands reserve depth; framing direction / support unresolved')
 text('riser-key',6000,9500,view==='PRINCIPAL'?'Nominal wall / floor / head assemblies; engineering unresolved':'Dashed: riser reserve; penetrations and fire-stopping unresolved')
 text('foundation-key',6000,-1350,'Dashed support envelopes: diagram only; foundation type / depth unresolved')
 return finish()
}
function createLocator(scale:100|50){
 const {scene,line,text,box,finish}=context('LOCATOR',scale)
 box('shell',0,0,design.shell,design.shell);box('court',design.court.x,design.court.y,design.court.width,design.court.depth)
 for(const [id,x]of Object.entries(layoutFamilySource.cuts)){line('cut-'+id,x,-200,x,12300,'primary','datum');text(id+'-start',x,-600,id,'marker');text(id+'-end',x,12700,id,'marker')}
 text('court-label',6000,6000,'Courtyard','label');text('legend',6000,-1100,'A: principal / B: service; looking west; north is up')
 return finish()
}
export function createLayoutFamilyScene(view:LayoutFamilyView,scale:100|50):DrawingSceneV2{
 const scene=view==='GROUND'||view==='FIRST'?createRevisionScene(view,scale):view==='LOCATOR'?createLocator(scale):view==='SERVICE-SECTION'||view==='PRINCIPAL'?createLayoutSection(view,scale):view==='ROOF'||view==='ROOF-WATER'?createLayoutRoof(view,scale):createLayoutElevation(view,scale)
 if(view==='ROOF'||view==='ROOF-WATER')for(const q of scene.primitives)if(q.kind==='text'&&q.id==='court')q.id='court-label'
 scene.sourceId=layoutFamilySource.id;scene.viewId=`LAYOUT-FAMILY-${view}-${scale}`
 if(view==='ROOF-WATER')for(const q of scene.primitives)if(q.kind==='text'&&q.id==='key')q.value='Dashed: eaves collection reserve; access / outlets / overflow unresolved'
 return scene
}

/** Cross-section intervals derive from wall faces and apertures of this reviewed source. */
export function layoutSectionAt(x:number){
 const d=design,c=d.court,e=d.envelope,court=x>c.x&&x<c.x+c.width
 const envelope=court?[{id:'outer-south',lo:0,hi:e,top:d.roof.eaves},{id:'court-south',lo:c.y-e,hi:c.y,top:d.roof.courtEaves},{id:'court-north',lo:c.y+c.depth,hi:c.y+c.depth+e,top:d.roof.courtEaves},{id:'outer-north',lo:d.shell-e,hi:d.shell,top:d.roof.eaves}]:[{id:'outer-south',lo:0,hi:e,top:d.roof.eaves},{id:'outer-north',lo:d.shell-e,hi:d.shell,top:d.roof.eaves}]
 const walls=envelope.map(w=>({...w,holes:(['GROUND','FIRST'] as const).flatMap(level=>revisionOpenings(level).filter(o=>o.wall===w.id&&Math.abs(o.centre-x)<o.width/2).map(o=>({id:level+'-'+o.id,kind:o.kind,lo:(level==='GROUND'?0:d.levels.first)+(o.kind==='door'?0:o.sill??750),hi:(level==='GROUND'?0:d.levels.first)+(o.head??2850)})))}))
 const partitions=(['GROUND','FIRST'] as const).flatMap(level=>d.partitions[level].filter(w=>w.a[1]===w.b[1]&&x>w.a[0]&&x<w.b[0]).map(w=>({id:w.id,at:w.a[1],base:level==='GROUND'?0:d.levels.first,door:revisionOpenings(level).some(o=>o.wall===w.id&&Math.abs(o.centre-x)<o.width/2)})))
 const floorRuns=court?[[e,c.y-e],[c.y+c.depth+e,d.shell-e]]:[[e,d.shell-e]]
 const voidCut=x>entryVoid.x&&x<entryVoid.x+entryVoid.width
 const firstFloorRuns=floorRuns.flatMap(([a,b])=>!voidCut||b<=entryVoid.y||a>=entryVoid.y+entryVoid.depth?[[a,b]]:[[a,entryVoid.y],[entryVoid.y+entryVoid.depth,b]].filter(([a,b])=>b>a))
 const storageDeckRuns=floorRuns.map(([a,b])=>[Math.max(a,1000),Math.min(b,d.shell-1000)]).map(([a,b],i)=>court?(i===0?[a,c.y-1000]:[c.y+c.depth+1000,b]):[a,b]).filter(([a,b])=>b>a)
 return {x,court,walls,partitions,floorRuns,firstFloorRuns,storageDeckRuns,voidCut}
}
export const roofHeight=(distance:number)=>design.roof.eaves+Math.min(distance,design.court.x-distance)*Math.tan(design.roof.upperPitchDeg*Math.PI/180)
export const roofTop=()=>roofHeight(design.roof.ridgeInset)
export function elevationSource(view:ElevationView){
 const config={FRONT:{wall:'outer-south',reverse:false,court:false},REAR:{wall:'outer-north',reverse:true,court:false},SERVICE:{wall:'outer-east',reverse:false,court:false},'COURT-ENTRY':{wall:'court-north',reverse:false,court:true},'COURT-WINDOWS':{wall:'court-south',reverse:true,court:true}}[view]
 const min=config.court?design.court.x:0,max=config.court?design.court.x+design.court.width:design.shell
 const apertures=(['GROUND','FIRST'] as const).flatMap(level=>revisionOpenings(level).filter(o=>o.wall===config.wall).map(o=>{const ffl=level==='GROUND'?0:design.levels.first;return {id:level+'-'+o.id,sourceId:o.id,level,kind:o.kind,u:config.reverse?design.shell-o.centre:o.centre,width:o.width,sill:ffl+(o.kind==='door'?0:o.sill??750),head:ffl+(o.head??2850),leaves:o.leaves??1}}))
 return {view,...config,min,max,width:max-min,apertures,sourceId:design.id}
}
function createLayoutRoof(view:'ROOF'|'ROOF-WATER',scale:100|50){
 const {scene,line,text,box,finish}=context(view,scale),c=design.court,r=design.roof.ridgeInset,n=design.shell,far=c.x+c.width
 box('shell',0,0,n,n);box('court',c.x,c.y,c.width,c.depth);box('ridge',r,r,n-2*r,n-2*r)
 for(const [i,[x,y,xx,yy]]of [[0,0,c.x,c.y],[n,0,far,c.y],[n,n,far,c.y+c.depth],[0,n,c.x,c.y+c.depth]].entries())line('hip-'+i,x,y,xx,yy)
 const falls=[[6000,r-400,6000,500],[6000,r+400,6000,c.y-500],[n-r+400,6000,n-500,6000],[n-r-400,6000,far+500,6000],[6000,n-r+400,6000,n-500],[6000,n-r-400,6000,far+500],[r-400,6000,500,6000],[r+400,6000,c.x-500,6000]]
 for(const [i,[x,y,xx,yy]]of falls.entries()){line('fall-'+i,x,y,xx,yy,'primary');const dx=Math.sign(xx-x),dy=Math.sign(yy-y);line('fall-'+i+'-a',xx,yy,xx-dx*180-dy*80,yy-dy*180+dx*80);line('fall-'+i+'-b',xx,yy,xx-dx*180+dy*80,yy-dy*180-dx*80)}
 if(view==='ROOF-WATER')for(const [id,lo,hi]of [['outer',-150,n+150],['inner',c.x+150,far-150]] as const){line(id+'a',lo,lo,hi,lo,'secondary','datum');line(id+'b',hi,lo,hi,hi,'secondary','datum');line(id+'c',hi,hi,lo,hi,'secondary','datum');line(id+'d',lo,hi,lo,lo,'secondary','datum')}
 text('court-label',6000,6100,'OPEN COURT','marker');text('drain',6000,5500,'Surface drainage unresolved');text('key',6000,-1100,view==='ROOF'?'Ridge ring; falls inward and outward; no flat roof':'Dashed: eaves collection reserve; access / outlets / overflow unresolved')
 return finish()
}
