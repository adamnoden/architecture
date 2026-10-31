import { derivePlanSlice } from '../plan-slice/derive.js'
import type { PlanSliceDerived } from '../plan-slice/model.js'
import {
  adaptReferenceHousePlanSource,
  referenceHouseCourtGeometry,
  referenceHouseFrontAxes
} from './plan-adapter.js'
import type {
  DerivedBoundary,
  DerivedOpening,
  DerivedPlanLine,
  DerivedSpace,
  OpeningPlacement,
  ReferenceHouseDerived,
  ReferenceHouseCoordinationSource
} from './model.js'
import { deg, mm, square } from './units.js'
import type { Millimetres } from './units.js'

const referenceHousePlanProjection = (plan: PlanSliceDerived): {
  planLines: DerivedPlanLine[]
  spaces: DerivedSpace[]
  boundaries: DerivedBoundary[]
  openings: DerivedOpening[]
} => ({
  planLines: plan.planLines.map((line) => ({ ...line })),
  spaces: plan.spaces.map((space) => ({
    ...space,
    levelId: space.levelId as DerivedSpace['levelId']
  })),
  boundaries: plan.boundaries.map((boundary) => ({
    ...boundary,
    levelId: boundary.levelId as DerivedBoundary['levelId'],
    kind: boundary.kind as DerivedBoundary['kind']
  })),
  openings: plan.openings.map((opening) => ({
    ...opening,
    levelId: opening.levelId as DerivedOpening['levelId'],
    placementKind: opening.placementKind as OpeningPlacement['kind']
  }))
})

export const deriveReferenceHouse = (
  source: ReferenceHouseCoordinationSource,
  compiledPlan: PlanSliceDerived = derivePlanSlice(adaptReferenceHousePlanSource(source))
): ReferenceHouseDerived => {
  const shellWidth = source.shell.width.value
  const shellDepth = source.shell.depth.value
  const court = referenceHouseCourtGeometry(source)
  const centreX = mm(shellWidth / 2)
  const centreY = mm(shellDepth / 2)
  const ringWest = court.x0
  const ringEast = mm(shellWidth - court.x1)
  const ringSouth = court.y0
  const ringNorth = mm(shellDepth - court.y1)

  const { riserCount, flightRiseGroups } = source.stair.riseTopology.value
  const { going, goingsPerFlight } = source.stair.goingTopology.value
  const firstFfl = source.levels.firstFfl.value
  const rise = mm(firstFfl / riserCount)
  const flightRun = mm(going * goingsPerFlight)
  let accumulatedRises = 0
  const landingDatums = flightRiseGroups.slice(0, -1).map((group) => {
    accumulatedRises += group
    return mm(accumulatedRises * rise)
  })
  const pitch = deg((Math.atan(rise / going) * 180) / Math.PI)

  const frontAxes = referenceHouseFrontAxes(source)
  const entranceCentre = frontAxes[source.entranceBay.value.bayIndex - 1]
  const plan = referenceHousePlanProjection(compiledPlan)

  const normalMax = source.wallPlanning.normalRange.value.max
  const stress = source.wallPlanning.stressThickness.value
  const clearAt = (thickness: Millimetres) => ({
    sideRing: mm(ringWest - 2 * thickness),
    frontRearRing: mm(ringSouth - 2 * thickness)
  })

  const roof = source.roof.value
  const roofFall = mm(ringSouth / roof.screeningFallDenominator)
  const courtSideEdge = mm(
    roof.outerEdgeControl + (roof.drainageDirection === 'outward' ? roofFall : -roofFall)
  )
  const enclosedPlateArea =
    compiledPlan.plateAreas.find((item) => item.levelId === 'GROUND')?.area ?? compiledPlan.shell.area
  const courtArea =
    compiledPlan.voids.find((item) => item.levelId === 'GROUND')?.area ??
    square(court.width, court.depth)

  return {
    shell: {
      id: source.shell.id,
      width: shellWidth,
      depth: shellDepth,
      centreX,
      centreY,
      area: compiledPlan.shell.area
    },
    court: {
      id: source.court.value.id,
      width: court.width,
      depth: court.depth,
      x0: court.x0,
      x1: court.x1,
      y0: court.y0,
      y1: court.y1,
      area: courtArea
    },
    ring: { west: ringWest, east: ringEast, south: ringSouth, north: ringNorth },
    enclosedPlateArea,
    planLines: plan.planLines,
    levels: {
      groundFfl: source.levels.groundFfl.value,
      groundCeiling: source.levels.groundCeiling.value,
      firstFfl,
      interStoreyGap: mm(firstFfl - source.levels.groundCeiling.value),
      upperCeiling: source.levels.upperCeiling.value,
      upperClearHeight: mm(source.levels.upperCeiling.value - firstFfl),
      corniceControl: source.levels.corniceControl.value
    },
    stair: {
      riserCount,
      flightRiseGroups: [...flightRiseGroups],
      rise,
      going,
      goingsPerFlight,
      flightRun,
      landingDatums,
      twoRPlusG: mm(2 * rise + going),
      pitch
    },
    frontAxes,
    entranceCentre,
    spaces: plan.spaces,
    boundaries: plan.boundaries,
    openings: plan.openings,
    wallPlanning: {
      normalRange: { ...source.wallPlanning.normalRange.value },
      stressThickness: stress,
      clearAtNormalMax: clearAt(normalMax),
      clearAtStress: clearAt(stress)
    },
    roofSection: {
      direction: roof.drainageDirection,
      outerEdgeControl: roof.outerEdgeControl,
      courtSideEdge,
      fallAcrossFrontRearRing: roofFall
    }
  }
}
