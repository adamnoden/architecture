import {
  ANNOTATION_ZONE,
  INSPECTION_SECTION_ID,
  INSPECTION_STYLE,
  renderCompactLegend,
  renderNorthArrow,
  renderQualitativeHost,
  renderRequiredConnection,
  renderReviewBanner,
  renderSectionCut
} from '../../output/conventions.js'
import {
  createNorthUpPlanProjection,
  createSouthToNorthSectionProjection
} from '../../output/projection.js'
import {
  escapeXml,
  formatSvgNumber,
  svgAttrs,
  svgLine,
  svgRect,
  svgText
} from '../../output/svg.js'
import type {
  DerivedBoundary,
  DerivedOpening,
  DerivedSpace,
  LevelId
} from '../model.js'
import { REFERENCE_HOUSE_OUTPUTS } from './contract.js'
import type { ReferenceHouseOutputContext } from './context.js'

const LOCAL_STYLE = `
  .rh-outer{stroke-width:68}.rh-court-boundary{stroke-width:46}.rh-internal{stroke-width:32}
  .rh-opening-cut{stroke:#fbfaf7;stroke-width:150}
  .rh-opening-unknown{fill:#fbfaf7;stroke:#222;stroke-width:28}
  .rh-dim{stroke:#8a8a8a;stroke-width:20;fill:none}
  .rh-axis{stroke:#999;stroke-width:18;stroke-dasharray:70 60}
  .rh-section-edge{stroke:#222;stroke-width:52;fill:none}
  .rh-section-datum{stroke:#999;stroke-width:20;stroke-dasharray:85 65;fill:none}
  .rh-roof{stroke:#222;stroke-width:54;fill:none}
  .rh-landing{stroke:#777;stroke-width:26;stroke-dasharray:85 65;fill:none}
  .rh-court-edge{stroke:#555;stroke-width:32;stroke-dasharray:105 75;fill:none}
  .rh-zone{fill:#f0eee8}
`

const sentenceCase = (value: string): string =>
  value.length ? value[0].toUpperCase() + value.slice(1) : value

const diagnosticCodes = (context: ReferenceHouseOutputContext): string[] =>
  [...new Set([
    ...context.result.diagnostics.house.map((item) => item.code),
    ...context.result.diagnostics.plan.map((item) => item.code),
    ...context.result.diagnostics.structure.map((item) => item.code),
    ...context.result.diagnostics.services.map((item) => item.code),
    ...context.result.diagnostics.boundary.map((item) => item.code),
    ...context.result.diagnostics.privateStairGeometry.map((item) => item.code)
  ])].sort()

const boundaryClass = (boundary: DerivedBoundary): string => {
  const kind = boundary.kind === 'outer'
    ? 'rh-outer'
    : boundary.kind === 'courtyard'
      ? 'rh-court-boundary'
      : 'rh-internal'
  return `${boundary.provisional ? 'oh-provisional' : 'oh-controlled'} ${kind}`
}

const openingSpan = (
  boundary: DerivedBoundary,
  centre: number,
  width: number
): [{ x: number; y: number }, { x: number; y: number }] => boundary.orientation === 'horizontal'
  ? [
      { x: centre - width / 2, y: boundary.y1 },
      { x: centre + width / 2, y: boundary.y1 }
    ]
  : [
      { x: boundary.x1, y: centre - width / 2 },
      { x: boundary.x1, y: centre + width / 2 }
    ]

const openingPoint = (
  boundary: DerivedBoundary,
  centre: number
): { x: number; y: number } => boundary.orientation === 'horizontal'
  ? { x: centre, y: boundary.y1 }
  : { x: boundary.x1, y: centre }

