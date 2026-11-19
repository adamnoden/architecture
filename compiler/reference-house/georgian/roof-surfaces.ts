import type {ModelFace3D, ModelPoint3D} from '../../publication-drawing/projection-3d.js'

/** Source-owned geometry parameters for a square twin-pitch ring roof.
 * Views project this same mesh; drawing adapters must not invent roof silhouettes. */
export interface RingRoofSource {
  shell: number
  courtInset: number
  ridgeInset: number
  overhang: number
  eaves: number
  pitchDeg: number
  buildDepth: number
}
function validate(s: RingRoofSource): void {
  if (!Object.values(s).every(v => Number.isFinite(v)) ||
      s.shell <= 0 || s.courtInset <= 0 || s.courtInset * 2 >= s.shell ||
      s.ridgeInset <= 0 || s.ridgeInset >= s.courtInset ||
      s.overhang < 0 || s.courtInset + s.overhang >= s.shell / 2 ||
      s.eaves <= 0 || s.pitchDeg <= 0 || s.pitchDeg >= 90 || s.buildDepth <= 0) {
    throw Error('Invalid square ring roof geometry')
  }
}
const point = (x: number, y: number, z: number): ModelPoint3D => ({x, y, z})

/** Same architectural height law for elevations, sections and intact roof fields. */
export function ringRoofHeight(s: RingRoofSource, x: number, y: number): number {
  validate(s)
  if (!Number.isFinite(x) || !Number.isFinite(y)) throw Error('Invalid ring roof coordinate')
  const d = Math.min(x, y, s.shell - x, s.shell - y)
  return ringRoofHeightAtDistance(s,d)
}
/** Height at a known nearest-edge distance, shared with elevation profiles. */
export function ringRoofHeightAtDistance(s:RingRoofSource,d:number):number {
  validate(s)
  if (!Number.isFinite(d)) throw Error('Invalid ring roof distance')
  return s.eaves + Math.min(d, s.courtInset - d) * Math.tan(s.pitchDeg * Math.PI / 180)
}
/** Previous exterior-isometric face IDs and vertex order are intentionally stable. */
export function roofRingFaces(s: RingRoofSource): ModelFace3D[] {
  validate(s)
  const roofAt = (x: number, y: number) => ringRoofHeight(s,x,y)
  const ring = (a: number) => [[a,a],[s.shell-a,a],[s.shell-a,s.shell-a],[a,s.shell-a]]
  const outer = ring(-s.overhang), ridge = ring(s.ridgeInset), inner = ring(s.courtInset+s.overhang)
  const faces: ModelFace3D[] = []
  for (const [band, a, b] of [['outer',outer,ridge],['inner',ridge,inner]] as const) {
    for (let i = 0; i < 4; i++) {
      const j = (i+1)%4
      const top = [a[i],a[j],b[j],b[i]].map(([x,y])=>point(x,y,roofAt(x,y)))
      const bottom = top.map(p=>({...p,z:p.z-s.buildDepth}))
      const shell = [top,[...bottom].reverse(),...top.map((p,k)=>[p,top[(k+1)%4],bottom[(k+1)%4],bottom[k]])]
      for (const [k,vertices] of shell.entries()) faces.push({id:`roof-${band}-${i}-${k}`,vertices})
    }
  }
  return faces
}
