import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const dir = dirname(fileURLToPath(import.meta.url))
const root = resolve(dir, '../../..')
const sources = {
  had: ['project/had/studies/open-north-loggia.json', '25faad2c4d40df2b7da7212f73808843a88d2f52'],
  mat: ['project/mat/studies/loggia-envelope-section.json', '0ec54ba2420b9337ce81b1867eef4c83d661e69b'],
  edge: ['project/mat/studies/loggia-roof-edge.json', '731c85d24e775259f1cf84d264d4ceaf75d89774'],
  renewal: ['project/rwt/studies/temporary-renewal-route.json', 'c51b98904ec9b85608857ddc88d21768bfe75504']
}
const input = Object.fromEntries(Object.entries(sources).map(([key, [path, sha]]) => {
  const actual = execFileSync('git', ['hash-object', path], { cwd: root, encoding: 'utf8' }).trim()
  if (actual !== sha) throw new Error(`Source drift ${key}: ${actual} != ${sha}`)
  return [key, JSON.parse(readFileSync(resolve(root, path), 'utf8'))]
}))
const { had, mat, edge } = input
if (had.roofDevelopment.eavesDatum !== 7100 || mat.outdoor.courtWalking.join() !== '0,-30,-110'
  || mat.portal.finishedSpan !== 2400 || mat.portal.finishedSpringAtVerticalJamb < 2126
  || had.outdoorWaterTerritories.normalGross[0] !== 4825
  || edge.geometry.edgeQ !== -200 || edge.weather.secondary.outerDripQ !== -220
  || edge.weather.gutter.planQ.join() !== '-370,-170') {
  throw new Error('Selected house premise changed')
}
const court = { x0: had.court[0], y0: had.court[1], x1: had.court[0] + had.court[2], y1: had.court[1] + had.court[3] }
const event = { intensityMmH: 216, roofAreaM2: 47.8125, courtAreaM2: 12.25,
  roofLps: 47.8125 * 216 / 3600, courtLps: 12.25 * 216 / 3600 }
