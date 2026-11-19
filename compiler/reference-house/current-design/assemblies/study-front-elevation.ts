import { frontStudyOpening } from '../../construction-bay/opening-inspection.js'
import { elevationSource, layoutFamilySource, renderLayoutElevation } from '../../georgian/layout-family.js'

type OpeningSetout = { readonly centreMm: number; readonly widthMm: number }
type PlanIdentity = { readonly id: string; readonly planDigest: string }

export function compileStudyFrontElevation(
  source: { readonly accepted: PlanIdentity; readonly draft: PlanIdentity },
  acceptedOpening: OpeningSetout,
  draftOpening: OpeningSetout,
) {
  const { openingId, hostWallId, level } = frontStudyOpening
  const withheld = (code: string) => ({
    state: 'withheld', source, diagnostics: [{ code, objectIds: [openingId, hostWallId] }],
  } as const)
  const native = elevationSource('FRONT')
  const opening = native.apertures.find(item => `${item.level}/${item.sourceId}` === openingId)
  if (native.sourceId !== source.accepted.id || `${level}/${native.wall}` !== hostWallId || native.reverse
    || opening?.kind !== 'window' || opening.u !== acceptedOpening.centreMm || opening.width !== acceptedOpening.widthMm
    || !Number.isFinite(opening.sill) || !Number.isFinite(opening.head) || opening.sill >= opening.head) {
    return withheld('IAS_STUDY_DRAFT_ELEVATION_SOURCE_MISMATCH')
  }

  const { centreMm, widthMm } = draftOpening
  if (widthMm <= 2 * layoutFamilySource.design.facade.frameFace) {
    return withheld('IAS_STUDY_DRAFT_ELEVATION_WIDTH_OUTSIDE_FRAME_PROFILE')
  }
  const changed = centreMm !== opening.u || widthMm !== opening.width
  const model = changed ? { ...native, apertures: native.apertures.map(item => item === opening
    ? { ...item, u: centreMm, width: widthMm } : item) } : native
  const scene = renderLayoutElevation(model, 100)
  return {
    state: 'nominal-comparison',
    source: { ...source, layoutFamilyId: layoutFamilySource.id },
    opening: {
      id: openingId, hostId: hostWallId, outlineId: `${opening.id}-outline`, centreMm, widthMm,
      leftMm: centreMm - widthMm / 2, rightMm: centreMm + widthMm / 2, sillMm: opening.sill, headMm: opening.head,
    },
    scene: changed ? { ...scene, sourceId: source.draft.id } : scene,
    evidence: { state: 'nominal-geometry-only', pending: ['occupied opening and fixed frame', 'installed joinery and support'] },
  } as const
}
