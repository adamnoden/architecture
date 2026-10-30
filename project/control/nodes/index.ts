import type { ControlNode } from '../types.js'
import { houseDeliveryNodes } from './house-delivery.js'
import { ccrNodes } from './ccr.js'
import { acoNodes } from './aco.js'
import { architectureNodes } from './architecture.js'
import { evidenceNodes } from './evidence.js'
import { materialNodes } from './materials.js'
import { mraNodes } from './mra.js'
import { pcoNodes } from './pco.js'
import { publicationNodes } from './publication.js'
import { roofWaterNodes } from './roof-water.js'

/**
 * Deterministic aggregation point only.
 *
 * Routine packet/lifecycle edits belong in the owning sharded node module, not
 * here. This file changes only when a new node family is introduced.
 */
export const controlNodes = [
  ...acoNodes,
  ...ccrNodes,
  ...pcoNodes,
  ...architectureNodes,
  ...roofWaterNodes,
  ...materialNodes,
  ...mraNodes,
  ...publicationNodes,
  ...houseDeliveryNodes,
  ...evidenceNodes
] as const satisfies readonly ControlNode[]