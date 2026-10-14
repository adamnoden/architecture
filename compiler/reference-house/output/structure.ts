import {
  ANNOTATION_ZONE,
  INSPECTION_STYLE,
  SPAN_ARROW_DEF,
  renderNorthArrow,
  renderReviewBanner,
  renderUndirectedSpanAxis
} from '../../output/conventions.js'
import { createNorthUpPlanProjection } from '../../output/projection.js'
import { escapeXml, formatSvgNumber, svgLine, svgRect, svgText } from '../../output/svg.js'
import { REFERENCE_HOUSE_OUTPUTS } from './contract.js'
import type { ReferenceHouseOutputContext } from './context.js'

const LOCAL_STYLE = `
  .st-context{stroke:#b8b8b8;stroke-width:22;fill:none}
  .st-field{fill:#f7f6f2;stroke:#c9c9c9;stroke-width:18}
  .st-bearing{stroke:#333;stroke-width:58;fill:none;stroke-dasharray:115 72}
  .st-beam{stroke:#111;stroke-width:105;fill:none}
  .st-reaction{fill:#111}
  .st-interruption{fill:#fff;stroke:#555;stroke-width:24;stroke-dasharray:42 42}
  .st-legend-line{stroke:#333;stroke-width:54}
  .st-legend-beam{stroke:#111;stroke-width:95}
`

const diagnostics = (context: ReferenceHouseOutputContext): string[] =>
  [...new Set(context.result.diagnostics.structure.map((item) => item.code))].sort()

