import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.env.SOUTH_INLET_REPO
  ? pathToFileURL(resolve(process.env.SOUTH_INLET_REPO) + '/')
  : new URL('../../../', import.meta.url);
const sources = {};
function source(path) {
  const url = new URL(path, root);
  const bytes = readFileSync(url);
  sources[path] = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
  return { url, bytes };
}
const had = name => JSON.parse(source('project/had/studies/' + name + '.json').bytes);
const { pathSeparation, segmentDistance } = await import(source('project/had/studies/service-interface-geometry.mjs').url);
const { exactSegmentBoxDistance, finiteBends } = await import(source('project/had/studies/incoming-water-geometry.mjs').url);
const sill = had('south-inlet-under-sill');
const relief = had('south-inlet-relief');
const services = had('current-house-services');
const bowl = had('utility-dry-bowl-release');
const hot = finiteBends(had('utility-wide-capture').hot.backbone);
const round = n => Math.round(n * 10000) / 10000;
const setting = 10;
const fabrication = 5;
const fullPipeRadius = 37;
const collarRadius = 44;
const clearanceToMasonry = 25;
const ventRadius = 16;
const clearVentMM = 26;
const wallFace = sill.branches[0].bores[0].inner[1];
const outsideFace = sill.branches[0].bores[0].outer[1];
const frontY = 665;
const baffleBackY = 637;
const baffleThickness = 8;
const drawMM = 620;
const toolReleaseZ = 900;
const restY = services.utility.washerFirstRest[1];

const configs = [
  { riserY: 580, ventX: 10115, ventZ: 635, roofZ: 680, baffleX: [10051,10160], baffleZ: [385,620], supportsX: [10051,10105.5,10160] },
  { riserY: 545, ventX: 10345, ventZ: 688, roofZ: 730, baffleX: [10205,10365], baffleZ: [485,705], supportsX: [10205,10258,10312,10365] },
];
const bores = sill.branches.flatMap(branch => branch.bores);
const planDistance = (point,a,b) => segmentDistance([...a,0],[...b,0],[...point,0],[...point,1]);
const boxFromPlan = ([x,y,w,d], z, height) => [x,y,z,w,d,height];
const pipeToBox = (route,box) => Math.min(...route.path.slice(1).map((end,i) =>
  exactSegmentBoxDistance(route.path[i],end,box))) - fullPipeRadius - route.hausdorffError - setting;
const pipeGap = (a,b) => pathSeparation(a.path,b.path) - 2*fullPipeRadius - a.hausdorffError - b.hausdorffError - setting;
const routes = sill.branches.map((branch,i) => finiteBends(branch.coordinates.map(([x,y,z],j) =>
  [x,i===0 && j>=2 && j<=4 ? configs[i].riserY : y,z])));
const inverter = boxFromPlan(services.utility.PVworkingField,0,2800);
const washer = boxFromPlan(services.utility.washer,0,848);
washer[4] = restY + services.utility.washerFirstRest[3] - washer[1];

const ventChecks = (x,z,radius) => {
  const outer = [x,outsideFace,z];
  const inner = [x,wallFace,z+(wallFace-outsideFace)/50];
  return {outer,inner,formedDiameterMM:radius*2,
    nearestOriginalBoreAfterSettingMM:round(Math.min(...bores.map(bore =>
      segmentDistance(outer,inner,bore.outer,bore.inner)-bore.radius-radius-setting))),
    rawSillAfterSettingMM:round(sill.sillZ-inner[2]-radius-setting),
    rawJambAfterSettingMM:Math.min(x-sill.sillBay[0],sill.sillBay[1]-x)-radius-setting,
    belowExteriorHousingTopMM:sill.receivers.maximumFixedWeatherHousingZ-z-radius,
  };
};

