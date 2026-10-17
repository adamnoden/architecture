export const patternPublicationOrder = [
  'HSA-P-001',
  'HSA-P-002',
  'HSA-P-014',
  'HSA-P-003',
  'HSA-P-015',
  'HSA-P-004',
  'HSA-P-005',
  'HSA-P-016',
  'HSA-P-017',
  'HSA-P-018',
  'HSA-P-009',
  'HSA-P-007',
  'HSA-P-019',
  'HSA-P-020',
  'HSA-P-008',
  'HSA-P-022',
  'HSA-P-010',
  'HSA-P-021',
  'HSA-P-011',
  'HSA-P-013',
  'HSA-P-012'
] as const

const patternPublicationRank = new Map<string, number>(
  patternPublicationOrder.map((id, index) => [id, index])
)

export function readerPatternRank(id: string): number | null {
  return patternPublicationRank.get(id) ?? null
}
