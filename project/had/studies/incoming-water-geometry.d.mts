export function finiteBends(vertices: readonly (readonly number[])[], radius?: number, maxStepDeg?: number): {
  path: number[][]
  hausdorffError: number
}
export function exactSegmentBoxDistance(a: readonly number[], b: readonly number[], box: readonly number[]): number
