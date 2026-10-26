import type { ReferenceHouseSource } from './model.js'
import { mm } from './units.js'

export type InternalPartitionFamilyId = 'RH-PART-DRY-01'
export type InternalPartitionIntent = 'physical-nonloadbearing-partition'

export interface ReferenceHouseInternalPartitionFamily {
  id: InternalPartitionFamilyId
  authority: 'PROVISIONAL'
  disposition: 'PROVISIONAL_BUT_REPRESENTABLE'
  constructionFamily: 'dry-framed-nonloadbearing'
  loadbearing: false
  coordinationThickness: {
    kind: 'range'
    min: ReturnType<typeof mm>
    max: ReturnType<typeof mm>
  }
  datumRelation: 'centred-on-planning-datum'
  replaceability: 'bounded-rebuildable-assembly'
  servicePolicy: 'service-free'
  relocatableSystemSelected: false
  proprietarySystemSelected: false
  performanceObligations: readonly [
    'acoustic-privacy',
    'impact-and-fixing-robustness',
    'fire-where-required',
    'moisture-where-required',
    'door-set-stability'
  ]
  notModelled: readonly string[]
}

export interface ReferenceHouseInternalPartitionIntentSource {
  boundaryId: string
  familyId: InternalPartitionFamilyId
  intent: InternalPartitionIntent
  openingSelection: 'unresolved'
}

export interface ReferenceHouseInternalPartitionSource {
  family: ReferenceHouseInternalPartitionFamily
  intents: ReferenceHouseInternalPartitionIntentSource[]
}

export interface InternalPartitionSourceDiagnostic {
  code:
    | 'INVALID_PARTITION_COORDINATION_RANGE'
    | 'DUPLICATE_PARTITION_INTENT'
    | 'PARTITION_BOUNDARY_NOT_FOUND'
    | 'PARTITION_BOUNDARY_NOT_INTERNAL_PLANNING'
    | 'PARTITION_FAMILY_MISMATCH'
    | 'INTERNAL_PARTITION_INTENT_MISSING'
  subjectIds: string[]
  message: string
}

const currentInternalPlanningBoundaryIds = [
  'G-HALL-WEST-B',
  'G-WEST-SPLIT-B',
  'G-GALLERY-SERVICE-B',
  'G-COURT-EAST-SOUTH-CONT-B',
  'G-COURT-WEST-NORTH-CONT-B',
  'G-COURT-EAST-NORTH-CONT-B',
  'U-HALL-WEST-B',
  'U-WEST-SPLIT-B',
  'U-GALLERY-SERVICE-B',
  'U-COURT-EAST-SOUTH-CONT-B',
  'U-SOUTH-TURN-B',
  'U-COURT-WEST-NORTH-CONT-B',
  'U-COURT-EAST-NORTH-CONT-B',
  'U-NORTH-TURN-B',
  'U-NORTH-SPLIT-B',
  'U-DRY-SPLIT-B'
] as const

export const createReferenceHouseInternalPartitionSource = (): ReferenceHouseInternalPartitionSource => ({
  family: {
    id: 'RH-PART-DRY-01',
    authority: 'PROVISIONAL',
    disposition: 'PROVISIONAL_BUT_REPRESENTABLE',
    constructionFamily: 'dry-framed-nonloadbearing',
    loadbearing: false,
    coordinationThickness: {
      kind: 'range',
      min: mm(100),
      max: mm(150)
    },
    datumRelation: 'centred-on-planning-datum',
    replaceability: 'bounded-rebuildable-assembly',
    servicePolicy: 'service-free',
    relocatableSystemSelected: false,
    proprietarySystemSelected: false,
    performanceObligations: [
      'acoustic-privacy',
      'impact-and-fixing-robustness',
      'fire-where-required',
      'moisture-where-required',
      'door-set-stability'
    ],
    notModelled: [
      'stud-or-frame-material',
      'stud-profile-and-centres',
      'board-type-count-and-thickness',
      'cavity-insulation',
      'tested-acoustic-rating',
      'tested-fire-rating',
      'wet-area-board-and-membrane-build-up',
      'door-jamb-and-head-reinforcement',
      'deflection-head-detail',
      'floor-ceiling-and-abutment-fixings',
      'sealants-and-edge-closure',
      'skirting-and-finish-interface',
      'penetrations',
      'service-routes'
    ]
  },
  intents: currentInternalPlanningBoundaryIds.map((boundaryId) => ({
    boundaryId,
    familyId: 'RH-PART-DRY-01' as const,
    intent: 'physical-nonloadbearing-partition' as const,
    openingSelection: 'unresolved' as const
  }))
})

export const auditReferenceHouseInternalPartitionSource = (
  house: ReferenceHouseSource,
  partitionSource: ReferenceHouseInternalPartitionSource
): InternalPartitionSourceDiagnostic[] => {
  const diagnostics: InternalPartitionSourceDiagnostic[] = []
  const { min, max } = partitionSource.family.coordinationThickness

  if (min <= 0 || max < min) {
    diagnostics.push({
      code: 'INVALID_PARTITION_COORDINATION_RANGE',
      subjectIds: [partitionSource.family.id],
      message: `Partition coordination range ${min}-${max} mm is invalid.`
    })
  }

  const boundaries = new Map(house.boundaries.map((boundary) => [boundary.id, boundary]))
  const seen = new Set<string>()

  for (const intent of partitionSource.intents) {
    if (seen.has(intent.boundaryId)) {
      diagnostics.push({
        code: 'DUPLICATE_PARTITION_INTENT',
        subjectIds: [intent.boundaryId],
        message: `${intent.boundaryId} is classified more than once.`
      })
    }
    seen.add(intent.boundaryId)

    const boundary = boundaries.get(intent.boundaryId)
    if (!boundary) {
      diagnostics.push({
        code: 'PARTITION_BOUNDARY_NOT_FOUND',
        subjectIds: [intent.boundaryId],
        message: `${intent.boundaryId} does not exist in the Reference House boundary source.`
      })
      continue
    }

    if (boundary.kind !== 'internal-planning') {
      diagnostics.push({
        code: 'PARTITION_BOUNDARY_NOT_INTERNAL_PLANNING',
        subjectIds: [intent.boundaryId],
        message: `${intent.boundaryId} is ${boundary.kind}, not an internal-planning boundary.`
      })
    }

    if (intent.familyId !== partitionSource.family.id) {
      diagnostics.push({
        code: 'PARTITION_FAMILY_MISMATCH',
        subjectIds: [intent.boundaryId, intent.familyId],
        message: `${intent.boundaryId} references ${intent.familyId}, not ${partitionSource.family.id}.`
      })
    }
  }

  for (const boundary of house.boundaries.filter((candidate) => candidate.kind === 'internal-planning')) {
    if (seen.has(boundary.id)) continue
    diagnostics.push({
      code: 'INTERNAL_PARTITION_INTENT_MISSING',
      subjectIds: [boundary.id],
      message: `${boundary.id} has no physical-partition or unresolved-datum classification.`
    })
  }

  return diagnostics.sort((a, b) => {
    const byCode = a.code.localeCompare(b.code)
    if (byCode) return byCode
    return a.subjectIds.join('|').localeCompare(b.subjectIds.join('|'))
  })
}
