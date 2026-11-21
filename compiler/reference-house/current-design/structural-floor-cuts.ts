/** Fixed physical section cuts through the existing MITC4 recovery.
 * These are demand diagnostics, never a smoothed point peak or a design width.
 */
export interface FloorSectionCut {
  readonly id: string
  readonly normal: 'x' | 'y'
  readonly positionMm: number
  readonly intervalMm: readonly [number, number]
}
type Sample = { xyMm: number[]; momentKNmPerM: number[] }
type Cell = { rectangleXYMm: number[]; gaussSamples: Sample[] }
export interface FloorBendingField {
  readonly cells: readonly Cell[]
  readonly maximumAbsoluteBendingPlusTwistingKNmPerM: number
  readonly localStressConvergenceProven: boolean
}
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const record = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v)

export function readFloorSectionCuts(input: unknown): FloorSectionCut[] {
  if (!Array.isArray(input) || input.length > 64) throw new Error('At most64 explicit floor section cuts required')
  const ids = new Set<string>()
  return input.map(row => {
    if (!record(row) || Object.keys(row).sort().join(',') !== 'id,intervalMm,normal,positionMm'
      || typeof row.id !== 'string' || !/^[A-Za-z][A-Za-z0-9/_.:-]*$/.test(row.id) || ids.has(row.id)
      || !['x', 'y'].includes(String(row.normal)) || !finite(row.positionMm)
      || !Array.isArray(row.intervalMm) || row.intervalMm.length !== 2 || !row.intervalMm.every(finite)
      || row.intervalMm[1]! <= row.intervalMm[0]!) throw new Error('Unique stable ID and finite explicit floor cut geometry required')
    ids.add(row.id)
    return { id: row.id, normal: row.normal as 'x' | 'y', positionMm: row.positionMm,
      intervalMm: [row.intervalMm[0]!, row.intervalMm[1]!] }
  })
}

/** Four Gauss values uniquely recover the bilinear element moment field. */
function momentAt(cell: Cell, x: number, y: number, component: number): number {
  const xs = [...new Set(cell.gaussSamples.map(p => p.xyMm[0]!))].sort((a,b) => a-b)
  const ys = [...new Set(cell.gaussSamples.map(p => p.xyMm[1]!))].sort((a,b) => a-b)
  if (xs.length !== 2 || ys.length !== 2 || cell.gaussSamples.length !== 4
    || new Set(cell.gaussSamples.map(p => JSON.stringify(p.xyMm))).size !== 4) throw new Error('Exact four-point rectangular recovery required')
  let value = 0
  for (const p of cell.gaussSamples) {
    const i = xs.indexOf(p.xyMm[0]!), j = ys.indexOf(p.xyMm[1]!)
    value += p.momentKNmPerM[component]! * (x-xs[1-i]!) / (xs[i]!-xs[1-i]!) * (y-ys[1-j]!) / (ys[j]!-ys[1-j]!)
  }
  return value
}
function absoluteLinearIntegral(a: number, b: number, width: number): number {
  return a*b < 0 ? width*(a*a+b*b)/(2*(Math.abs(a)+Math.abs(b))) : width*(Math.abs(a)+Math.abs(b))/2
}

export function recoverFloorSectionCuts(field: FloorBendingField, input: unknown) {
  const cuts = readFloorSectionCuts(input)
  if (!Array.isArray(field.cells) || !field.cells.length || !finite(field.maximumAbsoluteBendingPlusTwistingKNmPerM)) throw new Error('Actual plate bending recovery required')
  for (const cell of field.cells) {
    const r = cell.rectangleXYMm
    if (!Array.isArray(r) || r.length !== 4 || !r.every(finite) || r[2]! <= r[0]! || r[3]! <= r[1]!
      || !Array.isArray(cell.gaussSamples) || cell.gaussSamples.some((p: Sample) => !Array.isArray(p.xyMm) || p.xyMm.length !== 2 || !p.xyMm.every(finite)
        || !Array.isArray(p.momentKNmPerM) || p.momentKNmPerM.length !== 3 || !p.momentKNmPerM.every(finite))) throw new Error('Finite positive physical plate cells and moments required')
  }
  return { schema: 'str-physical-floor-section-cuts/1' as const,
    rawPointEnvelopeKNmPerM: field.maximumAbsoluteBendingPlusTwistingKNmPerM,
    localStressConvergenceProven: false as const, stripResistanceAccepted: false as const,
    cuts: cuts.map(cut => {
      const axis = cut.normal === 'x' ? 0 : 1, tangent = 1-axis
      const intervals = field.cells.flatMap((cell, cellIndex) => {
        const r = cell.rectangleXYMm, lo = Math.max(cut.intervalMm[0], r[tangent]!), hi = Math.min(cut.intervalMm[1], r[tangent+2]!)
        if (hi <= lo || cut.positionMm < r[axis]! || cut.positionMm > r[axis+2]!) return []
        if (cut.positionMm === r[axis] || cut.positionMm === r[axis+2]) throw new Error(`Ambiguous element-face floor cut: ${cut.id}; author an interior physical cut`)
        const at = (t: number, component: number) => momentAt(cell, axis === 0 ? cut.positionMm : t, axis === 0 ? t : cut.positionMm, component)
        const n = [at(lo, axis), at(hi, axis)], twist = [at(lo, 2), at(hi, 2)], widthM = (hi-lo)/1000
        return [{ cellIndex, intervalMm: [lo, hi], normalMomentEndsKNmPerM: n, twistingMomentEndsKNmPerM: twist,
          signedNormalMomentKNm: widthM*(n[0]!+n[1]!)/2, signedTwistingMomentKNm: widthM*(twist[0]!+twist[1]!)/2,
          absoluteBendingPlusTwistingKNm: absoluteLinearIntegral(n[0]!,n[1]!,widthM)+absoluteLinearIntegral(twist[0]!,twist[1]!,widthM) }]
      }).sort((a,b) => a.intervalMm[0]!-b.intervalMm[0]!)
      if (!intervals.length) throw new Error(`Floor cut has no physical material: ${cut.id}`)
      const gaps: number[][] = []; let end = cut.intervalMm[0]
      for (const row of intervals) {
        if (row.intervalMm[0]! < end-1e-7) throw new Error('Overlapping physical material on floor cut')
        if (row.intervalMm[0]! > end) gaps.push([end,row.intervalMm[0]!])
        end = row.intervalMm[1]!
      }
      if (end < cut.intervalMm[1]) gaps.push([end,cut.intervalMm[1]])
      const materialWidthMm = intervals.reduce((sum,row) => sum+row.intervalMm[1]!-row.intervalMm[0]!,0)
      return { ...cut, grossWidthMm: cut.intervalMm[1]-cut.intervalMm[0], materialWidthMm, gapsMm: gaps,
        signedNormalMomentKNm: intervals.reduce((sum,row) => sum+row.signedNormalMomentKNm,0),
        signedTwistingMomentKNm: intervals.reduce((sum,row) => sum+row.signedTwistingMomentKNm,0),
        absoluteBendingPlusTwistingKNm: intervals.reduce((sum,row) => sum+row.absoluteBendingPlusTwistingKNm,0), intervals }
    }),
    scope: 'Exact integrals of the declared element recovery along authored axis-aligned cuts. Tangent is positiveY for normalX and positiveX for normalY; twisting retains the source Mxy sign. Actual gaps remain absent material. No design width, redistribution, joint resistance, anchorage or mesh convergence is inferred.' }
}
