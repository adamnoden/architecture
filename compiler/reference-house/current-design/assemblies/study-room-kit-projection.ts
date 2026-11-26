import { drawStudyRoomAssembly } from './study-room-assembly.js'
import type { CurrentDesignResolution } from '../resolve.js'
import { drawStudyPanellingElevation } from './study-linings-views.js'
import { compileStudyRoomKit, drawStudyRoomKitPlan } from './study-room-kit.js'
import { drawStudyWallTransition } from './study-wall-transition-views.js'
import { drawStudyRoomPerspective } from './study-room-perspective.js'
import type { NativeSWGeometry } from './study-structural-context.js'

export function compileStudyRoomKitProjection(resolved: CurrentDesignResolution, input: unknown, structuralGeometry?: NativeSWGeometry) {
  const { kit, wallTransition, roomAssembly } = compileStudyRoomKit(resolved, input, structuralGeometry)
  return {
    kit, roomAssembly, roomAssemblySvg: drawStudyRoomAssembly(roomAssembly), wallTransition, wallTransitionSvg: drawStudyWallTransition(wallTransition),
    plan: drawStudyRoomKitPlan(kit),
    furnitureAccessPlan: kit.floor.handling.state === 'withheld' ? null : drawStudyRoomKitPlan(kit, 'furniture-access'),
    furnitureMotionPlan: kit.floor.furnitureMotion?.state === 'geometry-screen-only' ? drawStudyRoomKitPlan(kit, 'furniture-motion') : null,
    wallElevation: drawStudyPanellingElevation(kit),
    eyeLevel: { day: drawStudyRoomPerspective(kit, roomAssembly, wallTransition, 'day'),
      evening: drawStudyRoomPerspective(kit, roomAssembly, wallTransition, 'evening') },
  }
}
