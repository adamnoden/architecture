import type {DrawingPrimitiveV2, DrawingLineRole} from '../publication-drawing-v2/model.js'
import type {SectionPaperProjection} from '../publication-drawing/projection.js'
import type {AdeProvenance} from './model.js'

interface ApertureEvidence {id: string; provenance: AdeProvenance}
const metadata=(a:ApertureEvidence)=>{
 if(!a.id.trim()||!a.provenance.sourceIds.length)throw new Error('Aperture notation requires ID and provenance')
 if(!['exact','approximate'].includes(a.provenance.precision))throw new Error('Aperture notation requires nominal authority')
 return {sources:a.provenance.sourceIds.join(','),authority:a.provenance.authority,precision:a.provenance.precision,opening:a.id,technicalFrameSelected:false}
}
const positive=(...values:number[])=>{if(values.some(v=>!Number.isFinite(v)||v<=0))throw new Error('Invalid aperture dimensions')}

/** Face-on frame/grid convention, usable in an elevation or beyond a section cut.
 * Grid counts/style are caller-owned; this has no Georgian or RH defaults. */
export function framedApertureToDrawingPrimitives(a:ApertureEvidence & {
 left:number;bottom:number;width:number;height:number;frameInset:number;columns:number;rows:number;
 head?:{height:number;projection:number};sill?:{height:number;projection:number};role:DrawingLineRole
},p:SectionPaperProjection):DrawingPrimitiveV2[]{
 const meta=metadata(a)
 positive(a.width,a.height,a.frameInset,a.columns,a.rows)
 if(!Number.isFinite(a.left)||!Number.isFinite(a.bottom)||!Number.isInteger(a.columns)||!Number.isInteger(a.rows)||2*a.frameInset>=Math.min(a.width,a.height))throw new Error('Invalid aperture grid/frame')
 const out:DrawingPrimitiveV2[]=[]
 const line=(id:string,x0:number,z0:number,x1:number,z1:number)=>out.push({kind:'line',id:a.id+'-'+id,a:p.point(x0,z0),b:p.point(x1,z1),role:a.role,metadata:meta})
 const box=(id:string,x:number,z:number,w:number,h:number)=>out.push({kind:'path',id:a.id+'-'+id,rings:[[p.point(x,z),p.point(x+w,z),p.point(x+w,z+h),p.point(x,z+h)]],stroke:a.role,fill:'none',metadata:meta})
 box('outline',a.left,a.bottom,a.width,a.height)
 const x=a.left+a.frameInset,z=a.bottom+a.frameInset,w=a.width-2*a.frameInset,h=a.height-2*a.frameInset
 box('frame',x,z,w,h)
 for(let i=1;i<a.columns;i++)line('bar-'+i,x+w*i/a.columns,z,x+w*i/a.columns,z+h)
 for(let i=1;i<a.rows;i++)line('row-'+i,x,z+h*i/a.rows,x+w,z+h*i/a.rows)
 for(const [id,v,zz]of [['head',a.head,a.bottom+a.height],['sill',a.sill,a.bottom-(a.sill?.height??0)]] as const)if(v){positive(v.height);if(!Number.isFinite(v.projection)||v.projection<0)throw new Error('Invalid aperture profile');box(id,a.left-v.projection,zz,a.width+2*v.projection,v.height)}
 return out
}

/** Closed joinery at a vertical section cut, separate from its masonry head. */
export function cutApertureToDrawingPrimitives(a:ApertureEvidence & {
 frameLeft:number;frameWidth:number;bottom:number;top:number;leafX:number;leafBottom:number;leafTop:number;
 threshold?:readonly [number,number];fanlight?:readonly [number,number]
},p:SectionPaperProjection):DrawingPrimitiveV2[]{
 const meta=metadata(a);positive(a.frameWidth,a.top-a.bottom,a.leafTop-a.leafBottom)
 if([a.frameLeft,a.bottom,a.top,a.leafX,a.leafBottom,a.leafTop,...(a.threshold??[]),...(a.fanlight??[])].some(v=>!Number.isFinite(v))||a.leafBottom<a.bottom||a.leafTop>a.top)throw new Error('Invalid cut aperture')
 if(a.threshold&&a.threshold[1]<=a.threshold[0])throw new Error('Invalid threshold')
 if(a.fanlight&&(a.fanlight[0]<a.leafTop||a.fanlight[1]>a.top||a.fanlight[1]<=a.fanlight[0]))throw new Error('Invalid fanlight')
 const out:DrawingPrimitiveV2[]=[{kind:'path',id:a.id+'-frame',rings:[[p.point(a.frameLeft,a.bottom),p.point(a.frameLeft+a.frameWidth,a.bottom),p.point(a.frameLeft+a.frameWidth,a.top),p.point(a.frameLeft,a.top)]],stroke:'secondary',fill:'none',metadata:meta}]
 const line=(id:string,x:number,z:number,xx:number,zz:number,role:DrawingLineRole)=>out.push({kind:'line',id:a.id+'-'+id,a:p.point(x,z),b:p.point(xx,zz),role,metadata:meta})
 line('leaf',a.leafX,a.leafBottom,a.leafX,a.leafTop,'primary')
 if(a.threshold)line('threshold',a.threshold[0],a.bottom,a.threshold[1],a.bottom,'primary')
 if(a.fanlight)line('fanlight',a.leafX,a.fanlight[0],a.leafX,a.fanlight[1],'secondary')
 return out
}
