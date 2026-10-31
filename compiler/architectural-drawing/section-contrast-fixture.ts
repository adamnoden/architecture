import {mm} from '../units.js'
import {createSectionPaperProjection} from '../publication-drawing/projection.js'
import type {DrawingSceneV2} from '../publication-drawing-v2/model.js'
import type {AdeProvenance} from './model.js'
import {sectionWallToDrawingPrimitives,sectionFloorToDrawingPrimitives,type SectionWall,type SectionFloor,type SectionLayer} from './section-assemblies.js'
import {cutApertureToDrawingPrimitives} from './aperture-drawing.js'

/** Asymmetric representation fixture, deliberately neither a courtyard nor a house design. */
const provenance:AdeProvenance={sourceIds:['compiler/architectural-drawing/README.md'],authority:'provisional',precision:'approximate'}
const layer=(id:string,depth:number,kind:SectionLayer['kind'],fill:SectionLayer['fill']):SectionLayer=>({id,thickness:{kind:'approximate',value:mm(depth)},kind,fill,stroke:'primary'})
export function sectionContrastModel(shift=0){
 const layers=[layer('outer',90,'material','context'),layer('air',120,'void','none'),layer('inner',160,'material','faint')]
 const walls:SectionWall[]=[{id:'left',left:shift,exteriorFace:'left',layers,base:0,top:[6400,6500],openings:[{id:'window-low',bottom:900,top:2350,head:{depth:180,layerIds:['outer','inner'],closeCavity:true}},{id:'window-high',bottom:3900,top:5450,head:{depth:180,layerIds:['outer','inner'],closeCavity:true}}],substructure:{bottom:-500,reservationProjection:130,reservationHeight:200},provenance},
 {id:'right',left:shift+7400,exteriorFace:'right',layers,base:0,top:[6500,6400],openings:[{id:'door',bottom:0,top:2500,head:{depth:180,layerIds:['outer','inner'],closeCavity:true}}],substructure:{bottom:-500,reservationProjection:130,reservationHeight:200},provenance}]
 const floors:SectionFloor[]=[3000,6100].map((top,i)=>({id:'floor-'+i,left:shift+370,right:shift+7400,top,layers:[
  {...layer('finish',16,'material','faint'),stroke:'secondary',endGap:0},
  {...layer('deck',24,'material','faint'),stroke:'secondary',endGap:0},
  {...layer('timber',210,'material','none'),endGap:35},
  {...layer('void',36,'void','none'),endGap:0},
  {...layer('lining',14,'material','faint'),endGap:0}],seats:{underLayerId:'timber',projection:110,depth:25},provenance}))
 return {walls,floors}
}
export function createSectionContrastScene(scale:100|50):DrawingSceneV2{
 const origin=scale===100?{x:12.5,y:18}:{x:90,y:150},p=createSectionPaperProjection({scaleDenominator:scale,horizontalBounds:{min:0,max:12000},verticalBounds:{min:-2400,max:12000},paperOrigin:origin}),m=sectionContrastModel()
 const primitives=m.walls.flatMap(w=>sectionWallToDrawingPrimitives(w,p))
 for(const f of m.floors)primitives.push(...sectionFloorToDrawingPrimitives(f,p,{minimumBoundarySpacingMm:.25}))
 primitives.push(...cutApertureToDrawingPrimitives({id:'contrast-door',frameLeft:7580,frameWidth:50,bottom:0,top:2500,leafX:7605,leafBottom:40,leafTop:2450,threshold:[7300,7850],provenance},p))
 const text=(id:string,x:number,z:number,value:string)=>primitives.push({kind:'text',id,...p.point(x,z),value,role:'note',anchor:'middle'})
 text('title',6000,10000,'Asymmetric engine fixture; no courtyard or house-specific dimensions')
 text('scope',6000,9500,'Representation proof only; dashed support envelopes are not foundations')
 const yy=-1900
 primitives.push({kind:'line',id:'scale',a:p.point(9000,yy),b:p.point(12000,yy),role:'primary'})
 for(let i=0;i<4;i++)primitives.push({kind:'line',id:'tick-'+i,a:p.point(9000+i*1000,yy-100),b:p.point(9000+i*1000,yy+100),role:'primary'})
 text('bar',10500,yy-450,'3 m');primitives.push({kind:'text',id:'scale-label',...p.point(700,yy),value:`1:${scale}`,role:'marker',anchor:'middle'})
 return {widthMm:scale===100?145:420,heightMm:scale===100?190:594,viewId:'SECTION-CONTRAST-'+scale,sourceId:'ADE-SECTION-CONTRAST-01',title:'Section contrast',description:'Non-house asymmetric proof of shared section representation',scaleDenominator:scale,primitives}
}
