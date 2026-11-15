import { translateDrawingPrimitive } from '../../compiler/publication-drawing-v2/composition.js'
import type { DrawingSceneV2 } from '../../compiler/publication-drawing-v2/model.js'
import { PLT_CANDIDATE_TOKENS } from '../../compiler/publication-drawing-v2/plt-candidate-tokens.js'
import { renderDrawingSceneV2SvgWithTokens } from '../../compiler/publication-drawing-v2/svg.js'

/** Page-space composition only; the current house source owns every architectural primitive. */
export function createPrimerGroundPlanScene(source: DrawingSceneV2): DrawingSceneV2 {
  return {
    ...source,
    widthMm: 158,
    heightMm: 180,
    // Retain the external door swing and top dimension without reducing the drawing scale.
    // These two furniture notes are also omitted by the existing book composition.
    primitives: source.primitives
      .filter((primitive) => primitive.id !== 'scope' && primitive.id !== 'clearances')
      .map((primitive) => translateDrawingPrimitive(primitive, 0, 8))
  }
}

export function renderPrimerGroundPlanSvg(source: DrawingSceneV2): string {
  return renderDrawingSceneV2SvgWithTokens(createPrimerGroundPlanScene(source), PLT_CANDIDATE_TOKENS)
}
