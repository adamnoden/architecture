/** Source-bound construction comparison. No adopted receiver size or hydraulic model. */
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

/** Necessary longitudinal coverage, not contact, friction or structural capacity.
 * Installation error changes the actual copper gauge. Both footprint endpoints
 * expand, while the support is expressly stationary. The expression is
 * multi-affine in temperature, placement and endpoint, so its extrema occur at
 * corners; a seam crossing the datum need not have its lower extreme at cold.
 */
export function seamCoverage({gauge, footprint, placement, seatWidth, alpha,
  installed, cold, hot, seatShift = [0, 0]}) {
  if (![gauge, footprint, placement, seatWidth, alpha, installed, cold, hot,
    ...seatShift].every(Number.isFinite) || footprint <= 0 || seatWidth <= 0 ||
    placement < 0 || alpha < 0 || cold > installed || hot < installed ||
    seatShift.length !== 2 || seatShift[0] > seatShift[1] ||
    1 + alpha * (cold - installed) <= 0) throw Error('Invalid coverage inputs');
  const corners = [];
  for (const temperature of [cold, hot]) for (const error of [-placement, placement])
    for (const endpoint of [-footprint / 2, footprint / 2]) for (const shift of seatShift) {
      const relative = (gauge + error + endpoint) *
        (1 + alpha * (temperature - installed)) - gauge - shift;
      corners.push({temperature, installationError: error, endpoint, seatShift: shift, relative});
    }
  const minimum = corners.reduce((a, b) => a.relative < b.relative ? a : b);
  const maximum = corners.reduce((a, b) => a.relative > b.relative ? a : b);
  const leftMargin = minimum.relative + seatWidth / 2;
  const rightMargin = seatWidth / 2 - maximum.relative;
  return {centreMotion: [alpha * gauge * (cold - installed), alpha * gauge * (hot - installed)],
    interval: [minimum.relative, maximum.relative], extremes: {minimum, maximum},
    leftMargin, rightMargin, minimumMargin: Math.min(leftMargin, rightMargin),
    strictlyCovered: leftMargin > 0 && rightMargin > 0};
}

/** A local dry-side cap screen after its nut has been removed.
 * Hole/stud intervals are diameters of authored coaxial cylinders. The cap has
 * no out-of-plane obstruction. The two section solids lie either side of the
 * through-hole. The straight axial
 * lift keeps that hole over the retained stud, then clears its top before any
 * lateral withdrawal. No tool, nut-turning, force or complete liner lift pass.
 */
export function capRelease({hole, stud, capBottom, capTop, studTop, lift}) {
  if (![...hole, ...stud, capBottom, capTop, studTop, lift].every(Number.isFinite) ||
    hole.length !== 2 || stud.length !== 2 || hole[0] >= hole[1] || stud[0] >= stud[1] ||
    capBottom >= capTop || lift < 0) throw Error('Invalid cap inputs');
  const holeMargins = [stud[0] - hole[0], hole[1] - stud[1]];
  const finalStudClearance = capBottom + lift - studTop;
  return {holeMargins, finalStudClearance,
    canTranslateAfterLift: Math.min(...holeMargins) > 0 && finalStudClearance > 0,
    liftedCapHeight: [capBottom + lift, capTop + lift]};
}

export function rectanglesOverlap(a, b) {
  return a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
}

export function tailApertureMargin({opening, carriedWidth, lateralOffset = 0}) {
  if (![opening, carriedWidth, lateralOffset].every(Number.isFinite) || opening <= 0 || carriedWidth <= 0)
    throw Error('Invalid terminal envelopes');
  return (opening - carriedWidth) / 2 - Math.abs(lateralOffset);
}

/** Linear bending sensitivity for a 1 mm wide, simply supported flat strip.
 * Span is between ideal reaction lines, not an adopted clear inspection gap.
 * Pressure is fixed on the original horizontal projection. One end is free
 * in-plane; no membrane, two-way plate, formed-sidewall or continuity credit.
 * This is not a strength check, actual deflected water profile or collapse model.
 */
export function flatStripResponse({thicknessMm, spanMm, waterDepthMm,
  debrisKPa = 0, modulusMPa = 118000, copperDensityKgM3 = 8900}) {
  if (![thicknessMm, spanMm, waterDepthMm, debrisKPa, modulusMPa,
    copperDensityKgM3].every(Number.isFinite) || thicknessMm <= 0 || spanMm <= 0 ||
    waterDepthMm < 0 || debrisKPa < 0 || modulusMPa <= 0 || copperDensityKgM3 <= 0)
    throw Error('Invalid flat-strip inputs');
  const gravity = 9.81, unitWidthMm = 1;
  const waterPressureKPa = 1000 * gravity * waterDepthMm / 1e6;
  const selfWeightPressureKPa = copperDensityKgM3 * gravity * thicknessMm / 1e6;
  const totalPressureKPa = waterPressureKPa + debrisKPa + selfWeightPressureKPa;
  const lineLoadNPerMm = totalPressureKPa / 1000 * unitWidthMm;
  const inertiaMm4 = unitWidthMm * thicknessMm ** 3 / 12;
  const momentNmm = lineLoadNPerMm * spanMm ** 2 / 8;
  const linearDeflectionMm = 5 * lineLoadNPerMm * spanMm ** 4 /
    (384 * modulusMPa * inertiaMm4);
  const linearEndSlopeRad = lineLoadNPerMm * spanMm ** 3 /
    (24 * modulusMPa * inertiaMm4);
  return {thicknessMm, spanBetweenIdealReactionLinesMm: spanMm, waterDepthMm,
    debrisKPa, modulusMPa, copperDensityKgM3, gravityMPerS2: gravity, unitWidthMm,
    copperMassKgPerM2: copperDensityKgM3 * thicknessMm / 1000,
    waterPressureKPa, selfWeightPressureKPa, totalPressureKPa,
    lineLoadNPerMm, inertiaMm4,
    reactionEachKNPerM: totalPressureKPa * spanMm / 2000,
    momentKNmPerM: momentNmm / 1000,
    nominalBendingStressMPa: 6 * momentNmm / (unitWidthMm * thicknessMm ** 2),
    linearDeflectionMm, linearEndSlopeRad,
    deflectionOverSpan: linearDeflectionMm / spanMm,
    deflectionOverThickness: linearDeflectionMm / thicknessMm};
}

