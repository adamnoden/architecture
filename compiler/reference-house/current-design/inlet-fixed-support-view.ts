import type { compileFixedInletCandidate } from './inlet-fixed-entry.js'
import type { compareCurrentFixedInletSupport } from './inlet-fixed-support-integration.js'

type Candidate = ReturnType<typeof compileFixedInletCandidate>
type Support = ReturnType<typeof compareCurrentFixedInletSupport>
type Comparison = 'guidedRoute' | 'fullRestraintAdverse'
type Box = readonly number[]
type Rect = readonly [number, number, number, number]
type ViewGeometry = {
  readonly rail: { readonly levelsZMm: readonly number[] }
  readonly railBoxesMm: readonly Box[]
  readonly backplates: readonly { readonly bodyMm: Box; readonly throughPortMm?: Box | null;
    readonly drySteelWeldPadsMm: readonly Box[]; readonly anchorAxesMm: readonly Box[] }[]
  readonly fixedPointArms: readonly { readonly id: string; readonly bodyMm: Box }[]
  readonly guidePosts: readonly { readonly id: string; readonly bodyMm: Box; readonly armBodyMm: Box; readonly guideCentreMm: Box }[]
  readonly pipeMounts: readonly { readonly branch: string; readonly kind: string; readonly centreMm: Box;
    readonly outerDiameterMm: number; readonly boreDiameterMm: number; readonly axialHeightMm: number;
    readonly plateBodyMm: Box; readonly rearLugs: readonly { readonly blankBodyMm: Box }[];
    readonly clampEarBlanksMm: readonly Box[]; readonly boltAxesMm: readonly (readonly Box[])[] }[]
  readonly extraWindowObscurationMm: number
}
type View = {
  readonly comparison: string
  readonly description: string
  readonly geometry: ViewGeometry
  readonly sourceContext: Support['receivers']['guidedRoute']['sourceContext']
  readonly planSpan: { readonly fromMm: number; readonly toMm: number; readonly label: string }
  readonly compact?: { readonly representedSteelUpperBoundKg: number; readonly actualToolActionN: number | null;
    readonly authoredComparisonsPass: boolean; readonly socketRowsZMm: readonly number[];
    readonly minimumHoodSideAfterMetalAndSettingMm: number; readonly lowerRenewalPass: boolean;
    readonly minimumJawBoundAfter5Mm: number; readonly minimumDrawAfter5AndCurveMm: number; readonly translationYMm: number }
}

const escape = (value: string | number) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const number = (value: number) => String(Number(value.toFixed(3)))
const dimension = (value: number) => number(value) + ' mm'
const scale = 4 / 15

function clippedUnionArea(rectangles: readonly Rect[], boundary: Rect) {
  const clipped = rectangles.map(([x, z, width, height]) => {
    const left = Math.max(x, boundary[0]), bottom = Math.max(z, boundary[1])
    return [left, bottom, Math.min(x + width, boundary[0] + boundary[2]) - left,
      Math.min(z + height, boundary[1] + boundary[3]) - bottom] as const
  }).filter(row => row[2] > 0 && row[3] > 0)
  const breaks = [...new Set(clipped.flatMap(row => [row[0], row[0] + row[2]]))].sort((a, b) => a - b)
  return breaks.slice(1).reduce((area, right, index) => {
    const left = breaks[index], spans = clipped.filter(row => row[0] < right && row[0] + row[2] > left)
      .map(row => [row[1], row[1] + row[3]]).sort((a, b) => a[0] - b[0])
    let length = 0, end = -Infinity
    for (const span of spans) {
      length += Math.max(0, span[1] - Math.max(end, span[0]))
      end = Math.max(end, span[1])
    }
    return area + (right - left) * length
  }, 0)
}

export function renderInletFixedSupportView(candidate: Candidate, support: Support, comparison: Comparison = 'guidedRoute') {
  if (comparison !== 'guidedRoute' && comparison !== 'fullRestraintAdverse') throw new Error('Unsupported inlet support review comparison')
  const receiver = support.receivers[comparison], axes = receiver.geometry.jambAxesXMm
  return renderInletSupportSheet(candidate, support, {
    comparison, description: comparison === 'guidedRoute' ? 'guided-route support comparison' : 'rejected full-restraint comparison',
    geometry: receiver.geometry, sourceContext: receiver.sourceContext,
    planSpan: { fromMm: axes[0], toMm: axes[1], label: 'jamb axes' },
  })
}

