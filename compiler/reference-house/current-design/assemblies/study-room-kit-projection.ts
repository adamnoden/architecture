import type { CurrentDesignResolution } from '../resolve.js'
import { drawStudyPanellingElevation } from './study-linings-views.js'
import { compileStudyRoomKit, drawStudyRoomKitPlan } from './study-room-kit.js'
import { drawStudyWallTransition } from './study-wall-transition-views.js'

export function compileStudyRoomKitProjection(resolved: CurrentDesignResolution, input: unknown) {
  const { kit, wallTransition } = compileStudyRoomKit(resolved, input)
  return {
    kit, wallTransition, wallTransitionSvg: drawStudyWallTransition(wallTransition),
    plan: drawStudyRoomKitPlan(kit), wallElevation: drawStudyPanellingElevation(kit),
  }
}