const thermal = {gauge: 2000, footprint: 40, placement: 2, seatWidth: 50,
  alpha: 17e-6, installed: 20, cold: -10, hot: 70};
const keeper = {hole: [36, 44], stud: [37, 43], capBottom: 5, capTop: 9, studTop: 20, lift: 16};
const localConstruction = {
  startingMain: '899a6d32d5c7b37a6d3f5c544c90d5f4204e1c7b',
  authority: 'Authored local seam-support and dry-edge keeper comparison; not an installed bearing or whole-body release result.',
  location: 'Outer-west R1 wet body; local longitudinal coordinate s measured from a separately supported dry-side terminal-station datum. No global seam station, body length or capture width selected.',
  construction: {
    seam: 'Develop a mechanically locked and soldered copper cross-seam; its sheet-to-sheet continuity does not anchor it to the substrate.',
    support: '40 mm installation-temperature support-demand footprint is an authored screen, not a recovered folded/riveted underside. Profiled contact, support of adjacent sheet, capacity and friction remain unresolved.',
    fixedDatum: 'A separately supported, releasable dry-side restraint at s=0; the soldered outlet seam is not the anchorage or lifting connection.',
    keepers: 'Removable dry-side top caps retain an authored folded-edge envelope without through-fixing the wet liner. Along-run sliding, vertical capture and eventual cap removal are different actions.',
    terminal: 'Retain an open receiving transition as the distinct R1 development case. It is not a qualified capture or free-discharge result. A rigid connection at another station changes the restraint system.',
    transverse: 'Cross-width movement, actual folded edge, contacts, restraint and uplift loads are not resolved by this longitudinal comparison.',
  },
  inputs: {
    thermal,
    attribution: 'Only alpha is from the Aurubis architectural comparison (printed p81). Gauge, footprint, temperatures, positioning and seat are authored. The installation error changes the gauge and the footprint also expands.',
    supportMotion: 'Stationary seat and fixed datum. Actual frame temperature, expansion, settlement and deflection require a relative-motion model.',
  },
  longitudinalCoverage: seamCoverage(thermal),
  adverse: {
    narrow46Seat: seamCoverage({...thermal, seatWidth: 46}),
    supportMovesPositive2: seamCoverage({...thermal, seatShift: [2, 2]}),
    secondRigidAnchor: {
      stationMm: 300,
      freeCopperMotionMm: [thermal.alpha * 300 * (thermal.cold - thermal.installed),
        thermal.alpha * 300 * (thermal.hot - thermal.installed)],
      consequence: 'A separately rigid terminal at s=300 cannot share the zero-displacement assumption at s=0. Restraint stress, compliant connection or changed fixed zone requires design; no failure capacity is calculated.',
    },
  },
  fixedAtSeamAlternative: {
    localCoverage: seamCoverage({...thermal, gauge: 0}),
    consequence: 'Greater local coverage does not make this the preferred restraint: the terminal would now move relative to its receiver or pipe. Keep the original terminal-station datum until that different connection is designed.',
  },
  dryEdgeKeeper: {
    inputs: keeper,
    authoredSection: {edge: [0, 0, 20, 3], cap: [-5, 5, 50, 9],
      capHole: [36, 44], stud: [37, -4, 43, 20], nutEnvelopeBeforeRemoval: [34, 9, 46, 15],
      capAlongRunWidth: 30, holeAndStud: 'Coaxial cylindrical 8 mm hole and 6 mm stud, centre v=40/s=0; no thread or fastener capacity inferred.',
      retainedSupportStartsAt: 30, lateralRunoutAfterLift: 65},
    result: capRelease(keeper),
    adverse15Lift: capRelease({...keeper, lift: 15}),
    retainedCapBlocks5LinerLift: rectanglesOverlap([0, 5, 20, 8], [-5, 5, 50, 9]),
    scope: 'Complete axial cap passage through the authored coaxial cylindrical hole is clear, then a 65 mm outward translation clears the stud by 17 mm horizontally. Nut and upper units are already removed. Working space is authored empty; tools, fastener access, force, corrosion, deposits and capacity remain unverified.',
  },
  eventualRepair: {
    prerequisites: ['Qualified incoming-water diversion and a protected work area',
      'Independent temporary support for the actual wet body',
      'Independent grate/impact units removed and safely staged',
      'Terminal and all carried tail/flange projections freed',
      'Dry-side longitudinal fixed restraint released',
      'Every sliding/uplift cap removed or retracted'],
    localResult: 'The authored keeper has a finite first release; the retained-cap control prevents a direct 5 mm liner lift. This does not demonstrate complete wet-body extraction.',
    terminalCondition: 'A retained aperture needs clearance for the maximum carried tail/flange envelope, not just the stem: opening > carried width + 2*abs(offset) for this straight-lift screen. Actual dimensions are unknown.',
    actualTerminal: {openingMm: null, carriedWidthMm: null, releaseStrokeMm: null},
    localSeamRepair: 'A soldered seam is not released by removing its keeper. A qualified local repair may consume metal and needs sound accessible copper, cleanup, heating protection and reinstatement; larger renewal remains a separate operation.',
  },
  primaryEvidence: {
    C9: {url: 'https://www.nordiccopper.com/nordic-copper-aurubis-com/sv/dam/jcr%3A70b6c19f-a408-4165-98f4-74b15e7c3fb3/copperbook-2024.pdf',
      edition: 'Second edition 2013', printedPages: [81, 84, 108, 117],
      sha256: 'c4e9867841bb4c05e05c3e6211897dfabd1256d3fe72efc1187da51f48d891bc',
      use: 'Architectural expansion coefficient; fixed/moving zones; supporting gutter frame; movement at outlet. Roof construction guidance, not this ground receiver or a prescribed seam-only bearing.'},
    C11: {url: 'https://archive.copper.org/applications/architecture/arch_dhb/arch-details/gutters_downspouts/gutter_linings.php',
      originalHandbook: 'https://copper.org/wp-content/uploads/2026/04/A4050-Architectural-Handbook.pdf',
      edition: 'A4050-8/24', printedPages: [144, 148],
      sha256: 'da66c45cfb35fb94adaad908fffc79545a722faa2b4e8694ab4c913c9ea6d7c0',
      sections: ['10.3 introduction', '10.3F'],
      use: 'Free lining movement, locked/soldered or riveted/soldered seams, outside-frame fabrication/inspection. No smooth-underside, bare sliding bearing or UK installed-system approval.'},
  },
};

