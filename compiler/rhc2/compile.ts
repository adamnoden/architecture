import { compilePlanSlice } from '../plan-slice/compile.js'
import type { PlanSliceCompileResult } from '../plan-slice/model.js'
import { compileReferenceHouse } from '../reference-house/compile.js'
import { adaptReferenceHousePlanSource } from '../reference-house/plan-adapter.js'
import type {
  ReferenceHouseCompileResult,
  ReferenceHouseSource,
  RhCompileStatus
} from '../reference-house/model.js'
import { compileStructuralTopology } from '../structure-slice/compile.js'
import type {
  StructuralTopologyCompileResult,
  StructuralTopologySource
} from '../structure-slice/model.js'
import { mm } from '../units.js'
import type { Millimetres } from '../units.js'
import { createReferenceHouseStructuralSource } from './fixture.js'

export interface RhC2CompileResult {
  status: RhCompileStatus
  house: ReferenceHouseCompileResult
  plan: PlanSliceCompileResult
  structure: StructuralTopologyCompileResult
  floorZoneDepth: Millimetres
  proofBoundary: {
    topology: 'MACHINE-CHECKED'
    adequacy: 'EXTERNAL-NOT-PROVED'
  }
}

const aggregate = (
  house: ReferenceHouseCompileResult,
  structure: StructuralTopologyCompileResult
): RhCompileStatus => {
  if (house.status === 'FAIL' || structure.status === 'FAIL') return 'FAIL'
  if (house.status === 'REVIEW' || structure.status === 'REVIEW') return 'REVIEW'
  return 'PASS'
}

export const compileReferenceHouseStructuralView = (
  source: ReferenceHouseSource,
  structuralSource: StructuralTopologySource = createReferenceHouseStructuralSource(source)
): RhC2CompileResult => {
  const house = compileReferenceHouse(source)
  const plan = compilePlanSlice(adaptReferenceHousePlanSource(source))
  const structure = compileStructuralTopology(structuralSource, plan)
  return {
    status: aggregate(house, structure),
    house,
    plan,
    structure,
    floorZoneDepth: mm(source.levels.firstFfl.value - source.levels.groundCeiling.value),
    proofBoundary: {
      topology: 'MACHINE-CHECKED',
      adequacy: 'EXTERNAL-NOT-PROVED'
    }
  }
}
