import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const dir = dirname(fileURLToPath(import.meta.url))
const root = resolve(dir, '../../..')
const sources = {
  had: ['project/had/studies/open-north-loggia.json', '25faad2c4d40df2b7da7212f73808843a88d2f52'],
  mat: ['project/mat/studies/loggia-envelope-section.json', '0ec54ba2420b9337ce81b1867eef4c83d661e69b'],
  renewal: ['project/rwt/studies/temporary-renewal-route.json', 'c51b98904ec9b85608857ddc88d21768bfe75504']
}
const input = Object.fromEntries(Object.entries(sources).map(([key, [path, sha]]) => {
  const actual = execFileSync('git', ['hash-object', path], { cwd: root, encoding: 'utf8' }).trim()
  if (actual !== sha) throw new Error(`Source drift ${key}: ${actual} != ${sha}`)
  return [key, JSON.parse(readFileSync(resolve(root, path), 'utf8'))]
}))
const { had, mat } = input
if (had.roofDevelopment.eavesDatum !== 7100 || mat.outdoor.courtWalking.join() !== '0,-30,-110'
  || mat.portal.finishedSpan !== 2400 || mat.portal.finishedSpringAtVerticalJamb < 2126
  || had.outdoorWaterTerritories.normalGross[0] !== 4825) {
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
  proposedIndependentServiceLanes: [{ x: 4550, downrouteY: 7000, normal: true }, { x: 7450, downrouteY: 7500, normal: false }],
  courtInlet: inlet,
  relief: { x0: 5300, x1: 7100, y0: 7750, y1: 12000 }
}
const section = {
  eaveDatum: had.roofDevelopment.eavesDatum,
  physicalOuterEdge: 7006.74,
  overhang: had.roofDevelopment.overhang,
  portalJambSpring: mat.portal.finishedSpringAtVerticalJamb,
  portalTieUnderside: mat.portal.tie.underside,
  southMouthFloor: mat.outdoor.courtWalking[2],
  terraceFloor: mat.outdoor.gardenTerrace,
  machineTopAtSouthMouth: mat.outdoor.courtWalking[2] + machine.stowed[2],
  nominalJambMarginAtSouthMouth: mat.portal.finishedSpringAtVerticalJamb - (mat.outdoor.courtWalking[2] + machine.stowed[2]),
  minPlatformHeightFromSouthMouthToEaveDatum: had.roofDevelopment.eavesDatum - mat.outdoor.courtWalking[2],
  platformHeightHeadroomToDatum: machine.maxPlatformHeight - (had.roofDevelopment.eavesDatum - mat.outdoor.courtWalking[2]),
  floorAtInletSouth: -94,
  floorAtCourtSouth: -110,
  southCourtDoorPanJoin: -30
}
const temporary = {
  roofIntercept: { x: 5900, y: 4250, trialInvert: 6990, physicalHem: section.physicalOuterEdge },
  westBranch: { fromX: 5900, toX: 4550, slope: .01, atSouthEdgeInvert: 6976.5, atY7000Invert: 6949, dropOutletInvert: -70,
    transfer: { toX: 5000, toInvert: -74.5, floor: -80, intakeBottomApprox: -206.25 }, destination: 'existing normal inlet, Cu250 and N/W receiver' },
  highCrossfall: { fromX: 5900, toX: 7450, slope: .01, endInvert: 6990 - (7450 - 5900) * .01 },
  highEastRun: { fromY: 4250, toY: 7500, slope: .01, endInvert: 6990 - (7450 - 5900 + 7500 - 4250) * .01 },
  dropAt: { x: 7450, y: 7500, outletInvert: -96 },
  transferAtCourt: { fromX: 7450, toX: 7100, fromInvert: -96, toInvert: -99.5, floor: -100 },
  destination: 'east branch to existing x5300–7100 broad surface, separate E chute and E receiver; west branch to live normal/N-W; neither feeds the receiver under repair',
  source: 'trial coordinates and inverts added for adverse comparison; not present in HAD/MAT'
}
const result = {
  identity: 'RWT-06 high-eave service section, bounded geometric comparison 2026-11-02',
  sourceBlobs: Object.fromEntries(Object.entries(sources).map(([k, [p, s]]) => [k, { path: p, sha: s }])),
  manufacturerSource: 'https://manuals.genielift.com/operators/english/1337927.pdf',
  court, machine, plan, section, event, temporary,
  consequence: 'AWP envelope cannot avoid the y7000–7350 inlet; zero allowance for four actual pads, jacks, transfer, levelling or receiver load. Proposed upper diversion is a source change needing an independently supported/watertight capture and complete event demonstration.'
}
if (plan.unavoidableInletEnvelopeOverlap.join() !== '50,250' || section.nominalJambMarginAtSouthMouth < 250
  || temporary.transferAtCourt.toInvert < temporary.transferAtCourt.floor
  || temporary.westBranch.transfer.toInvert < temporary.westBranch.transfer.floor
  || temporary.roofIntercept.trialInvert >= section.physicalOuterEdge) {
  throw new Error('Geometric adverse controls changed')
}
const json = JSON.stringify(result, null, 2) + '\n'
const sx = x => 85 + (x - court.x0) * .17
const sy = y => 90 + (y - court.y0) * .17
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1123" height="794" viewBox="0 0 1123 794">
<rect width="1123" height="794" fill="#f5f1e7"/><style>text{font-family:Arial,sans-serif;fill:#132d35} .tiny{font-size:13px}.small{font-size:16px}.head{font-size:25px;font-weight:bold}.lab{font-size:18px;font-weight:bold}</style>
<text x="60" y="48" class="head">RWT-06 / +7100 court-eave service comparison</text>
<text x="60" y="72" class="tiny">Selected compact B + Genie CE outdoor configuration · geometry and conditional route, not an installed method</text>
<text x="85" y="113" class="lab">Plan / south court eave at y4250</text>
<rect x="${sx(court.x0)}" y="${sy(court.y0)+45}" width="${court.x1===7750?595:0}" height="595" fill="#e8e3d5" stroke="#1c3d47" stroke-width="3"/>
<rect x="${sx(4500)}" y="${sy(4600)+45}" width="510" height="476" fill="#7ab4bd" fill-opacity=".26" stroke="#155f68" stroke-width="3" stroke-dasharray="10 6"/>
<rect x="${sx(4250)}" y="${sy(7000)+45}" width="595" height="59.5" fill="#e8945d" fill-opacity=".75"/>
<line x1="${sx(7450)}" y1="${sy(4250)+45}" x2="${sx(7450)}" y2="${sy(7500)+45}" stroke="#ae4526" stroke-width="8"/>
<line x1="${sx(4550)}" y1="${sy(4250)+45}" x2="${sx(4550)}" y2="${sy(7000)+45}" stroke="#ae4526" stroke-width="8"/>
<line x1="${sx(4550)}" y1="${sy(7000)+45}" x2="${sx(5000)}" y2="${sy(7000)+45}" stroke="#ae4526" stroke-width="7"/>
<line x1="${sx(7450)}" y1="${sy(7500)+45}" x2="${sx(7100)}" y2="${sy(7500)+45}" stroke="#ae4526" stroke-width="8"/>
<line x1="${sx(5900)}" y1="${sy(4250)+45}" x2="${sx(7450)}" y2="${sy(4250)+45}" stroke="#ae4526" stroke-width="6"/>
<line x1="${sx(5900)}" y1="${sy(4250)+45}" x2="${sx(4550)}" y2="${sy(4250)+45}" stroke="#ae4526" stroke-width="6"/>
<text x="95" y="160" class="small">court 3500 ×3500</text><text x="160" y="265" class="small">AWP empty-court envelope 3000 ×2800</text>
<text x="105" y="555" class="small">Full-width inlet y7000–7350</text><text x="110" y="580" class="small">AWP envelope crosses 350 mm in the old centred trial</text>
<text x="95" y="680" class="tiny">Even y4250-start and 2800-depth overlap inlet by 50 mm.</text>
<text x="95" y="700" class="tiny">Pad positions and support bridge are not supplied by the manual.</text>
<text x="710" y="120" class="lab">South eave / longitudinal section</text>
<line x1="765" y1="190" x2="1070" y2="190" stroke="#374d53" stroke-width="8"/>
<text x="720" y="176" class="small">eave datum +7100 / hem +7006.74</text>
<line x1="765" y1="370" x2="1070" y2="370" stroke="#65909b" stroke-width="5"/><text x="735" y="400" class="small">proposed raised capture, independent support</text>
<line x1="765" y1="490" x2="1070" y2="510" stroke="#445960" stroke-width="7"/><text x="748" y="542" class="small">court 0 →−30 →−110</text>
<text x="715" y="583" class="small">lowered height 1980; jamb spring +2126.54</text>
<text x="715" y="608" class="small">south-mouth nominal head margin ${section.nominalJambMarginAtSouthMouth.toFixed(2)} mm</text>
<text x="715" y="650" class="small">receiver renewal: separate scaffold/hoist</text>
<text x="715" y="675" class="small">roof capture → west / east branches</text>
<text x="715" y="700" class="small">→ normal N/W / broad E; each full duty</text>
<line x1="60" y1="745" x2="1060" y2="745" stroke="#1c3d47"/>
<text x="60" y="770" class="tiny">Source pins: HAD 25faad2c · MAT 0ec54ba2 · renewal c51b9890 · Genie 1337927GT August 2026</text>
</svg>\n`
for (const [name, body] of [['high-eave-service.json', json], ['high-eave-service.svg', svg]]) {
  const path = resolve(dir, name)
  if (process.argv.includes('--check')) {
    if (readFileSync(path, 'utf8') !== body) throw new Error(`${name} drift`)
  } else writeFileSync(path, body)
}
console.log(JSON.stringify({ court, preInletDepth, overlap: plan.unavoidableInletEnvelopeOverlap, headMargin: section.nominalJambMarginAtSouthMouth, temporary }))
