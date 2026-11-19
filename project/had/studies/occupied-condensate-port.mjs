import { serviceApertures } from './service-apertures.mjs';
import { headMaintenance } from './service-head-maintenance.mjs';
import { pathSeparation } from './service-interface-geometry.mjs';

const portId = 'ground-WC-condensate';
const fanId = 'ground-WC';

function byId(rows, id) {
  const found = rows.find(row => row.id === id);
  if (!found) throw new Error('Missing occupied service occurrence '+id);
  return found;
}

function groundWC(house) {
  const model = house.model;
  const interfaces = house.selectedServiceInterfaces;
  const fan = byId(model.architecturalServices.fanAccess, fanId);
  return {
    model, fan, drain: fan.ceilingTrapDrainPort, port: byId(model.exteriorPortGeometry, portId),
    extract: byId(model.servicesInterface.extract, fanId), interfaces,
    terminal: byId(interfaces.wallTerminalRenewal, fanId),
  };
}

export function readGroundWCCondensate(house) {
  const { port, drain, terminal } = groundWC(house);
  if (port.wall !== 'outer-south' || port.cassette || port.p[1] !== 0 ||
      drain.path.length !== 5 || drain.formedDiameter !== port.r * 2 ||
      terminal.wall !== port.wall) throw new Error('The selected ground WC condensate no longer has the supported straight wall tail');
  const main = byId(terminal.holes, 'ground-WC-exhaust');
  return {
    id: portId, wall: port.wall, point: port.p, route: drain.path,
    radius: port.r, faceWidth: byId(terminal.holes, portId).faceWidth,
    neighboringMain: {point: main.point, faceWidth: main.faceWidth},
  };
}

export function developGroundWCCondensate(house, structure, corner, levelMm) {
  const reference = readGroundWCCondensate(house);
  const trial = structuredClone(house);
  const { model, fan, drain, port, extract, interfaces, terminal } = groundWC(trial);
  const delta = levelMm - reference.point[2];
  if (delta !== 0) trial.architecturalServiceSelected = false;
  const path = drain.path.map((point, i) => i < drain.path.length - 2
    ? point : [point[0], point[1], point[2] + delta]);
  const point = path.at(-1);
  port.p = point;
  port.localZ = levelMm;
  drain.path = path;
  drain.centre = point;
  extract.condensatePort = drain;
  // The accepted occupied house has already applied SAP-C1's opening edits.
  const aperture = byId(serviceApertures(model, {...structure, openingEdits:[]}, corner, interfaces.weatherFaces).ports, portId);
  port.minimumRingOrCassetteReserve = aperture.minimum;
  port.pass = aperture.minimum >= 25;
  Object.assign(byId(interfaces.ports, portId), { point, minimumMM: aperture.minimum });
  Object.assign(byId(interfaces.weatherFaces, portId), aperture.weather);
  byId(terminal.holes, portId).point = point;
  const cartridge = byId(headMaintenance(terminal, model).cartridges, portId);
  const distance = pathSeparation(fan.path, path) - fan.selectedRoute.maximumCollarOD / 2 - drain.maximumDrainOD / 2;
  fan.selectedRoute.mainToIndependentDrainMM = distance;
  extract.selectedRoute = fan.selectedRoute;
  const fall = path.slice(1).map((end, i) => {
    const start = path[i];
    const length = Math.hypot(end[0]-start[0], end[1]-start[1]);
    return { horizontalMm: length, fallMm: start[2]-end[2] };
  });
  return {
    trial, reference,
    port: { ...reference, point, route: path },
    fit: {
      fall, apertureMm: aperture.minimum, weatherFaceMm: aperture.weather.minimumMM,
      drainToExhaustMm: distance,
      roomToolMm: cartridge.roomRelease.requiredExtensionMM,
      roomToolMaximumMm: cartridge.roomRelease.steelSocketExtensionMaximumMM,
      temporaryBlankToolMm: cartridge.temporaryBlank.controlToolRequiredMM,
      temporaryBlankToolMaximumMm: cartridge.temporaryBlank.controlToolMaximumMM,
      exteriorGuardMm: cartridge.movingBodyToInboardGuardMM,
      outletIndoorToolTarget: cartridge.roomRelease.target,
      drawMm: cartridge.finalOutwardDrawMM,
    },
  };
}
