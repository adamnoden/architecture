import {design, openings, roofTop} from './source.js'
import type {DrawingSceneV2, DrawingPrimitiveV2} from '../../publication-drawing-v2/model.js'

/** Publication projections of the accepted drawing source. No technical successor claim. */
export const elevationViews = ['FRONT', 'REAR', 'SERVICE', 'COURT-ENTRY', 'COURT-WINDOWS'] as const
export type ElevationView = typeof elevationViews[number]
const configuration = {
 FRONT: {title:'Front elevation', wall:'outer-south', reverse:false, court:false},
 REAR: {title:'Garden elevation', wall:'outer-north', reverse:true, court:false},
 SERVICE: {title:'Service-side elevation', wall:'outer-east', reverse:false, court:false},
 'COURT-ENTRY': {title:'Courtyard north elevation', wall:'court-north', reverse:false, court:true},
 'COURT-WINDOWS': {title:'Courtyard south elevation', wall:'court-south', reverse:true, court:true}
} as const

export function elevationSource(view:ElevationView) {
 const c=configuration[view],min=c.court?design.court.x:0,max=c.court?design.court.x+design.court.width:design.shell
 const project=(x:number)=>c.reverse?design.shell-x:x
 const apertures=(['GROUND','FIRST'] as const).flatMap(level=>openings(level).filter(o=>o.wall===c.wall).map(o=>{
  const ffl=level==='GROUND'?design.levels.ground:design.levels.first
  const sill=ffl+(o.kind==='door'?0:o.sill??750),head=ffl+(o.head??2850)
  return {id:`${level}-${o.id}`,sourceId:o.id,level,kind:o.kind,u:project(o.centre),width:o.width,sill,head,leaves:o.leaves??1}
 }))
 return {view,...c,min,max,width:max-min,apertures,sourceId:design.id,
  // Only front and rear dormer faces have controlled projection extents.
  dormers:c.court||view==='SERVICE'?[]:design.roof.dormerAxes.map((axis,i)=>({
   id:`dormer-${i}`,u:project(axis),width:design.roof.dormerWidth,
   sill:view==='REAR'&&i===2?design.levels.attic:design.roof.dormerSill,
   head:design.roof.dormerHead,apex:design.roof.dormerApex,access:view==='REAR'&&i===2
  }))}
}

export function createGeorgianElevation(view:ElevationView,scale:100|50):DrawingSceneV2 {
 const model=elevationSource(view),origin=scale===100?{x:12.5,y:18}:{x:90,y:150}
 const p=(u:number,z:number)=>({x:origin.x+u/scale,y:origin.y+(design.shell-z)/scale})
 const metadata={sources:'docs/reference-house/georgian-replan.md',authority:'provisional',precision:'approximate',constructionDetailSelected:false}
 const primitives:DrawingPrimitiveV2[]=[]
 const scene:DrawingSceneV2={widthMm:scale===100?145:420,heightMm:scale===100?190:594,viewId:`PLT-ELEVATION-${view}-${scale}`,title:model.title,sourceId:design.id,scaleDenominator:scale,
  description:'Source-derived elevation candidate; nominal apertures and roof envelope. No selected frame, flashing or structural detail.',primitives}
 const line=(id:string,u:number,z:number,v:number,w:number,role:'profile'|'primary'|'secondary'='secondary')=>primitives.push({kind:'line',id,a:p(u,z),b:p(v,w),role,metadata})
 const text=(id:string,u:number,z:number,value:string,role:'note'|'label'|'marker'='note')=>{const q=p(u,z);primitives.push({kind:'text',id,...q,value,role,anchor:'middle',metadata})}
 const rect=(id:string,u:number,z:number,width:number,height:number,role:'profile'|'primary'|'secondary'='secondary')=>{const q=p(u,z+height);primitives.push({kind:'rect',id,...q,width:width/scale,height:height/scale,stroke:role,fill:'none',metadata})}
 const top=model.court?roofTop():design.roof.eaves
 line('base',model.min,0,model.max,0,'profile')
 line('left-edge',model.min,0,model.min,top,'profile');line('right-edge',model.max,0,model.max,top,'profile')
 // Floor/soffit build-up is not a facade joint. Do not draw storey bands from FFLs.
 if(model.court){line('court-high-edge',model.min,top,model.max,top,'profile')}
 else {
  line('eaves',0,top,design.shell,top,'primary')
  const roof=design.roof
  const points=[[0,roof.eaves],[roof.breakInset,roof.breakZ],[design.court.x,roofTop()],[design.court.x+design.court.width,roofTop()],[design.shell-roof.breakInset,roof.breakZ],[design.shell,roof.eaves]]
  for(let i=0;i<points.length-1;i++)line(`roof-envelope-${i}`,points[i][0],points[i][1],points[i+1][0],points[i+1][1],'profile')
  // Occlude roof-break strokes behind each controlled dormer face.
  let cursor=roof.breakInset
  for(const d of [...model.dormers].sort((a,b)=>a.u-b.u)){line(`roof-break-before-${d.id}`,cursor,roof.breakZ,d.u-d.width/2,roof.breakZ);cursor=d.u+d.width/2}
  line('roof-break-end',cursor,roof.breakZ,design.shell-roof.breakInset,roof.breakZ)
 }
 for(const a of model.apertures){
  rect(a.id,a.u-a.width/2,a.sill,a.width,a.head-a.sill,'primary')
  // Aperture outline + sash convention only: no invented reveal or frame depth.
  if(a.kind==='window'){
   line(a.id+'-meeting',a.u-a.width/2,(a.sill+a.head)/2,a.u+a.width/2,(a.sill+a.head)/2)
   line(a.id+'-division',a.u,a.sill,a.u,a.head)
  }else if(a.leaves===2)line(a.id+'-leaves',a.u,a.sill,a.u,a.head)
 }
 for(const d of model.dormers){
  rect(d.id,d.u-d.width/2,d.sill,d.width,d.head-d.sill,'primary')
  line(d.id+'-gable-left',d.u-d.width/2-100,d.head,d.u,d.apex,'profile')
  line(d.id+'-gable-right',d.u,d.apex,d.u+d.width/2+100,d.head,'profile')
  line(d.id+'-meeting',d.u,d.sill,d.u,d.head)
 }
 // Discrete level ticks, not full-width lines mistaken for built facade bands.
 for(const [name,z]of [['0',design.levels.ground],['+3.45',design.levels.first],['+6.90',design.levels.attic]] as const){
  line('level-'+name,model.min-250,z,model.min-50,z)
  text('datum-'+name,model.min-650,z+90,name)
 }
 text('height',6000,11600,`High roof edge +${(roofTop()/1000).toFixed(2)} m`)
 text('width',6000,-550,`${model.width/1000} m`)
 if(view==='SERVICE')text('scope',6000,-1000,'Roof envelope shown; dormer side returns unresolved')
 if(view==='REAR')text('scope',6000,-1000,'Roof-access platform and protection unresolved')
 if(view==='COURT-WINDOWS')text('scope',6000,-1000,'East and west share this nominal aperture arrangement')
 if(view==='COURT-ENTRY')text('scope',6000,-1000,'North wall viewed from courtyard; grand entrance below')
 const yy=-1900
 line('scale-bar',9000,yy,12000,yy,'primary')
 for(let i=0;i<4;i++)line(`scale-tick-${i}`,9000+i*1000,yy-100,9000+i*1000,yy+100)
 text('scale-label',10500,yy-450,'3 m');text('scale-origin',700,yy,`1:${scale}`,'marker')
 return scene
}
