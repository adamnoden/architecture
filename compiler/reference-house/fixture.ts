import type {
  FreezeDisposition,
  OpeningFamilySource,
  ReferenceHouseSource,
  SourceFact
} from './model.js'
import { mm } from './units.js'

const controlled = <T>(
  id: string,
  value: T,
  precision: SourceFact<T>['precision'] = 'exact'
): SourceFact<T> => ({
  id,
  value,
  authority: 'CONTROLLED',
  authorship: 'AUTHORED',
  disposition: 'FROZEN_FOR_RH_C1',
  precision
})

const provisional = <T>(
  id: string,
  value: T,
  precision: SourceFact<T>['precision'] = 'approximate'
): SourceFact<T> => ({
  id,
  value,
  authority: 'PROVISIONAL',
  authorship: 'AUTHORED_PROVISIONAL',
  disposition: 'PROVISIONAL_BUT_REPRESENTABLE',
  precision
})

const disposition = (value: 'frozen' | 'provisional'): FreezeDisposition =>
  value === 'frozen' ? 'FROZEN_FOR_RH_C1' : 'PROVISIONAL_BUT_REPRESENTABLE'

const openingFamilies = (): OpeningFamilySource[] => [
  {
    id: 'FAM-FRONT-GROUND-PRINCIPAL',
    width: { kind: 'approximate', value: mm(1050) },
    vertical: {
      sill: { kind: 'range', min: mm(650), max: mm(700) },
      head: { kind: 'approximate', value: mm(2550) }
    },
    disposition: 'PROVISIONAL_BUT_REPRESENTABLE'
  },
  {
    id: 'FAM-FRONT-GROUND-STAIR',
    width: { kind: 'approximate', value: mm(900) },
    vertical: {
      sill: { kind: 'approximate', value: mm(1050) },
      head: { kind: 'approximate', value: mm(2550) }
    },
    disposition: 'PROVISIONAL_BUT_REPRESENTABLE'
  },
  {
    id: 'FAM-FRONT-ENTRANCE',
    width: { kind: 'range', min: mm(950), max: mm(1050) },
    vertical: {
      head: { kind: 'approximate', value: mm(2550) }
    },
    disposition: 'PROVISIONAL_BUT_REPRESENTABLE'
  },
  {
    id: 'FAM-FRONT-UPPER',
    width: { kind: 'range', min: mm(900), max: mm(950) },
    vertical: {
      sill: { kind: 'approximate', value: mm(800) },
      head: { kind: 'approximate', value: mm(2350) }
    },
    disposition: 'PROVISIONAL_BUT_REPRESENTABLE'
  },
  {
    id: 'FAM-COURT-NS-MAJOR',
    width: { kind: 'unknown' },
    vertical: {},
    disposition: 'PROVISIONAL_BUT_REPRESENTABLE'
  }
]

