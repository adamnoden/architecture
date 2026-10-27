import type { SourceFact, ReferenceHouseSource } from './model.js'
import { createReferenceHouseSource } from './fixture.js'
import { referenceHouseCourtGeometry } from './plan-adapter.js'
import { createGroundFloorPublicationPlanSource } from './publication-plan-source.js'
import { createServiceTransverseSectionSource } from './publication-service-section-source.js'
import { mm } from './units.js'
import type { Millimetres } from './units.js'

export type StructuralCoordinationAuthority = 'TECHNICAL_COORDINATION_SELECTED_OUTSIDE_RH_C1'

export interface ControlledDerived<T> {
  id: string
  value: T
  authority: 'CONTROLLED'
  authorship: 'DERIVED'
  disposition: 'FROZEN_FOR_RH_C1'
  precision: 'exact'
  provenance: readonly string[]
}

export interface StructuralCoordinationFact<T> {
  id: string
  value: T
  authority: StructuralCoordinationAuthority
  disposition: 'OUTSIDE_RH_C1'
  precision: 'architectural-concept' | 'approximate'
  provenance: readonly ['structural-coordination.md']
}

export interface StructuralSpanRegion {
  id: 'WEST-SIDE' | 'EAST-SIDE' | 'SOUTH-CENTRE' | 'NORTH-CENTRE'
  x0: Millimetres
  x1: Millimetres
  y0: Millimetres
  y1: Millimetres
  direction: 'east-west' | 'north-south'
  grossSpan: Millimetres
  qualification: 'ordinary-gross-span' | 'local-stair-framing-modifies-field'
}

export interface StructuralSpanOverlaySource {
  view: {
    id: 'REFERENCE-HOUSE-STRUCTURAL-SPAN-OVERLAY'
    substrate: 'REFERENCE-HOUSE-FIRST-FLOOR-PLAN'
    scale: 100
    authority: 'PUBLICATION_OVERLAY_SELECTION'
  }
  substrate: {
    shell: {
      width: SourceFact<Millimetres>
      depth: SourceFact<Millimetres>
    }
    court: {
      size: ReferenceHouseSource['court']
      extents: ControlledDerived<{
        x0: Millimetres
        x1: Millimetres
        y0: Millimetres
        y1: Millimetres
      }>
    }
  }
  structuralConcept: {
    permanentSupportOrder: StructuralCoordinationFact<{
      outerMasonryEnvelope: true
      courtyardMasonryEnvelope: true
      independentWholeHouseFrame: false
    }>
    spanRegions: StructuralCoordinationFact<readonly StructuralSpanRegion[]>
    courtEdgeBeamFamily: StructuralCoordinationFact<{
      repeatedConditions: 4
      role: 'short-repeated-edge-beam-conditions-at-courtyard-support-order'
      exactMemberExtents: 'ABSENT_STRUCTURAL_ENGINEERING'
    }>
    openingFraming: StructuralCoordinationFact<{
      stair: {
        reservation: ReturnType<typeof createGroundFloorPublicationPlanSource>['stair']['reservation']['value']
        exactTrimmersAndBearings: 'ABSENT_STRUCTURAL_ENGINEERING'
      }
      service: {
        reservation: ReturnType<typeof createServiceTransverseSectionSource>['serviceZone']['clearReservation']['value']
        finalStructuralOpening: 'ABSENT_TECHNICAL'
        exactTrimmersAndBearings: 'ABSENT_STRUCTURAL_ENGINEERING'
      }
    }>
  }
  absences: {
    memberSizes: 'ABSENT_STRUCTURAL_ENGINEERING'
    bearings: 'ABSENT_STRUCTURAL_ENGINEERING'
    connections: 'ABSENT_STRUCTURAL_ENGINEERING'
    lintels: 'ABSENT_STRUCTURAL_ENGINEERING'
    foundations: 'ABSENT_SITE_AND_STRUCTURAL_ENGINEERING'
    robustnessStrategy: 'ABSENT_STRUCTURAL_ENGINEERING'
    joistCentrelines: 'ABSENT_STRUCTURAL_ENGINEERING'
    edgeBeamExactGeometry: 'ABSENT_STRUCTURAL_ENGINEERING'
  }
}

const derived = <T>(id: string, value: T, provenance: readonly string[]): ControlledDerived<T> => ({
  id,
  value,
  authority: 'CONTROLLED',
  authorship: 'DERIVED',
  disposition: 'FROZEN_FOR_RH_C1',
  precision: 'exact',
  provenance
})

