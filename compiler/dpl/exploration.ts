import { readFileSync } from 'node:fs'
import { sha256SemanticFingerprint } from '../core/identity.js'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { referenceHouseSourceFingerprint } from '../reference-house/identity.js'
import { compileDeploymentCase } from './compile.js'
import { composeDPL15CCorpusReadiness } from './corpus-candidate-readiness.js'
import { loadB2TargetComposition, loadTargetSlice } from './load.js'
import type { DeploymentCandidateInput } from './model.js'
import { loadWaveCSite, loadWaveCInterfaceContracts, loadWaveCTargetComposition } from './wavec.js'

export const explorationPath = 'project/dpl/exploration/trials.json'
export const explorationResultPath = 'project/dpl/exploration/results.json'
type Range = readonly [number, number, number]
export interface Assumption {
  readonly samples: Range
  readonly basis: string
  readonly replacement: string
}
export interface ExploratoryTrial {
  readonly siteId: string
  readonly sourceRecord: string
  readonly context: string
  readonly shapeBasis: string
  readonly areaAnchorM2: number | null
  readonly widthM: Assumption
  readonly depthM: Assumption
  readonly slopeDeg: Assumption
  readonly accessWidthM: Assumption
  readonly fixedPlacement: {
    readonly centreXM: number
    readonly frontYM: number
    readonly rotationDeg: number
    readonly fflAboveFrontGroundM: number
  }
  readonly unresolved: readonly string[]
}
export interface ExplorationInput {
  readonly schema: 'dpl.exploration.v1'
  readonly authority: 'ASSUMPTION_BASED_EXPLORATION_ONLY'
  readonly decisionBasis: string
  readonly projectCriteria: {
    readonly sideWorkingSpaceM: number
    readonly rearWorkingSpaceM: number
    readonly illustrativeApproachMaxGradient: number
    readonly illustrativeLogisticsWidthM: number
    readonly status: 'PROJECT_TEST_CHOICES_NOT_REGULATORY_LIMITS'
  }
  readonly trials: readonly ExploratoryTrial[]
}

export const readExplorationInput = (): ExplorationInput => JSON.parse(readFileSync(explorationPath, 'utf8'))
const finite = (value: number, label: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${label} must be finite`)
  return value
}
const positive = (value: number, label: string): number => {
  if (finite(value, label) <= 0) throw new Error(`${label} must be positive`)
  return value
}
const requiredText = (value: string, label: string): void => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} requires explicit provenance`)
}

/** These are three declared hypotheses, not a probability distribution or an interval proof. */
export function validateExploration(input: ExplorationInput): void {
  if (input.schema !== 'dpl.exploration.v1' || input.authority !== 'ASSUMPTION_BASED_EXPLORATION_ONLY') {
    throw new Error('Exploratory authority must remain explicit')
  }
  requiredText(input.decisionBasis, 'decisionBasis')
  const criteria = input.projectCriteria
  if (criteria.status !== 'PROJECT_TEST_CHOICES_NOT_REGULATORY_LIMITS') throw new Error('Criteria authority changed')
  for (const [key, value] of Object.entries(criteria)) {
    if (key !== 'status') positive(value as number, key)
  }
  const expected = Array.from({ length: 8 }, (_, i) => `DPL-RP-${String(i + 1).padStart(3, '0')}`)
  if (input.trials.length !== 8 || new Set(input.trials.map(t => t.siteId)).size !== 8 ||
      expected.some(id => !input.trials.some(t => t.siteId === id))) throw new Error('Frozen eight-site corpus required')
  for (const t of input.trials) {
    const site = loadWaveCSite(t.siteId)
    if (t.sourceRecord !== site.recordPath) throw new Error('Exact corpus source record required')
    requiredText(t.context, 'context')
    requiredText(t.shapeBasis, 'shapeBasis')
    if (t.areaAnchorM2 !== null) positive(t.areaAnchorM2, 'areaAnchorM2')
    for (const key of ['widthM', 'depthM', 'slopeDeg', 'accessWidthM'] as const) {
      const a = t[key]
      if (a.samples.length !== 3) throw new Error(`${key}: exactly three declared samples required`)
      a.samples.forEach(v => {
        finite(v, key)
        if (v < 0 || (key !== 'slopeDeg' && v === 0) || (key === 'slopeDeg' && v >= 90)) {
          throw new Error(`Invalid ${key} sample`)
        }
      })
      if (!(a.samples[0] < a.samples[1] && a.samples[1] < a.samples[2])) throw new Error(`Unordered ${key}`)
      requiredText(a.basis, `${key}.basis`)
      requiredText(a.replacement, `${key}.replacement`)
    }
    Object.entries(t.fixedPlacement).forEach(([k, v]) => finite(v, `placement.${k}`))
    if (t.fixedPlacement.frontYM < 0) throw new Error('Front placement must be within the assumed plot')
    if (!t.unresolved.length) throw new Error('Site uncertainty cannot disappear in exploration')
    t.unresolved.forEach(v => requiredText(v, 'unresolved'))
  }
}

