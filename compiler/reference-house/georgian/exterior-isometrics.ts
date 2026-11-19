import {createHash} from 'node:crypto'
import {layoutRevision as d,revisionOpenings} from './layout-revision.js'
import {layoutFamilySource,layoutAperturePrimitives} from './layout-family.js'
import {roofRingFaces} from './roof-surfaces.js'
import {boundaryMeshEdges} from '../../architectural-drawing/boundary-mesh-edges.js'
import {visibleSpatialSegments} from '../../architectural-drawing/spatial-visibility.js'
import {spatialSegmentsToDrawingPrimitives,type SpatialSegment} from '../../architectural-drawing/spatial-line-drawing.js'
import {createParallelProjection3D,type ModelFace3D,type ModelPoint3D,type ParallelProjectionBasis3D} from '../../publication-drawing/projection-3d.js'
import {createSectionPaperProjection} from '../../publication-drawing/projection.js'
import type {DrawingSceneV2} from '../../publication-drawing-v2/model.js'

export const exteriorViews=['south-west','south-east','north-east','north-west'] as const
export type ExteriorView=typeof exteriorViews[number]
export type ExteriorFormat='b5'|'a4'|'a2'|'svg'
export const exteriorSource={id:'RH-EXTERIOR-ISOMETRICS-01',layoutFamilySource,
 scope:'Complete exterior surface, intact roof and current face-on aperture conventions',
 omissions:['selected frame setback/reveal depth','roof/water products and details','internal construction','site design'],
 roofSelectionFinal:false,constructionAdequacy:false,physicalAcceptance:false,scale:'NTS',
 facadeNotation:'Coplanar elevation convention; opaque drawing masks do not select glass or frame position'} as const
export const exteriorFingerprint=createHash('sha256').update(JSON.stringify(exteriorSource)).digest('hex')
const point=(x:number,y:number,z:number):ModelPoint3D=>({x,y,z})
const provenance={sourceIds:['docs/publication/architectural-plate-exterior-isometrics.md',d.id],authority:'provisional' as const,precision:'approximate' as const}

/** Four elevated corner cameras. View direction points towards the viewer. */
export function exteriorBasis(view:ExteriorView):ParallelProjectionBasis3D{
 const [sx,sy]=({'south-west':[-1,-1],'south-east':[1,-1],'north-east':[1,1],'north-west':[-1,1]} as const)[view]
 return {horizontal:[-sy/Math.sqrt(2),sx/Math.sqrt(2),0],vertical:[-sx/Math.sqrt(6),-sy/Math.sqrt(6),2/Math.sqrt(6)],viewDirection:[sx/Math.sqrt(3),sy/Math.sqrt(3),1/Math.sqrt(3)]}
}

export const exteriorHosts=[
 {id:'outer-south',axis:'y',at:0,lo:0,hi:d.shell,reverse:false},
 {id:'outer-east',axis:'x',at:d.shell,lo:0,hi:d.shell,reverse:false},
 {id:'outer-north',axis:'y',at:d.shell,lo:0,hi:d.shell,reverse:true},
 {id:'outer-west',axis:'x',at:0,lo:0,hi:d.shell,reverse:true},
 {id:'court-south',axis:'y',at:d.court.y,lo:d.court.x,hi:d.court.x+d.court.width,reverse:true},
 {id:'court-east',axis:'x',at:d.court.x+d.court.width,lo:d.court.y,hi:d.court.y+d.court.depth,reverse:true},
 {id:'court-north',axis:'y',at:d.court.y+d.court.depth,lo:d.court.x,hi:d.court.x+d.court.width,reverse:false},
 {id:'court-west',axis:'x',at:d.court.x,lo:d.court.y,hi:d.court.y+d.court.depth,reverse:false}
] as const
const onFace=(host:typeof exteriorHosts[number],u:number,z:number)=>host.axis==='x'?point(host.at,u,z):point(u,host.at,z)
export const exteriorApertures=()=>exteriorHosts.flatMap(host=>(['GROUND','FIRST'] as const).flatMap(level=>revisionOpenings(level).filter(o=>o.wall===host.id).map(o=>({id:level+'-'+o.id,sourceId:o.id,host:host.id,level,kind:o.kind,u:o.centre,width:o.width,sill:(level==='GROUND'?0:d.levels.first)+(o.kind==='door'?0:o.sill??750),head:(level==='GROUND'?0:d.levels.first)+(o.head??2850),leaves:o.leaves??1}))))

/** Exterior drawing surfaces, not a material/solid model. Window planes are
 * opaque presentation masks; no unselected setback, glazing or interior is inferred. */
export function exteriorFaces():ModelFace3D[]{
 const faces:ModelFace3D[]=exteriorHosts.map(host=>{
  const vertices=[onFace(host,host.lo,0),onFace(host,host.hi,0),onFace(host,host.hi,d.roof.eaves),onFace(host,host.lo,d.roof.eaves)]
  return {id:host.id,vertices:host.reverse?vertices.reverse():vertices}
 })
 faces.push(...roofRingFaces({shell:d.shell,courtInset:d.court.x,ridgeInset:d.roof.ridgeInset,overhang:d.roof.overhang,eaves:d.roof.eaves,pitchDeg:d.roof.upperPitchDeg,buildDepth:layoutFamilySource.roofBuildZone}))
 return faces
}

