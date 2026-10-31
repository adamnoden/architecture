/** Source-bound construction comparison. No adopted receiver size or hydraulic model. */
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

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

const outputs = [['outer-west-receiver-renewal.json', JSON.stringify(data,null,2)+'\n'],
  ['outer-west-receiver-renewal.svg', svg]];
for(const [name, content] of outputs) {
  const target = new URL(name, import.meta.url);
  if(process.argv.includes('--check')) {
    if(readFileSync(target,'utf8') !== content) throw Error('Regenerate ' + name);
  } else writeFileSync(target,content);
}
console.log(process.argv.includes('--check') ? 'Receiver source and outputs verified; no physical acceptance claimed.' : 'Receiver comparison outputs generated.');