/** One already authored placement is tested against every geometry; no searching/recentring. */
export function testPlacement(
  trial: ExploratoryTrial, widthM: number, depthM: number,
  shellWidthM: number, shellDepthM: number, sideWorkingSpaceM: number, rearWorkingSpaceM: number
) {
  const p = trial.fixedPlacement
  const angle = p.rotationDeg * Math.PI / 180
  const corners = [[-shellWidthM / 2, 0], [shellWidthM / 2, 0],
    [shellWidthM / 2, shellDepthM], [-shellWidthM / 2, shellDepthM]]
    .map(([x, y]) => [p.centreXM + x * Math.cos(angle) - y * Math.sin(angle),
      p.frontYM + x * Math.sin(angle) + y * Math.cos(angle)])
  const xs = corners.map(v => v[0]), ys = corners.map(v => v[1])
  const clearancesM = {
    left: Math.min(...xs) + widthM / 2, right: widthM / 2 - Math.max(...xs),
    front: Math.min(...ys), rear: depthM - Math.max(...ys)
  }
  const contained = Object.values(clearancesM).every(v => v >= -1e-9)
  const workingSpace = contained && Math.min(clearancesM.left, clearancesM.right) >= sideWorkingSpaceM - 1e-9 &&
    clearancesM.rear >= rearWorkingSpaceM - 1e-9
  return { clearancesM, contained, workingSpace }
}

export const classifySamples = (values: readonly boolean[]) => {
  if (!values.length) throw new Error('Cannot classify an empty experiment')
  return values.every(Boolean) ? 'HOLDS_AT_ALL_TESTED_SAMPLES' :
    values.some(Boolean) ? 'SENSITIVE_TO_ASSUMPTIONS' : 'FAILS_AT_ALL_TESTED_SAMPLES'
}

