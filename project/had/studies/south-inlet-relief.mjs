import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = new URL(process.env.SOUTH_RELIEF_REPO
  ? pathToFileURL(process.env.SOUTH_RELIEF_REPO + '/').href : '../../../', import.meta.url);
const sources = {};
function read(path) {
  const bytes = readFileSync(new URL(path, root));
  sources[path] = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
  return JSON.parse(bytes);
}
async function load(path) {
  const bytes = readFileSync(new URL(path, root));
  sources[path] = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
  return import(new URL(path, root));
}
const { segmentDistance, pathSeparation } = await load('project/had/studies/service-interface-geometry.mjs');
const { finiteBends, exactSegmentBoxDistance } = await load('project/had/studies/incoming-water-geometry.mjs');
const south = read('project/had/studies/south-utility-inlet.json');
const utility = read('project/had/studies/current-house-services.json').utility;
const bowl = read('project/had/studies/utility-dry-bowl-release.json');
const foundation = read('project/str/studies/current-house-joined-foundation.json');
const actualHot = read('project/had/studies/utility-wide-capture.json').hot;
const oldCabinet = read('project/had/studies/inlet-protected-daylight.json');
const structural = read('project/str/studies/floor-portal-interface-review.json');
const round = n => Number(n.toFixed(4));
const grade = 1 / 12;
const formed = south.hydro.sleeveConstructionMM.formedDiameter;
const diameter = south.hydro.sleeveConstructionMM.clearDiameter / 1000;
const insideY = south.walls.innerFaceY;
const setting = 10;
const g = 9.81;
const designFlow = 90 / 60000;
const berm = 0.032;
const roughness = 0.015; // Same trial roughness as the south sleeve source.
const spareAirMM = 15;

function halfSection(y, raised) {
  const radius = diameter / 2;
  const angle = depth => 2 * Math.acos(1 - depth / radius);
  const fullArea = depth => radius ** 2 * (angle(depth) - Math.sin(angle(depth))) / 2;
  const width = depth => Math.sqrt(depth * (diameter - depth));
  return {
    area: (fullArea(y) - fullArea(raised)) / 2,
    top: width(y),
    perimeter: radius * (angle(y) - angle(raised)) / 2 + (y - raised) + width(raised),
  };
}

function minimumDepth(test, raised) {
  let lower = raised;
  let upper = diameter * .9999;
  for (let step = 0; step < 60; step++) {
    const guess = (lower + upper) / 2;
    if (test(guess)) upper = guess;
    else lower = guess;
  }
  return (lower + upper) / 2;
}

function criticalFlow(depth, raised) {
  const { area, top } = halfSection(depth, raised);
  return Math.sqrt(g * area ** 3 / top);
}

function normalFlow(depth, raised, slope) {
  const { area, perimeter } = halfSection(depth, raised);
  return area * (area / perimeter) ** (2 / 3) * Math.sqrt(slope) / roughness;
}

function hydraulicState(flow, raised) {
  const critical = minimumDepth(depth => criticalFlow(depth, raised) >= flow, raised);
  const normal = minimumDepth(depth => normalFlow(depth, raised, grade) >= flow, raised);
  const velocityHead = (flow / halfSection(critical, raised).area) ** 2 / (2 * g);
  return { critical, normal, velocityHead };
}

const ratedCase = hydraulicState(designFlow, berm);
const staticAllowance = 180;
const splash = 20;
const allowableBoxHead = staticAllowance - splash - setting;
const requiredHead = (state, loss) => 1000 * (state.critical + (1 + loss) * state.velocityHead);
const retainK = 1.5;
const limitingK = (allowableBoxHead / 1000 - ratedCase.critical) / ratedCase.velocityHead - 1;
const pressureOnly = south.hydro.raisedBareCarrier.map(c => {
  const depth = hydraulicState(designFlow, 0).critical * 1000;
  return {
    carrierOD: c.carrierOD, dryDepthMM: c.maxTrialWaterDepthMM,
    minimumManningSlope: round(.02 * (90 / c.halfWidthLmin) ** 2),
    criticalDepthMM: round(depth), failsDryCarrierAtAnySlope: depth > c.maxTrialWaterDepthMM,
    criticalDepthWith10MMDeposit: round(hydraulicState(designFlow, .01).critical * 1000),
  };
});