event.combinedLps = event.roofLps + event.courtLps
if (event.combinedLps !== input.renewal.event216.combinedLitresPerSecond) throw new Error('Combined event source drift')
const inlet = { y0: 7000, y1: 7350 }
const machine = {
  identity: 'Genie AWP-25S standard-base CE, AWPT-6454 onward, outdoor outriggers, manual 1337927GT, sixth edition second printing August 2026',
  footprint: [3000, 2800], stowed: [1308, 736, 1980],
  platform: { option: 'standard gated', length: 690, width: 660, railHeight: 1100 }, power: 'DC 12V battery',
  maxPlatformHeight: 7500, maxOccupants: 1, capacityKg: 159, maxWheelKg: 231,
  wallAccessFromTopRail: 434, maxManualForceN: 200
}
const preInletDepth = inlet.y0 - court.y0
const yOptions = [machine.footprint[1], machine.footprint[0]]
const cornerStage = { x0: 4500, x1: 7500, y0: 4600, y1: 7400 }
const plan = {
  preInletDepth,
  unavoidableInletEnvelopeOverlap: yOptions.map(length => Math.max(0, length - preInletDepth)),
  historicalEmptyCourtStageOverlap: Math.max(0, Math.min(cornerStage.y1, inlet.y1) - Math.max(cornerStage.y0, inlet.y0)),
  sourceStage: cornerStage,
  door: { x0: 4800, x1: 7200 },
  rejectedDownrouteLanes: [{ x: 4550, fromY: 4500, downrouteY: 7000, normal: true }, { x: 7450, fromY: 4500, downrouteY: 7500, normal: false }],
  courtInlet: inlet,
  relief: { x0: 5300, x1: 7100, y0: 7750, y1: 12000 }
}
const section = {
  eaveDatum: had.roofDevelopment.eavesDatum,
  physicalOuterEdge: edge.geometry.edgeWeather,
  overhang: had.roofDevelopment.overhang,
  southWallPlaneY: court.y0,
  physicalHemY: court.y0 + had.roofDevelopment.overhang,
  portalJambSpring: mat.portal.finishedSpringAtVerticalJamb,
  portalTieUnderside: mat.portal.tie.underside,
  southMouthFloor: mat.outdoor.courtWalking[2],
  terraceFloor: mat.outdoor.gardenTerrace,
  machineTopAtSouthMouth: mat.outdoor.courtWalking[2] + machine.stowed[2],
  nominalJambMarginAtSouthMouth: mat.portal.finishedSpringAtVerticalJamb - (mat.outdoor.courtWalking[2] + machine.stowed[2]),
  minPlatformHeightFromSouthMouthToEaveDatum: had.roofDevelopment.eavesDatum - mat.outdoor.courtWalking[2],
  platformHeightHeadroomToDatum: machine.maxPlatformHeight - (had.roofDevelopment.eavesDatum - mat.outdoor.courtWalking[2]),
  trialBasket: { floor: 6000, topRail: 6000 + machine.platform.railHeight,
    raiseFromSouthMouth: 6000 - mat.outdoor.courtWalking[2],
    hemBelowTopRail: 6000 + machine.platform.railHeight - 7006.74,
    nominalTopRailToHem: machine.wallAccessFromTopRail - had.roofDevelopment.overhang },
  floorAtInletSouth: -94,
  floorAtCourtSouth: -110,
  southCourtDoorPanJoin: -30
}
const normalRoof = (q, d=0) => had.roofDevelopment.eavesDatum + q*Math.tan(had.roofDevelopment.pitch*Math.PI/180) - d/Math.cos(had.roofDevelopment.pitch*Math.PI/180)
const roofEdge = {
  authority: 'MAT unadopted ordinary-eave comparison; not a selected south court collector assembly',
  primaryHem: { q:-200, y:4450, z:edge.geometry.edgeWeather },
  secondaryDrip: { q:-220, y:4470, z:edge.weather.secondary.dripZ },
  gutter: { q:[-370,-170], y:[4620,4420], bottom:6730, front:6840, back:6880 },
  withdrawal: { lowering:150, outward:400, finalQ:[-770,-570], finalY:[5020,4820], sweptQ:[-770,-170], sweptZ:[6580,6880] },
  roofward: { q:250, y:4000, zincZ:normalRoof(250), secondaryZ:normalRoof(250,75.7) }
}
const rejectedTemporary = {
  roofIntercept: { x: 5900, wallPlaneY: 4250, physicalHemY: section.physicalHemY,
    trialOutboardEdgeY: 4500, outboardBeyondHem: 50, trialInvert: 6990, physicalHemZ: section.physicalOuterEdge },
  westBranch: { fromX: 5900, toX: 4550, startY: 4500, slope: .01, atSouthEdgeInvert: 6976.5, atY7000Invert: 6951.5, dropOutletInvert: -70,
    transfer: { toX: 5000, toInvert: -74.5, floor: -80, intakeBottomApprox: -206.25 }, destination: 'existing normal inlet, Cu250 and N/W receiver' },
  highCrossfall: { fromX: 5900, toX: 7450, y: 4500, slope: .01, endInvert: 6990 - (7450 - 5900) * .01 },
  highEastRun: { fromY: 4500, toY: 7500, slope: .01, endInvert: 6990 - (7450 - 5900 + 7500 - 4500) * .01 },
  dropAt: { x: 7450, y: 7500, outletInvert: -94 },
  transferAtCourt: { fromX: 7450, toX: 7000, fromInvert: -94, toInvert: -98.5, floor: -100,
    gauge: 1.5, landingInsideRelief: 100, startBottomAboveFloor: 4.5, landingBottomAboveFloor: 0 },
  destination: 'east branch to existing x5300–7100 broad surface, separate E chute and E receiver; west branch to live normal/N-W; neither feeds the receiver under repair',
  source: 'REJECTED: a cup at +6990 is above the secondary drip, overlaps the installed gutter and 150-down/400-out withdrawal sweep; two branches cannot receive water merely from a falling plan line.'
}
const result = {
  identity: 'RWT-06 high-eave access and receiver-renewal collision screen, 2026-11-02',
  sourceBlobs: Object.fromEntries(Object.entries(sources).map(([k, [p, s]]) => [k, { path: p, sha: s }])),
  manufacturerSource: 'https://manuals.genielift.com/operators/english/1337927.pdf',
  court, machine, plan, section, roofEdge, event, rejectedTemporary,
  consequence: 'Reject the outboard +6990 cup and its two-branch live rain claim. A roofward dual-layer intercept at q250 avoids gutter withdrawal, but needs an authored zinc/breather/lateral-exit/vent/support source and a proven live installation sequence; no receiver replacement or RWT-06 completion is admitted.'
}
if (plan.unavoidableInletEnvelopeOverlap.join() !== '50,250' || section.nominalJambMarginAtSouthMouth < 250
  || roofEdge.roofward.zincZ <= roofEdge.roofward.secondaryZ
  || rejectedTemporary.roofIntercept.trialInvert <= roofEdge.secondaryDrip.z
  || rejectedTemporary.roofIntercept.trialOutboardEdgeY <= rejectedTemporary.roofIntercept.physicalHemY
  || rejectedTemporary.westBranch.transfer.toInvert < rejectedTemporary.westBranch.transfer.floor
  || section.trialBasket.raiseFromSouthMouth > machine.maxPlatformHeight
  || rejectedTemporary.roofIntercept.trialInvert >= section.physicalOuterEdge) {
  throw new Error('Geometric adverse controls changed')
}
const json = JSON.stringify(result, null, 2) + '\n'
const sx = x => 85 + (x - court.x0) * .17
const sy = y => 90 + (y - court.y0) * .17
const X = q => 730 + (q + 800) * .29
const Y = z => 190 + (7250 - z) * .6
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1123" height="794" viewBox="0 0 1123 794">
<rect width="1123" height="794" fill="#f5f1e7"/><style>text{font-family:Arial,sans-serif;fill:#132d35} .tiny{font-size:13px}.micro{font-size:11px}.small{font-size:16px}.head{font-size:25px;font-weight:bold}.lab{font-size:18px;font-weight:bold}</style>
<text x="60" y="48" class="head">RWT-06 / +7100 court-eave service comparison</text>
<text x="60" y="72" class="tiny">Selected court plan + MAT ordinary-edge adverse section · no installed south court-eave assembly</text>
<text x="85" y="113" class="lab">Plan / south court eave at y4250</text>
<rect x="${sx(court.x0)}" y="${sy(court.y0)+45}" width="${court.x1===7750?595:0}" height="595" fill="#e8e3d5" stroke="#1c3d47" stroke-width="3"/>
<rect x="${sx(4500)}" y="${sy(4600)+45}" width="510" height="476" fill="#7ab4bd" fill-opacity=".26" stroke="#155f68" stroke-width="3" stroke-dasharray="10 6"/>
<rect x="${sx(4250)}" y="${sy(7000)+45}" width="595" height="59.5" fill="#e8945d" fill-opacity=".75"/>
<rect x="${sx(4250)}" y="${sy(4420)+45}" width="595" height="34" fill="#9c572c" fill-opacity=".55"/>
<rect x="${sx(4250)}" y="${sy(4820)+45}" width="595" height="34" fill="#9c572c" fill-opacity=".23"/>
<text x="95" y="160" class="small">court 3500 ×3500</text><text x="160" y="265" class="small">AWP empty-court envelope 3000 ×2800</text>
<text x="100" y="185" class="tiny">hem y4450 · gutter y4420–4620 · withdrawal y4820–5020</text>
<text x="105" y="555" class="small">Full-width inlet y7000–7350</text><text x="110" y="580" class="small">AWP envelope crosses 350 mm in the old centred trial</text>
<text x="95" y="680" class="tiny">Even y4250-start and 2800-depth overlap inlet by 50 mm.</text>
<text x="95" y="700" class="tiny">Pad positions and support bridge are not supplied by the manual.</text>
<text x="710" y="120" class="lab">Adverse q-z section (q inward)</text>
<rect x="${X(-770)}" y="${Y(6880)}" width="${X(-170)-X(-770)}" height="${Y(6580)-Y(6880)}" fill="#e7a66a" fill-opacity=".2" stroke="#b05c33" stroke-dasharray="5 4"/>
<rect x="${X(-370)}" y="${Y(6880)}" width="${X(-170)-X(-370)}" height="${Y(6730)-Y(6880)}" fill="#986844" fill-opacity=".72"/>
<line x1="${X(-200)}" y1="${Y(normalRoof(-200))}" x2="${X(300)}" y2="${Y(normalRoof(300))}" stroke="#253d4a" stroke-width="5"/>
<line x1="${X(-220)}" y1="${Y(normalRoof(-220,75.7))}" x2="${X(300)}" y2="${Y(normalRoof(300,75.7))}" stroke="#5d99a8" stroke-width="4"/>
<line x1="${X(-250)}" y1="${Y(6990)}" x2="${X(0)}" y2="${Y(6990)}" stroke="#b23d2f" stroke-width="5" stroke-dasharray="8 4"/>
<line x1="${X(250)}" y1="${Y(normalRoof(250))}" x2="${X(250)}" y2="${Y(normalRoof(250,75.7))}" stroke="#187e75" stroke-width="4" stroke-dasharray="5 4"/>
<text x="708" y="158" class="tiny">q250/y4000 zinc ${roofEdge.roofward.zincZ.toFixed(2)}</text>
<text x="708" y="177" class="tiny">q250/y4000 breather ${roofEdge.roofward.secondaryZ.toFixed(2)}</text>
<text x="710" y="612" class="micro">hem q−200 / y4450 / +7006.74</text>
<text x="710" y="628" class="micro">drip q−220 / y4470 / +6913.89</text>
<text x="710" y="644" class="micro">gutter q−370..−170 / +6730..6880</text>
<text x="710" y="660" class="micro">sweep q−770..−170 / +6580..6880</text>
<text x="710" y="676" class="micro">+6990 cup misses drip by76.11; intersects gutter</text>
<text x="710" y="704" class="tiny">Roofward two-layer cut needs a roof replan.</text>
<line x1="60" y1="745" x2="1060" y2="745" stroke="#1c3d47"/>
<text x="60" y="770" class="tiny">Source pins: HAD 25faad2c · MAT 0ec54ba2 · MAT edge 731c85d2 (unadopted) · RWT c51b9890 · Genie 1337927GT</text>
</svg>\n`
for (const [name, body] of [['high-eave-service.json', json], ['high-eave-service.svg', svg]]) {
  const path = resolve(dir, name)
  if (process.argv.includes('--check')) {
    if (readFileSync(path, 'utf8') !== body) throw new Error(`${name} drift`)
  } else writeFileSync(path, body)
}
console.log(JSON.stringify({ access:plan.unavoidableInletEnvelopeOverlap, roofEdge, consequence:result.consequence }))
