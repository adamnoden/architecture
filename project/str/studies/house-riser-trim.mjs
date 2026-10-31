/** Located riser-trim comparison. Geometry and topology only; never capacity. */
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root = new URL('../../../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');
const blob = p => {
  const b = readFileSync(new URL(p, root));
  return createHash('sha1').update('blob ' + b.length + '\0').update(b).digest('hex');
};
const pins = {
  'project/str/studies/house-plan.json': 'd722ada30df5729852043f0010433a890e399999',
  'project/str/studies/house-supports.json': '0703a34f0a15b392b5cf534fd39f0d30fc9440e3',
  'project/str/studies/house-source.json': '47871731baee1a5bed113e1f6839a419620c6351',
};
for (const [p, sha] of Object.entries(pins)) assert.equal(blob(p), sha, 'Reassess changed source: ' + p);
const plan = JSON.parse(read('project/str/studies/house-plan.json'));
const support = JSON.parse(read('project/str/studies/house-supports.json'));
const source = JSON.parse(read('project/str/studies/house-source.json'));
const riser = support.service.riser_gross;
const cabinet = support.service.upper_cabinet_gross;
const bay = support.service.illustrative_structural_service_bay;
assert.deepEqual(riser, [9410, 4700, 550, 700]);
assert.deepEqual(cabinet, [9385, 4675, 600, 750]);
assert.deepEqual(bay, [9370, 4650, 700, 800]);
const spine = plan.ground_walls.find(w => w.id === 'service-spine');
const southWall = plan.ground_walls.find(w => w.id === 'plant-intermediate-arch');
const northWall = plan.ground_walls.find(w => w.id === 'plant-north');
assert.equal(spine.a[0], 9300);
assert.deepEqual([southWall.a[1], northWall.a[1]], [3700, 6500]);
assert.equal(spine.t, 170);
const door = source.sourceInventory.openings.GROUND.find(o => o.id === 'plant-replacement');
assert.deepEqual([door.wall, door.centre, door.width], ['outer-east', 4600, 1400]);
const doorY = [door.centre - door.width / 2, door.centre + door.width / 2];
const outerFace = 12000 - support.accepted_span_geometry.outerLeafIntervalMm[1];
assert.equal(outerFace, 11597.5);
const coreHalf = 70; // Retained B comparison: 140 core + two 15 finishes, not a selected wall.
const flankY = {south: [southWall.a[1] + coreHalf, bay[1]], north: [bay[1] + bay[3], northWall.a[1] - coreHalf]};
const overlap = (a, b) => Math.max(0, Math.min(a[1], b[1]) - Math.max(a[0], b[0]));
const margins = (outer, inner) => ({west: inner[0] - outer[0], east: outer[0] + outer[2] - inner[0] - inner[2], south: inner[1] - outer[1], north: outer[1] + outer[3] - inner[1] - inner[3]});
const trim = (southTail, northTail) => {
  assert(Number.isFinite(southTail) && Number.isFinite(northTail) && southTail > 0 && northTail > 0, 'Finite positive tails required');
  const south = [bay[1] - southTail, bay[1]], north = [bay[1] + bay[3], bay[1] + bay[3] + northTail];
  return {southTail, northTail, overallNorthSouth: bay[3] + southTail + northTail, south, north,
    southWithinRetainedFlank: south[0] >= flankY.south[0], northWithinRetainedFlank: north[1] <= flankY.north[1],
    southProjectionOverGroundDoor: overlap(south, doorY), northGapFromDoor: north[0] - doorY[1]};
};
// These 100 mm tails are an AUTHOR'S OCCUPANCY SENSITIVITY, not supplier dimensions.
const sensitivity = trim(100, 100);
assert.deepEqual(margins(bay, riser), {west: 40, east: 110, south: 50, north: 50});
assert.deepEqual(margins(bay, cabinet), {west: 15, east: 85, south: 25, north: 25});
assert.deepEqual(margins(cabinet, riser), {west: 25, east: 25, south: 25, north: 25});
assert.equal(sensitivity.overallNorthSouth, 1000);
assert.equal(sensitivity.southProjectionOverGroundDoor, 100);
assert.equal(sensitivity.northGapFromDoor, 150);
assert(sensitivity.southWithinRetainedFlank && sensitivity.northWithinRetainedFlank);
assert.equal(trim(881, 100).southWithinRetainedFlank, false);
assert.equal(trim(100, 981).northWithinRetainedFlank, false);
assert.throws(() => trim(0, 100));
assert.throws(() => trim(NaN, 100));
const floor = support.floor;
assert.equal(floor.basic_layers_top_down.services, 55);
const serviceRemainder = (downstand, protection) => {
  assert(Number.isFinite(downstand) && Number.isFinite(protection) && downstand >= 0 && protection >= 0);
  return floor.basic_layers_top_down.services - downstand - protection;
};
assert.equal(serviceRemainder(0, 0), 55);
assert.equal(serviceRemainder(30, 25), 0); // Adverse control, not a selected assembly.
assert(serviceRemainder(31, 25) < 0);
const data = {
  status: 'Unadopted B riser-trim topology and finite occupancy comparison; no capacity or assembly acceptance.',
  startingMain: '09130048037f20fdc86b60959b2c631db18b6a6f',
  units: 'mm unless stated otherwise', sourcePins: pins,
  primaryDetail: {
    url: 'https://images.ctfassets.net/eta2vegx3yuv/6HziuaY2D0E9AjhL3qx9RP/d51e8cfeedf89e1c7d51d169f36f79ac/Hollowcore_-_Standard_Trimmer_Strap_Detail.png',
    inspectedOn: '2026-10-31', downloadedBytes: 256761,
    sha256: '93d6cb14f9d8a4260552749c43b12985489e947fa320af28583aeefa0752e5f7',
    depictedTopology: 'Shortened slab on trimmer shelf; end tabs over adjacent full-length slabs; source labels trimmer up to1200mm wide.',
    actualTailLength: null, plateThickness: null, shelfProjection: null, installedDepth: null,
    limit: 'Do not scale the image or import dimensions from a different rendered image at the same URL.',
  },
  bay, riser, cabinet, riserMarginsToStructuralBay: margins(bay, riser),
  bayBeyondCabinetFootprint: margins(bay, cabinet), cabinetGrossMarginsToRiser: margins(cabinet, riser),
  grossOpeningAreaM2: bay[2] * bay[3] / 1e6, cabinetFootprintM2: cabinet[2] * cabinet[3] / 1e6,
  openingOutsideCabinetFootprintM2: (bay[2] * bay[3] - cabinet[2] * cabinet[3]) / 1e6,
  flankY, flankWidths: {south: flankY.south[1] - flankY.south[0], north: flankY.north[1] - flankY.north[0]},
  supportFacesX: [bay[0], outerFace], structuralFaceSpan: outerFace - bay[0], groundOuterDoorY: doorY,
  southFlankProjectionOverDoor: overlap(flankY.south, doorY),
  trial: {...sensitivity, authority: '100 mm end territories are authored sensitivities only, not the current primary detail.'},
  section: {slabSoffit: floor.basic_HC_soffit_at_support, slabTop: floor.basic_HC_top_at_support,
    ceilingTop: floor.finished_ceiling_underside + floor.basic_layers_top_down.ceiling,
    serviceReservation: 55, availableBelowTrim: '55 - actual downstand - actual protection',
    actualDownstand: null, actualProtection: null, actualServiceRequirement: null},
  alternatives: {
    strap: 'Shortened east-side floor to local header; header to adjacent full-length EW planks; those planks to spine and outer-east supports.',
    independentFrame: 'East-side header to north/south cross-span members; those members to spine and outer-east supports. Finite seats, connections and protection required.',
  },
  limits: ['Neither alternative bypasses the ground plant-door arch merely by changing the header type.',
    'Full-length does not mean an assumed full-width stock plank; panel grid, strand positions and factory cutting remain unselected.',
    'Opening outside cabinet footprint needs a supported, sealed, finished closure and cabinet support.',
    'No manufactured strap, HC150 compatibility, design reactions, fire/material admission or construction acceptance follows.'],
};
const svg = [];
const add = s => svg.push(s);
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text = (x,y,t,c='') => add(`<text x="${x}" y="${y}" class="${c}">${esc(t)}</text>`);
const rect = (x,y,w,h,c) => add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${c}"/>`);
const line = (x,y,xx,yy,c='line') => add(`<path d="M${x},${y}L${xx},${yy}" class="${c}"/>`);
add('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="#fffdf8"/><style>text{font-family:Arial,sans-serif;font-size:3.1px;fill:#243d43}.title{font-size:6px;font-weight:bold}.head{font-size:4.1px;font-weight:bold}.small{font-size:2.7px}.wall{fill:#d9dfdf;stroke:#64787b;stroke-width:.3}.slab{fill:#e8eef0;stroke:#a4b5bb;stroke-width:.3}.hole{fill:#fffdf8;stroke:#476773;stroke-width:.45}.cabinet{fill:none;stroke:#9a7443;stroke-width:.45;stroke-dasharray:2,1}.riser{fill:#c6dfdb;stroke:#417c70;stroke-width:.4}.trim{fill:#adbdc8;stroke:#3c5368;stroke-width:.45}.door{fill:#f7d8c8;stroke:#ae6347;stroke-width:.4}.line{fill:none;stroke:#526d74;stroke-width:.35}.dash{fill:none;stroke:#8a6a43;stroke-width:.45;stroke-dasharray:2,1}.warn{fill:#9d4f32}.arrow{fill:none;stroke:#486879;stroke-width:.6;marker-end:url(#a)}</style><defs><marker id="a" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0L5,2.5L0,5Z" fill="#486879"/></marker></defs>');
text(12,14,'Riser trimming: support the hole and close its actual perimeter','title');
text(12,23,'31 October 2026 / unadopted B plan / mm / conditional geometry, no capacity or construction approval');
text(12,35,'A  Local trimmer on adjacent full-length planks','head');
const scale=.055, x0=17, y0=47;
const X=x=>x0+(x-9230)*scale, Y=y=>y0+(y-3700)*scale;
const box=(b,c)=>rect(X(b[0]),Y(b[1]),b[2]*scale,b[3]*scale,c);
box([9230,3700,140,2800],'wall'); box([outerFace,3700,140,2800],'wall');
box([9370,3770,outerFace-9370,880],'slab'); box([9370,5450,outerFace-9370,980],'slab');
box([10070,4650,outerFace-10070,800],'slab'); box(bay,'hole'); box(cabinet,'cabinet'); box(riser,'riser');
// Header centreline and transverse tab widths are graphic, not a selected section.
line(X(10070),Y(4550),X(10070),Y(5550));
line(X(10800),Y(5050),X(10110),Y(5050),'arrow');
line(X(10070),Y(5000),X(10070),Y(4580),'arrow');
line(X(10070),Y(5100),X(10070),Y(5520),'arrow');
rect(X(10070),Y(4550),4,100*scale,'trim'); rect(X(10070),Y(5450),4,100*scale,'trim');
box([outerFace,doorY[0],140,doorY[1]-doorY[0]],'door');
for (const y of [4250,5900]) {line(X(10180),Y(y),X(9550),Y(y),'arrow');line(X(10400),Y(y),X(11400),Y(y),'arrow');}
text(20,211,'100 mm y tails: AUTHOR sensitivity; transverse tab widths are symbolic.','small');
text(20,218,'Orange: ground plant door below. Its arch receives changed floor reactions.','small warn');
text(20,225,'Adjacent field widths 880 / 980 do not select stock panels or cut strands.','small');
text(20,232,'Clear bay 700 × 800; gross riser 550 × 700; dashed cabinet 600 × 750.','small');
text(190,35,'B  A cabinet outline is not a floor closure','head');
const S=.10, bx=198, by=47;
const B=(b,c)=>rect(bx+(b[0]-bay[0])*S,by+(b[1]-bay[1])*S,b[2]*S,b[3]*S,c);
B(bay,'hole'); B(cabinet,'cabinet'); B(riser,'riser');
text(280,55,'Bay beyond cabinet footprint:');
text(280,64,'15 west / 85 east'); text(280,73,'25 south / 25 north');
text(280,85,'0.110 m² of the floor opening'); text(280,93,'lies outside the cabinet footprint.');
text(280,106,'The cabinet itself also needs'); text(280,114,'a defined supporting load path.');
text(193,139,'C  Independent frame: different members, same receiving walls','head');
text(193,149,'Two cross-span members flank the hole; an east-side header joins them.');
text(193,157,'At the illustrative 100 mm edge bands:');
text(193,166,'South y4550–4650 lies wholly over ground door y3900–5300.','warn');
text(193,175,'North y5450–5550 clears its upper jamb by 150 mm in plan.');
text(193,184,'That gap is neither a bearing length nor an arch/abutment verdict.','small');
text(193,199,'D  Keep the complete section budget','head');
text(193,209,'Retained HC soffit +3170; ceiling top +3115; services 55.');
text(193,218,'Remaining service depth = 55 − trim downstand − protection.');
text(193,227,'The primary detail supplies none of those installed section dimensions.');
text(193,236,'Top tabs, topping, wet/fire/acoustic closure and finishes also need space.','small');
line(12,246,408,246);
text(12,256,'Advance a supplier-designed strap enquiry, with actual adjacent panels and a supported perimeter closure.','head');
text(12,266,'Retain the independent frame comparator. Neither earns a chosen floor, member, material exception or STR-HOUSE completion.');
text(12,277,'Primary detail: Ibstock/Coltman current colour isometric; width label up to1200 mm; no bearing, plate or shelf dimensions.','small');
text(12,284,'Source-bound inputs and reproduction: house-riser-trim.mjs / house-riser-trim.json. Full technical, physical and professional duties remain.','small');
add('</svg>');
const outputs = {'project/str/studies/house-riser-trim.json': JSON.stringify(data,null,2)+'\n','project/str/studies/house-riser-trim.svg': svg.join('\n')+'\n'};
for(const [path,contents] of Object.entries(outputs)) {
  if(process.argv.includes('--check')) assert.equal(read(path),contents,'Stale output: '+path);
  else writeFileSync(new URL(path,root),contents);
}
console.log('Riser-trim source, finite-envelope, closure and adverse-control checks passed; capacity remains unassessed.');