const selected = <T>(id: string, value: T, precision: StructuralCoordinationFact<T>['precision'] = 'architectural-concept'): StructuralCoordinationFact<T> => ({
  id,
  value,
  authority: 'TECHNICAL_COORDINATION_SELECTED_OUTSIDE_RH_C1',
  disposition: 'OUTSIDE_RH_C1',
  precision,
  provenance: ['structural-coordination.md']
})

/**
 * DRW-10A source: structural concept only. The overlay reads the current
 * Technical Coordination back over canonical RH-C1 geometry; it does not create
 * a structural model or member schedule.
 */
export const createStructuralSpanOverlaySource = (): StructuralSpanOverlaySource => {
  const house = createReferenceHouseSource()
  const court = referenceHouseCourtGeometry(house)
  const ground = createGroundFloorPublicationPlanSource()
  const service = createServiceTransverseSectionSource()
  const zero = mm(0)

  const westSpan = court.x0
  const eastSpan = mm(house.shell.width.value - court.x1)
  const southSpan = court.y0
  const northSpan = mm(house.shell.depth.value - court.y1)

  return {
    view: {
      id: 'REFERENCE-HOUSE-STRUCTURAL-SPAN-OVERLAY',
      substrate: 'REFERENCE-HOUSE-FIRST-FLOOR-PLAN',
      scale: 100,
      authority: 'PUBLICATION_OVERLAY_SELECTION'
    },
    substrate: {
      shell: {
        width: house.shell.width,
        depth: house.shell.depth
      },
      court: {
        size: house.court,
        extents: derived('DRW10A-COURT-EXTENTS', {
          x0: court.x0,
          x1: court.x1,
          y0: court.y0,
          y1: court.y1
        }, ['RHCF-COURT-SIZE', 'RHCF-SHELL-X', 'RHCF-SHELL-Y'])
      }
    },
    structuralConcept: {
      permanentSupportOrder: selected('DRW10A-SUPPORT-ORDER', {
        outerMasonryEnvelope: true,
        courtyardMasonryEnvelope: true,
        independentWholeHouseFrame: false
      }),
      spanRegions: selected<readonly StructuralSpanRegion[]>('DRW10A-SPANS', [
        { id: 'WEST-SIDE', x0: zero, x1: court.x0, y0: zero, y1: house.shell.depth.value, direction: 'east-west', grossSpan: westSpan, qualification: 'ordinary-gross-span' },
        { id: 'EAST-SIDE', x0: court.x1, x1: house.shell.width.value, y0: zero, y1: house.shell.depth.value, direction: 'east-west', grossSpan: eastSpan, qualification: 'ordinary-gross-span' },
        { id: 'SOUTH-CENTRE', x0: court.x0, x1: court.x1, y0: zero, y1: court.y0, direction: 'north-south', grossSpan: southSpan, qualification: 'local-stair-framing-modifies-field' },
        { id: 'NORTH-CENTRE', x0: court.x0, x1: court.x1, y0: court.y1, y1: house.shell.depth.value, direction: 'north-south', grossSpan: northSpan, qualification: 'ordinary-gross-span' }
      ]),
      courtEdgeBeamFamily: selected('DRW10A-COURT-EDGE-BEAM-FAMILY', {
        repeatedConditions: 4,
        role: 'short-repeated-edge-beam-conditions-at-courtyard-support-order',
        exactMemberExtents: 'ABSENT_STRUCTURAL_ENGINEERING'
      }),
      openingFraming: selected('DRW10A-OPENING-FRAMING', {
        stair: {
          reservation: ground.stair.reservation.value,
          exactTrimmersAndBearings: 'ABSENT_STRUCTURAL_ENGINEERING'
        },
        service: {
          reservation: service.serviceZone.clearReservation.value,
          finalStructuralOpening: service.technicalAbsences.finalStructuralOpening,
          exactTrimmersAndBearings: 'ABSENT_STRUCTURAL_ENGINEERING'
        }
      }, 'approximate')
    },
    absences: {
      memberSizes: 'ABSENT_STRUCTURAL_ENGINEERING',
      bearings: 'ABSENT_STRUCTURAL_ENGINEERING',
      connections: 'ABSENT_STRUCTURAL_ENGINEERING',
      lintels: 'ABSENT_STRUCTURAL_ENGINEERING',
      foundations: 'ABSENT_SITE_AND_STRUCTURAL_ENGINEERING',
      robustnessStrategy: 'ABSENT_STRUCTURAL_ENGINEERING',
      joistCentrelines: 'ABSENT_STRUCTURAL_ENGINEERING',
      edgeBeamExactGeometry: 'ABSENT_STRUCTURAL_ENGINEERING'
    }
  }
}
