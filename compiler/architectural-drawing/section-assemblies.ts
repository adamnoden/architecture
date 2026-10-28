import type {DrawingFillRole, DrawingLineRole, DrawingPrimitiveV2} from '../publication-drawing-v2/model.js'
import type {SectionPaperProjection} from '../publication-drawing/projection.js'
import type {AdeDistanceAuthority, AdeProvenance} from './model.js'

/** Nominal representation only. No house geometry, material sizes or construction defaults. */
export interface SectionLayer {
  id: string
  thickness: AdeDistanceAuthority
  kind: 'material' | 'void'
  fill: DrawingFillRole
  stroke: DrawingLineRole
}
export interface SectionOpening {
  id: string
  bottom: number
  top: number
  head?: {depth: number; layerIds: readonly string[]; closeCavity: boolean}
}
export interface SectionWall {
  id: string
  left: number
  /** Layers ordered from the authored exterior face towards the interior. */
  exteriorFace: 'left' | 'right'
  layers: readonly SectionLayer[]
  base: number
  top: readonly [number, number]
  openings: readonly SectionOpening[]
  /** A visual continuation, not selected underground construction. */
  substructure?: {bottom: number; reservationProjection: number; reservationHeight: number}
  provenance: AdeProvenance
}
export interface SectionFloor {
  id: string
  left: number
  right: number
  top: number
  /** Top to bottom. Voids occupy space but produce no material marks. */
  layers: readonly (SectionLayer & {endGap: number})[]
  /** Explicit indicative seat; never selects a hanger, anchor or pocket. */
  seats?: {underLayerId: string; projection: number; depth: number}
  provenance: AdeProvenance
}
export interface SectionRepresentation {
  /** Adjacent thin material boundaries can merge visually, retaining their semantic IDs. */
  minimumBoundarySpacingMm: number
}
const finite = (...values: number[]) => {
  if (values.some(v => !Number.isFinite(v))) throw new Error('Section geometry requires finite coordinates')
}
const positive = (v: number, label: string) => {
  finite(v)
  if (v <= 0) throw new Error(`Section ${label} must be positive`)
  return v
}
const nominal = (l: SectionLayer): number => {
  if (l.thickness.kind !== 'exact' && l.thickness.kind !== 'approximate') {
    throw new Error(`Section layer ${l.id} has no authored nominal thickness`)
  }
  return positive(l.thickness.value, l.id)
}
const unique = (ids: readonly string[]) => {
  if (ids.some(id => !id.trim()) || new Set(ids).size !== ids.length) throw new Error('Section IDs must be nonempty and unique')
}
const evidence = (id: string, p: AdeProvenance) => {
  if (!p.sourceIds.length) throw new Error(`Section ${id} lacks provenance`)
  if (p.precision !== 'exact' && p.precision !== 'approximate') throw new Error(`Section ${id} requires nominal geometry authority`)
  return {assembly: id, sources: p.sourceIds.join(','), authority: p.authority, precision: p.precision,
    constructionDetailSelected: false, engineeringVerified: false}
}
const rect = (id: string, x0: number, z0: number, x1: number, z1: number, p: SectionPaperProjection,
  fill: DrawingFillRole, stroke: DrawingLineRole, metadata: Record<string, string | number | boolean | undefined>): DrawingPrimitiveV2 => ({
  kind: 'path', id, rings: [[p.point(x0,z0),p.point(x1,z0),p.point(x1,z1),p.point(x0,z1)]], fill, stroke, metadata
})

