/** Selected architectural-development reference. Hydraulic/site/structural/material admission remains open. */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { deriveSouthCourtThreshold, renderSouthCourtThreshold, verifyThresholdMaintainedState } from './south-court-threshold.mjs';
import { deriveGardenFailureBypass, renderGardenFailureBypass } from './garden-failure-bypass.mjs';
import { deriveCourtEastWindow } from './court-east-window.mjs';
import { renderNorthIntake } from './north-intake.mjs';
import { deriveNorthProtectiveReturn, renderNorthProtectiveReturn, verifyNorthProtectiveReturn } from './north-protective-return.mjs';
import { deriveMaintenanceRain, renderMaintenanceRain } from './maintenance-rain.mjs';

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
  assert.deepEqual(model.servicesInterface.eastFoulExit,services.eastFoulExit,'Actual foul route/grade occurrence drift');
  assert.deepEqual(model.servicesInterface.otherServiceDuties,services.otherServiceDuties,'Actual external tail/service duty occurrence drift');
  assert.deepEqual(model.exteriorPortGeometry.find(p=>p.id==='east-foul-flashing').p,
    services.eastFoulExit.path.at(-1),'Actual exterior foul port occurrence drift');
  return { emitters:services.emitters.length, extractTasks:services.fanAccess.length, pass:true,
    scope:'Current actual furniture, emitter heights, extract ports/platforms and fan task states; component equality does not establish whole-house acceptance.' };
}
export function deriveClearWorkingDomains(model,bounds){
 const get=id=>model.groundWalls.find(w=>w.id===id);
 const west=get('gallery-east-water-weather').finishedFaces[1],south=get('plant-north').finishedFaces[1],north=get('east-passage-north-weather').finishedFaces[0],outside=model.shell;
 assert(north>south&&outside>west);
 return [[west,south,outside-west,north-south],[outside,bounds[1],bounds[0]+bounds[2]-outside,bounds[3]]];
}
export function verifyClearWorkingDomains(model,regions){
 const overlap=(a,b)=>a[0]<b[0]+b[2]&&a[0]+a[2]>b[0]&&a[1]<b[1]+b[3]&&a[1]+a[3]>b[1];
 for(const w of model.groundWalls){
  if(!w.finishedFaces)continue;
  const f=w.finishedFaces,vertical=w.a[0]===w.b[0],solid=vertical?[f[0],Math.min(w.a[1],w.b[1]),f[1]-f[0],Math.abs(w.b[1]-w.a[1])]:[Math.min(w.a[0],w.b[0]),f[0],Math.abs(w.b[0]-w.a[0]),f[1]-f[0]];
  for(const r of regions)assert(!overlap(r,solid),'Clear working domain intersects complete finished wall: '+w.id);
 }
 return {pass:true,scope:'Clear domains derived from complete finished weather faces; structural deck/bearing reservations are distinct.'};
}
export function verifyNorthIntakeJoin(model,renewal){
  const n=model.northNormalRoute.normal,inlet=n.inlet,well=renewal.courtIntakeWell,guard=renewal.guardOuterPlan;
  const overlap=(a,b)=>a[0]<b[0]+b[2]&&a[0]+a[2]>b[0]&&a[1]<b[1]+b[3]&&a[1]+a[3]>b[1];
  for(const r of n.inletRegions){assert(!overlap(r,well),'Current N physical intake intersects E well');assert(!overlap(r,guard),'Current N intake intersects fixed E guard');}
  assert(n.crossIntake.renewal.westernModules.moduleCentreY+303/2+25<=7695,'Western module hits actual finished pier face');
  assert(inlet[0]+inlet[2]+100<=renewal.courtCollector.plan[0],'Current N collection shares E intake');
  for(const q of [n.renewal.bodyStage,n.renewal.riggingStage,n.renewal.operatorLongEnvelope])
    assert(!overlap(q,guard)&&!overlap(q,renewal.courtCollector.plan),'N renewal consumes intact E territory');
  const release=n.crossIntake.renewal.firstRelease;
  assert(Math.hypot(release.bodyY-release.clampY,release.shoulderCrouchedWorldZ-release.manualTopTool.handZMinimum)<=600,'N top release tool unreachable');
  assert(n.crossIntake.renewal.moduleCentreY-n.crossIntake.renewal.clearBodyWidth/2-(guard[1]+guard[3])>=25,'Current N module renewal hits E guard');
  assert.equal(n.crossIntake.grossDepthBelowCoverMinimum,model.sections.waterLevels.courtNorth-n.intakeCover.thickness-Math.max(n.crossIntake.eastBottomAtNorth,n.crossIntake.westBottomAtNorth),'Current N cover/body clearance drifts');
  assert(n.crossIntake.hydraulicTrialDepth+28<=n.crossIntake.grossDepthBelowCoverMinimum);
  const containment=n.crossIntake.containment;
  assert(containment.foldCrestAtNorth>=model.sections.waterLevels.courtNorth,'Blocked N escapes below court into uncontained void');
  assert(containment.foldCrestAtSouth>=-96,'Blocked N south return opens below actual court');
  assert(containment.coversInsetInsideWetBoundary&&containment.unbackedOpeningsBelowCourt===0,'Current N full-height wet boundary is interrupted');
  return {pass:true,currentInlet:inlet,westToIndependentEastGap:renewal.courtCollector.plan[0]-inlet[0]-inlet[2],
    scope:'Actual physical collection/maintenance nonoverlap only; new40×250 crossbody and inlet require RWT full-duty proof.'};
}
export function verifyCollectorOpenEntries(entry,maximumHead){
 const g=entry.guardExtension;for(const[a,b]of entry.west.creditedIntervals)assert(a>=entry.west.y[0]&&b<=entry.west.y[1]&&b<=7400,'Credited entry leaves direct courtyard territory');assert.equal(entry.north.creditedWidth,0,'Wall-edge north entry cannot receive credited flow');
 const length=entry.west.creditedIntervals.reduce((s,[a,b])=>s+b-a,0);
 assert.equal(length,325,'Actual guard/foot-excluded lip length drifts');
 assert(entry.approach.northEndY<=7400,'West approach enters disabled Nterritory');
 assert.equal(entry.west.planeX,6125,'Westmouth must reach direct courtyard edge');
 assert(g.lowestSolidZ>-35,'Guard post/foot/rail occludes water-level west approach');
 assert.equal(g.floorFeet,0,'Unlocated floor feet consume effective west lip');
 assert(entry.catchCover.gutterBedEnds[0]>entry.catchCover.gutterBedEnds[1],'Intake catch falls onto lowwell/trap');
 return {pass:true,creditedWestLength:length,creditedNorthLength:0,waterLevelGuardReserve:35,scope:'Actual directcourt mouth and325 foot-excluded intervals; full flow/capture/guard/material acceptance unearned.'};
}
export function verifyArchitecturalDevelopment(model,renewal,bridge,passage,current,base){
 for(const key of ['upperWalls','upperFurniture','stair','frontRooms'])assert.deepEqual(model[key],base[key],'Retained whole-house geometry drift: '+key);
 const changed=new Set(['plant-water-reserve','pantry-shelf-comparison','service-emitter-plant-N','plant-primary-buffer-round-bounding600','plant-controls','low-food-larder']);
 for(const[key,value]of Object.entries(base.groundFurniture))if(!changed.has(key))assert.deepEqual(model.groundFurniture[key],value,'Retained furnished occurrence drift: '+key);
 verifyServicesOccurrences(model,current);verifyNorthIntakeJoin(model,renewal);verifyClearWorkingDomains(model,renewal.servicePlatformRegions);
 verifyNorthProtectiveReturn(model.northProtectiveReturn,model);verifyThresholdMaintainedState(model.southCourtThresholdReference,renewal);
 const rain=model.maintenanceRainReference;
 assert.deepEqual(model.northNormalRoute.normal.renewal.coverStage,rain.northMaintenance.storage.coverStack,'Current coverStage drifts from actual rain-control storage');
 assert.deepEqual(model.northNormalRoute.normal.crossIntake.renewal.storage,rain.northMaintenance.storage.shortModuleStack,'Current module storage drifts from rain-control storage');
 assert(rain.northMaintenance.physicalWeatherAccepted===false&&rain.eastMaintenance.physicalWeatherAccepted===false);
 assert(model.gardenFailureBypass.checks.continuousAtOneGrade&&model.gardenFailureBypass.checks.clearOfNReceiver&&model.gardenFailureBypass.checks.clearOfEWork);
 assert(model.courtEastWindow6850.proof.minimumConservativeBodyReserve>=25);
 const entry=renewal.courtCollector.actualOpenEntries,c=entry.catchCover;
 verifyCollectorOpenEntries(entry,model.firstWetReference.headBudget);
 assert(c.moduleWidth<=c.handlingEnvelope.gateClear-50&&c.moduleLength<=c.handlingEnvelope.gateClear-50,'Catch cassette cannot pass real gate');
 assert(c.handlingEnvelope.maximumLiftedTop<rain.eastMaintenance.roof.underside,'Captured cover lift hits rain roof');
 assert(entry.approach.northEndY<=7400,'Emergency approach shares disabled N territory');
 const ramp=model.courtEastWindow6850.cleaning.closedWalkingCoverReference.accessAdapter;
 assert(!ramp.solidFill&&ramp.lipUndersideZ>model.firstWetReference.permittedQuietStage,'Ramp blocks passive direct-court inlet');
 assert.equal(model.firstWetReference.permittedQuietStage+model.firstWetReference.splashBudget+model.firstWetReference.toleranceBudget,model.northProtectiveReturn.crest);
 assert.equal(model.firstWetReference.qualifiedFirstSusceptibleZ,null);
 assert(bridge.supportAxesX[1]+bridge.localSupportBeamWidths[1]/2>=bridge.newEastWeatherWallX[1]);
 assert(renewal.selectedParkX[0]>bridge.outerSupportReservation.fullX[1]+100);
 assert(passage.bedEnds[0][1]>passage.bedEnds[1][1]);
 return {pass:true,scope:'Source-exact architectural disposition, preliminary support/level relationships and complete reserved ordinary/maintenance states. Physical qualification is explicitly excluded.',
 domains:['retainedupper/stair/front/furniture','currentServicesactualoccurrences','normalN/independentEapproach','constructedthreshold/Nprotection','guard/window/foodtasks','wholecassette/liner/rackrenewalreference','bothrainstates','safeoccupiedgardenbypass','preliminarysupport/grade/receivingconditions']};
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
    '69c7b1b1e733b9ade2d8ae21c1552accf52a6261', 'Authenticate complete current Services source');
  const currentServices = JSON.parse(canonicalBytes);
  const services = currentServices.interfaces.architecturalServices;
  const servicesProjection = createHash('sha256').update(JSON.stringify(sorted(services))).digest('hex');
  assert.equal(servicesProjection, 'a8193ca99f7167371a2716a4ea814c29c21d864fde861db5d345774e5b560fc9');
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
    guardOuterPlan: [6075, 6250, 1625, 1150], guardTopAboveLocalCourt: 1100,
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
      commonFaultBoundary: 'Entire current N inlet x4250..7200 disabled; E collector starts x7300, with its own through-ring route and separate east head condition. No immunity to whole-court debris blanket or whole-site flood is claimed.' },
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
  const assemblyPath='project/mat/studies/upper-access-renewal.json',assembly=load(assemblyPath);
  const joint=assembly.preferredJoint;assert(joint&&joint.frameBelowBed===150);
  renewal.rejectedComparisons={lowDeck:renewal.temporaryTrackDeck,
    twoLevel:'Withdrawn: not required by single-path maintenance policy; D2000/lower receiver evidence retained in MAT withdrawn comparison.',
    onePiece:'4700 body/~180kg handling and18.2m site field disproportionate to this house; not universally impossible.'};
  delete renewal.temporaryTrackDeck;
  renewal.assemblySource={path:assemblyPath,blob:blob(assemblyPath),authority:'MAT preferredJoint assembly/control imported exactly once; HAD owns world geometry. Generated results are not an input.'};
  renewal.assemblyContract={preferredJoint:joint};
  renewal.method='SAME-LEVEL TWO-PIECE ACCESSIBLE SIDE-BOLTED FLANGE';
  renewal.pieces=[['inner',joint.handling.innerGrossX],['outer',joint.handling.outerGrossX]].map(([id,x])=>({id,bodyX:x,length:x[1]-x[0],bedEnds:x.map(a=>[a,floorZ(a)]),parkX:[joint.handling.parkStart,joint.handling.parkStart+x[1]-x[0]],translation:joint.handling.parkStart-x[0]}));
  const inner=renewal.pieces[0];
  renewal.bodyX=inner.bodyX;renewal.length=inner.length;renewal.selectedParkX=inner.parkX;
  renewal.withdrawalTranslation=inner.translation;renewal.withdrawalTrackEndX=inner.parkX[1];
  renewal.fixedTrackBelowCarriageBudget=joint.railReference.sectionVertical;
  renewal.outboardTrackClearY=joint.handling.apertureY;
  renewal.withdrawalTrackEndLowestZ=floorZ(inner.parkX[1])-joint.frameBelowBed-joint.railReference.sectionVertical;
  renewal.upperDeck={topZ:joint.deckTop,bottomZ:-180,fixedThroughOuterSupport:true,personBelowDeck:false,
    scope:'Permanent deck/member reference. Moving body stays below it; accessible joint hatch and outboard openings have explicitly guarded states.'};
  renewal.operatorDeckZ=joint.deckTop;renewal.servicePlatform=joint.handling.platform;
  renewal.servicePlatformRole='BOUNDING ENVELOPE ONLY; actual built/clear service platform is the following L-shaped union, excluding retained northeast house.';

  renewal.operatorField=joint.handling.endOperator;renewal.storagePad=joint.handling.stage;
  renewal.handoverPad=joint.handling.handover;renewal.joint=joint;
  renewal.northOperatorStrip=[12250,7450,3950,3350];
  renewal.operatorAccess={route:[[11175,7150,0],[12350,7150,0],[15300,7650,0]],radius:300,
    rule:'Joint operators leave east through the fullheight outer portal on retained closed covers, then use outboard fixed strips. No route through the north wall or low track; open covers only from captured fixed working fields.'};
  renewal.hoistWorkingBox=[joint.handling.parkStart,joint.handling.apertureY[0],0,2700,joint.handling.apertureY[1]-joint.handling.apertureY[0],3000];
  renewal.hoistLiftTranslation=joint.handling.lift;
  renewal.selectedSequence=joint.sequence;
  renewal.methodStatus='PROJECT-DESIGNED SPATIAL REFERENCE: preferred two-piece flange, captured upper tools, staged independent rack and reverse incoming order. Physical seal, torque, rigging and site acceptance remain downstream.';
  passage.outerReceivingWaterMaximumTrial=-1000;
  passage.maintenanceTrackReceivingWaterMaximumTrial=joint.capture.receivingWaterMaximum;
  passage.maintenanceTrackDrainLipTrial=joint.capture.pipeEnd;
  renewal.maintenanceCatchDrain={inlet:[joint.capture.pipeStartX,joint.capture.pipeCentreY,joint.capture.pipeInvertStart],
    outlet:[joint.capture.pipeEnd[0],joint.capture.pipeCentreY,joint.capture.pipeEnd[1]],
    pipeOD:joint.capture.pipeOD,pipeWall:joint.capture.pipeWall,supportBelow:joint.capture.pipeSupportBelow,
    lowestReservedSurface:joint.capture.pipeEnd[1]-joint.capture.pipeWall-joint.capture.pipeSupportBelow,
    scope:'Local flange leak capture, separate falling80OD pipe BETWEEN actual rails, to distinct declared receiver. No full-flow backup route or foul connection; actual losses, drainage, groundwater, materials and site acceptance remain RWT/MAT/DPL.'};
  assert(renewal.maintenanceCatchDrain.inlet[2]>renewal.maintenanceCatchDrain.outlet[2]);
  assert(renewal.maintenanceCatchDrain.outlet[2]>passage.maintenanceTrackReceivingWaterMaximumTrial);
  const eventPath='project/rwt/studies/open-loggia-event.json',event=load(eventPath);
  assert.equal(event.inputs.house.blob,blob(hadPath));
  const inwardArea=event.catchment.combinedM2,probeRainfall=216;
  const inwardDuty=inwardArea*probeRainfall/3600;
  const hydraulicProbe = { assignedInwardRoofAndCourtLps: inwardDuty,
    catchment:{source:{path:eventPath,blob:blob(eventPath)},...event.catchment},
    rainfallMmPerHour:probeRainfall,
    rainfallAuthority:'Existing216mm/h synthetic adverse sensitivity, not a site design rainfall or adopted standard.',
    outerRoofFailure:'Outward roof fields continue shedding outward; their collection failure is not silently assigned to the inner court or claimed safe at actual exterior receivers.',
    withdrawn600BroadCrestComparison:{crest:-110,width:.6,coefficient:1.7,idealHeadMm:1000*(inwardDuty/1000/(1.7*.6))**(2/3),role:'Historical comparator ONLY, not the actual directwest inlet.'},
    status: 'Preliminary ideal sizing sensitivity only. Actual inlet, stage, debris, splash, first harm, pressure and downstream receiving state remain RWT-06 proof.' };
  const model = structuredClone(h);
  model.southCourtThresholdReference=deriveSouthCourtThreshold(model.southCourtWeatherDoor);
  model.southCourtWeatherDoor.jambEach=40;
  model.southCourtWeatherDoor.installationGapEach=10;
  model.southCourtWeatherDoor.thresholdReference='southCourtThresholdReference';
  const northEnvelopePath='project/mat/studies/loggia-envelope-section.json',northEnvelope=load(northEnvelopePath);
  model.northNormalRoute={source:{path:northEnvelopePath,blob:blob(northEnvelopePath)},
    portal:structuredClone(northEnvelope.portal),normal:structuredClone(northEnvelope.protectedWater.normal),
    terminal:structuredClone(northEnvelope.terminals.normal),
    floorJoin:structuredClone(northEnvelope.floorJoin),
    scope:'Historical input preserved below; CURRENT N inlet rejoined around E well. E is the separate route. Actual full-duty/loss/material/structural acceptance remains RWT/MAT/STR.'};
  const nr=model.northNormalRoute.normal;
  model.northNormalRoute.historicalNormal=structuredClone(nr);
  nr.inlet=[4250,7300,2950,450];
  nr.inletRegions=[[4250,7300,1000,395],[5250,7400,1950,350]];
  nr.inletRole='Boundingbox ONLY; actualcollection is two listed Lregions. Western1000pan extends100south and stopsactualfinishedpierface7695. East1950 remains insideclearportal.';
  nr.crossIntake={clearWidth:250,hydraulicTrialDepth:40,grossDepthBelowCoverMinimum:68,
    centreY:7577,centreX:5025,flowSlope:.01,
    westBottomAtNorth:-206,eastBottomAtNorth:-192,trunkBottomAtNorth:-213.75,
    section:'Current V crossfall1:100 to retained250 NtrunkX5025; Yfall1:100 follows trunk−210.25 at7400 to−213.75 at7750.40 is hydraulic trial depth ONLY. Actual complete Uside/end returns reach court plane;14cover is inset INSIDE them. Historical80void/75crossbody is not retained.',
    containment:{materialRole:'Continuous project-authored1.5Cu U wet face, with fullheight side/end folds, matching fullheight100U saddles/20butt/40laps and top-access clamps. Seam/material/residue acceptance remains MAT; no physical watertightness is certified.',
      foldCrestAtNorth:-110,foldCrestAtSouth:-96,westBay:{plan:[4250,7300,1000,395],crestSouth:-92,crestNorth:-107.8,role:'Same fullheightwet boundary follows actual widenedbaycourt levels; no lower unbacked western return.'},
      completeSideHeightsAtNorth:[96,103.75,82],completeSideHeightsAtSouth:[106.5,114.25,92.5],
      coversInsetInsideWetBoundary:true,coverDepth:14,topFlangeEach:25,
      unbackedOpeningsBelowCourt:0,
      blockedPath:'Blocked N fills the same fullheight outdoor wetlined trough. Water returns UP through its open perforated grate and over the court-level folded perimeter onto the exposed court, reaching the independent E edges. The40trial-depth dashed line is not a spill into a protected void.',
      permittedWetSurfaces:'Exterior metal wet faces, grating, adjacent court stone and exterior RC/paver support at/above the folded return are permitted to wet. No below-return aperture into occupied floor/insulation/air-gas/solum void is part of this reference. Concrete/metal moisture and actual joint qualification remain MAT/RWT.',
      protectedBoundary:'HISTORICAL prior reference: N−30 DPC/quiet−80. CURRENT assembly protects it behind model.northProtectiveReturn; actual15crest/quiet−35 is in model.firstWetReference. Fullheight exterior Nreturn remains distinct from certifiedfirstharm, which isNULL.'},
    receivingOpening:{plan:[4900,7452,250,250],bottomZ:-212.02,role:'Open continuous junction into retained longitudinal N liner, no raised lip or pressure joint.'},
    hydraulicScope:'Current40×250 crossbody and2950 inlet require new full-duty/loss/fouling proof. No old3500-width or80-void capacity admission is carried forward.'};
  nr.inletVoid=68;nr.crossCourtBottom=[-192,-213.75,-206];
  nr.crossIntake.renewal={modules:[500,500,500,500,500,450],clearBodyWidth:303,
    sourceJoint:{reference:'Retained MAT top-release100U saddle/20butt/40lap geometry; current full-height folded profile needs matching fabrication/retained-residue and seal qualification.',saddleLength:100,buttGap:20,overlapEach:40},
    moduleGrossLengthMaximum:600,moduleMassBudgetKg:10,lift:600,
    moduleCentreY:7577,bodyRouteY:8100,operatorRadius:300,northOperatorCentres:[[5500,8100],[6000,8100],[6500,8100],[6875,8100]],
    firstRelease:{bodyY:8100,clampY:7728.5,clampZMinimum:-110,shoulderCrouchedWorldZ:640,
      manualTopTool:{extension:300,handZMinimum:190},
      capturedBail:{legHeight:600,barDiameter:12,maximumPlan:[600,303],completeLiftedTopMaximum:1100},
      motion:'Attach the two-leg captured bail before top saddle release. Use300 manual vertical extension from the retained north covers. Bail grip rises from490 to1090 during600lift; operator rises from crouch to ordinary standing without putting body over the inlet. Western two modules use the source-drawn south-edge bail and south operator; remaining modules transfer north before carrying west.',
      qualification:'Project10kg/positivecapture reference; actual bail/clamp/tool force and physical operation remain MAT/IAS.'},
    storage:[4550,4600,1250,1700],
    westernModules:{count:2,moduleCentreY:7477,bodyCentre:[4600,6950],clampY:7325.5,bailGripAtSouthEdge:true,
      maximumReach:Math.hypot(100,375.5,360),manualExtensionReach:Math.hypot(100,375.5,436),
      retainedCrossing:[5300,7400,650,350],
      routeToRetainedCrossing:[[4600,6950],[5650,6950],[5650,8100]],
      sourceJoin:'Two western303 bodies shift100south into the widened westpan; their north7628.5 is66.5 south of actual wrappedpierface7695. Open250trunkX5025 joins western crossbody at7477 to eastern crossbody7577, then fallsnorth to7750; no buried pipe or entrythroughpier finish.',
      sequence:'Western two modules FIRST, one at a time, with central bays5250..6250 and their load-qualified covers intact. Southern operators return north over crossing5300..5950 before any central bay is opened. Then remaining modules transfer north. No crew is stranded behind removed N covers or uses Ewell as exit.'},
    sequence:'Verify E independent/full-duty and keep its collector/hood/guard intact. Isolate N; capture/remove short perforated covers into west storage. Renew WESTERN TWO first with south operator4600/6950 and600 captured lift, then return crew north across retained central covers5300..5950. Renew remaining modules one600-max/303-wide body at a time, captured lift600 then transfer NORTH onto closed loggia covers, operatorY8100. Carry WEST, then south on westcourt side to storage. No full2950 body crosses Eguard; no extraction through the Ewell. Reverse modules/joints/covers and test before reopening N.',
    bounds:'Body lowerY7425.5 leaves25.5 from Eguard north7400. Eastbound7200 leaves50 toEslotguard7250. Actual load/force/saddles/gaskets and temporary waterisolation remain MAT/RWT physical duties.'};
  nr.renewal.bodyStage=[5650,7100,350,4250];nr.renewal.stage=nr.renewal.bodyStage;
  nr.renewal.riggingStage=[5625,7100,400,4250];
  nr.renewal.stageBodyCentres=[[6350,7800],[6350,10750]];
  nr.renewal.operatorLongEnvelope=[6050,7500,600,3550];
  nr.renewal.state='Current long-liner first release/lift retained; staging shifted50west, operators enter northofEwell. Ecollector remains intact and full-duty; old broadstrip independence/staging is historical only.';
  assert(nr.crossIntake.renewal.modules.reduce((a,b)=>a+b,0)===nr.inlet[2]);
  assert(nr.crossIntake.renewal.moduleCentreY-nr.crossIntake.renewal.clearBodyWidth/2-(renewal.guardOuterPlan[1]+renewal.guardOuterPlan[3])>=25);
  nr.currentCollectionBoundary='Entire CURRENT N Lcollection may be disabled: west4250..5250/Y7300..7695; east5250..7200/Y7400..7750. Separate Ecollector starts7300,100 away; no shared below-cover trough. Northfall court reaches this exposed intake strip without crossing Ewell, which ends7400.';
  nr.preliminaryManningScreen={n:.02,slope:.01,clearWidthM:.25,depthM:.04,
    dischargeLps:1000*(.25*.04)/.02*((.25*.04)/(.25+2*.04))**(2/3)*Math.sqrt(.01),
    scope:'Necessary clean uniform-flow sensitivity only, no inlet/turn/debris/tailwater qualification.'};
  assert(nr.preliminaryManningScreen.dischargeLps>=inwardDuty);
  assert(nr.inletRegions.every(r=>r[0]+r[2]<=6125||r[1]>=7400));
  assert(nr.inlet[0]+nr.inlet[2]+100<=renewal.courtCollector.plan[0]);
  assert(nr.inletRegions.every(r=>r[0]+r[2]<=5250||r[1]>=7400));
  model.northNormalRoute.geometryProof=verifyNorthIntakeJoin(model,renewal);
  model.maintenanceRainReference=deriveMaintenanceRain(model,renewal);
  nr.renewal.historicalCoverStage=nr.renewal.coverStage;
  nr.renewal.coverStage=structuredClone(model.maintenanceRainReference.northMaintenance.storage.coverStack);
  nr.crossIntake.renewal.storage=structuredClone(model.maintenanceRainReference.northMaintenance.storage.shortModuleStack);
  nr.renewal.rainState='CURRENT staged maintenanceRainReference controls: courtcatch/Edrain first forshortmodules; thenloggiaroof/separatepipe forlongliner. E remains assembled/full-duty; no inherited broad-relief dependence.';
  const normalAtMouth=northEnvelope.protectedWater.normal.carrierBottom.find(p=>p[0]===7750)[1];
  assert.equal(normalAtMouth,model.southCourtThresholdReference.primaryTray.normalJoin.receivingCarrierBottom);
  model.northProtectiveReturn=deriveNorthProtectiveReturn(model);
  const limitingJoin=model.northProtectiveReturn.crest;
  model.firstWetReference={source:model.northNormalRoute.source,
    limitingLocatedJoin:{id:'constructed Nshoe/portalcollar/weep + southsill geometric crest',z:limitingJoin,
      role:'New continuous protective assembly shields historical−30 DPC; reference crest is actual15fold/weep/collar. Qualified first harm remains unknown.'},
    southDoorGeometricUnbackedEntry:15,qualifiedFirstSusceptibleZ:null,
    permittedQuietStage:limitingJoin-25-25,headBudget:limitingJoin-25-25-(-110),
    splashBudget:25,toleranceBudget:25,
    rule:'Historical−30 DPC remains behind the new shoe/cavitytray/portalcollar. Actual15crests control; quiet−35+25splash+25tolerance. No oldDPC relabelling or certified first harm. Materials/seams/endclosures/anchors remain RWT/MAT/OAS.'};
  const floorAtY=y=>y<=5750?-(y-4250)*30/1500:-30-(y-5750)*80/2000;
  renewal.courtCollector.rejectedWallEdgeEntry={northWidth:350,planeY:7750,reason:'North wall blocks approach; later NE450apron also depended on disabledNsurface/raisedcovers. Both rejected.'};
  const westLip={planeX:6125,y:[6950,7400],creditedIntervals:[[6950,7175],[7275,7375]],
    excluded:{gatePostAndRampBeam:[7175,7275],northCornerFoot:[7375,7400]},
    crestEnds:[floorAtY(6950),floorAtY(7400)]};
  renewal.courtCollector.actualOpenEntries={north:{planeY:7750,x:[7300,7650],crestZ:-110,creditedWidth:0},west:westLip,
    approach:{plan:[6025,6950,100,450],northEndY:7400,
      westExistingCourtEnds:westLip.crestEnds,eastLipEnds:westLip.crestEnds,
      role:'DIRECT actual court approach wholly SOUTH of disabledNterritoryY7400. No flow through Ngrates or across raisedwellcovers is credited. Court−78..−96 controls effective lip; the old−110 NEcrest is not retained.'},
    coverNotch:{plan:[6125,6950,100,450],openingBelow:'Permanent open100-wide well-edge slot inside guard. Reprofile westledge/coveredge toX6225; no solid0/−60 cover or ledge crosses the falling water.',cleaningBodyWestMinimum:7025,reserve:800},
    catchCover:{moduleWidth:305,moduleLength:550,count:5,plainSouthHalves:5,coverTop:0,minimumBottom:-200,individualMassBudgetKg:30,
      gutterPlan:[6125,6950,1250,450],gutterBedEnds:[-150,-180],sideHeight:100,closedReturns:{northY:7400,eastX:7375,exceptHoodOpeningY:[6950,7200]},
      floorCrossfall:{northAtEast:[7400,-175],receivingHeader:[7100,-180],southAtEast:[6950,-177.5],role:'Closednorth/east returns collect north interval7275..7375 and fall SOUTH to actual250widehood notch; no assumed450wide outlet through250hole.'},
      receivingHoodNotch:{planeX:7350,y:[6950,7200],bottom:-200,top:-110,openUpward:true},spoutEndX:7375,
      role:'Formed accessible catch below the freefall slot slopes EAST into the actual hoodside opening. Integrated underside gutters move with five captured305×550 north walking-cover cassettes; five separate305×550 south halves complete the well cover; top-access100U saddle/20butt/40laps separate at covermodule boundaries. Endspout overlaps hood25; OPEN-TOP receiving notch permits vertical gutter release. No fall onto wellfloor/down-and-up trap is credited.',
      renewal:'With Nintact and Eweathercontrols tested, capture and remove cover/gutter cassettes FROM ABOVE, one at a time using positively restrained lifting and top-access clamps. Their305×550 footprint fits650gate with50 eachside, without tilt or an unproved1100 rotation; complete deeper200body/mass is part of matched coverhandler qualification. Keep neighbouring rated covers/guards until capture. All catchcovers leave before hood/stair descent; reinstall/test gutters and hood before Eadmission.',
      handlingEnvelope:{maximumLiftedTop:1700,maximumPlan:[305,550],gateClear:650,stage:[4350,4500,1500,1500]},
      materialScope:'Project metal/mineral framed cover and folded wet gutter territories, not a selected product or handlift credit. No standing below suspended panels; matched lifting/cover strength/joints are STR/MAT/IAS physical duties.'},
    guardExtension:{outerPlan:[6075,6900,150,500],topAboveLocalWalk:1100,westPostCentres:[],northPostCentres:[],postPlan:50,
      lowestHorizontalRailAboveLocalWalk:100,lowestSolidZ:0,topZ:1100,floorFeet:0,floorFeetScope:'Within credited325 intervals ONLY; actual excluded hinge/ramp/northcorner feet are not denied.',
      support:{type:'Retained well guard/gate, open low-level infill',northWallAnchorCentres:[],structuralCoreX:[7552.5,7692.5]},
      lowWaterOpening:'Gate/guard vertical infill terminates at0; no kickplate below0. Actual ramp-side beam/hingepost shadow100 and cornerfoot25 are EXCLUDED from325 effective lip. Actual restraint/anchor/guard qualification remains STR/OAS.'},
    scope:'450gross/325effective DIRECT westmouth. Permanent open edge slot and under-ramp waterway reach actual catchgutter; no oldNE/north capacity or disabledNsurface is credited.'};
  renewal.guardGate.lowestInfillZ=0;renewal.guardGate.noKickplate=true;renewal.guardGate.excludedHingeFootPlan=[6050,7197.5,50,50];
  const entry=renewal.courtCollector.actualOpenEntries,coefficient=1.84;
  model.firstWetReference.activationReferenceZ=Math.min(...entry.west.creditedIntervals.flatMap(q=>q.map(floorAtY)));
  model.firstWetReference.headBudget=model.firstWetReference.permittedQuietStage-model.firstWetReference.activationReferenceZ;
  entry.guardClearanceProof=verifyCollectorOpenEntries(entry,model.firstWetReference.headBudget);
  const quiet=model.firstWetReference.permittedQuietStage;
  const qWest=entry.west.creditedIntervals.reduce((q,[a,b])=>{const ha=(quiet-floorAtY(a))/1000,hb=(quiet-floorAtY(b))/1000;return q+coefficient/(.04*2.5)*(hb**2.5-ha**2.5)*1000;},0);
  hydraulicProbe.actualEntryIdealScreen={sourceFormula:'Existing ideal1.84 weir comparator integrated over actual court40mm/m fall and ONLY325 unobstructed intervals',coefficient,stage:quiet,entryGeometry:entry,northLps:0,westLps:qWest,totalLps:qWest,north350AlonePass:false,combinedNominalPass:qWest>=inwardDuty,
    status:'Necessary IDEAL crest screen, not actual full-duty proof. Under-ramp approach, falling capture, gutter/hood loss, debris and splash require actual RWT event proof.'};
  const incoming=model.southCourtThresholdReference.maintainedState.incoming;
  const incomingZ=y=>y>=12000?model.sections.waterLevels.loggiaNorth:y>=7750?-110-(y-7750)/100:floorAtY(y);
  incoming.worldRoute=incoming.path.map(([x,y])=>[x,y,incomingZ(y)]);
  incoming.headLandingZ=model.sections.waterLevels.loggiaNorth;
  incoming.levelScope='Actual retained court and normal-loggia slopes, closed covers and exterior receiving landing. Captured/braked transport reference; actual cart force/stability and external delivery kit/site approval remain IAS/OAS/DPL.';
  model.southCourtThresholdReference.maintainedState.geometryProof=verifyThresholdMaintainedState(model.southCourtThresholdReference,renewal);
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
  renewal.servicePlatformRegions=deriveClearWorkingDomains(model,renewal.servicePlatform);
  renewal.clearWorkingDomainProof=verifyClearWorkingDomains(model,renewal.servicePlatformRegions);
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
    width: 1254, finishedWidth: 1200, jambFinishEach:27, kind: 'open-service-portal',
    head:2850, spring:2550, radialRingTrial:215, leaves:0,
    rejectedPriorRawWidth:1760,
    scope: 'Project-designed open service arch: raw6273..7527, finished6300..7500, 27 jamb returns; ringtop3065 leaves105 to RC3170. Replaces unallocated1760 raw width. Outer support/node reservations remain; no qualified thrust/capacity or ordinary accessible route acceptance.' });
  const portal = model.openings.GROUND.find(o=>o.id==='east-outdoor-water-portal');
  model.archOpeningRegister.GROUND = model.archOpeningRegister.GROUND.filter(o=>o.id!=='east-window-2');
  model.archOpeningRegister.GROUND.push(structuredClone(portal));
  model.outerServiceArch = { sourceOpening:portal.id, rawY:[portal.centre-portal.width/2,portal.centre+portal.width/2],
    finishedY:[6300,7500], spring:portal.spring, crown:portal.head, ring:portal.radialRingTrial,
    ringTop:portal.head+portal.radialRingTrial, overheadRCUnderside:model.sections.firstFloorRC.bottom,
    fullDepth:429.5, supports:bridge.outerSupportReservation,
    scope:'Full exterior-wall and upper-wall support is reserved through this genuine arch and aligned side piers/nodes; no lintel hidden inside a decorative arch, no structural capacity acceptance.' };
  assert.equal(portal.width-2*portal.jambFinishEach,portal.finishedWidth);
  assert.equal(model.outerServiceArch.overheadRCUnderside-model.outerServiceArch.ringTop,105);
  model.architecturalServices = services;
  model.servicesProjection = { source: { path: canonicalServicesPath, blob: blob(canonicalServicesPath), projectionSha256: servicesProjection },
    keyedFieldsEqual: true, method: 'Exact full canonical object import, no numeric whitelist or local copied service inventory.' };
  model.servicesInterface.eastFoulExit = services.eastFoulExit;
  model.servicesInterface.supply = services.supply;
  model.servicesInterface.cooker = services.cooker;
  model.servicesInterface.utility = services.utility;
  model.servicesInterface.otherServiceDuties = services.otherServiceDuties;
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
  function ringSectorGap(q,R,t,half,r){const a=Math.atan2(Math.sqrt(R*R-half*half),half),th=Math.atan2(q[1],q[0]),rr=Math.hypot(...q);if(th>=a&&th<=Math.PI-a){if(rr<R)return R-rr-r;if(rr>R+t)return rr-R-t-r;return-r}const aa=th<a?a:Math.PI-a,u=[Math.cos(aa),Math.sin(aa)],along=Math.max(R,Math.min(R+t,q[0]*u[0]+q[1]*u[1]));return Math.hypot(q[0]-along*u[0],q[1]-along*u[1])-r}
  const serviceInterface=model.servicesInterface,serviceNumeric=services;
  const portInputs=[];for(const e of serviceInterface.extract){portInputs.push({id:e.id+'-exhaust',level:e.level,p:e.mainPort,r:140,cassette:e.id==='principal-bath'});portInputs.push({id:e.id+'-condensate',level:e.level,p:e.condensatePort.centre,r:20,cassette:e.id==='principal-bath'});}for(const e of serviceNumeric.supply)portInputs.push({id:e.id+'-supply',level:e.level,p:e.point,r:e.formedWallTerritory/2});portInputs.push({id:'cooker-exhaust',level:0,p:serviceNumeric.cooker.extractPoint,r:serviceNumeric.cooker.formedWallTerritory/2},{id:'cooker-makeup',level:0,p:serviceNumeric.cooker.makeupPoint,r:serviceNumeric.cooker.makeupFormedTerritory/2},{id:'east-foul-flashing',level:0,p:serviceNumeric.eastFoulExit.path.at(-1),r:serviceNumeric.eastFoulExit.faceFlashingTerritory/2});
  model.exteriorPortGeometry=portInputs.map(p=>{const level=p.level===0?'GROUND':'FIRST',wall=p.p[0]===0?'outer-west':p.p[0]===12000?'outer-east':p.p[1]===0?'outer-south':'outer-north',along=wall.endsWith('east')||wall.endsWith('west')?p.p[1]:p.p[0],z=p.p[2]-p.level*3450;let min=Infinity,governor;for(const o of model.archOpeningRegister[level].filter(o=>o.wall===wall)){const h=o.width/2,rise=o.head-o.spring,R=(h*h+rise*rise)/(2*rise),q=[along-o.centre,z-(o.head-R)];let gap;if(p.cassette&&o.centre===7400){gap=R-Math.hypot(...q)-p.r-75;}else gap=ringSectorGap(q,R,o.radialRingTrial,h,p.r);if(gap<min){min=gap;governor=o.centre;}}return{...p,wall,localZ:z,minimumRingOrCassetteReserve:min,governingOpening:governor,pass:min>=0,scope:p.cassette?'Actual1000/300rawarch;75maxcompletehead/cassetteintrusion held. Fixed480band2370–2850/openingleaf≤2370; actualOASprofile/weather/fire/structure unqualified.':'Analyticcircle-versusFINITE215radialsegmentalringsector, includingradialendfaces; actualmaterial/support/weather/hosthole capacity unqualified.'}});
  model.servicesOccurrenceProof = verifyServicesOccurrences(model, currentServices);
  // One explicit trial ground basis, with its complete approach/height price.
  const oldApproaches=structuredClone(model.approaches),grade=-1800;
  const approach=(rise,maximumFlight)=>{
    const slopingRun=rise*20,flights=[];let remaining=slopingRun;
    while(remaining>0){const length=Math.min(maximumFlight,remaining);flights.push(length);remaining-=length;}
    const landings=flights.length+1;
    return {rise,slope:20,slopingRun,flights,landingLength:1200,landings,totalStraightReservation:slopingRun+landings*1200};
  };
  model.approaches={authoredExteriorGrade:grade,front:approach(-grade,9000),
    garden:{terrace:model.sections.waterLevels.loggiaNorth,...approach(model.sections.waterLevels.loggiaNorth-grade,8000)},
    clearWidthReservation:1200,
    supersededD1300Comparison:oldApproaches,
    scope:'D1800 is ONE pre-site comparator exterior/solum basis, not a surveyed plot or adopted foundation. Actual derived flights/landings preserve prior flight-length controls; no access-category, turning/guard/door or compliance acceptance.'};
  model.exterior.eavesAboveAuthoredGrade=model.exterior.eaves-grade;
  model.exterior.ridgeAboveAuthoredGrade=model.exterior.ridge-grade;
  model.sections.fireHeight.firstAboveAuthoredExterior=model.sections.firstFFL-grade;
  model.sections.fireHeight.scope='D1800 comparator gives5250 above authored lowest exterior; actual adjacent-ground interpretation and strategy remain required.';
  model.sections.groundSupport.Drequired=Math.max(1250,-renewal.withdrawalTrackEndLowestZ+500,-renewal.maintenanceCatchDrain.lowestReservedSurface+500);
  model.sections.groundSupport.Dtrial=1800;
  model.sections.groundSupport.Dsurplus=1800-model.sections.groundSupport.Drequired;
  model.sections.groundSupport.scope='D1800 is the joined pre-site comparator. Retained grid/member capacities and actual ground/heave/ventilation remain unqualified; actual site and any deeper structural member reopen this reference.';
  model.protectedRoute.measurement='D6 lowest SIDE outsideground, not merely solum; comparator5250onlyif actual exterior−1800. No automatic fire-strategy acceptance.';
  model.qualityCosts.height='One D1800 uniform-grade comparator: eaves/ridge500higher above grade than D1300. Actual folded front/garden bypass travel and footprint below govern; nominal straight ramp budgets are comparisons only. Local solum clearance need not prescribe all real site terrain; DPL must earn any different coherent site.';
  model.gardenFailureBypass=deriveGardenFailureBypass(model,renewal);
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
  const roof=model.roofDevelopment,rad=roof.pitch*Math.PI/180;
  const fullRadialRun=2*roof.ridgeInset,outwardRise=fullRadialRun*Math.tan(rad);
  model.roofSelectionComparison={
    decision:'Retain the inherited25degree ring as this joined architectural candidate; outward roof remains a genuine alternative, not universally falsified.',
    retained:{outerEave:roof.eavesDatum,courtEave:roof.eavesDatum,ridge:model.exterior.ridge,pitch:roof.pitch,stackNormal:roof.totalNormal},
    outwardAtSameOuterEave:{pitch:roof.pitch,radialRun:fullRadialRun,outerEave:roof.eavesDatum,
      courtHighEdge:roof.eavesDatum+outwardRise,peakIncrease:roof.eavesDatum+outwardRise-model.exterior.ridge,
      courtRimIncrease:outwardRise},
    architecturalTrade:'The conventional25degree outward family reduces ordinary court roof runoff, but at the retained outer eave raises the court rim about1.982m and maximum roof about0.991m in a3.5m court. Lowering the outer eave instead changes upper-room/ceiling/support sections and is not an already-proved equivalent. A larger or recomposed house remains possible; no low-pitch slate compromise is silently selected.',
    retainedDuty:hydraulicProbe.catchment,
    failureAndMaintenance:'The entire inward roof plus direct court rain is assigned to E when N is disabled. Outer collection failure still sheds to designed external receivers and requires ROF/RWT proof. High-level access, mineral/metal roof/ceiling assembly, ordinary edge supports and gutter renewal remain their source-bound obligations; low gutters are not inaccessible permanent joints.',
    materialAndPerformance:'The inherited full500.7normal roof stack is retained as a geometric candidate, not admitted constituent, fire, thermal, support or hydraulic performance.'};
  model.courtEastWindow6850=deriveCourtEastWindow(model,renewal);
  model.architecturalDevelopmentProof=verifyArchitecturalDevelopment(model,renewal,bridge,passage,currentServices,h);
  model.wholeHouseFit = { pass:true,scope:'Bounded ARCHITECTURAL DEVELOPMENT selection: affected spatial/reference interfaces and exact retained geometry only. No hydraulic, structural, material, weather, physical or site admission.' };
  model.status='SELECTED joined architectural-development source; technical and real-site admission remains downstream';
  model.water={normal:'Current2950 north intake with fullheight folded returns and accessible250trunk to N/W receiver; wholemouth failure sends courtwater to independentE.',relief:'Direct325effective westwell mouth, actualcourt/ramp approach and removablecatchcovers→hood→two-piece falling E route; separate east receiving bound. No sharedNgrate/NEwall-edge credit.',technicalScope:'RWT06 must prove actual fullQ/stage/debris/splash/backwater/maintenance. MAT/STR qualify constructed barriers and supports; physical firstharm/site admissibility unearned.'};
  model.currentAdoptionBlockers=[];
  model.technicalAdmission={hydraulic:false,structural:false,materials:false,weather:false,physicalRenewal:false,site:false,qualifiedFirstHarm:null};
  model.knownRejectedGeometry = { intermediateDividerAt3300: {
    westPier: [9300,3203,350,194], protectedPlantDoorRawY: [2750,3650],
    remainingRawDoorPiecesY: [[2750,3203],[3397,3650]],
    bodyDiameter: 600, pass: false,
    reason: 'Moved divider west pier splits the actual spine door into453/253 raw pieces; neither admits600 body. Intrados-only checks do not prove whole-house connectivity.' },
    selectedCorrection: 'Retain original3700 wall and upper bearing alignment; narrow only its raw opening to1275, move full radiator5east, and reprove the full700 station/body entry and900x700 cylinder task.' };
  model.selection = { decision:'SELECT joined architectural-development reference',source:'project/had/studies/water-replan.json',result:'project/had/water-replan-result.md' };
  return { status:'SELECTED architectural-development source; HAD-WATER-REPLAN bounded exit, technical admission unearned',
    sources: { had: { path: hadPath, blob: blob(hadPath) }, services: { path: canonicalServicesPath, blob: blob(canonicalServicesPath), projectionSha256: servicesProjection } },
    model, passage, bridge, renewal, hydraulicProbe,
    groundEnvelope: { routeLocalLowestTrial: -1000, heaveStress: 300, constructionLoss: 50,
      ventilationReserve: 150, routeLocalDMinimum: 1500, routeLocalDTrial: 1800,
      fullSelectedTrackLowest: Math.min(renewal.withdrawalTrackEndLowestZ,renewal.maintenanceCatchDrain.lowestReservedSurface),
      fullSelectedTrackMinimumD: -Math.min(renewal.withdrawalTrackEndLowestZ,renewal.maintenanceCatchDrain.lowestReservedSurface) + 500,
      uniformSolumOrRealExteriorGradeAdopted: false,
      note: 'D1300 was not spare depth. Every actual support/liner low point needs its own ground relation; deeper STR alternatives and real groundwater/terrain remain explicit.' },
    serviceStates: { normal: 'North remains the ordinary route; E has its own court inlet, module and east exterior receiving territory.',
      northMaintenance: 'Retain E and its intake during north liner renewal; actual assigned rainfall/roof bypass remains RWT proof.',
      eastMaintenance: 'Before E isolation/withdrawal, verify N assembled, unobstructed and independently able to carry the full assigned event (RWT proof required). Prohibit E work if N is unavailable. Isolate/divert E inflow before release, fence intake/track, retain protected entry. No E-removed plus concurrent-N-failed promise is imposed.',
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
  svg+=label(50,35,'HAD WATER REPLAN · SELECTED ARCHITECTURAL DEVELOPMENT / TECHNICAL ADMISSION OPEN');
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
  for(const r of v.model.northNormalRoute.normal.inletRegions)svg+=rect(r,'#4d94b3');
  svg+=rect([4825,7750,400,5450],'#4d94b3');
  svg+=rect([4800,7750,2400,4250],'#b8dbe5',.35);svg+=rect(v.passage.outdoor,'#a6d8e0');
  for(const field of v.renewal.servicePlatformRegions)svg+=rect(field,'#d9c9a7',.7);
  svg+=rect(v.passage.waterClear,'#227b99',.8);
  svg+=rect(v.renewal.courtCollector.actualOpenEntries.approach.plan,'#227b99',.9);
  svg+=rect(v.renewal.courtCollector.actualOpenEntries.coverNotch.plan,'#227b99',.9);svg+=rect(v.renewal.courtIntakeWell,'#cb8e5f',.65);
  svg+=rect([v.renewal.selectedParkX[0],6450,v.renewal.length,900],'#227b99',.25);
  svg+=rect(v.renewal.operatorField,'#e8c56a',.8);
  for(const [id,r]of Object.entries(v.model.groundFurniture))if(Array.isArray(r)&&r.length===4)svg+=rect(r,'#b2b39d');
  for(const [name,x,y]of [['STUDY',1500,1800],['FRONT / STAIR',6000,2600],['UTILITY',10400,1900],['PLANT',10350,4650],['LIVING',2300,10000],['KITCHEN / DINING',9700,9500],['OPEN COURT',5250,6100],['N LOGGIA',5400,10700]])
    svg+=label(px(x),py(y),name);
  svg+=label(70,708,'GROUND: retained rooms and furnished fields; dark walls show actual opening intervals.');
  svg+=label(70,735,`East proposal work field ends at x${v.renewal.servicePlatform[0]+v.renewal.servicePlatform[2]}; preferred two-piece reference; technical/site acceptance remains open.`);
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
  svg+=label(740,690,`EAST park ${v.renewal.selectedParkX.join('..')}; beyond proposed outer support.`);
  svg+=label(740,715,`Track-local D${v.groundEnvelope.fullSelectedTrackMinimumD.toFixed(1)} minimum / D${v.groundEnvelope.routeLocalDTrial} trial; site unaccepted.`);
  svg+=label(740,740,'Accessible two-piece flange; captured upper tools; independent staged rack.');
  svg+=label(740,780,'SELECTED DEVELOPMENT: coherent source and reference sequences; technical/physical/site acceptance remains open.');
  return svg+'</svg>\n';
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const v=deriveWaterReplan();
  const outputs = new Map([
    ['water-replan.json', JSON.stringify(v,null,2)+'\n'],
    ['north-intake.svg',renderNorthIntake(v.model,v.renewal)],
    ['north-protective-return.svg',renderNorthProtectiveReturn(v.model.northProtectiveReturn)],
    ['maintenance-rain.svg',renderMaintenanceRain(v.model.maintenanceRainReference)],
    ['water-replan.svg', render(v)],
    ['south-court-threshold.svg', renderSouthCourtThreshold(v.model.southCourtThresholdReference)],
    ['garden-failure-bypass.svg',renderGardenFailureBypass(v.model.gardenFailureBypass)]
  ]);
  for (const [name, content] of outputs) {
    const url = new URL(name, import.meta.url);
    if (process.argv.includes('--check'))
      assert.equal(readFileSync(url,'utf8'), content, name + ' is stale; regenerate the owning HAD source');
    else writeFileSync(url,content);
  }
  console.log(process.argv.includes('--check') ? 'HAD generated JSON and SVG reproduce exactly (read-only).' :
    'Wrote selected architectural-development source and reference drawings; technical admission remains open.');
}
