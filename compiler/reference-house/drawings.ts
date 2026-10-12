import type { Box2D } from '../p0/model.js'
import type {
  DerivedBoundary,
  DerivedOpening,
  LevelId,
  ReferenceHouseCompileResult
} from './model.js'
import { createPlanProjection, createSectionProjection } from './projection.js'

const escapeXml = (value: string): string =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

const fmt = (value: number): string => {
  const rounded = Math.round(value * 1000) / 1000
  return Number.isInteger(rounded) ? String(rounded) : String(rounded)
}

const attrs = (values: Record<string, string | number | boolean | undefined>): string =>
  Object.entries(values)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}="${escapeXml(String(value))}"`)
    .join(' ')

const rect = (box: { x: number; y: number; width: number; height: number }, extra = ''): string =>
  `<rect x="${fmt(box.x)}" y="${fmt(box.y)}" width="${fmt(box.width)}" height="${fmt(box.height)}"${extra ? ` ${extra}` : ''}/>`

const line = (x1: number, y1: number, x2: number, y2: number, extra = ''): string =>
  `<line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}"${extra ? ` ${extra}` : ''}/>`

const text = (x: number, y: number, value: string, extra = ''): string =>
  `<text x="${fmt(x)}" y="${fmt(y)}"${extra ? ` ${extra}` : ''}>${escapeXml(value)}</text>`

const PLAN_STYLE = `
  .bg{fill:#fbfaf7}.shell-fill{fill:#fff}.space-room{fill:#f2f1ed}.space-circulation{fill:#e9e9e5}.court{fill:#fff}
  .boundary-outer{stroke:#171717;stroke-width:70;fill:none}.boundary-courtyard{stroke:#444;stroke-width:45;fill:none;stroke-dasharray:140 90}.boundary-internal{stroke:#666;stroke-width:32;fill:none}.boundary-provisional{stroke-dasharray:120 80}
  .opening-cut{stroke:#fbfaf7;stroke-width:145}.opening-approx{stroke:#222;stroke-width:40;stroke-dasharray:95 55}.opening-range-max{stroke:#888;stroke-width:34;stroke-dasharray:80 55}.opening-range-min{stroke:#222;stroke-width:34}.opening-unknown{fill:#fbfaf7;stroke:#222;stroke-width:30}
  .axis{stroke:#9a9a9a;stroke-width:22;stroke-dasharray:90 75}.dim{stroke:#888;stroke-width:20}.head{font:600 430px system-ui,sans-serif;fill:#171717}.sub{font:210px system-ui,sans-serif;fill:#444}.label{font:600 220px system-ui,sans-serif;fill:#222}.small{font:180px system-ui,sans-serif;fill:#444}.mono{font:180px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#333}
`

const SECTION_STYLE = `
  .bg{fill:#fbfaf7}.occupied{fill:#f0eee8}.court{fill:#fff;stroke:#555;stroke-width:35;stroke-dasharray:130 90}.edge{stroke:#222;stroke-width:55;fill:none}.datum{stroke:#999;stroke-width:22;stroke-dasharray:95 70}.roof{stroke:#222;stroke-width:60;fill:none}.landing{stroke:#777;stroke-width:28;stroke-dasharray:90 70}.dim{stroke:#888;stroke-width:20}.head{font:600 430px system-ui,sans-serif;fill:#171717}.sub{font:210px system-ui,sans-serif;fill:#444}.label{font:600 220px system-ui,sans-serif;fill:#222}.small{font:180px system-ui,sans-serif;fill:#444}.mono{font:180px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#333}
`

const widthExtent = (opening: DerivedOpening): { min?: number; max?: number; kind: DerivedOpening['width']['kind'] } => {
  if (opening.width.kind === 'approximate') return { min: opening.width.value, max: opening.width.value, kind: 'approximate' }
  if (opening.width.kind === 'range') return { min: opening.width.min, max: opening.width.max, kind: 'range' }
  return { kind: 'unknown' }
}

const openingPoint = (host: DerivedBoundary, centre: number): { x: number; y: number } =>
  host.orientation === 'horizontal' ? { x: centre, y: host.y1 } : { x: host.x1, y: centre }