const renderOpening = (
  opening: DerivedOpening,
  boundary: DerivedBoundary,
  project: ReturnType<typeof createNorthUpPlanProjection>
): string => {
  if (opening.centre === undefined) return ''
  const attrs = svgAttrs({
    'data-entity': opening.id,
    'data-kind': opening.role,
    'data-host': opening.hostBoundaryId,
    'data-width-authority': opening.width.kind,
    'data-provisional': opening.provisional
  })

  if (opening.width.kind === 'unknown') {
    const world = openingPoint(boundary, opening.centre)
    const p = project.point(world.x, world.y)
    return `<g ${attrs} data-geometry="centre-known-width-unresolved">
      <circle cx="${formatSvgNumber(p.x)}" cy="${formatSvgNumber(p.y)}" r="88" class="rh-opening-unknown"/>
      ${svgText(p.x + 145, p.y - 110, 'width unresolved', 'class="oh-note"')}
    </g>`
  }

  const max = opening.width.kind === 'approximate'
    ? opening.width.value ?? 0
    : opening.width.max ?? 0
  const span = openingSpan(boundary, opening.centre, max)
  const a = project.point(span[0].x, span[0].y)
  const b = project.point(span[1].x, span[1].y)
  const parts = [svgLine(a.x, a.y, b.x, b.y, 'class="rh-opening-cut"')]

  if (opening.width.kind === 'approximate') {
    parts.push(svgLine(a.x, a.y, b.x, b.y, 'class="oh-approximate"'))
  } else {
    parts.push(svgLine(a.x, a.y, b.x, b.y, 'class="oh-range-max"'))
    const minSpan = openingSpan(boundary, opening.centre, opening.width.min ?? 0)
    const c = project.point(minSpan[0].x, minSpan[0].y)
    const d = project.point(minSpan[1].x, minSpan[1].y)
    parts.push(svgLine(c.x, c.y, d.x, d.y, 'class="oh-range-min"'))
  }

  return `<g ${attrs}>${parts.join('')}</g>`
}

interface WorldSegment {
  readonly x1: number
  readonly y1: number
  readonly x2: number
  readonly y2: number
}

const EPSILON = 0.001
const close = (a: number, b: number): boolean => Math.abs(a - b) <= EPSILON

const sharedEdges = (a: DerivedSpace, b: DerivedSpace): WorldSegment[] => {
  const result: WorldSegment[] = []
  for (const aa of a.boxes) {
    for (const bb of b.boxes) {
      if (close(aa.x + aa.width, bb.x) || close(bb.x + bb.width, aa.x)) {
        const x = close(aa.x + aa.width, bb.x) ? bb.x : aa.x
        const y1 = Math.max(aa.y, bb.y)
        const y2 = Math.min(aa.y + aa.height, bb.y + bb.height)
        if (y2 - y1 > EPSILON) result.push({ x1: x, y1, x2: x, y2 })
      }
      if (close(aa.y + aa.height, bb.y) || close(bb.y + bb.height, aa.y)) {
        const y = close(aa.y + aa.height, bb.y) ? bb.y : aa.y
        const x1 = Math.max(aa.x, bb.x)
        const x2 = Math.min(aa.x + aa.width, bb.x + bb.width)
        if (x2 - x1 > EPSILON) result.push({ x1, y1: y, x2, y2: y })
      }
    }
  }
  return result
}

const renderSpace = (
  space: DerivedSpace,
  project: ReturnType<typeof createNorthUpPlanProjection>
): string => {
  const fillClass = space.kind === 'circulation' ? 'oh-circulation' : 'oh-room'
  const boxes = space.boxes.map((box) => {
    const p = project.rect(box)
    return svgRect(p.x, p.y, p.width, p.height, `class="${fillClass}"`)
  }).join('')
  const centre = project.point(
    space.bounds.x + space.bounds.width / 2,
    space.bounds.y + space.bounds.height / 2
  )
  return `<g ${svgAttrs({
    'data-entity': space.id,
    'data-kind': space.kind,
    'data-provisional': space.provisional
  })}>
    ${boxes}
    ${svgText(centre.x, centre.y - 50, sentenceCase(space.label), 'class="oh-label" text-anchor="middle"')}
    ${svgText(centre.x, centre.y + 185, space.id, 'class="oh-id" text-anchor="middle"')}
  </g>`
}

