import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../../../', import.meta.url);
const paths = {
  kit: 'project/ias/studies/crafted-study-kit-schedule.json',
  openings: 'project/oas/studies/study-subframe.json',
  door: 'project/ias/studies/study-door-reveal.json',
};
const files = Object.fromEntries(Object.entries(paths).map(([key, path]) => [
  key, readFileSync(new URL(path, root)),
]));
const { oak: kit } = JSON.parse(files.kit);
const opening = JSON.parse(files.openings);
const door = JSON.parse(files.door);
const inputs = Object.fromEntries(Object.entries(paths).map(([key, path]) => [
  path, createHash('sha256').update(files[key]).digest('hex'),
]));
assert.equal(kit.opening.relation, 'native');
assert.equal(kit.opening.id, 'GROUND/' + opening.occurrence.id);
assert.deepEqual(kit.door.rough, [1350, 2250]);
const depthMm = kit.wall.referenceDepthMm;
const wallFaceYMm = opening.retainedControls.portalCore[1] + depthMm;
const ceilingZMm = opening.retainedControls.existingCeiling;
const [firstJambX] = kit.opening.box.slice(2);
const secondJambX = kit.opening.fixedControls[0].box[0];
const stopWidthMm = 50;
const module = [firstJambX + 75, 1280, firstJambX + 525, 1730];
const rails = { zMm: 1700, hardLandXMm: [firstJambX + 100, firstJambX + 500] };
const jambStops = [[firstJambX, firstJambX + stopWidthMm], [secondJambX - stopWidthMm, secondJambX]];
const lap = [jambStops[0][1] - 30, jambStops[0][1]];
const grille = kit.grilleKeepOut.box;
const intersects = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
assert.equal(wallFaceYMm, 429.5);
assert.equal(ceilingZMm, 3100);
assert(module[0] >= jambStops[0][1] && module[2] <= jambStops[1][0]);
assert(rails.hardLandXMm.every(x => x > module[0] && x < module[2]));
assert(rails.zMm > module[1] && rails.zMm < module[3]);
assert(!intersects(module, grille));
const verticalReleaseMm = 10;
const release = [module[0], module[1], module[2], module[3] + verticalReleaseMm];
assert(!intersects(release, grille));
const shifted = release.map((value, index) => index % 2 ? value + 200 : value);
assert(intersects(shifted, grille));

// Integer micrometres keep shim steps and equality at the finished datum exact.
const fixed = { metalAirPlane: 500, gaugedFixedPlaneCorrection: 500, maximumMineralBoard: 6500 };
const moving = { matedCleat: 6350, fitting: 2000, maximumCassette: 10500 };
const sum = values => Object.values(values).reduce((a, b) => a + b, 0);
const stackUm = sum(fixed) + sum(moving);
const datumUm = depthMm * 1000;
const stepUm = 100;
const measurementAndSetUm = 150;
const maximumHardPackUm = 1500;

function gauge(measuredStackUm, fixedLocalOutOfPlaneUm) {
  if (fixedLocalOutOfPlaneUm > fixed.gaugedFixedPlaneCorrection) {
    return { admitted: false, reason: 'fixed-plane-gauge-exceeded' };
  }
  const packUm = Math.floor((datumUm - measuredStackUm - measurementAndSetUm) / stepUm) * stepUm;
  if (packUm < 0 || packUm > maximumHardPackUm) {
    return { admitted: false, reason: 'dry-pack-outside-tested-range' };
  }
  const faceUm = measuredStackUm + packUm;
  return { admitted: true, packUm, faceUm, possibleFaceUm: [faceUm - measurementAndSetUm, faceUm + measurementAndSetUm] };
}

const maximumStack = gauge(stackUm, 500);
const minimumBoardStack = gauge(stackUm - 1000, 500);
assert.equal(stackUm, 26350);
assert.deepEqual(maximumStack, { admitted: true, packUm: 500, faceUm: 26850, possibleFaceUm: [26700, 27000] });
assert.equal(minimumBoardStack.packUm, 1500);
assert.equal(gauge(stackUm, 700).admitted, false);
assert.equal(gauge(stackUm - 1100, 500).admitted, false);
assert.equal(gauge(stackUm + 550, 500).admitted, false);
assert.equal(2 * depthMm - depthMm, 27);

const panelKg = 10;
const downwardN = panelKg * 9.81;
const equalTwoLandN = downwardN / rails.hardLandXMm.length;
const momentNmAtMaximumOffset = downwardN * depthMm / 1000;
assert.equal(Math.round(equalTwoLandN * 100) / 100, 49.05);
assert.equal(Math.round(momentNmAtMaximumOffset * 1000) / 1000, 2.649);

