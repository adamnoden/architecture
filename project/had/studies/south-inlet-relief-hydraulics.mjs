const g = 9.81;
const round = value => Number(value.toFixed(4));

export const southInletReliefComparison = Object.freeze({
  roughness:.015,
  receiverWeirCoefficient:.50,
  carrierRiseM:.018,
  settingMm:10,
  splashMm:20,
});

function halfSection(diameterM, depthM, bedM) {
  const radius = diameterM / 2;
  const angle = y => 2 * Math.acos(1 - y / radius);
  const fullArea = y => radius ** 2 * (angle(y) - Math.sin(angle(y))) / 2;
  const width = y => Math.sqrt(y * (diameterM - y));
  return {
    area: (fullArea(depthM) - fullArea(bedM)) / 2,
    top: width(depthM),
    perimeter: radius * (angle(depthM) - angle(bedM)) / 2 + depthM - bedM + width(bedM),
  };
}

function minimumDepth(test, lowerM, upperM) {
  if (!test(upperM)) return null;
  for (let step = 0; step < 60; step++) {
    const middle = (lowerM + upperM) / 2;
    if (test(middle)) upperM = middle;
    else lowerM = middle;
  }
  return (lowerM + upperM) / 2;
}

export function criticalHalfRoundFlow(diameterM, depthM, bedM) {
  const { area, top } = halfSection(diameterM, depthM, bedM);
  return Math.sqrt(g * area ** 3 / top);
}

export function solveHalfRoundRelief({flowM3s, diameterM, bedM, slope, roughness}) {
  const normalFlow = depthM => {
    const { area, perimeter } = halfSection(diameterM, depthM, bedM);
    return area * (area / perimeter) ** (2 / 3) * Math.sqrt(slope) / roughness;
  };
  const limit = diameterM * .9999;
  const critical = minimumDepth(depthM => criticalHalfRoundFlow(diameterM, depthM, bedM) >= flowM3s, bedM, limit);
  const normal = minimumDepth(depthM => normalFlow(depthM) >= flowM3s, bedM, limit);
  if (critical === null || normal === null) return null;
  const velocityHead = (flowM3s / halfSection(diameterM, critical, bedM).area) ** 2 / (2 * g);
  return { critical, normal, velocityHead };
}

export function reliefEntranceHeadMm({critical, velocityHead}, loss) {
  return 1000 * (critical + (1 + loss) * velocityHead);
}

function submergedCircle(diameterM, depthM) {
  const depth = Math.min(diameterM, Math.max(0, depthM));
  const radius = diameterM / 2;
  const angle = 2 * Math.acos(1 - depth / radius);
  return { depth, area: radius ** 2 * (angle - Math.sin(angle)) / 2,
    perimeter: radius * angle, width: 2 * Math.sqrt(depth * (diameterM - depth)) };
}

export function reverseSleeveFlow({flowM3s, diameterM, bedM, carrierM, carrierRiseM, lengthM, riseM,
  roughness, entranceLossK, spareAirMM}) {
  const lowerCarrier = diameterM / 2 + carrierRiseM - carrierM / 2;
  const lowerBerm = submergedCircle(diameterM, bedM);
  function section(y) {
    const ring = submergedCircle(diameterM, y);
    const carrier = submergedCircle(carrierM, y - lowerCarrier);
    return {
      area: (ring.area - lowerBerm.area - carrier.area) / 2,
      width: (ring.width - carrier.width) / 2,
      perimeter: (ring.perimeter - lowerBerm.perimeter + lowerBerm.width + carrier.perimeter) / 2 +
        y - bedM - carrier.depth,
    };
  }
  const depth = minimumDepth(y => {
    const { area, width } = section(y);
    return g * area ** 3 / width >= flowM3s ** 2;
  }, bedM, diameterM * .9999);
  if (depth === null) return null;
  const { area, perimeter } = section(depth);
  const velocityHead = (flowM3s / area) ** 2 / (2 * g);
  const friction = lengthM * (flowM3s * roughness / (area * (area / perimeter) ** (2 / 3))) ** 2;
  const minimumHead = depth + velocityHead + riseM;
  const designHead = minimumHead + entranceLossK * velocityHead + friction;
  const limit = diameterM - spareAirMM / 1000;
  return {
    cleanBoreMM: diameterM * 1000, carrierEnvelopeODMM: carrierM * 1000, bedObstructionMM: bedM * 1000,
    exteriorMouthBlocked: true, reverseRiseMM: round(riseM * 1000),
    depthAtInboardLipMM: round(depth * 1000), minHeadBeforeLossMM: round(minimumHead * 1000),
    estimatedWallFrictionMM: round(friction * 1000), entranceLossK,
    chargedHeadMM: round(designHead * 1000), reserveToAirLimitMM: round((limit - designHead) * 1000),
    ventedCrownRetained: designHead <= limit,
  };
}

export function receiverWeirHeadMm({flowM3s, widthM, coefficient}) {
  return 1000 * (flowM3s / ((2 / 3) * coefficient * widthM * Math.sqrt(2 * g))) ** (2 / 3);
}
