export interface StudyDryProfile {
  readonly plate: number
  readonly structureFit: number
  readonly openDryRelease: number
}

export function studyDrySeam(width: number, lining: number, joint: number, setting: number,
  profile: StudyDryProfile, retainedFrameWidth: number): {
  readonly nested: number
  readonly additionalInset: number
  readonly inset: number
  readonly remainingFrameWidth: number
  readonly nominalDryReleaseAfterSettings: number
  readonly retainedFrameClearanceEachJamb: number
}