const stripReference = {thicknessMm: 0.7, waterDepthMm: 50, debrisKPa: 0};
const backingCases = [
  ...[50, 100, 150, 300].map(spanMm => ({group: 'support-line span',
    ...flatStripResponse({...stripReference, spanMm})})),
  ...[0.6, 1, 2].flatMap(thicknessMm => [150, 300].map(spanMm => ({
    group: 'thickness sensitivity', ...flatStripResponse({...stripReference, thicknessMm, spanMm})}))),
  ...[0, 0.5].flatMap(debrisKPa => [100, 300].map(spanMm => ({
    group: 'water and additional uniform debris action',
    ...flatStripResponse({...stripReference, waterDepthMm: 150, debrisKPa, spanMm})}))),
  ...[100, 300].map(spanMm => ({group: 'emptied sheet still carries selfweight',
    ...flatStripResponse({...stripReference, waterDepthMm: 0, spanMm})})),
];
const backingConstruction = {
  startingMain: 'd4cad187f71b8c025fa681fab15e4ce847333c67',
  authority: 'Authored flat-base backing and repair comparison for outer-west R1; no selected receiver width, depth, sheet, support spacing or load capacity.',
  decision: 'Develop a supported copper liner with the backing retained during routine wet-side cleaning. Underbody access requires a designed opening/support arrangement, temporary load transfer, or declared larger liner removal; ordinary grate removal is insufficient.',
  sourceProperties: {
    C9: {edition: 'Aurubis Copper Book, second edition 2013',
      printedPages: [31, 32, 106, 108],
      sha256: 'c4e9867841bb4c05e05c3e6211897dfabd1256d3fe72efc1187da51f48d891bc',
      modulusMPa: 118000, densityKgM3: 8900,
      annealedR220ProofMinimumMPa: null, annealedR220ProofMaximumMPa: 140,
      limit: 'Published maximum proof strength is not minimum resistance or an allowable stress. No as-formed/as-joined temper, loss allowance or strength check is established.'},
    C11: {edition: 'CDA A4050-8/24', printedPages: [144, 148],
      sha256: 'da66c45cfb35fb94adaad908fffc79545a722faa2b4e8694ab4c913c9ea6d7c0',
      limit: 'Framed built-in copper liner and fabrication outside the frame; not a qualified ground-receiver substrate or removable backing package.'},
  },
  idealisation: {
    model: 'Euler-Bernoulli linear bending of a 1 mm wide flat strip on two simple ideal reaction lines; one end free in-plane. No continuity or actual support patch selected.',
    load: 'Fixed uniform pressure on the original horizontal projection: water over the undeformed base + authored debris action + sheet selfweight. No rain-impact, ice, pedestrian, grate, stored-stone, handling or underside uplift action.',
    formulas: {I: 'b*t^3/12', R: 'w*s/2', M: 'w*s^2/8',
      stress: '6*M/(b*t^2)', displacement: '5*w*s^4/(384*E*I)',
      endSlope: 'w*s^3/(24*E*I)'},
    limits: ['No membrane, two-way plate, formed-sidewall, seam or continuous-beam stiffness credit',
      'No ponding feedback: deflection can change retained depth, pressure and fall',
      'No yield, fatigue, creep, denting, buckling, joint, contact or support capacity',
      'No universal deflection/thickness cutoff or conservative-bound claim; in-plane restraint and rotations matter',
      'Large linear extrapolations are model warnings, not predictions of the actual loaded shape or collapse',
      'Ideal support-line span is not automatically a clear inspection opening or bracket pitch'],
  },
  reference: stripReference,
  cases: backingCases,
  supportWithdrawalComparison: {
    before: flatStripResponse({...stripReference, spanMm: 100}),
    after: flatStripResponse({...stripReference, spanMm: 300}),
    momentAndStressRatio: 9, displacementRatio: 81, reactionRatio: 3,
    interpretation: 'Two independent ideal strip comparisons at identical pressure, not a continuous multispan removal analysis. Losing intermediate backing can change the span and support path; retain or transfer that support before withdrawal. Emptying removes water/debris but not sheet selfweight.',
  },
  loadPaths: {
    wetBody: 'Water/debris and copper selfweight -> compatible support/contact -> load-bearing backing -> frame/cradles -> qualified foundation',
    upperUnits: 'Pedestrian, grate/impact-unit and handling actions -> independent upper seats/frame -> qualified foundation; no credit through wet sheet or solder seam',
  },
  access: {
    ordinary: 'Divert/control incoming roof water, remove independent upper units, clear and inspect the wet face/terminal/visible edges with backing and structural restraints retained.',
    underside: 'Backing hides its contact face. A view opening must have a real supported span and reachable observation route; absence of visible dripping does not prove dry contact.',
    backingRemoval: 'Isolate continuing water, empty and clean, then independently support or remove the wet body before withdrawing required backing. Selfweight, solder seams, fixed datum, all keepers and terminal remain separate duties.',
    reinstatement: 'Verify actual backing/contact, seam clearance, fall, movement, fixed datum and captures, terminal, cleanup and leak/overflow routes before returning water.',
    leakage: 'No waterproof or harmless secondary route is credited to the backing. Locate the first observation and vulnerable fabric; a concealed leak can spread behind the liner.',
  },
};

