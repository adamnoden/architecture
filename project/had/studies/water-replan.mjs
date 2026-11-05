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
const sorted = x => Array.isArray(x) ? x.map(sorted) : x && typeof x === 'object'
  ? Object.fromEntries(Object.keys(x).sort().map(k => [k, sorted(x[k])])) : x;
export function deriveWaterReplan({servicesText} = {}) {
  const hadPath = 'project/had/studies/open-north-loggia.json';
  assert.equal(blob(hadPath), '25faad2c4d40df2b7da7212f73808843a88d2f52');
  const h = load(hadPath);
  const servicesPath = 'project/mat/studies/east-water-plant.json';
  const s = load(servicesPath);
  const canonicalServicesPath = 'project/mat/studies/whole-house-service-baseline.json';
  const canonicalBytes = Buffer.from(servicesText ?? readFileSync(new URL(canonicalServicesPath, root), 'utf8'));
  assert.equal(createHash('sha1').update(`blob ${canonicalBytes.length}\0`).update(canonicalBytes).digest('hex'),
    'ffe115aa2cd255aaa4d1748e82eb02fae79db075', 'Authenticate complete current Services source');
  const services = JSON.parse(canonicalBytes).interfaces.architecturalServices;
  const servicesProjection = createHash('sha256').update(JSON.stringify(sorted(services))).digest('hex');
  assert.equal(servicesProjection, 'ce0052012cd188bf2f357b4ec1da9b595bd99d779ca9fbd86164876e1e74fc22');
  assert.deepEqual(s.eastWaterHypothesis.finishedPassageY, [6300, 7500]);
  assert.deepEqual(s.plantDryRoom, [9397, 3397, 2173.5, 2383.5]);
  const floorZ = x => -800 - (x - 7750) * 50 / 4250;
  const passage = { outdoor: [9722.5, 6300, 2277.5, 1200],
    waterClear: [7750, 6600, 4250, 600],
    structuralClearY: [6450, 7350],
    bedEnds: [[7750, -800], [12000, -850]],
    outerReceivingWaterMaximumTrial: -1000,
    maintenanceTrackReceivingWaterMaximumTrial: -1250,
    maintenanceTrackDrainLipTrial: [13500, -1100],
    receivingStatus: 'Pre-site admissibility condition only; full flow/head/independence and lawful actual outfall remain unproved.' };
  const bridge = { permanentDryGalleryClearX: [8179.5, 9203],
    coveredX: [7750, 9722.5],
    newEastWeatherWallX: [9203, 9722.5],
    walkingFFL: 0,
    floorLayers: [['stone', 15], ['screed', 65], ['bareCellularGlass', 100], ['RC', 200]],
    slabZ: [-380, -180],
    localSupportBeamZ: [-630, -180],
    localSupportBeamWidths: [600, 900],
    supportAxesX: [7950, 9300], supportAxesY: [6100, 7700],
    supportNodes: { plan: [600, 600], z: [-750, -180] },
    structuralStatus: 'Authored feasibility reservations, not a selected STR member capacity or permission to cut existing structure.' };
  const renewal = { bodyX: [7550, 9850], length: 2300,
    waterClearWidth: 600, waterDepth: 100, wetBodyGrossWidth: 663,
    carriageWidthBudget: 763, carriageBelowBedBudget: 150,
    selectedWithdrawal: 'EAST', selectedParkX: [9850, 12150],
    withdrawalTranslation: 2300,
    servicePlatform: [9722.5, 6000, 3777.5, 2100],
    operatorDeckZ: -900,
    withdrawalTrackClearY: [6450, 7350],
    fixedTrackBelowCarriageBudget: 50,
    withdrawalTrackEndX: 12150,
    withdrawalTrackEndLowestZ: floorZ(12150) - 150 - 50,
    operatorField: [12300, 6450, 1100, 900],
    northOperatorStrip: [9850, 7350, 3650, 750],
    hoistWorkingBox: [9850, 6300, -900, 2300, 1500, 3000],
    hoistLiftTranslation: 1200,
    courtIntakeWell: [6650, 6300, 1100, 1200],
    courtIntakeWellFloorZ: -950,
    courtIntakeOperatorPlatform: [6750, 6450, 600, 900],
    courtIntakeOperatorPlatformZ: -800,
    courtIntakeAccess: { fixedSteps: [6750, 6300, 600, 600],
      riseMaximum: 180, method: 'Four controlled rises from the local court surface to the standing platform; guard installed and incoming court water isolated before entry. Not ordinary court access.' },
    guardOuterPlan: [6600, 6250, 1150, 1300], guardTopAboveLocalCourt: 1100,
    courtCollector: { plan: [7300, 6300, 450, 1450], surfaceReachable: true,
      northSurfaceLipZ: -110, northChannelBedZ: -180,
      lowChannelAtIntakeZ: -200,
      commonFaultBoundary: 'Entire N mouth x4800..7200 disabled; E collector starts x7300, with its own through-ring route and separate east head condition. No immunity to whole-court debris blanket or whole-site flood is claimed.' },
    shield: { representation: 'OUTER REMOVABLE HOOD ENVELOPE, NOT A SOLID WATER BARRIER',
      plan: [7350, 6450, 200, 900], z: [-900, -110],
      clearGravityShaft: { plan: [7350, 6600, 200, 600], z: [-797.6470588235294, -110] },
      clearOutlet: { planeX: 7550, y: [6600, 7200], z: [-797.6470588235294, -697.6470588235294] },
      splashDeflector: { reservedOuterRadius: 100, clearInsideTurnRadiusMinimum: 75,
        status: 'Reference splash/energy-break territory wholly in accessible exterior well; no splash/capacity rating.' },
      release: 'Remove complete shield upward inside the guarded intake well after stopping court inflow; capture before fixing release. No shield or keeper is extracted through the beam aperture.' },
    courtStagingPocketSelected: false,
    materialStatus: 'All body, backing, supports, keepers, lifting and first-release geometry must join the MAT source before adoption.',
    rejectedOldEastBodyParkX: [9822.5, 11995],
    rejectedOldEastReason: 'Only 5 mm to original exterior face before operator/hoist. The NEW explicit 1500 mm outboard platform is a real architectural/site cost.',
    rejectedWestReason: 'Requires deep staging through permanent court pan, further travel to clear the actual beam, and restricts the normal north approach. Not selected.',
    selectedSequence: ['Retain and verify the separate N water route; isolate E intake and install guards before removing any cover.',
      'Remove and mechanically park all open E receiving/liner/guard segments over the selected draw track, with their independent supports retained outside the swept body.',
      'Enter the guarded court intake service well, capture/remove splash shield, release upstream joint outside court beam; release outer joint/keeper outside widened spine beam.',
      'Capture the full carriage on a positively retained sloping transfer track. Draw 2300 east along the actual fall; no preliminary vertical lift through the beam.',
      'Only after body west end reaches x9850, hoist 1200 vertically in the open E work box and move to the explicit outside storage/operator area.',
      'Reverse with captured body, reinstate both joints/shield/receivers and covers, inspect/test then reopen E. N never dismantled by this sequence.'],
    courtCost: 'One guarded intake/service well, not a court-length staging pocket; outdoor E track requires a depressed opening below the raised operator deck.' };
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
    finishedFaces: [3203, 3397], structuralCore: [3230, 3370], holes: [services.eastWaterJoin.intermediateArch.rawOpeningX] });
  model.groundWalls.push({ id: 'east-passage-north-weather', a: [9397, 7922.5], b: [12000, 7922.5],
    t: 519.5, finishedFaces: [7500, 8019.5], structuralCore: [7852.5, 7992.5],
    scope: 'Outdoor-to-dry northern separator; the 136 mm strip to existing rear wall is not usable room area.' });
  model.groundWalls.push({ id: 'gallery-east-water-weather', a: [9300, 6300], b: [9300, 7500],
    t: 519.5, finishedFaces: [9203, 9722.5], structuralCore: [9230, 9370],
    replacesLocalSegmentOf: 'service-spine',
    scope: 'Same retained spine core, new local outside layers; not a second added core. Permanent warm gallery above deep water passage; exterior wall displaces pantry, not indoor gallery.' });
  const cylinder = services.plant.cylinder, buffer = services.plant.primaryBuffer;
  Object.assign(model.groundFurniture, {
    'plant-water-reserve': cylinder.station,
    'plant-primary-buffer-round-bounding600': [buffer.station[0] + 25, buffer.station[1] + 25, 600, 600],
    'plant-controls': services.plant.controlsHydraulics,
    'service-emitter-plant-N': services.plant.emitterJoin.radComplete
  });
  delete model.groundFurniture['pantry-shelf-comparison'];
  assert(model.openings.GROUND.some(o => o.id === 'east-window-2'));
  model.openings.GROUND = model.openings.GROUND.filter(o => o.id !== 'east-window-2');
  model.openings.GROUND.push({ id: 'east-outdoor-water-portal', wall: 'outer-east', centre: 6900,
    width: 1760, finishedWidth: 1200, kind: 'open-service-portal',
    scope: 'Replaces ground east window; no occupied garden access or physical arch capacity acceptance.' });
  model.architecturalServices = services;
  model.servicesProjection = { source: { path: canonicalServicesPath, blob: blob(canonicalServicesPath), projectionSha256: servicesProjection },
    keyedFieldsEqual: true, method: 'Exact full canonical object import, no numeric whitelist or local copied service inventory.' };
  model.servicesInterface.plant = { controls: services.plant.controlsHydraulics, buffer,
    riser: services.plant.riserGross, cylinder };
  model.servicesInterface.source = model.servicesProjection.source;
  model.servicesInterface.emitters = services.emitters.map(e => ({id:e.id,level:e.level,
    plan:e.completePlanWithValvesAndBrackets,z:[e.bottomLocal,e.topLocal],
    renewalLift:e.renewal.requiredLift,renewalPull:e.renewal.requiredFrontPull,
    cillUnderside:e.renewal.cillUndersideMinimumIfUnderWindow,cillTop:e.renewal.requiredDrawnSillTopIfUnderWindow}));
  model.servicesAuxiliaryProjection = { keyedFieldsEqual:true,
    sourceBlob:blob(canonicalServicesPath), fields:['interfaces.architecturalServices.plant.cylinder','interfaces.architecturalServices.emitters'],
    method:'Derived from exact current object; the historical MAT9476 auxiliary stamp is not reused.' };
  model.status = 'UNADOPTED JOINED WATER REPLAN; historical selected geometry is its input, not its current pass.';
  model.internalArchControls = services.eastWaterJoin.archControls;
  model.pantrystandardDoor = { operation: 'REMOVED with the former pantry; retaining its inward swing intersects the new weather wall.', inheritedDoor: h.pantrystandardDoor };
  model.pantryReplacement = { oldShelfComparisonDeleted: true,
    cost: 'Dedicated adjacent pantry lost; the brief requires useful reachable food storage and a clear approach. No untested upper cupboard or standing on the sink is credited as replacement.',
    rejectedUpperCabinet: { plan:[8700,11220.5,900,350],z:[1800,2600],
      reason:'Original R300 task overlapped the sink by250; moving back defeats600 reach and upper daily-storage claim. Retained only as a rejected comparison.' },
    disposition: 'Architectural programme/food-storage trade must be resolved before source adoption.' };
  model.wholeHouseFit = { pass: false, scope: 'New joined affected geometry still being challenged; historical whole-house pass does not apply automatically.' };
  model.knownRejectedGeometry = { intermediateDividerAt3300: {
    westPier: [9300,3203,350,194], protectedPlantDoorRawY: [2750,3650],
    remainingRawDoorPiecesY: [[2750,3203],[3397,3650]],
    bodyDiameter: 600, pass: false,
    reason: 'Moved divider west pier splits the actual spine door into453/253 raw pieces; neither admits600 body. Intrados-only checks do not prove whole-house connectivity.' },
    requiredCorrection: 'Remove the unnecessary internal open divider and reserve independent support for the actual upper wall at3700; Services must recompose radiator/controls and retain a clear body/trunk entry.' };
  model.selection = { decision: 'UNADOPTED JOINED WATER REPLAN', source: 'project/had/water-replan-result.md' };
  return { status: 'WIP JOINED HYPOTHESIS — NOT A SELECTED HOUSE OR COMPLETED HAD PACKET',
    sources: { had: { path: hadPath, blob: blob(hadPath) }, services: { path: canonicalServicesPath, blob: blob(canonicalServicesPath), projectionSha256: servicesProjection } },
    model, passage, bridge, renewal, hydraulicProbe,
    groundEnvelope: { routeLocalLowestTrial: -1000, heaveStress: 300, constructionLoss: 50,
      ventilationReserve: 150, routeLocalDMinimum: 1500, routeLocalDTrial: 1600,
      fullSelectedTrackLowest: renewal.withdrawalTrackEndLowestZ,
      fullSelectedTrackMinimumD: -renewal.withdrawalTrackEndLowestZ + 500,
      uniformSolumOrRealExteriorGradeAdopted: false,
      note: 'D1300 was not spare depth. Every actual support/liner low point needs its own ground relation; deeper STR alternatives and real groundwater/terrain remain explicit.' },
    serviceStates: { normal: 'North remains the ordinary route; E has its own court inlet, module and east exterior receiving territory.',
      northMaintenance: 'Retain E and its intake during north liner renewal; actual assigned rainfall/roof bypass remains RWT proof.',
      eastMaintenance: 'North remains assembled and unobstructed during eastward E withdrawal; fence intake well/track and keep the protected house entry available.',
      failure: 'N mouth blockage/high north receiving head requires E intake and distinct receiving envelope. Whole-site flooding beyond both declared bounds rejects site applicability.' },
    retainedProofBoundary: 'Only exact untouched fields may retain historical fit evidence. Plant, new wall/portal, support, deep pocket and first-wetting joins require actual new checks; no blanket wholeHouseFit pass is inherited.',
    unclosed: ['Court intake well/cover/pan first release and guarding must be fully drawn and challenged.',
      'Intermediate3300 divider pier blocks the actual protected Plant door. This WIP is positively rejected for adoption until the wall/body topology is corrected.',
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
  svg+=rect(v.renewal.servicePlatform,'#d9c9a7',.7);
  svg+=rect(v.passage.waterClear,'#227b99',.8);svg+=rect(v.renewal.courtIntakeWell,'#cb8e5f',.65);
  svg+=rect([v.renewal.selectedParkX[0],6450,v.renewal.length,900],'#227b99',.25);
  svg+=rect(v.renewal.operatorField,'#e8c56a',.8);
  for(const [id,r]of Object.entries(v.model.groundFurniture))if(Array.isArray(r)&&r.length===4)svg+=rect(r,'#b2b39d');
  svg+=label(70,735,'North remains intact. East module withdraws to a real outboard service platform at x13500.');
  svg+=label(70,758,'Brown: guarded intake well only. No court-length staging pocket. Yellow: operator field.');
  const sx=x=>740+(x-4250)*.065, sz=z=>420-z*.19;
  svg+=label(740,75,'E longitudinal section · FFL 0');
  svg+=`<line x1="740" y1="${sz(0)}" x2="1310" y2="${sz(0)}" stroke="#6d6a62"/>`;
  svg+=`<rect x="${sx(7750)}" y="${sz(-180)}" width="${(9722.5-7750)*.065}" height="${450*.19}" fill="#777268"/>`;
  svg+=`<path d="M${sx(7750)},${sz(-800)} L${sx(12000)},${sz(-850)}" stroke="#227b99" stroke-width="5" fill="none"/>`;
  svg+=`<path d="M${sx(7650)},${sz(-698.82)} L${sx(9822.5)},${sz(-724.38)}" stroke="#227b99" stroke-width="2" fill="none"/>`;
  svg+=`<rect x="${sx(6650)}" y="${sz(-80)}" width="${1100*.065}" height="${870*.19}" fill="#cb8e5f" opacity=".3"/>`;
  svg+=`<rect x="${sx(9850)}" y="${sz(-700)}" width="${2300*.065}" height="${250*.19}" fill="#227b99" opacity=".25"/>`;
  svg+=label(740,665,'Beam trial −180..−630; liner bed −800..−850; no hidden level return.');
  svg+=label(740,690,'EAST release: parked x9850..12150; depressed track under a separate operator deck.');
  svg+=label(740,715,'Track/local D1551.8 minimum / D1600 trial; actual site/support unaccepted.');
  svg+=label(740,760,'New site cost: 1500 mm beyond east face, independent receiving/head and garden access.');
  return svg+'</svg>\n';
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const v=deriveWaterReplan();
  writeFileSync(new URL('water-replan.json',import.meta.url),JSON.stringify(v,null,2)+'\n');
  writeFileSync(new URL('water-replan.svg',import.meta.url),render(v));
  console.log('Wrote joined unadopted HAD hypothesis and plan/section; unresolved states retained.');
}
