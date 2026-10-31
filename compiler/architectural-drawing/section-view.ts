import {createParallelProjection3D, type ModelFace3D, type ModelPoint3D, type ParallelProjectionBasis3D} from '../publication-drawing/projection-3d.js'
import {clipModelFaceByAxisPlane, faceNormal3D} from '../publication-drawing/visibility-3d.js'
import {boundaryMeshEdges} from './boundary-mesh-edges.js'
import {visibleSpatialSegments} from './spatial-visibility.js'
import type {SpatialSegment} from './spatial-line-drawing.js'

const EPS = 1e-6
export type SectionAxis = 'x' | 'y'
export type ViewSide = 'positive' | 'negative'

/** A vertical source-owned facade with rectangular apertures. Span runs along
 * Y for an X-plane wall, or X for a Y-plane wall; heights are world Z in mm. */
export interface HostedFacade {
  id: string
  axis: SectionAxis
  plane: number
  start: number
  end: number
  bottom: number
  top: number
  openings: readonly HostedFacadeOpening[]
}
export interface HostedFacadeOpening {
  id: string
  start: number
  end: number
  sill: number
  head: number
  /** Optional source-authorised face-on grid. Never a free-floating glyph. */
  grid?: {columns: number; rows: number}
}
export interface HostedFacadeGeometry {
  faces: ModelFace3D[]
  details: SpatialSegment[]
}
export interface OrthographicSectionCut {
  axis: SectionAxis
  at: number
  /** Direction from the cut plane into the retained building, away from camera. */
  looking: ViewSide
}
export interface OrthographicSectionView {
  basis: ParallelProjectionBasis3D
  background: SpatialSegment[]
  cut: SpatialSegment[]
  /** Actual retained model faces, usable for further inspection; not solids. */
  retainedFaces: ModelFace3D[]
}
export interface SectionViewInput {
  section: OrthographicSectionCut
  facades?: readonly HostedFacade[]
  /** Other controlled planar surfaces, e.g. roof fields, not silhouette sketches. */
  contextFaces?: readonly ModelFace3D[]
  /** Explicit intersections/section caps. This compiler does not infer solids. */
  cutFaces?: readonly ModelFace3D[]
}

const finite = (...values: number[]): void => {
  if (!values.every(Number.isFinite)) throw new Error('Section-view geometry must be finite model millimetres')
}
const pointOn = (f: HostedFacade, u: number, z: number): ModelPoint3D =>
  f.axis === 'x' ? {x: f.plane, y: u, z} : {x: u, y: f.plane, z}
const overlap = (a: number, b: number, c: number, d: number): boolean =>
  Math.max(a, c) < Math.min(b, d) - EPS

/** Build actual planar wall material around apertures. The wall's roof/eaves
 * termination is a host fact; there is no unrelated 'top wall line' to forget.
 * The hole and its optional grid share exactly one opening source. */
export function hostedFacadeGeometry(f: HostedFacade): HostedFacadeGeometry {
  if (!f.id.trim()) throw new Error('Hosted facade requires a stable id')
  finite(f.plane, f.start, f.end, f.bottom, f.top)
  if (f.end <= f.start || f.top <= f.bottom) throw new Error(`Invalid hosted facade extent: ${f.id}`)
  const openingIds = new Set<string>()
  for (const o of f.openings) {
    if (!o.id.trim() || openingIds.has(o.id)) throw new Error(`Duplicate/empty facade opening: ${f.id}`)
    openingIds.add(o.id)
    finite(o.start, o.end, o.sill, o.head)
    if (o.start < f.start - EPS || o.end > f.end + EPS || o.sill < f.bottom - EPS ||
        o.head > f.top + EPS || o.start >= o.end || o.sill >= o.head) {
      throw new Error(`Opening ${o.id} does not fit host ${f.id}`)
    }
    if (o.grid && (!Number.isInteger(o.grid.columns) || !Number.isInteger(o.grid.rows) ||
      o.grid.columns < 1 || o.grid.rows < 1 || o.grid.columns > 32 || o.grid.rows > 32)) {
      throw new Error(`Invalid hosted aperture grid: ${o.id}`)
    }
  }
  for (let i = 0; i < f.openings.length; i++) {
    for (let j = i + 1; j < f.openings.length; j++) {
      const a = f.openings[i], b = f.openings[j]
      if (overlap(a.start, a.end, b.start, b.end) &&
          overlap(a.sill, a.head, b.sill, b.head)) {
        throw new Error(`Hosted openings overlap: ${a.id} / ${b.id}`)
      }
    }
  }
  const spans = [...new Set([f.start, f.end, ...f.openings.flatMap(o => [o.start, o.end])])].sort((a, b) => a - b)
  const heights = [...new Set([f.bottom, f.top, ...f.openings.flatMap(o => [o.sill, o.head])])].sort((a, b) => a - b)
  const faces: ModelFace3D[] = []
  for (let i = 0; i < spans.length - 1; i++) {
    for (let j = 0; j < heights.length - 1; j++) {
      const a = spans[i], b = spans[i + 1], low = heights[j], high = heights[j + 1]
      if (b - a < EPS || high - low < EPS) continue
      if (f.openings.some(o => a >= o.start - EPS && b <= o.end + EPS &&
        low >= o.sill - EPS && high <= o.head + EPS)) continue
      faces.push({id: `${f.id}:material:${i}:${j}`,
        vertices: [pointOn(f, a, low), pointOn(f, b, low), pointOn(f, b, high), pointOn(f, a, high)]})
    }
  }
  const details: SpatialSegment[] = []
  for (const o of f.openings) {
    if (!o.grid) continue
    const add = (id: string, a: ModelPoint3D, b: ModelPoint3D) =>
      details.push({id: `${f.id}:${o.id}:${id}`, a, b, role: 'secondary',
        meaning: `hosted-aperture:${f.id}/${o.id}`})
    for (let i = 1; i < o.grid.columns; i++) {
      const u = o.start + (o.end - o.start) * i / o.grid.columns
      add(`mullion:${i}`, pointOn(f, u, o.sill), pointOn(f, u, o.head))
    }
    for (let j = 1; j < o.grid.rows; j++) {
      const z = o.sill + (o.head - o.sill) * j / o.grid.rows
      add(`transom:${j}`, pointOn(f, o.start, z), pointOn(f, o.end, z))
    }
  }
  return {faces, details}
}

