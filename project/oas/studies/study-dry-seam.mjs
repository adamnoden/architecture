/** Nominal symmetric jamb section. This method does not size the window or the arch head. */
export function studyDrySeam(width, lining, joint, setting, profile, retainedFrameWidth) {
  const nested = profile.plate + profile.structureFit + profile.openDryRelease
  const additionalInset = nested + setting - joint
  const inset = lining + nested + setting
  const remainingFrameWidth = width - 2 * inset
  if (remainingFrameWidth <= 0) throw new RangeError('No nominal frame width remains inside the dry seam')
  return {
    nested, additionalInset, inset, remainingFrameWidth,
    nominalDryReleaseAfterSettings: profile.openDryRelease - setting,
    retainedFrameClearanceEachJamb: (remainingFrameWidth - retainedFrameWidth) / 2,
  }
}
