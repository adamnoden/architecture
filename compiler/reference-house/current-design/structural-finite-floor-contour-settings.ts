/** Pure saved-input admission shared by the editor and server-side solver. */
export type FiniteFloorContourSettings = {
  execution: 'deferred' | 'compute'
  pitchMm: number
  youngKNPerM2: number
  poisson: number
  slabVolumeLoadEquivalentKPa: number
}

export const finiteFloorContourDefaults: FiniteFloorContourSettings = {
  execution: 'deferred', pitchMm: 140, youngKNPerM2: 33e6,
  poisson: .2, slabVolumeLoadEquivalentKPa: 0,
}

export function readFiniteFloorContourSettings(value: unknown): FiniteFloorContourSettings {
  const x = value as Record<string, unknown> | null
  const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
  const keys = Object.keys(finiteFloorContourDefaults)
  if (!x || typeof x !== 'object' || Array.isArray(x)
    || Object.keys(x).length !== keys.length || keys.some(key => !Object.hasOwn(x, key))
    || !['deferred', 'compute'].includes(x.execution as string)
    || ![140, 100, 70, 50, 35].includes(x.pitchMm as number)
    || !finite(x.youngKNPerM2) || x.youngKNPerM2 < 1e6 || x.youngKNPerM2 > 1e8
    || !finite(x.poisson) || x.poisson < 0 || x.poisson >= .5
    || !finite(x.slabVolumeLoadEquivalentKPa) || x.slabVolumeLoadEquivalentKPa < 0 || x.slabVolumeLoadEquivalentKPa > 10) {
    throw new TypeError('Explicit bounded finite contour controls required; no local acceptance or injected matrix')
  }
  return { ...x } as FiniteFloorContourSettings
}