/** Lift the shared orthographic notation onto each nominal facade plane. */
export function exteriorFacadeSegments():SpatialSegment[]{
 const out:SpatialSegment[]=[],apertures=exteriorApertures(),p=createSectionPaperProjection({scaleDenominator:1,horizontalBounds:{min:0,max:d.shell},verticalBounds:{min:0,max:12000},paperOrigin:{x:0,y:0}})
 for(const host of exteriorHosts){
  const at=(q:{x:number;y:number})=>onFace(host,q.x,12000-q.y)
  const add=(id:string,a:ModelPoint3D,b:ModelPoint3D,role:SpatialSegment['role'],meaning:string)=>out.push({id:host.id+'-'+id,a,b,role,meaning})
  const items=layoutAperturePrimitives(host.id==='outer-south'?'FRONT':'SERVICE',apertures.filter(a=>a.host===host.id),p)
  for(const q of items){
   const meaning=`${host.id}: ${q.id}; coplanar facade convention`
   if(q.kind==='line')add(q.id,at(q.a),at(q.b),q.role,meaning)
   else if(q.kind==='path')for(const [ri,ring]of q.rings.entries())for(let i=0;i<ring.length;i++)add(`${q.id}-${ri}-${i}`,at(ring[i]),at(ring[(i+1)%ring.length]),q.stroke??'secondary',meaning)
  }
  const line=(id:string,u:number,z:number,uu:number,zz:number,role:SpatialSegment['role']='secondary')=>add(id,onFace(host,u,z),onFace(host,uu,zz),role,host.id+': '+id)
  if(host.id.startsWith('outer-')){
   line('cornice-lower',host.lo,d.roof.eaves-d.facade.corniceDepth,host.hi,d.roof.eaves-d.facade.corniceDepth,'primary')
   line('cornice-fascia',host.lo,d.roof.eaves-60,host.hi,d.roof.eaves-60)
  }
  let cursor=host.lo
  for(const o of apertures.filter(o=>o.host===host.id&&o.kind==='door'&&o.level==='GROUND').sort((a,b)=>a.u-b.u)){
   line('plinth-before-'+o.id,cursor,d.facade.plinthHeight,o.u-o.width/2,d.facade.plinthHeight);cursor=o.u+o.width/2
  }
  line('plinth-end',cursor,d.facade.plinthHeight,host.hi,d.facade.plinthHeight)
 }
 return out
}

const faces=exteriorFaces(),facade=exteriorFacadeSegments()
export function exteriorVisibleSegments(view:ExteriorView):SpatialSegment[]{
 const basis=exteriorBasis(view)
 const edges=boundaryMeshEdges(faces,(_a,_b,normals)=>{
  const signs=normals.map(n=>n.reduce((s,v,i)=>s+v*basis.viewDirection[i],0))
  return signs.some(v=>v>1e-7)&&signs.some(v=>v<-1e-7)?'profile':'primary'
 })
 return visibleSpatialSegments([...edges,...facade],faces,basis)
}

/** Shared envelope about the house centre, across all cameras. Only translation
 * changes per view; the recorded paper factor is fixed per physical profile. */
export function exteriorCommonBounds(){
 const all=exteriorViews.flatMap(v=>{
  const p=createParallelProjection3D({basis:exteriorBasis(v),origin:{x:d.shell/2,y:d.shell/2,z:0}})
  return faces.flatMap(f=>f.vertices.map(p.project))
 })
 return {left:Math.min(...all.map(p=>p.horizontal)),right:Math.max(...all.map(p=>p.horizontal)),bottom:Math.min(...all.map(p=>p.vertical)),top:Math.max(...all.map(p=>p.vertical))}
}
export const exteriorProfiles={svg:{width:420,height:390,factor:.019},b5:{width:176,height:250,factor:.0075},a4:{width:210,height:297,factor:.0075},a2:{width:420,height:594,factor:.019}} as const
export function createExteriorIsometricScene(view:ExteriorView,format:ExteriorFormat='a2'):DrawingSceneV2{
 const profile=exteriorProfiles[format],basis=exteriorBasis(view),p=createParallelProjection3D({basis}),c=p.project({x:d.shell/2,y:d.shell/2,z:0}),b=exteriorCommonBounds(),k=profile.factor
 const primitives=spatialSegmentsToDrawingPrimitives(exteriorVisibleSegments(view),{basis,paperOrigin:{x:profile.width/2-k*((b.left+b.right)/2+c.horizontal),y:profile.height/2+k*((b.bottom+b.top)/2+c.vertical)},paperMmPerModelMm:k,provenance})
 for(const q of primitives)q.metadata={...q.metadata,hiddenLineRemoval:true,representation:'uncut-exterior-isometric',modelFingerprint:exteriorFingerprint,view,physicalAcceptance:false,frameSetbackSelected:false}
 return {widthMm:profile.width,heightMm:profile.height,viewId:'EXTERIOR-ISOMETRIC-'+view+'-'+format,sourceId:exteriorSource.id,title:'Exterior isometric — '+view,description:'Complete roof and exterior; nominal aperture convention; roof/water selection and physical acceptance remain provisional.',scaleDenominator:'NTS',primitives}
}
