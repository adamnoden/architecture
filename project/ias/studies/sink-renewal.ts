/** A dated manufacturer drawing located in the conditional cabinet; no installed assembly. */
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex')
const cabinetBytes = readFileSync(new URL('sink-cabinet.json', import.meta.url), 'utf8')
const expectedCabinet = 'f8bf4899cf6acc8ee10b12cd45ea2ae8a65ba2e1e6753281413c83726500a0f4'
if (sha256(cabinetBytes) !== expectedCabinet) throw Error('Reappraise the source cabinet comparison')
const cabinet = JSON.parse(cabinetBytes)
const kitchenBytes = readFileSync(new URL('../../had/studies/kitchen-options.json', import.meta.url), 'utf8')
if (sha256(kitchenBytes) !== cabinet.candidateSha256) throw Error('Reappraise the upstream HAD kitchen candidate')
if (cabinet.adopted !== false || cabinet.module.width !== 800 || cabinet.module.depth !== 600 || cabinet.module.counterTop !== 900 || cabinet.proposal.worktopThickness !== 30) throw Error('Reappraise located comparison identity')

// Printed dimensions, not measurements scaled from the illustration.
const drawing = {
  product: 'LAX 110 50-41 / 122.0250.208',
  title: 'LAX 110 50 (41) SI installing document',
  number: '20166895', revision: 'E', printedDate: '2010-08-13',
  retrieved: '2026-10-30',
  sha256: '9ee9c00defdf564611fe43735f37719c62d6407c0f81622fb826cf1255011fdf',
  status: 'Dated illustration currently linked by the UK product page; current waste-kit identity unverified',
  exampleCounterTop: 900, exampleWorktopThickness: 30, exampleDepth: 600,
  undersideToIllustratedWasteLowerDatum: 234,
  wasteAxisFromCounterBack: 209,
  cutout: { width: 497, depth: 407, positiveTolerance: 2, negativeTolerance: 0, cornerRadius: 48.5, backStrip: 113, frontStrip: 80, backStripStatus: 'Parenthesised reference at nominal depth, not invariant under cutout tolerance' },
  outer: { width: 530, depth: 440 },
}
const m = cabinet.module
const backY = m.y + m.depth
const centreX = m.x + m.width / 2
const c = drawing.cutout
const cutout = { x: centreX - c.width / 2, y: backY - c.backStrip - c.depth, width: c.width, depth: c.depth, cornerRadius: c.cornerRadius }
// Authored registration: centre the outside rectangle on the nominal cutout.
// The drawing does not label this relationship as an installation tolerance.
const outer = {
  x: centreX - drawing.outer.width / 2,
  y: cutout.y + (cutout.depth - drawing.outer.depth) / 2,
  width: drawing.outer.width, depth: drawing.outer.depth,
  registration: 'Authored centring of outer envelope on nominal cutout; not a recovered manufacturer tolerance',
}
const underside = m.counterTop - cabinet.proposal.worktopThickness
const illustratedWasteZ = underside - drawing.undersideToIllustratedWasteLowerDatum
const section = {
  counterTop: m.counterTop, trialWorktopUnderside: underside,
  previousSimplifiedBowlBottom: cabinet.depthCounterexample.trialUndermountBottom,
  illustratedWasteLowerDatum: illustratedWasteZ,
  illustratedWasteDatumStatus: 'Printed ca. 636; approximate illustrated lower extent, not a verified current sealing face or thread datum',
  additionalDepthBelowPreviousBowl: cabinet.depthCounterexample.trialUndermountBottom - illustratedWasteZ,
  trialCabinetBaseTop: cabinet.proposal.baseTop,
  grossIntervalWasteToTrialBase: illustratedWasteZ - cabinet.proposal.baseTop,
  actualCurrentInstalledWasteDatum: null,
  trapAndBranchEnvelope: null, trapReleaseTravel: null,
}
const plan = {
  counterBackY: backY, cutout, outer,
  tolerancePlacement: { adoptedPolicy: null, exampleIfFrontStripHeldAt80AtMaximumDepth: { cutoutDepth: c.depth + c.positiveTolerance, rearStrip: m.depth - c.frontStrip - (c.depth + c.positiveTolerance) } },
  grossOuterFrontStrip: outer.y - m.y,
  grossOuterBackStrip: backY - (outer.y + outer.depth),
  frontShiftFromPreviousCentredOuter: cabinet.grossMargins.steel.frontRearGross - (outer.y - m.y),
  wasteAxis: { x: centreX, y: backY - drawing.wasteAxisFromCounterBack, xStatus: 'Authored centring; y offset is printed on drawing sheet 2' },
}
const removal = {
  maximumPublishedCutout: { width: c.width + c.positiveTolerance, depth: c.depth + c.positiveTolerance },
  levelUnrotatedUpwardTranslation: 'blocked by outer-rim envelope',
  outerExcessBeyondMaximumCutout: { width: outer.width - (c.width + c.positiveTolerance), depth: outer.depth - (c.depth + c.positiveTolerance) },
  grossFrontOpeningBeforeHardware: cabinet.grossFrontOpeningBeforeHingesAndHardware,
  grossOpeningMinusOuterWidth: cabinet.grossFrontOpeningBeforeHingesAndHardware - outer.width,
  proposedDirection: 'Supported lowering below worktop, then front withdrawal after disconnection and clip/seal release',
  actualFrontOpening: null, clipToolEnvelope: null, perimeterSealReleaseAccess: null,
  loweringDistance: null, frontRailObstruction: null, handAndLiftingEnvelope: null,
  provenCompleteRemoval: false,
}
if (c.backStrip + c.depth + c.frontStrip !== m.depth) throw Error('Cutout depth set-out does not close')
if (section.illustratedWasteLowerDatum !== 636 || section.additionalDepthBelowPreviousBowl !== 59 || section.grossIntervalWasteToTrialBase !== 456) throw Error('Section arithmetic changed')
if (plan.grossOuterFrontStrip !== 63.5 || plan.grossOuterBackStrip !== 96.5 || plan.frontShiftFromPreviousCentredOuter !== 16.5) throw Error('Authored outer registration changed')
if (removal.outerExcessBeyondMaximumCutout.width !== 31 || removal.outerExcessBeyondMaximumCutout.depth !== 31 || removal.grossOpeningMinusOuterWidth !== 222) throw Error('Removal comparison changed')

