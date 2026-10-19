import type {
  DrawingFillRole,
  DrawingLine,
  DrawingPrimitive,
  DrawingRect,
  DrawingScene,
  DrawingText
} from './model.js'
import { PUBLICATION_DRAWING_TOKENS } from './tokens.js'

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
    case 'text': return renderText(primitive)
  }
}

const style = (): string => {
  const t = PUBLICATION_DRAWING_TOKENS
  const lines = Object.entries(t.lineMm)
    .map(([role, width]) => `.line-${role}{stroke:${t.ink.primary};stroke-width:${formatDrawingNumber(width)};fill:none;stroke-linecap:butt;stroke-linejoin:miter}`)
    .join('')
  const text = (Object.keys(t.textMm) as Array<keyof typeof t.textMm>)
    .map((role) => `.text-${role}{font-family:${t.fontFamily};font-size:${formatDrawingNumber(t.textMm[role])}mm;font-weight:${t.textWeight[role]};fill:${t.ink.primary}}`)
    .join('')
  const dash = Object.entries(t.dashMm)
    .map(([role, values]) => `.dash-${role}{stroke-dasharray:${values.map(formatDrawingNumber).join(' ')}}`)
    .join('')
  return `${lines}${text}${dash}.fill-paper{fill:${t.ink.paper};stroke:none}.fill-ink{fill:${t.ink.primary};stroke:none}.fill-context{fill:${t.ink.context};stroke:none}.fill-faint{fill:${t.ink.faint};stroke:none}`
}

export const renderDrawingSceneSvg = (scene: DrawingScene): string => {
  if (scene.widthMm <= 0 || scene.heightMm <= 0) throw new Error('Drawing scene requires positive paper dimensions.')
  if (!Number.isFinite(scene.scaleDenominator) || scene.scaleDenominator <= 0) throw new Error('Drawing scene requires a positive scale denominator.')

  const header = `<svg xmlns="http://www.w3.org/2000/svg" width="${formatDrawingNumber(scene.widthMm)}mm" height="${formatDrawingNumber(scene.heightMm)}mm" viewBox="0 0 ${formatDrawingNumber(scene.widthMm)} ${formatDrawingNumber(scene.heightMm)}" role="img" aria-labelledby="title desc" data-view-id="${escapeXml(scene.viewId)}" data-source-id="${escapeXml(scene.sourceId)}" data-scale-denominator="${formatDrawingNumber(scene.scaleDenominator)}">`
  const primitives = scene.primitives.map(renderPrimitive)

  return [
    header,
    `<title id="title">${escapeXml(scene.title)}</title>`,
    `<desc id="desc">${escapeXml(scene.description)}</desc>`,
    `<style>${style()}</style>`,
    ...primitives,
    '</svg>',
    ''
  ].join('\n')
}
