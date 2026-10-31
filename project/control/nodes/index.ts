import type { ControlNode } from '../types.js'
import { acoNodes } from './aco.js'
import { architectureNodes } from './architecture.js'
import { evidenceNodes } from './evidence.js'
import { mraNodes } from './mra.js'
import { pcoNodes } from './pco.js'
import { publicationNodes } from './publication.js'

/**
 * Deterministic aggregation point only.
 *
 * Routine packet/lifecycle edits belong in the owning sharded node module, not
 * here. This file changes only when a new node family is introduced.
 */
export const controlNodes = [
  ...acoNodes,
  ...pcoNodes,
  ...architectureNodes,
  ...mraNodes,
  ...publicationNodes,
  ...evidenceNodes
] as const satisfies readonly ControlNode[]
