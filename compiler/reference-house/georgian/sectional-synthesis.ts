import {layoutRevision as d,revisionOpenings} from './layout-revision.js'
import {currentRoofZ,layoutFamilySource} from './layout-family.js'
import {sectionAssemblyChoices} from './section-source.js'
import {clipModelFaceByAxisPlane,faceNormal3D} from '../../publication-drawing/visibility-3d.js'
import type {ModelFace3D,ModelPoint3D} from '../../publication-drawing/projection-3d.js'
import {visibleSpatialSegments} from '../../architectural-drawing/spatial-visibility.js'
import {spatialSegmentsToDrawingPrimitives,type SpatialSegment} from '../../architectural-drawing/spatial-line-drawing.js'
import type {DrawingSceneV2} from '../../publication-drawing-v2/model.js'

export const synthesisSource={id:'RH-CURRENT-SECTIONAL-SYNTHESIS-02',layoutFamilySource,cutY:d.court.y,retainedSide:'north',
 scope:'Enclosure/apertures, nominal floor zone and stair opening, twin roof',
 omissions:['internal-partition/joinery detail','floor-layer/seat detail','roof-space decking','foundation design','selected service products'],
 constructionAdequacy:false,physicalAcceptance:false,scale:'NTS'} as const
export const synthesisBasis={horizontal:[1/Math.sqrt(2),1/Math.sqrt(2),0],vertical:[-1/Math.sqrt(6),1/Math.sqrt(6),2/Math.sqrt(6)],viewDirection:[1/Math.sqrt(3),-1/Math.sqrt(3),1/Math.sqrt(3)]} as const
const point=(x:number,y:number,z:number):ModelPoint3D=>({x,y,z})
const provenance={sourceIds:['docs/publication/architectural-plate-current-synthesis.md',d.id],authority:'provisional' as const,precision:'approximate' as const}

