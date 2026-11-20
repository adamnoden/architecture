export function finiteBends(vertices: readonly (readonly number[])[], radius?: number, maxStepDeg?: number): {
  path: [number,number,number][]
  hausdorffError: number
  bends: { vertex: readonly number[]; angleDeg: number; tangent: number }[]
}
export function exactSegmentBoxDistance(a: readonly number[], b: readonly number[], box: readonly number[]): number
