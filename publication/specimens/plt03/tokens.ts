import type { PublicationDrawingTokens } from '../../../compiler/publication-drawing/tokens.js'

const ptToMm = (points: number): number => (points * 25.4) / 72

const sourceSansFamily = '"PLT03 Source Sans"'

/**
 * ARTICULATION deliberately stays close to the released DRW physical hierarchy
 * so the current-authority content change can be judged without simultaneously
 * redesigning line weight and text size.
 */
export const PLT03_ARTICULATION_TOKENS: PublicationDrawingTokens = Object.freeze({
  lineMm: Object.freeze({
    cut: 0.5,
    profile: 0.35,
    primary: 0.25,
    secondary: 0.18
  }),
  textMm: Object.freeze({
    label: ptToMm(7.5),
    note: ptToMm(6.5),
    marker: ptToMm(6.5)
  }),
  textWeight: Object.freeze({
    label: 400,
    note: 400,
    marker: 700
  }),
  dashMm: Object.freeze({
    overhead: Object.freeze([3, 1.5]),
    datum: Object.freeze([6, 1.5, 1, 1.5]),
    provisional: Object.freeze([1, 1])
  }),
  ink: Object.freeze({
    primary: '#000000',
    context: '#666666',
    faint: '#a6a6a6',
    paper: '#ffffff'
  }),
  fontFamily: sourceSansFamily
})

/**
 * HIERARCHY is a deliberately restrained first candidate, not a freeze. It
 * narrows the line family, reduces annotation slightly, and relies on light
 * poche rather than solid-black cut bodies. Physical proof decides whether any
 * of these values survive PLT-03.
 */
export const PLT03_HIERARCHY_TOKENS: PublicationDrawingTokens = Object.freeze({
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
    context: '#666666',
    faint: '#e1e1e1',
    paper: '#ffffff'
  }),
  fontFamily: sourceSansFamily
})
