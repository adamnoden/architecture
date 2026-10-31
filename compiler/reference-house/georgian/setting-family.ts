import {layoutRevision as design,revisionOpenings} from './layout-revision.js'
import {createPlanPaperProjection} from '../../publication-drawing/projection.js'
import type {DrawingSceneV2,DrawingDashRole} from '../../publication-drawing-v2/model.js'

/** A retained theoretical width, never a site, boundary or access-method result. */
export const settingSource={
 id:'RH-CURRENT-SETTING-02',designId:design.id,shell:design.shell,court:design.court,
 surrogateWidth:15500,sideClearance:(15500-design.shell)/2,
 provenance:['docs/reference-house/external-access-maintenance-plan.md','docs/reference-house/layout-revision-02.md'],
 absences:['plot-depth','legal-boundary','road','neighbours','geographic-north','ground-capacity','equipment-method','drainage-discharge'],
 accessVerified:false,realSite:false,physicalAcceptance:false
} as const
export type SettingView='SETTING'|'EXTERNAL-OBLIGATIONS'

export function createCurrentSettingScene(view:SettingView,scale:200|100):DrawingSceneV2{
 const book=scale===200,w=book?145:420,h=book?190:594,k=1/scale,
  origin=book?{x:42.5,y:40}:{x:150,y:190},
  p=createPlanPaperProjection({scaleDenominator:scale,modelBounds:{x:0,y:0,width:design.shell,height:design.shell},paperOrigin:origin})
 const scene:DrawingSceneV2={widthMm:w,heightMm:h,sourceId:settingSource.id,viewId:`CURRENT-${view}-${scale}`,title:view==='SETTING'?'Theoretical setting':'External access obligations',description:'Current house within the retained approximate width stress test. No legal boundary, plot depth, site orientation or proved access method.',scaleDenominator:scale,primitives:[]}
 const meta={sources:settingSource.provenance.join(','),authority:'provisional',precision:'approximate',realSite:false,accessVerified:false}
 const line=(id:string,x:number,y:number,xx:number,yy:number,dash?:DrawingDashRole)=>scene.primitives.push({kind:'line',id,a:p.point(x,y),b:p.point(xx,yy),role:'secondary',dash,metadata:meta})
 const text=(id:string,x:number,y:number,value:string,role:'note'|'marker'='note')=>scene.primitives.push({kind:'text',id,x,y,value,role,anchor:'middle',metadata:meta})
 const c=design.court
 for(const [id,b]of [['shell',{x:0,y:0,width:design.shell,depth:design.shell}],['court',c]] as const)scene.primitives.push({kind:'rect',id,...p.rect({x:b.x,y:b.y,width:b.width,height:b.depth}),stroke:id==='shell'?'profile':'primary',fill:'none',metadata:{...meta,meaning:'current-house-geometry'}})
 const side=settingSource.sideClearance,west=-side,east=design.shell+side
 // Open ends deliberately avoid making a closed plot polygon.
 for(const [id,x]of [['west',west],['east',east]] as const)line('surrogate-'+id,x,-1200,x,design.shell+1200,'provisional')
 line('surrogate-width',west,design.shell+2400,east,design.shell+2400,'provisional')
 for(const x of [west,east])line('width-tick-'+x,x,design.shell+2100,x,design.shell+2700,'provisional')
 text('surrogate-width-label',w/2,origin.y-16,'≈15.5 m theoretical width','marker')
 text('rear-continuation',w/2,origin.y-5,'Rear / garden continuation unknown')
 text('front-continuation',w/2,origin.y+design.shell*k+8,'Model front; geographic north unassigned')
 text('court-label',w/2,origin.y+design.shell*k/2,'Open court','marker')
 text('court-width',w/2,origin.y+design.shell*k/2+5,'3.5 × 3.5 m')
 text('west-clearance',origin.x-side*k/2,origin.y+design.shell*k/2,'≈1.75 m')
 text('east-clearance',origin.x+(design.shell+side/2)*k,origin.y+design.shell*k/2,'≈1.75 m')
 if(view==='EXTERNAL-OBLIGATIONS'){
  const plant=revisionOpenings('GROUND').find(o=>o.wall==='outer-east'&&o.kind==='door')!
  // Aperture extent is sourced; a handling corridor, tower or ladder is not.
  line('plant-opening',design.shell+400,plant.centre-plant.width/2,design.shell+400,plant.centre+plant.width/2)
  for(const [i,y]of [plant.centre-plant.width/2,plant.centre+plant.width/2].entries())line('plant-opening-tick-'+i,design.shell+200,y,design.shell+600,y)
  text('plant-marker',origin.x+design.shell*k+6,origin.y+(design.shell-plant.centre)*k,'1','marker')
  text('court-marker',w/2,origin.y+design.shell*k/2+11,'2','marker')
  text('west-marker',origin.x-side*k-4,origin.y+15,'3','marker')
  text('east-marker',origin.x+(design.shell+side)*k+4,origin.y+15,'3','marker')
 }
 const y=book?134:390,dy=book?5:7
 const rows=view==='SETTING'?[
  'Theoretical width only; the house remains 12 × 12 m.',
  'Side clearances are gross residual space, not proved working widths.',
  'No plot depth, legal boundary, road or neighbouring building is drawn.',
  'No real-site orientation, levels, utilities or ground conditions are selected.'
 ]:[
  '1 Plant opening: equipment withdrawal and carrying remain unverified.',
  '2 Court: access, roof collection and overflow remain unresolved.',
  '3 Outer faces: support ground, working method and protection unselected.',
  'Residual side space does not prove scaffold, tower or vehicle access.'
 ]
 rows.forEach((s,i)=>text('key-'+i,w/2,y+i*dy,s))
 const sx=book?60:185,sy=book?173:475,len=5000*k
 scene.primitives.push({kind:'line',id:'scale-bar',a:{x:sx,y:sy},b:{x:sx+len,y:sy},role:'primary'})
 for(const [i,x]of [sx,sx+len].entries())scene.primitives.push({kind:'line',id:'scale-tick-'+i,a:{x,y:sy-1.5},b:{x,y:sy+1.5},role:'secondary'})
 text('scale-label',book?30:120,sy,`1:${scale}`,'marker');text('scale-zero',sx,sy+5,'0');text('scale-distance',sx+len,sy+5,'5 m')
 return scene
}