function submergedCircle(d, y) {
  const depth = Math.min(d, Math.max(0, y));
  const radius = d / 2;
  const angle = 2 * Math.acos(1 - depth / radius);
  return { depth, area: radius ** 2 * (angle - Math.sin(angle)) / 2,
    perimeter: radius * angle, width: 2 * Math.sqrt(depth * (d - depth)) };
}

function reverseAnnulus(d, raised, carrierD = .028) {
  const lowerCarrier = d / 2 + .018 - carrierD / 2;
  const lowerBerm = submergedCircle(d, raised);
  function section(y) {
    const ring = submergedCircle(d, y);
    const carrier = submergedCircle(carrierD, y - lowerCarrier);
    return { area: (ring.area - lowerBerm.area - carrier.area) / 2, width: (ring.width - carrier.width) / 2,
      perimeter: (ring.perimeter - lowerBerm.perimeter + lowerBerm.width + carrier.perimeter) / 2 +
        y - raised - carrier.depth };
  }
  let low = raised;
  let high = d * .9999;
  for (let step = 0; step < 60; step++) {
    const guess = (low + high) / 2;
    const { area, width } = section(guess);
    if (g * area ** 3 / width < designFlow ** 2) low = guess;
    else high = guess;
  }
  const depth = (low + high) / 2;
  const { area, perimeter } = section(depth);
  const velocityHead = (designFlow / area) ** 2 / (2 * g);
  const length = (insideY - south.walls.bores[0][1]) / 1000;
  const rise = length / 50;
  const friction = length * (designFlow * roughness / (area * (area / perimeter) ** (2/3))) ** 2;
  const minimumHead = depth + velocityHead + rise;
  const designHead = minimumHead + velocityHead + friction;
  const limit = d - spareAirMM / 1000;
  return {
    cleanBoreMM:d*1000, carrierEnvelopeODMM:carrierD*1000, bedObstructionMM:raised*1000,
    exteriorMouthBlocked: true, reverseRiseMM:round(rise*1000),
    depthAtInboardLipMM:round(depth*1000), minHeadBeforeLossMM:round(minimumHead*1000),
    estimatedWallFrictionMM:round(friction*1000), entranceLossK:1,
    chargedHeadMM:round(designHead*1000), reserveToAirLimitMM:round((limit-designHead)*1000),
    ventedCrownRetained:designHead <= limit,
  };
}

const throughWallRupture = {
  existingClearanceOnly: reverseAnnulus(.100, 0),
  existingCreditedBerm: reverseAnnulus(.100, berm),
  wideIntermediateBore: reverseAnnulus(.140, berm),
  preferredWideBore: reverseAnnulus(.150, berm),
  jacketEnvelopeTrials: [.040, .050, .060, .074].map(carrierOD => reverseAnnulus(.150, berm, carrierOD)),
};
assert(!throughWallRupture.existingClearanceOnly.ventedCrownRetained);
assert(throughWallRupture.preferredWideBore.reserveToAirLimitMM > 10);
assert(throughWallRupture.wideIntermediateBore.reserveToAirLimitMM < 1);
assert(throughWallRupture.jacketEnvelopeTrials[1].reserveToAirLimitMM > 10);
assert(!throughWallRupture.jacketEnvelopeTrials.at(-1).ventedCrownRetained);
const upperFormed = 160;

