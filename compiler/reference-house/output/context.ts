import { assertOutputGenerationAllowed, outputGenerationPolicy } from '../../output/policy.js'
import { createReferenceHouseSource } from '../fixture.js'
import type { ReferenceHouseSource } from '../model.js'
import { compileReferenceHouseSystem } from '../system-compile.js'
import type { ReferenceHouseSystemCompileResult } from '../system-compile.js'

export interface ReferenceHouseOutputContext {
  readonly source: ReferenceHouseSource
  readonly result: ReferenceHouseSystemCompileResult
  readonly reviewStateVisible: boolean
}

export const createReferenceHouseOutputContext = (
  source: ReferenceHouseSource = createReferenceHouseSource()
): ReferenceHouseOutputContext => {
  const result = compileReferenceHouseSystem(source)
  assertOutputGenerationAllowed(result.status)
  return {
    source,
    result,
    reviewStateVisible: outputGenerationPolicy(result.status).visibleStatusRequired
  }
}
