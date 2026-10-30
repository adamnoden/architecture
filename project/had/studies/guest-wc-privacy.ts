/** Bounded privacy geometry, not an optical, ventilation or window-product test. */
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync, writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {layoutRevision as house, revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js'

type Point = {x: number, y: number, z: number}
type Rect = {x: number, y: number, width: number, depth: number}
type Aperture = {left: number, right: number, bottom: number, top: number}
const opening = revisionOpenings('GROUND').find(o => o.id === 'south-window-3')
assert(opening?.wall === 'outer-south' && opening.centre === 8100 && opening.width === 1000)
assert.equal(opening.sill ?? 750, 750)
assert.equal(opening.head ?? 2850, 2850)
assert.equal(house.levels.ground, 0)
assert.equal(house.levels.ceilingGround, 3100)
assert.equal(house.envelope, 417.5)
assert.equal(house.partition, 125)
assert.deepEqual(house.rooms.GROUND.find(r => r.id === 'G-WC')?.boxes,
  [{x: 7200, y: 0, width: 2300, depth: 2650}])
assert.deepEqual(house.wetFit.guestBasin, {x: 7337.5, y: 600, width: 400, depth: 400})
assert.deepEqual(house.wetFit.guestPan, {x: 9000, y: 600, width: 400, depth: 650})

// Source aperture and OAS-NOMINAL-01 frame envelope are different authorities.
// The air gaps below are new hypothetical CLEAR rectangles, not sash travel.
const masonry: Aperture = {left: 7600, right: 8600, bottom: 750, top: 2850}
const nominalFrame = {outerWidth: 970, outerHeight: 2070, depth: 140,
  front: 220, rear: 360, sectionReserve: 60}
const frameClear = {left: 7675, right: 8525, bottom: 825, top: 2775}
const topGap: Aperture = {...frameClear, bottom: 2500}
const lowerGap: Aperture = {...frameClear, top: 1125}
const round = (n: number) => Number(n.toFixed(3))

function atY(eye: Point, target: Point, y: number): Point {
  assert(eye.y < y && y < target.y, 'Plane must lie between observer and target')
  const t = (y - eye.y) / (target.y - eye.y)
  return {x: eye.x + t * (target.x - eye.x), y, z: eye.z + t * (target.z - eye.z)}
}
function inside(p: Point, a: Aperture): boolean {
  return p.x > a.left && p.x < a.right && p.z > a.bottom && p.z < a.top
}
function trace(eye: Point, target: Point, gap: Aperture, wallDepth = house.envelope) {
  const planes = [{y: 0, aperture: masonry}, {y: nominalFrame.front, aperture: gap},
    {y: nominalFrame.rear, aperture: gap}, {y: wallDepth, aperture: masonry}]
  const intersections = planes.map(({y, aperture}) => {
    const p = atY(eye, target, y)
    return {point: {x: round(p.x), y, z: round(p.z)}, passes: inside(p, aperture)}
  })
  return {eye, target, intersections, clearRay: intersections.every(p => p.passes)}
}
const lowerWitness = trace({x: 5600, y: -1500, z: 1650}, {x: 9200, y: 925, z: 750}, lowerGap)
const upperWitness = trace({x: 8100, y: -2000, z: 3500}, {x: 8100, y: 2250, z: 1800}, topGap)
const groundTop = trace({x: 8100, y: -1500, z: 1850}, {x: 8100, y: 2250, z: 1900}, topGap)
assert.equal(lowerWitness.clearRay, true, 'Lower opening must expose the adverse ray')
assert.equal(upperWitness.clearRay, true, 'Elevated observer must defeat the top-gap comparison')
assert.equal(groundTop.clearRay, false)
// Analytic envelope: every point on a segment is a convex combination of endpoints.
// The whole bounded observer/target domain is below the gap, not just sampled rays.
const groundDomain = {outsideGrade: -150, maxEyeAboveGrade: 2000,
  maxEyeAboveFFL: 1850, targetBottom: 300, targetTop: 1900,
  minimumTopGapElevation: topGap.bottom,
  verticalSeparation: topGap.bottom - Math.max(1850, 1900)}
assert.equal(groundDomain.verticalSeparation, 600)
assert.equal(trace(upperWitness.eye, upperWitness.target, topGap, 492.5).clearRay, true)
assert.equal(trace(lowerWitness.eye, lowerWitness.target, lowerGap, 492.5).clearRay, true)
// Negative controls: a sufficiently reduced upper gap or a narrow central slit
// must reject the corresponding ray. Edge contact is conservatively not a pass.
assert.equal(trace(upperWitness.eye, upperWitness.target, {...topGap, bottom: 2750}).clearRay, false)
assert.equal(trace(lowerWitness.eye, lowerWitness.target, {...lowerGap, left: 8050, right: 8150}).clearRay, false)
assert.equal(inside({x: frameClear.left, y: 220, z: 2600}, topGap), false)

const rectOverlap = (a: Rect, b: Rect) => Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x))
  * Math.max(0, Math.min(a.y + a.depth, b.y + b.depth) - Math.max(a.y, b.y))