/** Caller-owned mesh of represented zones, not a complete building or engineering model. */
export function currentSynthesisFaces():ModelFace3D[]{
 const faces:ModelFace3D[]=[],cut=d.court.y,c=d.court,e=d.envelope,n=d.shell,far=c.y+c.depth
 const add=(id:string,vertices:ModelPoint3D[])=>{if(vertices.length>=3)faces.push({id,vertices})}
 const quad=(id:string,v:ModelPoint3D[])=>add(id,v)
 // Apertures are actual absences in both envelope faces, with source-owned jambs.
 const wall=(id:string,axis:'x'|'y',v0:number,v1:number,lo:number,hi:number)=>{
  const p=(u:number,v:number,z:number)=>axis==='x'?point(v,u,z):point(u,v,z)
  const holes=(['GROUND','FIRST'] as const).flatMap(level=>revisionOpenings(level).filter(o=>o.wall===id).map(o=>({id:level+'-'+o.id,lo:o.centre-o.width/2,hi:o.centre+o.width/2,bottom:(level==='GROUND'?0:d.levels.first)+(o.kind==='door'?0:o.sill??750),top:(level==='GROUND'?0:d.levels.first)+(o.head??2850)}))).filter(o=>o.hi>lo&&o.lo<hi)
  const us=[...new Set([lo,hi,e,n-e,c.x-e,c.x,c.x+c.width,c.x+c.width+e,...holes.flatMap(o=>[o.lo,o.hi])].filter(u=>u>=lo&&u<=hi))].sort((a,b)=>a-b)
  const zs=[...new Set([0,750,2850,d.levels.first,d.levels.first+750,d.levels.first+2850,...holes.flatMap(o=>[o.bottom,o.top])])].sort((a,b)=>a-b)
  const hole=(u:number,z:number)=>holes.some(o=>u>o.lo&&u<o.hi&&z>=o.bottom&&z<o.top)
  const top=(u:number,v:number)=>{const q=p(u,v,0);return currentRoofZ(q.x,q.y)-layoutFamilySource.roofBuildZone}
  for(let i=0;i<us.length-1;i++)for(let j=0;j<zs.length;j++){
   const a=us[i],b=us[i+1],bottom=zs[j],upper=zs[j+1]
   if(hole((a+b)/2,bottom+(upper===undefined?1:(upper-bottom)/2)))continue
   for(const [side,v]of [['a',v0],['b',v1]] as const){
    const ta=upper??top(a,v),tb=upper??top(b,v)
    quad(`${id}-${side}-${i}-${j}`,[p(a,v,bottom),p(b,v,bottom),p(b,v,tb),p(a,v,ta)])
   }
  }
  for(let i=0;i<us.length-1;i++){
   const a=us[i],b=us[i+1]
   const v=[p(a,v0,top(a,v0)),p(b,v0,top(b,v0)),p(b,v1,top(b,v1)),p(a,v1,top(a,v1))],peak=v.reduce((best,p,i)=>p.z>v[best].z?i:best,0),q=[v[peak],v[(peak+1)%4],v[(peak+2)%4],v[(peak+3)%4]]
   quad(`${id}-top-${i}-a`,[q[0],q[1],q[2]]);quad(`${id}-top-${i}-b`,[q[0],q[2],q[3]])
  }
  for(const [end,u]of [['lo',lo],['hi',hi]] as const)for(let j=0;j<zs.length;j++){
   const bottom=zs[j],upper=zs[j+1];if(hole(u+(end==='lo'?1e-4:-1e-4),bottom+(upper===undefined?1:(upper-bottom)/2)))continue
   quad(`${id}-end-${end}-${j}`,[p(u,v0,bottom),p(u,v1,bottom),p(u,v1,upper??top(u,v1)),p(u,v0,upper??top(u,v0))])
  }
  for(const h of holes){
   for(const [name,u]of [['left',h.lo],['right',h.hi]] as const)if(u>lo&&u<hi)quad(`${id}-${h.id}-${name}`,[p(u,v0,h.bottom),p(u,v1,h.bottom),p(u,v1,h.top),p(u,v0,h.top)])
   const a=Math.max(lo,h.lo),b=Math.min(hi,h.hi)
   for(const [name,z]of [['head',h.top],['sill',h.bottom]] as const)if(z>0)quad(`${id}-${h.id}-${name}`,[p(a,v0,z),p(b,v0,z),p(b,v1,z),p(a,v1,z)])
  }
 }
 wall('outer-west','x',0,e,cut,n-e);wall('outer-east','x',n-e,n,cut,n-e);wall('outer-north','y',n-e,n,0,n)
 wall('court-west','x',c.x-e,c.x,cut,far);wall('court-east','x',c.x+c.width,c.x+c.width+e,cut,far)
 wall('court-north','y',far,far+e,c.x-e,c.x+c.width+e)
 const box=(id:string,x:number,y:number,xx:number,yy:number,z:number,zz:number)=>{
  const a=point(x,y,z),b=point(xx,y,z),cc=point(xx,yy,z),dd=point(x,yy,z),A=point(x,y,zz),B=point(xx,y,zz),C=point(xx,yy,zz),D=point(x,yy,zz)
  ;[[a,b,cc,dd],[A,B,C,D],[a,b,B,A],[b,cc,C,B],[cc,dd,D,C],[dd,a,A,D]].forEach((v,i)=>quad(id+'-'+i,v))
 }
 // Nominal floor package: source-owned clear floor regions, with the real stair void.
 const s=d.stair,xs=[...new Set([e,s.x+s.width,c.x-e,c.x+c.width+e,n-e])].sort((a,b)=>a-b),ys=[...new Set([cut,s.y+s.length,far+e,n-e])].sort((a,b)=>a-b)
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++){
  const x=xs[i],xx=xs[i+1],y=ys[j],yy=ys[j+1],mx=(x+xx)/2,my=(y+yy)/2
  if(mx>c.x-e&&mx<c.x+c.width+e&&my<far+e)continue
  quad(`ground-${i}-${j}`,[point(x,y,0),point(xx,y,0),point(xx,yy,0),point(x,yy,0)])
  if(mx>s.x&&mx<s.x+s.width&&my>s.y&&my<s.y+s.length)continue
  const f=sectionAssemblyChoices.floor,depth=f.finish+f.deck+f.joist+f.void+f.ceiling
  box(`floor-${i}-${j}`,x,y,xx,yy,d.levels.first-depth,d.levels.first)
 }
 // Each pitched panel is a source-derived wedge; clip it and explicitly cap its cut.
 const ring=(a:number)=>[[a,a],[n-a,a],[n-a,n-a],[a,n-a]]
 const outer=ring(-200),ridge=ring(d.roof.ridgeInset),inner=ring(c.x+200)
 for(const [band,a,b]of [['outer',outer,ridge],['inner',ridge,inner]] as const)for(let i=0;i<4;i++){
  const j=(i+1)%4,xy=[a[i],a[j],b[j],b[i]],top=xy.map(([x,y])=>point(x,y,currentRoofZ(x,y))),bottom=top.map(p=>({...p,z:p.z-layoutFamilySource.roofBuildZone}))
  const shell=[top,[...bottom].reverse(),...top.map((p,k)=>[p,top[(k+1)%4],bottom[(k+1)%4],bottom[k]])]
  const cap:ModelPoint3D[]=[]
  for(const [k,vertices]of shell.entries()){
   const f=clipModelFaceByAxisPlane({id:`roof-${band}-${i}-${k}`,vertices},{axis:'y',coordinate:cut,keep:'greater-or-equal'})
   if(f){faces.push(f);for(const p of f.vertices)if(Math.abs(p.y-cut)<1e-6)cap.push(p)}
  }
  const unique=[...new Map(cap.map(p=>[`${p.x.toFixed(5)},${p.z.toFixed(5)}`,p])).values()]
  if(unique.length>=3){const cx=unique.reduce((s,p)=>s+p.x,0)/unique.length,cz=unique.reduce((s,p)=>s+p.z,0)/unique.length;unique.sort((a,b)=>Math.atan2(a.z-cz,a.x-cx)-Math.atan2(b.z-cz,b.x-cx));quad(`roof-${band}-${i}-cut`,unique)}
 }
 // Remove exact duplicate interior tile faces, preserving the boundary mesh.
 const key=(f:ModelFace3D)=>f.vertices.map(p=>`${p.x.toFixed(5)},${p.y.toFixed(5)},${p.z.toFixed(5)}`).sort().join(';'),groups=new Map<string,ModelFace3D[]>()
 for(const f of faces){const k=key(f);groups.set(k,[...(groups.get(k)??[]),f])}
 return [...groups.values()].filter(a=>a.length===1).map(a=>a[0])
}

