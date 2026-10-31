import {createLayoutFamilyScene,layoutFamilySource} from './layout-family.js'
import {layoutRevision as design} from './layout-revision.js'
import {createPlanPaperProjection} from '../../publication-drawing/projection.js'
import type {DrawingSceneV2,DrawingLineRole,DrawingDashRole} from '../../publication-drawing-v2/model.js'
import type {Box} from './source.js'
export const layoutAnalysisViews=['GROUND-SERVICES','FIRST-SERVICES','STRUCTURE','ROOF-FAILURE','EXTERNAL-ACCESS','ADAPTATION'] as const
export type LayoutAnalysisView=typeof layoutAnalysisViews[number]
export const layoutAnalysisSource={id:'RH-LAYOUT-ANALYSIS-02',layoutFamilySource,structureVerified:false,drainageSized:false,maintenanceAccessVerified:false,adaptationApproved:false,synthesisAccepted:false,scope:'Source-supported spatial obligations; no old technical compiler results reused'}
const provenance={sourceIds:['docs/publication/architectural-plate-layout-family.md'],authority:'provisional' as const,precision:'approximate' as const}
const metadata={sources:provenance.sourceIds.join(','),authority:provenance.authority,precision:provenance.precision,technicalDesignSelected:false}
export function createLayoutAnalysisScene(view:LayoutAnalysisView,scale:100|50):DrawingSceneV2{
 const level=view==='FIRST-SERVICES'?'FIRST':'GROUND',isRoof=view==='ROOF-FAILURE'||view==='EXTERNAL-ACCESS',scene=createLayoutFamilyScene(isRoof?'ROOF-WATER':level,scale)
 const origin=isRoof?(scale===100?{x:12.5,y:18}:{x:90,y:150}):(scale===100?{x:22,y:20}:{x:90,y:150}),p=createPlanPaperProjection({scaleDenominator:scale,modelBounds:{x:0,y:0,width:12000,height:12000},paperOrigin:origin})
 // Keep the substrate geometry exactly; replace only its lower explanatory field.
 scene.primitives=scene.primitives.filter(q=>!(q.kind==='text'&&['upper-service-key','stair-scope','key','drain','scope','clearances'].includes(q.id)))
 const line=(id:string,x:number,y:number,xx:number,yy:number,role:DrawingLineRole='primary',dash?:DrawingDashRole)=>scene.primitives.push({kind:'line',id:'analysis-'+id,a:p.point(x,y),b:p.point(xx,yy),role,dash,metadata})
 const box=(id:string,b:Box)=>{const q=p.rect({x:b.x,y:b.y,width:b.width,height:b.depth});scene.primitives.push({kind:'rect',id:'analysis-'+id,...q,stroke:'primary',fill:'none',dash:'provisional',metadata:{...metadata,meaning:'spatial-reservation'}})}
 const text=(id:string,x:number,y:number,value:string,role:'note'|'marker'='note')=>scene.primitives.push({kind:'text',id:'analysis-'+id,...p.point(x,y),value,role,anchor:'middle',metadata})
 const key=(rows:string[])=>rows.forEach((s,i)=>text('key-'+i,6000,-650-i*400,s))
 const s=design.services
 if(view==='GROUND-SERVICES'){
  box('plant-working',s.plantWorking);box('water',s.plantWater);box('dry',s.plantDry)
  text('water-no',s.plantWater.x+s.plantWater.width/2,s.plantWater.y+s.plantWater.depth/2,'1','marker');text('dry-no',s.plantDry.x+s.plantDry.width/2,s.plantDry.y+s.plantDry.depth/2,'2','marker');box('riser',s.riser);text('riser-no',s.riser.x+s.riser.width/2,s.riser.y+s.riser.depth/2,'3','marker')
  key(['1: hot-water reserve / 2: dry plant reserve / 3: stacked riser','Dashed: working and replacement aisle; side door provides the opening','Products, carrying manoeuvres and service connections remain unverified'])
 }else if(view==='FIRST-SERVICES'){
  box('lining',s.upperLining);box('riser',s.riser)
  for(let i=0;i<s.guestEnsuiteBranch.length-1;i++){const a=s.guestEnsuiteBranch[i],b=s.guestEnsuiteBranch[i+1];line('branch-'+i,a[0],a[1],b[0],b[1],'primary','provisional')}
  for(const [i,panel]of s.panels.entries()){line('panel-'+i,panel.x,panel.y-panel.width/2,panel.x,panel.y+panel.width/2,'primary','provisional')}
  key(['Dashed: service lining, riser, branch and authored access panels','Wet rooms share eastern service geography; branches are route reservations','Pipe / duct sizes, floor crossings and fire-stopping remain unresolved'])
 }else if(view==='STRUCTURE'){
  // Gross geometry is known. Actual reaction topology and joist orientation are not.
  for(const [i,w]of design.partitions.GROUND.entries())line('partition-'+i,w.a[0],w.a[1],w.b[0],w.b[1],'secondary','provisional')
  key(['Envelope and internal partition geography only; no structural span arrows','Outer-to-courtyard face spacing is 4.25 m gross, not a clear span','Bearing roles, joist direction, stair framing and foundations unverified'])
 }else if(view==='ROOF-FAILURE'){
  for(const [id,x,y]of [['outer',6000,12300],['court',6000,7900]] as const){text(id+'-mark',x,y,id==='outer'?'1':'2','marker')}
  text('court-key',6000,5650,'3','marker')
  key(['1: outer eaves / 2: courtyard eaves collection / 3: courtyard surface','Falls follow the current pitched fields; dashed collection is a reserve','Outlet / overflow locations, capacities and discharge routes unresolved'])
 }else if(view==='EXTERNAL-ACCESS'){
  text('outer',6000,12500,'1','marker');text('inner',6000,7900,'2','marker')
  key(['1: outer eaves / 2: courtyard eaves require maintainable access','No roof openings or standing attic; hatch and roof-work method unresolved','No ladder, platform, fall protection or real-site access route selected'])
 }else{
  const study=design.rooms.GROUND.find(r=>r.id==='G-STUDY')!,wc=design.rooms.GROUND.find(r=>r.id==='G-WC')!
  text('study-no',study.at[0],study.at[1]-700,'1','marker');text('wc-no',wc.at[0],wc.at[1]-700,'2','marker')
  key(['1: ground-floor study / 2: existing guest WC are adaptation starting points','Internal partition geography is explicit; alteration is not approved','Bedroom / shower conversion, access and structure require a new source decision'])
 }
 scene.sourceId=layoutAnalysisSource.id;scene.viewId=`LAYOUT-ANALYSIS-${view}-${scale}`;scene.title=view;scene.description=layoutAnalysisSource.scope
 return scene
}
