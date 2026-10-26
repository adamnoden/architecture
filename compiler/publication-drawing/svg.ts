import type {
  DrawingFillRole,
  DrawingLine,
  DrawingPath,
  DrawingPrimitive,
  DrawingRect,
  DrawingScene,
  DrawingText
} from './model.js'
import { PUBLICATION_DRAWING_TOKENS, type PublicationDrawingTokens } from './tokens.js'

const escapeXml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

export const formatDrawingNumber = (value: number): string => {
  if (!Number.isFinite(value)) throw new Error(`Cannot serialize non-finite drawing value: ${value}`)
  const rounded = Math.round(value * 1000) / 1000
  return Object.is(rounded, -0) ? '0' : String(rounded)
}

const metadataAttributes = (metadata: Record<string, string | number | boolean | undefined> = {}): string =>
  Object.entries(metadata)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `data-${escapeXml(key)}="${escapeXml(String(value))}"`)
    .join(' ')

const classes = (...values: Array<string | false | undefined>): string => values.filter(Boolean).join(' ')

const fillClass = (fill: DrawingFillRole | undefined): string | undefined =>
  fill && fill !== 'none' ? `fill-${fill}` : undefined

const primitiveAttributes = (primitive: DrawingPrimitive): string => {
  const metadata = metadataAttributes(primitive.metadata)
  return [`data-entity="${escapeXml(primitive.id)}"`, metadata].filter(Boolean).join(' ')
}

const renderLine = (node: DrawingLine): string => {
  const className = classes(`line-${node.role}`, node.dash && node.dash !== 'none' && `dash-${node.dash}`)
  return `<line x1="${formatDrawingNumber(node.a.x)}" y1="${formatDrawingNumber(node.a.y)}" x2="${formatDrawingNumber(node.b.x)}" y2="${formatDrawingNumber(node.b.y)}" class="${className}" ${primitiveAttributes(node)}/>`
}

const renderRect = (node: DrawingRect): string => {
  const className = classes(
    node.stroke && `line-${node.stroke}`,
    node.dash && node.dash !== 'none' && `dash-${node.dash}`,
    fillClass(node.fill)
  )
  const classAttribute = className ? ` class="${className}"` : ''
  return `<rect x="${formatDrawingNumber(node.x)}" y="${formatDrawingNumber(node.y)}" width="${formatDrawingNumber(node.width)}" height="${formatDrawingNumber(node.height)}"${classAttribute} ${primitiveAttributes(node)}/>`
}

const renderPath = (node: DrawingPath): string => {
  if (node.rings.length === 0) throw new Error(`Drawing path ${node.id} requires at least one ring.`)
  const d = node.rings.map((ring, ringIndex) => {
    if (ring.length < 3) throw new Error(`Drawing path ${node.id} ring ${ringIndex + 1} requires at least three points.`)
    const [first, ...rest] = ring
    const points = [`M ${formatDrawingNumber(first.x)} ${formatDrawingNumber(first.y)}`]
    for (const point of rest) points.push(`L ${formatDrawingNumber(point.x)} ${formatDrawingNumber(point.y)}`)
    points.push('Z')
    return points.join(' ')
  }).join(' ')
  const className = classes(
    node.stroke && `line-${node.stroke}`,
    node.dash && node.dash !== 'none' && `dash-${node.dash}`,
    fillClass(node.fill)
  )
  const classAttribute = className ? ` class="${className}"` : ''
  return `<path d="${d}" fill-rule="evenodd"${classAttribute} ${primitiveAttributes(node)}/>`
}

const renderText = (node: DrawingText): string => {
  const anchor = node.anchor ?? 'start'
  const rotation = node.rotateDeg === undefined
    ? ''
    : ` transform="rotate(${formatDrawingNumber(node.rotateDeg)} ${formatDrawingNumber(node.x)} ${formatDrawingNumber(node.y)})"`
  return `<text x="${formatDrawingNumber(node.x)}" y="${formatDrawingNumber(node.y)}" class="text-${node.role}" text-anchor="${anchor}"${rotation} ${primitiveAttributes(node)}>${escapeXml(node.value)}</text>`
}

const renderPrimitive = (primitive: DrawingPrimitive): string => {
  switch (primitive.kind) {
    case 'line': return renderLine(primitive)
    case 'rect': return renderRect(primitive)
    case 'path': return renderPath(primitive)
    case 'text': return renderText(primitive)
  }
}

const style = (tokens: PublicationDrawingTokens): string => {
  const lines = Object.entries(tokens.lineMm)
    .map(([role, width]) => `.line-${role}{stroke:${tokens.ink.primary};stroke-width:${formatDrawingNumber(width)};fill:none;stroke-linecap:butt;stroke-linejoin:miter}`)
    .join('')
  // The SVG viewBox is expressed in paper millimetres: one user unit maps to one
  // physical mm at publication placement. CSS px preserves that user-space value;
  // CSS mm would be converted by Chromium at 96 px/in before the viewBox transform.
  const text = (Object.keys(tokens.textMm) as Array<keyof typeof tokens.textMm>)
    .map((role) => `.text-${role}{font-family:${tokens.fontFamily};font-size:${formatDrawingNumber(tokens.textMm[role])}px;font-weight:${tokens.textWeight[role]};fill:${tokens.ink.primary}}`)
    .join('')
  const dash = Object.entries(tokens.dashMm)
    .map(([role, values]) => `.dash-${role}{stroke-dasharray:${values.map(formatDrawingNumber).join(' ')}}`)
    .join('')
  return `${lines}${text}${dash}.fill-paper{fill:${tokens.ink.paper};stroke:none}.fill-ink{fill:${tokens.ink.primary};stroke:none}.fill-context{fill:${tokens.ink.context};stroke:none}.fill-faint{fill:${tokens.ink.faint};stroke:none}`
}

export const renderDrawingSceneSvgWithTokens = (
  scene: DrawingScene,
  tokens: PublicationDrawingTokens
): string => {
  if (scene.widthMm <= 0 || scene.heightMm <= 0) throw new Error('Drawing scene requires positive paper dimensions.')

  const scaleAttribute = scene.scaleDenominator === 'NTS'
    ? 'data-scale="NTS"'
    : (() => {
        if (!Number.isFinite(scene.scaleDenominator) || scene.scaleDenominator <= 0) {
          throw new Error('Drawing scene requires a positive scale denominator or NTS.')
        }
        return `data-scale-denominator="${formatDrawingNumber(scene.scaleDenominator)}"`
      })()

  const header = `<svg xmlns="http://www.w3.org/2000/svg" width="${formatDrawingNumber(scene.widthMm)}mm" height="${formatDrawingNumber(scene.heightMm)}mm" viewBox="0 0 ${formatDrawingNumber(scene.widthMm)} ${formatDrawingNumber(scene.heightMm)}" role="img" aria-labelledby="title desc" data-view-id="${escapeXml(scene.viewId)}" data-source-id="${escapeXml(scene.sourceId)}" ${scaleAttribute}>`
  const primitives = scene.primitives.map(renderPrimitive)

  return [
    header,
    `<title id="title">${escapeXml(scene.title)}</title>`,
    `<desc id="desc">${escapeXml(scene.description)}</desc>`,
    `<style>${style(tokens)}</style>`,
    ...primitives,
    '</svg>',
    ''
  ].join('\n')
}

export const renderDrawingSceneSvg = (scene: DrawingScene): string =>
  renderDrawingSceneSvgWithTokens(scene, PUBLICATION_DRAWING_TOKENS)
