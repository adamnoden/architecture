export interface StudyOrdinaryHandlingPlan {
  readonly schema: 'ias-study-ordinary-handling-plan/1'
  readonly protocols: readonly Record<string, unknown>[]
  readonly boards: readonly { readonly id: string; readonly sizeMm: readonly [number, number]; readonly padTurnDeg: 0 | 90 }[]
  readonly pickupClearanceMm: number
  readonly maximumTravelMm: number
  /** Stationary board-to-retained-object setting reserve; omitted means the legacy zero reserve. */
  readonly minimumBoardFixedClearanceMm?: number
}

export function admitStudyOrdinaryHandlingPlan(value: unknown): StudyOrdinaryHandlingPlan {
  const object = (input: unknown): input is Record<string, unknown> => !!input && typeof input === 'object' && Object.getPrototypeOf(input) === Object.prototype
  if (!object(value) || Object.keys(value).some(key => !['schema', 'boards', 'pickupClearanceMm', 'maximumTravelMm', 'minimumBoardFixedClearanceMm', 'protocols'].includes(key))
    || value.schema !== 'ias-study-ordinary-handling-plan/1' || !Array.isArray(value.boards) || !value.boards.length || value.boards.length > 5
    || typeof value.pickupClearanceMm !== 'number' || !Number.isFinite(value.pickupClearanceMm) || value.pickupClearanceMm < 5
    // Finite authored transfer domain; key reach and person/obstacle criteria are checked independently.
    || typeof value.maximumTravelMm !== 'number' || !Number.isFinite(value.maximumTravelMm) || value.maximumTravelMm <= 0 || value.maximumTravelMm > 1450
    || (value.minimumBoardFixedClearanceMm !== undefined && (typeof value.minimumBoardFixedClearanceMm !== 'number'
      || !Number.isFinite(value.minimumBoardFixedClearanceMm) || value.minimumBoardFixedClearanceMm < 0 || value.minimumBoardFixedClearanceMm > 50))
    || (!Array.isArray(value.protocols) || !value.protocols.length || value.protocols.length > 200 || value.protocols.some(protocol => !object(protocol)))) {
    throw new TypeError('INVALID_STUDY_ORDINARY_HANDLING_PLAN')
  }
  const seen = new Set<string>()
  const boards = value.boards.map(board => {
    if (!object(board) || Object.keys(board).some(key => !['id', 'sizeMm', 'padTurnDeg'].includes(key))
      || typeof board.id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(board.id) || seen.has(board.id)
      || !Array.isArray(board.sizeMm) || board.sizeMm.length !== 2 || board.sizeMm.some(dimension => typeof dimension !== 'number' || !Number.isFinite(dimension) || dimension <= 0 || dimension > 1000)
      || (board.padTurnDeg !== 0 && board.padTurnDeg !== 90)) throw new TypeError('INVALID_STUDY_ORDINARY_BOARD')
    const [x, y] = board.sizeMm as [number, number]
    const padEnvelope = board.padTurnDeg === 0 ? [120, 175] : [175, 120]
    if (x < padEnvelope[0] || y < padEnvelope[1]) throw new RangeError('STUDY_ORDINARY_BOARD_CANNOT_CONTAIN_FIXED_PADS')
    seen.add(board.id)
    return { id: board.id, sizeMm: [x, y] as const, padTurnDeg: board.padTurnDeg as 0 | 90 }
  })
  return { schema: value.schema, boards, pickupClearanceMm: value.pickupClearanceMm,
    maximumTravelMm: value.maximumTravelMm,
    ...(value.minimumBoardFixedClearanceMm === undefined ? {} : { minimumBoardFixedClearanceMm: value.minimumBoardFixedClearanceMm }), protocols: value.protocols as Record<string, unknown>[] }
}

/** A well-formed plan can remain authored while its former part family is withheld. */
export function studyOrdinaryPlanAppliesToParts(plan: StudyOrdinaryHandlingPlan, partIds: readonly string[]): boolean {
  const ids = plan.protocols.map(protocol => protocol.partId)
  if (ids.some(id => typeof id !== 'string' || id.length === 0) || new Set(ids).size !== ids.length) {
    throw new TypeError('INVALID_STUDY_ORDINARY_PART_IDENTITY')
  }
  if (new Set(partIds).size !== partIds.length) throw new TypeError('DUPLICATE_STUDY_CURRENT_PART_IDENTITY')
  return ids.length === partIds.length && partIds.every(id => ids.includes(id))
}