/** Join coplanar tiled faces before drawing their boundary edges. Coordinates
 * deduplicate only this authored mesh; they establish no architectural topology. */
export function synthesisMeshEdges(faces:readonly ModelFace3D[]):SpatialSegment[]{
 const groups=new Map<string,Array<{a:ModelPoint3D;b:ModelPoint3D;normal:readonly number[];id:string}>>()
 const xyz=(p:ModelPoint3D)=>[p.x,p.y,p.z]
 for(const f of faces){const normal=faceNormal3D(f);for(let i=0;i<f.vertices.length;i++){
  const a=f.vertices[i],b=f.vertices[(i+1)%f.vertices.length],delta=xyz(b).map((v,k)=>v-xyz(a)[k]),len=Math.hypot(...delta);if(len<1e-6)continue
  const sign=delta.find(v=>Math.abs(v)>1e-6)!>0?1:-1,dir=delta.map(v=>sign*v/len),t=xyz(a).reduce((s,v,k)=>s+v*dir[k],0),origin=xyz(a).map((v,k)=>v-t*dir[k]),key=[...dir,...origin].map(v=>v.toFixed(5)).join(',')
  groups.set(key,[...(groups.get(key)??[]),{a,b,normal,id:f.id}])
 }}
 const out:SpatialSegment[]=[]
 for(const edges of groups.values()){
  const first=edges[0],av=xyz(first.a),delta=xyz(first.b).map((v,k)=>v-av[k]),len=Math.hypot(...delta),dir=delta.map(v=>v/len)
  const t=(p:ModelPoint3D)=>xyz(p).reduce((s,v,k)=>s+(v-av[k])*dir[k],0),at=(v:number)=>point(av[0]+dir[0]*v,av[1]+dir[1]*v,av[2]+dir[2]*v)
  const cuts=[...new Set(edges.flatMap(e=>[t(e.a),t(e.b)]).map(v=>Number(v.toFixed(6))))].sort((a,b)=>a-b)
  for(let i=0;i<cuts.length-1;i++){
   const lo=cuts[i],hi=cuts[i+1],mid=(lo+hi)/2,cover=edges.filter(e=>mid>=Math.min(t(e.a),t(e.b))-1e-5&&mid<=Math.max(t(e.a),t(e.b))+1e-5)
   if(!cover.length||hi-lo<1e-5)continue
   if(cover.length>1&&cover.every(e=>Math.abs(e.normal.reduce((s,v,k)=>s+v*cover[0].normal[k],0))>1-1e-6))continue
   const a=at(lo),b=at(hi),cut=Math.abs(a.y-d.court.y)<1e-5&&Math.abs(b.y-d.court.y)<1e-5
   out.push({id:`mesh-${out.length}`,a,b,role:cut?'cut':'secondary',meaning:cover.map(e=>e.id).join(',')})
  }
 }
 return out
}