const branches = sill.branches.map((branch,i) => {
  const c = configs[i];
  const upper = branch.bores[0], lower=branch.bores[1];
  const x=upper.inner[0], y=c.riserY;
  const invert=lower.inner[2]-50;
  const stage=invert+relief.hydraulics.headWithK1p5MM;
  const raisedTrough=round(invert+180);
  const caseLeft=branch.chamber[0][0], caseRight=branch.chamber[1][0];
  const mouthPacking=Math.min(x-caseLeft,caseRight-x)-75-2-3;
  const leftFront=branch.chamber[3][0];
  const collarGap=Math.min(...branch.chamber.map((a,j) =>
    planDistance([x,y],a,branch.chamber[(j+1)%branch.chamber.length]))) - collarRadius-fabrication;
  const baffleCaseLeft= i===0 ? leftFront +(branch.chamber[4][0]-leftFront) *
    (frontY-baffleBackY)/(frontY-branch.chamber[4][1]) : caseLeft;
  const vent=ventChecks(c.ventX,c.ventZ,ventRadius);
  const removalOutline = { x:[x-fullPipeRadius,x+fullPipeRadius], y:[outsideFace-50,y],
    highestCutZ:toolReleaseZ, radiusBeforeBulkhead:14 };
  const outerRelease=[x,outsideFace-50,upper.outer[2]+18-1];
  const drawClearAtWall=outerRelease[1]+drawMM-wallFace;
  const highestCutParking=y+drawMM+fullPipeRadius;
  const minimumCapFreeCore=c.ventZ - ventRadius - stage;
  const native=routes[i];

  return {
    id:branch.id,
    case:{ sideLimitsX:[caseLeft,caseRight], plan:branch.chamber, frontY, roofZ:c.roofZ,
      permanentLowerTroughLipZ:raisedTrough, designWetStageZ:round(stage),
      dryReserveAfterSplashAndSettingMM:round(raisedTrough-stage-30),
      lowerReliefCrownVentDrownedMM:round(stage-(invert+100)),
      continuousMouthSideFitAfterLinerAndSettingMM:mouthPacking,
      exteriorReceiver:branch.reliefReceiver,
    },
    access:{ splitCollarODMM:88, splitCollarAfterPlateAndSettingMM:round(collarGap),
      originalFixedFrontRailAfterSettingMM:round(x-fullPipeRadius-leftFront-fabrication),
      openedFrontWithoutTaperOrWithdrawingAttachmentAfterSettingMM:round(Math.min(x-fullPipeRadius-caseLeft,caseRight-x-fullPipeRadius)-fabrication),
      lowestJacketAtWallAboveFixedTroughAfterSettingMM:round(upper.inner[2]+18-fullPipeRadius-raisedTrough-fabrication),
      upperCutZ:toolReleaseZ, outsideRelease:outerRelease, requiredDrawMM:drawMM,
      releasedSpoolOutline:removalOutline,
      translatedEndBeyondInnerFaceMM:round(drawClearAtWall),
      parkedRiserY:y+drawMM, jacketToRestrainedWasherAfterSettingMM:restY-highestCutParking-setting,
      installedPipeToInverterWorkingAfterSettingMM:round(pipeToBox(native,inverter)),
      installedPipeToWasherThroughFirstRestAfterSettingMM:round(pipeToBox(native,washer)),
      installedPipeToBowlAfterSettingMM:round(Math.min(...bowl.capture.clearSweeps.map(({box})=>pipeToBox(native,box)))),
      qualifiedReleaseAndFirstRest:false,
    },
    baffle:{ x:c.baffleX, y:[baffleBackY,baffleBackY+baffleThickness], z:c.baffleZ, supportsX:c.supportsX,
      clearSupportPitchUpperMM:Math.max(...c.supportsX.slice(1).map((support,j)=>support-c.supportsX[j])),
      toNearestTaperSideGrossMM:round(c.baffleX[0]-baffleCaseLeft),
      toRiserAfterPlateAndSettingMM:baffleBackY-y-fullPipeRadius-fabrication,
      lowerEdgeAboveWetStageMM:round(c.baffleZ[0]-stage),
      localPlatePressureAssemblyQualified:false,
    },
    vent:{ ...vent, clearDiameterMM:clearVentMM,
      shellSideGrossMM:Math.min(c.ventX-caseLeft,caseRight-c.ventX)-ventRadius,
      topOfInteriorBoxAfterPlateAndSettingMM:round(c.roofZ-vent.inner[2]-ventRadius-fabrication),
      aboveScreenedWetStageMM:round(minimumCapFreeCore), fixedWeatherHoodAndSplashQualified:false,
    },
  };
});