export function composeExploration(input = readExplorationInput()) {
  validateExploration(input)
  const source = createReferenceHouseSource()
  const sourceFingerprint = referenceHouseSourceFingerprint(source)
  // Reuse the controlled authored unchanged-RH facts, then check them against today's source.
  const authored = JSON.parse(readFileSync('project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json', 'utf8'))
  const shellWidthM = Number(source.shell.width.value) / 1000
  const shellDepthM = Number(source.shell.depth.value) / 1000
  const c = input.projectCriteria
  const trials = input.trials.map(t => {
    const site = loadWaveCSite(t.siteId)
    const candidate: DeploymentCandidateInput = {
      id: `${t.siteId}-EXPLORATORY-01`, revision: '1',
      authoredSource: { id: explorationPath, revision: '1' },
      referenceHouseSourceFingerprint: sourceFingerprint,
      facts: authored.referenceHouse.boundedConformanceFacts,
      variantSelections: ['RH-V02'], siteInterfaceResponseRefs: ['RH-SI02', 'RH-SI05']
    }
    const borough = site.indexEntry.borough
    const hasLocalTarget = borough === 'Bromley' || borough === 'Croydon'
    const targets = hasLocalTarget ? loadWaveCTargetComposition(borough) : [
      ...loadB2TargetComposition(), loadTargetSlice('project/dpl/targets/england-drainage-waste-water-v1.json', 'ENGLAND_BUILDING_CONTROL')
    ]
    // No assumed geometry, judgement or evidence item enters the verified obligation ledger.
    const ledger = compileDeploymentCase({ assuranceProfile: 'SCREENING', site: site.runtimeSite,
      interfaceContracts: loadWaveCInterfaceContracts(), targets, candidate, proposalFacts: { dwellingStoreys: 2 } })
    const conformance = ledger.candidateConformance
    if (!conformance || !conformance.referenceRevisionMatches || conformance.findings.some(f =>
      f.checkKind !== 'EXTERNAL_OR_UNMODELLED' && f.result !== 'CONFORMS')) {
      throw new Error(`${t.siteId}: unchanged Reference House conformance failed`)
    }
    const geometrySamples = t.widthM.samples.flatMap(widthM => t.depthM.samples.map(depthM => ({
      widthM, depthM, ...testPlacement(t, widthM, depthM, shellWidthM, shellDepthM, c.sideWorkingSpaceM, c.rearWorkingSpaceM)
    })))
    const datumSamples = t.slopeDeg.samples.map(slopeDeg => {
      const riseM = Math.tan(slopeDeg * Math.PI / 180) * shellDepthM
      // Signed front-to-rear plane. Opposite slope is checked explicitly too.
      return { slopeDeg, groundChangeAcrossHouseM: riseM,
        frontFflAboveGroundM: t.fixedPlacement.fflAboveFrontGroundM,
        uphillRearFflAboveGroundM: t.fixedPlacement.fflAboveFrontGroundM - riseM,
        downhillRearFflAboveGroundM: t.fixedPlacement.fflAboveFrontGroundM + riseM,
        implication: 'GRADING_SUPPORT_WATER_RESPONSE_REQUIRES_DESIGN' }
    })
    const approachSamples = [-0.3, 0, 0.3].map(frontGroundErrorM => {
      const heightM = Math.abs(t.fixedPlacement.fflAboveFrontGroundM - frontGroundErrorM)
      const gradient = t.fixedPlacement.frontYM > 0 ? heightM / t.fixedPlacement.frontYM : null
      return { frontGroundErrorM, heightM, directApproachGradient: gradient,
        meetsIllustrativeProjectGradient: gradient !== null && gradient <= c.illustrativeApproachMaxGradient + 1e-9 }
    })
    const accessSamples = t.accessWidthM.samples.map(widthM => ({ widthM,
      meetsIllustrativeLogisticsWidth: widthM >= c.illustrativeLogisticsWidthM }))
    const nominal = testPlacement(t, t.widthM.samples[1], t.depthM.samples[1], shellWidthM, shellDepthM,
      c.sideWorkingSpaceM, c.rearWorkingSpaceM)
    const conditionalResponses = {
      widthRequiredForFixedPlacementM: 2 * Math.max(
        t.widthM.samples[1] / 2 - nominal.clearancesM.left,
        t.widthM.samples[1] / 2 - nominal.clearancesM.right),
      widthRequiredWithChosenSideWorkingSpaceM: 2 * (c.sideWorkingSpaceM + Math.max(
        t.widthM.samples[1] / 2 - nominal.clearancesM.left,
        t.widthM.samples[1] / 2 - nominal.clearancesM.right)),
      depthRequiredWithChosenRearWorkingSpaceM: t.depthM.samples[1] - nominal.clearancesM.rear + c.rearWorkingSpaceM,
      approachLengthAtNominalRiseM: Math.abs(t.fixedPlacement.fflAboveFrontGroundM) / c.illustrativeApproachMaxGradient,
      approachLengthForTestedFrontLevelErrorsM: Math.max(...approachSamples.map(a => a.heightM)) / c.illustrativeApproachMaxGradient,
      minimumFootprintAreaM2: shellWidthM * shellDepthM,
      areaAnchorWouldNeedIncreasePercentForBareFootprint: t.areaAnchorM2 === null ? null :
        Math.max(0, (shellWidthM * shellDepthM / t.areaAnchorM2 - 1) * 100),
      boundary: 'REQUIREMENTS_FOR_THE_STATED_HYPOTHESIS_NOT_PROOF_THAT_A_ROUTE_OR_INTERFACE_CAN_BE_BUILT'
    }
    const jointSamples = geometrySamples.flatMap(g => approachSamples.flatMap(a => accessSamples.map(access => ({
      widthM: g.widthM, depthM: g.depthM, frontGroundErrorM: a.frontGroundErrorM, accessWidthM: access.widthM,
      meetsSelectedProjectChecks: g.workingSpace && a.meetsIllustrativeProjectGradient && access.meetsIllustrativeLogisticsWidth
    }))))
    return {
      siteId: t.siteId, context: t.context, authority: input.authority,
      sourceRecordFingerprint: site.recordFingerprint, assumptionFingerprint: sha256SemanticFingerprint(t),
      areaAnchorM2: t.areaAnchorM2,
      assumedNominalAreaM2: t.widthM.samples[1] * t.depthM.samples[1],
      geometry: { result: classifySamples(geometrySamples.map(g => g.contained)),
        workingSpaceResult: classifySamples(geometrySamples.map(g => g.workingSpace)), samples: geometrySamples },
      datumSamples, approachSamples, accessSamples, conditionalResponses,
      jointProjectChecks: { result: classifySamples(jointSamples.map(j => j.meetsSelectedProjectChecks)),
        sampleCount: jointSamples.length,
        satisfyingWitness: jointSamples.find(j => j.meetsSelectedProjectChecks) ?? null,
        counterexample: jointSamples.find(j => !j.meetsSelectedProjectChecks) ?? null,
        scope: 'GEOMETRY_WORKING_SPACE_DIRECT_APPROACH_AND_WIDTH_ONLY_NOT_DEPLOYMENT' },
      evidenceBackedRuntime: {
        fingerprint: ledger.resultFingerprint,
        localBoroughTarget: hasLocalTarget ? 'BOUNDED_EXISTING_PLUGIN' : 'UNSUPPORTED_LOCAL_TARGET',
        conformanceFingerprint: conformance.resultFingerprint,
        openConformanceClauses: conformance.openClauseIds,
        unresolvedInputs: ledger.unresolvedInputs,
        obligations: ledger.obligations.map(o => ({ id: o.obligationId, result: o.result, methodKind: o.methodKind }))
      },
      unresolved: t.unresolved,
      verifiedCandidateReadiness: 'UNCHANGED_NOT_READY',
      wholeSiteConclusion: 'NOT_ESTABLISHED'
    }
  })
  const lennard = authored.placement.screeningFitEvidence.minimumBoundaryClearanceM as number
  const readiness = composeDPL15CCorpusReadiness()
  if (readiness.counts.ready !== 0) throw new Error('Reconcile exploration with changed empirical readiness before regenerating')
  const payload = {
    schema: 'dpl.explorationResult.v1', authority: input.authority,
    inputFingerprint: sha256SemanticFingerprint(input), referenceHouseFingerprint: sourceFingerprint,
    houseFootprintM: [shellWidthM, shellDepthM], trials,
    lennardFixedPlacementSensitivity: {
      source: 'project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json',
      sourceFingerprint: sha256SemanticFingerprint(authored),
      baseIndexGeometryClearanceM: lennard,
      inwardBoundaryOffsetsM: [0, 0.25, 0.5, 0.75].map(offsetM => ({ offsetM,
        residualClearanceM: lennard - offsetM, containedUnderUniformInwardOffset: lennard >= offsetM })),
      boundary: 'HYPOTHETICAL_UNIFORM_INWARD_OFFSET_NOT_A_STATEMENT_OF_INDEX_ACCURACY_OR_LEGAL_BOUNDARY'
    },
    proofBoundary: {
      verifiedReadyCorpusSites: readiness.counts.ready, corpusSites: readiness.sites.length,
      geometryHypothesesNotMeasuredParcels: true,
      sampleResultsAreNotProbabilities: true,
      untestedIntermediateValuesNotCertified: true,
      wholeSiteCompatibility: 'NOT_ESTABLISHED',
      regulatoryCompliance: 'NOT_ESTABLISHED',
      referenceHouseMutation: false,
      candidateSearch: false,
      externalEvidenceRequirementsRetained: true
    }
  }
  return { ...payload, resultFingerprint: sha256SemanticFingerprint(payload) }
}
