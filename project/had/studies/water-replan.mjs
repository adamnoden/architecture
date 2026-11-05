/** Joined architectural hypothesis. No adopted hydraulic/site/structural pass. */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = new URL('../../../', import.meta.url);
const load = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const blob = path => {
  const bytes = readFileSync(new URL(path, root));
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
};
export function deriveWaterReplan() {
  const hadPath = 'project/had/studies/open-north-loggia.json';
  assert.equal(blob(hadPath), '25faad2c4d40df2b7da7212f73808843a88d2f52');
  const h = load(hadPath);
  const servicesPath = 'project/mat/studies/east-water-plant.json';
  const s = load(servicesPath);
  assert.deepEqual(s.eastWaterHypothesis.finishedPassageY, [6300, 7500]);
  assert.deepEqual(s.plantDryRoom, [9397, 3397, 2173.5, 2383.5]);
  const floorZ = x => -800 - (x - 7750) * 50 / 4250;
  const passage = { outdoor: [9722.5, 6300, 2277.5, 1200],
    waterClear: [7750, 6600, 4250, 600],
    structuralClearY: [6450, 7350],
    bedEnds: [[7750, -800], [12000, -850]],
    outerReceivingWaterMaximumTrial: -1000,
    receivingStatus: 'Pre-site admissibility condition only; full flow/head/independence and lawful actual outfall remain unproved.' };
  const bridge = { permanentDryGalleryClearX: [8179.5, 9203],
    coveredX: [7750, 9722.5],
    newEastWeatherWallX: [9203, 9722.5],
    walkingFFL: 0,
    floorLayers: [['stone', 15], ['screed', 65], ['bareCellularGlass', 100], ['RC', 200]],
    slabZ: [-380, -180],
    localSupportBeamZ: [-630, -180],
    localSupportBeamWidth: 600,
    supportAxesX: [7950, 9300], supportAxesY: [6100, 7700],
    supportNodes: { plan: [600, 600], z: [-750, -180] },
    structuralStatus: 'Authored feasibility reservations, not a selected STR member capacity or permission to cut existing structure.' };
  const renewal = { bodyX: [7650, 9822.5], length: 2172.5,
    waterClearWidth: 600, waterDepth: 100, wetBodyGrossWidth: 663,
    carriageWidthBudget: 763, carriageBelowBedBudget: 150,
    selectedWithdrawal: 'WEST', westBodyParkX: [5477.5, 7650],
    courtOpening: [5377.5, 6450, 2372.5, 900],
    operatorField: [5477.5, 5350, 1100, 750],
    courtPocketBottomAtX: [5377.5, floorZ(5377.5) - 150],
    materialStatus: 'All body, backing, supports, keepers, lifting and first-release geometry must join the MAT source before adoption.',
    eastBodyParkX: [9822.5, 11995],
    eastRejected: 'Only 5 mm to original exterior face, before operator/hoist; not an accepted east withdrawal.',
    courtCost: 'Removable outdoor walking covers over a real deep staging pocket, independent of the normal north route; no invisible removal through permanent pan or floor.' };
  const hydraulicProbe = { assignedFullRoofCourtLps: 3.60375,
    independentCourtCrestTrialZ: -110,
    effectiveWidthM: .6, coefficientTrial: 1.7,
    idealBroadCrestHeadMm: 1000 * (3.60375 / 1000 / (1.7 * .6)) ** (2 / 3),
    status: 'Preliminary ideal sizing sensitivity only. Actual inlet, stage, debris, splash, first harm, pressure and downstream receiving state remain RWT-06 proof.' };
  const model = structuredClone(h);
  const wall = id => model.groundWalls.find(w => w.id === id);
  Object.assign(wall('plant-north'), { a: [9300, 5877.5], b: [12000, 5877.5],
    t: 519.5, finishedFaces: [5780.5, 6300],
    structuralCore: [5807.5, 5947.5],
    scope: 'New complete weather-wall comparator from protected south face; owning MAT recipe/support admission required.' });
  Object.assign(wall('plant-intermediate-arch'), { a: [9300, 3300], b: [12000, 3300],
    finishedFaces: [3203, 3397], structuralCore: [3230, 3370], holes: [[9650, 10950]] });
  model.groundWalls.push({ id: 'east-passage-north-weather', a: [9397, 7922.5], b: [12000, 7922.5],
    t: 519.5, finishedFaces: [7500, 8019.5], structuralCore: [7852.5, 7992.5],
    scope: 'Outdoor-to-dry northern separator; the 136 mm strip to existing rear wall is not usable room area.' });
  model.groundWalls.push({ id: 'gallery-east-water-weather', a: [9300, 6300], b: [9300, 7500],
    t: 519.5, finishedFaces: [9203, 9722.5], structuralCore: [9230, 9370],
    replacesLocalSegmentOf: 'service-spine',
    scope: 'Same retained spine core, new local outside layers; not a second added core. Permanent warm gallery above deep water passage; exterior wall displaces pantry, not indoor gallery.' });
  const cylinder = s.plant.cylinder, buffer = s.plant.primaryBuffer;
  Object.assign(model.groundFurniture, {
    'plant-water-reserve': cylinder.station,
    'plant-primary-buffer-round-bounding600': [buffer.station[0] + 25, buffer.station[1] + 25, 600, 600],
    'plant-controls': s.plant.controlsHydraulics,
    'service-emitter-plant-N': s.plant.emitterJoin.radComplete
  });
  delete model.groundFurniture['pantry-shelf-comparison'];
  assert(model.openings.GROUND.some(o => o.id === 'east-window-2'));
  model.openings.GROUND = model.openings.GROUND.filter(o => o.id !== 'east-window-2');
  model.openings.GROUND.push({ id: 'east-outdoor-water-portal', wall: 'outer-east', centre: 6900,
    width: 1760, finishedWidth: 1200, kind: 'open-service-portal',
    scope: 'Replaces ground east window; no occupied garden access or physical arch capacity acceptance.' });
  return { status: 'WIP JOINED HYPOTHESIS — NOT A SELECTED HOUSE OR COMPLETED HAD PACKET',
    sources: { had: { path: hadPath, blob: blob(hadPath) }, services: { path: servicesPath, blob: blob(servicesPath) } },
    model, passage, bridge, renewal, hydraulicProbe,
    groundEnvelope: { routeLocalLowestTrial: -1000, heaveStress: 300, constructionLoss: 50,
      ventilationReserve: 150, routeLocalDMinimum: 1500, routeLocalDTrial: 1600,
      uniformSolumOrRealExteriorGradeAdopted: false,
      note: 'D1300 was not spare depth. Every actual support/liner low point needs its own ground relation; deeper STR alternatives and real groundwater/terrain remain explicit.' },
    serviceStates: { normal: 'North remains the ordinary route; E has its own court inlet, module and east exterior receiving territory.',
      northMaintenance: 'Retain E and its intake during north liner renewal; actual assigned rainfall/roof bypass remains RWT proof.',
      eastMaintenance: 'North remains assembled and unobstructed during westward E withdrawal; fence off deep court pocket and keep the protected house entry available.',
      failure: 'N mouth blockage/high north receiving head requires E intake and distinct receiving envelope. Whole-site flooding beyond both declared bounds rejects site applicability.' },
    retainedProofBoundary: 'Only exact untouched fields may retain historical fit evidence. Plant, new wall/portal, support, deep pocket and first-wetting joins require actual new checks; no blanket wholeHouseFit pass is inherited.',
    unclosed: ['Court staging pocket/cover/pan first release and guarding must be fully drawn and challenged.',
      'MAT source must bind whole carriage/aperture, release, first wetting and dry enclosure.',
      'Intermediate arch y3300 and full service trunk crossing need actual intrados/tool test.',
      'Actual support continuity, exterior portal, groundwater/receiving head and public approach must be reconciled.'] };
}

