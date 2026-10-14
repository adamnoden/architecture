from pathlib import Path

p = Path('compiler/reference-house/output/spatial.ts')
s = p.read_text()

old = '''const renderSpace = (
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
'''
new = '''const splitSpaceLabel = (label: string): [string, string] => {
  const human = sentenceCase(label)
  if (human.includes(' / ')) {
    const [first, second] = human.split(' / ', 2)
    return [first, `/ ${second}`]
  }
  const words = human.split(' ')
  const pivot = Math.ceil(words.length / 2)
  return [words.slice(0, pivot).join(' '), words.slice(pivot).join(' ')]
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
  const human = sentenceCase(space.label)
  const narrowTall = space.bounds.width < 1700 && space.bounds.height > space.bounds.width * 2
  const wrap = !narrowTall && human.length > 18 && space.bounds.width < 3000

  let label: string
  if (narrowTall) {
    label = `<g transform="rotate(-90 ${formatSvgNumber(centre.x)} ${formatSvgNumber(centre.y)})">
      ${svgText(centre.x, centre.y - 45, human, 'class="oh-label" text-anchor="middle"')}
      ${svgText(centre.x, centre.y + 190, space.id, 'class="oh-id" text-anchor="middle"')}
    </g>`
  } else if (wrap) {
    const [first, second] = splitSpaceLabel(human)
    label = `${svgText(centre.x, centre.y - 145, first, 'class="oh-label" text-anchor="middle"')}
      ${second ? svgText(centre.x, centre.y + 80, second, 'class="oh-label" text-anchor="middle"') : ''}
      ${svgText(centre.x, centre.y + 315, space.id, 'class="oh-id" text-anchor="middle"')}`
  } else {
    label = `${svgText(centre.x, centre.y - 50, human, 'class="oh-label" text-anchor="middle"')}
      ${svgText(centre.x, centre.y + 185, space.id, 'class="oh-id" text-anchor="middle"')}`
  }

  return `<g ${svgAttrs({
    'data-entity': space.id,
    'data-kind': space.kind,
    'data-provisional': space.provisional
  })}>
    <title>${escapeXml(human)}</title>
    ${boxes}
    ${label}
  </g>`
}
'''
if old not in s:
    raise SystemExit('renderSpace anchor not found')
s = s.replace(old, new, 1)

old_dim = '''${svgText((courtSouth.x + courtNorth.x) / 2, (courtSouth.y + courtNorth.y) / 2 + 30, `${formatSvgNumber(court.width)} × ${formatSvgNumber(court.depth)} mm`, 'class="oh-mono" text-anchor="middle"')}'''
new_dim = '''${svgText((courtSouth.x + courtNorth.x) / 2, (courtSouth.y + courtNorth.y) / 2 + 620, `${formatSvgNumber(court.width)} × ${formatSvgNumber(court.depth)} mm`, 'class="oh-mono" text-anchor="middle"')}'''
if old_dim not in s:
    raise SystemExit('court dimension anchor not found')
s = s.replace(old_dim, new_dim, 1)

old_panel = '''  parts.push(
    svgText(rightX, unresolvedY, 'Unresolved relationships', 'class="oh-label"'),
    svgText(rightX, unresolvedY + 300, `${qualitative.length} qualitative opening obligations`, 'class="oh-note"'),
    svgText(rightX, unresolvedY + 555, `${adjacencies.length} required space connections`, 'class="oh-note"'),
    svgText(rightX, unresolvedY + 810, 'Dotted host/edge = relation known; position not authored.', 'class="oh-note"'),
    svgText(rightX, unresolvedY + 1260, 'Planning values — not wall/stair construction', 'class="oh-label"'),
    svgText(rightX, unresolvedY + 1560, `Wall family ${context.source.wallPlanning.normalRange.value.min}–${context.source.wallPlanning.normalRange.value.max} mm; stress ${context.source.wallPlanning.stressThickness.value} mm`, 'class="oh-note"'),
    svgText(rightX, unresolvedY + 1815, `Stair ${d.stair.riserCount} rises · ${d.stair.flightRiseGroups.join('/')} · going ${d.stair.going} mm`, 'class="oh-note"'),
    svgText(rightX, unresolvedY + 2070, `clear-width target ≈${context.source.stair.clearWidthTarget.value} mm · reservation ${context.source.stair.reservation.value.min}–${context.source.stair.reservation.value.max} mm`, 'class="oh-note"')
  )'''
new_panel = '''  parts.push(
    svgText(rightX, unresolvedY, 'Unresolved relationships', 'class="oh-label"'),
    svgText(rightX, unresolvedY + 300, `${qualitative.length} qualitative opening obligations`, 'class="oh-note"'),
    svgText(rightX, unresolvedY + 555, `${adjacencies.length} required space connections`, 'class="oh-note"'),
    svgText(rightX, unresolvedY + 810, 'Dotted host/edge = relationship known.', 'class="oh-note"'),
    svgText(rightX, unresolvedY + 1050, 'Exact position is not authored.', 'class="oh-note"'),
    svgText(rightX, unresolvedY + 1430, 'Planning values — not construction', 'class="oh-label"'),
    svgText(rightX, unresolvedY + 1710, `Wall planning ${context.source.wallPlanning.normalRange.value.min}–${context.source.wallPlanning.normalRange.value.max} mm`, 'class="oh-note"'),
    svgText(rightX, unresolvedY + 1940, `Stress case ${context.source.wallPlanning.stressThickness.value} mm`, 'class="oh-note"'),
    svgText(rightX, unresolvedY + 2280, `Stair ${d.stair.riserCount} rises · ${d.stair.flightRiseGroups.join('/')}`, 'class="oh-note"'),
    svgText(rightX, unresolvedY + 2510, `Going ${d.stair.going} mm · width target ≈${context.source.stair.clearWidthTarget.value} mm`, 'class="oh-note"'),
    svgText(rightX, unresolvedY + 2740, `Reservation ${context.source.stair.reservation.value.min}–${context.source.stair.reservation.value.max} mm`, 'class="oh-note"')
  )'''
if old_panel not in s:
    raise SystemExit('right panel anchor not found')
s = s.replace(old_panel, new_panel, 1)

old_datum = "['outer cornice/eaves control', d.levels.corniceControl, false]"
if old_datum not in s:
    raise SystemExit('datum label anchor not found')
s = s.replace(old_datum, "['cornice/eaves control', d.levels.corniceControl, false]", 1)

p.write_text(s)
