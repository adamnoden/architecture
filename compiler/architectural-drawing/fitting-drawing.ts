import type {AdePlanFitting} from './model.js'
import type {PlanPaperProjection} from '../publication-drawing/projection.js'
import type {DrawingPrimitiveV2} from '../publication-drawing-v2/model.js'

/** Quiet schematic outlines within an explicitly authored nominal envelope. */
export const fittingToDrawingPrimitives=(f:AdePlanFitting,p:PlanPaperProjection):DrawingPrimitiveV2[]=>{
 const point=(x:number,y:number)=>p.point(f.origin.x+x*f.width,f.origin.y+y*f.depth)
 const out:DrawingPrimitiveV2[]=[],metadata={fitting:f.id,fittingRole:f.role,sources:f.provenance.sourceIds.join(','),authority:f.provenance.authority,precision:f.provenance.precision,productSelected:false}
 const ring=(name:string,xy:number[][])=>out.push({kind:'path',id:`${f.id}-${name}`,rings:[xy.map(([x,y])=>point(x,y))],stroke:'secondary',fill:'none',metadata})
 const rect=(name:string,x0:number,y0:number,x1:number,y1:number)=>ring(name,[[x0,y0],[x1,y0],[x1,y1],[x0,y1]])
 if(f.role==='wc'){
  rect('cistern',0,.8,1,1)
  ring('pan',Array.from({length:24},(_,i)=>{const t=i*Math.PI/12;return [.5+.43*Math.cos(t),.4+.4*Math.sin(t)]}))
 }else{
  rect('outline',0,0,1,1)
  if(f.role==='basin')ring('bowl',Array.from({length:24},(_,i)=>{const t=i*Math.PI/12;return [.5+.34*Math.cos(t),.5+.3*Math.sin(t)]}))
 }
 return out
}
