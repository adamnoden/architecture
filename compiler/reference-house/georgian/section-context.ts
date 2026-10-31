import {layoutRevision as d, revisionOpenings} from './layout-revision.js'
import {roofRingFaces} from './roof-surfaces.js'
import {compileOrthographicSectionView, hostedFacadeGeometry, type HostedFacade, type OrthographicSectionView} from '../../architectural-drawing/section-view.js'
import type {ModelFace3D} from '../../publication-drawing/projection-3d.js'

/** These are two real, separate courtyard facades, not two paper-space window
 * drawings. Their openings and top datum share the accepted house source. */
export function currentCourtyardSectionFacades(): HostedFacade[] {
  const c = d.court
  return (['court-west', 'court-east'] as const).map(id => ({
    id, axis: 'x' as const,
    plane: id === 'court-west' ? c.x : c.x + c.width,
    start: c.y, end: c.y+c.depth, bottom: 0, top: d.roof.courtEaves,
    openings: (['GROUND','FIRST'] as const).flatMap(level =>
      revisionOpenings(level).filter(o=>o.wall===id).map(o=>({
        id: level+'-'+o.id, start:o.centre-o.width/2, end:o.centre+o.width/2,
        sill:(level==='GROUND'?0:d.levels.first)+(o.kind==='door'?0:o.sill??750),
        head:(level==='GROUND'?0:d.levels.first)+(o.head??2850),
        ...(o.kind==='window'?{grid:{columns:3,rows:4}}:{})
      })))
  }))
}

/** Cut material masks behind-cut context; any actual aperture in the cut is
 * excluded from the occluder. These planar caps are not a structural section. */
export interface SectionCutWall {
  id:string
  lo:number
  hi:number
  bottom?:number
  top:number
  holes:readonly {id:string;lo:number;hi:number}[]
}
export function sectionCutWallOccluders(station:number,walls:readonly SectionCutWall[]):ModelFace3D[]{
  return walls.flatMap(w=>hostedFacadeGeometry({
    id:'section-cut-'+w.id,axis:'x',plane:station,start:w.lo,end:w.hi,bottom:w.bottom??0,top:w.top,
    openings:w.holes.map(h=>({id:h.id,start:w.lo,end:w.hi,sill:h.lo,head:h.hi}))
  }).faces)
}


/** Existing interior partitions mask background views; they do not acquire
 * speculative visible outlines merely because they can obstruct sight lines. */
export function currentPartitionOccluders():ModelFace3D[] {
  return (['GROUND','FIRST'] as const).flatMap(level=>{
    const bottom=level==='GROUND'?0:d.levels.first
    const top=level==='GROUND'?d.levels.ceilingGround:d.levels.ceilingFirst
    const openings=revisionOpenings(level)
    return d.partitions[level].flatMap(w=>{
      const vertical=w.a[0]===w.b[0],horizontal=w.a[1]===w.b[1]
      if (vertical===horizontal) throw Error('Non-orthogonal or degenerate partition: '+w.id)
      const axis=vertical?'x' as const:'y' as const
      const plane=vertical?w.a[0]:w.a[1]
      const start=Math.min(vertical?w.a[1]:w.a[0],vertical?w.b[1]:w.b[0])
      const end=Math.max(vertical?w.a[1]:w.a[0],vertical?w.b[1]:w.b[0])
      const host:HostedFacade={id:'partition-'+level+'-'+w.id,axis,plane,
        start,end,bottom,top,
        openings:openings.filter(o=>o.wall===w.id).map(o=>({
          id:level+'-'+o.id,start:o.centre-o.width/2,end:o.centre+o.width/2,
          sill:bottom+(o.kind==='door'?0:o.sill??750),head:bottom+(o.head??2850)
        }))
      }
      return hostedFacadeGeometry(host).faces
    })
  })
}

export interface CurrentSectionContextInput {
  station:number
  roofBuildDepth:number
  /** Exact cut-plane roof bands, from the same profile represented as section paths. */
  cutRoofFaces?:readonly ModelFace3D[]
  walls?:readonly SectionCutWall[]
}

/** Shared current-house geometric background for principal and service cuts.
 * No perspective, paper scale, source guesswork or separate roof silhouette. */
export function compileCurrentSectionContext(input:CurrentSectionContextInput):OrthographicSectionView {
  if (!Number.isFinite(input.station) || input.station<=0 || input.station>=d.shell) {
    throw Error('Current section station is outside the shell')
  }
  // This restricted geometry presently selects equal inner/outer eaves.
  // Divergent datums require a new explicit roof-field model, never a fake wall cap.
  if (Math.abs(d.roof.courtEaves-d.roof.eaves)>1e-6) {
    throw Error('Current section roof/courtyard eaves mismatch; revise shared roof geometry')
  }
  const roof=roofRingFaces({shell:d.shell,courtInset:d.court.x,ridgeInset:d.roof.ridgeInset,
    overhang:d.roof.overhang,eaves:d.roof.eaves,pitchDeg:d.roof.upperPitchDeg,
    buildDepth:input.roofBuildDepth})
  const cutFaces=[...sectionCutWallOccluders(input.station,input.walls??[]),...(input.cutRoofFaces??[])]
  return compileOrthographicSectionView({
    section:{axis:'x',at:input.station,looking:'negative'},
    facades:currentCourtyardSectionFacades(),
    contextFaces:roof,
    occluderFaces:currentPartitionOccluders(),
    cutFaces
  })
}
