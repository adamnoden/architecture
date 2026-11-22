/** MITC4 assumed transverse shear from the actual plate displacement field.
 * This uses the native element's tied shear field, never moment differentiation.
 */
import { readFloorSectionCuts } from './structural-floor-cuts.js'

const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const record = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v)
const vector = (v: unknown, n: number): v is number[] => Array.isArray(v) && v.length === n && v.every(finite)
const GAUSS = [-1 / Math.sqrt(3), 1 / Math.sqrt(3)]
const key = (p: readonly number[]) => `${p[0]},${p[1]}`
const shapes = (xi: number, eta: number, width: number, height: number) => {
  const signs = [[-1,-1],[1,-1],[1,1],[-1,1]]
  return { n:signs.map(([a,b]) => (1+a!*xi)*(1+b!*eta)/4),
    dx:signs.map(([a,b]) => a!*(1+b!*eta)/(2*width)),
    dy:signs.map(([a,b]) => b!*(1+a!*xi)/(2*height)) }
}

/** Input is nativeVertical from the existing floor-section response. Units: mm/rad. */
export function recoverFloorTransverseShear(input: unknown) {
  if (!record(input) || !record(input.request) || !record(input.request.plateLaw)
    || !record(input.plate) || !record(input.plate.physicalRecovery)) throw new Error('Actual native plate law, material cells and physical displacement recovery required')
  const law = input.request.plateLaw, plate = input.plate, physical = plate.physicalRecovery as Record<string, unknown>
  if (!['elasticModulusMPa','poissonRatio','thicknessMm','flexuralFactor','shearFactor'].every(k => finite(law[k]))
    || Number(law.elasticModulusMPa) <= 0 || Number(law.thicknessMm) <= 0 || Number(law.poissonRatio) < 0 || Number(law.poissonRatio) >= 0.5
    || Number(law.flexuralFactor) <= 0 || Number(law.flexuralFactor) > 1 || Number(law.shearFactor) <= 0 || Number(law.shearFactor) > 1
    || !Array.isArray(plate.cellsXYMm) || !plate.cellsXYMm.length || !Array.isArray(physical.points)
    || !finite(physical.physicalPlateStrainEnergyKNmm) || physical.physicalPlateStrainEnergyKNmm < 0) throw new Error('Finite actual MITC4 law and nonnegative physical plate energy required')
  const points = new Map<string, number[]>()
  for (const p of physical.points) {
    if (!record(p) || !vector(p.xyMm,2) || !vector(p.displacementMmRad,3) || points.has(key(p.xyMm))) throw new Error('Unique finite physical plate points and [w,rx,ry] required')
    points.set(key(p.xyMm),p.displacementMmRad)
  }
  const e = Number(law.elasticModulusMPa)/1000, nu = Number(law.poissonRatio), t = Number(law.thicknessMm)
  const shearRigidityKNPerMm = e/(2*(1+nu))*Number(law.shearFactor)*t
  const d = e*Number(law.flexuralFactor)*t**3/(12*(1-nu*nu))
  let shearEnergy = 0, bendingEnergy = 0
  const used = new Set<string>()
  const cells = plate.cellsXYMm.map((r: unknown) => {
    if (!vector(r,4) || r[2]! <= r[0]! || r[3]! <= r[1]! || used.has(JSON.stringify(r))) throw new Error('Positive unique physical plate cells required')
    used.add(JSON.stringify(r))
    const [x0,y0,x1,y1] = r as [number,number,number,number], width=x1-x0, height=y1-y0
    const corners = [[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(p => {
      const value = points.get(key(p)); if (!value) throw new Error('Missing actual physical plate corner displacement')
      return value
    })
    const rawGamma = (xi: number, eta: number, axis: number) => {
      const s=shapes(xi,eta,width,height)
      return corners.reduce((sum,u,i) => sum+(axis===0 ? s.dx[i]!*u[0]!+s.n[i]!*u[2]! : s.dy[i]!*u[0]!-s.n[i]!*u[1]!),0)
    }
    const gx = [-1,1].map(eta => rawGamma(0,eta,0)), gy = [-1,1].map(xi => rawGamma(xi,0,1))
    const gaussSamples = GAUSS.flatMap(xi => GAUSS.map(eta => {
      const sx=((1-eta)*gx[0]!+(1+eta)*gx[1]!)/2, sy=((1-xi)*gy[0]!+(1+xi)*gy[1]!)/2
      const s=shapes(xi,eta,width,height)
      const kx=corners.reduce((sum,u,i)=>sum+s.dx[i]!*u[2]!,0)
      const ky=-corners.reduce((sum,u,i)=>sum+s.dy[i]!*u[1]!,0)
      const kxy=corners.reduce((sum,u,i)=>sum+s.dy[i]!*u[2]!-s.dx[i]!*u[1]!,0)
      const area=width*height/4
      shearEnergy += shearRigidityKNPerMm*(sx*sx+sy*sy)*area/2
      bendingEnergy += d*(kx*kx+2*nu*kx*ky+ky*ky+(1-nu)*kxy*kxy/2)*area/2
      return { xyMm:[(x0+x1+xi*width)/2,(y0+y1+eta*height)/2],
        assumedShearStrain:[sx,sy], shearKNPerM:[1000*shearRigidityKNPerMm*sx,1000*shearRigidityKNPerMm*sy] }
    }))
    return { rectangleXYMm:[...r], gaussSamples,
      tiedShearStrains:{ gammaXAtEtaMinusPlus:gx,gammaYAtXiMinusPlus:gy } }
  })
  const total=bendingEnergy+shearEnergy, source=physical.physicalPlateStrainEnergyKNmm
  const relativeResidual=Math.abs(total-source)/Math.max(1,Math.abs(source))
  if (relativeResidual > 1e-7) throw new Error('MITC4 recovered bending plus assumed shear does not close actual physical plate energy')
  return { schema:'str-physical-floor-transverse-shear/1' as const, shearRigidityKNPerMm, cells,
    plateLaw:{elasticModulusMPa:Number(law.elasticModulusMPa),poissonRatio:nu,thicknessMm:t,
      flexuralFactor:Number(law.flexuralFactor),shearFactor:Number(law.shearFactor)},
    energy:{ shearStrainEnergyKNmm:shearEnergy,bendingStrainEnergyKNmm:bendingEnergy,reconstructedPhysicalPlateStrainEnergyKNmm:total,
      nativePhysicalPlateStrainEnergyKNmm:source,relativeResidual,maximumRelativeResidual:1e-7 },
    localStressConvergenceProven:false as const, completeJointWrenchAvailable:false as const, resistanceAccepted:false as const,
    scope:'Native MITC4 tied shear: gammaX=dw/dx+ry and gammaY=dw/dy-rx, w positive globalZ. Qx/Qy are the conjugate positive-normal constitutive shear resultants in kN/m. No smoothing, membrane traction, closed joint free body, stress convergence or resistance is supplied.' }
}

/** Integrate the assumed shear on the same authored, positive-normal physical cuts. */
export function recoverFloorTransverseCuts(field: ReturnType<typeof recoverFloorTransverseShear>, input: unknown) {
  if (field.schema !== 'str-physical-floor-transverse-shear/1' || !finite(field.shearRigidityKNPerMm) || field.shearRigidityKNPerMm<=0 || !Array.isArray(field.cells) || !field.cells.length) throw new Error('Actual MITC4 transverse shear field required')
  return { schema:'str-physical-floor-transverse-cuts/1' as const, cuts:readFloorSectionCuts(input).map(cut => {
    const axis=cut.normal==='x'?0:1, tangent=1-axis
    const intervals=field.cells.flatMap((cell,cellIndex) => {
      const r=cell.rectangleXYMm, lo=Math.max(cut.intervalMm[0],r[tangent]!), hi=Math.min(cut.intervalMm[1],r[tangent+2]!)
      if (!vector(r,4) || r[2]!<=r[0]! || r[3]!<=r[1]!) throw new Error('Finite positive physical shear cell required')
      if (hi<=lo || cut.positionMm<r[axis]! || cut.positionMm>r[axis+2]!) return []
      if (cut.positionMm===r[axis] || cut.positionMm===r[axis+2]) throw new Error(`Ambiguous element-face transverse cut: ${cut.id}; author an interior physical cut`)
      const values=axis===0 ? cell.tiedShearStrains.gammaXAtEtaMinusPlus : cell.tiedShearStrains.gammaYAtXiMinusPlus
      if (!vector(values,2)) throw new Error('Finite tied shear field required')
      const at=(coordinate:number) => {
        const natural=2*(coordinate-r[tangent]!)/(r[tangent+2]!-r[tangent]!)-1
        return 1000*field.shearRigidityKNPerMm*((1-natural)*values[0]!+(1+natural)*values[1]!)/2
      }
      const ends=[at(lo),at(hi)]
      return [{cellIndex,intervalMm:[lo,hi],normalShearEndsKNPerM:ends,signedNormalShearKN:(hi-lo)*(ends[0]!+ends[1]!)/2000}]
    }).sort((a,b)=>a.intervalMm[0]!-b.intervalMm[0]!)
    if (!intervals.length) throw new Error(`Transverse cut has no physical material: ${cut.id}`)
    const gaps:number[][]=[];let end=cut.intervalMm[0]
    for (const row of intervals) {
      if (row.intervalMm[0]!<end-1e-7) throw new Error('Overlapping physical material on transverse cut')
      if (row.intervalMm[0]!>end) gaps.push([end,row.intervalMm[0]!])
      end=row.intervalMm[1]!
    }
    if (end<cut.intervalMm[1]) gaps.push([end,cut.intervalMm[1]])
    return {...cut,materialWidthMm:intervals.reduce((sum,r)=>sum+r.intervalMm[1]!-r.intervalMm[0]!,0),gapsMm:gaps,
      signedNormalShearKN:intervals.reduce((sum,r)=>sum+r.signedNormalShearKN,0),intervals}
  }),completeJointWrenchAvailable:false as const,resistanceAccepted:false as const,
  scope:'Exact line integral of the declared MITC4 assumed transverse shear. Positive normalX/Y follows Qx/Qy; actual material gaps remain absent. Membrane forces and a closed control-volume joint equilibrium remain unsupported.' }
}