/** Vertical cut through a layered wall. No plan/3D intersection or engineering inferred. */
export function sectionWallToDrawingPrimitives(w: SectionWall, p: SectionPaperProjection): DrawingPrimitiveV2[] {
  const metadata = evidence(w.id,w.provenance)
  finite(w.left,w.base,...w.top)
  unique(w.layers.map(l=>l.id)); unique(w.openings.map(o=>o.id))
  if (!w.layers.length) throw new Error('Section wall requires layers')
  const widths=w.layers.map(nominal), total=widths.reduce((a,b)=>a+b,0),right=w.left+total
  if (Math.min(...w.top)<=w.base) throw new Error('Section wall top must exceed its base')
  const openings=[...w.openings].sort((a,b)=>a.bottom-b.bottom)
  let previous=w.base
  for (const o of openings) {
    finite(o.bottom,o.top)
    if(o.bottom<previous||o.top<=o.bottom||o.top+(o.head?.depth??0)>Math.min(...w.top)) throw new Error(`Section opening ${o.id} overlaps or exceeds host`)
    if(o.head){positive(o.head.depth,'head depth');unique(o.head.layerIds);if(!o.head.layerIds.length||o.head.layerIds.some(id=>!w.layers.some(l=>l.id===id&&l.kind==='material')))throw new Error('Section head requires hosted material layers')}
    previous=o.top+(o.head?.depth??0)
  }
  const sub=w.substructure
  if(sub){finite(sub.bottom);positive(sub.reservationProjection,'support reservation projection');positive(sub.reservationHeight,'support reservation height');if(sub.bottom>=w.base)throw new Error('Substructure must continue below base')}
  const out:DrawingPrimitiveV2[]=[]
  const topAt=(x:number)=>w.top[0]+(w.top[1]-w.top[0])*(x-w.left)/total
  let offset=0
  for(const [i,l]of w.layers.entries()){
    const x0=w.exteriorFace==='left'?w.left+offset:right-offset-widths[i],x1=x0+widths[i];offset+=widths[i]
    if(l.kind==='void') continue
    const lm={...metadata,layer:l.id,representation:'section-wall-leaf'}
    let cursor=sub?.bottom??w.base
    for(const o of openings){
      if(o.bottom>cursor)out.push(rect(`${w.id}-${l.id}-below-${o.id}`,x0,cursor,x1,o.bottom,p,l.fill,l.stroke,lm))
      const depth=o.head?.layerIds.includes(l.id)?o.head.depth:0
      if(depth)out.push(rect(`${w.id}-${o.id}-head-${l.id}`,x0,o.top,x1,o.top+depth,p,'context','primary',{...lm,representation:'provisional-opening-head',opening:o.id}))
      cursor=o.top+depth
    }
    out.push({kind:'path',id:`${w.id}-${l.id}-upper`,rings:[[p.point(x0,cursor),p.point(x1,cursor),p.point(x1,topAt(x1)),p.point(x0,topAt(x0))]],fill:l.fill,stroke:l.stroke,metadata:lm})
  }
  for(const o of openings)if(o.head?.closeCavity){
    let offset=0
    for(const [i,l]of w.layers.entries()){
      const x0=w.exteriorFace==='left'?w.left+offset:right-offset-widths[i];offset+=widths[i]
      if(l.kind==='void')out.push({kind:'line',id:`${w.id}-${o.id}-${l.id}-closure`,a:p.point(x0,o.top),b:p.point(x0+widths[i],o.top),role:'secondary',metadata:{...metadata,representation:'provisional-cavity-closure',opening:o.id}})
    }
  }
  if(sub){
    const z=sub.bottom-sub.reservationHeight
    const r=rect(`${w.id}-support-reservation`,w.left-sub.reservationProjection,z,right+sub.reservationProjection,sub.bottom,p,'none','secondary',{
      ...metadata,representation:'support-reservation',dimensionable:false,foundationTypeSelected:false,foundationDepthSelected:false})
    if(r.kind==='path')r.dash='provisional'
    out.push(r)
    for(const [i,x]of [w.left,right].entries())for(const [j,dz]of [0,60].entries())out.push({kind:'line',id:`${w.id}-support-break-${i}-${j}`,a:p.point(x-50,z-35-dz),b:p.point(x+50,z-85-dz),role:'secondary',metadata:{...metadata,representation:'continuation-break',dimensionable:false}})
  }
  return out
}

/** Source-authored horizontal packages with clear timber ends and separate seats. */
export function sectionFloorToDrawingPrimitives(f: SectionFloor,p: SectionPaperProjection,profile: SectionRepresentation): DrawingPrimitiveV2[] {
  const metadata=evidence(f.id,f.provenance)
  finite(f.left,f.right,f.top,profile.minimumBoundarySpacingMm)
  if(f.right<=f.left||profile.minimumBoundarySpacingMm<0)throw new Error('Invalid section floor extent/profile')
  unique(f.layers.map(l=>l.id));if(!f.layers.length)throw new Error('Section floor requires layers')
  const bands=f.layers.map(l=>{const depth=nominal(l);finite(l.endGap);if(l.endGap<0||2*l.endGap>=f.right-f.left)throw new Error('Invalid section floor end gap');return {...l,depth}})
  if(f.seats){positive(f.seats.projection,'seat projection');positive(f.seats.depth,'seat depth');const b=bands.find(l=>l.id===f.seats!.underLayerId);if(!b||b.kind!=='material'||f.seats.projection<=b.endGap||2*f.seats.projection>=f.right-f.left)throw new Error('Section seat must reach material without crossing span')}
  const out:DrawingPrimitiveV2[]=[]
  let z=f.top
  for(let i=0;i<bands.length;i++){
    const band=bands[i],ids=[band.id],top=z;let depth=band.depth
    // Only coalesce adjacent thin solid bands with identical extent/style.
    while(band.kind==='material'&&depth/p.scaleDenominator<profile.minimumBoundarySpacingMm&&i+1<bands.length){
      const next=bands[i+1]
      if(next.kind!=='material'||next.depth/p.scaleDenominator>=profile.minimumBoundarySpacingMm||next.endGap!==band.endGap||next.fill!==band.fill||next.stroke!==band.stroke||ids.includes(f.seats?.underLayerId??'')||next.id===f.seats?.underLayerId)break
      depth+=next.depth;ids.push(next.id);i++
    }
    z-=depth
    if(band.kind==='void')continue
    out.push(rect(`${f.id}-${ids.join('+')}`,f.left+band.endGap,z,f.right-band.endGap,top,p,band.fill,band.stroke,{...metadata,representation:'section-floor-layer',layers:ids.join(','),coalesced:ids.length>1,endGapMm:band.endGap}))
    if(f.seats&&ids.includes(f.seats.underLayerId))for(const [name,a,b]of [['left',f.left,f.left+f.seats.projection],['right',f.right-f.seats.projection,f.right]] as const){
      out.push(rect(`${f.id}-seat-${name}`,a,z-f.seats.depth,b,z,p,'faint','secondary',{...metadata,representation:'indicative-seat',connectionSelected:false}))
    }
  }
  return out
}
