import { fixedInletProductFacts, type compileFixedInletCandidate } from './inlet-fixed-entry.js'
import { compareFixedInletReceiver, fixedInletReceiverFacts } from './inlet-fixed-receiver.js'
import { compareCompactFixedInletReceiver } from './inlet-fixed-compact-receiver.js'
import { fixedInletOperatingFacts } from './inlet-fixed-operating.js'

type Candidate = ReturnType<typeof compileFixedInletCandidate>
type Compact = ReturnType<typeof compareCompactFixedInletReceiver>
type Point = readonly [number, number, number]
const rounded = (n: number) => Number(n.toFixed(6)) || 0
const section = (a: number, b: number, t: number) => ({
  area: a * b - (a - 2 * t) * (b - 2 * t), inertia: (a * b ** 3 - (a - 2 * t) * (b - 2 * t) ** 3) / 12,
})
const subtract = (a: readonly number[], b: readonly number[]) => a.map((n, i) => n - b[i])
const cross = (a: readonly number[], b: readonly number[]) =>
  [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const weldStress = (a: number, b: number, leg: number, force: readonly number[], moment: readonly number[]) => {
  const throat = leg / Math.SQRT2, length = 2 * (a + b)
  const ix = throat * (2 * a * (b / 2) ** 2 + 2 * b ** 3 / 12)
  const iz = throat * (2 * b * (a / 2) ** 2 + 2 * a ** 3 / 12)
  const normal = force[1] / (throat * length) + moment[0] / (ix / (b / 2)) + moment[2] / (iz / (a / 2))
  const shear = Math.hypot(force[0], force[2]) / (throat * length) + moment[1] * Math.hypot(a / 2, b / 2) / (ix + iz)
  return Math.hypot(normal, Math.sqrt(3) * shear)
}

function settings(value: unknown) {
  const keys = ['deadLoadChallengeN', 'temperatureChangeK', 'preloadEachBoltN']
  if (!value || typeof value !== 'object' || Object.keys(value).length !== keys.length || keys.some(k => !Object.hasOwn(value, k))) {
    throw new Error('Supply only the temporary keeper load, temperature and preload challenges; no evidence injection')
  }
  const s = value as { deadLoadChallengeN: number; temperatureChangeK: number; preloadEachBoltN: number }
  if (Object.values(s).some(n => !Number.isFinite(n)) || s.deadLoadChallengeN < 0 || s.deadLoadChallengeN > 500
    || s.temperatureChangeK < 0 || s.temperatureChangeK > 5 || s.preloadEachBoltN <= 0 || s.preloadEachBoltN > 1800) {
    throw new Error('The cold-service comparison is bounded by 500 N, 5 K and 1800 N preload per bolt')
  }
  return s
}

export const temporaryKeeperReferenceSettings = { deadLoadChallengeN: 500, temperatureChangeK: 5, preloadEachBoltN: 1800 } as const
export const temporaryKeeperCouplingFaceFacts = {
  nativeCadUrl: fixedInletOperatingFacts.coupling.nativeCadUrl,
  stepSha256: '963bad1c9ab3897f0458e0eb19b9fd02d56bc9de62c56d125c5be9c14e30b0a6',
  axialHalfLengthMm: 47.75, endOuterDiameterMm: 31.8, endBoreDiameterMm: 28, maximumBareBodyDiameterMm: 37.8,
  recovery: 'OCP BRepBndLib.AddOptimal and surface integration: STEP faces28/29 at X±47.75 have outer radius15.9 and annular area178.474mm². This is nominal unpressed CAD, not product tolerance or support approval.',
} as const

export function compareTemporaryFixedInletKeeper(candidate: Candidate, compact: Compact, value: unknown = temporaryKeeperReferenceSettings) {
  const s = settings(value), pipe = fixedInletProductFacts.pressurePipe, steel = fixedInletReceiverFacts.steel
  if (temporaryKeeperCouplingFaceFacts.stepSha256 !== fixedInletOperatingFacts.coupling.stepSha256) {
    throw new Error('Reinspect the coupling end faces after its native CAD changes')
  }
  const d = pipe.outerDiameterMm, t = pipe.minimumWallMm, inner = d - 2 * t
  const area = Math.PI * (d * d - inner * inner) / 4
  const thermal = pipe.elasticModulusMpa * area * pipe.expansionMmMK / 1000 * s.temperatureChangeK
  const maximumAxial = s.deadLoadChallengeN + thermal, width = 40, outer = 44
  const allowable = steel.comparisonProofStressMpa / 1.5
  const armSection = section(40, 60, 4), postSection = section(40, 40, 3)
  const normalIntegral = 2 * Math.PI * s.preloadEachBoltN
  const pressure = s.preloadEachBoltN / (d / 2 * width)
  const axialStress = maximumAxial / area
  const idealBuckling = 2 * pipe.elasticModulusMpa / Math.sqrt(3 * (1 - .3 ** 2)) * (t / d) ** 3
  const radialWall = (outer - d) / 2
  const ringHoop = s.preloadEachBoltN / (radialWall * width)
  const ringEarLeverBending = s.preloadEachBoltN * (32 - d / 2) / (width * radialWall ** 2 / 6)
  const ringCombined = Math.hypot(ringHoop + ringEarLeverBending, Math.sqrt(3) * maximumAxial / (2 * width * radialWall))
  const pipeModulus = Math.PI * (d ** 4 - inner ** 4) / 64 / (d / 2)
  const branches = candidate.branches.map(branch => {
    const draw = branch.renewal.translationMm
    if (draw[0] !== 0 || draw[1] <= 0 || draw[2] !== 0 || branch.renewal.pressureState !== 'isolated-drained-zero-pressure') {
      throw new Error('This operation retains the source zero-pressure room-side +Y lower-L draw; no frame handling is substituted')
    }
    const mount = compact.geometry.pipeMounts.find(m => m.branch === branch.branch && m.kind === 'axial-guide')
    const guide = compact.geometry.guides.find(g => g.branch === branch.branch)
    const hood = compact.geometry.hoodReview.find(h => h.branch === branch.branch)
    if (!mount || !guide || !hood || mount.centreMm[2] !== candidate.settings.upperPipeGuideZMm
      || mount.boreDiameterMm !== 29 || mount.outerDiameterMm !== outer || mount.axialHeightMm !== 20
      || mount.centreMm[2] !== guide.armBodyMm[2] + guide.armBodyMm[5] / 2) {
      throw new Error('Requires the actual candidate centred bore29 sliding guide and retained post')
    }
    const point = mount.centreMm as Point, path = branch.pressurePathMm
    const segment = path.slice(1).findIndex((b, i) => path[i][0] === point[0] && b[0] === point[0]
      && path[i][1] === point[1] && b[1] === point[1] && path[i][2] <= point[2] && b[2] >= point[2])
    if (segment < 0) throw new Error('Keeper must lie on the actual straight upper riser')
    const upper = [point, ...path.slice(segment + 1)]
    const upperLength = upper.slice(1).reduce((sum, b, i) => sum + Math.hypot(...subtract(b, upper[i])), 0)
    const knownStockAndFullWaterN = upperLength / 1000 * (pipe.massKgM + Math.PI * inner ** 2 / 4 / 1000) * 9.81
    const plate = mount.mountingPlateBodyMm, arm = guide.armBodyMm, post = guide.postBodyMm
    const originalGuideLedger = compact.mass.ledger.filter(m =>
      ['ring', 'lug', 'ear'].some(part => m.id.startsWith(branch.branch + '-' + part + '-' + point[2])))
    if (originalGuideLedger.length !== 5) throw new Error('Requires the actual ring, two lug and two ear source masses')
    const replacementGripLedger = originalGuideLedger.map(m => {
      const mass = m.id.includes('-ring-') ? Math.PI * (outer ** 2 - d ** 2) / 4 * width * steel.densityKgM3 / 1e9
        : m.massUpperKg * width / (m.id.includes('-lug-') ? mount.rearLugBlanksMm[0][5] : mount.earBlanksMm[0][5])
      return { ...m, massUpperKg: mass, replacement: 'matched40mm-temporary-grip' }
    })
    const fixtureGravityWrenches = replacementGripLedger.map(m => ({ pointMm: m.pointMm as readonly number[],
      forceN: [0, 0, -m.massUpperKg * 9.81], momentNmm: [0, 0, 0] }))
    const localForceBound = maximumAxial + replacementGripLedger.reduce((sum, m) => sum + m.massUpperKg * 9.81, 0)
    const interfaces = {
      mountingPlate: [point[0], plate[1] + plate[4], point[2]],
      guideArmRoot: [point[0], arm[1], point[2]],
      guidePostBase: [point[0], post[1] + post[4] / 2, post[2]],
    }
    const cases = [-1, 1].map(sign => {
      const force = [0, 0, sign * thermal - s.deadLoadChallengeN]
      const reactions = Object.fromEntries(Object.entries(interfaces).map(([id, origin]) => {
        const moment = cross(subtract(point, origin), force), total = [...force]
        for (const fixture of fixtureGravityWrenches) {
          const moved = cross(subtract(fixture.pointMm, origin), fixture.forceN)
          for (let i = 0; i < 3; i++) { total[i] += fixture.forceN[i]; moment[i] += moved[i] }
        }
        const reaction = total.map(n => -n), couple = moment.map(n => -n)
        return [id, { pointMm: origin, forceN: reaction.map(rounded), momentNmm: couple.map(rounded),
          forceResidualN: total.map((n, i) => rounded(n + reaction[i])),
          momentResidualNmm: moment.map((n, i) => rounded(n + couple[i])) }]
      }))
      return { sign, appliedWrench: { pointMm: point, forceN: force.map(rounded), momentNmm: [0, 0, 0] }, reactions }
    })
    const lever = (id: keyof typeof interfaces) => Math.abs(point[1] - interfaces[id][1])
    const armStress = localForceBound * lever('guideArmRoot') / (armSection.inertia / 30)
      + Math.sqrt(3) * localForceBound / armSection.area
    const postEulerN = Math.PI ** 2 * steel.elasticModulusMpa * postSection.inertia / (2 * post[5]) ** 2
    const postMagnification = localForceBound < postEulerN ? 1 / (1 - localForceBound / postEulerN) : Infinity
    const postStress = localForceBound / postSection.area + localForceBound * lever('guidePostBase') / (postSection.inertia / 20) * postMagnification
    const plateStress = 6 * localForceBound * lever('mountingPlate') / (40 * 12 ** 2)
    const lugStress = localForceBound * lever('mountingPlate') / (2 * 6 * width ** 2 / 6)
    const boltStress = Math.hypot(s.preloadEachBoltN / 58, Math.sqrt(3) * localForceBound / 4 / 58)
    const earStress = s.preloadEachBoltN * 10 / (width * 12 ** 2 / 6)
    const armWeld = weldStress(40, 60, 4, [0, 0, localForceBound], [localForceBound * lever('guideArmRoot'), 0, 0])
    const postWeld = weldStress(40, 40, 3, [0, localForceBound, 0], [localForceBound * lever('guidePostBase'), 0, 0])
    const stresses = { arm: armStress, post: postStress, mountingPlate: plateStress, rearLug: lugStress,
      bolt: boltStress, ear: earStress, armReturnedWeld: armWeld, postBaseReturnedWeld: postWeld }
    const keeperBottom = point[2] - width / 2, keeperTop = point[2] + width / 2
    const hoodTop = hood.currentBodyMm[2] + hood.currentBodyMm[5]
    const latestCut = Math.max(...branch.repairZones.map(z => z.secondPlainPipeCutZMm))
    const couplingParkTop = latestCut + fixedInletProductFacts.repairCoupling.lengthMm
    const toolPoses = candidate.operatingProof.toolPoses.filter(p => p.branch === branch.branch && p.joint === 'upper-riser')
    const jawTop = Math.max(...toolPoses.map(p => p.jawOpeningClosedAnd100mmApproachBoundMm[2] + p.jawOpeningClosedAnd100mmApproachBoundMm[5]))
    const firstBendSegment = upper.slice(1).findIndex((b, i) => Math.abs(b[0] - upper[i][0]) > 1e-6 || Math.abs(b[1] - upper[i][1]) > 1e-6)
    const bendStart = firstBendSegment < 0 ? null : upper[firstBendSegment]
    const box = [point[0] - outer / 2, point[1] - outer / 2, keeperBottom, outer, outer, width]
    const initialCouplings = branch.repairZones.map(zone => ({ id: zone.id,
      centreZMm: zone.firstInstallationCouplingCentreZMm,
      bareCadBodyZMm: [zone.firstInstallationCouplingCentreZMm - temporaryKeeperCouplingFaceFacts.axialHalfLengthMm,
        zone.firstInstallationCouplingCentreZMm + temporaryKeeperCouplingFaceFacts.axialHalfLengthMm] }))
    const initialUpper = initialCouplings.find(zone => zone.id === 'upper-cut')!
    const yokeThickness = 12, yokeBore = 29, yokeWidth = 50, rodPitch = 64
    const seatArea = Math.PI * (temporaryKeeperCouplingFaceFacts.endOuterDiameterMm ** 2 - yokeBore ** 2) / 4
    const yokeStressPerNewton = 1.5 * rodPitch / 4 / ((yokeWidth - yokeBore) * yokeThickness ** 2 / 6)
    const valveBox = branch.components.find(part => part.id === 'fixed-potable-valve-reservation')!.boxMm
    const yokeBottom = initialUpper.bareCadBodyZMm[0] - yokeThickness
    const yokeMass = (90 * yokeWidth - Math.PI * yokeBore ** 2 / 4) * yokeThickness * steel.densityKgM3 / 1e9
    const rodsMass = 2 * Math.PI * 10 ** 2 / 4 * Math.max(0, point[2] - initialUpper.bareCadBodyZMm[0]) * steel.densityKgM3 / 1e9
    const rodBodies = [-1, 1].map(side => [point[0] + side * rodPitch / 2 - 5, point[1] - 5,
      initialUpper.bareCadBodyZMm[0], 10, 10, point[2] - initialUpper.bareCadBodyZMm[0]])
    const rodToolReview = candidate.operatingProof.toolPoses.filter(p => p.branch === branch.branch && p.joint !== 'exterior-tail').map(p => ({
      cycle: p.cycle, joint: p.joint,
      after5Mm: rounded(Math.min(...rodBodies.map(rod => Math.max(...[0, 1, 2].map(i => Math.max(
        rod[i] - p.jawOpeningClosedAnd100mmApproachBoundMm[i] - p.jawOpeningClosedAnd100mmApproachBoundMm[i + 3],
        p.jawOpeningClosedAnd100mmApproachBoundMm[i] - rod[i] - rod[i + 3]))))) - 5),
    }))
    return {
      branch: branch.branch, pointMm: point, bodyMm: box, replacesNormalGuideDuringColdServiceOnly: true,
      lowerLDrawTranslationMm: draw, mainFrameRetainedDuringRenewal: true,
      requiredChanges: 'Remove the bore29 running spacers and guide halves; use a separately identified matched40mm collar,40mm ears and independent axial attachment to the same mounting plate. Do not treat the existing20mm sliding guide as fixed.',
      upperRoute: { lengthMm: rounded(upperLength), knownBareStockAndFullWaterWeightN: rounded(knownStockAndFullWaterN),
        remainingDeadLoadChallengeN: rounded(s.deadLoadChallengeN - knownStockAndFullWaterN), actualCompletePayloadBoundEstablished: false },
      replacementGripLedger, fixtureGravityWrenches, cases,
      localSteelLoadBoundIncludingGripN: rounded(localForceBound),
      localSteelStressMpa: Object.fromEntries(Object.entries(stresses).map(([k, n]) => [k, rounded(n)])),
      postStability: { cantileverEffectiveLengthFactor: 2, actualBodyLengthMm: post[5], idealEulerForceN: rounded(postEulerN),
        loadToEulerRatio: rounded(localForceBound / postEulerN), elasticMomentMagnification: rounded(postMagnification) },
      conditionalLocalSteelPass: Object.values(stresses).every(n => n <= allowable),
      geometry: { keeperZMm: [keeperBottom, keeperTop], guideArmZMm: [arm[2], arm[2] + arm[5]], mountingPlateZMm: [plate[2], plate[2] + plate[5]],
        hoodTopZMm: hoodTop, keeperToHoodAfter3MetalAnd5SettingMm: rounded(keeperBottom - hoodTop - 8),
        latestCouplingParkZMm: [latestCut, couplingParkTop], keeperToCouplingParkAfter5Mm: rounded(keeperBottom - couplingParkTop - 5),
        upperJawTopZMm: rounded(jawTop), keeperToUpperNativeJawAfter5Mm: rounded(keeperBottom - jawTop - 5),
        installationToolAndHandSweepQualified: false },
      positiveAlternatives: {
        couplingShoulder: { initialCouplings, availableForLowerLOnlyRenewal: true, newUpperRepairSleeveAvailableBeforeFirstUpperCut: false,
          supportsRetainedUpperStubAfterUpperCut: false,
          initialUpperYoke: { bodyMm: [point[0] - 45, point[1] - yokeWidth / 2, yokeBottom, 90, yokeWidth, yokeThickness],
            boreDiameterMm: yokeBore, rodAxisOffsetXMm: rodPitch / 2, rodNominalDiameterMm: 10,
            endFaceSeatAreaMm2: rounded(seatArea), endFacePressureMpa: rounded(maximumAxial / seatArea),
            knownYokeAndSolidRodUpperMassKg: rounded(yokeMass + rodsMass),
            rodBodiesMm: rodBodies, nativeJawReview: rodToolReview,
            lowerLDrawVerticalClearAfter5Mm: rounded(yokeBottom - Math.max(...branch.renewal.sweptCentrelineBoxesMm.map(box => box[2] + box[5])) - branch.renewal.temporaryMaximumRadiusMm - 5),
            lowerRepairJawClear: rodToolReview.filter(p => p.joint === 'lower-riser').every(p => p.after5Mm >= 0),
            upperRepairJawClear: rodToolReview.filter(p => p.joint === 'upper-riser').every(p => p.after5Mm >= 0),
            netSectionBeamStressWith1p5LocalFactorMpa: rounded(yokeStressPerNewton * (maximumAxial + yokeMass * 9.81)),
            rodAxialStressEachMpa: rounded((maximumAxial + (yokeMass + rodsMass) * 9.81) / 2 / 58),
            rodToBareCouplingAfter5Mm: rounded(rodPitch / 2 - 5 - temporaryKeeperCouplingFaceFacts.maximumBareBodyDiameterMm / 2 - 5),
            toReservedValveTopAfter5Mm: rounded(yokeBottom - valveBox[2] - valveBox[5] - 5),
            conditionalYokeSteelPass: yokeStressPerNewton * (maximumAxial + yokeMass * 9.81) <= allowable,
            completeRodClevisFrameReplayRequired: true,
            pipeToFittingAxialRetentionEstablished: false, pressedFaceBearingAndTubeContactEstablished: false,
            boundary: 'Temporary positive capture of an EXISTING initial coupling only, after covers/jacket are removed. The rods require actual clevis/ear connections to the supported guide bracket. It can remain for lower-L work, but occupies the upper-repair tool corridor and does not hold the upper stub after that upper cut. No catalogue pressure rating is transferred to this support use.' },
          reason: 'Initial couplings below the upper cut exist before lower-L renewal; the retained pipe above that cut has no such shoulder. External capture still requires real fitting-to-pipe axial retention and bearing proof.' },
        formedBendOrTerminalCradle: { existingFirstBendTangentStartMm: bendStart,
          additionalHeightAboveGuideMm: bendStart ? rounded(bendStart[2] - point[2]) : null,
          principle: 'Use a separate temporary wall-supported cradle which mechanically encloses existing non-straight upper pipe/terminal geometry before cutting. Its positive path must bypass the plain-riser friction grip.',
          requirements: 'Demonstrate actual formed-bend or terminal bearing, tube local bending/ovalisation, the complete temporary frame/wall reactions, setting and pipe protection, room/tool clearance and an uninterrupted support handover. No pressure fitting is assigned a support rating.',
          unspreadRadiusLeverAdverseControl: { assumedLeverMm: candidate.settings.pipeBendRadiusMm,
            axialPlusStraightTubeBendingStressMpa: rounded(axialStress + maximumAxial * candidate.settings.pipeBendRadiusMm / pipeModulus),
            pass: axialStress + maximumAxial * candidate.settings.pipeBendRadiusMm / pipeModulus <= allowable,
            scope: 'Authored single-lever counterexample, not the solved formed bend: a bare hook cannot be credited as a distributed cradle. Bend stress intensification and local contact are omitted.' },
          existing40mmGuideEnvelopeSufficient: false, capacityEstablished: false },
      },
    }
  })
  if (branches.length !== 2) throw new Error('The temporary challenge requires the two actual independent branches')
  const upperPlate = compact.geometry.backplates.find(p => p.levelZMm === Math.max(...compact.geometry.rail.levelsZMm))!
  const anchorRows = upperPlate.anchorAxesMm.map(p => p[2]).sort((a, b) => a - b)
  const spacing = anchorRows[1] - anchorRows[0], origin = [compact.geometry.jambAxisXMm, compact.geometry.jambFaceYMm, (anchorRows[0] + anchorRows[1]) / 2]
  if (!(spacing > 0)) throw new Error('Requires the actual upper backplate anchor spacing')
  const replacedIds = new Set(branches.flatMap(b => b.replacementGripLedger.map(m => m.id)))
  const steelLoads = [...compact.mass.ledger.filter(m => m.level === upperPlate.levelZMm && !replacedIds.has(m.id)),
    ...branches.flatMap(b => b.replacementGripLedger)]
    .map(m => ({ pointMm: m.pointMm as readonly number[], forceN: [0, 0, -m.massUpperKg * 9.81] as readonly number[], momentNmm: [0, 0, 0] as readonly number[] }))
  const sharedCases = [0, 1].flatMap(a => [0, 1].map(b => {
    const payload = [branches[0].cases[a].appliedWrench, branches[1].cases[b].appliedWrench]
    const about = (loads: readonly { pointMm: readonly number[]; forceN: readonly number[]; momentNmm: readonly number[] }[]) => {
      const force = [0, 0, 0], moment = [0, 0, 0]
      for (const load of loads) {
        const translated = cross(subtract(load.pointMm, origin), load.forceN)
        for (let i = 0; i < 3; i++) { force[i] += load.forceN[i]; moment[i] += translated[i] + load.momentNmm[i] }
      }
      return { pointMm: origin, forceN: force.map(rounded), momentNmm: moment.map(rounded) }
    }
    return { signs: [branches[0].cases[a].sign, branches[1].cases[b].sign], payload: about(payload), withRetainedSteel: about([...payload, ...steelLoads]) }
  }))
  const bounds = (key: 'payload' | 'withRetainedSteel') => ({
    forceN: [0, 1, 2].map(i => Math.max(...sharedCases.map(c => Math.abs(c[key].forceN[i])))),
    momentNmm: [0, 1, 2].map(i => Math.max(...sharedCases.map(c => Math.abs(c[key].momentNmm[i])))),
  })
  const upperJoint = compact.joints.find(j => j.levelZMm === upperPlate.levelZMm)!
  const isolatedScreen = (load: ReturnType<typeof bounds>, gauge: number) => {
    const f = load.forceN, m = load.momentNmm
    const tension = upperJoint.pryingFactor * (f[1] / 2 + m[0] / gauge + m[2] / (2 * upperJoint.compressionToeLeverAfter5Mm))
    const shear = Math.hypot(f[2] / 2, f[0] / 2 + m[1] / gauge)
    return { anchorGaugeMm: gauge, normalTensionEachN: rounded(tension), shearEachN: rounded(shear),
      linearInteraction: rounded(tension / fixedInletReceiverFacts.anchor.isolatedCrackedC20PermissibleTensionAt50N
        + shear / fixedInletReceiverFacts.anchor.isolatedCrackedC20PermissibleShearAt50N),
      boundary: 'Same isolated catalogue and authored prying screen as the owning compact receiver; not the actual anchor group or cage resistance.' }
  }
  const actualSharedScreen = isolatedScreen(bounds('withRetainedSteel'), spacing)
  const sourceInput = compact.sourceContext.input
  const coldInput = { ...sourceInput, branches: sourceInput.branches.map(b => {
    const keeper = branches.find(row => row.branch === b.id)!
    const oldMass = compact.mass.ledger.filter(m => keeper.replacementGripLedger.some(replacement => replacement.id === m.id))
      .reduce((sum, m) => sum + m.massUpperKg, 0)
    const newMass = keeper.replacementGripLedger.reduce((sum, m) => sum + m.massUpperKg, 0)
    return { ...b, pressureEndForceN: 0, fullyRestrainedThermalForceN: 0, knownStockMassKg: 0,
      guidedThermalActions: {
        fixedPointWrench: { ...b.guidedThermalActions!.fixedPointWrench, forceComponentBoundsN: [0, 0, 0], momentComponentBoundsNmm: [0, 0, 0] },
        guideWrench: { ...b.guidedThermalActions!.guideWrench,
          forceComponentBoundsN: [0, 0, maximumAxial + Math.max(0, newMass - oldMass) * 9.81], momentComponentBoundsNmm: [0, 0, 0] },
      } }
  }) }
  const coldReceiver = compareCompactFixedInletReceiver(compareFixedInletReceiver(coldInput, 'guided-route'), compact.sourceContext.operating)
  return {
    schema: 'had-fixed-inlet-temporary-keeper/1' as const, status: 'blocked-unqualified-axial-grip' as const,
    sourceContext: { candidateSource: candidate.source, compactSource: compact.sourceContext, settings: s },
    challenge: { processPressureBar: 0, deadLoadN: s.deadLoadChallengeN, temperatureChangeK: s.temperatureChangeK,
      thermalSingleLegBoundN: rounded(thermal), maximumAxialN: rounded(maximumAxial), pipeAreaMm2: rounded(area),
      boundary: 'Single axial restrained-leg challenge only; this is not the complete six-axis thermal response of the remaining upper network or a bound on unknown payload/tool actions.' },
    clamp: { heightMm: width, outerDiameterMm: outer, matchedNominalBoreMm: d, boltCount: 2, preloadEachBoltN: s.preloadEachBoltN,
      idealConformalNormalIntegralN: rounded(normalIntegral), minimumRequiredFrictionCoefficient: rounded(maximumAxial / normalIntegral),
      uniformPressureMpa: rounded(pressure), axialTubeStressMpa: rounded(axialStress), hoopPlusAxialStressMpa: rounded(pressure * d / (2 * t) + axialStress),
      idealElasticExternalBucklingMpa: rounded(idealBuckling), idealBucklingComparisonMpa: rounded(idealBuckling / 1.5),
      ringHoopPlusEarLeverAndAxialShearMpa: rounded(ringCombined), conditionalRingSteelPass: ringCombined <= allowable,
      conditionalTubeContactPass: pressure * d / (2 * t) + axialStress <= allowable && pressure <= idealBuckling / 1.5,
      model: 'Ideal conformal hoop p=P/(rL); normal integral2πP. Neither geometry nor bolt torque supplies a measured friction coefficient or retained preload.',
      axialGeometricInterlock: false, actualFrictionAndTubeContactQualified: false, manufacturerInstallationConformityEstablished: false },
    steelComparison: { proofStressMpa: steel.comparisonProofStressMpa, divisor: 1.5, allowableMpa: rounded(allowable), source: steel.source },
    branches, sharedUpperReceiver: { anchorRowsZMm: anchorRows, originMm: origin, cases: sharedCases,
      retainedSteelWeightN: rounded(steelLoads.reduce((sum, m) => sum - m.forceN[2], 0)),
      actualSourceGaugeWithRetainedSteel: actualSharedScreen,
      original160GaugePayloadOnlyAdverseControl: isolatedScreen(bounds('payload'), 160),
      actualIsolatedScreenPass: actualSharedScreen.linearInteraction <= 1,
      actualGroupAndJambCapacityEstablished: false },
    owningReceiverReplay: { scope: 'Cold axial challenge through the existing downstream receiver method only. The replacement collar supplies no admitted grip. Positive replacement-minus-guide mass is applied at the pipe axis as an adverse moment bound; all original steel remains in the producer ledger.',
      upperConnection: coldReceiver.joints.find(j => j.levelZMm === upperPlate.levelZMm),
      localConnections: coldReceiver.local.map(row => ({ branch: row.branch, steelStressMpa: row.steelStressMpa })),
      railPlateAndWeldPass: coldReceiver.internalComparisons.railPlateAndWeldPass,
      localSteelPass: coldReceiver.internalComparisons.localSteelPass,
      isolatedCatalogueScreenPass: coldReceiver.internalComparisons.isolatedCatalogueScreenPass,
      completeSupportCapacity: false },
    completeTemporarySupport: false, installedAcceptance: false,
    sequence: ['Isolate both Lodge branches, verify downstream cuts, drain and prove zero pressure; establish the allowed cold temperature interval.',
      'Expose the actual upper guide/hood working area while the original850point and upper terminal restraints remain. A guide-to-collar changeover must retain lateral control; its installation tools and handover are not qualified by these body clearances.',
      'A collar may receive service credit only after its real axial grip/contact, complete payload and support path are demonstrated; the current calculation supplies no such credit.',
      'Keep the established upper restraint while the lower L follows its actual room-side +Y draw through the open front cap. The rear850arm, rail and frame remain; this is not frame removal or a westward park. Retain the actual saved sleeve park and native press-jaw path.',
      'Complete the new pressure path and independently transfer support before removing temporary restraints; restore the bore29 sliding guide and its real thermal movement. Never charge a temporary locked guide as the ordinary service state.'],
  }
}
