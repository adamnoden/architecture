import {createOrthographicScene,orthographicSource,currentRoofZ} from './orthographic-family.js'
import {design} from './section-exemplar.js'
import {createPlanPaperProjection} from '../../publication-drawing/projection.js'
import {spatialSegmentsToDrawingPrimitives,type SpatialSegment} from '../../architectural-drawing/spatial-line-drawing.js'
import type {DrawingSceneV2,DrawingLineRole,DrawingDashRole} from '../../publication-drawing-v2/model.js'
import type {Box} from './source.js'
export const analysisViews=['GROUND-SERVICES','FIRST-SERVICES','STRUCTURE','ROOF-FAILURE','EXTERNAL-ACCESS','ADAPTATION','SECTIONAL-ANATOMY'] as const
export type AnalysisView=typeof analysisViews[number]
export const analysisSource={id:'RH-ANALYSIS-SYNTHESIS-01',orthographicSource,cutY:design.court.y,retainedSide:'north',structureVerified:false,drainageSized:false,maintenanceAccessVerified:false,adaptationApproved:false,axon:{kind:'open-line-sectional-anatomy',scale:'NTS',bookFactor:.0068,wallFactor:.0136},scope:'Source-supported spatial obligations; no old technical compiler results reused'}
const provenance={sourceIds:['docs/publication/architectural-plate-analysis-synthesis.md'],authority:'provisional' as const,precision:'approximate' as const}
const metadata={sources:provenance.sourceIds.join(','),authority:provenance.authority,precision:provenance.precision,technicalDesignSelected:false}
export function createAnalysisScene(view:AnalysisView,scale:100|50):DrawingSceneV2{
 if(view==='SECTIONAL-ANATOMY')return createSectionalAnatomy(scale)
 const level=view==='FIRST-SERVICES'?'FIRST':'GROUND',isRoof=view==='ROOF-FAILURE'||view==='EXTERNAL-ACCESS',scene=createOrthographicScene(isRoof?'ROOF-WATER':level,scale)
 const origin=isRoof?(scale===100?{x:12.5,y:18}:{x:90,y:150}):(scale===100?{x:22,y:20}:{x:90,y:150}),p=createPlanPaperProjection({scaleDenominator:scale,modelBounds:{x:0,y:0,width:12000,height:12000},paperOrigin:origin})
 // Keep the substrate geometry exactly; replace only its lower explanatory field.
 scene.primitives=scene.primitives.filter(q=>!(q.kind==='text'&&['upper-service-key','stair-scope','key','drain'].includes(q.id)))
 const line=(id:string,x:number,y:number,xx:number,yy:number,role:DrawingLineRole='primary',dash?:DrawingDashRole)=>scene.primitives.push({kind:'line',id:'analysis-'+id,a:p.point(x,y),b:p.point(xx,yy),role,dash,metadata})
 const box=(id:string,b:Box)=>{const q=p.rect({x:b.x,y:b.y,width:b.width,height:b.depth});scene.primitives.push({kind:'rect',id:'analysis-'+id,...q,stroke:'primary',fill:'none',dash:'provisional',metadata:{...metadata,meaning:'spatial-reservation'}})}
 const text=(id:string,x:number,y:number,value:string,role:'note'|'marker'='note')=>scene.primitives.push({kind:'text',id:'analysis-'+id,...p.point(x,y),value,role,anchor:'middle',metadata})
 const key=(rows:string[])=>rows.forEach((s,i)=>text('key-'+i,6000,-650-i*400,s))
 const s=design.services
 if(view==='GROUND-SERVICES'){
  box('plant-working',s.plantWorking);box('water',s.plantWater);box('dry',s.plantDry)
  text('water-no',10212,3350,'1','marker');text('dry-no',10550,7600,'2','marker');text('riser-no',9850,6500,'3','marker')
  key(['1: hot-water reserve / 2: dry plant reserve / 3: stacked riser','Dashed: working and replacement aisle; side door provides the opening','Products, carrying manoeuvres and service connections remain unverified'])
 }else if(view==='FIRST-SERVICES'){
  box('lining',s.upperLining)
  for(const [i,panel]of s.panels.entries()){line('panel-'+i,panel.x,panel.y-panel.width/2,panel.x,panel.y+panel.width/2,'primary','provisional')}
  key(['Dashed: service lining, riser, branch and authored access panels','Wet rooms share eastern service geography; branches are route reservations','Pipe / duct sizes, floor crossings and fire-stopping remain unresolved'])
 }else if(view==='STRUCTURE'){
  // Gross geometry is known. Actual reaction topology and joist orientation are not.
  for(const [i,w]of design.partitions.GROUND.entries())line('partition-'+i,w.a[0],w.a[1],w.b[0],w.b[1],'secondary','provisional')
  key(['Envelope and internal partition geography only; no structural span arrows','Outer-to-courtyard face spacing is 4.20 m gross, not a clear span','Bearing roles, joist direction, stair framing and foundations unverified'])
 }else if(view==='ROOF-FAILURE'){
  for(const [id,x,y]of [['outer',6000,12300],['court',6000,8000]] as const){text(id+'-mark',x,y,id==='outer'?'1':'2','marker')}
  text('court-key',6000,5650,'3','marker')
  key(['1: outer eaves / 2: courtyard eaves collection / 3: courtyard surface','Falls follow the current pitched fields; dashed collection is a reserve','Outlet / overflow locations, capacities and discharge routes unresolved'])
 }else if(view==='EXTERNAL-ACCESS'){
  text('outer',6000,12500,'1','marker');text('inner',6000,8000,'2','marker')
  key(['1: outer eaves / 2: courtyard eaves require maintainable access','No roof openings or standing attic; hatch and roof-work method unresolved','No ladder, platform, fall protection or real-site access route selected'])
 }else{
  const study=design.rooms.GROUND.find(r=>r.id==='G-STUDY')!,wc=design.rooms.GROUND.find(r=>r.id==='G-WC')!
  text('study-no',study.at[0]+500,study.at[1]-1400,'1','marker');text('wc-no',wc.at[0]-400,wc.at[1]-800,'2','marker')
  key(['1: ground-floor study / 2: existing guest WC are adaptation starting points','Internal partition geography is explicit; alteration is not approved','Bedroom / shower conversion, access and structure require a new source decision'])
 }
 scene.sourceId=analysisSource.id;scene.viewId=`ANALYSIS-${view}-${scale}`;scene.title=view;scene.description=analysisSource.scope
 return scene
}
export function sectionalAnatomySegments():SpatialSegment[]{
 const out:SpatialSegment[]=[],cut=design.court.y,far=design.court.y+design.court.depth,wide=design.shell
 const add=(id:string,a:number[],b:number[],role:DrawingLineRole,meaning:string,dash?:DrawingDashRole)=>out.push({id,a:{x:a[0],y:a[1],z:a[2]},b:{x:b[0],y:b[1],z:b[2]},role,meaning,dash})
 const footprint=[[0,cut],[4200,cut],[4200,far],[7800,far],[7800,cut],[wide,cut],[wide,wide],[0,wide]]
 for(const [name,z]of [['ground',0],['first',design.levels.first],['ceiling',design.levels.ceilingFirst]] as const)for(let i=0;i<footprint.length;i++){
  const a=footprint[i],b=footprint[(i+1)%footprint.length],onCut=a[1]===cut&&b[1]===cut
  add(name+'-'+i,[...a,z],[...b,z],onCut?'profile':name==='ceiling'?'secondary':'primary',onCut?'section-cut-datum':'level-boundary-order')
 }
 for(const [i,q]of footprint.entries())add('vertical-'+i,[...q,0],[...q,design.levels.ceilingFirst],q[1]===cut?'profile':'secondary','enclosure-boundary-order')
 // Retained roof network: clip at the same south-court edge, never restore the removed south wing.
 const roofLines=[[[0,cut],[0,12000]],[[0,12000],[12000,12000]],[[12000,12000],[12000,cut]],[[4200,cut],[4200,7800]],[[4200,7800],[7800,7800]],[[7800,7800],[7800,cut]],[[2100,cut],[2100,9900]],[[2100,9900],[9900,9900]],[[9900,9900],[9900,cut]],[[0,12000],[2100,9900]],[[2100,9900],[4200,7800]],[[12000,12000],[9900,9900]],[[9900,9900],[7800,7800]]]
 for(const [i,[a,b]]of roofLines.entries())add('roof-'+i,[...a,currentRoofZ(a[0],a[1])],[...b,currentRoofZ(b[0],b[1])],'secondary','pitched-roof-edge-or-ridge')
 for(const x0 of [0,7800]){const points=[x0,x0+2100,x0+4200];for(let i=0;i<2;i++)add('cut-roof-'+x0+'-'+i,[points[i],cut,currentRoofZ(points[i],cut)],[points[i+1],cut,currentRoofZ(points[i+1],cut)],'profile','section-roof-trace')}
 const r=design.services.riser,corners=[[r.x,r.y],[r.x+r.width,r.y],[r.x+r.width,r.y+r.depth],[r.x,r.y+r.depth]]
 for(const [i,a]of corners.entries()){const b=corners[(i+1)%4];for(const z of [0,design.levels.ceilingFirst])add('riser-'+i+'-'+z,[...a,z],[...b,z],'secondary','riser-reservation','provisional');add('riser-v-'+i,[...a,0],[...a,design.levels.ceilingFirst],'secondary','riser-reservation','provisional')}
 return out
}
function createSectionalAnatomy(scale:100|50):DrawingSceneV2{
 const book=scale===100,k=book?analysisSource.axon.bookFactor:analysisSource.axon.wallFactor,primitives=spatialSegmentsToDrawingPrimitives(sectionalAnatomySegments(),{basis:{horizontal:[1/Math.sqrt(2),1/Math.sqrt(2),0],vertical:[-1/Math.sqrt(6),1/Math.sqrt(6),2/Math.sqrt(6)],viewDirection:[1/Math.sqrt(3),-1/Math.sqrt(3),1/Math.sqrt(3)]},paperOrigin:book?{x:-8,y:135}:{x:49,y:400},paperMmPerModelMm:k,provenance})
 const text=(id:string,x:number,y:number,value:string,role:'note'|'marker'='note')=>primitives.push({kind:'text',id,x,y,value,role,anchor:'middle',metadata})
 const x=book?72.5:210,y=book?20:170,dy=book?5:6
 text('title',x,y,'Section at south courtyard edge; retained north portion')
 text('reading',x,y+dy,'Open line anatomy: levels, courtyard, twin roof and riser reserve')
 text('limits',x,y+2*dy,'No opaque wall solids, joinery or hidden-line removal')
 text('nts',x,book?173:475,'NTS','marker');text('scope',x,book?179:482,'Fixed parallel projection; floor/support and service detail unverified')
 return {widthMm:book?145:420,heightMm:book?190:594,sourceId:analysisSource.id,viewId:'ANALYSIS-SECTIONAL-ANATOMY-'+scale,title:'Sectional anatomy',description:'Source-derived open line synthesis, not a solid model or structural result.',scaleDenominator:'NTS',primitives}
}
