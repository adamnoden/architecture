import type {ModelFace3D,ModelPoint3D} from '../publication-drawing/projection-3d.js'
import {faceNormal3D} from '../publication-drawing/visibility-3d.js'
import type {SpatialSegment} from './spatial-line-drawing.js'
const point=(x:number,y:number,z:number):ModelPoint3D=>({x,y,z})

/** Boundary edges of caller-owned planar tiled faces; remove coplanar tessellation seams.
 * No house geometry, tolerance inference or solid construction is supplied here. */
export function boundaryMeshEdges(faces:readonly ModelFace3D[],roleForEdge:(a:ModelPoint3D,b:ModelPoint3D,normals:readonly (readonly number[])[])=>SpatialSegment['role']=()=>'secondary'):SpatialSegment[]{
 const groups=new Map<string,Array<{a:ModelPoint3D;b:ModelPoint3D;normal:readonly number[];id:string}>>()
 const xyz=(p:ModelPoint3D)=>[p.x,p.y,p.z]
 for(const f of faces){const normal=faceNormal3D(f);for(let i=0;i<f.vertices.length;i++){
  const a=f.vertices[i],b=f.vertices[(i+1)%f.vertices.length],delta=xyz(b).map((v,k)=>v-xyz(a)[k]),len=Math.hypot(...delta);if(len<1e-6)continue
  const sign=delta.find(v=>Math.abs(v)>1e-6)!>0?1:-1,dir=delta.map(v=>sign*v/len),t=xyz(a).reduce((s,v,k)=>s+v*dir[k],0),origin=xyz(a).map((v,k)=>v-t*dir[k]),key=[...dir,...origin].map(v=>Number(v.toFixed(5)).toFixed(5)).join(',')
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
   const a=at(lo),b=at(hi)
   out.push({id:`mesh-${out.length}`,a,b,role:roleForEdge(a,b,cover.map(e=>e.normal)),meaning:cover.map(e=>e.id).join(',')})
  }
 }
 return out
}

