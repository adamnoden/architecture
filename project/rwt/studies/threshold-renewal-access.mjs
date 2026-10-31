/** Directional threshold renewal: conditional geometry, never an installed assembly. */
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {evidence} from './copper-access-geometry.mjs';

const root = new URL('../../../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const blob = path => {
  const bytes = readFileSync(new URL(path, root));
  return createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
};
const pins = {
  'compiler/reference-house/georgian/source.ts': '1edcfe12392e7b56bf957ffa10a57e21878f3fa0',
  'compiler/reference-house/georgian/facade-source.ts': 'd8e2799fa4e3e168d1ecb43919eb2bb6dd2a0590',
  'compiler/reference-house/georgian/section-exemplar.ts': '75bf5c749da5095c07eed46105817a79095ca418',
  'compiler/reference-house/georgian/layout-revision.ts': 'af955c7da2e2469fd24598f98db6fc942a119ed3',
  'compiler/reference-house/georgian/layout-family.ts': '30ef287f3176e0f4cf2b03ef57c4fdfc915494c9',
  'project/rwt/studies/north-court-carrier.json': 'e516ebb375a2120a300e05bd869e7edcbb28f2c8',
  'project/rwt/studies/copper-access-geometry.mjs': '16fae978af9fdf5cdc0532c92513f11d3e1dedd1',
};
for (const [path, expected] of Object.entries(pins)) {
  assert.equal(blob(path), expected, 'Changed source requires reassessment: ' + path);
}
const source = read('compiler/reference-house/georgian/source.ts');
const revision = read('compiler/reference-house/georgian/layout-revision.ts');
const family = read('compiler/reference-house/georgian/layout-family.ts');
const capture = (text, expression, label) => {
  const match = text.match(expression);
  assert(match, 'Cannot recover guarded source quantity: ' + label);
  return match.slice(1).map(Number);
};
const [shell] = capture(source, /shell:(\d+)/, 'shell');
const [wall] = capture(source, /envelope:([\d.]+)/, 'envelope');
const [ffl, ceiling] = capture(source, /levels:\{ground:([\d.]+),first:[\d.]+,attic:[\d.]+,ceilingGround:([\d.]+)/, 'ground levels');
const [courtX, courtY, courtWidth, courtDepth] = capture(revision,
  /d\.court=\{x:([\d.]+),y:([\d.]+),width:([\d.]+),depth:([\d.]+)\}/, 'court');
const [groundReserve] = capture(family, /groundReserve:([\d.]+)/, 'ground reserve');
assert(revision.includes("op('garden-entry','outer-north',6000,2400"));
assert(revision.includes("op('grand-court-entry-'+side,'court-'+side,6000,2400"));
assert.deepEqual([shell, wall, courtX, courtY, courtWidth, courtDepth, ffl, ceiling, groundReserve],
  [12000, 417.5, 4250, 4250, 3500, 3500, 0, 3100, 300]);
const old = JSON.parse(read('project/rwt/studies/north-court-carrier.json'));
assert.deepEqual(old.trial.centres, [5800, 6200]);
assert.deepEqual([old.run, old.trial.fall, old.trial.sleeveInside, old.trial.endProjection], [4250, 60, 160, 100]);
assert.deepEqual([evidence.flange.item, evidence.flange.tubeSizeMm, evidence.flange.listedEnvelopeMm[1]], ['89604', 108, 220]);

const courtFace = courtY + courtDepth;
const room = {from: courtFace + wall, to: shell - wall};
room.length = room.to - room.from;
const bore = old.trial.sleeveInside, tube = evidence.flange.tubeSizeMm;
const flange = evidence.flange.listedEnvelopeMm[1], radius = tube / 2;
const slope = old.trial.fall / old.run;
const cosine = 1 / Math.sqrt(1 + slope * slope), sine = slope * cosine;
// Square-cut circular tube, with the end faces normal to its inclined axis.
// The complete body extends beyond each axis-end station in Y by r*sin(theta).
const endProjection = radius * sine, verticalRadius = radius * cosine;
const boreNearCentre = (old.carrierRadialBudget.innerCrown + old.carrierRadialBudget.innerBottom) / 2;
const verticalAxisOffset = old.trial.carrierNearCentre - boreNearCentre;
const normalAxisOffset = Math.abs(verticalAxisOffset) * cosine;
const radialMargin = (diameter, offset = normalAxisOffset) => diameter === null ? null : bore / 2 - diameter / 2 - offset;
const zAt = y => old.trial.carrierNearCentre - slope * (y - courtFace);
const nearEqual = (a, b, label) => assert(Math.abs(a - b) < 1e-8, label);

// Only this bare-tube sensitivity transplants the historical 100 mm outstands.
// Both enlarged end assemblies are assumed already gone, with sound exposed ends.
// They are AXIS-end outstands, not complete translating-envelope projections.
const axisOutstand = old.trial.endProjection;
const axisSpan = wall + 2 * axisOutstand;
const completePlanLength = axisSpan + 2 * endProjection;
const axisTipExitTravel = wall + axisOutstand;
const wholeBodyExitTravel = axisTipExitTravel + endProjection;
// One complete projected body length is an explicit finite witness, not a required
// stroke or a selected working allowance. It gives a strictly positive exit gap.
const witnessTravel = completePlanLength;
const afterExitGap = witnessTravel - wholeBodyExitTravel;
const roomReceiptFromExit = axisOutstand + endProjection + witnessTravel;
const projectedTubeInterval = ends => [Math.min(...ends) - endProjection, Math.max(...ends) + endProjection];
const bands = [
  {id: 'court', from: courtFace, to: room.from, exitFace: room.from, direction: 1},
  {id: 'garden', from: room.to, to: shell, exitFace: room.to, direction: -1},
];
const witnesses = bands.map((band, index) => {
  const axisEndsBefore = [band.from - axisOutstand, band.to + axisOutstand];
  const axisEndsAfter = axisEndsBefore.map(y => y + band.direction * witnessTravel);
  const bodyBefore = projectedTubeInterval(axisEndsBefore);
  const bodyAfter = projectedTubeInterval(axisEndsAfter);
  const axisZAfter = axisEndsAfter.map(zAt);
  // Endpoint for a geometric lift witness only: the lowest axis point is +108.
  // This is not an ergonomic handling height, an access allowance or a tool zone.
  const lift = ffl + tube - Math.min(...axisZAfter);
  const liftedZ = [Math.min(...axisZAfter) + lift - verticalRadius, Math.max(...axisZAfter) + lift + verticalRadius];
  assert(bodyAfter[0] > room.from && bodyAfter[1] < room.to);
  assert(liftedZ[0] > ffl && liftedZ[1] < ceiling);
  const axis = old.trial.centres[index];
  const transverseMargin = Math.min(axis - radius - old.bridge.clearFrom, old.bridge.clearTo - axis - radius);
  assert(transverseMargin > 0);
  nearEqual(band.direction * (bodyAfter[band.direction === 1 ? 0 : 1] - band.exitFace), afterExitGap, 'Whole body clears exit face');
  return {
    band, representativeAxis: axis,
    assumedBareTubeAfterBothEndAssembliesRemoved: true,
    initialAxisEndY: axisEndsBefore, initialCompleteBodyY: bodyBefore,
    translation: {dy: band.direction * witnessTravel, dz: -band.direction * slope * witnessTravel,
      planDistance: witnessTravel, actualAlongAxisDistance: witnessTravel / cosine},
    afterTranslationAxisEndY: axisEndsAfter, afterTranslationCompleteBodyY: bodyAfter,
    afterTranslationAxisEndZ: axisZAfter,
    afterTranslationCompleteBodyGapPastBand: afterExitGap,
    laterLift: {dz: lift, endpointLowestAxisZ: ffl + tube, completeBodyZ: liftedZ,
      reason: 'Arbitrary finite emergence witness; not a selected lifting/handling height.'},
    nominalOpenStripTransverseMargin: transverseMargin,
    emptyReceivingPrism: {x: [old.bridge.clearFrom, old.bridge.clearTo], y: [room.from, room.to],
      status: 'Only a conditional obstacle model. No installed openable floor, supports, dry space, staging or human access admitted.'},
  };
});

// The checks are continuous: translation parallel to the bore preserves radial
// distance for every t; interval endpoints vary affinely; vertical lifting follows
// only after the entire body is inside the room-side opening in plan.
assert(radialMargin(tube) > 0);
assert(radialMargin(flange) < 0);
assert.equal(radialMargin(null), null); // removing a backing ring does not reveal a known diameter
nearEqual(wholeBodyExitTravel - axisTipExitTravel, endProjection, 'Tip-only exit misses part of the tube');
assert(afterExitGap > 0 && roomReceiptFromExit < room.length);
const reverseDirectionMustPassRetained220 = radialMargin(flange) < 0;
const fullWitnessLiftBeforeExit = witnesses[0].laterLift.dz;
const fullWitnessLiftBeforeExitMargin = radialMargin(tube, Math.abs(verticalAxisOffset + fullWitnessLiftBeforeExit) * cosine);
assert(fullWitnessLiftBeforeExitMargin < 0);
const leadingEnvelopeOutside = completeTrailingFace => completeTrailingFace !== null && completeTrailingFace >= 0;
assert.equal(leadingEnvelopeOutside(null), false);
assert.equal(leadingEnvelopeOutside(-1), false);
assert.equal(leadingEnvelopeOutside(1), true); // signs only, not working dimensions
const completeReceivingDemand = (completeOutsideProjection, completeInsideProjection, exitGap) =>
  wall + completeOutsideProjection + completeInsideProjection + exitGap;
nearEqual(completeReceivingDemand(axisOutstand + endProjection, axisOutstand + endProjection, afterExitGap), roomReceiptFromExit, 'Complete envelope controls receipt');
assert(completeReceivingDemand(axisOutstand + endProjection, axisOutstand + endProjection + room.length, afterExitGap) > room.length);

const data = {
  authority: 'Conditional threshold-only renewal geometry. No selected installation, safe access, dry bay or hydraulic result.',
  startingMain: '6c3c7c6d4c5fabd1112b13b86d309edfa1db4df3',
  sources: Object.entries(pins).map(([path, expected]) => ({path, blob: expected})),
  boundaryAuthorities: ['project/rwt/segmented-copper-access.md', 'project/rwt/copper-access-first-result.md',
    'project/rwt/raised-terminal-section.md', 'project/rwt/rwt-06-access-court-transition.md',
    'project/had/had-03-court-levels.md', 'project/had/had-03-court-threshold-first-failure.md',
    'docs/reference-house/ground-water-policy.md'],
  house: {sourceId: 'RH-LAYOUT-REVISION-02', shell, wall, court: {x: courtX, y: courtY, width: courtWidth, depth: courtDepth},
    room, bands, doorAperturesX: [4800, 7200], ffl, ceiling, nominalGroundReserve: groundReserve},
  conditionalEnvelopes: {bareTubeOutsideDiameter: tube, historicalBoreDiameter: bore, intactFlangeTransverse: flange,
    historicalVerticalAxisOffset: verticalAxisOffset, normalAxisOffset, bareTubeNormalMarginBeforeSupports: radialMargin(tube),
    intactFlangeNormalMargin: radialMargin(flange), residualAfterRingRemoval: null,
    assumptions: 'Straight parallel circular bore/tube; square-cut ends; no skid, seal, burr, deflection, debris or tool intrusion.'},
  directionResult: {
    intactTrailingFlange: 'Rejected: it must traverse the band and exceeds the bore.',
    unknownTrailingResidual: 'Undetermined: ring or joint removal does not establish a bare108 end.',
    leadingEnlargement: 'Need not traverse the bore if its COMPLETE envelope is initially room-side and movement is away from the band.',
    leadingEnlargementFullAxialEnvelope: null,
    leadingEnlargementPhysicalRemovalPath: null,
    reverseDirectionMustPassRetained220,
    receivedPartMustIncludeAllEndProjections: true,
  },
  parametricReceipt: {
    coordinate: 'u increases toward the room; band occupies[-417.5,0]; exit plane is vertical.',
    variables: 'a and b are COMPLETE translating-body projections beyond the outside/room band faces; g is positive post-exit gap.',
    initialInterval: '[-417.5-a,b]', translatedInterval: '[-417.5-a+t,b+t]',
    wholeBodyFirstExitContact: 't=417.5+a', postExitTravel: 't=417.5+a+g',
    completeReceiptLength: '417.5+a+b+g <=3415, before additional structure, tools or handling.',
    actualA: null, actualB: null, actualG: null,
  },
  bareTubeSensitivity: {
    source: 'Historical100 mm endProjection transplanted to EACH short crossing as an axis-end sensitivity, not a selected allowance.',
    historicalAxisEndOutstandEach: axisOutstand, axisEndPlanSpan: axisSpan, actualTubeAxisLength: axisSpan / cosine,
    slope, angleDegrees: Math.atan(slope) * 180 / Math.PI,
    squareEndPlanProjectionEach: endProjection, completeProjectedBodyLength: completePlanLength,
    firstAxisTipExitTravel: axisTipExitTravel, firstWholeBodyExitTravel: wholeBodyExitTravel,
    firstWholeBodyExitIsContactNotWorkingClearance: true,
    witnessPlanTravel: witnessTravel, witnessPostExitGap: afterExitGap,
    grossRoomReceiptDemand: roomReceiptFromExit, grossRoomRemainder: room.length - roomReceiptFromExit,
    witnesses,
    closedFormProof: ['Aligned axial translation preserves radial clearance at every intermediate position.',
      'Leading body endpoint is monotone; its furthest position remains in the conditional open room strip.',
      'After full exit, fixed-orientation vertical lift keeps the complete body plan inside that strip.'],
  },
  falsification: {
    intactTrailing220Rejected: true, unknownResidualNeverReplacedBy108: true,
    axisTipOnlyExitLeavesBodyInBand: endProjection,
    fullWitnessLiftBeforeExitRejected: true, fullWitnessLiftBeforeExitNormalMargin: fullWitnessLiftBeforeExitMargin,
    smallWithinBoreMovementNotCategoricallyRejected: true,
    leadingCentreOutsideIsInsufficientWithoutWholeEnvelope: true,
    excessiveCompleteProjectionRejectedByRoomLength: true,
  },
  upstreamPrerequisites: ['Contributing rain independently diverted and conveyed water released.',
    'Both end connections actually free; residual complete translating envelope identified.',
    'Room carrier/modules and obstructions removed by their own demonstrated sequence first.',
    'Temporary and retained supports permit the full axial and vertical path.',
    'Fixed W2 and threshold protection remain intact without the removed tube, cut end or a pump-dependent well.',
    'Both end work zones permit the actual release/cutting and subsequent joining/inspection.',
    'Covers, floor structure, seals and thermal continuity can be restored and checked.'],
  acceptance: {geometricWitnessOnly: true, actualEndAssembliesRemoved: null, actualTrailingResidual: null,
    actualRetainedW2Architecture: null, completeThresholdRenewal: null, cutterAndReinstatementAccess: null,
    actualReceivingFloorAndSupport: null, dryMaintenanceCondition: null, humanHandlingAndSetDown: null,
    reducedExteriorAccessReservation: null, materialAdmission: null, hydraulicAcceptance: null},
};

const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const fmt = n => Number(n.toFixed(1)).toFixed(1);
const svg = [];
const add = s => svg.push(s);
const text = (x, y, s, cls = '') => add('<text x="' + x + '" y="' + y + '" class="' + cls + '">' + esc(s) + '</text>');
const rect = (x, y, w, h, cls) => add('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" class="' + cls + '"/>');
const line = (x, y, xx, yy, cls = 'line') => add('<path d="M' + x + ',' + y + 'L' + xx + ',' + yy + '" class="' + cls + '"/>');
add('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="#fffdf8"/><style>text{font-family:Arial,sans-serif;font-size:3.05px;fill:#243d43}.title{font-size:5.8px;font-weight:bold}.sub{font-size:4px;font-weight:bold}.small{font-size:2.7px}.band{fill:#d9dfdf;stroke:#64787b;stroke-width:.3}.open{fill:#edf4ef;stroke:#4d826b;stroke-width:.35;stroke-dasharray:1.5,1}.start{fill:none;stroke:#89705c;stroke-width:.4;stroke-dasharray:1.2,.7}.body{fill:#75a58c;stroke:#386e57;stroke-width:.35}.axis{fill:none;stroke:#8a9da0;stroke-width:.25}.line{fill:none;stroke:#526d74;stroke-width:.35}.move{fill:none;stroke:#386e57;stroke-width:.55;marker-end:url(#arrow)}.bad{fill:none;stroke:#b15c43;stroke-width:.45}.fitting{fill:#d4a07c;stroke:#8e5c39;stroke-width:.3}</style><defs><marker id="arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0L5,2.5L0,5Z" fill="#386e57"/></marker></defs>');
text(12,14,'Threshold renewal: pull toward the open room, then lift','title');
text(12,23,'31 October 2026 / all dimensions mm / conditional body-motion comparison, not an installed renewal method');
text(12,35,'A  Two bands; two roomward directions','sub');
text(12,43,'Plan 1:25. One coupon at a time; both end assemblies removed.','small');
const px = y => 20 + (y - courtFace) / 25;
const py = x => 49 + (x - 4800) / 25;
for (const b of bands) rect(px(b.from),py(4800),wall/25,2400/25,'band');
rect(px(room.from),py(old.bridge.clearFrom),room.length/25,old.trial.bridgeClear/25,'open');
for (const x of old.trial.centres) line(px(courtFace-150),py(x),px(shell+150),py(x),'axis');
for (const w of witnesses) {
  const x = w.representativeAxis;
  rect(px(w.initialCompleteBodyY[0]),py(x-radius),(w.initialCompleteBodyY[1]-w.initialCompleteBodyY[0])/25,tube/25,'start');
  rect(px(w.afterTranslationCompleteBodyY[0]),py(x-radius),completePlanLength/25,tube/25,'body');
  const initialMid = (w.initialCompleteBodyY[0]+w.initialCompleteBodyY[1])/2;
  line(px(initialMid),py(x)-7,px(initialMid+w.translation.dy),py(x)-7,'move');
}
text(18,151,'Court band 417.5','small'); text(91,151,'Room 3415','small'); text(161,151,'Garden band 417.5','small');
text(12,160,'North / +Y →. Door apertures x4800–7200; axes x5800/6200.','small');
text(12,168,'Dashed old 650 strip: conditional receiving opening, not an existing hatch.','small');
text(12,176,'Brown: initial complete body. Green: after finite axial translation.','small');
text(12,184,'Court draw goes north/down; garden draw goes south/up.','small');

text(226,35,'B  Which end must pass the bore?','sub');
text(226,43,'Mechanism only; fitting axial sizes and end zones are unknown.','small');
rect(287,53,42,20,'band'); rect(287,60,42,6,'open');
line(254,63,373,63,'line'); rect(270,54,3,18,'fitting'); rect(353,54,3,18,'fitting');
line(335,49,366,49,'move'); text(226,82,'Trailing 220 must cross 160: rejected.','small');
rect(287,94,42,20,'band'); rect(287,101,42,6,'open');
line(274,104,373,104,'line'); rect(353,95,3,18,'fitting');
line(335,90,366,90,'move'); text(226,123,'Leading 220 wholly outside may move away from the band.','small');
text(226,131,'Its complete extent and removal space remain unknown.','small');
text(226,139,'Removing a ring is not evidence that the trailing end is 108.','small');
text(226,151,'Numerical witness A uses a BARE 108 coupon, not this fitting.','small');
text(226,159,'Cutting/releasing both ends is a prerequisite, not simulated.','small');
text(226,171,'Fixed W2 must remain independent of the removed piece.','small');
text(226,179,'Calling an unrenewable service part “permanent” does not solve it.','small');

text(12,198,'C  Historical 100 outstands: an explicit sensitivity','sub');
text(12,208,'Axis-end span 617.5; complete inclined body ' + fmt(completePlanLength) + '.','small');
text(12,216,'First whole-body exit ' + fmt(wholeBodyExitTravel) + ': contact, not working clearance.','small');
text(12,224,'Tip-only exit 517.5 leaves ' + endProjection.toFixed(3) + ' of body in the band.','small');
text(12,232,'Finite witness: draw ' + fmt(witnessTravel) + '; vertical change ' + fmt(slope*witnessTravel) + ' down/up.','small');
text(12,240,'Only after full exit, lift through the conditional open strip.','small');
text(12,248,'100 outstands and this chosen stroke are NOT selected allowances.','small');
text(226,198,'D  What the geometric witness leaves open','sub');
text(226,208,'Complete projections a/b and exit gap g must be actual inputs.','small');
text(226,216,'Room receipt: 417.5 + a + b + g ≤3415, before handling duties.','small');
text(226,224,'No installed support/skid/seal, tool or occupied-room fit is shown.','small');
text(226,232,'Both ends must be free; room modules must be removable first.','small');
text(226,240,'Rain diversion, fixed W2, dry access and reinstatement stay open.','small');
text(226,248,'No reduced exterior work area or hydraulic acceptance follows.','small');
text(12,266,'The continuous path is proved only for the stated bare body and empty receiving volume. No floor or threshold is redesigned.');
text(12,276,'Source: current house geometry + historical north comparison + RWT-METALS catalogue envelopes. RWT-06 remains incomplete.','small');
text(12,286,'Numerical precision is for reproducibility; it is not measured tolerance or evidence of physical maintenance clearance.','small');
add('</svg>');
const outputs = new Map([['threshold-renewal-access.json', JSON.stringify(data,null,2)+'\n'],
  ['threshold-renewal-access.svg', svg.join('\n')+'\n']]);
assert(process.argv.slice(2).every(arg => arg === '--check'), 'Only --check is supported');
for (const [name, content] of outputs) {
  const path = new URL(name, import.meta.url);
  if (process.argv.includes('--check')) assert.equal(readFileSync(path,'utf8'),content,'Regenerate '+name);
  else writeFileSync(path,content);
}
console.log(JSON.stringify({check:process.argv.includes('--check'),completePlanLength,wholeBodyExitTravel,
  witnessTravel,roomReceiptFromExit,normalMargin:radialMargin(tube),witnesses:witnesses.map(w=>({band:w.band.id,
    translation:w.translation,completeBodyY:w.afterTranslationCompleteBodyY,lift:w.laterLift})),acceptance:data.acceptance},null,2));
