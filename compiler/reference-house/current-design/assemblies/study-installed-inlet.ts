import { sha256SemanticFingerprint } from '../../../core/identity.js'
import type { compileResolvedStudyLinings } from './study-linings.js'

type Inlet = ReturnType<typeof compileResolvedStudyLinings>['grille']['actualRetainedInlet']
type Volume = readonly [number, number, number, number, number, number]

export function compileStudyInstalledInlet(inlet: Inlet, mode: 'retained-plan-projection' | 'wall-hung-candidate', workerTopMm: number, wallFaceYMm: number) {
  if (mode === 'retained-plan-projection') return { state: 'unknown-installed-height', sourceId: inlet.id, installedCarrierMinimumZMm: null } as const
  const { stationDatumMm: [x, y, z], completeOD: diameter, installedNormalMM: installed, finalZ, supportedCarrier: carrier } = inlet
  if (inlet.id !== 'study' || inlet.wall !== 'outer-south' || y !== 0
    || ![x, z, diameter, ...installed, ...finalZ, ...carrier, workerTopMm].every(Number.isFinite)
    || installed.length !== 2 || finalZ.length !== 2 || !(installed[0] < installed[1]) || !(finalZ[0] < finalZ[1])) {
    throw new TypeError('INVALID_BOUND_STUDY_INSTALLED_INLET')
  }
  const frame = { wallFaceYMm, squareTubeMm: 30, wallMm: 3, sideOffsetMm: diameter / 2 + 20,
    backplateHeightMm: 160, backplateWidthMm: 50, backplateThicknessMm: 8,
    collarAllowanceMm: 25, settingMm: 5, serviceSlope: .01 }
  const seatZ = finalZ[0]
  const armBottomZ = seatZ - frame.squareTubeMm
  const backplateBottomZ = seatZ - frame.backplateHeightMm
  const components: { readonly id: string; readonly xyzxyzMm: Volume }[] = [
    { id: 'study-inlet-installed', xyzxyzMm: [x - diameter / 2 - frame.collarAllowanceMm, frame.wallFaceYMm,
      z + installed[0] * frame.serviceSlope - diameter / 2 - frame.collarAllowanceMm,
      x + diameter / 2 + frame.collarAllowanceMm, installed[1], z + installed[1] * frame.serviceSlope + diameter / 2 + frame.collarAllowanceMm] },
    ...[-1, 1].flatMap(sign => {
      const axis = x + sign * frame.sideOffsetMm
      return [
        { id: `study-inlet-carrier/arm/${sign}`, xyzxyzMm: [axis - frame.squareTubeMm / 2, frame.wallFaceYMm, armBottomZ,
          axis + frame.squareTubeMm / 2, carrier[1] + carrier[3], seatZ] as Volume },
        { id: `study-inlet-carrier/backplate/${sign}`, xyzxyzMm: [axis - frame.backplateWidthMm / 2, frame.wallFaceYMm,
          backplateBottomZ, axis + frame.backplateWidthMm / 2, frame.wallFaceYMm + frame.backplateThicknessMm, seatZ] as Volume },
      ]
    }),
    { id: 'study-inlet-carrier/catch-tray', xyzxyzMm: [carrier[0], carrier[1], armBottomZ,
      carrier[0] + carrier[2], carrier[1] + carrier[3], seatZ] },
  ]
  const lowestZMm = Math.min(...components.map(component => component.xyzxyzMm[2]))
  const lengthMm = carrier[1] + carrier[3] - frame.wallFaceYMm
  const secondMomentMm4 = (frame.squareTubeMm ** 4 - (frame.squareTubeMm - 2 * frame.wallMm) ** 4) / 12
  const challengeN = inlet.maximumCompleteMassKG * 9.81 * 2
  const oneArmLossStressMPa = challengeN * lengthMm * (frame.squareTubeMm / 2) / secondMomentMm4
  const oneArmLossTipDeflectionMm = challengeN * lengthMm ** 3 / (3 * 200_000 * secondMomentMm4)
  return {
    state: 'wall-hung-candidate', schema: 'ias-study-installed-inlet-candidate/1', sourceId: inlet.id,
    sourceDigest: sha256SemanticFingerprint({ inlet, mode, workerTopMm, frame }),
    frame, components, wallReserveXZMm: [Math.min(...components.map(component => component.xyzxyzMm[0])), lowestZMm,
      Math.max(...components.map(component => component.xyzxyzMm[3])), Math.max(...components.map(component => component.xyzxyzMm[5]))] as const, installedCarrierMinimumZMm: lowestZMm, workerTopMm,
    verticalWorkerReserveMm: lowestZMm - workerTopMm - frame.settingMm,
    scopedTo: 'Crouched floor-renewal phase only; no simultaneous inlet withdrawal. The new wall-hung assembly is an authored alternative, not an observed or qualified installed system.',
    mechanics: { maximumModuleKg: inlet.maximumCompleteMassKG, challengeN, lengthMm, secondMomentMm4,
      elasticModulusTrialMPa: 200_000, oneArmLossStressMPa, oneArmLossTipDeflectionMm,
      scope: 'Elastic isolated square arm comparison only; backplates, torsion, welds, anchor groups, wall, corrosion and complete capture remain unqualified.' },
    acceptance: { installedEvidence: false, anchorAndCompleteSupport: false, phasePostureVerified: false },
  } as const
}