const renderPlanDimensions = (
  shellWidth: number,
  shellDepth: number,
  court: { x0: number; x1: number; y0: number; y1: number; width: number; depth: number },
  project: ReturnType<typeof createNorthUpPlanProjection>
): string => {
  const shellBottom = project.point(0, 0).y
  const widthY = shellBottom + 650
  const courtSouth = project.point(court.x0, court.y0)
  const courtNorth = project.point(court.x1, court.y1)
  return `<g data-layer="dimensions">
    ${svgLine(0, widthY, shellWidth, widthY, 'class="rh-dim"')}
    ${svgText(shellWidth / 2, widthY + 280, `${formatSvgNumber(shellWidth)} mm overall width`, 'class="oh-mono" text-anchor="middle"')}
    ${svgLine(shellWidth + 300, 0, shellWidth + 300, shellDepth, 'class="rh-dim"')}
    ${svgText(shellWidth + 560, shellDepth / 2, `${formatSvgNumber(shellDepth)} mm overall depth`, `class="oh-mono" text-anchor="middle" transform="rotate(90 ${formatSvgNumber(shellWidth + 560)} ${formatSvgNumber(shellDepth / 2)})"`)}
    ${svgText((courtSouth.x + courtNorth.x) / 2, (courtSouth.y + courtNorth.y) / 2 + 30, `${formatSvgNumber(court.width)} × ${formatSvgNumber(court.depth)} mm`, 'class="oh-mono" text-anchor="middle"')}
  </g>`
}

