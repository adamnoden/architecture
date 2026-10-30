/** Catalogue-informed section sensitivity, not a fitted terminal or access approval. */
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {evidence} from './copper-access-geometry.mjs';

const sources = [
  ['project/rwt/studies/north-court-carrier.json', 'e516ebb375a2120a300e05bd869e7edcbb28f2c8'],
  ['project/rwt/studies/copper-access-geometry.mjs', '16fae978af9fdf5cdc0532c92513f11d3e1dedd1'],
  ['project/rwt/passive-court-site-interface.md', '3fb90849c30ad5486dcba783c0b68e1f6d394d42'],
];
for (const [path, expected] of sources) {
  const body = readFileSync(path);
  const blob = createHash('sha1').update(`blob ${body.length}\0`).update(body).digest('hex');
  if (blob !== expected) {
    throw Error(`Reassess changed comparison source: ${path}`);
  }
}
const historical = JSON.parse(readFileSync(sources[0][0], 'utf8'));
const t = historical.trial;
if (historical.run !== 4250 || t.carrierNearCentre !== -420 || t.fall !== 60 ||
    t.bridgeBottom !== -285 || t.exteriorGrade !== -150 || t.requiredReceiverMaximum !== -585 ||
    t.centres.join(',') !== '5800,6200' || t.bridgeClear !== 650 || t.sleeveInside !== 160 ||
    evidence.flange.item !== '89604' || evidence.flange.listedEnvelopeMm[1] !== 220 ||
    evidence.flange.listedEnvelopeMm[2] !== 220) throw Error('Reassess numerical inputs');

const diameter = evidence.flange.listedEnvelopeMm[1], radius = diameter / 2;
const nearAxis = t.carrierNearCentre, farAxis = nearAxis - t.fall;
const grade = t.exteriorGrade, historicalRaise = grade - t.requiredReceiverMaximum;
const farBottom = farAxis - radius, contactRaise = grade - farBottom;
const round = n => Number(n.toFixed(3));
const scenarios = [
  {raise: 435, travel: 0, gap: 0, groundRise: 0},
  {raise: 435, travel: 50, gap: 0, groundRise: 0},
  {raise: 490, travel: 50, gap: 0, groundRise: 0},
  {raise: 550, travel: 50, gap: 50, groundRise: 0},
  {raise: 550, travel: 50, gap: 50, groundRise: 550},
].map(s => ({...s,
  sweptBottomAboveAccessPlane: s.raise + farBottom - s.travel - grade - s.groundRise,
  remainingAfterGap: s.raise + farBottom - s.travel - grade - s.groundRise - s.gap,
  boundary: 'Authored sensitivity with access plane beneath the flange throughout the sweep. Nonnegative result is only nonpenetration of this flange envelope.'
}));
const data = {
  authority: 'Necessary geometric comparisons only. RWT-06 remains planned; no selected route, level, clearance or hydraulic acceptance.',
  startingMain: 'bb8e94adbbbe705b5609ba5d1d0e98727a20a4e1',
  sources: sources.map(([path, blob]) => ({path, blob})),
  catalogue: {...evidence.flange,
    boundary: '220 transverse envelope placed symmetrically about a horizontal historical axis as an explicit comparison. Not the whole terminal. No axial dimension used.'},
  comparisonSlices: {nearY: 7750, farY: 12000, nearAxis, farAxis,
    nearEnvelope: [nearAxis - radius, nearAxis + radius],
    farEnvelope: [farBottom, farAxis + radius],
    undersidePlane: t.bridgeBottom,
    nearUpperGap: t.bridgeBottom - (nearAxis + radius),
    farUpperGap: t.bridgeBottom - (farAxis + radius),
    boundary: 'Interface slices, not installed joint positions. Underside obstructs only where its actual plan footprint overlaps.'},
  raising: {fixedOldGrade: grade, historicalReceiverTarget: t.requiredReceiverMaximum,
    historicalRaise, flangeContactRaise: contactRaise,
    necessaryFlangeRaise: '440 + b + g + s; b=downward travel, g=specified gap, s=access-plane rise above old grade',
    combinedHistoricalComparison: 'max(435 + p, 440 + b + g + s); p=receiving event rise above old grade; old geometry retained',
    actualRequiredTravel: null, actualRequiredGap: null, actualMaximumWater: null,
    projectedUndersideToGradeAtHistoricalRaise: historicalRaise + t.bridgeBottom - grade},
  scenarios,
  outwardSlopeExtensions: [0, 100, 200].map(distance => ({distance,
    assumedAxis: round(farAxis - distance * t.fall / historical.run),
    flangeContactRaise: round(contactRaise + distance * t.fall / historical.run),
    boundary: 'Only if the historical slope continues. Actual terminal position and orientation remain unknown.'})),
  axisShiftSensitivities: [-100, 0, 50].map(shift => ({shift,
    farFlangeContactRaise: contactRaise - shift,
    nearUpperGap: t.bridgeBottom - (nearAxis + shift + radius),
    farUpperGap: t.bridgeBottom - (farAxis + shift + radius),
    boundary: 'Underside fixed relative to FFL. Re-derive all hydraulic/threshold levels; no historical receiving pass transferred.'})),
  lateral: {axisSpacing: t.centres[1] - t.centres[0], group: 400 + diameter,
    withinOldOpeningEachSide: (t.bridgeClear - 400 - diameter) / 2,
    retainOld35EachSide: 400 + diameter + 2 * 35,
    intactFlangeAgainstSleeve: t.sleeveInside - diameter},
  withheld: ['Actual elbow, second flange, bolts, tails, supports and tool swept envelopes',
    'Mating profile, seal release, adequate b and g, temporary water diversion',
    'Support and floor/threshold construction; entry, working position, load and set-down',
    'Receiving and groundwater events, actual access plane, leak outlet and hydraulic capacity',
    'Matched constituents, joints and any owner-approved exceptions']
};

