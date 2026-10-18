import type { DrawingDashRole, DrawingLineRole, DrawingTextRole } from './model.js'

const ptToMm = (points: number): number => (points * 25.4) / 72

export interface PublicationDrawingTokens {
  lineMm: Record<DrawingLineRole, number>
  textMm: Record<DrawingTextRole, number>
  textWeight: Record<DrawingTextRole, 400 | 700>
  dashMm: Record<Exclude<DrawingDashRole, 'none'>, readonly number[]>
  ink: {
    primary: string
    context: string
    faint: string
    paper: string
  }
  fontFamily: string
}

/**
 * Executable DRW-01B / DRW-01C physical-paper contract.
 * SVG user units are millimetres, so these values are literal print sizes.
 */
export const PUBLICATION_DRAWING_TOKENS: PublicationDrawingTokens = Object.freeze({
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
  fontFamily: 'Arial, Helvetica, sans-serif'
})
