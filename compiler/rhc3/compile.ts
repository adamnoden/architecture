import { compileReferenceHouseStructuralView } from '../rhc2/compile.js'
import type { RhC2CompileResult } from '../rhc2/compile.js'
import type { ReferenceHouseSource, RhCompileStatus } from '../reference-house/model.js'
import { compileServiceTopology } from '../service-slice/compile.js'
import type { ServiceTopologyCompileResult, ServiceTopologySource } from '../service-slice/model.js'
import { applyReferenceHouseServiceCoordinationAuthority } from './authority.js'
import { createReferenceHouseServiceSource } from './fixture.js'
import { hardenReferenceHouseServiceTopology } from './hardening.js'

export interface RhC3CompileResult {
  status: RhCompileStatus
  c2: RhC2CompileResult
  services: ServiceTopologyCompileResult
  proofBoundary: {
    topology: 'MACHINE-CHECKED'
    performance: 'EXTERNAL-NOT-PROVED'
  }
}

const aggregate = (
  c2: RhC2CompileResult,
  services: ServiceTopologyCompileResult
): RhCompileStatus => {
  if (c2.status === 'FAIL' || services.status === 'FAIL') return 'FAIL'
  if (c2.status === 'REVIEW' || services.status === 'REVIEW') return 'REVIEW'
  return 'PASS'
}

export const compileReferenceHouseServiceView = (
  source: ReferenceHouseSource,
  serviceSource: ServiceTopologySource = createReferenceHouseServiceSource(source)
): RhC3CompileResult => {
  const c2 = compileReferenceHouseStructuralView(source)
  const authoritativeServiceSource = applyReferenceHouseServiceCoordinationAuthority(serviceSource)
  const baseServices = compileServiceTopology(authoritativeServiceSource, c2.plan, c2.structure)
  const services = hardenReferenceHouseServiceTopology(
    authoritativeServiceSource,
    baseServices,
    c2.plan,
    c2.structure
  )
  return {
    status: aggregate(c2, services),
    c2,
    services,
    proofBoundary: {
      topology: 'MACHINE-CHECKED',
      performance: 'EXTERNAL-NOT-PROVED'
    }
  }
}
