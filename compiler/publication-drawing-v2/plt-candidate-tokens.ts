import type { PublicationDrawingTokens } from '../publication-drawing/tokens.js'

const ptToMm = (points: number): number => (points * 25.4) / 72

/**
 * Reusable B6 screen-approved candidate grammar. Physical acceptance and the
 * drawing-publication-v2 release remain separate. Values retain the ADE03B
 * proof exactly; black-only tints distinguish the wall assembly.
 */
export const PLT_CANDIDATE_TOKENS: PublicationDrawingTokens = Object.freeze({
  lineMm: Object.freeze({
    cut: 0.42,
    profile: 0.28,
    primary: 0.2,
    secondary: 0.14
  }),
  textMm: Object.freeze({
    label: ptToMm(7),
    note: ptToMm(6),
    marker: ptToMm(6)
  }),
  textWeight: Object.freeze({
    label: 400,
    note: 400,
    marker: 700
  }),
  dashMm: Object.freeze({
    overhead: Object.freeze([2.5, 1.25]),
    datum: Object.freeze([5, 1.25, 0.8, 1.25]),
    provisional: Object.freeze([0.8, 0.8])
  }),
  ink: Object.freeze({
    primary: '#000000',
    context: '#dfdfdf',
    faint: '#ededed',
    paper: '#ffffff'
  }),
  fontFamily: '"Source Sans 3", Arial, sans-serif'
})