export function createCurrentSynthesisScene(profile:'BOOK'|'WALL',format:'b5'|'a4'='b5'):DrawingSceneV2{
 const faces=currentSynthesisFaces(),edges=synthesisMeshEdges(faces),visible=visibleSpatialSegments(edges,faces,synthesisBasis),book=profile==='BOOK',k=book?.013:.022,w=book?(format==='b5'?352:420):420,h=book?(format==='b5'?250:297):594
 const primitives=spatialSegmentsToDrawingPrimitives(visible,{basis:synthesisBasis,paperOrigin:book?{x:45+(w-352)/2,y:174+(h-250)/2}:{x:-10,y:375},paperMmPerModelMm:k,provenance})
 for(const p of primitives)p.metadata={...p.metadata,representation:'opaque-zone-boundary-synthesis',hiddenLineRemoval:true,solidGeometry:false,completeBuildingModel:false}
 const text=(id:string,x:number,y:number,value:string,role:'note'|'marker'='note')=>primitives.push({kind:'text',id,x,y,value,role,anchor:'middle'})
 text('title',book?w/4:w/2,book?17:40,'Sectional synthesis','marker')
 text('cut',book?w/4:w/2,book?24:48,'South courtyard edge; retained north portion')
 if(book)text('right-title',3*w/4,17,'Enclosure and level order','marker')
 text('scope',book?3*w/4:w/2,book?24:56,'Enclosure, apertures, floor/stair void and twin roof')
 text('limits',book?w/4:w/2,book?h-20:545,'Nominal zones; supports and guarding unverified.')
 text('omissions',book?3*w/4:w/2,book?h-20:552,'Internal partitions, joinery and service products omitted.')
 text('scale',book?w/4:w/2,book?h-13:559,'NTS — fixed parallel projection','marker')
 return {widthMm:w,heightMm:h,viewId:'CURRENT-SECTIONAL-SYNTHESIS-'+profile,sourceId:synthesisSource.id,title:'Current sectional synthesis',description:synthesisSource.scope,scaleDenominator:'NTS',primitives}
}