const source = 'project/rwt/studies/free-shedding.json';
const expectedBlob = '49b3b9077d737028e114df3a1567c46e01c4265b';
const root = new URL('../../../', import.meta.url);
const bytes = readFileSync(new URL(source, root));
const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
if (blob !== expectedBlob) throw Error('Reassess changed RWT-SHED source: ' + source);
const basis = JSON.parse(bytes);
const west = basis.edges.find(edge => edge.id === 'outer-west');
if (!west || west.doorIntervals.length !== 0 || west.safeReceiverWidthMm !== null ||
    basis.nominal.total !== 144 || basis.nominal.openCourt !== 12.25 ||
    basis.actualDropHeightMm !== null || basis.designRainfall !== null) {
  throw Error('Reassess inherited location and unknowns');
}
const data = {
  authority: 'Located construction/renewal comparison. No selected receiver, metal, support, joint, level or capacity.',
  startingMain: '2512f116e277d3ab724fd0bcf0f13ba1d04533c3',
  source: {path: source, blob},
  location: {edge: west.id, shellSideMm: Math.sqrt(basis.nominal.total) * 1000,
    courtSideMm: Math.sqrt(basis.nominal.openCourt) * 1000,
    nominalDoorIntervals: west.doorIntervals, disposition: west.disposition},
  territories: {a: 'Wall-base inspection/protection', b: 'Proved impact/capture and wet receiver',
    c: 'Additional handling/maintenance/root territory', allWidthsMm: null},
  retainedBody: {
    ordinaryRemoval: 'Separately supported grates/contained impact units',
    wetBody: 'One qualified continuous body between deliberate hydraulic/movement divisions; no selected length',
    proposedRestraint: 'Defined fixed datum near terminal, sliding seats elsewhere; exact design unproved',
    largerRepair: 'Qualified consumptive local repair or release of terminal/retainers and larger body renewal',
  },
  separateTrays: {
    mechanism: 'Individually watertight bodies with visible open transfers; not sealed ordinary laps',
    variables: {
      zLip: 'Actual outlet-lip elevation of tray i, including offsets and sheet thickness',
      ZWater: 'Governing downstream receiving-water elevation at transfer i',
      g: 'Positive evidenced free separation; no selected value',
      h: 'Non-negative downstream water depth above its entry floor',
      F: 'Non-negative fall from each tray entry floor to its outlet lip',
      Delta: 'Step from upstream outlet lip down to downstream entry floor',
      D: 'Total available drop from first entry floor to last outlet lip',
    },
    localFreeTransfer: 'z_lip,i >= Z_water,i+1 + g_i',
    localStep: 'Delta_i >= h_i+1 + g_i',
    serialDrop: 'D = sum(F_i) + sum(Delta_i) >= sum(F_i) + sum(h_i+1 + g_i)',
    transferCount: 'n - 1 for a serial chain of n trays',
    rejection: 'For n > 1, zero available drop cannot accommodate positive free separations and non-negative falls/depths.',
    limit: 'Check actual lip/invert datums and permitted movement. A raised lip giving negative F lies outside this comparator; a local raised lip may still pond with positive F. The final lip-to-terminal gap and onward receiving drop lie outside D. Losing free separation under backwater invalidates this free-transfer claim, not every possible submerged gravity route.',
  },
  sourceMechanisms: {
    C11: 'CDA 10.3F: fixed soldered copper transverse seams for its watertight condition',
    C12: 'CDA 10.5B: separately moving receiving gutter; 10.5C/D are different joined arrangements',
  },
  seamSupportContinuation: localConstruction,
  backingContinuation: backingConstruction,
  unresolved: ['Actual alloy/temper/finish and joint consumables/residues',
    'Support loads, restraint, movement, wear and every retained accessory',
    'Receiver widths, roof discharge/capture, splash, flow and debris',
    'Every receiving-water elevation, free separation, fall and terminal level',
    'Harmless leakage/overflow paths and real site territory',
    'Complete first-motion, handling and reinstatement demonstration'],
};

