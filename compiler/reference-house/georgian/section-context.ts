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
  top:number
  holes:readonly {id:string;lo:number;hi:number}[]
}
export function sectionCutWallOccluders(station:number,walls:readonly SectionCutWall[]):ModelFace3D[]{
  return walls.flatMap(w=>hostedFacadeGeometry({
    id:'section-cut-'+w.id,axis:'x',plane:station,start:w.lo,end:w.hi,bottom:0,top:w.top,
    openings:w.holes.map(h=>({id:h.id,start:w.lo,end:w.hi,sill:h.lo,head:h.hi}))
  }).faces)
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
    cutFaces
  })
}