const result = {
  schema: 'ias-crafted-study-wall-transition/1',
  status: 'DEVELOPMENT_COMPARISON',
  inputs,
  source: { kitCaseDigest: kit.caseDigest, binding: kit.source.bindingDigest },
  field: {
    moduleXZMm: module, rails, jambStopsXMm: jambStops, fixedLapXMm: lap, grilleXZMm: grille,
    unchangedRoomFaceYMm: wallFaceYMm, coreFaceYMm: opening.retainedControls.portalCore[1],
    verticalReleaseMm, minimumVerticalReserveToG1Mm: grille[1] - release[3],
    translatedUp200MmIntersectsG1: intersects(shifted, grille),
    ceilingZMm, cornicePocketMm: 30, cornicePocketAfterSettingMm: 25,
    retainedHalfHeadInwardDrawMm: opening.retainedControls.release.headDraw,
    retainedHalfHeadPocketReserveMm: opening.retainedControls.release.headPocketAfterTwo2,
    doorFinishYMm: door.finishedWallYmm[0], doorHistoricBodyMarginMm: kit.wall.historicDoorBodyReserveMm,
    retainedSkirtingEndPiecesXMm: door.trimEndPieceXmm, retainedSkirtingFirstDrawMm: door.releaseSouthMm,
  },
  fitUm: {
    fixed, moving, stackUm, datumUm, allowanceBeforeDryPackUm: datumUm - stackUm,
    stepUm, measurementAndSetUm, maximumHardPackUm, maximumStack, minimumBoardStack,
    uncorrectableSubstrate: gauge(stackUm, 700),
    inadequateStackForPack: gauge(stackUm - 1100, 500),
    proudStack: gauge(stackUm + 550, 500),
  },
  mechanics: {
    panelKg, downwardN, equalTwoLandN, oneLandLossRedistributionN: downwardN, momentNmAtMaximumOffset,
    gaugeRequiredAtBothRailsAndAcrossFace: true, anchorsBehindWallSideRail: true, boardOrAirPlaneReceivesRailLoad: false,
  },
  hold: 'Dimensional and load-destination screen only. Actual substrate, anchor and stop, sealed penetration and lap, head/foot joins, air/leakage testing, product constituents and complete dry wall performance remain open. Wet returns and skirting control stay independent.',
};

const figure = draw(result);
const receipt = JSON.stringify(result, null, 2) + '\n';
const outputs = { json: receipt, svg: figure };
const [mode, ...extra] = process.argv.slice(2);
if (extra.length || (mode !== '--check' && mode !== '--write')) throw new Error('Use --check or --write');
for (const [extension, data] of Object.entries(outputs)) {
  const path = new URL('crafted-study-wall-transition.' + extension, import.meta.url);
  if (mode === '--check') assert.equal(readFileSync(path, 'utf8'), data, 'Stale ' + extension);
  else writeFileSync(path, data);
}