const branches = ['utility', 'plant'].map((id, i) => {
  const previousPressure = south.walls.bores[i];
  const pressureOuter = [[10520, 10617.5][i], ...previousPressure.slice(1)];
  const reliefOuter = [previousPressure[0], previousPressure[1], [190, 290][i]];
  const wallFall = (insideY - reliefOuter[1]) * grade;
  const pressureInner = [pressureOuter[0], insideY, pressureOuter[2] + south.walls.sleeveFall];
  const reliefInner = [reliefOuter[0], insideY, reliefOuter[2] + wallFall];
  const innerInvert = reliefInner[2] - diameter * 500;
  const lipY = -650;
  const lipZ = reliefOuter[2] - diameter * 500 - (reliefOuter[1] - lipY) * grade;
  const flowHead = 1000 * (designFlow / ((2 / 3) * .50 * .09 * Math.sqrt(2 * g))) ** (2 / 3);
  const receiverCrest = [-35, 65][i];
  const receiverWater = receiverCrest + 32 + flowHead;
  return {
    id, pressureOuter, pressureInner, reliefOuter, reliefInner,
    wallFallMM: round(wallFall), innerInvertZ: round(innerInvert),
    dryJointAndVentThresholdZ: round(innerInvert + staticAllowance),
    maximumStaticBoxWaterZ: round(innerInvert + allowableBoxHead),
    ratedWaterZ: round(innerInvert + requiredHead(ratedCase, retainK)),
    box: { x: [[10385, 10555], [10590, 10760]][i], y: [insideY, 665] },
    outlet: { x: [[10370, 10550], [10585, 10765]][i], terminalY: lipY, terminalInvertZ: round(lipZ),
      receiverY: [-1300, lipY], clearWidthMM: 180, adverseBottomOpenWidthMM: 90,
      overflowCrestZ: receiverCrest, raisedCrestSensitivityMM: 32, overflowHeadMM: round(flowHead),
      ratedReceiverWaterZ: round(receiverWater), maximumReceiverWaterZ: round(lipZ - 25),
      freeDropReserveAfterSettingsMM: round(lipZ - 25 - receiverWater - setting),
    },
  };
});
const bores = branches.flatMap(branch => [
  { id: branch.id + '-pressure', outer: branch.pressureOuter, inner: branch.pressureInner, radius: upperFormed/2 },
  { id: branch.id + '-relief', outer: branch.reliefOuter, inner: branch.reliefInner, radius: formed/2 },
]);
const borePairs = bores.flatMap((a,i) => bores.slice(i+1).map(b => ({
  first: a.id, second: b.id,
  clearanceAfterSettingMM: round(segmentDistance(a.outer, a.inner, b.outer, b.inner) - a.radius - b.radius - setting),
})));

const branchRoutes = branches.map(branch => {
  const route = south.continuation[branch.id];
  const shifted = route.map((point, index) => {
    const x = index < 4 ? branch.pressureOuter[0] : point[0];
    const y = branch.id === 'utility' && index >= 2 && index <= 4 ? 625 : point[1];
    return [x, y, point[2]];
  });
  return finiteBends(shifted);
});
const hot = finiteBends(actualHot.backbone);
function pressurePipeSeparation(a,b) {
  return round(pathSeparation(a.path,b.path) - 74 - a.hausdorffError - b.hausdorffError - setting);
}
const pressureContinuation = {
  riserYMm: [625,545],
  coldPairAfterSettingMM: pressurePipeSeparation(...branchRoutes),
  toRevisedHotAfterSettingsMM: branchRoutes.map(route => pressurePipeSeparation(route,hot)),
  toCapturedBowlAfterSettingsMM: branchRoutes.map(route => round(Math.min(...bowl.capture.clearSweeps.map(({box}) =>
    Math.min(...route.path.slice(1).map((end,i)=>exactSegmentBoxDistance(route.path[i],end,box))))) - 37 - route.hausdorffError - setting)),
  occupiedTrayToolsAndMatchedSupportsStillRequired: true,
};
assert(pressureContinuation.coldPairAfterSettingMM >= 25);
const washerFirstRestY = utility.washerFirstRest[1];
const utilityRearSeatY = utility.sink[1] - 40;
const dryTask = {
  washerNormalY: utility.washer[1], washerFirstRestY, completeStance: [10575, 1050], standingBodyRadiusMM: 300,
  dryRestGapAfterSettingMM: washerFirstRestY - 1050 - 300 - setting,
  blockedByInstalledWasher: utility.washer[1] < 1050 + 300 &&
    utility.washer[1] + utility.washer[3] > 1050 - 300,
  nearestReservedSeatY: utilityRearSeatY, boxToSeatAfterSettingMM: utilityRearSeatY - branches[0].box.y[1] - setting,
  bowlSweepX: Math.min(...bowl.capture.clearSweeps.map(state => state.box[0])),
  separateElectricalIsolationRequired: true,
};

