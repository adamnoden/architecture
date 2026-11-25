/** Pure admission for the bounded H12/RC200 local development comparison. */
export interface WetBeamEndDevelopmentControls {
  readonly endReturnMandrelMm: number
  readonly strutCotangentComparisons: readonly number[]
}
export function readWetBeamEndDevelopmentControls(value: unknown): WetBeamEndDevelopmentControls {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Explicit wet-beam end controls required')
  const input = value as Record<string, unknown>
  const cot = input.strutCotangentComparisons
  if (Object.keys(input).length !== 2 || !Object.hasOwn(input, 'endReturnMandrelMm') || !Object.hasOwn(input, 'strutCotangentComparisons')
    || typeof input.endReturnMandrelMm !== 'number' || !Number.isFinite(input.endReturnMandrelMm)
    || input.endReturnMandrelMm < 48 || input.endReturnMandrelMm >= 200
    || !Array.isArray(cot) || !cot.length || cot.length > 8 || new Set(cot).size !== cot.length
    || cot.some(v => typeof v !== 'number' || !Number.isFinite(v) || v < 1 || v > 2.5)) {
    throw new TypeError('Explicit H12 end mandrel48..<200mm and unique strut cotangents1..2.5 required; no result injection')
  }
  return { endReturnMandrelMm: input.endReturnMandrelMm, strutCotangentComparisons: [...cot] }
}
