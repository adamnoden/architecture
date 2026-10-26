import type { DrawingScene } from '../../../compiler/publication-drawing/model.js'
import { renderDrawingSceneSvgWithTokens } from '../../../compiler/publication-drawing/svg.js'
import type { PublicationDrawingTokens } from '../../../compiler/publication-drawing/tokens.js'

/**
 * PLT specimen rendering uses the shared deterministic SVG serializer with an
 * explicitly supplied specimen token set. Keeping token selection here while
 * centralising primitive serialization prevents backend feature drift.
 */
export const renderSpecimenDrawingSceneSvgWithTokens = (
  scene: DrawingScene,
  tokens: PublicationDrawingTokens
): string => renderDrawingSceneSvgWithTokens(scene, tokens)