export const renderReferenceHousePlan = (
  context: ReferenceHouseOutputContext,
  levelId: LevelId
): string => {
  const d = context.result.house.derived
  const project = createNorthUpPlanProjection(d.shell.depth)
  const spaces = d.spaces.filter((space) => space.levelId === levelId)
  const boundaries = d.boundaries.filter((boundary) => boundary.levelId === levelId)
  const boundaryById = new Map(boundaries.map((boundary) => [boundary.id, boundary]))
  const spaceById = new Map(spaces.map((space) => [space.id, space]))
  const openings = d.openings.filter((opening) => opening.levelId === levelId)
  const qualitative = context.source.qualitativeOpeningRelationships.filter((item) => item.levelId === levelId)
  const adjacencies = context.source.requiredAdjacencies.filter((item) => item.levelId === levelId)
  const descriptor = levelId === 'GROUND'
    ? REFERENCE_HOUSE_OUTPUTS.groundFloorPlan
    : REFERENCE_HOUSE_OUTPUTS.firstFloorPlan
  const title = levelId === 'GROUND'
    ? 'Reference House — ground-floor plan'
    : 'Reference House — first-floor plan'

  const viewX = -1500
  const viewY = -1800
  const viewWidth = d.shell.width + 1500 + ANNOTATION_ZONE.rightWidth
  const viewHeight = d.shell.depth + 1800 + ANNOTATION_ZONE.bottomHeight
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1120" viewBox="${formatSvgNumber(viewX)} ${formatSvgNumber(viewY)} ${formatSvgNumber(viewWidth)} ${formatSvgNumber(viewHeight)}" role="img" aria-labelledby="title desc" data-output-id="${descriptor.id}" data-renderer-version="${descriptor.rendererVersion}" data-source-compile="${context.result.identity.compile.fingerprint}" data-compile-status="${context.result.status}">`,
    `<title id="title">${escapeXml(title)}</title>`,
    `<desc id="desc">North-up deterministic semantic inspection plan. Human labels lead; semantic IDs remain secondary. Wall faces and unresolved construction geometry are not invented.</desc>`,
    `<style>${INSPECTION_STYLE}${LOCAL_STYLE}</style>`,
    svgRect(viewX, viewY, viewWidth, viewHeight, 'class="oh-bg"'),
    svgText(0, -1180, title, 'class="oh-title"'),
    svgText(0, -790, 'GENERATED SEMANTIC INSPECTION · NORTH UP · wall faces not represented', 'class="oh-subtitle"'),
    ...spaces.map((space) => renderSpace(space, project))
  ]

  const court = project.rect({
    x: d.court.x0,
    y: d.court.y0,
    width: d.court.width,
    height: d.court.depth
  })
  parts.push(`<g data-entity="${escapeXml(d.court.id)}" data-kind="courtyard">
    ${svgRect(court.x, court.y, court.width, court.height, 'class="oh-court"')}
    ${svgText(court.x + court.width / 2, court.y + court.height / 2 - 70, 'Open courtyard', 'class="oh-label" text-anchor="middle"')}
    ${svgText(court.x + court.width / 2, court.y + court.height / 2 + 170, d.court.id, 'class="oh-id" text-anchor="middle"')}
  </g>`)

  parts.push('<g data-layer="boundaries">')
  for (const boundary of boundaries) {
    const a = project.point(boundary.x1, boundary.y1)
    const b = project.point(boundary.x2, boundary.y2)
    parts.push(svgLine(a.x, a.y, b.x, b.y, `${svgAttrs({
      class: boundaryClass(boundary),
      'data-entity': boundary.id,
      'data-kind': boundary.kind,
      'data-provisional': boundary.provisional
    })}`))
  }
  parts.push('</g>')

  parts.push('<g data-layer="numeric-openings">')
  for (const opening of openings) {
    const boundary = boundaryById.get(opening.hostBoundaryId)
    if (boundary) parts.push(renderOpening(opening, boundary, project))
  }
  parts.push('</g>')

  parts.push('<g data-layer="qualitative-opening-obligations">')
  for (const relationship of qualitative) {
    const boundary = boundaryById.get(relationship.hostBoundaryId)
    if (!boundary) continue
    const a = project.point(boundary.x1, boundary.y1)
    const b = project.point(boundary.x2, boundary.y2)
    parts.push(renderQualitativeHost(relationship.id, a.x, a.y, b.x, b.y, ''))
  }
  parts.push('</g>')

  parts.push('<g data-layer="required-connections">')
  for (const adjacency of adjacencies) {
    const a = spaceById.get(adjacency.a)
    const b = spaceById.get(adjacency.b)
    if (!a || !b) continue
    for (const edge of sharedEdges(a, b)) {
      const p1 = project.point(edge.x1, edge.y1)
      const p2 = project.point(edge.x2, edge.y2)
      parts.push(renderRequiredConnection(adjacency.id, p1.x, p1.y, p2.x, p2.y))
    }
  }
  parts.push('</g>')

  const shellSouth = project.point(0, 0).y
  for (let index = 0; index < d.frontAxes.length; index += 1) {
    const x = d.frontAxes[index]
    parts.push(
      svgLine(x, shellSouth, x, shellSouth + 430, `class="rh-axis" data-axis="B${index + 1}"`),
      svgText(x, shellSouth + 690, `B${index + 1}`, 'class="oh-note" text-anchor="middle"')
    )
  }

  parts.push(
    renderSectionCut(d.shell.centreX, project.point(0, 0).y, project.point(0, d.shell.depth).y),
    renderNorthArrow(d.shell.width + 1650, 250),
    renderCompactLegend(d.shell.width + 900, 3000),
    renderPlanDimensions(d.shell.width, d.shell.depth, d.court, project)
  )

  const rightX = d.shell.width + 900
  const unresolvedY = 4950
  parts.push(
    svgText(rightX, unresolvedY, 'Unresolved relationships', 'class="oh-label"'),
    svgText(rightX, unresolvedY + 300, `${qualitative.length} qualitative opening obligations`, 'class="oh-note"'),
    svgText(rightX, unresolvedY + 555, `${adjacencies.length} required space connections`, 'class="oh-note"'),
    svgText(rightX, unresolvedY + 810, 'Dotted host/edge = relation known; position not authored.', 'class="oh-note"'),
    svgText(rightX, unresolvedY + 1260, 'Planning values — not wall/stair construction', 'class="oh-label"'),
    svgText(rightX, unresolvedY + 1560, `Wall family ${context.source.wallPlanning.normalRange.value.min}–${context.source.wallPlanning.normalRange.value.max} mm; stress ${context.source.wallPlanning.stressThickness.value} mm`, 'class="oh-note"'),
    svgText(rightX, unresolvedY + 1815, `Stair ${d.stair.riserCount} rises · ${d.stair.flightRiseGroups.join('/')} · going ${d.stair.going} mm`, 'class="oh-note"'),
    svgText(rightX, unresolvedY + 2070, `clear-width target ≈${context.source.stair.clearWidthTarget.value} mm · reservation ${context.source.stair.reservation.value.min}–${context.source.stair.reservation.value.max} mm`, 'class="oh-note"')
  )

  const bottomY = d.shell.depth + 1450
  parts.push(
    svgText(0, bottomY, 'Boundary strokes are semantic lines, not wall faces. Exact internal door positions and stair construction remain deliberately unresolved.', 'class="oh-note"'),
    svgText(0, bottomY + 300, `Source compile ${context.result.identity.compile.fingerprint}`, 'class="oh-id"')
  )

  if (context.reviewStateVisible) {
    parts.push(renderReviewBanner(d.shell.width + 850, -1250, 3000, diagnosticCodes(context)))
  }

  parts.push('</svg>')
  return `${parts.join('\n')}\n`
}

