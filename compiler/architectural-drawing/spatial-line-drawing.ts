import {createParallelProjection3D,type ParallelProjectionBasis3D,type ModelPoint3D} from '../publication-drawing/projection-3d.js'
import type {DrawingPrimitiveV2,DrawingLineRole,DrawingDashRole,PaperPoint} from '../publication-drawing-v2/model.js'
import type {AdeProvenance} from './model.js'
export interface SpatialSegment {id:string;a:ModelPoint3D;b:ModelPoint3D;role:DrawingLineRole;dash?:DrawingDashRole;meaning:string}
/** Explicit line anatomy, never an opaque solid or an occlusion solver. */
export function spatialSegmentsToDrawingPrimitives(segments:readonly SpatialSegment[],options:{basis:ParallelProjectionBasis3D;paperOrigin:PaperPoint;paperMmPerModelMm:number;provenance:AdeProvenance}):DrawingPrimitiveV2[]{
 const k=options.paperMmPerModelMm
 if(!Number.isFinite(k)||k<=0||!Number.isFinite(options.paperOrigin.x)||!Number.isFinite(options.paperOrigin.y)||!options.provenance.sourceIds.length)throw Error('Invalid spatial line projection')
 if(new Set(segments.map(s=>s.id)).size!==segments.length)throw Error('Duplicate spatial segment identity')
 const projection=createParallelProjection3D({basis:options.basis}),point=(q:ModelPoint3D)=>{const r=projection.project(q);return {x:options.paperOrigin.x+r.horizontal*k,y:options.paperOrigin.y-r.vertical*k}}
 return segments.map(s=>({kind:'line',id:s.id,a:point(s.a),b:point(s.b),role:s.role,dash:s.dash,metadata:{sources:options.provenance.sourceIds.join(','),authority:options.provenance.authority,precision:options.provenance.precision,representation:'open-spatial-line-anatomy',meaning:s.meaning,solidGeometry:false,hiddenLineRemoval:false,modelA:JSON.stringify(s.a),modelB:JSON.stringify(s.b)}}))
}