let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="#fff"/><defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto-start-reverse"><path d="M0 0 L6 3 L0 6 Z" fill="#287989"/></marker></defs><style>text{font-family:Arial,sans-serif;font-size:3.2px;fill:#203943}.title{font-size:6px;font-weight:700}.head{font-size:4.3px;font-weight:700}.small{font-size:2.85px}.wall{fill:#e9e8e3;stroke:#7c8584;stroke-width:.4}.line{fill:none;stroke:#768589;stroke-width:.45}.wet{fill:none;stroke:#a76532;stroke-width:1.2}.water{fill:none;stroke:#287989;stroke-width:.65;marker-end:url(#arrow)}.lift{fill:none;stroke:#287989;stroke-width:.55;marker-end:url(#arrow)}.seat{fill:#e5eaeb;stroke:#768589;stroke-width:.4}.rule{stroke:#cfdbde;stroke-width:.5}.accent{fill:#ad743d}</style>';
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const t = (x,y,s,c='') => svg += `<text x="${x}" y="${y}" class="${c}">${esc(s)}</text>`;
const p = (d,c='line') => svg += `<path d="${d}" class="${c}"/>`;
const r = (x,y,w,h,c) => svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${c}"/>`;

t(12,15,'Outer-west receiver: separate the cover from the wet body','title');
t(12,24,'31 October 2026 / RWT-METALS / construction and renewal comparison / schematic, not for construction');
t(12,35,'A  Inherited edge; proposed functional territories','head');
r(20,47,60,60,'wall'); r(41.25,68.25,17.5,17.5,'seat');
p('M20 47 L20 107','wet'); p('M88 68 L88 52','lift'); t(86,48,'N','small');
t(28,58,'12 m square shell','small'); t(39,79,'Court','small');
t(12,115,'West: no nominal exterior ground door in source','small');
t(12,122,'No plot or safe capture width follows.','small');
r(108,57,17,42,'wall');
t(106,51,'House'); t(145,51,'a: inspect'); t(230,51,'b: capture'); t(348,51,'c: handle / roots');
p('M125 99 L210 99 M323 99 L396 99');
r(209,90,17,20,'seat'); r(311,90,17,20,'seat');
p('M226 88 L226 106 L311 106 L311 88','wet');
p('M212 87 L325 87');
for (let x=219;x<325;x+=12) p(`M${x} 85 L${x} 89`);
p('M237 72 L237 60 M298 72 L298 60','lift');
p('M252 57 L252 80 M275 57 L275 80','water');
t(139,112,'Wall base stays accessible','small');
t(217,119,'Independent seats carry upper units','small');
t(242,112,'Separate cradles: not sized','small');
t(330,77,'Hedge provides no','small'); t(330,84,'essential drainage credit','small');
t(108,126,'Widths, levels, capture, loads and supports remain unselected.','small');
p('M12 132 L408 132','rule');

t(12,143,'B  R1: routine upper-unit removal; larger wet-body repair','head');
t(12,151,'Lengthwise concept between designed movement/hydraulic divisions; not a 12 m component','small');
p('M25 167 L25 184 L282 190 L301 190','wet');
for (const x of [39,95,151,207]) {
  r(x,161,45,3,'seat');
  p(`M${x+22} 159 L${x+22} 152`,'lift');
}
for(const x of [55,125,200]) r(x,188,17,7,'seat');
p('M44 174 L266 180','water');
t(32,202,'Upper units lift separately; soldered body seams remain.','small');
r(266,191,14,6,'seat'); t(244,207,'Fixed datum','small');
t(102,207,'Sliding seats: design required','small');
p('M306 196 L306 207 L345 207 L345 196','wet');
p('M300 191 L312 200','water');
t(318,158,'Visible terminal','small'); t(318,165,'Receiving level unknown','small');
t(318,174,'Open separation shown;','small'); t(318,181,'sealed outlet differs.','small');
t(12,216,'Wet-body renewal must release its terminal and retainers, or declare the larger reconstruction.','small');
p('M12 223 L408 223','rule');

