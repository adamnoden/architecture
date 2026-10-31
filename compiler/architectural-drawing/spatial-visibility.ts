import {createParallelProjection3D,type ModelFace3D,type ModelPoint3D,type ParallelProjectionBasis3D,type ProjectedPoint3D} from '../publication-drawing/projection-3d.js'
import type {SpatialSegment} from './spatial-line-drawing.js'

const eps=1e-7
const cross=(a:{x:number;y:number},b:{x:number;y:number})=>a.x*b.y-a.y*b.x
const mix=(a:ModelPoint3D,b:ModelPoint3D,t:number):ModelPoint3D=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t})

/** Exact interval clipping against caller-owned convex planar faces. No solids,
 * surface discovery, perspective, tolerance-based topology or architecture inference. */
export function visibleSpatialSegments(segments:readonly SpatialSegment[],faces:readonly ModelFace3D[],basis:ParallelProjectionBasis3D):SpatialSegment[]{
 const projection=createParallelProjection3D({basis})
 const projected=faces.map(face=>{
  if(face.vertices.length<3)throw Error('Occluder needs three vertices')
  const p=face.vertices.map(projection.project),a=p[0]
  let plane:{dx:number;dy:number;c:number}|undefined
  for(let i=1;i<p.length-1&&!plane;i++){
   const b=p[i],c=p[i+1],ux=b.horizontal-a.horizontal,uy=b.vertical-a.vertical,vx=c.horizontal-a.horizontal,vy=c.vertical-a.vertical,det=ux*vy-uy*vx
   if(Math.abs(det)>eps){const dz1=b.depth-a.depth,dz2=c.depth-a.depth,dx=(dz1*vy-dz2*uy)/det,dy=(ux*dz2-vx*dz1)/det;plane={dx,dy,c:a.depth-dx*a.horizontal-dy*a.vertical}}
  }
  if(!plane)return null // An edge-on surface has no projected area.
  const z=(q:ProjectedPoint3D)=>plane!.dx*q.horizontal+plane!.dy*q.vertical+plane!.c
  if(p.some(q=>Math.abs(z(q)-q.depth)>.001))throw Error(`Non-planar occluder: ${face.id}`)
  const area=p.reduce((s,q,i)=>s+q.horizontal*p[(i+1)%p.length].vertical-p[(i+1)%p.length].horizontal*q.vertical,0),sign=Math.sign(area)
  for(let i=0;i<p.length;i++){
   const q=p[i],r=p[(i+1)%p.length],s=p[(i+2)%p.length]
   if(sign*cross({x:r.horizontal-q.horizontal,y:r.vertical-q.vertical},{x:s.horizontal-r.horizontal,y:s.vertical-r.vertical})<-eps)throw Error('Non-convex occluder')
  }
  return {p,z,sign}
 }).filter(q=>q!==null)
 const out:SpatialSegment[]=[]
 for(const segment of segments){
  const a=projection.project(segment.a),b=projection.project(segment.b),delta={x:b.horizontal-a.horizontal,y:b.vertical-a.vertical},hidden:Array<[number,number]>=[]
  for(const f of projected){
   let lo=0,hi=1
   for(let i=0;i<f.p.length&&lo<hi;i++){
    const q=f.p[i],r=f.p[(i+1)%f.p.length],edge={x:r.horizontal-q.horizontal,y:r.vertical-q.vertical}
    const value=f.sign*cross(edge,{x:a.horizontal-q.horizontal,y:a.vertical-q.vertical}),slope=f.sign*cross(edge,delta)
    if(Math.abs(slope)<eps){if(value<-eps){lo=1;hi=0}}
    else if(slope>0)lo=Math.max(lo,(-eps-value)/slope)
    else hi=Math.min(hi,(-eps-value)/slope)
   }
   if(lo>=hi)continue
   const gapA=f.z(a)-a.depth,gapB=f.z(b)-b.depth,slope=gapB-gapA
   if(Math.abs(slope)<eps){if(gapA<=eps)continue}
   else if(slope>0)lo=Math.max(lo,(eps-gapA)/slope)
   else hi=Math.min(hi,(eps-gapA)/slope)
   if(lo<hi)hidden.push([lo,hi])
  }
  hidden.sort((a,b)=>a[0]-b[0]);let cursor=0,index=0
  const emit=(lo:number,hi:number)=>{if(hi-lo>eps)out.push({...segment,id:`${segment.id}-visible-${index++}`,a:mix(segment.a,segment.b,lo),b:mix(segment.a,segment.b,hi)})}
  for(const [lo,hi]of hidden){if(lo>cursor)emit(cursor,lo);cursor=Math.max(cursor,hi)}
  if(cursor<1)emit(cursor,1)
 }
 return out
}
