import { compileBoundaryTopology } from '../boundary-slice/compile.js'
import type { BoundaryTopologyCompileResult, BoundaryTopologySource } from '../boundary-slice/model.js'
import type { ReferenceHouseSource, RhCompileStatus } from '../reference-house/model.js'
import { compileReferenceHouseServiceView } from '../rhc3/compile.js'
import type { RhC3CompileResult } from '../rhc3/compile.js'
import { createReferenceHouseBoundarySource } from './fixture.js'
import {
  deriveReferenceHouseBoundaryCoordination,
  hardenReferenceHouseBoundaryTopology
} from './hardening.js'
import type { RhC4Coordination } from './hardening.js'
import { rhC4ProofBoundary } from './proof-boundary.js'

export interface RhC4CompileResult {
  status: RhCompileStatus
  c3: RhC3CompileResult
  boundaries: BoundaryTopologyCompileResult
  coordination: RhC4Coordination
  proofBoundary: typeof rhC4ProofBoundary
}

const aggregate = (
  c3: RhC3CompileResult,
  boundaries: BoundaryTopologyCompileResult
): RhCompileStatus => {
  if (c3.status === 'FAIL' || boundaries.status === 'FAIL') return 'FAIL'
  if (c3.status === 'REVIEW' || boundaries.status === 'REVIEW') return 'REVIEW'
  return 'PASS'
}

export const compileReferenceHouseBoundaryView = (
  source: ReferenceHouseSource,
  boundarySource?: BoundaryTopologySource
): RhC4CompileResult => {
  const c3 = compileReferenceHouseServiceView(source)
  const authored = boundarySource ?? createReferenceHouseBoundarySource(source, c3.c2.plan, c3.services)
  const baseBoundaries = compileBoundaryTopology(authored, c3.c2.plan, c3.services)
  const boundaries = hardenReferenceHouseBoundaryTopology(source, c3, baseBoundaries)
  return {
    status: aggregate(c3, boundaries),
    c3,
    boundaries,
    coordination: deriveReferenceHouseBoundaryCoordination(source, c3),
    proofBoundary: rhC4ProofBoundary
  }
}
