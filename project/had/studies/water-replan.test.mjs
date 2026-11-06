import test from 'node:test';
import { verifyMaintenanceRain } from './maintenance-rain.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { deriveWaterReplan, verifyServicesOccurrences, verifyCollectorOpenEntries, verifyNorthIntakeJoin, verifyClearWorkingDomains } from './water-replan.mjs';

test('current replan authenticates the entire new Services source without weakening the historical selection', () => {
  const v = deriveWaterReplan();
  assert.equal(v.sources.services.blob, '69c7b1b1e733b9ade2d8ae21c1552accf52a6261');
  assert.equal(v.model.architecturalServices.eastWaterJoin.intermediateArch.finishedClearWidth, 1221);
  assert.deepEqual(v.model.groundFurniture['plant-primary-buffer-round-bounding600'], [10150, 5025, 600, 600]);
  assert.deepEqual(v.model.servicesInterface.emitters.find(e=>e.id==='plant-N').plan, [10980,3797,550,200]);
  assert.equal(v.model.servicesAuxiliaryProjection.sourceBlob, v.sources.services.blob);
  const bytes = readFileSync(new URL('../../mat/studies/whole-house-service-baseline.json', import.meta.url), 'utf8');
  for (const altered of [bytes.replace('"axisY": 3700', '"axisY": 3701'), bytes.replace('Proposed full Services', 'Unreviewed Services')]) {
    assert.notEqual(altered, bytes);
    assert.throws(() => deriveWaterReplan({servicesText: altered}), /Authenticate complete current Services source/);
  }
});

test('food storage is approached and opened with all actual chairs/table and the manual window retained', () => {
  const v=deriveWaterReplan(),p=v.model.pantryReplacement.proof;
  assert(p.pass&&p.approach.minimumReserve>=25);
  assert(p.drawerBodyPath.minimumReserve>=25);
  assert.equal(p.drawerToBodyMinimum,25);
  assert(p.maximumReferenceGripReach<=600);
  assert(p.windowPlanReach<=600&&p.windowApproach.minimumReserve>=25);
  assert.deepEqual(v.model.groundFurniture['low-food-larder'],[9650,11370.5,1000,200]);
  assert.equal(v.model.windowRequirements.find(w=>w.id==='kitchen10200').planReach,p.windowPlanReach);
  assert.equal(v.model.pantryReplacement.rejectedUpperCabinet.reason.includes('overlapped'),true);
});

test('east withdrawal clears the real supports and has a depressed track instead of a solid interfering deck', () => {
  const { bridge: b, renewal: r, groundEnvelope: g } = deriveWaterReplan();
  assert.deepEqual(b.localSupportBeamWidths, [600, 900]);
  assert.equal(b.supportAxesX[1] + b.localSupportBeamWidths[1] / 2, 9750);
  assert(b.supportAxesX[1] + b.localSupportBeamWidths[1] / 2 >= b.newEastWeatherWallX[1]);
  assert.equal(r.selectedParkX[0] - b.outerSupportReservation.fullX[1], 132.5);
  assert(r.hoistWorkingBox[0]>b.outerSupportReservation.fullX[1]);
  assert.equal(r.bodyX[1] - r.bodyX[0], r.length);
  assert.deepEqual(r.selectedParkX, r.bodyX.map(x => x + r.withdrawalTranslation));
  assert(r.withdrawalTrackEndLowestZ < r.operatorDeckZ);
  assert(g.fullSelectedTrackMinimumD > 1500);
  assert(g.routeLocalDTrial > g.fullSelectedTrackMinimumD);
  assert.equal(r.courtStagingPocketSelected, false);
  assert.equal(r.selectedWithdrawal, 'EAST');
});