t(12,235,'C  R2: open transfers spend level difference at every step','head');
p('M20 245 L20 251 L115 254 L124 254','wet');
p('M132 255 L132 263 L232 266 L240 266','wet');
p('M248 267 L248 275 L352 278 L363 278','wet');
p('M44 247 L109 250 M155 257 L224 261 M274 269 L344 273','water');
p('M124 254 L138 260 M240 266 L254 272','water');
p('M134 259 L167 260 M250 271 L283 272');
t(139,249,'Water level + free gap','small');
t(255,260,'Next level + free gap','small');
t(20,274,'Each body has its own watertight seams;','small');
t(20,281,'the open transfer is not a sealed lap.','small');
t(12,291,'D >= sum(internal falls) + sum(receiving depths + positive gaps). No available site drop is assumed.');
svg += '</svg>\n';

// A second compact sheet from the same owning generator; the inherited R1/R2
// sheet remains byte-for-byte unchanged. All dimensions here are local trials.
function seamSheet() {
  const d = localConstruction;
  const f = n => Number(n.toFixed(5));
  let out = '<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><defs><marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto-start-reverse"><path d="M0 0 L6 3 L0 6Z" fill="#287989"/></marker><pattern id="hatch" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 3L3 0" stroke="#acb9ba" stroke-width=".3"/></pattern></defs><style>text{font-family:Arial,sans-serif;font-size:3.1px;fill:#203943}.title{font-size:6px;font-weight:bold}.head{font-size:4.2px;font-weight:bold}.small{font-size:2.8px}.line{fill:none;stroke:#6d7f82;stroke-width:.4}.wet{fill:#c68d59;stroke:#965d2e;stroke-width:.45}.wetline{fill:none;stroke:#965d2e;stroke-width:.7}.seat{fill:url(#hatch);stroke:#768589;stroke-width:.4}.cap{fill:#dbe5e7;stroke:#496e76;stroke-width:.4}.ghost{fill:none;stroke:#287989;stroke-width:.45;stroke-dasharray:1.6 1}.move{fill:none;stroke:#287989;stroke-width:.55;marker-end:url(#arr)}.fail{fill:none;stroke:#bd573e;stroke-width:.7}.rule{stroke:#cfdbde;stroke-width:.5}</style>';
  const tx = (x,y,s,c='') => out += `<text x="${x}" y="${y}" class="${c}">${esc(s)}</text>`;
  const pa = (path,c='line') => out += `<path d="${path}" class="${c}"/>`;
  const re = (x,y,w,h,c) => out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${c}"/>`;
  tx(12,15,'A copper seam needs support and a separate release','title');
  tx(12,24,'Outer-west R1 / 31 October 2026 / authored local comparison / dimensions in mm; not construction information');
  pa('M12 30H408','rule');

  tx(12,42,'A  One restraint; the seam moves with the liner','head');
  tx(12,50,'Longitudinal topology only — gauge is not body length','small');
  re(31,66,165,20,'line');
  pa('M22 65H194 M22 86H194','wetline');
  re(35,60,4,8,'cap');
  re(162,66,6,20,'wet');
  pa('M35 60V91 M165 60V91','line');
  pa('M40 58H160','move');
  tx(70,56,'s=0 → seam: 2000 trial','small');
  tx(19,96,'Dry-side fixed datum','small');
  tx(134,96,'Soldered cross-seam','small');
  tx(12,104,'Fixed sheet-to-sheet joint ≠ anchor to support.','small');
  tx(12,111,'Terminal at another station is another restraint if rigid.','small');
  tx(12,118,'Receiver length, width, fall and global station remain open.','small');

  tx(220,42,'B  Full footprint coverage; stationary seat','head');
  const centre = 306, scale = 2.5;
  const bar = (interval,y,c) => re(centre+scale*interval[0],y,
    scale*(interval[1]-interval[0]),6,c);
  bar([-25,25],57,'seat'); tx(376,62,'50 seat','small');
  bar([-20,20],70,'wet'); tx(371,75,'nominal 20°C','small');
  bar(d.longitudinalCoverage.interval,83,'cap'); tx(376,88,'all states','small');
  pa(`M${centre-57.5} 96H${centre+57.5}`,'fail');
  tx(376,98,'46 fails','small');
  tx(220,106,`Sweep ${f(d.longitudinalCoverage.interval[0])} to +${f(d.longitudinalCoverage.interval[1])}`,'small');
  tx(220,113,`50 seat: min ${f(d.longitudinalCoverage.minimumMargin)}; 46 seat: ${f(d.adverse.narrow46Seat.minimumMargin)}`,'small');
  tx(220,119,'40 footprint / ±2 placement / −10,20,+70°C are AUTHOR inputs.','small');
  pa('M12 125H408','rule');

  tx(12,137,'C  A liner can slide beneath a keeper and still be trapped against lifting','head');
  tx(12,145,'Authored keeper section enlarged 1.5:1; initial nut is dashed and removed before the cap moves.','small');
  const sx = v => 30 + 1.5*v, sy = z => 212 - 1.5*z;
  const section = (box,c) => re(sx(box[0]),sy(box[3]),1.5*(box[2]-box[0]),1.5*(box[3]-box[1]),c);
  section([30,-4,55,5],'seat');
  section(d.dryEdgeKeeper.authoredSection.edge,'wet');
  pa(`M${sx(0)} ${sy(0)}V${sy(-5)}H${sx(-9)}`,'wetline');
  section([37,-4,43,20],'cap');
  for(const [a,b] of [[-5,36],[44,50]]) section([a,5,b,9],'cap');
  section([34,9,46,15],'ghost');
  for(const [a,b] of [[-5,36],[44,50]]) {
    section([a,21,b,25],'ghost');
    section([a+65,21,b+65,25],'ghost');
  }
  pa(`M${sx(6)} ${sy(10)}V${sy(27)}`,'move');
  pa(`M${sx(12)} ${sy(29)}H${sx(77)}`,'move');
  tx(12,158,'1  Lift cap 16','small');
  tx(116,158,'2  Translate out 65','small');
  tx(122,184,'Free cap: 1 above stud','small');
  tx(122,191,'at the start of runout','small');
  tx(12,224,'Wet side ←','small'); tx(73,223,'Dry-side frame / stud','small');
  tx(12,230,'A retained cap blocks a 5 mm liner lift. Remove each capture.','small');

  tx(225,158,'Coaxial Ø8 hole / Ø6 stud: 1 radial clearance.','small');
  tx(225,166,'Cap underside starts at z5; stud ends at z20.','small');
  tx(225,174,'16 lift leaves 1; 15 gives contact, no free runout.','small');
  tx(225,182,'The 20 × 3 folded-edge box is an AUTHOR envelope.','small');
  tx(225,190,'No bolt penetrates the modelled wet liner.','small');
  tx(225,201,'Not a hardware specification: nut/tool access,','small');
  tx(225,208,'force, deposits, fixings and uplift remain unverified.','small');
  tx(225,219,'The seam underside is not this smooth edge box.','small');
  tx(225,226,'Fold/rivet/solder profile and backing still need design.','small');
  pa('M12 236H408','rule');

  tx(12,248,'D  Three interfaces before complete wet-body release','head');
  tx(12,258,'FIXED DATUM','head');
  tx(12,265,'Release the dry-side longitudinal restraint.','small');
  tx(12,272,'A solder seam is not a detachable anchor.','small');
  tx(150,258,'EVERY KEEPER','head');
  tx(150,265,'The local cap has one defined first motion.','small');
  tx(150,272,'Temporary body support must remain.','small');
  tx(287,258,'TERMINAL / TAIL','head');
  tx(287,265,'A carried flange must clear any retained aperture.','small');
  tx(287,272,'Stem clearance alone cannot earn a straight lift.','small');
  tx(12,285,'Manage incoming water and remove independent upper units first. Body length, mass, terminal and complete handling remain unknown.','small');
  tx(12,292,'Sources: Aurubis 2013 pp81/84/108; CDA10.3F. Geometric coverage and local keeper release are not structural or hydraulic acceptance.','small');
  return out + '</svg>\n';
}

