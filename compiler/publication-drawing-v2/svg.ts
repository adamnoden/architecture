import type {
  DrawingFillRole,
  DrawingLine,
  DrawingPath,
  DrawingPrimitiveV2,
  DrawingRect,
  DrawingSceneV2,
  DrawingText
} from './model.js'
import { PUBLICATION_DRAWING_TOKENS, type PublicationDrawingTokens } from '../publication-drawing/tokens.js'

const escapeXml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

export const formatDrawingNumberV2 = (value: number): string => {
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

const primitiveAttributes = (primitive: DrawingPrimitiveV2): string => {
  const metadata = metadataAttributes(primitive.metadata)
  return [`data-entity="${escapeXml(primitive.id)}"`, metadata].filter(Boolean).join(' ')
}

const renderLine = (node: DrawingLine): string => {
  const className = classes(`line-${node.role}`, node.dash && node.dash !== 'none' && `dash-${node.dash}`)
  return `<line x1="${formatDrawingNumberV2(node.a.x)}" y1="${formatDrawingNumberV2(node.a.y)}" x2="${formatDrawingNumberV2(node.b.x)}" y2="${formatDrawingNumberV2(node.b.y)}" class="${className}" ${primitiveAttributes(node)}/>`
}

const renderRect = (node: DrawingRect): string => {
  const className = classes(
    node.stroke && `line-${node.stroke}`,
    node.dash && node.dash !== 'none' && `dash-${node.dash}`,
    fillClass(node.fill)
  )
  const classAttribute = className ? ` class="${className}"` : ''
  return `<rect x="${formatDrawingNumberV2(node.x)}" y="${formatDrawingNumberV2(node.y)}" width="${formatDrawingNumberV2(node.width)}" height="${formatDrawingNumberV2(node.height)}"${classAttribute} ${primitiveAttributes(node)}/>`
}

const renderPath = (node: DrawingPath): string => {
  if (node.rings.length === 0) throw new Error(`Drawing path ${node.id} requires at least one ring.`)
  const d = node.rings.map((ring, ringIndex) => {
    if (ring.length < 3) throw new Error(`Drawing path ${node.id} ring ${ringIndex + 1} requires at least three points.`)
    const [first, ...rest] = ring
    const points = [`M ${formatDrawingNumberV2(first.x)} ${formatDrawingNumberV2(first.y)}`]
    for (const point of rest) points.push(`L ${formatDrawingNumberV2(point.x)} ${formatDrawingNumberV2(point.y)}`)
    points.push('Z')
    return points.join(' ')
  }).join(' ')
  const hasFill = Boolean(node.fill && node.fill !== 'none')
  const className = classes(
    node.stroke && `line-${node.stroke}`,
    node.dash && node.dash !== 'none' && `dash-${node.dash}`,
    fillClass(node.fill),
    node.stroke && hasFill && `path-stroke-${node.stroke}`
  )
  const classAttribute = className ? ` class="${className}"` : ''
  if (node.strokeOpacity !== undefined && (!Number.isFinite(node.strokeOpacity) || node.strokeOpacity < 0 || node.strokeOpacity > 1)) throw new Error('Path stroke opacity must be between 0 and 1.')
  const opacity = node.strokeOpacity === undefined ? '' : ` stroke-opacity="${formatDrawingNumberV2(node.strokeOpacity)}"`
  return `<path d="${d}" fill-rule="evenodd"${classAttribute}${opacity} ${primitiveAttributes(node)}/>`
}

const renderText = (node: DrawingText): string => {
  const anchor = node.anchor ?? 'start'
  const rotation = node.rotateDeg === undefined
    ? ''
    : ` transform="rotate(${formatDrawingNumberV2(node.rotateDeg)} ${formatDrawingNumberV2(node.x)} ${formatDrawingNumberV2(node.y)})"`
  return `<text x="${formatDrawingNumberV2(node.x)}" y="${formatDrawingNumberV2(node.y)}" class="text-${node.role}" text-anchor="${anchor}"${rotation} ${primitiveAttributes(node)}>${escapeXml(node.value)}</text>`
}

const renderPrimitive = (primitive: DrawingPrimitiveV2): string => {
  switch (primitive.kind) {
    case 'line': return renderLine(primitive)
    case 'rect': return renderRect(primitive)
    case 'path': return renderPath(primitive)
    case 'text': return renderText(primitive)
  }
}

const style = (tokens: PublicationDrawingTokens, needsPathStrokeFillOverride: boolean): string => {
  const lines = Object.entries(tokens.lineMm)
    .map(([role, width]) => `.line-${role}{stroke:${tokens.ink.primary};stroke-width:${formatDrawingNumberV2(width)};fill:none;stroke-linecap:butt;stroke-linejoin:miter}`)
    .join('')
  const text = (Object.keys(tokens.textMm) as Array<keyof typeof tokens.textMm>)
    .map((role) => `.text-${role}{font-family:${tokens.fontFamily};font-size:${formatDrawingNumberV2(tokens.textMm[role])}px;font-weight:${tokens.textWeight[role]};fill:${tokens.ink.primary}}`)
    .join('')
  const dash = Object.entries(tokens.dashMm)
    .map(([role, values]) => `.dash-${role}{stroke-dasharray:${values.map(formatDrawingNumberV2).join(' ')}}`)
    .join('')
  const legacyFillClasses = `.fill-paper{fill:${tokens.ink.paper};stroke:none}.fill-ink{fill:${tokens.ink.primary};stroke:none}.fill-context{fill:${tokens.ink.context};stroke:none}.fill-faint{fill:${tokens.ink.faint};stroke:none}`
  // Frozen v1 fill classes deliberately force stroke:none. V2 preserves those
  // bytes for legacy primitives and appends a path-only override only when a
  // new DrawingPath explicitly asks for both fill and outline.
  const pathStrokeOverrides = needsPathStrokeFillOverride
    ? Object.entries(tokens.lineMm)
        .map(([role, width]) => `.path-stroke-${role}{stroke:${tokens.ink.primary};stroke-width:${formatDrawingNumberV2(width)};stroke-linecap:butt;stroke-linejoin:miter}`)
        .join('')
    : ''
  return `${lines}${text}${dash}${legacyFillClasses}${pathStrokeOverrides}`
}

export const renderDrawingSceneV2SvgWithTokens = (
  scene: DrawingSceneV2,
  tokens: PublicationDrawingTokens
): string => {
  if (scene.widthMm <= 0 || scene.heightMm <= 0) throw new Error('Drawing scene requires positive paper dimensions.')

  const scaleAttribute = scene.scaleDenominator === 'NTS'
    ? 'data-scale="NTS"'
    : (() => {
        if (!Number.isFinite(scene.scaleDenominator) || scene.scaleDenominator <= 0) {
          throw new Error('Drawing scene requires a positive scale denominator or NTS.')
        }
        return `data-scale-denominator="${formatDrawingNumberV2(scene.scaleDenominator)}"`
      })()

  const needsPathStrokeFillOverride = scene.primitives.some((primitive) =>
    primitive.kind === 'path' && Boolean(primitive.stroke) && Boolean(primitive.fill && primitive.fill !== 'none')
  )
  const header = `<svg xmlns="http://www.w3.org/2000/svg" width="${formatDrawingNumberV2(scene.widthMm)}mm" height="${formatDrawingNumberV2(scene.heightMm)}mm" viewBox="0 0 ${formatDrawingNumberV2(scene.widthMm)} ${formatDrawingNumberV2(scene.heightMm)}" role="img" aria-labelledby="title desc" data-view-id="${escapeXml(scene.viewId)}" data-source-id="${escapeXml(scene.sourceId)}" ${scaleAttribute}>`
  const primitives = scene.primitives.map(renderPrimitive)

  return [
    header,
    `<title id="title">${escapeXml(scene.title)}</title>`,
    `<desc id="desc">${escapeXml(scene.description)}</desc>`,
    `<style>${style(tokens, needsPathStrokeFillOverride)}</style>`,
    ...primitives,
    '</svg>',
    ''
  ].join('\n')
}

export const renderDrawingSceneV2Svg = (scene: DrawingSceneV2): string =>
  renderDrawingSceneV2SvgWithTokens(scene, PUBLICATION_DRAWING_TOKENS)
