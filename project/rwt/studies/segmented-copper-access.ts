/** Located access comparison only. No selected floor, terminal, water boundary or hydraulic result. */
import {readFileSync, writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {layoutRevision as house, revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js'
import {layoutFamilySource} from '../../../compiler/reference-house/georgian/layout-family.js'
import {evidence} from './copper-access-geometry.mjs'

const root = new URL('../../../', import.meta.url)
const blob = (path: string) => {
  const b = readFileSync(new URL(path, root))
  return createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex')
}
const historicalPath = 'project/rwt/studies/north-court-carrier.json'
if (blob(historicalPath) !== 'e516ebb375a2120a300e05bd869e7edcbb28f2c8') throw Error('Reassess changed historical north geometry')
const old = JSON.parse(readFileSync(new URL(historicalPath, root), 'utf8'))
const doors = revisionOpenings('GROUND').filter(o => ['garden-entry', 'grand-court-entry-north'].includes(o.id))
const near = house.court.y + house.court.depth, far = house.shell, thickness = house.envelope
const reserve = layoutFamilySource.groundReserve
if (house.shell !== 12000 || house.court.y !== 4250 || house.court.depth !== 3500 || thickness !== 417.5 || reserve !== 300 || doors.length !== 2 || doors.some(o => o.centre !== 6000 || o.width !== 2400)) throw Error('Reassess changed house/opening/floor source')
if (old.trial.centres.join(',') !== '5800,6200' || old.trial.fall !== 60 || old.trial.bridgeClear !== 650 || evidence.flange.item !== '89604' || evidence.flange.listedEnvelopeMm[1] !== 220) throw Error('Reassess changed route/catalogue envelope')
const diameter = evidence.flange.listedEnvelopeMm[1]
const cases = [{id: 'cover-only-lower-bound', cover: 50, insulation: 0, gap: 0}, {id: 'illustrative-insulation-gap', cover: 50, insulation: 100, gap: 10}].map(c => {
  const nearDepth = c.cover + c.insulation + c.gap + diameter
  const farDepth = nearDepth + old.trial.fall
  return {...c, nearBottom: -nearDepth, farBottom: -farDepth, nearRemainingReserve: reserve - nearDepth, farRemainingReserve: reserve - farDepth}
})
const spacing = old.trial.centres[1] - old.trial.centres[0]
const sources = [historicalPath, 'compiler/reference-house/georgian/layout-revision.ts', 'compiler/reference-house/georgian/layout-family.ts', 'project/rwt/studies/copper-access-geometry.mjs'].map(path => ({path, blob: blob(path)}))
const data = {
  authority: 'Conditional located access comparison; not an adopted route, floor, assembly or safety result.',
  startingMain: '5a28e4d5d0f367cd8c3cda10788966b23c93f1a1', sources,
  plan: {
    axes: old.trial.centres,
    doors: doors.map(o => ({id: o.id, from: o.centre - o.width / 2, to: o.centre + o.width / 2})),
    courtThreshold: {from: near, to: near + thickness, length: thickness},
    room: {from: near + thickness, to: far - thickness, length: far - near - 2 * thickness},
    gardenThreshold: {from: far - thickness, to: far, length: thickness},
    oldOpening: {from: old.bridge.clearFrom, to: old.bridge.clearTo, width: old.trial.bridgeClear},
  },
  depth: {nominalGroundReserve: reserve, assumedTransverseFlangeEnvelope: diameter, retainedFall: old.trial.fall, cases,
    excluded: ['lower supports and enclosure', 'fixed water boundary', 'actual bolt/tool projection', 'full removal sweep', 'actual assembled elbow and gasket stack']},
  pairedSameStation: {axisSpacing: spacing, flangeSpan: spacing + diameter, oldClearOpening: old.trial.bridgeClear,
    outsideRemainderEach: (old.trial.bridgeClear - spacing - diameter) / 2,
    withHistoricalSideAllowances: spacing + diameter + 2 * old.bridge.sleeveSideMargin,
    applicability: 'Two equal centred flange envelopes at the same longitudinal station. Staggered/different arrangements require reassessment.'},
  renewal: {historicalBody: old.renewal.body, historicalExteriorReservation: old.renewal.straightExternalCorridor,
    intactFlangeOriginalBoreMargin: old.trial.sleeveInside - diameter,
    possibleLongestUnopenedPlanBand: thickness,
    actualFixedW2Penetration: null, actualServiceJointFaces: null, actualThresholdPieceLength: null, actualModuleLength: null,
    actualReleaseTravel: null, actualHandlingArea: null, newExteriorReservation: null},
  acceptance: 'not-established',
}
if (data.plan.room.length !== 3415 || cases[0].farRemainingReserve !== -30 || cases[1].farRemainingReserve !== -140 || data.pairedSameStation.outsideRemainderEach !== 15 || data.renewal.intactFlangeOriginalBoreMargin !== -60) throw Error('Unexpected arithmetic')

const esc = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="#fff"/><style>text{font-family:Arial,sans-serif;font-size:3.2px;fill:#203740}.title{font-size:6px;font-weight:bold}.sub{font-size:4px;font-weight:bold}.small{font-size:2.9px}.band{fill:#e4e8e8;stroke:#596a71;stroke-width:.35}.access{fill:#fff2d9;stroke:#ac7436;stroke-width:.4;stroke-dasharray:2,1}.pipe{stroke:#9c5b30;stroke-width:1.3;fill:none}.flange{fill:#cf9167;stroke:#74482d;stroke-width:.4}.reserve{fill:none;stroke:#b34e41;stroke-width:.4;stroke-dasharray:2,1}.line{fill:none;stroke:#63757d;stroke-width:.3}</style>'
const text = (x: number, y: number, s: string, cls='') => {svg += `<text x="${x}" y="${y}" class="${cls}">${esc(s)}</text>`}
const rect = (x: number, y: number, w: number, h: number, cls: string) => {svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${cls}"/>`}
const line = (x: number, y: number, xx: number, yy: number, cls='line') => {svg += `<path d="M${x},${y}L${xx},${yy}" class="${cls}"/>`}
text(12,14,'Copper crossing: openable floor does not remove the thresholds','title')
text(12,23,'RWT-METALS / 30 October 2026 / all dimensions mm / conditional envelopes / no installed-safety result')
text(12,36,'A  Located north crossing','sub')
text(12,43,'Plan 1:35; axes and bands retained for comparison only','small')
const px = (x: number) => 16 + (x-4800)/35, py = (y: number) => 184 - (y-near)/35
for(const [a,b] of [[near,near+thickness],[far-thickness,far]]) rect(px(4800),py(b),2400/35,(b-a)/35,'band')
rect(px(old.bridge.clearFrom),py(far-thickness),old.trial.bridgeClear/35,data.plan.room.length/35,'access')
for(const x of old.trial.centres) line(px(x),py(far+150),px(x),py(near-150),'pipe')
text(94,63,'Garden threshold: 417.5')
text(94,70,'y11582.5–12000')
text(94,84,'Each crossing still needs its own')
text(94,91,'supported, releasable pipe piece.')
text(94,112,'Family-room run: 3415')
text(94,119,'y8167.5–11582.5')
text(94,129,'Dashed strip: old 650 opening')
text(94,136,'extended as a comparator only.')
text(94,146,'Cover/support, thermal continuity,')
text(94,153,'occupation and lifting unresolved.')
text(94,174,'Court threshold: 417.5')
text(94,181,'y7750–8167.5')
text(12,198,'Both door apertures x4800–7200; pipe axes x5800/6200.')
text(12,205,'Joint-face positions, fixed W2 penetration and module lengths: unknown.')

text(225,36,'B  Depth screen at two crossing-end slices','sub')
text(225,43,'Envelope heights 1:8; horizontal positions diagrammatic','small')
const z = (v: number) => 59-v/8
for(const x of [229,315]) {
  rect(x,z(0),68,300/8,'reserve')
  rect(x,z(0),68,50/8,'band')
}
text(229,53,'c50 / i0 / g0')
text(315,53,'c50 / i100 / g10')
for(let ci=0;ci<2;ci++) {
  const c=cases[ci], x=ci===0?229:315
  for(const [dx,bottom] of [[8,c.nearBottom],[43,c.farBottom]]) rect(x+dx,z(bottom+220),14,220/8,'flange')
  text(x+4,z(c.nearBottom)+8,`Near ${c.nearBottom}`, 'small')
  text(x+37,z(c.farBottom)+8,`Far ${c.farBottom}`, 'small')
}
text(225,130,'Red dashed depth: nominal 300 reserve, not a finished floor.')
text(225,138,'220 transverse flange; retained 60 fall. No support,')
text(225,145,'bolt/tool projection or release sweep has been included.')
text(225,154,'At equal stations: 400 centres + 220 = 620 wide;')
text(225,161,'old 650 gives 15 each outside edge before tools/supports.')
text(225,167,'Staggering or relocating joints changes the question.')
text(225,184,'C  Renewal and retained water boundary','sub')
text(225,195,'Old uninterrupted body 4450 / exterior reservation 5250.')
text(225,203,'Possible unopened bands 417.5 ≠ removable piece lengths.')
text(225,211,'220 intact flange still cannot pass a 160 bore.')
text(225,223,'W1 service-joint release must retain fixed W2 protection.')
text(225,231,'No actual W2 penetration, dry bay or shortened garden')
text(225,239,'handling area is proved by this diagram.')
text(12,226,'Development sequence','sub')
text(12,237,'Divert rain; independently support; expose floor access;')
text(12,245,'release exact joints; show full module/threshold-piece sweep;')
text(12,253,'reinstate; test conveyed-water W1 and retained W2 separately.')
text(12,268,'See segmented-copper-access.md. Raised-terminal-section.md retains the separate ground/receiving-level comparison.')
text(12,280,'RWT-METALS remains planned. Materials, floor/support, actual removal, dry access and hydraulic acceptance remain open.')
svg+='</svg>\n'
const outputs = [['segmented-copper-access.json', JSON.stringify(data,null,2)+'\n'], ['segmented-copper-access.svg',svg]]
const check = process.argv.includes('--check')
if(process.argv.slice(2).some(a=>a!=='--check')) throw Error('Only --check is supported')
for(const [path, content] of outputs) {
  const url = new URL(path, import.meta.url)
  if(check) {if(readFileSync(url,'utf8')!==content) throw Error(`Stale ${path}`)} else writeFileSync(url,content)
}
console.log(JSON.stringify({check,roomLength:data.plan.room.length,cases,pairedSameStation:data.pairedSameStation,acceptance:data.acceptance},null,2))