export const renderReferenceHouseStructuralInspection = (
  context: ReferenceHouseOutputContext
): string => {
  const descriptor = REFERENCE_HOUSE_OUTPUTS.firstFloorStructure
  const house = context.result.house.derived
  const structure = context.result.structure.derived
  const project = createNorthUpPlanProjection(house.shell.depth)

  const viewX = -1400
  const viewY = -1700
  const viewWidth = house.shell.width + 1400 + ANNOTATION_ZONE.rightWidth
  const viewHeight = house.shell.depth + 1700 + ANNOTATION_ZONE.bottomHeight
  const rightX = house.shell.width + 900

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1120" viewBox="${formatSvgNumber(viewX)} ${formatSvgNumber(viewY)} ${formatSvgNumber(viewWidth)} ${formatSvgNumber(viewHeight)}" role="img" aria-labelledby="title desc" data-output-id="${descriptor.id}" data-renderer-version="${descriptor.rendererVersion}" data-source-compile="${context.result.identity.compile.fingerprint}" data-compile-status="${context.result.status}">`,
    '<title id="title">Reference House — first-floor structural topology</title>',
    '<desc id="desc">North-up deterministic structural inspection view. It represents support, span and interruption topology only; no member capacity or foundation adequacy is claimed.</desc>',
    `<style>${INSPECTION_STYLE}${LOCAL_STYLE}</style>`,
    `<defs>${SPAN_ARROW_DEF}</defs>`,
    svgRect(viewX, viewY, viewWidth, viewHeight, 'class="oh-bg"'),
    svgText(0, -1150, 'Reference House — first-floor structural topology', 'class="oh-title"'),
    svgText(0, -760, 'GENERATED SEMANTIC INSPECTION · NORTH UP · support / span topology only', 'class="oh-subtitle"'),
    svgRect(0, 0, house.shell.width, house.shell.depth, 'class="st-context"'),
    svgRect(house.court.x0, house.shell.depth - house.court.y1, house.court.width, house.court.depth, 'class="st-context"'),
    renderNorthArrow(rightX + 2350, 250)
  ]

  parts.push('<g data-layer="span-fields">')
  for (const field of structure.spanFields) {
    const box = project.rect(field.bounds)
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2
    parts.push(`<g data-entity="${escapeXml(field.id)}" data-kind="span-field" data-span-axis="${field.spanAxis}" data-provisional="${field.provisional}">`)
    parts.push(svgRect(box.x, box.y, box.width, box.height, 'class="st-field"'))
    const half = Math.min(Number(field.grossSpan) * 0.25, 900)
    if (field.spanAxis === 'x') {
      parts.push(renderUndirectedSpanAxis(field.id, cx - half, cy, cx + half, cy))
    } else {
      parts.push(renderUndirectedSpanAxis(field.id, cx, cy + half, cx, cy - half))
    }
    parts.push(svgText(cx, cy + 270, `${field.label} · ${formatSvgNumber(Number(field.grossSpan))} mm gross`, 'class="oh-label" text-anchor="middle"'))
    parts.push(svgText(cx, cy + 500, field.id, 'class="oh-id" text-anchor="middle"'))
    parts.push('</g>')
  }
  parts.push('</g>')

  parts.push('<g data-layer="structural-lines">')
  for (const element of structure.lineElements) {
    const a = project.point(Number(element.x1), Number(element.y1))
    const b = project.point(Number(element.x2), Number(element.y2))
    const className = element.kind === 'edge-beam' ? 'st-beam' : 'st-bearing'
    parts.push(svgLine(a.x, a.y, b.x, b.y, `class="${className}" data-entity="${escapeXml(element.id)}" data-kind="${element.kind}" data-provisional="${element.provisional}"`))
  }
  parts.push('</g>')

  parts.push('<g data-layer="reaction-nodes">')
  for (const node of structure.reactionNodes) {
    const p = project.point(Number(node.x), Number(node.y))
    parts.push(`<circle data-entity="${escapeXml(node.id)}" data-kind="reaction-node" cx="${formatSvgNumber(p.x)}" cy="${formatSvgNumber(p.y)}" r="105" class="st-reaction"/>`)
  }
  parts.push('</g>')

  parts.push(`<g data-layer="legend">
    ${svgText(rightX, 1650, 'Structural key', 'class="oh-label"')}
    ${svgLine(rightX, 1950, rightX + 650, 1950, 'class="st-bearing"')}${svgText(rightX + 820, 2010, 'bearing line · provisional topology', 'class="oh-note"')}
    ${svgLine(rightX, 2250, rightX + 650, 2250, 'class="st-beam"')}${svgText(rightX + 820, 2310, 'edge beam', 'class="oh-note"')}
    <circle cx="${formatSvgNumber(rightX + 325)}" cy="2550" r="95" class="st-reaction"/>${svgText(rightX + 820, 2610, 'reaction node', 'class="oh-note"')}
    ${renderUndirectedSpanAxis('LEGEND-SPAN', rightX, 2870, rightX + 650, 2870)}${svgText(rightX + 820, 2930, 'span axis · undirected', 'class="oh-note"')}
  </g>`)

  parts.push(`<g data-layer="interruptions">
    ${svgText(rightX, 3500, 'Interruption obligations', 'class="oh-label"')}
  `)
  let interruptionY = 3820
  for (const interruption of structure.interruptions) {
    const geometry = interruption.geometry.kind === 'qualitative'
      ? 'qualitative · exact geometry unresolved'
      : `approx. envelope ${formatSvgNumber(Number(interruption.geometry.width))} × ${formatSvgNumber(Number(interruption.geometry.depth))} mm · exact position unresolved`
    parts.push(`<g data-entity="${escapeXml(interruption.id)}" data-kind="${interruption.kind}" data-geometry="${interruption.geometry.kind}">
      ${svgRect(rightX, interruptionY - 180, 3800, 520, 'class="st-interruption"')}
      ${svgText(rightX + 180, interruptionY + 20, `${interruption.id} · ${interruption.kind}`, 'class="oh-mono"')}
      ${svgText(rightX + 180, interruptionY + 245, `${interruption.hostFieldId} · ${geometry}`, 'class="oh-note"')}
    </g>`)
    interruptionY += 720
  }
  parts.push('</g>')

  parts.push(
    svgText(rightX, 5700, 'Diaphragm', 'class="oh-label"'),
    svgText(rightX, 6000, `${structure.diaphragm.id} · ${structure.diaphragm.primaryLayer}`, 'class="oh-mono"'),
    svgText(rightX, 6270, 'Changeable floor finishes are non-structural.', 'class="oh-note"'),
    svgText(0, house.shell.depth + 1050, 'Structural topology is machine-checked at bounded scope. Strength, deflection, vibration, fire, robustness, bearing, connection and foundation adequacy remain external.', 'class="oh-note"')
  )

  if (context.reviewStateVisible) {
    parts.push(renderReviewBanner(0, house.shell.depth + 1350, house.shell.width, diagnostics(context)))
  }

  parts.push('</svg>')
  return `${parts.join('\n')}\n`
}