export function renderCompactInletSupportView(candidate: Candidate, support: Support) {
  const compact = support.compactReceiver
  if (!compact || compact.schema !== 'had-fixed-inlet-compact-receiver/1') throw new Error('The compact review requires a source-derived compact receiver')
  const source = compact.sourceContext
  if (JSON.stringify(source.input) !== JSON.stringify(support.receivers.guidedRoute.sourceContext)
    || candidate.branches.some(branch => JSON.stringify(branch.controlArrangementComparison.wholeOrdinaryValveHood.bodyMm)
      !== JSON.stringify(compact.geometry.hoodReview.find(row => row.branch === branch.branch)?.currentBodyMm))) {
    throw new Error('The compact review requires the actual same-candidate support and closed hoods')
  }
  const current = compact.geometry
  const geometry: ViewGeometry = {
    rail: current.rail, railBoxesMm: current.railBoxesMm,
    backplates: current.backplates.map(plate => ({ bodyMm: plate.bodyMm, throughPortMm: plate.throughPortMm,
      drySteelWeldPadsMm: [plate.weldPadMm], anchorAxesMm: plate.anchorAxesMm })),
    fixedPointArms: current.fixedArms.map(arm => ({ id: arm.branch, bodyMm: arm.bodyMm })),
    guidePosts: current.guides.map(guide => {
      const mount = current.pipeMounts.find(row => row.branch === guide.branch && row.kind === 'axial-guide')
      if (!mount) throw new Error('The compact review requires the actual guide centre')
      return { id: guide.branch, bodyMm: guide.postBodyMm, armBodyMm: guide.armBodyMm, guideCentreMm: mount.centreMm }
    }),
    pipeMounts: current.pipeMounts.map(mount => ({ branch: mount.branch,
      kind: mount.kind === 'fixed-clamp' ? 'split-fixed-clamp' : 'split-axial-guide', centreMm: mount.centreMm,
      outerDiameterMm: mount.outerDiameterMm, boreDiameterMm: mount.boreDiameterMm, axialHeightMm: mount.axialHeightMm,
      plateBodyMm: mount.mountingPlateBodyMm, rearLugs: mount.rearLugBlanksMm.map(blankBodyMm => ({ blankBodyMm })),
      clampEarBlanksMm: mount.earBlanksMm, boltAxesMm: mount.boltAxesMm })),
    extraWindowObscurationMm: current.railBoxesMm.reduce((sum, box) => sum + box[5], 0),
  }
  return renderInletSupportSheet(candidate, support, {
    comparison: 'compact-east-jamb-cantilever', description: 'single-jamb cantilever · forward pipe draw '
      + (compact.operatingReview.lowerRenewalWithCurrentWeldedArmPass ? 'nominally clear' : 'blocked'), geometry,
    sourceContext: source.input,
    planSpan: { fromMm: current.railBoxesMm[0][0], toMm: current.jambAxisXMm, label: 'cantilever' },
    compact: { representedSteelUpperBoundKg: compact.mass.representedSteelUpperBoundKg,
      actualToolActionN: compact.basis.actualToolActionN,
      authoredComparisonsPass: compact.internalComparisons.railPlateAndWeldPass && compact.internalComparisons.localSteelPass
        && compact.internalComparisons.conditionalTubeContactPass && compact.internalComparisons.isolatedCatalogueScreenPass,
      socketRowsZMm: current.socketAccessReservations.sourceRowsZMm,
      minimumHoodSideAfterMetalAndSettingMm: Math.min(...current.hoodReview.map(row => row.currentM10EarToEastSideAfter3MetalAnd5SettingMm)),
      lowerRenewalPass: compact.operatingReview.lowerRenewalWithCurrentWeldedArmPass,
      minimumJawBoundAfter5Mm: Math.min(...compact.operatingReview.toolPoses.map(row => row.supportBodiesAfter5Mm)),
      minimumDrawAfter5AndCurveMm: Math.min(...compact.operatingReview.lowerRenewalReview.map(row => row.bareTubeToPermanentSupportAfter5AndCurveMm)),
      translationYMm: Math.max(...compact.operatingReview.lowerRenewalReview.map(row => row.actualTranslationMm[1])) },
  })
}

