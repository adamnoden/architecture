import { escapeXml, formatSvgNumber, svgLine, svgRect, svgText } from './svg.js'

export type GraphicAuthority =
  | 'controlled'
  | 'provisional'
  | 'approximate'
  | 'range'
  | 'qualitative'
  | 'context'

export const INSPECTION_SECTION_ID = 'A–A' as const

export const INSPECTION_STYLE = `
  .oh-bg{fill:#fbfaf7}
  .oh-controlled{stroke:#171717;stroke-width:54;fill:none}
  .oh-provisional{stroke:#555;stroke-width:40;stroke-dasharray:120 80;fill:none}
  .oh-approximate{stroke:#333;stroke-width:38;stroke-dasharray:50 45;fill:none}
  .oh-range-max{stroke:#777;stroke-width:32;stroke-dasharray:90 60;fill:none}
  .oh-range-min{stroke:#222;stroke-width:32;fill:none}
  .oh-qualitative{stroke:#555;stroke-width:26;stroke-dasharray:20 55;fill:none}
  .oh-context{stroke:#aaa;stroke-width:20;fill:none}
  .oh-room{fill:#f2f1ed}.oh-circulation{fill:#e9e9e5}.oh-court{fill:#fff}
  .oh-title{font:600 410px system-ui,sans-serif;fill:#171717}
  .oh-subtitle{font:205px system-ui,sans-serif;fill:#444}
  .oh-label{font:600 220px system-ui,sans-serif;fill:#222}
  .oh-id{font:160px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#666}
  .oh-note{font:165px system-ui,sans-serif;fill:#444}
  .oh-mono{font:165px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#333}
  .oh-review{fill:#fff;stroke:#171717;stroke-width:28;stroke-dasharray:70 45}
  .oh-review-text{font:700 190px system-ui,sans-serif;letter-spacing:18px;fill:#171717}
`

export const authorityClass = (authority: GraphicAuthority): string => {
  switch (authority) {
    case 'controlled': return 'oh-controlled'
    case 'provisional': return 'oh-provisional'
    case 'approximate': return 'oh-approximate'
    case 'range': return 'oh-range-max'
    case 'qualitative': return 'oh-qualitative'
    case 'context': return 'oh-context'
  }
}

export const renderNorthArrow = (x: number, y: number): string => `
  <g data-convention="north-arrow" aria-label="North">
    ${svgLine(x, y + 430, x, y + 80, 'class="oh-controlled" stroke-width="28"')}
    <path d="M ${formatSvgNumber(x)} ${formatSvgNumber(y)} L ${formatSvgNumber(x - 95)} ${formatSvgNumber(y + 160)} L ${formatSvgNumber(x + 95)} ${formatSvgNumber(y + 160)} Z" fill="#171717"/>
    ${svgText(x, y + 650, 'N', 'class="oh-label" text-anchor="middle"')}
  </g>`

/**
 * A qualitative-host marker covers the known host span instead of selecting a fake centre.
 * Its full-span dotted overlay means “relationship belongs somewhere on this host; position unresolved”.
 */
export const renderQualitativeHost = (
  id: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  label = 'opening relationship · position unresolved'
): string => {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  return `<g data-entity="${escapeXml(id)}" data-authority="qualitative" data-geometry="unresolved" data-convention="qualitative-host">
    ${svgLine(x1, y1, x2, y2, 'class="oh-qualitative"')}
    ${svgText(mx, my - 115, label, 'class="oh-note" text-anchor="middle"')}
  </g>`
}

/** Entire shared candidate edge is marked: no point on the edge is asserted as the doorway. */
export const renderRequiredConnection = (
  id: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): string => {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  return `<g data-entity="${escapeXml(id)}" data-authority="qualitative" data-geometry="unresolved" data-convention="required-connection">
    ${svgLine(x1, y1, x2, y2, 'class="oh-qualitative"')}
    ${svgText(mx, my + 165, 'connection required · position unresolved', 'class="oh-note" text-anchor="middle"')}
  </g>`
}

export const renderUndirectedSpanAxis = (
  id: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): string => `<line data-entity="${escapeXml(id)}" data-convention="span-axis" x1="${formatSvgNumber(x1)}" y1="${formatSvgNumber(y1)}" x2="${formatSvgNumber(x2)}" y2="${formatSvgNumber(y2)}" stroke="#666" stroke-width="28" marker-start="url(#oh-span-arrow)" marker-end="url(#oh-span-arrow)"/>`

export const SPAN_ARROW_DEF = '<marker id="oh-span-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#666"/></marker>'

export const renderSectionCut = (
  x: number,
  ySouth: number,
  yNorth: number
): string => `<g data-convention="section-cut" data-section="${INSPECTION_SECTION_ID}">
  ${svgLine(x, ySouth, x, yNorth, 'stroke="#555" stroke-width="24" stroke-dasharray="85 60"')}
  <path d="M ${formatSvgNumber(x)} ${formatSvgNumber(ySouth)} l 150 90 l -150 90 z" fill="#171717"/>
  <path d="M ${formatSvgNumber(x)} ${formatSvgNumber(yNorth)} l 150 -90 l -150 -90 z" fill="#171717"/>
  ${svgText(x + 210, ySouth + 70, 'A', 'class="oh-label"')}
  ${svgText(x + 210, yNorth - 40, 'A', 'class="oh-label"')}
</g>`

export const renderReviewBanner = (
  x: number,
  y: number,
  width: number,
  diagnostics: readonly string[]
): string => `<g data-compile-status="REVIEW" data-convention="review-banner">
  ${svgRect(x, y, width, 430, 'class="oh-review"')}
  ${svgText(x + width / 2, y + 275, `REVIEW · ${diagnostics.join(', ') || 'UNRESOLVED'}`, 'class="oh-review-text" text-anchor="middle"')}
</g>`

export const renderCompactLegend = (x: number, y: number): string => {
  const rows: Array<[string, string]> = [
    ['controlled / represented', 'oh-controlled'],
    ['provisional', 'oh-provisional'],
    ['approximate', 'oh-approximate'],
    ['range — outer extent', 'oh-range-max'],
    ['relationship known · geometry unresolved', 'oh-qualitative']
  ]
  return `<g data-convention="inspection-legend">
    ${svgText(x, y, 'Drawing key', 'class="oh-label"')}
    ${rows.map(([label, className], index) => {
      const ry = y + 280 + index * 260
      return `${svgLine(x, ry, x + 650, ry, `class="${className}"`)}${svgText(x + 820, ry + 60, label, 'class="oh-note"')}`
    }).join('\n')}
  </g>`
}

export const ANNOTATION_ZONE = {
  rightWidth: 3900,
  bottomHeight: 2100
} as const
