export const southInletReliefComparison: {
  readonly roughness: number
  readonly receiverWeirCoefficient: number
  readonly carrierRiseM: number
  readonly settingMm: number
  readonly splashMm: number
}

interface HalfRoundCase {
  readonly flowM3s: number
  readonly diameterM: number
  readonly bedM: number
  readonly slope: number
  readonly roughness: number
}

interface HalfRoundState {
  readonly critical: number
  readonly normal: number
  readonly velocityHead: number
}

interface ReverseSleeveCase extends Omit<HalfRoundCase, 'slope'> {
  readonly carrierM: number
  readonly carrierRiseM: number
  readonly lengthM: number
  readonly riseM: number
  readonly entranceLossK: number
  readonly spareAirMM: number
}

export function solveHalfRoundRelief(input: HalfRoundCase): HalfRoundState | null
export function criticalHalfRoundFlow(diameterM: number, depthM: number, bedM: number): number
export function reliefEntranceHeadMm(state: HalfRoundState, entranceLossK: number): number
export function reverseSleeveFlow(input: ReverseSleeveCase): {
  readonly cleanBoreMM: number
  readonly carrierEnvelopeODMM: number
  readonly bedObstructionMM: number
  readonly entranceLossK: number
  readonly chargedHeadMM: number
  readonly reserveToAirLimitMM: number
  readonly ventedCrownRetained: boolean
} | null
export function receiverWeirHeadMm(input: {
  readonly flowM3s: number
  readonly widthM: number
  readonly coefficient: number
}): number
