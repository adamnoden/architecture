import type { PlanSliceCompileResult } from '../plan-slice/model.js'
import type { StructuralTopologyCompileResult } from './model.js'

const escapeXml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const number = (value: number): string =>
  Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)))

export const renderStructuralTopologySvg = (
  result: StructuralTopologyCompileResult,
  plan: PlanSliceCompileResult,
  title: string
): string => {
  if (result.status === 'FAIL') {
    throw new Error(`Refusing to render failed structural topology ${result.fixtureId}.`)
  }
  if (plan.fixtureId !== result.planFixtureId) {
    throw new Error(`Structural topology ${result.fixtureId} was not compiled against plan ${plan.fixtureId}.`)
  }

  const margin = 500
  const noteHeight = 1900
  const width = plan.derived.shell.width + 2 * margin
  const height = plan.derived.shell.depth + 2 * margin + noteHeight

  const fields = result.derived.spanFields.map((field) => {
    const box = field.bounds
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2
    const halfArrow = Math.min(field.grossSpan * 0.25, 900)
    const arrow = field.spanAxis === 'x'
      ? `<line data-span-arrow="${escapeXml(field.id)}" x1="${number(cx - halfArrow)}" y1="${number(cy)}" x2="${number(cx + halfArrow)}" y2="${number(cy)}" stroke="#666" stroke-width="28" marker-end="url(#arrow)"/>`
      : `<line data-span-arrow="${escapeXml(field.id)}" x1="${number(cx)}" y1="${number(cy + halfArrow)}" x2="${number(cx)}" y2="${number(cy - halfArrow)}" stroke="#666" stroke-width="28" marker-end="url(#arrow)"/>`
    return `    <g data-entity="${escapeXml(field.id)}" data-kind="span-field">
      <rect x="${number(box.x)}" y="${number(box.y)}" width="${number(box.width)}" height="${number(box.height)}" fill="#fafafa" stroke="#c8c8c8" stroke-width="20"/>
      ${arrow}
      <text x="${number(cx)}" y="${number(cy + 260)}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="220" fill="#333">${escapeXml(field.id)} · ${number(field.grossSpan)} mm gross</text>
    </g>`
  })

  const lineElements = result.derived.lineElements.map((element) => {
    const beam = element.kind === 'edge-beam'
    return `    <line data-entity="${escapeXml(element.id)}" data-kind="${element.kind}" x1="${number(element.x1)}" y1="${number(element.y1)}" x2="${number(element.x2)}" y2="${number(element.y2)}" stroke="${beam ? '#111' : '#333'}" stroke-width="${beam ? 110 : 60}"${element.provisional ? ' stroke-dasharray="160 90"' : ''}/>`
  })

  const nodes = result.derived.reactionNodes.map(
    (node) =>
      `    <circle data-entity="${escapeXml(node.id)}" data-kind="reaction-node" cx="${number(node.x)}" cy="${number(node.y)}" r="110" fill="#111"/>`
  )

  const interruptionNotes = result.derived.interruptions.map((interruption, index) => {
    const y = plan.derived.shell.depth + 800 + index * 360
    const geometry = interruption.geometry.kind === 'qualitative'
      ? 'exact trimming geometry deliberately absent'
      : `approx. envelope ${number(interruption.geometry.width)} × ${number(interruption.geometry.depth)} mm; exact position deliberately absent`
    return `    <text data-entity="${escapeXml(interruption.id)}" x="0" y="${number(y)}" font-family="system-ui,sans-serif" font-size="220" fill="#333">${escapeXml(interruption.id)} — ${escapeXml(geometry)}; ${escapeXml(interruption.framingSystemId)}</text>`
  })

  const noteY = plan.derived.shell.depth + 800 + result.derived.interruptions.length * 360 + 220

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${number(width)} ${number(height)}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">Deterministic RH-C2 structural-topology projection. It represents support and gravity-path relationships only; no member capacity or structural adequacy is claimed.</desc>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#666"/></marker>
  </defs>
  <g data-layer="span-fields">
${fields.join('\n')}
  </g>
  <g data-layer="structural-lines">
${lineElements.join('\n')}
  </g>
  <g data-layer="reaction-nodes">
${nodes.join('\n')}
  </g>
  <g data-layer="qualitative-interruptions">
${interruptionNotes.join('\n')}
    <text x="0" y="${number(noteY)}" font-family="system-ui,sans-serif" font-size="210" fill="#555">Structural deck is the declared diaphragm. Changeable floor finishes are non-structural.</text>
    <text x="0" y="${number(noteY + 320)}" font-family="system-ui,sans-serif" font-size="210" fill="#555">Topology PASS does not establish strength, deflection, vibration, fire, robustness, bearing, connection or foundation adequacy.</text>
  </g>
</svg>
`
}