const openingSpan = (
  host: DerivedBoundary,
  centre: number,
  width: number
): [{ x: number; y: number }, { x: number; y: number }] =>
  host.orientation === 'horizontal'
    ? [
        { x: centre - width / 2, y: host.y1 },
        { x: centre + width / 2, y: host.y1 }
      ]
    : [
        { x: host.x1, y: centre - width / 2 },
        { x: host.x1, y: centre + width / 2 }
      ]

const renderPlanOpening = (
  opening: DerivedOpening,
  host: DerivedBoundary,
  project: ReturnType<typeof createPlanProjection>
): string => {
  if (opening.centre === undefined) return ''
  const width = widthExtent(opening)
  const baseAttrs = attrs({
    'data-entity': opening.id,
    'data-host': opening.hostBoundaryId,
    'data-spaces': opening.spaceIds.join(' '),
    'data-world-centre': fmt(opening.centre),
    'data-width-authority': width.kind,
    'data-width-min': width.min === undefined ? undefined : fmt(width.min),
    'data-width-max': width.max === undefined ? undefined : fmt(width.max),
    'data-provisional': opening.provisional
  })

  if (width.kind === 'unknown') {
    const world = openingPoint(host, opening.centre)
    const p = project.point(world.x, world.y)
    return `<g ${baseAttrs}><circle cx="${fmt(p.x)}" cy="${fmt(p.y)}" r="95" class="opening-unknown"/></g>`
  }

  const maxSpan = openingSpan(host, opening.centre, width.max ?? 0)
  const a = project.point(maxSpan[0].x, maxSpan[0].y)
  const b = project.point(maxSpan[1].x, maxSpan[1].y)
  const parts = [line(a.x, a.y, b.x, b.y, 'class="opening-cut"')]

  if (width.kind === 'approximate') {
    parts.push(line(a.x, a.y, b.x, b.y, 'class="opening-approx"'))
  } else {
    parts.push(line(a.x, a.y, b.x, b.y, 'class="opening-range-max"'))
    const minSpan = openingSpan(host, opening.centre, width.min ?? 0)
    const c = project.point(minSpan[0].x, minSpan[0].y)
    const d = project.point(minSpan[1].x, minSpan[1].y)
    parts.push(line(c.x, c.y, d.x, d.y, 'class="opening-range-min"'))
  }

  return `<g ${baseAttrs}>${parts.join('')}</g>`
}

const planTitle = (levelId: LevelId): string =>
  levelId === 'GROUND' ? 'RH-C1 — generated ground-floor plan' : 'RH-C1 — generated first-floor plan'