function draw({ field, fitUm, source }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" role="img" aria-labelledby="title desc">
<title id="title">Study thin lining and retained mineral return</title>
<metadata>Current IAS room case: ${source.kitCaseDigest}; source binding: ${source.binding}</metadata>
<desc id="desc">Dimensioned trial sections of a structural rail anchored to the wall core, a sealed air-control penetration, and a fixed lap into the retained lime window return.</desc>
<defs>
  <pattern id="core" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#e2ded1"/><path d="M0 14L14 0M-4 4L4 -4M10 18L18 10" fill="none" stroke="#c6bcaa" stroke-width="1"/></pattern>
  <pattern id="mineral" width="11" height="11" patternUnits="userSpaceOnUse"><rect width="11" height="11" fill="#e9d9ad"/><circle cx="3" cy="5" r=".9" fill="#b4a078"/><circle cx="9" cy="9" r=".7" fill="#b4a078"/></pattern>
  <marker id="end" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 1L9 5L0 9" fill="none" stroke="#394953" stroke-width="1.6"/></marker>
  <style>text{font-family:Arial,sans-serif;fill:#26353c}.title{font-family:Georgia,serif;font-size:34px}.small{font-size:14px}.body{font-size:15px}.section{font-family:Georgia,serif;font-size:22px}.rule{stroke:#8c9386;stroke-width:1}.dim{stroke:#394953;stroke-width:1.2;fill:none;marker-start:url(#end);marker-end:url(#end)}.air{stroke:#157c83;stroke-width:3;fill:none}.steel{stroke:#394953;stroke-width:2;fill:#a9b2b5}.flow{stroke:#394953;stroke-width:1.4;fill:none;marker-end:url(#end)}.timber{fill:#b77950;stroke:#795238;stroke-width:1.3}.dash{stroke:#626e71;stroke-width:1.2;stroke-dasharray:5 4}.quiet{fill:#56646a}</style>
</defs>
<rect width="1200" height="800" fill="#fcfaf3"/>
<rect x="42" y="40" width="46" height="5" fill="#aa724b"/>
<text x="42" y="83" class="title">A thin Study lining with a fixed air line</text>
<text x="43" y="113" class="body">South wall pier between the two windows · dimensioned development comparison</text>
<path d="M42 139H1158M600 166V690" class="rule"/>
<text x="44" y="180" class="section">A · Rail attachment through the air plane</text>
<text x="44" y="205" class="small quiet">Normal to the south wall. Core face Y${field.coreFaceYMm}; retained finish datum Y${field.unchangedRoomFaceYMm}.</text>
<!-- Local normal scale 10 px/mm for depth. -->
<rect x="68" y="282" width="110" height="160" fill="url(#core)" stroke="#aaa28f"/>
<rect x="178" y="282" width="10" height="160" fill="#c8d3ce"/>
<rect x="188" y="282" width="65" height="160" fill="#e5e2d5" stroke="#a8aa9e"/>
<path d="M180.5 282V442" class="air"/>
<rect x="253" y="282" width="88.5" height="160" fill="#f9f5e9" stroke="#d8cbac"/>
<rect x="341.5" y="282" width="105" height="160" class="timber"/>
<path d="M448 253V467" class="dash"/>
<!-- Structural boss and collar, not a screw into board. -->
<path d="M83 357H258V370H83Z" class="steel"/>
<rect x="131" y="350" width="31" height="27" fill="none" stroke="#394953" stroke-width="2"/>
<path d="M180.5 346C199 346 199 380 180.5 380" class="air"/>
<path d="M258 342H277V368H286V335H320V386H302V359H287V389H258Z" class="steel"/>
<path d="M320 346H341.5V380H320" class="steel"/>
<path d="M397 355V321" class="flow"/>
<path d="M144 401V421H91" class="flow"/>
<text x="292" y="310" class="small">Lift clear after releasing the stop</text>
<text x="72" y="460" class="small">Wall core</text>
<text x="161" y="485" class="small">Fixed backing</text>
<text x="329" y="460" class="small">Moving cassette</text>
<path d="M178 258H448" class="dim"/>
<text x="246" y="243" class="body">27 mm maximum room-side depth</text>
<text x="46" y="526" class="body">1.0 fixed interface · 6.5 backing · 6.35 rail</text>
<text x="46" y="550" class="body">2.0 fit · 10.5 cassette · ${fitUm.maximumStack.packUm / 1000} measured dry pack</text>
<path d="M46 570H554" class="rule"/>
<path d="M47 596H79" class="air"/><text x="92" y="601" class="small">0.5 formed air plane and fixed sealed collar</text>
<path d="M47 624H79" class="flow"/><text x="92" y="629" class="small">Gravity through rail, hard land and anchor into core</text>
<text x="47" y="657" class="small quiet">Gauge worst face to the existing datum: 26.70–27.00 mm.</text>
<text x="47" y="678" class="small quiet">Check the anchor and collar. Board and air plane carry no rail load.</text>
<!-- B horizontally along wall; x scale 2.2 px/mm. Depth is vertically exaggerated. -->
<text x="632" y="180" class="section">B · Independent fixed window return</text>
<text x="632" y="205" class="small quiet">At Z${field.rails.zMm}. Start the trial lining beyond the retained plaster strip.</text>
<rect x="650" y="403" width="461" height="83" fill="url(#core)" stroke="#aaa28f"/>
<rect x="650" y="325" width="110" height="78" fill="url(#mineral)" stroke="#a99a70"/>
<rect x="760" y="380" width="351" height="23" fill="#e5e2d5" stroke="#a8aa9e"/>
<rect x="770" y="327" width="341" height="34" class="timber"/>
<path d="M650 325H1111" class="dash"/>
<path d="M1111 400H760L694 382" class="air"/>
<path d="M694 382H668L650 369" class="air" stroke-dasharray="3 4"/>
<circle cx="694" cy="382" r="4" fill="#fcfaf3" stroke="#157c83" stroke-width="2"/>
<circle cx="870" cy="392" r="10" fill="#a9b2b5" stroke="#394953" stroke-width="2"/>
<path d="M870 389V441" class="flow"/>
<path d="M650 269H760" class="dim"/>
<path d="M650 277V317M760 277V317" class="rule"/>
<text x="659" y="252" class="body">${field.jambStopsXMm[0][1] - field.jambStopsXMm[0][0]} mm retained strip</text>
<path d="M694 459H760" class="dim"/>
<text x="698" y="511" class="small">${field.fixedLapXMm[1] - field.fixedLapXMm[0]} mm lap</text>
<text x="620" y="538" class="small quiet">X${field.jambStopsXMm[0][0]} raw jamb</text>
<text x="749" y="538" class="small quiet">X${field.jambStopsXMm[0][1]} lining stop</text>
<text x="891" y="538" class="small quiet">X${field.rails.hardLandXMm[0]} anchor witness</text>
<text x="637" y="578" class="body">Keep the full mineral return and window seals fixed.</text>
<text x="637" y="602" class="body">Test the lap after movement and repeated panel removal.</text>
<text x="637" y="629" class="small quiet">Anchors and decorative trim stay out of the window renewal route.</text>
<text x="637" y="651" class="small quiet">The dashed air line to the jamb needs a verified bond and seal.</text>
<path d="M43 710H1157" class="rule"/>
<text x="43" y="741" class="small">Separate adjacent wall and ceiling support from the removable fillet. Keep the plaster finish at the protected-door pinch.</text>
<text x="43" y="766" class="small quiet">Conditional geometry. Anchor capacity, air leakage, concealed constituents and complete installed performance remain open.</text>
</svg>
`
}
