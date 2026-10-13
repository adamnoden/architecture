import { compilePlanSlice } from '../plan-slice/compile.js'
import type { PlanSliceCompileResult } from '../plan-slice/model.js'
import { adaptReferenceHousePlanSource } from '../reference-house/plan-adapter.js'
import type { ReferenceHouseSource } from '../reference-house/model.js'
import { compileStructuralTopology } from '../structure-slice/compile.js'
import type {
  StructuralTopologyCompileResult,
  StructuralTopologySource
} from '../structure-slice/model.js'
import { mm } from '../units.js'
import type { Millimetres } from '../units.js'
import { createReferenceHouseStructuralSource } from './fixture.js'

export interface RhC2CompileResult {
  plan: PlanSliceCompileResult
  structure: StructuralTopologyCompileResult
  floorZoneDepth: Millimetres
  proofBoundary: {
    topology: 'MACHINE-CHECKED'
    adequacy: 'EXTERNAL-NOT-PROVED'
  }
}

export const compileReferenceHouseStructuralView = (
  house: ReferenceHouseSource,
  structuralSource: StructuralTopologySource = createReferenceHouseStructuralSource(house)
): RhC2CompileResult => {
  const plan = compilePlanSlice(adaptReferenceHousePlanSource(house))
  const structure = compileStructuralTopology(structuralSource, plan)
  return {
    plan,
    structure,
    floorZoneDepth: mm(house.levels.firstFfl.value - house.levels.groundCeiling.value),
    proofBoundary: {
      topology: 'MACHINE-CHECKED',
      adequacy: 'EXTERNAL-NOT-PROVED'
    }
  }
}
