import type { SourceFact } from './model.js'
import { createReferenceHouseSource } from './fixture.js'
import { referenceHouseCourtGeometry } from './plan-adapter.js'
import { mm, mm2, toSquareMetres } from './units.js'
import type { Millimetres, SquareMillimetres } from './units.js'

export type RoofSide = 'SOUTH' | 'NORTH' | 'WEST' | 'EAST'
export type SelectedRelationAuthority = 'RH08_SELECTED_OUTSIDE_RH_C1'

export interface RoofPoint {
  x: Millimetres
  y: Millimetres
}

export interface ProvisionalDerived<T> {
  id: string
  value: T
  authority: 'PROVISIONAL'
  authorship: 'DERIVED'
  disposition: 'PROVISIONAL_BUT_REPRESENTABLE'
  precision: 'exact' | 'approximate'
  provenance: readonly string[]
}

export interface Rh08SelectedRelation<T> {
  id: string
  value: T
  authority: SelectedRelationAuthority
  disposition: 'OUTSIDE_RH_C1'
  precision: 'qualitative'
  provenance: readonly string[]
}

export interface RoofFieldSource {
  id: `ROOF-FIELD-${RoofSide}`
  side: RoofSide
  polygon: ProvisionalDerived<readonly RoofPoint[]>
  fallDirection: Rh08SelectedRelation<'outward-to-external-perimeter'>
  catchment: {
    area: SquareMillimetres
    squareMetres: number
    authority: 'OUTSIDE_RH_C1_DERIVED'
    precision: 'approximate'
    provenance: readonly string[]
  }
}

export interface RoofWatershedSource {
  id: `ROOF-WATERSHED-${'SW' | 'SE' | 'NW' | 'NE'}`
  from: RoofPoint
  to: RoofPoint
  authority: 'PROVISIONAL'
  authorship: 'DERIVED'
  disposition: 'PROVISIONAL_BUT_REPRESENTABLE'
  provenance: readonly string[]
}

export interface RoofDrainageRwpSource {
  id: 'RWP-SW' | 'RWP-SE' | 'RWP-NW' | 'RWP-NE'
  zone:
    | 'west-side-return-just-behind-principal-front'
    | 'east-service-side-return-just-behind-principal-front'
    | 'rear-west-return'
    | 'rear-east-service-return'
  authority: SelectedRelationAuthority
  exactPosition: 'ABSENT'
  provenance: readonly ['RH-08']
}

export interface RoofDrainagePublicationSource {
  view: SourceFact<{
    id: 'REFERENCE-HOUSE-ROOF-DRAINAGE-PLAN'
    orientation: 'south-front-model-y0'
    scale: 100
  }>
  substrate: {
    shell: SourceFact<{ width: Millimetres; depth: Millimetres }>
    court: SourceFact<{
      width: Millimetres
      depth: Millimetres
      x0: Millimetres
      x1: Millimetres
      y0: Millimetres
      y1: Millimetres
    }>
  }
  roofFamily: SourceFact<{
    topology: 'four-low-slope-fields'
    drainageDirection: 'outward' | 'inward'
    screeningFallDenominator: number
    outerEdgeControl: Millimetres
  }>
  fields: RoofFieldSource[]
  watersheds: RoofWatershedSource[]
  outerCollection: Rh08SelectedRelation<{
    hostEdges: readonly ['SHELL_SOUTH', 'SHELL_NORTH', 'SHELL_WEST', 'SHELL_EAST']
    collectionType: 'open-inspectable-external-edge'
    split: 'toward-adjacent-corner-return-rwps'
    overflowBehaviour: 'visible-outward-clear-of-vulnerable-fabric'
  }>
  rwps: RoofDrainageRwpSource[]
  courtWater: {
    primaryCollector: Rh08SelectedRelation<{
      zone: 'east-service-side-of-courtyard'
      access: 'removable-grate-linear-collector-with-silt-access'
      exactGeometry: 'ABSENT'
    }>
    primaryRoute: Rh08SelectedRelation<{
      from: 'courtyard-primary-collector'
      through: 'east-service-gallery-strip'
      to: 'external-service-side-inspection-point'
      geometry: 'short-straight-joint-minimised-gravity-route'
      exactCentreline: 'ABSENT'
    }>
    emergencyOverflow: Rh08SelectedRelation<{
      inlet: 'independent-higher-level-courtyard-inlet'
      route: 'independent-straight-conduit'
      outlet: 'visible-east-service-side-external-outlet'
      priority: 'discharge-before-occupied-threshold-flooding'
      exactLevel: 'ABSENT'
    }>
  }
  roofService: Rh08SelectedRelation<{
    id: 'SOIL-VENT-ROOF-TERMINATION'
    zone: 'east-service-roof-field-near-outer-service-edge'
    exactPosition: 'ABSENT'
  }>
  selectedAbsences: {
    principalFrontRwp: 'ABSENT_SELECTED'
    internalRoofOutlet: 'ABSENT_SELECTED'
    courtyardRoofGutter: 'ABSENT_SELECTED'
    permanentRoofHatch: 'ABSENT_SELECTED'
    roofMvhrTerminals: 'ABSENT_SELECTED'
    roofCookerExtract: 'ABSENT_SELECTED'
    chimney: 'ABSENT_SELECTED'
    rooflight: 'ABSENT_SELECTED'
    rooftopPlant: 'ABSENT_SELECTED'
  }
  technicalAbsences: {
    gutterProfile: 'ABSENT_TECHNICAL'
    rwpDiameter: 'ABSENT_TECHNICAL'
    collectorDimensions: 'ABSENT_TECHNICAL'
    drainCentreline: 'ABSENT_TECHNICAL'
    drainDepth: 'ABSENT_TECHNICAL'
    drainGradient: 'ABSENT_TECHNICAL'
    drainDiameter: 'ABSENT_TECHNICAL'
    overflowLevel: 'ABSENT_TECHNICAL'
    thresholdDatums: 'ABSENT_TECHNICAL'
    waterproofingBuildUp: 'ABSENT_TECHNICAL'
    siteDischarge: 'ABSENT_TECHNICAL'
    hydraulicSizing: 'ABSENT_TECHNICAL'
  }
  legacyRh08Svg: {
    status: 'QUARANTINED_COORDINATION_EVIDENCE'
    geometryAuthority: 'NONE'
  }
}

