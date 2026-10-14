export const escapeXml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

export const formatSvgNumber = (value: number): string => {
  const rounded = Number(value.toFixed(3))
  return Number.isInteger(rounded) ? String(rounded) : String(rounded)
}

export const svgAttrs = (
  values: Readonly<Record<string, string | number | boolean | undefined>>
): string => Object.entries(values)
  .filter(([, value]) => value !== undefined)
  .map(([key, value]) => `${key}="${escapeXml(String(value))}"`)
  .join(' ')

export const svgLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  extra = ''
): string => `<line x1="${formatSvgNumber(x1)}" y1="${formatSvgNumber(y1)}" x2="${formatSvgNumber(x2)}" y2="${formatSvgNumber(y2)}"${extra ? ` ${extra}` : ''}/>`

export const svgText = (
  x: number,
  y: number,
  value: string,
  extra = ''
): string => `<text x="${formatSvgNumber(x)}" y="${formatSvgNumber(y)}"${extra ? ` ${extra}` : ''}>${escapeXml(value)}</text>`

export const svgRect = (
  x: number,
  y: number,
  width: number,
  height: number,
  extra = ''
): string => `<rect x="${formatSvgNumber(x)}" y="${formatSvgNumber(y)}" width="${formatSvgNumber(width)}" height="${formatSvgNumber(height)}"${extra ? ` ${extra}` : ''}/>`