test('current source authentication does not conceal stale actual scene occurrences', () => {
  const current=JSON.parse(readFileSync(new URL('../../mat/studies/whole-house-service-baseline.json',import.meta.url),'utf8'));
  const v=deriveWaterReplan();
  assert.deepEqual([v.model.servicesOccurrenceProof.emitters,v.model.servicesOccurrenceProof.extractTasks],[16,6]);
  for (const [mutate, expected] of [
    [model=>{model.groundFurniture['service-emitter-plant-N'][0]++;}, /Actual emitter furniture drift: plant-N/],
    [model=>{const e=current.interfaces.architecturalServices.emitters.find(e=>e.level===1);model.upperFurniture['service-emitter-'+e.id][0]++;}, /Actual emitter furniture drift/],
    [model=>{model.servicesInterface.extract[0].platform[0]++;}, /Actual extract occurrence drift: ground-WC/],
    [model=>{model.servicesAuxiliaryProjection.fanMaintenance[0].doorMode+=' changed';}, /Actual fan task\/door-mode drift: ground-WC/],
    [model=>{model.serviceMaintenanceFields[0].platform[0]++;}, /Actual fan maintenance field drift: ground-WC/],
    [model=>{model.servicesInterface.eastFoulExit.path.at(-1)[1]++;}, /Actual foul route\/grade occurrence drift/],
    [model=>{model.servicesInterface.otherServiceDuties.find(e=>e.id==='east-soil').path.at(-1)[2]++;}, /Actual external tail\/service duty occurrence drift/],
    [model=>{model.exteriorPortGeometry.find(e=>e.id==='east-foul-flashing').p[1]++;}, /Actual exterior foul port occurrence drift/]

  ]) {
    // A committed JSON artifact has separate arrays. Preserve the imported object
    // while mutating only the actual scene/view, which is the regression class.
    const model=JSON.parse(JSON.stringify(v.model));mutate(model);
    assert.deepEqual(model.architecturalServices,current.interfaces.architecturalServices);
    assert.throws(()=>verifyServicesOccurrences(model,current),expected);
  }
});

test('joined ground comparator pays actual approach costs and replaces the retired outer opening profile', () => {
  const {model:m,bridge:b}=deriveWaterReplan();
  assert.equal(m.approaches.authoredExteriorGrade,-1800);
  for(const [key,max]of [['front',9000],['garden',8000]]){
    const a=m.approaches[key],old=m.approaches.supersededD1300Comparison[key];
    assert(a.flights.every(x=>x<=max));
    assert.equal(a.landings,a.flights.length+1);
    assert.equal(a.totalStraightReservation-old.totalStraightReservation,key==='front'?11200:12400);
  }
  assert.equal(m.approaches.front.totalStraightReservation,42000);
  assert.equal(m.approaches.garden.totalStraightReservation,40150);
  assert.equal(m.exterior.eavesAboveAuthoredGrade,m.exterior.eaves+1800);
  assert.equal(m.sections.fireHeight.firstAboveAuthoredExterior,5250);
  assert(!m.archOpeningRegister.GROUND.some(o=>o.id==='east-window-2'));
  const arch=m.archOpeningRegister.GROUND.find(o=>o.id==='east-outdoor-water-portal');
  assert.deepEqual([arch.centre-arch.width/2,arch.centre+arch.width/2],[6273,7527]);
  assert.equal(arch.width-2*arch.jambFinishEach,1200);
  assert.equal(arch.head+arch.radialRingTrial,3065);
  assert.equal(m.outerServiceArch.overheadRCUnderside-3065,105);
  assert(b.outerSupportReservation.nodeAxesY[0]+b.outerSupportReservation.nodePlan[1]/2<=6300);
  assert(b.outerSupportReservation.nodeAxesY[1]-b.outerSupportReservation.nodePlan[1]/2>=7500);
});

test('the roof comparison assigns actual inward catchment and prices a full-pitch outward challenger',()=>{
  const {model:m,hydraulicProbe:p}=deriveWaterReplan(),r=m.roofSelectionComparison;
  assert.equal(p.catchment.combinedM2,60.0625);
  assert.equal(p.assignedInwardRoofAndCourtLps,3.60375);
  assert.equal(p.rainfallMmPerHour,216);
  assert(!('assignedFullRoofCourtLps' in p));
  assert(r.outwardAtSameOuterEave.courtRimIncrease>1980);
  assert(r.outwardAtSameOuterEave.peakIncrease>990);
  assert.equal(r.retained.stackNormal,500.7);
});

