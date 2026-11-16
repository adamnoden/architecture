import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = new URL(process.env.SOUTH_INLET_REPO
  ? pathToFileURL(process.env.SOUTH_INLET_REPO + '/').href : '../../../', import.meta.url);
const sources = {};
function source(path) {
  const url = new URL(path, root);
  const bytes = readFileSync(url);
  sources[path] = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
  return { url, bytes };
}
const read = path => JSON.parse(source(path).bytes);
const had = id => read('project/had/studies/' + id + '.json');
const { segmentDistance, pathSeparation } = await import(source('project/had/studies/service-interface-geometry.mjs').url);
const { finiteBends, exactSegmentBoxDistance } = await import(source('project/had/studies/incoming-water-geometry.mjs').url);
const house = had('current-house-services');
const utility = house.utility;
const purge = house.selectedServiceInterfaces.purge.find(item => item.room === 'utility');
const original = had('south-utility-inlet');
const four = had('south-inlet-relief');
const bowl = had('utility-dry-bowl-release');
const hot = finiteBends(had('utility-wide-capture').hot.backbone);
const structural = read('project/str/studies/floor-portal-interface-review.json');
const openings = read('project/str/studies/house-corner-rewind.json').changes;
const window = openings.find(row => row.level === 'GROUND' && row.side === 'outer-south' && row.id === 'south-window-4');
const front = had('water-replan').model.gardenFailureBypass.frontApproach.footprint;
const jambs = structural.geometry.occurrences.filter(row => row.face === 'outer-south' && row.opening === window.id);
assert(jambs.length);
const sillBay = [Math.min(...jambs.map(row => row.jambPmm[1])), Math.max(...jambs.map(row => row.jambPmm[0]))];
assert.deepEqual(sillBay, original.walls.southWindow);

const setting = 10;
const chamberAllowance = 5;
const pipeRadius = 37;
const yInner = original.walls.innerFaceY;
const axes = [10080,10285];
const elevations = [[450,190],[570,290]];
const riserY = [600,545];
const sillZ = window.sill;
const chamberPolygons = [
  [[9995,yInner],[10165,yInner],[10165,665],[10058,665],[9995,522]],
  [[10200,yInner],[10370,yInner],[10370,665],[10200,665]],
];
const receiverLanes = [[9980,10160],[10200,10380]];
const washerSweep = [utility.washer[0],utility.washer[1],0,utility.washer[2],
  utility.washerFirstRest[1] + utility.washerFirstRest[3] - utility.washer[1],848];
const field = ([x,y,w,d]) => [x,y,0,w,d,2800];
const round = n => Number(n.toFixed(4));
function edgeDistance(point, a, b) {
  return segmentDistance([...a,0], [...b,0], [...point,0], [...point,1]);
}
function polygonDistance(point, polygon) {
  return Math.min(...polygon.map((a,i) => edgeDistance(point,a,polygon[(i+1)%polygon.length])));
}
function pipeBox(route, box) {
  return Math.min(...route.path.slice(1).map((end,i) => exactSegmentBoxDistance(route.path[i],end,box))) -
    pipeRadius - route.hausdorffError - setting;
}
function pipeGap(a,b) {
  return pathSeparation(a.path,b.path)-2*pipeRadius-a.hausdorffError-b.hausdorffError-setting;
}
const branches = four.branches.map((previous,i) => {
  const y = previous.pressureOuter[1];
  const x = axes[i];
  const bores = elevations[i].map((z,j) => ({
    outer:[x,y,z], inner:[x,yInner,z + (yInner-y)/(j===0?50:12)],
    radius:j===0 ? four.geometry.upperFormedDiameterMM / 2 : four.geometry.lowerFormedDiameterMM / 2,
  }));
  const dz = bores[0].outer[2] - previous.pressureOuter[2];
  const coordinates = original.continuation[previous.id].map(([a,b,c], k) =>
    [k<4 ? x : a, k>=2 && k<=4 && i===0 ? riserY[i] : b, k<3 ? c+dz : c]);
  const route = finiteBends(coordinates);
  const chamber = chamberPolygons[i];
  return {
    route, branch: {
      id: previous.id, bores, coordinates, riserY: riserY[i], chamber,
      clearUpperMouthSidePackingMM: Math.min(x-chamber[0][0],chamber[1][0]-x)-75,
      formedReserveToNearestJambAfterSettingMM: Math.min(...bores.map(b =>
        Math.min(x-sillBay[0],sillBay[1]-x)-b.radius-setting)),
      formedReserveBelowRawSillAfterSettingMM: round(sillZ - Math.max(...bores.map(b=>b.inner[2]+b.radius)) - setting),
      pipeToInverterWorkingAfterSettingMM: round(pipeBox(route,field(utility.PVworkingField))),
      pipeToWasherThroughFirstRestAfterSettingMM: round(pipeBox(route,washerSweep)),
      pipeToBowlTransportAfterSettingMM: round(Math.min(...bowl.capture.clearSweeps.map(({box})=>pipeBox(route,box)))),
      revisedHotReserveAfterSettingMM: round(pipeGap(route,hot)),
      reliefReceiver: { ...previous.outlet, x: receiverLanes[i] },
    },
  };
});
const [u,p] = branches.map(row => row.branch);
const allBores = [u,p].flatMap(branch => branch.bores);
const borePairMinimumMM = Math.min(...allBores.flatMap((a,i) => allBores.slice(i+1).map(b =>
  segmentDistance(a.outer,a.inner,b.outer,b.inner)-a.radius-b.radius-setting)));