const headPressurePa = 900000;
const jetDiameterM = .028;
const jetArea = Math.PI * jetDiameterM ** 2 / 4;
const force = 2 * headPressurePa * jetArea;
const reversalDesign = 2 * force * 1.5;
const stripSpanM = .060;
const stripThicknessM = .008;
const jet = {
  boundingHeadBar: headPressurePa / 1e5, grossPortDiameterMM: jetDiameterM * 1000,
  fullIdealStoppedNormalForceN: round(force), reflectedWithFactor1p5N: round(reversalDesign),
  reflectedStripSpanMM: stripSpanM * 1000, plateThicknessMM: stripThicknessM * 1000,
  stripBendingMPa: round((reversalDesign * stripSpanM / 4) / (jetDiameterM * stripThicknessM ** 2 / 6) / 1e6),
  stripPunchingMPa: round(reversalDesign / (Math.PI * jetDiameterM * stripThicknessM) / 1e6),
  supportPairReactionEachKN: round(reversalDesign / 2 / 1000),
  lowerMarginWithQualified90LminImpactN: round(1000 * designFlow * Math.sqrt(2 * headPressurePa / 1000)),
  scope: 'Factored local impact comparison. No static 9 bar containment of the complete chamber or outlet rating.',
};

const utilityJambs = structural.geometry.occurrences.filter(row => row.face === 'outer-south' && row.opening === 'south-window-4' && row.jambAxisPmm > south.walls.southWindow[1]);
assert(utilityJambs.length > 0);
const jambBand = utilityJambs[0].jambPmm;
for (const occurrence of utilityJambs) assert.deepEqual(occurrence.jambPmm, jambBand);
const provisionalJamb = {
  basis: structural.authority.candidate,
  candidateAdopted: structural.authority.adopted,
  opening: utilityJambs[0].opening,
  alongWallBandX: jambBand,
  intoWallBandQ: structural.geometry.jambQmm,
  bores: bores.map(({ id, outer, radius }) => {
    const interval = [outer[0] - radius, outer[0] + radius];
    const overlap = Math.max(0, Math.min(interval[1], jambBand[1]) - Math.max(interval[0], jambBand[0]));
    return { id, alongWallBoreIntervalX: interval, nominalJambOverlapMM: round(overlap) };
  }),
};
assert(provisionalJamb.bores.every(bore => bore.nominalJambOverlapMM > 0));

const indoorBoxMouthClearanceMM = branches.map(branch => {
  const x = branch.pressureInner[0];
  const radius = throughWallRupture.preferredWideBore.cleanBoreMM / 2;
  return { id: branch.id, clearSideMM: Math.min(x - branch.box.x[0], branch.box.x[1] - x),
    outsideBoxMM: Math.max(0, radius - Math.min(x - branch.box.x[0], branch.box.x[1] - x)) };
});
assert(indoorBoxMouthClearanceMM.every(row => row.outsideBoxMM > 0));