function render(v) {
  const scale=.047, px=x=>70+x*scale, py=y=>680-y*scale;
  const rect=(r,color,opacity=1)=>`<rect x="${px(r[0])}" y="${py(r[1]+r[3])}" width="${r[2]*scale}" height="${r[3]*scale}" fill="${color}" opacity="${opacity}"/>`;
  const label=(x,y,t)=>`<text x="${x}" y="${y}" font-size="12" font-family="Arial">${t}</text>`;
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="880" viewBox="0 0 1400 880"><rect width="1400" height="880" fill="#fbfaf5"/>`;
  svg+=label(50,35,'HAD WATER REPLAN · JOINED HYPOTHESIS / NOT ADOPTED');
  svg+=rect([0,0,12000,12000],'#dedbd2');svg+=rect([4250,4250,3500,3500],'#f5efe0');
  for(const w of v.model.groundWalls){const f=w.finishedFaces;if(w.a[0]===w.b[0])svg+=rect([f?.[0]??w.a[0]-w.t/2,w.a[1],f?f[1]-f[0]:w.t,w.b[1]-w.a[1]],'#6d6a62');else svg+=rect([w.a[0],f?.[0]??w.a[1]-w.t/2,w.b[0]-w.a[0],f?f[1]-f[0]:w.t],'#6d6a62');}
  svg+=rect([4800,7750,2400,4250],'#b8dbe5');svg+=rect(v.passage.outdoor,'#a6d8e0');
  svg+=rect(v.passage.waterClear,'#227b99',.8);svg+=rect(v.renewal.courtOpening,'#cb8e5f',.65);
  svg+=rect(v.renewal.operatorField,'#e8c56a',.8);
  for(const [id,r]of Object.entries(v.model.groundFurniture))if(Array.isArray(r)&&r.length===4)svg+=rect(r,'#b2b39d');
  svg+=label(70,735,'North route remains intact; east has a distinct inlet/outlet. Indoor gallery crosses above E.');
  svg+=label(70,758,'Brown: real deep court staging pocket; yellow: provisional operator field.');
  const sx=x=>740+(x-4250)*.065, sz=z=>420-z*.19;
  svg+=label(740,75,'E longitudinal section · FFL 0');
  svg+=`<line x1="740" y1="${sz(0)}" x2="1310" y2="${sz(0)}" stroke="#6d6a62"/>`;
  svg+=`<rect x="${sx(7750)}" y="${sz(-180)}" width="${(9722.5-7750)*.065}" height="${450*.19}" fill="#777268"/>`;
  svg+=`<path d="M${sx(7750)},${sz(-800)} L${sx(12000)},${sz(-850)}" stroke="#227b99" stroke-width="5" fill="none"/>`;
  svg+=`<path d="M${sx(7650)},${sz(-698.82)} L${sx(9822.5)},${sz(-724.38)}" stroke="#227b99" stroke-width="2" fill="none"/>`;
  svg+=`<rect x="${sx(5377.5)}" y="${sz(-80)}" width="${2372.5*.065}" height="${(1072)*.19}" fill="#cb8e5f" opacity=".3"/>`;
  svg+=label(740,665,'Beam trial −180..−630; liner bed −800..−850; no hidden level return.');
  svg+=label(740,690,'Westward release enters a deep pocket, never solid paving/pan.');
  svg+=label(740,715,'Route-local D1500 minimum / D1600 trial; actual site and whole support unresolved.');
  svg+=label(740,760,'Known work: first release, guard/cover/pan, full MAT section, arch/trunk join.');
  return svg+'</svg>\n';
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const v=deriveWaterReplan();
  writeFileSync(new URL('water-replan.json',import.meta.url),JSON.stringify(v,null,2)+'\n');
  writeFileSync(new URL('water-replan.svg',import.meta.url),render(v));
  console.log('Wrote joined unadopted HAD hypothesis and plan/section; unresolved states retained.');
}
