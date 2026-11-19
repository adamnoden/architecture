import { sha256SemanticFingerprint, stableJsonStringify } from '../../../core/identity.js'
import { frontStudyOpening } from '../../construction-bay/opening-inspection.js'
import { admitSavedDesignDraft } from '../edit.js'
import type { CurrentDesignResolution } from '../resolve.js'
import { compileStudyFrontElevation } from './study-front-elevation.js'
import { compileStudyRoomKitProjection } from './study-room-kit-projection.js'

const { level, hostWallId, openingId } = frontStudyOpening
export const studyDraftRoomKitMethod = 'ias-study-draft-room-kit/1'

function record(value: unknown): value is Readonly<Record<string, unknown>> {
  return !!value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype
}

function readCase(input: unknown) {
  if (!record(input) || Object.keys(input).length !== 4 || input.schema !== 'ias-study-draft-case/1'
    || typeof input.acceptedPlanDigest !== 'string' || !/^[0-9a-f]{64}$/.test(input.acceptedPlanDigest)
    || !Object.hasOwn(input, 'draft') || !record(input.kit) || Object.hasOwn(input.kit, 'opening')) {
    throw new TypeError('Expected a versioned Study case with an accepted plan digest, saved draft and kit settings')
  }
  return { acceptedPlanDigest: input.acceptedPlanDigest, draft: admitSavedDesignDraft(input.draft), kit: input.kit }
}

function openingGeometryBlocked(error: unknown): error is RangeError {
  return error instanceof RangeError && /^STUDY_ROOM_KIT_(MOVE_REJECTED|OCCUPIED_OPENING_OUTSIDE_AVAILABLE_HOST|OPENING_INTERSECTS_G1_RESERVE)\b/.test(error.message)
}

export function compileStudyDraftRoomKit(resolved: CurrentDesignResolution, input: unknown) {
  const { acceptedPlanDigest, draft, kit } = readCase(input)
  const accepted = resolved.design
  const source = {
    accepted: { id: accepted.source.id, planDigest: sha256SemanticFingerprint(accepted) },
    draft: { id: draft.source.id, planDigest: sha256SemanticFingerprint(draft) },
  }
  const withheld = (code: string, message: string, objectIds: readonly string[]) => ({
    schema: studyDraftRoomKitMethod, status: 'WITHHELD' as const, source,
    diagnostics: [{ code, message, objectIds }],
  })
  if (accepted.source.kind !== 'georgian-layout-revision') {
    return withheld('IAS_STUDY_DRAFT_ACCEPTED_BASIS_REQUIRED', 'This comparison needs the explicit accepted Georgian basis.', [accepted.source.id])
  }
  if (source.accepted.planDigest !== acceptedPlanDigest) {
    return withheld('IAS_STUDY_DRAFT_STALE_ACCEPTED_PLAN', 'The requested accepted plan digest no longer matches the supplied basis.', [accepted.source.id])
  }

  const nativeStorey = accepted.storeys[level]
  const draftStorey = draft.storeys[level]
  const nativeOpening = nativeStorey.openings.find(opening => opening.id === openingId)
  const changedOpening = draftStorey.openings.find(opening => opening.id === openingId)
  if (nativeOpening?.kind !== 'window' || changedOpening?.kind !== 'window' || nativeOpening.hostWallId !== hostWallId
    || changedOpening.hostWallId !== hostWallId) {
    return withheld('IAS_STUDY_DRAFT_OPENING_UNAVAILABLE', 'The Study window and its original south-wall host must be present.', [openingId, hostWallId])
  }

  const unchangedDraft = {
    ...draft, source: accepted.source,
    storeys: { ...draft.storeys, [level]: { ...draftStorey, openings: draftStorey.openings.map(opening =>
      opening.id === openingId ? { ...opening, centreMm: nativeOpening.centreMm, widthMm: nativeOpening.widthMm } : opening) } },
  }
  if (stableJsonStringify(unchangedDraft) !== stableJsonStringify(accepted)) {
    return withheld('IAS_STUDY_DRAFT_OTHER_INPUT_CHANGED', 'Only the position or width of the Study window can differ from the supplied basis.', [draft.source.id, openingId])
  }

  const { centreMm, widthMm } = changedOpening
  const openingCase = { id: openingId, hostId: hostWallId, nominalCentreMm: centreMm, widthMm }
  try {
    const projection = compileStudyRoomKitProjection(resolved, { ...kit, opening: openingCase })
    const occupied = projection.kit.opening
    return {
      schema: studyDraftRoomKitMethod, status: 'CANDIDATE_COMPARISON' as const, source,
      opening: { ...openingCase, occupiedCentreMm: occupied.occupiedCentreMm,
        nominalToOccupiedOffsetMm: occupied.nominalToOccupiedOffsetMm },
      nominalFrontElevation: compileStudyFrontElevation(source, nativeOpening, changedOpening),
      projection,
    }
  } catch (error) {
    if (!openingGeometryBlocked(error)) throw error
    return withheld('IAS_STUDY_DRAFT_OCCUPIED_GEOMETRY_BLOCKED', error.message, [openingId, hostWallId])
  }
}
