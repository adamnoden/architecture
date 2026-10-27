import type { DrawingPrimitiveV2 } from '../publication-drawing-v2/model.js'
import type { PlanPaperProjection } from '../publication-drawing/projection.js'
import type { Millimetres } from '../units.js'
import type { AdeArchitecturalPlan, AdeOpening, AdeWallAssembly } from './model.js'

/** Ordinary schematic plan symbols. Glass strokes are notation at mid-wall,
 * not a chosen frame/reveal section. Swing arcs show authored handing/leaves;
 * the tessellation is deterministic vector linework, never raster decoration. */
export const openingSymbolToDrawingPrimitives = (plan: AdeArchitecturalPlan, opening: AdeOpening, projection: PlanPaperProjection,
  thicknessFor: (a: AdeWallAssembly) => Millimetres): DrawingPrimitiveV2[] => {
  if (!opening.symbol) return []
  if (!['exact','approximate'].includes(opening.centreOffset.kind) || !['exact','approximate'].includes(opening.width.kind)) throw new Error(`Architectural symbol ${opening.id} requires an authored nominal aperture; unresolved/ranged states retain their uncertainty grammar.`)
  if (!('value' in opening.centreOffset) || !('value' in opening.width)) throw new Error('Unresolved symbol aperture')
  if (opening.role !== opening.symbol.kind) throw new Error(`Opening role/symbol mismatch ${opening.id}`)
  const wall = plan.walls.find((w)=>w.id===opening.hostWallId)!
  const assembly = plan.wallAssemblies.find((a)=>a.id===wall.assemblyId)!
  const a=plan.nodes.find((n)=>n.id===wall.fromNodeId)!.point,b=plan.nodes.find((n)=>n.id===wall.toNodeId)!.point
  const length=Math.hypot(b.x-a.x,b.y-a.y),ux=(b.x-a.x)/length,uy=(b.y-a.y)/length
  const nx=-uy,ny=ux,thickness=thicknessFor(assembly)
  const mid = wall.reference==='centreline'?0:wall.reference==='right-face'?thickness/2:-thickness/2
  const centre=opening.centreOffset.value,width=opening.width.value
  const metadata={authorityClass:'S',sources:opening.provenance.sourceIds.join(','),authority:opening.provenance.authority,
    precision:opening.provenance.precision,opening:opening.id,openingRole:opening.role,notation:'schematic-plan-symbol',technicalFrameSelected:false}
  const result:DrawingPrimitiveV2[]=[]
  const point=(s:number,n:number)=>projection.point(a.x+ux*s+nx*n,a.y+uy*s+ny*n)
  const line=(id:string,s0:number,n0:number,s1:number,n1:number)=>result.push({kind:'line',id:`${opening.id}-${id}`,a:point(s0,n0),b:point(s1,n1),role:'secondary',metadata})
  const low=centre-width/2,high=centre+width/2
  if(opening.symbol.kind==='window'){
    const offset=Math.min(30,thickness*.15)
    line('glazing-a',low,mid-offset,high,mid-offset)
    line('glazing-b',low,mid+offset,high,mid+offset)
  } else {
    const sign=opening.symbol.swingSide==='left'?1:-1
    const radius=width/opening.symbol.leaves
    for(let leaf=0;leaf<opening.symbol.leaves;leaf++){
      const highHinge=opening.symbol.leaves===1?opening.symbol.hingeEnd==='high':leaf===1
      const hinge=highHinge?high:low,along=highHinge?-1:1
      line(`leaf-${leaf+1}`,hinge,mid,hinge,mid+sign*radius)
      for(let step=0;step<16;step++){
        const t0=step*Math.PI/32,t1=(step+1)*Math.PI/32
        line(`swing-${leaf+1}-${step}`,hinge+along*radius*Math.cos(t0),mid+sign*radius*Math.sin(t0),hinge+along*radius*Math.cos(t1),mid+sign*radius*Math.sin(t1))
      }
    }
  }
  return result
}