const purge=services.selectedServiceInterfaces.purge.find(entry=>entry.room==='utility');
const shortCase={
  riserY:560, frontY:625, taper:[[9995,522],[10034,625]],
  jacketThroughFixedFrontAfterSettingMM:10080-fullPipeRadius-10034-fabrication,
  purgeClearanceAfterSettingMM:round(planDistance(purge.body,[9995,522],[10034,625])-purge.bodyRadiusMM-setting),
  straightBetweenWallAndR75TangentMM:560-wallFace-75,
};
const rejected = {
  jointWetCover:'Opening a common wet cover breaches the live branch unless its separate sealed inner cover stays fixed.',
  sharedReplacementBulkhead:'Breaking a common sleeve-to-wall bulkhead opens both pressure-fault paths and disturbs both fitted mouths.',
  completeUtilityTaperDrawIntoOccupiedPurgeMM:9995-purge.body[0]-purge.bodyRadiusMM-setting,
  shortUtilityFront:shortCase,
  oldVent:ventChecks(10340,690,15),
};
const result={
  disposition:'Prefer branch-specific wet closure and carrier withdrawal for development. Retain the indoor reference.',
  sources, branches,
  formedOpenings:bores.length + branches.length,
  ventPairAfterSettingMM:round(segmentDistance(branches[0].vent.outer,branches[0].vent.inner,
    branches[1].vent.outer,branches[1].vent.inner)-2*ventRadius-setting),
  installedColdPairAfterSettingMM:round(pipeGap(...routes)),
  installedUtilityToRevisedHotAfterSettingMM:round(pipeGap(routes[0],hot)),
  receiverLaneSeparationAfterSettingMM:sill.receivers.betweenAfterSettingMM,
  rejected,
  adjoiningConstructionAndInstalledFaultEvidenceQualified:false,
};
assert(branches[0].access.originalFixedFrontRailAfterSettingMM===-20);
assert(branches[1].access.originalFixedFrontRailAfterSettingMM>0);
assert(branches.every(({case:box,access,vent,baffle}) =>
  box.continuousMouthSideFitAfterLinerAndSettingMM>=5 && box.dryReserveAfterSplashAndSettingMM>10 &&
  box.lowerReliefCrownVentDrownedMM>39 && access.splitCollarAfterPlateAndSettingMM>5 &&
  access.openedFrontWithoutTaperOrWithdrawingAttachmentAfterSettingMM>40 &&
  access.translatedEndBeyondInnerFaceMM>50 && access.jacketToRestrainedWasherAfterSettingMM>250 &&
  access.lowestJacketAtWallAboveFixedTroughAfterSettingMM>70 &&
  baffle.clearSupportPitchUpperMM<=60 && baffle.toRiserAfterPlateAndSettingMM>=15 &&
  baffle.lowerEdgeAboveWetStageMM>60 &&
  vent.nearestOriginalBoreAfterSettingMM>=clearanceToMasonry &&
  vent.rawSillAfterSettingMM>=clearanceToMasonry && vent.rawJambAfterSettingMM>=clearanceToMasonry &&
  vent.belowExteriorHousingTopMM>=10 && vent.topOfInteriorBoxAfterPlateAndSettingMM>=10));
assert(rejected.oldVent.rawSillAfterSettingMM<clearanceToMasonry);
assert(rejected.completeUtilityTaperDrawIntoOccupiedPurgeMM===-40);
assert(shortCase.purgeClearanceAfterSettingMM<25.1 && shortCase.jacketThroughFixedFrontAfterSettingMM<=4);

const text=JSON.stringify(result,null,2) + '\n';
const path=new URL('./south-inlet-wet-box.json',import.meta.url);
if (process.argv.includes('--write')) writeFileSync(path,text);
else if (process.argv.includes('--check')) assert.equal(readFileSync(path,'utf8'),text);
else process.stdout.write(text);