const shutter = {left: 7580, right: 8620, bottom: 725, top: 2875,
  plane: house.envelope + 40, leafWidth: 520, leafThickness: 22,
  closedJoint: 'Ideal opaque perimeter and meeting overlaps; fabrication unproved'}
const leftAt90: Rect = {x: shutter.left - 11, y: shutter.plane, width: 22, depth: 520}
const rightAt90: Rect = {x: shutter.right - 11, y: shutter.plane, width: 22, depth: 520}
const basinOverlap = rectOverlap(leftAt90, house.wetFit.guestBasin)
assert.equal(basinOverlap, 8305)
const westRoomFace = 7200 + house.partition / 2
const leftAt180BeyondRoom = westRoomFace - (shutter.left - shutter.leafWidth)
assert.equal(leftAt180BeyondRoom, 202.5)
const screenBlocks = (ray: typeof lowerWitness, top = shutter.top) => inside(
  atY(ray.eye, ray.target, shutter.plane), {...shutter, top})
assert.equal(screenBlocks(lowerWitness), true)
assert.equal(screenBlocks(upperWitness), true)
assert.equal(screenBlocks(upperWitness, 2250), false, 'A low screen must not hide elevated-view failure')

const sourcePaths = ['compiler/reference-house/georgian/layout-revision.ts',
  'docs/reference-house/opening-interface-studies.md']
