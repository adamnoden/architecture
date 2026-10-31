/** Located leak-route screens. No selected collector, floor, flow or water level. */
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root = new URL('../../../', import.meta.url);
const pins = [
  ['project/rwt/studies/segmented-copper-access.json', '8e1a32d97118faa5697b1f77aaf1a4449a1c5733'],
  ['project/rwt/studies/copper-access-geometry.mjs', '16fae978af9fdf5cdc0532c92513f11d3e1dedd1'],
];
for (const [path, expected] of pins) {
  const bytes = readFileSync(new URL(path, root));
  const actual = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if (actual !== expected) throw Error('Reassess changed comparison source: ' + path);
}
const old = JSON.parse(readFileSync(new URL(pins[0][0], root), 'utf8'));
const {evidence} = await import('./copper-access-geometry.mjs');
const p = old.plan, d = old.depth;
const band = p.courtThreshold.length;
const total = p.gardenThreshold.to - p.courtThreshold.from;
const remainder = p.gardenThreshold.to - p.courtThreshold.to;
const slope = d.retainedFall / total;
const drop = slope * band;
const tube = evidence.flange.tubeSizeMm;
const flange = d.assumedTransverseFlangeEnvelope;
const cover = d.cases[0].cover;
if (band !== 417.5 || total !== 4250 || remainder !== 3832.5 || d.retainedFall !== 60 ||
    tube !== 108 || flange !== 220 || cover !== 50 || d.nominalGroundReserve !== 300 ||
    d.cases[0].insulation !== 0 || d.cases[0].gap !== 0) throw Error('Reassess changed comparison inputs');

const overlap = (flange - tube) / 2;
const axisDepthAt = y => cover + flange / 2 + slope * (y - p.courtThreshold.from);
const completeDepth = (y, k) => axisDepthAt(y) + Math.max(flange / 2, tube / 2 + k);
const cases = [0, 56, 76].map(k => ({
  k,
  extraBelowFlange: Math.max(0, k - overlap),
  roomFaceDepth: completeDepth(p.courtThreshold.to, k),
  exteriorFaceDepth: completeDepth(p.gardenThreshold.to, k),
  roomFaceNominalRemainder: d.nominalGroundReserve - completeDepth(p.courtThreshold.to, k),
  exteriorFaceNominalRemainder: d.nominalGroundReserve - completeDepth(p.gardenThreshold.to, k),
}));
const data = {
  authority: 'Necessary screens for the stated conditional arrangements only. No actual leak collector, joint location, dry access, material or hydraulic acceptance.',
  startingMain: 'adee2d3197fd7af8af06fd5b0668f7acd6c8debd',
  sources: pins.map(([path, blob]) => ({path, blob})),
  plan: {courtFace: p.courtThreshold.from, roomFace: p.courtThreshold.to,
    gardenThreshold: p.gardenThreshold, exteriorFace: p.gardenThreshold.to,
    retainedBand: band, remainingNorthwardPlanRun: remainder, totalPlanRun: total},
  conditionalFall: {overTotalPlanRun: d.retainedFall, slope, acrossCourtBand: drop,
    appliesTo: 'Straight constant-envelope W1 tail only. No fall is selected for the separate leak route.'},
  courtwardReturn: {
    datum: 'z0 is the W1 outside-bottom elevation at the court face; elevations increase upwards.',
    variables: 'a>=0 is minimum vertical separation down to the collector flow line at the room-side low point; f>=0 is further total fall from there to the return outlet.',
    necessaryOutletBound: 'z_out <= z0 - 5.894117647058824 - a - f',
    freeOutletCondition: 'R + delta < z_out <= z0 - d - a - f; R and delta are unselected receiving-water elevation and discharge clearance.',
    returnProfile: 'Court-face flow-line gap must be at least a + d + f; a constant gap below the falling W1 tail does not drain courtwards.',
    lipAtOrAboveZ0: 'Rejected for this continuous no-ponding gravity-return arrangement.',
    limitingDropWithZeroAandF: drop,
    boundary: 'A lower outlet only passes this elevation screen. Receiving backwater, flow, containment and observation remain unproved. No pan elevation is substituted for z0.',
  },
  depth: {
    basis: 'Same centred vertical 108/220 envelope convention as the earlier screen; no exact installed fitting orientation inferred.',
    cover, tube, flange, nominalReserve: d.nominalGroundReserve,
    kMeaning: 'Complete secondary-collector projection below the tube outside-bottom envelope, including its gap/body; not flow-line separation a. k is local to each slice; common probes are not an installed collector profile.',
    lowerExtentFromAxis: 'max(110,54+k)',
    incrementalDepthBeyondFlange: 'max(0,k-56)',
    overlapInEnvelopeOnly: overlap,
    cases,
    boundary: 'Superposed lower extents do not prove parts can coexist. The flange occupies the 56 mm, so it is not spare drain space. These are comparison slices, not joint positions. No flange is placed throughout the retained tail.',
  },
  withheld: ['Actual pan/outlet/tail and separate collector sections and all retained constituents',
    'Actual first service-joint position, axial/tool envelopes, support and movement',
    'Collector slope, flow, complete capture, visible terminal and receiving backwater',
    'Open-bore maintenance diversion, rain isolation and safe surviving escape',
    'Floor support, insulation and independent ground damp/gas boundary',
    'Renewal of the retained tail and its secondary containment'],
};