const routes = branches.map(row => row.route);
const oldBoxPurgeGap = polygonDistance(purge.body,[[9995,yInner],[10165,yInner],[10165,665],[9995,665]]) -
  purge.bodyRadiusMM - setting;
const purgeGap = polygonDistance(purge.body,u.chamber) - purge.bodyRadiusMM - setting;
const preSettingTaper = edgeDistance([axes[0],riserY[0]],u.chamber[3],u.chamber[4])-pipeRadius;
const splitAvailable = original.walls.cornerStartX - Math.max(...jambs.map(row => row.jambPmm[1]));
const receivers = {
  betweenAfterSettingMM: receiverLanes[1][0]-receiverLanes[0][1]-setting,
  toRoofRenewalLaneAfterSettingMM: original.exterior.westernRoofWorkEdge-receiverLanes[1][1]-setting,
  frontRouteEdgeX: front[0]+front[2],
  toFrontRouteAfterSettingMM: receiverLanes[0][0]-front[0]-front[2]-setting,
  maximumFixedWeatherHousingZ: sillZ-25-setting,
  physicalWindowRenewalAdmitted: false,
};
const result = {
  disposition: 'Prefer both branches under the sill for development. Hold selection and retain the indoor inlet reference.',
  sources, sillBay, sillZ, branches: [u,p],
  borePairMinimumAfterSettingMM: round(borePairMinimumMM),
  coldPipePairAfterSettingMM: round(pipeGap(...routes)),
  utilityPurge: { stance: purge.body, rectangularBoxClearanceAfterSettingMM: round(oldBoxPurgeGap),
    taperedBoxClearanceAfterSettingMM: round(purgeGap), taperedBoxToRiserBeforeAllowanceMM: round(preSettingTaper),
    plateAndSettingAllowanceMM: chamberAllowance, taperedBoxToRiserAfterAllowanceMM: round(preSettingTaper-chamberAllowance) },
  rejectSplitByRightJamb: {availableWidthMM:splitAvailable, formedUpperDiameterMM:four.geometry.upperFormedDiameterMM},
  receivers,
  supportedOutdoorAndIndoorClosureQualified: false,
};
assert(borePairMinimumMM >= 25);
assert([u,p].every(row => row.formedReserveToNearestJambAfterSettingMM >= 25 &&
  row.formedReserveBelowRawSillAfterSettingMM >= 25 && row.clearUpperMouthSidePackingMM >= 10));
assert(oldBoxPurgeGap<0 && purgeGap>=25 && preSettingTaper-chamberAllowance>4);
assert(splitAvailable < four.geometry.upperFormedDiameterMM);
assert(receivers.betweenAfterSettingMM >= 25 && receivers.toRoofRenewalLaneAfterSettingMM >= 25);
assert(pipeGap(...routes)>25);
for (const row of [u,p]) {
  assert(Math.min(row.pipeToInverterWorkingAfterSettingMM,row.pipeToWasherThroughFirstRestAfterSettingMM,
    row.pipeToBowlTransportAfterSettingMM,row.revisedHotReserveAfterSettingMM)>=25);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const text = JSON.stringify(result,null,2)+'\n';
  const path = new URL('./south-inlet-under-sill.json',import.meta.url);
  if (process.argv.includes('--write')) writeFileSync(path,text);
  else if (process.argv.includes('--check')) assert.equal(readFileSync(path,'utf8'),text);
  else process.stdout.write(text);
}