const sourceBlobs = Object.fromEntries(sourcePaths.map(path => {
  const bytes = readFileSync(fileURLToPath(new URL('../../../' + path, import.meta.url)))
  return [path, createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')]
}))
const result = {id: 'HAD-GUEST-WC-PRIVACY-01', basis: house.id, adopted: false, sourceBlobs,
  scope: 'Conditional direct-sightline and nominal shutter-plan comparison; no optical or human-operation result',
  masonry, nominalFrame, topGap, lowerGap, groundDomain,
  rays: {lowerWitness, upperWitness, groundTop},
  shutter: {...shutter, leftAt90, rightAt90, basinPlanOverlapMm2: basinOverlap,
    leftAt180BeyondRoomMm: leftAt180BeyondRoom,
    clashLimit: 'Basin/tap heights are unselected; overlapping plan reservations prevent a claimed fit',
    fullOpaqueScreenBlocksBothRays: true, screenTo2250BlocksElevatedRay: false},
  thickerWallSensitivity: {wallDepth: 492.5, frameUnchanged: true, bothAdverseRaysRemain: true,
    adopted: false},
  exclusions: ['Light scattering, silhouette recognition and night-time privacy',
    'Actual glazing or sash profiles, clear air area, control reach and restrictor performance',
    'Ventilation, security, glazing safety, weathering and thermal performance',
    'Actual shutter joinery, mass, operation, fixation and full maintenance movement',
    'Site viewpoints, structural adoption and polymer exception approval']}

const svg: string[] = []
const esc = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
const add = (s: string) => svg.push(s)
const text = (x: number, y: number, s: string, cls = '') => add(`<text x="${x}" y="${y}" class="${cls}">${esc(s)}</text>`)
const line = (x: number, y: number, xx: number, yy: number, cls = 'line') => add(`<path d="M${x},${y}L${xx},${yy}" class="${cls}"/>`)
const rect = (x: number, y: number, w: number, h: number, fill: string, cls = 'line') => add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" class="${cls}"/>`)
add('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="#fffdf8"/><style>text{font-family:DejaVu Sans,sans-serif;font-size:3px;fill:#243c46}.title{font-size:6px;font-weight:bold}.heading{font-size:3.6px;font-weight:bold}.small{font-size:2.6px}.line{stroke:#566c72;stroke-width:.3}.ray{fill:none;stroke:#b14e35;stroke-width:.6}.candidate{fill:none;stroke:#317a76;stroke-width:.55}.dash{fill:none;stroke:#a25e42;stroke-width:.35;stroke-dasharray:1.5 1}</style>')
text(12, 15, 'Guest WC: privacy depends on the occupied state', 'title')
text(12, 23, 'HAD-GUEST-WC-PRIVACY-01 · conditional geometry · current house unchanged', 'small')
line(12, 28, 408, 28)

text(12, 37, 'A  Window bay and shutter challenger / plan 1:25', 'heading')
const px = (x: number) => 16 + (x - 7200) / 25
const py = (y: number) => 151 - y / 25
const planRect = (r: Rect, fill: string, cls = 'line') => rect(px(r.x), py(r.y + r.depth), r.width / 25, r.depth / 25, fill, cls)
planRect({x: 7200, y: 0, width: 2300, depth: house.envelope}, '#e2dacf')
planRect({x: 7200, y: house.envelope, width: 62.5, depth: 2170}, '#e2dacf')
planRect({x: 9437.5, y: house.envelope, width: 62.5, depth: 2170}, '#e2dacf')
planRect({x: 7262.5, y: 2587.5, width: 2175, depth: 62.5}, '#e2dacf')
planRect({x: 7600, y: 0, width: 1000, depth: 417.5}, '#f6fbfb')
planRect({x: 7650, y: 2587.5, width: 900, depth: 62.5}, '#fffdf8')
planRect(house.wetFit.guestBasin, '#c8d8d9')
planRect(house.wetFit.guestPan, '#c8d8d9')
planRect(leftAt90, '#bb765d'); planRect(rightAt90, '#bb765d')
line(px(shutter.left), py(shutter.plane), px(shutter.right), py(shutter.plane), 'dash')
for (const [hinge, sign] of [[shutter.left, 1], [shutter.right, -1]]) {
  const pts = Array.from({length: 25}, (_, i) => {
    const angle = i * Math.PI / 48
    return `${px(hinge + sign * shutter.leafWidth * Math.cos(angle))},${py(shutter.plane + shutter.leafWidth * Math.sin(angle))}`
  })
  add(`<polyline points="${pts.join(' ')}" class="dash"/>`)
}
text(px(7400), py(850), 'B', 'small'); text(px(9130), py(930), 'WC', 'small')
text(px(8100), py(2400), 'Door / north ↑', 'small')
text(115, 49, 'Source bay: centre x8100; width 1000.')
text(115, 58, 'B = retained 400 × 400 basin reservation.')
text(115, 67, 'Opaque challenger: two 520 leaves, 22 thick.')
text(115, 76, 'Closed plane 457.5; leaves reach y977.5 at 90°.')
text(115, 85, 'Left 90° leaf overlaps the basin in plan.')
text(115, 94, 'Basin/tap heights unknown: no installed fit.')
text(115, 103, 'Left 180° leaf crosses west room face by 202.5.')
text(115, 112, 'Folding, relocation or different shutter needed;')
text(115, 118, 'none is smuggled into the glazing preference.')
text(115, 132, 'No shutter pocket is hidden in permanent fabric.')
text(115, 141, 'Scale 100% at A3. Source fixtures are not products.', 'small')

text(260, 37, 'B  Opening envelope / elevation 1:20', 'heading')
const ex = (x: number) => 266 + (x - 7600) / 20
const ez = (z: number) => 190 - z / 20
rect(ex(7600), ez(2850), 50, 105, '#e2dacf')
rect(ex(7615), ez(2835), 970 / 20, 2070 / 20, '#f6fbfb')
rect(ex(7675), ez(2775), 850 / 20, 1950 / 20, '#dfebeb')
rect(ex(7675), ez(2775), 850 / 20, 275 / 20, '#b6d6c8')
line(ex(7600), ez(1900), ex(8600), ez(1900), 'dash')
text(322, 58, 'Hypothetical clear gap', 'small')
text(322, 65, '2500–2775; not sash travel', 'small')
text(322, 82, 'Etch all glazed panes;', 'small')
text(322, 89, 'no clear upper vision pane.', 'small')
text(322, 102, 'Target-domain ceiling z1900', 'small')
text(322, 123, 'Source sill 750 / head 2850', 'small')
text(322, 131, 'Actual sash members, glass,', 'small')
text(322, 138, 'controls and bars unselected.', 'small')
text(260, 158, 'Envelope only; no fabricated sash or glazing-bar profile.', 'small')

text(12, 170, 'C  Elevated observer defeats a top opening / section 1:40', 'heading')
const sx = (y: number) => 75 + y / 40
const sz = (z: number) => 268 - z / 40
rect(sx(0), sz(750), 417.5 / 40, 750 / 40, '#e2dacf')
rect(sx(0), sz(3100), 417.5 / 40, 250 / 40, '#e2dacf')
line(sx(0), sz(0), sx(2587.5), sz(0))
line(sx(-2000), sz(-150), sx(0), sz(-150))
line(sx(220), sz(825), sx(220), sz(2500), 'candidate')
line(sx(360), sz(825), sx(360), sz(2500), 'candidate')
line(sx(220), sz(2775), sx(220), sz(2835), 'candidate')
line(sx(360), sz(2775), sx(360), sz(2835), 'candidate')
line(sx(upperWitness.eye.y), sz(upperWitness.eye.z), sx(upperWitness.target.y), sz(upperWitness.target.z), 'ray')
text(15, 177, 'Observer z3500 / y−2000', 'small')
text(129, 216, 'Target z1800 / y2250', 'small')
text(92, 195, 'Clear study gap 2500–2775', 'small')
text(15, 282, 'Finite wall AND frame planes checked; no claim about an actual neighbouring plot.', 'small')

text(260, 170, 'D  What this comparison earns', 'heading')
const notes = ['Glass direction: full-pane acid-etched translucency.',
  'No clear upper vision pane is assumed.',
  'Top gap: no ray in the stated ground-level domain;',
  '600 vertical separation is an analytic bound.',
  'Higher viewpoints defeat that bounded result.',
  'Lower opening: a ground-level adverse ray exists.',
  'Closed opaque shutter blocks both example rays;',
  'a screen ending at 2250 misses the elevated ray.',
  'Optical privacy remains untested at night / close up.',
  'No daylight, ventilation or window-product PASS.',
  'Cleaning and renewal are separate unoccupied states.',
  'HAD-03 and the actual product/assembly gates stay open.']
notes.forEach((s, i) => text(260, 181 + i * 8, s, 'small'))
line(12, 289, 408, 289)
text(12, 294, 'Dimensions mm · source identities and all ray coordinates: guest-wc-privacy.json · see owning result for sources and limits', 'small')
add('</svg>')

for (const [name, content] of [['guest-wc-privacy.json', JSON.stringify(result, null, 2) + '\n'],
  ['guest-wc-privacy.svg', svg.join('\n') + '\n']]) {
  const path = fileURLToPath(new URL(name, import.meta.url))
  if (process.argv.includes('--check')) assert.equal(readFileSync(path, 'utf8'), content, `${name} stale`)
  else writeFileSync(path, content)
}
console.log(JSON.stringify({groundTopDomain: 'blocked analytically', lowerAdverseRay: lowerWitness.clearRay,
  elevatedAdverseRay: upperWitness.clearRay, basinPlanOverlapMm2: basinOverlap,
  sourceAdoption: false, opticalPrivacy: 'unverified'}))