const result = {
  schemaVersion: 1, basis: cabinet.basis, adopted: false,
  sourceCabinet: 'project/ias/studies/sink-cabinet.json', sourceCabinetSha256: expectedCabinet,
  sourceKitchenSha256: cabinet.candidateSha256,
  drawing,
  manual: { number: '993.0715.931', documentId: '20259994', revision: 'V02', printedDate: '2024-10-01', page: 10, sha256: '6a91afbe79f35c6f7237a7fc841ffd31f1573aeac3db6d2da680317f393c04a2', evidence: 'Undermount installation from below with underside fixings and perimeter sealant; not a complete removal-clearance specification' },
  module: m, plan, section, removal,
  acceptance: { actualConnectedFit: 'unknown', completeMaterialAdmission: 'not-established', safeHumanMaintenance: 'not-established', firstWaterAndDrying: 'not-established' },
  scope: 'Located comparison of dated printed dimensions and an authored outer registration. No current waste-kit, trap, appliance-branch or renewal approval.',
}

const out: string[] = []
const add = (v: string) => out.push(v)
const esc = (v: string) => v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const text = (x: number, y: number, v: string, size = 3, colour = '#263d40') => add(`<text x="${x}" y="${y}" font-size="${size}" fill="${colour}">${esc(v)}</text>`)
const line = (x1: number, y1: number, x2: number, y2: number, colour = '#456267', dash = '') => add(`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${colour}" stroke-width=".35"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`)
add('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="DejaVu Sans,sans-serif"><rect width="420" height="297" fill="#fffef8"/><defs><pattern id="unknown" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 3L3 0" stroke="#bdbaad" stroke-width=".2"/></pattern><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="#2f7478" stroke-width=".7"/></marker></defs>')
text(14, 16, 'IAS / Develop sink renewal below the worktop', 5)
text(14, 25, 'Conditional kitchen Option B · dated manufacturer section + authored set-out · no adopted assembly', 3.1)
line(14, 31, 406, 31)
text(14, 42, 'A  PLAN 1:5 / front at bottom', 3.6)
const px = (x: number) => 14 + (x - m.x) / 5
const py = (y: number) => 54 + (backY - y) / 5
add('<rect x="14" y="54" width="160" height="120" fill="#f1ede4" stroke="#456267" stroke-width=".4"/>')
for (const x of [m.x, m.x + m.width - cabinet.proposal.sideThickness]) add(`<rect x="${px(x)}" y="54" width="${cabinet.proposal.sideThickness / 5}" height="120" fill="#bcb296"/>`)
// Previous gross 80/80 position, retained only for comparison.
add(`<rect x="${px(outer.x)}" y="${py(backY - 80)}" width="${outer.width / 5}" height="${outer.depth / 5}" fill="none" stroke="#ad6046" stroke-width=".35" stroke-dasharray="1 1"/>`)
add(`<rect x="${px(outer.x)}" y="${py(outer.y + outer.depth)}" width="${outer.width / 5}" height="${outer.depth / 5}" fill="#cbdddf" fill-opacity=".7" stroke="#2f7478" stroke-width=".45"/>`)
add(`<rect x="${px(cutout.x)}" y="${py(cutout.y + cutout.depth)}" width="${cutout.width / 5}" height="${cutout.depth / 5}" rx="${cutout.cornerRadius / 5}" fill="#fffef8" stroke="#263d40" stroke-width=".5"/>`)
const wx = px(plan.wasteAxis.x), wy = py(plan.wasteAxis.y)
line(wx - 2, wy, wx + 2, wy); line(wx, wy - 2, wx, wy + 2)
text(wx + 4, wy + 1, '209 from back', 2.5)
text(55, 115, 'Cutout 497 × 407', 3.2)
text(55, 123, '+2 / −0 each; R48.5', 2.7)
text(55, 134, 'Outer 530 × 440', 3.1)
text(55, 142, 'centred here by author', 2.7)
text(178, 59, 'Back', 2.7)
text(178, 78, '(113) nominal', 2.6)
text(178, 87, '96.5 outer', 2.6)
text(178, 159, '63.5 outer', 2.6)
text(178, 172, '80 cutout', 2.6)
text(14, 184, 'Nominal 800 module / two 24 side trials / 752 gross opening', 2.7)
text(14, 194, 'Blue outer registration shifts 16.5 toward the front.', 2.8)
text(14, 202, 'Red dash retains the previous 80 / 80 outer position.', 2.8)
text(14, 214, 'UPWARD, LEVEL, SAME ORIENTATION: BLOCKED', 3, '#a1543d')
text(14, 223, '530 × 440 exceeds even the maximum 499 × 409 cutout.', 2.8)
text(14, 231, 'This is not a test of every tilted or rotated path.', 2.8)