const controlled = <T>(id: string, value: T): SourceFact<T> => ({
  id,
  value,
  authority: 'CONTROLLED',
  authorship: 'AUTHORED',
  disposition: 'FROZEN_FOR_RH_C1',
  precision: 'exact'
})

const selected = <T>(id: string, value: T): Rh08SelectedRelation<T> => ({
  id,
  value,
  authority: 'RH08_SELECTED_OUTSIDE_RH_C1',
  disposition: 'OUTSIDE_RH_C1',
  precision: 'qualitative',
  provenance: ['RH-08']
})

const point = (x: number, y: number): RoofPoint => ({ x: mm(x), y: mm(y) })

const polygonArea = (polygon: readonly RoofPoint[]): SquareMillimetres => {
  const doubled = polygon.reduce((sum, current, index) => {
    const next = polygon[(index + 1) % polygon.length]
    return sum + current.x * next.y - next.x * current.y
  }, 0)
  return mm2(Math.abs(doubled) / 2)
}

const provisionalPolygon = (
  id: string,
  polygon: readonly RoofPoint[]
): ProvisionalDerived<readonly RoofPoint[]> => ({
  id,
  value: polygon,
  authority: 'PROVISIONAL',
  authorship: 'DERIVED',
  disposition: 'PROVISIONAL_BUT_REPRESENTABLE',
  precision: 'exact',
  provenance: ['RH-08', 'RHCF-ROOF-FAMILY', 'RHCF-SHELL-X', 'RHCF-SHELL-Y', 'RHCF-COURT-SIZE']
})

const field = (
  side: RoofSide,
  polygon: readonly RoofPoint[]
): RoofFieldSource => {
  const area = polygonArea(polygon)
  return {
    id: `ROOF-FIELD-${side}`,
    side,
    polygon: provisionalPolygon(`DRW07B-${side}-FIELD`, polygon),
    fallDirection: selected(`DRW07B-${side}-FALL-DIRECTION`, 'outward-to-external-perimeter'),
    catchment: {
      area,
      squareMetres: toSquareMetres(area),
      authority: 'OUTSIDE_RH_C1_DERIVED',
      precision: 'approximate',
      provenance: ['RH-08', 'RHCF-SHELL-X', 'RHCF-SHELL-Y', 'RHCF-COURT-SIZE']
    }
  }
}