const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;');
let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><style>text{font-family:Arial,sans-serif;font-size:3.1px;fill:#24383e}.title{font-size:6px;font-weight:bold}.sub{font-size:4px;font-weight:bold}.line{fill:none;stroke:#48636c;stroke-width:.4}.plane{fill:none;stroke:#8a8980;stroke-width:.4;stroke-dasharray:2,1}.flange{fill:#e7cbb0;stroke:#95603a;stroke-width:.5}.sweep{fill:none;stroke:#a64d40;stroke-width:.6;stroke-dasharray:2,1}</style>';
const text = (x,y,s,c='') => svg += `<text x="${x}" y="${y}" class="${c}">${esc(s)}</text>`;
const line = (x,y,xx,yy,c='line') => svg += `<path d="M${x},${y}L${xx},${yy}" class="${c}"/>`;
const rect = (x,y,w,h,c) => svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${c}"/>`;
text(12,14,'Raising the house does not yet make a terminal accessible','title');
text(12,23,'30 October 2026 / RWT-06 sensitivity / 220 mm catalogue-informed transverse envelope / not for construction');
text(12,34,'A  Exterior-interface comparison: old fixed grade; vertical scale 1:5','sub');
const z = absolute => 118 - absolute / 5;
for (const [left, raise] of [[15,435],[210,550]]) {
  const centre = raise + farAxis, upper = centre + radius, bottom = centre - radius;
  text(left,44,`House raise ${raise}; downward travel 50 (sensitivity only)`);
  line(left,z(grade),left+174,z(grade)); text(left+74,z(grade)-3,'Fixed old grade / comparison access plane');
  line(left,z(raise+t.bridgeBottom),left+174,z(raise+t.bridgeBottom),'plane');
  text(left+72,z(raise+t.bridgeBottom)-3,'Underside plane only; footprint unproved');
  rect(left+24,z(upper),44,diameter/5,'flange');
  rect(left+24,z(upper-50),44,diameter/5,'sweep');
  line(left+16,z(centre),left+78,z(centre),'plane');
  line(left+68,z(upper),left+82,z(raise+t.bridgeBottom));
  text(left+85,z(upper)-3,'85 initial upper gap: unchanged by raise');
  const gapAfter = raise + farBottom - 50 - grade;
  text(left+75,z(bottom-50)+4,`After travel: ${Math.abs(gapAfter)} ${gapAfter < 0 ? 'below' : 'above'} plane`);
  text(left,raise===435 ? 167 : 160,raise===435 ? 'Initial flange already penetrates plane by 5.' : '60 nominal gap after travel; no complete access pass.');
}
text(12,173,'B  Necessary section bound, not an adopted building height','sub');
text(12,184,'Flange nonpenetration: raise >= 440 + b + g + s');
text(12,193,'b downward release; g specified gap; s access-plane rise. All in millimetres.');
text(12,202,'Combined historical comparison: raise >= max(435 + p, 440 + b + g + s).');
text(12,211,'p is receiving-event rise above old grade; 435 retains the OLD receiver condition only.');
text(12,220,'g = 0 at equality means contact. No required b, g or safe access height is known.');
text(12,229,'A 100 extension along the old slope changes contact raise to 441.412.');
text(12,238,'Raising house AND access plane equally produces no relative gain.');
text(225,173,'C  Constraints that a house raise does not remove','sub');
text(225,184,'Near / far initial upper gaps: 25 / 85.');
text(225,193,'Near and far are historical slices y7750 / y12000.');
text(225,202,'220 intact flange still cannot traverse a 160 bore.');
text(225,211,'Two flanges at 400 centres occupy 620.');
text(225,220,'Old 650 aperture leaves only 15 per side.');
text(225,229,'Retaining 35 side allowances needs 690 before walls.');
text(225,238,'Whole terminal, tools, supports and access remain unknown.');
text(12,254,'One transverse envelope, not axial fitting width. Access plane overlaps the full tested sweep; a real edge requires a different check.');
text(12,263,'Red dash shows the downward component only; away travel is omitted. No full removal path, elbow, second flange or person is drawn.');
text(12,279,'The old 435 raise is rejected as an automatic copper-access solution. Develop the located section and actual release before selection.');
text(12,288,'Sources, pinning, sensitivities and admission limits: raised-terminal-section.md and the companion generated JSON.');
svg += '</svg>\n';
const outputs = [['raised-terminal-section.json', JSON.stringify(data,null,2)+'\n'], ['raised-terminal-section.svg',svg]];
if (process.argv.slice(2).some(arg => arg !== '--check')) throw Error('Only --check is accepted');
for (const [name, body] of outputs) {
  const target = new URL(name, import.meta.url);
  if (process.argv.includes('--check')) {
    if (readFileSync(target,'utf8') !== body) throw Error(`Stale output: ${name}`);
  } else writeFileSync(target,body);
}
console.log(JSON.stringify({historicalRaise, contactRaise, nearUpperGap:data.comparisonSlices.nearUpperGap,
  farUpperGap:data.comparisonSlices.farUpperGap, scenarios},null,2));