// Separate backing sheet: earlier R1/R2 and keeper sheets are preserved.
function backingSheet() {
  const ref = backingCases.filter(c => c.group === 'support-line span');
  const fmt = (value, places = 3) => value.toFixed(places);
  let out = '<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><title>Copper receiver backing and the inspection boundary</title><desc>Authored support and repair comparison for the outer-west wet liner. A nominal linear strip sensitivity accompanies separate load paths and explicit hidden-face access limits; no selected construction or capacity.</desc><rect width="420" height="297" fill="white"/><defs><marker id="back-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto-start-reverse"><path d="M0 0L6 3L0 6Z" fill="#287989"/></marker><pattern id="back-hatch" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 3L3 0" stroke="#a4b3b4" stroke-width=".3"/></pattern></defs><style>text{font-family:Arial,sans-serif;font-size:3.15px;fill:#203943}.title{font-size:6px;font-weight:bold}.head{font-size:4.1px;font-weight:bold}.small{font-size:2.8px}.bold{font-weight:bold}.line{fill:none;stroke:#768589;stroke-width:.4}.wet{fill:none;stroke:#a76532;stroke-width:1.2}.back{fill:url(#back-hatch);stroke:#768589;stroke-width:.4}.frame{fill:#dbe5e7;stroke:#496e76;stroke-width:.45}.water{fill:#e0f0f3;stroke:none}.move{fill:none;stroke:#287989;stroke-width:.6;marker-end:url(#back-arrow)}.rule{stroke:#cfdbde;stroke-width:.45}.alert{fill:#a04733}.panel{fill:#f5f8f8;stroke:#d7e0e1;stroke-width:.4}</style>';
  const tx = (x,y,s,c='') => out += `<text x="${x}" y="${y}" class="${c}">${esc(s)}</text>`;
  const pa = (path,c='line') => out += `<path d="${path}" class="${c}"/>`;
  const re = (x,y,w,h,c) => out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${c}"/>`;
  tx(12,15,'Backing changes the inspection and repair promise','title');
  tx(12,24,'Outer-west R1 / 31 October 2026 / construction and linear-bending comparison / schematic, not for construction');
  pa('M12 30H408','rule');

  tx(12,41,'A  Retain backing; keep upper loads independent','head');
  tx(12,49,'Flat-base support topology — sidewalls and all contacts need design','small');
  re(43,66,4,48,'frame'); re(169,66,4,48,'frame');
  re(39,62,138,4,'frame');
  for(let x=49;x<167;x+=10) pa(`M${x} 61V67`);
  re(55,96,102,8,'back');
  re(64,104,10,12,'frame'); re(138,104,10,12,'frame');
  re(56,81,100,14,'water');
  pa('M55 72V95H157V72','wet');
  pa('M68 54V60 M147 54V60','move');
  pa('M95 74V91 M120 74V91','move');
  pa('M36 116H180');
  tx(12,78,'Upper loads','small'); pa('M31 80L44 88');
  tx(12,86,'bypass sheet','small');
  tx(178,85,'Wet','small'); tx(178,90,'face','small'); pa('M175 89L158 93');
  tx(178,102,'Hidden','small'); tx(178,107,'contact','small'); pa('M175 100H158');
  tx(52,124,'Backing → frame/cradles → qualified foundation','small');
  tx(12,132,'Contact/separator, seam relief and movement remain to qualify.','small');

  tx(220,41,'B  Opening a gap changes bending sensitivity','head');
  tx(220,49,'AUTHOR reference: t = 0.7 mm / water 50 mm / debris 0 kPa','small');
  tx(220,56,`q=${fmt(ref[0].totalPressureKPa,7)} kPa including copper selfweight`,'small');
  tx(220,65,'Span s'); tx(252,65,'R/line'); tx(289,65,'Stress'); tx(328,65,'δ linear'); tx(371,65,'δ/s');
  tx(220,71,'mm','small'); tx(252,71,'kN/m','small'); tx(289,71,'MPa','small'); tx(328,71,'mm','small'); tx(371,71,'ratio','small');
  pa('M220 74H408','rule');
  ref.forEach((row,i) => {
    const y=83+i*9;
    tx(220,y,row.spanBetweenIdealReactionLinesMm);
    tx(252,y,fmt(row.reactionEachKNPerM,5));
    tx(289,y,fmt(row.nominalBendingStressMPa,2));
    tx(328,y,fmt(row.linearDeflectionMm,4));
    tx(371,y,fmt(row.deflectionOverSpan,6));
  });
  tx(220,119,'s: ideal reaction-line span, not a clear aperture or bracket pitch.','small');
  tx(220,126,'R220 proof 140 MPa is a MAXIMUM, not minimum resistance.','small');
  tx(220,133,'No strength, actual deformed shape or collapse result.','small alert');
  pa('M12 140H408','rule');

  tx(12,152,'C  The operation determines what remains supported and what can be inspected','head');
  re(12,159,396,11,'panel');
  tx(17,166,'Operation','bold'); tx(112,166,'Support / water state','bold'); tx(274,166,'Inspection limit','bold');
  const rows = [
    ['Routine upper-unit removal', 'Control water; retain backing and captures.', 'Wet face, visible edges and terminal.'],
    ['Designed underside opening', 'Actual span/profile and support must be proved.', 'Real line of sight and reachable tool path.'],
    ['Withdraw required backing', 'Empty, then support or remove the wet body first.', 'Hidden face; selfweight does not disappear.'],
    ['Larger liner removal', 'Free terminal, datum and every keeper; handle safely.', 'Bench access is a larger declared intervention.'],
  ];
  rows.forEach((row,i) => {
    const y=180+i*12;
    tx(17,y,row[0],'small'); tx(112,y,row[1],'small'); tx(274,y,row[2],'small');
    pa(`M12 ${y+5}H408`,'rule');
  });
  tx(12,234,'Backing is not a secondary waterproof tray. Locate first leak observation and first vulnerable fabric.','bold');

  pa('M12 241H408','rule');
  tx(12,252,'D  What the numbers earn','head');
  tx(12,261,'100 → 300 mm, same pressure: stress ×9 / δ ×81 / reaction ×3. Two ideal strips, not a support-removal analysis.','small');
  tx(12,268,'Empty t0.7 / s300 trial: δ = 1.9111 mm from selfweight. Water 150 mm + debris 0.5 kPa: δ = 63.5601 mm is a linear extrapolation.','small');
  tx(12,275,'E = 118000 N/mm²; density 8900 kg/m³. Fixed projected pressure; one end free in-plane. No ponding, formed-side or membrane credit.','small');
  tx(12,282,'δ/t alone is not a validity cutoff. Actual profile, restraint, rotations, joints, loads and contact need design; no universal bound.','small');
  tx(12,291,'Sources: Aurubis 2013 pp 31/32/106/108; CDA A4050-8/24 pp 144/148. No backing material, receiver size or installed load capacity admitted.','small');
  return out + '</svg>\n';
}

export const outputs = [['outer-west-receiver-renewal.json', JSON.stringify(data,null,2)+'\n'],
  ['outer-west-receiver-renewal.svg', svg], ['outer-west-seam-support.svg', seamSheet()],
  ['outer-west-receiver-backing.svg', backingSheet()]];
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  for(const [name, content] of outputs) {
    const target = new URL(name, import.meta.url);
    if(process.argv.includes('--check')) {
      if(readFileSync(target,'utf8') !== content) throw Error('Regenerate ' + name);
    } else writeFileSync(target,content);
  }
  console.log(process.argv.includes('--check') ? 'Receiver source and outputs verified; no physical acceptance claimed.' : 'Receiver comparison outputs generated.');
}