function renderInletSupportSheet(candidate: Candidate, support: Support, view: View) {
  if (candidate.source.caseDigest !== support.source.candidateCaseDigest || candidate.source.planDigest !== support.source.planDigest
    || candidate.source.insertCaseDigest !== support.source.insertCaseDigest || candidate.source.faultCaseDigest !== support.source.faultCaseDigest) {
    throw new Error('The support review requires the same candidate, insert, fault and design revisions')
  }
  const geometry = view.geometry, host = support.hostWindow
  if (!host || !host.candidateClearXMm || !host.acceptedClearXMm || !host.jambsXMm || host.headZMm === null
    || !Number.isFinite(host.headZMm) || !(host.headZMm > host.sillZMm)) {
    throw new Error('The support review requires the actual source window bounding datums')
  }
  if (candidate.branches.length !== 2 || geometry.railBoxesMm.length !== 2 || geometry.backplates.length !== 2
    || geometry.pipeMounts.length !== 4 || candidate.branches.some(branch =>
      !view.sourceContext.branches.some(row => row.id === branch.branch && row.pipeAxisXMm === branch.pressurePathMm[0][0]))) {
    throw new Error('The support review requires both source risers and their complete receiver geometry')
  }
  const jambs = host.jambsXMm, west = Math.min(...jambs.flat()), east = Math.max(...jambs.flat(), ...host.acceptedClearXMm)
  const minX = west - 100, floorY = 1040, elevationX = 145, sectionX = 755, planX = 1120, planY = 275
  const minY = Math.min(...host.jambNormalYMm) - 100
  const ex = (x: number) => elevationX + (east + 100 - x) * scale
  const sz = (z: number) => floorY - z * scale
  const sy = (y: number) => sectionX + (y - minY) * scale
  const px = (x: number) => planX + (x - minX) * scale
  const py = (y: number) => planY + (y - minY) * scale
  const hoods = candidate.branches.map(branch => ({ id: branch.branch, box: branch.controlArrangementComparison.wholeOrdinaryValveHood.bodyMm }))
  const projected = [...geometry.railBoxesMm, ...hoods.map(row => row.box)].map(box => [box[0], box[2], box[3], box[5]] as const)
  const obstructionMm2 = clippedUnionArea(projected, [host.candidateClearXMm[0], host.sillZMm,
    host.candidateClearXMm[1] - host.candidateClearXMm[0], host.headZMm - host.sillZMm])
  const parts: string[] = []
  const text = (x: number, y: number, value: string, className = 'note', anchor = 'start') =>
    parts.push(`<text x="${number(x)}" y="${number(y)}" class="${className}" text-anchor="${anchor}">${escape(value)}</text>`)
  const line = (id: string, x1: number, y1: number, x2: number, y2: number, className = 'line') =>
    parts.push(`<line id="${escape(id)}" x1="${number(x1)}" y1="${number(y1)}" x2="${number(x2)}" y2="${number(y2)}" class="${className}"/>`)
  const rect = (id: string, x: number, y: number, width: number, height: number, className: string, data?: Box) => {
    if ([x, y, width, height].some(value => !Number.isFinite(value)) || width < 0 || height < 0) throw new Error('Unsupported support review body')
    parts.push(`<rect id="${escape(id)}" x="${number(x)}" y="${number(y)}" width="${number(width)}" height="${number(height)}" class="${className}"${data ? ` data-body-mm="${data.map(number).join(',')}"` : ''}/>`)
  }
  const circle = (id: string, x: number, y: number, radius: number, className: string) =>
    parts.push(`<circle id="${escape(id)}" cx="${number(x)}" cy="${number(y)}" r="${number(radius)}" class="${className}"/>`)
  const elevBox = (id: string, box: Box, className = 'steel') => rect(id, ex(box[0] + box[3]), sz(box[2] + box[5]), box[3] * scale, box[5] * scale, className, box)
  const sectionBox = (id: string, box: Box, className = 'steel') => rect(id, sy(box[1]), sz(box[2] + box[5]), box[4] * scale, box[5] * scale, className, box)
  const planBox = (id: string, box: Box, className = 'steel') => rect(id, px(box[0]), py(box[1]), box[3] * scale, box[4] * scale, className, box)
  const horizontalDimension = (id: string, x1: number, x2: number, y: number, label: string) => {
    line(id, x1, y, x2, y, 'dimension')
    for (const x of [x1, x2]) line(id + '-tick-' + number(x), x - 3, y + 5, x + 3, y - 5, 'dimension')
    text((x1 + x2) / 2, y - 8, label, 'small', 'middle')
  }
  const verticalDimension = (id: string, x: number, y1: number, y2: number, label: string) => {
    line(id, x, y1, x, y2, 'dimension')
    for (const y of [y1, y2]) line(id + '-tick-' + number(y), x - 5, y + 3, x + 5, y - 3, 'dimension')
    parts.push(`<text x="${number(x - 9)}" y="${number((y1 + y2) / 2)}" class="small" text-anchor="middle" transform="rotate(-90 ${number(x - 9)} ${number((y1 + y2) / 2)})">${escape(label)}</text>`)
  }
  const branch = candidate.branches[0], branchId = branch.branch
  const pipeRadius = candidate.productFacts.pressurePipe.outerDiameterMm / 2
  const sectionClip = 'support-section-clip', elevationClip = 'support-elevation-clip'
  const metadata = { schema: 'had-fixed-inlet-support-review/1', units: 'mm', comparison: view.comparison, insideElevation: 'facing south; west to screen right', source: support.source,
    supportCaseDigest: support.caseDigest, window: host, projectedRailsAndClosedHoodsMm2WithinWindowBounds: obstructionMm2,
    compact: view.compact,
    projectionIsGlazingArea: false, selectedHouseAdoption: false, installedAcceptance: false }

  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 1680 1188" role="img" aria-labelledby="support-title support-description">
<title id="support-title">South utility window and fixed inlet support comparison</title>
<desc id="support-description">Source-derived inside elevation, pipe-axis section and plan. Two closed valve hoods and two support rails cross the conditional window. The nominal accepted window position is distinguished. The arched head is a bounding datum, without an invented profile. Authored support comparison, not selected or qualified.</desc>
<metadata>${escape(JSON.stringify(metadata))}</metadata>
<defs><pattern id="retained-hatch" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M-2 2L2-2M0 9L9 0M7 11L11 7" stroke="#d7d3c8" stroke-width="1"/></pattern>
<clipPath id="${elevationClip}"><rect x="${number(ex(east + 60))}" y="${number(sz(host.headZMm))}" width="${number((east - west + 120) * scale)}" height="${number(host.headZMm * scale)}"/></clipPath>
<clipPath id="${sectionClip}"><rect x="${number(sy(minY))}" y="${number(sz(host.headZMm))}" width="${number((candidate.settings.wetGuardFrontYMm + 170 - minY) * scale)}" height="${number(host.headZMm * scale)}"/></clipPath>
</defs>
<style>text{font-family:Arial,Helvetica,sans-serif;fill:#242a29}.title{font-size:30px;font-weight:600;letter-spacing:.2px}.subtitle{font-size:17px;fill:#525a57}.heading{font-size:18px;font-weight:600}.note{font-size:15px}.small{font-size:13px}.quiet{font-size:13px;fill:#68716d}.warning{font-size:15px;fill:#884b37}.line{stroke:#4d5752;stroke-width:1.3;fill:none}.dimension{stroke:#6b756e;stroke-width:1;fill:none}.datum{stroke:#6e817c;stroke-width:1;stroke-dasharray:6 5;fill:none}.accepted{stroke:#8f8180;stroke-width:1.4;stroke-dasharray:7 5;fill:none}.retained{stroke:#a7aaa0;stroke-width:1.2;fill:url(#retained-hatch)}.window{fill:#eaf0ee;stroke:#98aba4;stroke-width:1.2}.steel{fill:#77857d;stroke:#394b40;stroke-width:1.1}.hood{fill:#d8bbaa;stroke:#885f49;stroke-width:1.3}.hidden{fill:none;stroke:#59675d;stroke-width:1.1;stroke-dasharray:4 3}.pipe{fill:none;stroke:#384f4a;stroke-linejoin:round;stroke-linecap:round}.bare{fill:#f6f6ef;stroke:#384f4a;stroke-width:1.1}.joint{fill:#ecede4;stroke:#45564b;stroke-width:1}.white{fill:#faf9f4;stroke:none}</style>
<rect width="1680" height="1188" fill="#faf9f4"/>`)
  text(60, 58, 'The window remains the architectural test', 'title')
  text(60, 88, 'South utility entry · ' + view.description + ' · conditional geometry, unselected', 'subtitle')
  line('title-rule', 60, 112, 1620, 112)
  text(75, 154, '01  Inside elevation · facing south · 1:15', 'heading')
  text(700, 154, '02  Section at ' + branchId + ' riser · 1:15', 'heading')
  text(1120, 154, '03  Fixed-point plan · 1:15', 'heading')
  text(75, 178, 'Solid span: source conditional rewind. Dashed: accepted plan position.', 'quiet')
  text(700, 178, 'Hood cut away only here; supports do not bear on the window.', 'quiet')
  text(1120, 178, 'Cut through lower rail; +Y faces into the room.', 'quiet')

  rect('window-bound-elevation', ex(host.candidateClearXMm[1]), sz(host.headZMm),
    (host.candidateClearXMm[1] - host.candidateClearXMm[0]) * scale, (host.headZMm - host.sillZMm) * scale, 'window')
  for (const [index, jamb] of jambs.entries()) {
    elevBox('elevation-jamb-' + index, [jamb[0], host.jambNormalYMm[0], 0, jamb[1] - jamb[0], host.jambNormalYMm[1] - host.jambNormalYMm[0], host.headZMm], 'retained')
    line('jamb-cut-' + index, ex(jamb[0]) - 3, sz(host.headZMm) + 4, ex(jamb[1]) + 3, sz(host.headZMm) - 4)
  }
  line('window-head-bound', ex(host.candidateClearXMm[0]), sz(host.headZMm), ex(host.candidateClearXMm[1]), sz(host.headZMm), 'datum')
  horizontalDimension('candidate-window-width', ex(host.candidateClearXMm[0]), ex(host.candidateClearXMm[1]), 224,
    'conditional clear span ' + dimension(host.candidateClearXMm[1] - host.candidateClearXMm[0]))
  line('accepted-window-span', ex(host.acceptedClearXMm[0]), 201, ex(host.acceptedClearXMm[1]), 201, 'accepted')
  for (const x of host.acceptedClearXMm) line('accepted-window-tick-' + x, ex(x), 194, ex(x), 208, 'accepted')
  text(Math.max(...host.acceptedClearXMm.map(ex)) + 8, 205, 'nominal plan', 'quiet')
  text(ex(host.candidateClearXMm[1]), sz(host.headZMm) - 13, 'Arch head bound ' + dimension(host.headZMm) + ' · profile omitted', 'small')
  verticalDimension('window-sill-height', 112, sz(host.sillZMm), floorY, 'sill ' + dimension(host.sillZMm))
  verticalDimension('window-height-bound', 86, sz(host.headZMm), floorY, 'arch head datum ' + dimension(host.headZMm))
  line('elevation-floor', ex(west - 60), floorY, ex(east + 60), floorY)
  text(ex(east + 60), floorY + 23, 'FFL Z0 · dimensions in mm', 'small')

  parts.push(`<g clip-path="url(#${elevationClip})">`)
  for (const row of candidate.branches) {
    parts.push(`<polyline id="elevation-${row.branch}-pipe" points="${row.pressurePathMm.map(p => number(ex(p[0])) + ',' + number(sz(p[2]))).join(' ')}" class="pipe" stroke-width="${number(pipeRadius * 2 * scale)}"/>`)
  }
  for (const [index, plate] of geometry.backplates.entries()) {
    elevBox('elevation-backplate-' + index, plate.bodyMm)
    if (plate.throughPortMm) elevBox('elevation-backplate-port-' + index, plate.throughPortMm, 'retained')
    for (const [anchor, point] of plate.anchorAxesMm.entries()) circle('elevation-anchor-' + index + '-' + anchor, ex(point[0]), sz(point[2]), 1.6, 'bare')
  }
  for (const [index, box] of geometry.railBoxesMm.entries()) elevBox('elevation-rail-' + index, box)
  for (const post of geometry.guidePosts) elevBox('elevation-guide-post-' + post.id, post.bodyMm)
  for (const row of hoods) elevBox('elevation-' + row.id + '-closed-hood', row.box, 'hood')
  for (const mount of geometry.pipeMounts.filter(row => row.kind === 'split-axial-guide')) {
    elevBox('elevation-' + mount.branch + '-guide', [mount.centreMm[0] - mount.outerDiameterMm / 2, mount.centreMm[1],
      mount.centreMm[2] - mount.axialHeightMm / 2, mount.outerDiameterMm, 0, mount.axialHeightMm], 'joint')
  }
  parts.push('</g>')
  for (const [index, box] of geometry.railBoxesMm.entries()) {
    line('rail-level-' + index, ex(west - 25), sz(box[2] + box[5] / 2), ex(west - 90), sz(box[2] + box[5] / 2), 'dimension')
    text(ex(west - 100), sz(box[2] + box[5] / 2) + 5, 'rail ' + dimension(geometry.rail.levelsZMm[index]), 'small')
  }
  for (const [index, plate] of geometry.backplates.entries()) if (plate.throughPortMm) {
    const port = plate.throughPortMm, z = port[2] + port[5] / 2
    line('socket-port-leader-' + index, ex(port[0] + port[3] / 2), sz(z), ex(west - 90), sz(z), 'datum')
    text(ex(west - 100), sz(z) + 5, 'plate port ' + number(port[3]) + '×' + number(port[5]), 'small')
  }
  for (const row of hoods) text(ex(row.box[0] + row.box[3] / 2), sz(row.box[2] + row.box[5]) - 10, row.id, 'small', 'middle')

  rect('section-window-depth', sy(host.jambNormalYMm[0]), sz(host.headZMm),
    (host.jambNormalYMm[1] - host.jambNormalYMm[0]) * scale, (host.headZMm - host.sillZMm) * scale, 'window')
  sectionBox('section-retained-below-sill', [0, host.jambNormalYMm[0], 0, 0,
    host.jambNormalYMm[1] - host.jambNormalYMm[0], host.sillZMm], 'retained')
  line('section-finished-wall-datum', sy(branch.lowerTurn.finishedWallYMm), floorY, sy(branch.lowerTurn.finishedWallYMm), sz(host.headZMm), 'datum')
  line('section-floor', sy(minY), floorY, sy(candidate.settings.wetGuardFrontYMm + 130), floorY)
  parts.push(`<g clip-path="url(#${sectionClip})">`)
  for (const [index, box] of geometry.railBoxesMm.entries()) sectionBox('section-rail-' + index, box)
  for (const arm of geometry.fixedPointArms.filter(row => row.id === branchId)) sectionBox('section-fixed-arm', arm.bodyMm)
  for (const post of geometry.guidePosts.filter(row => row.id === branchId)) {
    sectionBox('section-guide-post', post.bodyMm)
    sectionBox('section-guide-arm', post.armBodyMm)
  }
  for (const row of hoods.filter(row => row.id === branchId)) sectionBox('section-closed-hood-bound', row.box, 'hidden')
  parts.push(`<polyline id="section-${branchId}-pipe" points="${branch.pressurePathMm.map(p => number(sy(p[1])) + ',' + number(sz(p[2]))).join(' ')}" class="pipe" stroke-width="${number(pipeRadius * 2 * scale)}"/>`)
  for (const mount of geometry.pipeMounts.filter(row => row.branch === branchId)) {
    sectionBox('section-' + mount.kind + '-plate', mount.plateBodyMm)
    sectionBox('section-' + mount.kind, [mount.centreMm[0], mount.centreMm[1] - mount.outerDiameterMm / 2,
      mount.centreMm[2] - mount.axialHeightMm / 2, 0, mount.outerDiameterMm, mount.axialHeightMm], 'joint')
  }
  parts.push('</g>')
  for (const [z, value] of [[geometry.rail.levelsZMm[0], 'clamp'], [geometry.guidePosts[0].guideCentreMm[2], 'guide']] as const) {
    line('section-label-' + z, sy(candidate.settings.riserYMm + 25), sz(z), 1013, sz(z), 'dimension')
    text(1018, sz(z) + 5, value + ' Z' + number(z), 'small')
  }
  text(sy(host.jambNormalYMm[0]) + 9, sz(host.headZMm) + 35, 'Opening', 'small')
  text(sy(host.jambNormalYMm[0]) + 9, sz(host.headZMm) + 54, 'depth only', 'small')
  text(718, 1080, 'Finished face Y' + number(branch.lowerTurn.finishedWallYMm) + ' · riser Y' + number(candidate.settings.riserYMm), 'small')
  horizontalDimension('section-pipe-roomward', sy(branch.lowerTurn.finishedWallYMm), sy(candidate.settings.riserYMm), 1107,
    dimension(candidate.settings.riserYMm - branch.lowerTurn.finishedWallYMm) + ' to pipe axis')

  for (const [index, jamb] of jambs.entries()) planBox('plan-jamb-' + index, [jamb[0], host.jambNormalYMm[0], 0,
    jamb[1] - jamb[0], host.jambNormalYMm[1] - host.jambNormalYMm[0], 0], 'retained')
  rect('plan-window-opening', px(host.candidateClearXMm[0]), py(host.jambNormalYMm[0]),
    (host.candidateClearXMm[1] - host.candidateClearXMm[0]) * scale,
    (host.jambNormalYMm[1] - host.jambNormalYMm[0]) * scale, 'window')
  for (const [index, plate] of geometry.backplates.entries()) {
    if (plate.bodyMm[2] > geometry.rail.levelsZMm[0] || plate.bodyMm[2] + plate.bodyMm[5] < geometry.rail.levelsZMm[0]) continue
    planBox('plan-backplate-' + index, plate.bodyMm)
    for (const [pad, box] of plate.drySteelWeldPadsMm.entries()) if (pad === 0) planBox('plan-weld-pad-' + index, box)
  }
  planBox('plan-lower-rail', geometry.railBoxesMm[0])
  line('plan-finished-wall', px(west - 50), py(branch.lowerTurn.finishedWallYMm), px(east + 30), py(branch.lowerTurn.finishedWallYMm), 'datum')
  for (const arm of geometry.fixedPointArms) planBox('plan-arm-' + arm.id, arm.bodyMm)
  for (const row of hoods) planBox('plan-' + row.id + '-closed-hood', row.box, 'hood')
  for (const row of candidate.branches) {
    const x = row.pressurePathMm[0][0]
    circle('plan-' + row.branch + '-pipe', px(x), py(candidate.settings.riserYMm), pipeRadius * scale, 'bare')
    text(px(x), py(candidate.settings.wetGuardFrontYMm) + 26, row.branch, 'small', 'middle')
  }
  horizontalDimension('plan-jamb-axis-span', px(view.planSpan.fromMm), px(view.planSpan.toMm), 244,
    view.planSpan.label + ' ' + dimension(view.planSpan.toMm - view.planSpan.fromMm))
  text(1120, 478, 'Closed hoods are opaque in the room elevation.', 'small')
  text(1120, 501, 'The plan shows the pipe axes through their covers.', 'small')
  if (view.compact) text(1120, 525, 'Cold draw +Y ' + dimension(view.compact.translationYMm) + '; full motion proof is separate.', 'small')

  const mount = geometry.pipeMounts.find(row => row.branch === branchId && row.kind === 'split-fixed-clamp')!
  const detailScale = 4 / 3, detailX = 1390, detailY = 723
  const dx = (x: number) => detailX + (x - mount.centreMm[0]) * detailScale
  const dy = (y: number) => detailY + (y - mount.centreMm[1]) * detailScale
  text(1120, 562, '04  Local fixed clamp · plan 1:3', 'heading')
  text(1120, 586, 'Declared profiles; exact welds, fit and rating unqualified.', 'quiet')
  const detailBox = (id: string, box: Box) => rect(id, dx(box[0]), dy(box[1]), box[3] * detailScale, box[4] * detailScale, 'steel', box)
  detailBox('detail-mounting-plate', mount.plateBodyMm)
  parts.push(`<defs><mask id="lug-profile"><rect x="1280" y="610" width="220" height="210" fill="white"/><circle cx="${number(detailX)}" cy="${number(detailY)}" r="${number(mount.outerDiameterMm / 2 * detailScale)}" fill="black"/></mask></defs><g mask="url(#lug-profile)">`)
  for (const [index, lug] of mount.rearLugs.entries()) detailBox('detail-trimmed-lug-' + index, lug.blankBodyMm)
  for (const [index, blank] of mount.clampEarBlanksMm.entries()) detailBox('detail-clamp-ear-' + index, blank)
  parts.push('</g>')
  circle('detail-clamp-outer', detailX, detailY, mount.outerDiameterMm / 2 * detailScale, 'joint')
  circle('detail-clamp-bore', detailX, detailY, mount.boreDiameterMm / 2 * detailScale, 'bare')
  circle('detail-pressure-pipe', detailX, detailY, pipeRadius * detailScale, 'bare')
  for (const [index, axis] of mount.boltAxesMm.entries()) line('detail-bolt-' + index, dx(axis[0][0]), dy(axis[0][1]), dx(axis[1][0]), dy(axis[1][1]), 'hidden')
  line('detail-clamp-parting', dx(mount.centreMm[0] - 31), detailY, dx(mount.centreMm[0] + 31), detailY, 'datum')
  horizontalDimension('detail-clamp-diameter', dx(mount.centreMm[0] - mount.outerDiameterMm / 2), dx(mount.centreMm[0] + mount.outerDiameterMm / 2), 783,
    'outer Ø' + number(mount.outerDiameterMm))
  text(1120, 635, 'Arm → plate → trimmed rear lugs', 'small')
  text(1120, 658, '→ split clamp → pressure tube', 'small')
  text(1120, 833, 'Pressure tube is not welded to its support.', 'small')

  line('review-notes-rule', 1120, 862, 1620, 862)
  text(1120, 894, 'Window consequence', 'heading')
  text(1120, 920, 'Two rails add ' + dimension(geometry.extraWindowObscurationMm) + ' of band height.', 'warning')
  text(1120, 946, 'Rails + closed hoods: ' + number(obstructionMm2 / 1e6) + ' m² projected', 'warning')
  text(1120, 969, 'within the window bounding rectangle; other stock adds to this.', 'small')
  text(1120, 992, 'This is not glazing area: the arch profile is not supplied.', 'small')
  if (view.compact) {
    text(1120, 1027, 'Steel upper bound ' + number(view.compact.representedSteelUpperBoundKg) + ' kg; other deadload unbound.', 'small')
    text(1120, 1054, 'Hood-side reserve ' + dimension(view.compact.minimumHoodSideAfterMetalAndSettingMm) + ' after 3 metal + 5 setting.', 'warning')
    text(1120, 1078, 'Jaw reserve ' + dimension(view.compact.minimumJawBoundAfter5Mm) + ' after 5; tool force '
      + (view.compact.actualToolActionN === null ? 'unknown' : number(view.compact.actualToolActionN) + ' N') + '.', 'warning')
    text(1120, 1102, !view.compact.authoredComparisonsPass ? 'Authored local checks FAIL; cold keeper/grip unqualified.'
      : !view.compact.lowerRenewalPass ? 'Source forward pipe draw blocked; cold keeper/grip unqualified.'
      : 'Draw ' + dimension(view.compact.minimumDrawAfter5AndCurveMm) + ' after 5 + curve; cold keeper/grip unqualified.', 'warning')
  } else {
    text(1120, 1027, 'No sash/frame load capacity or renewal approval is inferred.', 'small')
  }
  if (view.compact) text(155, 1087, 'Socket rows ' + view.compact.socketRowsZMm.slice(0, 2).map(number).join(' / ') + ' remain reserved; guard/key operation unproved.', 'quiet')
  text(155, view.compact ? 1110 : 1090, 'Lower wet-cell chassis and ribs are outside this view and remain unqualified.', 'quiet')
  line('footer-rule', 60, 1133, 1620, 1133)
  text(60, 1157, 'Authored comparison · guide/clamp, anchors, jamb cage, welds, tools and complete support network remain unqualified.', 'warning')
  text(60, 1179, 'Reference design, unselected · support ' + support.caseDigest.slice(0, 12) + ' · candidate ' + candidate.source.caseDigest.slice(0, 12), 'quiet')
  parts.push('</svg>')
  return parts.join('\n')
}