text(230, 42, 'B  SECTION 1:5 / back at left', 3.6)
const sx = (backOffset: number) => 235 + backOffset / 5
const sz = (z: number) => 54 + (m.counterTop - z) / 5
// Worktop segments locate the cutout only; no selected worktop or joint.
for (const [x, w] of [[0, c.backStrip], [m.depth - c.frontStrip, c.frontStrip]]) add(`<rect x="${sx(x)}" y="${sz(900)}" width="${w / 5}" height="6" fill="#bcb296" stroke="#456267" stroke-width=".3"/>`)
line(sx(0), sz(870), sx(600), sz(870), '#8e968e', '1 1')
// Simplified bowl box is expressly inherited provenance; no invented trap silhouette.
add(`<path d="M${sx(plan.grossOuterBackStrip)} ${sz(870)}V${sz(695)}H${sx(600 - plan.grossOuterFrontStrip)}V${sz(870)}" fill="none" stroke="#2f7478" stroke-width=".5"/>`)
line(sx(drawing.wasteAxisFromCounterBack), sz(695), sx(drawing.wasteAxisFromCounterBack), sz(illustratedWasteZ), '#ad6046', '1 1')
line(sx(drawing.wasteAxisFromCounterBack) - 5, sz(illustratedWasteZ), sx(drawing.wasteAxisFromCounterBack) + 5, sz(illustratedWasteZ), '#ad6046')
add(`<rect x="235" y="${sz(illustratedWasteZ)}" width="120" height="${section.grossIntervalWasteToTrialBase / 5}" fill="url(#unknown)"/>`)
line(230, sz(180), 360, sz(180)); line(230, sz(0), 360, sz(0))
text(362, sz(900) + 2, '900 top', 2.7)
text(362, sz(870) + 4, '870 underside', 2.7)
text(362, sz(695) + 1, '695 prior bowl', 2.7)
text(362, sz(636) + 2, 'ca.636 drawing', 2.7)
text(362, sz(180) + 2, '180 trial base', 2.7)
text(362, sz(0) + 2, '0 floor', 2.7)
text(249, 126, '456 GROSS / NOT TRAP CAPACITY', 2.8)
text(249, 135, 'Waste kit identity, trap, branch, supports,', 2.55)
text(249, 143, 'hands, tools and release remain unknown.', 2.55)
add('<path d="M335 151V173H365" fill="none" stroke="#2f7478" stroke-width=".6" stroke-dasharray="1.5 1" marker-end="url(#arrow)"/>')
text(249, 184, 'Lower, then front: direction to develop.', 2.8)
text(249, 192, 'Dashed arrow is NOT a swept-volume pass.', 2.7)
text(230, 248, '636 = 900 − 30 − 234; printed as “ca. 636”.', 2.8)
text(230, 256, '59 below the previous bare-bowl trial; no trap is drawn.', 2.7)
text(230, 264, 'Drawing 20166895 rev E / 13.08.2010, sheets 2–3, 5.', 2.7)
text(14, 248, 'Renewal needs support, disconnection, reachable clips', 2.8)
text(14, 256, 'and full perimeter seal release before lowering.', 2.8)
text(14, 264, '752 − 530 = 222 gross; hardware and lifting are unproved.', 2.8)
line(14, 274, 406, 274)
text(14, 282, 'A3 at 100% · Original analytical diagram; not a manufacturer installation drawing. Dimensions in mm.', 2.6)
text(14, 289, 'Source identity, dated/current distinction and remaining duties: project/ias/ias-03-sink-renewal.md · IAS-03 remains planned.', 2.6)
add('</svg>')

for (const [name, content] of [['sink-renewal.json', JSON.stringify(result, null, 2) + '\n'], ['sink-renewal.svg', out.join('\n') + '\n']]) {
  const path = fileURLToPath(new URL(name, import.meta.url))
  if (process.argv.includes('--check')) { if (readFileSync(path, 'utf8') !== content) throw Error(`${name} stale`) }
  else writeFileSync(path, content)
}
console.log(JSON.stringify({ plan, section, removal }, null, 2))