/** Larger projected depth points toward the observer. Paper scale/offset and
 * visual tokens remain with the existing DrawingSceneV2 SVG backend. */
export function sectionProjectionBasis(section: OrthographicSectionCut): ParallelProjectionBasis3D {
  finite(section.at)
  // Runtime inputs can originate from JSON, not only compile-time type-safe callers.
  if ((section.axis !== 'x' && section.axis !== 'y') ||
      (section.looking !== 'positive' && section.looking !== 'negative')) {
    throw new Error('Unsupported section axis or viewing direction')
  }
  if (section.axis === 'x') return section.looking === 'negative'
    ? {horizontal: [0, 1, 0], vertical: [0, 0, 1], viewDirection: [1, 0, 0]}
    : {horizontal: [0, -1, 0], vertical: [0, 0, 1], viewDirection: [-1, 0, 0]}
  if (section.axis === 'y') return section.looking === 'negative'
    ? {horizontal: [-1, 0, 0], vertical: [0, 0, 1], viewDirection: [0, 1, 0]}
    : {horizontal: [1, 0, 0], vertical: [0, 0, 1], viewDirection: [0, -1, 0]}
  throw new Error('Unsupported section axis')
}
const interpolate = (a: ModelPoint3D, b: ModelPoint3D, t: number): ModelPoint3D => ({
  x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t
})
function retainSegment(segment: SpatialSegment, cut: OrthographicSectionCut): SpatialSegment | null {
  const av = segment.a[cut.axis] - cut.at, bv = segment.b[cut.axis] - cut.at
  const inside = (value: number) => cut.looking === 'negative' ? value <= EPS : value >= -EPS
  if (inside(av) && inside(bv)) return segment
  if (!inside(av) && !inside(bv)) return null
  const t = -av / (bv - av)
  const intersection = interpolate(segment.a, segment.b, t)
  return inside(av) ? {...segment, b: intersection} : {...segment, a: intersection}
}
function validateFace(face: ModelFace3D): void {
  if (!face.id.trim() || face.vertices.length < 3) throw new Error('Section face needs id and 3+ vertices')
  for (const q of face.vertices) finite(q.x, q.y, q.z)
  const normal = faceNormal3D(face), a = face.vertices[0]
  for (const q of face.vertices) {
    const distance = (q.x - a.x) * normal[0] + (q.y - a.y) * normal[1] + (q.z - a.z) * normal[2]
    if (Math.abs(distance) > .001) throw new Error(`Non-planar section face: ${face.id}`)
  }
}

/** Source-bound 2.5D section geometry. Explicit cut caps stay separate from
 * behind-cut surfaces; clip the ORIGINAL mesh edges before occlusion, so
 * clipping a roof field cannot manufacture a false visible 'cut-plane edge'.
 * It deliberately cannot derive section material/caps from arbitrary solids. */
export function compileOrthographicSectionView(input: SectionViewInput): OrthographicSectionView {
  const basis = sectionProjectionBasis(input.section)
  createParallelProjection3D({basis})
  const facades = input.facades ?? [], context = input.contextFaces ?? [], cutFaces = input.cutFaces ?? []
  const facadeIds = new Set<string>()
  const built = facades.map(f => {
    if (facadeIds.has(f.id)) throw new Error(`Duplicate hosted facade id: ${f.id}`)
    facadeIds.add(f.id)
    return hostedFacadeGeometry(f)
  })
  const faces = [...context, ...built.flatMap(f => f.faces)]
  const details = built.flatMap(f => f.details)
  if (!faces.length && !cutFaces.length) throw new Error('Section view requires actual source surfaces')
  const ids = new Set<string>()
  for (const face of [...faces, ...cutFaces]) {
    validateFace(face)
    if (ids.has(face.id)) throw new Error(`Duplicate section face id: ${face.id}`)
    ids.add(face.id)
  }
  for (const face of cutFaces) for (const q of face.vertices) {
    if (Math.abs(q[input.section.axis] - input.section.at) > EPS) {
      throw new Error(`Cut face ${face.id} is not on the section plane`)
    }
  }
  // Stable independent of caller face enumeration. Cut faces are authored,
  // not inferred from clipping the surfaces of a non-solid geometric model.
  const ordered = [...faces].sort((a, b) => a.id.localeCompare(b.id))
  const retainedFaces = ordered.map(face => clipModelFaceByAxisPlane(face, {
    axis: input.section.axis, coordinate: input.section.at,
    keep: input.section.looking === 'negative' ? 'less-or-equal' : 'greater-or-equal'
  })).filter((f): f is ModelFace3D => f !== null)
  const rawEdges = boundaryMeshEdges(ordered, () => 'secondary')
  const candidates = [...rawEdges, ...details].map(s => retainSegment(s, input.section))
    .filter((s): s is SpatialSegment => s !== null)
  const background = visibleSpatialSegments(candidates, [...retainedFaces, ...cutFaces], basis)
  const cut = boundaryMeshEdges([...cutFaces].sort((a, b) => a.id.localeCompare(b.id)), () => 'cut')
  return {basis, background, cut, retainedFaces}
}