export const renderPlanSvg = (result: ReferenceHouseCompileResult, levelId: LevelId): string => {
  if (result.status === 'FAIL') throw new Error('Cannot render RH-C1 drawings from a failed compile.')

  const d = result.derived
  const project = createPlanProjection(d.shell.depth)
  const shellBox: Box2D = { kind: 'box2d', x: 0, y: 0, width: d.shell.width, height: d.shell.depth }
  const courtBox: Box2D = {
    kind: 'box2d',
    x: d.court.x0,
    y: d.court.y0,
    width: d.court.width,
    height: d.court.depth
  }
  const shellProjected = project.rect(shellBox)
  const courtProjected = project.rect(courtBox)
  const spaces = d.spaces.filter((space) => space.levelId === levelId)
  const boundaries = d.boundaries.filter((boundary) => boundary.levelId === levelId)
  const boundaryById = new Map(boundaries.map((boundary) => [boundary.id, boundary]))
  const openings = d.openings.filter((opening) => opening.levelId === levelId)
  const review = result.status === 'REVIEW' ? ` · REVIEW: ${result.diagnostics.map((item) => item.code).join(', ')}` : ''

  const viewX = -1200
  const viewY = -1700
  const viewWidth = d.shell.width + 3600
  const viewHeight = d.shell.depth + 3900

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="1180" height="900" viewBox="${fmt(viewX)} ${fmt(viewY)} ${fmt(viewWidth)} ${fmt(viewHeight)}" role="img" aria-labelledby="title desc" data-fixture="${result.fixtureId}" data-compile-status="${result.status}">`,
    `<title id="title">${escapeXml(planTitle(levelId))}</title>`,
    `<desc id="desc">Deterministic RH-C1 semantic projection. RH-C0 baseline controls. Stroke widths are drawing conventions, not wall construction thicknesses.</desc>`,
    `<style>${PLAN_STYLE}</style>`,
    rect({ x: viewX, y: viewY, width: viewWidth, height: viewHeight }, 'class="bg"'),
    text(0, -1120, planTitle(levelId), 'class="head"'),
    text(0, -730, `GENERATED · semantic reservations · wall faces not represented${review}`, 'class="sub"'),
    `<g data-entity="${escapeXml(d.shell.id)}" data-kind="shell">${rect(shellProjected, 'class="shell-fill"')}</g>`
  ]

  for (const space of spaces) {
    const fillClass = space.kind === 'circulation' ? 'space-circulation' : 'space-room'
    const boxes = space.boxes.map((box) => rect(project.rect(box), `class="${fillClass}"`)).join('')
    const centre = project.point(space.bounds.x + space.bounds.width / 2, space.bounds.y + space.bounds.height / 2)
    parts.push(
      `<g ${attrs({ 'data-entity': space.id, 'data-kind': space.kind, 'data-provisional': space.provisional })}>${boxes}${text(centre.x, centre.y - 60, space.id, 'class="label" text-anchor="middle"')}${text(centre.x, centre.y + 190, space.label, 'class="small" text-anchor="middle"')}</g>`
    )
  }

  parts.push(
    `<g ${attrs({ 'data-entity': d.court.id, 'data-kind': 'courtyard' })}>${rect(courtProjected, 'class="court"')}${text(courtProjected.x + courtProjected.width / 2, courtProjected.y + courtProjected.height / 2 - 40, d.court.id, 'class="label" text-anchor="middle"')}${text(courtProjected.x + courtProjected.width / 2, courtProjected.y + courtProjected.height / 2 + 210, `${fmt(d.court.width)} × ${fmt(d.court.depth)} mm · open to sky`, 'class="mono" text-anchor="middle"')}</g>`
  )

  for (const boundary of boundaries) {
    const a = project.point(boundary.x1, boundary.y1)
    const b = project.point(boundary.x2, boundary.y2)
    const className =
      boundary.kind === 'outer'
        ? 'boundary-outer'
        : boundary.kind === 'courtyard'
          ? 'boundary-courtyard'
          : `boundary-internal${boundary.provisional ? ' boundary-provisional' : ''}`
    parts.push(
      line(
        a.x,
        a.y,
        b.x,
        b.y,
        `${attrs({ class: className, 'data-entity': boundary.id, 'data-kind': boundary.kind, 'data-world-length': fmt(boundary.length), 'data-provisional': boundary.provisional })}`
      )
    )
  }

  for (const opening of openings) {
    const host = boundaryById.get(opening.hostBoundaryId)
    if (!host) continue
    parts.push(renderPlanOpening(opening, host, project))
  }

  for (let index = 0; index < d.frontAxes.length; index += 1) {
    const axis = d.frontAxes[index]
    const a = project.point(axis, 0)
    const b = project.point(axis, -520)
    parts.push(
      line(a.x, a.y, b.x, b.y, `${attrs({ class: 'axis', 'data-axis': `FRONT-${index + 1}`, 'data-world-x': fmt(axis) })}`),
      text(b.x, b.y + 250, `B${index + 1}`, 'class="small" text-anchor="middle"')
    )
  }

  const widthY = project.point(0, -1050).y
  parts.push(
    line(0, widthY, d.shell.width, widthY, 'class="dim"'),
    text(d.shell.width / 2, widthY + 300, `${fmt(d.shell.width)} mm`, 'class="mono" text-anchor="middle"'),
    line(d.shell.width + 700, 0, d.shell.width + 700, d.shell.depth, 'class="dim"'),
    text(d.shell.width + 1050, d.shell.depth / 2, `${fmt(d.shell.depth)} mm`, 'class="mono" text-anchor="middle" transform="rotate(90 '+fmt(d.shell.width + 1050)+' '+fmt(d.shell.depth / 2)+')"'),
    text(0, d.shell.depth + 1550, 'Provisional boundaries are dashed. Opening ranges show maximum extent with minimum extent nested inside; unknown width is a point marker.', 'class="small"')
  )

  return `${parts.join('\n')}\n</svg>\n`
}

export const renderPrincipalSectionSvg = (result: ReferenceHouseCompileResult): string => {
  if (result.status === 'FAIL') throw new Error('Cannot render RH-C1 drawings from a failed compile.')

  const d = result.derived
  const highest = Math.max(d.roofSection.outerEdgeControl, d.roofSection.courtSideEdge, d.levels.upperCeiling)
  const zTop = highest + 1000
  const project = createSectionProjection(zTop)
  const south0 = 0
  const south1 = d.court.y0
  const north0 = d.court.y1
  const north1 = d.shell.depth
  const viewX = -1200
  const viewY = -650
  const viewWidth = d.shell.depth + 5200
  const viewHeight = zTop + 2150
  const review = result.status === 'REVIEW' ? ` · REVIEW: ${result.diagnostics.map((item) => item.code).join(', ')}` : ''

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="1180" height="900" viewBox="${fmt(viewX)} ${fmt(viewY)} ${fmt(viewWidth)} ${fmt(viewHeight)}" role="img" aria-labelledby="title desc" data-fixture="${result.fixtureId}" data-compile-status="${result.status}">`,
    `<title id="title">RH-C1 — generated principal section</title>`,
    `<desc id="desc">Deterministic north-south coordination section through the courtyard centreline. Occupied volumes and datums are semantic projections; no floor, roof or stair construction is invented.</desc>`,
    `<style>${SECTION_STYLE}</style>`,
    rect({ x: viewX, y: viewY, width: viewWidth, height: viewHeight }, 'class="bg"'),
    text(0, -120, 'RH-C1 — generated principal section', 'class="head"'),
    text(0, 260, `N–S through courtyard centreline X=${fmt(d.shell.centreX)} mm · GENERATED${review}`, 'class="sub"')
  ]

  const occupiedVolumes = [
    { id: 'SECTION-GROUND-SOUTH', y0: south0, y1: south1, z0: d.levels.groundFfl, z1: d.levels.groundCeiling },
    { id: 'SECTION-FIRST-SOUTH', y0: south0, y1: south1, z0: d.levels.firstFfl, z1: d.levels.upperCeiling },
    { id: 'SECTION-GROUND-NORTH', y0: north0, y1: north1, z0: d.levels.groundFfl, z1: d.levels.groundCeiling },
    { id: 'SECTION-FIRST-NORTH', y0: north0, y1: north1, z0: d.levels.firstFfl, z1: d.levels.upperCeiling }
  ]
  for (const volume of occupiedVolumes) {
    parts.push(rect(project.rect(volume.y0, volume.y1, volume.z0, volume.z1), `${attrs({ class: 'occupied', 'data-projection': volume.id })}`))
  }

  parts.push(
    rect(project.rect(d.court.y0, d.court.y1, 0, Math.max(d.roofSection.courtSideEdge, d.roofSection.outerEdgeControl)), `${attrs({ class: 'court', 'data-entity': d.court.id })}`)
  )

  const levelDatums = [
    ['GF FFL', d.levels.groundFfl],
    ['ground clear ceiling', d.levels.groundCeiling],
    ['first FFL', d.levels.firstFfl],
    ['upper clear ceiling', d.levels.upperCeiling],
    ['outer cornice/eaves control', d.levels.corniceControl]
  ] as const
  for (const [label, z] of levelDatums) {
    const y = project.point(0, z).y
    const className = label.includes('FFL') ? 'edge' : 'datum'
    for (const [segmentStart, segmentEnd] of [[south0, south1], [north0, north1]] as const) {
      const a = project.point(segmentStart, z)
      const b = project.point(segmentEnd, z)
      parts.push(
        line(a.x, a.y, b.x, b.y, `${attrs({ class: className, 'data-datum': label, 'data-z': fmt(z) })}`)
      )
    }
    parts.push(text(d.shell.depth + 650, y + 65, `${label} ${z === 0 ? '±0' : `+${fmt(z)}`}`, 'class="mono"'))
  }

  const southOuter = project.point(0, d.roofSection.outerEdgeControl)
  const southCourt = project.point(d.court.y0, d.roofSection.courtSideEdge)
  const northCourt = project.point(d.court.y1, d.roofSection.courtSideEdge)
  const northOuter = project.point(d.shell.depth, d.roofSection.outerEdgeControl)
  parts.push(
    line(southOuter.x, southOuter.y, southCourt.x, southCourt.y, `${attrs({ class: 'roof', 'data-projection': 'ROOF-SOUTH', 'data-direction': d.roofSection.direction })}`),
    line(northCourt.x, northCourt.y, northOuter.x, northOuter.y, `${attrs({ class: 'roof', 'data-projection': 'ROOF-NORTH', 'data-direction': d.roofSection.direction })}`),
    text((south0 + south1) / 2, southCourt.y - 210, `fall ${d.roofSection.direction} · 1:${fmt(Math.round(d.ring.south / d.roofSection.fallAcrossFrontRearRing))}`, 'class="small" text-anchor="middle"'),
    text((north0 + north1) / 2, northCourt.y - 210, `fall ${d.roofSection.direction} · 1:${fmt(Math.round(d.ring.north / d.roofSection.fallAcrossFrontRearRing))}`, 'class="small" text-anchor="middle"')
  )

  for (let index = 0; index < d.stair.landingDatums.length; index += 1) {
    const z = d.stair.landingDatums[index]
    const a = project.point(280, z)
    const b = project.point(d.court.y0 - 280, z)
    parts.push(
      line(a.x, a.y, b.x, b.y, `${attrs({ class: 'landing', 'data-derived': `STAIR-LANDING-${index + 1}`, 'data-z': fmt(z) })}`),
      text((a.x + b.x) / 2, a.y - 90, `derived landing +${fmt(z)}`, 'class="small" text-anchor="middle"')
    )
  }

  const groundY = project.point(0, 0).y
  const dimY = groundY + 650
  parts.push(
    line(0, dimY, d.shell.depth, dimY, 'class="dim"'),
    text(d.shell.depth / 2, dimY + 280, `${fmt(d.shell.depth)} mm overall depth`, 'class="mono" text-anchor="middle"'),
    line(d.court.y0, dimY - 280, d.court.y1, dimY - 280, 'class="dim"'),
    text((d.court.y0 + d.court.y1) / 2, dimY - 390, `${fmt(d.court.depth)} mm court`, 'class="mono" text-anchor="middle"'),
    text((south0 + south1) / 2, project.point(0, 4700).y, 'UPPER SOUTH / STAIR FIELD', 'class="label" text-anchor="middle"'),
    text((d.court.y0 + d.court.y1) / 2, project.point(0, 4400).y, 'OPEN COURTYARD', 'class="label" text-anchor="middle"'),
    text((north0 + north1) / 2, project.point(0, 4700).y, 'UPPER NORTH / DRY + LANDING EDGE', 'class="label" text-anchor="middle"'),
    text((south0 + south1) / 2, project.point(0, 1500).y, 'GROUND SOUTH / HALL', 'class="label" text-anchor="middle"'),
    text((north0 + north1) / 2, project.point(0, 1500).y, 'GROUND NORTH / GARDEN DINING', 'class="label" text-anchor="middle"'),
    text(0, groundY + 1450, `Stair: ${d.stair.riserCount} rises · rise groups ${d.stair.flightRiseGroups.join(' / ')} · rise ${fmt(d.stair.rise)} mm · going ${fmt(d.stair.going)} mm. Datum guides only; no strings/guards/treads are implied.`, 'class="small"')
  )

  return `${parts.join('\n')}\n</svg>\n`
}

export interface ReferenceHouseDrawings {
  groundFloor: string
  firstFloor: string
  principalSection: string
}

export const renderReferenceHouseDrawings = (result: ReferenceHouseCompileResult): ReferenceHouseDrawings => ({
  groundFloor: renderPlanSvg(result, 'GROUND'),
  firstFloor: renderPlanSvg(result, 'FIRST'),
  principalSection: renderPrincipalSectionSvg(result)
})
