import type { PlanSliceCompileResult } from './model.js'

const escapeXml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const number = (value: number): string =>
  Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)))

export const renderPlanSliceSvg = (
  result: PlanSliceCompileResult,
  levelId: string,
  title: string
): string => {
  if (result.status === 'FAIL') {
    throw new Error(`Refusing to render failed plan slice ${result.fixtureId}.`)
  }
  if (!result.derived.levels.some((level) => level.id === levelId)) {
    throw new Error(`Unknown level ${levelId}.`)
  }

  const derived = result.derived
  const margin = 500
  const width = derived.shell.width + 2 * margin
  const height = derived.shell.depth + 2 * margin

  const spaces = derived.spaces
    .filter((space) => space.levelId === levelId)
    .flatMap((space) =>
      space.boxes.map(
        (box, index) =>
          `    <rect data-entity="${escapeXml(space.id)}" data-piece="${index + 1}" x="${number(box.x)}" y="${number(box.y)}" width="${number(box.width)}" height="${number(box.height)}" fill="none" stroke="#bbb" stroke-width="18"/>`
      )
    )

  const voids = derived.voids
    .filter((voidRegion) => voidRegion.levelId === levelId)
    .flatMap((voidRegion) =>
      voidRegion.boxes.map(
        (box, index) =>
          `    <rect data-entity="${escapeXml(voidRegion.id)}" data-piece="${index + 1}" x="${number(box.x)}" y="${number(box.y)}" width="${number(box.width)}" height="${number(box.height)}" fill="#f4f4f4" stroke="#777" stroke-width="18" stroke-dasharray="90 60"/>`
      )
    )

  const boundaries = derived.boundaries
    .filter((boundary) => boundary.levelId === levelId)
    .map(
      (boundary) =>
        `    <line data-entity="${escapeXml(boundary.id)}" x1="${number(boundary.x1)}" y1="${number(boundary.y1)}" x2="${number(boundary.x2)}" y2="${number(boundary.y2)}" stroke="#222" stroke-width="28"${boundary.provisional ? ' stroke-dasharray="100 60"' : ''}/>`
    )

  const openings = derived.openings
    .filter((opening) => opening.levelId === levelId && opening.centre !== undefined)
    .map((opening) => {
      const host = derived.boundaries.find((boundary) => boundary.id === opening.hostBoundaryId)
      if (!host || opening.centre === undefined) {
        throw new Error(`Opening ${opening.id} lost its compiled host geometry.`)
      }
      const x = host.orientation === 'horizontal' ? opening.centre : host.x1
      const y = host.orientation === 'horizontal' ? host.y1 : opening.centre
      return `    <circle data-entity="${escapeXml(opening.id)}" data-host="${escapeXml(opening.hostBoundaryId)}" cx="${number(x)}" cy="${number(y)}" r="90" fill="white" stroke="#111" stroke-width="24"/>`
    })

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${number(width)} ${number(height)}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">Deterministic semantic plan projection for ${escapeXml(result.fixtureId)} at ${escapeXml(levelId)}.</desc>
  <g data-layer="spaces">
${spaces.join('\n')}
  </g>
  <g data-layer="voids">
${voids.join('\n')}
  </g>
  <g data-layer="boundaries">
${boundaries.join('\n')}
  </g>
  <g data-layer="openings">
${openings.join('\n')}
  </g>
</svg>
`
}
