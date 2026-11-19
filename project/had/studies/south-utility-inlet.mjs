import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {deriveCurrentHouse} from './current-house.mjs';
import {finiteBends, exactSegmentBoxDistance} from './incoming-water-geometry.mjs';
import {pathSeparation} from './service-interface-geometry.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const sources = {};
const read = path => {
  const bytes = readFileSync(resolve(root, path));
  sources[path] = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
  return bytes.toString('utf8');
};
const json = path => JSON.parse(read(path));
const local = name => json('project/had/studies/' + name + '.json');
const round = n => Number(n.toFixed(2));

const model = deriveCurrentHouse().model;
read('project/had/studies/current-house.mjs');
read('project/had/studies/incoming-water-geometry.mjs');
read('project/had/studies/service-interface-geometry.mjs');
const lateral = json('project/str/studies/current-house-lateral.json');
const southEast = lateral.RClegs.piers.find(pier => pier.cornerPileGroup[0][0] === 11667.5 && pier.cornerPileGroup[0][1] === 332.5);
const cornerStartX = Math.min(...southEast.polygon.map(p => p[0]));
const cornerEndY = Math.max(...southEast.polygon.map(p => p[1]));
const opening = id => model.openings.GROUND.find(item => item.id === id);
const southWindow = opening('south-window-4');
const eastWindow = opening('east-window-0');
const windowEndX = southWindow.centre + southWindow.width / 2;
const windowStartY = eastWindow.centre - eastWindow.width / 2;
const roof = read('project/rof/studies/roof_water_edges.py');
assert.match(roof, /pstations=\{'north':9025,'south':11150\}/);
assert.match(roof, /fstation=11750/);
assert.match(roof, /lane=\[x-200,/);
const legacy = local('inlet-rewind');
const inlet = local('incoming-water');
const plant = local('inlet-fixed-station');
const bowl = local('utility-dry-bowl-release');
const gatehouse = local('boundary-service-lodge');
const fan = model.architecturalServices.fanAccess.find(f => f.id === 'utility');
const setting = 10;
const pipeRadius = inlet.utility.pipeR;
assert.equal(pipeRadius, 37);
const boreRadius = 55;
const outerFaceY = -90;
const innerFaceY = 429.5;
const sleeveFall = (innerFaceY - outerFaceY) / 50;
const carrierRaise = 18;
const bores = [[10500, outerFaceY, 450], [10645, outerFaceY, 650]];
const throughWall = ([x, y, z]) => [
  [x, y, z + carrierRaise],
  [x, innerFaceY, z + carrierRaise + sleeveFall],
  [x, 545, z + carrierRaise + sleeveFall],
];
const upperCrossing = [11505, 2199.2, 2725];
const utility = [...throughWall(bores[0]), [10500, 545, 2725],
  [10760, 545, 2725], [10760, 1250, 2725], [10760, 1250, 1000]];
const plantMain = [...throughWall(bores[1]), [10645, 545, 2610],
  [11505, 545, 2610], [11505, 820, 2610], [11505, 1180, 2725],
  upperCrossing, [11315, 2323, 2725], [11315, 2940, 2725], [11385, 3050, 2725],
  [11385, 3370, 2725], ...plant.paths.plant.slice(1)];
const u = finiteBends(utility);
const p = finiteBends(plantMain);
const hot = finiteBends(local('utility-wide-capture').hot.backbone);
const olderHot = finiteBends(inlet.utility.vertices.hot);
const gap = (a, b) => pathSeparation(a.path, b.path) - 2 * pipeRadius - a.hausdorffError - b.hausdorffError;
const box = (route, solid) => Math.min(...route.path.slice(1)
  .map((end, i) => exactSegmentBoxDistance(route.path[i], end, solid))) - pipeRadius - route.hausdorffError;
const fanGap = route => pathSeparation(route.path, fan.path) - pipeRadius -
  fan.selectedRoute.maximumCollarOD / 2 - 20 - route.hausdorffError;
const fixtures = model.architecturalServices.utility;
const field = xy => [...xy.slice(0, 2), 0, ...xy.slice(2), 2800];
const fixturesGaps = route => ({
  bowlTransfer: round(Math.min(...bowl.capture.clearSweeps.map(state => box(route, state.box))) - setting),
  washerInstalled: round(box(route, [...fixtures.washer.slice(0, 2), 0, ...fixtures.washer.slice(2), 848]) - setting),
  electrical: round(box(route, field(fixtures.electricalWorkingField)) - setting),
  inverter: round(box(route, field(fixtures.PVworkingField)) - setting),
  fanRaw: round(fanGap(route)),
});
const westernRoofWorkEdge = 11150 - 200;
const housingEast = 10800;
const clearance = {
  wingToWindowBay: cornerStartX - windowEndX,
  utilityBoreToWindow: utility[0][0] - boreRadius - windowEndX - setting,
  plantBoreToRCWing: cornerStartX - plantMain[0][0] - boreRadius - setting,
  plantBoreToSouthernRoofRenewalLane: westernRoofWorkEdge - plantMain[0][0] - boreRadius - setting,
  trialHousingToRoofRenewalLane: westernRoofWorkEdge - housingEast - setting,
  pressureBorePair: round(Math.hypot(plantMain[0][0] - utility[0][0], bores[1][2] - bores[0][2]) - 2 * boreRadius - setting),
  alternateEastBay: [cornerEndY, windowStartY],
  east600CutsStabilityLeg: 600 > 402.5 && 600 < cornerEndY && 600 > southEast.z[0] && 600 < southEast.z[1],
};
assert(clearance.east600CutsStabilityLeg);
assert(Math.min(clearance.utilityBoreToWindow, clearance.plantBoreToRCWing) >= 25);

function gravityCapacity(diameterMM, waterDepthMM, openWidthFraction = 1) {
  const radius = diameterMM / 2000;
  const depth = waterDepthMM / 1000;
  const angle = 2 * Math.acos(1 - depth / radius);
  const area = radius ** 2 * (angle - Math.sin(angle)) / 2 * openWidthFraction;
  const perimeter = radius * angle * openWidthFraction + (1 - openWidthFraction) * 2 * depth;
  return round(60000 * area * (area / perimeter) ** (2 / 3) * Math.sqrt(1 / 50) / 0.015);
}
const raisedBareCarrier = [22, 28].map(carrierOD => {
  const sleeveClearDiameter = 100;
  const dryBelowCarrier = 5;
  const depth = sleeveClearDiameter / 2 + carrierRaise - carrierOD / 2 - dryBelowCarrier;
  return {
    carrierOD, sleeveClearDiameter, carrierRaise, dryBelowCarrier,
    topClearanceMM: sleeveClearDiameter / 2 - carrierRaise - carrierOD / 2,
    maxTrialWaterDepthMM: depth,
    centredHalfWidthLmin: gravityCapacity(sleeveClearDiameter, depth - carrierRaise, 0.5),
    cleanLmin: gravityCapacity(sleeveClearDiameter, depth),
    halfWidthLmin: gravityCapacity(sleeveClearDiameter, depth, 0.5),
  };
});
const hydro = {
  raisedBareCarrier,
  sleeveConstructionMM: {clearDiameter:100, metalWall:2, surroundingFitRadial:3, formedDiameter:110},
  bareThermalComparisonMM:round(Math.hypot(innerFaceY - outerFaceY, sleeveFall) + 2 * 30),
  basis: 'Uniform gravity flow. Each branch independently charged with the 60 L/min inherited comparison, not a proven supply maximum. No entry or backed-up tail credit.',
  circular100WaterDepthBelow74With5Reserve: 8,
  circular100CleanLmin: gravityCapacity(100, 8),
  circular150CleanLminAt30: gravityCapacity(150, 30),
  circular150HalfWidthLminAt30: gravityCapacity(150, 30, 0.5),
  circular150HalfWidthLminAt33: gravityCapacity(150, 33, 0.5),
  circular150BoreBoundaryMinMMAtCurrentCentres: Math.min(utility[0][0] - 75 - windowEndX - setting, cornerStartX - plantMain[0][0] - 75 - setting),
  supplyComparatorLmin: 60,
  noDischargeRejection: true,
};
assert(hydro.circular100CleanLmin < hydro.supplyComparatorLmin);
assert(hydro.circular150BoreBoundaryMinMMAtCurrentCentres < 25);
assert(raisedBareCarrier.every(row => row.centredHalfWidthLmin < 60 && row.halfWidthLmin > 60 && row.halfWidthLmin < 90));
assert(gap(u,p)-setting >= 25);
const comparatorDemandLmin = 50;
const comparatorResidualBar = 1.5;
const assumedLowDynamicBar = 5;
const resistanceComparisons = [6, 9].map(faultStaticBar => {
  const minimumResistance = faultStaticBar / hydro.supplyComparatorLmin ** 2;
  return {
    faultStaticBar,
    minimumResistanceBarPerSquaredLmin: minimumResistance,
    minimumDynamicBarAtComparatorDemand: round(comparatorResidualBar + comparatorDemandLmin ** 2 * minimumResistance),
    minimumDynamicBarAtComparatorPlus6: round(comparatorResidualBar + (comparatorDemandLmin + 6) ** 2 * minimumResistance),
    atTrialDynamicHead: (assumedLowDynamicBar - comparatorResidualBar) / comparatorDemandLmin ** 2 >= minimumResistance,
  };
});
assert(resistanceComparisons.every(item => !item.atTrialDynamicHead));
const result = {
  disposition: 'South utility entry is the preferred alternative to draw. Retain the current indoor reference pending a joined pressure and structural pass.',
  sources,
  walls: {southWindow:[southWindow.centre - southWindow.width / 2, windowEndX], eastWindow:[windowStartY, eastWindow.centre + eastWindow.width / 2], cornerStartX, cornerEndY, cornerVerticalZ:southEast.z, cornerPiles:southEast.cornerPileGroup, bores, innerFaceY, sleeveFall, clearance},
  exterior: {roofNormalX:11150, roofReliefX:11750, westernRoofWorkEdge, housingTrialX:[10350,housingEast], hotD2Grate:legacy.exterior.grate, plantDock:legacy.exterior.dock, courtEastReceiverY:[6100,7700], lodgeLengthComparison:gatehouse.geometryMm.raceway.length},
  nominalPressure: {
    product: 'Lawton plain copper coil EN 1057, R220, Ø22 × 1.2, 25 m, vendor MOP 53.1 bar to 65 °C for the tube alone',
    source:'https://lawtontubes.co.uk/product/copper-plain-coil/',
    branchArchitecture:'The protected gatehouse splits and labels two separately isolated branches. Leave both plain pipe ends accessible, support any finished sleeve independently, and open covers or withdraw each straight spool axially.',
  },
  continuation:{utility, plant:plantMain, utilityFixtures:fixturesGaps(u), plantFixtures:fixturesGaps(p),
    coldPairAfterSetting:round(gap(u,p)-setting), utilityToHotAfterSetting:round(gap(u,hot)-setting), plantToHotAfterSetting:round(gap(p,hot)-setting),
    olderHotBackboneUtilityAfterSetting:round(gap(u,olderHot)-setting),
    inheritedRawHeatGap:round(inlet.utility.gapsMM.cold.completeHeatPair),
    toleranceMMFrom25AtExistingUtilityCrossing:round(Math.min(fanGap(p),inlet.utility.gapsMM.cold.completeHeatPair,inlet.utility.gapsMM.cold.eastWall)-25),
  },
  hydro,
  fixedResistanceComparison: {
    comparatorDemandLmin,
    comparatorResidualBar,
    assumedLowDynamicBar,
    productScope: 'Megaflo Eco Plus published comparator only; selected plant and house demand are unverified.',
    source: 'https://www.heatraesadia.com/-/media/themes/heatrae/literature/installation-manuals/megaflo-eco-plus-400_500_570_7032406_issue_02.pdf',
    resistanceComparisons,
    status: 'No credit at the compared dynamic head; all line, elevation and connection losses excluded.',
  },
  completed:false,
};
const text = JSON.stringify(result, null, 2) + '\n';
function drawing() {
  const x = value => 86 + (value - 9300) * 0.21;
  const z = value => 500 - value * 0.21;
  const wallBand = (a, b, g, h, colour) => `<rect x="${x(a)}" y="${z(h)}" width="${x(b)-x(a)}" height="${z(g)-z(h)}" fill="${colour}"/>`;
  const dot = ([a,,h], colour) => `<circle cx="${x(a)}" cy="${z(h)}" r="${0.21*boreRadius}" fill="${colour}" stroke="#182325" stroke-width="2"/>`;
  const label = (a, h, words) => `<text x="${a}" y="${h}">${words}</text>`;
  const px = value => 680 + (value - 10000) * 0.15;
  const py = value => 460 - value * 0.07;
  const route = (vertices, colour) => `<polyline points="${vertices.map(([a,b])=>`${px(a)},${py(b)}`).join(' ')}" fill="none" stroke="${colour}" stroke-width="4" stroke-linejoin="round"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="610" viewBox="0 0 1120 610" role="img" aria-labelledby="title desc">
<title id="title">Two supply sleeves south of the utility</title>
<desc id="desc">South elevation and upper-route plan for the bounded alternative. Both existing and proposed water paths are pre-site development.</desc>
<style>text{font:16px sans-serif;fill:#202524}.head{font:700 29px sans-serif}.sub{font:700 20px sans-serif}.small{font:14px sans-serif}</style>
<rect width="1120" height="610" fill="#faf9f5"/>
<text class="head" x="54" y="61">South utility entry</text>
<text x="54" y="92">Two separately isolated branches. A through-wall leak still needs its own pressure and drainage detail.</text>
<text class="sub" x="54" y="144">South elevation · mm</text>
<text class="sub" x="655" y="144">Interior routing · projected plan</text>
${wallBand(southWindow.centre-southWindow.width/2, windowEndX, southWindow.sill, 1400, '#cce3e5')}
${wallBand(windowEndX, cornerStartX, 0, 1400, '#e0d8cb')}
${wallBand(cornerStartX, 11720, 0, 1400, '#b8c3bf')}
<line x1="${x(9400)}" y1="${z(0)}" x2="${x(11720)}" y2="${z(0)}" stroke="#253431" stroke-width="2"/>
${dot(bores[0],'#147f76')}${dot(bores[1],'#b27334')}
${label(114, 217, 'Utility window')}${label(402, 217, 'SE stability wing')}
${label(220, 465, 'X10500 / Z450')}${label(339, 305, 'X10645 / Z650')}
<path d="M401 313 L${x(10645)} ${z(650)-13}" fill="none" stroke="#7c5b45"/>
<path d="M333 451 L${x(10500)} ${z(450)+13}" fill="none" stroke="#286f67"/>
<text class="small" x="147" y="539">X${windowEndX} window edge</text><text class="small" x="352" y="539">X${cornerStartX} concrete wing</text>
<line x1="${px(10000)}" y1="${py(0)}" x2="${px(11900)}" y2="${py(0)}" stroke="#253431" stroke-width="2"/>
<line x1="${px(10000)}" y1="${py(2550)}" x2="${px(11900)}" y2="${py(2550)}" stroke="#b6aaa0" stroke-dasharray="7 6"/>
${route(utility,'#147f76')}${route(plantMain,'#b27334')}
${label(700,425,'Utility')}${label(845,448,'Plant')}
${label(697,263,'Utility partition')}${label(813,183,'Plant high crossing')}
<text class="small" x="656" y="505">Routes separate vertically at the south wall.</text>
<text class="small" x="656" y="529">Orange reuses the existing narrow fan crossing.</text>
<text class="small" x="54" y="579">South normal roof outlet renewal lane begins at X${westernRoofWorkEdge}, beyond the pressure housing.</text>
</svg>
`;
}
for (const [file, content] of [['south-utility-inlet.json', text], ['south-utility-inlet.svg', drawing()]]) {
  const output = new URL('./' + file, import.meta.url);
  if(process.argv.includes('--check')) assert.equal(readFileSync(output, 'utf8'), content);
  else if(process.argv.includes('--write')) writeFileSync(output, content);
  else throw new Error('Use --check or --write for the south utility inlet receipts');
}
console.log('South utility inlet comparison reproduces');