export const renderReferenceHousePrincipalSection = (
  context: ReferenceHouseOutputContext
): string => {
  const d = context.result.house.derived
  const highest = Math.max(d.roofSection.outerEdgeControl, d.roofSection.courtSideEdge, d.levels.upperCeiling)
  const zTop = highest + 1000
  const project = createSouthToNorthSectionProjection(zTop)
  const south0 = 0
  const south1 = d.court.y0
  const north0 = d.court.y1
  const north1 = d.shell.depth
  const descriptor = REFERENCE_HOUSE_OUTPUTS.principalSection

  const viewX = -1050
  const viewY = -1750
  const viewWidth = d.shell.depth + 1050 + ANNOTATION_ZONE.rightWidth
  const viewHeight = zTop + 1750 + ANNOTATION_ZONE.bottomHeight
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1000" viewBox="${formatSvgNumber(viewX)} ${formatSvgNumber(viewY)} ${formatSvgNumber(viewWidth)} ${formatSvgNumber(viewHeight)}" role="img" aria-labelledby="title desc" data-output-id="${descriptor.id}" data-renderer-version="${descriptor.rendererVersion}" data-source-compile="${context.result.identity.compile.fingerprint}" data-compile-status="${context.result.status}" data-section="${INSPECTION_SECTION_ID}">`,
    '<title id="title">Reference House — principal section A–A</title>',
    '<desc id="desc">Deterministic south-to-north semantic inspection section through the courtyard centreline. Occupied volumes, datums, roof screening geometry and stair landing guides are represented without inventing construction build-ups.</desc>',
    `<style>${INSPECTION_STYLE}${LOCAL_STYLE}</style>`,
    svgRect(viewX, viewY, viewWidth, viewHeight, 'class="oh-bg"'),
    svgText(0, -1200, 'Reference House — principal section A–A', 'class="oh-title"'),
    svgText(0, -810, `A–A · SOUTH → NORTH · X=${formatSvgNumber(d.shell.centreX)} mm · GENERATED SEMANTIC INSPECTION`, 'class="oh-subtitle"')
  ]

  const occupied = [
    [south0, south1, d.levels.groundFfl, d.levels.groundCeiling],
    [south0, south1, d.levels.firstFfl, d.levels.upperCeiling],
    [north0, north1, d.levels.groundFfl, d.levels.groundCeiling],
    [north0, north1, d.levels.firstFfl, d.levels.upperCeiling]
  ] as const
  for (const [y0, y1, z0, z1] of occupied) {
    const box = project.rect(y0, y1, z0, z1)
    parts.push(svgRect(box.x, box.y, box.width, box.height, 'class="rh-zone"'))
  }

  const courtHeight = Math.max(d.roofSection.courtSideEdge, d.roofSection.outerEdgeControl)
  const courtLeftBottom = project.point(d.court.y0, 0)
  const courtLeftTop = project.point(d.court.y0, courtHeight)
  const courtRightBottom = project.point(d.court.y1, 0)
  const courtRightTop = project.point(d.court.y1, courtHeight)
  parts.push(
    svgLine(courtLeftBottom.x, courtLeftBottom.y, courtLeftTop.x, courtLeftTop.y, 'class="rh-court-edge"'),
    svgLine(courtRightBottom.x, courtRightBottom.y, courtRightTop.x, courtRightTop.y, 'class="rh-court-edge"')
  )

  const datums = [
    ['GF FFL', d.levels.groundFfl, true],
    ['ground clear ceiling', d.levels.groundCeiling, false],
    ['first FFL', d.levels.firstFfl, true],
    ['upper clear ceiling', d.levels.upperCeiling, false],
    ['outer cornice/eaves control', d.levels.corniceControl, false]
  ] as const
  for (const [label, z, structuralEdge] of datums) {
    const y = project.point(0, z).y
    const cls = structuralEdge ? 'rh-section-edge' : 'rh-section-datum'
    for (const [a, b] of [[south0, south1], [north0, north1]] as const) {
      const p1 = project.point(a, z)
      const p2 = project.point(b, z)
      parts.push(svgLine(p1.x, p1.y, p2.x, p2.y, `class="${cls}" data-datum="${escapeXml(label)}" data-z="${formatSvgNumber(z)}"`))
    }
    parts.push(svgText(d.shell.depth + 650, y + 55, `${label} ${z === 0 ? '±0' : `+${formatSvgNumber(z)}`} mm`, 'class="oh-mono"'))
  }

  const southOuter = project.point(0, d.roofSection.outerEdgeControl)
  const southCourt = project.point(d.court.y0, d.roofSection.courtSideEdge)
  const northCourt = project.point(d.court.y1, d.roofSection.courtSideEdge)
  const northOuter = project.point(d.shell.depth, d.roofSection.outerEdgeControl)
  parts.push(
    svgLine(southOuter.x, southOuter.y, southCourt.x, southCourt.y, 'class="rh-roof" data-roof-field="south"'),
    svgLine(northCourt.x, northCourt.y, northOuter.x, northOuter.y, 'class="rh-roof" data-roof-field="north"'),
    svgText((south0 + south1) / 2, southCourt.y - 210, `fall ${d.roofSection.direction} · 1:${context.source.roof.value.screeningFallDenominator}`, 'class="oh-note" text-anchor="middle"'),
    svgText((north0 + north1) / 2, northCourt.y - 210, `fall ${d.roofSection.direction} · 1:${context.source.roof.value.screeningFallDenominator}`, 'class="oh-note" text-anchor="middle"')
  )

  for (let index = 0; index < d.stair.landingDatums.length; index += 1) {
    const z = d.stair.landingDatums[index]
    const a = project.point(280, z)
    const b = project.point(d.court.y0 - 280, z)
    parts.push(
      svgLine(a.x, a.y, b.x, b.y, `class="rh-landing" data-derived="STAIR-LANDING-${index + 1}" data-z="${formatSvgNumber(z)}"`),
      svgText((a.x + b.x) / 2, a.y - 85, `derived landing +${formatSvgNumber(z)}`, 'class="oh-note" text-anchor="middle"')
    )
  }

  parts.push(
    svgText((south0 + south1) / 2, project.point(0, 4700).y, 'Upper stair field', 'class="oh-label" text-anchor="middle"'),
    svgText((d.court.y0 + d.court.y1) / 2, project.point(0, 4400).y, 'Open courtyard', 'class="oh-label" text-anchor="middle"'),
    svgText((north0 + north1) / 2, project.point(0, 4700).y, 'Dry / landing field', 'class="oh-label" text-anchor="middle"'),
    svgText((south0 + south1) / 2, project.point(0, 1500).y, 'Hall / stair field', 'class="oh-label" text-anchor="middle"'),
    svgText((north0 + north1) / 2, project.point(0, 1500).y, 'Garden dining', 'class="oh-label" text-anchor="middle"')
  )

  const groundY = project.point(0, 0).y
  const dimY = groundY + 650
  parts.push(
    svgText(0, groundY + 230, 'S', 'class="oh-label" text-anchor="middle"'),
    svgText(d.shell.depth, groundY + 230, 'N', 'class="oh-label" text-anchor="middle"'),
    svgLine(0, dimY, d.shell.depth, dimY, 'class="rh-dim"'),
    svgText(d.shell.depth / 2, dimY + 280, `${formatSvgNumber(d.shell.depth)} mm overall depth`, 'class="oh-mono" text-anchor="middle"'),
    svgLine(d.court.y0, dimY - 260, d.court.y1, dimY - 260, 'class="rh-dim"'),
    svgText((d.court.y0 + d.court.y1) / 2, dimY - 360, `${formatSvgNumber(d.court.depth)} mm court`, 'class="oh-mono" text-anchor="middle"')
  )

  const rightX = d.shell.depth + 650
  parts.push(
    svgText(rightX, project.point(0, 1700).y, 'Section key', 'class="oh-label"'),
    svgText(rightX, project.point(0, 1400).y, 'solid heavy · FFL / represented edge', 'class="oh-note"'),
    svgText(rightX, project.point(0, 1150).y, 'dashed · datum / derived landing guide', 'class="oh-note"'),
    svgText(rightX, project.point(0, 900).y, 'courtyard open to sky', 'class="oh-note"'),
    svgText(rightX, project.point(0, 500).y, `Stair ${d.stair.riserCount} rises · ${d.stair.flightRiseGroups.join('/')} · rise ${formatSvgNumber(d.stair.rise)} mm · going ${formatSvgNumber(d.stair.going)} mm`, 'class="oh-note"')
  )

  const bottomY = groundY + 1450
  parts.push(
    svgText(0, bottomY, 'Stair landings are datum guides only. No strings, treads, guards, headroom, floor build-up or exact well geometry is implied.', 'class="oh-note"'),
    svgText(0, bottomY + 300, `Source compile ${context.result.identity.compile.fingerprint}`, 'class="oh-id"')
  )

  if (context.reviewStateVisible) {
    parts.push(renderReviewBanner(d.shell.depth + 600, -1250, 3100, diagnosticCodes(context)))
  }

  parts.push('</svg>')
  return `${parts.join('\n')}\n`
}

export interface ReferenceHouseSpatialInspectionSet {
  readonly groundFloor: string
  readonly firstFloor: string
  readonly principalSection: string
}

export const renderReferenceHouseSpatialInspectionSet = (
  context: ReferenceHouseOutputContext
): ReferenceHouseSpatialInspectionSet => ({
  groundFloor: renderReferenceHousePlan(context, 'GROUND'),
  firstFloor: renderReferenceHousePlan(context, 'FIRST'),
  principalSection: renderReferenceHousePrincipalSection(context)
})