export const createReferenceHouseSource = (): ReferenceHouseSource => ({
  fixtureId: 'RH-C1-REFERENCE-HOUSE',
  coordinateConvention: controlled('RHCF-COORD', {
    origin: 'south-west-outer-corner',
    xPositive: 'east',
    yPositive: 'north',
    front: 'south'
  }),
  shell: {
    id: 'SHELL-01',
    width: controlled('RHCF-SHELL-X', mm(12000)),
    depth: controlled('RHCF-SHELL-Y', mm(10800))
  },
  court: controlled('RHCF-COURT-SIZE', {
    id: 'C-01',
    width: mm(3600),
    depth: mm(4000),
    placement: 'centred-in-shell'
  }),
  partitions: {
    westRoomSplitY: provisional('RHCF-GDRAW-SPLIT', mm(5000)),
    frontHallWestX: provisional('RHCF-HALL-WEST', mm(4000)),
    galleryServiceX: controlled('RHCF-GAL-X1', mm(9100)),
    upperNorthSplitY: provisional('RHCF-U-NORTH-SPLIT', mm(8600)),
    upperDrySplitX: provisional('RHCF-U-DRY-SPLIT', mm(6400)),
    upperSouthLandingTurnDepth: provisional('RHCF-U-SOUTH-TURN-D', mm(1300))
  },
  levels: {
    groundFfl: controlled('RHCF-FFL-G', mm(0)),
    groundCeiling: controlled('RHCF-CEIL-G', mm(2950)),
    firstFfl: controlled('RHCF-FFL-1', mm(3300)),
    upperCeiling: controlled('RHCF-CEIL-U', mm(6000)),
    corniceControl: provisional('RHCF-CORNICE', mm(6250))
  },
  stair: {
    riseTopology: controlled('RHCF-STAIR-N', {
      riserCount: 18,
      flightRiseGroups: [6, 6, 6]
    }),
    goingTopology: controlled('RHCF-STAIR-G', {
      going: mm(280),
      goingsPerFlight: 5
    }),
    clearWidthTarget: provisional('RHCF-STAIR-W', mm(1000)),
    reservation: provisional(
      'RHCF-STAIR-BOX',
      { min: mm(2400), max: mm(2500) },
      'range'
    )
  },
  frontField: controlled('RHCF-FRONT-FIELD', {
    count: 4,
    spacing: mm(2700),
    centredOnShell: true
  }),
  entranceBay: controlled('RHCF-ENTRANCE-BAY', { bayIndex: 3 }),
  wallPlanning: {
    normalRange: provisional(
      'RHCF-WALL-NORMAL',
      { min: mm(400), max: mm(425) },
      'range'
    ),
    stressThickness: provisional('RHCF-WALL-STRESS', mm(450))
  },
  roof: provisional('RHCF-ROOF-FAMILY', {
    topology: 'four-low-slope-fields',
    drainageDirection: 'outward',
    screeningFallDenominator: 40,
    outerEdgeControl: mm(6250)
  }),
  spaces: [
    {
      id: 'G-DRAW-02',
      levelId: 'GROUND',
      kind: 'room',
      label: 'drawing',
      rectangles: [
        { x0: 'SHELL_WEST', x1: 'HALL_WEST', y0: 'SHELL_SOUTH', y1: 'COURT_SOUTH' },
        { x0: 'SHELL_WEST', x1: 'COURT_WEST', y0: 'COURT_SOUTH', y1: 'WEST_ROOM_SPLIT' }
      ],
      disposition: disposition('provisional')
    },
    {
      id: 'G-FAM-02',
      levelId: 'GROUND',
      kind: 'room',
      label: 'family',
      rectangles: [{ x0: 'SHELL_WEST', x1: 'COURT_WEST', y0: 'WEST_ROOM_SPLIT', y1: 'SHELL_NORTH' }],
      disposition: disposition('provisional')
    },
    {
      id: 'G-HALL-02',
      levelId: 'GROUND',
      kind: 'circulation',
      label: 'hall / stair',
      rectangles: [{ x0: 'HALL_WEST', x1: 'COURT_EAST', y0: 'SHELL_SOUTH', y1: 'COURT_SOUTH' }],
      disposition: disposition('provisional')
    },
    {
      id: 'G-STUDY-02',
      levelId: 'GROUND',
      kind: 'room',
      label: 'study',
      rectangles: [{ x0: 'GALLERY_SERVICE', x1: 'SHELL_EAST', y0: 'SHELL_SOUTH', y1: 'COURT_SOUTH' }],
      disposition: disposition('frozen')
    },
    {
      id: 'G-GAL-01',
      levelId: 'GROUND',
      kind: 'circulation',
      label: 'gallery',
      rectangles: [{ x0: 'COURT_EAST', x1: 'GALLERY_SERVICE', y0: 'SHELL_SOUTH', y1: 'COURT_NORTH' }],
      disposition: disposition('frozen')
    },
    {
      id: 'G-SVC-02',
      levelId: 'GROUND',
      kind: 'room',
      label: 'gross service suite',
      rectangles: [{ x0: 'GALLERY_SERVICE', x1: 'SHELL_EAST', y0: 'COURT_SOUTH', y1: 'COURT_NORTH' }],
      disposition: disposition('frozen')
    },
    {
      id: 'G-GARDEN-02',
      levelId: 'GROUND',
      kind: 'room',
      label: 'garden dining',
      rectangles: [{ x0: 'COURT_WEST', x1: 'COURT_EAST', y0: 'COURT_NORTH', y1: 'SHELL_NORTH' }],
      disposition: disposition('frozen')
    },
    {
      id: 'G-KIT-02',
      levelId: 'GROUND',
      kind: 'room',
      label: 'kitchen',
      rectangles: [{ x0: 'COURT_EAST', x1: 'SHELL_EAST', y0: 'COURT_NORTH', y1: 'SHELL_NORTH' }],
      disposition: disposition('frozen')
    },
    {
      id: 'U-BED-02',
      levelId: 'FIRST',
      kind: 'room',
      label: 'west-front bedroom',
      rectangles: [
        { x0: 'SHELL_WEST', x1: 'HALL_WEST', y0: 'SHELL_SOUTH', y1: 'COURT_SOUTH' },
        { x0: 'SHELL_WEST', x1: 'COURT_WEST', y0: 'COURT_SOUTH', y1: 'WEST_ROOM_SPLIT' }
      ],
      disposition: disposition('provisional')
    },
    {
      id: 'U-BED-P01',
      levelId: 'FIRST',
      kind: 'room',
      label: 'principal bedroom',
      rectangles: [{ x0: 'SHELL_WEST', x1: 'COURT_WEST', y0: 'WEST_ROOM_SPLIT', y1: 'SHELL_NORTH' }],
      disposition: disposition('provisional')
    },
    {
      id: 'U-STAIR-01',
      levelId: 'FIRST',
      kind: 'circulation',
      label: 'south stair / landing',
      rectangles: [
        { x0: 'HALL_WEST', x1: 'COURT_EAST', y0: 'SHELL_SOUTH', y1: 'COURT_SOUTH' },
        { x0: 'COURT_EAST', x1: 'GALLERY_SERVICE', y0: 'UPPER_SOUTH_TURN', y1: 'COURT_SOUTH' }
      ],
      disposition: disposition('provisional')
    },
    {
      id: 'U-BED-03',
      levelId: 'FIRST',
      kind: 'room',
      label: 'east-front bedroom',
      rectangles: [
        { x0: 'COURT_EAST', x1: 'SHELL_EAST', y0: 'SHELL_SOUTH', y1: 'UPPER_SOUTH_TURN' },
        { x0: 'GALLERY_SERVICE', x1: 'SHELL_EAST', y0: 'UPPER_SOUTH_TURN', y1: 'COURT_SOUTH' }
      ],
      disposition: disposition('frozen')
    },
    {
      id: 'U-GAL-02',
      levelId: 'FIRST',
      kind: 'circulation',
      label: 'east gallery',
      rectangles: [{ x0: 'COURT_EAST', x1: 'GALLERY_SERVICE', y0: 'COURT_SOUTH', y1: 'COURT_NORTH' }],
      disposition: disposition('frozen')
    },
    {
      id: 'U-BATH-01',
      levelId: 'FIRST',
      kind: 'room',
      label: 'family bathroom',
      rectangles: [{ x0: 'GALLERY_SERVICE', x1: 'SHELL_EAST', y0: 'COURT_SOUTH', y1: 'COURT_NORTH' }],
      disposition: disposition('frozen')
    },
    {
      id: 'U-BED-04',
      levelId: 'FIRST',
      kind: 'room',
      label: 'east-rear bedroom',
      rectangles: [
        { x0: 'COURT_EAST', x1: 'SHELL_EAST', y0: 'UPPER_NORTH_SPLIT', y1: 'SHELL_NORTH' },
        { x0: 'GALLERY_SERVICE', x1: 'SHELL_EAST', y0: 'COURT_NORTH', y1: 'UPPER_NORTH_SPLIT' }
      ],
      disposition: disposition('provisional')
    },
    {
      id: 'U-LAND-N01',
      levelId: 'FIRST',
      kind: 'circulation',
      label: 'north cross-landing',
      rectangles: [
        { x0: 'COURT_WEST', x1: 'COURT_EAST', y0: 'COURT_NORTH', y1: 'UPPER_NORTH_SPLIT' },
        { x0: 'COURT_EAST', x1: 'GALLERY_SERVICE', y0: 'COURT_NORTH', y1: 'UPPER_NORTH_SPLIT' }
      ],
      disposition: disposition('provisional')
    },
    {
      id: 'U-DRESS-01',
      levelId: 'FIRST',
      kind: 'room',
      label: 'dry dressing / storage',
      rectangles: [{ x0: 'COURT_WEST', x1: 'UPPER_DRY_SPLIT', y0: 'UPPER_NORTH_SPLIT', y1: 'SHELL_NORTH' }],
      disposition: disposition('provisional')
    },
    {
      id: 'U-LIN-01',
      levelId: 'FIRST',
      kind: 'room',
      label: 'linen',
      rectangles: [{ x0: 'UPPER_DRY_SPLIT', x1: 'COURT_EAST', y0: 'UPPER_NORTH_SPLIT', y1: 'SHELL_NORTH' }],
      disposition: disposition('provisional')
    }
  ],
  boundaries: [
    ...(['GROUND', 'FIRST'] as const).flatMap((levelId) => {
      const prefix = levelId === 'GROUND' ? 'G' : 'U'
      return [
        { id: `${prefix}-OUTER-SOUTH`, levelId, kind: 'outer' as const, orientation: 'horizontal' as const, at: 'SHELL_SOUTH', from: 'SHELL_WEST', to: 'SHELL_EAST', disposition: disposition('frozen') },
        { id: `${prefix}-OUTER-NORTH`, levelId, kind: 'outer' as const, orientation: 'horizontal' as const, at: 'SHELL_NORTH', from: 'SHELL_WEST', to: 'SHELL_EAST', disposition: disposition('frozen') },
        { id: `${prefix}-OUTER-WEST`, levelId, kind: 'outer' as const, orientation: 'vertical' as const, at: 'SHELL_WEST', from: 'SHELL_SOUTH', to: 'SHELL_NORTH', disposition: disposition('frozen') },
        { id: `${prefix}-OUTER-EAST`, levelId, kind: 'outer' as const, orientation: 'vertical' as const, at: 'SHELL_EAST', from: 'SHELL_SOUTH', to: 'SHELL_NORTH', disposition: disposition('frozen') },
        { id: `${prefix}-COURT-SOUTH`, levelId, kind: 'courtyard' as const, orientation: 'horizontal' as const, at: 'COURT_SOUTH', from: 'COURT_WEST', to: 'COURT_EAST', disposition: disposition('frozen') },
        { id: `${prefix}-COURT-NORTH`, levelId, kind: 'courtyard' as const, orientation: 'horizontal' as const, at: 'COURT_NORTH', from: 'COURT_WEST', to: 'COURT_EAST', disposition: disposition('frozen') },
        { id: `${prefix}-COURT-WEST`, levelId, kind: 'courtyard' as const, orientation: 'vertical' as const, at: 'COURT_WEST', from: 'COURT_SOUTH', to: 'COURT_NORTH', disposition: disposition('frozen') },
        { id: `${prefix}-COURT-EAST`, levelId, kind: 'courtyard' as const, orientation: 'vertical' as const, at: 'COURT_EAST', from: 'COURT_SOUTH', to: 'COURT_NORTH', disposition: disposition('frozen') }
      ]
    }),
    { id: 'G-HALL-WEST-B', levelId: 'GROUND', kind: 'internal-planning', orientation: 'vertical', at: 'HALL_WEST', from: 'SHELL_SOUTH', to: 'COURT_SOUTH', disposition: disposition('provisional') },
    { id: 'G-WEST-SPLIT-B', levelId: 'GROUND', kind: 'internal-planning', orientation: 'horizontal', at: 'WEST_ROOM_SPLIT', from: 'SHELL_WEST', to: 'COURT_WEST', disposition: disposition('provisional') },
    { id: 'G-GALLERY-SERVICE-B', levelId: 'GROUND', kind: 'internal-planning', orientation: 'vertical', at: 'GALLERY_SERVICE', from: 'SHELL_SOUTH', to: 'COURT_NORTH', disposition: disposition('frozen') },
    { id: 'G-COURT-EAST-SOUTH-CONT-B', levelId: 'GROUND', kind: 'internal-planning', orientation: 'vertical', at: 'COURT_EAST', from: 'SHELL_SOUTH', to: 'COURT_SOUTH', disposition: disposition('frozen') },
    { id: 'G-COURT-WEST-NORTH-CONT-B', levelId: 'GROUND', kind: 'internal-planning', orientation: 'vertical', at: 'COURT_WEST', from: 'COURT_NORTH', to: 'SHELL_NORTH', disposition: disposition('frozen') },
    { id: 'G-COURT-EAST-NORTH-CONT-B', levelId: 'GROUND', kind: 'internal-planning', orientation: 'vertical', at: 'COURT_EAST', from: 'COURT_NORTH', to: 'SHELL_NORTH', disposition: disposition('frozen') },
    { id: 'U-HALL-WEST-B', levelId: 'FIRST', kind: 'internal-planning', orientation: 'vertical', at: 'HALL_WEST', from: 'SHELL_SOUTH', to: 'COURT_SOUTH', disposition: disposition('provisional') },
    { id: 'U-WEST-SPLIT-B', levelId: 'FIRST', kind: 'internal-planning', orientation: 'horizontal', at: 'WEST_ROOM_SPLIT', from: 'SHELL_WEST', to: 'COURT_WEST', disposition: disposition('provisional') },
    { id: 'U-GALLERY-SERVICE-B', levelId: 'FIRST', kind: 'internal-planning', orientation: 'vertical', at: 'GALLERY_SERVICE', from: 'UPPER_SOUTH_TURN', to: 'UPPER_NORTH_SPLIT', disposition: disposition('provisional') },
    { id: 'U-COURT-EAST-SOUTH-CONT-B', levelId: 'FIRST', kind: 'internal-planning', orientation: 'vertical', at: 'COURT_EAST', from: 'SHELL_SOUTH', to: 'UPPER_SOUTH_TURN', disposition: disposition('provisional') },
    { id: 'U-SOUTH-TURN-B', levelId: 'FIRST', kind: 'internal-planning', orientation: 'horizontal', at: 'UPPER_SOUTH_TURN', from: 'COURT_EAST', to: 'GALLERY_SERVICE', disposition: disposition('provisional') },
    { id: 'U-COURT-WEST-NORTH-CONT-B', levelId: 'FIRST', kind: 'internal-planning', orientation: 'vertical', at: 'COURT_WEST', from: 'COURT_NORTH', to: 'SHELL_NORTH', disposition: disposition('frozen') },
    { id: 'U-COURT-EAST-NORTH-CONT-B', levelId: 'FIRST', kind: 'internal-planning', orientation: 'vertical', at: 'COURT_EAST', from: 'UPPER_NORTH_SPLIT', to: 'SHELL_NORTH', disposition: disposition('provisional') },
    { id: 'U-NORTH-TURN-B', levelId: 'FIRST', kind: 'internal-planning', orientation: 'horizontal', at: 'UPPER_NORTH_SPLIT', from: 'COURT_EAST', to: 'GALLERY_SERVICE', disposition: disposition('provisional') },
    { id: 'U-NORTH-SPLIT-B', levelId: 'FIRST', kind: 'internal-planning', orientation: 'horizontal', at: 'UPPER_NORTH_SPLIT', from: 'COURT_WEST', to: 'COURT_EAST', disposition: disposition('provisional') },
    { id: 'U-DRY-SPLIT-B', levelId: 'FIRST', kind: 'internal-planning', orientation: 'vertical', at: 'UPPER_DRY_SPLIT', from: 'UPPER_NORTH_SPLIT', to: 'SHELL_NORTH', disposition: disposition('provisional') }
  ],
  requiredAdjacencies: [
    { id: 'ADJ-G-DRAW-FAM', levelId: 'GROUND', a: 'G-DRAW-02', b: 'G-FAM-02' },
    { id: 'ADJ-G-DRAW-HALL', levelId: 'GROUND', a: 'G-DRAW-02', b: 'G-HALL-02' },
    { id: 'ADJ-G-HALL-GAL', levelId: 'GROUND', a: 'G-HALL-02', b: 'G-GAL-01' },
    { id: 'ADJ-G-STUDY-GAL', levelId: 'GROUND', a: 'G-STUDY-02', b: 'G-GAL-01' },
    { id: 'ADJ-G-SVC-GAL', levelId: 'GROUND', a: 'G-SVC-02', b: 'G-GAL-01' },
    { id: 'ADJ-G-FAM-GARDEN', levelId: 'GROUND', a: 'G-FAM-02', b: 'G-GARDEN-02' },
    { id: 'ADJ-G-GARDEN-KIT', levelId: 'GROUND', a: 'G-GARDEN-02', b: 'G-KIT-02' },
    { id: 'ADJ-U-BED02-P01', levelId: 'FIRST', a: 'U-BED-02', b: 'U-BED-P01' },
    { id: 'ADJ-U-BED02-STAIR', levelId: 'FIRST', a: 'U-BED-02', b: 'U-STAIR-01' },
    { id: 'ADJ-U-STAIR-BED03', levelId: 'FIRST', a: 'U-STAIR-01', b: 'U-BED-03' },
    { id: 'ADJ-U-STAIR-GAL', levelId: 'FIRST', a: 'U-STAIR-01', b: 'U-GAL-02' },
    { id: 'ADJ-U-GAL-BATH', levelId: 'FIRST', a: 'U-GAL-02', b: 'U-BATH-01' },
    { id: 'ADJ-U-GAL-LAND', levelId: 'FIRST', a: 'U-GAL-02', b: 'U-LAND-N01' },
    { id: 'ADJ-U-BED04-LAND', levelId: 'FIRST', a: 'U-BED-04', b: 'U-LAND-N01' }
  ],
  openingFamilies: openingFamilies(),
  openings: [
    { id: 'G-FRONT-W01', levelId: 'GROUND', hostBoundaryId: 'G-OUTER-SOUTH', role: 'window', familyId: 'FAM-FRONT-GROUND-PRINCIPAL', spaceIds: ['G-DRAW-02'], placement: { kind: 'front-bay', bayIndex: 1 }, disposition: disposition('provisional') },
    { id: 'G-FRONT-W02', levelId: 'GROUND', hostBoundaryId: 'G-OUTER-SOUTH', role: 'window', familyId: 'FAM-FRONT-GROUND-STAIR', spaceIds: ['G-HALL-02'], placement: { kind: 'front-bay', bayIndex: 2 }, disposition: disposition('provisional') },
    { id: 'G-FRONT-D01', levelId: 'GROUND', hostBoundaryId: 'G-OUTER-SOUTH', role: 'entrance', familyId: 'FAM-FRONT-ENTRANCE', spaceIds: ['G-HALL-02'], placement: { kind: 'entrance-bay' }, disposition: disposition('provisional') },
    { id: 'G-FRONT-W04', levelId: 'GROUND', hostBoundaryId: 'G-OUTER-SOUTH', role: 'window', familyId: 'FAM-FRONT-GROUND-PRINCIPAL', spaceIds: ['G-STUDY-02'], placement: { kind: 'front-bay', bayIndex: 4 }, disposition: disposition('provisional') },
    ...[1, 2, 3, 4].map((bayIndex) => ({
      id: `U-FRONT-W0${bayIndex}`,
      levelId: 'FIRST' as const,
      hostBoundaryId: 'U-OUTER-SOUTH',
      role: 'window' as const,
      familyId: 'FAM-FRONT-UPPER',
      spaceIds: bayIndex === 1 ? ['U-BED-02'] : bayIndex === 4 ? ['U-BED-03'] : ['U-STAIR-01'],
      placement: { kind: 'front-bay' as const, bayIndex },
      disposition: disposition('provisional')
    })),
    { id: 'G-COURT-SOUTH-O01', levelId: 'GROUND', hostBoundaryId: 'G-COURT-SOUTH', role: 'major-opening', familyId: 'FAM-COURT-NS-MAJOR', spaceIds: ['G-HALL-02'], placement: { kind: 'boundary-centred' }, disposition: disposition('provisional') },
    { id: 'G-COURT-NORTH-O01', levelId: 'GROUND', hostBoundaryId: 'G-COURT-NORTH', role: 'major-opening', familyId: 'FAM-COURT-NS-MAJOR', spaceIds: ['G-GARDEN-02'], placement: { kind: 'boundary-centred' }, disposition: disposition('provisional') },
    { id: 'U-COURT-SOUTH-O01', levelId: 'FIRST', hostBoundaryId: 'U-COURT-SOUTH', role: 'major-opening', familyId: 'FAM-COURT-NS-MAJOR', spaceIds: ['U-STAIR-01'], placement: { kind: 'boundary-centred' }, disposition: disposition('provisional') },
    { id: 'U-COURT-NORTH-O01', levelId: 'FIRST', hostBoundaryId: 'U-COURT-NORTH', role: 'major-opening', familyId: 'FAM-COURT-NS-MAJOR', spaceIds: ['U-LAND-N01'], placement: { kind: 'boundary-centred' }, disposition: disposition('provisional') }
  ],
  qualitativeOpeningRelationships: [
    { id: 'RHCF-COURT-E-G', levelId: 'GROUND', hostBoundaryId: 'G-COURT-EAST', relationship: 'two-bay rhythm; exact numeric centres deliberately absent', disposition: disposition('frozen') },
    { id: 'RHCF-COURT-W-G', levelId: 'GROUND', hostBoundaryId: 'G-COURT-WEST', relationship: 'two room-owned axes; exact numeric centres deliberately absent', disposition: disposition('frozen') },
    { id: 'RHCF-COURT-E-U', levelId: 'FIRST', hostBoundaryId: 'U-COURT-EAST', relationship: 'two-bay rhythm; vertically aligned where coherent; exact numeric centres deliberately absent', disposition: disposition('frozen') },
    { id: 'RHCF-COURT-W-U', levelId: 'FIRST', hostBoundaryId: 'U-COURT-WEST', relationship: 'room-owned axes; vertically aligned where coherent; exact numeric centres deliberately absent', disposition: disposition('frozen') },
    { id: 'RHCF-GARDEN-CENTRE-G', levelId: 'GROUND', hostBoundaryId: 'G-OUTER-NORTH', relationship: 'provisional north-centre garden opening belongs to garden dining; numeric garden field omitted from required C1 geometry', spaceIds: ['G-GARDEN-02'], disposition: disposition('provisional') },
    { id: 'RHCF-GARDEN-CENTRE-U', levelId: 'FIRST', hostBoundaryId: 'U-OUTER-NORTH', relationship: 'north-centre upper garden opening belongs to the dry dressing/storage field, not the north cross-landing; numeric garden field omitted from required C1 geometry', spaceIds: ['U-DRESS-01'], disposition: disposition('provisional') }
  ]
})

export const cloneReferenceHouseSource = (source: ReferenceHouseSource): ReferenceHouseSource =>
  structuredClone(source)
