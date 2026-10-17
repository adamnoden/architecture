export const patternPublicationOrder = [
  'PAT-001',
  'PAT-002',
  'PAT-014',
  'PAT-003',
  'PAT-015',
  'PAT-004',
  'PAT-005',
  'PAT-016',
  'PAT-017',
  'PAT-018',
  'PAT-009',
  'PAT-007',
  'PAT-019',
  'PAT-020',
  'PAT-008',
  'PAT-022',
  'PAT-010',
  'PAT-021',
  'PAT-011',
  'PAT-013',
  'PAT-012'
] as const

const patternPublicationRank = new Map<string, number>(
  patternPublicationOrder.map((id, index) => [id, index])
)

export function readerPatternRank(id: string): number | null {
  return patternPublicationRank.get(id) ?? null
}