const geometry = {
  provisionalJamb, indoorBoxMouthClearanceMM,
  lowerFormedDiameterMM: formed, upperFormedDiameterMM: upperFormed, borePairs,
  upperToWindowAfterSettingMM: branches[0].pressureOuter[0] - upperFormed/2 - south.walls.southWindow[1] - setting,
  upperToRCWingAfterSettingMM: south.walls.cornerStartX - branches[1].pressureOuter[0] - upperFormed/2 - setting,
  reliefLeftEdgeToWindowAfterSettingMM: branches[0].reliefOuter[0] - formed/2 - south.walls.southWindow[1] - setting,
  reliefRightEdgeToRCWingAfterSettingMM: south.walls.cornerStartX - branches[1].reliefOuter[0] - formed/2 - setting,
  newLowBoreMinimumZ: branches[0].reliefOuter[2] - formed/2,
  roofLaneToReliefReceiverAfterSettingMM: south.exterior.westernRoofWorkEdge - branches[1].outlet.x[1] - setting,
  separateReliefReceiverAfterSettingMM: branches[1].outlet.x[0] - branches[0].outlet.x[1] - setting,
  cornerHeadCentres: foundation.heads.filter(row => ['P04','P05'].includes(row.id)).map(row => ({ id: row.id, xy: row.xy })),
};
const hydraulics = {
  challengeLminPerBranch: designFlow*60000, halfWidthBlocked: true, downstreamBermMM: berm*1000,
  spareAirMM, normalDepthMM: round(ratedCase.normal * 1000), criticalDepthMM: round(ratedCase.critical * 1000),
  headWithK1MM: round(requiredHead(ratedCase,1)), designEntranceCoefficientCeiling: retainK,
  headWithK1p5MM: round(requiredHead(ratedCase,retainK)),
  staticHeadLimitMM: allowableBoxHead, remainingStaticHeadMM: round(allowableBoxHead - requiredHead(ratedCase,retainK)),
  headLimitK: round(limitingK), criticalLimitAt85mmLmin: round(criticalFlow(diameter - spareAirMM/1000,berm)*60000),
  ordinarySleeveAvailableCredit: false, allOutletsBlockedAccepted: false,
  submergedReceiverAccepted: false, unsurveyedCommonSiteFloodAccepted: false,
};
const result = {
  disposition: 'Develop independently drained low relief. Reject the drawn coordinates as a clear masonry opening under the active jamb comparison. Retain the indoor cabinet reference.',
  sources, pressureOnly, throughWallRupture, pressureContinuation, geometry, branches, hydraulics, jet, dryTask,
  retainedCabinetSourceWaterLimitZ: oldCabinet.hydraulic.waterLimitZ,
  adopted: false,
};
assert.equal(formed, 110);
assert(pressureOnly.every(row => row.failsDryCarrierAtAnySlope));
assert(Math.min(...borePairs.map(pair => pair.clearanceAfterSettingMM)) >= 25);
assert(hydraulics.normalDepthMM < hydraulics.criticalDepthMM && hydraulics.criticalDepthMM < 85);
assert(hydraulics.remainingStaticHeadMM >= 10);
assert(branches.every(branch => branch.outlet.freeDropReserveAfterSettingsMM >= 10));
assert(dryTask.blockedByInstalledWasher && dryTask.dryRestGapAfterSettingMM > 25);