const n = x => Number(x.toFixed(3));
const esc = x => String(x).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><style>text{font-family:Arial,sans-serif;font-size:3.3px;fill:#223840}.title{font-size:6px;font-weight:700}.sub{font-size:4.4px;font-weight:700}.small{font-size:3px}.pipe{stroke:#9d5932;stroke-width:1.6;fill:none}.leak{stroke:#267e91;stroke-width:.8;stroke-dasharray:2,1;fill:none}.line{stroke:#65757b;stroke-width:.35;fill:none}.band{fill:#e8ecec;stroke:#a2abad;stroke-width:.3}.head{fill:#e8eff1}</style>';
const text = (x,y,s,c='') => svg += `<text x="${x}" y="${y}" class="${c}">${esc(s)}</text>`;
const path = (d,c='line') => svg += `<path d="${d}" class="${c}"/>`;
const rect = (x,y,w,h,c) => svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${c}"/>`;
text(12,14,'A retained tail still needs a complete leak route','title');
text(12,23,'31 October 2026 / RWT-METALS / conditional geometry and maintenance comparison / not for construction');
text(12,35,'A  Located northward alternative: the short tail does not shorten the secondary route','sub');
const x = y => 18 + (y - p.courtThreshold.from) / total * 384;
rect(x(p.courtThreshold.from),45,x(p.courtThreshold.to)-x(p.courtThreshold.from),43,'band');
rect(x(p.gardenThreshold.from),45,x(p.gardenThreshold.to)-x(p.gardenThreshold.from),43,'band');
text(20,42,'Court band'); text(153,42,'Opened family-room territory'); text(365,42,'Garden band');
path(`M18 59 L${x(p.courtThreshold.to)} 62 L402 69`,'pipe');
path(`M18 75 L${x(p.courtThreshold.to)} 78 L402 85`,'leak');
text(75,57,'W1: retained tail to separately released room carrier');
text(97,77,'Separate leak collector: geometry, joints and supports unknown','small');
text(20,96,'417.5'); text(174,96,'3415'); text(366,96,'417.5');
text(12,105,'From room face y8167.5 to exterior face y12000: another 3832.5 mm of plan route.');
text(12,113,'Plan bands are located; vertical separation/fall is schematic. No visible terminal or working assembly is drawn.','small');
text(12,127,'B  A return to the court must descend from the controlling low point','sub');
text(12,138,`Retained W1 fall across the court band: 417.5 x 60 / 4250 = ${n(drop)} mm.`);
text(12,147,'z0: W1 outside bottom at court face. a: separation to collector flow line at room-side low point.');
text(12,156,'f: total further fall to the courtward outlet. Both a and f are nonnegative and unselected.');
text(12,166,'Necessary bound: z_out <= z0 - 5.894 - a - f');
text(12,175,'An outlet lip at or above z0 fails this no-ponding return screen. A lower lip is not a flow/backwater pass.');
text(12,184,'No pan level, historic receiver target, hydraulic head or pump is substituted into this comparison.','small');
text(12,199,'C  A collector and flange share an envelope, not automatically usable space','sub');
text(12,209,'k = complete collector projection below the 108 tube. Lower extent at a 220 joint = max(110,54+k).');
rect(12,215,396,9,'head');
text(16,221,'k, mm'); text(58,221,'Added below flange'); text(155,221,'Room-face depth'); text(260,221,'Exterior-face depth'); text(350,221,'300 reserve');
for (const [i,c] of cases.entries()) {
  const y = 232 + i*9;
  text(16,y,c.k); text(65,y,c.extraBelowFlange); text(160,y,n(c.roomFaceDepth)); text(269,y,n(c.exteriorFaceDepth));
  text(351,y,'Far slice fails');
}
text(12,262,'The 56 mm below the bare tube is occupied by the flange. Superposition is not an interference or access check.','small');
text(12,271,'50 cover / 220 flange / 60 fall. k is local; 0,56,76 are probes, not one installed collector profile.','small');
text(12,280,'A real joint must be accessible beyond the room face. No flange is assumed all along the tail; all other floor duties remain.','small');
text(12,290,'Source, generated values and maintenance limits: retained-tail-leak-route.md / .json / .mjs. W1, court W2 and ground barrier remain distinct.','small');
svg += '</svg>\n';
if (process.argv.slice(2).some(x => x !== '--check')) throw Error('Only --check is supported');
for (const [name, body] of [['retained-tail-leak-route.json', JSON.stringify(data,null,2)+'\n'], ['retained-tail-leak-route.svg', svg]]) {
  const target = new URL(name, import.meta.url);
  if (process.argv.includes('--check')) {
    if (readFileSync(target, 'utf8') !== body) throw Error('Regenerate changed output: ' + name);
  } else writeFileSync(target, body);
}
console.log('Retained-tail leak-route comparison ' + (process.argv.includes('--check') ? 'verified' : 'generated'));
