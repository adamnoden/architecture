import type { ReferenceHouseSource, RhCompileStatus } from '../reference-house/model.js'
import { compileReferenceHouseBoundaryView } from '../rhc4/compile.js'
import type { RhC4CompileResult } from '../rhc4/compile.js'
import { runTargetCheck } from '../target-slice/compile.js'
import type { TargetCheckResult } from '../target-slice/model.js'
import {
  createReferenceHousePrivateStairInput,
  privateStairGeometryMethod
} from './method.js'

export const rhC5ProofBoundary = {
  selectedNumericTargetAlignment: 'MACHINE-CHECKED',
  approvedDocumentGuidanceAlignment: 'BOUNDED-METHOD-ONLY',
  buildingRegulationsCompliance: 'NOT-PROVED',
  wholeBuildingTechnicalAdequacy: 'EXTERNAL-NOT-PROVED'
} as const

export interface RhC5CompileResult {
  status: RhCompileStatus
  c4: RhC4CompileResult
  calculations: {
    privateStairGeometry: TargetCheckResult
  }
  proofBoundary: typeof rhC5ProofBoundary
}

const aggregate = (
  c4: RhC4CompileResult,
  stair: TargetCheckResult
): RhCompileStatus => {
  if (c4.status === 'FAIL' || stair.status === 'FAIL') return 'FAIL'
  if (c4.status === 'REVIEW' || stair.status === 'UNSUPPORTED') return 'REVIEW'
  return 'PASS'
}

export const compileReferenceHouseTargetCalculations = (
  source: ReferenceHouseSource
): RhC5CompileResult => {
  const c4 = compileReferenceHouseBoundaryView(source)
  const privateStairGeometry = runTargetCheck(
    privateStairGeometryMethod,
    createReferenceHousePrivateStairInput(c4)
  )

  return {
    status: aggregate(c4, privateStairGeometry),
    c4,
    calculations: { privateStairGeometry },
    proofBoundary: rhC5ProofBoundary
  }
}
