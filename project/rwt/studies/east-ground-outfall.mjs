// Millimetres, litres/second, house coordinates. All new works are trial dimensions.
import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const { east, north } = read('selected-receiving-interface.json');
const { renewal } = read('../../had/studies/water-replan.json');
const fork = read('fork-outlet-joint.json');
const side = read('forked-side-outlet.json');
const dockSource = '../../mat/studies/plant-threshold.json';
// Frozen MAT comparison #1430, ab0f9b57. Read the current MAT geometry when present.
const dock = existsSync(new URL(dockSource, import.meta.url))
  ? read(dockSource).dock.plan : [12130, 14230, 3400, 5350];

export function lane(flow, b, bed, endBed, tail, length) {
  const g = 9.81;
  const yc = 1000 * Math.cbrt((flow / b) ** 2 / g);
  const diameter = 4 * b * yc / (b + 2 * yc);
  const bedError = 5;
  const endDepth = tail - endBed - bedError;
  if (endDepth < yc) throw Error('Boundary assumption requires the maximum tailwater above critical depth');
  const tailEnergy = tail + 1000 * (1000 * flow / (b * endDepth)) ** 2 / (2 * g);
  const control = Math.max(tailEnergy, bed + bedError + 1.5 * yc);
  // Subcritical reach: yc bounds velocity from above and hydraulic diameter from below.
  const reachLoss = (1.5 + 0.05 * length / diameter) * yc / 2;
  return { b, yc, endDepth, tailEnergy, control, reachLoss, requiredHead: control + reachLoss };
}

export function eastGround() {
  const [x, y, width, height] = east.receiverBounds;
  const spill = east.blockedOutletSpill;
  const [start, south, length, span] = spill.requiredContinuation;
  const end = start + length, bed = east.bedMaximum, endBed = bed - length / 20;
  const crest = spill.edge[0][2], tail = spill.farEndMaximumWater;
  const high = [south + 25, south + 1125], low = [south + 1175, south + span - 25];
  const flows = fork.grades.map(({ flowLps }) => {
    const scenarios = [1, 0.5].map(fraction =>
      lane(flowLps, (low[1] - low[0]) * fraction, bed, endBed, tail, length));
    const bypass = lane(flowLps, (high[1] - high[0]) / 2, bed, endBed, tail, length);
    // Critical depth + velocity head + one additional velocity head for crest loss.
    const faultWater = crest + 5 + 2 * bypass.yc;
    return { flowLps, low: scenarios, bypass, faultWater,
      ordinaryReserve: east.maximumWater - scenarios[1].requiredHead,
      faultReserve: spill.maximumFaultedReceiverWater - faultWater,
      downstreamSeparation: crest - 5 - bypass.requiredHead };
  });
  const { handling } = renewal.joint;
  const station = east.maintenance.supportRelease.operator;
  const radius = renewal.operatorAccess.radius, southEdge = renewal.northOperatorStrip[1];
  const northEdge = handling.stage[1], centreY = (southEdge + northEdge) / 2;
  const newRackOffset = 75, plateEdge = Math.min(...handling.rackPostY) - handling.rackBasePlate[1] / 2;
  const deckEnd = renewal.servicePlatform[0] + renewal.servicePlatform[2];
  const topLanding = 1200, risers = 12, going = 300, lowerLanding = 1200;
  const stairEnd = deckEnd + topLanding + (risers - 1) * going;
  const [sx, sy, sw, sh] = side.basin;
  const [west, eastEdge, southEdgeDock, northEdgeDock] = dock;
  const overlap = Math.max(0, Math.min(sx + sw, eastEdge) - Math.max(sx, west)) *
    Math.max(0, Math.min(sy + sh, northEdgeDock) - Math.max(sy, southEdgeDock));
  const tipDepths = fork.paths.map(path => {
    const [px, py] = path.at(-1);
    return Math.min(px - west, eastEdge - px, py - southEdgeDock, northEdgeDock - py);
  });
  return { wet: { basin: [x,y,width,height], start, end, bed, endBed, crest, tail, high, low,
    rim: -1175, staticResidual: tail - bed, upstreamLip: east.terminal.farLip, flows,
    northExit: north.blockedOutletSpill.requiredContinuation },
    crew: { station, radius, southEdge, northEdge, centreY, plateEdge, newRackOffset,
      originalPlateReserve: plateEdge - centreY - radius,
      clearReserveEach: (northEdge - southEdge) / 2 - radius,
      newPlateReserve: plateEdge + newRackOffset - centreY - radius,
      stageToHandover: handling.handover[1] - (northEdge + newRackOffset + handling.stage[3]),
      newTransfer: handling.northTranslation + newRackOffset,
      refuge: [15775, centreY], deckEnd, stairEnd, footEnd: stairEnd + lowerLanding,
      upperLandingY: [centreY - 450, 9400], stairY: [8350, 9250], groundZ: renewal.operatorDeckZ - 150 * risers,
      cargoLift: [deckEnd, 9450, 3000, 1500], groundSwap: [deckEnd + 3000, 9450, 3000, 1500] },
    alternative: { dock, basin: side.basin, overlapM2: overlap / 1e6, tipDepths,
      parkedClearX: side.parkedBox[0] - eastEdge },
    qualifiedFirstHarm: null, siteAccepted: false, installedAccepted: false };
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url)
  console.log(JSON.stringify(eastGround(), null, 2));
