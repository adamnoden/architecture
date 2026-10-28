import { compileBoundaryTopology } from '../boundary-slice/compile.js'
import type { BoundaryTopologyCompileResult } from '../boundary-slice/model.js'
import { runCalculationCheck } from '../calculation-slice/compile.js'
import type { CalculationCheckResult } from '../calculation-slice/model.js'
import { compilePlanSlice } from '../plan-slice/compile.js'
import type { PlanSliceCompileResult } from '../plan-slice/model.js'
import { createReferenceHouseStructuralSource } from '../rhc2/fixture.js'
import { rhC2ProofBoundary } from '../rhc2/proof-boundary.js'
import { applyReferenceHouseServiceCoordinationAuthority } from '../rhc3/authority.js'
import { createReferenceHouseServiceSource } from '../rhc3/fixture.js'
import { hardenReferenceHouseServiceTopology } from '../rhc3/hardening.js'
import { rhC3ProofBoundary } from '../rhc3/proof-boundary.js'
import { createReferenceHouseBoundarySource } from '../rhc4/fixture.js'
import {
  deriveReferenceHouseBoundaryCoordination,
  hardenReferenceHouseBoundaryTopology
} from '../rhc4/hardening.js'
import type { RhC4Coordination } from '../rhc4/hardening.js'
import { rhC4ProofBoundary } from '../rhc4/proof-boundary.js'
import {
  createReferenceHousePrivateStairInputFromHouse,
  privateStairGeometryMethod
} from '../rhc5/method.js'
import { rhC5ProofBoundary } from '../rhc5/proof-boundary.js'
import { compileServiceTopology } from '../service-slice/compile.js'
import type { ServiceTopologyCompileResult } from '../service-slice/model.js'
import { compileStructuralTopology } from '../structure-slice/compile.js'
import type { StructuralTopologyCompileResult } from '../structure-slice/model.js'
import { mm } from '../units.js'
import type { Millimetres } from '../units.js'
import { compileReferenceHouseFromPlan } from './compile.js'
import {
  createReferenceHouseCompileIdentity,
  createReferenceHouseLineage
} from './identity.js'
import type {
  ReferenceHouseCompileIdentity,
  ReferenceHouseLineage
} from './identity.js'
import type {
  ReferenceHouseCompileResult,
  ReferenceHouseCoordinationSource,
  RhCompileStatus,
  RhDiagnostic
} from './model.js'
import { adaptReferenceHousePlanSource } from './plan-adapter.js'

export interface ReferenceHouseSystemCoreResult {
  readonly status: RhCompileStatus
  readonly house: ReferenceHouseCompileResult
  readonly plan: PlanSliceCompileResult
  readonly structure: StructuralTopologyCompileResult
  readonly services: ServiceTopologyCompileResult
  readonly boundary: BoundaryTopologyCompileResult
  readonly calculations: {
    readonly privateStairGeometry: CalculationCheckResult
  }
  readonly coordination: {
    readonly boundary: RhC4Coordination
  }
  readonly floorZoneDepth: Millimetres
  readonly diagnostics: {
    readonly house: RhDiagnostic[]
    readonly plan: PlanSliceCompileResult['diagnostics']
    readonly structure: StructuralTopologyCompileResult['diagnostics']
    readonly services: ServiceTopologyCompileResult['diagnostics']
    readonly boundary: BoundaryTopologyCompileResult['diagnostics']
    readonly privateStairGeometry: CalculationCheckResult['diagnostics']
  }
  readonly proof: {
    readonly structure: typeof rhC2ProofBoundary
    readonly services: typeof rhC3ProofBoundary
    readonly boundary: typeof rhC4ProofBoundary
    readonly calculations: typeof rhC5ProofBoundary
  }
}

export interface ReferenceHouseSystemCompileResult extends ReferenceHouseSystemCoreResult {
  readonly identity: ReferenceHouseCompileIdentity
  readonly lineage: ReferenceHouseLineage
}

const aggregate = (
  house: ReferenceHouseCompileResult,
  structure: StructuralTopologyCompileResult,
  services: ServiceTopologyCompileResult,
  boundary: BoundaryTopologyCompileResult,
  privateStairGeometry: CalculationCheckResult
): RhCompileStatus => {
  if (
    house.status === 'FAIL' ||
    structure.status === 'FAIL' ||
    services.status === 'FAIL' ||
    boundary.status === 'FAIL' ||
    privateStairGeometry.status === 'FAIL'
  ) return 'FAIL'

  if (
    house.status === 'REVIEW' ||
    structure.status === 'REVIEW' ||
    services.status === 'REVIEW' ||
    boundary.status === 'REVIEW' ||
    privateStairGeometry.status === 'UNSUPPORTED'
  ) return 'REVIEW'

  return 'PASS'
}

export const compileReferenceHouseSystem = (
  source: ReferenceHouseCoordinationSource
): ReferenceHouseSystemCompileResult => {
  const plan = compilePlanSlice(adaptReferenceHousePlanSource(source))
  const house = compileReferenceHouseFromPlan(source, plan)

  const structuralSource = createReferenceHouseStructuralSource(source)
  const structure = compileStructuralTopology(structuralSource, plan)

  const authoredServiceSource = createReferenceHouseServiceSource(source)
  const serviceSource = applyReferenceHouseServiceCoordinationAuthority(authoredServiceSource)
  const baseServices = compileServiceTopology(serviceSource, plan, structure)
  const services = hardenReferenceHouseServiceTopology(serviceSource, baseServices, plan, structure)

  const boundarySource = createReferenceHouseBoundarySource(source, plan, services)
  const baseBoundary = compileBoundaryTopology(boundarySource, plan, services)
  const boundaryUpstream = { plan, services }
  const boundary = hardenReferenceHouseBoundaryTopology(source, boundaryUpstream, baseBoundary)
  const boundaryCoordination = deriveReferenceHouseBoundaryCoordination(source, boundaryUpstream)

  const privateStairGeometry = runCalculationCheck(
    privateStairGeometryMethod,
    createReferenceHousePrivateStairInputFromHouse(house)
  )

  const core: ReferenceHouseSystemCoreResult = {
    status: aggregate(house, structure, services, boundary, privateStairGeometry),
    house,
    plan,
    structure,
    services,
    boundary,
    calculations: { privateStairGeometry },
    coordination: { boundary: boundaryCoordination },
    floorZoneDepth: mm(source.levels.firstFfl.value - source.levels.groundCeiling.value),
    diagnostics: {
      house: house.diagnostics,
      plan: plan.diagnostics,
      structure: structure.diagnostics,
      services: services.diagnostics,
      boundary: boundary.diagnostics,
      privateStairGeometry: privateStairGeometry.diagnostics
    },
    proof: {
      structure: rhC2ProofBoundary,
      services: rhC3ProofBoundary,
      boundary: rhC4ProofBoundary,
      calculations: rhC5ProofBoundary
    }
  }

  return {
    ...core,
    identity: createReferenceHouseCompileIdentity(source, core, privateStairGeometryMethod),
    lineage: createReferenceHouseLineage(source, core)
  }
}
