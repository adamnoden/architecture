import type { Millimetres } from '../units.js'

export type AdeOutputProfile = 'BOOK' | 'WALL' | 'PROOF'

export interface AdeRepresentationProfile {
  id: string
  scaleDenominator: number
  output: AdeOutputProfile
}

export const assertAdeRepresentationProfile = (profile: AdeRepresentationProfile): void => {
  if (!profile.id.trim()) throw new Error('ADE representation profile requires a non-empty id.')
  if (!Number.isFinite(profile.scaleDenominator) || profile.scaleDenominator <= 0) {
    throw new Error('ADE representation profile requires a positive finite architectural scale denominator.')
  }
}

/** Convert a real/model-space millimetre length to its true paper length. */
export const modelMmToPaperMm = (value: Millimetres, profile: AdeRepresentationProfile): number => {
  assertAdeRepresentationProfile(profile)
  if (!Number.isFinite(value)) throw new Error('ADE model length must be finite.')
  return value / profile.scaleDenominator
}

/**
 * Paper-space notation is already physical. It does not scale with the model.
 * This helper is intentionally trivial so tests can make that boundary explicit.
 */
export const physicalPaperMm = (value: number): number => {
  if (!Number.isFinite(value) || value < 0) throw new Error('ADE paper metric must be a non-negative finite value.')
  return value
}
