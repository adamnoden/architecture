import type { ReferenceHouseSource, RhCompileStatus } from '../reference-house/model.js'
import { compileReferenceHouseBoundaryView } from '../rhc4/compile.js'
import type { RhC4CompileResult } from '../rhc4/compile.js'
import { runCalculationCheck } from '../calculation-slice/compile.js'
import type { CalculationCheckResult } from '../calculation-slice/model.js'
import {
  createReferenceHousePrivateStairInput,
  privateStairGeometryMethod
} from './method.js'
import { rhC5ProofBoundary } from './proof-boundary.js'

export interface RhC5CompileResult {
  status: RhCompileStatus
  c4: RhC4CompileResult
  calculations: {
    privateStairGeometry: CalculationCheckResult
  }
  proofBoundary: typeof rhC5ProofBoundary
}

const aggregate = (
  c4: RhC4CompileResult,
  stair: CalculationCheckResult
): RhCompileStatus => {
  if (c4.status === 'FAIL' || stair.status === 'FAIL') return 'FAIL'
  if (c4.status === 'REVIEW' || stair.status === 'UNSUPPORTED') return 'REVIEW'
  return 'PASS'
}

export const compileReferenceHouseTargetCalculations = (
  source: ReferenceHouseSource
): RhC5CompileResult => {
  const c4 = compileReferenceHouseBoundaryView(source)
  const privateStairGeometry = runCalculationCheck(
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
