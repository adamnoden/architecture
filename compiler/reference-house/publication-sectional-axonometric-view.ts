import { createReferenceHouseSource } from './fixture.js'
import { referenceHouseCourtGeometry } from './plan-adapter.js'
import type { Millimetres } from './units.js'

export type AxonometricVector3 = readonly [number, number, number]

export interface SectionalAxonometricViewSpec {
  id: 'REFERENCE-HOUSE-SECTIONAL-AXONOMETRIC'
  admission: 'OPTIONAL_ADMITTED_BOUNDED_SYNTHESIS'
  pageClass: 'PLATE_SPREAD'
  scale: 'NTS'
  cut: {
    axis: 'y'
    coordinate: Millimetres
    derivedFrom: 'COURT_SOUTH'
    keep: 'north'
  }
  projection: {
    kind: 'parallel-isometric'
    viewer: 'south-east-elevated'
    worldAxes: {
      x: 'east'
      y: 'north'
      z: 'up'
    }
    horizontalBasis: AxonometricVector3
    verticalBasis: AxonometricVector3
    viewDirection: AxonometricVector3
  }
  readerTask: readonly [
    'courtyard-void-and-shallow-wing-synthesis',
    'storey-and-roof-order',
    'east-service-flank-geography',
    'permanent-versus-changeable-order-without-construction-detail'
  ]
  geometryPolicy: {
    shellCourtLevels: 'CONTROLLED_SOURCE_ONLY'
    roof: 'PROVISIONAL_SOURCE_SUPPORTED'
    serviceGeography: 'SOURCE_SUPPORTED_ZONE_OR_RELATION_ONLY'
    permanentStructure: 'ARCHITECTURAL_SUPPORT_LINES_AND_SURFACES_ONLY'
    replaceableLayers: 'SEMANTIC_ANNOTATION_ONLY_NO_UNEARNED_THICKNESS'
    openings: 'ONLY_WHEN_COMPLETE_3D_AUTHORITY_EXISTS_IN_ONE_SOURCE_FAMILY'
    viewLocalProxyComposition: 'FORBIDDEN'
  }
  explicitAbsences: readonly [
    'construction-layer-thicknesses',
    'complete-window-and-door-solids',
    'service-terminal-points',
    'plant-product-geometry',
    'pipe-duct-cable-centrelines',
    'furniture-people-landscape',
    'real-site-context'
  ]
}

const SQRT_2 = Math.sqrt(2)
const SQRT_3 = Math.sqrt(3)
const SQRT_6 = Math.sqrt(6)

/**
 * DRW-09A freezes only the publication viewpoint and admission boundary.
 * Architectural geometry remains owned by the existing Reference House sources.
 */
export const createSectionalAxonometricViewSpec = (): SectionalAxonometricViewSpec => {
  const house = createReferenceHouseSource()
  const court = referenceHouseCourtGeometry(house)

  return {
    id: 'REFERENCE-HOUSE-SECTIONAL-AXONOMETRIC',
    admission: 'OPTIONAL_ADMITTED_BOUNDED_SYNTHESIS',
    pageClass: 'PLATE_SPREAD',
    scale: 'NTS',
    cut: {
      axis: 'y',
      coordinate: court.y0,
      derivedFrom: 'COURT_SOUTH',
      keep: 'north'
    },
    projection: {
      kind: 'parallel-isometric',
      viewer: 'south-east-elevated',
      worldAxes: { x: 'east', y: 'north', z: 'up' },
      horizontalBasis: [1 / SQRT_2, 1 / SQRT_2, 0],
      verticalBasis: [-1 / SQRT_6, 1 / SQRT_6, 2 / SQRT_6],
      viewDirection: [1 / SQRT_3, -1 / SQRT_3, 1 / SQRT_3]
    },
    readerTask: [
      'courtyard-void-and-shallow-wing-synthesis',
      'storey-and-roof-order',
      'east-service-flank-geography',
      'permanent-versus-changeable-order-without-construction-detail'
    ],
    geometryPolicy: {
      shellCourtLevels: 'CONTROLLED_SOURCE_ONLY',
      roof: 'PROVISIONAL_SOURCE_SUPPORTED',
      serviceGeography: 'SOURCE_SUPPORTED_ZONE_OR_RELATION_ONLY',
      permanentStructure: 'ARCHITECTURAL_SUPPORT_LINES_AND_SURFACES_ONLY',
      replaceableLayers: 'SEMANTIC_ANNOTATION_ONLY_NO_UNEARNED_THICKNESS',
      openings: 'ONLY_WHEN_COMPLETE_3D_AUTHORITY_EXISTS_IN_ONE_SOURCE_FAMILY',
      viewLocalProxyComposition: 'FORBIDDEN'
    },
    explicitAbsences: [
      'construction-layer-thicknesses',
      'complete-window-and-door-solids',
      'service-terminal-points',
      'plant-product-geometry',
      'pipe-duct-cable-centrelines',
      'furniture-people-landscape',
      'real-site-context'
    ]
  }
}
