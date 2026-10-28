import {layoutFamilySource,createLayoutFamilyScene,type LayoutFamilyView} from './layout-family.js'
import {createLayoutAnalysisScene,type LayoutAnalysisView} from './layout-analysis.js'
import {translateDrawingPrimitive} from '../../publication-drawing-v2/composition.js'
import type {DrawingSceneV2} from '../../publication-drawing-v2/model.js'
export type BookFormat='b5'|'a4'
export const bookProfiles={b5:{width:176,height:250},a4:{width:210,height:297}} as const
export const compositionSource={id:'RH-BOOK-COMPOSITION-01',layoutFamilySource,architectureChanged:false,gutterCriticalExclusionEachSideMm:12,ordinaryScale:100,principalScale:50,locatorScale:500,printAcceptance:false,finalManuscriptSequence:false,synthesis3dAccepted:false}
export const dispositions=[
 {views:['GROUND','FIRST'],decision:'KEEP-PAIR',reason:'Two complete plans at one scale'},
 {views:['PRINCIPAL','LOCATOR'],decision:'MERGE-SPREAD',reason:'Enlarge section to 1:50; locator remains an inset at 1:500'},
 {views:['GROUND-SERVICES','FIRST-SERVICES'],decision:'KEEP-PAIR',reason:'Compare stacked service geography'},
 {views:['ROOF'],decision:'KEEP-PAIR',reason:'Architecture before water and access obligations'},
 {views:['ROOF-WATER','ROOF-FAILURE','EXTERNAL-ACCESS'],decision:'MERGE',reason:'Same roof and unresolved collection/access geography; one obligation reading'},
 {views:['FRONT','REAR','SERVICE','SERVICE-SECTION'],decision:'KEEP-SINGLE',reason:'Distinct architectural or service face/cut'},
 {views:['COURT-ENTRY','COURT-WINDOWS'],decision:'MERGE',reason:'North and south share the same current face geometry'},
 {views:['STRUCTURE'],decision:'OMIT-STANDALONE',reason:'Duplicated partition traces do not establish structure; retain obligations beside service section'},
 {views:['ADAPTATION'],decision:'OMIT-STANDALONE',reason:'Two numbered existing rooms add no proved conversion; retain limitation with plan'},
 {views:['SECTIONAL-ANATOMY'],decision:'WITHHOLD',reason:'Transparent crossings remain weak; no earned current 3D synthesis'}
] as const
export const pageSpecs=[
 {page:1,kind:'intro',title:'Architectural plates — book proof'},
 {page:2,kind:'pair',view:'GROUND',title:'Ground floor',caption:'A centred courtyard and a direct route from entrance to garden. The study and guest WC are existing rooms; one-level conversion remains unproved.'},
 {page:3,kind:'pair',view:'FIRST',title:'First floor',caption:'Four bedrooms around the courtyard. The entrance void opens to the hall below; guarding, edge framing and fire strategy remain unresolved.'},
 {page:4,kind:'spread',title:'Longitudinal section A–A'},
 {page:5,kind:'spread',title:'A–A — continued'},
 {page:6,kind:'pair',view:'GROUND-SERVICES',title:'Ground-floor services',caption:'1 Hot-water reserve. 2 Dry plant. 3 Stacked riser. Dashed space reserves working and replacement access; products and carrying manoeuvres are unverified.'},
 {page:7,kind:'pair',view:'FIRST-SERVICES',title:'Upper-floor services',caption:'Service lining, riser, branch and access-panel reservations. Pipe and duct sizes, crossings and fire-stopping remain unresolved.'},
 {page:8,kind:'pair',view:'ROOF',title:'Roof form',caption:'Twin 25-degree pitches fall inward and outward. There are no flat roofs or roof openings. Storage and roof-work access remain provisional.'},
 {page:9,kind:'pair',view:'ROOF-OBLIGATIONS',title:'Roof water and access',caption:'1 Outer eaves. 2 Courtyard eaves. 3 Courtyard surface. Collection, overflow, discharge and safe maintenance access remain unresolved; dashed lines reserve collection geography.'},
 {page:10,kind:'single',view:'FRONT',title:'Front elevation',caption:'Five bays register the centred entrance and upper hall window. Joinery and profiles are nominal; front privacy treatment remains a separate choice.'},
 {page:11,kind:'single',view:'REAR',title:'Garden elevation',caption:'A centred paired opening links the house to the garden. Four windows align on each floor; the upper central pier receives the bedroom division.'},
 {page:12,kind:'single',view:'COURT-ENTRY',title:'Courtyard — north and south',caption:'Both faces share this aperture arrangement: a paired entrance below two windows. Roof collection and envelope closures remain unresolved.'},
 {page:13,kind:'single',view:'SERVICE',title:'Service-side elevation',caption:'The independent plant replacement opening remains in the east wall. Equipment selection, withdrawal manoeuvres and roof-work method remain unresolved.'},
 {page:14,kind:'single',view:'SERVICE-SECTION',title:'Service section B–B',caption:'Plant and upper wet rooms share the eastern riser. Floor bands reserve assembly depth; framing, support and penetrations are unverified. Roof also falls perpendicular to the cut. Bearing roles, stair framing, lintels and foundations require technical design.'}
] as const
const furniture=new Set(['scope','clearances','key','height-scope','ridge-key','framing-key','riser-key','foundation-key'])
const oldKeys=(id:string)=>furniture.has(id)||id.startsWith('analysis-key-')
function sourceScene(view:Exclude<typeof pageSpecs[number],{kind:'intro'|'spread'}>['view']):DrawingSceneV2{
 if(view==='ROOF-OBLIGATIONS'){
  const s=createLayoutAnalysisScene('ROOF-FAILURE',100)
  // Existing water and access readings have the same roof substrate. Caption carries the merged obligations.
  s.primitives=s.primitives.filter(q=>!oldKeys(q.id));return s
 }
 return view==='GROUND-SERVICES'||view==='FIRST-SERVICES'?createLayoutAnalysisScene(view,100):createLayoutFamilyScene(view,100)
}
export function createBookPageScene(page:number,format:BookFormat):DrawingSceneV2|null{
 const spec=pageSpecs.find(s=>s.page===page);if(!spec)throw Error('Unknown book page')
 if(spec.kind==='intro'||spec.kind==='spread')return null
 const profile=bookProfiles[format],side=page%2===0?'left':'right',source=sourceScene(spec.view),left=side==='left'?profile.width-23.5-145:23.5
 const scene={...source,widthMm:profile.width,heightMm:profile.height,sourceId:compositionSource.id,viewId:`BOOK-${format}-${page}`,title:spec.title,primitives:source.primitives.filter(q=>!oldKeys(q.id)).map(q=>translateDrawingPrimitive(q,left,28))}
 return scene
}
export function createBookSectionSpread(format:BookFormat):DrawingSceneV2{
 const {width:w,height:h}=bookProfiles[format],source=createLayoutFamilyScene('PRINCIPAL',50),shellStart=w-122,dx=shellStart-90,dy=h-438
 const removed=new Set(['open-court','ridge-key','framing-key','riser-key','foundation-key','scale','bar','scale-label','tick-0','tick-1','tick-2','tick-3'])
 const primitives=source.primitives.filter(q=>!removed.has(q.id)).map(q=>translateDrawingPrimitive(q,dx,dy))
 const text=(id:string,x:number,y:number,value:string,role:'note'|'marker'='note')=>primitives.push({kind:'text',id,x,y,value,role,anchor:'middle'})
 const line=(id:string,x:number,y:number,xx:number,yy:number)=>primitives.push({kind:'line',id,a:{x,y},b:{x:xx,y:yy},role:'secondary'})
 const box=(id:string,x:number,y:number,width:number,height:number)=>primitives.push({kind:'rect',id,x,y,width,height,stroke:'secondary',fill:'none'})
 const d=layoutFamilySource.design,k=1/500,loc={x:24,y:30}
 box('locator-shell',loc.x,loc.y,d.shell*k,d.shell*k);box('locator-court',loc.x+d.court.x*k,loc.y+(d.shell-d.court.y-d.court.depth)*k,d.court.width*k,d.court.depth*k)
 const cut=loc.x+layoutFamilySource.cuts.A*k;line('locator-cut',cut,loc.y-1,cut,loc.y+d.shell*k+1);text('locator-a',cut,loc.y-3,'A','marker');text('locator-aa',cut,loc.y+d.shell*k+4,'A','marker');text('locator-scale',36,loc.y+d.shell*k+9,'1:500');text('locator-north',24,loc.y-4,'N ↑','marker')
 const sx=w+62,sy=h-23;line('spread-scale',sx,sy,sx+60,sy);for(let i=0;i<4;i++)line('spread-scale-tick-'+i,sx+i*20,sy-1.5,sx+i*20,sy+1.5)
 text('spread-bar',sx+30,sy+8,'3 m');text('spread-ratio',w+38,sy,'1:50','marker')
 text('spread-note-1',84,h-20,'Provisional support and guarding;')
 text('spread-note-2',84,h-16,'engineering and fire strategy unresolved.')
 return {...source,widthMm:2*w,heightMm:h,viewId:`BOOK-SECTION-SPREAD-${format}`,sourceId:compositionSource.id,title:'Longitudinal section A–A',description:'Canonical 1:50 composition with 1:500 locator; two physical crops; 12 mm critical exclusion each side of fold.',primitives}
}