function draw() {
  const z = value => 550 - value * .50;
  const x = value => 58 + (value - 10350) * .60;
  const y = value => 950 + value * .27;
  const label = (x, y, value) => `<text x="${x}" y="${y}">${value}</text>`;
  const bore = (point, fill, diameter) => `<ellipse cx="${x(point[0])}" cy="${z(point[2])}" rx="${diameter * .30}" ry="${diameter * .25}" fill="${fill}" stroke="#243334" stroke-width="2"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="590" viewBox="0 0 1160 590" role="img" aria-labelledby="title desc">
<title id="title">Two separate emergency reliefs below the south inlet bores</title>
<desc id="desc">Thirty-five millimetre clear receiver separation in plan. Each gravity route has its own unpressurised receiver.</desc>
<style>text{font:16px sans-serif;fill:#202524}.head{font:700 28px sans-serif}.sub{font:700 19px sans-serif}</style>
<rect width="1160" height="590" fill="#faf9f5"/>
<text class="head" x="44" y="58">South inlet · independent low reliefs</text>
<text x="44" y="90">Wider upper sleeves return wall ruptures to the indoor wet boxes. Each new gravity bore takes its own 90 L/min challenge.</text>
<text class="sub" x="44" y="138">At the outside wall face · X/Z</text>
<text class="sub" x="525" y="138">Section through both outlet axes · Y/Z</text>
<rect x="${x(south.walls.southWindow[1])}" y="177" width="${x(south.walls.cornerStartX)-x(south.walls.southWindow[1])}" height="372" fill="#e5ded1"/>
<rect x="${x(jambBand[0])}" y="177" width="${x(jambBand[1])-x(jambBand[0])}" height="372" fill="#bf7967" opacity=".48"/>
<text x="85" y="168">Provisional jamb</text>
<line x1="${x(south.walls.cornerStartX)}" y1="177" x2="${x(south.walls.cornerStartX)}" y2="550" stroke="#263e3c" stroke-width="3"/>
${branches.map((b,i)=>`${bore(b.pressureOuter,'#436b88',upperFormed)}${bore(b.reliefOuter,'#13867a',formed)}
<path d="M${x(b.pressureOuter[0])+upperFormed*.30} ${z(b.pressureOuter[2])} H306" stroke="#436b88"/>
<path d="M${x(b.reliefOuter[0])+formed*.30} ${z(b.reliefOuter[2])} H306" stroke="#13867a"/>
${label(313,z(b.pressureOuter[2])+5,'Pressure Z'+b.pressureOuter[2])}
${label(313,z(b.reliefOuter[2])+5,'Relief Z'+b.reliefOuter[2])}`).join('\n')}
<rect x="${y(branches[0].reliefOuter[1])}" y="168" width="${y(insideY)-y(branches[0].reliefOuter[1])}" height="379" fill="#e5ded1" opacity=".45"/>
${branches.map((b,i)=>{
 const hue=i?'#b06828':'#13867a';
 const a=[y(insideY),z(b.innerInvertZ)], end=[y(b.outlet.terminalY),z(b.outlet.terminalInvertZ)];
 const dry=z(b.dryJointAndVentThresholdZ), wet=z(b.ratedWaterZ);
 return `<path d="M${a.join(',')} L${end.join(',')}" fill="none" stroke="${hue}" stroke-width="3"/>
<line x1="${end[0]-154}" x2="${end[0]}" y1="${z(b.outlet.ratedReceiverWaterZ)}" y2="${z(b.outlet.ratedReceiverWaterZ)}" stroke="${hue}" stroke-width="2"/>
<path d="M${a[0]} ${dry} H1125 M${a[0]} ${wet} H1125" stroke="${hue}" stroke-dasharray="7 5"/>
${label(541, z(b.outlet.ratedReceiverWaterZ)-11, b.id + ' receiver')}
${label(820, dry-8, b.id + ' dry seal datum')}`;
}).join('\n')}
<text x="44" y="570">Blue Ø160 formed pressure sleeves · green Ø110 formed reliefs · each channel falls 1:12 to its own free lip. All four overlap the shaded jamb.</text>
</svg>\n`;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const [name, output] of [['south-inlet-relief.json', JSON.stringify(result,null,2)+'\n'], ['south-inlet-relief.svg', draw()]]) {
    const path = new URL(name, import.meta.url);
    if (process.argv.includes('--write')) writeFileSync(path, output);
    else if (process.argv.includes('--check')) assert.equal(readFileSync(path,'utf8'), output);
  }
  process.stdout.write('South inlet independent relief comparison reproduces\n');
}