/** DRW-07B canonical publication source. It does not import geometry from the legacy RH-08 SVG. */
export const createRoofDrainagePublicationSource = (): RoofDrainagePublicationSource => {
  const house = createReferenceHouseSource()
  const court = referenceHouseCourtGeometry(house)
  const width = house.shell.width.value
  const depth = house.shell.depth.value

  const sw = point(0, 0)
  const se = point(width, 0)
  const nw = point(0, depth)
  const ne = point(width, depth)
  const csw = point(court.x0, court.y0)
  const cse = point(court.x1, court.y0)
  const cnw = point(court.x0, court.y1)
  const cne = point(court.x1, court.y1)

  const fields = [
    field('SOUTH', [sw, se, cse, csw]),
    field('NORTH', [nw, cnw, cne, ne]),
    field('WEST', [sw, csw, cnw, nw]),
    field('EAST', [se, ne, cne, cse])
  ]

  const watershed = (
    id: RoofWatershedSource['id'],
    from: RoofPoint,
    to: RoofPoint
  ): RoofWatershedSource => ({
    id,
    from,
    to,
    authority: 'PROVISIONAL',
    authorship: 'DERIVED',
    disposition: 'PROVISIONAL_BUT_REPRESENTABLE',
    provenance: ['RH-08', 'RHCF-ROOF-FAMILY', 'RHCF-SHELL-X', 'RHCF-SHELL-Y', 'RHCF-COURT-SIZE']
  })

  return {
    view: controlled('DRW07B-ROOF-DRAINAGE-VIEW', {
      id: 'REFERENCE-HOUSE-ROOF-DRAINAGE-PLAN',
      orientation: 'south-front-model-y0',
      scale: 100
    }),
    substrate: {
      shell: controlled('DRW07B-SHELL', { width, depth }),
      court: controlled('DRW07B-COURT', { ...court })
    },
    roofFamily: house.roof,
    fields,
    watersheds: [
      watershed('ROOF-WATERSHED-SW', sw, csw),
      watershed('ROOF-WATERSHED-SE', se, cse),
      watershed('ROOF-WATERSHED-NW', nw, cnw),
      watershed('ROOF-WATERSHED-NE', ne, cne)
    ],
    outerCollection: selected('DRW07B-OUTER-COLLECTION', {
      hostEdges: ['SHELL_SOUTH', 'SHELL_NORTH', 'SHELL_WEST', 'SHELL_EAST'] as const,
      collectionType: 'open-inspectable-external-edge',
      split: 'toward-adjacent-corner-return-rwps',
      overflowBehaviour: 'visible-outward-clear-of-vulnerable-fabric'
    }),
    rwps: [
      { id: 'RWP-SW', zone: 'west-side-return-just-behind-principal-front', authority: 'RH08_SELECTED_OUTSIDE_RH_C1', exactPosition: 'ABSENT', provenance: ['RH-08'] },
      { id: 'RWP-SE', zone: 'east-service-side-return-just-behind-principal-front', authority: 'RH08_SELECTED_OUTSIDE_RH_C1', exactPosition: 'ABSENT', provenance: ['RH-08'] },
      { id: 'RWP-NW', zone: 'rear-west-return', authority: 'RH08_SELECTED_OUTSIDE_RH_C1', exactPosition: 'ABSENT', provenance: ['RH-08'] },
      { id: 'RWP-NE', zone: 'rear-east-service-return', authority: 'RH08_SELECTED_OUTSIDE_RH_C1', exactPosition: 'ABSENT', provenance: ['RH-08'] }
    ],
    courtWater: {
      primaryCollector: selected('DRW07B-COURT-COLLECTOR', {
        zone: 'east-service-side-of-courtyard',
        access: 'removable-grate-linear-collector-with-silt-access',
        exactGeometry: 'ABSENT'
      }),
      primaryRoute: selected('DRW07B-COURT-PRIMARY-ROUTE', {
        from: 'courtyard-primary-collector',
        through: 'east-service-gallery-strip',
        to: 'external-service-side-inspection-point',
        geometry: 'short-straight-joint-minimised-gravity-route',
        exactCentreline: 'ABSENT'
      }),
      emergencyOverflow: selected('DRW07B-COURT-OVERFLOW', {
        inlet: 'independent-higher-level-courtyard-inlet',
        route: 'independent-straight-conduit',
        outlet: 'visible-east-service-side-external-outlet',
        priority: 'discharge-before-occupied-threshold-flooding',
        exactLevel: 'ABSENT'
      })
    },
    roofService: selected('DRW07B-SOIL-VENT', {
      id: 'SOIL-VENT-ROOF-TERMINATION',
      zone: 'east-service-roof-field-near-outer-service-edge',
      exactPosition: 'ABSENT'
    }),
    selectedAbsences: {
      principalFrontRwp: 'ABSENT_SELECTED',
      internalRoofOutlet: 'ABSENT_SELECTED',
      courtyardRoofGutter: 'ABSENT_SELECTED',
      permanentRoofHatch: 'ABSENT_SELECTED',
      roofMvhrTerminals: 'ABSENT_SELECTED',
      roofCookerExtract: 'ABSENT_SELECTED',
      chimney: 'ABSENT_SELECTED',
      rooflight: 'ABSENT_SELECTED',
      rooftopPlant: 'ABSENT_SELECTED'
    },
    technicalAbsences: {
      gutterProfile: 'ABSENT_TECHNICAL',
      rwpDiameter: 'ABSENT_TECHNICAL',
      collectorDimensions: 'ABSENT_TECHNICAL',
      drainCentreline: 'ABSENT_TECHNICAL',
      drainDepth: 'ABSENT_TECHNICAL',
      drainGradient: 'ABSENT_TECHNICAL',
      drainDiameter: 'ABSENT_TECHNICAL',
      overflowLevel: 'ABSENT_TECHNICAL',
      thresholdDatums: 'ABSENT_TECHNICAL',
      waterproofingBuildUp: 'ABSENT_TECHNICAL',
      siteDischarge: 'ABSENT_TECHNICAL',
      hydraulicSizing: 'ABSENT_TECHNICAL'
    },
    legacyRh08Svg: {
      status: 'QUARANTINED_COORDINATION_EVIDENCE',
      geometryAuthority: 'NONE'
    }
  }
}
