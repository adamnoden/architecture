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
const pointRectDistance=(p,r)=>Math.hypot(Math.max(r[0]-p[0],0,p[0]-r[0]-r[2]),Math.max(r[1]-p[1],0,p[1]-r[1]-r[3]));
const pointSegmentDistance=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/d)):0;return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);};
function segmentRectDistance(a,b,r){
  let lo=0,hi=1;const dx=b[0]-a[0],dy=b[1]-a[1];
  for(const[p,q]of[[-dx,a[0]-r[0]],[dx,r[0]+r[2]-a[0]],[-dy,a[1]-r[1]],[dy,r[1]+r[3]-a[1]]]){
    if(!p){if(q<0){lo=2;break;}}else{const t=q/p;if(p<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);}
  }
  if(lo<=hi)return 0;
  return Math.min(pointRectDistance(a,r),pointRectDistance(b,r),...[[r[0],r[1]],[r[0]+r[2],r[1]],[r[0],r[1]+r[3]],[r[0]+r[2],r[1]+r[3]]].map(p=>pointSegmentDistance(p,a,b)));
}
// Scene occurrences are checked independently of the authenticated full-object import.
export function verifyServicesOccurrences(model, current) {
  const services = current.interfaces.architecturalServices;
  assert.deepEqual(model.architecturalServices, services, 'Imported Services object drift');
  for (const e of services.emitters) {
    const furniture = e.level === 0 ? model.groundFurniture : model.upperFurniture;
    assert.deepEqual(furniture['service-emitter-' + e.id], e.completePlanWithValvesAndBrackets,
      'Actual emitter furniture drift: ' + e.id);
    const projected = model.servicesInterface.emitters.find(q => q.id === e.id);
    assert.deepEqual(projected.plan, e.completePlanWithValvesAndBrackets, 'Emitter plan projection drift');
    assert.deepEqual(projected.z, [e.bottomLocal, e.topLocal], 'Emitter height projection drift');
  }
  for (const e of services.fanAccess) {
    const published = current.extract.find(q => q.id === e.id);
    const actual = model.servicesInterface.extract.find(q => q.id === e.id);
    const expected = { id:e.id, level:e.level, podPlan:e.podPlan, podZ:e.podZ,
      platform:e.maintenancePlatformPlan, workingHeight:e.maintenancePlatformWorkingHeightRange,
      mainPort:e.path.at(-1), condensatePort:e.ceilingTrapDrainPort,
      maintenanceFurniture:published.maintenanceFurniture ?? null };
    assert.deepEqual(actual, expected, 'Actual extract occurrence drift: ' + e.id);
    assert.deepEqual(model.serviceMaintenanceFields.find(q => q.id === e.id).platform,
      e.maintenancePlatformPlan, 'Actual fan maintenance field drift: ' + e.id);
    assert.deepEqual(model.servicesAuxiliaryProjection.fanMaintenance.find(q => q.id === e.id),
      {id:e.id, maintenanceFurniture:published.maintenanceFurniture ?? null, doorMode:published.doorMode},
      'Actual fan task/door-mode drift: ' + e.id);
  }
  return { emitters:services.emitters.length, extractTasks:services.fanAccess.length, pass:true,
    scope:'Current actual furniture, emitter heights, extract ports/platforms and fan task states; component equality does not establish whole-house acceptance.' };
}
export function deriveWaterReplan({servicesText} = {}) {
  const hadPath = 'project/had/studies/open-north-loggia.json';
  assert.equal(blob(hadPath), '25faad2c4d40df2b7da7212f73808843a88d2f52');
  const h = load(hadPath);
  const servicesPath = 'project/mat/studies/east-water-plant.json';
  const s = load(servicesPath);
  const canonicalServicesPath = 'project/mat/studies/whole-house-service-baseline.json';
  const canonicalBytes = Buffer.from(servicesText ?? readFileSync(new URL(canonicalServicesPath, root), 'utf8'));
  assert.equal(createHash('sha1').update(`blob ${canonicalBytes.length}\0`).update(canonicalBytes).digest('hex'),
    '3e934b29d9f328b41cb9bd2498184154090492c0', 'Authenticate complete current Services source');
  const currentServices = JSON.parse(canonicalBytes);
  const services = currentServices.interfaces.architecturalServices;
  const servicesProjection = createHash('sha256').update(JSON.stringify(sorted(services))).digest('hex');
  assert.equal(servicesProjection, 'a2bf80bfb19d973a01ef22948942909e386400b4a93a273d362b362a2349c4a2');
  assert.deepEqual(s.eastWaterHypothesis.finishedPassageY, [6300, 7500]);
  assert.deepEqual(s.plantDryRoom, [9397, 3797, 2173.5, 1983.5]);
  const floorZ = x => -800 - (x - 7750) * 50 / 4250;
  const groundSourcePath='project/str/studies/ground-interfaces.json';
  const outerRoute=load(groundSourcePath).foundation_routes.find(r=>r.id==='outer-east');
  assert.equal(outerRoute.a[0],11667.5);
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
    floorLayerExtent: 'Occupied layers apply only to permanentDryGalleryClearX; walls bear on their actual RC members, never on screed or floor glass.',
    slabZ: [-380, -180],
    localSupportBeamZ: [-630, -180],
    localSupportBeamWidths: [600, 900],
    supportAxesX: [7950, 9300], supportAxesY: [6100, 7700],
    supportNodes: { plan: [600, 600], z: [-750, -180] },
    outerSupportReservation:{ source:{path:groundSourcePath,blob:blob(groundSourcePath),route:outerRoute},
      axisX:11667.5,fullX:[11217.5,12117.5],beamZ:[-630,-180],
      nodeAxesY:[6000,7800],nodePlan:[900,600],nodeZ:[-750,-180],
      authority:'NEW bounded feasibility envelope around the actual STR common-support line, not an adopted footing size or qualified capacity. It preserves support rather than deleting it.',
      reentry:'If actual common support needs a wider/deeper body or nodes in the water opening, STR must reopen this source before admission.' },
    structuralStatus: 'Authored feasibility reservations, not a selected STR member capacity or permission to cut existing structure.' };
  const renewal = { bodyX: [7550, 9850], length: 2300,
    waterClearWidth: 600, waterDepth: 100, wetBodyGrossWidth: 663,
    carriageWidthBudget: 763, carriageBelowBedBudget: 150,
    selectedWithdrawal: 'EAST', selectedParkX: [12250, 14550],
    withdrawalTranslation: 4700,
    servicePlatform: [9722.5, 6000, 6077.5, 2100],
    operatorDeckZ: -900,
    withdrawalTrackClearY: [6450, 7350],
    fixedTrackBelowCarriageBudget: 50,
    withdrawalTrackEndX: 14550,
    withdrawalTrackEndLowestZ: floorZ(14550) - 150 - 50,
    operatorField: [14700, 6450, 1100, 900],
    northOperatorStrip: [12250, 7350, 3550, 750],
    northStripMode:'Horizontal setup only; vacate and guard the hoist box during lifting. End operator field is independent of that box.',
    hoistWorkingBox: [12250, 6300, -900, 2300, 1500, 3000],
    hoistLiftTranslation: 1200,
    courtIntakeWell: [6125, 6300, 1525, 1100],
    courtIntakeWellFloorZ: -950,
    courtIntakeOperatorPlatform: [6725, 6450, 600, 900],
    courtIntakeOperatorPlatformZ: -800,
    courtIntakeAccess: { fixedSteps: [6125, 6600, 600, 600],
      topLandingZ:-80,lowerLandingZ:-800,rises:4,going:200,riseMaximum:180,
      method: 'Four180 rises/three200 goings run EAST from west guard gate to a separate flat600x900 working platform. Level adapter must fit local sloping court; no stairs overlap the standing footprint. Guard before covers; isolate court water before entry.' },
    guardOuterPlan: [6075, 6250, 1625, 1200], guardTopAboveLocalCourt: 1100,
    guardGate:{planeX:6075,rawY:[6550,7250],frameEach:25,clearY:[6575,7225],
      hinge:[6075,7222.5],completeLeaf:[645,40,1100],opening:'WEST into court, latched before covers are released',
      fullOpenPlan:[5430,7202.5,645,40],
      sequence:'Install full guard while rated walking covers remain intact; open/latch gate with all covers still present; then capture/remove covers. Descent occurs through the650-clear gate into the separate600-wide steps, never across an unguarded side.',
      topAdapterZ:[-16,8],topAdapterStatus:'Explicit levelling adapter required between the local court slope and -80 maintenance stair landing; no ordinary walking or generic step compliance pass.' },
    temporaryTrackDeck:{x:[9850,14550],clearY:[6450,7350],topZ:-900,thicknessBudget:50,
      panelCount:8,panelLength:587.5,hingeY:6450,openPanelY:[6425,6475],
      sequence:'After joint release, retreat EAST on retained closed panels. Open/latch each panel behind the worker from the next retained panel; the final panel is operated from the fixed end deck. All eight are vertically parked before drawing the carriage; no worker stands alongside the moving body in the narrow passage.',
      bodyCentreOffsetBeyondPanel:325,bodyRadius:300,
      installedQualification:'Reference first-motion geometry only. Actual hinge/lock/cover loads, capture/force and guard hardware require matched qualification.' },
    courtCollector: { plan: [7300, 6300, 350, 1450], surfaceReachable: true,
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
      'Only after body west end reaches x12250, wholly beyond the reserved outer support ending12117.5, hoist1200 vertically in the open E work box.',
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
  Object.assign(wall('plant-intermediate-arch'), { holes: [services.eastWaterJoin.intermediateArch.rawOpeningX] });
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
  for (const e of services.emitters)
    (e.level===0 ? model.groundFurniture : model.upperFurniture)['service-emitter-'+e.id] = e.completePlanWithValvesAndBrackets;
  model.servicesInterface.extract = services.fanAccess.map(e => ({id:e.id, level:e.level,
    podPlan:e.podPlan, podZ:e.podZ, platform:e.maintenancePlatformPlan,
    workingHeight:e.maintenancePlatformWorkingHeightRange, mainPort:e.path.at(-1),
    condensatePort:e.ceilingTrapDrainPort,
    maintenanceFurniture:currentServices.extract.find(q=>q.id===e.id).maintenanceFurniture ?? null}));
  model.servicesAuxiliaryProjection = { keyedFieldsEqual:true,
    fanMaintenance:currentServices.extract.map(e=>({id:e.id,maintenanceFurniture:e.maintenanceFurniture??null,doorMode:e.doorMode})),
    sourceBlob:blob(canonicalServicesPath), fields:['interfaces.architecturalServices.plant.cylinder','interfaces.architecturalServices.emitters','interfaces.architecturalServices.fanAccess','extract[].maintenanceFurniture/doorMode'],
    method:'Derived from exact current object; the historical MAT9476 auxiliary stamp is not reused.' };
  model.servicesOccurrenceProof = verifyServicesOccurrences(model, currentServices);
  model.status = 'UNADOPTED JOINED WATER REPLAN; historical selected geometry is its input, not its current pass.';
  model.internalArchControls = services.eastWaterJoin.archControls;
  model.plantReferenceDoor={...services.eastWaterJoin.operatorEntry,
    frameApertureWidth:services.eastWaterJoin.operatorEntry.clearReferenceY[1]-services.eastWaterJoin.operatorEntry.clearReferenceY[0],
    effectiveOpenWidth:services.eastWaterJoin.operatorEntry.fullyOpenEastLeaf[1]-services.eastWaterJoin.operatorEntry.clearReferenceY[0],
    baseboardTermination:'No18mm projection behind the fully parked reference leaf; this is an actual local finish termination, not a collision exception.'};
  model.pantrystandardDoor = { operation: 'REMOVED with the former pantry; retaining its inward swing intersects the new weather wall.', inheritedDoor: h.pantrystandardDoor };
  model.pantryReplacement = { oldShelfComparisonDeleted: true,
    cost: 'Dedicated adjacent pantry lost. The owning brief ledger does not fix a dedicated pantry; retain useful reachable food storage and a real approach. Household bulk capacity remains open.',
    rejectedUpperCabinet: { plan:[8700,11220.5,900,350],z:[1800,2600],
      reason:'Original R300 task overlapped the sink by250; moving back defeats600 reach and upper daily-storage claim. Retained only as a rejected comparison.' },
    selectedLowLarder: { completeBody:[9650,11370.5,1000,200], z:[0,900],
      drawers:{ columns:2,rows:3,maximumTravel:200,handleProjection:0,
        handle:'Recessed front pull; no projecting handle omitted from the complete closed footprint.',
        internalBudgetEach:[440,150,200], geometricInternalLitres:79.2,
        scope:'Six explicit small drawer territories; geometric volume, not a supplier or household-capacity acceptance.' },
      operator:{ bodyRadius:300,closedCentre:[10200,11045.5],openCentre:[10200,10845.5],
        maximumReferenceReach:600,shoulderToGripHeightDifference:200 },
      approach:[[8700,8771.25],[10200,8771.25],[10200,11045.5]],
      windowBody:[10425,11045.5],windowHandle:[10620,11570.5],
      scope:'Low 200-deep larder between sink and cooker, with50/100 side territories, below the1050cill. Whole counter/cabinet remains fixed during window tasks. No chair or table is moved.' },
    disposition:'Test the low larder as the functional replacement before considering an annex or a long hidden wet body.' };
  const larder=model.pantryReplacement.selectedLowLarder;
  model.groundFurniture['low-food-larder']=larder.completeBody;
  const kitchenBounds=model.rooms.kitchenDining.bounds;
  const inKitchen=r=>r[0]<kitchenBounds[0]+kitchenBounds[2]&&r[0]+r[2]>kitchenBounds[0]&&r[1]<kitchenBounds[1]+kitchenBounds[3]&&r[1]+r[3]>kitchenBounds[1];
  const kitchenSolids=Object.entries(model.groundFurniture).filter(([,r])=>Array.isArray(r)&&r.length===4&&inKitchen(r));
  const bodyPath=(points,excluded=[])=>{
    let minimum=Infinity,controlling=null;
    for(let i=1;i<points.length;i++)for(const[id,r]of kitchenSolids){
      if(excluded.includes(id))continue;
      const reserve=segmentRectDistance(points[i-1],points[i],r)-300;
      if(reserve<minimum){minimum=reserve;controlling={id,segment:i-1};}
    }
    return {minimumReserve:minimum,controlling,pass:minimum>=0};
  };
  const drawerMotion=Array.from({length:201},(_,i)=>{
    const displacement=i;
    const body=[10200,11045.5-displacement];
    const front=11370.5-displacement;
    return {displacement,body,front,bodyToFront:front-body[1]-300,
      maximumGripReach:Math.max(...[9900,10400].map(x=>Math.hypot(x-body[0],front-body[1],200)))};
  });
  const larderProof={approach:bodyPath(larder.approach),
    drawerBodyPath:bodyPath([larder.operator.closedCentre,larder.operator.openCentre]),
    drawerToBodyMinimum:Math.min(...drawerMotion.map(p=>p.bodyToFront)),
    maximumReferenceGripReach:Math.max(...drawerMotion.map(p=>p.maximumGripReach)),
    windowApproach:bodyPath([[10200,11045.5],larder.windowBody]),
    windowPlanReach:Math.hypot(larder.windowHandle[0]-larder.windowBody[0],larder.windowHandle[1]-larder.windowBody[1]),
    drawerClosedWindowState:true,unchangedChairsAndTable:true,
    actualHardwareOrAllPeopleQualified:false};
  larderProof.pass=larderProof.approach.pass&&larderProof.drawerBodyPath.pass&&larderProof.drawerToBodyMinimum>=25&&
    larderProof.maximumReferenceGripReach<=600&&larderProof.windowApproach.pass&&larderProof.windowPlanReach<=600;
  assert(larderProof.pass,'Actual low-larder approach/drawer/body/window geometry fails');
  model.pantryReplacement.proof=larderProof;
  model.windowRequirements=model.windowRequirements.map(w=>w.id==='kitchen10200'?{...w,body:larder.windowBody,
    planReach:larderProof.windowPlanReach,requirement:'Actual low200deep foodbase retained; drawer CLOSED during window task. Existing supplier/vertical/leaf qualification limits remain.'}:w);
  model.actions.witnesses=model.actions.witnesses.filter(w=>!['kitchen-pantry-open-door-approach','kitchen-north-window10200'].includes(w.id));
  model.actions.witnesses.push({id:'low-larder-and-revised-kitchen-window',level:'GROUND',bodyRadius:300,
    points:[...larder.approach,larder.windowBody],state:'All table/chairs retained; low-larder drawers CLOSED during window task.',
    pass:larderProof.pass,scope:'Affected body/reach reference only; no historical whole-house or actual-hardware pass transferred.'});
  model.wholeHouseFit = { pass: false, scope: 'New joined affected geometry still being challenged; historical whole-house pass does not apply automatically.' };
  model.currentAdoptionBlockers=[
    'The new outer900 support envelope and12250..14550 whole park are authored feasibility geometry, not yet joined to the MAT outer-hoist acceptance prover.',
    'Temporary walking deck at-900 has only270 headroom below the retained outer support at-630. Walking retreat through that support and900-high hinged cover opening are NOT feasible as currently described. No maintenance first-motion pass.',
    'Guard gate, covers, actual rigging and intake/first-wetting/air/thermal joints require joined checking. Canonical health now checks the actual HAD/MAT producers; physical and architectural admission remain separate.'
  ];
  model.knownRejectedGeometry = { intermediateDividerAt3300: {
    westPier: [9300,3203,350,194], protectedPlantDoorRawY: [2750,3650],
    remainingRawDoorPiecesY: [[2750,3203],[3397,3650]],
    bodyDiameter: 600, pass: false,
    reason: 'Moved divider west pier splits the actual spine door into453/253 raw pieces; neither admits600 body. Intrados-only checks do not prove whole-house connectivity.' },
    selectedCorrection: 'Retain original3700 wall and upper bearing alignment; narrow only its raw opening to1275, move full radiator5east, and reprove the full700 station/body entry and900x700 cylinder task.' };
  model.selection = { decision: 'UNADOPTED JOINED WATER REPLAN', source: 'project/had/water-replan-result.md' };
  return { status: 'WIP JOINED HYPOTHESIS — NOT A SELECTED HOUSE OR COMPLETED HAD PACKET',
    sources: { had: { path: hadPath, blob: blob(hadPath) }, services: { path: canonicalServicesPath, blob: blob(canonicalServicesPath), projectionSha256: servicesProjection } },
    model, passage, bridge, renewal, hydraulicProbe,
    groundEnvelope: { routeLocalLowestTrial: -1000, heaveStress: 300, constructionLoss: 50,
      ventilationReserve: 150, routeLocalDMinimum: 1500, routeLocalDTrial: 1700,
      fullSelectedTrackLowest: renewal.withdrawalTrackEndLowestZ,
      fullSelectedTrackMinimumD: -renewal.withdrawalTrackEndLowestZ + 500,
      uniformSolumOrRealExteriorGradeAdopted: false,
      note: 'D1300 was not spare depth. Every actual support/liner low point needs its own ground relation; deeper STR alternatives and real groundwater/terrain remain explicit.' },
    serviceStates: { normal: 'North remains the ordinary route; E has its own court inlet, module and east exterior receiving territory.',
      northMaintenance: 'Retain E and its intake during north liner renewal; actual assigned rainfall/roof bypass remains RWT proof.',
      eastMaintenance: 'North remains assembled and unobstructed during eastward E withdrawal; fence intake well/track and keep the protected house entry available.',
      failure: 'N mouth blockage/high north receiving head requires E intake and distinct receiving envelope. Whole-site flooding beyond both declared bounds rejects site applicability.' },
    retainedProofBoundary: 'Only exact untouched fields may retain historical fit evidence. Plant, new wall/portal, support, deep pocket and first-wetting joins require actual new checks; no blanket wholeHouseFit pass is inherited.',
    unclosed: [...model.currentAdoptionBlockers,
      'Actual support continuity, groundwater/receiving head and public approach remain unearned. Retained3700 door/arch and low-larder component checks do not establish whole-house or hydraulic acceptance.'] };
}

function render(v) {
  const scale=Math.min(.047,640/(v.renewal.servicePlatform[0]+v.renewal.servicePlatform[2])), px=x=>70+x*scale, py=y=>680-y*scale;
  const rect=(r,color,opacity=1)=>`<rect x="${px(r[0])}" y="${py(r[1]+r[3])}" width="${r[2]*scale}" height="${r[3]*scale}" fill="${color}" opacity="${opacity}"/>`;
  const label=(x,y,t)=>`<text x="${x}" y="${y}" font-size="12" font-family="Arial">${t}</text>`;
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="880" viewBox="0 0 1400 880"><rect width="1400" height="880" fill="#fbfaf5"/>`;
  svg+=label(50,35,'HAD WATER REPLAN · JOINED HYPOTHESIS / NOT ADOPTED');
  svg+=rect([0,0,12000,12000],'#dedbd2');svg+=rect([4250,4250,3500,3500],'#f5efe0');
  // Draw the source's actual open intervals, rather than painting doors solid.
  for(const w of v.model.groundWalls){
    const vertical=w.a[0]===w.b[0],axis=vertical?1:0,f=w.finishedFaces;
    const start=Math.min(w.a[axis],w.b[axis]),end=Math.max(w.a[axis],w.b[axis]);
    const holes=(w.holes??[]).map(q=>[Math.max(start,q[0]),Math.min(end,q[1])]).filter(q=>q[1]>q[0]).sort((a,b)=>a[0]-b[0]);
    let cursor=start;for(const [lo,hi]of [...holes,[end,end]]){
      if(lo>cursor)svg+=rect(vertical?[f?.[0]??w.a[0]-w.t/2,cursor,f?f[1]-f[0]:w.t,lo-cursor]:[cursor,f?.[0]??w.a[1]-w.t/2,lo-cursor,f?f[1]-f[0]:w.t],'#6d6a62');
      cursor=Math.max(cursor,hi);
    }
  }
  svg+=rect([4800,7750,2400,4250],'#b8dbe5');svg+=rect(v.passage.outdoor,'#a6d8e0');
  svg+=rect(v.renewal.servicePlatform,'#d9c9a7',.7);
  svg+=rect(v.passage.waterClear,'#227b99',.8);svg+=rect(v.renewal.courtIntakeWell,'#cb8e5f',.65);
  svg+=rect([v.renewal.selectedParkX[0],6450,v.renewal.length,900],'#227b99',.25);
  svg+=rect(v.renewal.operatorField,'#e8c56a',.8);
  for(const [id,r]of Object.entries(v.model.groundFurniture))if(Array.isArray(r)&&r.length===4)svg+=rect(r,'#b2b39d');
  for(const [name,x,y]of [['STUDY',1500,1800],['FRONT / STAIR',6000,2600],['UTILITY',10400,1900],['PLANT',10350,4650],['LIVING',2300,10000],['KITCHEN / DINING',9700,9500],['OPEN COURT',5250,6100],['N LOGGIA',5400,10700]])
    svg+=label(px(x),py(y),name);
  svg+=label(70,708,'GROUND: retained rooms and furnished fields; dark walls show actual opening intervals.');
  svg+=label(70,735,`East proposal work field ends at x${v.renewal.servicePlatform[0]+v.renewal.servicePlatform[2]}; first-motion sequence remains UNPROVED.`);
  svg+=label(70,758,'Brown: guarded intake well only. No court-length staging pocket. Yellow: operator field.');
  const sx=x=>740+(x-4250)*.052, sz=z=>420-z*.19;
  svg+=label(740,75,'E longitudinal section · FFL 0');
  svg+=`<line x1="740" y1="${sz(0)}" x2="1310" y2="${sz(0)}" stroke="#6d6a62"/>`;
  const sectionRect=(x0,x1,top,bottom,color)=>`<rect x="${sx(x0)}" y="${sz(top)}" width="${(x1-x0)*.052}" height="${(top-bottom)*.19}" fill="${color}"/>`;
  for(let i=0;i<v.bridge.supportAxesX.length;i++){
    const x=v.bridge.supportAxesX[i],w=v.bridge.localSupportBeamWidths[i];
    svg+=sectionRect(x-w/2,x+w/2,v.bridge.localSupportBeamZ[1],v.bridge.localSupportBeamZ[0],'#777268');
  }
  let top=0;for(const [i,layer]of v.bridge.floorLayers.entries()){
    svg+=sectionRect(...v.bridge.permanentDryGalleryClearX,top,top-layer[1],['#e9d6b5','#cecabd','#b3dfd8','#c4c8cc'][i]);top-=layer[1];
  }
  svg+=sectionRect(7750,8179.5,1000,-180,'#b4ada1');
  let face=v.bridge.newEastWeatherWallX[0];
  for(const [i,layer]of v.model.weather.layersRoomToWeather.entries()){
    svg+=sectionRect(face,face+layer[1],1000,-180,['#ded8ce','#9f998e','#b3dfd8','#fbfaf5','#b9846e'][i]);face+=layer[1];
  }
  svg+=label(740,200,'Dry gallery 8179.5..9203; floor layers end at the bearing walls.');
  svg+=label(740,224,'East 27/140/200/50/102.5 wall bears on 900 member; MAT junction remains open.');
  svg+=`<rect x="${sx(11217.5)}" y="${sz(-180)}" width="${900*.052}" height="${450*.19}" fill="#b57663"/>`;
  svg+=`<path d="M${sx(7750)},${sz(-800)} L${sx(12000)},${sz(-850)}" stroke="#227b99" stroke-width="5" fill="none"/>`;
  const bed=x=>v.passage.bedEnds[0][1]+(x-v.passage.bedEnds[0][0])*(v.passage.bedEnds[1][1]-v.passage.bedEnds[0][1])/(v.passage.bedEnds[1][0]-v.passage.bedEnds[0][0]);
  svg+=`<path d="M${sx(v.renewal.bodyX[0])},${sz(bed(v.renewal.bodyX[0])+v.renewal.waterDepth)} L${sx(v.renewal.bodyX[1])},${sz(bed(v.renewal.bodyX[1])+v.renewal.waterDepth)}" stroke="#227b99" stroke-width="2" fill="none"/>`;
  svg+=`<rect x="${sx(6125)}" y="${sz(-80)}" width="${1525*.052}" height="${870*.19}" fill="#cb8e5f" opacity=".3"/>`;
  svg+=`<rect x="${sx(v.renewal.selectedParkX[0])}" y="${sz(-750)}" width="${2300*.052}" height="${250*.19}" fill="#227b99" opacity=".25"/>`;
  svg+=label(740,665,'Beam trial −180..−630; liner bed −800..−850; no hidden level return.');
  svg+=label(740,690,`EAST park ${v.renewal.selectedParkX.join('..')}; beyond proposed outer support. Cover/worker path FAILS.`);
  svg+=label(740,715,`Track-local D${v.groundEnvelope.fullSelectedTrackMinimumD.toFixed(1)} minimum / D${v.groundEnvelope.routeLocalDTrial} trial; site unaccepted.`);
  svg+=label(740,760,'WIP HANDOFF: no adoption. Whole temporary-deck/cover motion must be redesigned.');
  return svg+'</svg>\n';
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const v=deriveWaterReplan();
  const outputs = new Map([
    ['water-replan.json', JSON.stringify(v,null,2)+'\n'],
    ['water-replan.svg', render(v)]
  ]);
  for (const [name, content] of outputs) {
    const url = new URL(name, import.meta.url);
    if (process.argv.includes('--check'))
      assert.equal(readFileSync(url,'utf8'), content, name + ' is stale; regenerate the owning HAD source');
    else writeFileSync(url,content);
  }
  console.log(process.argv.includes('--check') ? 'HAD generated JSON and SVG reproduce exactly (read-only).' :
    'Wrote joined unadopted HAD hypothesis and plan/section; unresolved states retained.');
}