test('the actual inlet credits separate source-drawn edges and rejects a guard blocking either edge',()=>{
  const v=deriveWaterReplan(),e=v.renewal.courtCollector.actualOpenEntries,s=v.hydraulicProbe.actualEntryIdealScreen;
  assert.equal(v.model.firstWetReference.limitingLocatedJoin.z,-30);
  assert.equal(v.model.firstWetReference.permittedQuietStage,-80);
  assert.equal(v.model.firstWetReference.qualifiedFirstSusceptibleZ,null);
  assert.equal(s.north350AlonePass,false);
  assert.equal(s.combinedNominalPass,true);
  assert(s.totalLps>v.hydraulicProbe.assignedInwardRoofAndCourtLps);
  for(const [mutate,message]of [
    [x=>x.guardExtension.westPostCentres[0][1]=7550,/occludes actual west inlet/],
    [x=>x.guardExtension.northPostCentres[0][0]=7400,/occludes actual north inlet/],
    [x=>x.guardExtension.lowestHorizontalRailAboveLocalWalk=20,/rail\/plinth occludes/]
  ]){const copy=JSON.parse(JSON.stringify(e));mutate(copy);assert.throws(()=>verifyCollectorOpenEntries(copy,30),message);}
});

 test('current N intake and renewal remain physically separate from the complete E well',()=>{
 const v=deriveWaterReplan(),n=v.model.northNormalRoute;
 assert.deepEqual(n.normal.inlet,[4250,7400,2950,350]);assert.deepEqual(n.historicalNormal.inlet,[4250,7000,3500,350]);
 assert.equal(n.geometryProof.westToIndependentEastGap,100);
 const bad=JSON.parse(JSON.stringify(v.model));bad.northNormalRoute.normal.inlet=n.historicalNormal.inlet;
 assert.throws(()=>verifyNorthIntakeJoin(bad,v.renewal),/physical intake intersects E well/);
 const stage=JSON.parse(JSON.stringify(v.model));stage.northNormalRoute.normal.renewal.bodyStage=[6300,7000,350,4250];
 assert.throws(()=>verifyNorthIntakeJoin(stage,v.renewal),/N renewal consumes intact E/);
 const cover=JSON.parse(JSON.stringify(v.model));cover.northNormalRoute.normal.intakeCover.thickness=20;
 assert.throws(()=>verifyNorthIntakeJoin(cover,v.renewal),/cover\/body clearance drifts/);
 const spill=JSON.parse(JSON.stringify(v.model));spill.northNormalRoute.normal.crossIntake.containment.foldCrestAtNorth=-124;
 assert.throws(()=>verifyNorthIntakeJoin(spill,v.renewal),/escapes below court/);
 });

test('clear service workfields use the full finished weatherwalls rather than structural core guesses',()=>{
 const v=deriveWaterReplan();assert.deepEqual(v.renewal.servicePlatformRegions[0],[9722.5,6300,2277.5,1200]);
 for(const bad of [[9722.5,6000,2277.5,1500],[9722.5,6300,2277.5,1519.5]])
 assert.throws(()=>verifyClearWorkingDomains(v.model,[bad]),/complete finished wall/);
});

test('each maintenance state locates rain interception and preserves the intact path',()=>{
 const v=deriveWaterReplan(),m=v.model.maintenanceRainReference;
 assert.equal(m.northMaintenance.courtRoof.pipe.route.at(-1)[2],150);
 assert.equal(m.northMaintenance.loggiaRoof.pipe.outlet[2],-600);
 assert.equal(m.northMaintenance.physicalWeatherAccepted,false);
 assert.equal(m.eastMaintenance.physicalWeatherAccepted,false);
 const western=v.model.northNormalRoute.normal.crossIntake.renewal.westernModules;
 assert(western.maximumReach<600&&western.manualExtensionReach<600);
 assert(western.retainedCrossing[0]+western.retainedCrossing[2]<v.renewal.guardOuterPlan[0]);
 for(const[change,message]of[
  [x=>x.eastMaintenance.weatherEnclosure.northPlate[1]=7400,/bund blocks intact N/],
  [x=>x.northMaintenance.courtRoof.pipe.route[0][2]=2240,/pipe penetrates/],
  [x=>x.northMaintenance.loggiaRoof.pipe.axisX=7050,/clashes with roof post/],
  [x=>x.northMaintenance.storage.shortModuleStack=x.northMaintenance.storage.coverStack,/same storage/]
 ]){const bad=JSON.parse(JSON.stringify(m));change(bad);assert.throws(()=>verifyMaintenanceRain(bad,v.model,v.renewal),message);}
});
